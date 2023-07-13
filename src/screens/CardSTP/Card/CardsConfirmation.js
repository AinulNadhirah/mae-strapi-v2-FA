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
    FA_APPLY_CREDITCARD_CONFIRMATION,
} from "@constants/strings";

function CardsConfirmation({ navigation, route }) {
    const [creditCard, setCreditCard] = useState([]);
    const [personalInfo, setPersonalInfo] = useState([]);
    const [empInfo, setEmpInfo] = useState([]);
    const [addInfo, setAddInfo] = useState([]);
    const [isResume] = useState(route?.params?.isResume);

    useEffect(() => {
        init();
    }, [init]);

    const init = useCallback(async () => {
        try {
            setData();
        } catch (error) {
            navigation.canGoBack() && navigation.goBack();
        }
    }, [navigation, setData]);

    const setData = useCallback(() => {
        const params = route?.params ?? {};
        console.log(params);
        const {
            userAction: {
                selectedCard,
                title,
                name,
                dob,
                idType,
                idNumber,
                education,
                nameOfCard,
                emailMask,
                mobileNumberMask,
                houseNumberMask,
                gender,
                race,
                marital,
                nationality,
                homeAddress1Mask,
                homeAddress2Mask,
                homeAddress3Mask,
                postcodeMask,
                cityMask,
                state,
                residential,
                empName,
                occupation,
                //natureOfBusiness,
                businessClassification,
                lengthOfService,
                termsOfEmployment,
                officeAddress1Mask,
                officeAddress2Mask,
                officeAddress3Mask,
                officePostcodeMask,
                officeCityMask,
                officeState,
                officeContact,
                income,
                otherIncome,
                incomeAfterRetirement,
                statementDelivery,
                cardCollectionState,
                cardCollectionDistrict,
                cardCollectionBranch,
                cardCollectionMethod,
                primaryIncome,
                wealth,
            },
        } = params;
        const personalData = [
            title,
            name,
            dob,
            idType,
            idNumber,
            education,
            nameOfCard,
            emailMask,
            mobileNumberMask,
            houseNumberMask,
            gender,
            race,
            marital,
            nationality,
            homeAddress1Mask,
            homeAddress2Mask,
            homeAddress3Mask,
            postcodeMask,
            cityMask,
            state,
            residential,
        ];
        const empData = [
            empName,
            occupation,
            //natureOfBusiness,
            businessClassification,
            lengthOfService,
            termsOfEmployment,
            officeAddress1Mask,
            officeAddress2Mask,
            officeAddress3Mask,
            officePostcodeMask,
            officeCityMask,
            officeState,
            officeContact,
        ];
        const addData = [
            primaryIncome,
            wealth,
            income,
            otherIncome,
            incomeAfterRetirement,
            statementDelivery,
            cardCollectionMethod,
            cardCollectionState,
            cardCollectionDistrict,
            cardCollectionBranch,
        ];

        setCreditCard(selectedCard);
        setPersonalInfo(personalData);
        setEmpInfo(empData);
        setAddInfo(addData);
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
            navigation.navigate("CardsDeclaration", {
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
            case "creditCard":
                navigation.navigate("CardsTypeSelection", {
                    ...route.params,
                });
                break;
            case "personalInfo":
                navigation.navigate("CardsIdDetails", {
                    ...route.params,
                });
                break;
            case "empInfo":
                navigation.navigate("CardsEmployer", {
                    ...route.params,
                });
                break;
            case "addInfo":
                navigation.navigate("CardsCollection", {
                    ...route.params,
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
            analyticScreenName={FA_APPLY_CREDITCARD_CONFIRMATION}
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
                                    title="Credit Card"
                                    info={creditCard}
                                    hidden={true}
                                    handlePress={editButton}
                                    buttonValue="creditCard"
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
                                <InfoDetails
                                    title="Additional Details"
                                    info={addInfo}
                                    hidden={isResume}
                                    handlePress={editButton}
                                    buttonValue="addInfo"
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

CardsConfirmation.propTypes = {
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

export default CardsConfirmation;
