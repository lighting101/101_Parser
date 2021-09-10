import ProxyPoolFineproxy from "./ProxyPoolFineproxy";
import Redis from "./Redis";

const rcli = new Redis();

export default class ProxyPoolFineproxyRedis extends ProxyPoolFineproxy {

    protected redis_key = 'proxy';

    async cleanList():Promise<void> {
        await rcli.del(this.redis_key);
    }

    protected async addProxyToList(proxy: string): Promise<void> {
        await rcli.lpush(this.redis_key, [ proxy ]);
    }

    public async badProxy(proxy: string):Promise<void> {
        await rcli.lrem(this.redis_key, 1, proxy);
    }

    protected async proxyAmount(): Promise<number> {
        return await rcli.llen(this.redis_key);
    }

    protected async getProxyFromStorage():Promise<string> {
        return await rcli.rpop(this.redis_key);
    }
}