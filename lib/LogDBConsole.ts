import ILog from "./Interfaces/ILog";
import LogDB from "./LogDB";
import LogConsole from "./LogConsole";

export default class LogDBConsole implements ILog
{
    private logConsole:LogConsole;
    private logDB:LogDB;

    constructor(moduleName:string) {
        this.logConsole = new LogConsole(moduleName);
        this.logDB = new LogDB(moduleName);
    }

    async debug(msg: string): Promise<void> {
        await this.logConsole.debug(msg);
        await this.logDB.debug(msg);
    }

    async error(msg: string): Promise<void> {
        await this.logConsole.error(msg);
        await this.logDB.error(msg);
    }

    async info(msg: string): Promise<void> {
        await this.logConsole.info(msg);
        await this.logDB.info(msg);
    }
}