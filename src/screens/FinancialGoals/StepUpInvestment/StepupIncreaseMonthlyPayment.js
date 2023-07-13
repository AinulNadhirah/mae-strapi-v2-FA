import { useNavigation } from "@react-navigation/native";
import PropTypes from "prop-types";
import React, { useState } from "react";
import { View } from "react-native";

import {
    BANKINGV2_MODULE,
    GOAL_SIMULATION,
    STEPUP_INCREMENT_YEARLY,
} from "@navigation/navigationConstant";

import HeaderLayout from "@layouts/HeaderLayout";
import ScreenLayout from "@layouts/ScreenLayout";

import HeaderBackButton from "@components/Buttons/HeaderBackButton";
import HeaderCloseButton from "@components/Buttons/HeaderCloseButton";
import ScreenContainer from "@components/Containers/ScreenContainer";
import NumericalKeyboard from "@components/NumericalKeyboard";
import Typo from "@components/Text";
import TextInput from "@components/TextInput";

import { MEDIUM_GREY, GREY, BLACK } from "@constants/colors";
import * as Strings from "@constants/strings";

function StepupIncreaseMonthlyPayment({ route }) {
    const navigation = useNavigation();

    const [amountValue, setAmountValue] = useState(0);
    const [amount, setAmount] = useState("0.00");

    const gapValue = route.params?.gapValue ?? 0;

    const [errAmount, setErrorAmount] = useState("");
    /* EVENT HANDLERS */

    function onDoneButtonPress() {
        const amountText = amount ? amount.toString().replace(/,/g, "") : "0.00";

        if (
            parseFloat(amountText).toFixed(2) >= 0 &&
            parseFloat(amountText).toFixed(2) <= 999999.0
        ) {
            console.log("doneClick  ", Strings.AMOUNT_NEEDS_TO_BE_001);
            navigation.navigate(BANKINGV2_MODULE, {
                screen: STEPUP_INCREMENT_YEARLY,
            });
        } else {
            setErrorAmount("Please enter a value between RM 0.99 and RM 999,999.99");
        }
    }

    function onBackButtonPress() {
        navigation.goBack();
    }

    function onCloseButtonPress() {
        navigation.navigate(BANKINGV2_MODULE, {
            screen: GOAL_SIMULATION,
        });
    }

    function changeText(val) {
        console.log("changeText : ", val);
        const value = val ? Number(val) : 0;

        if (value > 0) {
            const formatted = numberWithCommas(value);
            console.log("formatted : ", formatted);

            setAmount(formatted);
            setAmountValue(value);
            setErrorAmount("");
        } else {
            setAmount("0.00");
            setAmountValue(value);
        }
    }

    const numberWithCommas = (val) => {
        const text = JSON.stringify(val);
        let x = "0.00";
        if (text) {
            let resStr = "";
            if (text.length === 1) {
                resStr =
                    text.substring(0, text.length - 2) + "0.0" + text.substring(text.length - 2);
            } else if (text.length < 3) {
                resStr =
                    text.substring(0, text.length - 2) + "0." + text.substring(text.length - 2);
            } else {
                if (Number(text) > 0) {
                    resStr =
                        text.substring(0, text.length - 2) + "." + text.substring(text.length - 2);
                } else {
                    resStr = "0.00";
                }
            }

            x = resStr.toString();
            const pattern = /(-?\d+)(\d{3})/;
            while (pattern.test(x)) x = x.replace(pattern, "$1,$2");
        }
        return x;
    };

    return (
        <ScreenContainer backgroundType="color" backgroundColor={MEDIUM_GREY}>
            <ScreenLayout
                header={
                    <HeaderLayout
                        headerLeftElement={<HeaderBackButton onPress={onBackButtonPress} />}
                        headerRightElement={<HeaderCloseButton onPress={onCloseButtonPress} />}
                        headerCenterElement={
                            <Typo
                                fontSize={16}
                                fontWeight="600"
                                lineHeight={19}
                                text="Step-up investment"
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
                        <View style={styles.blockNew}>
                            <Typo
                                fontSize={14}
                                fontWeight="600"
                                lineHeight={18}
                                text={
                                    gapValue > 0
                                        ? "Adjust your monthly investment amount to achieve your goal"
                                        : "Increase your monthly investment amount to achieve your goal faster"
                                }
                                textAlign="left"
                            />

                            <Typo
                                fontSize={20}
                                fontWeight="300"
                                lineHeight={28}
                                style={styles.sublabel}
                                text="How much money would you like to contribute monthly?"
                                textAlign="left"
                            />
                            <View style={styles.amountViewTransfer}>
                                <TextInput
                                    accessibilityLabel="Password"
                                    prefixStyle={[{ color: GREY }]}
                                    style={{ color: amount === 0 ? GREY : BLACK }}
                                    isValid={!errAmount}
                                    isValidate
                                    errorMessage={errAmount}
                                    onSubmitEditing={this.onDone}
                                    value={amount}
                                    prefix={Strings.CURRENCY_CODE}
                                    clearButtonMode="while-editing"
                                    returnKeyType="done"
                                    editable={false}
                                />
                            </View>
                        </View>
                    </View>

                    <NumericalKeyboard
                        value={`${amountValue}`}
                        onChangeText={changeText}
                        maxLength={8}
                        onDone={onDoneButtonPress}
                    />
                </React.Fragment>
            </ScreenLayout>
        </ScreenContainer>
    );
}

StepupIncreaseMonthlyPayment.propTypes = {
    route: PropTypes.object,
    navigation: PropTypes.object,
};

export default StepupIncreaseMonthlyPayment;

const styles = {
    container: {
        flex: 1,
        alignItems: "flex-start",
    },
    sublabel: {
        marginTop: 24,
        fontSize: 14,
        fontWeight: "400",
        lineHeight: 18,
        color: "#000000",
    },
    footerContainer: {
        flex: 1,
        width: "100%",
        flexDirection: "column",
        justifyContent: "flex-end",
    },
    blockNew: {
        flexDirection: "column",
        flex: 1,
        paddingEnd: 38,
        paddingStart: 36,
    },
    titleContainerTransferNewSmall: {
        justifyContent: "flex-start",
        marginTop: -15,
    },
    descriptionContainerAmount: {
        marginTop: 15,
    },
    amountViewTransfer: {
        alignItems: "center",
        flexDirection: "row",
        marginTop: 4,
        width: "100%",
    },
    smallDescCls: {
        marginTop: 8,
        opacity: 0.5,
        color: "#000000",
        fontFamily: "montserrat",
        fontSize: 12,
        lineHeight: 16,
        fontStyle: "normal",
        fontWeight: "normal",
        textAlign: "left",
        letterSpacing: 0,
    },
};
