import PropTypes from "prop-types";
import React, { useRef, useEffect, useState } from "react";
import { View, StyleSheet, ScrollView } from "react-native";

import {
    SETTINGS_MODULE,
    ZAKAT_FAIL,
    ZAKAT_SERVICES_STACK,
} from "@navigation/navigationConstant";

import ActionButton from "@components/Buttons/ActionButton";
import HeaderBackButton from "@components/Buttons/HeaderBackButton";
import ScreenContainer from "@components/Containers/ScreenContainer";
import FixedActionContainer from "@components/Footers/FixedActionContainer";
import HeaderLabel from "@components/Label/HeaderLabel";
import HeaderLayout from "@components/Layouts/HeaderLayout";
import ScreenLayout from "@components/Layouts/ScreenLayout";
import Typo from "@components/Text";
import { showErrorToast } from "@components/Toast";
import TacModal from "@components/Modals/TacModal";
import { checkzakatDownTimeAPI, updatePhoneNumberAPI } from "@services";

import { BLACK, DISABLED, DISABLED_TEXT, RED, YELLOW } from "@constants/colors";
import {
    SUCC_STATUS,
    COMMON_ERROR_MSG,
    AUTHORISATION_WAS_REJECTED
} from "@constants/strings";
import TextInput from "@components/TextInput";
import NumericalKeyboard from "@components/NumericalKeyboard";
import { isMalaysianMobileNum } from "@utils/dataModel";
import { TouchableOpacity } from "react-native-gesture-handler";
import { init, initChallenge } from "@utils/dataModel/s2uSDKUtil";
import { M2U } from "@constants/data";
import { navigateToS2UCooling, navigateToS2UReg } from "@screens/OneTapAuth/CoolingNavigator";
import Secure2uAuthenticationModal from "@components/Modals/Secure2uAuthenticationModal";
import moment from "moment";
import { FN_ZAKAT_MOBILE } from "@constants/fundConstants";
import { useModelController } from "@context";
import { maskedMobileNumber } from "@utils";
import { removeWhiteSpaces } from "@utils/dataModel/utilityPartial.3";
import { checkIfNumberWithPrefix, formatNumber, APIContactToDisplayCntry } from "@utils/dataModel/utilityZakat";

