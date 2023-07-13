import React from "react";
import { Image, StyleSheet, View, ScrollView, Platform } from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { useDispatch, useSelector } from "react-redux";

import { getAnalyticScreenName } from "@screens/Premier/helpers/premierHelpers";

import {
    APPLY_MAE_SCREEN,
    DASHBOARD,
    MAE_MODULE_STACK,
    PREMIER_ACTIVATION_CHOICE,
} from "@navigation/navigationConstant";

import HeaderLayout from "@layouts/HeaderLayout";
import ScreenLayout from "@layouts/ScreenLayout";

import ActionButton from "@components/Buttons/ActionButton";
import HeaderCloseButton from "@components/Buttons/HeaderCloseButton";
import ScreenContainer from "@components/Containers/ScreenContainer";
import FixedActionContainer from "@components/Footers/FixedActionContainer";
import SpaceFiller from "@components/Placeholders/SpaceFiller";
import Typo from "@components/Text";

import { logEvent } from "@services/analytics";

import { BLACK } from "@constants/colors";
import { PREMIER_CLEAR_ALL } from "@constants/premierConfiguration";
import {
    ZEST_CASA_ACTIVATE_ACCOUNT_TITLE,
    ZEST_CASA_ACTIVATION_CHOICE_REQUIREMENTS,
    ZEST_CASA_ACTIVATION_CHOICE_DESCRIPTION_ACTIVATE,
    ZEST_CASA_MAKE_TRANSFER,
    SCAN_YOUR_MYKAD,
    TAKE_A_SELFIE,
    ACTIVATE_NOW,
    FA_SELECT_ACTION,
    FA_SCREEN_NAME,
    FA_ACTION_NAME,
} from "@constants/strings";

import Assets from "@assets";

import { entryPropTypes } from "./PM1IntroScreen";
import { ACTIVATE_NOW_GA } from "./helpers/AnalyticsEventConstants";

