import {JoberFormat} from "../../../common"

/*
Задача класса, реализующего IProvider:
получить пачку задач и обработать ее. получившиеся результаты сохранить.
 */

export default interface IProvider {
    beforeWork():Promise<void>
    afterWork():Promise<void>
    getName():string
    go(gotResume:(resume:JoberFormat) => Promise<void>):Promise<void>
}
