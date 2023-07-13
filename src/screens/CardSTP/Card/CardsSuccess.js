import PropTypes from "prop-types";
import React, { useEffect, useState } from "react";
import { View, StyleSheet, ScrollView, Image } from "react-native";
import * as Animatable from "react-native-animatable";

import ScreenLayout from "@layouts/ScreenLayout";

import ActionButton from "@components/Buttons/ActionButton";
import ScreenContainer from "@components/Containers/ScreenContainer";
import FixedActionContainer from "@components/Footers/FixedActionContainer";
import Typo from "@components/Text";
import { showErrorToast } from "@components/Toast";

import { applyCC } from "@services/analytics/analyticsSTPCreditcardAndSuppCard";

import { MEDIUM_GREY, YELLOW, BLACK } from "@constants/colors";
import {
    COMMON_ERROR_MSG,
    DONE,
    FA_APPLY_CREDITCARD_COMPLETED,
    FA_APPLY_SUPPLEMENTARYCARD_COMPLETED,
} from "@constants/strings";

import assets from "@assets";

function CardsSuccess({ navigation, route }) {
    const validDocuments = route?.params?.docsValid ?? false;
    const [refID] = useState(route?.params?.serverData?.stpRefNo || route?.params?.stpRefNo);
    
    // Set serverDate with either serverDate value or use txnDate value as fallback
    const [serverDate] = useState(
        route?.params?.serverDate ||
            route?.params?.resumeData?.serverDate ||
            route?.params?.txnDate ||
            route?.params?.resumeData?.txnDate
    );

    function handleClose() {
        navigation.navigate(route?.params?.entryStack || "More", {
            screen: route?.params?.entryScreen || "Apply",
            params: route?.params?.entryParams,
        });
    }
    useEffect(() => {
        const { cardsEntryPointScreen } = route?.params;
        applyCC.onCardsSuccessFormComplete(
            cardsEntryPointScreen,
            refID,
            route?.params?.cardData
                ? route?.params?.cardData
                : route?.params?.userAction?.selectedCard,
            route?.params?.userAction?.dealerName?.displayValue
        );
    }, [refID]);

    async function handleProceedButton() {
        try {
            handleClose();
        } catch (error) {
            showErrorToast({
                message: COMMON_ERROR_MSG,
            });
        }
    }

    const { cardsEntryPointScreen } = route?.params;
    const analyticScreenName =
        cardsEntryPointScreen === "SupplementaryCard"
            ? FA_APPLY_SUPPLEMENTARYCARD_COMPLETED
            : cardsEntryPointScreen === "CreditCard"
            ? FA_APPLY_CREDITCARD_COMPLETED
            : "";

    return (
        <ScreenContainer
            backgroundType="color"
            backgroundColor={MEDIUM_GREY}
            analyticScreenName={analyticScreenName}
        >
            <>
                <Animatable.View
                    animation="fadeInDown"
                    delay={300}
                    useNativeDriver
                    style={{
                        ...StyleSheet.absoluteFill,
                    }}
                >
                    <Image source={assets.cardsStatusBg} style={styles.bgImg} />
                </Animatable.View>
                <ScreenLayout paddingHorizontal={0} paddingBottom={0} paddingTop={319} useSafeArea>
                    <React.Fragment>
                        <ScrollView
                            style={styles.scrollViewCls}
                            showsVerticalScrollIndicator={false}
                        >
                            <View style={styles.container}>
                                <Typo
                                    fontSize={14}
                                    fontWeight="600"
                                    fontStyle="normal"
                                    letterSpacing={0}
                                    lineHeight={18}
                                    textAlign="left"
                                    text={
                                        validDocuments
                                            ? "Application Completed"
                                            : "Document Upload Required"
                                    }
                                />
                                <Typo
                                    fontSize={20}
                                    fontWeight="300"
                                    fontStyle="normal"
                                    letterSpacing={0}
                                    lineHeight={28}
                                    style={styles.msgDescription}
                                    textAlign="left"
                                    text={
                                        validDocuments
                                            ? "We will notify you on your application status via SMS or email."
                                            : "Upload your document in the next 3 days to complete your application through the 'Apply' section. "
                                    }
                                />
                                <View style={styles.subcontainer}>
                                    <Typo
                                        fontSize={14}
                                        fontWeight="400"
                                        fontStyle="normal"
                                        letterSpacing={0}
                                        lineHeight={18}
                                        style={styles.infoType}
                                        textAlign="left"
                                        text="Reference ID"
                                    />

                                    <Typo
                                        fontSize={14}
                                        fontWeight="600"
                                        fontStyle="normal"
                                        letterSpacing={0}
                                        lineHeight={18}
                                        style={styles.value}
                                        textAlign="left"
                                        text={refID}
                                    />
                                    <Typo
                                        fontSize={14}
                                        fontWeight="400"
                                        fontStyle="normal"
                                        letterSpacing={0}
                                        lineHeight={18}
                                        style={styles.infoType}
                                        textAlign="left"
                                        text="Date & time"
                                    />
                                    <Typo
                                        fontSize={14}
                                        fontWeight="600"
                                        fontStyle="normal"
                                        letterSpacing={0}
                                        lineHeight={18}
                                        style={styles.value}
                                        textAlign="left"
                                        text={serverDate}
                                    />
                                </View>
                            </View>
                        </ScrollView>
                        {/* Bottom docked button container */}
                        <FixedActionContainer>
                            <View style={styles.bottomBtnContCls}>
                                <ActionButton
                                    activeOpacity={0.5}
                                    backgroundColor={YELLOW}
                                    fullWidth
                                    componentCenter={
                                        <Typo
                                            text={DONE}
                                            fontSize={14}
                                            fontWeight="600"
                                            lineHeight={18}
                                            color={BLACK}
                                        />
                                    }
                                    onPress={handleProceedButton}
                                />
                            </View>
                        </FixedActionContainer>
                    </React.Fragment>
                </ScreenLayout>
            </>
        </ScreenContainer>
    );
}

CardsSuccess.propTypes = {
    route: PropTypes.object,
    navigation: PropTypes.object,
};

const styles = StyleSheet.create({
    bgImg: { height: 319, width: "100%" },

    bottomBtnContCls: {
        flexDirection: "row",
        justifyContent: "space-around",
        width: "100%",
    },
    container: { height: "40%", paddingHorizontal: 24 },
    infoType: { marginTop: 15 },
    msgDescription: { marginTop: 15, width: "90%" },
    scrollViewCls: {
        paddingHorizontal: 0,
        paddingTop: 0,
    },
    subcontainer: { marginTop: 40 },
    value: { marginVertical: 5 },
});

export default CardsSuccess;
