import CBAccountPoolDB from "../../lib/ResumeProviders/ProviderCB/CBAccountPoolDB";
import LogDB from "../../lib/LogDB";
import CBAPI from "../../lib/ResumeProviders/ProviderCB/CBAPI";
import Account from "../../lib/ResumeProviders/ProviderCB/Account";
import AccountBuilder from "../../lib/ResumeProviders/ProviderCB/AccountBuilder";
import {JoberFormat, TaskFormat} from "../../common";
import { generate } from "randomstring";
import IAccount from "../../lib/ResumeProviders/ProviderCB/Interfaces/IAccount";

jest.mock("../../lib/LogDB");
jest.mock("../../lib/ResumeProviders/ProviderCB/CBAPI");
jest.mock("../../lib/ResumeProviders/ProviderCB/Account");

beforeEach(() => {
    jest.resetAllMocks();
});

type selectAccount = {
    id: number,
    login: string,
    pass: string,
    proxy: string|null,
    session: string|null,
    cac: string|null,
    daylimit: number,
    remainder: number
};

function genId():number {
    return Math.round( Math.random() * 3 );
}

function genLogin():string {
    const login = generate({length: 7, charset: 'alphabetic', capitalization: 'lowercase'});
    const domain = generate({length: 7, charset: 'alphabetic', capitalization: 'lowercase'}) + '.com';
    return `${login}@${domain}`;
}

function genPass():string {
    return generate(10);
}

function genProxy():string|null {
    function genByte():number {
        return Math.round((Math.random() * 9999) % 255);
    }

    if ( Math.random() > 0.5 ) return null;

    const a1 = genByte().toString();
    const a2 = genByte().toString();
    const a3 = genByte().toString();
    const a4 = genByte().toString();

    return `http://${a1}.${a2}.${a3}.${a4}:1080`;
}

function genSession():string|null {
    if (Math.random() > 0.5) return null;
    return generate(20);
}

function genCAC():string|null {
    if (Math.random() > 0.5) return null;
    return 'CA' + generate({length: 5, charset: 'alphanumeric', capitalization: 'uppercase'});
}

function genDaylimit(max = 50):number {
    if (max < 15) {
        throw new Error('genDaylimit() minimum is 15!');
    }

    const divider = max - 10;

    return Math.round((Math.random() * 8888) % divider ) + 10;
}

function genReminder(daylimit = 50):number {
    return daylimit - Math.round( (Math.random() * 9878) % (daylimit / 2) );
}

function genDbAccount(maxDaylimit = 50):selectAccount {
    return {
        id: genId(),
        login: genLogin(),
        pass: genPass(),
        proxy: genProxy(),
        session: genSession(),
        cac: genCAC(),
        daylimit: genDaylimit(maxDaylimit),
        remainder: genReminder(maxDaylimit)
    };
}

function genManyDbAccounts(count = 10, maxDaylimit = 50):selectAccount[] {
    const result:selectAccount[] = [];

    for (let i = 0; i < count; i++) {
        result.push(genDbAccount(maxDaylimit));
    }

    return result;
}

