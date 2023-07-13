import moment from "moment";

import { RTPanalytics } from "@services/analytics/rtpAnalyticsSSL";

import { frequencyList, serviceCodeList } from "@constants/data/DuitNowRPP";
import * as Strings from "@constants/strings";

import { shortText } from "@utils/dataModel/utility";

import Assets from "@assets";

export function mapRTPData(resultList, isPast) {
    const dataList = [];
    for (let i = 0; i < resultList.length; i++) {
        const item = {};
        const trxDate = moment(
            isPast
                ? resultList[i].originalCreationDateTime ?? resultList[i].creationDateTime
                : resultList[i].creationDateTime,
            Strings.DATE_TIME_FORMAT
        ).format(Strings.DATE_TIME_FORMAT_DISPLAY);
        const paydesc = resultList[i]?.paymentDesc ?? resultList[i]?.details ?? "";
        // We need originalData for passback to rtp/action api
        const originalData = { ...resultList[i] };
        if (item) {
            item.requestId = resultList[i]?.bizMessageID ?? resultList[i]?.requestId;

            //sender values
            const senderName = toTitleCase(resultList[i]?.creditorName) ?? "";
            const ogSenderName = resultList[i]?.creditorName ?? "";
            item.senderAcct = resultList[i]?.creditorAccountNumber;
            item.senderName = ogSenderName;
            item.senderAcctType = resultList[i]?.creditorIdType;
            item.senderProxyType = resultList[i]?.creditorIdType;
            item.senderProxyValue = resultList[i]?.creditorAccountNumber;
            item.isSender = !!resultList[i]?.isSender;

            //creditor values
            const receiverName = toTitleCase(resultList[i]?.debtorName) ?? "";
            const ogSeceiverName = resultList[i]?.debtorName ?? "";
            item.receiverName = ogSeceiverName;
            item.receiverAcct = resultList[i]?.debtorAccountNumber;
            item.receiverAcctType = resultList[i]?.debtorIdType;
            item.receiverProxyType = resultList[i]?.debtorIdType;
            item.receiverProxyValue = resultList[i]?.debtorAccountNumber;
            item.swiftCode = resultList[i]?.debtorBankSwiftCode;
            item.pan = resultList[i]?.pan ?? null;
            item.bankName = resultList[i]?.bankName ?? null;
            item.trxRefId = resultList[i]?.trxRefId ?? null;
            item.formattedTxnRefId = resultList[i]?.formattedTxnRefId ?? null;
            item.amount = resultList[i]?.transactionAmount;
            item.note = resultList[i]?.note ?? null;
            item.trxDate = trxDate;
            item.expiryDate = resultList[i]?.expiryDateTime;
            item.amountEditable = resultList[i]?.amountEditable !== "True";
            item.paymentDesc = !paydesc || paydesc === "NA" || paydesc === "N/A" ? null : paydesc;
            item.reference = resultList[i]?.reference ?? "";
            item.status = resultList[i]?.requestStatus;
            item.requestType = resultList[i]?.requestType;
            item.firstPartyPayeeIndicator = resultList[i]?.firstPartyPaymentValidationIndicator;
            item.sourceOfFunds =
                resultList[i]?.sourceOfFunds ?? resultList[i]?.acceptableSourceOfFunds;
            item.expiryDateTime = resultList[i]?.expiryDateTime;
            item.merchantId = resultList[i]?.merchantId ?? null;
            item.productId = resultList[i]?.productId ?? null;
            item.consentStartDate = resultList[i]?.directDebitConsentEffectiveDate ?? null;
            item.consentExpiryDate = resultList[i]?.directDebitConsentExpiryDate ?? null;
            item.consentFrequency = resultList[i]?.directDebitConsentFrequencyMode ?? null;
            item.consentMaxLimit = resultList[i]?.directDebitConsentMaxAmount ?? null;
            item.challengeMode = resultList[i]?.challengeMode ?? null;
            item.notifyStatus = resultList[i]?.notifyStatus ?? null;
            item.challenge = resultList[i]?.challenge ?? null;
            item.deviceDetails = resultList[i]?.deviceDetails ?? null;
            item.formattedAmount = resultList[i]?.transactionAmount;
            item.productId = resultList[i]?.productId ?? null;
            item.originalStatus = resultList[i]?.requestStatus;
            item.originalDebtor = resultList[i]?.originalDebtor;
            item.coupleIndicator = resultList[i]?.coupleIndicator === "true";
            item.refundIndicator =
                resultList[i]?.refundIndicator === "true" ||
                resultList[i]?.refundIndicator === true;
            let title = "";
            let subTitle = `${Strings.CURRENCY}${resultList[i].transactionAmount}`;

            item.highlightText = Strings.CURRENCY + resultList[i].transactionAmount;
            item.date = trxDate && `Requested on ${trxDate}`;
            item.name = item?.isSender ? receiverName : senderName;
            item.requestedAmount = resultList[i]?.transactionAmount;
            const isAutoDebit = resultList[i]?.isAutoDebit ?? false;
            if (
                isAutoDebit &&
                resultList[i]?.requestType === "INCOMING" &&
                (resultList[i].requestStatus === "PENDING" ||
                    resultList[i].requestStatus === "EXPIRING_SOON")
            ) {
                title = `Pay to: ${shortText(senderName, 100)}`;
                subTitle = `${Strings.CURRENCY}${resultList[i].transactionAmount}`;
            } else if (
                resultList[i]?.requestType === "INCOMING" &&
                (resultList[i].requestStatus === "PENDING" ||
                    resultList[i].requestStatus === "EXPIRING_SOON")
            ) {
                title = `From: ${shortText(senderName, 100)}`;
                subTitle = `${Strings.CURRENCY}${resultList[i].transactionAmount}`;
            } else if (
                resultList[i]?.requestType === "OUTGOING" &&
                (resultList[i].requestStatus === "PENDING" ||
                    resultList[i].requestStatus === "EXPIRING_SOON")
            ) {
                title = `Sent to: ${shortText(receiverName, 100)}`;
                subTitle = `${Strings.CURRENCY}${resultList[i].transactionAmount}`;
            } else {
                switch (resultList[i].requestStatus) {
                    case "REFUND":
                    case "REFUNDED":
                    case "PAID_REFUND":
                        title = `Refunded to: ${shortText(senderName, 100)}`;
                        break;
                    case "PAID":
                    case "PROCESSING":
                        title = item?.isSender
                            ? `Paid to: ${shortText(senderName, 100)}`
                            : `Paid from: ${shortText(receiverName, 100)}`;
                        break;
                    case "REJECT":
                    case "REJECTED":
                    case "EXPIRED":
                    case "BLOCK":
                    case "BLOCKED":
                    case "UNSUCCESSFUL":
                    case "FAILED":
                    case "APPROVED":
                    case "CANCELLED":
                        if (isAutoDebit) {
                            title = item?.isSender
                                ? `Pay to: ${shortText(senderName, 100)}`
                                : `Pay from: ${shortText(receiverName, 100)}`;
                        } else {
                            title = item?.isSender
                                ? `From: ${shortText(senderName, 100)}`
                                : `Sent to: ${shortText(receiverName, 100)}`;
                        }
                        break;

                    case "FORWARDED":
                        title = `Forwarded to: ${shortText(receiverName, 100)}`;
                        break;

                    default:
                        title = item?.isSender
                            ? `From: ${shortText(senderName, 100)}`
                            : `Sent to: ${shortText(receiverName, 100)}`;
                        break;
                }
            }

            item.status = getStatus(resultList[i].requestStatus, resultList[i]);

            item.title = title;
            item.subTitle = subTitle;
            item.rtpType = item.status ?? null;
            item.flow = "PENDING";
            item.rtpRequest = true;
            item.image = {
                image: Assets.icDuitNowCircle,
                type: "local",
            };
            if (!item?.originalData) {
                item.originalData = originalData;
            }
            dataList.push(item);
        }
    }
    return dataList;
}

