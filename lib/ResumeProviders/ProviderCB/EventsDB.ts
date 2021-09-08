import Database from "../../Database";
import IAccount from "./Interfaces/IAccount";
import IEvents from "./Interfaces/IEvents";

export default class EventsDB implements IEvents{
    db:Database;

    constructor(oDB = new Database()) {
        this.db = oDB;
    }
    async parseResume(account:IAccount):Promise<void> {
        const sql = 'insert delayed into events set ?';
        await this.db.query(sql, [ {
            type: 'resume_parse',
            account_id: account.getID()
        } ]);
    }
}