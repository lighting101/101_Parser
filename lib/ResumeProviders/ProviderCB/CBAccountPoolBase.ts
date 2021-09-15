import ICBAccountPool from "./Interfaces/ICBAccountPool";
import ILog from "../../Interfaces/ILog";
import { TaskFormat, JoberFormat } from "../../../common";
import CBAPI from "./CBAPI";
import ICBAPI from "./Interfaces/ICBAPI";
import EventsDB from "./EventsDB";
import Account from "./Account";
import LogFactory from "../../Logger/LogFactory";

function sleep(ms: number): Promise<void> {
    return new Promise((resolve => setTimeout(() => resolve(), ms)));
}

export default class CBAccountPoolBase implements ICBAccountPool {
    protected accounts: Array<Account> = [];
    private log: ILog;
    private CBAPI:ICBAPI;
    private events:EventsDB;

    constructor(logProvider: ILog = LogFactory('CBAccountPool'),
                CBAPIProvider:ICBAPI = new CBAPI(),
                events = new EventsDB()) {

        this.log = logProvider;
        this.CBAPI = CBAPIProvider;
        this.events = events;
    }

    protected async passwordInvalid(account:Account):Promise<void> {
        await this.setDisableAccount(account);
        this.removeAccount(account);
    }

    protected async removeInactiveAccount(account:Account):Promise<void> {
        await this.saveAccount(account);
        this.removeAccount(account);
    }

    /**
     * If error indicates that the account is not working - returns true, else false
     * @param e
     * @protected
     */
    protected isErrAccInvalid(e:Error):boolean {
        const errors = [
            /Password could not be validated/i,
            /Not associated with an account that has RDB access/i,
            /Your account has been placed on Account hold/i,
            /This resume is not applicable for the RDB product on your account/i,
        ];

        for (const errMsg of errors) {
            if (errMsg.test(e.message)) return true;
        }

        return false;
    }

    protected async errorHandler(e:Error, account:Account, recursion?:() => Promise<any>):Promise<any> {
        if (this.isErrAccInvalid(e)) {
            await this.passwordInvalid(account);

            if (typeof recursion !== 'undefined') {
                return await recursion();
            }
        } else {
            if (account.accountInactive()) {
                await this.removeInactiveAccount(account);
            }
            throw e;
        }
    }

    async getResume(task:TaskFormat): Promise<JoberFormat> {
        const account = await this.getAccount();

        let resume;
        try {
            resume = await this.CBAPI.getResume(task, account);
        } catch (e) {
            resume = <JoberFormat> await this.errorHandler(e, account, async () => await this.getResume(task));
        }

        if (account.accountInactive()) {
            await this.removeInactiveAccount(account);
        }

        await this.events.parseResume(account);

        return resume;
    }

    async getResumeList(task:TaskFormat): Promise<{page:number, maxPage:number, resumes:string[]}> {
        const account = await this.getAccount()
        let resumeListingResult;

        try {
            resumeListingResult = await this.CBAPI.getResumeList(task, account);
        } catch (e) {
            resumeListingResult = <{page:number, maxPage:number, resumes:string[]}> await this.errorHandler(e, account, async () => await this.getResumeList(task));
        }

        if (account.accountInactive()) {
            await this.removeInactiveAccount(account);
        }

        return resumeListingResult;
    }

    protected moveAccToEnd(i:number):void {
        const account = this.accounts[i];

        this.accounts.splice(i, 1);
        this.accounts.push(account);
    }

    async getAccount(): Promise<Account> {
        if (this.accounts.length === 0) {
            const errorMsg = 'Accounts list is empty'
            await this.log.error(errorMsg);
            throw new Error(errorMsg);
        }

        for (let i = 0, l = this.accounts.length; i < l; i++) {
            const account = this.accounts[i];
            if (account.canProcess()) {
                this.moveAccToEnd(i);
                return account;
            }
        }

        await sleep(1000);
        return await this.getAccount();
    }

    async loadAccounts():Promise<void> {
        throw new Error('Method loadAccounts() not implemented');
    }

    protected async setDisableAccount(account:Account):Promise<void> {
        throw new Error('Method setDisableAccount() not implemented');
    }

    protected async saveAccount(account:Account):Promise<void> {
        throw new Error('Method saveAccount() not implemented');
    }

    protected removeAccount(targetAccount:Account):void {
        for (let i = 0, l = this.accounts.length; i < l; i++) {
            const account = this.accounts[i];
            if (account === targetAccount) {
                this.accounts.splice(i, 1);
            }
        }
    }

    protected async saveAccounts():Promise<void> {
        for (const account of this.accounts) {
            await this.saveAccount(account);
        }
    }

    async beforeWork():Promise<void> {
        await this.loadAccounts();
    }

    async afterWork():Promise<void> {
        await this.saveAccounts();
    }
}