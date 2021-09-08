export default interface IAccount
{
    getSession(doNotStartProcessing?:boolean): Promise<string>
    getLogin(): string
    getPassword(): string
    getProxy(): Promise<string>
    getID(): number|undefined
    gotError(e:Error):void
    canProcess():boolean
    successProcessed(resumeParsed?:boolean):void
    getCustAccCode():string
    accountInactive():boolean
}