import PropTypes from "prop-types";
import React, { useState } from "react";
import { View, StyleSheet, ScrollView } from "react-native";
import DeviceInfo from "react-native-device-info";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { navigateToS2UCooling, navigateToS2UReg } from "@screens/OneTapAuth/CoolingNavigator";

import {
    SECURE_SWITCH_STACK,
    DEACTIVATE_CARDS_CASA_ACK,
    M2U_DEACTIVATE,
    SELECT_CARDS_CASA_TO_DEACTIVATE,
    MORE,
    ACCOUNT_DETAILS_SCREEN,
    BANKINGV2_MODULE,
    SETTINGS,
    MAYBANK2U,
    DASHBOARD,
    WALLET_MAIN_DASHBOARD,
    TAB_NAVIGATOR,
} from "@navigation/navigationConstant";

import ActionButton from "@components/Buttons/ActionButton";
import HeaderBackButton from "@components/Buttons/HeaderBackButton";
import HeaderCloseButton from "@components/Buttons/HeaderCloseButton";
import ScreenContainer from "@components/Containers/ScreenContainer";
import FixedActionContainer from "@components/Footers/FixedActionContainer";
import HeaderLayout from "@components/Layouts/HeaderLayout";
import ScreenLayout from "@components/Layouts/ScreenLayout";
import OtpModal from "@components/Modals/OtpModal";
import Secure2uAuthenticationModal from "@components/Modals/Secure2uAuthenticationModal";
import Typo from "@components/Text";
import { showErrorToast } from "@components/Toast";

import { withModelContext } from "@context";

import { requestTAC, suspendCASA, blockCards } from "@services";

import { BLACK, WHITE, MEDIUM_GREY, YELLOW, BLUE } from "@constants/colors";
import {
    BLOCK_REASON,
    CARD_BLOCK,
    SUSPEND_ACCOUNT,
    BLOCK_CARD,
    M2U,
    S2U_PUSH,
    SMS_TAC,
} from "@constants/data";
import {
    FN_BLOCK_CASA,
    FN_BLOCK_CREDIT_CARD,
    TWO_FA_TYPE_TAC,
    TWO_FA_TYPE_SECURE2U_PULL,
} from "@constants/fundConstants";
import {
    CONFIRMATION,
    CONFIRM_SUSPEND_ACCOUNTS_BELOW,
    CONFIRM_BLOCK_CARD_BELOW,
    CONFIRM,
    EDIT,
    CASA,
    CARDS,
    COMMON_ERROR_MSG,
    CARD_SUCCESSFULLY_BLOCKED,
    BLOCK_CARD_UNSUCCESSFUL,
    ACC_SUCCESSFULLY_SUSPENDED,
    SUSPEND_ACC_UNSUCCESSFUL,
} from "@constants/strings";

import { maskedMobileNumber } from "@utils";
import { encryptData } from "@utils/dataModel";
import {
    init,
    initChallenge,
    s2uSdkLogs,
    handleS2UAcknowledgementScreen,
} from "@utils/dataModel/s2uSDKUtil";
import {
    getDeviceRSAInformation,
    formatAccNumberTo16Digits,
    maskAccount,
    formateAccountNumber,
} from "@utils/dataModel/utility";

import DeactivateCardsCASAInfo from "./DeactivateCardsCASAInfo";

const REQUEST_TAC = "REQUEST_TAC";
const TAC_FLOW_PAYLOAD = "TAC_FLOW_PAYLOAD";
const S2U_INIT = "S2U_INIT";