export function analyticsData(originalStatus) {
    switch (originalStatus) {
        case "PENDING_FORWARDED":
            RTPanalytics.viewDNCompOngoingRejectResend("Ongoing");
            break;
        case "OUTGOING":
            RTPanalytics.viewDNCompOngoingRejectResend("Outgoing");
            break;
        case "FORWARDED":
            RTPanalytics.viewDNCompOngoingRejectResend("Fowarded");
            break;
        case "REJECT":
        case "REJECTED":
            RTPanalytics.viewDNCompOngoingRejectResend("Rejected");
            break;
        case "PROCESS":
        case "PAID":
            RTPanalytics.viewDNCompOngoingRejectResend("Completed");
            break;
        case "FAILED":
            RTPanalytics.viewDNCompOngoingRejectResend("Failed");
            break;
        case "UNSUCCESSFUL":
            RTPanalytics.viewDNCompOngoingRejectResend("Unsuccessful");
            break;
        case "EXPIRED":
            RTPanalytics.viewDNCompOngoingRejectResend("Expired");
            break;
        case "BLOCK":
        case "BLOCKED":
            RTPanalytics.viewDNCompOngoingRejectResend("Blocked");
            break;
        case "REFUND":
        case "REFUNDED":
            RTPanalytics.viewDNCompOngoingRejectResend("Refund");
            break;
        case "INCOMING":
            RTPanalytics.viewDNCompOngoingRejectResend("Incoming");
            break;
        default:
            break;
    }
}
export function analyticsMenuClick(originalStatus) {
    switch (originalStatus) {
        case "UNSUCCESSFUL":
            RTPanalytics.viewDNCompOngoingRejectResendMenu("Unsuccessful");
            break;
        case "CANCEL_REQUEST":
            RTPanalytics.viewDNCompOngoingRejectResendMenu("Cancel");
            break;
        case "MARK_AS_PAID":
            RTPanalytics.viewDNCompOngoingRejectResendMenu("Completed");
            break;
        case "REJECT_REQUEST":
            RTPanalytics.viewDNCompOngoingRejectResendMenu("Rejected");
            break;
        case "BLOCK_REQUEST":
            RTPanalytics.viewDNCompOngoingRejectResendMenu("Blocked");
            break;
        case "FORWARD_REQUEST":
            RTPanalytics.viewDNCompOngoingRejectResendMenu("Fowarded");
            break;
        case "Incoming":
            RTPanalytics.viewDNCompOngoingRejectResendMenu("Incoming");
            break;
    }
}

