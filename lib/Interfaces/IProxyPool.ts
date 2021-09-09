export default interface IProxyPool
{
    getProxy(): Promise<string>
    badProxy(proxy: string): Promise<void>
}
