import {TaskFormat} from "../../../common";
import Database from "../../Database";
import {TASKS_LIMIT} from "../../../config";
import ITasksStorage from "./Interfaces/ITaskStorage";
import {TaskType} from "../../../commons";
import LogDB from "../../LogDB";
import ILog from "../../Interfaces/ILog";

const db = new Database();

type TasksDB = {
    type: number,
    data: string,
    controlhash: string
};

export default class TasksStorageDB implements ITasksStorage
{
    private log:ILog;

    constructor(logProvider = new LogDB('TaskStorageDB')) {
        this.log = logProvider;
    }

    async clearOldTasks():Promise<void> {
        const sql = 'delete from `tasks` where `status` <> 3 or `type` <> 3';
        await db.query(sql);
    }

    async resetStatus():Promise<void> {
        const sql = 'update `tasks` set `status` = 1 where `status` = 2';
        await db.query(sql);
    }

    async doneTasks(tasks: Array<TaskFormat>): Promise<void> {
        const sql = 'update `tasks` set `status` = 3 where `id` in (?)';

        const taskIDs:Array<number> = [];
        for (const task of tasks) {
            if (typeof task.id !== 'undefined') {
                taskIDs.push(task.id);
            }
        }

        await db.query(sql, [ taskIDs ]);
    }

    async getTasks(): Promise<TaskFormat[]> {
        let tasks:Array<{ type: number, data: string, id: number}>;

        await this.resetStatus();

        await db.beginTransaction();

        // get tasks with status = 1 (waiting for process)
        const sql1 = 'SELECT `id`, `type`, `data` ' +
            'FROM `tasks` ' +
            'WHERE `status` = 1 ' +
            'order by `type` desc, `ts` asc ' +
            'limit ?';

        const sql2 = 'update `tasks` set `status` = 2 where `id` in (?)';

        try {
            tasks = await db.query(sql1, [ TASKS_LIMIT ]);

            if (tasks.length === 0) {
                throw new Error('No any tasks in DB');
            }

            // make status "processing"
            const taskIDs = tasks.map(task => task.id)
            await db.query(sql2, [ taskIDs ]);

            await db.commit();
        } catch (e) {
            await db.rollback();
            throw e;
        }

        const returnTasks:TaskFormat[] = [];

        for (const task of tasks) {
            const type = <TaskType> task.type;

            const data = <{
                kind?: 'branch'|'resume',
                keywords?: string,
                city?: string,
                state?: string,
                freshness?: number,
                page?: number,
                rowsPerPage?: number,
                resumeID?: string
            }> JSON.parse(task.data);

            const id = <number> task.id;

            // Checking to have a kind field in the data
            if (!('kind' in data)) {
                if (type === TaskType.TASK_BRANCH_PARSE) {
                    data.kind = 'branch';
                } else if (type === TaskType.TASK_RESUME_PARSE) {
                    data.kind = 'resume';
                } else {
                    const errMsg = 'getTasks() got undefined task type';
                    await this.log.error(errMsg);
                    throw new Error(errMsg);
                }
            }

            // Checking to have other needing fields in the data to according with the Task format
            if ( !(('resumeID' in data && data.kind === 'resume') ||
                ('keywords' in data &&
                    'city' in data &&
                    'state' in data &&
                    'freshness' in data &&
                    'page' in data &&
                    'rowsPerPage' in data &&
                    data.kind === 'branch'))) {

                const errMsg = `getTasks() Error in according a data object with the Task format: ${JSON.stringify(data)}`;
                await this.log.error(errMsg);
                throw new Error(errMsg);
            }

            returnTasks.push( <TaskFormat> {data, id} );
        }

        return returnTasks;
    }

    async putTasks(tasks: Array<TaskFormat>): Promise<void> {
        const sql = 'insert ignore into `tasks` (`type`, `data`, `controlhash`) values ?';

        const tasksChecked:TasksDB[] = [];
        for (const task of tasks) {
            let type:TaskType;

            if (task.data.kind === 'resume') {
                type = TaskType.TASK_RESUME_PARSE;
            } else if (task.data.kind === 'branch') {
                type = TaskType.TASK_BRANCH_PARSE;
            } else {
                const errorMsg = 'Undefined kind field in the task';
                await this.log.error(errorMsg);
                throw new Error(errorMsg);
            }

            tasksChecked.push({
                type,
                data: JSON.stringify(task.data),
                controlhash: 'md5(data)'
            });
        }

        await db.query(sql, [ tasksChecked ]);
    }

}