import {TaskFormat} from "../../../../common";

export default interface ITasksStorage {
    clearOldTasks():Promise<void>
    resetStatus():Promise<void>
    doneTasks(tasks: Array<TaskFormat>): Promise<void>
    getTasks(): Promise<TaskFormat[]>
    putTasks(tasks: Array<TaskFormat>): Promise<void>
}
