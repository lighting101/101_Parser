import ILog from "./Interfaces/ILog";

export enum ErrorLevels {
    debug,
    info,
    error
}

export default class LogBase implements ILog {
    protected moduleName:string;

    constructor(moduleName = '') {
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

    level2txt(level:number):string {
        switch (level) {
            case ErrorLevels.error: return 'ERROR';
            case ErrorLevels.debug: return 'DEBUG';
            case ErrorLevels.info: return 'INFO';
            default: throw new Error('Undefined log level');
        }
    }

    protected async drawMessage(message:string, level:number):Promise<string> {
        return `${this.level2txt(level)} [${this.moduleName}] ${message}`;
    }
}
