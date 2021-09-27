import ProxyPoolBase from "./ProxyPoolBase";
import fetch from "node-fetch";
import StorageMemory from "./ProxyStorage/StorageMemory";

export default class ProxyPoolLink extends ProxyPoolBase
{
    private link:string;

    constructor(oStorage:IProxyStorage = new StorageMemory(), oLink?:string) {
        super(oStorage);

        if (typeof oLink === 'undefined') {
            throw new Error('Option link must be a string');
        }

        this.link = oLink;
    }

    protected async loadRaw():Promise<string> {
        const response = await fetch(this.link);
        return await response.text();
    }
}