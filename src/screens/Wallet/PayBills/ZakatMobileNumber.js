import PropTypes from "prop-types";
import React, { useState, useEffect } from "react";
import { View, Platform, StyleSheet } from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";

import { navigateToS2UCooling } from "@screens/OneTapAuth/CoolingNavigator";

import {
    PAYBILLS_MODULE,
    ONE_TAP_AUTH_MODULE,
    PAYBILLS_CONFIRMATION_SCREEN,
    PAYBILLS_LANDING_SCREEN,
    ACTIVATE,
    PAYBILLS_ENTER_AMOUNT,
    ZAKAT_DETAILS,
    ZAKAT_TYPE,
    SECURE2U_COOLING,
} from "@navigation/navigationConstant";

import HeaderLayout from "@layouts/HeaderLayout";
import ScreenLayout from "@layouts/ScreenLayout";

import ActionButton from "@components/Buttons/ActionButton";
import HeaderBackButton from "@components/Buttons/HeaderBackButton";
import ScreenContainer from "@components/Containers/ScreenContainer";
import FixedActionContainer from "@components/Footers/FixedActionContainer";
import Typography from "@components/Text";
import TextInput from "@components/TextInput";
import { showInfoToast } from "@components/Toast";
import TransferImageAndDetails from "@components/Transfers/TransferImageAndDetails";

import { useModelController } from "@context";

import { logEvent } from "@services/analytics";

import { YELLOW, MEDIUM_GREY, DISABLED, DISABLED_TEXT, BLACK } from "@constants/colors";
import {
    CONTINUE,
    VALID_MOBILE_NUMBER,
    MOBILE_NUM_MIN_ERR,
    MOBILE_NUM_NUMERIC_ERR,
    SECURE2U_IS_DOWN,
    ZAKAT,
    FA_VIEW_SCREEN,
    FA_SCREEN_NAME,
    FA_PAY_ZAKAT_MOBILE_NUMBER,
} from "@constants/strings";

import { maeOnlyNumberRegex, isMalaysianMobileNum } from "@utils/dataModel";
import { checks2UFlow } from "@utils/dataModel/utility";

