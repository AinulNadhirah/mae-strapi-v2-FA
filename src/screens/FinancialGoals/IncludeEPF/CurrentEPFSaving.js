import numeral from "numeral";
import PropTypes from "prop-types";
import React, { useState, useEffect } from "react";
import { View, TouchableOpacity } from "react-native";
import Modal from "react-native-modal";

import {
    BANKINGV2_MODULE,
    CURRENT_EPF_MONTHLY_CONTRIBUTE,
    GOAL_SIMULATION,
    FINANCIAL_GOAL_OVERVIEW,
} from "@navigation/navigationConstant";

import HeaderLayout from "@layouts/HeaderLayout";
import ScreenLayout from "@layouts/ScreenLayout";

import HeaderBackButton from "@components/Buttons/HeaderBackButton";
import HeaderCloseButton from "@components/Buttons/HeaderCloseButton";
import ScreenContainer from "@components/Containers/ScreenContainer";
import NumericalKeyboard from "@components/NumericalKeyboard";
import Popup from "@components/Popup";
import Browser from "@components/Specials/Browser";
import Typo from "@components/Text";
import TextInput from "@components/TextInput";

import { logEvent } from "@services/analytics";

import { MEDIUM_GREY, GREY, BLACK } from "@constants/colors";
import {
    CURRENCY_CODE,
    INCLUDE_EPF_SAVING,
    FA_VIEW_SCREEN,
    FA_SCREEN_NAME,
    PROCEED,
} from "@constants/strings";
import { FINANCIAL_EPF_I_AKAUN } from "@constants/url";

import { numberWithCommas } from "@utils/dataModel/utilityPartial.3";