describe('getResume()', () => {
    it('Good result, must be match to test object', async () => {
        expect.assertions(1);

        const pool = new CBAccountPoolDB();
        const account = new Account(<AccountBuilder> {});
        const task:TaskFormat = {
            data: {
                kind: 'resume',
                resumeID: "R000000000000000000"
            }
        };

        const apiResult:JoberFormat = {
            email: 'oleks@mail.com',
            name: 'Oleksey',
            state: 'GA',
            city: 'Atlanta'
        }

        pool.getAccount = jest.fn(() => Promise.resolve(account));

        // @ts-ignore
        pool.CBAPI.getResume = jest.fn(() => Promise.resolve(apiResult));

        const result = await pool.getResume(task);

        expect(result).toMatchObject(apiResult);
    })

    describe('Arguments of CBAPI.getResume() checking', () => {
        it('...has 2 arguments', async () => {
            expect.assertions(1);

            const pool = new CBAccountPoolDB();
            const account = new Account(<AccountBuilder> {});
            const task:TaskFormat = {
                data: {
                    kind: 'resume',
                    resumeID: "R000000000000000000"
                }
            };

            pool.getAccount = jest.fn(() => Promise.resolve(account));

            // @ts-ignore
            pool.CBAPI.getResume = jest.fn();

            try {
                await pool.getResume(task);
            } finally {
                // @ts-ignore
                expect(pool.CBAPI.getResume.mock.calls[0].length).toBe(2);
            }
        })

        it('...the argument two is a Task', async () => {
            expect.assertions(1);

            const pool = new CBAccountPoolDB();
            const account = new Account(<AccountBuilder> {});
            const task:TaskFormat = {
                data: {
                    kind: 'resume',
                    resumeID: "R000000000000000000"
                }
            };

            pool.getAccount = jest.fn(() => Promise.resolve(account));

            // @ts-ignore
            pool.CBAPI.getResume = jest.fn();

            try {
                await pool.getResume(task);
            } finally {
                // @ts-ignore
                expect(pool.CBAPI.getResume.mock.calls[0][0]).toMatchObject(task);
            }
        })

        it('...the argument two is an Account', async () => {
            expect.assertions(1);

            const pool = new CBAccountPoolDB();
            const account = new Account(<AccountBuilder> {});
            const task:TaskFormat = {
                data: {
                    kind: 'resume',
                    resumeID: "R000000000000000000"
                }
            };

            pool.getAccount = jest.fn(() => Promise.resolve(account));

            // @ts-ignore
            pool.CBAPI.getResume = jest.fn();

            try {
                await pool.getResume(task);
            } finally {
                // @ts-ignore
                expect(pool.CBAPI.getResume.mock.calls[0][1]).toMatchObject(account)
            }
        })
    })

    describe('Errors checking', () => {
        it('Throwing specific error if not enough accounts', async () => {
            expect.assertions(1);

            const pool = new CBAccountPoolDB();

            const errorMsg = 'Accounts list is empty'
            pool.getAccount = jest.fn(() => Promise.reject(new Error(errorMsg)));

            // @ts-ignore
            pool.CBAPI.getResume = jest.fn();

            try {
                await pool.getResume(<TaskFormat> {});
            } catch (e) {
                expect(e.message).toMatch(errorMsg);
            }
        })

        it('Catch an undefined error from CBAPI.getResume()', async () => {
            expect.assertions(1);

            const pool = new CBAccountPoolDB();
            const account = new Account(<AccountBuilder> {});
            const task:TaskFormat = {
                data: {
                    kind: 'resume',
                    resumeID: "R000000000000000000"
                }
            };

            const someError = new Error('Some error');

            pool.getAccount = jest.fn(() => Promise.resolve(account));

            // @ts-ignore
            pool.CBAPI.getResume = jest.fn(() => Promise.reject(someError));

            try {
                await pool.getResume(task);
            } catch (e) {
                expect(e).toMatchObject(someError);
            }
        })
    })
})

describe('getResumeList()', () => {
    it('Good result, must be match to test object', async () => {
        expect.assertions(1);

        const pool = new CBAccountPoolDB();
        const account = new Account(<AccountBuilder> {});
        const task:TaskFormat = {
            data: {
                kind: 'branch',
                keywords: 'driver OR cashier',
                city: 'Atlanta',
                state: 'GA',
                freshness: 10,
                page: 1,
                rowsPerPage: 10
            }
        };

        const apiResult = {
            maxPage: 45,
            page: 1,
            resumes: [
                "RCM21S71GP8GHG6ZFJZ",
                "RD85NS6L588R28B6MRL",
                "RD77YZ6WHX5CPSVBMTM",
                "RCM48K62Q80CDHHPSW3",
                "RD72ZC6LR31MF69KR86",
                "RDH54467TMSC4TF3ZQL",
                "R2N0TM6TK76083X3L5F",
                "R2Z1JL6YB8XGVFG1KYM",
                "RDF5MM6MSLD3TF2D067",
                "RCM8HZ68FJSJS1VCW67"
            ],
        }

        pool.getAccount = jest.fn(() => Promise.resolve(account));

        // @ts-ignore
        pool.CBAPI.getResumeList = jest.fn(() => Promise.resolve(apiResult));

        const result = await pool.getResumeList(task);

        expect(result).toMatchObject(apiResult);
    })

    describe('Arguments of CBAPI.getResumeList() checking', () => {
        it('...has 2 arguments', async () => {
            expect.assertions(1);

            const pool = new CBAccountPoolDB();
            const account = new Account(<AccountBuilder> {});
            const task:TaskFormat = {
                data: {
                    kind: 'branch',
                    keywords: 'driver OR cashier',
                    city: 'Atlanta',
                    state: 'GA',
                    freshness: 10,
                    page: 1,
                    rowsPerPage: 10
                }
            };

            pool.getAccount = jest.fn(() => Promise.resolve(account));

            // @ts-ignore
            pool.CBAPI.getResumeList = jest.fn();

            try {
                await pool.getResumeList(task);
            } finally {
                // @ts-ignore
                expect(pool.CBAPI.getResumeList.mock.calls[0].length).toBe(2);
            }
        })

        it('...argument one is a Task', async () => {
            expect.assertions(1);

            const pool = new CBAccountPoolDB();
            const account = new Account(<AccountBuilder> {});
            const task:TaskFormat = {
                data: {
                    kind: 'branch',
                    keywords: 'driver OR cashier',
                    city: 'Atlanta',
                    state: 'GA',
                    freshness: 10,
                    page: 1,
                    rowsPerPage: 10
                }
            };

            pool.getAccount = jest.fn(() => Promise.resolve(account));

            // @ts-ignore
            pool.CBAPI.getResumeList = jest.fn();

            try {
                await pool.getResumeList(task);
            } finally {
                // @ts-ignore
                expect(pool.CBAPI.getResumeList.mock.calls[0][0]).toMatchObject(task);
            }
        })

        it('...argument two is an Account', async () => {
            expect.assertions(1);

            const pool = new CBAccountPoolDB();
            const account = new Account(<AccountBuilder> {});
            const task:TaskFormat = {
                data: {
                    kind: 'branch',
                    keywords: 'driver OR cashier',
                    city: 'Atlanta',
                    state: 'GA',
                    freshness: 10,
                    page: 1,
                    rowsPerPage: 10
                }
            };

            pool.getAccount = jest.fn(() => Promise.resolve(account));

            // @ts-ignore
            pool.CBAPI.getResumeList = jest.fn();

            try {
                await pool.getResumeList(task);
            } finally {
                // @ts-ignore
                expect(pool.CBAPI.getResumeList.mock.calls[0][1]).toMatchObject(account);
            }
        })
    })

    describe('Errors checking', () => {
        it('Throwing specific error if not enough accounts', async () => {
            expect.assertions(1);

            const pool = new CBAccountPoolDB();

            const errorMsg = 'Accounts list is empty'
            pool.getAccount = jest.fn(() => Promise.reject(new Error(errorMsg)));

            // @ts-ignore
            pool.CBAPI.getResumeList = jest.fn();

            try {
                await pool.getResumeList(<TaskFormat> {});
            } catch (e) {
                expect(e.message).toMatch(errorMsg);
            }
        })

        it('Catch an undefined error from CBAPI.getResume()', async () => {
            expect.assertions(1);

            const pool = new CBAccountPoolDB();
            const account = new Account(<AccountBuilder> {});
            const task:TaskFormat = {
                data: {
                    kind: 'branch',
                    keywords: 'driver OR cashier',
                    city: 'Atlanta',
                    state: 'GA',
                    freshness: 10,
                    page: 1,
                    rowsPerPage: 10
                }
            };

            const someError = new Error('Some error');

            pool.getAccount = jest.fn(() => Promise.resolve(account));

            // @ts-ignore
            pool.CBAPI.getResumeList = jest.fn(() => Promise.reject(someError));

            try {
                await pool.getResumeList(task);
            } catch (e) {
                expect(e).toMatchObject(someError);
            }
        })
    })
})

