import PropTypes from "prop-types";
import React, { useState, useEffect } from "react";
import { View, Image, TouchableOpacity, StyleSheet } from "react-native";

import { BANKINGV2_MODULE, FINANCIAL_RET_UPFRONT } from "@navigation/navigationConstant";

import HeaderBackButton from "@components/Buttons/HeaderBackButton";
import ScreenContainer from "@components/Containers/ScreenContainer";
import HeaderLabel from "@components/Label/HeaderLabel";
import HeaderLayout from "@components/Layouts/HeaderLayout";
import ScreenLayout from "@components/Layouts/ScreenLayout";
import NumericalKeyboard from "@components/NumericalKeyboard";
import Popup from "@components/Popup";
import Typo from "@components/Text";
import TextInput from "@components/TextInput";

import { logEvent } from "@services/analytics";

import { MEDIUM_GREY } from "@constants/colors";
import {
    GOAL_BASED_INVESTMENT,
    RETIREMENT_GOAL,
    RETIREMENT_YEAR_RANGE_POPUP,
    LIFE_EXPECTANCY_POPUP,
    LIFE_EXPECTANCY_POPUP_TITLE,
    FA_VIEW_SCREEN,
    FA_SCREEN_NAME,
    FA_FIN_GOAL_RETIREMENT_SAVINGS,
} from "@constants/strings";

import assets from "@assets";

const RetirementYearRange = ({ navigation, route }) => {
    function onPressBack() {
        navigation.goBack();
    }

    const [keypadValue, setKeypadValue] = useState(
        route?.params?.lastFor ? route?.params?.lastFor.toString() : "15"
    );
    const [yearValue, setYearValue] = useState(
        route?.params?.lastFor ? route?.params?.lastFor.toString() : "15"
    );
    const [showRetirementPopup, setShowRetirementPopup] = useState(false);
    const [rawValue, setRawValue] = useState(route?.params?.lastFor ?? 15);
    const [error, setError] = useState("");

    useEffect(() => {
        logEvent(FA_VIEW_SCREEN, {
            [FA_SCREEN_NAME]: FA_FIN_GOAL_RETIREMENT_SAVINGS,
        });
    }, []);

    function handleKeyboardChange(value) {
        if (value === "0") {
            setRawValue(0);
            setKeypadValue("");
            setYearValue("");
            return;
        }
        setError("");
        setYearValue(value);
        setKeypadValue(value);
        const num = parseInt(value);
        setRawValue(num);
    }

    function handleKeyboardDone() {
        // Check for validations
        if (!validateForm()) return;

        navigation.navigate(BANKINGV2_MODULE, {
            screen: FINANCIAL_RET_UPFRONT,
            params: {
                ...route?.params,
                lastFor: rawValue,
            },
        });
    }

    function validateForm() {
        if (rawValue === 0 || keypadValue === "") {
            setError("Please input number of years between 1 and 99");
            return false;
        } else {
            return true;
        }
    }

    function closeMinRetirementRangePopup() {
        setShowRetirementPopup(false);
    }

    function openMinRetirementRangePopup() {
        setShowRetirementPopup(true);
    }

    return (
        <ScreenContainer backgroundType="color" backgroundColor={MEDIUM_GREY}>
            <ScreenLayout
                header={
                    <HeaderLayout
                        headerLeftElement={<HeaderBackButton onPress={onPressBack} />}
                        headerCenterElement={<HeaderLabel>{GOAL_BASED_INVESTMENT}</HeaderLabel>}
                    />
                }
                useSafeArea
                paddingTop={0}
                paddingHorizontal={0}
                paddingBottom={0}
                neverForceInset={["bottom"]}
            >
                <View style={Style.wrapper}>
                    <View style={Style.container}>
                        <Typo
                            fontSize={14}
                            fontWeight="600"
                            lineHeight={18}
                            text={RETIREMENT_GOAL}
                            textAlign="left"
                        />
                        <Typo
                            fontSize={14}
                            fontWeight="400"
                            lineHeight={20}
                            style={Style.label}
                            textAlign="left"
                        >
                            {RETIREMENT_YEAR_RANGE_POPUP}
                            <TouchableOpacity
                                style={Style.popup}
                                onPress={openMinRetirementRangePopup}
                            >
                                <Image style={Style.infoIcon} source={assets.icInformation} />
                            </TouchableOpacity>
                        </Typo>
                        <TextInput
                            suffix="years"
                            suffixStyle={Style.suffixStyle}
                            value={yearValue}
                            editable={false}
                            isValidate={true}
                            isValid={!error}
                            errorMessage={error}
                        />
                    </View>
                </View>
                <NumericalKeyboard
                    value={keypadValue}
                    maxLength={2}
                    onChangeText={handleKeyboardChange}
                    onDone={handleKeyboardDone}
                />
                <Popup
                    visible={showRetirementPopup}
                    title={LIFE_EXPECTANCY_POPUP_TITLE}
                    description={LIFE_EXPECTANCY_POPUP}
                    onClose={closeMinRetirementRangePopup}
                />
            </ScreenLayout>
        </ScreenContainer>
    );
};

RetirementYearRange.propTypes = {
    navigation: PropTypes.object,
    route: PropTypes.object,
};

const Style = StyleSheet.create({
    container: {
        flex: 1,
        paddingHorizontal: 24,
    },
    infoIcon: {
        height: 18,
        marginLeft: 10,
        top: 6,
        width: 18,
    },
    label: {
        paddingBottom: 10,
        paddingTop: 24,
    },
    popup: {
        position: "absolute",
    },
    suffixStyle: {
        textAlign: "left",
    },
    wrapper: {
        flex: 1,
        flexDirection: "column",
        justifyContent: "space-between",
    },
});

export default RetirementYearRange;
