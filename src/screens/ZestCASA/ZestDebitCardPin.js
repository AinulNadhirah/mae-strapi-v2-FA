import PropTypes from "prop-types";
import React from "react";
import { View, StyleSheet } from "react-native";
import { useDispatch, useSelector } from "react-redux";

import { ZEST_CASA_DEBIT_CARD_RE_ENTER_PIN } from "@navigation/navigationConstant";

import HeaderLayout from "@layouts/HeaderLayout";
import ScreenLayout from "@layouts/ScreenLayout";

import HeaderBackButton from "@components/Buttons/HeaderBackButton";
import ScreenContainer from "@components/Containers/ScreenContainer";
import NumericalKeyboard from "@components/NumericalKeyboard";
import OtpPin from "@components/OtpPin";
import Typography from "@components/Text";

import { DEBIT_CARD_ENTER_PIN } from "@redux/actions/ZestCASA/debitCardPinAction";
import { PREPOSTQUAL_UPDATE_USER_STATUS } from "@redux/actions/services/prePostQualAction";

import { FADE_GREY, MEDIUM_GREY } from "@constants/colors";
import {
    ZEST_CREATE_CARD_PIN,
    ZEST_ENTER_6_DIGIT_PIN,
    ZEST_ENTER_6_DIGIT_PIN_DESCRITPION
} from "@constants/strings";
import { ZEST_DEBIT_CARD_ACTIVATE_ACCOUNT_USER } from "@constants/zestCasaConfiguration";
import {
    PM1_DEBIT_CARD_ACTIVATE_ACCOUNT_USER,
    PMA_DEBIT_CARD_ACTIVATE_ACCOUNT_USER
} from "@constants/premierConfiguration";
function ZestDebitCardPin({ navigation }) {
    const debitCardPinReducer = useSelector((state) => state.zestCasaReducer.debitCardPinReducer);
    const entryReducer = useSelector((state) => state.zestCasaReducer.entryReducer);
    const { enterPin } = debitCardPinReducer;

    // Hooks to dispatch reducer action
    const dispatch = useDispatch();

    function handleBack() {
        navigation.canGoBack() && navigation.goBack();
    }

    function handleKeyboardChange(text) {
        dispatch({ type: DEBIT_CARD_ENTER_PIN, enterPin: text });
    }

    function getUserStatus () {
        if(entryReducer.isPM1){
        return PM1_DEBIT_CARD_ACTIVATE_ACCOUNT_USER
        } else if(entryReducer.isPMA){
            return PMA_DEBIT_CARD_ACTIVATE_ACCOUNT_USER
        } else {
            return ZEST_DEBIT_CARD_ACTIVATE_ACCOUNT_USER
        }
    }
    
    async function handleKeyboardDone () {
        if (enterPin && enterPin.length == 6) {
            dispatch({
                type: PREPOSTQUAL_UPDATE_USER_STATUS,
                userStatus: getUserStatus(),
            });
            navigation.navigate(ZEST_CASA_DEBIT_CARD_RE_ENTER_PIN);
        }
    }

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
                                text={ZEST_CREATE_CARD_PIN}
                                textAlign="left"
                            />
                            <Typography
                                fontSize={20}
                                fontWeight="300"
                                lineHeight={28}
                                style={styles.label}
                                text={ZEST_ENTER_6_DIGIT_PIN}
                                textAlign="left"
                            />
                            <Typography
                                fontSize={12}
                                fontWeight="normal"
                                lineHeight={18}
                                style={styles.label}
                                color={FADE_GREY}
                                text={ZEST_ENTER_6_DIGIT_PIN_DESCRITPION}
                                textAlign="left"
                            />
                            <View style={styles.pinContainer}>
                                <OtpPin pin={enterPin} space="15%" ver={8} hor={8} border={5} />
                            </View>
                        </View>
                    </View>
                </ScreenLayout>

                <NumericalKeyboard
                    value={enterPin}
                    onChangeText={handleKeyboardChange}
                    maxLength={6}
                    onDone={handleKeyboardDone}
                />
            </>
        </ScreenContainer>
    );
}

ZestDebitCardPin.propTypes = {
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
        paddingVertical: 48,
    },
    wrapper: {
        flex: 1,
        flexDirection: "column",
        justifyContent: "space-between",
    },
});

export default ZestDebitCardPin;
