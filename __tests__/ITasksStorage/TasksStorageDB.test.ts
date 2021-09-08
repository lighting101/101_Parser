import TasksStorageDB from "../../lib/ResumeProviders/ProviderCB/TasksStorageDB";
import LogDB from "../../lib/LogDB";
import Database from "../../lib/Database";

jest.mock("../../lib/LogDB");
jest.mock("../../lib/Database");

beforeEach(() => {
    jest.resetAllMocks();
});

function classFactory() {
    const storage = new Database();

    const ts = new TasksStorageDB(
        new LogDB('test'),
        storage);

    return {ts, storage};
}

describe('getTasks()', () => {
    it('Amount of the tasks must be equivalent to amount of the results', async () => {
        expect.assertions(1)

        const {ts, storage} = classFactory();

        const testTasks = [
            {id: 1, type: 'resume', data: '{"resumeID": "R0000000"}'},
            {id: 2, type: 'resume', data: '{"resumeID": "R0000001"}'},
            {id: 3, type: 'resume', data: '{"resumeID": "R0000002"}'},
            {id: 4, type: 'resume', data: '{"resumeID": "R0000003"}'},
            {id: 5, type: 'resume', data: '{"resumeID": "R0000004"}'},
        ]

        storage.query = jest.fn().mockResolvedValue(testTasks);

        const result = await ts.getTasks();

        expect(result.length).toBe(testTasks.length);
    })

    it('Accordance of the well-result snapshot', async () => {
        expect.assertions(1)

        const {ts, storage} = classFactory();

        const testTasks = [
            {id: 1, type: 'resume', data: '{"resumeID": "R0000000"}'},
            {id: 2, type: 'resume', data: '{"resumeID": "R0000001"}'},
            {id: 3, type: 'resume', data: '{"resumeID": "R0000002"}'},
            {id: 4, type: 'resume', data: '{"resumeID": "R0000003"}'},
            {id: 5, type: 'resume', data: '{"resumeID": "R0000004"}'},
        ]

        storage.query = jest.fn().mockResolvedValue(testTasks);

        const result = await ts.getTasks();

        expect(result).toMatchSnapshot();
    })

    it('If dont have any tasks in DB the method throws a specific exception', async () => {
        expect.assertions(1)

        const {ts, storage} = classFactory();

        storage.query = jest.fn().mockResolvedValue([]);

        try {
            await ts.getTasks();
        } catch (e) {
            expect(e.message).toContain('No any tasks in DB')
        }
    })
})
