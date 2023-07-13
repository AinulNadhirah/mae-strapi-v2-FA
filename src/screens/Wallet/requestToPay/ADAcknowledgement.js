import moment from "moment";
import Numeral from "numeral";
import PropTypes from "prop-types";
import React, { useState, useEffect } from "react";
import { View, ImageBackground, ScrollView, Dimensions, Alert } from "react-native";

import {
    COMMON_MODULE,
    DASHBOARD,
    PDF_VIEWER,
    SEND_REQUEST_MONEY_DASHBOARD,
    SEND_REQUEST_MONEY_STACK,
    TAB,
    TAB_NAVIGATOR,
} from "@navigation/navigationConstant";

import ScreenLayout from "@layouts/ScreenLayout";

import ActionButton from "@components/Buttons/ActionButton";
import CustomPdfGenerator from "@components/Common/CustomPdfGenerator";
import ScreenContainer from "@components/Containers/ScreenContainer";
import Typography from "@components/Text";

import { withModelContext } from "@context";

import { RTPanalytics } from "@services/analytics/rtpAnalyticsSSL";

import {
    MEDIUM_GREY,
    YELLOW,
    DISABLED,
    DISABLED_TEXT,
    BLACK,
    WHITE,
    GREY,
    FADE_GREY,
} from "@constants/colors";
import { frequencyList } from "@constants/data/DuitNowRPP";
import {
    RECIPIENT_ID,
    RECIPIENT_REFERENCE,
    CURRENCY,
    RECEIPT_NOTE,
    REFERENCE_ID,
    DATE_AND_TIME,
    SHARE_RECEIPT,
    DONE,
    SERVICE_FEES,
    REQUEST_EXPIRY_DATE,
    TOTAL_FEE,
    PRODUCT_NAME,
    FREQUENCY,
    LIMIT_PER_TRANSACTION,
    RTP_AUTODEBIT_ID,
    TRANSACTION_TYPE,
    BENEFICIARY_NAME,
    AMOUNT,
    SECURE_VERIFICATION_AUTHORIZATION_EXPIRED,
    CONSENT_REGISTER_ACKNOWLEDGE_MESSAGE,
    REDIRECT_MERCHANT,
    APPROVE_DUITNOW_AUTODEBIT_REQUEST_MESSAGE,
    SET_UP_AUTOBILLING_REQUEST_MESSAGE,
    DD_MMM_YYYY,
    CONSENT_REGISTER_DEBTOR,
    CONSENT_REQ_ACC_CREDITOR,
    CONSENT_REQ_PROXY_CREDITOR,
} from "@constants/strings";

import { formateRefnumber } from "@utils/dataModel/utility";

import Assets from "@assets";

import AcknowledgeTimer from "./AcknowledgeTimer";

export const { width, height } = Dimensions.get("window");