function ZakatMobileNumber({ route, navigation }) {
    const { getModel } = useModelController();

    const [isContinueDisabled, setContinueDisabled] = useState(true);
    const [mobileNumber, setMobileNumber] = useState("");
    const [mobileNumberValid, setMobileNumberValid] = useState(true);
    const [mobileNumberErrorMsg, setMobileNumberErrorMsg] = useState("");

    const zakatMobNumTitle = route.params?.zakatMobNumTitle ?? "";
    const imageUrl = route.params?.imageUrl ?? "";

    useEffect(() => {
        const params = route?.params ?? {};
        const mobileNumber = params?.mobileNumber ?? null;

        if (mobileNumber) {
            if (mobileNumber.charAt(0) === "0") {
                setMobileNumber(formatMobileNumber(mobileNumber.substring(1, mobileNumber.length)));
            } else {
                setMobileNumber(formatMobileNumber(mobileNumber));
            }
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
        setContinueDisabled(mobileNumber.length < 1);
    }, [mobileNumber]);

    useEffect(() => {
        logEvent(FA_VIEW_SCREEN, {
            [FA_SCREEN_NAME]: FA_PAY_ZAKAT_MOBILE_NUMBER,
        });
    }, []);

    function onBackTap() {
        console.log("[ZakatMobileNumber] >> [onBackTap]");

        const zakatFitrahFlow = route.params?.zakatFitrahFlow ?? false;
        if (zakatFitrahFlow) {
            navigation.navigate(PAYBILLS_MODULE, {
                screen: ZAKAT_DETAILS,
            });
        } else {
            navigation.navigate(PAYBILLS_MODULE, {
                screen: ZAKAT_TYPE,
            });
        }
    }

    function onMobileNumberChange(value) {
        console.log("[ZakatMobileNumber] >> [onMobileNumberChange]");

        const formattedValued = formatMobileNumber(value);
        setMobileNumber(formattedValued);
    }

    const formatMobileNumber = (value) => {
        return value
            .toString()
            .replace(/[^0-9]/g, "")
            .replace(/(\d{2})(\d{1,4})?(\d{1,4})?/, (_, p1, p2, p3) => {
                let output = "";
                if (p1) output = `${p1}`;
                if (p2) output += ` ${p2}`;
                if (p3) output += ` ${p3}`;
                return output;
            });
    };

    const validateMobileNumber = () => {
        console.log("[ZakatMobileNumber] >> [validateMobileNumber]");

        const trimmedMobileNumber = mobileNumber.replace(/\s/g, "");

        // Min length check
        if (trimmedMobileNumber.length < 9) {
            setMobileNumberErrorMsg(MOBILE_NUM_MIN_ERR);
            setMobileNumberValid(false);
            return false;
        }

        // Valid mobile number check
        if (!isMalaysianMobileNum(`0${trimmedMobileNumber}`)) {
            setMobileNumberErrorMsg(VALID_MOBILE_NUMBER);
            setMobileNumberValid(false);
            return false;
        }

        // Only numberical check
        if (!maeOnlyNumberRegex(trimmedMobileNumber)) {
            setMobileNumberErrorMsg(MOBILE_NUM_NUMERIC_ERR);
            setMobileNumberValid(false);
            return false;
        }

        // Return true if no validation error
        setMobileNumberValid(true);
        setMobileNumberErrorMsg("");
        return true;
    };

    async function onContinue() {
        console.log("[ZakatMobileNumber] >> [onContinue]");

        const isValid = validateMobileNumber();
        if (!isValid) return;

        // Retrieve form data
        const formData = getFormData();

        if (formData?.zakatFitrahFlow) {
            // Navigate to Zakat Fitrah flow

            const { flow, secure2uValidateData } = await checks2UFlow(17, getModel);

            if (!secure2uValidateData.s2u_enabled) {
                showInfoToast({ message: SECURE2U_IS_DOWN });
            }

            const deviceInfo = getModel("device");
            let nextParam = {
                ...formData,
                secure2uValidateData: secure2uValidateData,
                // amount: val,
                deviceInfo: deviceInfo,
                flow: flow,
            };
            if (flow === SECURE2U_COOLING) {
                const { navigate } = navigation;
                navigateToS2UCooling(navigate);
            } else if (flow === "S2UReg") {
                navigation.navigate(ONE_TAP_AUTH_MODULE, {
                    screen: ACTIVATE,
                    params: {
                        flowParams: {
                            success: {
                                stack: PAYBILLS_MODULE,
                                screen: PAYBILLS_CONFIRMATION_SCREEN,
                            },
                            fail: {
                                stack: PAYBILLS_MODULE,
                                screen: PAYBILLS_LANDING_SCREEN,
                            },

                            params: { ...nextParam, isFromS2uReg: true },
                        },
                    },
                });
            } else {
                navigation.navigate(PAYBILLS_MODULE, {
                    screen: PAYBILLS_CONFIRMATION_SCREEN,
                    params: { ...nextParam },
                });
            }
        } else {
            // Navigate to Other Zakat Flow
            navigation.navigate(PAYBILLS_MODULE, {
                screen: PAYBILLS_ENTER_AMOUNT,
                params: { ...formData },
            });
        }
    }

    const getFormData = () => {
        console.log("[ZakatMobileNumber] >> [getFormData]");

        const trimmedMobileNumber = mobileNumber.replace(/\s/g, "");
        const fullMobileNumber = `0${trimmedMobileNumber}`;
        const formattedMobileNumber = confirmationMobileNumberFormat(fullMobileNumber);

        return {
            ...route.params,
            mobileNumber: fullMobileNumber,
            formattedMobileNumber,
            requiredFields: [
                {
                    fieldName: "bilAcct",
                    fieldValue: fullMobileNumber,
                },
                {
                    fieldName: "billRef",
                    fieldValue: route.params?.zakatTypeValue,
                },
            ],
        };
    };

    const confirmationMobileNumberFormat = (value) => {
        return value
            .toString()
            .replace(/[^0-9]/g, "")
            .replace(/(\d{3})(\d{1,4})?(\d{1,4})?/, (_, p1, p2, p3) => {
                let output = "";
                if (p1) output = `${p1}`;
                if (p2) output += ` ${p2}`;
                if (p3) output += ` ${p3}`;
                return output;
            });
    };

    return (
        <ScreenContainer backgroundType="color" backgroundColor={MEDIUM_GREY}>
            <ScreenLayout
                header={
                    <HeaderLayout
                        headerLeftElement={<HeaderBackButton onPress={onBackTap} />}
                        headerCenterElement={
                            <Typography
                                fontSize={16}
                                fontWeight="600"
                                lineHeight={19}
                                text={ZAKAT}
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
                    <KeyboardAwareScrollView
                        style={Style.containerView}
                        behavior={Platform.OS == "ios" ? "padding" : ""}
                        enabled
                        showsVerticalScrollIndicator={false}
                    >
                        {/* Logo & Title */}
                        <View style={{ marginTop: 45 }}>
                            <TransferImageAndDetails
                                title={zakatMobNumTitle}
                                image={{
                                    type: "url",
                                    source: imageUrl,
                                }}
                            ></TransferImageAndDetails>
                        </View>

                        {/* Mobile Number */}
                        <View style={Style.mobNumViewCls}>
                            <Typography
                                fontSize={14}
                                lineHeight={19}
                                textAlign="left"
                                text="Enter mobile number"
                            />
                            <TextInput
                                autoFocus
                                prefix="+60"
                                minLength={9}
                                maxLength={12}
                                isValidate
                                isValid={mobileNumberValid}
                                errorMessage={mobileNumberErrorMsg}
                                value={mobileNumber}
                                placeholder=""
                                keyboardType="numeric"
                                onChangeText={onMobileNumberChange}
                                blurOnSubmit
                                returnKeyType="done"
                            />
                        </View>
                    </KeyboardAwareScrollView>

                    {/* Bottom docked button container */}
                    <FixedActionContainer>
                        <View style={Style.bottomBtnContCls}>
                            <ActionButton
                                disabled={isContinueDisabled}
                                activeOpacity={isContinueDisabled ? 1 : 0.5}
                                backgroundColor={isContinueDisabled ? DISABLED : YELLOW}
                                fullWidth
                                componentCenter={
                                    <Typography
                                        color={isContinueDisabled ? DISABLED_TEXT : BLACK}
                                        fontSize={14}
                                        fontWeight="600"
                                        lineHeight={18}
                                        text={CONTINUE}
                                    />
                                }
                                onPress={onContinue}
                            />
                        </View>
                    </FixedActionContainer>
                </React.Fragment>
            </ScreenLayout>
        </ScreenContainer>
    );
}

ZakatMobileNumber.propTypes = {
    navigation: PropTypes.shape({
        navigate: PropTypes.func,
    }),
    route: PropTypes.shape({
        params: PropTypes.shape({
            imageUrl: PropTypes.string,
            riceTypeObj: PropTypes.shape({
                zakatType: PropTypes.any,
            }),
            zakatFitrahFlow: PropTypes.bool,
            zakatMobNumTitle: PropTypes.string,
            zakatTypeValue: PropTypes.any,
        }),
    }),
};

const Style = StyleSheet.create({
    bottomBtnContCls: {
        flexDirection: "row",
        justifyContent: "space-around",
        width: "100%",
    },

    containerView: {
        flex: 1,
        paddingHorizontal: 24,
        width: "100%",
    },

    mobNumViewCls: {
        marginTop: 25,
    },
});

export default ZakatMobileNumber;
