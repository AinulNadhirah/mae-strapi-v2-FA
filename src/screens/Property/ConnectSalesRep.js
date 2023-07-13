import PropTypes from "prop-types";
import React, { useEffect, useState } from "react";
import { StyleSheet, View, TextInput, Platform } from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";

import { BANKINGV2_MODULE, CE_RESULT, PROPERTY_DETAILS } from "@navigation/navigationConstant";

import HeaderLayout from "@layouts/HeaderLayout";
import ScreenLayout from "@layouts/ScreenLayout";

import ActionButton from "@components/Buttons/ActionButton";
import HeaderBackButton from "@components/Buttons/HeaderBackButton";
import ScreenContainer from "@components/Containers/ScreenContainer";
import FixedActionContainer from "@components/Footers/FixedActionContainer";
import Popup from "@components/Popup";
import Typo from "@components/Text";
import { showErrorToast } from "@components/Toast";

import { requestAssistance } from "@services";
import { logEvent } from "@services/analytics";

import { GREY, MEDIUM_GREY, YELLOW, WHITE, TRANSPARENT, BLACK } from "@constants/colors";
import {
    COMMON_ERROR_MSG,
    CONFIRM,
    REQ_ASSITANCE_POPUP_TITLE,
    REQ_ASSITANCE_POPUP_DESC,
    FA_FORM_COMPLETE,
    FA_FORM_PROCEED,
    FA_SCREEN_NAME,
    FA_VIEW_SCREEN,
} from "@constants/strings";

import { getEncValue } from "./Common/PropertyController";

