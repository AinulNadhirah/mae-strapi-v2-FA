import PropTypes from "prop-types";
import React, { useState } from "react";
import { View, StyleSheet } from "react-native";

import { navigateToS2UCooling, navigateToS2UReg } from "@screens/OneTapAuth/CoolingNavigator";

import { CHANGE_PHNO, SETTINGS_MODULE } from "@navigation/navigationConstant";

import HeaderLayout from "@layouts/HeaderLayout";
import ScreenLayout from "@layouts/ScreenLayout";

import HeaderCloseButton from "@components/Buttons/HeaderCloseButton";
import ScreenContainer from "@components/Containers/ScreenContainer";
import Secure2uAuthenticationModal from "@components/Modals/Secure2uAuthenticationModal";
import NumericalKeyboard from "@components/NumericalKeyboard";
import Typo from "@components/Text";
import TextInput from "@components/TextInput";
import { showErrorToast } from "@components/Toast";

import { useModelController } from "@context";

import { contactValidationPostLogin } from "@services";

import { MAE_MOBILE_UPDATE } from "@constants/api";
import { MEDIUM_GREY, FADE_GREY } from "@constants/colors";
import { M2U, S2U_PUSH, SMS_TAC } from "@constants/data";
import { FN_CHANGE_PHNO } from "@constants/fundConstants";
import {
    FA_SETTINGS_PROFILE_MOBILENUMBER,
    MOBILE_NUMBER_CHANGED_SUCCESS,
    MOBILE_NUMBER_CHANGED_UNSUCCESS,
    SUCCESSFUL,
} from "@constants/strings";

import { validateBlacklistContacts } from "@utils";
import { isMalaysianMobileNum } from "@utils/dataModel";
import {
    handleS2UAcknowledgementScreen,
    init,
    initChallenge,
    s2uSdkLogs,
    showS2UDownToast,
} from "@utils/dataModel/s2uSDKUtil";

function formatNumber(number) {
    return number.toString().replace(/(\d{2})(\d{1,4})?(\d{1,4})?/, (_, p1, p2, p3) => {
        let output = "";
        if (p1) output = `${p1}`;
        if (p2) output += ` ${p2}`;
        if (p3) output += ` ${p3}`;
        return output;
    });
}