export function analyticsDashboard(tab, reqType) {
    switch (reqType) {
        case Strings.SEND_AND_REQUEST:
            RTPanalytics.selectionDashboard(tab, "View All Requests");
            break;
        case Strings.REQUEST_TO_PAY:
            RTPanalytics.selectionDashboard(tab, "View All DuitNow Requests");
            break;
        case Strings.REQUEST_TO_PAY_AUTODEBIT:
            RTPanalytics.selectionDashboard(tab, "View All AutoDebit");
            break;
        case Strings.SELECT_REQUESTS:
        case "Search":
            RTPanalytics.selectionDashboard(tab, reqType);
            break;
    }
}

export function analyticsViewAll(reqType) {
    switch (reqType) {
        case Strings.SEND_AND_REQUEST:
            RTPanalytics.viewDashboardRequests();
            break;
        case Strings.REQUEST_TO_PAY:
            RTPanalytics.viewDashboardDuitNow();
            break;
        case Strings.REQUEST_TO_PAY_AUTODEBIT:
            RTPanalytics.viewDashboardAutoDebit();
            break;
    }
}
export function analyticsSelectItem(reqType) {
    switch (reqType) {
        case Strings.SEND_AND_REQUEST:
            RTPanalytics.selectionDashboardRequests(Strings.SELECT_REQUESTS);
            break;
        case Strings.REQUEST_TO_PAY:
            RTPanalytics.selectionDashboardDuitNow(Strings.SELECT_REQUESTS);
            break;
        case Strings.REQUEST_TO_PAY_AUTODEBIT:
            RTPanalytics.selectionDashboardAutoDebit(Strings.SELECT_REQUESTS);
            break;
    }
}

export function menuSelection(action) {
    RTPanalytics.viewDNCompOngoingMenuSelection("Incoming", action);
}

export function getStatus(requestStatus, item) {
    let status = "";
    switch (requestStatus) {
        case "ACCEPTED":
            status = "Accepted";
            break;
        case "PENDING":
        case "APPROVED":
        case "REFUND":
            status = item.isSender ? "Incoming" : "Outgoing";
            break;
        case "EXPIRING_SOON":
            status = item?.requestType === "OUTGOING" ? "Outgoing" : "Expiring soon";
            break;
        case "PAID_REFUND":
            status = "Refunded";
            break;
        case "PAID":
            status = "Paid";
            break;
        case "REJECT":
        case "REJECTED":
            status = "Rejected";
            break;
        case "CANCELLED":
            status = "Cancelled";
            break;
        case "PROCESSING":
            status = "Processing";
            break;
        case "FORWARDED":
            status = "Forwarded";
            break;
        case "PENDING_FORWARDED":
            status = "Received";
            break;
        case "FAILED":
        case "UNSUCCESSFUL":
            status = "Unsuccessful";
            break;
        case "EXPIRED":
            status = "Expired";
            break;
        case "PAUSED":
            status = "Paused";
            break;
        case "BLOCK":
        case "BLOCKED":
            status = "Blocked";
            break;
        default:
            status = "Completed";
            break;
    }
    return status;
}

