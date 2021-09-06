import {TaskFormat} from "../../../../common";

export default interface ITasksStorage {
    getTasks(): Promise<TaskFormat[]>
    putTasks(tasks: Array<TaskFormat>): Promise<void>
    markDone(task:TaskFormat): Promise<void>
}
