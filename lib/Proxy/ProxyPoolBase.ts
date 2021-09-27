import IProxyPool from "../Interfaces/IProxyPool";
import StorageMemory from "./ProxyStorage/StorageMemory";

export default class ProxyPoolBase implements IProxyPool
{
    private storage:IProxyStorage;

    constructor(oStorage:IProxyStorage = new StorageMemory()) {
        this.storage = oStorage;
    }

    protected async loadRaw():Promise<string> {
        return "127.0.0.1:80\n127.0.0.2:80\n127.0.0.3:80";
    }

    public async loadProxies():Promise<void> {
        const txtList = await this.loadRaw();

        await this.storage.cleanList();

        const listArray = txtList.split('\n');

        for (const proxyRaw of listArray) {
            let proxyFormatted = proxyRaw.trim();

            if (!/(\d{1,3}\.){3}\d{1,3}/i.test(proxyFormatted)) continue;

            proxyFormatted = 'http://' + proxyFormatted.trim();

            await this.storage.addProxyToList(proxyFormatted);
        }
    }

    async getProxy(): Promise<string> {
        if (await this.storage.proxyAmount() === 0) {
            await this.loadProxies();
        }

        return await this.storage.getProxy();
    }

    async badProxy(proxy: string):Promise<void> {
        return await this.storage.badProxy(proxy);
    }
}