export function mapBillingData(resultList, params) {
    const dataList = [];
    for (let i = 0; i < resultList.length; i++) {
        const item = { ...resultList[i], ...params };
        const trxDate = moment(resultList[i].creationDateTime, Strings.DATE_TIME_FORMAT).format(
            Strings.DATE_TIME_FORMAT_DISPLAY
        );
        const ogTrxDate = moment(
            params?.isPastTab
                ? resultList[i].originalCreationDateTime ?? resultList[i].creationDateTime
                : resultList[i].creationDateTime,
            Strings.DATE_TIME_FORMAT
        ).format(Strings.DATE_TIME_FORMAT_DISPLAY);
        // We need originalData for passback to rtp/action api
        const originalData = { ...resultList[i] };
        if (item) {
            const endDateFormatted = moment(
                resultList[i].expiryDate,
                Strings.DATE_SHORT_FORMAT2
            ).format("D MMM YYYY");
            const ogDateFormatted = moment(
                resultList[i].originalCreationDateTime,
                Strings.DATE_TIME_FORMAT
            ).format(Strings.DATE_TIME_FORMAT_DISPLAY);
            const expiryDateFormatted = moment(resultList[i].reqExpiryDate).format(
                Strings.DATE_TIME_FORMAT_DISPLAY
            );
            const shortExpiryDate = moment(resultList[i].reqExpiryDate).format("D MMM YYYY");
            item.trxDate = ogTrxDate;
            const senderName = toTitleCase(item?.debtorName) ?? "";
            const creditorName = toTitleCase(item?.merchantName) ?? "";
            let title = "";
            const freqObj = frequencyList?.find((el) => el.code === item?.frequency);
            const consentFrequencyText = freqObj?.name ?? "";
            const subTitle = `${consentFrequencyText ?? ""} ${
                item?.productName ? "-" : ""
            } ${toTitleCase(item?.productName ?? "")}`;
            let status = "";
            let detailHeader = "";
            let btnText = "";
            item.date = `Last ${item?.isMyBills ? "Paid" : "Charged"} ${trxDate ?? "-"}`;
            item.lastPaidDateTime =
                item?.lastPaidDateTime !== null ||
                item?.lastPaidDateTime !== "-" ||
                item?.lastPaidDateTime ||
                item?.lastPaidDateTime !== "dummy"
                    ? item.lastPaidDateTime
                    : null;
            item.lastChargeDateTime =
                item?.lastChargeDateTime !== null ||
                item?.lastChargeDateTime !== "-" ||
                item?.lastChargeDateTime ||
                item?.lastChargeDateTime !== "dummy"
                    ? item.lastChargeDateTime
                    : null;

            switch (item.consentStatus) {
                case "BLOCKED":
                    status = "Blocked";
                    break;
                case "PENDING":
                    status = item?.isSender ? "Incoming" : "Outgoing";
                    item.date = `Created ${ogTrxDate ?? "-"}`;
                    detailHeader = !item?.isSender
                        ? "You've sent a request to"
                        : "You've received a request from";
                    title = !item?.isMyBills
                        ? shortText(senderName, 100)
                        : `Pay to: ${shortText(creditorName, 100)}`;
                    break;
                case "ACTIVE":
                    item.date =
                        item.lastPaidDateTime === null && item.lastChargeDateTime === null
                            ? `Created ${ogTrxDate ?? "-"}`
                            : `Last ${item?.isMyBills ? "Paid" : "Charged"}  ${
                                  item?.isMyBills
                                      ? moment(
                                            item?.lastPaidDateTime,
                                            "YYYY-MM-DD hh:mm:ss"
                                        ).format(Strings.DATE_TIME_FORMAT_DISPLAY) ?? "-"
                                      : moment(
                                            item?.lastChargeDateTime,
                                            "YYYY-MM-DD hh:mm:ss"
                                        ).format(Strings.DATE_TIME_FORMAT_DISPLAY) ?? "-"
                              }`;
                    status = "Active";
                    detailHeader = "This request has been activated";
                    btnText = !item?.isSender ? "Charge Now" : "";
                    title = !item?.isMyBills
                        ? shortText(senderName, 100)
                        : `Pay to: ${shortText(creditorName, 100)}`;
                    break;
                case "PAUSED":
                    status = "Paused";
                    detailHeader = "This request has been paused";
                    btnText = item?.isSender ? "Resume AutoDebit" : "";
                    title = !item?.isMyBills
                        ? shortText(senderName, 100)
                        : item?.isSender
                        ? `From: ${shortText(senderName, 100)}`
                        : `Pay to: ${shortText(creditorName, 100)}`;
                    break;
                case "CANCELLED":
                    status = "Cancelled";
                    detailHeader = "This request has been cancelled";
                    item.date = `Cancelled on ${trxDate ?? "-"}`;
                    title = !item?.isMyBills
                        ? shortText(senderName, 100)
                        : item?.isSender
                        ? `From: ${shortText(senderName, 100)}`
                        : `Pay to: ${shortText(creditorName, 100)}`;
                    break;
                case "ENDED":
                    status = "Ended";
                    detailHeader = "This request has ended";
                    btnText = item?.isMyBills ? "Request Again" : "Renew Request";
                    if (item?.isMyBills) item.date = `Ended on ${trxDate ?? "-"}`;
                    title = !item?.isMyBills
                        ? shortText(senderName, 100)
                        : item?.isSender
                        ? `From: ${shortText(senderName, 100)}`
                        : `Pay to: ${shortText(creditorName, 100)}`;
                    item.date = `Ended on ${endDateFormatted ?? "-"}`;

                    break;
                case "REJECTED":
                    status = "Rejected";
                    detailHeader = "Your request has been\n rejected by";
                    item.date = `Created ${ogDateFormatted ?? "-"}`;
                    break;
                case "EXPIRED":
                    status = "Expired";
                    detailHeader = "Your request has expired";
                    btnText = item?.isMyBills ? "Request Again" : "";
                    title =
                        item?.isSender && !item?.isPast
                            ? `From: ${shortText(senderName, 100)}`
                            : `Pay to: ${shortText(creditorName, 100)}`;
                    break;

                default:
                    title = item?.isSender
                        ? `From: ${shortText(senderName, 100)}`
                        : `Sent to: ${shortText(creditorName, 100)}`;
                    break;
            }

            item.consentFrequencyText = consentFrequencyText;
            item.status = status;
            item.expiryDateFormatted = expiryDateFormatted;
            item.endDateFormatted = endDateFormatted;
            item.shortExpiryDate = shortExpiryDate;
            item.btnText = btnText;
            item.detailHeader = detailHeader;

            item.consentId =
                item.consentId?.length > 20 ? formateConsentId(item.consentId) : item.consentId;
            item.title = title;
            item.subTitle = subTitle;
            item.image = {
                image: Assets.icDuitNowCircle,
                type: "local",
            };
            if (!item?.originalData) {
                item.originalData = originalData;
            }
            dataList.push(item);
        }
    }
    return dataList;
}
export function formateConsentId(referenceNumber) {
    return referenceNumber ? referenceNumber?.substr(8, referenceNumber.length) : referenceNumber;
}

