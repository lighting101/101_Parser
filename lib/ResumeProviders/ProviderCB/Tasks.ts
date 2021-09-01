import {TaskFormat} from "../../../common";
import TasksStorageDB from "./TasksStorageDB";
import ITasksStorage from "./Interfaces/ITaskStorage";
import ITasks from "./Interfaces/ITasks";
import * as fs from "fs";
import {FRESHNESS, ROWS_PER_PAGE} from "../../../config";

export default class Tasks implements ITasks {
    private storage:ITasksStorage;
    private readonly cities:Array<[string, string]> = [];
    private readonly keywords:string;
    private readonly freshness:number;
    private readonly rowsPerPage:number;

    constructor(storage:ITasksStorage = new TasksStorageDB(),
                optionFreshness = FRESHNESS,
                optionRowsPerPage = ROWS_PER_PAGE) {

        this.storage = storage;
        this.freshness = optionFreshness;
        this.rowsPerPage = optionRowsPerPage;

        const cities:Array<string> = JSON.parse(fs.readFileSync("./json/cities_states.json").toString());
        for (const cityState of cities) {
            const [city, state] = cityState.split(",");
            this.cities.push([city, state]);
        }

        this.keywords = JSON.parse(fs.readFileSync("./json/keywords.json").toString()).join(' OR ');
    }

    async getTasks(): Promise<TaskFormat[]> {
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
            return await this.getTasks();
        } else {
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