import CBAPI from "../../lib/ResumeProviders/ProviderCB/CBAPI";
import Account from "../../lib/ResumeProviders/ProviderCB/Account";
import IAccount from "../../lib/ResumeProviders/ProviderCB/Interfaces/IAccount";
import AccountBuilder from "../../lib/ResumeProviders/ProviderCB/AccountBuilder";
import {TaskFormat} from "../../common";

jest.mock("../../lib/ResumeProviders/ProviderCB/Account.js");

beforeEach(() => {
    jest.resetAllMocks();
});

describe('openSession() method', () => {
    const getCBAccount = (login = "test@mail.com",
                          pass = "JustTest#",
                          proxy = "http://141.98.235.125:10012") => {

        const account = new Account(<AccountBuilder> {});

        account.getProxy = jest.fn( () => Promise.resolve(proxy) );
        account.getLogin = jest.fn( () => login );
        account.getPassword = jest.fn( () => pass );

        return account;
    }

    describe('The method apiQuery() calling', () => {
        it('Must be call 1 time', async () => {
            expect.assertions(1);

            const account = getCBAccount();
            const api = new CBAPI();

            // @ts-ignore
            api.apiQuery = jest.fn();

            try {
                await api.openSession(account);
            } catch {
                // error
            }

            // @ts-ignore
            expect(api.apiQuery).toHaveBeenCalledTimes(1);
        })

        it('Check amount of arguments must be equals to 3', async () => {
            expect.assertions(1);

            const account = getCBAccount();
            const api = new CBAPI();

            // @ts-ignore
            api.apiQuery = jest.fn();

            try {
                await api.openSession(account);
            } catch {
                // error
            }

            // @ts-ignore
            expect(api.apiQuery.mock.calls[0].length).toBe(3);
        })

        describe('Check arguments of apiQuery()', () => {
            it('...function name', async () => {
                expect.assertions(1);

                const testProxy = 'http://1.1.1.1:1080';

                const account = getCBAccount('test@msn.com', '12345', testProxy);
                const api = new CBAPI();

                // @ts-ignore
                api.apiQuery = jest.fn();

                try {
                    await api.openSession(account);
                } catch {
                    // error
                }

                // @ts-ignore
                expect(api.apiQuery.mock.calls[0][0]).toBe('BeginSessionV2');
            })

            it('...packet', async () => {
                expect.assertions(1);

                const testProxy = 'http://1.1.1.1:1080';

                const account = getCBAccount('test@msn.com', '12345', testProxy);
                const api = new CBAPI();

                // @ts-ignore
                api.apiQuery = jest.fn();

                try {
                    await api.openSession(account);
                } catch {
                    // error
                }

                // @ts-ignore
                expect(api.apiQuery.mock.calls[0][1]).toMatchSnapshot();
            })

            it('...proxy', async () => {
                expect.assertions(1);

                const testProxy = 'http://1.1.1.1:1080';

                const account = getCBAccount('test@msn.com', '12345', testProxy);
                const api = new CBAPI();

                // @ts-ignore
                api.apiQuery = jest.fn();

                try {
                    await api.openSession(account);
                } catch {
                    // error
                }

                // @ts-ignore
                expect(api.apiQuery.mock.calls[0][2]).toBe(testProxy);
            })
        })
    })

    describe('Success results', () => {
        it('To match the snapshot', async () => {
            expect.assertions(1);

            const account = getCBAccount();
            const api = new CBAPI();
            const sessionToken = 'test-session-token';

            // @ts-ignore
            api.apiQuery = jest.fn(() => Promise.resolve({SessionToken: [ sessionToken ]}));

            expect(await api.openSession(account)).toBe(sessionToken);
        })
    })

    describe('Error results', () => {
        it('Invalid login/pass throws a specific error?', async () => {
            expect.assertions(1);

            const account:IAccount = getCBAccount()
            const api = new CBAPI();

            const error = new Error('{"Code":["300"],"Text":["300|Email test@mail.com and/or Password could not be validated."]}');

            // @ts-ignore
            api.apiQuery = jest.fn(() => Promise.reject(error));

            try {
                await api.openSession(account);
            } catch (e) {
                expect(e.message).toContain("Password could not be validated");
            }
        })

        describe('The method apiQuery() calling', () => {
            describe('Returns incorrect format', () => {
                it('Empty session token must be throw an error', async () => {
                    expect.assertions(1);

                    const account:IAccount = getCBAccount()
                    const api = new CBAPI();

                    // @ts-ignore
                    api.apiQuery = jest.fn(() => Promise.resolve({
                        SessionToken: [ "" ]
                    }));

                    try {
                        await api.openSession(account);
                    } catch(e) {
                        expect(e.message).toContain('Can\'t parse session token');
                    }
                })

                describe('SessionToken is an incorrect format', () => {
                    it('Must be throw an error', async () => {
                        expect.assertions(1);

                        const account:IAccount = getCBAccount()
                        const api = new CBAPI();

                        // @ts-ignore
                        api.apiQuery = jest.fn(() => Promise.resolve({
                            SessionToken: ""
                        }));

                        try {
                            await api.openSession(account);
                        } catch(e) {
                            expect(e.message).toContain('Can\'t parse session token');
                        }
                    })
                })

                describe('if key SessionToken is not defined', () => {
                    it('Must be throw an error', async () => {
                        expect.assertions(1);

                        const account:IAccount = getCBAccount()
                        const api = new CBAPI();

                        // @ts-ignore
                        api.apiQuery = jest.fn(() => Promise.resolve({
                            SomeObject: [ "some data" ]
                        }));

                        try {
                            await api.openSession(account);
                        } catch(e) {
                            expect(e.message).toContain('Can\'t parse session token');
                        }
                    })
                })
            })

            describe('Undefined error', () => {
                it('Catching an undefined error', async () => {
                    expect.assertions(1);

                    const account:IAccount = getCBAccount()
                    const api = new CBAPI();

                    // @ts-ignore
                    api.apiQuery = jest.fn(() => Promise.reject(new Error('Some error')));

                    try {
                        await api.openSession(account);
                    } catch(e) {
                        expect(e).not.toBeUndefined();
                    }
                })
            })
        })
    })
})

