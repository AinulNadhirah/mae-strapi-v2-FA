/* eslint-disable react/jsx-no-bind */
import PropTypes from "prop-types";
import React, { useEffect } from "react";
import { View, StyleSheet, Dimensions, ScrollView } from "react-native";
import * as Animatable from "react-native-animatable";
import Share from "react-native-share";

import { PROPERTY_DETAILS } from "@navigation/navigationConstant";

import ScreenLayout from "@layouts/ScreenLayout";

import ActionButton from "@components/Buttons/ActionButton";
import ScreenContainer from "@components/Containers/ScreenContainer";
import Typo from "@components/Text";

import { MEDIUM_GREY, WHITE, GREY, YELLOW } from "@constants/colors";
import {
    ADDJA_INVITE_TO_DOWNLOAD,
    CANCEL,
    DO_NOT_HAVE_MAE_APP,
    HER,
    HIS,
    INVITE_REQUEST_TEXT,
} from "@constants/strings";

import Assets from "@assets";

import { getExistingData } from "../Common/PropertyController";

const screenHeight = Dimensions.get("window").height;
const imageHeight = Math.max((screenHeight * 40) / 100, 350);

const imgAnimFadeInUp = {
    0: {
        opacity: 0,
        translateY: 40,
    },
    1: {
        opacity: 1,
        translateY: 0,
    },
};

function CEAddJANTB({ route, navigation }) {
    useEffect(() => {
        init();
    }, []);

    function init() {
        console.log("[CEAddJANTB] >> [init]");
    }

    const onCancelPress = async () => {
        console.log("[CEAddJANTB] >> [onCancelPress]");
        navigation.canGoBack() && navigation.goBack();
    };

    const onInviteJAPress = async () => {
        console.log("[CEAddJANTB] >> [onInviteJAPress]");
        const navParams = route?.params ?? {};
        const masterData = navParams?.masterData ?? {};
        const mdmData = navParams?.mdmData ?? {};
        const savedData = navParams?.savedData ?? {};
        const mdmTitle = savedData?.title ?? mdmData?.title;
        const mdmGender = savedData?.gender ?? mdmData?.gender;
        const gender = mdmGender === "F" ? HER : HIS;

        const titleSelect = getExistingData(mdmTitle, masterData?.title);
        const titleName = titleSelect.name.includes("/")
            ? titleSelect.name.substring(0, titleSelect.name.indexOf("/") - 0)
            : titleSelect.name;

        const mainApplicantName = route.params?.mdmData?.customerName;
        const deepLinkUrl = route.params?.deepLinkUrl;
        const propertyName =
            route.params?.propertyDetails?.property_name ?? route?.params?.propertyName;
        const propertyId = route.params?.propertyDetails?.property_id;
        if (!deepLinkUrl) return;

        const shareMsg = `${titleName} ${mainApplicantName} has invited you to be a joint applicant for ${gender} mortgage application at ${propertyName} Please install MAE from App Store to proceed the loan application.`;
        const message = `${shareMsg}\n${deepLinkUrl}`;

        navigation.push(PROPERTY_DETAILS, {
            propertyId,
        });

        // Open native share window
        Share.open({
            message,
            subject: shareMsg,
        })
            .then(() => {
                console.log("[CEAddJANTB][onInviteJAPress] >> Link shared successfully.");
            })
            .catch((error) => {
                console.log("[CEAddJANTB][onInviteJAPress] >> Exception: ", error);
            });
    };

    return (
        <>
            <ScreenContainer
                backgroundType="color"
                backgroundColor={MEDIUM_GREY}
                analyticScreenName={ADDJA_INVITE_TO_DOWNLOAD}
            >
                <ScreenLayout
                    paddingBottom={0}
                    paddingTop={0}
                    paddingHorizontal={0}
                    header={<View />}
                    useSafeArea
                    neverForceInset={["top"]}
                >
                    <ScrollView showsVerticalScrollIndicator={false}>
                        {/* Top Image Component */}
                        <View style={styles.imageContainer(imageHeight)}>
                            <Animatable.Image
                                animation={imgAnimFadeInUp}
                                delay={500}
                                duration={500}
                                source={Assets.eligibilitySoftFail}
                                style={styles.imageCls}
                                resizeMode="cover"
                                useNativeDriver
                            />
                        </View>

                        <View style={styles.wrapper}>
                            {/* Header Text */}
                            <Typo
                                fontSize={16}
                                fontWeight="600"
                                lineHeight={20}
                                text={DO_NOT_HAVE_MAE_APP}
                                textAlign="left"
                            />

                            {/* Sub Header Text */}

                            <Typo
                                lineHeight={22}
                                textAlign="left"
                                style={styles.subText1}
                                text={INVITE_REQUEST_TEXT}
                            />
                        </View>

                        {/* Bottom button container */}
                        <View style={styles.bottomContainerCls}>
                            {/* Cancel button */}
                            <ActionButton
                                fullWidth
                                backgroundColor={WHITE}
                                borderStyle="solid"
                                borderWidth={1}
                                borderColor={GREY}
                                componentCenter={
                                    <Typo
                                        fontSize={14}
                                        fontWeight="600"
                                        lineHeight={18}
                                        text={CANCEL}
                                    />
                                }
                                onPress={onCancelPress}
                                style={styles.gotoApplicationBtn}
                            />

                            {/* Send A Reminder button */}
                            <ActionButton
                                fullWidth
                                backgroundColor={YELLOW}
                                componentCenter={
                                    <Typo
                                        fontSize={14}
                                        fontWeight="600"
                                        lineHeight={18}
                                        text="Invite Joint Applicant"
                                    />
                                }
                                onPress={onInviteJAPress}
                            />
                        </View>
                    </ScrollView>
                </ScreenLayout>
            </ScreenContainer>
        </>
    );
}

CEAddJANTB.propTypes = {
    route: PropTypes.object,
    navigation: PropTypes.object,
};

const styles = StyleSheet.create({
    bottomContainerCls: {
        flexDirection: "column",
        marginBottom: 36,
        marginHorizontal: 24,
        marginTop: 46,
    },

    gotoApplicationBtn: {
        marginBottom: 16,
    },

    imageCls: {
        height: "100%",
        width: "100%",
    },

    imageContainer: (imageHeight) => ({
        alignItems: "center",
        height: imageHeight,
    }),

    subText1: {
        marginTop: 10,
    },

    viewOtherBtn: {
        marginBottom: 16,
    },

    wrapper: {
        marginHorizontal: 36,
        marginVertical: 30,
    },
});

export default CEAddJANTB;
