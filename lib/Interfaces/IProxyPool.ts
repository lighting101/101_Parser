export default interface IProxyPool
{
    getProxy(): Promise<string>
    badProxy(proxy: string): void
}
