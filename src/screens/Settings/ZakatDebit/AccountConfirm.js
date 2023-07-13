import PropTypes from "prop-types";
import React, { useRef, useState } from "react";
import { View, StyleSheet, ScrollView } from "react-native";

import ActionButton from "@components/Buttons/ActionButton";
import HeaderBackButton from "@components/Buttons/HeaderBackButton";
import ScreenContainer from "@components/Containers/ScreenContainer";
import FixedActionContainer from "@components/Footers/FixedActionContainer";
import HeaderLabel from "@components/Label/HeaderLabel";
import HeaderLayout from "@components/Layouts/HeaderLayout";
import ScreenLayout from "@components/Layouts/ScreenLayout";
import Typo from "@components/Text";
import TacModal from "@components/Modals/TacModal";
import { BLACK, RED, YELLOW } from "@constants/colors";
import {
    SUCC_STATUS,
    COMMON_ERROR_MSG,
    AUTHORISATION_WAS_REJECTED
} from "@constants/strings";
import { checkzakatDownTimeAPI, updateZakatAccountAPI } from "@services";
import moment from "moment";
import { init, initChallenge } from "@utils/dataModel/s2uSDKUtil";
import { showErrorToast } from "@components/Toast";
import { navigateToS2UCooling, navigateToS2UReg } from "@screens/OneTapAuth/CoolingNavigator";
import { SETTINGS_MODULE, ZAKAT_FAIL, ZAKAT_SERVICES_STACK } from "@navigation/navigationConstant";
import { M2U } from "@constants/data";
import Secure2uAuthenticationModal from "@components/Modals/Secure2uAuthenticationModal";
import { FN_ZAKAT_ACCOUNT } from "@constants/fundConstants";
import { useModelController } from "@context";
import { formateAccountNumber, maskAccountNumber } from "@utils/dataModel/utilityPartial.3";
import SpaceFiller from "@components/Placeholders/SpaceFiller";

