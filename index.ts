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
    await log.debug('parser.beforeWork() start');
    await parser.beforeWork();
    await log.debug('parser.beforeWork() finish');
    try {
        await log.debug('parser.go() start');
        await parser.go(async resume => await resumeDB.save(resume));
        await log.debug('parser.go() finish');
    } catch (e) {
        await log.error(e.message);
    } finally {
        await log.debug('parser.afterWork() start');
        await parser.afterWork();
        await log.debug('parser.afterWork() finish');
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
    })