const PremierActivationChoice = (props) => {
    const { navigation, route } = props;
    const { filledUserDetails } = route.params;
    const dispatch = useDispatch();
    const entryReducer = useSelector((state) => state.zestCasaReducer.entryReducer);

    function onCloseTap() {
        console.log("[PremierActivationChoice] >> [onCloseTap]");
        dispatch({ type: PREMIER_CLEAR_ALL });
        navigation.navigate(DASHBOARD);
    }

    function getSceneCode(onBoardDetails2) {
        if (onBoardDetails2?.isPM1) {
            return "PM1";
        } else if (onBoardDetails2?.isPMA) {
            return "PMAI";
        } else if (onBoardDetails2?.isKawanku) {
            return "KAWANKU";
        } else if (onBoardDetails2?.isKawankuSavingsI) {
            return "SAI";
        }
    }
    const analyticScreenName = getAnalyticScreenName(entryReducer, PREMIER_ACTIVATION_CHOICE, "");

    function onActivateNowButtonDidTap() {
        console.log("[PremierActivationChoice] >> [onActivateNowButtonDidTap]");
        if (filledUserDetails) {
            const {
                onBoardDetails,
                onBoardDetails2,
                entryStack,
                entryScreen,
                entryParams,
                pan,
                accountNumber,
            } = filledUserDetails;
            logEvent(FA_SELECT_ACTION, {
                [FA_SCREEN_NAME]: analyticScreenName,
                [FA_ACTION_NAME]: ACTIVATE_NOW_GA,
            });
            const eKycParams = {
                selectedIDType: onBoardDetails2?.selectedIDType,
                entryStack,
                entryScreen,
                entryParams,
                from: onBoardDetails2?.from,
                idNo: onBoardDetails2?.idNo,
                fullName: onBoardDetails?.fullName,
                pan,
                accountNumber,
                reqType: "E01",
                isNameCheck: false,
                sceneCode: getSceneCode(onBoardDetails2),
                isPM1: entryReducer.isPM1,
                isPMA: entryReducer.isPMA,
                isKawanku: entryReducer?.isKawanku,
                isKawankuSavingsI: entryReducer?.isKawankuSavingsI,
            };
            navigation.navigate(MAE_MODULE_STACK, {
                screen: APPLY_MAE_SCREEN,
                params: { filledUserDetails, eKycParams },
            });
        }
    }

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
                            <View style={Style.applyImageView}>
                                <Image
                                    style={Style.applyImage}
                                    resizeMode="contain"
                                    source={Assets.MAE_Selfie_Intro}
                                />
                            </View>
                            <SpaceFiller height={24} />
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
                                    text={ZEST_CASA_ACTIVATION_CHOICE_DESCRIPTION_ACTIVATE}
                                />
                                <SpaceFiller height={24} />
                                <Typo
                                    fontSize={14}
                                    fontWeight="400"
                                    lineHeight={22}
                                    textAlign="left"
                                    text={ZEST_CASA_ACTIVATION_CHOICE_REQUIREMENTS}
                                />
                                <SpaceFiller height={16} />
                                <View style={Style.pealHourRow}>
                                    <View style={Style.bulletDot} />
                                    <View style={Style.listItemRow}>
                                        <Typo
                                            fontSize={14}
                                            fontWeight="400"
                                            lineHeight={22}
                                            textAlign="left"
                                            color={BLACK}
                                            text={SCAN_YOUR_MYKAD}
                                        />
                                    </View>
                                </View>
                                <SpaceFiller height={16} />
                                <View style={Style.pealHourRow}>
                                    <View style={Style.bulletDot} />
                                    <View style={Style.listItemRow}>
                                        <Typo
                                            fontSize={14}
                                            fontWeight="400"
                                            lineHeight={22}
                                            textAlign="left"
                                            color={BLACK}
                                            text={TAKE_A_SELFIE}
                                        />
                                    </View>
                                </View>
                                <SpaceFiller height={16} />
                                <View style={Style.pealHourRow}>
                                    <View style={Style.bulletDot} />
                                    <View style={Style.listItemRow}>
                                        <Typo
                                            fontSize={14}
                                            fontWeight="400"
                                            lineHeight={22}
                                            textAlign="left"
                                            color={BLACK}
                                            text={ZEST_CASA_MAKE_TRANSFER}
                                        />
                                    </View>
                                </View>
                            </View>
                        </View>
                    </KeyboardAwareScrollView>
                </ScrollView>
                <FixedActionContainer>
                    <View style={Style.bottomBtnContCls}>
                        <View style={Style.buttonContainer}>
                            <ActionButton
                                fullWidth
                                componentCenter={
                                    <Typo
                                        fontSize={14}
                                        lineHeight={18}
                                        fontWeight="600"
                                        text={ACTIVATE_NOW}
                                    />
                                }
                                onPress={onActivateNowButtonDidTap}
                            />
                        </View>
                    </View>
                </FixedActionContainer>
                <SpaceFiller height={10} />
            </ScreenLayout>
        </ScreenContainer>
    );
};

export const activationChoicePropTypes = (PremierActivationChoice.propTypes = {
    ...entryPropTypes,
});

const Style = StyleSheet.create({
    applyImage: {
        height: 64,
        width: 61,
    },

    applyImageView: {
        alignItems: "center",
        marginTop: 36,
        width: "100%",
    },

    bottomBtnContCls: {
        flexDirection: "row",
        justifyContent: "space-around",
        width: "100%",
    },

    bulletDot: {
        backgroundColor: BLACK,
        borderRadius: 8 / 2,
        height: 8,
        marginRight: 8,
        width: 8,
    },

    buttonContainer: {
        flexDirection: "column",
        width: "100%",
    },

    contentContainer: {
        marginHorizontal: 24,
    },

    formContainer: {
        marginBottom: 40,
    },

    listItemRow: {
        alignContent: "flex-start",
        alignItems: "flex-start",
        alignSelf: "flex-start",
        flexDirection: "column",
        justifyContent: "flex-start",
        marginTop: -6,
    },

    pealHourRow: {
        alignContent: "flex-start",
        alignItems: "flex-start",
        flexDirection: "row",
        justifyContent: "flex-start",
        marginTop: 10,
        width: "100%",
    },
});

export default PremierActivationChoice;
