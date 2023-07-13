import PropTypes from "prop-types";
import React, { useState, useEffect } from "react";
import { View, StyleSheet, Dimensions, ScrollView, Image } from "react-native";
import DeviceInfo from "react-native-device-info";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { navigateToS2UCooling, navigateToS2UReg } from "@screens/OneTapAuth/CoolingNavigator";

import {
    M2U_DEACTIVATE,
    MORE,
    SECURE_SWITCH_STACK,
    TAB,
    DEACTIVATE_CARDS_CASA_CONFIRMATION,
    ACCOUNT_DETAILS_SCREEN,
    SELECT_CARDS_CASA_TO_DEACTIVATE,
    SELECT_REASON_TO_BLOCK_CARDS,
    WALLET_MAIN_DASHBOARD,
    DEACTIVATE_CARDS_CASA_ACK,
    DEBIT_CARD_DETAIL,
    MAYBANK2U,
    BANKINGV2_MODULE,
} from "@navigation/navigationConstant";

import ActionButton from "@components/Buttons/ActionButton";
import HeaderBackButton from "@components/Buttons/HeaderBackButton";
import HeaderCloseButton from "@components/Buttons/HeaderCloseButton";
import ScreenContainer from "@components/Containers/ScreenContainer";
import FixedActionContainer from "@components/Footers/FixedActionContainer";
import KillSwitchConfirmation from "@components/KillSwitchConfirmation";
import HeaderLayout from "@components/Layouts/HeaderLayout";
import ScreenLayout from "@components/Layouts/ScreenLayout";
import OtpModal from "@components/Modals/OtpModal";
import Secure2uAuthenticationModal from "@components/Modals/Secure2uAuthenticationModal";
import Popup from "@components/Popup";
import Typo from "@components/Text";
import { showErrorToast } from "@components/Toast";

import { withModelContext } from "@context";

import { invokeL3, requestTAC, blockDebitCard } from "@services";

import { BLACK, BLUE_BACKGROUND_COLOR, MEDIUM_GREY, WHITE, YELLOW } from "@constants/colors";
import { BLOCK_DEBIT_CARD, CARD_BLOCK, M2U, S2U_PUSH, SMS_TAC } from "@constants/data";
import {
    TWO_FA_TYPE_TAC,
    FN_BLOCK_DEBIT_CARD,
    TWO_FA_TYPE_SECURE2U_PULL,
} from "@constants/fundConstants";
import {
    CANCEL,
    CONFIRM,
    SUSPEND_CASA_LANDING,
    BLOCK_CARDS_LANDING,
    CARDS,
    CASA,
    SUSPEND_CASA_CONFIRMATION_MODEL,
    DEACTIVATE_M2U_ACCESS_LANDING,
    DEACTIVATE_M2U_CONFIRMATION_MODEL,
    SUSPEND_JOINT_ACCOUNTS,
    SUSPEND_INDIVIDUAL_ACCOUNTS,
    SP,
    BLOCK_SUPP_CARD,
    BLOCK_PRIMARY_CARD,
    BLOCK_DEBIT_CARD_LANDING,
    BLOCK_DEBIT_CARD_CONFIRMATION_MODEL,
    COMMON_ERROR_MSG,
    DEBIT_CARD,
    BLOCK_CARD_UNSUCCESSFUL,
    CARD_SUCCESSFULLY_BLOCKED,
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
} from "@utils/dataModel/utility";

import assets from "@assets";

const { width } = Dimensions.get("window");

const BlockedContent = ({ item: { title, desc }, index }) => {
    return (
        <View style={styles.listWithWhiteBgItem}>
            <Typo
                fontSize={14}
                fontWeight="400"
                lineHeight={17}
                textAlign="left"
                color={BLACK}
                text={`${index + 1}.`}
                style={styles.listWithWhiteBgItemIndex}
            />
            <View style={styles.listWithWhiteBgItemText}>
                {title && (
                    <Typo
                        fontSize={14}
                        fontWeight="600"
                        lineHeight={18}
                        textAlign="left"
                        color={BLACK}
                        text={title}
                    />
                )}
                {desc && (
                    <Typo
                        fontSize={14}
                        fontWeight="400"
                        lineHeight={18}
                        textAlign="left"
                        color={BLACK}
                        text={desc}
                    />
                )}
            </View>
        </View>
    );
};
BlockedContent.propTypes = {
    item: PropTypes.shape({
        title: PropTypes.string,
        desc: PropTypes.string,
    }),
    index: PropTypes.number,
};

