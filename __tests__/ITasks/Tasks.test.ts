import Tasks from "../../lib/ResumeProviders/ProviderCB/Tasks";
import TasksStorageDB from "../../lib/ResumeProviders/ProviderCB/TasksStorageDB";
import LogDB from "../../lib/LogDB";
import mock = jest.mock;

jest.mock("../../lib/ResumeProviders/ProviderCB/TasksStorageDB")
jest.mock("../../lib/LogDB")

beforeEach(() => {
    jest.clearAllMocks();
})

function tasksFactory() {
    const storage = new TasksStorageDB();
    const tasks = new Tasks(storage,
        10,
        100,
        new LogDB('Tasks.test'));

    return {tasks, storage};
}

describe('getTasks()', () => {
    it('On "No any task in db" exception method must be return a result of the rootTasks() method', async () => {
        expect.assertions(1);

        const {tasks, storage} = tasksFactory();

        storage.getTasks = jest.fn()
            .mockRejectedValue(new Error('No any tasks in DB'));

        const rootTasksResult = tasks.rootTasks();

        const result = await tasks.getTasks();

        expect(result).toMatchObject(rootTasksResult);
    });

    it('If it got an undefined exception, must be throw it up', async () => {
        expect.assertions(1);

        const {tasks, storage} = tasksFactory();

        storage.getTasks = jest.fn()
            .mockRejectedValue(new Error('Some other error'));

        try {
            await tasks.getTasks();
        } catch {
            expect(1).toBe(1);
        }
    });

    it('Accordance of a good result to the test data', async () => {
        expect.assertions(1);

        const {tasks, storage} = tasksFactory();

        const testTasks = [
            {data: {kind: 'resume', resumeID: 'R00000001'}, id: 1},
            {data: {kind: 'resume', resumeID: 'R00000002'}, id: 2},
            {data: {kind: 'resume', resumeID: 'R00000003'}, id: 3},
            {data: {kind: 'resume', resumeID: 'R00000004'}, id: 4}
        ]

        storage.getTasks = jest.fn().mockResolvedValue(testTasks);

        const result = await tasks.getTasks();

        expect(result).toMatchObject(testTasks);
    });
})

describe('putTasksListing()', () => {
    it('Check good result to match the snapshot', async () => {
        expect.assertions(1);
        const {tasks, storage} = tasksFactory();

        await tasks.putTasksListing('New York', 'NY', 8);

        // @ts-ignore
        expect(storage.putTasks.mock.calls[0]).toMatchSnapshot();
    })
})

describe('putTasksResumes()', () => {
    it('Checking for a good result to matching the snapshot', async () => {
        expect.assertions(1)

        const {tasks, storage} = tasksFactory();

        const resumes = [
            'R0000000000',
            'R0000000001',
            'R0000000002',
            'R0000000003',
            'R0000000004',
            'R0000000005',
            'R0000000006',
            'R0000000007',
        ]

        await tasks.putTasksResumes(resumes)

        // @ts-ignore
        expect(storage.putTasks.mock.calls[0]).toMatchSnapshot();
    })
})

describe('rootTasks()', () => {
    it('Accordance of amount of the method\'s result and amount of cities',  () => {
        const {tasks, storage} = tasksFactory();

        const result = tasks.rootTasks();

        // @ts-ignore
        expect(result.length).toBe(tasks.cities.length);
    })

    it('To matching the well-result snapshot', () => {
        const {tasks, storage} = tasksFactory();
        const result = tasks.rootTasks();

        expect(result).toMatchSnapshot();
    })
})