export function isCustomerTypeSoleProp(customerCode) {
    return customerCode === "02";
}

export function toTitleCase(str) {
    const replacedStr = str?.replace(/ /g, "");
    return str && !replacedStr?.includes("XXXX")
        ? str?.replace(/\w\S*/g, function (txt) {
              return txt?.charAt(0).toUpperCase() + txt?.substr(1).toLowerCase();
          })
        : str;
}

const getFrequencyAndProduct = (frequency, productName) => {
    const _frequency = frequencyList.find((x) => x.code === frequency)?.name;
    return `${_frequency} - ${toTitleCase(productName)}`;
};

export function mapAutoDebitData(resultList, isPast) {
    const dataList = [];
    for (let i = 0; i < resultList.length; i++) {
        const item = {};
        const trxDate = resultList?.[i]?.creationDateTime
            ? moment(resultList[i].creationDateTime, Strings.DATE_TIME_FORMAT).format(
                  Strings.DATE_TIME_FORMAT_DISPLAY
              )
            : "";
        const pastTrxDate = resultList?.[i]?.originalCreationDateTime
            ? moment(resultList[i].originalCreationDateTime, Strings.DATE_TIME_FORMAT).format(
                  Strings.DATE_TIME_FORMAT_DISPLAY
              )
            : "";

        // We need originalData for passback to autoDebit/action api
        const originalData = { ...resultList[i] };
        if (item) {
            item.requestId = resultList[i]?.bizMessageID ?? resultList[i]?.requestId;
            //Approve transfer flow
            item.transferFlow = resultList[i]?.funId === Strings.CONSENT_REGISTER_DEBTOR ? 28 : 29;
            // cancel transfer flow
            item.transferFlow =
                resultList[i]?.funId === Strings.CONSENT_APPROVAL
                    ? 30
                    : resultList[i]?.funId === Strings.CONSENT_APPROVE_CREDITOR
                    ? 31
                    : resultList[i]?.funId === Strings.CONSENT_UPDATE_SPR
                    ? 34
                    : "";

            //sender values
            const senderName = toTitleCase(resultList[i]?.merchantName) ?? "";
            item.senderAcct = resultList[i]?.creditorAccount;
            item.senderName = resultList[i]?.merchantName ?? "";
            item.senderAcctType = resultList[i]?.creditorIdType;
            item.senderProxyType = resultList[i]?.creditorIdType;
            item.senderProxyValue = resultList[i]?.creditorIdValue;
            item.isSender = !!resultList[i]?.isSender;
            //creditor values
            const receiverName = toTitleCase(resultList[i]?.debtorName) ?? "";
            item.receiverName = resultList[i]?.debtorName ?? "";
            item.receiverAcct = resultList[i]?.debtorAccountNumber;
            item.receiverAcctType = resultList[i]?.debtorIdType;
            item.receiverProxyType = resultList[i]?.debtorIdType;
            item.receiverProxyValue = resultList[i]?.debtorIdValue;
            item.swiftCode = resultList[i]?.debtorBankSwiftCode;
            item.pan = resultList[i]?.pan ?? null;
            item.bankName = resultList[i]?.bankName ?? null;
            item.trxRefId = resultList[i]?.trxRefId ?? null;
            item.formattedTxnRefId = resultList[i]?.formattedTxnRefId ?? null;
            item.amount = resultList[i]?.transactionAmount;
            item.note = resultList[i]?.note ?? null;
            item.trxDate = isPast && resultList[i].originalCreationDateTime ? pastTrxDate : trxDate;
            item.expiryDate = resultList[i]?.expiryDate;
            item.reqExpiryDate = resultList[i]?.reqExpiryDate;
            item.amountEditable = resultList[i]?.amountEditable !== "True";
            item.paymentDesc = resultList[i]?.ref2 ?? null;
            item.reference = resultList[i]?.ref1 ?? null;
            item.status = resultList[i]?.requestStatus;
            item.requestType = resultList[i]?.requestType;
            item.firstPartyPayeeIndicator = resultList[i]?.firstPartyPaymentValidationIndicator;
            item.sourceOfFunds = resultList[i]?.sourceOfFunds ?? null;
            item.expiryDateTime = resultList[i]?.expiryDateTime;
            item.merchantId = resultList[i]?.merchantId ?? null;
            item.productId = resultList[i]?.productId ?? null;
            item.endToEndId = resultList[i]?.endToEndId ?? null;
            item.productName = resultList[i]?.productName ?? null;
            item.productInfo = {
                productId: item?.productId ?? null,
                productName: item?.productName ?? null,
            };
            item.consentStartDate = resultList[i]?.startDate ?? null;
            item.consentExpiryDate = resultList[i]?.expiryDate ?? null;
            item.consentFrequency = resultList[i]?.frequency ?? null;
            item.consentMaxLimit = resultList[i]?.limitAmount ?? null;

            item.challengeMode = resultList[i]?.challengeMode ?? null;
            item.notifyStatus = resultList[i]?.notifyStatus ?? null;
            item.challenge = resultList[i]?.challenge ?? null;
            item.deviceDetails = resultList[i]?.deviceDetails ?? null;
            item.formattedAmount = resultList[i]?.transactionAmount;
            item.originalStatus = resultList[i]?.consentStatus;
            item.consentId = resultList[i].consentId;
            item.coupleIndicator = resultList[i]?.coupleIndicator === "true";
            item.refundIndicator =
                resultList[i]?.refundIndicator === "true" ||
                resultList[i]?.refundIndicator === true;
            let title = "";
            const subTitle = getFrequencyAndProduct(resultList[i]?.frequency, item.productName);
            item.highlightText = Strings.CURRENCY + resultList[i].transactionAmount;
            item.date =
                trxDate &&
                `Requested on ${
                    isPast && resultList[i].originalCreationDateTime ? pastTrxDate : trxDate
                }`;
            item.name = item?.isSender ? receiverName : senderName;
            item.requestedAmount = resultList[i]?.transactionAmount;
            item.frequency = resultList[i]?.frequency;
            item.autoDebitId = resultList[i].consentId;
            item.funId = resultList[i]?.funId;
            const isServiceCode = serviceCodeList.includes(resultList[i]?.funId);
            if (
                resultList[i]?.requestType === "INCOMING" &&
                (resultList[i].consentStatus === "PENDING" ||
                    resultList[i].consentStatus === "EXPIRING_SOON") &&
                resultList[i]?.funId === Strings.CONSENT_REGISTER_DEBTOR
            ) {
                title = item?.isSender
                    ? `Pay from: ${shortText(receiverName, 100)}`
                    : `Pay to: ${shortText(senderName, 100)}`;
            } else if (
                (resultList[i]?.requestType === "OUTGOING" &&
                    resultList[i].consentStatus === "EXPIRING_SOON" &&
                    resultList[i]?.funId === Strings.CONSENT_REQ_PROXY_CREDITOR) ||
                (resultList[i]?.requestType === "INCOMING" &&
                    (resultList[i].consentStatus === "PENDING" ||
                        resultList[i].consentStatus === "EXPIRING_SOON") &&
                    isServiceCode)
            ) {
                title = item?.isSender
                    ? `Pay to: ${shortText(senderName, 100)}`
                    : `Pay from: ${shortText(receiverName, 100)}`;
            } else if (
                resultList[i]?.requestType === "OUTGOING" &&
                resultList[i].consentStatus === "EXPIRING_SOON" &&
                resultList[i]?.funId === Strings.CONSENT_REGISTER_DEBTOR
            ) {
                title = `Pay From: ${shortText(receiverName, 100)}`;
            } else if (
                resultList[i]?.requestType === "OUTGOING" &&
                resultList[i].consentStatus === "PENDING" &&
                isServiceCode
            ) {
                title = `Pay From: ${shortText(receiverName, 100)}`;
            } else if (
                resultList[i]?.requestType === "OUTGOING" &&
                resultList[i].consentStatus === "APPROVED" &&
                resultList[i].funId === Strings.CONSENT_APPROVAL
            ) {
                title = `Pay To: ${shortText(senderName, 100)}`;
            } else if (
                resultList[i]?.requestType === "INCOMING" &&
                resultList[i].consentStatus === "APPROVED" &&
                resultList[i].funId === Strings.CONSENT_APPROVAL
            ) {
                title = `Pay From: ${shortText(receiverName, 100)}`;
            } else if (
                resultList[i]?.requestType === "OUTGOING" &&
                resultList[i].consentStatus === "REJECTED" &&
                resultList[i].funId === Strings.CONSENT_REJECTION
            ) {
                title = `Pay From: ${shortText(receiverName, 100)}`;
            } else if (
                resultList[i]?.requestType === "INCOMING" &&
                resultList[i].consentStatus === "REJECTED" &&
                resultList[i].funId === Strings.CONSENT_REJECTION
            ) {
                title = `Pay To: ${shortText(senderName, 100)}`;
            } else if (
                (resultList[i].consentStatus === "APPROVED" ||
                    resultList[i].consentStatus === "REJECTED" ||
                    resultList[i].consentStatus === "EXPIRED") &&
                resultList[i].funId === Strings.CONSENT_APPROVE_CREDITOR
            ) {
                title = item.isSender
                    ? `Pay From: ${shortText(receiverName, 100)}`
                    : `Pay to: ${shortText(senderName, 100)}`;
            } else if (
                resultList[i]?.requestType === "OUTGOING" &&
                resultList[i].consentStatus === "EXPIRED" &&
                resultList[i].funId === Strings.CONSENT_APPROVAL
            ) {
                title = `Pay from: ${shortText(senderName, 100)}`;
            } else if (
                resultList[i]?.requestType === "OUTGOING" &&
                resultList[i].consentStatus === "BLOCKED" &&
                resultList[i].funId === Strings.CONSENT_REJECTION &&
                resultList[i].isSender === false
            ) {
                title = `Pay From: ${shortText(receiverName, 100)}`;
            } else if (
                resultList[i]?.requestType === "INCOMING" &&
                resultList[i].consentStatus === "BLOCKED" &&
                resultList[i].funId === Strings.CONSENT_REJECTION
            ) {
                title = `Pay To: ${shortText(senderName, 100)}`;
            } else {
                switch (resultList[i].consentStatus) {
                    case "REJECT":
                    case "REJECTED":
                    case "BLOCK":
                    case "BLOCKED":
                    case "EXPIRED":
                    case "APPROVED":
                        title = item?.isSender
                            ? `Pay to: ${shortText(senderName, 100)}`
                            : `Pay from: ${shortText(receiverName, 100)}`;
                        break;
                    default:
                        title = item?.isSender
                            ? `From: ${shortText(senderName, 100)}`
                            : `Sent to: ${shortText(receiverName, 100)}`;
                        break;
                }
            }
            item.status =
                resultList[i]?.consentStatus === "APPROVED"
                    ? "Approved"
                    : getStatus(resultList[i]?.consentStatus, item);
            item.title = title;
            item.subTitle = subTitle;
            item.rtpType = item.status ?? null;
            item.flow = "PENDING";
            item.autoDebitRequest = true;
            item.image = {
                image: Assets.icDuitNowCircle,
                type: "local",
            };
            item.module = Strings.REQUEST_TO_PAY_AUTODEBIT;
            if (!item?.originalData) {
                item.originalData = originalData;
            }
            dataList.push(item);
        }
    }
    return dataList;
}