function ADAcknowledgement({ navigation, route, getModel }) {
    const item = route?.params || {};

    const [transactionStatus, setTransactionStatus] = useState(false);
    const [referenceNumber, setReferenceNumber] = useState("");
    const [transferMessage, setTransferMessage] = useState("");
    const [subMessage, setSubMessage] = useState("");
    const [transferFlow, setTransferFlow] = useState(27);
    const [transactionDate, setTransactionDate] = useState("");
    const [transferParams, setTransferParams] = useState({});
    const [loader, setLoader] = useState(false);
    const [showLoaderModal, setShowLoaderModal] = useState(false);
    const [transactionType, setTransactionType] = useState("");
    const [hideTimer] = useState(false);

    useEffect(() => {
        _updateScreenUI();
        /**
         * Hide add to favourite button when successfully added and come back to this screen
         */
        setShowLoaderModal(false);
    }, []);

    /**
     * _getTodayDate()
     * get Temp Timestamp if date is null in response obj use this
     */
    function _getTodayDate() {
        return moment(new Date()).format("D MMM YYYY, h:mm A");
    }

    /**
     * _updateScreenUI()
     * Get Transaction data from previous screen and display the status
     */
    function _updateScreenUI() {
        //get Transaction data from previous screen
        const { transactionDate, transactionStatus, formattedTransactionRefNumber } =
            item?.transferParams || {};

        const modFlow =
            item?.transferParams?.originalData?.funId === CONSENT_REQ_PROXY_CREDITOR ||
            item?.transferParams?.originalData?.funId === CONSENT_REQ_ACC_CREDITOR
                ? 28
                : item?.transferParams?.originalData?.funId === CONSENT_REGISTER_DEBTOR
                ? 29
                : item?.transferParams?.transferFlow ?? transferFlow;
        //Get Transaction data from previous screen and store in state
        setTransferParams(item?.transferParams);
        setReferenceNumber(formattedTransactionRefNumber);
        setTransferFlow(modFlow);
        setTransactionStatus(transactionStatus);
        setTransactionDate(transactionDate || _getTodayDate());
        setShowLoaderModal(false);

        _getScreenData();
    }

    /**
     *_onDonePress()
     * @memberof ADAcknowledgement. .
     *
     * transferFlow === 27 --> Request To Billing
     * transferFlow === 28 --> Update Billing Status
     */
    function _onDonePress() {
        if (
            item?.transferParams?.isConsentOnlineBanking &&
            item?.transferParams?.transactionStatus
        ) {
            const { redirectToMerchantOnSuccess, fullRedirectUrl } = route?.params || {};
            if (fullRedirectUrl) {
                redirectToMerchantOnSuccess && redirectToMerchantOnSuccess(fullRedirectUrl);
            } else {
                navigation.navigate(TAB_NAVIGATOR, {
                    screen: TAB,
                    params: {
                        screen: DASHBOARD,
                        params: { refresh: true },
                    },
                });
            }
        } else if (item?.transferParams?.isConsentOnlineBanking) {
            const { redirectToMerchant, fullRedirectUrl } = route?.params || {};
            if (fullRedirectUrl) {
                redirectToMerchant && redirectToMerchant(fullRedirectUrl);
            } else {
                navigation.navigate(TAB_NAVIGATOR, {
                    screen: TAB,
                    params: {
                        screen: DASHBOARD,
                        params: { refresh: true },
                    },
                });
            }
        } else {
            navigation?.navigate(SEND_REQUEST_MONEY_STACK, {
                screen: SEND_REQUEST_MONEY_DASHBOARD,
                params: { updateScreenData: true, doneFlow: true },
            });
        }
    }

    /**
     * _getScreenData()
     * Get screen data and store in state
     * Set Transfer status
     */
    function _getScreenData() {
        const wrongTac = route?.params?.errors?.error;
        const {
            transactionDate,
            msgId,
            transactionresponse,
            transactionStatus,
            statusDescription,
        } = item?.transferParams || {};

        //Get Transaction Reference Number
        const referenceNo = transactionresponse
            ? formateRefnumber(transactionresponse?.msgId ?? msgId)
            : item?.originalData?.funId === CONSENT_REGISTER_DEBTOR ||
              item?.originalData?.funId === CONSENT_REQ_PROXY_CREDITOR ||
              item?.originalData?.funId === CONSENT_REQ_ACC_CREDITOR
            ? formateRefnumber(item?.transferParams?.formattedTransactionRefNumber)
            : "";

        const action = "Transaction";
        const message =
            item?.transferParams?.isConsentOnlineBanking && transactionStatus
                ? CONSENT_REGISTER_ACKNOWLEDGE_MESSAGE
                : item?.transferParams?.status === "M408"
                ? SECURE_VERIFICATION_AUTHORIZATION_EXPIRED
                : !transactionStatus &&
                  (statusDescription === "Declined" || statusDescription === "Failed") &&
                  item?.transferParams?.status !== "M201"
                ? action + " unsuccessful"
                : item?.transferParams?.s2uSignRespone?.status === "M201" ||
                  item?.transferParams?.status === "M201"
                ? "Authorisation failed"
                : action + " successful";

        //Get Transaction date
        const modtransactionDate =
            transactionDate && transactionDate !== "N/A" && transferFlow === 28
                ? moment(transactionDate, ["YYYY-MM-DD:hh:mm:ss", "DD MMM YYYY, hh:mm A"]).format(
                      "DD MMM YYYY, hh:mm A"
                  )
                : _getTodayDate();
        const transactionType =
            item?.transferParams?.isConsentOnlineBanking && item?.transferParams.status === "M201"
                ? APPROVE_DUITNOW_AUTODEBIT_REQUEST_MESSAGE
                : transferFlow === 27
                ? SET_UP_AUTOBILLING_REQUEST_MESSAGE
                : item?.transferParams.funId === CONSENT_REGISTER_DEBTOR ||
                  item?.transferParams.funId === CONSENT_REQ_PROXY_CREDITOR ||
                  item?.transferParams.funId === CONSENT_REQ_ACC_CREDITOR
                ? APPROVE_DUITNOW_AUTODEBIT_REQUEST_MESSAGE
                : SET_UP_AUTOBILLING_REQUEST_MESSAGE;

        const refNo = referenceNo
            ? referenceNo.toString()
            : item?.transferParams?.statusDescription === "Declined" &&
              item?.transferParams?.tacType === false
            ? wrongTac?.refId
            : item?.transferParams?.transactionStatus === false &&
              item?.transferParams?.tacType === true
            ? formateRefnumber(route?.params?.errors?.result?.msgId)
            : item?.transferParams?.s2uType === false
            ? formateRefnumber(item?.transferParams?.formatRefNumber)
            : "";

        setReferenceNumber(refNo);
        setTransferMessage(message);
        setSubMessage(
            item?.transferParams?.s2uSignRespone?.status === "M201"
                ? item?.transferParams.s2uSignRespone?.text
                : ""
        );
        setTransactionType(transactionType);
        setTransactionDate(modtransactionDate);

        // approve autobilling GA
        if (transactionStatus) {
            if (
                item?.transferParams?.originalData?.funId === CONSENT_REGISTER_DEBTOR ||
                item?.transferParams?.originalData?.funId === CONSENT_REQ_PROXY_CREDITOR ||
                item?.transferParams?.originalData?.funId === CONSENT_REQ_ACC_CREDITOR
            ) {
                RTPanalytics.screenLoadABApproveSuccessfull();
                RTPanalytics.formABApproveSuccessfull(referenceNumber);
            } else if (item?.transferParams?.isConsentOnlineBanking) {
                RTPanalytics.duitNowOnlineBankingPaymentSuccess();
                RTPanalytics.duitNowOnlineBankingPaymentSuccessForm(referenceNumber);
            } else {
                RTPanalytics.screenLoadADRequestSubmitted();
                RTPanalytics.formADRequestSubmitted(referenceNumber);
            }
        } else if (!transactionStatus) {
            if (
                item?.transferParams?.originalData?.funId === CONSENT_REGISTER_DEBTOR ||
                item?.transferParams?.originalData?.funId === CONSENT_REQ_PROXY_CREDITOR ||
                item?.transferParams?.originalData?.funId === CONSENT_REQ_ACC_CREDITOR
            ) {
                RTPanalytics.screenLoadABApproveUnsuccessfull();
                RTPanalytics.formABApproveUnsuccessfull(referenceNumber);
            } else {
                RTPanalytics.screenLoadADReqUnsuccessful();
                RTPanalytics.formADReqUnsuccessful(referenceNumber);
            }
        }

        // GA for online banking redirect autodebit timeout or reject
        if (
            item?.transferParams?.isConsentOnlineBanking &&
            item?.transferParams?.s2uSignRespone?.status === "M201"
        ) {
            RTPanalytics.duitNowOnlineBankingPaymentReject();
            RTPanalytics.duitNowOnlineBankingPaymentRejectForm(referenceNumber);
        } else if (
            item?.transferParams?.isConsentOnlineBanking &&
            item?.transferParams?.s2uSignRespone?.status === "M000"
        ) {
            RTPanalytics.duitNowOnlineBankingPaymentReqTimeout();
            RTPanalytics.duitNowOnlineBankingPaymentReqTimeoutForm(referenceNumber);
        }
    }

    function onCardUnMasking(cardNumber) {
        return cardNumber.match(/.{1,4}/g).join(" ");
    }

    function onCardMasking(cardNumber) {
        return cardNumber
            .replace(/.(?=.{4})/g, "*")
            .match(/.{1,4}/g)
            .join(" ");
    }

    /**
     * _onShareReceiptClick()
     * On Share receipt button Click
     * Construct Receipt View
     */
    async function _onShareReceiptClick() {
        const {
            reference,
            amount,
            serviceFee,
            consentFrequency,
            consentMaxLimitFormatted,
            consentStartDate,
            consentExpiryDate,
            productInfo,
            transactionresponse,
            expiryDateFormatted,
        } = item?.transferParams || {};

        const userProxy = item?.transferParams?.selectedProxy?.no;
        const userIdValue =
            userProxy === 0 || userProxy === 1 || userProxy === 2
                ? item?.transferParams?.idValueFormatted
                : item?.transferParams?.idValue;

        if (
            item?.transferParams?.originalData?.funId === CONSENT_REGISTER_DEBTOR ||
            item?.transferParams?.originalData?.funId === CONSENT_REQ_PROXY_CREDITOR ||
            item?.transferParams?.originalData?.funId === CONSENT_REQ_ACC_CREDITOR
        ) {
            RTPanalytics.ABApproveShareReceipt();
            RTPanalytics.screenLoadABApproveShareReceipt();
        } else {
            RTPanalytics.ADShareReceipt();
            RTPanalytics.screenLoadADShareReceipt();
        }

        try {
            setShowLoaderModal(true);

            const receiptTitle = item?.transferParams?.isConsentOnlineBanking
                ? "DuitNow Online Banking"
                : transferFlow === 27
                ? "Send - DuitNow AutoDebit"
                : "Approve - DuitNow AutoDebit";

            const statusType = "Success";
            const statusText = "Successful";

            const detailsArray = [
                {
                    label: RECIPIENT_ID,
                    value: referenceNumber,
                    showRightText: true,
                    rightTextType: "text",
                    rightStatusType: "",
                    rightText: transactionDate,
                },
            ];
            if (item?.transferParams?.isConsentOnlineBanking) {
                detailsArray.push({
                    label: BENEFICIARY_NAME,
                    value: item?.transferParams?.creditorName,
                    showRightText: false,
                });
                const transactionAmount = parseFloat(item?.transferParams?.amount);
                const serviceFeeForOnlineBanking = transactionAmount > 5000.0 ? 0.5 : 0;
                //Add service fee
                detailsArray.push({
                    label: SERVICE_FEES,
                    value: `${CURRENCY} ${transactionAmount > 5000.0 ? "0.50" : "0.00"}`,
                    showRightText: false,
                });
                const modAmount =
                    serviceFeeForOnlineBanking > 0.01
                        ? transactionAmount + serviceFeeForOnlineBanking
                        : transactionAmount;
                //Add total field
                detailsArray.push({
                    label: TOTAL_FEE,
                    value: CURRENCY + modAmount?.toFixed(2),
                    isAmount: true,
                    showRightText: false,
                });

                detailsArray.push({
                    label: AMOUNT,
                    value: item?.transferParams?.amount,
                    showRightText: false,
                });
            } else if (transferFlow !== 27) {
                detailsArray.push({
                    label: "From account",
                    value:
                        (item?.transferParams?.originalData?.funId === CONSENT_REQ_PROXY_CREDITOR ||
                            item?.transferParams?.originalData?.funId ===
                                CONSENT_REQ_ACC_CREDITOR) &&
                        item?.transferParams?.tacType === true
                            ? ` ${item.item?.transactionRefNumberFull}<br><br> ${onCardMasking(
                                  `${item?.item?.transferParams?.accSelector}`
                              )}`
                            : (item?.transferParams?.originalData?.funId ===
                                  CONSENT_REQ_PROXY_CREDITOR ||
                                  item?.transferParams?.originalData?.funId ===
                                      CONSENT_REQ_ACC_CREDITOR) &&
                              item?.transferParams?.s2uType === true
                            ? ` ${transferParams?.transactionRefNumberFull}<br><br> ${onCardMasking(
                                  `${item?.transferParams?.accSelector.substring(0, 12)}`
                              )}`
                            : ` ${transferParams?.receiverName}<br><br> ${onCardUnMasking(
                                  `${item?.transferParams?.receiverAcct}`
                              )}`,
                    showRightText: false,
                });
                detailsArray.push({
                    label: "Recipient name",
                    value: item?.transferParams?.originalData?.productName,
                    showRightText: false,
                });

                detailsArray.push({
                    label: RECIPIENT_REFERENCE,
                    value: reference,
                    showRightText: false,
                });
            } else {
                detailsArray.push({
                    label: "Recipient name",
                    value:
                        item?.transferParams?.actualAccHolderName ??
                        item?.transferParams?.accHolderName,
                    showRightText: false,
                });
                detailsArray.push({
                    label: "DuitNow ID Type",
                    value: item?.transferParams?.idTypeText ?? "-",
                    showRightText: false,
                });
                detailsArray.push({
                    label: "DuitNow ID Number",
                    value: userIdValue ?? "-",
                    showRightText: false,
                });
            }
            if (!item?.transferParams?.isConsentOnlineBanking) {
                detailsArray.push({
                    label: RECIPIENT_REFERENCE,
                    value: transferFlow === 27 ? reference : item?.originalData?.refs1,
                    showRightText: false,
                });

                if (transferFlow === 27) {
                    detailsArray.push({
                        label: REQUEST_EXPIRY_DATE,
                        value: expiryDateFormatted,
                        showRightText: false,
                    });
                }
            }

            const freqObj = frequencyList.find((el) => el.code === consentFrequency);

            const isOnlineAutoDebit = {
                title: "DuitNow AutoDebit details",
                desc: "*Subject to availability of funds based on merchant’s real-time debit request ",
                product: { text: RECIPIENT_REFERENCE, value: item?.transferParams?.refs1 },
                frequency: { text: FREQUENCY, value: item?.transferParams?.consentFrequencyText },
                limit: {
                    text: LIMIT_PER_TRANSACTION,
                    value: "RM " + item?.transferParams?.consentMaxLimit,
                },
                id: { text: "DuitNow reference", value: item?.transferParams?.consentId },
                date: {
                    start: moment(consentStartDate).format(DD_MMM_YYYY),
                    end: moment(consentExpiryDate).format(DD_MMM_YYYY),
                },
            };

            const additionalData =
                freqObj?.name && consentMaxLimitFormatted
                    ? {
                          title: transferFlow !== 27 ? "DuitNow AutoDebit details" : "",
                          desc:
                              transferFlow !== 27
                                  ? "*Subject to availability of funds based on merchant’s real-time debit request"
                                  : "",
                          product: { text: PRODUCT_NAME, value: productInfo?.productName },
                          frequency: { text: FREQUENCY, value: freqObj?.name },
                          limit: {
                              text: LIMIT_PER_TRANSACTION,
                              value: "RM " + consentMaxLimitFormatted,
                          },
                          id: { text: RTP_AUTODEBIT_ID, value: transactionresponse?.consentId },
                          date: {
                              start: moment(consentStartDate).format(DD_MMM_YYYY),
                              end: moment(consentExpiryDate).format(DD_MMM_YYYY),
                          },
                      }
                    : null;

            const isApproveAutoDebit = consentFrequency
                ? {
                      title: "",
                      desc: " ",
                      product: {
                          text: PRODUCT_NAME,
                          value: item?.originalData?.productName,
                      },
                      frequency: {
                          text: FREQUENCY,
                          value: item?.transferParams?.consentFrequencyText,
                      },
                      limit: {
                          text: LIMIT_PER_TRANSACTION,
                          value: "RM " + Numeral(item?.originalData?.limitAmount).format("0,0.00"),
                      },
                      id: { text: RTP_AUTODEBIT_ID, value: item?.originalData?.consentId },
                      date: {
                          start: moment(consentStartDate).format(DD_MMM_YYYY),
                          end: moment(consentExpiryDate).format(DD_MMM_YYYY),
                      },
                  }
                : null;
            const isShowingAutoDebit = item?.transferParams?.isConsentOnlineBanking
                ? isOnlineAutoDebit
                : transferFlow === 27
                ? additionalData
                : isApproveAutoDebit;

            const amountNumber = parseFloat(amount);

            if (serviceFee && amountNumber > 5000.0) {
                //Add service fee
                detailsArray.push({
                    label: SERVICE_FEES,
                    value: `${CURRENCY} ${parseFloat(serviceFee).toFixed(2)}`,
                    showRightText: false,
                });
                const modAmount =
                    parseFloat(serviceFee) > 0.01
                        ? parseFloat(amountNumber) + parseFloat(serviceFee)
                        : amountNumber;
                //Add total field
                detailsArray.push({
                    label: TOTAL_FEE,
                    value: CURRENCY + modAmount?.toFixed(2),
                    isAmount: true,
                    showRightText: false,
                });
            }

            // Call custom method to generate PDF
            const file = await CustomPdfGenerator.generateReceipt(
                true,
                receiptTitle,
                true,
                RECEIPT_NOTE,
                detailsArray,
                true,
                statusType,
                statusText,
                isShowingAutoDebit
            );
            if (file === null) {
                Alert.alert("Please allow permission");
                return;
            }

            const navParams = {
                file,
                share: true,
                type: "file",
                pdfType: "shareReceipt",
                title: "Share Receipt",
                transferParams: item?.transferParams,
            };

            setShowLoaderModal(false);
            // Navigate to PDF viewer to display PDF

            navigation.navigate(COMMON_MODULE, {
                screen: PDF_VIEWER,
                params: navParams,
            });
        } catch (error) {
            setLoader(false);
            setShowLoaderModal(false);
        }
    }

    function getTimeOut() {
        if (item?.transferParams?.isConsentOnlineBanking && item?.transferParams?.confirmPopUp) {
            return false;
        }

        return item?.transferParams?.isTimeout || !item?.transferParams.transactionStatus;
    }

    const onlineBkngData = {
        isFromAcknowledge: true,
        hideTimer,
        isTimeout: getTimeOut(),
    };
    const actionText =
        item?.transferParams?.isConsentOnlineBanking &&
        item?.fullRedirectUrl &&
        (transactionStatus || item?.transferParams?.confirmPopUp)
            ? REDIRECT_MERCHANT
            : DONE;
    const showReference =
        item?.transferParams?.status !== "M408" && referenceNumber && referenceNumber.length >= 5;

    return (
        <ScreenContainer
            backgroundType="color"
            backgroundColor={MEDIUM_GREY}
            showLoaderModal={showLoaderModal}
        >
            <ScreenLayout>
                <React.Fragment>
                    <ScrollView
                        showsHorizontalScrollIndicator={false}
                        showsVerticalScrollIndicator={false}
                    >
                        <View style={Styles.mainContainer}>
                            <View style={Styles.viewAcknowledgeImage}>
                                <ImageBackground
                                    style={Styles.viewAcknowledgeImageView}
                                    source={
                                        transactionStatus === true
                                            ? Assets.icTickNew
                                            : Assets.icFailedIcon
                                    }
                                    resizeMode="contain"
                                />
                            </View>

                            <View style={Styles.viewRowDescriberItemAck}>
                                <Typography
                                    fontSize={20}
                                    fontWeight="300"
                                    fontStyle="normal"
                                    letterSpacing={0}
                                    lineHeight={28}
                                    textAlign="left"
                                    text={transferMessage}
                                />

                                {item?.transferParams?.statusDescription === "Declined" ||
                                subMessage ? (
                                    <View style={Styles.errorTextView}>
                                        <Typography
                                            fontSize={12}
                                            fontWeight="normal"
                                            fontStyle="normal"
                                            letterSpacing={0}
                                            lineHeight={18}
                                            textAlign="left"
                                            color={FADE_GREY}
                                            text={
                                                item?.transferParams?.statusDescription ===
                                                "Declined"
                                                    ? item?.transferParams?.errorMessage ??
                                                      item?.errors?.message
                                                    : subMessage
                                            }
                                        />
                                    </View>
                                ) : null}
                                {item?.transferParams?.isConsentOnlineBanking &&
                                item?.fullRedirectUrl &&
                                (transactionStatus || item?.transferParams?.confirmPopUp) &&
                                item?.transferParams?.isOnlineBanking &&
                                !hideTimer ? (
                                    <View style={Styles.errorTextView}>
                                        <AcknowledgeTimer
                                            time={8}
                                            cancelTimeout={true}
                                            navigation={navigation}
                                            getModel={getModel}
                                            params={{
                                                transferParams: {
                                                    ...item?.transferParams,
                                                    ...onlineBkngData,
                                                    fullRedirectUrl: item?.fullRedirectUrl,
                                                    redirectToMerchant:
                                                        item?.transferParams?.redirectToMerchant,
                                                    selectedAccount:
                                                        item?.transferParams?.selectedAccount,
                                                },
                                                screenDate: route.params?.screenDate,
                                            }}
                                        />
                                    </View>
                                ) : null}
                            </View>
                            {showReference ? (
                                <View style={Styles.viewRow}>
                                    <View style={Styles.viewRowLeftItem}>
                                        <Typography
                                            fontSize={12}
                                            fontWeight="400"
                                            fontStyle="normal"
                                            letterSpacing={0}
                                            lineHeight={18}
                                            textAlign="left"
                                            text={REFERENCE_ID}
                                        />
                                    </View>
                                    <View style={Styles.viewRowRightItem}>
                                        <Typography
                                            fontSize={12}
                                            fontWeight="600"
                                            fontStyle="normal"
                                            letterSpacing={0}
                                            lineHeight={18}
                                            textAlign="right"
                                            text={referenceNumber}
                                        />
                                    </View>
                                </View>
                            ) : null}

                            <View style={Styles.viewRow}>
                                <View style={Styles.viewRowLeftItem}>
                                    <Typography
                                        fontSize={12}
                                        fontWeight="400"
                                        fontStyle="normal"
                                        letterSpacing={0}
                                        lineHeight={18}
                                        textAlign="left"
                                        text={DATE_AND_TIME}
                                    />
                                </View>
                                <View style={Styles.viewRowRightItem}>
                                    <Typography
                                        fontSize={12}
                                        fontWeight="600"
                                        fontStyle="normal"
                                        letterSpacing={0}
                                        lineHeight={18}
                                        textAlign="right"
                                        text={transactionDate}
                                    />
                                </View>
                            </View>

                            {item?.transferParams?.status === "M408" ? null : item?.transferParams
                                  ?.isConsentOnlineBanking ||
                              item?.transferParams?.s2uSignRespone?.status === "M201" ||
                              item?.transferParams?.status === "M201" ||
                              item?.transferParams?.transactionStatus ? (
                                <View style={Styles.viewRow}>
                                    <View style={Styles.viewRowLeftItem}>
                                        <Typography
                                            fontSize={12}
                                            fontWeight="400"
                                            fontStyle="normal"
                                            letterSpacing={0}
                                            lineHeight={18}
                                            textAlign="left"
                                            text={TRANSACTION_TYPE}
                                        />
                                    </View>
                                    <View style={Styles.viewRowRightItem}>
                                        <Typography
                                            fontSize={12}
                                            fontWeight="600"
                                            fontStyle="normal"
                                            letterSpacing={0}
                                            lineHeight={18}
                                            textAlign="right"
                                            text={transactionType}
                                        />
                                    </View>
                                </View>
                            ) : null}
                        </View>
                    </ScrollView>
                    <View style={Styles.footerContainer}>
                        {transactionStatus && !item?.transferParams?.isConsentOnlineBanking ? (
                            <View style={Styles.shareBtnContainer}>
                                <ActionButton
                                    disabled={false}
                                    fullWidth
                                    borderRadius={25}
                                    borderWidth={0.5}
                                    borderColor={GREY}
                                    onPress={_onShareReceiptClick}
                                    backgroundColor={loader ? DISABLED : WHITE}
                                    componentCenter={
                                        <Typography
                                            color={loader ? DISABLED_TEXT : BLACK}
                                            text={SHARE_RECEIPT}
                                            fontSize={14}
                                            fontWeight="600"
                                            lineHeight={18}
                                        />
                                    }
                                />
                            </View>
                        ) : null}
                        <View style={Styles.doneBtnContainer}>
                            <ActionButton
                                disabled={false}
                                fullWidth
                                borderRadius={25}
                                onPress={_onDonePress}
                                backgroundColor={loader ? DISABLED : YELLOW}
                                componentCenter={
                                    <Typography
                                        color={loader ? DISABLED_TEXT : BLACK}
                                        text={actionText}
                                        fontSize={14}
                                        fontWeight="600"
                                        lineHeight={18}
                                    />
                                }
                            />
                        </View>
                    </View>
                </React.Fragment>
            </ScreenLayout>
        </ScreenContainer>
    );
}

