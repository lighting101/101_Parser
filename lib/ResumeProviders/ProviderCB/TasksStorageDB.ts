import {TaskFormat} from "../../../common";
import Database from "../../Database";
import {TASKS_LIMIT, maxHoursTaskCanProcessing} from "../../../config";
import ITasksStorage from "./Interfaces/ITaskStorage";
import {TaskType} from "../../../common";
import ILog from "../../Interfaces/ILog";
import LogFactory from "../../LogFactory";

type TasksDB = {
    id: number,
    type: string,
    data: string,
    controlhash: string
};

export default class TasksStorageDB implements ITasksStorage
{
    private log:ILog;
    private db:Database;

    constructor(logProvider = LogFactory('TaskStorageDB'),
                oDB = new Database()) {

        this.log = logProvider;
        this.db = oDB;
    }

    async markDone(task: TaskFormat): Promise<void> {
        const sql = 'update `tasks` set `done` = 1 where `id` = ?';
        await this.db.query(sql, [ task.id ]);
    }

    async getTasks(): Promise<TaskFormat[]> {
        await this.log.debug(`getTasks() started`);

        let tasks:TasksDB[];

        await this.log.debug(`getTasks() starting transaction...`);
        await this.db.beginTransaction();
        await this.log.debug(`getTasks() transaction has been started`);

        // get tasks with status = 1 (waiting for process)
        const sql1 = 'SELECT `id`, `type`, `data` ' +
            'FROM `tasks` ' +
            'WHERE `done` = 0 and `processing` < date_sub(now(), interval ? hour) ' +
            'order by `type` asc, `ts` asc ' +
            'limit ?';

        try {
            await this.log.debug(`getTasks() trying to get tasks from the DB...`);
            tasks = await this.db.query(sql1, [ maxHoursTaskCanProcessing, TASKS_LIMIT ]);
            await this.log.debug(`getTasks() got ${tasks.length} rows from the DB`);
        } catch (e) {
            await this.log.debug(`getTasks() caught error ${e.name}: ${e.message}`);
            await this.log.debug(`getTasks() starting rollback operation...`);
            await this.db.rollback();
            await this.log.debug(`getTasks() rollback done`);
            throw e;
        }

        if (tasks.length === 0) {
            throw new Error('No any tasks in DB');
        }

        const sql2 = 'update `tasks` set `processing` = now() where `id` in (?)';

        const taskIDs = tasks.map(task => task.id)
        await this.log.debug(`getTasks() prepare query to update the 'processing' field (amount of IDs=${taskIDs.length})`);
        await this.db.query(sql2, [ taskIDs ]);
        await this.log.debug(`getTasks() query was done`);

        await this.log.debug(`getTasks() committing transaction...`);
        await this.db.commit();
        await this.log.debug(`getTasks() committed`);

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

            // Does have a "kind" field in the data?
            if (!('kind' in data)) {
                if (!(type === 'branch' || type === 'resume')) {
                    const errMsg = 'getTasks() got undefined task type';
                    await this.log.error(errMsg);
                    throw new Error(errMsg);
                }

                data.kind = type;
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

        await this.log.debug(`getTasks() finish, found ${returnTasks.length} tasks`);

        return returnTasks;
    }

    async putTask(task: TaskFormat): Promise<void> {
        const type = task.data.kind;

        if (!(type === 'resume' || type === 'branch')) {
            const errorMsg = 'Undefined kind field in the task';
            await this.log.error(errorMsg);
            throw new Error(errorMsg);
        }

        const sql = 'insert ignore into `tasks` set type=?, data=?, controlhash=md5(data)';
        await this.db.query(sql, [ type, JSON.stringify(task.data) ]);
    }

    async putTasks(tasks: Array<TaskFormat>): Promise<void> {
        for (const task of tasks) {
            await this.putTask(task);
        }
    }
}