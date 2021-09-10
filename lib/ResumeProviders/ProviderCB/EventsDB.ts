import Database from "../../Database";
import Account from "./Account";

export default class EventsDB {
    db:Database;

    constructor(oDB = new Database()) {
        this.db = oDB;
    }
    async parseResume(account:Account):Promise<void> {
        const sql = 'insert into events set ?';
        await this.db.query(sql, [ {
            type: 'resume_parse',
            account_id: account.getID()
        } ]);
    }
}