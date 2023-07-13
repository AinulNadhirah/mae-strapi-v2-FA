import PropTypes from "prop-types";
import React, { useEffect, useState, useCallback, useRef } from "react";
import { View, StyleSheet, TouchableOpacity, ScrollView } from "react-native";

import HeaderLayout from "@layouts/HeaderLayout";
import ScreenLayout from "@layouts/ScreenLayout";

import HeaderBackButton from "@components/Buttons/HeaderBackButton";
import ScreenContainer from "@components/Containers/ScreenContainer";
import Typo from "@components/Text";
import { showErrorToast, showSuccessToast } from "@components/Toast";

import { withModelContext } from "@context";

import { checkzakatDownTimeAPI, fetchZakatDetailsAPI, cancelAutoDebitAPI } from "@services";

import { logEvent } from "@services/analytics";

import { MEDIUM_GREY, YELLOW, WHITE, GREY, BLUE, BLACK } from "@constants/colors";
import { 
    COMMON_ERROR_MSG, 
    FA_SCREEN_NAME, 
    FA_VIEW_SCREEN, 
    SUCC_STATUS, 
    ZAKAT_DEBIT_SETTING_NOTE1, 
    ZAKAT_DEBIT_SETTING_NOTE2, 
    ZAKAT_DEBIT_SETTING_NOTE3, 
    ZAKAT_CANCEL_AUTODEBIT_DESCR, 
    FA_ACTION_NAME, 
    FA_FORM_COMPLETE,
    SUCCESS_TOAST_MOBILE_SETTINGS,
    SUCCESS_TOAST_ZAKATBODY_SETTINGS,
    SUCCESS_TOAST_ZAKATACCOUNT_SETTINGS,
    AUTHORISATION_WAS_REJECTED,
    FA_TRANSACTION_ID,
    FA_SELECT_ACTION
} from "@constants/strings";

import { maskedMobileNumber } from "@utils";
import TacModal from "@components/Modals/TacModal";
import FixedActionContainer from "@components/Footers/FixedActionContainer";
import Secure2uAuthenticationModal from "@components/Modals/Secure2uAuthenticationModal";
import ActionButton from "@components/Buttons/ActionButton";
import Popup from "@components/Popup";
import { SETTINGS_MODULE, ZAKAT_SERVICES_STACK, ZAKAT_FAIL } from "@navigation/navigationConstant";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { navigateToS2UCooling, navigateToS2UReg } from "@screens/OneTapAuth/CoolingNavigator";
import { init, initChallenge } from "@utils/dataModel/s2uSDKUtil";
import { FN_ZAKAT_CANCEL } from "@constants/fundConstants";
import { M2U } from "@constants/data";
import moment from "moment";
import { maskAccountNumber, removeWhiteSpaces } from "@utils/dataModel/utilityPartial.3";
import { APIContactToDisplayCntry } from "@utils/dataModel/utilityZakat";

const styles = StyleSheet.create({
    calculationPointsContainer: {
        flexDirection: "row",
        justifyContent: `flex-start`,
        width: "100%",
    },
    footerNotesStyle: {
        // borderTopWidth: 0.5, 
        // borderTopColor: FADE_GREY, 
        opacity: 0.3,
        marginTop: 0,
        flex: 1,
        marginHorizontal: 24,
        paddingBottom: 24
    },
    pointsTextStyle: {
        color: `#000000`,
        fontFamily: "montserrat",
        fontSize: 13,
        fontStyle: "normal",
        fontWeight: "normal",
        textAlign: "left",
        letterSpacing: 0,
        lineHeight: 17,
        marginLeft: 10,
        marginRight: 20,
        width: "90%",
    },
    switchRow: {
        backgroundColor: WHITE,
        borderTopColor: GREY,
        borderTopWidth: 1,
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: 'center',
        paddingHorizontal: 24,
        paddingVertical: 32,
        flex: 1,
    },
    switchRowLast: {
        borderBottomColor: GREY,
        borderBottomWidth: 1,
    },
    titleContainer: {
        paddingHorizontal: 24,
        paddingVertical: 24
    },
    button: {
        marginRight: 24,
    },
    styleForLargeContent: {
        flex: 1, 
        flexDirection: 'column', 
        justifyContent: 'flex-start', 
        alignItems: 'flex-start'
    },
    container: {
        flex: 1,
    },
});

