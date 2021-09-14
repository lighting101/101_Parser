/*
* Отвечает за связь списка задач с классом хранилища
* */

import {TaskFormat} from "../../../common";
import TasksStorageDB from "./TasksStorageDB";
import ITasksStorage from "./Interfaces/ITaskStorage";
import ITasks from "./Interfaces/ITasks";
import * as fs from "fs";
import {FRESHNESS, ROWS_PER_PAGE} from "../../../config";
import ILog from "../../Interfaces/ILog";
import LogFactory from "../../LogFactory";

export default class Tasks implements ITasks {
    private storage:ITasksStorage;
    private readonly cities:Array<[string, string]> = [];
    private readonly keywords:string;
    private readonly freshness:number;
    private readonly rowsPerPage:number;
    private log:ILog;

    constructor(storage:ITasksStorage = new TasksStorageDB(),
                optionFreshness = FRESHNESS,
                optionRowsPerPage = ROWS_PER_PAGE,
                optionLogger = LogFactory('Tasks')) {

        this.storage = storage;
        this.freshness = optionFreshness;
        this.rowsPerPage = optionRowsPerPage;
        this.log = optionLogger;

        const cities:Array<string> = JSON.parse(fs.readFileSync("lib/ResumeProviders/ProviderCB/json/cities_states.json").toString());
        for (const cityState of cities) {
            const [city, state] = cityState.split(",");
            this.cities.push([city, state]);
        }

        this.keywords = JSON.parse(fs.readFileSync("lib/ResumeProviders/ProviderCB/json/keywords.json").toString()).join(' OR ');
    }

    markDone(task: TaskFormat): Promise<void> {
        return this.storage.markDone(task);
    }

    async getTasks(): Promise<TaskFormat[]> {
        await this.log.debug(`getTasks() started`);

        let tasks: TaskFormat[] = [];

        try {
            tasks = await this.storage.getTasks();
        } catch (e) {
            if (e.message === 'No any tasks in DB') {
                const newTasks = this.rootTasks();
                await this.storage.putTasks(newTasks);
            } else {
                throw e;
            }
        }

        if (!tasks.length) {
            await this.log.info(`getTasks() no any tasks, start recursion!`);
            return await this.getTasks();
        } else {
            await this.log.debug(`getTasks() found ${tasks.length} tasks`);
            return tasks;
        }
    }

    rootTasks(): Array<TaskFormat> {
        const tasks:Array<TaskFormat> = [];

        for (const [city, state] of this.cities) {
            const task:TaskFormat = {
                data: {
                    kind: 'branch',
                    keywords: this.keywords,
                    city: city,
                    state: state,
                    freshness: this.freshness,
                    page: 1,
                    rowsPerPage: this.rowsPerPage
                }
            };

            tasks.push(task);
        }

        return tasks;
    }

    async putTasksResumes(resumes: Array<string>): Promise<void> {
        const newTasks:TaskFormat[] = [];

        for (const resume of resumes) {
            const task:TaskFormat = {
                data: {
                    kind: 'resume',
                    resumeID: resume
                }
            }

            newTasks.push(task);
        }

        await this.storage.putTasks(newTasks);
    }

    async putTasksListing(city:string, state:string, page:number): Promise<void> {
        const newTask:TaskFormat = {
            data: {
                kind: 'branch',
                keywords: this.keywords,
                city: city,
                state: state,
                freshness: this.freshness,
                page: page,
                rowsPerPage: this.rowsPerPage
            }
        };

        await this.storage.putTasks([newTask]);
    }
}