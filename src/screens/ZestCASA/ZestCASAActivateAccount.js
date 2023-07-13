import React, { useEffect } from "react";
import { StyleSheet, View, ScrollView, Platform } from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { useSelector, useDispatch } from "react-redux";

import { ZEST_CASA_SELECT_FPX_BANK } from "@navigation/navigationConstant";

import HeaderLayout from "@layouts/HeaderLayout";
import ScreenLayout from "@layouts/ScreenLayout";

import ActionButton from "@components/Buttons/ActionButton";
import HeaderCloseButton from "@components/Buttons/HeaderCloseButton";
import ScreenContainer from "@components/Containers/ScreenContainer";
import FixedActionContainer from "@components/Footers/FixedActionContainer";
import SpaceFiller from "@components/Placeholders/SpaceFiller";
import Typo from "@components/Text";

import { fetchBankList } from "@redux/services/apiGetBankList";

import { DISABLED, YELLOW } from "@constants/colors";
import {
    CONTINUE,
    ZEST_CASA_ACTIVATE_ACCOUNT_TITLE,
    ZEST_CASA_ACTIVATE_ACCOUNT_NOTE,
    ZEST_CASA_ACTIVATE_ACCOUNT_NOTE_CONTINUED,
    ZEST_CASA_ACTIVATION_CHOICE_DESCRIPTION,
    NOTE_ZEST,
} from "@constants/strings";
import { ZEST_CASA_CLEAR_ALL, ZEST_NTB_USER } from "@constants/zestCasaConfiguration";

import { entryPropTypes } from "./ZestCASAEntry";
import {
    APPLY_ACTIVATED_M2U_PREMIER_TRANSFER_TO_ACTIVATES,
    APPLY_ACTIVATED_ZESTI_TRANSFER_TO_ACTIVATES,
} from "./helpers/AnalyticsEventConstants";

const ZestCASAActivateAccount = (props) => {
    const { navigation } = props;

    // Hooks to access reducer data
    const masterDataReducer = useSelector((state) => state.masterDataReducer);
    const prePostQualReducer = useSelector((state) => state.prePostQualReducer);
    const getBankListReducer = useSelector((state) => state.getBankListReducer);
    const draftUserAccountInquiryReducer = useSelector(
        (state) => state.draftUserAccountInquiryReducer
    );

    const zestActivationAmount = masterDataReducer?.zestActivationAmountNTB ?? "10.00";
    const m2uPremierActivationAmount = masterDataReducer?.m2uPremierActivationAmountNTB ?? "10.00";
    const accountActivationAmount = prePostQualReducer.isZestI
        ? zestActivationAmount
        : m2uPremierActivationAmount;
    const { userStatus } = prePostQualReducer;

    // Hooks to dispatch reducer action
    const dispatch = useDispatch();

    useEffect(() => {
        init();
    }, []);

    const init = () => {
        console.log("[ZestCASAActivateAccount] >> [init]");
        callGetBankListService();
    };

    function callGetBankListService() {
        console.log("[ZestCASAActivateAccount] >> [callGetBankListService]");

        const body = {
            acctNo:
                userStatus === ZEST_NTB_USER
                    ? prePostQualReducer.acctNo
                    : draftUserAccountInquiryReducer.acctNo,
        };

        dispatch(
            fetchBankList(body, (result) => {
                console.log(result);
            })
        );
    }

    function onCloseTap() {
        console.log("[ZestCASAActivateAccount] >> [onCloseTap]");
        dispatch({ type: ZEST_CASA_CLEAR_ALL });
        navigation.navigate("Dashboard");
    }

    function onNextTap() {
        console.log("[ZestCASAActivateAccount] >> [onNextTap]");
        if (getBankListReducer.status === "success") {
            navigation.navigate(ZEST_CASA_SELECT_FPX_BANK);
        }
    }

    const analyticScreenName = prePostQualReducer.isZestI
        ? APPLY_ACTIVATED_ZESTI_TRANSFER_TO_ACTIVATES
        : APPLY_ACTIVATED_M2U_PREMIER_TRANSFER_TO_ACTIVATES;

    return (
        <React.Fragment>
            <ScreenContainer backgroundType="color" analyticScreenName={analyticScreenName}>
                <ScreenLayout
                    header={
                        <HeaderLayout
                            headerRightElement={<HeaderCloseButton onPress={onCloseTap} />}
                        />
                    }
                    paddingHorizontal={0}
                    paddingBottom={0}
                    paddingTop={0}
                    useSafeArea
                >
                    <React.Fragment>
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
                                                accountActivationAmount
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
                                    activeOpacity={
                                        getBankListReducer.status === "success" ? 1 : 0.5
                                    }
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
                    </React.Fragment>
                </ScreenLayout>
            </ScreenContainer>
        </React.Fragment>
    );
};

export const activateAccountPropTypes = (ZestCASAActivateAccount.propTypes = {
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

export default ZestCASAActivateAccount;