ADAcknowledgement.propTypes = {
    getModel: PropTypes.func,
    resetModel: PropTypes.func,
    route: PropTypes.object,
    navigation: PropTypes.object,
};
ADAcknowledgement.navigationOptions = {
    title: "",
    header: null,
};

const SPACE_BETWEEN = "space-between";
const FLEX_START = "flex-start";
const Styles = {
    mainFullContainer: {
        flex: 1,
    },
    mainContainer: {
        flex: 1,
        paddingHorizontal: 12,
    },
    detailContainer: {
        marginTop: 30,
        alignItems: "stretch",
    },
    footerContainer: {
        width: "100%",
        flexDirection: "column",
        justifyContent: "flex-end",
    },
    detailRow: {
        paddingTop: 17,
        flexDirection: "row",
        justifyContent: SPACE_BETWEEN,
    },
    shareBtnContainer: {
        marginBottom: 16,
    },
    doneBtnContainer: {
        marginBottom: 16,
    },
    addFavBtnContainer: {
        marginTop: 8,
        marginBottom: 24,
    },
    addFavBtnEmptyContainer: {
        marginBottom: 8,
    },
    contentContainerStyle: {
        flexGrow: 1,
        flex: 1,
    },
    viewAcknowledgeImage: {
        alignContent: FLEX_START,
        alignItems: FLEX_START,
        flexDirection: "column",
        justifyContent: FLEX_START,
        marginTop: 126,
    },
    viewAcknowledgeImageView: {
        alignContent: "center",
        alignItems: "center",
        backgroundColor: "transparent",
        borderRadius: 56 / 2,
        flexDirection: "row",
        height: 56,
        justifyContent: "center",
        width: 56,
    },
    viewRowDescriberItemAck: {
        alignContent: FLEX_START,
        alignItems: FLEX_START,
        flexDirection: "column",
        justifyContent: FLEX_START,
        marginBottom: 21,
        marginTop: 24,
    },
    errorTextView: {
        alignContent: FLEX_START,
        alignItems: FLEX_START,
        flexDirection: "column",
        justifyContent: FLEX_START,
        marginTop: 8,
    },
    viewRow: {
        alignContent: FLEX_START,
        alignItems: FLEX_START,
        flexDirection: "row",
        justifyContent: SPACE_BETWEEN,
        marginBottom: 17,
        width: "100%",
    },
    viewRowLeftItem: {
        alignContent: FLEX_START,
        alignItems: FLEX_START,
        flexDirection: "row",
        justifyContent: FLEX_START,
    },
    viewRowRightItem: {
        alignContent: "flex-end",
        alignItems: "flex-end",
        flexDirection: "column",
        justifyContent: SPACE_BETWEEN,
        marginLeft: 5,
        paddingLeft: 5,
    },
    footerButtonView22: {
        marginBottom: 16,
        width: "100%",
    },
    footerButtonView: {
        width: "100%",
        marginTop: 8,
        marginBottom: 38,
    },
    footerButtonEmptyView: {
        width: "100%",
    },
    viewSendRow: {
        marginBottom: 5,
    },
};
export default withModelContext(ADAcknowledgement);
