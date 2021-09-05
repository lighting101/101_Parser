import Database from "./Database";
import ILog from "./Interfaces/ILog";

export enum ErrorLevels {
    debug,
    info,
    error
}

type LogDBConfig = {
    Database: ErrorLevels,
    Console: ErrorLevels
}

const defaultConfig:LogDBConfig = {
    Database: ErrorLevels.info,
    Console: ErrorLevels.error
}

export default class LogDB implements ILog {
    private config:LogDBConfig;
    private db:Database;
    private moduleName:string;
    protected errorLevelText = ['debug', 'info', 'error'];

    constructor(moduleName = '', config:LogDBConfig = defaultConfig) {
        this.db = new Database();
        this.config = config;
        this.moduleName = moduleName;
    }

    async info(msg: string): Promise<void> {
        const level = ErrorLevels.info;
        await this.drawMessage(msg, level);
    }

    async debug(msg: string): Promise<void> {
        const level = ErrorLevels.debug;
        await this.drawMessage(msg, level);
    }

    async error(msg: string): Promise<void> {
        const level = ErrorLevels.error
        await this.drawMessage(msg, level);
    }

    protected level2Text(level:number):string {
        return this.errorLevelText[level];
    }

    private async drawMessage(message:string, level:number) {
        if (level >= this.config.Console) {
            console.log(message);
        }

        if (level >= this.config.Database) {
            const sql = 'insert into `log` set ?'
            await this.db.query(sql, [{ message, level: this.level2Text(level) }])
        }
    }
}