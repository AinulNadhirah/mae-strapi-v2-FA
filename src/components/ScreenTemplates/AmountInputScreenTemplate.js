import numeral from "numeral";
import PropTypes from "prop-types";
import React, { useCallback, useState, useEffect } from "react";
import { View, StyleSheet, Image, TouchableOpacity } from "react-native";

import Timer from "@screens/ATMCashout/Timer";

import HeaderLayout from "@layouts/HeaderLayout";
import ScreenLayout from "@layouts/ScreenLayout";

import HeaderBackButton from "@components/Buttons/HeaderBackButton";
import ScreenContainer from "@components/Containers/ScreenContainer";
import NumericalKeyboard from "@components/NumericalKeyboard";
import Typo from "@components/Text";
import TextInput from "@components/TextInput";

import Images from "@assets";

const CloseButton = ({ onPress }) => (
    <TouchableOpacity onPress={onPress} style={styles.closeButton}>
        <Image source={Images.icCloseBlack} style={styles.closeButtonIcon} />
    </TouchableOpacity>
);
CloseButton.propTypes = {
    onPress: PropTypes.func,
};
const AmountInputScreenTemplate = ({
    topComponent,
    bottomComponent,
    onHeaderBackButtonPressed,
    onHeaderCloseButtonPressed,
    headerCenterText,
    isTextInputValueValid,
    textInputErrorMessage,
    textInputPrefix,
    onNumPadDoneButtonPressed,
    textInputMaxLength,
    selectedAmount,
    headerData,
}) => {
    const modAmount =
        typeof selectedAmount !== "string" && selectedAmount
            ? String(selectedAmount)
            : selectedAmount;
    const modAmountInt = modAmount?.replace(/,/g, "") * 100;
    const [textInputValue, setTextInputValue] = useState(String(modAmountInt) ?? "");
    const [formattedTextInputValue, setFormattedTextInputValue] = useState(
        String(modAmountInt) ?? ""
    );

    const onNumPadNumericButtonPressed = useCallback(
        (value) => {
            if (value === "0" && !textInputValue) return;
            setTextInputValue(value);
        },
        [setTextInputValue, textInputValue]
    );

    const onDonePress = useCallback(() => {
        onNumPadDoneButtonPressed(formattedTextInputValue);
    }, [onNumPadDoneButtonPressed, formattedTextInputValue]);

    useEffect(() => {
        const formattedAmount = numeral(parseInt(textInputValue, 10) / 100).format("0,0.00");
        if (formattedAmount.length > textInputMaxLength || formattedAmount === "NaN") return;

        setFormattedTextInputValue(formattedAmount !== "0.00" ? formattedAmount : null);
    }, [textInputMaxLength, textInputValue]);

    return (
        <ScreenContainer backgroundType="color">
            <React.Fragment>
                <ScreenLayout
                    header={
                        <>
                            <HeaderLayout
                                headerLeftElement={
                                    onHeaderBackButtonPressed && (
                                        <HeaderBackButton onPress={onHeaderBackButtonPressed} />
                                    )
                                }
                                headerCenterElement={
                                    headerCenterText ? (
                                        <Typo
                                            text={headerCenterText}
                                            fontWeight="600"
                                            fontSize={16}
                                            lineHeight={19}
                                        />
                                    ) : null
                                }
                                headerRightElement={
                                    onHeaderCloseButtonPressed && (
                                        <CloseButton onPress={onHeaderCloseButtonPressed} />
                                    )
                                }
                            />
                            {headerData?.timeInSecs ? (
                                <Timer
                                    time={headerData?.timeInSecs}
                                    navigation={headerData?.navigation}
                                    params={headerData?.params}
                                    cancelTimeout={headerData?.allowToCancelTimer}
                                />
                            ) : null}
                        </>
                    }
                    scrollable
                    useSafeArea
                    paddingHorizontal={36}
                >
                    <View style={styles.informationContainer}>
                        {topComponent}
                        <TextInput
                            importantForAutofill="no"
                            editable={false}
                            value={formattedTextInputValue}
                            prefix={textInputPrefix}
                            isValidate
                            isValid={isTextInputValueValid}
                            errorMessage={textInputErrorMessage}
                            maxLength={textInputMaxLength}
                            placeholder="0.00"
                        />
                        {bottomComponent}
                    </View>
                </ScreenLayout>
                <NumericalKeyboard
                    value={textInputValue}
                    onChangeText={onNumPadNumericButtonPressed}
                    maxLength={8}
                    onDone={onDonePress}
                />
            </React.Fragment>
        </ScreenContainer>
    );
};

const styles = StyleSheet.create({
    closeButton: {
        padding: 20,
    },
    informationContainer: {
        alignItems: "flex-start",
    },
});

AmountInputScreenTemplate.propTypes = {
    topComponent: PropTypes.element,
    bottomComponent: PropTypes.element,
    onHeaderBackButtonPressed: PropTypes.func.isRequired,
    onHeaderCloseButtonPressed: PropTypes.func,
    isTextInputValueValid: PropTypes.bool,
    textInputErrorMessage: PropTypes.string,
    textInputPrefix: PropTypes.string,
    headerCenterText: PropTypes.string,
    onNumPadDoneButtonPressed: PropTypes.func.isRequired,
    textInputMaxLength: PropTypes.number,
    selectedAmount: PropTypes.string,
    headerData: PropTypes.object,
};

AmountInputScreenTemplate.defaultProps = {
    topComponent: null,
    bottomComponent: null,
    isTextInputValueValid: true,
    textInputErrorMessage: "Wrong amount entered.",
    textInputPrefix: "RM",
    textInputMaxLength: 11,
    selectedAmount: "",
    headerCenterText: "",
    headerData: {},
};

export default React.memo(AmountInputScreenTemplate);
