import Database from "../../Database";
import {DEFAULT_PARSE_LIMIT} from "../../../config";
import AccountBuilder from "./AccountBuilder";
import Account from "./Account";
import CBAccountPoolBase from "./CBAccountPoolBase";
import EventsDB from "./EventsDB";
import CBAPI from "./CBAPI";
import ILog from "../../Interfaces/ILog";

type DBAccount = {
    id:number,
    login:string,
    pass:string,
    proxy:string|null,
    session:string|null,
    cac:string|null,
    parsed:number,
    daylimit:number,
    remainder:number
};

export default class CBAccountPoolDB extends CBAccountPoolBase{
    private db:Database;

    constructor(logProvider?: ILog, CBAPIProvider?: CBAPI, events?: EventsDB) {
        super(logProvider, CBAPIProvider, events);

        this.db = new Database();
    }

    protected async getAccountsFromStorage():Promise<DBAccount[]> {
        const sql = 'select ' +
            '    `id`, ' +
            '    `login`, ' +
            '    `pass`, ' +
            '    `proxy`, ' +
            '    `session`, ' +
            '    `cac`, ' +
            '    @a:=(select count(*) as `cnt` ' +
            '        from `events` as `e` ' +
            '        where ' +
            '            `e`.`type`=\'resume_parse\' ' +
            '        and ' +
            '            `e`.`account_id`=`acc`.`id` ' +
            '        and ' +
            '            `e`.`ts` > date_sub(now(), interval 1 day) ' +
            '        group by `e`.`account_id`) as `parsed`, ' +
            '    @b:=`daylimit` as `daylimit`, ' +
            '    if(@a is null, @b, @b-@a) as `remainder` ' +
            'from `accounts` as `acc` ' +
            'where `status` = 1';

        return await this.db.query(sql);
    }

    async loadAccounts():Promise<void> {
        const accounts = await this.getAccountsFromStorage();

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

    protected async setDisableAccount(account:Account):Promise<void> {
        const sql = 'update `accounts` set `status` = 0 where `id` = ?';
        await this.db.query(sql, [ account.getID() ]);
    }

    protected async saveAccount(account:Account):Promise<void> {
        const { session, proxy, cac } = account.getAccountOptions();
        const id = account.getID();

        const params = [ {session, proxy, cac}, id ];

        await this.db.query('update ' +
            '`accounts` set ? where `id` = ?', params);
    }
}