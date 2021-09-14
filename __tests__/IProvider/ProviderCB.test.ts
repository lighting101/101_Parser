import ProviderCB from "../../lib/ResumeProviders/ProviderCB";
import Tasks from "../../lib/ResumeProviders/ProviderCB/Tasks";
import CBAccountPoolDB from "../../lib/ResumeProviders/ProviderCB/CBAccountPoolDB";
import LogDB from "../../lib/Logger/LogDB";
import {JoberFormat, TaskFormat} from "../../common";
import Redis from "../../lib/Redis";

jest.mock("../../lib/Redis");
jest.mock("../../lib/ResumeProviders/ProviderCB/Tasks");
jest.mock("../../lib/ResumeProviders/ProviderCB/CBAccountPoolDB");
jest.mock("../../lib/Logger/LogDB");

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
        const taskProcessor = provCB.taskProcessor = jest.fn();

        await provCB.go();

        expect(taskProcessor).toHaveBeenCalledTimes(tasks.length);
    })

    it('Even if the taskProcessor() throws an exception work doesn\'t stop', async () => {
        expect.assertions(1);

        const provCB = new ProviderCB(
            new Tasks(),
            new CBAccountPoolDB(),
            new LogDB());

        const tasks = [ 'task1', 'task2', 'task3' ]

        // @ts-ignore
        provCB.tasks.getTasks = jest.fn().mockResolvedValue(tasks);

        // @ts-ignore
        const taskProcessor = provCB.taskProcessor = jest.fn();

        // @ts-ignore
        provCB.goErrorHandler = jest.fn();

        taskProcessor.mockRejectedValueOnce(new Error('Some error 1'))
        taskProcessor.mockRejectedValueOnce(new Error('Some error 2'))

        await provCB.go();

        expect(1).toBe(1);
    })

    it('If the taskProcessor() throws an error, must be called goErrorHandler()', async () => {
        expect.assertions(1);

        const provCB = new ProviderCB(
            new Tasks(),
            new CBAccountPoolDB(),
            new LogDB());

        const tasks = [ 'task1', 'task2', 'task3' ]

        // @ts-ignore
        provCB.tasks.getTasks = jest.fn().mockResolvedValue(tasks);

        // @ts-ignore
        const taskProcessor = provCB.taskProcessor = jest.fn();

        // @ts-ignore
        const goErrorHandler = provCB.goErrorHandler = jest.fn();

        taskProcessor.mockRejectedValueOnce(new Error('Some error 1'))
        taskProcessor.mockRejectedValueOnce(new Error('Some error 2'))

        await provCB.go();

        expect(goErrorHandler).toHaveBeenCalledTimes(2);
    })
})

describe('taskProcessor()', () => {
    it('In the end, must be run this.tasks.markDone() method', async () => {
        expect.assertions(2);

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
        provCB.branchTaskHandler = jest.fn();

        // @ts-ignore
        provCB.resumeTaskHandler = jest.fn();

        // @ts-ignore
        const markDone = provCB.tasks.markDone = jest.fn();

        // @ts-ignore
        await provCB.taskProcessor(task);

        expect(markDone).toHaveBeenCalledTimes(1);
        expect(markDone).toHaveBeenLastCalledWith(task);
    })

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
    it('throw an exception if task.data.kind !== \'resume\'', async () => {
        expect.assertions(1);

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

        const provCB = new ProviderCB(
            new Tasks(),
            new CBAccountPoolDB(),
            new LogDB());

        try {
            // @ts-ignore
            await provCB.resumeTaskHandler(task);
        } catch (e) {
            expect(e.message).toContain('Error the task type');
        }
    })

    it('launch the addResume() method with found data', async () => {
        expect.assertions(2);

        const task:TaskFormat = {
            data: {
                kind: 'resume',
                resumeID: 'R0000000001'
            }
        };

        const provCB = new ProviderCB(
            new Tasks(),
            new CBAccountPoolDB(),
            new LogDB());

        const testJober = {
            email: 'test@msn.com',
            name: 'John Malkovich',
            city: 'Miami',
            state: 'FL',
        };

        // @ts-ignore
        provCB.accountPool.getResume = jest.fn(() => Promise.resolve(testJober))

        // @ts-ignore
        const addResume = provCB.addResume = jest.fn();

        // @ts-ignore
        await provCB.resumeTaskHandler(task);

        expect(addResume).toHaveBeenLastCalledWith(testJober);
        expect(addResume).toHaveBeenCalledTimes(1);
    })

    it('if this.accountPool.getResume() throws an exception, then must be launched putTasksResumes() method with the task data', async () => {
        expect.assertions(2);

        const task:TaskFormat = {
            data: {
                kind: 'resume',
                resumeID: 'R0000000001'
            }
        };

        const provCB = new ProviderCB(
            new Tasks(),
            new CBAccountPoolDB(),
            new LogDB());

        const testJober = {
            email: 'test@msn.com',
            name: 'John Malkovich',
            city: 'Miami',
            state: 'FL',
        };

        // @ts-ignore
        provCB.accountPool.getResume = jest.fn()
            .mockRejectedValue(new Error('Some error'))

        // @ts-ignore
        const putTasksResumes = provCB.tasks.putTasksResumes = jest.fn();

        try {
            // @ts-ignore
            await provCB.resumeTaskHandler(task);
        } catch {
            // handler...
        } finally {
            expect(putTasksResumes).toHaveBeenCalledTimes(1);

            // @ts-ignore
            expect(putTasksResumes).toHaveBeenLastCalledWith([ task.data.resumeID ]);
        }
    })
})

