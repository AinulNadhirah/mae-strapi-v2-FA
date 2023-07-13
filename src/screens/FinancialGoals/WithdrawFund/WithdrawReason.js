import PropTypes from "prop-types";
import React, { useState, useEffect, useCallback } from "react";
import { View, StyleSheet } from "react-native";

import { BANKINGV2_MODULE, FINANCIAL_WITHDRAW_CONFIRM } from "@navigation/navigationConstant";

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

import { getWithdrawReason } from "@services";
import { logEvent } from "@services/analytics";

import { BLACK, DISABLED, DISABLED_TEXT, YELLOW } from "@constants/colors";
import {
    CONTINUE,
    DROPDOWN_DEFAULT_TEXT,
    WITHDRAW_FUND,
    REASON_TO_WITHDRAW,
    FA_VIEW_SCREEN,
    FA_SCREEN_NAME,
} from "@constants/strings";

const WithdrawReason = ({ navigation, route }) => {
    const [showPicker, setShowPicker] = useState(false);
    const [selectedOptions, setSelectedOptions] = useState(null);
    const [selectedOptionsLabel, setSelectedOptionsLabel] = useState(null);
    const [buttonEnabled, setButtonEnabled] = useState(false);
    const [pickerOptions, setPickerOptions] = useState([]);
    const withdrawAmt = route?.params?.withdrawAmt;

    useEffect(() => {
        fetchReasons();
    }, [fetchReasons]);

    useEffect(() => {
        logEvent(FA_VIEW_SCREEN, {
            [FA_SCREEN_NAME]: "FinancialGoals_WithdrawFunds_Reason",
        });
    }, []);

    const fetchReasons = useCallback(async () => {
        try {
            const response = await getWithdrawReason(true);
            if (response?.data) {
                const picker = response?.data?.WITHDRAW_REASON?.map((item) => {
                    return {
                        name: item?.refDesc,
                        value: item?.refDesc,
                    };
                });

                setPickerOptions(picker);
            }
        } catch (err) {
            showErrorToast({ message: err?.message });
        }
    }, []);

    function onPressBack() {
        navigation.goBack();
    }

    function onPressDropDown() {
        setShowPicker(true);
    }

    function onScrollPickerDoneButtonPressed(selectedItem, index) {
        setSelectedOptions(index);
        setSelectedOptionsLabel(selectedItem?.value);
        setShowPicker(false);
        setButtonEnabled(true);
    }

    function onScrollPickerCancelButtonPressed() {
        setShowPicker(false);
    }

    function onPressContinue() {
        navigation.navigate(BANKINGV2_MODULE, {
            screen: FINANCIAL_WITHDRAW_CONFIRM,
            params: {
                withdrawAmt,
                goalName: route?.params?.goalName,
                reason: selectedOptionsLabel,
                goalId: route?.params?.goalId,
            },
        });
    }

    return (
        <ScreenContainer backgroundType="color">
            <ScreenLayout
                header={
                    <HeaderLayout
                        headerLeftElement={<HeaderBackButton onPress={onPressBack} />}
                        headerCenterElement={<HeaderLabel>{WITHDRAW_FUND}</HeaderLabel>}
                    />
                }
                useSafeArea
                paddingTop={0}
                paddingHorizontal={0}
                paddingBottom={0}
            >
                <View style={styles.container}>
                    <TitleAndDropdownPill
                        title={REASON_TO_WITHDRAW}
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

WithdrawReason.propTypes = {
    navigation: PropTypes.object,
    route: PropTypes.object,
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingHorizontal: 24,
    },
});

export default WithdrawReason;
