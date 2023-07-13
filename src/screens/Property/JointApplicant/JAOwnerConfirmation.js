/* eslint-disable react/jsx-no-bind */

/* eslint-disable react-hooks/exhaustive-deps */
import PropTypes from "prop-types";
import React, { useEffect, useCallback, useState } from "react";
import { View, StyleSheet, Text } from "react-native";

import { BANKINGV2_MODULE, JA_CONFIRMATION } from "@navigation/navigationConstant";

import HeaderLayout from "@layouts/HeaderLayout";
import ScreenLayout from "@layouts/ScreenLayout";

import ActionButton from "@components/Buttons/ActionButton";
import HeaderBackButton from "@components/Buttons/HeaderBackButton";
import ScreenContainer from "@components/Containers/ScreenContainer";
import FixedActionContainer from "@components/Footers/FixedActionContainer";
import Typo from "@components/Text";

import { logEvent } from "@services/analytics";

import { MEDIUM_GREY, YELLOW, DARK_GREY, BLACK, ROYAL_BLUE } from "@constants/colors";
import {
    YES,
    NO,
    FA_SCREEN_NAME,
    FA_FORM_PROCEED,
    FA_FIELD_INFORMATION,
    FA_PROPERTY_JACEJA_ACKNOWLEDGEMENT,
    EDIT,
} from "@constants/strings";

function JAOwnerConfirmation({ route, navigation }) {
    const [unitName, setUnitName] = useState("");
    const [propertyName, setPropertyName] = useState("");
    const [userName, setUserName] = useState("");
    const [propertyAddress, setPropertyAddress] = useState("");

    useEffect(() => {
        init();
    }, []);

    const init = useCallback(() => {
        console.log("[JAOwnerConfirmation] >> [init]");
        const navParams = route?.params ?? {};
        const unitName = navParams?.unitName ?? "";
        const propertyName = navParams?.propertyName ?? "";
        const propertyAddress = navParams?.propertyAddress ?? "";
        const userName = navParams?.userName ?? "";
        setUnitName(unitName);
        setPropertyName(propertyName);
        setUserName(userName);
        setPropertyAddress(propertyAddress);
    }, []);
    const onBackPress = () => {
        console.log("[JAOwnerConfirmation] >> [onBackPress]");
        navigation.canGoBack() && navigation.goBack();
    };
    function onYesPress() {
        console.log("[JAOwnerConfirmation] >> [onContinue]");
        onContinue("Y");
        logEvent(FA_FORM_PROCEED, {
            [FA_SCREEN_NAME]: FA_PROPERTY_JACEJA_ACKNOWLEDGEMENT,
            [FA_FIELD_INFORMATION]: "sole_ownership: Yes",
        });
    }
    function onNoPress() {
        console.log("[JAOwnerConfirmation] >> [onNoPress]");
        onContinue("N");
        logEvent(FA_FORM_PROCEED, {
            [FA_SCREEN_NAME]: FA_PROPERTY_JACEJA_ACKNOWLEDGEMENT,
            [FA_FIELD_INFORMATION]: "sole_ownership: No",
        });
    }
    async function onContinue(value) {
        console.log("[JAOwnerConfirmation] >> [onContinue]");
        const navParams = route?.params ?? {};
        // Retrieve form data
        const formData = getFormData(value);
        const updateData = true;
        // Navigate to Customer address screen
        navigation.navigate(BANKINGV2_MODULE, {
            screen: JA_CONFIRMATION,
            params: { ...navParams, ...formData, updateData },
        });
    }
    function getFormData(value = "") {
        console.log("[JAOwnerConfirmation] >> [getFormData]");
        return {
            isUnitOwner: value,
        };
    }
    return (
        <>
            <ScreenContainer
                backgroundType="color"
                backgroundColor={MEDIUM_GREY}
                analyticScreenName={FA_PROPERTY_JACEJA_ACKNOWLEDGEMENT}
            >
                <ScreenLayout
                    header={
                        <HeaderLayout
                            headerLeftElement={<HeaderBackButton onPress={onBackPress} />}
                            headerCenterElement={
                                <Typo
                                    text={EDIT}
                                    lineHeight={16}
                                    fontSize={12}
                                    fontWeight="600"
                                    color={BLACK}
                                />
                            }
                        />
                    }
                    paddingHorizontal={0}
                    paddingBottom={0}
                    paddingTop={24}
                    useSafeArea
                >
                    <>
                        <View style={styles.wrapper}>
                            {/* Title */}
                            <Typo
                                fontSize={14}
                                fontWeight="600"
                                lineHeight={18}
                                text={`${propertyName} [${unitName ? unitName : propertyAddress}]`}
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
                                    <Text>{`Are you and ${userName} going to be the `}</Text>
                                    <Typo
                                        fontSize={20}
                                        lineHeight={28}
                                        fontWeight="600"
                                        textAlign="left"
                                        text={`only owners `}
                                    />
                                    <Text>{`of `}</Text>
                                    <Typo
                                        fontSize={20}
                                        lineHeight={28}
                                        fontWeight="600"
                                        textAlign="left"
                                        text={`${propertyName}? `}
                                    />
                                </Typo>
                            </View>
                        </View>
                        {/* Bottom Container */}
                        <FixedActionContainer>
                            <View style={styles.bottomBtnContCls}>
                                <Typo
                                    fontSize={12}
                                    fontWeight="400"
                                    lineHeight={20}
                                    style={styles.noteLabel}
                                    text="Your financing offer is only valid if you and your main applicant are going to be the owners of the property."
                                    textAlign="left"
                                    color={DARK_GREY}
                                />
                                <ActionButton
                                    activeOpacity={0.5}
                                    backgroundColor={YELLOW}
                                    fullWidth
                                    componentCenter={
                                        <Typo
                                            color={BLACK}
                                            lineHeight={18}
                                            fontWeight="600"
                                            text={YES}
                                        />
                                    }
                                    onPress={onYesPress}
                                />
                                {/* No */}
                                <Typo
                                    color={ROYAL_BLUE}
                                    fontWeight="600"
                                    lineHeight={18}
                                    text={NO}
                                    onPress={onNoPress}
                                    style={styles.noBtn}
                                />
                            </View>
                        </FixedActionContainer>
                    </>
                </ScreenLayout>
            </ScreenContainer>
        </>
    );
}
JAOwnerConfirmation.propTypes = {
    route: PropTypes.object,
    navigation: PropTypes.object,
};
const styles = StyleSheet.create({
    bottomBtnContCls: {
        width: "100%",
    },
    label: {
        paddingTop: 8,
    },
    noBtn: {
        marginVertical: 15,
    },
    noteLabel: {
        marginBottom: 16,
        paddingHorizontal: 8,
        paddingTop: 8,
    },
    wrapper: {
        flex: 1,
        paddingHorizontal: 36,
    },
});
export default JAOwnerConfirmation;
