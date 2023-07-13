import { showErrorToast } from "@components/Toast";

import { debitCardInquiryService } from "@services/apiServicePremier";

import {
    DEBIT_CARD_INQUIRY_LOADING,
    DEBIT_CARD_INQUIRY_SUCCESS,
    DEBIT_CARD_INQUIRY_ERROR
} from "@redux/actions/services/debitCardInquiryAction";

import { COMMON_ERROR_MSG } from "@constants/strings";

export const debitCardInquiry = (dataReducer, callback) => {
    return async (dispatch) => {
        dispatch({ type: DEBIT_CARD_INQUIRY_LOADING });
        const successStatusCodes = ["0000", "0", "200"];
        try {
            const response = await debitCardInquiryService(dataReducer);
            const result = response?.result;
            const msgBody = result?.Msg?.MsgBody;
            const msgHeader = result?.Msg?.MsgHdr;
            const debitCardNumber = msgBody?.DebtCardNo;
            const debtCardNxtAct = msgBody?.DebtCardNxtAct;
            const statusCode = msgHeader?.StatusCode;
            const statusDesc = msgHeader?.StatusDesc;
            const debitCardName = checkCardProviderType(debitCardNumber);

            if (successStatusCodes.includes(statusCode) && result) {
                dispatch({
                    type: DEBIT_CARD_INQUIRY_SUCCESS,
                    data: result,
                    msgBody: result?.Msg?.MsgBody,
                    msgHeader: result?.Msg?.MsgHdr,
                    dateTime: msgBody?.DateTime,
                    debitCardNumber: msgBody?.DebtCardNo,
                    debtCardNxtAct: msgBody?.DebtCardNxtAct,
                    debtCardSt: msgBody?.DebtCardSt,
                    expYr: msgBody?.ExpYr,
                    msgTypeId: msgBody?.MsgTypeId,
                    ovrSeasFlg: msgBody?.OvrSeasFlg,
                    ovrSeasFlgEndDt: msgBody?.OvrSeasFlgEndDt,
                    ovrSeasFlgStDt: msgBody?.OvrSeasFlgStDt,
                    primBitmap: msgBody?.PrimBitmap,
                    resrvFld: msgBody?.ResrvFld,
                    sysAuditTrailNo: msgBody?.SysAuditTrailNo,
                    termId: msgBody?.TermId,
                    dest: msgHeader?.Dest,
                    envRegion: msgHeader?.EnvRegion,
                    hostStatusCode: msgHeader?.HostStatusCode,
                    hostStatusDesc: msgHeader?.HostStatusDesc,
                    loginId: msgHeader?.LoginId,
                    pAN: msgHeader?.PAN,
                    paginationKey: msgHeader?.PaginationKey,
                    patType: msgHeader?.PatType,
                    recLength: msgHeader?.RecLength,
                    recNo: msgHeader?.RecNo,
                    source: msgHeader?.Source,
                    sourceID: msgHeader?.SourceID,
                    statusCode: msgHeader?.StatusCode,
                    statusDesc: msgHeader?.StatusDesc,
                    svcName: msgHeader?.SvcName,
                    sysStat: msgHeader?.SysStat,
                    txnCode: msgHeader?.TxnCode,
                    txnDt: msgHeader?.TxnDt,
                    txnTime: msgHeader?.TxnTime,
                    txnType: msgHeader?.TxnType,
                    debitCardName,
                });
                if (callback) {
                    callback(result, debtCardNxtAct);
                }
            } else {
                showErrorToast({
                    message: statusDesc || COMMON_ERROR_MSG,
                });
                dispatch({
                    type: DEBIT_CARD_INQUIRY_ERROR,
                    error: statusDesc ?? COMMON_ERROR_MSG,
                });
            }
        } catch (error) {
            console.log("[Premier][debitCardInquiry] >> Failure2");
            const errorFromMAE = error?.error;
            if (callback) {
                callback(null, errorFromMAE);
            }
            dispatch({ type: DEBIT_CARD_INQUIRY_ERROR, error });
        }
    };
};

const checkCardProviderType = (number) => {
    const provider = number.charAt(0);

    if (provider === 5) return "Maybank MasterCard Debit";
    if (provider === 4) return "Maybank Visa Debit Card";
    if (provider === 3) return "Maybank Amex Debit Card";

    return "";
};
