export default interface IAccount
{
    getSession(doNotStartProcessing?:boolean): Promise<string>
    getLogin(): string
    getPassword(): string
    getProxy(): Promise<string>
    getID(): number|undefined
    gotError(e:Error):number
    canProcess():boolean
    successProcessed(resumeParsed?:boolean):void
    getCustAccCode():string
    accountInactive():boolean
}