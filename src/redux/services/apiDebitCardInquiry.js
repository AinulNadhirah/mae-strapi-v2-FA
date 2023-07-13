import { showErrorToast } from "@components/Toast";

import { debitCardInquiryService } from "@services/apiServiceZestCASA";

import {
    DEBIT_CARD_INQUIRY_LOADING,
    DEBIT_CARD_INQUIRY_SUCCESS,
    DEBIT_CARD_INQUIRY_ERROR,
} from "@redux/actions/services/debitCardInquiryAction";

import { COMMON_ERROR_MSG } from "@constants/strings";

export const debitCardInquiry = (dataReducer, callback) => {
    return async (dispatch) => {
        dispatch({ type: DEBIT_CARD_INQUIRY_LOADING });
        try {
            const result = await debitCardInquiryService(dataReducer);
            console.log("[ZestCASA][debitCardInquiry] >> Success");
            console.log(result);

            const msgBody = result?.Msg?.MsgBody;
            const msgHeader = result?.Msg?.MsgHdr;

            const dateTime = msgBody?.DateTime;
            const debitCardNumber = msgBody?.DebtCardNo;
            const debtCardNxtAct = msgBody?.DebtCardNxtAct;
            const debtCardSt = msgBody?.DebtCardSt;
            const expYr = msgBody?.ExpYr;
            const msgTypeId = msgBody?.MsgTypeId;
            const ovrSeasFlg = msgBody?.OvrSeasFlg;
            const ovrSeasFlgEndDt = msgBody?.OvrSeasFlgEndDt;
            const ovrSeasFlgStDt = msgBody?.OvrSeasFlgStDt;
            const primBitmap = msgBody?.PrimBitmap;
            const resrvFld = msgBody?.ResrvFld;
            const sysAuditTrailNo = msgBody?.SysAuditTrailNo;
            const termId = msgBody?.TermId;

            const dest = msgHeader?.Dest;
            const envRegion = msgHeader?.EnvRegion;
            const hostStatusCode = msgHeader?.HostStatusCode;
            const hostStatusDesc = msgHeader?.HostStatusDesc;
            const loginId = msgHeader?.LoginId;
            const pAN = msgHeader?.PAN;
            const paginationKey = msgHeader?.PaginationKey;
            const patType = msgHeader?.PatType;
            const recLength = msgHeader?.RecLength;
            const recNo = msgHeader?.RecNo;
            const source = msgHeader?.Source;
            const sourceID = msgHeader?.SourceID;
            const statusCode = msgHeader?.StatusCode;
            const statusDesc = msgHeader?.StatusDesc;
            const svcName = msgHeader?.SvcName;
            const sysStat = msgHeader?.SysStat;
            const txnCode = msgHeader?.TxnCode;
            const txnDt = msgHeader?.TxnDt;
            const txnTime = msgHeader?.TxnTime;
            const txnType = msgHeader?.TxnType;

            const debitCardName = checkCardProviderType(debitCardNumber);

            if ((statusCode === "0000" || statusCode === "0" || statusCode === "200") && result) {
                dispatch({
                    type: DEBIT_CARD_INQUIRY_SUCCESS,
                    data: result,
                    msgBody: msgBody,
                    msgHeader: msgHeader,
                    dateTime: dateTime,
                    debitCardNumber: debitCardNumber,
                    debtCardNxtAct: debtCardNxtAct,
                    debtCardSt: debtCardSt,
                    expYr: expYr,
                    msgTypeId: msgTypeId,
                    ovrSeasFlg: ovrSeasFlg,
                    ovrSeasFlgEndDt: ovrSeasFlgEndDt,
                    ovrSeasFlgStDt: ovrSeasFlgStDt,
                    primBitmap: primBitmap,
                    resrvFld: resrvFld,
                    sysAuditTrailNo: sysAuditTrailNo,
                    termId: termId,
                    dest: dest,
                    envRegion: envRegion,
                    hostStatusCode: hostStatusCode,
                    hostStatusDesc: hostStatusDesc,
                    loginId: loginId,
                    pAN: pAN,
                    paginationKey: paginationKey,
                    patType: patType,
                    recLength: recLength,
                    recNo: recNo,
                    source: source,
                    sourceID: sourceID,
                    statusCode: statusCode,
                    statusDesc: statusDesc,
                    svcName: svcName,
                    sysStat: sysStat,
                    txnCode: txnCode,
                    txnDt: txnDt,
                    txnTime: txnTime,
                    txnType: txnType,
                    debitCardName: debitCardName,
                });
                if (callback) {
                    callback(result, debtCardNxtAct);
                }
            } else {
                console.log("[ZestCASA][debitCardInquiry] >> Failure");
                showErrorToast({
                    message: statusDesc || COMMON_ERROR_MSG,
                });
                dispatch({
                    type: DEBIT_CARD_INQUIRY_ERROR,
                    error: statusDesc ?? COMMON_ERROR_MSG,
                });
            }
        } catch (error) {
            console.log("[ZestCASA][debitCardInquiry] >> Failure2");
            const errorFromMAE = error?.error;
            if (callback) {
                callback(null, errorFromMAE);
            }
            dispatch({ type: DEBIT_CARD_INQUIRY_ERROR, error: error });
        }
    };
};

const checkCardProviderType = (number) => {
    let provider = number.charAt(0);

    if (provider == 5) return "Maybank MasterCard Debit";
    if (provider == 4) return "Maybank Visa Debit Card";
    if (provider == 3) return "Maybank Amex Debit Card";

    return;
};
