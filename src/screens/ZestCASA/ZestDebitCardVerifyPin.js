import PropTypes from "prop-types";
import React from "react";
import { View, StyleSheet } from "react-native";
import { useDispatch, useSelector } from "react-redux";

import { ZEST_CASA_OTP_VERIFICATION, ZEST_CASA_DEBIT_CARD_RE_ENTER_PIN, ZEST_CASA_STACK } from "@navigation/navigationConstant";

import HeaderLayout from "@layouts/HeaderLayout";
import ScreenLayout from "@layouts/ScreenLayout";

import HeaderBackButton from "@components/Buttons/HeaderBackButton";
import ScreenContainer from "@components/Containers/ScreenContainer";
import NumericalKeyboard from "@components/NumericalKeyboard";
import OtpPin from "@components/OtpPin";
import Typography from "@components/Text";
import { showErrorToast } from "@components/Toast";

import { DEBIT_CARD_RE_ENTER_PIN } from "@redux/actions/ZestCASA/debitCardPinAction";

import { FADE_GREY, MEDIUM_GREY } from "@constants/colors";
import {
    ZEST_CREATE_CARD_PIN,
    ZEST_ENETR_RE_ENTER_PIN_NOT_MATCH,
    ZEST_ENTER_6_DIGIT_PIN_DESCRITPION,
    ZEST_RE_ENTER_6_DIGIT_PIN,
} from "@constants/strings";
import { S2U_PULL } from "@constants/data";
import { FN_FUND_TRANSFER_ACTIVATE_DEBIT_CARD } from "@constants/premierFundConstant";
import {
    fetchChipMasterData,
    get_pinBlockEncrypt,
} from "@screens/MAE/CardManagement/CardManagementController";
import { activateDebitCardBody } from "@redux/utilities/actionUtilities";
import { checkS2UStatus } from "../Premier/helpers/premierHelpers";

function ZestDebitCardVerifyPin({ navigation }) {
    const { route } = navigation;
    const params = route?.params ?? {};
    const debitCardPinReducer = useSelector((state) => state.zestCasaReducer.debitCardPinReducer);
    const { enterPin, reEnterPin } = debitCardPinReducer;
    const debitCardInquiryReducer = useSelector((state) => state.debitCardInquiryReducer);
    const prePostQualReducer = useSelector((state) => state.prePostQualReducer);
    // Hooks to dispatch reducer action
    const dispatch = useDispatch();

    function handleBack() {
        navigation.canGoBack() && navigation.goBack();
    }

    function handleKeyboardChange(text) {
        dispatch({ type: DEBIT_CARD_RE_ENTER_PIN, reEnterPin: text });
    }

    async function handleKeyboardDone() {
        if (reEnterPin && reEnterPin.length == 6) {
            if (enterPin === reEnterPin) {
                //navigation.navigate(ZEST_CASA_OTP_VERIFICATION);
                const chipMasterData = await fetchChipMasterData(debitCardInquiryReducer?.debitCardNumber);
                const hsmTpk = chipMasterData?.hsmTpk ?? "";
                const pinBlock = await get_pinBlockEncrypt(
                    debitCardPinReducer?.enterPin,
                    debitCardInquiryReducer?.debitCardNumber,
                    hsmTpk,
                    chipMasterData
                );
                initiateS2USdk(hsmTpk, pinBlock);
            } else {
                showErrorToast({
                    message: ZEST_ENETR_RE_ENTER_PIN_NOT_MATCH,
                });
            }
        }
    }
    function initiateS2USdk(hsmTpk, pinBlock) {
        const activateDebitCardData = activateDebitCardBody(
            "",
            debitCardInquiryReducer?.debitCardNumber,
            pinBlock,
            hsmTpk,
            debitCardPinReducer?.debitCardLast8Digit
        );

        const s2uBody = {
            Msg: {
                MsgBody: activateDebitCardData,
            },
            cardName: debitCardInquiryReducer?.debitCardName,
            debitCardFee: debitCardInquiryReducer?.msgBody?.debitCardFee,
            idNo: prePostQualReducer.idNo,
        };

        const extraData = {
            fundConstant: FN_FUND_TRANSFER_ACTIVATE_DEBIT_CARD,
            stack: ZEST_CASA_STACK,
            screen: ZEST_CASA_DEBIT_CARD_RE_ENTER_PIN
        };
            
        checkS2UStatus(navigation.navigate, params, (type, mapperData, timeStamp) => {     
            if (type === S2U_PULL) {
                navigation.navigate(ZEST_CASA_STACK, {
                    screen: ZEST_CASA_OTP_VERIFICATION,
                    params: { s2u: true, mapperData, timeStamp }
                });
            } else {
                navigation.navigate(ZEST_CASA_STACK, {
                    screen: ZEST_CASA_OTP_VERIFICATION,
                    params: { s2u: false }
                });
            }
        }, extraData, s2uBody);
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
                                text={ZEST_RE_ENTER_6_DIGIT_PIN}
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
                                <OtpPin pin={reEnterPin} space="15%" ver={8} hor={8} border={5} />
                            </View>
                        </View>
                    </View>
                </ScreenLayout>

                <NumericalKeyboard
                    value={reEnterPin}
                    onChangeText={handleKeyboardChange}
                    maxLength={6}
                    onDone={handleKeyboardDone}
                />
            </>
        </ScreenContainer>
    );
}

ZestDebitCardVerifyPin.propTypes = {
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

export default ZestDebitCardVerifyPin;
