import ILog from "./Interfaces/ILog";
import LogElastic from "./LogElastic";
import LogConsole from "./LogConsole";

export default class LogElasticConsole implements ILog
{
    private logConsole:LogConsole;
    private logElastic:LogElastic;

    constructor(moduleName: string, logstashURL: string) {
        this.logConsole = new LogConsole(moduleName);
        this.logElastic = new LogElastic(moduleName, logstashURL);
    }

    async debug(msg: string): Promise<void> {
        await this.logConsole.debug(msg);
        await this.logElastic.debug(msg);
    }

    async error(msg: string): Promise<void> {
        await this.logConsole.error(msg);
        await this.logElastic.error(msg);
    }

    async info(msg: string): Promise<void> {
        await this.logConsole.info(msg);
        await this.logElastic.info(msg);
    }
}