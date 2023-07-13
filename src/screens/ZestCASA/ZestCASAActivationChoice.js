import React, { useEffect } from "react";
import { Image, StyleSheet, View, ScrollView, Platform } from "react-native";
import { TouchableOpacity } from "react-native-gesture-handler";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { useDispatch } from "react-redux";

import {
    ZEST_CASA_BRANCH_ACTIVATION,
    APPLY_MAE_SCREEN,
    DASHBOARD,
    MAE_MODULE_STACK,
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

import { fetchAccountList } from "@redux/services/apiGetAccountList";

import { BLACK, ROYAL_BLUE } from "@constants/colors";
import {
    ZEST_CASA_ACTIVATE_ACCOUNT_TITLE,
    ZEST_CASA_ACTIVATION_CHOICE_REQUIREMENTS,
    ZEST_CASA_MAKE_TRANSFER,
    SCAN_YOUR_MYKAD,
    TAKE_A_SELFIE,
    ACTIVATE_NOW,
    ACTIVATE_AT_BRANCH,
    FA_SELECT_ACTION,
    FA_SCREEN_NAME,
    FA_ACTION_NAME,
    ZEST_CASA_ACTIVATION_CHOICE_DESCRIPTION_ACTIVATE,
    ZESTSCENECODE,
    M2UPRSCENECODE,
} from "@constants/strings";
import { ZEST_CASA_CLEAR_ALL } from "@constants/zestCasaConfiguration";

import Assets from "@assets";

import { entryPropTypes } from "./ZestCASAEntry";
import {
    ACTIVATE_AT_BRANCH_GA,
    ACTIVATE_NOW_GA,
    APPLY_ACTIVATED_M2U_PREMIER_START_EKYC,
    APPLY_ACTIVATED_ZESTI_START_EKYC,
} from "./helpers/AnalyticsEventConstants";

const ZestCASAActivationChoice = (props) => {
    const { navigation, route } = props;
    const { filledUserDetails } = route.params;
    const dispatch = useDispatch();

    useEffect(() => {
        init();
    }, []);

    const init = async () => {
        console.log("[ZestCASAActivationChoice] >> [init]");
        dispatch(
            fetchAccountList((result) => {
                console.log("fetchAccountList");
                console.log(result?.accountListings);
            })
        );
    };

    function onCloseTap() {
        console.log("[ZestCASAActivationChoice] >> [onCloseTap]");
        dispatch({ type: ZEST_CASA_CLEAR_ALL });
        navigation.navigate(DASHBOARD);
    }

    function onActivateNowButtonDidTap() {
        console.log("[ZestCASAActivationChoice] >> [onActivateNowButtonDidTap]");
        if (filledUserDetails) {
            logEvent(FA_SELECT_ACTION, {
                [FA_SCREEN_NAME]: filledUserDetails?.onBoardDetails2?.isZestI
                    ? APPLY_ACTIVATED_ZESTI_START_EKYC
                    : APPLY_ACTIVATED_M2U_PREMIER_START_EKYC,
                [FA_ACTION_NAME]: ACTIVATE_NOW_GA,
            });
            const eKycParams = {
                selectedIDType: filledUserDetails?.onBoardDetails2?.selectedIDType,
                entryStack: filledUserDetails?.entryStack,
                entryScreen: filledUserDetails?.entryScreen,
                entryParams: filledUserDetails?.entryParams,
                from: filledUserDetails?.onBoardDetails2?.from,
                idNo: filledUserDetails?.onBoardDetails2?.idNo,
                fullName: filledUserDetails?.onBoardDetails?.fullName,
                pan: filledUserDetails?.pan,
                accountNumber: filledUserDetails?.accountNumber,
                reqType: "E01",
                isNameCheck: false,
                sceneCode: filledUserDetails?.onBoardDetails2?.isZestI
                    ? ZESTSCENECODE
                    : M2UPRSCENECODE,
            };
            navigation.navigate(MAE_MODULE_STACK, {
                screen: APPLY_MAE_SCREEN,
                params: { filledUserDetails, eKycParams },
            });
        }
    }

    function onActivateLaterButtonDidTap() {
        console.log("[ZestCASAActivationChoice] >> [onActivateLaterButtonDidTap]");
        logEvent(FA_SELECT_ACTION, {
            [FA_SCREEN_NAME]: filledUserDetails?.onBoardDetails2?.isZestI
                ? APPLY_ACTIVATED_ZESTI_START_EKYC
                : APPLY_ACTIVATED_M2U_PREMIER_START_EKYC,
            [FA_ACTION_NAME]: ACTIVATE_AT_BRANCH_GA,
        });

        navigation.navigate(ZEST_CASA_BRANCH_ACTIVATION, {
            onMaybeLaterButtonDidTap: () => {
                navigation.popToTop();
                navigation.goBack();
            },
        });
    }

    const analyticScreenName = filledUserDetails?.onBoardDetails2?.isZestI
        ? APPLY_ACTIVATED_ZESTI_START_EKYC
        : APPLY_ACTIVATED_M2U_PREMIER_START_EKYC;

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
                                    <SpaceFiller height={16} />
                                    <TouchableOpacity onPress={onActivateLaterButtonDidTap}>
                                        <Typo
                                            fontSize={14}
                                            fontWeight="600"
                                            lineHeight={18}
                                            textAlign="center"
                                            color={ROYAL_BLUE}
                                            text={ACTIVATE_AT_BRANCH}
                                        />
                                    </TouchableOpacity>
                                </View>
                            </View>
                        </FixedActionContainer>
                        <SpaceFiller height={10} />
                    </React.Fragment>
                </ScreenLayout>
            </ScreenContainer>
        </React.Fragment>
    );
};

export const activationChoicePropTypes = (ZestCASAActivationChoice.propTypes = {
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

export default ZestCASAActivationChoice;
