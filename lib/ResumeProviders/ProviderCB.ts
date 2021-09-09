import IProvider from "./Interfaces/IProvider"
import {JoberFormat, TaskFormat} from "../../common"
import Log from "../LogDB"
import Tasks from "./ProviderCB/Tasks"
import ITasks from "./ProviderCB/Interfaces/ITasks";
import CBAccountPoolDB from "./ProviderCB/CBAccountPoolDB";
import ICBAccountPool from "./ProviderCB/Interfaces/ICBAccountPool";
import ILog from "../Interfaces/ILog";
import Database from "../Database";
import {FetchError} from "node-fetch";

const db = new Database();

export default class ProviderCB implements IProvider
{
    private resumes = new Set<JoberFormat>();
    private tasks:ITasks;
    private log:ILog;
    private accountPool:ICBAccountPool;
    protected name = 'CareerBuilder';

    constructor(taskProvider:ITasks = new Tasks(),
                accountPool:ICBAccountPool = new CBAccountPoolDB(),
                log = new Log('ProviderCB')) {

        this.tasks = taskProvider;
        this.accountPool = accountPool;
        this.log = log;
    }

    protected clearResumes():void {
        this.resumes.clear();
    }

    getResumes():JoberFormat[] {
        const resumes = [ ...this.resumes ];
        this.clearResumes();
        return resumes;
    }

    protected addResume(resume:JoberFormat):void {
        this.resumes.add(resume);
    }

    getName():string {
        return this.name;
    }

    async beforeWork(): Promise<void> {
        await this.accountPool.beforeWork();
    }

    async afterWork():Promise<void> {
        await this.accountPool.afterWork();
    }

    protected async branchTaskHandler(task:TaskFormat):Promise<void> {
        await this.log.debug(`branchTaskHandler() start`);

        if (task.data.kind !== 'branch')
            throw new Error(`branchTaskHandler() Error the task type: ${JSON.stringify(task)}`);

        let page:number, maxPage:number, resumes:string[];

        try {
            const result = await this.accountPool.getResumeList(task);
            page = result.page;
            maxPage = result.maxPage;
            resumes = result.resumes;
        } catch (e) {
            await this.tasks.putTasksListing(task.data.city, task.data.state, task.data.page);
            throw e;
        }

        await this.log.debug(`branchTaskHandler() ${{page, maxPage, resumes: resumes.length}}`);

        await this.tasks.putTasksResumes(resumes);

        if (page === 1 && maxPage > 1) {
            for (let i = 2, l = maxPage; i <= l; i++) {
                await this.tasks.putTasksListing(task.data.city, task.data.state, i);
            }
        }

        await this.log.debug(`branchTaskHandler() finish`);
    }

    protected async resumeTaskHandler(task:TaskFormat):Promise<void> {
        if (task.data.kind !== 'resume')
            throw new Error(`resumeTaskHandler() Error the task type: ${JSON.stringify(task)}`);

        let resumeData:JoberFormat;

        try {
            resumeData = await this.accountPool.getResume(task);
        } catch (e) {
            await this.tasks.putTasksResumes([ task.data.resumeID ]);
            throw e;
        }

        this.addResume(resumeData);
        await this.log.debug(`resumeTaskHandler() got new resume = ${resumeData}`);
    }

    protected async taskProcessor(task:TaskFormat):Promise<void> {
        await this.log.debug(`taskProcessor() start`);

        if (task.data.kind === 'branch') {
            await this.branchTaskHandler(task);
        } else if (task.data.kind === 'resume') {
            await this.resumeTaskHandler(task);
        } else throw new Error('Undefined parse task type');

        await this.tasks.markDone(task);

        await this.log.debug(`taskProcessor() finish`);
    }

    protected isItNotCriticalError(e:Error):boolean {
        const notCriticalErrors = [
            /Accounts list is empty/i,
            /Not associated with an account that has RDB access/i
        ];

        for (const errMsg of notCriticalErrors) {
            if (errMsg.test(e.message)) return true;
        }

        if (e instanceof FetchError) return true;

        return false;
    }

    protected async goErrorHandler(e:Error):Promise<void> {
        if (this.isItNotCriticalError(e)) {
            await this.log.debug(`${e.name} ${e.message}`);
        } else {
            await this.log.error(`go() ${e.name}: ${e.message}`);
            throw e;
        }
    }

    async go():Promise<void> {
        await this.log.debug('go() started');

        const tasks = await this.tasks.getTasks();

        await this.log.debug(`go() got ${tasks.length} tasks`);

        await Promise.all(tasks.map(async task => {
            try {
                await this.taskProcessor(task);
            } catch (e) {
               await this.goErrorHandler(e);
            }
        }));

        await this.log.debug('go() finished');
    }
}