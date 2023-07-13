import React, { useEffect } from "react";
import { StyleSheet, View, ScrollView, Platform } from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { useSelector, useDispatch } from "react-redux";

import { getAnalyticScreenName } from "@screens/Premier/helpers/premierHelpers";

import { PREMIER_SELECT_FPX_BANK, PREMIER_ACTIVATE_ACCOUNT } from "@navigation/navigationConstant";

import HeaderLayout from "@layouts/HeaderLayout";
import ScreenLayout from "@layouts/ScreenLayout";

import ActionButton from "@components/Buttons/ActionButton";
import HeaderCloseButton from "@components/Buttons/HeaderCloseButton";
import ScreenContainer from "@components/Containers/ScreenContainer";
import FixedActionContainer from "@components/Footers/FixedActionContainer";
import SpaceFiller from "@components/Placeholders/SpaceFiller";
import Typo from "@components/Text";

import { fetchBankList } from "@redux/services/Premier/apiGetBankList";

import { DISABLED, YELLOW } from "@constants/colors";
import {
    PREMIER_CLEAR_ALL,
    PMA_NTB_USER,
    PM1_NTB_USER,
    KAWANKU_SAVINGS_NTB_USER,
    KAWANKU_SAVINGSI_NTB_USER,
} from "@constants/premierConfiguration";
import {
    CONTINUE,
    NOTE_ZEST,
    ZEST_CASA_ACTIVATE_ACCOUNT_TITLE,
    ZEST_CASA_ACTIVATION_CHOICE_DESCRIPTION,
    ZEST_CASA_ACTIVATE_ACCOUNT_NOTE,
    ZEST_CASA_ACTIVATE_ACCOUNT_NOTE_CONTINUED,
} from "@constants/strings";

import { entryPropTypes } from "./PM1IntroScreen";