const NonBlockedContent = ({ item: { title, desc }, index }) => {
    return (
        <View style={styles.listWithBulletPointsItem}>
            <View style={styles.listWithBulletPointsItemDot} />
            <View style={styles.listWithBulletPointsItemText}>
                <Typo
                    fontSize={14}
                    fontWeight="600"
                    lineHeight={18}
                    textAlign="left"
                    color={BLACK}
                    text={title}
                />
                {desc && (
                    <Typo
                        fontSize={14}
                        fontWeight="400"
                        lineHeight={18}
                        textAlign="left"
                        color={BLACK}
                        text={desc}
                    />
                )}
            </View>
        </View>
    );
};

NonBlockedContent.propTypes = {
    item: PropTypes.shape({
        title: PropTypes.string,
        desc: PropTypes.string,
    }),
    index: PropTypes.number,
};

const ReactivateContent = ({ text, index }) => {
    return (
        <View style={styles.listWithBlueBgItem}>
            <Typo
                fontSize={12}
                fontWeight="600"
                lineHeight={14}
                textAlign="left"
                color={BLACK}
                style={styles.marginTop10}
                text={`${index + 1}.    `}
            />
            <View style={styles.listWithBlueBgItemText}>
                <Typo
                    fontSize={12}
                    fontWeight="600"
                    lineHeight={14}
                    textAlign="left"
                    color={BLACK}
                    style={styles.marginTop10}
                    text={text}
                />
            </View>
        </View>
    );
};

ReactivateContent.propTypes = {
    text: PropTypes.string,
    index: PropTypes.number,
};

