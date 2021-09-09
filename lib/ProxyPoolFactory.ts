import {proxyModule} from "../config";
import ProxyPoolFineproxy from "./ProxyPoolFineproxy";
import ProxyPoolFineproxyRedis from "./ProxyPoolFineproxyRedis";
import IProxyPool from "./Interfaces/IProxyPool";

export default function ProxyPoolFactory(login?:string, pass?:string):IProxyPool {
    switch (proxyModule) {
        case "FineProxy": return new ProxyPoolFineproxy(login, pass);
        case "FineProxyRedis": return new ProxyPoolFineproxyRedis(login, pass);
    }
}
