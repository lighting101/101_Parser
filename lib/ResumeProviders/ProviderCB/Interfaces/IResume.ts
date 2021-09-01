import {JoberFormat} from "../../../../common";

export default interface IResume {
    save(resume:JoberFormat):Promise<void>
}