describe('branchTaskHandler()', () => {
    it('If task.data.kind !== "branch", the method must throw a specific exception', async () => {
        expect.assertions(1);

        const task:TaskFormat = {
            data: {
                kind: 'resume',
                resumeID: "R000000000000000000"
            }
        };

        const provCB = new ProviderCB(
            new Tasks(),
            new CBAccountPoolDB(),
            new LogDB());

        try {
            // @ts-ignore
            await provCB.branchTaskHandler(task);
        } catch (e) {
            expect(e.message).toContain('Error the task type');
        }
    })

    it('If it crashes when running accountPool.getResumeList(task), task must be resent to the queue', async () => {
        expect.assertions(1);

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

        const provCB = new ProviderCB(
            new Tasks(),
            new CBAccountPoolDB(),
            new LogDB());

        // @ts-ignore
        provCB.accountPool.getResumeList = jest.fn()
            .mockRejectedValue(new Error('Something error'));

        // @ts-ignore
        const putTasksListing = provCB.tasks.putTasksListing = jest.fn()

        try {
            // @ts-ignore
            await provCB.branchTaskHandler(task)
        } catch {
            // empty
        }
        finally {
            // @ts-ignore
            expect(putTasksListing).toHaveBeenLastCalledWith(task.data.city, task.data.state, task.data.page)
        }
    })

    it('If it have got resumes list, then must be created tasks to parse these resumes', async () => {
        expect.assertions(2);

        const task:TaskFormat = {
            data: {
                kind: 'branch',
                keywords: 'driver OR cashier',
                city: 'Atlanta',
                state: 'GA',
                freshness: 10,
                page: 8,
                rowsPerPage: 10
            }
        };

        const provCB = new ProviderCB(
            new Tasks(),
            new CBAccountPoolDB(),
            new LogDB());

        // @ts-ignore
        provCB.accountPool.getResumeList = jest.fn(task => {
            if (task.data.kind !== 'branch') throw new Error('It isn\'t a branch');

            return Promise.resolve({
                page: task.data.page,
                maxPage: 10,
                resumes: [
                    'R000000000',
                    'R000000001',
                    'R000000002',
                    'R000000003',
                    'R000000004',
                    'R000000005',
                    'R000000006',
                    'R000000007',
                    'R000000008',
                ]
            })
        });

        // @ts-ignore
        const putTasksResumes = provCB.tasks.putTasksResumes = jest.fn()

        try {
            // @ts-ignore
            await provCB.branchTaskHandler(task)
        } catch {
            // empty
        }
        finally {
            // @ts-ignore
            expect(putTasksResumes.mock.calls[0][0][0]).toBe('R000000000');
            expect(putTasksResumes.mock.calls[0][0][8]).toBe('R000000008');
        }
    })

    it('If page == 1 and maxPage > 1 then the method must be created tasks to parse pages 2..maxPage', async () => {
        expect.assertions(5);

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

        const provCB = new ProviderCB(
            new Tasks(),
            new CBAccountPoolDB(),
            new LogDB());

        const maxPage = 10;

        // @ts-ignore
        provCB.accountPool.getResumeList = jest.fn(task => {
            if (task.data.kind !== 'branch') throw new Error('It isn\'t a branch');

            return Promise.resolve({
                page: task.data.page,
                maxPage: maxPage,
                resumes: [
                    'R000000000',
                    'R000000001',
                    'R000000002',
                    'R000000003',
                    'R000000004',
                    'R000000005',
                    'R000000006',
                    'R000000007',
                    'R000000008',
                ]
            })
        });

        // @ts-ignore
        provCB.tasks.putTasksResumes = jest.fn()

        // @ts-ignore
        const putTasksListing = provCB.tasks.putTasksListing = jest.fn()

        try {
            // @ts-ignore
            await provCB.branchTaskHandler(task)
        } catch {
            // empty
        }
        finally {
            expect(putTasksListing).toHaveBeenCalledTimes(maxPage - 1);

            // @ts-ignore
            expect(putTasksListing.mock.calls[0][0]).toBe(task.data.city);

            // @ts-ignore
            expect(putTasksListing.mock.calls[0][1]).toBe(task.data.state);

            // @ts-ignore
            expect(putTasksListing.mock.calls[0][2]).toBe(2);

            // @ts-ignore
            expect(putTasksListing.mock.calls[maxPage - 2][2]).toBe(maxPage);
        }
    })
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

    it('Must be returns this.resumes Set as Array', async () => {
        expect.assertions(4);

        const provCB = new ProviderCB(
            new Tasks(),
            new CBAccountPoolDB(),
            new LogDB());

        // @ts-ignore
        provCB.resumes = new Set<JoberFormat>([
            'R000000000001',
            'R000000000002',
            'R000000000003',
            'R000000000004',
            'R000000000005',
            'R000000000006',
            'R000000000007'
        ])

        // @ts-ignore
        provCB.clearResumes = jest.fn();

        const result = provCB.getResumes();

        expect(Array.isArray(result)).toBe(true)
        expect(result.length).toBe(7)
        expect(result[0]).toBe('R000000000001')
        expect(result[6]).toBe('R000000000007')

    })
})

describe('goErrorHandler()', () => {
    it('do not throw an exception if no accounts', async() => {
        expect.assertions(1);

        const provCB = new ProviderCB(
            new Tasks(),
            new CBAccountPoolDB(),
            new LogDB());

        const error = new Error('Accounts list is empty');

        // @ts-ignore
        await provCB.goErrorHandler(error);

        expect(1).toBe(1);
    })

    it('throw an exception if the error is undefined', async () => {
        expect.assertions(1);

        const provCB = new ProviderCB(
            new Tasks(),
            new CBAccountPoolDB(),
            new LogDB());

        const error = new Error('Some undefined error');

        try {
            // @ts-ignore
            await provCB.goErrorHandler(error);
        } catch {
            expect(1).toBe(1);
        }
    })
})