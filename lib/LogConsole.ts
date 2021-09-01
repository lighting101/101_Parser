import ILog from "./Interfaces/ILog";

export enum ErrorLevels {
    debug,
    info,
    error
}

export default class LogConsole implements ILog {
    private showLevel:number;
    private moduleName:string;

    constructor(moduleName = '', showLevel = ErrorLevels.info) {
        this.showLevel = showLevel;
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

    private async drawMessage(message:string, level:number) {
        if (level >= this.showLevel) {
            console.log(message);
        }
    }
}