import LogBase from "./LogBase";
import {ErrorLevels} from "./LogBase";

export default class LogConsole extends LogBase{
    private readonly showLevel:number;

    constructor(moduleName = '', showLevel = ErrorLevels.info) {
        super(moduleName);
        this.showLevel = showLevel;
    }

    protected async drawMessage(message:string, level:number):Promise<string> {
        const formatMessage = await super.drawMessage(message, level);

        if (level >= this.showLevel) {
            console.log(formatMessage);
            return formatMessage;
        } else {
            return "";
        }
    }
}