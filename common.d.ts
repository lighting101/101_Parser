import {TaskType} from "./common";

type EmptyCallback = () => void;

interface FullError {
    code?: number|string,
    message?: string
}

type CBError = FullError | null;
type CBFunction = (err?:CBError, param1?:any, param2?:any, param3?:any) => void;

interface JoberFormat {
    email: string,
    name: string,
    state: string,
    city: string,
    account_id?: number // TODO Проверить, чтоб использовалось как account_id а не jobber_id !!!
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

interface ResumeFormat_HomeLocation {
    City: string[],
    State: string[],
}

interface ResumeFormat {
    ResumeID: string,
    ContactEmail: string[],
    HomeLocation: ResumeFormat_HomeLocation[],
    ContactName: string[],
    Error?: string[],
}

interface CBAccount {
    id:number,
    login:string,
    pass:string,
    daylimit:number,
    proxy:string
}

interface DataBaseConfig {
    host: string,
    user: string,
    password: string,
    database: string,
    getTasksLimit?: number
}
