import IProxyPool from "./Interfaces/IProxyPool";
import {fineproxy} from "../config";
import fetch from "node-fetch";

export default class ProxyPoolFineproxy implements IProxyPool
{
    private login:string;
    private pass:string;
    private proxyList: Array<string> = [];
    private updated = 0;
    private updateTimer:number;

    constructor() {
        // Сделать передачу логина и пароля через конструктор
        if (fineproxy.login === '' || fineproxy.pass === '') {
            throw new Error('Not set login/pass for FineProxy');
        }

        this.login = fineproxy.login;
        this.pass = fineproxy.pass;
        this.updateTimer = fineproxy.updateTimer;
    }

    private cleanList():void {
        this.proxyList = [];
    }

    private refreshUpdated():void {
        const currentDate = new Date();
        this.updated = currentDate.getTime();
    }

    private timeToUpdateProxyList():boolean {
        const current = new Date();
        const currentTimestamp = current.getTime();

        return this.updated + this.updateTimer < currentTimestamp;
    }

    private async loadProxies():Promise<void> {
        const apiurl = `https://account.fineproxy.org/api/getproxy/?format=txt&type=httpip&login=${this.login}&password=${this.pass}`;
        const response = await fetch(apiurl);
        const txtList = await response.text();

        this.cleanList();
        this.refreshUpdated();

        const listArray = txtList.split('\n');

        for (const proxyRaw of listArray) {
            let proxyFormatted = proxyRaw.trim();

            if (proxyFormatted.length < 7) continue;

            proxyFormatted = 'http://' + proxyFormatted;
            this.proxyList.push(proxyFormatted);
        }
    }

    badProxy(proxy: string): void {
        for (let i = 0, l = this.proxyList.length; i < l; i++) {
            if (this.proxyList[i] === proxy) {
                this.proxyList.splice(i, 1);
                break;
            }
        }
    }

    async getProxy(): Promise<string> {
        if (this.timeToUpdateProxyList() || !this.proxyList.length) {
            await this.loadProxies();
        }

        const proxy = this.proxyList.shift();

        if (typeof proxy === 'undefined') {
            throw new Error('No proxies in the proxy-list');
        }

        this.proxyList.push(proxy);

        return proxy;
    }

}