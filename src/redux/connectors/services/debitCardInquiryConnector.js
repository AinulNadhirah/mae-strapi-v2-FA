import { connect } from "react-redux";

import { DEBIT_CARD_CLEAR_PIN } from "@redux/actions/ZestCASA/debitCardPinAction";
import { debitCardInquiry } from "@redux/services/apiDebitCardInquiry";

const mapStateToProps = function (state) {
    const { debitCardInquiryReducer } = state;

    return {
        dateTime: debitCardInquiryReducer?.dateTime,
        debitCardNumber: debitCardInquiryReducer?.debitCardNumber,
        debtCardNxtAct: debitCardInquiryReducer?.debtCardNxtAct,
        debtCardSt: debitCardInquiryReducer?.debtCardSt,
        expYr: debitCardInquiryReducer?.expYr,
        msgTypeId: debitCardInquiryReducer?.msgTypeId,
        ovrSeasFlg: debitCardInquiryReducer?.ovrSeasFlg,
        ovrSeasFlgEndDt: debitCardInquiryReducer?.ovrSeasFlgEndDt,
        ovrSeasFlgStDt: debitCardInquiryReducer?.ovrSeasFlgStDt,
        primBitmap: debitCardInquiryReducer?.primBitmap,
        resrvFld: debitCardInquiryReducer?.resrvFld,
        sysAuditTrailNo: debitCardInquiryReducer?.sysAuditTrailNo,
        termId: debitCardInquiryReducer?.termId,
        dest: debitCardInquiryReducer?.dest,
        envRegion: debitCardInquiryReducer?.envRegion,
        hostStatusCode: debitCardInquiryReducer?.hostStatusCode,
        hostStatusDesc: debitCardInquiryReducer?.hostStatusDesc,
        loginId: debitCardInquiryReducer?.loginId,
        pAN: debitCardInquiryReducer?.pAN,
        paginationKey: debitCardInquiryReducer?.paginationKey,
        patType: debitCardInquiryReducer?.patType,
        recLength: debitCardInquiryReducer?.recLength,
        recNo: debitCardInquiryReducer?.recNo,
        source: debitCardInquiryReducer?.source,
        sourceID: debitCardInquiryReducer?.sourceID,
        statusCode: debitCardInquiryReducer?.statusCode,
        statusDesc: debitCardInquiryReducer?.statusDesc,
        svcName: debitCardInquiryReducer?.svcName,
        sysStat: debitCardInquiryReducer?.sysStat,
        txnCode: debitCardInquiryReducer?.txnCode,
        txnDt: debitCardInquiryReducer?.txnDt,
        txnTime: debitCardInquiryReducer?.txnTime,
        txnType: debitCardInquiryReducer?.txnType,
        debitCardName: debitCardInquiryReducer?.debitCardName,
    };
};

const mapDispatchToProps = (dispatch) => {
    return {
        debitCardInquiry: (data, callback) => dispatch(debitCardInquiry(data, callback)),
        debitCardClearAll: () => dispatch({ type: DEBIT_CARD_CLEAR_PIN }),
    };
};

const debitCardInquiryProps = connect(mapStateToProps, mapDispatchToProps);
export default debitCardInquiryProps;