const AccountConfirm = ({ navigation, route }) => {
    const accountSelected = route?.params?.account ?? "";

    const { getModel } = useModelController();

    const scrollView = useRef();

    const [s2uInitRespRefId, setS2uInitRespRefId] = useState("");
    const [showTACModal, setShowTACModal] = useState(false);
    const [isS2UDown, setIsS2UDown] = useState(false);

    const [showS2UModal, setShowS2UModal] = useState(false);
    const [s2uMapperData, sets2uMapperData] = useState();

    const timeContant = "DD MMMM YYYY, hh:mm A";

    function onPressBack() {
        navigation.goBack();
    }

    async function onNavigateNext () {
        await checkIfDowntime();
    }

    const s2uSDKInit = async () => {
        const zakatData = {
            payFrom: accountSelected?.name.concat("\n" + maskAccountNumber(accountSelected?.number)),
            account: accountSelected?.number.substring(0, 12),
            dateTime: moment(new Date()).format(timeContant),
        };
        return await init(FN_ZAKAT_ACCOUNT, zakatData);
    };

    async function checkIfDowntime() {
        try {
            const response = await checkzakatDownTimeAPI();
            const { status, message } = { ...response.data };
            if (status.toUpperCase() === SUCC_STATUS.toUpperCase()) {
                await initiateS2USdk();
            } else {
                showErrorToast({
                    message
                });
            }
        } catch (error) {
            showErrorToast({ message: error?.message ?? COMMON_ERROR_MSG });
        }
    }

    async function initiateS2USdk() {
        const s2uInitResponse = await s2uSDKInit();
        setS2uInitRespRefId(s2uInitResponse?.transactionToken);
        if (s2uInitResponse?.message || s2uInitResponse?.statusCode !== 0) {
            showErrorToast({ message: s2uInitResponse?.message }); initFailure(s2uInitResponse);
        } else {
            if (s2uInitResponse?.actionFlow === "SMS_TAC") {
                const { isS2uV4ToastFlag } = getModel("misc");
                setIsS2UDown(isS2uV4ToastFlag || false);
                setShowTACModal(true);
            } else if (s2uInitResponse?.actionFlow === "S2U_PULL") {
                if (s2uInitResponse?.s2uRegistrationDetails?.isActive) {
                    if (s2uInitResponse?.s2uRegistrationDetails?.isUnderCoolDown) {
                        navigateToS2UCooling(navigation.navigate);
                    } else { await proceedWithS2U(); }
                } else { doS2uRegistration(); }
            } else {
                if (s2uInitResponse?.s2uRegistrationDetails?.app_id === M2U) { doS2uRegistration(); }
            }
        }
    }

    async function proceedWithS2U() {
        const challengeRes = await initChallenge();
        if (challengeRes?.mapperData) {
            sets2uMapperData(challengeRes?.mapperData); setShowS2UModal(true);
        } else { initFailure(challengeRes); }
    }

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
                        stack: "Dashboard",
                        screen: "Settings",
                    },
                    fail: {
                        stack: "Dashboard",
                        screen: "Settings",
                    },
                    params: {
                        message,
                        referenceId,
                        timeStamp,
                        rsaStatus,
                        transType: "PAYFROM"
                    },
                },
            }
        });
    };

    const doS2uRegistration = () => {
        const params = {
            ...route?.params,
            phone: getModel("user")?.mobileNumber
        };

        const redirect = {
            succStack: SETTINGS_MODULE,
            succScreen: "AccountConfirm"
        };

        navigateToS2UReg(navigation.navigate, params, redirect, getModel);
    };

    function onContentSizeChange(_, height) {
        scrollView.current.scrollTo({ y: height });
    }

    function onS2UDone(response) {
        const { transactionStatus, executePayload } = response;
        onS2UClose();

        if (transactionStatus) {
            if (executePayload?.executed) {
                if (executePayload?.body?.status.toUpperCase() === SUCC_STATUS.toUpperCase()) {
                    navigation.navigate(SETTINGS_MODULE, {
                        screen: "ZakatUpdateSuccess",
                        params: {
                            flowParams: {
                                header: "Account switch successful",
                                switchTo: accountSelected?.name.concat("\n" + maskAccountNumber(accountSelected?.number)),
                                timeStamp: moment(new Date()).format(timeContant),
                                menuUpdated: "PAYFROM",
                                referenceId: executePayload?.body?.data
                            }
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

    function onS2UClose() {
        setShowS2UModal(false);
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

    const tacParams = (() => {
        return {
            account: accountSelected?.number.substring(0, 12),
            fundTransferType: "MAE_ZAKAT_UPDATE",
        };
    })();

    async function onTACDone(tac) {
        const reqObject = {
            account: accountSelected?.number.substring(0, 12),
            fundTransferType: "MAE_ZAKAT_UPDATE_VERIFY",
            tacNumber: tac,
        };
        try {
            setShowTACModal(false);
            const response = await updateZakatAccountAPI(reqObject);
            const { status, message, data } = response.data;
            if (status.toUpperCase() === SUCC_STATUS.toUpperCase()) {
                navigation.navigate(SETTINGS_MODULE, {
                    screen: "ZakatUpdateSuccess",
                    params: {
                        flowParams: {
                            header: "Account switch successful",
                            switchTo: accountSelected?.name.concat("\n" + maskAccountNumber(accountSelected?.number)),
                            timeStamp: moment(new Date()).format(timeContant),
                            menuUpdated: "PAYFROM",
                            referenceId: data
                        }
                    }
                });
            } else {
                showErrorToast({
                    message
                });
            }
        } catch (err) {
            showErrorToast({ message: err?.error?.message || err?.status || "Invalid TAC" });
        }
    }

    function onTacModalCloseButtonPressed() {
        setShowTACModal(false);
    }

    return (
        <>
            <ScreenContainer backgroundType="color" 
                analyticScreenName="Settings_AutoDebitZakat_SwitchAccount_Confirmation">
                <ScreenLayout
                    header={
                        <HeaderLayout
                            backgroundColor={YELLOW}
                            headerLeftElement={<HeaderBackButton onPress={onPressBack} />}
                            headerCenterElement={<HeaderLabel>Auto Debit for Zakat</HeaderLabel>}
                        />
                    }
                    useSafeArea
                    paddingTop={0}
                    paddingHorizontal={0}
                    paddingBottom={0}
                >
                    <ScrollView
                        ref={scrollView}
                        style={styles.container}
                        onContentSizeChange={onContentSizeChange}
                    >
                        <View style={styles.marginTopStyle}>
                            <Typo
                                text="Please confirm your debiting bank account details"
                                fontWeight="400"
                                fontSize={20}
                                lineHeight={28}
                                textAlign="left"
                            />
                            <SpaceFiller height={24}/>
                            <Typo
                                text={accountSelected?.name}
                                fontWeight="600"
                                fontSize={14}
                                lineHeight={28}
                                textAlign="left"
                            />
                            <Typo
                                text={formateAccountNumber(accountSelected?.number?.substring(0, 12), 12)}
                                fontWeight="400"
                                fontSize={14}
                                lineHeight={28}
                                textAlign="left"
                            />
                        </View>
                    </ScrollView>
                    <FixedActionContainer>
                        <ActionButton
                            fullWidth
                            onPress={onNavigateNext}
                            backgroundColor={YELLOW}
                            componentCenter={
                                <Typo
                                    text="Confirm"
                                    fontWeight="600"
                                    fontSize={14}
                                    color={BLACK}
                                />
                            }
                        />
                    </FixedActionContainer>
                </ScreenLayout>
            </ScreenContainer>
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
                        extraParams={{
                            metadata: {
                                txnType: "PAY_BILL"
                            }
                        }}
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
        </>
    );
};

AccountConfirm.propTypes = {
    navigation: PropTypes.object,
    route: PropTypes.object,
};

const styles = StyleSheet.create({
    marginTopStyle: {
        marginTop: 24,
    },
    amountInput: {
        paddingTop: 20,
    },
    chevronContainer: {
        marginRight: 24,
    },
    chevronDownImage: { height: 8, width: 16 },
    container: {
        flex: 1,
        paddingHorizontal: 24,
    },
    errorMessage: {
        color: RED,
        top: -10,
    },
    errorMessageEducation: {
        color: RED,
        paddingTop: 5,
    },
    selectionContainer: {
        marginHorizontal: 24,
        flexDirection: "column",
        alignItems: "flex-start"
    },
    subtitle: {
        paddingBottom: 10,
        paddingTop: 24,
    },
    title: {
        paddingTop: 16,
    },
    mobileNumSection: {
        alignItems: "center",
        flexDirection: "row",
        paddingVertical: 2,
    },
    infoIconStyle: {
        height: 16,
        marginLeft: 10,
        width: 16,
    }
});

export default AccountConfirm;
