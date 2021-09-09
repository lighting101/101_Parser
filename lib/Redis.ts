import * as redis from "redis";
import {redisConfig} from "../config";
import {RedisClient} from "redis";

export default class Redis {
    private rcli: RedisClient;

    constructor(config = redisConfig) {
        this.rcli = redis.createClient(config);
    }

    lpush(key:string, list:string[]):Promise<number> {
        return new Promise((resolve, reject) => {
            this.rcli.lpush(key, list, (err, n) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(n);
                }
            })
        })
    }

    rpush(key:string, list:string[]):Promise<number> {
        return new Promise((resolve, reject) => {
            this.rcli.rpush(key, list, (err, n) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(n);
                }
            })
        })
    }

    rpoplpush(source_list:string, destination_list:string):Promise<string> {
        return new Promise((resolve, reject) => {
            this.rcli.rpoplpush(source_list, destination_list, (err, result) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(result);
                }
            })
        })
    }

    llen(list_name:string):Promise<number> {
        return new Promise((resolve, reject) => {
            this.rcli.llen(list_name, (err, result) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(result);
                }
            })
        })
    }

    del(var_name:string):Promise<number> {
        return new Promise((resolve, reject) => {
            this.rcli.del(var_name, (err, result) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(result);
                }
            })
        })
    }

    lrem(key_name:string, count:number, list_item:string):Promise<number> {
        return new Promise((resolve, reject) => {
            this.rcli.lrem(key_name, count, list_item, (err, result) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(result);
                }
            })
        })
    }
}