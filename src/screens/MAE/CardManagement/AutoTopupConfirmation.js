import { useFocusEffect } from "@react-navigation/native";
import PropTypes from "prop-types";
import React, { useState, useEffect, useCallback } from "react";
import { StyleSheet, View, ScrollView, TouchableOpacity } from "react-native";

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
import HeaderCloseButton from "@components/Buttons/HeaderCloseButton";
import { CircularLogoImage } from "@components/Common";
import ScreenContainer from "@components/Containers/ScreenContainer";
import FixedActionContainer from "@components/Footers/FixedActionContainer";
import OtpModal from "@components/Modals/OtpModal";
import Secure2uAuthenticationModal from "@components/Modals/Secure2uAuthenticationModal";
import Typography from "@components/Text";
import { showErrorToast, showInfoToast, showSuccessToast } from "@components/Toast";
import AccountList from "@components/Transfers/TransferConfirmationAccountList";
import TransferDetailLabel from "@components/Transfers/TransferConfirmationDetailLabel";
import TransferDetailValue from "@components/Transfers/TransferConfirmationDetailValue";
import TransferDetailLayout from "@components/Transfers/TransferDetailLayout";

import { useModelController } from "@context";

import { bankingGetDataMayaM2u, requestTAC, autoTopupRegister } from "@services";
import { GAMAECardScreen } from "@services/analytics/analyticsSTPMae";

import { YELLOW, MEDIUM_GREY, BLACK, ROYAL_BLUE, SWITCH_GREY } from "@constants/colors";
import {
    PAY_FROM,
    DATE,
    SET_UP_NOW,
    SUCC_STATUS,
    COMMON_ERROR_MSG,
    FAIL_STATUS,
    DATE_AND_TIME,
    REFERENCE_ID,
    SECURE2U_IS_DOWN,
    AUTO_TOPUP_SUCCESS_UPDATE,
    AUTO_TOPUP_SUCCESS_ACTIVATE,
    AUTO_TOPUP_UNSUCCESSFUL,
    FA_CARD_AUTOTOPUP_REVIEWDETAILS,
} from "@constants/strings";
import { MAE_REQ_TAC, AUTO_TOPUP_REG } from "@constants/url";

import { maskedMobileNumber } from "@utils";
import { checks2UFlow } from "@utils/dataModel/utilityPartial.5";

const ATtxnCodeS2u = 39;

