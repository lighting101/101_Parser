import Database from "../Database";
import LogBase from "./LogBase";

const db = new Database();

export default class LogDB extends LogBase{
    protected errorLevelText = ['debug', 'info', 'error'];

    protected level2Text(level:number):string {
        return this.errorLevelText[level];
    }

    protected async drawMessage(message:string, level:number):Promise<string> {
        const formatMessage = await super.drawMessage(message, level);

        const sql = 'insert into `log` set ?'
        await db.query(sql, [{ message: formatMessage, level: this.level2Text(level) }])

        return formatMessage;
    }
}