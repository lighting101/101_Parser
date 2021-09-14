import LogConsole from "./LogConsole";
import LogDB from "./LogDB";
import LogElastic from "./LogElastic";
import ILog from "./Interfaces/ILog";
import {loggerModule, logstashURL} from "../config";
import LogElasticConsole from "./LogElasticConsole";
import LogDBConsole from "./LogDBConsole";

export default function LogFactory (moduleName:string):ILog {
    switch (loggerModule) {
        case "Console": return new LogConsole(moduleName);
        case "Logstash": return new LogElastic(moduleName, logstashURL);
        case "MySQL": return new LogDB(moduleName);
        case "LogElasticConsole": return new LogElasticConsole(moduleName, logstashURL);
        case "MySQLConsole": return new LogDBConsole(moduleName);
        default: throw new Error('Undefined logger module!');
    }
}
