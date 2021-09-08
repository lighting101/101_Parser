import IAccount from "./IAccount";

export default interface IEvents {
    parseResume(account:IAccount): Promise<void>
}