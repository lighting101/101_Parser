import IResume from "./Interfaces/IResume";
import Database from "../../Database";
import {JoberFormat} from "../../../common";
import ILog from "../../Interfaces/ILog";
import LogDB from "../../LogDB";

const log:ILog = new LogDB('ResumeDB');

const db = new Database();

export default class ResumeDB implements IResume
{
    async save(resume: JoberFormat): Promise<void> {
        await log.debug(`Saving a resume ${JSON.stringify(resume)}`)
        const sql = 'insert ignore into jobers set ?';
        await db.query(sql, [ resume ]);
    }

    async saveMany(resumeList:JoberFormat[]):Promise<void> {
        for (const resume of resumeList) {
            await this.save(resume);
        }
    }
}