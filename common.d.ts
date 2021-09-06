// Типы задач
export type TaskType = 'resume' | 'branch';

interface JoberFormat {
    email: string,
    name: string,
    state: string,
    city: string,
    account_id?: number
}

interface TaskDataBranch {
    kind: 'branch',
    keywords: string,
    city: string,
    state: string,
    freshness: number,
    page: number,
    rowsPerPage: number
}

interface TaskDataResume {
    kind: 'resume',
    resumeID: string
}

interface TaskFormat {data: TaskDataBranch | TaskDataResume, id?: number}