describe('getResumeList()', () => {

    const getCBAccount = (proxy = "http://141.98.235.125:10012",
                          session = "ddafb0de1ce8ccccaccce9db8fb716d8-888888888-AS-4") => {

        const account = new Account(<AccountBuilder> {});

        account.getProxy = jest.fn( () => Promise.resolve(proxy) );
        account.getSession = jest.fn( () => Promise.resolve(session) );

        return account;
    }

    describe('The method apiQuery() calling', () => {
        it('Must be call 1 time', async () => {
            expect.assertions(1);

            const account:IAccount = getCBAccount()
            const api = new CBAPI();
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

            // @ts-ignore
            api.apiQuery = jest.fn();

            try {
                await api.getResumeList(task, account);
            } catch {
                // some error
            }

            // @ts-ignore
            expect(api.apiQuery).toHaveBeenCalledTimes(1);
        })

        it('Check amount of arguments must be equals to 3', async () => {
            expect.assertions(1);

            const testProxy = 'http://1.1.1.1:1080';

            const account:IAccount = getCBAccount(testProxy)
            const api = new CBAPI();
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

            // @ts-ignore
            api.apiQuery = jest.fn();

            try {
                await api.getResumeList(task, account);
            } catch {
                // some error
            }

            // @ts-ignore
            expect(api.apiQuery.mock.calls[0].length).toBe(3);
        })

        describe('Check arguments of apiQuery()', () => {
            it('...function name', async () => {
                expect.assertions(1);

                const testProxy = 'http://1.1.1.1:1080';

                const account:IAccount = getCBAccount(testProxy)
                const api = new CBAPI();
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

                // @ts-ignore
                api.apiQuery = jest.fn();

                try {
                    await api.getResumeList(task, account);
                } catch {
                    // some error
                }

                // @ts-ignore
                expect(api.apiQuery.mock.calls[0][0]).toBe('V2_AdvancedResumeSearch');
            })

            it('...packet', async () => {
                expect.assertions(1);

                const testProxy = 'http://1.1.1.1:1080';

                const account:IAccount = getCBAccount(testProxy)
                const api = new CBAPI();
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

                // @ts-ignore
                api.apiQuery = jest.fn();

                try {
                    await api.getResumeList(task, account);
                } catch {
                    // some error
                }

                // @ts-ignore
                expect(api.apiQuery.mock.calls[0][1]).toMatchSnapshot()
            })

            it('...proxy', async () => {
                expect.assertions(1);

                const testProxy = 'http://1.1.1.1:1080';

                const account:IAccount = getCBAccount(testProxy)
                const api = new CBAPI();
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

                // @ts-ignore
                api.apiQuery = jest.fn();

                try {
                    await api.getResumeList(task, account);
                } catch {
                    // some error
                }

                // @ts-ignore
                expect(api.apiQuery.mock.calls[0][2]).toBe(testProxy);
            })
        })
    })

    describe('if success', () => {
        it('to match a snapshot', async () => {
            expect.assertions(1);

            const account:IAccount = getCBAccount()
            const api = new CBAPI();
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

            // @ts-ignore
            api.apiQuery = jest.fn(() => Promise.resolve({
                Results: [
                    {
                        ResumeResultItem_V3: [
                            { ResumeID: [ "RCM21S71GP8GHG6ZFJZ" ] },
                            { ResumeID: [ "RD85NS6L588R28B6MRL" ] },
                            { ResumeID: [ "RD77YZ6WHX5CPSVBMTM" ] },
                            { ResumeID: [ "RCM48K62Q80CDHHPSW3" ] },
                            { ResumeID: [ "RD72ZC6LR31MF69KR86" ] },
                            { ResumeID: [ "RDH54467TMSC4TF3ZQL" ] },
                            { ResumeID: [ "R2N0TM6TK76083X3L5F" ] },
                            { ResumeID: [ "R2Z1JL6YB8XGVFG1KYM" ] },
                            { ResumeID: [ "RDF5MM6MSLD3TF2D067" ] },
                            { ResumeID: [ "RCM8HZ68FJSJS1VCW67" ] }
                        ]
                    }
                ],
                PageNumber: [ "1" ],
                MaxPage: [ "45" ]
            }));

            const result = await api.getResumeList(task, account);

            expect(result).toMatchSnapshot();
        })

        it('An empty resumes result does not throw an exception?', async () => {
            expect.assertions(1);

            const account:IAccount = getCBAccount()
            const api = new CBAPI();
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

            // @ts-ignore
            api.apiQuery = jest.fn(() => Promise.resolve({
                Results: [
                    {
                        ResumeResultItem_V3: [ ]
                    }
                ],
                PageNumber: [ "1" ],
                MaxPage: [ "1" ]
            }));

            const result = await api.getResumeList(task, account);
            expect(result).toMatchObject({maxPage: 1, page: 1, resumes: []});
        })

        describe('calling Account.successProcessed()', () => {
            it('Calling one time?', async () => {
                const account:IAccount = getCBAccount()
                const api = new CBAPI();
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

                // @ts-ignore
                api.apiQuery = jest.fn(() => Promise.resolve({
                    Results: [
                        {
                            ResumeResultItem_V3: [
                                { ResumeID: [ "RCM21S71GP8GHG6ZFJZ" ] },
                                { ResumeID: [ "RD85NS6L588R28B6MRL" ] },
                                { ResumeID: [ "RD77YZ6WHX5CPSVBMTM" ] },
                                { ResumeID: [ "RCM48K62Q80CDHHPSW3" ] },
                                { ResumeID: [ "RD72ZC6LR31MF69KR86" ] },
                                { ResumeID: [ "RDH54467TMSC4TF3ZQL" ] },
                                { ResumeID: [ "R2N0TM6TK76083X3L5F" ] },
                                { ResumeID: [ "R2Z1JL6YB8XGVFG1KYM" ] },
                                { ResumeID: [ "RDF5MM6MSLD3TF2D067" ] },
                                { ResumeID: [ "RCM8HZ68FJSJS1VCW67" ] }
                            ]
                        }
                    ],
                    PageNumber: [ "1" ],
                    MaxPage: [ "45" ]
                }));

                await api.getResumeList(task, account);

                // @ts-ignore
                expect(account.successProcessed.mock.calls.length).toBe(1);
            })

            it('...with option resumeParsed = false?', async () => {
                const account:IAccount = getCBAccount()
                const api = new CBAPI();
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

                // @ts-ignore
                api.apiQuery = jest.fn(() => Promise.resolve({
                    Results: [
                        {
                            ResumeResultItem_V3: [
                                { ResumeID: [ "RCM21S71GP8GHG6ZFJZ" ] },
                                { ResumeID: [ "RD85NS6L588R28B6MRL" ] },
                                { ResumeID: [ "RD77YZ6WHX5CPSVBMTM" ] },
                                { ResumeID: [ "RCM48K62Q80CDHHPSW3" ] },
                                { ResumeID: [ "RD72ZC6LR31MF69KR86" ] },
                                { ResumeID: [ "RDH54467TMSC4TF3ZQL" ] },
                                { ResumeID: [ "R2N0TM6TK76083X3L5F" ] },
                                { ResumeID: [ "R2Z1JL6YB8XGVFG1KYM" ] },
                                { ResumeID: [ "RDF5MM6MSLD3TF2D067" ] },
                                { ResumeID: [ "RCM8HZ68FJSJS1VCW67" ] }
                            ]
                        }
                    ],
                    PageNumber: [ "1" ],
                    MaxPage: [ "45" ]
                }));

                await api.getResumeList(task, account);

                // @ts-ignore
                expect(account.successProcessed.mock.calls[0][0]).toBe(false);
            })
        })
    })

    describe('if error', () => {
        it('if openSession() throw an error - Account.gotError() must was not called', async () => {
            expect.assertions(3);

            const account = new Account(<AccountBuilder> {});

            const api = new CBAPI();
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

            // @ts-ignore
            account.getSession = jest.fn(() => Promise.reject(someError));

            // @ts-ignore
            api.apiQuery = jest.fn();

            // @ts-ignore
            account.gotError = jest.fn();

            try {
                await api.getResumeList(task, account);
            } catch {
                // @ts-ignore
                expect(account.getSession.mock.calls.length).toBe(1);

                // @ts-ignore
                expect(api.apiQuery.mock.calls.length).toBe(0);

                // @ts-ignore
                expect(account.gotError.mock.calls.length).toBe(0);
            }
        })

        describe('If got wrong task type', () => {
            it('Throws an error (with specific error message)?', async () => {
                expect.assertions(1);

                const account:IAccount = getCBAccount()
                const api = new CBAPI();
                const task:TaskFormat = {
                    data: {
                        kind: 'resume',
                        resumeID: "R2Z6X65W00000003C44"
                    }
                };

                // @ts-ignore
                api.apiQuery = jest.fn();

                try {
                    await api.getResumeList(task, account);
                } catch (e) {
                    expect(e.message).toMatch('getResumeList() got not a branch task');
                }
            })

            it('Does not run the apiQuery()?', async () => {
                expect.assertions(1);

                const account:IAccount = getCBAccount()
                const api = new CBAPI();
                const task:TaskFormat = {
                    data: {
                        kind: 'resume',
                        resumeID: "R2Z6X65W00000003C44"
                    }
                };

                // @ts-ignore
                api.apiQuery = jest.fn();

                try {
                    await api.getResumeList(task, account);
                } catch {
                    // some error
                }

                // @ts-ignore
                expect(api.apiQuery.mock.calls.length).toBe(0);
            })

            it('Does not run Account.gotError()?', async () => {
                expect.assertions(1);

                const account:IAccount = getCBAccount()
                const api = new CBAPI();
                const task:TaskFormat = {
                    data: {
                        kind: 'resume',
                        resumeID: "R2Z6X65W00000003C44"
                    }
                };

                // @ts-ignore
                api.apiQuery = jest.fn();

                try {
                    await api.getResumeList(task, account);
                } catch {
                    // some error
                }

                // @ts-ignore
                expect(account.gotError.mock.calls.length).toBe(0);
            })
        })

        describe('In the return of the method apiQuery()', () => {
            it('Will the Account.gotError() be called 1 time?', async () => {
                expect.assertions(1);

                const account:IAccount = getCBAccount()
                const api = new CBAPI();
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

                const error = new Error('Some error');

                // @ts-ignore
                api.apiQuery = jest.fn(() => Promise.reject(error));

                try {
                    await api.getResumeList(task, account);
                } catch(e) {
                    // @ts-ignore
                    expect(account.gotError.mock.calls.length).toBe(1);
                }
            })

            describe('Throwing an error if gets an invalid format', () => {
                it('...without "PageNumber" (with specific error message)?', async () => {
                    expect.assertions(1);

                    const account:IAccount = getCBAccount()
                    const api = new CBAPI();
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

                    // @ts-ignore
                    api.apiQuery = jest.fn(() => Promise.resolve({
                        Results: [
                            {
                                ResumeResultItem_V3: [
                                    { ResumeID: [ "RCM21S71GP8GHG6ZFJZ" ] },
                                    { ResumeID: [ "RD85NS6L588R28B6MRL" ] },
                                    { ResumeID: [ "RD77YZ6WHX5CPSVBMTM" ] },
                                    { ResumeID: [ "RCM48K62Q80CDHHPSW3" ] },
                                    { ResumeID: [ "RD72ZC6LR31MF69KR86" ] },
                                    { ResumeID: [ "RDH54467TMSC4TF3ZQL" ] },
                                    { ResumeID: [ "R2N0TM6TK76083X3L5F" ] },
                                    { ResumeID: [ "R2Z1JL6YB8XGVFG1KYM" ] },
                                    { ResumeID: [ "RDF5MM6MSLD3TF2D067" ] },
                                    { ResumeID: [ "RCM8HZ68FJSJS1VCW67" ] }
                                ]
                            }
                        ],
                        MaxPage: [ "45" ]
                    }));

                    try {
                        await api.getResumeList(task, account);
                    } catch(e) {
                        expect(e.message).toMatch('Can\'t parse resume listing data');
                    }
                })

                it('...without "ResumeResultItem_V3" (with specific error message)?', async () => {
                    expect.assertions(1);

                    const account:IAccount = getCBAccount()
                    const api = new CBAPI();
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

                    // @ts-ignore
                    api.apiQuery = jest.fn(() => Promise.resolve({
                        Results: [
                            {
                                SomeArray: [
                                    { ResumeID: [ "RCM21S71GP8GHG6ZFJZ" ] },
                                    { ResumeID: [ "RD85NS6L588R28B6MRL" ] },
                                    { ResumeID: [ "RD77YZ6WHX5CPSVBMTM" ] },
                                    { ResumeID: [ "RCM48K62Q80CDHHPSW3" ] },
                                    { ResumeID: [ "RD72ZC6LR31MF69KR86" ] },
                                    { ResumeID: [ "RDH54467TMSC4TF3ZQL" ] },
                                    { ResumeID: [ "R2N0TM6TK76083X3L5F" ] },
                                    { ResumeID: [ "R2Z1JL6YB8XGVFG1KYM" ] },
                                    { ResumeID: [ "RDF5MM6MSLD3TF2D067" ] },
                                    { ResumeID: [ "RCM8HZ68FJSJS1VCW67" ] }
                                ]
                            }
                        ],
                        PageNumber: [ "1" ],
                        MaxPage: [ "45" ]
                    }));

                    try {
                        await api.getResumeList(task, account);
                    } catch(e) {
                        expect(e.message).toContain('is not iterable');
                    }
                })

                it('...without "Results" (with specific error message)?', async () => {
                    expect.assertions(1);

                    const account:IAccount = getCBAccount()
                    const api = new CBAPI();
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

                    // @ts-ignore
                    api.apiQuery = jest.fn(() => Promise.resolve({
                        PageNumber: [ "1" ],
                        MaxPage: [ "45" ]
                    }));

                    try {
                        await api.getResumeList(task, account);
                    } catch(e) {
                        expect(e.message).toMatch('Can\'t parse resume listing data');
                    }
                })
            })
        })
    })
})

