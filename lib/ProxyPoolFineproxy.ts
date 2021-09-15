import IProxyPool from "./Interfaces/IProxyPool";
import {fineproxy} from "../config";
import fetch from "node-fetch";

export default class ProxyPoolFineproxy implements IProxyPool
{
    private login:string;
    private pass:string;
    private proxyList:string[] = [];

    constructor(login = fineproxy.login, pass = fineproxy.pass) {
        if (login.length < 3 || pass.length < 3) {
            throw new Error('Not set login/pass for FineProxy');
        }

        this.login = login;
        this.pass = pass;
    }

    public async cleanList():Promise<void> {
        this.proxyList = [];
    }

    private async makeRequest():Promise<string> {
        const apiurl = `https://account.fineproxy.org/api/getproxy/?format=txt&type=httpip&login=${this.login}&password=${this.pass}`;
        const response = await fetch(apiurl);
        return await response.text();
    }

    protected async addProxyToList(proxy:string):Promise<void> {
        this.proxyList.push(proxy);
    }

    public async loadProxies():Promise<void> {
        const txtList = await this.makeRequest();

        await this.cleanList();

        const listArray = txtList.split('\n');

        for (const proxyRaw of listArray) {
            let proxyFormatted = proxyRaw.trim();

            if (!/(\d{1,3}\.){3}\d{1,3}/i.test(proxyFormatted)) continue;

            proxyFormatted = 'http://' + proxyFormatted.trim();

            await this.addProxyToList(proxyFormatted);
        }
    }

    async badProxy(proxy: string):Promise<void> {
        for (let i = 0, l = this.proxyList.length; i < l; i++) {
            if (this.proxyList[i] === proxy) {
                this.proxyList.splice(i, 1);
                break;
            }
        }
    }

    protected async proxyAmount():Promise<number> {
        return this.proxyList.length;
    }

    protected async getProxyFromStorage():Promise<string> {
        const proxy = this.proxyList.shift();

        if (typeof proxy === 'undefined') {
            throw new Error('No proxies in the proxy-list');
        }

        this.proxyList.push(proxy);

        return proxy;
    }

    async getProxy(): Promise<string> {
        if (await this.proxyAmount() === 0) {
            await this.loadProxies();
        }

        return await this.getProxyFromStorage();
    }

}