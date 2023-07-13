import moment from "moment";
import numeral from "numeral";

import { frequencyList } from "@constants/data/DuitNowRPP";
import { RTP_ONLINE_BANKING, DUINTNOW_IMAGE } from "@constants/strings";

import { formateReferenceNumber } from "@utils/dataModel/utility";

export function getRTPParams(resp, params) {
    const idValue = resp?.cdtrAcct;
    const idCode = resp?.cdtrAcctType;

    const formattedAmount = numeral(Math.abs(resp?.intrBkSttlmAmt)).format("0,0.00");
    const transactionId = resp?.txId;
    const senderName = resp?.creditorName?.substring(0, 21);
    const senderName2 = resp?.creditorName;
    const expiryDate = resp?.xpryDt;
    const redirectUrl = resp?.redURL;
    const redirectSignature = resp?.endToEndIdSignature;
    const fullRedirectUrl = redirectUrl
        ? `${redirectUrl}?EndtoEndId=${params.EndtoEndId}&EndToEndIdSignature=${redirectSignature}`
        : null;

    const transferParams = {
        requestId: transactionId,
        senderAcct: idValue,
        senderName,
        recipientName: senderName,
        senderAcctType: idCode,
        senderProxyType: idCode,
        senderProxyValue: idValue,
        isSender: true,
        swiftCode: resp?.merchantId ?? "",
        amount: formattedAmount,
        expiryDate: moment(expiryDate).format("DD MMM YYYY"),
        amountEditable: false,
        paymentDesc: resp?.refs2,
        reference: resp?.refs1,
        expiryDateTime: expiryDate,
        coupleIndicator: false,
        refundIndicator: false,
        title: `${senderName2} requested RM ${formattedAmount} from you.`,
        highlightText: formattedAmount,
        requestedAmount: formattedAmount,
        rtpRequest: true,
        transferFlow: 26,
        isMaybankTransfer: false,
        transferOtherBank: true,
        imageBase64: true,
        minAmount: 1,
        maxAmount: 5000,
        amountError: "Amount should be in between RM 0.01 to \nRM  50,000.00 for Fund Transfer.",
        screenLabel: "Enter amount",
        screenTitle: RTP_ONLINE_BANKING,
        receiptTitle: RTP_ONLINE_BANKING,
        isFutureTransfer: false,
        transferType: "RTP_TRANSFER",
        transferFav: false,
        accHolderName: "",
        idValue,
        idValueFormatted: idValue,
        idTypeText: idCode,
        idType: idCode,
        idCode,
        payeeName: senderName,
        payerName: senderName,
        toAccount: idValue,
        isOnlineBanking: params?.module === "RTP" || params?.module === "Consent",
        isConsentOnlineBanking: params?.module === "Consent",
        isDuitNowOnlineBanking: params?.module === "RTP",
        transactionIdFormatted: formateReferenceNumber(transactionId),
        endToEndId: params?.EndtoEndId,
        merchantId: resp?.merchantId ?? "",
        merchantName: resp?.creditorName2,
        mbbaccountType: idCode ?? "",
        redirectUrl: redirectUrl ?? "",
        redirectSignature: redirectSignature ?? "",
        fullRedirectUrl: fullRedirectUrl ?? "",
        transactionId: formateReferenceNumber(transactionId),

        image: {
            image: DUINTNOW_IMAGE,
            imageName: DUINTNOW_IMAGE,
            imageUrl: DUINTNOW_IMAGE,
            shortName: "icDuitNow",
            type: true,
        },
    };

    if (params?.module === "Consent") {
        transferParams.consentStartDate = "2022-12-17T00:00:00";
        transferParams.consentExpiryDate = "2022-12-30T00:00:00";
        transferParams.consentFrequency = "01";
        transferParams.consentFrequencyText = "Monthly";
        transferParams.consentMaxLimit = "20.00";
        transferParams.hideProduct = true;
        transferParams.autoDebitEnabled = true;
    }
    return transferParams;
}

export function getConsentParams(resp) {
    const freqObj = frequencyList.find((el) => el.code === resp?.freqMode);
    return {
        imageBase64: true,
        minAmount: 1,
        maxAmount: 5000,
        amountError: "Amount should be in between RM 0.01 to \nRM  50,000.00 for Fund Transfer.",
        screenLabel: "Enter amount",
        screenTitle: RTP_ONLINE_BANKING,
        receiptTitle: RTP_ONLINE_BANKING,
        isFutureTransfer: false,
        transferType: "RTP_TRANSFER",
        consentStartDate: resp?.effctvDt,
        consentExpiryDate: resp?.xpryDt,
        consentFrequency: resp?.freqMode,
        consentFrequencyText: freqObj?.name,
        consentMaxLimit: resp?.maxAmount,
        hideProduct: true,
        autoDebitEnabled: true,
        creditorName: resp?.merchntName,
        debtorName: resp?.dbtrName,
        sourceOfFunds: resp?.cdtrSourceOfFunds?.join(""),
        consentSts: "ACTV",
        debtorScndVal: "",
        debtorScndTp: "",
        debtorVal: resp?.debtorVal,
        debtorTp: resp?.debtorTp,
        debtorAcctNum: resp?.debtorTp,
        debtorAcctType: resp?.debtorTp,
        debtorAcctName: resp?.debtorTp,
        consentId: resp?.consentId,
        canTrmByDebtor: resp?.canTrmByDbtr === "true",
        amount: resp?.maxAmount,
        consentTp: resp?.consentTp,
        expiryDateTime: resp?.xpryDt,
        refs1: resp?.refs1,
        reference: resp?.refs1,
        reserved1: resp?.reserved1,
        merchantId: resp?.merchntId,
        isOnlineBanking: true,
        isConsentOnlineBanking: true,
        isDuitNowOnlineBanking: false,

        image: {
            image: DUINTNOW_IMAGE,
            imageName: DUINTNOW_IMAGE,
            imageUrl: DUINTNOW_IMAGE,
            shortName: "Test",
            type: true,
        },
    };
}

export function getRouteParams({ result, flow, secure2uValidateData, params }) {
    const transferParams =
        params?.module === "RTP" ? getRTPParams(result, params) : getConsentParams(result);

    return {
        transferParams,
        secure2uValidateData,
        flow,
        festiveFlag: false,
        festiveObj: {},
        isOnlineBanking: params?.module === "RTP" || params?.module === "Consent",
        isConsentOnlineBanking: params?.module === "Consent",
        isDuitNowOnlineBanking: params?.module === "RTP",
        soleProp: "",
        rtpType: "",
        isRtdEnabled: "",
    };
}