const DeactivateCardsCASAConfirmation = ({ route, navigation, getModel }) => {
    const { fromModule, fromScreen, itemsListForDeactivation, itemToDeactivate, selectedAccType } =
        route.params;
    const insets = useSafeAreaInsets();
    const { m2uPhoneNumber } = getModel("m2uDetails");

    const [tacToken, setTacToken] = useState();
    const [isShowTacModel, setIsShowTacModel] = useState(false);
    const [maskedMobileNo, setMaskedMobileNo] = useState();
    const [showS2UModal, setShowS2UModal] = useState(false);
    const [mapperData, setMapperData] = useState({});
    const [nonTxnData, setNonTxnData] = useState({ isNonTxn: true });
    const [isS2UDown, setIsS2UDown] = useState(false);
    const [blockReason, setBlockReason] = useState();

    function onClickInfoEdit(navBackInd) {
        if (navBackInd === 1) {
            onBackHandler();
        } else if (navBackInd === 2) {
            handleEditButtonNavigation();
        } else if (navBackInd > 2) {
            onCloseHandler();
        }
    }

    function onBackHandler() {
        navigation.goBack();
    }

    function onCloseHandler() {
        if (fromModule && fromScreen) {
            navigation.navigate(fromModule, { screen: fromScreen });
        }
    }

    function handleEditButtonNavigation() {
        const navParams = {
            from: M2U_DEACTIVATE,
            fromModule,
            fromScreen,
            itemToDeactivate,
        };
        if (
            itemToDeactivate === CARDS &&
            [MORE, SETTINGS, MAYBANK2U, DASHBOARD].includes(fromScreen)
        ) {
            navigation.navigate(SECURE_SWITCH_STACK, {
                screen: SELECT_CARDS_CASA_TO_DEACTIVATE,
                params: navParams,
            });
        } else if (itemToDeactivate === CASA) {
            if (fromScreen === ACCOUNT_DETAILS_SCREEN) {
                navigation.navigate(BANKINGV2_MODULE, {
                    screen: ACCOUNT_DETAILS_SCREEN,
                    params: navParams,
                });
            } else if (fromScreen === WALLET_MAIN_DASHBOARD) {
                navigation.navigate(TAB_NAVIGATOR, {
                    screen: MORE,
                    params: navParams,
                });
            }
        }
    }

    async function getEncryptedAccNo(accListToEncrypt) {
        return await Promise.all(
            accListToEncrypt.map(async (item) => {
                return {
                    ...item,
                    AccountNo: await encryptData(item.AccountNo),
                };
            })
        );
    }

    async function getCasaPayload(flow, otp) {
        const deviceInfo = getModel("device");
        const mobileSDK = getDeviceRSAInformation(deviceInfo.deviceInformation, DeviceInfo);
        const accountsToSuspend = [];
        let isJointAccAvailable;
        itemsListForDeactivation.forEach((acc) => {
            acc.listItems.forEach((item) => {
                const accountProp = {
                    AccountNo: formatAccNumberTo16Digits(item.number),
                };
                if (flow === S2U_INIT) {
                    accountProp.name = item.name;
                    accountProp.maskedAccountNo = formateAccountNumber(item.number, 12);
                }
                accountsToSuspend.push(accountProp);
            });
            isJointAccAvailable = !!acc.listItems.filter((item) => item.jointAccount).length;
        });
        const encrptedAccList = await getEncryptedAccNo(accountsToSuspend);

        let payload = {
            blockAccountDetailsList: encrptedAccList,
        };

        if (flow === REQUEST_TAC) {
            payload = {
                blockAccountDetailsList: encrptedAccList,
                fundTransferType: SUSPEND_ACCOUNT,
            };
        } else if (flow === TAC_FLOW_PAYLOAD) {
            payload = {
                mobileSDKData: mobileSDK,
                tac: otp,
                accountType: selectedAccType,
                noOfOccur: encrptedAccList.length,
                blockAccountDetailsList: encrptedAccList,
                twoFAType: TWO_FA_TYPE_TAC,
                jointAccount: isJointAccAvailable,
            };
        } else if (flow === S2U_INIT) {
            payload = {
                blockAccountDetailsList: encrptedAccList,
                accountType: selectedAccType,
                jointAccount: isJointAccAvailable,
                twoFAType: TWO_FA_TYPE_SECURE2U_PULL,
                noOfOccur: encrptedAccList.length,
            };
        }
        return payload;
    }

    async function getCardsPayload(flow, otp) {
        const deviceInfo = getModel("device");
        const mobileSDK = getDeviceRSAInformation(deviceInfo.deviceInformation, DeviceInfo);
        let reasonForBlocking = null;
        let cardNumber, cardName;
        itemsListForDeactivation.forEach((item) => {
            if (item.id === BLOCK_REASON && item.listItems.length) {
                const [{ blockReason }] = item.listItems;
                reasonForBlocking = blockReason;
            } else if (item.id === CARD_BLOCK && item.listItems.length) {
                const [{ number, name }] = item.listItems;
                cardNumber = number;
                cardName = name;
            }
        });
        const encryptedCardNo = await encryptData(formatAccNumberTo16Digits(cardNumber));
        setBlockReason(reasonForBlocking);
        let payload;
        if (flow === REQUEST_TAC) {
            payload = {
                fundTransferType: BLOCK_CARD,
                cardNo: encryptedCardNo,
            };
        } else if (flow === TAC_FLOW_PAYLOAD) {
            payload = {
                mobileSDKData: mobileSDK,
                tac: otp,
                twoFAType: TWO_FA_TYPE_TAC,
                cardNumber: encryptedCardNo,
                reasonForBlocking,
            };
        } else if (flow === S2U_INIT) {
            payload = {
                cardNumber: encryptedCardNo,
                cardName,
                reasonForBlocking,
                maskedCardNumber: maskAccount(cardNumber),
                twoFAType: TWO_FA_TYPE_SECURE2U_PULL,
            };
        }
        return payload;
    }

    async function requestTacOtp(isResend = false, showOTPCb = () => {}) {
        let params = {};
        if (itemToDeactivate === CASA) {
            params = await getCasaPayload(REQUEST_TAC);
        } else if (itemToDeactivate === CARDS) {
            params = await getCardsPayload(REQUEST_TAC);
        }
        await requestTAC(params, false, "2fa/v1/tac")
            .then((response) => {
                const serverToken = response?.data?.token ?? null;
                setTacToken(serverToken);
                setIsShowTacModel(true);
                if (isResend) {
                    showOTPCb();
                }
            })
            .catch((error) => {
                showErrorToast({
                    message: error.message || COMMON_ERROR_MSG,
                });
            });
    }

    function navigateToTacFlow() {
        setMaskedMobileNo(maskedMobileNumber(m2uPhoneNumber));
        requestTacOtp();
    }

    async function onClickConfirm() {
        //S2U V4
        try {
            const s2uInitResponse = await s2uSDKInit();
            if (s2uInitResponse?.message || s2uInitResponse?.statusCode !== 0) {
                showErrorToast({
                    message: s2uInitResponse.message,
                });
            } else {
                if (s2uInitResponse?.actionFlow === SMS_TAC) {
                    //Tac Flow
                    const { isS2uV4ToastFlag } = getModel("misc");
                    setIsS2UDown(isS2uV4ToastFlag ?? false);
                    navigateToTacFlow();
                } else if (s2uInitResponse?.actionFlow === S2U_PUSH) {
                    if (s2uInitResponse?.s2uRegistrationDetails?.app_id === M2U) {
                        doS2uRegistration(navigation.navigate);
                    }
                } else {
                    //S2U Pull Flow
                    initS2UPull(s2uInitResponse);
                }
            }
        } catch (error) {
            s2uSdkLogs(error, "Deactivate casa/cards");
        }
    }

    const doS2uRegistration = (navigate) => {
        const { isSecureSwitchS2UBypass } = getModel("misc");
        if (isSecureSwitchS2UBypass) {
            navigateToTacFlow();
        } else {
            const redirect = {
                succStack: fromScreen,
                succScreen: fromModule,
            };
            navigateToS2UReg(navigate, route?.params, redirect, getModel);
        }
    };

    //S2U V4
    const initS2UPull = async (s2uInitResponse) => {
        if (s2uInitResponse?.s2uRegistrationDetails?.isActive) {
            if (s2uInitResponse?.s2uRegistrationDetails?.isUnderCoolDown) {
                //S2U under cool down period
                const { isSecureSwitchS2UBypass } = getModel("misc");
                if (isSecureSwitchS2UBypass) {
                    navigateToTacFlow();
                } else {
                    navigateToS2UCooling(navigation.navigate);
                }
            } else {
                const challengeRes = await initChallenge();
                if (challengeRes?.message) {
                    showErrorToast({ message: challengeRes?.message });
                } else {
                    setMapperData(challengeRes.mapperData);
                    setShowS2UModal(true);
                }
            }
        } else {
            //Redirect user to S2U registration flow
            doS2uRegistration(navigation.navigate);
        }
    };

    // getAPIParams
    const getAPIParams = async () => {
        let payload = {};
        if (itemToDeactivate === CASA) {
            payload = await getCasaPayload(S2U_INIT);
        } else if (itemToDeactivate === CARDS) {
            payload = await getCardsPayload(S2U_INIT);
        }

        return payload;
    };

    //S2U V4
    const s2uSDKInit = async () => {
        const transactionPayload = await getAPIParams();
        const functionCode = itemToDeactivate === CASA ? FN_BLOCK_CASA : FN_BLOCK_CREDIT_CARD;
        return await init(functionCode, transactionPayload);
    };

    //S2U V4
    const onS2uDone = async (response) => {
        const { transactionStatus, executePayload } = response;
        const isCardsCasaBlocked =
            transactionStatus && executePayload?.executed && executePayload?.statusCode === "0000";
        const entryPoint = {
            entryStack: fromModule,
            entryScreen: fromScreen,
            params: {
                isAccountSuspended: isCardsCasaBlocked,
            },
        };
        let ackDetails = {
            executePayload,
            transactionSuccess: transactionStatus,
            entryPoint,
            navigate: navigation.navigate,
        };
        if (executePayload?.executed) {
            const isBlocked = executePayload?.statusCode === "0000";
            let titleMessage;
            if (itemToDeactivate === CASA) {
                titleMessage = isBlocked ? ACC_SUCCESSFULLY_SUSPENDED : SUSPEND_ACC_UNSUCCESSFUL;
            } else if (itemToDeactivate === CARDS) {
                titleMessage = isBlocked ? CARD_SUCCESSFULLY_BLOCKED : BLOCK_CARD_UNSUCCESSFUL;
            }
            ackDetails = {
                ...ackDetails,
                titleMessage,
            };
        }
        if (transactionStatus && executePayload?.executed) {
            navigation.navigate(SECURE_SWITCH_STACK, {
                screen: DEACTIVATE_CARDS_CASA_ACK,
                params: {
                    from: M2U_DEACTIVATE,
                    fromModule,
                    fromScreen,
                    serverDate: executePayload?.serverDate,
                    formattedReferenceNumber: executePayload?.formattedReferenceNumber,
                    statusDesc: executePayload?.statusDesc,
                    ackStatusSuccess: isCardsCasaBlocked,
                    itemToDeactivate,
                    reasonForBlocking: blockReason,
                },
            });
        } else {
            handleS2UAcknowledgementScreen(ackDetails);
        }
        resetState();
    };

    //S2U V4
    const onS2uClose = () => {
        setShowS2UModal(false);
    };

    const resetState = () => {
        setShowS2UModal(false);
        setMapperData(false);
        setNonTxnData({ isNonTxn: true });
    };

    async function onOTPDonePress(otp, otpModalErrorCb) {
        let httpResp = {};
        let payload = {};
        let reasonForBlocking = null;
        if (itemToDeactivate === CASA) {
            payload = await getCasaPayload(TAC_FLOW_PAYLOAD, otp);
            httpResp = await suspendCASA(payload);
        } else if (itemToDeactivate === CARDS) {
            payload = await getCardsPayload(TAC_FLOW_PAYLOAD, otp);
            reasonForBlocking = payload?.reasonForBlocking;
            delete payload?.reasonForBlocking;
            httpResp = await blockCards(payload);
        }
        const { serverDate, formattedReferenceNumber, statusDesc, statusCode } = httpResp.data;
        let ackStatusSuccess;
        if (statusCode === "0000") {
            ackStatusSuccess = true;
        } else {
            ackStatusSuccess = false;
            otpModalErrorCb(httpResp.data.statusDesc || COMMON_ERROR_MSG);
        }
        setTacToken(null);
        setIsShowTacModel(false);
        navigation.navigate(SECURE_SWITCH_STACK, {
            screen: DEACTIVATE_CARDS_CASA_ACK,
            params: {
                from: M2U_DEACTIVATE,
                fromModule,
                fromScreen,
                serverDate,
                formattedReferenceNumber,
                statusDesc,
                ackStatusSuccess,
                itemToDeactivate,
                reasonForBlocking,
            },
        });
    }

    function onOTPClose() {
        setTacToken(null);
        setIsShowTacModel(false);
    }

    function onOTPResend(showOTPCb) {
        requestTacOtp(true, showOTPCb);
    }

    return (
        <ScreenContainer backgroundType="color" backgroundColor={MEDIUM_GREY}>
            <>
                <ScreenLayout
                    paddingBottom={0}
                    paddingTop={0}
                    paddingHorizontal={0}
                    header={
                        <HeaderLayout
                            backgroundColor={null}
                            headerLeftElement={<HeaderBackButton onPress={onBackHandler} />}
                            headerRightElement={<HeaderCloseButton onPress={onCloseHandler} />}
                            headerCenterElement={
                                <Typo
                                    text={CONFIRMATION}
                                    fontWeight="600"
                                    fontSize={16}
                                    lineHeight={19}
                                />
                            }
                        />
                    }
                >
                    <ScrollView contentContainerStyle={styles.scrollViewContainer}>
                        <View style={styles.contentText}>
                            <Typo
                                fontSize={14}
                                lineHeight={21}
                                letterSpacing={0}
                                color={BLACK}
                                textAlign="left"
                                text={
                                    itemToDeactivate === CASA
                                        ? CONFIRM_SUSPEND_ACCOUNTS_BELOW
                                        : CONFIRM_BLOCK_CARD_BELOW
                                }
                            />
                        </View>
                        {itemsListForDeactivation.map((blocks) => (
                            <View style={styles.listContainer} key={blocks.title}>
                                <View style={styles.suspendAccHeadingContainer}>
                                    <Typo
                                        fontSize={14}
                                        lineHeight={18}
                                        letterSpacing={0}
                                        color={BLACK}
                                        fontWeight="600"
                                        textAlign="left"
                                        text={blocks.title}
                                        style={styles.paddindBottom24}
                                    />
                                    {blocks.showEdit && (
                                        <Typo
                                            fontSize={14}
                                            lineHeight={18}
                                            letterSpacing={0}
                                            color={BLUE}
                                            fontWeight="600"
                                            textAlign="right"
                                            text={EDIT}
                                            onPressText={() => onClickInfoEdit(blocks.navBackInd)}
                                        />
                                    )}
                                </View>
                                {blocks.listItems.map((item, index) => (
                                    <DeactivateCardsCASAInfo
                                        key={item.number}
                                        index={index}
                                        {...item}
                                        itemToDeactivate={itemToDeactivate}
                                    />
                                ))}
                            </View>
                        ))}
                    </ScrollView>
                    {isShowTacModel && (
                        <OtpModal
                            otpCode={tacToken}
                            onOtpDonePress={onOTPDonePress}
                            onOtpClosePress={onOTPClose}
                            onResendOtpPress={onOTPResend}
                            mobileNumber={maskedMobileNo}
                            isS2UDown={isS2UDown}
                        />
                    )}
                    {showS2UModal && (
                        <Secure2uAuthenticationModal
                            token=""
                            onS2UDone={onS2uDone}
                            onS2uClose={onS2uClose}
                            s2uPollingData={mapperData}
                            transactionDetails={mapperData}
                            secure2uValidateData={mapperData}
                            nonTxnData={nonTxnData}
                            s2uEnablement={true}
                            navigation={navigation}
                            extraParams={{
                                metadata: {
                                    txnType: `BLOCK_${itemToDeactivate}`,
                                },
                            }}
                        />
                    )}
                </ScreenLayout>
                <FixedActionContainer>
                    <View
                        style={[
                            styles.btnFooter,
                            {
                                marginBottom: insets.bottom,
                            },
                        ]}
                    >
                        <ActionButton
                            backgroundColor={YELLOW}
                            fullWidth
                            componentCenter={
                                <Typo
                                    fontSize={14}
                                    fontWeight="600"
                                    lineHeight={18}
                                    text={CONFIRM}
                                />
                            }
                            onPress={onClickConfirm}
                        />
                    </View>
                </FixedActionContainer>
            </>
        </ScreenContainer>
    );
};

const styles = StyleSheet.create({
    btnFooter: {
        flexDirection: "row",
        justifyContent: "space-around",
        width: "100%",
    },
    contentText: {
        padding: 29,
        paddingBottom: 16,
    },
    listContainer: {
        backgroundColor: WHITE,
        padding: 24,
        marginBottom: 16,
    },
    paddindBottom24: {
        paddingBottom: 24,
    },
    scrollViewContainer: {
        backgroundColor: MEDIUM_GREY,
    },
    suspendAccHeadingContainer: {
        alignItems: "flex-start",
        display: "flex",
        flexDirection: "row",
        justifyContent: "space-between",
    },
});

DeactivateCardsCASAConfirmation.propTypes = {
    route: PropTypes.object,
    navigation: PropTypes.object,
    getModel: PropTypes.func,
};

export default withModelContext(DeactivateCardsCASAConfirmation);
