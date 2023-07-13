import { useFocusEffect } from "@react-navigation/native";
import Numeral from "numeral";
import PropTypes from "prop-types";
import React, { useState, useEffect, useCallback } from "react";
import { StyleSheet, View, ScrollView, TouchableOpacity, Image } from "react-native";

import { navigateToS2UCooling } from "@screens/OneTapAuth/CoolingNavigator";

import {
    MAE_CARD_STATUS,
    MAE_CARDDETAILS,
    ONE_TAP_AUTH_MODULE,
    BANKINGV2_MODULE,
    SECURE2U_COOLING,
} from "@navigation/navigationConstant";

import HeaderLayout from "@layouts/HeaderLayout";
import ScreenLayout from "@layouts/ScreenLayout";

import ActionButton from "@components/Buttons/ActionButton";
import HeaderBackButton from "@components/Buttons/HeaderBackButton";
import ScreenContainer from "@components/Containers/ScreenContainer";
import FixedActionContainer from "@components/Footers/FixedActionContainer";
import OtpModal from "@components/Modals/OtpModal";
import Secure2uAuthenticationModal from "@components/Modals/Secure2uAuthenticationModal";
import Popup from "@components/Popup";
import Typography from "@components/Text";

import { useModelController } from "@context";

import { autoTopupDeregister, requestTAC } from "@services";
import { GAMAECardScreen } from "@services/analytics/analyticsSTPMae";

import {
    YELLOW,
    MEDIUM_GREY,
    BLACK,
    ROYAL_BLUE,
    DARK_GREY,
    LIGHT_GREY,
    WHITE,
} from "@constants/colors";
import {
    EDIT,
    DEACTIVATE,
    CURRENCY,
    DATE_AND_TIME,
    REFERENCE_ID,
    SUCC_STATUS,
    COMMON_ERROR_MSG,
    FAIL_STATUS,
    FA_CARD_AUTOTOPUP
} from "@constants/strings";
import { AUTO_TOPUP_DEREG, MAE_REQ_TAC } from "@constants/url";

import { maskedMobileNumber } from "@utils";
import { checks2UFlow } from "@utils/dataModel/utilityPartial.5";

import assets from "@assets";

const ATtxnCodeS2u = 39;

const CardListItem = ({ item }) => {
    return (
        <View style={Style.bankInfo}>
            <View style={Style.circleImageView}>
                <View style={Style.circleImageView}>
                    <Image style={item.imgStyle} source={item.image} resizeMethod="scale" />
                </View>
            </View>
            <View style={Style.bankInfoText}>
                <Typography
                    fontSize={14}
                    fontWeight="600"
                    fontStyle="normal"
                    letterSpacing={0}
                    lineHeight={18}
                    color={BLACK}
                    textAlign="left"
                    text={item.name}
                    style={Style.cardListItemName}
                />
                {item.description1 != "" && (
                    <Typography
                        fontSize={12}
                        fontWeight="300"
                        fontStyle="normal"
                        letterSpacing={0}
                        lineHeight={18}
                        color={BLACK}
                        textAlign="left"
                        text={item.description1}
                        style={Style.cardListItemDescriptionOne}
                    />
                )}

                {item.description2 != "" && (
                    <Typography
                        fontSize={12}
                        fontStyle="normal"
                        letterSpacing={0}
                        lineHeight={18}
                        color={DARK_GREY}
                        textAlign="left"
                        text={item.description2}
                        style={Style.cardListItemDescriptionTwo}
                    />
                )}
            </View>
        </View>
    );
};

CardListItem.propTypes = {
    item: PropTypes.shape({
        description1: PropTypes.string,
        description2: PropTypes.string,
        image: PropTypes.any,
        imgStyle: PropTypes.any,
        name: PropTypes.any,
    }),
};