function ConnectSalesRep({ route, navigation }) {
    const [message, setMessage] = useState("");
    const [showReqAssistSuccessPopup, setShowReqAssistSuccessPopup] = useState(false);

    useEffect(() => {
        const propertyName = route.params?.propertyDetails?.property_name ?? "";
        const propertyId = route.params?.propertyDetails?.property_id ?? "";
        logEvent(FA_VIEW_SCREEN, {
            [FA_SCREEN_NAME]: "Property_" + propertyName + "_" + propertyId + "_ConnectSA",
        });
    }, [route.params.propertyDetails?.property_name]);

    function onBackTap() {
        console.log("[ConnectSalesRep] >> [onBackTap]");

        navigation.goBack();
    }

    function onMessageChange(value) {
        setMessage(value);
    }

    function onPressReqAssistSuccessPopup() {
        console.log("[ConnectSalesRep] >> [onPressReqAssistSuccessPopup]");

        const propertyName = route.params?.propertyDetails?.property_name ?? "";
        const propertyId = route.params?.propertyDetails?.property_id ?? "";

        setShowReqAssistSuccessPopup(false);
        if (route.params?.from) {
            navigation.navigate(BANKINGV2_MODULE, {
                screen: route.params?.from,
                params: {
                    ...route.params,
                    isAssistanceRequested: true,
                },
            });
        } else {
            navigation.goBack();
        }
        logEvent(FA_FORM_COMPLETE, {
            [FA_SCREEN_NAME]: "Property_" + propertyName + "_" + propertyId + "_ConnectSA",
        });
    }

    async function onContinue() {
        console.log("[ConnectSalesRep] >> [onContinue]");

        const navParams = route?.params ?? {};
        const propertyDetails = navParams?.propertyDetails ?? "";
        const propertyId = propertyDetails?.property_id ?? "";
        const propertyName = propertyDetails?.property_name ?? "";
        const syncId = navParams?.syncId ?? "";
        const from = navParams?.from ?? "";

        const encSyncId = await getEncValue(syncId);

        // Request object
        let params = {};

        if (from === PROPERTY_DETAILS) {
            params = {
                propertyId,
                message,
                requestType: "INQUIRY",
            };
        } else if (from === CE_RESULT) {
            params = {
                propertyId,
                message,
                syncId: encSyncId,
                requestType: "ASSISTANCE",
            };
        }

        // Call API to request assistance
        requestAssistance(params)
            .then((httpResp) => {
                console.log("[ConnectSalesRep][requestAssistance] >> Response: ", httpResp);

                const statusCode = httpResp?.data?.result?.statusCode ?? null;
                const statusDesc = httpResp?.data?.result?.statusDesc ?? null;

                if (statusCode === "0000") {
                    setShowReqAssistSuccessPopup(true);
                } else {
                    // Show error message
                    showErrorToast({
                        message: statusDesc || COMMON_ERROR_MSG,
                    });
                }
            })
            .catch((error) => {
                console.log("[ConnectSalesRep][requestAssistance] >> Exception: ", error);

                // Show error message
                showErrorToast({
                    message: error?.message || COMMON_ERROR_MSG,
                });
            });

        logEvent(FA_FORM_PROCEED, {
            [FA_SCREEN_NAME]: "Property_" + propertyName + "_" + propertyId + "_ConnectSA",
        });
    }

    return (
        <>
            <ScreenContainer backgroundType="color" backgroundColor={MEDIUM_GREY}>
                <ScreenLayout
                    header={
                        <HeaderLayout
                            headerLeftElement={<HeaderBackButton onPress={onBackTap} />}
                        />
                    }
                    paddingHorizontal={0}
                    paddingBottom={0}
                    paddingTop={0}
                    useSafeArea
                >
                    <>
                        <KeyboardAwareScrollView
                            style={styles.containerView}
                            behavior={Platform.OS === "ios" ? "padding" : ""}
                            enabled
                        >
                            {/* Title */}
                            <Typo
                                fontSize={14}
                                fontWeight="600"
                                lineHeight={18}
                                text="Connect with a sales representative"
                                textAlign="left"
                            />

                            {/* subheader text */}
                            <Typo
                                fontSize={20}
                                fontWeight="300"
                                lineHeight={28}
                                style={styles.label}
                                text="How can we help you?"
                                textAlign="left"
                            />

                            <View style={styles.textAreaContainer}>
                                <TextInput
                                    style={[styles.textArea, styles.inputFont]}
                                    placeholder="e.g. I'd like to..."
                                    maxLength={500}
                                    numberOfLines={6}
                                    multiline
                                    allowFontScaling={false}
                                    placeholderTextColor="rgb(199,199,205)"
                                    underlineColorAndroid={TRANSPARENT}
                                    autoFocus={Platform.OS === "ios"}
                                    value={message}
                                    onChangeText={onMessageChange}
                                />
                            </View>
                        </KeyboardAwareScrollView>

                        {/* Bottom docked button container */}
                        <FixedActionContainer>
                            <ActionButton
                                activeOpacity={0.5}
                                backgroundColor={YELLOW}
                                fullWidth
                                componentCenter={
                                    <Typo
                                        color={BLACK}
                                        lineHeight={18}
                                        fontWeight="600"
                                        text={CONFIRM}
                                    />
                                }
                                onPress={onContinue}
                            />
                        </FixedActionContainer>
                    </>
                </ScreenLayout>
            </ScreenContainer>

            {/* Req Assistance Success popup */}
            <Popup
                visible={showReqAssistSuccessPopup}
                title={REQ_ASSITANCE_POPUP_TITLE}
                description={REQ_ASSITANCE_POPUP_DESC}
                onClose={onPressReqAssistSuccessPopup}
                primaryAction={{
                    text: "Got it",
                    onPress: onPressReqAssistSuccessPopup,
                }}
            />
        </>
    );
}

ConnectSalesRep.propTypes = {
    route: PropTypes.object,
    navigation: PropTypes.object,
};

const styles = StyleSheet.create({
    containerView: {
        flex: 1,
        paddingHorizontal: 36,
        width: "100%",
    },

    inputFont: {
        color: BLACK,
        fontFamily: "montserrat",
        fontSize: 12,
        lineHeight: 15,
    },

    label: {
        paddingTop: 8,
    },

    textArea: {
        height: 150,
        justifyContent: "flex-start",
        paddingLeft: 10,
        textAlignVertical: "top",
    },

    textAreaContainer: {
        backgroundColor: WHITE,
        borderColor: GREY,
        borderRadius: 8,
        borderWidth: 1,
        marginTop: 24,
        padding: 5,
    },
});

export default ConnectSalesRep;
