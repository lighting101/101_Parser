/*
* TODO: Сделать возможность сохранять большой текст в BLOB
*  (использовать отдельную таблицу для long text)
* */

export default interface ILog {
    info(msg:string):Promise<void>
    debug(msg:string):Promise<void>
    error(msg:string):Promise<void>
}
