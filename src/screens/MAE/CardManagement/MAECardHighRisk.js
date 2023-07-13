import React, { useState, useEffect } from "react";
import { StyleSheet, View, ScrollView } from "react-native";

import ScreenContainer from "@components/Containers/ScreenContainer";
import ScreenLayout from "@layouts/ScreenLayout";
import HeaderLayout from "@layouts/HeaderLayout";
import Typo from "@components/Text";
import ActionButton from "@components/Buttons/ActionButton";
import FixedActionContainer from "@components/Footers/FixedActionContainer";
import HeaderBackButton from "@components/Buttons/HeaderBackButton";
import LabeledDropdown from "@components/FormComponents/LabeledDropdown";
import { ScrollPickerView } from "@components/Common";

import { YELLOW, MEDIUM_GREY, DISABLED } from "@constants/colors";
import { MAE_REQUESTCARD, DONE, PLEASE_SELECT, CANCEL } from "@constants/strings";
import { MAE_CARD_ADDRESS } from "@navigation/navigationConstant";

function MAECardHighRisk({ route, navigation }) {
    // Others
    const [isContinueDisabled, setIsContinueDisabled] = useState(true);
    const [pickerType, setPickerType] = useState(null);

    // Source of Fund Origin Field related
    const [fundOrigin, setFundOrigin] = useState(PLEASE_SELECT);
    const [fundOriginValue, setFundOriginValue] = useState(null);
    const [fundOriginValid, setFundOriginValid] = useState(true);
    const [fundOriginErrorMsg, setFundOriginErrorMsg] = useState("");
    const [fundOriginData, setFundOriginData] = useState(null);
    // const [fundOriginKeyVal, setFundOriginKeyVal] = useState(null);
    const [fundOriginPicker, setFundOriginPicker] = useState(false);

    // Source of Wealth Origin Field related
    const [wealthOrigin, setWealthOrigin] = useState(PLEASE_SELECT);
    const [wealthOriginValue, setWealthOriginValue] = useState(null);
    const [wealthOriginValid, setWealthOriginValid] = useState(true);
    const [wealthOriginErrorMsg, setWealthOriginErrorMsg] = useState("");
    const [wealthOriginData, setWealthOriginData] = useState(null);
    // const [wealthOriginKeyVal, setWealthOriginKeyVal] = useState(null);
    const [wealthOriginPicker, setWealthOriginPicker] = useState(false);

    useEffect(() => {
        init();
    }, []);

    // Used to check if all fields are filled in, then accordingly enable/disable "Continue" btn
    useEffect(() => {
        setIsContinueDisabled(!fundOriginValue || !wealthOriginValue);
    }, [fundOriginValue, wealthOriginValue]);

    const init = () => {
        console.log("[MAECardHighRisk] >> [init]");

        const params = route?.params ?? {};
        const sourceOfFundOrigin = params?.masterData?.sourceOfFundOrigin ?? null;
        const sourceOfWealthOrigin = params?.masterData?.sourceOfWealthOrigin ?? null;

        setFundOriginData(sourceOfFundOrigin);
        setWealthOriginData(sourceOfWealthOrigin);
    };

    const onFundOriginFieldTap = () => {
        console.log("[MAECardHighRisk] >> [onFundOriginFieldTap]");

        if (fundOriginData) {
            setFundOriginPicker(true);
            setPickerType("fundOrigin");
        }
    };

    const onWealthOriginFieldTap = () => {
        console.log("[MAECardHighRisk] >> [onWealthOriginFieldTap]");

        if (wealthOriginData) {
            setWealthOriginPicker(true);
            setPickerType("wealthOrigin");
        }
    };

    const onPickerCancel = () => {
        console.log("[MAECardHighRisk] >> [onPickerCancel]");

        setFundOriginPicker(false);
        setWealthOriginPicker(false);
        setPickerType(null);
    };

    const onPickerDone = (item) => {
        console.log("[MAECardHighRisk] >> [onPickerDone]");

        if (pickerType === "fundOrigin") {
            setFundOrigin(item?.name ?? PLEASE_SELECT);
            setFundOriginValue(item?.value ?? "");
        }

        if (pickerType === "wealthOrigin") {
            setWealthOrigin(item?.name ?? PLEASE_SELECT);
            setWealthOriginValue(item?.value ?? "");
        }

        // Close picker
        onPickerCancel();
    };

    const onDoneTap = () => {
        console.log("[MAECardHighRisk] >> [onDoneTap]");

        // Return if button is disabled
        if (isContinueDisabled) return;

        // Navigate to address screen
        navigation.navigate(MAE_CARD_ADDRESS, {
            ...route.params,
            sourceOfFundOrigin: fundOriginValue,
            sourceOfWealthOrigin: wealthOriginValue,
        });
    };

    const onBackTap = () => {
        console.log("[MAECardHighRisk] >> [onBackTap]");

        navigation.goBack();
    };

    return (
        <React.Fragment>
            <ScreenContainer backgroundType="color" backgroundColor={MEDIUM_GREY}>
                <ScreenLayout
                    header={
                        <HeaderLayout
                            headerLeftElement={<HeaderBackButton onPress={onBackTap} />}
                            headerCenterElement={
                                <Typo
                                    fontSize={16}
                                    fontWeight="600"
                                    lineHeight={19}
                                    text={MAE_REQUESTCARD}
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
                        <ScrollView
                            style={Style.scrollViewCls}
                            showsVerticalScrollIndicator={false}
                        >
                            {/* Additional info... */}
                            <Typo
                                fontSize={20}
                                lineHeight={28}
                                fontWeight="300"
                                textAlign="left"
                                text="Additional information"
                                style={Style.headerLabelCls}
                            />

                            {/* Source of Fund Origin */}
                            <LabeledDropdown
                                label="Source of Fund Origin"
                                dropdownValue={fundOrigin}
                                isValid={fundOriginValid}
                                errorMessage={fundOriginErrorMsg}
                                onPress={onFundOriginFieldTap}
                                style={Style.fieldViewCls}
                            />

                            {/* Source of Wealth Origin */}
                            <LabeledDropdown
                                label="Source of Wealth Origin"
                                dropdownValue={wealthOrigin}
                                isValid={wealthOriginValid}
                                errorMessage={wealthOriginErrorMsg}
                                onPress={onWealthOriginFieldTap}
                                style={Style.fieldViewCls}
                            />
                        </ScrollView>

                        {/* Bottom docked button container */}
                        <FixedActionContainer>
                            <View style={Style.bottomBtnContCls}>
                                <ActionButton
                                    activeOpacity={isContinueDisabled ? 1 : 0.5}
                                    backgroundColor={isContinueDisabled ? DISABLED : YELLOW}
                                    fullWidth
                                    componentCenter={
                                        <Typo
                                            fontSize={14}
                                            lineHeight={18}
                                            fontWeight="600"
                                            text={DONE}
                                        />
                                    }
                                    onPress={onDoneTap}
                                />
                            </View>
                        </FixedActionContainer>
                    </React.Fragment>
                </ScreenLayout>
            </ScreenContainer>

            {/* Fund Origin Picker */}
            {fundOriginData && (
                <ScrollPickerView
                    showMenu={fundOriginPicker}
                    list={fundOriginData}
                    onRightButtonPress={onPickerDone}
                    onLeftButtonPress={onPickerCancel}
                    rightButtonText={DONE}
                    leftButtonText={CANCEL}
                />
            )}

            {/* Wealth Origin Picker */}
            {wealthOriginData && (
                <ScrollPickerView
                    showMenu={wealthOriginPicker}
                    list={wealthOriginData}
                    onRightButtonPress={onPickerDone}
                    onLeftButtonPress={onPickerCancel}
                    rightButtonText={DONE}
                    leftButtonText={CANCEL}
                />
            )}
        </React.Fragment>
    );
}

const Style = StyleSheet.create({
    bottomBtnContCls: {
        flexDirection: "row",
        justifyContent: "space-around",
        width: "100%",
    },

    fieldViewCls: {
        marginTop: 25,
    },

    headerLabelCls: {
        marginTop: 15,
    },

    scrollViewCls: {
        paddingHorizontal: 36,
    },
});

export default MAECardHighRisk;