function DeactivateM2UCardsCASALanding({ route, navigation, getModel }) {
    const [showPopup, setShowPopup] = useState({ visible: false });
    const [maskedMobileNo, setMaskedMobileNo] = useState();
    const [tacToken, setTacToken] = useState();
    const [isShowTacModel, setIsShowTacModel] = useState(false);
    const [showS2UModal, setShowS2UModal] = useState(false);
    const [mapperData, setMapperData] = useState({});
    const [nonTxnData, setNonTxnData] = useState({ isNonTxn: true });
    const [isS2UDown, setIsS2UDown] = useState(false);

    const {
        fromModule,
        fromScreen,
        content: {
            title,
            desc,
            type,
            blockedContent,
            nonBlockedContent,
            reactivateContent,
            buttonText,
        },
        accDetails,
    } = route.params;
    const insets = useSafeAreaInsets();

    const { isPostPassword } = getModel("auth");
    const { m2uPhoneNumber } = getModel("m2uDetails");

    useEffect(() => {
        if (
            !isPostPassword &&
            (fromScreen === ACCOUNT_DETAILS_SCREEN || fromScreen === DEBIT_CARD_DETAIL)
        ) {
            handleL3();
        }
    }, []);

    async function handleL3() {
        try {
            // L3 call to invoke login page
            await invokeL3(true);
        } catch (error) {
            navigation.goBack();
        }
    }

    function onClickConfirmOnModel() {
        handlePopupClose();
        navigation.navigate(SECURE_SWITCH_STACK, {
            screen: DEACTIVATE_CARDS_CASA_CONFIRMATION,
            params: {
                from: M2U_DEACTIVATE,
                fromModule,
                fromScreen,
                accDetails,
                selectedAccType: accDetails?.[0]?.acctType,
                itemToDeactivate: CASA,
                itemsListForDeactivation: [
                    {
                        title: accDetails?.[0]?.isJointAccount
                            ? SUSPEND_JOINT_ACCOUNTS
                            : SUSPEND_INDIVIDUAL_ACCOUNTS,
                        showEdit: true,
                        navBackInd: 2,
                        listItems: accDetails,
                    },
                ],
            },
        });
    }

    function handleDeactivationForM2UCardsCASA() {
        const routeParams = {
            from: M2U_DEACTIVATE,
            fromModule,
            fromScreen,
        };

        if (type === DEACTIVATE_M2U_ACCESS_LANDING.type) {
            setShowPopup({
                visible: true,
                onClose: handlePopupClose,
                ContentComponent: (
                    <KillSwitchConfirmation
                        {...DEACTIVATE_M2U_CONFIRMATION_MODEL}
                        primaryAction={{
                            text: CONFIRM,
                            onPress: handleOnConfirm,
                        }}
                        secondaryAction={{
                            text: CANCEL,
                            onPress: handlePopupClose,
                        }}
                    />
                ),
            });
        } else if (type === SUSPEND_CASA_LANDING.type) {
            if (fromScreen === ACCOUNT_DETAILS_SCREEN || fromScreen === WALLET_MAIN_DASHBOARD) {
                setShowPopup({
                    visible: true,
                    onClose: handlePopupClose,
                    ContentComponent: (
                        <KillSwitchConfirmation
                            {...SUSPEND_CASA_CONFIRMATION_MODEL}
                            primaryAction={{
                                text: CONFIRM,
                                onPress: onClickConfirmOnModel,
                            }}
                            secondaryAction={{
                                text: CANCEL,
                                onPress: handlePopupClose,
                            }}
                        />
                    ),
                });
            } else {
                navigation.navigate(SECURE_SWITCH_STACK, {
                    screen: SELECT_CARDS_CASA_TO_DEACTIVATE,
                    params: {
                        ...routeParams,
                        itemToDeactivate: CASA,
                    },
                });
            }
        } else if (type === BLOCK_CARDS_LANDING.type) {
            if (fromScreen === ACCOUNT_DETAILS_SCREEN) {
                const itemsListForDeactivation = [
                    {
                        id: CARD_BLOCK,
                        title:
                            accDetails?.[0]?.mainCardType === SP
                                ? BLOCK_SUPP_CARD
                                : BLOCK_PRIMARY_CARD,
                        showEdit: true,
                        navBackInd: 3,
                        listItems: accDetails,
                    },
                ];
                navigation.navigate(SECURE_SWITCH_STACK, {
                    screen: SELECT_REASON_TO_BLOCK_CARDS,
                    params: {
                        ...routeParams,
                        itemsListForDeactivation,
                        itemToDeactivate: CARDS,
                    },
                });
            } else {
                navigation.navigate(SECURE_SWITCH_STACK, {
                    screen: SELECT_CARDS_CASA_TO_DEACTIVATE,
                    params: {
                        ...routeParams,
                        itemToDeactivate: CARDS,
                    },
                });
            }
        } else if (type === BLOCK_DEBIT_CARD_LANDING.type && fromScreen === DEBIT_CARD_DETAIL) {
            const [{ name }] = accDetails;
            setShowPopup({
                visible: true,
                onClose: handlePopupClose,
                ContentComponent: (
                    <KillSwitchConfirmation
                        {...BLOCK_DEBIT_CARD_CONFIRMATION_MODEL(name)}
                        primaryAction={{
                            text: CONFIRM,
                            onPress: onConfirmBlockDebitCard,
                        }}
                        secondaryAction={{
                            text: CANCEL,
                            onPress: handlePopupClose,
                        }}
                    />
                ),
            });
        }
    }

    const handleOnConfirm = () => {
        setShowPopup({ visible: false });
        navigation.navigate(SECURE_SWITCH_STACK, {
            screen: M2U_DEACTIVATE,
            params: { from: M2U_DEACTIVATE, fromModule, fromScreen },
        });
    };

    const handlePopupClose = () => {
        setShowPopup({ visible: false });
    };

    function onBackHandler() {
        navigation.goBack();
    }

    function onCloseHandler() {
        if (fromModule && fromScreen) {
            navigation.navigate(fromModule, { screen: fromScreen });
        } else {
            navigation.navigate(TAB, { screen: MORE });
        }
    }

    function getBannerImage() {
        if (type === DEACTIVATE_M2U_ACCESS_LANDING.type) {
            return assets.deactivateM2UStart;
        } else if (type === SUSPEND_CASA_LANDING.type) {
            return assets.deactivateCASABanner;
        } else if (type === BLOCK_CARDS_LANDING.type || type === BLOCK_DEBIT_CARD_LANDING.type) {
            return assets.deactivateCardsBanner;
        }
    }

    function navigateToTacFlow() {
        setMaskedMobileNo(maskedMobileNumber(m2uPhoneNumber));
        requestTacOtp();
    }

    const onConfirmBlockDebitCard = async () => {
        handlePopupClose();
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
            s2uSdkLogs(error, "freeze debit card");
        }
    };

    const doS2uRegistration = (navigate) => {
        const { isSecureSwitchS2UBypass } = getModel("misc");
        if (isSecureSwitchS2UBypass) {
            navigateToTacFlow();
        } else {
            const redirect = {
                succStack: TAB,
                succScreen: MAYBANK2U,
            };
            navigateToS2UReg(navigate, route?.params, redirect, getModel);
        }
    };

    //S2U V4
    const initS2UPull = async (s2uInitResponse) => {
        const { isSecureSwitchS2UBypass } = getModel("misc");
        if (s2uInitResponse?.s2uRegistrationDetails?.isActive) {
            if (s2uInitResponse?.s2uRegistrationDetails?.isUnderCoolDown) {
                //S2U under cool down period
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
        const [{ number, name }] = accDetails;
        const cardNo = await formatAccNumberTo16Digits(number);
        const encryptedCardNo = await encryptData(cardNo);
        return {
            cardNumber: encryptedCardNo,
            maskedCardNumber: maskAccount(cardNo, 16),
            cardName: name,
            twoFAType: TWO_FA_TYPE_SECURE2U_PULL,
        };
    };

    //S2U V4
    const s2uSDKInit = async () => {
        const transactionPayload = await getAPIParams();
        return await init(FN_BLOCK_DEBIT_CARD, transactionPayload);
    };

    //S2U V4
    const onS2uDone = async (response) => {
        const { transactionStatus, executePayload } = response;
        const isDebitCardBlocked =
            transactionStatus && executePayload?.executed && executePayload?.statusCode === "0000";
        const entryPoint = {
            entryStack: BANKINGV2_MODULE,
            entryScreen: DEBIT_CARD_DETAIL,
            params: {
                isAccountSuspended: isDebitCardBlocked,
            },
        };
        let ackDetails = {
            executePayload,
            transactionSuccess: transactionStatus,
            entryPoint,
            navigate: navigation.navigate,
        };
        const [{ number, name }] = accDetails;
        const cardNo = await formatAccNumberTo16Digits(number);
        ackDetails.transactionDetails = {
            cardDetails: `${name}\n${maskAccount(cardNo, 12)}`,
        };
        if (executePayload?.executed) {
            const titleMessage =
                executePayload?.statusCode === "0000"
                    ? CARD_SUCCESSFULLY_BLOCKED
                    : BLOCK_CARD_UNSUCCESSFUL;
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
                    ackStatusSuccess: isDebitCardBlocked,
                    itemToDeactivate: DEBIT_CARD,
                    accDetails,
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

    async function requestTacOtp(isResend = false, showOTPCb = () => {}) {
        let params = {};
        const [{ number }] = accDetails;
        const encryptedCardNo = await encryptData(formatAccNumberTo16Digits(number));
        params = {
            fundTransferType: BLOCK_DEBIT_CARD,
            cardNo: encryptedCardNo,
        };
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

    async function onOTPDonePress(otp, otpModalErrorCb) {
        const deviceInfo = getModel("device");
        const mobileSDK = getDeviceRSAInformation(deviceInfo.deviceInformation, DeviceInfo);
        let httpResp = {};
        let payload = {};
        const [{ number }] = accDetails;
        const encryptedCardNo = await encryptData(formatAccNumberTo16Digits(number));
        payload = {
            mobileSDKData: mobileSDK,
            tac: otp,
            twoFAType: TWO_FA_TYPE_TAC,
            cardNumber: encryptedCardNo,
        };
        httpResp = await blockDebitCard(payload);
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
                itemToDeactivate: DEBIT_CARD,
                accDetails,
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
                        />
                    }
                >
                    <ScrollView contentContainerStyle={styles.scrollViewContainer}>
                        <Image
                            resizeMode="stretch"
                            style={styles.imageBg}
                            source={getBannerImage()}
                        />
                        <View style={styles.mainContainer}>
                            <Typo
                                fontSize={20}
                                fontWeight="600"
                                lineHeight={28}
                                textAlign="left"
                                style={styles.marginTop30}
                                text={title}
                            />
                            <View style={styles.descriptionContainer}>
                                <Typo
                                    fontSize={16}
                                    fontWeight="normal"
                                    color={BLACK}
                                    lineHeight={20}
                                    textAlign="left"
                                    style={styles.marginTop10}
                                    text={desc}
                                />
                                <Typo
                                    fontSize={14}
                                    fontWeight="600"
                                    color={BLACK}
                                    lineHeight={18}
                                    textAlign="left"
                                    style={styles.marginTop20}
                                    text={blockedContent.title}
                                />
                                <View style={styles.listWithWhiteBgContainer}>
                                    {blockedContent.list.map((item, index) => {
                                        return (
                                            <BlockedContent
                                                item={item}
                                                key={item?.title}
                                                index={index}
                                            />
                                        );
                                    })}
                                </View>
                                <Typo
                                    fontSize={14}
                                    fontWeight="600"
                                    color={BLACK}
                                    lineHeight={18}
                                    textAlign="left"
                                    style={styles.marginTop20}
                                    text={nonBlockedContent.title}
                                />
                                {nonBlockedContent.list.map((item, index) => {
                                    return (
                                        <NonBlockedContent
                                            item={item}
                                            key={item?.title}
                                            index={index}
                                        />
                                    );
                                })}
                                <View style={styles.listWithBlueBgContainer}>
                                    <Image
                                        style={styles.insightIcon}
                                        source={assets.iconInsightBlue}
                                    />
                                    <View style={styles.listWithBlueBgTitle}>
                                        <Typo
                                            text={reactivateContent.title}
                                            fontWeight="600"
                                            textAlign="left"
                                            fontSize={12}
                                            lineHeight={16}
                                        />
                                        {reactivateContent.list.map((text, index) => {
                                            return (
                                                <ReactivateContent
                                                    text={text}
                                                    index={index}
                                                    key={text}
                                                />
                                            );
                                        })}
                                    </View>
                                </View>
                            </View>
                        </View>
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
                                    txnType: "BLOCK_DEBIT_CARD",
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
                                    text={buttonText}
                                />
                            }
                            onPress={handleDeactivationForM2UCardsCASA}
                        />
                    </View>
                </FixedActionContainer>
                <Popup {...showPopup} />
            </>
        </ScreenContainer>
    );
}

const styles = StyleSheet.create({
    btnFooter: {
        flexDirection: "row",
        justifyContent: "space-around",
        width: "100%",
    },
    listWithBulletPointsItemDot: {
        backgroundColor: BLACK,
        borderRadius: 8 / 2,
        height: 8,
        marginRight: 20,
        marginTop: 6,
        width: 8,
    },
    listWithWhiteBgContainer: {
        backgroundColor: WHITE,
        borderRadius: 8,
        paddingHorizontal: 16,
        paddingTop: 20,
        paddingBottom: 6,
        marginTop: 16,
        width: "100%",
    },
    imageBg: {
        width: "100%",
    },
    insightIcon: {
        marginRight: 10,
    },
    listWithWhiteBgItemText: {
        flex: 1,
    },
    listWithBlueBgItemText: {
        flex: 1,
    },
    mainContainer: {
        paddingHorizontal: 24,
        width,
    },
    marginTop10: { marginTop: 10 },
    marginTop20: { marginTop: 20 },
    marginTop30: { marginTop: 30 },
    listWithBlueBgContainer: {
        backgroundColor: BLUE_BACKGROUND_COLOR,
        borderRadius: 10,
        flexDirection: "row",
        marginTop: 20,
        paddingHorizontal: 10,
        paddingVertical: 15,
    },
    listWithBlueBgTitle: { flex: 1 },
    listWithWhiteBgItemIndex: {
        marginRight: 8,
    },
    listWithBlueBgItem: {
        flexDirection: "row",
    },
    listWithWhiteBgItem: {
        flexDirection: "row",
        alignItems: "flex-start",
        marginBottom: 10,
    },
    scrollViewContainer: { paddingBottom: 50 },
    listWithBulletPointsItemText: {
        flex: 1,
        lineHeight: 20,
    },
    listWithBulletPointsItem: {
        alignItems: "flex-start",
        flexDirection: "row",
        marginTop: 20,
    },
});

DeactivateM2UCardsCASALanding.propTypes = {
    route: PropTypes.object,
    navigation: PropTypes.object,
    getModel: PropTypes.func,
};

export default withModelContext(DeactivateM2UCardsCASALanding);
