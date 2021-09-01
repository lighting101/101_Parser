import {JoberFormat, TaskFormat} from "../../../../common";
import IAccount from "./IAccount";

export default interface ICBAPI {
    getResumeList(task:TaskFormat, account:IAccount):Promise<{page:number, maxPage:number, resumes:Array<string>}>
    getResume(task:TaskFormat, account:IAccount):Promise<JoberFormat>
    openSession(account:IAccount):Promise<string>
}