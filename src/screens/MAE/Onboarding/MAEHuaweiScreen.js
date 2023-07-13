import React from "react";
import { StyleSheet, View, Dimensions, Image } from "react-native";

import { SETTINGS_MODULE } from "@navigation/navigationConstant";

import HeaderLayout from "@layouts/HeaderLayout";
import ScreenLayout from "@layouts/ScreenLayout";

import ActionButton from "@components/Buttons/ActionButton";
import HeaderBackButton from "@components/Buttons/HeaderBackButton";
import ScreenContainer from "@components/Containers/ScreenContainer";
import Typo from "@components/Text";

import { DARK_GREY, TRANSPARENT } from "@constants/colors";
import {
    H_APPLY,
    HM_TITLE,
    HM_DESC,
    HM_APPLY,
    HM_ALTER,
    HM_IA_TITLE,
    HC_TITLE,
    HC_DESC,
    HC_DISCOVER,
    HC_ALTER,
} from "@constants/strings";
import { PREMIER_NTB_URL, CARDS_URL } from "@constants/url";

import Assets from "@assets";

function MAEHuaweiScreen({ route, navigation }) {
    const forScreen = route?.params?.for;
    function onBackTap() {
        console.log("[MAEHuaweiScreen] >> [onBackTap]");
        navigation.goBack();
    }

    function onApplyPressed() {
        console.log("[MAEHuaweiScreen] >> [onApplyPressed]");
        const props = {
            title: forScreen === "HAM" ? HM_IA_TITLE : H_APPLY,
            source: forScreen === "HAM" ? PREMIER_NTB_URL : CARDS_URL,
            headerColor: TRANSPARENT,
        };

        navigation.navigate(SETTINGS_MODULE, {
            screen: "PdfSetting",
            params: props,
        });
    }

    return (
        <React.Fragment>
            <ScreenContainer backgroundType="color" analyticScreenName="Apply_ASB">
                <ScreenLayout
                    header={
                        <HeaderLayout
                            headerLeftElement={<HeaderBackButton onPress={onBackTap} />}
                            headerCenterElement={
                                <Typo
                                    fontSize={16}
                                    fontWeight="600"
                                    lineHeight={19}
                                    text={H_APPLY}
                                />
                            }
                        />
                    }
                    paddingHorizontal={0}
                    paddingBottom={0}
                    paddingTop={0}
                    useSafeArea
                >
                    <View style={Style.emptyStateContainer}>
                        <View style={Style.emptyStateActionArea}>
                            <Typo
                                text={forScreen == "HAM" ? HM_TITLE : HC_TITLE}
                                fontSize={18}
                                lineHeight={32}
                                fontWeight="bold"
                            />
                            <View style={Style.emptyStateDescriptionContainer}>
                                <Typo
                                    text={forScreen == "HAM" ? HM_DESC : HC_DESC}
                                    fontSize={12}
                                    lineHeight={18}
                                />
                            </View>
                            <ActionButton
                                width={219}
                                height={40}
                                componentCenter={
                                    <Typo
                                        text={forScreen == "HAM" ? HM_APPLY : HC_DISCOVER}
                                        fontSize={14}
                                        lineHeight={18}
                                        fontWeight="600"
                                    />
                                }
                                onPress={onApplyPressed}
                            />
                            <View style={Style.emptyStateDescriptionContainer}>
                                <Typo
                                    text={forScreen == "HAM" ? HM_ALTER : HC_ALTER}
                                    fontSize={12}
                                    lineHeight={18}
                                    fontWeight="400"
                                    color={DARK_GREY}
                                />
                            </View>
                        </View>
                        <View style={Style.emptyStateIllustrationImageContainer}>
                            <Image
                                source={
                                    forScreen == "HAM"
                                        ? Assets.apply_mae_m2upremier
                                        : Assets.apply_cards
                                }
                                style={Style.emptyStateIllustrationImage}
                            />
                        </View>
                    </View>
                </ScreenLayout>
            </ScreenContainer>
        </React.Fragment>
    );
}

const Style = StyleSheet.create({
    emptyStateContainer: {
        // alignItems: "center",
        flex: 1,
        // justifyContent: "space-between",
        paddingTop: 36,
    },

    emptyStateActionArea: {
        alignItems: "center",
        justifyContent: "center",
        paddingHorizontal: 36,
    },

    emptyStateDescriptionContainer: {
        marginBottom: 20,
        marginTop: 15,
    },

    emptyStateIllustrationImageContainer: {
        bottom: 0,
        height: 300,
        position: "absolute",
        width: Dimensions.get("window").width,
        zIndex: 0,
    },

    emptyStateIllustrationImage: {
        height: "100%",
        width: "100%",
        resizeMode: "contain",
    },
});

export default MAEHuaweiScreen;
