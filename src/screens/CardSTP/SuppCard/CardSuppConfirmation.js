/* eslint-disable react/jsx-no-bind */
import PropTypes from "prop-types";
import React, { useState, useEffect, useCallback } from "react";
import { View, StyleSheet, ScrollView } from "react-native";

import HeaderLayout from "@layouts/HeaderLayout";
import ScreenLayout from "@layouts/ScreenLayout";

import ActionButton from "@components/Buttons/ActionButton";
import HeaderBackButton from "@components/Buttons/HeaderBackButton";
import HeaderCloseButton from "@components/Buttons/HeaderCloseButton";
import ScreenContainer from "@components/Containers/ScreenContainer";
import FixedActionContainer from "@components/Footers/FixedActionContainer";
import { InfoDetails } from "@components/FormComponents/InfoDetails";
import Typo from "@components/Text";
import { showErrorToast } from "@components/Toast";

import { MEDIUM_GREY, YELLOW, BLACK } from "@constants/colors";
import {
    COMMON_ERROR_MSG,
    CONFIRMATION,
    FA_APPLY_SUPPLEMENTARYCARD_CONFIRMATION,
} from "@constants/strings";
import { CARD_SUPP_CONFIRMATION } from "@navigation/navigationConstant";

function CardSuppConfirmation({ navigation, route }) {
    const [personalInfo, setPersonalInfo] = useState([]);
    const [empInfo, setEmpInfo] = useState([]);
    const [isResume] = useState(route?.params?.isResume);

    useEffect(() => {
        navigation.addListener("focus", onScreenFocus);
    });

    const onScreenFocus = () => {
        init();
    };

    const init = useCallback(async () => {
        try {
            setData();
        } catch (error) {
            navigation.canGoBack() && navigation.goBack();
        }
    }, [route, navigation, setData]);

    const setData = useCallback(() => {
        const params = route?.params ?? {};
        const {
            userAction: {
                idType,
                idNumber,
                dob,
                ccType,
                nama,
                name,
                email,
                relationship,
                mobileNumber,
                gender,
                race,
                nationality,
                occupation,
                sector,
                empType,
                homeAddress1,
                homeAddress2,
                homeAddress3,
                postcode,
                city,
                state,
                title,
                creditLimit,
                monthlyStatement,
                income,
                empName,
                pep,
                sourceIncome,
            },
        } = params;
        const personalData = [ccType, email, idType, idNumber, dob];
        const empData = [
            title,
            nama,
            relationship,
            name,
            email,
            mobileNumber,
            gender,
            race,
            nationality,
            occupation,
            sector,
            empType,
            homeAddress1,
            homeAddress2,
            homeAddress3,
            postcode,
            city,
            state,
            creditLimit,
            monthlyStatement,
            pep,
            income,
            empName,
            sourceIncome,
        ];

        setPersonalInfo(personalData);
        setEmpInfo(empData);
    }, [route?.params]);

    function handleBack() {
        navigation.canGoBack() && navigation.goBack();
    }

    function handleClose() {
        navigation.navigate(route?.params?.entryStack || "More", {
            screen: route?.params?.entryScreen || "Apply",
            params: route?.params?.entryParams,
        });
    }

    async function handleProceedButton() {
        try {
            navigation.navigate("CardSuppDeclaration", {
                ...route?.params,
            });
        } catch (error) {
            showErrorToast({
                message: COMMON_ERROR_MSG,
            });
        }
    }

    function editButton(value) {
        switch (value) {
            case "personalInfo":
                navigation.navigate("CardSuppDetails", {
                    ...route.params,
                    routeFrom: CARD_SUPP_CONFIRMATION,
                });
                break;
            case "empInfo":
                navigation.navigate("CardSuppCollection", {
                    ...route.params,
                    routeFrom: CARD_SUPP_CONFIRMATION,
                });
                break;
            default:
                handleClose();
        }
    }

    return (
        <ScreenContainer
            backgroundType="color"
            backgroundColor={MEDIUM_GREY}
            analyticScreenName={FA_APPLY_SUPPLEMENTARYCARD_CONFIRMATION}
        >
            <>
                <ScreenLayout
                    paddingHorizontal={0}
                    paddingBottom={0}
                    paddingTop={0}
                    header={
                        <HeaderLayout
                            headerRightElement={<HeaderCloseButton onPress={handleClose} />}
                            headerCenterElement={
                                <Typo
                                    text={CONFIRMATION}
                                    fontWeight="600"
                                    fontSize={16}
                                    lineHeight={19}
                                />
                            }
                            headerLeftElement={<HeaderBackButton onPress={handleBack} />}
                        />
                    }
                    useSafeArea
                >
                    <React.Fragment>
                        <ScrollView
                            style={styles.scrollViewCls}
                            showsVerticalScrollIndicator={false}
                        >
                            <View style={styles.formContainer}>
                                <Typo
                                    fontSize={14}
                                    lineHeight={18}
                                    fontWeight="normal"
                                    textAlign="left"
                                    text="Please confirm the below details before submission"
                                    style={styles.headerLabelCls}
                                />
                                <InfoDetails
                                    title="Personal Details"
                                    info={personalInfo}
                                    hidden={isResume}
                                    handlePress={editButton}
                                    buttonValue="personalInfo"
                                />
                                <InfoDetails
                                    title="Employment Details"
                                    info={empInfo}
                                    hidden={isResume}
                                    handlePress={editButton}
                                    buttonValue="empInfo"
                                />
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
                                            text="Save and Continue"
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

CardSuppConfirmation.propTypes = {
    route: PropTypes.object,
    navigation: PropTypes.object,
};

const styles = StyleSheet.create({
    bottomBtnContCls: {
        flexDirection: "row",
        justifyContent: "space-around",
        width: "100%",
    },
    formContainer: {
        marginBottom: 40,
    },

    headerLabelCls: {
        marginTop: 15,
        paddingHorizontal: 24,
    },

    scrollViewCls: {
        paddingHorizontal: 0,
    },
});

export default CardSuppConfirmation;
