import PropTypes from "prop-types";
import React, { useEffect, useState, useCallback } from "react";
import { View, Image, TouchableOpacity, StyleSheet } from "react-native";

import { BANKINGV2_MODULE, FINANCIAL_RET_EXPS } from "@navigation/navigationConstant";

import HeaderBackButton from "@components/Buttons/HeaderBackButton";
import ScreenContainer from "@components/Containers/ScreenContainer";
import HeaderLabel from "@components/Label/HeaderLabel";
import HeaderLayout from "@components/Layouts/HeaderLayout";
import ScreenLayout from "@components/Layouts/ScreenLayout";
import NumericalKeyboard from "@components/NumericalKeyboard";
import Popup from "@components/Popup";
import Typo from "@components/Text";
import TextInput from "@components/TextInput";
import { showErrorToast } from "@components/Toast";

import { useModelController, withModelContext } from "@context";

import { logEvent } from "@services/analytics";

import { MEDIUM_GREY } from "@constants/colors";
import {
    GOAL_BASED_INVESTMENT,
    RETIREMENT_AGE_POPUP,
    RETIREMENT_GOAL,
    FA_VIEW_SCREEN,
    FA_SCREEN_NAME,
    FA_FIN_GOAL_RETIREMENT_AGE,
    COMMON_ERROR_MSG,
} from "@constants/strings";

import { getAgeByDob } from "@utils/dataModel/utilityFinancialGoals";

import assets from "@assets";

const RetirementAge = ({ navigation, getModel, route }) => {
    function onPressBack() {
        navigation.goBack();
    }

    const [ageValue, setAgeValue] = useState(
        route?.params?.retireAge ? route?.params?.retireAge.toString() : "60"
    );
    const [keypadValue, setKeypadValue] = useState(
        route?.params?.retireAge ? route?.params?.retireAge.toString() : "60"
    );
    const [showRetirementPopup, setShowRetirementPopup] = useState(false);
    const { birthDate } = getModel("user");
    const [rawValue, setRawValue] = useState(route?.params?.retireAge ?? 60);
    const [error, setError] = useState("");
    const userAge = getAgeByDob(birthDate);
    const { updateModel } = useModelController();

    const miscData = route?.params?.miscData;

    useEffect(() => {
        getMiscData();
    }, [getMiscData]);

    useEffect(() => {
        logEvent(FA_VIEW_SCREEN, {
            [FA_SCREEN_NAME]: FA_FIN_GOAL_RETIREMENT_AGE,
        });
    }, []);

    const getMiscData = useCallback(() => {
        try {
            if (miscData?.menuItemRangeDTOs) {
                updateModel({
                    financialGoal: {
                        retirementData: miscData?.menuItemRangeDTOs,
                    },
                });
            }
        } catch (err) {
            showErrorToast({ message: err?.message ?? COMMON_ERROR_MSG });
        }
    }, [updateModel]);

    function handleKeyboardChange(value) {
        if (value === "0") {
            setRawValue(0);
            setKeypadValue("");
            setAgeValue("");
            return;
        }
        setError("");
        setAgeValue(value);
        setKeypadValue(value);
        const num = Number(value);
        setRawValue(num);
    }

    function handleKeyboardDone() {
        // Check for validations
        if (!validateForm()) return;

        navigation.navigate(BANKINGV2_MODULE, {
            screen: FINANCIAL_RET_EXPS,
            params: {
                ...route?.params,
                retireAge: ageValue,
                goalType: "R",
            },
        });
    }

    function validateForm() {
        if ((userAge && rawValue <= userAge) || keypadValue === "") {
            setError("Please enter age between your current age and 99");
            return false;
        } else return true;
    }

    function closeMinRetirementAgePopup() {
        setShowRetirementPopup(false);
    }

    function openMinRetirementAgePopup() {
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
                            lineHeight={28}
                            style={Style.label}
                            textAlign="left"
                        >
                            {RETIREMENT_AGE_POPUP}
                            <TouchableOpacity
                                style={Style.popup}
                                onPress={openMinRetirementAgePopup}
                            >
                                <Image style={Style.infoIcon} source={assets.icInformation} />
                            </TouchableOpacity>
                        </Typo>
                        <TextInput
                            suffix="age"
                            suffixStyle={Style.suffixStyle}
                            value={ageValue}
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
                    title="Retirement Age"
                    description="The minimum retirement age in Malaysia is 60 years old (source: Minimum Retirement Age Act 2012)."
                    onClose={closeMinRetirementAgePopup}
                />
            </ScreenLayout>
        </ScreenContainer>
    );
};

RetirementAge.propTypes = {
    getModel: PropTypes.func,
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
        width: 18,
    },
    label: {
        paddingBottom: 10,
        paddingTop: 8,
    },
    popup: {
        paddingTop: 16,
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

export default withModelContext(RetirementAge);
