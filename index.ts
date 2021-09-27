import LogFactory from "./lib/Logger/LogFactory";
import { Worker } from "worker_threads";

const log = LogFactory('MAIN');

function runService():Promise<void> {
    return new Promise((resolve, reject) => {
        const worker = new Worker('./lib/ResumeProviders/CBChild.js', );
        worker.on('message', resolve);
        worker.on('error', reject);
        worker.on('exit', (code) => {
            if (code !== 0)
                reject(new Error(`Worker stopped with exit code ${code}`));
        })
    })
}

let processing = false;

setInterval(async () => {
    if (processing) return;
    processing = true;

    await log.info('New loop started');

    try {
        await runService();
    } catch (e) {
        await log.error(`Parsers were stopped by error: ${e.message}`);
    } finally {
        await log.info(`Loop finished`);
        processing = false;
    }
}, 5000)