describe('removeAccount()', () => {
    it('accounts[] must be not contain removed account', async () => {
        expect.assertions(1);

        const pool = new CBAccountPoolDB();

        const accountsLength = 30;

        const accounts = []
        for (let i = 0; i < accountsLength; i++) {
            accounts.push({someKey: generate(15)});
        }

        const randomIndex = Math.round(Math.random() * 10000) % accountsLength;

        const testAccount = accounts[randomIndex];

        // @ts-ignore
        pool.accounts = accounts;

        // @ts-ignore
        pool.removeAccount(testAccount);

        expect(accounts).not.toContain(testAccount);
    })

    it('accounts[] must be decreased by 1', async () => {
        expect.assertions(1);

        const pool = new CBAccountPoolDB();

        const accountsLength = 30;

        const accounts = []
        for (let i = 0; i < accountsLength; i++) {
            accounts.push({someKey: generate(15)});
        }

        const randomIndex = Math.round(Math.random() * 10000) % accountsLength;

        const testAccount = accounts[randomIndex];

        // @ts-ignore
        pool.accounts = accounts;

        // @ts-ignore
        pool.removeAccount(testAccount);

        expect(accounts.length).toBe(accountsLength-1);
    })
})

describe('saveAccounts()', () => {
    it('Amount of the queries must be equals amount of the accounts', async () => {
        expect.assertions(1);

        const pool = new CBAccountPoolDB();

        const accountsLength = 30;

        const accounts = []
        for (let i = 0; i < accountsLength; i++) {
            const account = new Account(<AccountBuilder>{});

            // @ts-ignore
            account.getSession = jest.fn(() => Promise.resolve(generate(20)));

            // @ts-ignore
            account.getCustAccCode = jest.fn(() => generate(7));

            // @ts-ignore
            account.getProxy = jest.fn(() => Promise.resolve("http://1.1.1.1:1080"));

            // @ts-ignore
            account.getID = jest.fn(() => genId());

            accounts.push(account);
        }

        // @ts-ignore
        pool.db.query = jest.fn();

        // @ts-ignore
        pool.accounts = accounts;

        // @ts-ignore
        await pool.saveAccounts();

        // @ts-ignore
        expect(pool.db.query.mock.calls.length).toBe(accounts.length);
    })
})