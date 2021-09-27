import Redis from "../../Redis";

const rcli = new Redis();

export default class StorageRedis implements IProxyStorage {
    protected redis_key = 'proxy';

    async cleanList():Promise<void> {
        await rcli.del(this.redis_key);
    }

    async addProxyToList(proxy: string): Promise<void> {
        await rcli.lpush(this.redis_key, [ proxy ]);
    }

    async badProxy(proxy: string):Promise<void> {
        await rcli.lrem(this.redis_key, 1, proxy);
    }

    async proxyAmount(): Promise<number> {
        return await rcli.llen(this.redis_key);
    }

    async getProxy():Promise<string> {
        return await rcli.rpop(this.redis_key);
    }
}