function ZakatAutoDebitSettings({ getModel, updateModel, navigation, route }) {
    const handleBack = useCallback(() => {
        navigation.canGoBack() && navigation.goBack();
    }, [navigation]);

    const { mobileUpdate, accountUpdate, zakatBodyUpdate, isDebitSetupSuccess, zakatDetailsData } = route?.params ?? false;

    const [zakatDebitSetupSuccess, setZakatDebitSetupSuccess] = useState(isDebitSetupSuccess);
    const [zakatDebitDataDetails, setZakatDebitDataDetails] = useState(zakatDetailsData);

    const [accountNameNumber, setAccountNameNumber] = useState("");

    const [showTACModal, setShowTACModal] = useState(false);
    const [isS2UDown, setIsS2UDown] = useState(false);

    const [showS2UModal, setShowS2UModal] = useState(false);
    const [s2uMapperData, sets2uMapperData] = useState();

    const [s2uInitRespRefId, setS2uInitRespRefId] = useState("");

    useEffect(() => {
        if (mobileUpdate) {
            logEvent(FA_FORM_COMPLETE, {
                [FA_SCREEN_NAME]: "Settings_ADZakat_EditMobile_Success",
                [FA_TRANSACTION_ID]: route?.params?.referenceId
            });
            showSuccessToast({
                message: SUCCESS_TOAST_MOBILE_SETTINGS
            });
        }
        accountUpdate && showSuccessToast({
            message: SUCCESS_TOAST_ZAKATACCOUNT_SETTINGS
        }) && logEvent(FA_FORM_COMPLETE, {
            [FA_SCREEN_NAME]: "Settings_ADZakat_EditAccount_Success",
            [FA_TRANSACTION_ID]: route?.params?.referenceId
        });

        zakatBodyUpdate && showSuccessToast({
            message: SUCCESS_TOAST_ZAKATBODY_SETTINGS
        }) && logEvent(FA_FORM_COMPLETE, {
            [FA_SCREEN_NAME]: "Settings_ADZakat_EditBody_Success",
            [FA_TRANSACTION_ID]: route?.params?.referenceId
        });

        (async () => {
            (mobileUpdate || accountUpdate || zakatBodyUpdate) && await reFetchZakatDetails();
        })();
    }, [mobileUpdate, route]);

    async function reFetchZakatDetails() {
        try {
            const response = await fetchZakatDetailsAPI(true);
            if (response?.data) {
                const { data, status } = { ...response?.data };
                setZakatDebitSetupSuccess(status.toLowerCase() === "SUCCESS".toLowerCase());
                setZakatDebitDataDetails(data);
            }
        } catch (error) {
            navigation.goBack();
            showErrorToast({ message: error?.message || COMMON_ERROR_MSG });
        }
    }

    const [showCancelAutoDebitInfo, setShowCancelAutoDebitInfo] = useState(false);

    const { mobileNumber } = getModel("user");

    useEffect(() => {
        if (zakatDebitDataDetails && zakatDebitDataDetails?.accountNo) {
            const accountDetails = zakatDebitDataDetails?.accountNo?.split(":");
            if (accountDetails && accountDetails.length) {
                const acctNum = removeWhiteSpaces(accountDetails[1]);
                setAccountNameNumber(accountDetails[0].toString().concat("\n").concat(maskAccountNumber(acctNum)));
            }
        }
    }, [zakatDebitDataDetails]);

    const checkIfAutoDebitActive = () => {
        if (zakatDebitDataDetails?.isActive) return "ACTIVE";
        return "INACTIVE";
    };

    const cancelAutoDebit = async() => {
        logEvent(FA_VIEW_SCREEN, {
            [FA_SCREEN_NAME]: "Settings_AutoDebitZakat_CancelAutoDebit",
        });

        setShowCancelAutoDebitInfo(false);
        await checkIfDowntime();
    };

    async function checkIfDowntime() {
        try {
            const response = await checkzakatDownTimeAPI();
            const { status, message } = { ...response.data };
            if (status.toUpperCase() === SUCC_STATUS.toUpperCase()) {
                await cancelAutoDebitSetup();
            } else {
                showErrorToast({
                    message: message || COMMON_ERROR_MSG
                });
            }
        } catch (error) {
            showErrorToast({ message: error?.message ?? COMMON_ERROR_MSG });
        }
    }

    async function cancelAutoDebitSetup() {
        await initiateS2USdk();
    }

    const initiateS2USdk = async () => {
        const s2uInitResponse = await s2uSDKInit();
        setS2uInitRespRefId(s2uInitResponse?.transactionToken);
        if (s2uInitResponse?.message || s2uInitResponse?.statusCode !== 0) {
            showErrorToast({ message: s2uInitResponse?.message || COMMON_ERROR_MSG });
        } else {
            if (s2uInitResponse?.actionFlow === "SMS_TAC") {
                const { isS2uV4ToastFlag } = getModel("misc");
                setIsS2UDown(isS2uV4ToastFlag || false);
                setShowTACModal(true);
            } else if (s2uInitResponse?.actionFlow === "S2U_PULL") {
                if (s2uInitResponse?.s2uRegistrationDetails?.isActive) {
                    if (s2uInitResponse?.s2uRegistrationDetails?.isUnderCoolDown) {
                        navigateToS2UCooling(navigation.navigate);
                    } else { await proccedForS2U(); }
                } else { doS2uRegistration(); }
            } else {
                if (s2uInitResponse?.s2uRegistrationDetails?.app_id === M2U) { doS2uRegistration(); }
            }
        }
    };

    async function proccedForS2U() {
        const challengeRes = await initChallenge();
        if (challengeRes?.mapperData) {
            sets2uMapperData(challengeRes?.mapperData); setShowS2UModal(true);
        } else { initFailure(challengeRes); }
    }

    const doS2uRegistration = () => {
        const params = {
            ...route?.params,
            phone: zakatDebitDataDetails?.mobileNo ?? mobileNumber,
        };

        const redirect = {
            succStack: SETTINGS_MODULE,
            succScreen: "ZakatAutoDebitSettings"
        };

        navigateToS2UReg(navigation.navigate, params, redirect, getModel);
    };

    function initFailure(details) {
        forceFail(details?.message, 
            details?.refNo?.toUpperCase() || "", 
            details?.timeStamp || "", 
            "Deny");
    }

    const forceFail = (message, referenceId, timeStamp, rsaStatus) => {
        navigation.navigate(ZAKAT_SERVICES_STACK, {
            screen: ZAKAT_FAIL,
            params: {
                flowParams: {
                    success: {
                        stack: SETTINGS_MODULE,
                        screen: "ZakatAutoDebitSettings",
                    },
                    fail: {
                        stack: SETTINGS_MODULE,
                        screen: "ZakatAutoDebitSettings",
                    },
                    params: {
                        message,
                        referenceId,
                        timeStamp,
                        rsaStatus,
                        transType: "CANCELAUTODEBIT"
                    },
                },
            }
        });
    };

    const s2uSDKInit = async () => {
        const zakatData = {
            payFrom: accountNameNumber,
            zakatType: zakatDebitDataDetails?.zakatType ?? "Zakat Simpanan & Pelaburan",
            zakatBody: zakatDebitDataDetails?.zakatBody,
            zadId: zakatDebitDataDetails?.zadId,
            mobileNumber: APIContactToDisplayCntry(zakatDebitDataDetails?.mobileNo),
            dateTime: moment(new Date()).format("DD MMMM YYYY, hh:mm A"),
        };
        return await init(FN_ZAKAT_CANCEL, zakatData);
    };

    function onS2UDone(response) {
        const { transactionStatus, executePayload } = response;
        onS2UClose();

        if (transactionStatus) {
            if (executePayload?.executed) {
                if (executePayload?.body?.status.toUpperCase() === SUCC_STATUS.toUpperCase()) {
                    navigation.navigate(SETTINGS_MODULE, {
                        screen: "ZakatAutoDebitCancelled",
                        params: {
                            cancelledAutoDebit: true,
                            referenceId: executePayload?.body?.data
                        }
                    });
                } else {
                    handleError(executePayload);
                }
            }
        } else {
            handleError(executePayload);
        }
    }

    function handleError(error) {
        const timeNow = moment(new Date()).format("DD MMMM, YYYY hh:mm A");
        if (error?.code === 423 || error?.code === 422) {
            forceFail(error?.payload?.message ?? error?.payload?.statusDesc, 
                s2uInitRespRefId || "", 
                error?.payload?.serverDate || timeNow,
                error?.code === 423 ? "Lock" : "Deny"
            );
        } else if (error?.code === 400) {
            forceFail(AUTHORISATION_WAS_REJECTED, 
                s2uInitRespRefId, 
                error?.payload?.timestamp || timeNow,
                "Rejected"
            );
        } else if (error?.code === "M408") {
            forceFail(error?.payload?.statusDesc ?? error?.payload?.message, 
                s2uInitRespRefId, 
                error?.payload?.timestamp || timeNow,
                "Expired"
            );
        } else {
            forceFail(error?.payload?.message ?? error?.payload?.statusDesc, 
                s2uInitRespRefId, 
                error?.payload?.timestamp ?? timeNow,
                "Deny"
            );
        }
    }

    function onS2UClose() {
        setShowS2UModal(false);
    }

    const scrollView = useRef();

    const { bottom } = useSafeAreaInsets();

    const tacParams = (() => {
        return {
            zadId: zakatDebitDataDetails?.zadId,
            mobileNo: zakatDebitDataDetails?.mobileNo,
            fundTransferType: "MAE_ZAKAT_CANCEL",
        };
    })();

    async function onTACDone(tac) {
        const reqObject = {
            zadId: zakatDebitDataDetails?.zadId,
            mobileNo: zakatDebitDataDetails?.mobileNo,
            fundTransferType: "MAE_ZAKAT_CANCEL_VERIFY",
            tacNumber: tac,
        };
        try {
            setShowTACModal(false);
            const response = await cancelAutoDebitAPI(reqObject);
            const { status, message, data } = response.data;
            if (status.toUpperCase() === SUCC_STATUS.toUpperCase()) {
                navigation.navigate(SETTINGS_MODULE, {
                    screen: "ZakatAutoDebitCancelled",
                    params: {
                        cancelledAutoDebit: true,
                        referenceId: data
                    }
                });
            } else {
                showErrorToast({
                    message: message || COMMON_ERROR_MSG
                });
            }
        } catch (err) {
            showErrorToast({ message: err?.error?.message || err?.status || "Invalid TAC" });
        }
    }

    function onTacModalCloseButtonPressed() {
        setShowTACModal(false);
    }

    function goToSwitchAccount() {
        logEvent(FA_SELECT_ACTION, {
            [FA_SCREEN_NAME]: "Settings_AutoDebitZakat",
            [FA_ACTION_NAME]: "Switch Account"
        });
        navigation.navigate(SETTINGS_MODULE, {
            screen: "AccountSelection",
            params: {
                zakatDetails: zakatDebitDataDetails
            }
        });
    }

    function goToSwitchBody() {
        logEvent(FA_SELECT_ACTION, {
            [FA_SCREEN_NAME]: "Settings_AutoDebitZakat",
            [FA_ACTION_NAME]: "Switch Body"
        });
        navigation.navigate(SETTINGS_MODULE, {
            screen: "ZakatUpdateBody",
            params: {
                zakatDetails: zakatDebitDataDetails
            }
        });
    }

    function goToEditPhoneNumber() {
        logEvent(FA_SELECT_ACTION, {
            [FA_SCREEN_NAME]: "Settings_AutoDebitZakat",
            [FA_ACTION_NAME]: "Edit Mobile Number"
        });
        navigation.navigate(SETTINGS_MODULE, {
            screen: "ZakatUpdateMobile",
            params: {
                zakatDetails: zakatDebitDataDetails
            }
        });
    }

    function openCancelAutoDebitPopUp() {
        logEvent(FA_SELECT_ACTION, {
            [FA_SCREEN_NAME]: "Settings_AutoDebitZakat",
            [FA_ACTION_NAME]: "Cancel Auto Debit"
        });
        setShowCancelAutoDebitInfo(true);
        
        logEvent(FA_VIEW_SCREEN, {
            [FA_SCREEN_NAME]: "Settings_AutoDebitZakat_CancelAutoDebit",
        });
    }

    return (
        <>
        <ScreenContainer
            backgroundType="color"
            backgroundColor={MEDIUM_GREY}
            showLoaderModal={!zakatDebitSetupSuccess}
            analyticScreenName="Settings_AutoDebitZakat"
        >
            <>
                {
                    zakatDebitSetupSuccess && (
                        <>
                            <ScreenLayout
                                paddingTop={0}
                                paddingHorizontal={0}
                                paddingBottom={bottom}
                                header={
                                    <HeaderLayout
                                        backgroundColor={YELLOW}
                                        headerCenterElement={
                                            <Typo
                                                text="Auto Debit for Zakat"
                                                fontWeight="600"
                                                fontSize={16}
                                                lineHeight={19}
                                            />
                                        }
                                        headerLeftElement={<HeaderBackButton onPress={handleBack} />}
                                    />
                                }
                            >
                                <ScrollView
                                    ref={scrollView}
                                    style={styles.container}
                                    showsVerticalScrollIndicator={false}
                                >

                                    <View>
                                    <View style={styles.titleContainer}>
                                        <Typo
                                            text="Zakat Simpanan & Pelaburan"
                                            fontWeight="300"
                                            fontSize={20}
                                            lineHeight={28}
                                            textAlign="left"
                                        />
                                    </View>
                                    <View style={[styles.switchRow, styles.switchRowLast]}>
                                        <Typo
                                            text="Auto Debit"
                                            fontWeight="400"
                                            fontSize={14}
                                            lineHeight={18}
                                            textAlign="left"
                                        />
                                        <Typo
                                            text={checkIfAutoDebitActive()}
                                            fontWeight="300"
                                            fontSize={14}
                                            lineHeight={18}
                                            textAlign="right"
                                        />
                                    </View>
                                    <View style={[styles.switchRow, styles.switchRowLast]}>
                                        <View>
                                            <Typo
                                                text="Amount"
                                                fontWeight="400"
                                                fontSize={14}
                                                lineHeight={18}
                                                textAlign="left"
                                            />
                                            <Typo
                                                text="To be calculated on 31 Oct every year"
                                                fontWeight="600"
                                                fontSize={14}
                                                lineHeight={18}
                                                textAlign="left"
                                            />
                                        </View>
                                    </View>
                                    <View style={[styles.switchRow, styles.switchRowLast]}>
                                        <View style={styles.styleForLargeContent}>
                                            <Typo
                                                text="Pay From"
                                                fontWeight="400"
                                                fontSize={14}
                                                lineHeight={18}
                                                textAlign="left"
                                            />
                                            <Typo
                                                text={accountNameNumber}
                                                fontWeight="600"
                                                fontSize={14}
                                                lineHeight={18}
                                                textAlign="left"
                                            />
                                        </View>
                                        <TouchableOpacity onPress={goToSwitchAccount}>
                                            <Typo
                                                fontSize={14}
                                                fontWeight="600"
                                                fontStyle="normal"
                                                letterSpacing={0}
                                                lineHeight={18}
                                                color={BLUE}
                                                textAlign="left"
                                                text="Switch Account"
                                            />
                                        </TouchableOpacity>
                                        
                                    </View>
                                    <View style={[styles.switchRow, styles.switchRowLast]}>
                                        <View style={styles.styleForLargeContent}>
                                            <Typo
                                                text="Zakat Body"
                                                fontWeight="400"
                                                fontSize={14}
                                                lineHeight={18}
                                                textAlign="left"
                                            />
                                            <Typo
                                                text={zakatDebitDataDetails?.zakatBody ?? ""}
                                                fontWeight="600"
                                                fontSize={14}
                                                lineHeight={18}
                                                textAlign="left"
                                            />
                                        </View>
                                        <TouchableOpacity
                                            onPress={goToSwitchBody}>
                                            <Typo
                                                fontSize={14}
                                                fontWeight="600"
                                                fontStyle="normal"
                                                letterSpacing={0}
                                                lineHeight={18}
                                                color={BLUE}
                                                textAlign="left"
                                                text="Switch body"
                                            />
                                        </TouchableOpacity>
                                        
                                    </View>
                                    <View style={[styles.switchRow, styles.switchRowLast]}>
                                        <View>
                                            <Typo
                                                text="Mobile Number"
                                                fontWeight="400"
                                                fontSize={14}
                                                lineHeight={18}
                                                textAlign="left"
                                            />
                                            <Typo
                                                text={maskedMobileNumber(APIContactToDisplayCntry(zakatDebitDataDetails?.mobileNo)) ?? maskedMobileNumber(APIContactToDisplayCntry(mobileNumber))}
                                                fontWeight="600"
                                                fontSize={14}
                                                lineHeight={18}
                                                textAlign="left"
                                            />
                                        </View>
                                        <TouchableOpacity
                                            onPress={goToEditPhoneNumber}>
                                            <Typo
                                                fontSize={14}
                                                fontWeight="600"
                                                fontStyle="normal"
                                                letterSpacing={0}
                                                lineHeight={18}
                                                color={BLUE}
                                                textAlign="left"
                                                text="Edit"
                                            />
                                        </TouchableOpacity>
                                        
                                    </View>
                                </View>
                                <View style={styles.footerNotesStyle}>
                                    <Typo
                                        text="Note:"
                                        fontWeight="400"
                                        fontSize={14}
                                        lineHeight={40}
                                        textAlign="left"
                                    />

                                    {[ZAKAT_DEBIT_SETTING_NOTE1, ZAKAT_DEBIT_SETTING_NOTE2, ZAKAT_DEBIT_SETTING_NOTE3].map((item, index) => {
                                        return (
                                            <View key={index} style={styles.calculationPointsContainer}>
                                                <Typo
                                                    text={`${++index}.`}
                                                    fontSize={12}
                                                    fontWeight="300"
                                                    lineHeight={17}
                                                />
                                                <Typo
                                                    text={item}
                                                    fontSize={20}
                                                    fontWeight="400"
                                                    style={styles.pointsTextStyle}
                                                />
                                            </View>
                                        );
                                    })}
                                </View>

                                </ScrollView>
                                <FixedActionContainer>
                                <ActionButton
                                    fullWidth
                                    backgroundColor={YELLOW}
                                    onPress={openCancelAutoDebitPopUp}
                                    style={styles.button}
                                    componentCenter={
                                        <Typo text="Cancel Auto Debit" fontWeight="600" fontSize={14} color={BLACK} />
                                    }
                                />
                            </FixedActionContainer>

                            {
                                showS2UModal && (
                                    <Secure2uAuthenticationModal
                                        token=""
                                        s2uFlow=""
                                        onS2UDone={onS2UDone}
                                        onS2UClose={onS2UClose}
                                        s2uPollingData={s2uMapperData}
                                        transactionDetails={s2uMapperData}
                                        secure2uValidateData={s2uMapperData}
                                        s2uEnablement={true}
                                        nonTxnData={{
                                            isNonTxn: true
                                        }}
                                        navigation={navigation}
                                        // extraParams={{
                                        //     metadata: {
                                        //         txnType: "PAY_BILL"
                                        //     }
                                        // }}
                                    />
                                )
                            }

                            {
                                showTACModal && (
                                    <TacModal
                                        tacParams={tacParams}
                                        validateByOwnAPI={true}
                                        validateTAC={onTACDone}
                                        onTacClose={onTacModalCloseButtonPressed}
                                        isS2UDown={isS2UDown}
                                    />
                                )
                            }
                            </ScreenLayout>
                            
                        </>
                    )
                }
            </>
            
        </ScreenContainer>
        
        {
            showCancelAutoDebitInfo && (
                <Popup
                    visible={showCancelAutoDebitInfo}
                    onClose={() => setShowCancelAutoDebitInfo(false)}
                    title="Cancel Auto Debit"
                    description={`${ZAKAT_CANCEL_AUTODEBIT_DESCR} ${zakatDebitDataDetails?.zakatBody} will end.`}
                    primaryAction={{
                        text: "Confirm",
                        onPress: cancelAutoDebit
                    }}
                />
            )
        }
        </>
    );
}

ZakatAutoDebitSettings.propTypes = {
    route: PropTypes.object,
    navigation: PropTypes.object,
    getModel: PropTypes.func,
    updateModel: PropTypes.func,
};

export default withModelContext(ZakatAutoDebitSettings);
