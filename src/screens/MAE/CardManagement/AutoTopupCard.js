import { useFocusEffect } from "@react-navigation/native";
import PropTypes from "prop-types";
import React, { useState, useEffect, useCallback } from "react";
import { StyleSheet, View } from "react-native";

import { CardList } from "@screens/MAE/Topup/TopupCardBankListScreen";
import { fetchCardsData } from "@screens/MAE/Topup/TopupController";
import { navigateToS2UCooling } from "@screens/OneTapAuth/CoolingNavigator";

import {
    MAE_CARD_STATUS,
    MAE_CARDDETAILS,
    BANKINGV2_MODULE,
    ONE_TAP_AUTH_MODULE,
    SECURE2U_COOLING,
} from "@navigation/navigationConstant";

import HeaderLayout from "@layouts/HeaderLayout";
import ScreenLayout from "@layouts/ScreenLayout";

import HeaderBackButton from "@components/Buttons/HeaderBackButton";
import { GridButtons } from "@components/Common";
import ScreenContainer from "@components/Containers/ScreenContainer";
import OtpModal from "@components/Modals/OtpModal";
import Secure2uAuthenticationModal from "@components/Modals/Secure2uAuthenticationModal";
import Popup from "@components/Popup";
import RollingTab from "@components/Tabs/RollingTab";
import Typography from "@components/Text";
import { showErrorToast, showInfoToast, showSuccessToast } from "@components/Toast";

import { useModelController } from "@context";

import { callMergeFpxPanList, requestTAC, autoTopupRegister, removePanList } from "@services";
import { GAMAECardScreen } from "@services/analytics/analyticsSTPMae";

import { MEDIUM_GREY, BLACK } from "@constants/colors";
import {
    SUCC_STATUS,
    COMMON_ERROR_MSG,
    FAIL_STATUS,
    DATE_AND_TIME,
    CARD_REMOVE_DESC,
    REFERENCE_ID,
    SECURE2U_IS_DOWN,
    AUTO_TOPUP_SUCCESS_ACTIVATE,
    AUTO_TOPUP_SUCCESS_UPDATE,
    AUTO_TOPUP_UNSUCCESSFUL,
} from "@constants/strings";
import { MAE_REQ_TAC, AUTO_TOPUP_REG } from "@constants/url";

import { maskedMobileNumber } from "@utils";
import { checks2UFlow } from "@utils/dataModel/utility";

import assets from "@assets";

const ATtxnCodeS2u = 39;

