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

            const error = new Error('Some error');

            pool.getAccount = jest.fn(() => Promise.resolve(account));

            // @ts-ignore
            pool.CBAPI.getResume = jest.fn()
                .mockRejectedValue(error);

            // @ts-ignore
            pool.errorHandler = jest.fn()
                .mockRejectedValue(error);

            try {
                await pool.getResume(task);
            } catch (e) {
                expect(e).toMatchObject(error);
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
            pool.CBAPI.getResumeList = jest.fn()
                .mockRejectedValue(someError);

            // @ts-ignore
            pool.errorHandler = jest.fn()
                .mockRejectedValue(someError);

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
        for (let i = 0; i < accountsLength; i++)
            accounts.push(new Account(<AccountBuilder>{}));

        // @ts-ignore
        pool.accounts = accounts;

        // @ts-ignore
        const saveAccount = pool.saveAccount = jest.fn();

        // @ts-ignore
        await pool.saveAccounts();

        expect(saveAccount.mock.calls.length).toBe(accounts.length);
    })
})

describe('saveAccount()', () => {
    it('SQL query must be contains account\'s data', async () => {
        expect.assertions(4);

        const pool = new CBAccountPoolDB();
        const account = new Account(<AccountBuilder>{});

        const cac = generate(7);
        const session = generate(20);
        const proxy = "http://1.1.1.1:1080";
        const id = genId();

        // @ts-ignore
        account.getSession = jest.fn().mockResolvedValue(session);

        // @ts-ignore
        account.getCustAccCode = jest.fn().mockReturnValue(cac);

        // @ts-ignore
        account.getProxy = jest.fn().mockResolvedValue(proxy);

        // @ts-ignore
        account.getID = jest.fn().mockReturnValue(id);

        // @ts-ignore
        pool.db.query = jest.fn();

        // @ts-ignore
        await pool.saveAccount(account);

        // db.query(sql, [ {session, cac, proxy}, id ])

        // @ts-ignore
        const sqlParams = pool.db.query.mock.calls[0][1];

        expect(sqlParams[0].session).toBe(session);
        expect(sqlParams[0].cac).toBe(cac);
        expect(sqlParams[0].proxy).toBe(proxy);
        expect(sqlParams[1]).toBe(id);
    })
})

describe('errorHandler()', () => {
    it('Unhandled error must throwing up the exception', async () => {
        expect.assertions(1);

        const pool = new CBAccountPoolDB();
        const account = new Account(<AccountBuilder> {});

        const someError = new Error('Unhandled exception');

        // @ts-ignore
        pool.passwordInvalid = jest.fn();

        // @ts-ignore
        pool.removeInactiveAccount = jest.fn();

        // @ts-ignore
        account.accountInactive = jest.fn()
            .mockReturnValue(false);

        const recursiveCallback = jest.fn();

        try {
            // @ts-ignore
            await pool.errorHandler(someError, account, async () => await recursiveCallback());
        } catch (e) {
            expect(e).toMatchObject(someError);
        }
    })

    it('The unhandled error & the inactive account are calling removeInactiveAccount()', async () => {
        expect.assertions(1);

        const pool = new CBAccountPoolDB();
        const account = new Account(<AccountBuilder> {});

        const someError = new Error('Unhandled exception');

        // @ts-ignore
        pool.passwordInvalid = jest.fn();

        // @ts-ignore
        const removeInactiveAccount = pool.removeInactiveAccount = jest.fn();

        // @ts-ignore
        account.accountInactive = jest.fn()
            .mockReturnValue(true);

        const recursiveCallback = jest.fn();

        try {
            // @ts-ignore
            await pool.errorHandler(someError, account, async () => await recursiveCallback());
        } catch {
            expect(removeInactiveAccount.mock.calls.length).toBe(1);
        }
    })

    describe('If got an exception like "Incorrect password"', () => {
        it('The exception handling and isn\'t throwing up', async () => {
            expect.assertions(1);

            const pool = new CBAccountPoolDB();
            const account = new Account(<AccountBuilder> {});

            const errIncorrectPassword = new Error('{"Code":["300"],"Text":["300|Email test@mail.com and/or Password could not be validated."]}');

            // @ts-ignore
            pool.passwordInvalid = jest.fn();

            // @ts-ignore
            pool.removeInactiveAccount = jest.fn();

            // @ts-ignore
            account.accountInactive = jest.fn()
                .mockReturnValue(false);

            const testData = { someKey: 'Test Data' };
            const recursiveCallback = jest.fn()
                .mockResolvedValue(testData);

            // @ts-ignore
            const result = await pool.errorHandler(errIncorrectPassword, account, async () => await recursiveCallback());

            expect(result).toBe(testData);
        })

        it('Must be run the recursive callback', async () => {
            expect.assertions(1);

            const pool = new CBAccountPoolDB();
            const account = new Account(<AccountBuilder> {});

            const errIncorrectPassword = new Error('{"Code":["300"],"Text":["300|Email test@mail.com and/or Password could not be validated."]}');

            // @ts-ignore
            pool.passwordInvalid = jest.fn();

            // @ts-ignore
            pool.removeInactiveAccount = jest.fn();

            // @ts-ignore
            account.accountInactive = jest.fn()
                .mockReturnValue(false);

            const recursiveCallback = jest.fn();

            try {
                // @ts-ignore
                await pool.errorHandler(errIncorrectPassword, account, async () => await recursiveCallback());
            } finally {
                expect(recursiveCallback.mock.calls.length).toBe(1);
            }
        })

        it('Must be run the passwordInvalid() method', async () => {
            expect.assertions(1);

            const pool = new CBAccountPoolDB();
            const account = new Account(<AccountBuilder> {});

            const errIncorrectPassword = new Error('{"Code":["300"],"Text":["300|Email test@mail.com and/or Password could not be validated."]}');

            // @ts-ignore
            const passwordInvalid = pool.passwordInvalid = jest.fn();

            // @ts-ignore
            pool.removeInactiveAccount = jest.fn();

            // @ts-ignore
            account.accountInactive = jest.fn()
                .mockReturnValue(false);

            const recursiveCallback = jest.fn();

            try {
                // @ts-ignore
                await pool.errorHandler(errIncorrectPassword, account, async () => await recursiveCallback());
            } finally {
                expect(passwordInvalid.mock.calls.length).toBe(1);
            }
        })
    })
})

