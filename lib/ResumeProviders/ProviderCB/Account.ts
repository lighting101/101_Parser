import IAccount from "./Interfaces/IAccount";
import ICBAPI from "./Interfaces/ICBAPI";
import IProxyPool from "../../Interfaces/IProxyPool";
import ILog from "../../Interfaces/ILog";
import {MAX_ERRORS_ACCOUNT} from "../../../config";
import AccountBuilder from "./AccountBuilder";

export default class Account implements IAccount
{
    private login:string;
    private password:string;
    private session:string|undefined = undefined;
    private proxy:string|undefined = undefined;
    private parseLimit:number;
    private errorsCount = 0;
    private CBAPI:ICBAPI;
    private ProxyProvider:IProxyPool;
    private log:ILog;
    private processing = false;
    private id:number|undefined;
    private CAC:string;

    // Через сколько автоматически сбрасывать статус аккаунта
    private timeToResetProcessingStatus:number;
    private resetTimeout:NodeJS.Timeout|undefined = undefined;
    private passwordInvalid = false;

    constructor(builder:AccountBuilder) {

        this.CBAPI = <ICBAPI> builder.CBAPIProvider;
        this.ProxyProvider = <IProxyPool> builder.ProxyProvider;
        this.proxy = builder.proxy;
        this.session = builder.session;
        this.CAC = <string> builder.cac;
        this.parseLimit = builder.parseLimit;
        this.log = <ILog> builder.LogProvider;
        this.timeToResetProcessingStatus = builder.timeToResetProcessingStatus;
        this.id = builder.id;
        this.login = <string> builder.login;
        this.password = <string> builder.password;
    }

    setPasswordInvalid():void {
        this.passwordInvalid = true;
    }

    getLogin():string {
        return this.login;
    }

    getPassword():string {
        return this.password;
    }

    async getSession(doNotStartProcessing = false):Promise<string> {
        if (!doNotStartProcessing) {
            this.startProcess();
        }

        if (typeof this.session === 'undefined') {
            try {
                this.session = await this.CBAPI.openSession(this);
            } catch (e) {
                if (/Password could not be validated/i.test(e.message)) {
                    this.stopProcess();
                    this.setPasswordInvalid();
                    await this.log.error(`[${this.getLogin()}] Login/Password could not be validated`);
                } else {
                    await this.log.error(`[${this.getLogin()}] ${e.name}: ${e.message}`);
                }

                throw e;
            }

            await this.log.info(`[${this.getLogin()}] session was opened`);
        }

        return this.session;
    }

    async getProxy():Promise<string> {
        if (typeof this.proxy === 'undefined') {
            this.proxy = await this.ProxyProvider.getProxy();
        }

        return this.proxy;
    }

    gotError(e:Error):number {
        const errorStr = `[${this.getLogin()}] ${e.name}: ${e.message}`;
        this.log.error(errorStr);

        this.stopProcess();

        return ++this.errorsCount;
    }

    accountDisabled():boolean {
        if (this.passwordInvalid) return true;
        if (this.errorsCount >= MAX_ERRORS_ACCOUNT) return true;
        if (this.parseLimit <= 0) return true;

        return false;
    }

    canProcess():boolean {
        return !(this.processing || this.accountDisabled());
    }

    protected startProcess():void {
        this.processing = true;

        this.resetTimeout = setTimeout(() => {
            if (this.processing) {
                this.processing = false;
            }
        }, this.timeToResetProcessingStatus);
    }

    protected stopProcess():void {
        this.processing = false;

        if (typeof this.resetTimeout !== 'undefined') {
            clearTimeout(this.resetTimeout);
        }
    }

    successProcessed(resumeParsed = true):void {
        this.stopProcess();

        if (resumeParsed) {
            this.errorsCount = 0;
            this.parseLimit--;
        }
    }

    getID():number|undefined {
        return this.id;
    }

    getCustAccCode():string {
        return this.CAC;
    }
}