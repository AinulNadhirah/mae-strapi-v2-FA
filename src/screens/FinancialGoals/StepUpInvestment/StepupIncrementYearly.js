import { useNavigation } from "@react-navigation/native";
import React, { useState } from "react";
import { View } from "react-native";
import { TouchableOpacity } from "react-native-gesture-handler";

import {
    BANKINGV2_MODULE,
    GOAL_SIMULATION,
    STEPUP_DEPOSIT_SCHEDULE,
} from "@navigation/navigationConstant";

import HeaderLayout from "@layouts/HeaderLayout";
import ScreenLayout from "@layouts/ScreenLayout";

import HeaderBackButton from "@components/Buttons/HeaderBackButton";
import HeaderCloseButton from "@components/Buttons/HeaderCloseButton";
import ScreenContainer from "@components/Containers/ScreenContainer";
import NumericalKeyboard from "@components/NumericalKeyboard";
import Typo from "@components/Text";
import TextInput from "@components/TextInput";

import { MEDIUM_GREY, GREY, BLACK, WHITE } from "@constants/colors";
import { CURRENCY_CODE } from "@constants/strings";

import { numberWithCommas } from "@utils/dataModel/utilityFinancialGoals";

function StepupIncrementYearly() {
    const navigation = useNavigation();

    const [amountValue, setAmountValue] = useState(0);
    const [amount, setAmount] = useState("0.00");

    const [selectedCategory, setSelectedCategory] = useState("AMT");

    const [errAmount, setErrorAmount] = useState("");
    /* EVENT HANDLERS */

    function onDoneButtonPress() {
        const amountText = amount ? amount.toString().replace(/,/g, "") : "0.00";

        if (
            parseFloat(amountText).toFixed(2) >= 0 &&
            parseFloat(amountText).toFixed(2) <= 999999.0
        ) {
            navigation.navigate(BANKINGV2_MODULE, {
                screen: STEPUP_DEPOSIT_SCHEDULE,
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
        const value = val ? parseInt(val) : 0;

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

    function onPressAmount() {
        setSelectedCategory("AMT");
    }

    function onPressPercentage() {
        setSelectedCategory("PER");
    }

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
                                text="Step-up Investment"
                            />
                        }
                    />
                }
                useSafeArea
                neverForceInset={["bottom"]}
                paddingHorizontal={0}
                paddingBottom={0}
            >
                <React.Fragment>
                    <View style={styles.container}>
                        <View style={styles.blockNew}>
                            <Typo
                                fontSize={14}
                                fontWeight="600"
                                lineHeight={18}
                                text="Increase your monthly contribution by RM 500.00 every year to close the gap"
                                textAlign="left"
                            />

                            <Typo
                                fontSize={20}
                                fontWeight="300"
                                lineHeight={28}
                                style={styles.sublabel}
                                text="By how much do you want your monthly contribution to increase every year?"
                                textAlign="left"
                            />

                            <View style={styles.viewIncrement}>
                                <TouchableOpacity
                                    style={[
                                        styles.toggleSelectionAmount,
                                        selectedCategory === "AMT" ? styles.activeToggle : null,
                                    ]}
                                    onPress={onPressAmount}
                                >
                                    <Typo
                                        text="Amount"
                                        fontSize={14}
                                        color={selectedCategory === "AMT" ? WHITE : BLACK}
                                        fontWeight="600"
                                    />
                                </TouchableOpacity>

                                <View style={styles.margin10Style} />
                                <TouchableOpacity
                                    style={[
                                        styles.toggleSelectionPercentage,
                                        selectedCategory === "PER" ? styles.activeToggle : null,
                                    ]}
                                    onPress={onPressPercentage}
                                >
                                    <Typo
                                        text="Percentage"
                                        fontSize={14}
                                        color={selectedCategory === "PER" ? WHITE : BLACK}
                                        fontWeight="600"
                                    />
                                </TouchableOpacity>
                            </View>

                            <View style={styles.amountViewTransfer}>
                                <TextInput
                                    accessibilityLabel="Password"
                                    prefixStyle={[{ color: GREY }]}
                                    style={{ color: amount == 0 ? GREY : BLACK }}
                                    isValid={!errAmount}
                                    isValidate
                                    errorMessage={errAmount}
                                    onSubmitEditing={this.onDone}
                                    value={amount}
                                    prefix={CURRENCY_CODE}
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

export default StepupIncrementYearly;

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
    margin10Style: { margin: 10 },
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
    toggleSelectionAmount: {
        alignItems: "center",
        borderRadius: 16,
        flexDirection: "row",
        height: 33,
        justifyContent: "center",
        width: 91,
    },
    viewIncrement: { flexDirection: "row", marginTop: 16 },
    activeToggle: {
        backgroundColor: `rgba(0, 0, 0, 1)`,
    },
    toggleSelectionPercentage: {
        alignItems: "center",
        borderRadius: 16,
        flexDirection: "row",
        height: 33,
        justifyContent: "center",
        width: 101,
    },
    subHeader: {
        alignItems: "flex-start",
        backgroundColor: GREY,
        flexDirection: "row",
        paddingHorizontal: 24,
        paddingVertical: 8,
    },
};
