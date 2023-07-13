import PropTypes from "prop-types";
import React, { useCallback, useEffect, useState } from "react";
import { View, ScrollView, StyleSheet } from "react-native";

import {
    BANKINGV2_MODULE,
    UNIT_TRUST_EDIT_EMPLOYMENT_DETAILS,
    UNIT_TRUST_EDIT_PERSONAL_DETAILS,
    UNIT_TRUST_OPENING_DECLARATION,
} from "@navigation/navigationConstant";

import ActionButton from "@components/Buttons/ActionButton";
import HeaderCloseButton from "@components/Buttons/HeaderCloseButton";
import ScreenContainer from "@components/Containers/ScreenContainer";
import FixedActionContainer from "@components/Footers/FixedActionContainer";
import FormInline from "@components/FormComponents/FormInline";
import HeaderLayout from "@components/Layouts/HeaderLayout";
import ScreenLayout from "@components/Layouts/ScreenLayout";
import ScreenLoader from "@components/Loaders/ScreenLoader";
import Typo from "@components/Text";
import { showErrorToast } from "@components/Toast";

import { customerEligibilityCheck, getUTReferenceData } from "@services";
import { logEvent } from "@services/analytics";

import { BLACK, DISABLED, DISABLED_TEXT, MEDIUM_GREY, YELLOW } from "@constants/colors";
import {
    CONFIRMATION,
    CONTINUE,
    FA_FIN_GOAL_APPLY_UT_CONFIRM,
    FA_SCREEN_NAME,
    FA_VIEW_SCREEN,
} from "@constants/strings";

import { maskAddress, maskEmail, maskMobileNo } from "@utils/dataModel/utilityFinancialGoals";

