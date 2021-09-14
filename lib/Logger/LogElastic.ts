import LogBase from "./LogBase";
import fetch from 'node-fetch';

type messageFormat = {
    level:string,
    module:string,
    message_text:string
};

export default class LogElastic extends LogBase{
    protected errorLevelText = ['DEBUG', 'INFO', 'ERROR'];
    private logstashUrl:string;

    constructor(moduleName:string, logstashUrl:string) {
        super(moduleName);

        this.logstashUrl = logstashUrl;
    }

    protected level2Text(level:number):string {
        return this.errorLevelText[level];
    }

    private async sendToLogstash(message:messageFormat):Promise<void> {
        await fetch(this.logstashUrl, {
            method: 'POST',
            body: JSON.stringify(message),
            headers: {
                'Content-Type': 'application/json'
            }
        });
    }

    protected async drawMessage(message:string, level:number):Promise<string> {
        const jsonMessage:messageFormat = {
            level: this.level2Text(level),
            module: super.moduleName,
            message_text: message
        };

        await this.sendToLogstash(jsonMessage);

        return await super.drawMessage(message, level);
    }
}