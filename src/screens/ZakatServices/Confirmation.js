/* eslint-disable react/jsx-no-bind */
import PropTypes from "prop-types";
import React, { useState } from "react";
import { View, StyleSheet, ScrollView } from "react-native";

import HeaderLayout from "@layouts/HeaderLayout";
import ScreenLayout from "@layouts/ScreenLayout";

import ActionButton from "@components/Buttons/ActionButton";
import HeaderBackButton from "@components/Buttons/HeaderBackButton";
import HeaderCloseButton from "@components/Buttons/HeaderCloseButton";
import ScreenContainer from "@components/Containers/ScreenContainer";
import FixedActionContainer from "@components/Footers/FixedActionContainer";
import { InfoDetails } from "@components/FormComponents/InfoDetails";
import Typo from "@components/Text";
import { showErrorToast } from "@components/Toast";

import { MEDIUM_GREY, YELLOW, BLACK } from "@constants/colors";
import {
    CONFIRMATION,
    ZAKAT_REGISTRATION,
    AUTHORISATION_WAS_REJECTED,
    SUCC_STATUS
} from "@constants/strings";
import {
    registerForZakatDebit
} from "@services";
import SpaceFiller from "@components/Placeholders/SpaceFiller";
import TacModal from "@components/Modals/TacModal";
import { useModelController } from "@context";
import { PREMIER_CONFIRMATION_TITLE } from "@constants/premierStrings";
import { ZAKAT_ACKNOWLEDGE, ZAKAT_DEBIT_ACCT_SELECT, ZAKAT_FAIL, ZAKAT_SERVICES_STACK } from "@navigation/navigationConstant";
import Secure2uAuthenticationModal from "@components/Modals/Secure2uAuthenticationModal";
import moment from "moment";
import { init, initChallenge } from "@utils/dataModel/s2uSDKUtil";
import { M2U } from "@constants/data";
import { navigateToS2UCooling, navigateToS2UReg } from "@screens/OneTapAuth/CoolingNavigator";
import { FN_ZAKAT_REGISTER } from "@constants/fundConstants";
import { formateAccountNumber, removeWhiteSpaces } from "@utils/dataModel/utilityPartial.3";
import { maskedMobileNumber } from "@utils";
import { checkIfNumberWithPrefix, APIContactToDisplayCntry } from "@utils/dataModel/utilityZakat";

const { getModel } = useModelController();

const { mobileNumber } = getModel("user");