const UnitTrustOpeningConfirmation = ({ navigation, route }) => {
    const [response, setResponse] = useState(null);
    const [referenceData, setReferenceData] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [buttonEnabled, setButtonEnabled] = useState(true);

    useEffect(() => {
        logEvent(FA_VIEW_SCREEN, {
            [FA_SCREEN_NAME]: FA_FIN_GOAL_APPLY_UT_CONFIRM,
        });
    }, []);

    useEffect(() => {
        fetchCustomerEligibilityCheck();
        getReferenceData();
    }, [fetchCustomerEligibilityCheck, getReferenceData]);

    const fetchCustomerEligibilityCheck = useCallback(async () => {
        try {
            setIsLoading(true);
            const response = await customerEligibilityCheck(null, true);

            if (response?.data) {
                setIsLoading(false);
                setResponse(response?.data?.result);

                // handle CEP error due to coming from success response but with error code 400
                if (response?.data?.message && response?.data?.code === 400) {
                    showErrorToast({ message: response?.data?.message });
                    setButtonEnabled(false);
                }
            } else {
                setIsLoading(false);
                showErrorToast({ message: "Something went wrong" });
            }
        } catch (error) {
            setIsLoading(false);
            showErrorToast({ message: error?.message });
        }
    }, []);

    const getReferenceData = useCallback(async () => {
        try {
            const response = await getUTReferenceData(true);

            if (response?.data) {
                setReferenceData(response?.data?.result);
            }
        } catch (error) {
            showErrorToast({ message: error?.message });
        }
    }, []);

    function onCrossButtonPress() {
        navigation.goBack();
    }

    const personalDetails = (() => {
        return [
            { Name: route?.params?.name ?? response?.registeredName },
            {
                "Address line 1":
                    route?.params?.addr1 || response?.homeAddr1
                        ? maskAddress(route?.params?.addr1 ?? response?.homeAddr1)
                        : " ",
            },
            {
                "Address line 2":
                    route?.params?.addr2 || response?.homeAddr2
                        ? maskAddress(route?.params?.addr2 ?? response?.homeAddr2)
                        : " ",
            },
            {
                "Address line 3":
                    route?.params?.addr3 || response?.homeAddr3
                        ? maskAddress(route?.params?.addr3 ?? response?.homeAddr3)
                        : " ",
            },
            { Postcode: route?.params?.postcode || response?.homePostCode || " " },
            { City: route?.params?.city || response?.homeCity || " " },
            { Country: route?.params?.countryValue || response?.homeCountryValue || " " },
            {
                State: route?.params?.stateValue || response?.homeStateValue || "",
            },
            {
                "Mobile number":
                    route?.params?.mobileNo || response?.mobPhoneNumber
                        ? maskMobileNo(route?.params?.mobileNo ?? response?.mobPhoneNumber)
                        : " ",
            },
            {
                "Home number":
                    route?.params?.homePhoneNo || response?.homePhoneNumber
                        ? maskMobileNo(route?.params?.homePhoneNo ?? response?.homePhoneNumber)
                        : " ",
            },
            {
                "Email address":
                    route?.params?.email || response?.email
                        ? maskEmail(route?.params?.email ?? response?.email)
                        : " ",
            },
        ];
    })();

    const employmentDetails = (() => {
        const data = [
            { Occupation: route?.params?.occupation || response?.occupationValue || " " },
            {
                "Employment Type":
                    route?.params?.employmentType || response?.employmentTypeValue || " ",
            },
            {
                "Occupation Sector":
                    route?.params?.occupationSector || response?.occupationSectorValue || " ",
            },
            { "Employer Name": route?.params?.employerName || response?.employerName || " " },
            {
                "Income Range":
                    route?.params?.incomeRange || response?.grossIncomeRangeValue || " ",
            },
            {
                "Country of Employer":
                    route?.params?.employerCountry || response?.officeCountryValue || " ",
            },
        ];

        return data;
    })();

    function editPersonalDetails() {
        navigation.navigate(BANKINGV2_MODULE, {
            screen: UNIT_TRUST_EDIT_PERSONAL_DETAILS,
            params: {
                name: route?.params?.name ?? response?.registeredName,
                addr1: route?.params?.addr1 ?? response?.homeAddr1,
                addr2: route?.params?.addr2 ?? response?.homeAddr2,
                addr3: route?.params?.addr3 ?? response?.homeAddr3,
                postcode: route?.params?.postcode ?? response?.homePostCode,
                city: route?.params?.city ?? response?.homeCity,
                country: route?.params?.countryValue ?? response?.homeCountryValue,
                countryCode: route?.params?.countryCode ?? response?.homeCountryCode,
                state: route?.params?.stateValue ?? response?.homeStateValue,
                stateCode: route?.params?.stateCode ?? response?.homeStateCode,
                mobileNo: route?.params?.mobileNo ?? response?.mobPhoneNumber,
                mobCountryCode: route?.params?.mobCountryCode ?? response?.mobCountryCode,
                homePhoneNo: route?.params?.homePhoneNo ?? response?.homePhoneNumber,
                email: route?.params?.email ?? response?.email,
                countryOptions: referenceData?.MDM_PARTY_ADDRESS_COUNTRY,
                stateOptions: referenceData,
            },
        });
    }

    function editEmploymentDetails() {
        navigation.navigate(BANKINGV2_MODULE, {
            screen: UNIT_TRUST_EDIT_EMPLOYMENT_DETAILS,
            params: {
                occupation: route?.params?.occupation ?? response?.occupationValue,
                occupationCode: route?.params?.occupationCode ?? response?.occupationCode,
                occupationOptions: referenceData?.MDM_PARTY_OCCUPATION,
                employmentType: route?.params?.employmentType ?? response?.employmentTypeValue,
                employmentTypeCode:
                    route?.params?.employmentTypeCode ?? response?.employmentTypeCode,
                employmentTypeOptions: referenceData?.MDM_PARTY_EMPLOYMENT_TYPE,
                occupationSector:
                    route?.params?.occupationSector ?? response?.occupationSectorValue,
                occupationSectorCode:
                    route?.params?.occupationSectorCode ?? response?.occupationSectorCode,
                occupationSectorOptions: referenceData?.MDM_PARTY_OCCUPATION_SECTOR,
                employerName: route?.params?.employerName ?? response?.employerName,
                incomeRange: route?.params?.incomeRange ?? response?.grossIncomeRangeValue,
                incomeRangeCode: route?.params?.incomeRangeCode ?? response?.grossIncomeRangeCode,
                incomeRangeOptions: referenceData?.MDM_PARTY_INCOME_RANGE,
                employerCountry: route?.params?.employerCountry ?? response?.officeCountryValue,
                employerCountryCode:
                    route?.params?.employerCountryCode ?? response?.officeCountryCode,
                employerCountryOptions: referenceData?.MDM_PARTY_ADDRESS_COUNTRY,
            },
        });
    }

    function onPressContinue() {
        const eligibleData = {
            ...response,
            //personal details
            name: route?.params?.name ?? response?.registeredName,
            homeAddr1: route?.params?.addr1 ?? response?.homeAddr1,
            homeAddr2: route?.params?.addr2 ?? response?.homeAddr2,
            homeAddr3: route?.params?.addr3 ?? response?.homeAddr3,
            homePostCode: route?.params?.postcode ?? response?.homeStateCode,
            homeCity: route?.params?.city ?? response?.homeCity,
            homeCountryCode: route?.params?.countryCode ?? response?.homeCountryCode,
            homeCountryValue: route?.params?.countryValue ?? response?.homeCountryValue,
            mobPhoneNumber: route?.params?.mobileNo ?? response?.mobPhoneNumber,
            homePhoneNumber: route?.params?.homePhoneNo ?? response?.homePhoneNumber,
            email: route?.params?.email ?? response?.email,
            //employment details
            occupationCode: route?.params?.occupationCode ?? response?.occupationCode,
            occupationValue: route?.params?.occupation ?? response?.occupationValue,
            employmentTypeCode: route?.params?.employmentTypeCode ?? response?.employmentTypeCode,
            employmentTypeValue: route?.params?.employmentType ?? response?.employmentTypeValue,
            occupationSectorCode:
                route?.params?.occupationSectorCode ?? response?.occupationSectorCode,
            occupationSectorValue:
                route?.params?.occupationSector ?? response?.occupationSectorValue,
            employerName: route?.params?.employerName ?? response?.employerName,
            grossIncomeRangeCode: route?.params?.incomeRangeCode ?? response?.grossIncomeRangeCode,
            grossIncomeRangeValue: route?.params?.incomeRange ?? response?.grossIncomeRangeValue,
            officeCountryCode: route?.params?.employerCountryCode ?? response?.officeCountryCode,
            officeCountryValue: route?.params?.employerCountry ?? response?.officeCountryValue,
        };
        navigation.navigate(BANKINGV2_MODULE, {
            screen: UNIT_TRUST_OPENING_DECLARATION,
            params: {
                referenceData: {
                    sourceOfFund: referenceData?.MDM_PARTY_SRC_OF_FUNDS_ORIGIN,
                    sourceOfWealth: referenceData?.MDM_PARTY_SRC_OF_WEALTH_ORIGIN,
                },
                eligibleData,
                clientRiskDate: route?.params?.clientRiskDate,
                gbiRiskLevel: route?.params?.gbiRiskLevel,
                fromScreen: route?.params?.fromScreen,
                crossButtonScreen: route?.params?.fromScreen,
            },
        });
    }

    if (isLoading) {
        return <ScreenLoader showLoader={isLoading} />;
    } else {
        return (
            <ScreenContainer backgroundType="color" backgroundColor={MEDIUM_GREY}>
                <ScreenLayout
                    header={
                        <HeaderLayout
                            headerRightElement={<HeaderCloseButton onPress={onCrossButtonPress} />}
                            headerCenterElement={
                                <Typo
                                    fontSize={16}
                                    fontWeight="600"
                                    lineHeight={19}
                                    text={CONFIRMATION}
                                />
                            }
                        />
                    }
                    useSafeArea
                    paddingHorizontal={0}
                    paddingBottom={0}
                >
                    <ScrollView contentContainerStyle={styles.scrollBottomPadding}>
                        <View style={styles.headerText}>
                            <Typo
                                text="Unit Trust Account Application"
                                fontSize={14}
                                fontWeight="400"
                                textAlign="left"
                                lineHeight={20}
                            />
                            <Typo
                                text="Please confirm the details below before submission"
                                fontSize={16}
                                fontWeight="600"
                                textAlign="left"
                                lineHeight={22}
                            />
                        </View>

                        <FormInline
                            title="Personal Details"
                            titleFont={14}
                            titleFontWeight="600"
                            buttonTitle="Edit"
                            buttonFont={14}
                            buttonAction={editPersonalDetails}
                            buttonValue="personalDetails"
                            subTextArray={personalDetails}
                            minLength={3}
                            maxLength={30}
                        />
                        <FormInline
                            title="Employment Details"
                            titleFont={14}
                            titleFontWeight="600"
                            buttonTitle="Edit"
                            buttonFont={14}
                            buttonAction={editEmploymentDetails}
                            buttonValue="employmentDetails"
                            subTextArray={employmentDetails}
                            minLength={3}
                            maxLength={30}
                        />
                    </ScrollView>
                    <FixedActionContainer>
                        <ActionButton
                            fullWidth
                            componentCenter={
                                <Typo
                                    text={CONTINUE}
                                    fontWeight="600"
                                    fontSize={14}
                                    color={buttonEnabled ? BLACK : DISABLED_TEXT}
                                />
                            }
                            backgroundColor={buttonEnabled ? YELLOW : DISABLED}
                            disabled={!buttonEnabled}
                            onPress={onPressContinue}
                        />
                    </FixedActionContainer>
                </ScreenLayout>
            </ScreenContainer>
        );
    }
};

UnitTrustOpeningConfirmation.propTypes = {
    navigation: PropTypes.object,
    route: PropTypes.object,
};

const styles = StyleSheet.create({
    headerText: {
        paddingHorizontal: 24,
    },
    scrollBottomPadding: { paddingBottom: 24 },
});

export default UnitTrustOpeningConfirmation;
