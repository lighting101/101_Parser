import ProviderCB from "./lib/ResumeProviders/ProviderCB";
import IProvider from "./lib/ResumeProviders/Interfaces/IProvider";
import ResumeDB from "./lib/ResumeProviders/ProviderCB/ResumeDB";
import IResume from "./lib/ResumeProviders/ProviderCB/Interfaces/IResume";
import LogDB from "./lib/LogDB";
import ILog from "./lib/Interfaces/ILog";

const resumeDB:IResume = new ResumeDB();
const log:ILog = new LogDB('MAIN');

const parsers:IProvider[] = []

parsers.push(new ProviderCB())

const promises:Promise<void>[] = parsers.map(async parser => {
    const parserName = parser.getName();
    await log.debug(`parser[${parserName}].beforeWork() start`);
    await parser.beforeWork();
    await log.debug(`parser[${parserName}].beforeWork() finish`);
    try {
        await log.debug(`parser[${parserName}].go() start`);
        await parser.go();
        await log.debug(`parser[${parserName}].go() finish`);
    } catch (e) {
        await log.error(`parser[${parserName}] caught error ${e.name}: ${e.message}`);
    } finally {
        await log.debug(`parser[${parserName}].afterWork() start`);

        const resumes = parser.getResumes();
        await log.debug(`parser[${parserName}].afterWork() finally found ${resumes.length} resumes`);
        await resumeDB.saveMany(resumes);

        await parser.afterWork();

        await log.debug(`parser[${parserName}].afterWork() finish`);
    }
})

Promise.all(promises)
    .then(async () => {
        await log.info('runParser() The task queue was executed with no errors');
    })
    .catch( async e => {
        await log.error(`Parsers were stopped by error: ${e.message}`);
    })
    .finally(async () => {
        await log.info(`runParser() The task queue been done`);
        process.exit(0);
    })