describe('setDisableAccount()', () => {
    it('Params for db.query() must be to match snapshot', async () => {
        expect.assertions(1);

        const account = new Account(<AccountBuilder> {});
        const pool = new CBAccountPoolDB();

        account.getID = jest.fn().mockReturnValue(123);

        // @ts-ignore
        pool.db.query = jest.fn();

        // @ts-ignore
        await pool.setDisableAccount(account);

        // @ts-ignore
        expect(pool.db.query.mock.calls[0]).toMatchSnapshot();
    })
})

describe('getAccount()', () => {
    it('Throwing a specific exception if accounts pool is empty', async () => {
        expect.assertions(1);

        const pool = new CBAccountPoolDB();

        try {
            await pool.getAccount();
        } catch (e) {
            expect(e.message).toMatch('Accounts list is empty');
        }
    })

    it('Waiting for the account, if one will be in processing for 3 seconds', async () => {
        expect.assertions(1);

        const canAccountProcess = {status: false};

        setTimeout(() => canAccountProcess.status = true, 3000);

        const pool = new CBAccountPoolDB();

        const account = new Account(<AccountBuilder>{});

        const canProcess = account.canProcess = jest.fn(() => canAccountProcess.status);

        // @ts-ignore
        pool.moveAccToEnd = jest.fn();

        // @ts-ignore
        pool.accounts.push(account);

        await pool.getAccount();

        expect(canProcess.mock.calls.length).toBeGreaterThanOrEqual(2);
    })

    it('Got an account from the pool', async () => {
        expect.assertions(1);

        const pool = new CBAccountPoolDB();
        const account = new Account(<AccountBuilder>{});

        account.canProcess = jest.fn().mockReturnValue(true);

        // @ts-ignore
        pool.moveAccToEnd = jest.fn();

        // @ts-ignore
        pool.accounts.push(account);

        const resultAccount = await pool.getAccount();

        expect(resultAccount).toMatchObject(account);
    })

    it('Calling the moveAccToEnd() method', async () => {
        expect.assertions(1);

        const pool = new CBAccountPoolDB();
        const account = new Account(<AccountBuilder>{});
        account.canProcess = jest.fn().mockReturnValue(true);

        // @ts-ignore
        const moveAccToEnd = pool.moveAccToEnd = jest.fn();

        // @ts-ignore
        pool.accounts.push(account);

        await pool.getAccount();

        expect(moveAccToEnd.mock.calls.length).toBe(1);
    })
})

describe('moveAccToEnd()', () => {
    it('Specified index of an account object in the pool must be moved to the end of the pool', async () => {
        expect.assertions(1);

        // @ts-ignore
        const account1 = <Account> {key: 'account 1'};

        // @ts-ignore
        const account2 = <Account> {key: 'account 2'};

        // @ts-ignore
        const account3 = <Account> {key: 'account 3'};

        const pool = new CBAccountPoolDB();

        // @ts-ignore
        const accounts = pool.accounts = [ account1, account2, account3 ];

        // @ts-ignore
        pool.moveAccToEnd(0);

        expect(accounts[ accounts.length - 1 ]).toMatchObject(account1);
    })
})