describe('getResume()', () => {

    const getCBAccount = (proxy = "http://141.98.235.125:10012",
                          session = "ddafb0de1ce845c5a4cce9db8fb716d8-888888888-AS-4") => {

        const account = new Account(<AccountBuilder> {});

        account.getProxy = jest.fn( () => Promise.resolve(proxy) );
        account.getSession = jest.fn( () => Promise.resolve(session) );
        account.getCustAccCode = jest.fn(() => "CA101");

        return account;
    }

    describe('The method apiQuery() calling', () => {
        it('Must be call 1 time', async () => {
            expect.assertions(1);

            const account:IAccount = getCBAccount()
            const api = new CBAPI();
            const task:TaskFormat = {
                data: {
                    kind: 'resume',
                    resumeID: "R2Z6X65W00000003C44"
                }
            };

            // @ts-ignore
            api.apiQuery = jest.fn();

            try {
                await api.getResume(task, account);
            } catch {
                // some error
            }

            // @ts-ignore
            expect(api.apiQuery).toHaveBeenCalledTimes(1);
        })

        it('Check amount of arguments must be equals to 3', async () => {
            expect.assertions(1);

            const account:IAccount = getCBAccount()
            const api = new CBAPI();
            const task:TaskFormat = {
                data: {
                    kind: 'resume',
                    resumeID: "R2Z6X65W00000003C44"
                }
            };

            // @ts-ignore
            api.apiQuery = jest.fn();

            try {
                await api.getResume(task, account);
            } catch {
                // some error
            }

            // @ts-ignore
            expect(api.apiQuery.mock.calls[0].length).toBe(3);
        })

        describe('Check arguments of apiQuery()', () => {
            it('...function name', async () => {
                expect.assertions(1);

                const testProxy = 'http://1.1.1.1:1080';

                const account:IAccount = getCBAccount(testProxy)
                const api = new CBAPI();
                const task:TaskFormat = {
                    data: {
                        kind: 'resume',
                        resumeID: "R2Z6X65W00000003C44"
                    }
                };

                // @ts-ignore
                api.apiQuery = jest.fn();

                try {
                    await api.getResume(task, account);
                } catch {
                    // some error
                }

                // @ts-ignore
                expect(api.apiQuery.mock.calls[0][0]).toBe('V2_GetResume');
            })

            it('...packet (to match snapshot)', async () => {
                expect.assertions(1);

                const testProxy = 'http://1.1.1.1:1080';

                const account:IAccount = getCBAccount(testProxy)
                const api = new CBAPI();
                const task:TaskFormat = {
                    data: {
                        kind: 'resume',
                        resumeID: "R2Z6X65W00000003C44"
                    }
                };

                // @ts-ignore
                api.apiQuery = jest.fn();

                try {
                    await api.getResume(task, account);
                } catch {
                    // some error
                }

                // @ts-ignore
                expect(api.apiQuery.mock.calls[0][1]).toMatchSnapshot();
            })

            it('...proxy', async () => {
                expect.assertions(1);

                const testProxy = 'http://1.1.1.1:1080';

                const account:IAccount = getCBAccount(testProxy)
                const api = new CBAPI();
                const task:TaskFormat = {
                    data: {
                        kind: 'resume',
                        resumeID: "R2Z6X65W00000003C44"
                    }
                };

                // @ts-ignore
                api.apiQuery = jest.fn();

                try {
                    await api.getResume(task, account);
                } catch {
                    // some error
                }

                // @ts-ignore
                expect(api.apiQuery.mock.calls[0][2]).toBe(testProxy);
            })
        })
    })

    describe('if success', () => {
        it('if got a good CV format', async () => {
            const account:IAccount = getCBAccount()
            const api = new CBAPI();
            const task:TaskFormat = {
                data: {
                    kind: 'resume',
                    resumeID: "R2Z6X65W00000003C44"
                }
            };

            // @ts-ignore
            api.apiQuery = jest.fn(() => Promise.resolve({
                HomeLocation: [
                    {
                        City: [ "Atlanta" ],
                        State: [ "GA" ]
                    }
                ],
                ContactEmail: [ "csolomon_homes@yahoo.com" ],
                ContactName: [ "Collin Solomon" ]
            }));

            const result = await api.getResume(task, account);

            expect(result).toMatchSnapshot();
        })

        it('Will the Account.successProcessed() be called at the end?', async () => {
            const account:IAccount = getCBAccount()
            const api = new CBAPI();
            const task:TaskFormat = {
                data: {
                    kind: 'resume',
                    resumeID: "R2Z6X65W00000003C44"
                }
            };

            // @ts-ignore
            api.apiQuery = jest.fn(() => Promise.resolve({
                HomeLocation: [
                    {
                        City: [ "Atlanta" ],
                        State: [ "GA" ]
                    }
                ],
                ContactEmail: [ "csolomon_homes@yahoo.com" ],
                ContactName: [ "Collin Solomon" ]
            }));

            await api.getResume(task, account);

            // @ts-ignore
            expect(account.successProcessed.mock.calls.length).toBe(1);
        })
    })

    describe('if error', () => {

        it('if openSession() throw an error - Account.gotError() must was not called', async () => {
            expect.assertions(3);
            const account:IAccount = getCBAccount()
            const api = new CBAPI();
            const task:TaskFormat = {
                data: {
                    kind: 'resume',
                    resumeID: "R2Z6X65W00000003C44"
                }
            };

            const error = new Error('Some error');

            // @ts-ignore
            account.getSession = jest.fn(() => Promise.reject(error));

            // @ts-ignore
            api.apiQuery = jest.fn();

            // @ts-ignore
            account.gotError = jest.fn();

            try {
                await api.getResume(task, account);
            } catch {
                // @ts-ignore
                expect(account.getSession.mock.calls.length).toBe(1);

                // @ts-ignore
                expect(api.apiQuery.mock.calls.length).toBe(0);

                // @ts-ignore
                expect(account.gotError.mock.calls.length).toBe(0);
            }
        })

        describe('In the return of the method apiQuery()', () => {
            it('Will the Account.gotError() be called?', async () => {
                expect.assertions(1);
                const account:IAccount = getCBAccount()
                const api = new CBAPI();
                const task:TaskFormat = {
                    data: {
                        kind: 'resume',
                        resumeID: "R2Z6X65W00000003C44"
                    }
                };

                const error = new Error('Some error');

                // @ts-ignore
                api.apiQuery = jest.fn(() => Promise.reject(error));

                try {
                    await api.getResume(task, account);
                } catch {
                    // some error
                }

                // @ts-ignore
                expect(account.gotError.mock.calls.length).toBe(1);
            })

            it('Throwing an error if the resume format is invalid (with specific error message)?', async () => {
                expect.assertions(1);

                const account:IAccount = getCBAccount()
                const api = new CBAPI();
                const task:TaskFormat = {
                    data: {
                        kind: 'resume',
                        resumeID: "R2Z6X65W00000003C44"
                    }
                };

                // @ts-ignore
                api.apiQuery = jest.fn(() => Promise.resolve({
                    HomeLocation: [
                        {
                            City: [ "Atlanta" ]
                        }
                    ],
                    ContactEmail: [ "csolomon_holmes@msn.com" ],
                    ContactName: [ "Colin Solomon" ]
                }));

                try {
                    await api.getResume(task, account);
                } catch(e) {
                    expect(e.message).toContain(`Can't parse the resume`);
                }
            })
        })

        describe('If got wrong task type', () => {
            it('Throws an error (with specific error message)?', async () => {
                expect.assertions(1);

                const account:IAccount = getCBAccount()
                const api = new CBAPI();
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

                try {
                    await api.getResume(task, account);
                } catch(e) {
                    expect(e.message).toMatch('getResume() got not a resume task');
                }
            })

            it('Does not run the apiQuery()?', async () => {
                expect.assertions(1);

                const account:IAccount = getCBAccount()
                const api = new CBAPI();
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

                //@ts-ignore
                api.apiQuery = jest.fn();

                try {
                    await api.getResume(task, account);
                } catch {
                    // empty
                }

                //@ts-ignore
                expect(api.apiQuery.mock.calls.length).toBe(0);
            })

            it('Does not run Account.gotError()?', async () => {
                expect.assertions(1);

                const account:IAccount = getCBAccount()
                const api = new CBAPI();
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

                try {
                    await api.getResume(task, account);
                } catch {
                    // empty
                }

                //@ts-ignore
                expect(account.gotError.mock.calls.length).toBe(0);
            })
        })
    })
})
