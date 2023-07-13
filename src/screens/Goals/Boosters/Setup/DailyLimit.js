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
import { FA_TABUNG_TABUNGBOOSTER_GP_DAILYLIMIT } from "@constants/strings";

function DailyLimit({ navigation, route }) {
    const isEdit = route?.params?.isEdit;
    const categories = route?.params?.categories;
    const categoryIndex = route?.params?.categoryIndex ?? -1;
    const initialValue = categoryIndex > -1 ? categories[categoryIndex]?.dailyLimit : 0;
    const [limit, setLimit] = useState(initialValue ?? 0);
    const [formattedLimit, setFormattedLimit] = useState(
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
            dailyLimit: limit,
        };

        return Object.assign([], categories, {
            [categoryIndex]: newData,
        });
    }

    function handleProceedSetup() {
        const mergedCategory = getEditCategory();

        navigation.navigate(isEdit ? "BoosterSummary" : "BoosterFundAmount", {
            ...route.params,
            categories: mergedCategory,
        });
    }

    function handleKeyboardChange(value) {
        if (!value) {
            console.log("no value", value);
            setLimit(0);
            setFormattedLimit("");
            return;
        }

        const num = parseInt(value);

        if (num > 0) {
            const decimal = num / 100;

            setLimit(decimal);
            setFormattedLimit(numeral(decimal).format("0,0.00"));
        }

        if (error) setError("");
    }

    function handleKeyboardDone() {
        if (!limit) {
            setError("Please enter your daily limit for this category.");
            return;
        }
        if (limit < 10) {
            setError("Please enter a minimum daily limit of RM 10.00 for this category.");
            return;
        }

        handleProceedSetup();
    }

    useFocusEffect(
        useCallback(() => {
            if (categoryIndex > -1) {
                const dailyLimit = categories[categoryIndex]?.dailyLimit ?? 0;

                setLimit(dailyLimit);
                setFormattedLimit(dailyLimit > 0 ? numeral(dailyLimit).format("0,0.00") : "");
            }
            return () => {};
        }, [categories, categoryIndex])
    );

    return (
        <ScreenContainer
            backgroundType="color"
            backgroundColor={MEDIUM_GREY}
            analyticScreenName={FA_TABUNG_TABUNGBOOSTER_GP_DAILYLIMIT}
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
                                text="Set daily limit for category."
                                textAlign="left"
                            />
                            <TextInput
                                prefix="RM"
                                placeholder="0.00"
                                value={formattedLimit}
                                editable={false}
                                isValidate
                                isValid={!error}
                                errorMessage={error}
                            />
                        </View>
                    </View>
                    <NumericalKeyboard
                        value={`${Math.floor(limit * 100)}`}
                        onChangeText={handleKeyboardChange}
                        maxLength={5}
                        onDone={handleKeyboardDone}
                    />
                </>
            </ScreenLayout>
        </ScreenContainer>
    );
}

DailyLimit.propTypes = {
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

export default DailyLimit;
