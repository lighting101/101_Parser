import * as mysql from "mysql";
import {mysqlConfig} from "../config";

export default class Database
{
    private connection:mysql.Connection;

    constructor() {
        this.connection = mysql.createConnection(mysqlConfig);
    }

    query(sql:string, params:Array<any> = []):Promise<any> {
        return new Promise((resolve, reject) => {
            const finalSql = mysql.format(sql, params);
            this.connection.query(finalSql, (err, rows) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(rows);
                }
            });
        });
    }

    beginTransaction():Promise<void> {
        return new Promise(((resolve, reject) => {
            this.connection.beginTransaction(err => {
                if (err) {
                    reject(err);
                } else {
                    resolve();
                }
            })
        }))
    }

    commit():Promise<void> {
        return new Promise(((resolve, reject) => {
            this.connection.commit(err => {
                if (err) {
                    reject(err);
                } else {
                    resolve();
                }
            })
        }))
    }

    rollback():Promise<void> {
        return new Promise(((resolve, reject) => {
            this.connection.rollback(err => {
                if (err) {
                    reject(err);
                } else {
                    resolve();
                }
            })
        }))
    }

    end():Promise<void> {
        return new Promise(((resolve, reject) => {
            this.connection.end(err => {
                if (err) {
                    reject(err);
                } else {
                    resolve();
                }
            })
        }))
    }
}