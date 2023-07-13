import React, { useEffect } from "react";
import { Dimensions, Image, StyleSheet, View } from "react-native";

import { ACCOUNTS_SCREEN, SETTINGS_MODULE } from "@navigation/navigationConstant";

import ScreenLayout from "@layouts/ScreenLayout";

import ActionButton from "@components/Buttons/ActionButton";
import HeaderCloseButton from "@components/Buttons/HeaderCloseButton";
import ScreenContainer from "@components/Containers/ScreenContainer";
import HeaderLayout from "@components/Layouts/HeaderLayout";
import SpaceFiller from "@components/Placeholders/SpaceFiller";
import Typo from "@components/Text";

import { TRANSPARENT } from "@constants/colors";
import { LNB_TITLE, VISIT_BRANCH_COULD_NOT_PROCEED_APPLICATION } from "@constants/premierStrings";
import { LOCATE_NEAREST_BRANCH } from "@constants/premierUrl";
import {
    GOT_IT,
    NO_ACCOUNT_ACTIVATION,
    WE_ARE_SORRY,
    ZEST_CASA_NO_ACCOUNT_DESCRIPTION,
} from "@constants/strings";

import Assets from "@assets";

import { entryPropTypes } from "./PM1IntroScreen";

const PremierAccountNotFound = (props) => {
    const { navigation, route } = props;

    const isVisitBranchMode = route?.params?.isVisitBranchMode;
    const windowHeight = Dimensions.get("window").height;
    // Get 10% of entire window's height
    const partialWindowHeight = Math.round(windowHeight * 0.1);

    useEffect(() => {
        init();
    }, []);

    const init = async () => {
        console.log("[PremierccountNotFound] >> [init]");
    };

    function onCloseTap() {
        console.log("[PremierAccountNotFound] >> [onBackTap]");
        navigation.navigate("More", {
            screen: ACCOUNTS_SCREEN,
        });
    }

    function onGotItButtonDidTap() {
        console.log("[PremierAccountNotFound] >> [onGotItButtonDidTap]");
        navigation.navigate("More", {
            screen: ACCOUNTS_SCREEN,
        });
    }

    function onBookAppointmentButtonDidTap() {
        console.log("[PremierAccountNotFound] >> [onBookAppointmentButtonDidTap]");

        const title = LNB_TITLE;
        const url = `${LOCATE_NEAREST_BRANCH}`;

        const props = {
            title,
            source: url,
            headerColor: TRANSPARENT,
        };

        navigation.navigate(SETTINGS_MODULE, {
            screen: "PdfSetting",
            params: props,
        });
    }

    return (
        <ScreenContainer backgroundType="color" analyticScreenName="Zest_CASA_Account_Not_Found">
            <ScreenLayout
                header={
                    <HeaderLayout headerRightElement={<HeaderCloseButton onPress={onCloseTap} />} />
                }
                paddingHorizontal={0}
                paddingBottom={0}
                paddingTop={0}
                useSafeArea
            >
                <View style={Style.contentAlignment}>
                    <SpaceFiller height={partialWindowHeight} />
                    <Typo
                        fontSize={18}
                        fontWeight="600"
                        lineHeight={24}
                        textAlign="left"
                        text={isVisitBranchMode ? WE_ARE_SORRY : NO_ACCOUNT_ACTIVATION}
                    />
                    <SpaceFiller height={8} />
                    <Typo
                        fontSize={12}
                        fontWeight="400"
                        lineHeight={16}
                        textAlign="center"
                        text={
                            isVisitBranchMode
                                ? VISIT_BRANCH_COULD_NOT_PROCEED_APPLICATION
                                : ZEST_CASA_NO_ACCOUNT_DESCRIPTION
                        }
                    />
                    <SpaceFiller height={16} />
                    <ActionButton
                        height={40}
                        width={isVisitBranchMode ? 190 : 155}
                        componentCenter={
                            <Typo
                                fontSize={14}
                                lineHeight={18}
                                fontWeight="600"
                                text={isVisitBranchMode ? LNB_TITLE : GOT_IT}
                            />
                        }
                        onPress={
                            isVisitBranchMode ? onBookAppointmentButtonDidTap : onGotItButtonDidTap
                        }
                    />
                </View>
                <Image
                    source={Assets.zestNoAccountFoundFooter}
                    style={Style.bannerImage}
                    resizeMode="stretch"
                />
            </ScreenLayout>
        </ScreenContainer>
    );
};

export const accountNotFoundPropTypes = (PremierAccountNotFound.propTypes = {
    ...entryPropTypes,
});

const Style = StyleSheet.create({
    bannerImage: {
        bottom: 0,
        position: "absolute",
        width: "100%",
    },

    contentAlignment: {
        alignItems: "center",
        marginHorizontal: 16,
    },
});

export default PremierAccountNotFound;
