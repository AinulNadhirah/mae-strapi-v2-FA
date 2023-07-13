import PropTypes from "prop-types";
import React, { useEffect, useState } from "react";
import { View, StyleSheet } from "react-native";
import { useDispatch, useSelector } from "react-redux";

import { ZEST_CASA_DEBIT_CARD_ENTER_PIN } from "@navigation/navigationConstant";

import HeaderLayout from "@layouts/HeaderLayout";
import ScreenLayout from "@layouts/ScreenLayout";

import HeaderBackButton from "@components/Buttons/HeaderBackButton";
import ScreenContainer from "@components/Containers/ScreenContainer";
import DebitCardEightDigitNumber from "@components/DebitCardEightDigitNumber";
import NumericalKeyboard from "@components/NumericalKeyboard";
import Typography from "@components/Text";

import { DEBIT_CARD_LAST_8_DIGIT_ENTER } from "@redux/actions/ZestCASA/debitCardPinAction";

import { FADE_GREY, MEDIUM_GREY } from "@constants/colors";
import {
    VERIFY_CARD,
    ZEST_ENTER_LAST_8_DIGIT_CARD_NUMBER,
    ZEST_ENTER_LAST_8_DIGIT_CARD_NUMBER_DESCRITPION,
} from "@constants/strings";

function ZestDebitCardLast8Digit({ navigation }) {
    const debitCardPinReducer = useSelector((state) => state.zestCasaReducer.debitCardPinReducer);
    const { debitCardLast8Digit } = debitCardPinReducer;
    const [debitCardEightDigitInfo, setDebitCardEightDigitInfo] = useState([]);

    // Hooks to dispatch reducer action
    const dispatch = useDispatch();

    function handleBack() {
        navigation.canGoBack() && navigation.goBack();
    }

    function handleKeyboardChange(text) {
        dispatch({ type: DEBIT_CARD_LAST_8_DIGIT_ENTER, debitCardLast8Digit: text });
    }

    async function handleKeyboardDone() {
        if (debitCardLast8Digit && debitCardLast8Digit.length === 8) {
            // const lastEightDebitCardNumber = debitCardInquiryReducer?.debitCardNumber.slice(-8);

            // if (lastEightDebitCardNumber === debitCardLast8Digit) {
            navigation.navigate(ZEST_CASA_DEBIT_CARD_ENTER_PIN);
            // } else {
            //     showErrorToast({
            //         message: ZEST_ENTER_LAST_8_DIGIT_NOT_MATCH,
            //     });
            // }
        }
    }

    useEffect(() => {
        setDebitCardEightDigitInfo([
            {
                space: "0%",
                ver: 8,
                hor: 8,
                border: 5,
            },
            {
                space: "15%",
                ver: 8,
                hor: 8,
                border: 5,
            },
            {
                space: "15%",
                ver: 8,
                hor: 8,
                border: 5,
            },
            {
                space: "15%",
                ver: 8,
                hor: 8,
                border: 5,
            },
            {
                space: "15%",
                ver: 8,
                hor: 8,
                border: 5,
            },
            {
                space: "15%",
                ver: 8,
                hor: 8,
                border: 5,
            },
            {
                space: "15%",
                ver: 8,
                hor: 8,
                border: 5,
            },
            {
                space: "15%",
                ver: 8,
                hor: 8,
                border: 5,
            },
        ]);
    }, []);

    return (
        <ScreenContainer backgroundType="color" backgroundColor={MEDIUM_GREY}>
            <>
                <ScreenLayout
                    paddingBottom={0}
                    paddingTop={16}
                    paddingHorizontal={0}
                    header={
                        <HeaderLayout
                            headerLeftElement={<HeaderBackButton onPress={handleBack} />}
                        />
                    }
                    scrollable
                    useSafeArea
                    neverForceInset={["bottom"]}
                >
                    <View style={styles.wrapper}>
                        <View style={styles.container}>
                            <Typography
                                fontSize={14}
                                fontWeight="600"
                                lineHeight={18}
                                text={VERIFY_CARD}
                                textAlign="left"
                            />
                            <Typography
                                fontSize={20}
                                fontWeight="300"
                                lineHeight={28}
                                style={styles.label}
                                text={ZEST_ENTER_LAST_8_DIGIT_CARD_NUMBER}
                                textAlign="left"
                            />
                            <Typography
                                fontSize={12}
                                fontWeight="normal"
                                lineHeight={18}
                                style={styles.label}
                                color={FADE_GREY}
                                text={ZEST_ENTER_LAST_8_DIGIT_CARD_NUMBER_DESCRITPION}
                                textAlign="left"
                            />
                            <View style={styles.pinContainer}>
                                <DebitCardEightDigitNumber
                                    pin={debitCardLast8Digit}
                                    info={debitCardEightDigitInfo}
                                />
                            </View>
                        </View>
                    </View>
                </ScreenLayout>

                <NumericalKeyboard
                    value={debitCardLast8Digit}
                    onChangeText={handleKeyboardChange}
                    maxLength={8}
                    onDone={handleKeyboardDone}
                />
            </>
        </ScreenContainer>
    );
}

ZestDebitCardLast8Digit.propTypes = {
    navigation: PropTypes.object,
    route: PropTypes.object,
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingHorizontal: 36,
    },
    label: {
        paddingBottom: 4,
        paddingTop: 8,
    },
    pinContainer: {
        alignItems: "center",
        paddingHorizontal: 36,
        paddingVertical: 48,
    },
    wrapper: {
        flex: 1,
        flexDirection: "column",
        justifyContent: "space-between",
    },
});

export default ZestDebitCardLast8Digit;
