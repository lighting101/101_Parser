import {TaskFormat} from "../../../../common";

export default interface ITasks {
    getTasks():Promise<TaskFormat[]>
    putTasksResumes(resumes: Array<string>): Promise<void>
    putTasksListing(city:string, state:string, page:number): Promise<void>
    markDone(task:TaskFormat):Promise<void>
}