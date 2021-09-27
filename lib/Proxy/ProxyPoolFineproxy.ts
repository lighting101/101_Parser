import {fineproxy} from "../../config";
import ProxyPoolLink from "./ProxyPoolLink";
import StorageMemory from "./ProxyStorage/StorageMemory";

export default class ProxyPoolFineproxy extends ProxyPoolLink
{
    constructor(oStorage:IProxyStorage = new StorageMemory(), login = fineproxy.login, pass = fineproxy.pass) {
        if (login.length < 3 || pass.length < 3) {
            throw new Error('Not set login/pass for FineProxy');
        }

        const link = `https://account.fineproxy.org/api/getproxy/?format=txt&type=httpip&login=${login}&password=${pass}`;
        super(oStorage, link);
    }
}