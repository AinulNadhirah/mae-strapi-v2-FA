import PropTypes from "prop-types";
import React, { useEffect, useState, useCallback } from "react";
import { Image, StyleSheet, View } from "react-native";

import HeaderLayout from "@layouts/HeaderLayout";
import ScreenLayout from "@layouts/ScreenLayout";

import ActionButton from "@components/Buttons/ActionButton";
import HeaderBackButton from "@components/Buttons/HeaderBackButton";
import ScreenContainer from "@components/Containers/ScreenContainer";
import FixedActionContainer from "@components/Footers/FixedActionContainer";
import Typo from "@components/Text";

import { YELLOW, MEDIUM_GREY } from "@constants/colors";
import { FA_APPLY_CREDITCARD_INITIATE } from "@constants/strings";

import Assets from "@assets";

function CardsIntro({ navigation, route }) {
    const [populateObj, setPopulateObj] = useState({});

    useEffect(() => {
        setData();
    }, [setData]);

    const setData = useCallback(async () => {
        const params = route?.params ?? {};
        const { title, custName, populateData } = params?.serverData;
        const wholeData = {
            title: title ?? "",
            name: custName ?? "",
            dob: populateData?.dateOfBirth ?? "",
            idNumber: populateData?.idNumber ?? "",
            email: populateData?.email ?? "",
            mobileNumber: populateData?.mobPhoneNumber ?? "",
            mobilePrefix: populateData?.mobAreaCode ?? "",
            idType: populateData?.idTypeValue ?? "",
            educationCode: populateData?.educationCode ?? "",
            raceCode: populateData?.raceCode ?? "",
            houseNumber: populateData?.homePhoneNumber ?? "",
            homePrefix: populateData?.homeAreaCode ?? "",
            gender: populateData?.genderCode ?? "",
            marital: populateData?.maritalStatusCode ?? "",
            nationality: "Malaysia",
            nameOfCard: "",
            pep: "",
            homeAddress1: populateData?.homeAddr1 ?? "",
            homeAddress2: populateData?.homeAddr2 ?? "",
            homeAddress3: populateData?.homeAddr3 ?? "",
            postcode: populateData?.homeAddPin ?? "",
            city: populateData?.homeAddCity ?? "",
            stateValue: populateData?.homeStateValue ?? "",
            residential: "",
            empName: populateData?.employerName ?? "",
            occupationCode: populateData?.occupationCode ?? "",
            natureOfBusiness: "",
            busClassification: "",
            sourceIncome: "",
            sector: "",
            empType: "",
            lengthOfService: "",
            serviceYear: "",
            serviceMonth: "",
            termOfEmployment: "",
            officeAddress1: populateData?.employmentAddr1 ?? "",
            officeAddress2: populateData?.employmentAddr2 ?? "",
            officeAddress3: populateData?.employmentAddr3 ?? "",
            officePostcode: populateData?.employmentAddPin ?? "",
            officeCity: populateData?.employmentTown ?? "",
            officePrefix: populateData?.employmentAreaCode ?? "",
            officeContact: populateData?.employmentPhoneNumber ?? "",
            officeState: populateData?.employmentState ?? "",
            income: "",
            otherIncome: "",
            primryIncome: "",
            wealth: "",
            incomeAfterRetirement: "",
            statementDelivery: "",
            cardCollectionMethod: "",
            cardCollectionState: "",
            cardCollectionDistrict: "",
            cardCollectionBranch: "",
        };
        setPopulateObj(wholeData);
    }, [route?.params, setPopulateObj]);

    function onBackTap() {
        console.log("[CardsIntro] >> [onBackTap]");
        navigation.goBack();
    }

    function handleProceedButton() {
        navigation.navigate("CardsIdDetails", {
            ...route?.params,
            populateObj,
        });
    }
    return (
        <ScreenContainer
            backgroundType="color"
            backgroundColor={MEDIUM_GREY}
            analyticScreenName={FA_APPLY_CREDITCARD_INITIATE}
        >
            <ScreenLayout
                paddingBottom={0}
                paddingTop={0}
                paddingHorizontal={20}
                neverForceInset={["bottom"]}
                useSafeArea
                scrollable
                header={
                    <HeaderLayout headerLeftElement={<HeaderBackButton onPress={onBackTap} />} />
                }
            >
                <Typo
                    fontSize={22}
                    fontWeight="300"
                    lineHeight={28}
                    style={styles.label}
                    text="Get started with our easy application."
                />
                <View style={styles.imageContainer}>
                    <Image source={Assets.ccGeneric} style={styles.imageStyles} />
                </View>
                <View style={styles.midContainer}>
                    <Typo
                        fontSize={16}
                        fontWeight="400"
                        fontStyle="normal"
                        letterSpacing={0}
                        lineHeight={18}
                        style={styles.verticalSpacing}
                        textAlign="left"
                        text="Tell us about yourself to help us complete your application"
                    />

                    <Typo
                        fontSize={16}
                        fontWeight="400"
                        fontStyle="normal"
                        letterSpacing={0}
                        lineHeight={18}
                        style={styles.verticalSpacing}
                        textAlign="left"
                        text="Take a picture or scan your NRIC and latest income statement"
                    />

                    <Typo
                        fontSize={16}
                        fontWeight="400"
                        fontStyle="normal"
                        letterSpacing={0}
                        lineHeight={18}
                        style={styles.verticalSpacing}
                        textAlign="left"
                        text="Once approved, enjoy the privileges of your selected credit card"
                    />
                </View>
                <View style={styles.bottomContainer}>
                    <FixedActionContainer>
                        <ActionButton
                            backgroundColor={YELLOW}
                            height={48}
                            fullWidth
                            borderRadius={24}
                            componentCenter={
                                <Typo
                                    fontSize={14}
                                    fontWeight="600"
                                    fontStyle="normal"
                                    letterSpacing={0}
                                    lineHeight={18}
                                    text="Proceed"
                                />
                            }
                            onPress={handleProceedButton}
                        />
                    </FixedActionContainer>
                </View>
            </ScreenLayout>
        </ScreenContainer>
    );
}

const styles = StyleSheet.create({
    bottomContainer: {
        bottom: 0,
        height: 100,
        width: "100%",
    },
    imageContainer: { marginHorizontal: 20 },
    imageStyles: { height: 200, overflow: "visible", resizeMode: "contain", width: "100%" },
    label: {
        paddingVertical: 8,
    },
    midContainer: { marginHorizontal: "5%", marginTop: 30 },
    verticalSpacing: { marginVertical: 10 },
});

CardsIntro.propTypes = {
    route: PropTypes.object,
    navigation: PropTypes.object,
};

export default CardsIntro;
