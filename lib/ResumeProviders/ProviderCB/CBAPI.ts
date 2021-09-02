/*
* Сетевые операции с API */

import fetch from 'node-fetch';
import {HttpsProxyAgent} from 'https-proxy-agent';
import urlencode from 'urlencode';
import * as xml2js from 'xml2js';

import {JoberFormat, TaskFormat} from "../../../common";
import IAccount from "./Interfaces/IAccount";
import ICBAPI from "./Interfaces/ICBAPI";

const isArray = Array.isArray.bind(Array);

// ASYNC wrapper
function parseString(xmlstring:string):Promise<any> {
    return new Promise((resolve, reject) => {
        xml2js.parseString(xmlstring, (err, result) => {
            if (err) {
                reject(err);
            } else {
                resolve(result);
            }
        })
    })
}

export default class CBAPI implements ICBAPI {
    async openSession(account:IAccount):Promise<string> {
        const packet = `<Packet><Email>${account.getLogin()}</Email><Password>${account.getPassword()}</Password></Packet>`;

        let result;
        try {
            result = await this.apiQuery('BeginSessionV2', packet, await account.getProxy());
        } catch (e) {
            account.gotError(e);
            throw e;
        }

        const errorCantParse = new Error('Can\'t parse session token');

        let sessionToken;

        try {
            sessionToken = result.SessionToken[0];
        } catch {
            account.gotError(errorCantParse);
            throw errorCantParse;
        }

        if (!(typeof sessionToken === 'string' && sessionToken.length >= 15)) {
            account.gotError(errorCantParse);
            throw errorCantParse;
        }

        return sessionToken;
    }

    protected async apiQuery(functionName:string, packet:string, proxy:string):Promise<any> {
        const apiurl = `https://ws.careerbuilder.com/resumes/resumes.asmx/${functionName}`;
        const proxyAgent = new HttpsProxyAgent(proxy);

        const result = await fetch(apiurl, {
            agent: proxyAgent,
            method: 'POST',
            body: `Packet=${urlencode(packet)}`,
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            }
        });

        const body = await result.text();

        const serverResponse = await parseString(body);
        const resultString = serverResponse.string._;

        const serverResponseData = await parseString(resultString);
        const respPacket = serverResponseData.Packet;

        let error = null;

        if (isArray(respPacket.Errors)
            && respPacket.Errors.length > 0
            && !(typeof respPacket.Errors[0] === 'string' && !respPacket.Errors[0].trim().length)) {

            error = respPacket.Errors[0];

        } else if (isArray(respPacket.Error)
            && respPacket.Error.length > 0
            && !(typeof respPacket.Error[0] === 'string' && !respPacket.Error[0].trim().length)) {

            error = respPacket.Error[0];
        }

        if (error) {
            if (isArray(error.CBError) && error.CBError.length > 0) {

                const CBError = error.CBError[0];

                if (typeof CBError.Text === 'string') {
                    throw new Error(CBError.Text);
                } else {
                    throw new Error(JSON.stringify(CBError));
                }

            } else {
                if (typeof error === 'string') {
                    throw new Error(error)
                } else {
                    throw new Error(JSON.stringify(error))
                }
            }
        }

        return respPacket;
    }

    async getResumeList(task:TaskFormat, account:IAccount):Promise< {page:number, maxPage:number, resumes: string[]} > {
        if (task.data.kind !== 'branch') {
            throw new Error('getResumeList() got not a branch task');
        }

        const errorFormatResumeListing = new Error('Can\'t parse resume listing data');

        const packet = `
        <Packet>
            <SessionToken>${await account.getSession()}</SessionToken>
            <Keywords>${task.data.keywords}</Keywords>
            <City>${task.data.city}</City>
            <State>${task.data.state}</State>
            <FreshnessInDays>${task.data.freshness}</FreshnessInDays>
            <RemoveDuplicates>True</RemoveDuplicates>
            <OrderBy>-MODIFIEDINT</OrderBy>
            <PageNumber>${task.data.page}</PageNumber>
            <RowsPerPage>${task.data.rowsPerPage}</RowsPerPage>
        </Packet>`;

        let result;
        try {
            result = await this.apiQuery('V2_AdvancedResumeSearch', packet, await account.getProxy());
        } catch (e) {
            account.gotError(e);
            throw e;
        }

        let resumeListing:Array<any> = [];
        try {
            resumeListing = result.Results[0].ResumeResultItem_V3;
        } catch {
            account.gotError(errorFormatResumeListing);
            throw errorFormatResumeListing;
        }

        const resumeIDs:Array<string> = [];

        for (const rawResume of resumeListing) {
            if (isArray(rawResume.ResumeID) && rawResume.ResumeID.length > 0) {

                resumeIDs.push(rawResume.ResumeID[0])
            }
        }

        let parseResult:{
            page: number,
            maxPage: number,
            resumes: string[]
        };

        try {
            parseResult = {
                page: +result.PageNumber[0],
                maxPage: +result.MaxPage[0],
                resumes: resumeIDs
            };
        } catch {
            account.gotError(errorFormatResumeListing);
            throw errorFormatResumeListing;
        }

        account.successProcessed(false);

        return parseResult;
    }

    async getResume(task:TaskFormat, account:IAccount):Promise<JoberFormat> {
        if (task.data.kind !== 'resume') {
            throw new Error('getResume() got not a resume task');
        }

        const packet = `
            <Packet>
                <SessionToken>${await account.getSession()}</SessionToken>
                <ResumeID>${task.data.resumeID}</ResumeID>
                <CustAcctCode>${account.getCustAccCode()}</CustAcctCode>
                <GetWordDocIfAvailable>False</GetWordDocIfAvailable>
            </Packet>`;

        let result;
        try {
            result = await this.apiQuery('V2_GetResume', packet, await account.getProxy());
        } catch (e) {
            account.gotError(e);
            throw e;
        }

        const joberData:JoberFormat = {
            city: "",
            email: "",
            name: "",
            state: ""
        };

        try {
            joberData.city = result.HomeLocation[0].City[0];
            joberData.state = result.HomeLocation[0].State[0];
            joberData.email = result.ContactEmail[0];
            joberData.name = result.ContactName[0];
        } catch {
            const e = new Error(`Can't parse the resume ${task.data.resumeID}`);
            account.gotError(e);
            throw e;
        }

        account.successProcessed();
        return joberData;
    }
}