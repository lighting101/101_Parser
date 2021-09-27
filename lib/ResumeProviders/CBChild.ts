import LogFactory from "../Logger/LogFactory";
import ResumeDB from "./ProviderCB/ResumeDB";
import IProvider from "./Interfaces/IProvider";
import ProviderCB from "./ProviderCB";

const resumeDB = new ResumeDB();

const log = LogFactory('cb_child[' + process.pid.toString()+']');

async function worker(parser:IProvider):Promise<void> {
    await log.info('CB Parser thread starts work');

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
}

worker(new ProviderCB())
    .catch( async e => await log.error(e.message))
    .finally(async () => {
        await log.debug('Thread finished works');
        process.exit(0);
    })
