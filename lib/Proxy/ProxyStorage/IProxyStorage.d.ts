interface IProxyStorage {
    cleanList():Promise<void>
    addProxyToList(proxy:string):Promise<void>
    badProxy(proxy: string):Promise<void>
    proxyAmount():Promise<number>
    getProxy():Promise<string>
}
