import moment from "moment";
import PropTypes from "prop-types";
import React, { useEffect, useState } from "react";
import { View, ImageBackground, ScrollView, Dimensions, Alert } from "react-native";

import {
    AUTOBILLING_STACK,
    AUTOBILLING_DASHBOARD,
    COMMON_MODULE,
    PDF_VIEWER,
    SETTINGS_MODULE,
    DUITNOW_DASHBOARD,
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
import { MBB_BANK_SWIFT_CODE } from "@constants/fundConstants";
import {
    RECIPIENT_ID,
    RECEIPT_NOTE,
    REFERENCE_ID,
    DATE_AND_TIME,
    TRANSACTION_TYPE,
    SHARE_RECEIPT,
    SHARERECEIPT,
    DONE,
    RECIPIENT_REFERENCE,
    PRODUCT_NAME,
    FREQUENCY,
    LIMIT_PER_TRANSACTION,
    RTP_AUTODEBIT_ID,
    RESUME_DUITNOW_POPUP_TITLE,
    PAUSE_DUITNOW_POPUP_TITLE,
    CANCEL_DUITNOW_AUTODEBIT,
    SWITCH_ACCOUNT_TITLE,
    AMOUNT,
    SECURE_VERIFICATION_AUTHORIZATION_EXPIRED,
    SET_UP_AUTOBILLING_REQUEST_MESSAGE,
    RTP_CHARGE_CUSTOMER,
    AUTHORISATION_FAILED_TITLE,
    FROM_ACCOUNT,
    FILE_PERMISSION,
    DUITNOW_ID_NUMBER,
    RECIPIENT_NAME_PLACE_HOLDER,
    DUITNOW_AUTODEBIT_CARD_TITLE,
    DD_MMM_YYYY,
    TRANSACTION_UNSUCCESS,
    TRANSACTION_SUCCESS,
    SETTING_AD,
    CHARGE_AB,
    SETUP_AB,
    DUITNOW_AB_DESC,
    DATE_TIME_FORMAT_DISPLAY2,
    SUCCESSFUL_STATUS,
} from "@constants/strings";

import { numberMasking } from "@utils/dataModel/rtdHelper";
import { formateRefnumber, formateAccountNumber } from "@utils/dataModel/utility";

import Assets from "@assets";

export const { width, height } = Dimensions.get("window");

function ABAcknowledgement({ navigation, route }) {
    const [transactionStatus, setTransactionStatus] = useState(false);
    const [referenceNumber, setReferenceNumber] = useState("");
    const [transferMessage, setTransferMessage] = useState("");
    const [transferFlow, setTransferFlow] = useState(27);
    const [transactionDate, setTransactionDate] = useState("");
    const [transferParams, setTransferParams] = useState({});
    const [showErrorModal] = useState(false);
    const [showLoaderModal, setShowLoaderModal] = useState(false);
    const [transactionType, setTransactionType] = useState(false);
    const [subMessage, setSubMessage] = useState("");
    const [loader, setLoader] = useState(false);

    useEffect(() => {
        const transferParams = route.params?.transferParams;
        const { formattedTransactionRefNumber } = transferParams || {};
        updateScreenUI();
        navigation.addListener("focus", () => {
            updateScreenUI();
            /**
             * Hide add to favourite button when successfully added and come back to this screen
             */
            setShowLoaderModal(false);
        });
        if (transferParams?.transactionStatus) {
            RTPanalytics.viewDNSettingsSwitchAccAckSuccess();
            RTPanalytics.formDNSettingsSwitchAccAckSuccess(formattedTransactionRefNumber);
        } else {
            RTPanalytics.viewDNSettingsSwitchAccAckError();
        }
        RTPanalytics.formDNSettingsSwitchAccAckError(formattedTransactionRefNumber);
    }, []);

    /**
     * _getTodayDate()
     * get Temp Timestamp if date is null in response obj use this
     */
    function getTodayDate() {
        return moment(new Date()).format("D MMM YYYY, h:mm A");
    }

    /**
     * _updateScreenUI()
     * Get Transaction data from previous screen and display the status
     */
    function updateScreenUI() {
        //get Transaction data from previous screen
        const { transferParams } = route.params || {};

        const { transactionDate, transactionStatus, formattedTransactionRefNumber } =
            transferParams || {};

        //transferFlow 30 - cancel autodebit
        //transferFlow 31 - cancel autobilling
        //transferFlow 34 - cancel trx after resume
        //transferFlow 35 - switch Account
        const modFlow = route.params?.isRequestAgain
            ? 27
            : transferParams?.isCancel
            ? 30 || 31 || 34
            : transferParams?.pauseRequest
            ? 32
            : transferParams?.resumeRequest
            ? 33
            : transferParams?.switchAccountRequest || transferParams?.transferFlow === 35
            ? 35
            : transferParams?.transferFlow ?? transferFlow;

        //Get Transaction data from previous screen and store in state
        setTransferParams(transferParams);
        setReferenceNumber(formattedTransactionRefNumber);
        setTransferFlow(modFlow);
        setTransactionStatus(transactionStatus);
        setTransactionDate(transactionDate || getTodayDate());
        setShowLoaderModal(false);

        getScreenData(modFlow);
    }

    /**
     * transferFlow === 27 --> Request To Billing
     * transferFlow === 28 --> Update Billing Status
     */
    function onDonePress() {
        const item = route.params;
        if (item?.from === SETTING_AD || item?.transferParams?.from === SETTING_AD) {
            navigation.navigate(SETTINGS_MODULE, {
                screen: DUITNOW_DASHBOARD,
                params: { updateScreenData: true, doneFlow: true },
            });
        } else {
            navigation.navigate(AUTOBILLING_STACK, {
                screen: AUTOBILLING_DASHBOARD,
                params: { updateScreenData: true, doneFlow: true },
            });
        }
    }

    /**
     * Get screen data and store in state
     * Set Transfer status
     */
    function getScreenData(modFlow) {
        const transferParams = route.params?.transferParams ?? {};
        const wrongTac = route?.params?.errors?.[0];
        const item = transferParams;
        const { transactionDate, transactionStatus } = transferParams || {};
        const transactionresponse =
            transferParams?.transactionresponse || route.params?.transactionresponse;
        const referenceNumber = transactionresponse?.msgId || transactionresponse?.transactionId;
        //Get Transaction Reference Number
        const referenceNo =
            referenceNumber?.length > 10
                ? formateRefnumber(referenceNumber)
                : referenceNumber || formateRefnumber(item?.formattedTransactionRefNumber);
        //Set Transaction Status
        const transactionType =
            modFlow === 27
                ? SET_UP_AUTOBILLING_REQUEST_MESSAGE
                : modFlow === 28
                ? RTP_CHARGE_CUSTOMER
                : modFlow === 30 || modFlow === 31 || modFlow === 34
                ? CANCEL_DUITNOW_AUTODEBIT
                : modFlow === 32
                ? PAUSE_DUITNOW_POPUP_TITLE
                : modFlow === 33
                ? RESUME_DUITNOW_POPUP_TITLE
                : modFlow === 35
                ? SWITCH_ACCOUNT_TITLE
                : SET_UP_AUTOBILLING_REQUEST_MESSAGE;

        const message =
            transferParams?.status === "M408"
                ? SECURE_VERIFICATION_AUTHORIZATION_EXPIRED
                : transferParams?.s2uSignRespone?.status === "M201"
                ? AUTHORISATION_FAILED_TITLE
                : transactionStatus === false
                ? TRANSACTION_UNSUCCESS
                : TRANSACTION_SUCCESS;

        //Get Transaction date
        const modtransactionDate =
            transactionDate && transactionDate !== "N/A" && transferFlow === 28
                ? moment(transactionDate, [
                      "YYYY-MM-DD:hh:mm:ss",
                      DATE_TIME_FORMAT_DISPLAY2,
                  ]).format(DATE_TIME_FORMAT_DISPLAY2)
                : getTodayDate();

        const refNo = referenceNo
            ? referenceNo.toString()
            : transferParams?.statusDescription === "Declined" && transferParams?.tacType === false
            ? wrongTac?.refId
            : transferParams?.transactionStatus === false && transferParams?.tacType === true
            ? formateRefnumber(route?.params?.errors?.result?.msgId) ||
              item?.formattedTransactionRefNumber
            : transferParams?.s2uType === false
            ? formateRefnumber(transferParams?.formatRefNumber)
            : transferParams.switchAcc === true
            ? formateRefnumber(transferParams?.transactionReferenceNumber)
            : "";

        const subMessage =
            transferParams?.s2uSignRespone?.status === "M201"
                ? transferParams.s2uSignRespone?.text
                : "";

        setReferenceNumber(refNo);
        setTransferMessage(message);
        setSubMessage(subMessage);
        setTransactionType(transactionType);
        setTransactionDate(modtransactionDate);
        gaTrigger(transactionStatus);
    }

    function gaTrigger(transactionStatus) {
        // GA for approve and cancel autobilling
        // transfer flow 27 is approve AB
        if (transactionStatus) {
            if (transferFlow === 27) {
                RTPanalytics.screenLoadABSubmitted();
                RTPanalytics.formABSubmitted(referenceNumber);
            } else if (transferParams?.isCancel) {
                RTPanalytics.screenLoadABCancelSuccess();
                RTPanalytics.formABCancelSuccess(referenceNumber);
            }
        } else if (!transactionStatus) {
            if (transferFlow === 27) {
                RTPanalytics.screenLoadABUnsuccessful();
                RTPanalytics.screenLoadABUnsuccessful(referenceNumber);
            } else if (transferParams?.isCancel) {
                RTPanalytics.screenLoadABCancelUnsuccess();
                RTPanalytics.formABCanceUnsuccess(referenceNumber);
            }
        }
    }

    /**
     * _onShareReceiptClick()
     * On Share receipt button Click
     * Construct Receipt View
     */
    async function onShareReceiptClick() {
        RTPanalytics.ABShareReceipt();
        RTPanalytics.screenLoadABShareReceipt();

        try {
            setShowLoaderModal(true);
            const { transferParams } = route.params || {};

            const {
                reference,
                consentFrequency,
                consentMaxLimitFormatted,
                consentStartDate,
                consentExpiryDate,
                selectedMerchant,
                productInfo,
                transactionresponse,
                selectedAccount,
            } = transferParams || {};
            const receiptTitle = transferParams?.isChargeCustomer ? CHARGE_AB : SETUP_AB;
            const statusType = "Success";
            const statusText = SUCCESSFUL_STATUS;

            const detailsArray = transferParams?.isChargeCustomer
                ? [
                      {
                          label: RECIPIENT_ID,
                          value: transactionresponse?.msgId
                              ? formateRefnumber(transactionresponse?.msgId)
                              : "",
                          showRightText: true,
                          rightTextType: "text",
                          rightStatusType: "",
                          rightText: transactionDate,
                      },
                      {
                          label: "Payer's name",
                          value: transferParams?.debtorName,
                          showRightText: false,
                      },
                      {
                          label: DUITNOW_ID_NUMBER,
                          value: transferParams?.debtorProxy,
                          showRightText: false,
                      },
                      {
                          label: "Payer's bank",
                          value:
                              transferParams?.debtorBankCode === MBB_BANK_SWIFT_CODE
                                  ? "Maybank"
                                  : transferParams?.debtorBankName,
                          showRightText: false,
                      },
                      {
                          label: RECIPIENT_REFERENCE,
                          value: transferParams?.ref1,
                          showRightText: false,
                      },
                      {
                          label: AMOUNT,
                          value: "RM " + transferParams?.amount,
                          showRightText: false,
                      },
                  ]
                : [
                      {
                          label: RECIPIENT_ID,
                          value: transactionresponse?.msgId
                              ? formateRefnumber(transactionresponse?.msgId)
                              : "",
                          showRightText: true,
                          rightTextType: "text",
                          rightStatusType: "",
                          rightText: transactionDate,
                      },
                      {
                          label: FROM_ACCOUNT,
                          value: `${selectedAccount?.name}<br/><br/>${numberMasking(
                              formateAccountNumber(selectedAccount?.number, 12)
                          )}`,
                          showRightText: false,
                      },
                      {
                          label: RECIPIENT_NAME_PLACE_HOLDER,
                          value: selectedMerchant?.merchantName,
                          showRightText: false,
                      },
                      {
                          label: RECIPIENT_REFERENCE,
                          value: reference,
                          showRightText: false,
                      },
                  ];
            const freqObj = frequencyList.find((el) => el.code === consentFrequency);

            const additionalData =
                (freqObj?.name || transferParams?.consentFrequencyText) &&
                (transferParams?.maxAmount || consentMaxLimitFormatted)
                    ? {
                          title: DUITNOW_AUTODEBIT_CARD_TITLE,
                          desc: DUITNOW_AB_DESC,
                          product: {
                              text: PRODUCT_NAME,
                              value: transferParams?.isChargeCustomer
                                  ? transferParams?.productName
                                  : productInfo?.productName,
                          },
                          frequency: {
                              text: FREQUENCY,
                              value: transferParams?.isChargeCustomer
                                  ? transferParams?.consentFrequencyText
                                  : freqObj?.name,
                          },
                          limit: {
                              text: LIMIT_PER_TRANSACTION,
                              value: transferParams?.isChargeCustomer
                                  ? "RM " + transferParams?.maxAmount
                                  : "RM " + consentMaxLimitFormatted,
                          },
                          id: {
                              text: RTP_AUTODEBIT_ID,
                              value: transferParams?.isChargeCustomer
                                  ? transferParams?.consentId
                                  : transactionresponse?.consentId,
                          },
                          date: {
                              start: transferParams?.isChargeCustomer
                                  ? moment(transferParams?.startDate).format(DD_MMM_YYYY)
                                  : moment(consentStartDate).format(DD_MMM_YYYY),
                              end: transferParams?.isChargeCustomer
                                  ? moment(transferParams?.expiryDate).format(DD_MMM_YYYY)
                                  : moment(consentExpiryDate).format(DD_MMM_YYYY),
                          },
                      }
                    : null;
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
                additionalData
            );
            if (file === null) {
                Alert.alert(FILE_PERMISSION);
                return;
            }

            const navParams = {
                file,
                share: true,
                type: "file",
                pdfType: SHARERECEIPT,
                title: SHARE_RECEIPT,
                transferParams,
            };
            setShowLoaderModal(false);
            // Navigate to PDF viewer to display PDF

            navigation.navigate(COMMON_MODULE, {
                screen: PDF_VIEWER,
                params: navParams,
            });
        } catch (error) {
            setShowLoaderModal(false);
            setLoader(false);
        }
    }

    const routeParams = route.params?.transferParams;

    return (
        <ScreenContainer
            backgroundType="color"
            backgroundColor={MEDIUM_GREY}
            showLoaderModal={showLoaderModal}
            showErrorModal={showErrorModal}
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
                                        routeParams?.transactionStatus ||
                                        routeParams?.transferParams?.item?.transactionStatus
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

                                {routeParams?.statusDescription === "Declined" || subMessage ? (
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
                                                routeParams?.statusDescription === "Declined"
                                                    ? routeParams?.errorMessage ||
                                                      routeParams?.s2uSignRespone?.text
                                                    : subMessage
                                            }
                                        />
                                    </View>
                                ) : null}
                            </View>
                            {routeParams?.status ===
                            "M408" ? null : routeParams?.statusDescription === "Declined" ||
                              (referenceNumber && referenceNumber.length >= 5) ? (
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

                            {!(
                                transferFlow === 35 &&
                                !route.params?.from === SETTING_AD &&
                                routeParams?.transactionStatus === false
                            ) &&
                            (routeParams?.status === "M408"
                                ? null
                                : routeParams?.showTransactionType ||
                                  routeParams?.transactionStatus ||
                                  route.params?.from === SETTING_AD ||
                                  routeParams?.s2uSignRespone?.status === "M201") ? (
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
                                            text={transactionType ?? ""}
                                        />
                                    </View>
                                </View>
                            ) : null}
                        </View>
                    </ScrollView>
                    <View style={Styles.footerContainer}>
                        {(transferFlow === 27 || transferFlow === 28) && transactionStatus && (
                            <View style={Styles.shareBtnContainer}>
                                <ActionButton
                                    disabled={false}
                                    fullWidth
                                    borderRadius={25}
                                    borderWidth={0.5}
                                    borderColor={GREY}
                                    onPress={onShareReceiptClick}
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
                        )}
                        <View style={Styles.doneBtnContainer}>
                            <ActionButton
                                disabled={false}
                                fullWidth
                                borderRadius={25}
                                onPress={onDonePress}
                                backgroundColor={loader ? DISABLED : YELLOW}
                                componentCenter={
                                    <Typography
                                        color={loader ? DISABLED_TEXT : BLACK}
                                        text={DONE}
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
ABAcknowledgement.propTypes = {
    getModel: PropTypes.func,
    resetModel: PropTypes.func,
    route: PropTypes.object,
    navigation: PropTypes.object,
};
export default withModelContext(ABAcknowledgement);