function AutoTopupConfirmation({ route, navigation }) {
    const param = route?.params ?? {};
    const [amount, setAmount] = useState("");
    const [accounts, setAccounts] = useState([]);
    const [selectedAccount, setSelectedAccount] = useState(null);
    const [displayDate] = useState(["Today"]);
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
    const { selectedMAItem, selectedTAItem, customerInfo, editTopup } = param;
    const { maeAcctNo } = customerInfo;

    useEffect(() => {
        init();
    }, [init]);

    useFocusEffect(
        useCallback(() => {
            // do something when screen is focused
            if (param.isS2UReg) handleS2uFlow();
        }, [handleS2uFlow, param.isS2UReg])
    );

    const init = useCallback(() => {
        console.log("[AutoTopupConfirmation] >> [init]");
        const { m2uPhoneNumber } = getModel("m2uDetails");
        checkS2UStatus();
        setMaskedMobileNumber(maskedMobileNumber(m2uPhoneNumber));
        setMobileNumber(m2uPhoneNumber);
        setAmount(selectedTAItem?.amount);
        getAccountsList();
    }, [checkS2UStatus, getAccountsList, getModel, selectedTAItem?.amount]);

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
                            screen: "AutoTopupConfirmation",
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

    const onAccountListClick = useCallback(
        (item) => {
            console.log("[AutoTopupConfirmation] >> [onAccountListClick]");
            const itemType =
                item.type === "C" || item.type === "J" || item.type === "R" ? "card" : "account";
            if (parseFloat(item.acctBalance) <= 0.0 && itemType == "account") {
                // TODO: show zero error
            } else {
                let tempArray = [...accounts];
                for (let i = 0; i < tempArray.length; i++) {
                    if (tempArray[i].number === item.number) {
                        tempArray[i].selected = true;
                    } else {
                        tempArray[i].selected = false;
                    }
                }
                setAccounts(tempArray);
                setSelectedAccount(item);
            }
        },
        [accounts]
    );

    const onBackTap = useCallback(() => {
        navigation.goBack();
    }, [navigation]);

    const onCloseTap = useCallback(() => {
        const { fromModule, fromScreen, moreParams } = param;
        navigation.navigate(fromModule, { screen: fromScreen, params: moreParams });
    }, [navigation, param]);

    const onEditAmount = useCallback(() => {
        //need to do incase any future requirement
    }, []);

    const onSetup = useCallback(() => {
        if (s2u.flow === "S2U") {
            autoTopupRegisterApi();
        } else {
            requestOTP();
        }
    }, [autoTopupRegisterApi, requestOTP, s2u.flow, accounts, selectedAccount]);

    const onSuccessPgDone = useCallback(() => {
        // Pop status page
        const { fromModule, fromScreen, moreParams } = param;
        navigation.navigate(fromModule, { screen: fromScreen, params: moreParams });
        showSuccessToast({
            message: editTopup ? AUTO_TOPUP_SUCCESS_UPDATE : AUTO_TOPUP_SUCCESS_ACTIVATE,
        });
    }, [navigation, param]);

    const onfailPgDone = useCallback(() => {
        // Pop status page
        const { fromModule, fromScreen, moreParams } = param;
        navigation.navigate(fromModule, { screen: fromScreen, params: moreParams });
    }, [navigation, param]);

    const onS2uDone = useCallback(
        (response) => {
            const { transactionStatus, s2uSignRespone, statusDesc } = response;

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
        [
            detailsArray,
            gotoFailPage,
            gotoSuccessPage,
            onS2uClose,
            selectedMAItem?.amount,
            selectedTAItem?.amount,
        ]
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
        [s2u, selectedMAItem?.amount, selectedTAItem?.amount]
    );

    const showOTPModal = () => {
        setShowOTP(true);
    };

    const onOTPDone = useCallback(
        (otp, otpModalErrorCb) => {
            autoTopupRegisterApi(otp, otpModalErrorCb);
        },
        [autoTopupRegisterApi]
    );

    const closeOTPModal = () => {
        setShowOTP(false);
        setToken(null);
    };

    const onOTPClose = useCallback(() => {
        // Close OTP Modal
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
                transactionType: "MAE_REG_AUTO_TOPUP",
                otp: "",
                preOrPostFlag: "postlogin",
                cardNo,
            };

            const httpResp = await requestTAC(params, true, MAE_REQ_TAC).catch((error) => {
                console.log("[AutoTopupConfirmation][requestOTP] >> Exception: ", error);
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

    const getAccountsList = useCallback(async () => {
        console.log("getAccountsList");
        const subUrl = "/summary";
        const params = "?type=A";

        let newAccountList = [];

        bankingGetDataMayaM2u(subUrl + params, false)
            .then((response) => {
                const result = response.data.result;

                if (result) {
                    const accountListingArray =
                        result && result.accountListings ? result.accountListings : null;
                    accountListingArray.forEach((element) => {
                        const accountNumber = element
                            ? element.number.toString().substring(0, 12)
                            : null;
                        if (accountNumber !== maeAcctNo) {
                            newAccountList.push(element);
                        }
                    });
                }
                setAccounts(newAccountList);
                newAccountList[0].selected = true;
                setSelectedAccount(newAccountList[0]);
            })
            .catch((error) => {
                console.log("getAccountsList:error", error);
            });
    }, [maeAcctNo]);

    const autoTopupRegisterApi = useCallback(
        async (otp, otpModalErrorCb) => {
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
                srcFlag: "CASA",
                sourceAccCode: selectedAccount?.code,
                sourceAccNo: selectedAccount?.number.substring(0, 12),
                sourceAccType: selectedAccount?.type,
                sourceAccName: selectedAccount?.name,
                cardType: "",
                cardName: "",
                cardRefId: "",
                maeCardNo: "",
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
                case "00A5":
                    otpModalErrorCb(statusDesc || "Wrong OTP entered");
                    break;
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
            maeAcctNo,
            mobileNumber,
            onOTPClose,
            s2u.flow,
            s2u.secure2uValidateData?.pull,
            selectedAccount?.code,
            selectedAccount?.name,
            selectedAccount?.number,
            selectedAccount?.type,
            selectedMAItem?.amount,
            selectedTAItem?.amount,
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
                onDone: onSuccessPgDone,
            });
            GAMAECardScreen.onAcknowledgeAutoTopup(SUCC_STATUS, detailsArray);
        },
        [navigation, onSuccessPgDone]
    );

    const gotoFailPage = useCallback(
        (detailsArray, headerText, statusDesc) => {
            navigation.navigate(MAE_CARD_STATUS, {
                status: FAIL_STATUS,
                headerText,
                detailsArray,
                serverError: statusDesc ?? "",
                onDone: onfailPgDone,
            });
            GAMAECardScreen.onAcknowledgeAutoTopup(FAIL_STATUS, detailsArray);
        },
        [navigation, onfailPgDone]
    );

    return (
        <React.Fragment>
            <ScreenContainer
                backgroundType="color"
                backgroundColor={MEDIUM_GREY}
                analyticScreenName={FA_CARD_AUTOTOPUP_REVIEWDETAILS}
            >
                <ScreenLayout
                    header={
                        <HeaderLayout
                            headerLeftElement={<HeaderBackButton onPress={onBackTap} />}
                            headerRightElement={<HeaderCloseButton onPress={onCloseTap} />}
                            headerCenterElement={
                                <Typography
                                    fontSize={16}
                                    fontWeight="600"
                                    color={BLACK}
                                    lineHeight={19}
                                    text={"Confirmation"}
                                />
                            }
                        />
                    }
                    scrollable={true}
                    paddingHorizontal={0}
                    paddingBottom={0}
                    paddingTop={0}
                    useSafeArea
                >
                    <React.Fragment>
                        <ScrollView>
                            <View style={Style.blockCls}>
                                <View style={Style.logo}>
                                    <CircularLogoImage
                                        source={{
                                            image: "icMAE.png",
                                            imageName: "icMAE.png",
                                            imageUrl: "icMAE.png",
                                            shortName: "MAE",
                                            type: true,
                                        }}
                                        isLocal={false}
                                    />
                                </View>
                                <View>
                                    <View style={Style.logoTitle}>
                                        <Typography
                                            fontSize={14}
                                            fontWeight="600"
                                            fontStyle="normal"
                                            letterSpacing={0}
                                            lineHeight={18}
                                            color={BLACK}
                                            text={"MAE"}
                                        />
                                    </View>
                                    <View style={Style.logoSubTitle}>
                                        <Typography
                                            fontSize={14}
                                            fontWeight="normal"
                                            fontStyle="normal"
                                            letterSpacing={0}
                                            lineHeight={20}
                                            color={BLACK}
                                            text={maeAcctNo}
                                        />
                                    </View>
                                    <View>
                                        <TouchableOpacity onPress={onEditAmount}>
                                            <Typography
                                                fontSize={24}
                                                lineHeight={31}
                                                fontWeight="bold"
                                                fontStyle="normal"
                                                color={ROYAL_BLUE}
                                                text={`RM ${amount}`}
                                                style={Style.amountText}
                                            />
                                        </TouchableOpacity>
                                    </View>
                                </View>

                                {/* transaction details */}
                                <TransferDetailLayout
                                    left={<TransferDetailLabel value={DATE} />}
                                    right={<TransferDetailValue value={displayDate} />}
                                />

                                <View style={Style.lineConfirm} />

                                {/* AccountList */}
                                <View style={Style.accountListingContainer}>
                                    <AccountList
                                        title={PAY_FROM}
                                        data={accounts}
                                        onPress={onAccountListClick}
                                        extraData={{}}
                                        paddingLeft={24}
                                    />
                                </View>
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
                                            fontSize={14}
                                            lineHeight={18}
                                            fontWeight="600"
                                            text={SET_UP_NOW}
                                        />
                                    }
                                    onPress={onSetup}
                                />
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
            </ScreenContainer>
        </React.Fragment>
    );
}

const Style = StyleSheet.create({
    accountListingContainer: {
        marginHorizontal: -24,
        paddingTop: 25,
    },
    amountText: {
        marginBottom: 37,
        marginTop: 25,
    },
    blockCls: {
        flexDirection: "column",
        flex: 1,
        marginLeft: 24,
        marginRight: 24,
    },
    bottomBtnContCls: {
        flexDirection: "row",
        justifyContent: "space-around",
        width: "100%",
    },
    lineConfirm: {
        backgroundColor: SWITCH_GREY,
        flexDirection: "row",
        height: 1,
        marginTop: 15,
    },
    logo: {
        alignContent: "center",
        elevation: 5,
        flexDirection: "row",
        justifyContent: "center",
        marginTop: 2,
        shadowColor: BLACK,
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
    },
    logoSubTitle: {
        flexDirection: "row",
        justifyContent: "center",
        marginTop: 4,
    },
    logoTitle: {
        flexDirection: "row",
        justifyContent: "center",
        marginTop: 14,
    },
});

AutoTopupConfirmation.propTypes = {
    route: PropTypes.object,
    navigation: PropTypes.object,
};

export default AutoTopupConfirmation;