// Number masking
export function numberMasking(number) {
    return number
        .replace(/ /g, "")
        .replace(/.(?=.{4})/g, "*")
        .match(/.{1,4}/g)
        .join(" ");
}

export function filterAutoBillingBasedOnUser(list) {
    if (list?.length > 0) {
        return list.filter(
            (el) =>
                !(
                    ((el.originalFunId === Strings.CONSENT_REQ_PROXY_CREDITOR ||
                        el.originalFunId === Strings.CONSENT_REQ_ACC_CREDITOR ||
                        el.funId === Strings.CONSENT_REQ_PROXY_CREDITOR ||
                        el.funId === Strings.CONSENT_REQ_ACC_CREDITOR) &&
                        (el?.consentStatus === "PENDING" ||
                            el?.consentStatus === "EXPIRING_SOON")) ||
                    (el?.requestType === "INCOMING" &&
                        (el?.consentStatus === "PENDING" ||
                            el?.consentStatus === "EXPIRING_SOON") &&
                        (el.originalFunId === Strings.CONSENT_REGISTER_DEBTOR ||
                            el.funId === Strings.CONSENT_REGISTER_DEBTOR))
                )
        );
    }
    return list;
}

export function filterAutoBillingPast(list, isMyBills) {
    if (list?.length > 0) {
        return list.filter(
            (el) =>
                !(
                    (el.originalFunId === Strings.CONSENT_REQ_PROXY_CREDITOR ||
                        el.originalFunId === Strings.CONSENT_REQ_ACC_CREDITOR ||
                        (el.originalFunId === Strings.CONSENT_REGISTER_DEBTOR &&
                            el?.requestType === "INCOMING") ||
                        (el.funId === Strings.CONSENT_REGISTER_DEBTOR &&
                            el?.requestType === "INCOMING") ||
                        el.funId === Strings.CONSENT_REQ_PROXY_CREDITOR ||
                        el.funId === Strings.CONSENT_REQ_ACC_CREDITOR) &&
                    (el?.consentStatus === "EXPIRED" ||
                        el?.consentStatus === "BLOCKED" ||
                        el?.consentStatus === "REJECTED" ||
                        el?.consentStatus === "APPROVED")
                )
        );
    }
    return list;
}
export function filterAutoBillingCustomerPast(list, isMyBills) {
    if (list?.length > 0) {
        return list.filter(
            (el) => el?.consentStatus === "ENDED" || el?.consentStatus === "CANCELLED"
        );
    }
    return list;
}

