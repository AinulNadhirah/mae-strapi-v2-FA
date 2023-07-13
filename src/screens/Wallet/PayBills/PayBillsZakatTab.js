import PropTypes from "prop-types";
import React, { useEffect, useState } from "react";
import { StyleSheet, View, Platform } from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";

import ScreenLayout from "@layouts/ScreenLayout";
import Typography from "@components/Text";
import ActionButton from "@components/Buttons/ActionButton";
import FixedActionContainer from "@components/Footers/FixedActionContainer";
import LabeledDropdown from "@components/FormComponents/LabeledDropdown";
import TextInput from "@components/TextInput";

import { YELLOW, DISABLED } from "@constants/colors";
import { PLEASE_SELECT, CONTINUE, ZAKAT_FITRAH, ZAKAT_BODY } from "@constants/strings";

function PayBillsZakatTab({
    zakatBody = PLEASE_SELECT,
    zakatBodyValue = null,
    onZakatBodyFieldTap,
    riceType = PLEASE_SELECT,
    riceTypeValue = null,
    onRiceTypeFieldTap,
    payingFor = PLEASE_SELECT,
    payingForValue = null,
    onPayingForFieldTap,
    payingForNum,
    onPayingForNumTextChange,
    onContinue,
}) {
    const [isContinueDisabled, setContinueDisabled] = useState(true);

    // Used to check if all fields are filled in, then accordingly enable/disable "Continue" btn
    useEffect(() => {
        setContinueDisabled(
            payingForNum.trim() === "" || !zakatBodyValue || !riceTypeValue || !payingForValue
        );
    }, [
        payingForNum,
        zakatBody,
        riceType,
        payingFor,
        zakatBodyValue,
        riceTypeValue,
        payingForValue,
    ]);

    return (
        <ScreenLayout
            paddingHorizontal={0}
            paddingBottom={0}
            paddingTop={0}
            useSafeArea
            neverForceInset={["top"]}
        >
            <React.Fragment>
                <KeyboardAwareScrollView
                    behavior={Platform.OS == "ios" ? "padding" : ""}
                    enabled
                    showsVerticalScrollIndicator={false}
                    style={Style.scrollViewCls}
                >
                    {/* Zakat Fitrah */}
                    <Typography
                        fontSize={16}
                        fontWeight="600"
                        lineHeight={18}
                        textAlign="left"
                        text={ZAKAT_FITRAH}
                        style={Style.fieldViewCls}
                    />

                    {/* Zakat body */}
                    <LabeledDropdown
                        label={ZAKAT_BODY}
                        dropdownValue={zakatBody}
                        onPress={onZakatBodyFieldTap}
                        style={Style.fieldViewCls}
                    />

                    {/* Rice Type */}
                    <LabeledDropdown
                        label="Select rice types"
                        dropdownValue={riceType}
                        onPress={onRiceTypeFieldTap}
                        style={Style.fieldViewCls}
                    />

                    {/* Number of People Paying For */}
                    <View style={Style.fieldViewCls}>
                        <Typography
                            fontSize={14}
                            lineHeight={18}
                            textAlign="left"
                            text="How many people are you paying for?"
                        />
                        <TextInput
                            minLength={1}
                            maxLength={3}
                            isValidate
                            isValid={true}
                            errorMessage=""
                            value={payingForNum}
                            placeholder="Enter number"
                            keyboardType="numeric"
                            onChangeText={onPayingForNumTextChange}
                            blurOnSubmit
                            returnKeyType="done"
                        />
                    </View>

                    {/* Paying for */}
                    <LabeledDropdown
                        label="Paying for"
                        dropdownValue={payingFor}
                        onPress={onPayingForFieldTap}
                        style={Style.fieldViewCls}
                    />
                </KeyboardAwareScrollView>

                {/* Bottom docked button container */}
                <FixedActionContainer>
                    <View style={Style.bottomBtnContCls}>
                        <ActionButton
                            disabled={isContinueDisabled}
                            activeOpacity={isContinueDisabled ? 1 : 0.5}
                            backgroundColor={isContinueDisabled ? DISABLED : YELLOW}
                            fullWidth
                            componentCenter={
                                <Typography
                                    fontSize={14}
                                    lineHeight={18}
                                    fontWeight="600"
                                    text={CONTINUE}
                                />
                            }
                            onPress={onContinue}
                        />
                    </View>
                </FixedActionContainer>
            </React.Fragment>
        </ScreenLayout>
    );
}

PayBillsZakatTab.propTypes = {
    onContinue: PropTypes.any,
    onPayingForFieldTap: PropTypes.any,
    onPayingForNumTextChange: PropTypes.any,
    onRiceTypeFieldTap: PropTypes.any,
    onZakatBodyFieldTap: PropTypes.any,
    payingFor: PropTypes.any,
    payingForNum: PropTypes.shape({
        trim: PropTypes.func,
    }),
    payingForValue: PropTypes.any,
    riceType: PropTypes.any,
    riceTypeValue: PropTypes.any,
    zakatBody: PropTypes.any,
    zakatBodyValue: PropTypes.any,
};

const Style = StyleSheet.create({
    bottomBtnContCls: {
        flexDirection: "row",
        justifyContent: "space-around",
        width: "100%",
    },

    fieldViewCls: {
        marginTop: 25,
    },

    scrollViewCls: {
        paddingHorizontal: 36,
    },
});

export default PayBillsZakatTab;
