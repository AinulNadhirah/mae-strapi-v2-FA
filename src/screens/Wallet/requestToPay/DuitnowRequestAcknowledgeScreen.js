import { useFocusEffect } from "@react-navigation/native";
import moment from "moment";
import PropTypes from "prop-types";
import React, { useCallback, useState, useEffect, useRef } from "react";
import {
    View,
    TouchableOpacity,
    ImageBackground,
    ScrollView,
    Dimensions,
    Alert,
    Linking,
} from "react-native";

import {
    SEND_REQUEST_MONEY_STACK,
    SEND_REQUEST_MONEY_DASHBOARD,
    REQUEST_TO_PAY_ADD_TO_FAVOURITES_SCREEN,
    COMMON_MODULE,
    PDF_VIEWER,
} from "@navigation/navigationConstant";

import ScreenLayout from "@layouts/ScreenLayout";

import ActionButton from "@components/Buttons/ActionButton";
import CustomPdfGenerator from "@components/Common/CustomPdfGenerator";
import ScreenContainer from "@components/Containers/ScreenContainer";
import Typography from "@components/Text";

import { withModelContext } from "@context";

import { checkS2WEarnedChances } from "@services";
import { RTPanalytics } from "@services/analytics/rtpAnalyticsSSL";

import {
    MEDIUM_GREY,
    YELLOW,
    DISABLED,
    DISABLED_TEXT,
    BLACK,
    WHITE,
    GREY,
    ROYAL_BLUE,
    FADE_GREY,
} from "@constants/colors";
import { modelType } from "@constants/data/DuitNowRPP";
import {
    YOUR_REQUEST_IS,
    RECIPIENT_ID,
    RECIPIENT_REFERENCE,
    AMOUNT,
    CURRENCY,
    RECEIPT_NOTE,
    REFERENCE_ID,
    DATE_AND_TIME,
    SHARE_RECEIPT,
    DONE,
    ADD_TO_FAVOURITES,
    SERVICE_FEES,
    REQUEST_EXPIRY_DATE,
    FREQUENCY,
    LIMIT_PER_TRANSACTION,
    CANCELLATION,
    TOTAL_FEE,
    PRODUCT_NAME,
    RTP_REQUEST_ID,
    TRANSACTION_TYPE,
    RECIPIENT_NAME_PLACE_HOLDER,
    DUITNOW_ID_TYPE,
    DUITNOW_ID_NUMBER,
    FILE_PERMISSION,
    TRANSACTION_SUCCESS,
    REQUEST_TIMEOUT,
    REQUEST_SUCCESSFUL,
    SUCCESSFUL_STATUS,
    SEND_DUITNOW_REQUEST,
    SUCC_STATUS,
    SEND_DUITNOW_AUTODEBIT,
    ALLOWED_STATUS,
    SECURE_VERIFICATION_AUTHORIZATION_EXPIRED,
    DD_MMM_YYYY,
} from "@constants/strings";

import { formateIDName, formateRefnumber, formateReqIdNumber } from "@utils/dataModel/utility";

import Assets from "@assets";

import AcknowledgeTimer from "./AcknowledgeTimer";

export const { width, height } = Dimensions.get("window");

/**
 * _getTodayDate()
 * get Temp Timestamp if date is null in response obj use this
 */
function _getTodayDate() {
    return moment(new Date()).format("D MMM YYYY, h:mm A");
}