const PremierActivateAccount = (props) => {
    const { navigation } = props;

    // Hooks to access reducer data
    const masterDataReducer = useSelector((state) => state.masterDataReducer);
    const prePostQualReducer = useSelector((state) => state.prePostQualReducer);
    const getBankListReducer = useSelector((state) => state.getBankListReducer);
    const entryReducer = useSelector((state) => state.zestCasaReducer.entryReducer);
    const draftUserAccountInquiryReducer = useSelector(
        (state) => state.draftUserAccountInquiryReducer
    );
    const accountActivationAmount = masterDataReducer?.pmaActivationAmountNTB;
    const kawankuamoutActivateAmount = masterDataReducer?.kawanKuActivationAmountNTB; 
    const { userStatus } = prePostQualReducer;

    // Hooks to dispatch reducer action
    const dispatch = useDispatch();

    useEffect(() => {
        init();
    }, []);

    const init = () => {
        console.log("[PremierActivateAccount] >> [init]");
        callGetBankListService();
    };

    function callGetBankListService() {
        console.log("[PremierActivateAccount] >> [callGetBankListService]");
        const body = {
            acctNo:
                userStatus === PMA_NTB_USER ||
                userStatus === PM1_NTB_USER ||
                userStatus === KAWANKU_SAVINGS_NTB_USER ||
                userStatus === KAWANKU_SAVINGSI_NTB_USER
                    ? prePostQualReducer.acctNo
                    : draftUserAccountInquiryReducer.acctNo,
        };

        dispatch(fetchBankList(body, (result) => {}));
    }

    function onCloseTap() {
        console.log("[PremierActivateAccount] >> [onCloseTap]");
        dispatch({ type: PREMIER_CLEAR_ALL });
        navigation.navigate("Dashboard");
    }

    function onNextTap() {
        console.log("[PremierActivateAccount] >> [onNextTap]");
        if (getBankListReducer.status === "success") {
            navigation.navigate("PremierModuleStack", {
                screen: PREMIER_SELECT_FPX_BANK,
            });
        }
    }

    function productActivateAmount() {
        if (entryReducer.isPM1 || entryReducer.isPMA) {
            return accountActivationAmount;
        } else if (entryReducer.isKawanku || entryReducer.isKawankuSavingsI) {
            return kawankuamoutActivateAmount;
        }
    }

    /*const analyticScreenName = prePostQualReducer.isPMA
        ? APPLY_ACTIVATED_ZESTI_TRANSFER_TO_ACTIVATES
        : APPLY_ACTIVATED_M2U_PREMIER_TRANSFER_TO_ACTIVATES;*/

    const analyticScreenName = getAnalyticScreenName(entryReducer, PREMIER_ACTIVATE_ACCOUNT, "");

    return (
        <ScreenContainer backgroundType="color" analyticScreenName={analyticScreenName}>
            <ScreenLayout
                header={
                    <HeaderLayout headerRightElement={<HeaderCloseButton onPress={onCloseTap} />} />
                }
                paddingHorizontal={0}
                paddingBottom={0}
                paddingTop={0}
                useSafeArea
            >
                <ScrollView showsVerticalScrollIndicator={false}>
                    <KeyboardAwareScrollView
                        behavior={Platform.OS === "ios" ? "padding" : ""}
                        enabled
                    >
                        <View style={Style.formContainer}>
                            <View style={Style.contentContainer}>
                                <Typo
                                    fontSize={14}
                                    fontWeight="400"
                                    lineHeight={21}
                                    textAlign="left"
                                    text={ZEST_CASA_ACTIVATE_ACCOUNT_TITLE}
                                />
                                <SpaceFiller height={4} />
                                <Typo
                                    fontSize={16}
                                    fontWeight="600"
                                    lineHeight={22}
                                    textAlign="left"
                                    text={ZEST_CASA_ACTIVATION_CHOICE_DESCRIPTION(
                                        productActivateAmount()
                                    )}
                                />
                                <SpaceFiller height={24} />
                                <Typo
                                    fontSize={14}
                                    fontWeight="500"
                                    lineHeight={22}
                                    textAlign="left"
                                >
                                    {NOTE_ZEST}
                                    <Typo
                                        fontSize={14}
                                        fontWeight="400"
                                        lineHeight={22}
                                        textAlign="left"
                                        text={ZEST_CASA_ACTIVATE_ACCOUNT_NOTE}
                                    />
                                </Typo>
                                <SpaceFiller height={16} />
                                <Typo
                                    fontSize={14}
                                    fontWeight="400"
                                    lineHeight={22}
                                    textAlign="left"
                                    text={ZEST_CASA_ACTIVATE_ACCOUNT_NOTE_CONTINUED}
                                />
                                <SpaceFiller height={16} />
                            </View>
                        </View>
                    </KeyboardAwareScrollView>
                </ScrollView>

                <FixedActionContainer>
                    <View style={Style.bottomBtnContCls}>
                        <ActionButton
                            fullWidth
                            activeOpacity={getBankListReducer.status === "success" ? 1 : 0.5}
                            backgroundColor={
                                getBankListReducer.status === "success" ? YELLOW : DISABLED
                            }
                            componentCenter={
                                <Typo
                                    fontSize={14}
                                    lineHeight={18}
                                    fontWeight="600"
                                    text={CONTINUE}
                                />
                            }
                            onPress={onNextTap}
                        />
                    </View>
                </FixedActionContainer>
            </ScreenLayout>
        </ScreenContainer>
    );
};

export const activateAccountPropTypes = (PremierActivateAccount.propTypes = {
    ...entryPropTypes,
});

const Style = StyleSheet.create({
    bottomBtnContCls: {
        flexDirection: "row",
        justifyContent: "space-around",
        width: "100%",
    },

    contentContainer: {
        marginHorizontal: 24,
    },

    formContainer: {
        marginBottom: 40,
    },
});

export default PremierActivateAccount;