export function filterAutoDebitBasedOnUser(list) {
    if (list?.length > 0) {
        return list.filter(
            (el) =>
                !(
                    (el.funId === Strings.CONSENT_REGISTER_DEBTOR ||
                        el.originalFunId === Strings.CONSENT_REGISTER_DEBTOR) &&
                    el.requestType === "OUTGOING"
                )
        );
    }
    return list;
}

/***
 * formatNumber
 * formate ID Value
 */
export function formatNumber(val) {
    val = val?.replace(/ /g, "");
    const first = val.toString().substring(0, 3);
    const second = val
        .toString()
        .substring(3, val.length)
        .replace(/\d{4}(?=.)/g, "$& ");
    return (first + " " + second).toString().trim();
}

/***
 * checkFormatNumber
 * check Format Mobile Number Value
 */
export function checkFormatNumber(val, includeZero) {
    const mobileNumberValue = val?.replace(/[^\d]/g, "");
    const one = mobileNumberValue?.substring(0, 1);
    const second = mobileNumberValue?.substring(0, 2);
    const index = second === "60" ? 2 : 1;
    const startAt = includeZero ? index - 1 : index;
    const value =
        second === "60" || one === "0"
            ? mobileNumberValue?.substring(startAt, mobileNumberValue?.length)
            : mobileNumberValue;
    return formatNumber(value?.length > 21 ? value.substring(0, 21) : value);
}

