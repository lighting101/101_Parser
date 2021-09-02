import ICBAccountPool from "./Interfaces/ICBAccountPool";
import IAccount from "./Interfaces/IAccount";
import Database from "../../Database";
import LogDB from "../../LogDB";
import ILog from "../../Interfaces/ILog";
import {DEFAULT_PARSE_LIMIT, maxThreads} from "../../../config";
import AccountBuilder from "./AccountBuilder";
import { TaskFormat, JoberFormat } from "../../../common";
import CBAPI from "./CBAPI";
import ICBAPI from "./Interfaces/ICBAPI";

function sleep(ms: number): Promise<void> {
    return new Promise((resolve => setTimeout(() => resolve(), ms)));
}

export default class CBAccountPoolDB implements ICBAccountPool {
    protected db:Database;
    protected accounts: Array<IAccount> = [];
    private log: ILog;
    private threads = 0; // TODO Limit threads!
    private maxThreads: number;
    private CBAPI:ICBAPI;

    constructor(logProvider: ILog = new LogDB('CBAccountPool'),
                CBAPIProvider:ICBAPI = new CBAPI(),
                optionMaxThreads = maxThreads) {

        this.log = logProvider;
        this.CBAPI = CBAPIProvider;
        this.maxThreads = optionMaxThreads;
        this.db = new Database();
    }

    async getResume(task:TaskFormat): Promise<JoberFormat> {
        const account = await this.getAccount();

        let resume:JoberFormat;
        try {
            resume = await this.CBAPI.getResume(task, account);
        } catch (e) {
            if (/Password could not be validated/i.test(e.message)) {
                await this.setDisableAccount(account);
                this.removeAccount(account);

                return await this.getResume(task);
            } else {
                throw e;
            }
        }

        return resume;
    }

    async getResumeList(task:TaskFormat): Promise<{page:number, maxPage:number, resumes:string[]}> {
        const account = await this.getAccount()
        let resumeListingResult;

        try {
            resumeListingResult = await this.CBAPI.getResumeList(task, account);
        } catch (e) {
            if (/Password could not be validated/i.test(e.message)) {
                await this.setDisableAccount(account);
                this.removeAccount(account);

                return await this.getResumeList(task);
            } else {
                throw e;
            }
        }

        return resumeListingResult;
    }

    async getAccount(): Promise<IAccount> {
        if (this.accounts.length === 0) {
            const errorMsg = 'Accounts list is empty'
            await this.log.error(errorMsg);
            throw new Error(errorMsg);
        }

        for (let i = 0, l = this.accounts.length; i < l; i++) {
            const account = this.accounts[i];
            if (account.canProcess()) {

                this.accounts.splice(i, 1);
                this.accounts.push(account);

                return account;
            }
        }

        await sleep(1000);
        return await this.getAccount();
    }

    async loadAccounts():Promise<void> {
        const sql = 'select ' +
            '    `id`, ' +
            '    `login`, ' +
            '    `pass`, ' +
            '    `proxy`, ' +
            '    `session`, ' +
            '    `cac` ' +
            '    @a:=(select count(*) as `cnt` ' +
            '        from `events` as `e` ' +
            '        where ' +
            '            `e`.`type`=\'resume_parsed\' ' +
            '        and ' +
            '            `e`.`account_id`=`acc`.`id` ' +
            '        and ' +
            '            `e`.`ts` > date_sub(now(), interval 1 day) ' +
            '        group by `e`.`account_id`) `parsed`, ' +
            '    @b:=`daylimit` as `daylimit`, ' +
            '    if(@a is null, @b, @b-@a) as `remainder` ' +
            'from `accounts` as `acc` ' +
            'where `status` = 1';

        const accounts = await this.db.query(sql);

        for (const accountData of accounts) {
            const parseLimit = accountData.remainder > DEFAULT_PARSE_LIMIT ? DEFAULT_PARSE_LIMIT : accountData.remainder;
            if (parseLimit === 0) continue;

            const account = new AccountBuilder()
                .setLogin(accountData.login)
                .setPassword(accountData.pass)
                .setParseLimit(parseLimit)
                .setProxy(accountData.proxy)
                .setCustomAccCode(accountData.cac)
                .setSession(accountData.session)
                .setID(accountData.id)
                .build();

            this.accounts.push(account);
        }
    }

    protected async setDisableAccount(account:IAccount):Promise<void> {
        const sql = 'update `accounts` set `status` = 0 where `id` = ?';
        await this.db.query(sql, [ account.getID() ]);
    }

    /*
    TODO: Удаление из очереди аккаунтов с исчерпанным лимитом парсинга
    TODO: Удаление из очереди аккаунтов с превышенным лимитом ошибок #обработка_ошибок_работы_c_API
     */
    protected removeAccount(targetAccount:IAccount):void {
        for (let i = 0, l = this.accounts.length; i < l; i++) {
            const account = this.accounts[i];
            if (account === targetAccount) {
                this.accounts.splice(i, 1);
            }
        }
    }

    protected async saveAccounts():Promise<void> {
        for (const account of this.accounts) {
            const params = [
                {
                    session: await account.getSession(true),
                    cac: account.getCustAccCode(),
                    proxy: await account.getProxy()
                },
                account.getID()
            ];

            await this.db.query('update ' +
                '`accounts` set ? where `id` = ?', params);
        }
    }

    async beforeWork():Promise<void> {
        await this.loadAccounts();
    }

    async afterWork():Promise<void> {
        await this.saveAccounts();
    }
}