function AutoTopupEdit({ route, navigation }) {
    const [item, setItem] = useState({});
    const [showPopup, setShowPopup] = useState(false);
    const [popupTitle] = useState("Deactivate Auto Top Up");
    const [popupMsg] = useState("Are you sure you want to deactivate Auto Top Up?");
    const [popupPrimaryBtnText] = useState("Deactivate");
    const [showOTP, setShowOTP] = useState(false);
    const [token, setToken] = useState(null);
    const [mobileNumber, setMobileNumber] = useState("");
    const [maskedMobileNo, setMaskedMobileNumber] = useState("");

    const params = route?.params ?? {};
    const { getModel, updateModel } = useModelController();
    const [detailsArray, setDetailsArray] = useState([]);
    const [s2u, setS2uData] = useState({
        flow: null,
        secure2uValidateData: null,
        showS2u: false,
        pollingToken: "",
        s2uTransactionDetails: [],
        nonTxnData: { isNonTxn: true, nonTxnTitle: "Deactivate auto top up" },
        secure2uExtraParams: {
            metadata: { txnType: "AUTO_TOPUP_DEREG" },
        },
    });
    const { thresholdAmount, topupAmount } = params?.serverData;

    useEffect(() => {
        init();
    }, [init]);

    useFocusEffect(
        useCallback(() => {
            // do something when screen is focused
            if (params.isS2UReg) handleS2uFlow();
        }, [handleS2uFlow, params.isS2UReg])
    );

    const init = useCallback(() => {
        console.log("[AutoTopupEdit] >> [init]");
        const params = route?.params ?? {};
        params.isNTB ? setCardDetails() : setCasaDetails();
        const { m2uPhoneNumber } = getModel("m2uDetails");

        setMaskedMobileNumber(maskedMobileNumber(m2uPhoneNumber));
        setMobileNumber(m2uPhoneNumber);
    }, [getModel, route?.params, setCardDetails, setCasaDetails]);

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
        setS2uData({ ...s2u, secure2uValidateData, flow });
        if (flow === SECURE2U_COOLING) goBack();
        if (flow === "S2UReg" && isS2UReg) goBack();
        if (flow === "TAC" || flow === "S2U") setShowPopup(true);
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
                            screen: "AutoTopupEdit",
                        },
                        fail: {
                            stack: BANKINGV2_MODULE,
                            screen: "",
                        },
                        params: { ...route.params },
                    },
                },
            });
        } else if (flow === "TAC" || flow === "S2U") {
            setShowPopup(true);
        }
    }, [getModel, navigation, route.params, s2u, updateModel]);

    const setCasaDetails = useCallback(() => {
        const params = route?.params?.serverData ?? {};
        const { sourceAccNo, sourceAccName } = params;
        const newData = {
            image: assets.icMaybankAccount,
            name: sourceAccName,
            description1: sourceAccNo,
            description2: "Maybank",
            imgStyle: Style.cardBrandLogoCls,
        };
        setItem(newData);
    }, [route?.params?.serverData]);

    const setCardDetails = useCallback(() => {
        const params = route?.params?.serverData ?? {};
        const { cardType, cardName } = params;
        const newData = {
            image: cardType === "M" ? assets.icMasterCard : assets.icVisa,
            name: cardName,
            description1: "",
            description2: "",
            imgStyle: Style.cardBrandLogoCls,
        };
        setItem(newData);
    }, [route?.params?.serverData]);

    const onEditPress = useCallback(() => {
        const params = route?.params ?? {};
        GAMAECardScreen.onEditAutoTopup();
        navigation.navigate("AutoTopupLimit", {
            ...params,
            editTopup: true,
        });
    }, [navigation, route?.params]);

    const onDeactivatePress = useCallback(() => {
        GAMAECardScreen.onDeactiveAutoTopup();
        checkS2UStatus();
    }, [checkS2UStatus]);

    const onBackTap = useCallback(() => {
        navigation.goBack();
    }, [navigation]);

    const onPopupBtnPress = () => {
        if (s2u.flow === "S2U") {
            autoTopupDeregisterApi();
        } else {
            requestOTP();
        }
        onPopupCancel();
    };

    const showOTPModal = () => {
        setShowOTP(true);
    };

    const onOTPDone = useCallback(
        (otp, otpModalErrorCb) => {
            autoTopupDeregisterApi(otp, otpModalErrorCb);
        },
        [autoTopupDeregisterApi]
    );

    const closeOTPModal = () => {
        setShowOTP(false);
        setToken(null);
    };

    const onOTPClose = useCallback(() => {
        closeOTPModal();
    }, []);

    const onOTPResend = useCallback(
        (showOTPCb) => {
            requestOTP(true, showOTPCb);
        },
        [requestOTP]
    );

    const requestOTP = useCallback(
        async (isResend = false, showOTPCb = () => {}) => {
            const { cardDetails } = route?.params;
            const cardNo = cardDetails?.cardNo ?? "";

            const params = {
                mobileNo: mobileNumber,
                idNo: "",
                transactionType: "MAE_DEREG_AUTO_TOPUP",
                otp: "",
                preOrPostFlag: "postlogin",
                cardNo,
            };

            const httpResp = await requestTAC(params, true, MAE_REQ_TAC).catch((error) => {
                console.log("[requestOTP] >> Exception: ", error);
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

    const onStatusPgDone = useCallback(() => {
        const { fromScreen, fromModule, moreParams } = params;
        navigation.navigate(fromModule, { screen: fromScreen, params: moreParams });
    }, [navigation, params]);

    const onS2uDone = useCallback(
        (response) => {
            const { transactionStatus } = response;
            // Close S2u popup
            onS2uClose();
            if (transactionStatus) {
                gotoSuccessPage(detailsArray, "Auto top up successfully deactivated.");
            } else {
                gotoFailPage(
                    detailsArray,
                    "Auto top up deactivation unsuccessful. Please try again."
                );
            }
        },
        [detailsArray, gotoFailPage, gotoSuccessPage, onS2uClose]
    );

    const onS2uClose = useCallback(() => {
        setS2uData({ ...s2u, showS2u: false });
    }, [s2u]);

    const showS2uModal = useCallback(
        (response) => {
            const { pollingToken, token, dateTime } = response;
            const s2uPollingToken = pollingToken || token || "";
            const s2uTransactionDetails = [
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
        [s2u]
    );

    const autoTopupDeregisterApi = useCallback(
        async (otp, otpModalErrorCb) => {
            const { customerInfo } = route?.params ?? {};
            const { maeAcctNo } = customerInfo;
            const params = {
                maeAccNo: maeAcctNo,
                txnType: "0",
                twoFAType:
                    s2u.flow === "S2U"
                        ? s2u.secure2uValidateData?.pull === "N"
                            ? "SECURE2U_PUSH"
                            : "SECURE2U_PULL"
                        : "TAC",
                tac: otp,
            };
            const httpResp = await autoTopupDeregister(params, true, `/${AUTO_TOPUP_DEREG}`);
            // Response error checking
            const result = httpResp?.data?.result ?? null;
            if (!result) {
                // Close OTP modal
                onOTPClose();
                gotoFailPage([], "Auto top up deactivation unsuccessful. Please try again.");
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
                        gotoSuccessPage(dtArray, "Auto top up successfully deactivated.");
                    }
                    break;
                }
                case "0A5":
                case "10":
                case "00A5":
                    otpModalErrorCb(statusDesc || "Wrong OTP entered");
                    break;
                default: {
                    // Close OTP modal
                    onOTPClose();
                    gotoFailPage(
                        dtArray,
                        "Auto top up deactivation unsuccessful. Please try again."
                    );
                    break;
                }
            }
        },
        [
            gotoFailPage,
            gotoSuccessPage,
            onOTPClose,
            route?.params,
            s2u.flow,
            s2u.secure2uValidateData?.pull,
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
                onDone: onStatusPgDone,
            });
            GAMAECardScreen.onAcknowledgeDeactivate(SUCC_STATUS, detailsArray);
        },
        [navigation, onStatusPgDone]
    );

    const gotoFailPage = useCallback(
        (detailsArray, headerText) => {
            navigation.navigate(MAE_CARD_STATUS, {
                status: FAIL_STATUS,
                headerText,
                detailsArray,
                serverError: " ",
                onDone: onStatusPgDone,
            });
            GAMAECardScreen.onAcknowledgeDeactivate(FAIL_STATUS, detailsArray);
        },
        [navigation, onStatusPgDone]
    );

    const onPopupCancel = useCallback(() => {
        setShowPopup(false);
    }, []);

    return (
        <React.Fragment>
            <ScreenContainer
               backgroundType="color"
               backgroundColor={MEDIUM_GREY}
               analyticScreenName={FA_CARD_AUTOTOPUP}
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
                    paddingHorizontal={0}
                    paddingBottom={0}
                    paddingTop={0}
                    useSafeArea
                >
                    <React.Fragment>
                        <ScrollView showsVerticalScrollIndicator={false}>
                            <View style={Style.titleContainerCls}>
                                <Typography
                                    fontSize={14}
                                    lineHeight={18}
                                    fontWeight="600"
                                    textAlign="left"
                                    text="Auto top up when balance falls below"
                                />

                                {/* Amount List */}
                                <View style={Style.amountTextCls}>
                                    <Typography
                                        fontSize={21}
                                        lineHeight={33}
                                        color={BLACK}
                                        fontWeight="300"
                                        textAlign="left"
                                        text={`${CURRENCY} ${Numeral(thresholdAmount).format(
                                            "0,0.00"
                                        )}`}
                                    />
                                </View>
                            </View>
                            <View style={Style.titleContainerCls}>
                                {/* How much would... */}
                                <Typography
                                    fontSize={14}
                                    lineHeight={18}
                                    color={BLACK}
                                    fontWeight="600"
                                    textAlign="left"
                                    text="Top up amount"
                                />

                                {/* Amount List */}
                                <View style={Style.amountTextCls}>
                                    <Typography
                                        fontSize={21}
                                        lineHeight={33}
                                        fontWeight="300"
                                        textAlign="left"
                                        text={`${CURRENCY} ${Numeral(topupAmount).format(
                                            "0,0.00"
                                        )}`}
                                    />
                                </View>
                            </View>
                            <View style={Style.titleContainerCls}>
                                {/* How much would... */}
                                <Typography
                                    fontSize={15}
                                    lineHeight={18}
                                    color={BLACK}
                                    fontWeight="600"
                                    textAlign="left"
                                    text="Auto top up using"
                                />
                                <CardListItem item={item} />
                            </View>
                        </ScrollView>
                        {/* Bottom docked button container */}
                        <FixedActionContainer>
                            <View style={Style.bottomBtnContCls}>
                                <ActionButton
                                    activeOpacity={1}
                                    backgroundColor={YELLOW}
                                    fullWidth
                                    componentCenter={
                                        <Typography
                                            color={BLACK}
                                            fontSize={15}
                                            lineHeight={18}
                                            fontWeight="600"
                                            text={EDIT}
                                        />
                                    }
                                    onPress={onEditPress}
                                />
                                <TouchableOpacity onPress={onDeactivatePress}>
                                    <Typography
                                        color={ROYAL_BLUE}
                                        fontSize={14}
                                        fontWeight="600"
                                        lineHeight={18}
                                        style={Style.changeNumber}
                                        text={DEACTIVATE}
                                        textAlign="center"
                                    />
                                </TouchableOpacity>
                            </View>
                        </FixedActionContainer>
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
                {/* Confirmation/Alert POPUP */}
                <Popup
                    visible={showPopup}
                    title={popupTitle}
                    description={popupMsg}
                    onClose={onPopupCancel}
                    primaryAction={{
                        text: popupPrimaryBtnText,
                        onPress: onPopupBtnPress,
                    }}
                    secondaryAction={{
                        text: "Cancel",
                        onPress: onPopupCancel,
                    }}
                />
            </ScreenContainer>
        </React.Fragment>
    );
}

const Style = StyleSheet.create({
    amountTextCls: {
        marginTop: 15,
    },
    bankInfo: {
        borderBottomColor: LIGHT_GREY,
        borderBottomWidth: 1,
        flexDirection: "row",
        paddingBottom: 17,
        paddingTop: 22,
        width: "100%",
    },
    bankInfoText: {
        flex: 1,
        flexDirection: "column",
        flexGrow: 1,
        justifyContent: "center",
        marginLeft: 16,
    },
    bottomBtnContCls: {
        alignItems: "center",
        flex: 1,
        justifyContent: "space-around",
        width: "100%",
    },
    cardBrandLogoCls: {
        alignContent: "center",
        alignItems: "center",
        flexDirection: "row",
        height: 64,
        justifyContent: "center",
        marginLeft: 0,
        marginTop: 0,
        width: 64,
    },
    cardListItemDescriptionOne: { flexShrink: 1, flexWrap: "wrap" },
    cardListItemDescriptionTwo: { flexShrink: 1, flexWrap: "wrap" },
    cardListItemName: { flexShrink: 1, flexWrap: "wrap" },
    changeNumber: {
        paddingVertical: 24,
    },
    circleImageView: {
        alignContent: "center",
        alignItems: "center",
        backgroundColor: WHITE,
        borderColor: WHITE,
        borderRadius: 64 / 2,
        borderWidth: 2,
        flexDirection: "row",
        height: 64,
        justifyContent: "center",
        width: 64,
    },
    titleContainerCls: {
        marginHorizontal: 36,
        marginTop: 25,
    },
});

AutoTopupEdit.propTypes = {
    route: PropTypes.object,
    navigation: PropTypes.object,
};

export default AutoTopupEdit;
