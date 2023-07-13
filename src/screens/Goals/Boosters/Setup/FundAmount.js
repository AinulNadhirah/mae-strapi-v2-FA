import { useFocusEffect } from "@react-navigation/native";
import numeral from "numeral";
import PropTypes from "prop-types";
import React, { useState, useCallback } from "react";
import { View, StyleSheet } from "react-native";

import HeaderLayout from "@layouts/HeaderLayout";
import ScreenLayout from "@layouts/ScreenLayout";

import HeaderCloseButton from "@components/Buttons/HeaderCloseButton";
import ScreenContainer from "@components/Containers/ScreenContainer";
import NumericalKeyboard from "@components/NumericalKeyboard";
import Typo from "@components/Text";
import TextInput from "@components/TextInput";

import { MEDIUM_GREY } from "@constants/colors";
import { FA_TABUNG_TABUNGBOOSTER_GP_FUNDAMOUNT } from "@constants/strings";

function FundAmount({ navigation, route }) {
    const categories = route?.params?.categories;
    const categoryIndex = route?.params?.categoryIndex ?? -1;
    const initialValue = categoryIndex > -1 ? categories[categoryIndex]?.fundAmount : 0;
    const [amount, setAmount] = useState(initialValue ?? 0);
    const [formattedAmount, setFormattedAmount] = useState(
        initialValue > 0 ? numeral(initialValue).format("0,0.00") : ""
    );
    const [error, setError] = useState("");

    function getTitle() {
        const { name } = categories[categoryIndex];

        return name ?? "";
    }

    function handleClose() {
        navigation.navigate("Dashboard", {
            screen: "TabungTab",
            params: {
                refresh: null,
            },
        });
    }

    function getEditCategory() {
        if (categoryIndex === -1) {
            return [];
        }

        const newData = {
            ...categories[categoryIndex],
            fundAmount: amount,
        };

        return Object.assign([], categories, {
            [categoryIndex]: newData,
        });
    }

    function handleProceedSetup() {
        const mergedCategory = getEditCategory();

        navigation.navigate("BoosterSummary", {
            ...route.params,
            categories: mergedCategory,
        });
    }

    function handleKeyboardChange(value) {
        if (!value) {
            console.log("no value", value);
            setAmount(0);
            setFormattedAmount("");
            return;
        }

        const num = parseInt(value);

        if (num > 0) {
            const decimal = num / 100;

            setAmount(decimal);
            setFormattedAmount(numeral(decimal).format("0,0.00"));
        }

        if (error) setError("");
    }

    function handleKeyboardDone() {
        if (!formattedAmount) {
            setError("Please enter a funding value.");
            return;
        }
        if (amount < 0.01) {
            setError("Please enter a minimum funding value of RM 0.01 for days you've overspent.");
            return;
        }

        handleProceedSetup();
    }

    useFocusEffect(
        useCallback(() => {
            if (categoryIndex > -1) {
                const fundAmount = categories[categoryIndex]?.fundAmount ?? 0;

                setAmount(fundAmount);
                setFormattedAmount(fundAmount > 0 ? numeral(fundAmount).format("0,0.00") : "");
            }
            return () => {};
        }, [categories, categoryIndex])
    );

    return (
        <ScreenContainer
            backgroundType="color"
            backgroundColor={MEDIUM_GREY}
            analyticScreenName={FA_TABUNG_TABUNGBOOSTER_GP_FUNDAMOUNT}
        >
            <ScreenLayout
                paddingBottom={0}
                paddingTop={24}
                paddingHorizontal={0}
                header={
                    <HeaderLayout
                        headerCenterElement={
                            <Typo fontSize={16} fontWeight="600" lineHeight={19} text="Boosters" />
                        }
                        headerRightElement={<HeaderCloseButton onPress={handleClose} />}
                    />
                }
                useSafeArea
                neverForceInset={["bottom"]}
            >
                <>
                    <View style={styles.wrapper}>
                        <View style={styles.container}>
                            <Typo
                                fontSize={14}
                                fontWeight="600"
                                lineHeight={18}
                                text={getTitle()}
                                textAlign="left"
                            />
                            <Typo
                                fontSize={20}
                                fontWeight="300"
                                lineHeight={28}
                                style={styles.label}
                                text="How much would you like to fund each time the spending limit is exceeded?"
                                textAlign="left"
                            />
                            <TextInput
                                prefix="RM"
                                placeholder="0.00"
                                value={formattedAmount}
                                editable={false}
                                isValidate
                                isValid={!error}
                                errorMessage={error}
                            />
                        </View>
                    </View>
                    <NumericalKeyboard
                        value={`${Math.floor(amount * 100)}`}
                        onChangeText={handleKeyboardChange}
                        maxLength={5}
                        onDone={handleKeyboardDone}
                    />
                </>
            </ScreenLayout>
        </ScreenContainer>
    );
}

FundAmount.propTypes = {
    route: PropTypes.object,
    navigation: PropTypes.object,
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingHorizontal: 36,
    },
    label: {
        paddingBottom: 28,
        paddingTop: 8,
    },
    wrapper: {
        flex: 1,
        flexDirection: "column",
        justifyContent: "space-between",
    },
});

export default FundAmount;
