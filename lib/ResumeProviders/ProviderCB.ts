import IProvider from "./Interfaces/IProvider"
import {JoberFormat} from "../../common"
import Log from "../LogDB"
import Tasks from "./ProviderCB/Tasks"
import ITasks from "./ProviderCB/Interfaces/ITasks";
import CBAccountPoolDB from "./ProviderCB/CBAccountPoolDB";
import ICBAccountPool from "./ProviderCB/Interfaces/ICBAccountPool";

const log = new Log('ProviderCB')

export default class ProviderCB implements IProvider
{
    private tasks:ITasks;
    private accountPool:ICBAccountPool;

    constructor(taskProvider:ITasks = new Tasks(),
                accountPool:ICBAccountPool = new CBAccountPoolDB()) {

        this.tasks = taskProvider;
        this.accountPool = accountPool;
    }

    async beforeWork(): Promise<void> {
        await this.accountPool.beforeWork();
    }

    async afterWork():Promise<void> {
        await this.accountPool.afterWork();
    }

    async go(gotResume:(resume:JoberFormat) => Promise<void>):Promise<void> {
        await log.debug('go() started');
        const tasks = await this.tasks.getTasks();

        for (const task of tasks) {
            if (task.data.kind === 'branch') {
                await log.debug('go() the task is a branch')

                const {page, maxPage, resumes} = await this.accountPool.getResumeList(task);

                await this.tasks.putTasksResumes(resumes);

                if (page === 1 && maxPage > 1) {
                    for (let i = 2, l = maxPage; i <= l; i++) {
                        await this.tasks.putTasksListing(task.data.city, task.data.state, i);
                    }
                }

            } else if (task.data.kind === 'resume') {
                await log.debug('go() the task is a resume')

                let resumeData
                try {
                    resumeData = await this.accountPool.getResume(task);
                } catch (e) {
                    if (/Accounts list is empty/.test(e.message)) {
                        // TODO error: Accounts list is empty
                    } else {
                        throw e;
                    }
                }

                if (resumeData !== null) {
                    await log.debug(`go() got new resume = ${resumeData}`)
                    // @ts-ignore
                    await gotResume(resumeData);
                }
            } else throw new Error('Undefined parse type');
        }

        await log.debug('go() finished');
    }
}