import Account from "./Account";
import ICBAPI from "./Interfaces/ICBAPI";
import IProxyPool from "../../Interfaces/IProxyPool";
import ILog from "../../Interfaces/ILog";
import CBAPI from "./CBAPI";
import {maxTimeLimitForAccount} from "../../../config";
import ProxyPoolFactory from "../../ProxyPoolFactory";
import LogFactory from "../../LogFactory";

export default class AccountBuilder
{
    CBAPIProvider:ICBAPI|undefined;
    login:string|undefined;
    password:string|undefined;
    proxy:string|undefined;
    cac:string|undefined;
    session:string|undefined;
    parseLimit = 0;
    id:number|undefined;
    ProxyProvider:IProxyPool|undefined;
    LogProvider:ILog|undefined;
    timeToResetProcessingStatus:number;

    constructor() {
        this.timeToResetProcessingStatus = maxTimeLimitForAccount;
        this.cac = 'CA' + Math.round(Math.random() * 1000).toString();
    }

    setLogin(login:string):AccountBuilder {
        this.login = login;
        return this;
    }

    setPassword(password:string):AccountBuilder {
        this.password = password;
        return this;
    }

    setParseLimit(limit:number):AccountBuilder {
        this.parseLimit = limit;
        return this;
    }

    setProxy(proxy:string|null):AccountBuilder {
        if (typeof proxy === 'string') this.proxy = proxy;
        return this;
    }

    setCustomAccCode(cac:string|null):AccountBuilder {
        if (typeof cac === 'string') this.cac = cac;
        return this;
    }

    setSession(session:string|null):AccountBuilder {
        if (typeof session === 'string') this.session = session;
        return this;
    }

    setID(id:number):AccountBuilder {
        this.id = id;
        return this;
    }

    setCBAPI(CBAPI:ICBAPI):AccountBuilder {
        this.CBAPIProvider = CBAPI;
        return this;
    }

    setProxyProvider(ProxyProvider:IProxyPool):AccountBuilder {
        this.ProxyProvider = ProxyProvider;
        return this;
    }

    setLogger(Logger:ILog):AccountBuilder {
        this.LogProvider = Logger;
        return this;
    }

    verifyNecessarily():void {
        if (typeof this.login !== 'string') throw new Error('AccountBuilder() Login not set');
        if (typeof this.password !== 'string') throw new Error('AccountBuilder() Password not set');
    }

    setDefaults():void {
        if (typeof this.CBAPIProvider === 'undefined') {
            this.CBAPIProvider = new CBAPI();
        }

        if (typeof this.ProxyProvider === 'undefined') {
            this.ProxyProvider = ProxyPoolFactory();
        }

        if (typeof this.LogProvider === 'undefined') {
            this.LogProvider = LogFactory(`Account[${this.login}]`);
        }
    }

    build():Account {
        this.verifyNecessarily();
        this.setDefaults();

        return new Account(this);
    }
}
