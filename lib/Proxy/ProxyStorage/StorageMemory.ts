export default class StorageMemory implements IProxyStorage {
    private proxyList:string[] = [];

    async cleanList():Promise<void> {
        this.proxyList = [];
    }

    async addProxyToList(proxy:string):Promise<void> {
        this.proxyList.push(proxy);
    }

    async badProxy(proxy: string):Promise<void> {
        for (let i = 0, l = this.proxyList.length; i < l; i++) {
            if (this.proxyList[i] === proxy) {
                this.proxyList.splice(i, 1);
                break;
            }
        }
    }

    async proxyAmount():Promise<number> {
        return this.proxyList.length;
    }

    async getProxy():Promise<string> {
        const proxy = this.proxyList.shift();

        if (typeof proxy === 'undefined') {
            throw new Error('No proxies in the proxy-list');
        }

        this.proxyList.push(proxy);

        return proxy;
    }
}