function Confirmation({ navigation, route }) {
    const personalInfo = [
        {
            displayKey: "Pay from",
            displayValue: route?.params?.payFromAcctName.concat("\n" + formateAccountNumber(route?.params?.payFromAcctNo?.toString(0, 12), 12))
        },
        {
            displayKey: "Zakat type",
            displayValue: route?.params?.zakatType ?? "-"
        },
        {
            displayKey: "Zakat body",
            displayValue: route?.params?.zakatBody
        },
        {
            displayKey: "Mobile number",
            displayValue: removeWhiteSpaces(route?.params?.mobileNumber) === removeWhiteSpaces(checkIfNumberWithPrefix(mobileNumber)) 
            ? maskedMobileNumber(APIContactToDisplayCntry(route?.params?.mobileNumber)) 
            : APIContactToDisplayCntry(route?.params?.mobileNumber)
        }
    ];

    const [s2uInitRespRefId, setS2uInitRespRefId] = useState("");

    const accountNameNum = route?.params?.payFromAcctName.concat("\n" + formateAccountNumber(route?.params?.payFromAcctNo?.toString(0, 12), 12));

    function handleBack() {
        navigation.canGoBack() && navigation.goBack();
    }

    function handleClose() {
        navigation.navigate("TabNavigator", {
            screen: "Tab",
            params: {
                screen: "MAE_ACC_DASHBOARD"
            },
        });
    }
    const [showTACModal, setShowTACModal] = useState(false);
    const [isS2UDown, setIsS2UDown] = useState(false);

    const [showS2UModal, setShowS2UModal] = useState(false);
    const [s2uMapperData, sets2uMapperData] = useState();

    async function handleProceedButton() {
        await initiateS2USdk();
    }

    const initiateS2USdk = async () => {
        const s2uInitResponse = await s2uSDKInit();
        setS2uInitRespRefId(s2uInitResponse?.transactionToken);
        if (s2uInitResponse?.message || s2uInitResponse?.statusCode !== 0) {
            showErrorToast({ message: s2uInitResponse?.message });
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
            phone: route?.params?.mobileNumber,
        };

        const redirect = {
            succStack: ZAKAT_SERVICES_STACK,
            succScreen: "Confirmation"
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
                        stack: "Dashboard",
                        screen: "MAE_ACC_DASHBOARD",
                    },
                    fail: {
                        stack: "Dashboard",
                        screen: "MAE_ACC_DASHBOARD",
                    },
                    params: {
                        message,
                        referenceId,
                        timeStamp,
                        rsaStatus
                    },
                },
            }
        });
    };

    const s2uSDKInit = async () => {
        //customer auto debit registration
        const zakatData = {
            payFrom: accountNameNum,
            account: route?.params?.payFromAcctNo,
            zakatType: route?.params?.zakatType,
            zakatTypeId: route?.params?.zakatTypeId,
            zakatBody: route?.params?.zakatBody,
            zakatBodyId: route?.params?.zakatBodyId,
            mobileS2U: removeWhiteSpaces(route?.params?.mobileNumber) === removeWhiteSpaces(checkIfNumberWithPrefix(mobileNumber)) 
            ? maskedMobileNumber(APIContactToDisplayCntry(route?.params?.mobileNumber)) 
            : APIContactToDisplayCntry(route?.params?.mobileNumber),
            mobileNumber: route?.params?.mobileNumber,
            code: ZAKAT_REGISTRATION,
            consent: route?.params?.consent,
            dateTime: moment(new Date()).format("DD MMMM YYYY, hh:mm A"),
        };

        return await init(FN_ZAKAT_REGISTER, zakatData);
    };

    function editButton(value) {
        navigation.navigate(ZAKAT_SERVICES_STACK, {
            screen: ZAKAT_DEBIT_ACCT_SELECT,
            params: {}
        });
    }

    function onS2UDone(response) {
        const { transactionStatus, executePayload } = response;
        onS2UClose();

        if (transactionStatus) {
            if (executePayload?.executed) {
                if (executePayload?.body?.status.toUpperCase() === SUCC_STATUS.toUpperCase()) {
                    navigation.navigate(ZAKAT_SERVICES_STACK, {
                        screen: ZAKAT_ACKNOWLEDGE,
                        params: {
                            ...route?.params,
                            transactionID: executePayload?.body?.data
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

    const tacParams = (() => {
        return {
            account: route?.params?.payFromAcctNo,
            zakatType: route?.params?.zakatType,
            zakatTypeId: route?.params?.zakatTypeId,
            zakatBody: route?.params?.zakatBody,
            zakatBodyId: route?.params?.zakatBodyId,
            mobileNumber: route?.params?.mobileNumber,
            mobileNo: route?.params?.mobileNumber,
            consent: route?.params?.consent,
            fundTransferType: "MAE_ZAKAT_REGISTRATION",
            code: ZAKAT_REGISTRATION
        };
    })();

    async function onTACDone(tac) {
        const reqObject = {
            account: route?.params?.payFromAcctNo,
            zakatType: route?.params?.zakatType,
            zakatTypeId: route?.params?.zakatTypeId,
            zakatBody: route?.params?.zakatBody,
            zakatBodyId: route?.params?.zakatBodyId,
            mobileNumber: route?.params?.mobileNumber,
            consent: route?.params?.consent,
            fundTransferType: "MAE_ZAKAT_REGISTRATION_VERIFY",
            code: ZAKAT_REGISTRATION,
            tacNumber: tac,
        };
        try {
            setShowTACModal(false);
            const response = await registerForZakatDebit(reqObject);
            const { status, message, data } = response.data;
            if (status.toUpperCase() === SUCC_STATUS.toUpperCase()) {
                navigation.navigate(ZAKAT_SERVICES_STACK, {
                    screen: ZAKAT_ACKNOWLEDGE,
                    params: {
                        ...route?.params,
                        transactionID: data
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
        <ScreenContainer
            backgroundType="color"
            backgroundColor={MEDIUM_GREY}
            analyticScreenName="Apply_AutoDebitZakat_Confirmation"
        >
            <>
                <ScreenLayout
                    paddingHorizontal={0}
                    paddingBottom={0}
                    paddingTop={0}
                    header={
                        <HeaderLayout
                            headerRightElement={<HeaderCloseButton onPress={handleClose} />}
                            headerCenterElement={
                                <Typo
                                    text={CONFIRMATION}
                                    fontWeight="600"
                                    fontSize={16}
                                    lineHeight={19}
                                />
                            }
                            headerLeftElement={<HeaderBackButton onPress={handleBack} />}
                        />
                    }
                    useSafeArea
                >
                    <React.Fragment>
                        <ScrollView
                            style={styles.scrollViewCls}
                            showsVerticalScrollIndicator={false}
                        >
                            <View style={styles.contentContainer}>
                                <Typo
                                    fontSize={14}
                                    fontWeight="400"
                                    lineHeight={21}
                                    textAlign="left"
                                    text={PREMIER_CONFIRMATION_TITLE}
                                />
                            </View>
                            <SpaceFiller height={24} />

                            <View style={styles.formContainer}>
                                <InfoDetails
                                    title="Personal Details"
                                    info={personalInfo}
                                    hidden={false}
                                    handlePress={editButton}
                                    buttonValue="personalInfo"
                                />
                            </View>
                        </ScrollView>
                        {/* Bottom docked button container */}
                        <FixedActionContainer>
                            <View style={styles.bottomBtnContCls}>
                                <ActionButton
                                    activeOpacity={0.5}
                                    backgroundColor={YELLOW}
                                    fullWidth
                                    componentCenter={
                                        <Typo
                                            text="Submit"
                                            fontSize={14}
                                            fontWeight="600"
                                            lineHeight={18}
                                            color={BLACK}
                                        />
                                    }
                                    onPress={handleProceedButton}
                                />
                            </View>
                        </FixedActionContainer>
                    </React.Fragment>

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
        </ScreenContainer>
    );
}

Confirmation.propTypes = {
    route: PropTypes.object,
    navigation: PropTypes.object,
};

const styles = StyleSheet.create({
    bottomBtnContCls: {
        flexDirection: "row",
        justifyContent: "space-around",
        width: "100%",
    },
    formContainer: {
        marginBottom: 40,
    },
    contentContainer: {
        marginHorizontal: 24,
    },
    scrollViewCls: {
        paddingHorizontal: 0,
    },
});

export default Confirmation;