const ZakatUpdateMobile = ({ navigation, route }) => {
    const { getModel } = useModelController();
    const [buttonEnabled, setButtonEnabled] = useState(false);
    const [showNumPad, setShowNumPad] = useState(false);

    const [error, setError] = useState(false);
    const [phoneNo, setPhoneNo] = useState(checkIfNumberWithPrefix(route?.params?.zakatDetails?.mobileNo ?? getModel("user").mobileNumber));
    const [formattedPhoneNo, setformattedPhoneNo] = useState(maskedMobileNumber(formatNumber(checkIfNumberWithPrefix(route?.params?.zakatDetails?.mobileNo ?? getModel("user").mobileNumber))));

    const [showS2UModal, setShowS2UModal] = useState(false);
    const [s2uMapperData, sets2uMapperData] = useState();
    const [s2uInitRespRefId, setS2uInitRespRefId] = useState("");

    const [showTACModal, setShowTACModal] = useState(false);
    const [isS2UDown, setIsS2UDown] = useState(false);

    function handleKeyboardChange(value) {
        if (error) setError(false);

        setPhoneNo(value);
        setformattedPhoneNo(formatNumber(value));
    }
    const scrollView = useRef();

    const timeFormat = "DD MMMM YYYY, hh:mm A";

    useEffect(() => {
        if (!error && route?.params?.zakatDetails?.mobileNo !== removeWhiteSpaces(phoneNo)) setButtonEnabled(true);
        if (!error && route?.params?.zakatDetails?.mobileNo === removeWhiteSpaces(phoneNo)) setButtonEnabled(false); 
        if (error) setButtonEnabled(false);
    }, [phoneNo]);

    useEffect(() => {
        setformattedPhoneNo(formatNumber(checkIfNumberWithPrefix(formattedPhoneNo)));
    }, [route?.params]);

    function onPressBack() {
        navigation.goBack();
    }

    const s2uSDKInit = async () => {
        //customer zakat mobile number update
        const zakatData = {
            mobileS2U: APIContactToDisplayCntry(removeWhiteSpaces(formattedPhoneNo)),
            mobileNumber: removeWhiteSpaces(formattedPhoneNo),
            dateTime: moment(new Date()).format(timeFormat),
        };

        return await init(FN_ZAKAT_MOBILE, zakatData);
    };

    const initiateS2USdk = async () => {
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
                    if (s2uInitResponse?.s2uRegistrationDetails?.isUnderCoolDown) { navigateToS2UCooling(navigation.navigate); } else { await proceedWithS2U(); }
                } else { doS2uRegistration(); }
            } else {
                if (s2uInitResponse?.s2uRegistrationDetails?.app_id === M2U) { doS2uRegistration(); }
            }
        }
    };

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
                        transType: "MOBILE"
                    },
                },
            }
        });
    };

    const doS2uRegistration = () => {
        const params = {
            ...route?.params,
            phone: formattedPhoneNo
        };

        const redirect = {
            succStack: SETTINGS_MODULE,
            succScreen: "ZakatUpdateMobile"
        };

        navigateToS2UReg(navigation.navigate, params, redirect, getModel);
    };

    const onNavigateNext = async () => {
        await checkIfDowntime();
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

    function onContentSizeChange(_, height) {
        scrollView.current.scrollTo({ y: height });
    }

    async function handleKeyboardDone() {
        setShowNumPad(false);
        if (phoneNo.length >= 8 && phoneNo.length <= 10 && isMalaysianMobileNum(`60${phoneNo}`)) {
            console.log("phone num", phoneNo);
        } else {
            setError(true);
            setPhoneNo("");
            setformattedPhoneNo("");
        }
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
                                header: "Mobile number edit successful",
                                switchTo: formattedPhoneNo,
                                timeStamp: moment(new Date()).format(timeFormat),
                                menuUpdated: "MOBILE",
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
            mobileNumber: removeWhiteSpaces(formattedPhoneNo),
            fundTransferType: "MAE_ZAKAT_UPDATE",
        };
    })();

    async function onTACDone(tac) {
        const reqObject = {
            mobileNumber: removeWhiteSpaces(formattedPhoneNo),
            fundTransferType: "MAE_ZAKAT_UPDATE_VERIFY",
            tacNumber: tac,
        };
        try {
            setShowTACModal(false);
            const response = await updatePhoneNumberAPI(reqObject);
            const { status, message, data } = response.data;
            if (status.toUpperCase() === SUCC_STATUS.toUpperCase()) {
                navigation.navigate(SETTINGS_MODULE, {
                    screen: "ZakatUpdateSuccess",
                    params: {
                        flowParams: {
                            header: "Mobile number edit successful",
                            switchTo: formattedPhoneNo,
                            timeStamp: moment(new Date()).format(timeFormat),
                            menuUpdated: "MOBILE",
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
                analyticScreenName="Settings_ADZakat_EditMobile_ChangeMobile">
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
                        <View style={
                            styles.marginTopStyle
                        }>
                            <Typo
                                text="Mobile number"
                                fontWeight="600"
                                fontSize={14}
                                lineHeight={18}
                                textAlign="left"
                                style={styles.title}
                            />
                            <Typo
                                text="Receive notifications when your zakat is calculated and auto debited."
                                fontWeight="400"
                                fontSize={12}
                                lineHeight={16}
                                textAlign="left"
                                style={styles.title}
                            />
                            <TouchableOpacity
                                onPress={() => {
                                    setShowNumPad(true);
                                    setPhoneNo("");
                                    setformattedPhoneNo("");    
                                }}>

                                <TextInput
                                    importantForAutofill="no"
                                    maxLength={18}
                                    editable={false}
                                    value={formattedPhoneNo}
                                    prefix="+60"
                                    isValidate
                                    isValid={!error}
                                    onPress={() => {
                                        console.log("text input click");
                                    }}
                                    errorMessage="Please enter a valid mobile number in order to continue."
                                />

                            </TouchableOpacity>

                        </View>
                        {/* {showNumPad && <SpaceFiller height={SCREEN_HEIGHT / 3} />} */}
                        
                    </ScrollView>
                    <FixedActionContainer>
                        {
                            !showNumPad && (
                                <ActionButton
                                    fullWidth
                                    onPress={onNavigateNext}
                                    disabled={!buttonEnabled}
                                    backgroundColor={buttonEnabled ? YELLOW : DISABLED}
                                    componentCenter={
                                        <Typo
                                            text="Update"
                                            fontWeight="600"
                                            fontSize={14}
                                            color={buttonEnabled ? BLACK : DISABLED_TEXT}
                                        />
                                    }
                                />
                            )
                        }
                        
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
            {
                showNumPad && (
                    <NumericalKeyboard
                        value={phoneNo}
                        onChangeText={handleKeyboardChange}
                        maxLength={11}
                        onDone={handleKeyboardDone}
                    />
                )
            }
        </>
    );
};

ZakatUpdateMobile.propTypes = {
    navigation: PropTypes.object,
    route: PropTypes.object,
    getModel: PropTypes.func
};

const styles = StyleSheet.create({
    marginTopStyle: {
        marginTop: 28,
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

export default ZakatUpdateMobile;