function AutoTopupCard({ route, navigation }) {
    const [showLoader, setShowLoader] = useState(false);
    const [cardListArray, setCardListArray] = useState([]);
    const [selectedCard, setSelectedCard] = useState({});
    const [cardToBeRemoved, setCardToBeRemoved] = useState({});
    const [cardRemovePopup, setCardRemovePopup] = useState(false);
    const [showOTP, setShowOTP] = useState(false);
    const [token, setToken] = useState(null);
    const [mobileNumber, setMobileNumber] = useState("");
    const [maskedMobileNo, setMaskedMobileNumber] = useState("");
    const { getModel, updateModel } = useModelController();
    const [detailsArray, setDetailsArray] = useState([]);
    const [s2u, setS2uData] = useState({
        flow: null,
        secure2uValidateData: null,
        showS2u: false,
        pollingToken: "",
        s2uTransactionDetails: [],
        nonTxnData: { isNonTxn: true, nonTxnTitle: "Auto top up" },
        secure2uExtraParams: {
            metadata: { txnType: "AUTO_TOPUP_REG" },
        },
    });

    useEffect(() => {
        init();
    }, [init]);

    useEffect(() => {
        if (selectedCard?.identifier) {
            if (s2u.flow === "S2U") {
                autoTopupRegisterApi();
            } else {
                requestOTP();
            }
        }
    }, [autoTopupRegisterApi, requestOTP, s2u.flow, selectedCard]);

    const init = useCallback(() => {
        console.log("[AutoTopupCard] >> [init]");
        const params = route?.params ?? {};
        const { m2uPhoneNumber } = getModel("m2uDetails");

        checkS2UStatus();
        setMaskedMobileNumber(maskedMobileNumber(m2uPhoneNumber));
        setMobileNumber(m2uPhoneNumber);
        if (!params.isAddCard) getCardData();
    }, [checkS2UStatus, getCardData, getModel, route?.params]);

    useFocusEffect(
        useCallback(() => {
            const params = route?.params ?? {};
            console.log("AutoTopupCard onFocus");
            if (params.isAddCard) {
                if (params.status === "success") {
                    getCardData();
                } else {
                    navigation.navigate(MAE_CARDDETAILS, {
                        reload: true,
                    });
                }
            }
            if (params.isS2UReg) handleS2uFlow();
        }, [getCardData, handleS2uFlow, navigation, route?.params])
    );

    const getCardData = useCallback(() => {
        try {
            const params = route?.params ?? {};
            const accNo = params?.customerInfo?.maeAcctNo?.substring(0, 12);
            const reqParams = JSON.stringify({
                acctNo: accNo,
            });
            setShowLoader(true);
            callMergeFpxPanList(reqParams, true).then(async (response) => {
                const result = response?.data?.result;
                const statusCode = result?.statusCode ?? null;
                if (statusCode === "0000") {
                    const cardListArray =
                        result.cardDetails && result.cardDetails.length > 0
                            ? result.cardDetails
                            : [];
                    const data = fetchCardsData("AUTO_TOPUP", cardListArray);
                    setCardListArray(data?.cardListArray ?? []);
                }
                setShowLoader(false);
            });
        } catch (e) {
            setShowLoader(false);
        }
    }, [route?.params]);

    const handleS2uFlow = useCallback(async () => {
        //passing new parameter updateModel for s2u interops
        const { flow, secure2uValidateData } = await checks2UFlow(
            ATtxnCodeS2u,
            getModel,
            updateModel
        );
        const { goBack } = navigation;
        const {
            params: { isS2UReg },
        } = route;
        if (flow === "S2UReg" && isS2UReg) goBack();
        setS2uData({ ...s2u, secure2uValidateData, flow });
    }, [getModel, navigation, route, s2u, updateModel]);

    const checkS2UStatus = useCallback(async () => {
        const { flow, secure2uValidateData } = await checks2UFlow(
            ATtxnCodeS2u,
            getModel,
            updateModel
        );
        setS2uData({ ...s2u, secure2uValidateData, flow });
        if (flow === SECURE2U_COOLING) {
            const { navigate } = navigation;
            navigateToS2UCooling(navigate);
        } else if (flow === "S2UReg") {
            const { setParams, navigate } = navigation;
            setParams({ isS2UReg: true });
            navigate(ONE_TAP_AUTH_MODULE, {
                screen: "Activate",
                params: {
                    flowParams: {
                        success: {
                            stack: BANKINGV2_MODULE,
                            screen: "AutoTopupCard",
                        },
                        fail: {
                            stack: BANKINGV2_MODULE,
                            screen: "",
                        },
                        params: { ...route.params },
                    },
                },
            });
        } else if (flow === "TAC") {
            showInfoToast({ message: SECURE2U_IS_DOWN });
        }
    }, [getModel, navigation, route.params, s2u, updateModel]);

    const onBackTap = useCallback(() => {
        console.log("[AutoTopupCard] >> [onBackTap]");
        navigation.goBack();
    }, [navigation]);

    const onAddNewCardButtonPress = useCallback(() => {
        console.log("[AutoTopupCard] >> [onAddNewCardButtonPress]");
        const params = route?.params ?? {};
        const accNo = params.customerInfo.maeAcctNo.substring(0, 12);
        navigation.navigate("TopupAddCardScreen", {
            ...params,
            acctNo: accNo,
            transactionType: "AUTO_TOPUP",
            auth: "",
            status: "",
            headerText: "",
            serverError: "",
            txnRefNo: "",
            data: "",
            detailsArray: [],
        });
    }, [navigation, route?.params]);

    const onCardListItemPress = useCallback((item) => {
        console.log("[AutoTopupCard] >> [onCardListItemPress]");
        setSelectedCard(item);
    }, []);

    const onCardRemoveIconPress = useCallback((item) => {
        console.log("[AutoTopupCard] >> [onCardRemoveIconPress]");
        setCardRemovePopup(true);
        setCardToBeRemoved(item);
        //cardToBeRemoved
    }, []);

    const onCancelRemoveCard = useCallback(() => {
        console.log("[AutoTopupCard] >> [onCancelRemoveCard]");
        setCardRemovePopup(false);
        setCardToBeRemoved({});
    }, []);

    const onConfirmRemoveCard = async () => {
        console.log("[AutoTopupCard] >> [onConfirmRemoveCard]");
        await onCardRemove(cardToBeRemoved);
    };

    const onCardRemove = (item) => {
        // Request object
        const reqParams = JSON.stringify({
            txnRefNo: item.identifier,
        });

        removePanList(reqParams, true)
            .then((response) => {
                const result = response?.data?.result;
                const statusCode = result?.statusCode ?? null;
                const statusDesc = result?.statusDesc ?? null;
                const cardDetails = result?.cardDetails ?? [];
                if (statusCode === "0000") {
                    if (cardDetails.length > 0) {
                        const data = fetchCardsData("AUTO_TOPUP", cardDetails);
                        setCardListArray(data?.cardListArray ?? []);
                    }
                    onCancelRemoveCard();
                } else {
                    showErrorToast({
                        message: statusDesc || COMMON_ERROR_MSG,
                    });
                }
            })
            .catch(() => {
                showErrorToast({
                    message: COMMON_ERROR_MSG,
                });
            });
    };

    const onSuccessDone = useCallback(() => {
        console.log("[AutoTopupCard] >> [onSuccessDone]");
        const param = route?.params;
        const { editTopup } = param;
        // Pop status page
        const { fromModule, fromScreen, moreParams } = param;
        navigation.navigate(fromModule, { screen: fromScreen, params: moreParams });
        showSuccessToast({
            message: editTopup ? AUTO_TOPUP_SUCCESS_UPDATE : AUTO_TOPUP_SUCCESS_ACTIVATE,
        });
    }, [navigation]);

    const onFailDone = useCallback(() => {
        console.log("[AutoTopupCard] >> [onFailDone]");
        const param = route?.params;
        // Pop status page
        const { fromModule, fromScreen, moreParams } = param;
        navigation.navigate(fromModule, { screen: fromScreen, params: moreParams });
    }, [navigation]);

    const onS2uDone = useCallback(
        (response) => {
            const { transactionStatus, s2uSignRespone, statusDesc } = response;
            const { selectedMAItem, selectedTAItem } = route?.params ?? {};
            // Close S2u popup
            onS2uClose();
            if (transactionStatus) {
                gotoSuccessPage(
                    detailsArray,
                    `Your account will automatically top up RM ${selectedTAItem?.amount} each time your balance falls below RM ${selectedMAItem?.amount}`
                );
            } else {
                gotoFailPage(
                    detailsArray,
                    AUTO_TOPUP_UNSUCCESSFUL,
                    statusDesc || s2uSignRespone?.text
                );
            }
        },
        [detailsArray, gotoFailPage, gotoSuccessPage, onS2uClose, route?.params]
    );

    const onS2uClose = useCallback(() => {
        setS2uData({ ...s2u, showS2u: false });
    }, [s2u]);

    const showS2uModal = useCallback(
        (response) => {
            const { pollingToken, token, dateTime } = response;
            const { selectedMAItem, selectedTAItem } = route?.params ?? {};
            const s2uPollingToken = pollingToken || token || "";
            const s2uTransactionDetails = [
                {
                    label: "Threshold amount",
                    value: `RM ${selectedMAItem?.amount}`,
                },
                {
                    label: "Topup amount",
                    value: `RM ${selectedTAItem?.amount}`,
                },
                {
                    label: DATE_AND_TIME,
                    value: dateTime,
                },
            ];
            setS2uData({
                ...s2u,
                pollingToken: s2uPollingToken,
                s2uTransactionDetails,
                showS2u: true,
            });
        },
        [route?.params, s2u]
    );

    const showOTPModal = () => {
        console.log("[AutoTopupCard] >> [onOTPDone]");
        setShowOTP(true);
    };

    const onOTPDone = useCallback(
        (otp, otpModalErrorCb) => {
            console.log("[AutoTopupCard] >> [onOTPDone]");
            autoTopupRegisterApi(otp, otpModalErrorCb);
        },
        [autoTopupRegisterApi]
    );

    const closeOTPModal = () => {
        console.log("[AutoTopupCard] >> [closeOTPModal]");
        setShowOTP(false);
        setToken(null);
    };

    const onOTPClose = useCallback(() => {
        console.log("[AutoTopupCard] >> [onOTPClose]");
        closeOTPModal();
    }, []);

    const onOTPResend = useCallback(
        (showOTPCb) => {
            console.log("[AutoTopupCard] >> [onOTPResend]");
            requestOTP(true, showOTPCb);
        },
        [requestOTP]
    );

    const requestOTP = useCallback(
        async (isResend = false, showOTPCb = () => {}) => {
            console.log("[AutoTopupCard] >> [requestOTP]");

            const { cardDetails } = route?.params;
            const cardNo = cardDetails?.cardNo ?? "";

            const params = {
                mobileNo: mobileNumber,
                idNo: "",
                transactionType: "MAE_REG_AUTO_TOPUP",
                otp: "",
                preOrPostFlag: "postlogin",
                cardNo,
            };

            const httpResp = await requestTAC(params, true, MAE_REQ_TAC).catch((error) => {
                console.log("[AutoTopupCard][requestOTP] >> Exception: ", error);
            });
            const statusCode = httpResp?.data?.statusCode ?? null;
            const statusDesc = httpResp?.data?.statusDesc ?? null;

            if (statusCode !== "0000") {
                showErrorToast({
                    message: statusDesc || COMMON_ERROR_MSG,
                });
                return;
            }

            const serverToken = httpResp?.data?.token ?? null;
            // Update token and show OTP modal
            setToken(serverToken);
            showOTPModal();
            if (isResend) showOTPCb();
        },
        [mobileNumber, route?.params]
    );

    const autoTopupRegisterApi = useCallback(
        async (otp, otpModalErrorCb) => {
            const param = route?.params ?? {};
            const { selectedMAItem, selectedTAItem, customerInfo } = param;
            const { maeAcctNo, debitInq } = customerInfo;
            const params = {
                tac: otp,
                topupAmount: selectedTAItem?.amount,
                thresholdAmount: selectedMAItem?.amount,
                mobileNo: mobileNumber,
                maeAccNo: maeAcctNo,
                maeAccCode: "",
                maeAccType: "",
                reqType: "MAE_REG_AUTO_TOPUP",
                twoFAType:
                    s2u.flow === "S2U"
                        ? s2u.secure2uValidateData?.pull === "N"
                            ? "SECURE2U_PUSH"
                            : "SECURE2U_PULL"
                        : "TAC",
                srcFlag: "DC",
                sourceAccCode: "",
                sourceAccNo: "",
                sourceAccType: "",
                sourceAccName: "",
                cardRefId: selectedCard.identifier,
                cardType: selectedCard.panType,
                cardName: selectedCard.name,
                maeCardNo: debitInq?.cardNo,
            };
            const httpResp = await autoTopupRegister(params, true, `/${AUTO_TOPUP_REG}`).catch(
                (error) => {
                    console.log("[CardUCodePIN][autoTopupRegister] >> Exception: ", error);
                }
            );
            // Response error checking
            const result = httpResp?.data?.result ?? null;

            if (!result) {
                // Close OTP modal
                onOTPClose();
                gotoFailPage([], AUTO_TOPUP_UNSUCCESSFUL);
                return;
            }
            let dtArray = [];
            const { statusCode, statusDesc, dateTime, mbbRefNo } = result;

            // Check for Reference ID
            if (mbbRefNo) {
                dtArray.push({
                    key: REFERENCE_ID,
                    value: mbbRefNo,
                });
            }
            // Check for Server Date/Time
            if (dateTime) {
                dtArray.push({
                    key: DATE_AND_TIME,
                    value: dateTime,
                });
            }

            switch (statusCode) {
                case "00":
                case "0000": {
                    if (s2u.flow === "S2U") {
                        setDetailsArray(dtArray);
                        showS2uModal(result);
                    } else {
                        onOTPClose();
                        gotoSuccessPage(
                            dtArray,
                            `Your account will automatically top up RM ${selectedTAItem?.amount} each time your balance falls below RM ${selectedMAItem?.amount}`
                        );
                    }
                    break;
                }
                case "0A5":
                case "10":
                case "00A5": {
                    otpModalErrorCb(statusDesc || "Wrong OTP entered");
                    break;
                }
                default: {
                    // Close OTP modal
                    onOTPClose();
                    gotoFailPage(dtArray, AUTO_TOPUP_UNSUCCESSFUL, statusDesc);
                    break;
                }
            }
        },
        [
            gotoFailPage,
            gotoSuccessPage,
            mobileNumber,
            onOTPClose,
            route?.params,
            s2u.flow,
            s2u.secure2uValidateData?.pull,
            selectedCard.identifier,
            selectedCard.name,
            selectedCard.panType,
            showS2uModal,
        ]
    );

    const gotoSuccessPage = useCallback(
        (detailsArray, headerText) => {
            navigation.navigate(MAE_CARD_STATUS, {
                status: SUCC_STATUS,
                headerText,
                detailsArray,
                serverError: " ",
                onDone: onSuccessDone,
            });
            GAMAECardScreen.onAcknowledgeAutoTopup(SUCC_STATUS, detailsArray);
        },
        [navigation, onSuccessDone]
    );

    const gotoFailPage = useCallback(
        (detailsArray, headerText, statusDesc) => {
            navigation.navigate(MAE_CARD_STATUS, {
                status: FAIL_STATUS,
                headerText,
                detailsArray,
                serverError: statusDesc ?? "",
                onDone: onFailDone,
            });
            GAMAECardScreen.onAcknowledgeAutoTopup(FAIL_STATUS, detailsArray);
        },
        [navigation, onFailDone]
    );

    return (
        <React.Fragment>
            <ScreenContainer
                backgroundType="color"
                backgroundColor={MEDIUM_GREY}
                showLoaderModal={showLoader}
            >
                <ScreenLayout
                    header={
                        <HeaderLayout
                            headerLeftElement={<HeaderBackButton onPress={onBackTap} />}
                            headerCenterElement={
                                <Typography
                                    fontSize={16}
                                    fontWeight="600"
                                    color={BLACK}
                                    lineHeight={19}
                                    text={"Auto Top Up"}
                                />
                            }
                        />
                    }
                    paddingHorizontal={36}
                    paddingBottom={0}
                    paddingTop={0}
                    useSafeArea
                >
                    <React.Fragment>
                        <View style={Style.container}>
                            <View style={Style.tabContainer}>
                                <RollingTab
                                    defaultTabIndex={0}
                                    currentTabIndex={0}
                                    tabs={["DEBIT CARD"]}
                                />
                                <View>
                                    <View style={Style.newAddCardContainer}>
                                        {/* Add New Card Block */}
                                        <GridButtons
                                            data={{
                                                key: "1",
                                                title: "Add New Card",
                                                source: assets.icAddDebitCard,
                                            }}
                                            callback={onAddNewCardButtonPress}
                                        />
                                    </View>
                                    {/*  Card List */}
                                    <View style={Style.listContainer}>
                                        <CardList
                                            list={cardListArray}
                                            onItemPress={onCardListItemPress}
                                            onCardRemoveIconPress={onCardRemoveIconPress}
                                        />
                                    </View>
                                </View>
                            </View>
                        </View>
                    </React.Fragment>
                </ScreenLayout>
                {/* OTP Modal */}
                {showOTP && (
                    <OtpModal
                        otpCode={token}
                        onOtpDonePress={onOTPDone}
                        onOtpClosePress={onOTPClose}
                        onResendOtpPress={onOTPResend}
                        mobileNumber={maskedMobileNo}
                    />
                )}
                {/* S2u Modal */}
                {s2u.showS2u && (
                    <Secure2uAuthenticationModal
                        token={s2u.pollingToken}
                        amount={""}
                        onS2UDone={onS2uDone}
                        onS2UClose={onS2uClose}
                        nonTxnData={s2u.nonTxnData}
                        s2uPollingData={s2u.secure2uValidateData}
                        transactionDetails={s2u.s2uTransactionDetails}
                        extraParams={s2u.secure2uExtraParams}
                    />
                )}
                {/* remove card popup */}
                <Popup
                    visible={cardRemovePopup}
                    onClose={onCancelRemoveCard}
                    title={"Remove Card"}
                    description={CARD_REMOVE_DESC}
                    primaryAction={{
                        text: "Remove",
                        onPress: onConfirmRemoveCard,
                    }}
                    secondaryAction={{
                        text: "Cancel",
                        onPress: onCancelRemoveCard,
                    }}
                />
            </ScreenContainer>
        </React.Fragment>
    );
}

const Style = StyleSheet.create({
    container: {
        alignItems: "flex-start",
        flex: 1,
    },
    listContainer: {
        alignItems: "flex-start",
        width: "100%",
    },
    newAddCardContainer: {
        paddingTop: 16,
    },
    tabContainer: {
        marginTop: 10,
        width: "100%",
    },
});

AutoTopupCard.propTypes = {
    route: PropTypes.object,
    navigation: PropTypes.object,
};

export default AutoTopupCard;