function CurrentEPFSaving({ navigation, route }) {
    const [keypadAmount, setKeypadAmount] = useState(
        route?.params?.epfAccountBal ? parseInt(route?.params?.epfAccountBal * 100) : ""
    );
    const [rawAmount, setRawAmount] = useState(route?.params?.epfAccountBal ?? 0);
    const [formattedAmount, setFormattedAmount] = useState(
        numberWithCommas(route?.params?.epfAccountBal?.toFixed(2) ?? "")
    );

    const [showBrowser, setShowBrowser] = useState(false);
    const [showEPFRedirectingPopup, setShowEPFRedirectingPopup] = useState(false);
    const browserTitle = "KWSP-Login-Member";

    useEffect(() => {
        logEvent(FA_VIEW_SCREEN, {
            [FA_SCREEN_NAME]: "FinancialGoals_Retirement_EPF_CurrentAmount",
        });
    }, []);

    function onDoneButtonPress() {
        navigation.navigate(BANKINGV2_MODULE, {
            screen: CURRENT_EPF_MONTHLY_CONTRIBUTE,
            params: {
                ...route?.params,
                epfAccountBal: rawAmount ?? null,
            },
        });
    }

    function onBackButtonPress() {
        navigation.goBack();
    }

    function onCrossButtonPress() {
        navigation.navigate(BANKINGV2_MODULE, {
            screen:
                route?.params?.from === GOAL_SIMULATION ? GOAL_SIMULATION : FINANCIAL_GOAL_OVERVIEW,
        });
    }

    function changeText(value) {
        if (!value) {
            setRawAmount(0);
            setFormattedAmount("");
            setKeypadAmount("");
            return;
        }

        const num = parseInt(value);
        if (num > 0) {
            const decimal = num / 100;

            setRawAmount(decimal);
            setFormattedAmount(numeral(decimal).format("0,0.00"));
            setKeypadAmount(value);
        }
    }

    const TITLE =
        "Include EPF details to the calculation. You can find your contribution amount on your salary slip or ";

    const redirectingToEPFDesc =
        "By clicking proceed, you will enter a third party website and Maybank's privacy policy will no longer apply. The link was provided for your convenience only and the linked website or its contents shall not be considered as an endorsement by Maybank.\n\nAre you sure you want to continue?";

    function onPressEPFIAkaun() {
        setShowEPFRedirectingPopup(true);
    }

    function _onCloseBrowser() {
        setShowBrowser(false);
    }

    function onClickXButton() {
        navigation.pop(route?.params?.from === GOAL_SIMULATION ? 3 : 2);
        setShowEPFRedirectingPopup(false);
    }

    function onPressProceedRedirectingEPF() {
        setShowBrowser(true);
        setShowEPFRedirectingPopup(false);
    }

    function onCloseRedirectingPopup() {
        setShowEPFRedirectingPopup(false);
    }

    return (
        <ScreenContainer backgroundType="color" backgroundColor={MEDIUM_GREY}>
            <ScreenLayout
                header={
                    <HeaderLayout
                        headerLeftElement={<HeaderBackButton onPress={onBackButtonPress} />}
                        headerRightElement={<HeaderCloseButton onPress={onCrossButtonPress} />}
                        headerCenterElement={
                            <Typo
                                fontSize={16}
                                fontWeight="600"
                                lineHeight={19}
                                text={INCLUDE_EPF_SAVING}
                            />
                        }
                    />
                }
                useSafeArea
                paddingHorizontal={0}
                paddingBottom={0}
                neverForceInset={["bottom"]}
            >
                <React.Fragment>
                    <View style={styles.container}>
                        <Typo
                            fontSize={16}
                            fontWeight="600"
                            lineHeight={20}
                            text={TITLE}
                            textAlign="left"
                        >
                            {TITLE}
                            <TouchableOpacity onPress={onPressEPFIAkaun}>
                                <Typo
                                    text="EPF i-Akaun"
                                    fontSize={16}
                                    fontWeight="600"
                                    lineHeight={20}
                                    textAlign="left"
                                    style={styles.iAkaunClick}
                                />
                            </TouchableOpacity>
                        </Typo>
                        <Typo
                            fontSize={14}
                            fontWeight="400"
                            lineHeight={18}
                            style={styles.desc}
                            text="How much savings do you have in your EPF account currently?"
                            textAlign="left"
                        />

                        <View style={styles.amountViewTransfer}>
                            <TextInput
                                accessibilityLabel="Password"
                                prefixStyle={[{ color: GREY }]}
                                style={{ color: rawAmount === 0 ? GREY : BLACK }}
                                isValid={true}
                                isValidate
                                placeholder="0.00"
                                value={`${formattedAmount}`}
                                prefix={CURRENCY_CODE}
                                clearButtonMode="while-editing"
                                returnKeyType="done"
                                editable={false}
                            />
                        </View>
                    </View>

                    <NumericalKeyboard
                        value={`${keypadAmount}`}
                        onChangeText={changeText}
                        maxLength={8}
                        onDone={onDoneButtonPress}
                    />
                </React.Fragment>
            </ScreenLayout>
            <Popup
                visible={showEPFRedirectingPopup}
                title="Redirecting to Third Party Website"
                description={redirectingToEPFDesc}
                onClose={onClickXButton}
                primaryAction={{
                    text: PROCEED,
                    onPress: onPressProceedRedirectingEPF,
                }}
                secondaryAction={{
                    text: "No",
                    onPress: onCloseRedirectingPopup,
                }}
            />
            <Modal isVisible={showBrowser} hasBackdrop={false} useNativeDriver style={styles.modal}>
                <Browser
                    source={{ uri: FINANCIAL_EPF_I_AKAUN }}
                    title={browserTitle}
                    onCloseButtonPressed={_onCloseBrowser}
                />
            </Modal>
        </ScreenContainer>
    );
}

CurrentEPFSaving.propTypes = {
    route: PropTypes.object,
    navigation: PropTypes.object,
};

export default CurrentEPFSaving;

const styles = {
    container: {
        flex: 1,
        alignItems: "flex-start",
        paddingHorizontal: 24,
    },
    desc: {
        paddingTop: 15,
    },
    amountViewTransfer: {
        alignItems: "center",
        flexDirection: "row",
        marginTop: 4,
        width: "100%",
    },
    iAkaunClick: {
        textDecorationLine: "underline",
        top: 3,
    },
    modal: {
        margin: 0,
    },
};
