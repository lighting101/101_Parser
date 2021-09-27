import {proxyLink, proxyModule, proxyStorage} from "../../config";
import ProxyPoolFineproxy from "./ProxyPoolFineproxy";
import IProxyPool from "../Interfaces/IProxyPool";
import StorageMemory from "./ProxyStorage/StorageMemory";
import StorageRedis from "./ProxyStorage/StorageRedis";
import ProxyPoolLink from "./ProxyPoolLink";

export default function ProxyPoolFactory():IProxyPool {

    let storage:IProxyStorage;

    switch (proxyStorage) {
        case "Memory":
            storage = new StorageMemory();
            break;

        case "Redis":
            storage = new StorageRedis();
            break;
    }

    switch (proxyModule) {
        case "Fineproxy":
            return new ProxyPoolFineproxy(storage);
        case "Link":
            return new ProxyPoolLink(storage, proxyLink);
    }
}