function ChangePhoneNumber(props) {
    const { navigation, route } = props;
    const [error, setError] = useState(false);
    const [phoneNo, setPhoneNo] = useState("");
    const [formattedPhoneNo, setformattedPhoneNo] = useState("");
    const { getModel } = useModelController();
    const { isContactBlacklistingValidation } = getModel("misc");
    //S2U V4
    const [showS2UModal, setShowS2UModal] = useState(false);
    const [mapperData, setMapperData] = useState({});
    const nonTxnData = { isNonTxn: true };

    const onServiceCompleteNav = route?.params?.onServiceCompleteNav ?? {};

    function handleClose() {
        navigation.canGoBack() && navigation.goBack();
    }

    function handleKeyboardChange(value) {
        if (error) setError(false);

        setPhoneNo(value);
        setformattedPhoneNo(formatNumber(value));
    }

    async function handleProceedOtp() {
        const phoneNum = `60${phoneNo}`;
        navigation.navigate("ConfirmPhoneNumber", {
            ...route?.params,
            serviceParams: {
                phoneNo: phoneNum,
            },
            phone: phoneNum,
            type: MAE_MOBILE_UPDATE,
        });
    }

    //S2U V4
    const s2uSDKInit = async () => {
        const params = {
            phoneNo: `60${phoneNo}`,
        };
        return await init(FN_CHANGE_PHNO, params);
    };

    //S2U V4
    const initiateS2USdk = async () => {
        try {
            const s2uInitResponse = await s2uSDKInit();
            if (s2uInitResponse?.message || s2uInitResponse.statusCode !== 0) {
                showErrorToast({
                    message: s2uInitResponse.message,
                });
            } else {
                if (s2uInitResponse?.actionFlow === SMS_TAC) {
                    //............ ConfirmScreen
                    showS2UDownToast();
                    handleProceedOtp();
                } else if (s2uInitResponse?.actionFlow === S2U_PUSH) {
                    if (s2uInitResponse?.s2uRegistrationDetails?.app_id === M2U) {
                        doS2uRegistration(navigation.navigate);
                    }
                } else {
                    initS2UPull(s2uInitResponse);
                }
            }
        } catch (error) {
            console.log(error, "change phone number initiateS2USdk");
            s2uSdkLogs(error, "Change Phone Number");
        }
    };

    //S2U V4
    const initS2UPull = async (s2uInitResponse) => {
        const {
            navigation: { navigate },
        } = props;
        if (s2uInitResponse?.s2uRegistrationDetails?.isActive) {
            if (s2uInitResponse?.s2uRegistrationDetails?.isUnderCoolDown) {
                //S2U under cool down period
                navigateToS2UCooling(navigate);
            } else {
                const challengeRes = await initChallenge();
                if (challengeRes?.message) {
                    showErrorToast({ message: challengeRes?.message });
                } else {
                    setMapperData(challengeRes?.mapperData);
                    setShowS2UModal(true);
                }
            }
        } else {
            //Redirect user to S2U registration flow
            doS2uRegistration(navigate);
        }
    };

    const doS2uRegistration = (navigate) => {
        const redirect = {
            succStack: SETTINGS_MODULE,
            succScreen: CHANGE_PHNO,
        };
        navigateToS2UReg(navigate, props?.route?.params, redirect, getModel);
    };

    //S2U V4
    const onS2uClose = () => {
        setShowS2UModal(false);
    };

    //S2U V4
    const onS2uDone = (response) => {
        // Close S2u popup
        onS2uClose();
        navigateToAcknowledgementScreen(response);
    };
    //S2U V4
    const navigateToAcknowledgementScreen = (response) => {
        const { transactionStatus, executePayload } = response;
        if (onServiceCompleteNav?.stack) {
            const titleMessage =
                executePayload.message === SUCCESSFUL
                    ? MOBILE_NUMBER_CHANGED_SUCCESS
                    : MOBILE_NUMBER_CHANGED_UNSUCCESS;
            const entryPoint = {
                entryStack: onServiceCompleteNav?.stack,
                entryScreen: onServiceCompleteNav?.screen,
            };
            let ackDetails = {
                executePayload,
                transactionSuccess: transactionStatus,
                entryPoint,
                navigate: navigation.navigate,
            };
            if (executePayload?.executed) {
                if (transactionStatus) {
                    ackDetails.entryPoint.params = {
                        serviceResult: "success",
                        serviceParams: {
                            phoneNo: `60${phoneNo}`,
                            showToast: false,
                        },
                    };
                }

                ackDetails = {
                    ...ackDetails,
                    titleMessage,
                };
            }
            handleS2UAcknowledgementScreen(ackDetails);
        }
    };
    async function handleKeyboardDone() {
        if (phoneNo.length >= 8 && phoneNo.length <= 10 && isMalaysianMobileNum(`60${phoneNo}`)) {
            const { status, message } = await validateBlacklistContacts(
                isContactBlacklistingValidation,
                phoneNo,
                contactValidationPostLogin
            );
            status
                ? initiateS2USdk() // Intiate S2USDK
                : showErrorToast({
                      message,
                  });
        } else {
            setError(true);
            setPhoneNo("");
            setformattedPhoneNo("");
        }
    }

    return (
        <ScreenContainer
            backgroundType="color"
            backgroundColor={MEDIUM_GREY}
            analyticScreenName={FA_SETTINGS_PROFILE_MOBILENUMBER}
        >
            <>
                <ScreenLayout
                    paddingBottom={0}
                    paddingTop={42}
                    paddingHorizontal={0}
                    header={
                        <HeaderLayout
                            headerRightElement={<HeaderCloseButton onPress={handleClose} />}
                        />
                    }
                    useSafeArea
                    neverForceInset={["bottom"]}
                >
                    <View style={styles.container}>
                        <View style={styles.meta}>
                            <Typo
                                fontSize={20}
                                fontWeight="300"
                                lineHeight={28}
                                style={styles.label}
                                text="What's your mobile number?"
                                textAlign="left"
                            />
                            <Typo
                                fontSize={12}
                                fontWeight="normal"
                                lineHeight={18}
                                style={styles.info}
                                color={FADE_GREY}
                                text="Take note that this number will not replace your current mobile number used for Maybank2u transactions."
                                textAlign="left"
                            />
                            <TextInput
                                importantForAutofill="no"
                                maxLength={18}
                                editable={false}
                                value={formattedPhoneNo}
                                prefix="+60"
                                isValidate
                                isValid={!error}
                                errorMessage="Please enter a valid mobile number in order to continue."
                            />
                        </View>
                        <NumericalKeyboard
                            value={phoneNo}
                            onChangeText={handleKeyboardChange}
                            maxLength={11}
                            onDone={handleKeyboardDone}
                        />
                    </View>
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
                            navigation={props.navigation}
                            extraParams={{
                                metadata: {
                                    txnType: CHANGE_PHNO,
                                },
                            }}
                        />
                    )}
                </ScreenLayout>
            </>
        </ScreenContainer>
    );
}

ChangePhoneNumber.propTypes = {
    route: PropTypes.object,
    navigation: PropTypes.object,
    getModel: PropTypes.func,
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: "space-between",
    },
    info: {
        paddingBottom: 8,
    },
    label: {
        paddingVertical: 8,
    },
    meta: {
        paddingHorizontal: 36,
    },
});

export default ChangePhoneNumber;