export const getDateRange = (data, serviceCode) => {
    const flagDate = data?.find((el) => el?.serviceCode === serviceCode);
    return flagDate?.mainNote1 ? parseInt(flagDate?.mainNote1) : 0;
};

export const getPermissionStatus = (data, serviceCode) => {
    return data?.findIndex((el) => el?.serviceCode === serviceCode && el?.status === "1") >= 0;
};

export function getPermissionObj({ listing, cusType }) {
    return {
        //send request dashboard data
        hasPermissionToSendDuitNow: getPermissionStatus(listing, Strings.SC_DN_SEND),
        hasPermissionViewDuitNow: getPermissionStatus(listing, Strings.SC_DN_VIEW),
        hasPermissionSendAutoDebit:
            getPermissionStatus(listing, Strings.SC_DN_SEND_AUTODEBIT) && cusType === "02",
        hasPermissionViewAutoDebitList: getPermissionStatus(listing, Strings.SC_DN_VIEWLIST),
        hasPermissionToggleAutoDebit: getPermissionStatus(listing, Strings.SC_DN_TOGGLE_AUTODEBIT),
        flagEndDate: getDateRange(listing, Strings.SC_DN_AUTODEBIT_ENDDATE),
        flagStartDate: getDateRange(listing, Strings.SC_DN_AUTODEBIT_STARTDATE),
        flagExpiryDate: getDateRange(listing, Strings.SC_DN_AUTODEBIT_EXPIRYDATE),
        flagAPICalled: true,
        utilFlag: listing,
        //billing dashboard data
        setupAutobillingFlag: getPermissionStatus(listing, Strings.SC_DN_SETUP_AUTOBILLING),
        viewAutobillingFlag: getPermissionStatus(listing, Strings.SC_DN_VIEW_AUTOBILLING),
        chargeCustomerFlag: getPermissionStatus(listing, Strings.SC_DN_CHARGE_CUSTOMER),
        //settings data
        duitnowAutoDebitFlag: getPermissionStatus(listing, Strings.SC_DN_AUTODEBIT),
        duitnowAutoDebitBlockedFlag: getPermissionStatus(listing, Strings.SC_AD_DN_BLOCKLIST),
        duitnowRequestBlockedFlag: getPermissionStatus(listing, Strings.SC_DN_BLOCKLIST),
        //blocked list data
        requestBlockedFlag: getPermissionStatus(listing, Strings.SC_DN_BLOCKLIST),
        autoDebitBlockedFlag: getPermissionStatus(listing, Strings.SC_AD_DN_BLOCKLIST),
        unblockFlag: getPermissionStatus(listing, Strings.SC_DN_UNBLOCKLIST),
    };
}
