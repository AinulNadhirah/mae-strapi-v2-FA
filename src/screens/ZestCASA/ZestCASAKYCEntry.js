import { HeaderBackButton } from "@react-navigation/stack";
import React, { useEffect } from "react";
import { Image, StyleSheet, View, ScrollView, Platform } from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";

import HeaderLayout from "@layouts/HeaderLayout";
import ScreenLayout from "@layouts/ScreenLayout";

import ActionButton from "@components/Buttons/ActionButton";
import HeaderCloseButton from "@components/Buttons/HeaderCloseButton";
import ScreenContainer from "@components/Containers/ScreenContainer";
import FixedActionContainer from "@components/Footers/FixedActionContainer";
import SpaceFiller from "@components/Placeholders/SpaceFiller";
import Typo from "@components/Text";

import { BLACK } from "@constants/colors";
import {
    ZEST_CASA_KYC_ENTRY_DESCRIPTION,
    FIND_PLACE_LIGHTING,
    ENSURE_MYKAD_READABLE,
    ENSURE_FACE_FITS_FRAME,
    CONTINUE,
} from "@constants/strings";

import Assets from "@assets";

import { entryPropTypes } from "./ZestCASAEntry";

const ZestCASAKYCEntry = (props) => {
    const { navigation } = props;
    const firstName = "User";

    useEffect(() => {
        init();
    }, []);

    const init = async () => {
        console.log("[ZestCASAKYCEntry] >> [init]");
    };

    function onBackTap() {
        console.log("[ZestCASAKYCEntry] >> [onBackTap]");
        navigation.goBack();
    }

    function onCloseTap() {
        console.log("[ZestCASAKYCEntry] >> [onCloseTap]");
        navigation.popToTop();
        navigation.goBack();
    }

    function onNextTap() {
        console.log("[ZestCASAKYCEntry] >> [onNextTap]");
    }

    return (
        <React.Fragment>
            <ScreenContainer backgroundType="color" analyticScreenName="Zest_CASA_KYC_Entry">
                <ScreenLayout
                    header={
                        <HeaderLayout
                            headerLeftElement={<HeaderBackButton onPress={onBackTap} />}
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
                                            resizeMode={"contain"}
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
                                            text={`Hi ${firstName}`}
                                        />
                                        <SpaceFiller height={4} />
                                        <Typo
                                            fontSize={16}
                                            fontWeight="600"
                                            lineHeight={22}
                                            textAlign="left"
                                            text={ZEST_CASA_KYC_ENTRY_DESCRIPTION}
                                        />
                                        <SpaceFiller height={24} />
                                        <View style={Style.pealHourRow}>
                                            <View style={Style.bulletDot} />
                                            <View style={Style.listItemRow}>
                                                <Typo
                                                    fontSize={14}
                                                    fontWeight="400"
                                                    lineHeight={22}
                                                    textAlign="left"
                                                    color={BLACK}
                                                    text={FIND_PLACE_LIGHTING}
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
                                                    text={ENSURE_MYKAD_READABLE}
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
                                                    text={ENSURE_FACE_FITS_FRAME}
                                                />
                                            </View>
                                        </View>
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

export const kycEntryPropTypes = (ZestCASAKYCEntry.propTypes = {
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

export default ZestCASAKYCEntry;
