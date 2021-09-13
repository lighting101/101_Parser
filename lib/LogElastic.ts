import LogBase from "./LogBase";
import {createConnection} from "net";

type messageFormat = {
    level:string,
    module:string,
    message_text:string
};

export default class LogElastic extends LogBase{
    protected errorLevelText = ['DEBUG', 'INFO', 'ERROR'];
    private logstashHost:string;
    private logstashPort:number;

    constructor(moduleName:string, logstashHost:string, logstashPort: number) {
        super(moduleName);

        this.logstashHost = logstashHost;
        this.logstashPort = logstashPort;
    }

    protected level2Text(level:number):string {
        return this.errorLevelText[level];
    }

    private tcpSend(message: string, options:{host:string, port:number}):Promise<void> {
        return new Promise(((resolve, reject) => {
            const sock = createConnection(options);

            sock.on('connect', async () => {
                sock.write(message, err => {
                    if (err) {
                        reject(err);
                    } else {
                        sock.destroy();
                        resolve();
                    }
                });
            })

            sock.on('error', e => {
                reject(e);
            })
        }));
    }

    private async sendToLogstash(message:messageFormat):Promise<void> {
        await this.tcpSend(JSON.stringify(message), {
            host: this.logstashHost,
            port: this.logstashPort
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