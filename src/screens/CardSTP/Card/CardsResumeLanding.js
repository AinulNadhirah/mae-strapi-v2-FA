/* eslint-disable react/jsx-no-bind */
import moment from "moment";
import Numeral from "numeral";
import PropTypes from "prop-types";
import React, { useState, useMemo, useCallback, useEffect } from "react";
import { View, StyleSheet, ScrollView, TouchableOpacity } from "react-native";

import HeaderLayout from "@layouts/HeaderLayout";
import ScreenLayout from "@layouts/ScreenLayout";

import HeaderBackButton from "@components/Buttons/HeaderBackButton";
import HeaderCloseButton from "@components/Buttons/HeaderCloseButton";
import ScreenContainer from "@components/Containers/ScreenContainer";
import Typo from "@components/Text";
import { showErrorToast } from "@components/Toast";

import { cardsInquiry } from "@services";

import { MEDIUM_GREY, WHITE } from "@constants/colors";
import { COMMON_ERROR_MSG, CURRENCY } from "@constants/strings";

function CardsResumeLanding({ navigation, route }) {
    const pr = route?.params ?? {};
    const [featureList] = useState(pr?.resumeData?.completeSaveData ?? []);
    const [master, setMasterData] = useState(pr?.serverData);

    useEffect(() => {
        getMasterData();
    }, [getMasterData]);

    const getMasterData = useCallback(async () => {
        const isPostLogin = route?.params?.postLogin;
        const param = {
            idType: "",
            icNo: "",
            birthDt: "",
            displayIdType: "",
            preOrPostFlag: "preLogin",
        };
        const url = isPostLogin
            ? "loan/v1/cardStp/stpCustInqInfo"
            : "loan/ntb/v1/cardStp/stpCardMasterData";
        const httpResp = await cardsInquiry(param, url, isPostLogin).catch((error) => {
            console.log(" Exception: ", error);
            navigation.canGoBack() && navigation.goBack();
        });
        const result = httpResp?.data?.result ?? null;
        if (!result) {
            return;
        }
        const { statusCode, statusDesc } = result;
        if (statusCode === "0000") {
            setMasterData(result);
        } else {
            navigation.canGoBack() && navigation.goBack();
            showErrorToast({
                message: statusDesc || COMMON_ERROR_MSG,
            });
        }
    }, [navigation, setMasterData, route?.params]);

    const setData = useCallback((data) => {
        return {
            title: data?.stpCustomerTitle ?? "",
            idType: data?.stpIdTypeCode ?? "",
            name: data?.stpCustomerName ?? "",
            dob: data?.stpCustomerDob ?? "",
            idNumber: data?.stpIdno ?? "",
            email: data?.stpEmail ?? "",
            mobileNumber: data?.stpMobileContactNumber ?? "",
            mobilePrefix: data?.stpMobileContactPrefix ?? "",
            educationCode: data?.stpEducationCode ?? "",
            raceCode: data?.stpRaceCode ?? "",
            houseNumber: data?.stpHomeContactNumber ?? "",
            homePrefix: data?.stpHomeContactPrefix ?? "",
            gender: data?.stpGenderCode ?? "",
            marital: data?.stpMaritalStatusCode ?? "",
            nationality: data?.stpNationalityDesc ?? "",
            nameOfCard: data?.stpCustomerNameOnCard ?? "",
            pep: "",
            homeAddress1: data?.stpHomeAddress1 ?? "",
            homeAddress2: data?.stpHomeAddress2 ?? "",
            homeAddress3: data?.stpHomeAddress3 ?? "",
            postcode: data?.stpHomePostcode ?? "",
            city: data?.stpHomeCity ?? "",
            stateValue: data?.stpHomeStateDesc ?? "",
            residential: data?.stpResidentialStatusCode ?? "",
            empName: data?.stpEmployerName ?? "",
            occupationCode: data?.stpOccupationCode ?? "",
            natureOfBusiness: data?.stpBusinessNatureCode ?? "",
            busClassification: data?.stpBusinessClsfCode ?? "",
            sourceIncome: "",
            sector: data?.stpOccupationSectorCode ?? "",
            empType: data?.stpEmploymentTypeDesc ?? "",
            serviceYear: data?.stpServiceLengthYear ?? "",
            serviceMonth: data?.stpServiceLengthMonth ?? "",
            termOfEmployment: data?.stpEmploymentTermsCode ?? "",
            officeAddress1: data?.stpEmployerAddress1 ?? "",
            officeAddress2: data?.stpEmployerAddress2 ?? "",
            officeAddress3: data?.stpEmployerAddress3 ?? "",
            officePostcode: data?.stpEmployerPostcode ?? "",
            officeCity: data?.stpEmployerCity ?? "",
            officePrefix: data?.stpEmployerContactPrefix ?? "",
            officeContact: data?.stpEmployerContactNumber ?? "",
            officeState: data?.stpEmployerStateDesc ?? "",
            income: data?.stpNetIncome ?? "",
            otherIncome: data?.stpOtherCommitments ?? "",
            primryIncome: "",
            wealth: "",
            incomeAfterRetirement: data?.stpRetirementIncomeCode ?? "",
            statementDelivery: data?.stpCardStatementCode ?? "",
            cardCollectionMethod: data?.stpCardCollectionCode ?? "",
            cardCollectionState: data?.stpCardCollectionStateCode ?? "",
            cardCollectionDistrict: data?.stpCardCollectionDistCode ?? "",
            cardCollectionBranch: data?.stpCardColBranchCode ?? "",
        };
    }, []);

    /*const findData = useCallback((masterData, keyName, value) => {
        const array = masterData[keyName];
        const data = array.find((item) => item.name === value || item.value === value);
        return data.name ?? "";
    }, []);*/

    const getDisplayData = useCallback((data, masterData) => {
        console.log(masterData);
        return {
            title: {
                displayKey: "Title",
                //displayValue: findData(masterData, "titles", data?.stpCustomerTitle),
                displayValue: data?.stpCustomerTitle,
                selectedValue: data?.stpCustomerTitle ?? "",
                selectedDisplay: data?.stpCustomerTitle ?? "",
            },
            name: {
                displayKey: "Name as per ID",
                displayValue: data?.stpCustomerName ?? "",
            },
            dob: {
                displayKey: "Date of birth",
                displayValue: moment(data?.stpCustomerDob.replace(/[/]/g, ""), "DDMMYYYY").format(
                    "DD MMM YYYY"
                ),
                selectedValue: data?.stpCustomerDob.replace(/[/]/g, ""),
            },
            idNumber: {
                displayKey: "ID number",
                displayValue: data?.stpIdno,
            },
            email: {
                displayKey: "Email address",
                displayValue: data?.stpEmail,
            },
            mobileNumber: {
                displayKey: "Mobile number",
                displayValue: data?.stpMobileContactPrefix + data?.stpMobileContactNumber,
                selectedValue: data?.stpMobileContactNumber,
            },
            mobilePrefix: {
                displayKey: "Mobile Number Prefix",
                displayValue: data?.stpMobileContactPrefix,
                selectedValue: data?.stpMobileContactPrefix,
                selectedDisplay: data?.stpMobileContactPrefix,
            },
            idType: {
                displayKey: "ID type",
                displayValue: data?.stpIdTypeDesc,
                selectedValue: data?.stpIdTypeCode,
                selectedDisplay: data?.stpIdTypeDesc,
            },
            education: {
                displayKey: "Education level",
                displayValue: data?.stpEducationDesc,
                selectedValue: data?.stpEducationCode,
                selectedDisplay: data?.stpEducationDesc,
            },
            race: {
                displayKey: "Race",
                displayValue: data?.stpRaceDesc,
                selectedValue: data?.stpRaceCode,
                selectedDisplay: data?.stpRaceDesc,
            },
            nameOfCard: {
                displayKey: "Name of card",
                displayValue: data?.stpCustomerNameOnCard,
            },
            houseNumber: {
                displayKey: "House phone number",
                displayValue: data?.stpHomeContactPrefix + data?.stpHomeContactNumber,
                selectedValue: data?.stpHomeContactNumber,
            },
            nationality: {
                displayKey: "Nationality",
                displayValue: data?.stpNationalityDesc,
            },
            gender: {
                displayKey: "Gender",
                displayValue: data?.stpGenderDesc,
                selectedValue: data?.stpGenderCode,
            },
            marital: {
                displayKey: "Marital status",
                displayValue: data?.stpMaritalStatusDesc,
                selectedValue: data?.stpMaritalStatusCode,
                selectedDisplay: data?.stpMaritalStatusDesc,
            },
            pep: {
                displayKey: "Are you a Politically Exposed Person?",
                displayValue: "",
                selectedValue: "",
                selectedDisplay: "",
            },
            homePrefix: {
                displayKey: "Home Phone Prefix",
                displayValue: data?.stpHomeContactPrefix,
                selectedValue: data?.stpHomeContactPrefix,
                selectedDisplay: data?.stpHomeContactPrefix,
            },
            homeAddress1: {
                displayKey: "House address line 1",
                displayValue: data?.stpHomeAddress1,
            },
            homeAddress2: {
                displayKey: "House address line 2",
                displayValue: data?.stpHomeAddress2,
            },
            homeAddress3: {
                displayKey: "House address line 3",
                displayValue: data?.stpHomeAddress3,
            },
            postcode: {
                displayKey: "Postcode",
                displayValue: data?.stpHomePostcode,
            },
            city: {
                displayKey: "City",
                displayValue: data?.stpHomeCity,
            },
            state: {
                displayKey: "State",
                displayValue: data?.stpHomeStateDesc,
                selectedValue: data?.stpHomeStateCode,
                selectedDisplay: data?.stpHomeStateDesc,
            },
            residential: {
                displayKey: "Residential status",
                displayValue: data?.stpResidentialStatusDesc,
                selectedValue: data?.stpResidentialStatusCode,
                selectedDisplay: data?.stpResidentialStatusDesc,
            },
            empName: {
                displayKey: "Employer name ",
                displayValue: data?.stpEmployerName,
            },
            occupation: {
                displayKey: "Occupation",
                displayValue: data?.stpOccupationDesc,
                selectedValue: data?.stpOccupationCode,
                selectedDisplay: data?.stpOccupationDesc,
            },
            businessClassification: {
                displayKey: "Business classification",
                displayValue: data?.stpBusinessClsfDesc,
                selectedValue: data?.stpBusinessClsfCode,
                selectedDisplay: data?.stpBusinessClsfDesc,
            },
            sourceIncome: {
                displayKey: "Source of Income",
                displayValue: "",
                selectedValue: "",
                selectedDisplay: "",
            },
            sector: {
                displayKey: "Sector",
                displayValue: data?.stpOccupationSectorDesc,
                selectedValue: data?.stpOccupationSectorCode,
                selectedDisplay: data?.stpOccupationSectorDesc,
            },
            empType: {
                displayKey: "Employment Type",
                displayValue: data?.stpEmploymentTypeDesc,
                selectedValue: data?.stpEmploymentTypeCode,
                selectedDisplay: data?.stpEmploymentTypeDesc,
            },
            lengthOfService: {
                displayKey: "Length of service",
                displayValue: `${data?.stpServiceLengthYear} years ${data?.stpServiceLengthMonth} months `,
                selectedValue: data?.stpServiceLengthYear,
                selectedDisplay: data?.stpServiceLengthYear,
            },
            serviceYear: {
                displayKey: "Service Year",
                displayValue: data?.stpServiceLengthYear,
                selectedValue: data?.stpServiceLengthYear,
                selectedDisplay: data?.stpServiceLengthYear,
            },
            serviceMonth: {
                displayKey: "Service Months",
                displayValue: data?.stpServiceLengthMonth,
                selectedValue: data?.stpServiceLengthMonth,
                selectedDisplay: data?.stpServiceLengthMonth,
                selectedObj: data?.stpServiceLengthMonth,
            },
            termsOfEmployment: {
                displayKey: "Terms of employment",
                displayValue: data?.stpEmploymentTermsDesc,
                selectedValue: data?.stpEmploymentTermsCode,
                selectedDisplay: data?.stpEmploymentTermsDesc,
            },
            officeAddress1: {
                displayKey: "Office address line 1",
                displayValue: data?.stpEmployerAddress1,
            },
            officeAddress2: {
                displayKey: "Office address line 2",
                displayValue: data?.stpEmployerAddress2,
            },
            officeAddress3: {
                displayKey: "Office address line 3",
                displayValue: data?.stpEmployerAddress3,
            },
            officePostcode: {
                displayKey: "Postcode",
                displayValue: data?.stpEmployerPostcode,
            },
            officeCity: {
                displayKey: "City",
                displayValue: data?.stpEmployerCity,
            },
            officePrefix: {
                displayKey: "Office Phone Prefix",
                displayValue: data?.stpEmployerContactPrefix,
                selectedValue: data?.stpEmployerContactPrefix,
                selectedDisplay: data?.stpEmployerContactPrefix,
            },
            officeContact: {
                displayKey: "Office phone number",
                displayValue: data?.stpEmployerContactPrefix + data?.stpEmployerContactNumber,
                selectedValue: data?.stpEmployerContactNumber,
            },
            officeState: {
                displayKey: "State",
                displayValue: data?.stpEmployerStateDesc,
                selectedValue: data?.stpEmployerStateCode,
                selectedDisplay: data?.stpEmployerStateDesc,
            },
            income: {
                displayKey: "Monthly net income",
                displayValue: CURRENCY + Numeral(data?.stpNetIncome).format("0,0.00"),
                selectedValue: data?.stpNetIncome,
            },
            otherIncome: {
                displayKey: "Other monthly commitments",
                displayValue: CURRENCY + Numeral(data?.stpOtherCommitments).format("0,0.00"),
                selectedValue: data?.stpOtherCommitments,
            },
            primaryIncome: {
                displayKey: "Primary Income",
                displayValue: "",
                selectedValue: "",
                selectedDisplay: "",
            },
            wealth: {
                displayKey: "Source of Wealth",
                displayValue: "",
                selectedValue: "",
                selectedDisplay: "",
                selectedObj: "",
            },
            incomeAfterRetirement: {
                displayKey: "Income after retirement",
                displayValue: data?.stpRetirementIncomeDesc,
                selectedValue: data?.stpRetirementIncomeCode,
                selectedDisplay: data?.stpRetirementIncomeDesc,
            },
            statementDelivery: {
                displayKey: "Statement delivery",
                displayValue: data?.stpCardStatementDesc,
                selectedValue: data?.stpCardStatementCode,
                selectedDisplay: data?.stpCardStatementDesc,
            },
            cardCollectionMethod: {
                displayKey: "Card collection Method",
                displayValue: data?.stpCardCollectionDesc,
                selectedValue: data?.stpCardCollectionCode,
                selectedDisplay: data?.stpCardCollectionDesc,
            },
            cardCollectionState: {
                displayKey: "Card collection state",
                displayValue: data?.stpCardCollectionStateDesc,
                selectedValue: data?.stpCardCollectionStateCode,
                selectedDisplay: data?.stpCardCollectionStateDesc,
            },
            cardCollectionDistrict: {
                displayKey: "Card collection area/district",
                displayValue: data?.stpCardCollectionDistDesc,
                selectedValue: data?.stpCardCollectionDistCode,
                selectedDisplay: data?.stpCardCollectionDistDesc,
            },
            cardCollectionBranch: {
                displayKey: "Card collection branch",
                displayValue: data?.stpCardColBranchName,
                selectedValue: data?.stpCardColBranchCode,
                selectedDisplay: data?.stpCardColBranchName,
            },
        };
    }, []);

    function handleBack() {
        navigation.canGoBack() && navigation.goBack();
    }

    function handleClose() {
        navigation.navigate(route?.params?.entryStack || "More", {
            screen: route?.params?.entryScreen || "Apply",
            params: route?.params?.entryParams,
        });
    }

    const creditCardList = useMemo(() => {
        function onSelectCard(value) {
            //need add
            if (value?.stpSuppIdno) {
                navigation.navigate("CardSuppUploadDocs", {
                    ...route?.params,
                    serverDate: "",
                });
                return;
            }
            const param = route?.params ?? {};
            const populateObj = setData(value);
            const obj = getDisplayData(value, master?.masterData);
            const flow = value?.stpScreenResume;
            let screenName = "";

            switch (flow) {
                case "NC01":
                case "01":
                    screenName = "CardsEmployer";
                    break;
                case "NC02":
                case "02":
                    screenName = "CardsCollection";
                    break;
                case "NC03":
                case "03":
                    screenName = "CardsConfirmation";
                    break;
                case "NC04":
                case "04":
                case "NC03UPDATE":
                    screenName = "CardsUploadDocs";
                    break;
                default:
                    break;
            }

            const selectedCard = value?.cardDispArr.map((item) => ({
                ...item,
                displayValue: item?.level1 ?? item?.label1,
                image: item?.cardImagePath,
            }));

            navigation.navigate(screenName, {
                ...param,
                populateObj,
                serverData: { ...master, stpRefNo: value?.stpReferenceNo },
                isResume: true,
                isSoleProp: value?.stpBusinessClsfCode === "O",
                userAction: {
                    ...param?.userAction,
                    ...obj,
                    selectedCard,
                },
            });
        }

        return featureList.map((item, index) => {
            console.log(item);
            return (
                <View key={index} style={styles.listView}>
                    <TouchableOpacity activeOpacity={1} onPress={() => onSelectCard(item)}>
                        <View style={styles.cardFeatureListClickable}>
                            <View style={styles.cardItemContainer}>
                                <View style={styles.cardRowContainer}>
                                    <View style={styles.cardItemSubContainer}>
                                        <Typo
                                            fontSize={12}
                                            fontWeight="400"
                                            lineHeight={18}
                                            textAlign="left"
                                            text="Ref ID"
                                        />

                                        <Typo
                                            fontSize={14}
                                            fontWeight="600"
                                            textAlign="left"
                                            style={styles.cardItemName}
                                            text={item?.stpReferenceNo}
                                        />
                                        <Typo
                                            fontSize={12}
                                            fontWeight="400"
                                            lineHeight={18}
                                            textAlign="left"
                                            //style={styles.cardItemName}
                                            text="Type of Application"
                                        />

                                        <Typo
                                            fontSize={14}
                                            fontWeight="600"
                                            textAlign="left"
                                            style={styles.cardItemName}
                                            text={item?.stpApplicationTypeDesc}
                                        />
                                        <View style={styles.bottomPanel}>
                                            <View>
                                                <Typo
                                                    fontSize={12}
                                                    fontWeight="400"
                                                    textAlign="left"
                                                    //style={styles.cardItemName}
                                                    text="Date Created"
                                                />
                                                <Typo
                                                    fontSize={14}
                                                    fontWeight="600"
                                                    textAlign="left"
                                                    style={styles.cardItemName}
                                                    text={moment(item?.stpCreateTime).format(
                                                        "DD MMM YYYY"
                                                    )}
                                                />
                                            </View>
                                            <View>
                                                <Typo
                                                    fontSize={12}
                                                    fontWeight="400"
                                                    textAlign="left"
                                                    //style={styles.cardItemName}
                                                    text="Application Expires"
                                                />
                                                <Typo
                                                    fontSize={14}
                                                    fontWeight="600"
                                                    textAlign="left"
                                                    style={styles.cardItemName}
                                                    text={moment(item?.stpEndSubmissionDate).format(
                                                        "DD MMM YYYY"
                                                    )}
                                                />
                                            </View>
                                        </View>
                                    </View>
                                </View>
                            </View>
                        </View>
                    </TouchableOpacity>
                </View>
            );
        });
    }, [featureList, getDisplayData, master, navigation, route?.params, setData]);

    return (
        <ScreenContainer backgroundType="color" backgroundColor={MEDIUM_GREY}>
            <>
                <ScreenLayout
                    paddingBottom={0}
                    paddingTop={0}
                    paddingHorizontal={0}
                    header={
                        <HeaderLayout
                            headerRightElement={<HeaderCloseButton onPress={handleClose} />}
                            headerLeftElement={<HeaderBackButton onPress={handleBack} />}
                        />
                    }
                    useSafeArea
                    neverForceInset={["bottom"]}
                >
                    <View style={styles.container}>
                        <View style={styles.copy}>
                            <Typo
                                fontSize={14}
                                fontWeight="600"
                                lineHeight={28}
                                text="Credit Card Application"
                                textAlign="left"
                            />
                            <Typo
                                fontSize={20}
                                fontWeight="300"
                                lineHeight={28}
                                style={styles.label}
                                text="Select an application to continue where you left off"
                                textAlign="left"
                            />
                        </View>
                        <ScrollView horizontal={false} showsVerticalScrollIndicator={false}>
                            {creditCardList}
                        </ScrollView>
                    </View>
                </ScreenLayout>
            </>
        </ScreenContainer>
    );
}

CardsResumeLanding.propTypes = {
    route: PropTypes.object,
    navigation: PropTypes.object,
};

const styles = StyleSheet.create({
    bottomPanel: {
        alignContent: "flex-start",
        flexDirection: "row",
        justifyContent: "space-between",
    },
    cardFeatureListClickable: {
        backgroundColor: WHITE,
        borderRadius: 8,
    },
    cardItemContainer: { margin: 20, paddingRight: 10 },
    cardItemName: { marginBottom: 10, marginVertical: 5 },
    cardItemSubContainer: {
        flexDirection: "column",
        justifyContent: "space-between",
        paddingRight: 15,
        width: "90%",
    },

    cardRowContainer: {
        alignContent: "flex-end",
        flexDirection: "row",
        justifyContent: "space-between",
    },
    container: {
        flex: 1,
    },
    copy: {
        marginBottom: 2,
        paddingHorizontal: 36,
    },
    label: {
        marginBottom: 24,
    },
    listView: {
        marginBottom: 14,
        paddingHorizontal: 36,
    },
});

export default CardsResumeLanding;
