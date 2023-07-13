/* eslint-disable react/jsx-no-bind */
import PropTypes from "prop-types";
import React, { useEffect, useState, useCallback } from "react";
import { View, StyleSheet, Image, Dimensions, ScrollView } from "react-native";
import * as Animatable from "react-native-animatable";

import { BANKINGV2_MODULE, APPLICATION_DETAILS } from "@navigation/navigationConstant";

import ScreenLayout from "@layouts/ScreenLayout";

import ActionButton from "@components/Buttons/ActionButton";
import ScreenContainer from "@components/Containers/ScreenContainer";
import FixedActionContainer from "@components/Footers/FixedActionContainer";
import Typo from "@components/Text";
import { showErrorToast } from "@components/Toast";

import { MEDIUM_GREY, YELLOW } from "@constants/colors";
import {
    DONE,
    FA_PROPERTY_ADDJA_PROCEED,
    HOME_FINANCING_APPLICATION_NAME,
} from "@constants/strings";

import Assets from "@assets";

import { fetchApplicationDetails, fetchGetApplicants } from "../Application/LAController";
import { getEncValue } from "../Common/PropertyController";

const screenHeight = Dimensions.get("window").height;
const imageHeight = Math.max((screenHeight * 40) / 100, 500);
function CEAddJAETB({ route, navigation }) {
    const [loading, setLoading] = useState(false);
    const [jointApplicantName, setJointApplicantName] = useState("");
    const [invitationDateTime, setInvitationDateTime] = useState("");

    useEffect(() => {
        init();
    }, []);

    const init = useCallback(() => {
        console.log("[CEAddJAETB] >> [init]", route?.params);

        const navParams = route?.params;
        const { name, currentDateTime } = navParams;

        setJointApplicantName(name);
        setInvitationDateTime(currentDateTime);
    }, [route?.params]);

    async function onDonePress() {
        console.log("[CEAddJAETB] >> [onYesPress]");
        const navParams = route?.params ?? {};
        const syncId = navParams?.syncId;
        const encSyncId = await getEncValue(syncId);
        const params = {
            syncId: encSyncId,
            stpId: "",
        };

        const responseData = await fetchGetApplicants(encSyncId, false);

        if (!responseData?.success) {
            setLoading(false);
            // Show error message
            showErrorToast({ message: responseData?.errorMessage });
            return;
        }

        const { mainApplicantDetails, jointApplicantDetails, currentUser } = responseData;

        // Call API to fetch Application Details
        const { success, errorMessage, propertyDetails, savedData, cancelReason } =
            await fetchApplicationDetails(params);

        if (!success) {
            // Show error message
            showErrorToast({ message: errorMessage });
            return;
        }

        // Navigate to Application details page
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
    }

    return (
        <>
            <ScreenContainer
                backgroundType="color"
                backgroundColor={MEDIUM_GREY}
                showLoaderModal={loading}
                analyticScreenName={FA_PROPERTY_ADDJA_PROCEED}
            >
                <ScreenLayout paddingHorizontal={0} paddingBottom={0} paddingTop={24} useSafeArea>
                    <ScrollView showsVerticalScrollIndicator={false}>
                        {/* Top Image Component */}
                        <View style={styles.imageContainer(imageHeight)}>
                            <Animatable.View
                                animation="fadeInDown"
                                delay={300}
                                useNativeDriver
                                resizeMode="cover"
                                style={{
                                    ...StyleSheet.absoluteFill,
                                }}
                            >
                                <Image
                                    source={Assets.jointApplicantInvitation}
                                    style={styles.bgImg}
                                />
                            </Animatable.View>
                        </View>

                        <View style={styles.wrapper}>
                            {/* Title */}
                            <Typo
                                fontSize={14}
                                fontWeight="600"
                                lineHeight={18}
                                text="Invitation Sent"
                                textAlign="left"
                            />

                            {/* subheader text */}
                            <View>
                                <Typo
                                    fontSize={20}
                                    fontWeight="300"
                                    lineHeight={28}
                                    style={styles.label}
                                    textAlign="left"
                                >
                                    We&apos;ve let your joint applicant
                                    <Typo
                                        fontSize={20}
                                        fontWeight="600"
                                        lineHeight={28}
                                        style={styles.label}
                                        textAlign="left"
                                        text={` (${jointApplicantName}) `}
                                    />
                                    know about your invitation through MAE app.
                                </Typo>
                            </View>

                            {/* Application Name */}
                            <View style={styles.marginVertical}>
                                <Typo
                                    fontSize={14}
                                    fontWeight="300"
                                    lineHeight={18}
                                    text="Application"
                                    textAlign="left"
                                />
                                <Typo
                                    fontSize={14}
                                    fontWeight="600"
                                    lineHeight={18}
                                    text={HOME_FINANCING_APPLICATION_NAME}
                                    textAlign="left"
                                />
                            </View>

                            {/* Date and time */}
                            <View style={styles.marginVerticalForDate}>
                                <Typo
                                    fontSize={14}
                                    fontWeight="300"
                                    lineHeight={18}
                                    text="Date & time"
                                    textAlign="left"
                                />
                                <Typo
                                    fontSize={14}
                                    fontWeight="600"
                                    lineHeight={18}
                                    text={invitationDateTime}
                                    textAlign="left"
                                />
                            </View>
                        </View>

                        {/* Bottom Container */}
                        <FixedActionContainer>
                            <View style={styles.bottomBtnContCls}>
                                <ActionButton
                                    backgroundColor={YELLOW}
                                    fullWidth
                                    componentCenter={
                                        <Typo lineHeight={18} fontWeight="600" text={DONE} />
                                    }
                                    onPress={onDonePress}
                                />
                            </View>
                        </FixedActionContainer>
                    </ScrollView>
                </ScreenLayout>
            </ScreenContainer>
        </>
    );
}

CEAddJAETB.propTypes = {
    route: PropTypes.object,
    navigation: PropTypes.object,
};

const styles = StyleSheet.create({
    bgImg: { height: "100%", width: "100%" },
    imageContainer: (imageHeight) => ({
        alignItems: "center",
        height: imageHeight,
    }),
    bottomBtnContCls: {
        marginTop: 15,
        width: "100%",
    },
    dummyView: { height: 450, width: "100%" },
    label: {
        paddingTop: 8,
    },
    marginVertical: {
        marginTop: 25,
        marginBottom: 10,
    },
    marginVerticalForDate: {
        marginBottom: 25,
    },
    noBtn: {
        marginVertical: 15,
    },
    wrapper: { flex: 1, paddingHorizontal: 36 },
});

export default CEAddJAETB;
