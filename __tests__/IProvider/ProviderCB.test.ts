import ProviderCB from "../../lib/ResumeProviders/ProviderCB";
import Tasks from "../../lib/ResumeProviders/ProviderCB/Tasks";
import CBAccountPoolDB from "../../lib/ResumeProviders/ProviderCB/CBAccountPoolDB";
import LogDB from "../../lib/LogDB";
import {TaskFormat} from "../../common";

jest.mock("../../lib/ResumeProviders/ProviderCB/Tasks");
jest.mock("../../lib/ResumeProviders/ProviderCB/CBAccountPoolDB");
jest.mock("../../lib/LogDB");

beforeEach(() => {
    jest.resetAllMocks();
});

describe('go()', () => {
    it('The method taskProcessor() must be launch for a each task from tasks.getTasks()', async () => {
        expect.assertions(1);

        const provCB = new ProviderCB(
            new Tasks(),
            new CBAccountPoolDB(),
            new LogDB());

        const tasks = [ 'task1', 'task2', 'task3' ]

        // @ts-ignore
        provCB.tasks.getTasks = jest.fn().mockResolvedValue(tasks);

        // @ts-ignore
        const taskProcessor = provCB.taskProcessor = jest.fn(task => Promise.resolve(task));

        await provCB.go();

        expect(taskProcessor.mock.calls.map(args => args[0])).toMatchObject(tasks);
    })
})

describe('taskProcessor()', () => {
    describe('If type of the task is branch', () => {
        it('Must be launch the branchTaskHandler(task) method', async () => {
            expect.assertions(1);

            const provCB = new ProviderCB(
                new Tasks(),
                new CBAccountPoolDB(),
                new LogDB());

            const task:TaskFormat = {
                data: {
                    kind: 'branch',
                    keywords: 'driver OR cashier',
                    city: 'Atlanta',
                    state: 'GA',
                    freshness: 10,
                    page: 1,
                    rowsPerPage: 10
                }
            };

            // @ts-ignore
            const branchTaskHandler = provCB.branchTaskHandler = jest.fn();

            // @ts-ignore
            const resumeTaskHandler = provCB.resumeTaskHandler = jest.fn();

            // @ts-ignore
            await provCB.taskProcessor(task);

            expect(branchTaskHandler.mock.calls.length).toBe(1);
        })

        it('Must not be launch the resumeTaskHandler(task) method', async () => {
            expect.assertions(1);

            const provCB = new ProviderCB(
                new Tasks(),
                new CBAccountPoolDB(),
                new LogDB());

            const task:TaskFormat = {
                data: {
                    kind: 'branch',
                    keywords: 'driver OR cashier',
                    city: 'Atlanta',
                    state: 'GA',
                    freshness: 10,
                    page: 1,
                    rowsPerPage: 10
                }
            };

            // @ts-ignore
            const branchTaskHandler = provCB.branchTaskHandler = jest.fn();

            // @ts-ignore
            const resumeTaskHandler = provCB.resumeTaskHandler = jest.fn();

            // @ts-ignore
            await provCB.taskProcessor(task);

            expect(resumeTaskHandler.mock.calls.length).toBe(0);
        })
    })

    describe('If type of the task is resume', () => {
        it('Must be launch the resumeTaskHandler(task) method', async () => {
            expect.assertions(1);

            const provCB = new ProviderCB(
                new Tasks(),
                new CBAccountPoolDB(),
                new LogDB());

            const task:TaskFormat = {
                data: {
                    kind: 'resume',
                    resumeID: "R000000000000000000"
                }
            };

            // @ts-ignore
            const branchTaskHandler = provCB.branchTaskHandler = jest.fn();

            // @ts-ignore
            const resumeTaskHandler = provCB.resumeTaskHandler = jest.fn();

            // @ts-ignore
            await provCB.taskProcessor(task);

            expect(resumeTaskHandler.mock.calls.length).toBe(1);
        })

        it('Must not be launch the branchTaskHandler(task) method', async () => {
            expect.assertions(1);

            const provCB = new ProviderCB(
                new Tasks(),
                new CBAccountPoolDB(),
                new LogDB());

            const task:TaskFormat = {
                data: {
                    kind: 'resume',
                    resumeID: "R000000000000000000"
                }
            };

            // @ts-ignore
            const branchTaskHandler = provCB.branchTaskHandler = jest.fn();

            // @ts-ignore
            const resumeTaskHandler = provCB.resumeTaskHandler = jest.fn();

            // @ts-ignore
            await provCB.taskProcessor(task);

            expect(branchTaskHandler.mock.calls.length).toBe(0);
        })
    })

    it('Must be throw an specific exception if type of the task is undefined', async () => {
        expect.assertions(1);

        const provCB = new ProviderCB(
            new Tasks(),
            new CBAccountPoolDB(),
            new LogDB());

        const task:TaskFormat = {
            data: {
                // @ts-ignore
                kind: 'not-known-type',
                keywords: 'driver OR cashier',
                city: 'Atlanta',
                state: 'GA',
                freshness: 10,
                page: 1,
                rowsPerPage: 10
            }
        };

        try {
            // @ts-ignore
            await provCB.taskProcessor(task);
        } catch (e) {
            expect(e.message).toContain('Undefined parse task type');
        }
    })
})

describe('resumeTaskHandler()', () => {

})

describe('branchTaskHandler()', () => {

})
describe('getResumes()', () => {
    it('The method clearResumes() must be launch after give the resumes', async () => {
        expect.assertions(1);

        const provCB = new ProviderCB(
            new Tasks(),
            new CBAccountPoolDB(),
            new LogDB());

        // @ts-ignore
        const clearResumes = provCB.clearResumes = jest.fn();

        provCB.getResumes();

        expect(clearResumes.mock.calls.length).toBe(1);
    })
})
