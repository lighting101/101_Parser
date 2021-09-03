/*
Задача класса, реализующего IProvider:
получить пачку задач и обработать ее. получившиеся результаты сохранить.
 */

import {JoberFormat} from "../../../common";

export default interface IProvider {
    beforeWork():Promise<void>
    afterWork():Promise<void>
    getName():string
    go():Promise<void>
    getResumes():JoberFormat[]
}