const DuitnowRequestAcknowledgeScreen = (props) => {
    const [addingFavouriteStatus, setAddingFavouriteStatus] = useState(false);
    const [todayDate, setTodayDate] = useState(_getTodayDate());
    const [transactionStatus, setTransactionStatus] = useState(false);
    const [referenceNumber, setReferenceNumber] = useState("");
    const [transferMessage, setTransferMessage] = useState("");
    const [transferFlow, setTransferFlow] = useState(0);
    const [transactionRefNumber, setTransactionRefNumber] = useState("");
    const [transactionDate, setTransactionDate] = useState("");

    const [transactionType, setTransactionType] = useState("");
    const [transferFav, setTransferFav] = useState(false);
    const [transactionAmount, setTransactionAmount] = useState(false);
    const [rsaErrorMessage, setRsaErrorMessage] = useState("");
    const [transferParams, setTransferParams] = useState({});
    const [name, setName] = useState("");
    const [contact, setContact] = useState("");
    const [showLoaderModal, setShowLoaderModal] = useState(false);
    const [height, setHeight] = useState(800);
    const [isRsaLock, setIsRsaLock] = useState(false);
    const [hideTimer, setHideTimer] = useState(false);
    const [loader, setLoader] = useState(false);
    const [screenNameAnalytic, setScreenNameAnalytic] = useState(
        "DuitNowRequest_RequestSuccessful"
    );
    const timer = useRef();

    function checkForEarnedChances() {
        // check if campaign is running and check if it matched the list
        // delayed the check a lil bit to let user see the acknowledge screen
        timer?.current && clearTimeout(timer.current);

        timer.current = setTimeout(async () => {
            const { isTapTasticReady, tapTasticType } = props?.getModel(modelType?.misc);

            const response = await checkS2WEarnedChances({
                txnType: "DUITNOWRTPREQ",
            });

            if (response?.data) {
                const { displayPopup, chance, generic } = response.data || {};

                if (displayPopup) {
                    // go to earned chances screen
                    props?.navigation.push("TabNavigator", {
                        screen: "CampaignChancesEarned",
                        params: {
                            chances: chance,
                            isCapped: generic,
                            isTapTasticReady,
                            tapTasticType,
                        },
                    });
                }
            }
        }, 400);
    }

    /**
     * _trackAnalytics()
     * Track status on firebase analytics
     */
    function _trackAnalytics() {
        const { transferParams } = props?.route?.params;
        const { transactionStatus, formattedTransactionRefNumber } = transferParams || {};
        const analyticsViewName =
            transferParams.autoDebitEnabled && transactionStatus
                ? "DuitNowRequest_AutoDebitPaymentSuccesful"
                : transferParams.autoDebitEnabled && !transactionStatus
                ? "DuitNowRequest_AutoDebitRequestUnsuccessful"
                : !transactionStatus
                ? "DuitNowRequest_RequestUnsuccessful"
                : "DuitNowRequest_RequestSuccessful";
        setScreenNameAnalytic(analyticsViewName);

        if (transactionStatus) {
            if (transferParams.autoDebitEnabled) {
                if (formattedTransactionRefNumber) {
                    RTPanalytics.formCompleteADPayment(
                        SUCCESSFUL_STATUS,
                        formattedTransactionRefNumber
                    );
                }
            } else {
                if (formattedTransactionRefNumber) {
                    RTPanalytics.formComplete(formattedTransactionRefNumber);
                }
            }
        } else {
            if (transferParams.autoDebitEnabled) {
                if (formattedTransactionRefNumber) {
                    RTPanalytics.formCompleteADUnsuccessful(formattedTransactionRefNumber);
                }
            } else {
                if (formattedTransactionRefNumber) {
                    RTPanalytics.formError(formattedTransactionRefNumber);
                }
            }
        }
    }

    /**
     * _updateScreenUI()
     * Get Transaction data from previous screen and display the status
     */
    function _updateScreenUI() {
        //get Transaction data from previous screen
        const { transferParams, errorMessge, isRsaLock } = props?.route?.params || {};
        //get RSA  error if available
        const rsaErrorMessage = errorMessge ?? "";

        const {
            name,
            phoneNumber,
            amount,
            transferFlow,
            transferFav,
            transactionDate,
            transactionStatus,
            formattedTransactionRefNumber,
        } = transferParams || {};

        const transactionType = transferParams?.transactionType;
        const name1 = name;
        const contact = phoneNumber;
        const transactionAmount = amount;
        const refNo = formattedTransactionRefNumber
            ? formateRefnumber(formattedTransactionRefNumber)
            : props?.route?.params?.formattedTransactionRefNumber
            ? formateRefnumber(props?.route?.params?.formattedTransactionRefNumber)
            : null;
        //Get Transaction data from previous screen and store in state
        setHeight(height);
        setTransferParams(transferParams);
        setTodayDate(_getTodayDate());
        setReferenceNumber(refNo);
        setTransactionRefNumber(refNo);
        setTransferFlow(transferFlow);
        setTransactionStatus(transactionStatus);
        setTransactionDate(transactionDate || _getTodayDate());
        setTransactionType(transactionType ?? "");
        setTransferFav(transferFav);
        setAddingFavouriteStatus(transferFav);
        setTransactionAmount(transactionAmount);
        setName(formateIDName(name1, " ", 2));
        setContact(contact);
        setShowLoaderModal(false);
        setRsaErrorMessage(rsaErrorMessage);
        setIsRsaLock(isRsaLock ?? false);
        setHideTimer(false);
    }

    useEffect(() => {
        _getScreenData();
    }, [
        height,
        transferParams,
        todayDate,
        referenceNumber,
        transactionRefNumber,
        transferFlow,
        transactionStatus,
        transactionDate,
        transactionType,
        transferFav,
        addingFavouriteStatus,
        transactionAmount,
        name,
        contact,
        showLoaderModal,
        rsaErrorMessage,
        isRsaLock,
        hideTimer,
    ]);

    useEffect(() => {
        _updateScreenUI();
        _trackAnalytics();
        const { params } = props?.route || {};
        if (!params?.addingFavouriteStatus) {
            checkForEarnedChances();
        }
    }, []);

    useFocusEffect(
        useCallback(() => {
            const addingFavouriteStatus = params?.addingFavouriteStatus
                ? params?.addingFavouriteStatus
                : false;
            _updateScreenUI();
            setAddingFavouriteStatus(addingFavouriteStatus);
            setShowLoaderModal(false);
        }, [])
    );

    /**
     *_onDonePress()
     * @memberof RequestToPayAcknowledgeScreen. .
     *
     * transferFlow == 25 --> RPP - Request to pay / Duitnow request
     */
    async function _onDonePress() {
        const { transferParams, screenDate } = props?.route?.params || {};
        if (screenDate?.routeFrom === "SortToWin") {
            props?.navigation.navigate("GameStack", {
                screen: "Main",
                params: {
                    isFromWidget: true,
                },
            });
        } else if (transferParams?.isOnlineBanking) {
            const fullRedirectUrl = transferParams?.fullRedirectUrl;
            if (fullRedirectUrl) {
                Linking.openURL(fullRedirectUrl);
            }
        } else {
            props?.navigation?.navigate(SEND_REQUEST_MONEY_STACK, {
                screen: SEND_REQUEST_MONEY_DASHBOARD,
                params: { updateScreenData: true, doneFlow: true },
            });
        }
        // }
    }
    /**
     * _onAddFavourites()
     * Navigate to add to favourite screen
     */
    function _onAddFavourites() {
        RTPanalytics.addToFavourite();
        const data = props?.route?.params?.transferParams;
        const transferParamsData = {
            ...transferParams,
            ...data,
            accHolderName: transferParams?.receiverName || transferParams?.accHolderName,
            idTypeText: props?.route?.params?.selectedProxy?.name || transferParams?.idTypeText,
            idCode: transferParams?.senderProxyType || transferParams?.idCode,
            idValue: transferParams?.senderProxyValue || transferParams?.idValue,
            idType: transferParams?.senderProxyType || transferParams?.idType,
            transactionType: transferParams?.transactionType,
            duitNowRequest: true,
            formattedTransactionRefNumber: referenceNumber,
            image: {
                image: "icDuitNowCircle",
                imageName: "icDuitNowCircle",
                imageUrl: "icDuitNowCircle",
            },
        };
        props?.navigation.navigate(REQUEST_TO_PAY_ADD_TO_FAVOURITES_SCREEN, {
            transferParams: transferParamsData,
        });
    }

    /**
     * _getScreenData()
     * Get screen data and store in state
     * Set Transfer status
     */
    function _getScreenData() {
        const transferParams = props?.route?.params?.transferParams ?? {};
        const params = props?.route?.params;
        const { errorMessage, statusDescription, formattedTransactionRefNumber } = transferParams;

        //Get Transaction Reference Number
        const referenceNo = formattedTransactionRefNumber
            ? formattedTransactionRefNumber
            : props?.route?.params?.formattedTransactionRefNumber
            ? formateRefnumber(props?.route?.params?.formattedTransactionRefNumber)
            : null;
        //Set Transaction Status
        const action = YOUR_REQUEST_IS;

        //Get Transaction message + status
        const modStatus =
            statusDescription === "Authentication process Completed"
                ? "successful"
                : statusDescription ?? params?.statusDescription;
        const message = errorMessage || action + (modStatus ?? "");

        //Get Transaction date
        const modtransactionDate = _getTodayDate();

        setReferenceNumber(referenceNo ? referenceNo.toString() : "");
        setTransferMessage(rsaErrorMessage || message);
        setTransactionDate(modtransactionDate);
    }

    /**
     * _onShareReceiptClick()
     * On Share receipt button Click
     * Construct Receipt View
     */
    async function _onShareReceiptClick() {
        try {
            setShowLoaderModal(true);
            setHideTimer(true);
            const { transferParams } = props?.route?.params;
            if (transferParams?.autoDebitEnabled) {
                RTPanalytics.shareReceiptADPayment(SUCCESSFUL_STATUS);
            } else {
                RTPanalytics.shareReceiptPayment(SUCCESSFUL_STATUS);
            }

            const {
                referenceNumber,
                amount,
                formattedTransactionRefNumber,
                serviceFee,
                consentFrequency,
                consentFrequencyText,
                consentMaxLimit,
                consentMaxLimitFormatted,
                consentStartDate,
                consentExpiryDate,
                productInfo,
                requestExpiryDate,
            } = transferParams;

            const receiptTitle = SEND_DUITNOW_REQUEST;
            const statusType = SUCC_STATUS;
            const statusText = SUCCESSFUL_STATUS;
            const transactionExpiryDate = props?.route?.params?.expiryDateTime;
            const dateExpire = transactionExpiryDate ?? requestExpiryDate;
            const detailsArray = [];

            //Add Recipient ID with date
            detailsArray.push({
                label: RECIPIENT_ID,
                value: formattedTransactionRefNumber
                    ? formattedTransactionRefNumber
                    : formateRefnumber(referenceNumber) ??
                      formateRefnumber(props?.route?.params?.formattedTransactionRefNumber) ??
                      "",
                showRightText: true,
                rightTextType: "text",
                rightStatusType: "",
                rightText: transactionDate,
            });
            detailsArray.push({
                label: RTP_REQUEST_ID,
                value:
                    formateReqIdNumber(transferParams.requestId) ??
                    formateReqIdNumber(props?.route?.params?.requestId) ??
                    formateReqIdNumber(transferParams?.transactionresponse?.bizMsgId) ??
                    "",
                showRightText: false,
            });
            detailsArray.push({
                label: RECIPIENT_NAME_PLACE_HOLDER,
                value: (transferParams?.receiverName || transferParams?.debtorName) ?? "",
                showRightText: false,
            });
            detailsArray.push({
                label: DUITNOW_ID_TYPE,
                value: transferParams?.idTypeText ?? "",
                showRightText: false,
            });
            detailsArray.push({
                label: DUITNOW_ID_NUMBER,
                value: transferParams?.idValueFormatted ?? "",
                showRightText: false,
            });
            detailsArray.push({
                label: RECIPIENT_REFERENCE,
                value: transferParams?.reference,
                showRightText: false,
            });
            detailsArray.push({
                label: REQUEST_EXPIRY_DATE,
                value: moment(dateExpire).format(DD_MMM_YYYY),
                showRightText: false,
            });

            const amountNumber = parseFloat(amount);

            if (amountNumber < 5000.0) {
                //Add Amount field
                detailsArray.push({
                    label: AMOUNT,
                    value: CURRENCY + amount,
                    isAmount: true,
                    showRightText: false,
                });
            }

            if (serviceFee && amountNumber > 5000.0) {
                //Add service fee
                detailsArray.push({
                    label: SERVICE_FEES,
                    value: `${CURRENCY} ${parseFloat(serviceFee).toFixed(2)}`,
                    showRightText: false,
                });
                //Add Amount field
                detailsArray.push({
                    label: AMOUNT,
                    value: CURRENCY + amount,
                    isAmount: true,
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

            //Add Autodebit field

            const additionalData =
                (consentFrequency && consentMaxLimit) || transferParams?.coupleIndicator
                    ? {
                          status: SUCCESSFUL_STATUS,
                          reference: {
                              text: RECIPIENT_REFERENCE,
                              value: formateRefnumber(formattedTransactionRefNumber),
                          },
                          frequency: { text: FREQUENCY, value: consentFrequencyText },
                          limit: {
                              text: LIMIT_PER_TRANSACTION,
                              value: "RM " + consentMaxLimitFormatted,
                          },
                          cancellation: { text: CANCELLATION, value: ALLOWED_STATUS },
                          date: {
                              start: moment(consentStartDate).format(DD_MMM_YYYY),
                              end: moment(consentExpiryDate).format(DD_MMM_YYYY),
                          },
                          product: { text: PRODUCT_NAME, value: productInfo?.productName },
                          header: SEND_DUITNOW_AUTODEBIT,
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
                pdfType: "shareReceipt",
                title: SHARE_RECEIPT,
                transferParams,
            };
            setShowLoaderModal(false);
            // Navigate to PDF viewer to display PDF

            props?.navigation?.navigate(COMMON_MODULE, {
                screen: PDF_VIEWER,
                params: navParams,
            });
        } catch (error) {
            setLoader(false);
            setShowLoaderModal(false);
        }
    }
    const params = props?.route?.params;
    const _transferParams = props?.route?.params?.transferParams;
    const trxStatus = transactionStatus || params.transactionStatus;
    const toShowAddFavorites =
        transferFlow === 25 && trxStatus && !transferFav && !addingFavouriteStatus;

    const onlineBkngData = {
        isFromAcknowledge: true,
        hideTimer,
        isTimeout: _transferParams?.isTimeout || !_transferParams.transactionStatus,
    };
    const message =
        _transferParams?.status === "M408"
            ? SECURE_VERIFICATION_AUTHORIZATION_EXPIRED
            : transferParams.transactionStatus
            ? REQUEST_SUCCESSFUL
            : !_transferParams.transactionStatus && _transferParams?.coupleIndicator
            ? TRANSACTION_SUCCESS
            : _transferParams?.isTimeout
            ? REQUEST_TIMEOUT
            : transferMessage;

    return (
        <ScreenContainer
            backgroundType="color"
            backgroundColor={MEDIUM_GREY}
            showLoaderModal={showLoaderModal}
            showErrorModal={false}
            analyticScreenName={screenNameAnalytic}
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
                                        trxStatus === true || params?.transactionStatus === true
                                            ? Assets.icTickNew
                                            : Assets.icFailedIcon
                                    }
                                    resizeMode="contain"
                                />
                            </View>
                            <View style={Styles.viewRowDescriberItemAck}>
                                <Typography
                                    fontSize={20}
                                    fontWeight="400"
                                    fontStyle="bold"
                                    letterSpacing={0}
                                    lineHeight={28}
                                    textAlign="left"
                                    text={message}
                                />

                                {_transferParams?.isOnlineBanking && !hideTimer ? (
                                    <View style={Styles.errorTextView}>
                                        <AcknowledgeTimer
                                            time={8}
                                            cancelTimeout={true}
                                            navigation={props?.navigation}
                                            params={{
                                                transferParams: {
                                                    ..._transferParams,
                                                    ...onlineBkngData,
                                                },
                                                screenDate: params?.screenDate,
                                            }}
                                        />
                                    </View>
                                ) : null}
                                {_transferParams?.showDesc &&
                                _transferParams?.isTimeout &&
                                !_transferParams?.isFromAcknowledge ? (
                                    <View style={Styles.errorTextView}>
                                        <Typography
                                            fontSize={12}
                                            fontWeight="normal"
                                            fontStyle="normal"
                                            letterSpacing={0}
                                            lineHeight={18}
                                            textAlign="left"
                                            color={FADE_GREY}
                                            text={_transferParams?.transactionResponseError}
                                        />
                                    </View>
                                ) : null}
                            </View>
                            {_transferParams?.subMessage ? (
                                <View style={Styles.viewSubmessageTextView}>
                                    <Typography
                                        fontSize={16}
                                        fontWeight="300"
                                        fontStyle="normal"
                                        letterSpacing={0}
                                        lineHeight={28}
                                        textAlign="left"
                                        text={_transferParams?.subMessage}
                                    />
                                </View>
                            ) : null}
                            {_transferParams?.status === "M408" ? null : referenceNumber &&
                              referenceNumber.length >= 1 ? (
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
                            {_transferParams?.status === "M408" ? null : transactionType ? (
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
                        {transferFlow === 25 && trxStatus && (
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
                        )}
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
                                        text={DONE}
                                        fontSize={14}
                                        fontWeight="600"
                                        lineHeight={18}
                                    />
                                }
                            />
                        </View>
                        {toShowAddFavorites ? (
                            <View style={Styles.addFavBtnContainer}>
                                <TouchableOpacity onPress={_onAddFavourites}>
                                    <Typography
                                        fontSize={14}
                                        fontWeight="600"
                                        fontStyle="normal"
                                        letterSpacing={0}
                                        lineHeight={18}
                                        text={ADD_TO_FAVOURITES}
                                        color={ROYAL_BLUE}
                                    />
                                </TouchableOpacity>
                            </View>
                        ) : null}
                    </View>
                </React.Fragment>
            </ScreenLayout>
        </ScreenContainer>
    );
};

DuitnowRequestAcknowledgeScreen.propTypes = {
    getModel: PropTypes.func,
    route: PropTypes.object,
    navigation: PropTypes.object,
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
        marginBottom: 24,
        marginTop: 24,
    },
    viewSubmessageTextView: {
        alignContent: FLEX_START,
        alignItems: FLEX_START,
        flexDirection: "column",
        justifyContent: FLEX_START,
        marginTop: 4,
        marginBottom: 30,
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

export default withModelContext(DuitnowRequestAcknowledgeScreen);
