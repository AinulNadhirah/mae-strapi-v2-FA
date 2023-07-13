import PropTypes from "prop-types";
import React, { useState, useEffect, useCallback } from "react";
import { View, StyleSheet } from "react-native";

import {
    BANKINGV2_MODULE,
    FINANCIAL_REMOVE_GOAL_CONFIRMATION,
} from "@navigation/navigationConstant";

import ActionButton from "@components/Buttons/ActionButton";
import HeaderBackButton from "@components/Buttons/HeaderBackButton";
import { ScrollPickerView } from "@components/Common";
import ScreenContainer from "@components/Containers/ScreenContainer";
import TitleAndDropdownPill from "@components/FinancialGoal/TitleAndDropdownPill";
import FixedActionContainer from "@components/Footers/FixedActionContainer";
import HeaderLabel from "@components/Label/HeaderLabel";
import HeaderLayout from "@components/Layouts/HeaderLayout";
import ScreenLayout from "@components/Layouts/ScreenLayout";
import Typo from "@components/Text";
import { showErrorToast } from "@components/Toast";

import { deleteGoalReason } from "@services";
import { logEvent } from "@services/analytics";

import { BLACK, DISABLED, DISABLED_TEXT, YELLOW } from "@constants/colors";
import {
    CONTINUE,
    DROPDOWN_DEFAULT_TEXT,
    REMOVE_GOAL,
    FA_VIEW_SCREEN,
    FA_SCREEN_NAME,
} from "@constants/strings";

import { numberWithCommas } from "@utils/dataModel/utilityPartial.3";

const RemoveGoal = ({ navigation, route }) => {
    const [showPicker, setShowPicker] = useState(false);
    const [selectedOptions, setSelectedOptions] = useState(null);
    const [selectedOptionsLabel, setSelectedOptionsLabel] = useState(null);
    const [buttonEnabled, setButtonEnabled] = useState(false);
    const [reasons, setReasons] = useState([]);

    useEffect(() => {
        fetchRemoveReason();
    }, [fetchRemoveReason]);

    useEffect(() => {
        if (selectedOptionsLabel) {
            setButtonEnabled(true);
        }
    }, [selectedOptionsLabel]);

    useEffect(() => {
        logEvent(FA_VIEW_SCREEN, {
            [FA_SCREEN_NAME]: "FinancialGoals_RemoveGoal_Reason",
        });
    }, []);

    const fetchRemoveReason = useCallback(async () => {
        try {
            const response = await deleteGoalReason(true);
            if (response?.data) {
                setReasons(response?.data?.DELETE_REASON);
            }
        } catch (err) {
            showErrorToast({ message: err?.message });
        }
    }, []);

    const pickerOptions = reasons.map((item) => {
        return {
            name: item?.refDesc,
            value: item?.refDesc,
        };
    });

    function onPressBack() {
        navigation.goBack();
    }

    function onPressDropDown() {
        setShowPicker(true);
    }

    function onScrollPickerDoneButtonPressed(selectedItem, index) {
        setSelectedOptions(index);
        setShowPicker(false);
        setSelectedOptionsLabel(selectedItem?.value);
    }

    function onScrollPickerCancelButtonPressed() {
        setShowPicker(false);
    }

    function onPressContinue() {
        navigation.navigate(BANKINGV2_MODULE, {
            screen: FINANCIAL_REMOVE_GOAL_CONFIRMATION,
            params: {
                totalWithdrawAmount: route?.params?.totalPortfolioValue,
                goalId: route?.params?.goalId,
                refDesc: selectedOptionsLabel,
                goalName: route?.params?.goalName,
            },
        });
    }

    return (
        <ScreenContainer backgroundType="color">
            <ScreenLayout
                header={
                    <HeaderLayout
                        headerLeftElement={<HeaderBackButton onPress={onPressBack} />}
                        headerCenterElement={<HeaderLabel>{REMOVE_GOAL}</HeaderLabel>}
                    />
                }
                useSafeArea
                paddingTop={0}
                paddingHorizontal={0}
                paddingBottom={0}
            >
                <View style={styles.container}>
                    <Typo
                        text={`Total portfolio value: RM ${numberWithCommas(
                            route?.params?.totalPortfolioValue ?? 0
                        )}`}
                        fontWeight="600"
                        fontSize={16}
                        lineHeight={24}
                        textAlign="left"
                    />
                    <Typo
                        text={`Return on investment: RM ${numberWithCommas(
                            route?.params?.roiAmount ?? 0
                        )}`}
                        fontWeight="600"
                        fontSize={16}
                        lineHeight={24}
                        textAlign="left"
                    />
                    <TitleAndDropdownPill
                        title="Before you go, please let us know the reason you're removing this goal."
                        dropdownTitle={selectedOptionsLabel ?? DROPDOWN_DEFAULT_TEXT}
                        dropdownOnPress={onPressDropDown}
                        isDisabled={false}
                    />
                </View>
                <FixedActionContainer>
                    <ActionButton
                        fullWidth
                        onPress={onPressContinue}
                        disabled={!buttonEnabled}
                        backgroundColor={buttonEnabled ? YELLOW : DISABLED}
                        componentCenter={
                            <Typo
                                text={CONTINUE}
                                fontWeight="600"
                                fontSize={14}
                                color={buttonEnabled ? BLACK : DISABLED_TEXT}
                            />
                        }
                    />
                </FixedActionContainer>
            </ScreenLayout>
            {showPicker && (
                <ScrollPickerView
                    showMenu
                    list={pickerOptions}
                    selectedIndex={selectedOptions}
                    onRightButtonPress={onScrollPickerDoneButtonPressed}
                    onLeftButtonPress={onScrollPickerCancelButtonPressed}
                />
            )}
        </ScreenContainer>
    );
};

RemoveGoal.propTypes = {
    navigation: PropTypes.object,
    route: PropTypes.object,
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingHorizontal: 24,
    },
});

export default RemoveGoal;
