import React, { useEffect } from "react";
import { Image, StyleSheet, View, ScrollView, Platform, TouchableOpacity } from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";

import { SETTINGS_MODULE } from "@navigation/navigationConstant";

import HeaderLayout from "@layouts/HeaderLayout";
import ScreenLayout from "@layouts/ScreenLayout";

import ActionButton from "@components/Buttons/ActionButton";
import HeaderCloseButton from "@components/Buttons/HeaderCloseButton";
import ScreenContainer from "@components/Containers/ScreenContainer";
import FixedActionContainer from "@components/Footers/FixedActionContainer";
import SpaceFiller from "@components/Placeholders/SpaceFiller";
import Typo from "@components/Text";

import { ROYAL_BLUE, TRANSPARENT } from "@constants/colors";
import {
    ACTIVATE_AT_BRANCH,
    ZEST_CASA_MAKE_APPOINTMENT,
    BOOK_APPOINTMENT,
    EZYQ,
    LATER,
} from "@constants/strings";
import { EZYQ_URL } from "@constants/url";

import Assets from "@assets";

import { entryPropTypes } from "./ZestCASAEntry";

const ZestCASABranchActivation = (props) => {
    const { navigation, route } = props;
    var { onMaybeLaterButtonDidTap } = route?.params;

    useEffect(() => {
        init();
    }, []);

    const init = async () => {
        console.log("[ZestCASABranchActivation] >> [init]");
    };

    function onCloseTap() {
        console.log("[ZestCASABranchActivation] >> [onCloseTap]");
        navigation.popToTop();
        navigation.goBack();
    }

    function onBookAppointmentButtonDidTap() {
        console.log("[ZestCASABranchActivation] >> [onBookAppointmentButtonDidTap]");
        const title = EZYQ;
        const url = `${EZYQ_URL}?serviceNum=2`;

        const props = {
            title: title,
            source: url,
            headerColor: TRANSPARENT,
        };

        navigation.navigate(SETTINGS_MODULE, {
            screen: "PdfSetting",
            params: props,
        });
    }

    return (
        <ScreenContainer backgroundType="color" analyticScreenName="Zest_CASA_Branch_Activation">
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
                                    source={Assets.iconBlackCalendarWithTick}
                                />
                            </View>
                            <SpaceFiller height={24} />
                            <View style={Style.contentContainer}>
                                <Typo
                                    fontSize={14}
                                    fontWeight="400"
                                    lineHeight={21}
                                    textAlign="left"
                                    text={ACTIVATE_AT_BRANCH}
                                />
                                <SpaceFiller height={4} />
                                <Typo
                                    fontSize={16}
                                    fontWeight="600"
                                    lineHeight={22}
                                    textAlign="left"
                                    text={ZEST_CASA_MAKE_APPOINTMENT}
                                />
                                <SpaceFiller height={24} />
                            </View>
                        </View>
                    </KeyboardAwareScrollView>
                </ScrollView>

                <FixedActionContainer>
                    <View style={Style.bottomBtnContCls}>
                        <ActionButton
                            fullWidth
                            componentCenter={
                                <Typo
                                    fontSize={14}
                                    lineHeight={18}
                                    fontWeight="600"
                                    text={BOOK_APPOINTMENT}
                                />
                            }
                            onPress={onBookAppointmentButtonDidTap}
                        />

                        <TouchableOpacity onPress={onMaybeLaterButtonDidTap}>
                            <Typo
                                fontSize={14}
                                fontWeight="600"
                                lineHeight={18}
                                textAlign="left"
                                color={ROYAL_BLUE}
                                text={LATER}
                                style={Style.laterText}
                            />
                        </TouchableOpacity>
                    </View>
                </FixedActionContainer>
            </ScreenLayout>
        </ScreenContainer>
    );
};

export const branchActivationPropTypes = (ZestCASABranchActivation.propTypes = {
    ...entryPropTypes,
});

const Style = StyleSheet.create({
    applyImage: {
        height: 64,
        width: 64,
    },
    applyImageView: {
        alignItems: "center",
        marginTop: 36,
        width: "100%",
    },

    bottomBtnContCls: {
        alignItems: "center",
        flexDirection: "column",
        width: "100%",
    },

    contentContainer: {
        marginHorizontal: 24,
    },

    formContainer: {
        marginBottom: 40,
    },

    laterText: {
        paddingVertical: 24,
    },
});

export default ZestCASABranchActivation;
