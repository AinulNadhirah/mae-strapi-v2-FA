/* eslint-disable react/jsx-no-bind */
import PropTypes from "prop-types";
import React, { useEffect, useState } from "react";
import { View, StyleSheet, Dimensions, ScrollView } from "react-native";
import * as Animatable from "react-native-animatable";
import Share from "react-native-share";

import {
    BANKINGV2_MODULE,
    APPLICATION_DETAILS,
    PROPERTY_DASHBOARD,
} from "@navigation/navigationConstant";

import ScreenLayout from "@layouts/ScreenLayout";

import ActionButton from "@components/Buttons/ActionButton";
import ScreenContainer from "@components/Containers/ScreenContainer";
import Typo from "@components/Text";
import { showErrorToast } from "@components/Toast";

import { logEvent } from "@services/analytics";

import { MEDIUM_GREY, WHITE, GREY, YELLOW } from "@constants/colors";
import {
    ADDJA_JOINTAPPLICANT_NOTIFIED,
    COMMON_ERROR_MSG,
    FA_SCREEN_NAME,
    FA_VIEW_SCREEN,
    GO_TO_APPLICATION,
    HER,
    HIS,
    JACEM_PASS_NOTIFY_TO_ACCEPT,
    NOTIFIED_TEXT,
    NOTIFIED_UPDATE,
    SEND_A_REMINDER,
} from "@constants/strings";

import Assets from "@assets";

import { fetchApplicationDetails, fetchGetApplicants } from "../Application/LAController";
import { getEncValue, getExistingData } from "../Common/PropertyController";

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

function CEAddJANotifyResult({ route, navigation }) {
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        init();
    }, []);

    function init() {
        console.log("[CEAddJANotifyResult] >> [init]");
        //set state variables

        logEvent(FA_VIEW_SCREEN, {
            [FA_SCREEN_NAME]: JACEM_PASS_NOTIFY_TO_ACCEPT,
        });
    }

    const onGoToApplicationPress = async () => {
        console.log("[CEAddJANotifyResult] >> [onGoToApplicationPress]");

        //Navigate to Application detail screen
        const navParams = route?.params ?? {};
        const syncId = navParams?.syncId ?? "";
        const stpId = navParams?.stpId ?? null;
        const encSyncId = await getEncValue(syncId);
        let params = {};
        if (syncId) {
            const encSyncId = await getEncValue(syncId);
            params = {
                syncId: encSyncId,
                stpId: "",
            };
        } else {
            const encStpId = await getEncValue(stpId);
            params = {
                syncId: "",
                stpId: encStpId,
            };
        }

        // Call API to fetch Application Details
        const { success, errorMessage, propertyDetails, savedData, cancelReason } =
            await fetchApplicationDetails(params);

        if (!success) {
            // Show error message
            showErrorToast({ message: errorMessage });
            return;
        }

        const responseData = await fetchGetApplicants(encSyncId, false);

        if (!responseData?.success) {
            setLoading(false);
            // Show error message
            showErrorToast({ message: responseData?.errorMessage });
            return;
        }

        const { mainApplicantDetails, jointApplicantDetails, currentUser } = responseData;

        // Navigate to details page
        navigation.push(BANKINGV2_MODULE, {
            screen: APPLICATION_DETAILS,
            params: {
                savedData,
                propertyDetails,
                syncId,
                cancelReason,
                jointApplicantDetails,
                mainApplicantDetails,
                currentUser,
            },
        });
        navigation.reset({
            index: 0,
            routes: [
                {
                    name: PROPERTY_DASHBOARD,
                    params: {
                        activeTabIndex: 1,
                        reload: true,
                    },
                },
            ],
        });
    };

    const onSendReminderPress = async () => {
        console.log("[CEAddJANotifyResult] >> [onSendReminderPress]");
        const navParams = route?.params;
        const masterData = navParams?.masterData;
        const mdmData = navParams?.mdmData;
        const savedData = navParams?.savedData;
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

        if (!deepLinkUrl) {
            // Show error message
            showErrorToast({ message: COMMON_ERROR_MSG });
            return;
        }

        //Share option

        const shareMsg = `${titleName} ${mainApplicantName} has invited you to be a joint applicant for ${gender} mortgage application at ${propertyName}`;
        const message = `${shareMsg}\n${deepLinkUrl}`;

        // Open native share window
        Share.open({
            message,
            subject: shareMsg,
        })
            .then(() => {
                console.log("[CEAddJANotifyResult][onInviteJAPress] >> Link shared successfully.");
            })
            .catch((error) => {
                console.log("[CEAddJANotifyResult][onInviteJAPress] >> Exception: ", error);
            });
    };

    return (
        <>
            <ScreenContainer
                backgroundType="color"
                backgroundColor={MEDIUM_GREY}
                showLoaderModal={loading}
                analyticScreenName={ADDJA_JOINTAPPLICANT_NOTIFIED}
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
                                source={Assets.loanApplicationSuccess}
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
                                text={NOTIFIED_TEXT}
                                textAlign="left"
                            />

                            {/* Sub Header Text */}

                            <Typo
                                lineHeight={22}
                                textAlign="left"
                                style={styles.subText1}
                                text={NOTIFIED_UPDATE}
                            />
                        </View>
                    </ScrollView>
                    {/* Bottom button container */}
                    <View style={styles.bottomContainerCls}>
                        {/* Go To Application button */}
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
                                    text={GO_TO_APPLICATION}
                                />
                            }
                            onPress={onGoToApplicationPress}
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
                                    text={SEND_A_REMINDER}
                                />
                            }
                            onPress={onSendReminderPress}
                        />
                    </View>
                </ScreenLayout>
            </ScreenContainer>
        </>
    );
}

CEAddJANotifyResult.propTypes = {
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

export default CEAddJANotifyResult;
