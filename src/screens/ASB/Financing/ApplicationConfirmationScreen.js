import AsyncStorage from "@react-native-community/async-storage";
import moment from "moment";
import numeral from "numeral";
import PropTypes from "prop-types";
import React, { useEffect, useState, useRef } from "react";
import { StyleSheet, View, ScrollView, Platform, TouchableOpacity } from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { useDispatch, useSelector } from "react-redux";

import { maskAddress, maskMobile, maskEmail } from "@screens/PLSTP/PLSTPController";
import { removeCommas } from "@screens/PLSTP/PLSTPController";

import {
    CURRENT_LOCATION,
    APPLICATIONCONFIRMATION,
    PERSONAL_INFORMATION,
    OCCUPATION_INFORMATION,
    ADDITIONALDETAILSINCOME,
    APPLICATIONCONFIRMAUTH,
    APPLY_LOANS,
    ELIGIBILITY_SOFT_FAIL,
    ASB_DECLARATION,
} from "@navigation/navigationConstant";

import HeaderLayout from "@layouts/HeaderLayout";
import ScreenLayout from "@layouts/ScreenLayout";

import ActionButton from "@components/Buttons/ActionButton";
import HeaderBackButton from "@components/Buttons/HeaderBackButton";
import HeaderCloseButton from "@components/Buttons/HeaderCloseButton";
import ScreenContainer from "@components/Containers/ScreenContainer";
import FixedActionContainer from "@components/Footers/FixedActionContainer";
import SpaceFiller from "@components/Placeholders/SpaceFiller";
import Popup from "@components/Popup";
import Typo from "@components/Text";
import { showErrorToast, showInfoToast } from "@components/Toast";

import {
    scorePartyApi,
    asbCheckEligibilityService,
    applicationDetailsApi,
    updateApiCEP,
} from "@services";
import { logEvent } from "@services/analytics";

import { ELIGIBILITY_SUCCESS } from "@redux/actions/ASBFinance/eligibilityCheckAction";
import { resumeAction } from "@redux/actions/ASBFinance/resumeAction";

import { ROYAL_BLUE, WHITE, APPROX_SUVA_GREY } from "@constants/colors";
import {
    CONFIRMATION,
    FINANCING_DETAILS,
    EDIT,
    TYPE_OF_FINANCING,
    AMOUNT_NEED,
    ASNB_ACCOUNT,
    NO_OF_CERTIFICATE,
    TENURE,
    MONTHLY_PAYMENT,
    PLSTP_SUCCESS_ADDON,
    MONTHLY_GROSS_INC,
    TOTAL_MONTHLY_NONBANK_COMMITMENTS,
    PREFERRED_BRANCH_DETAILS,
    AREA,
    STEPUP_MAE_BRANCH,
    ASB_PERSONAL_DETAILS,
    PLSTP_EDUCATION,
    EMAIL_LBL,
    COUNTRY_LBL,
    STEPUP_MAE_ADDRESS_POSTAL,
    STEPUP_MAE_ADDRESS_STATE,
    STEPUP_MAE_ADDRESS_CITY,
    SUBMIT,
    ASB_EMPLOYMENT_DETAILS,
    STEPUP_MAE_OCUPATION,
    STEPUP_MAE_SECTOR,
    ARE_YOU_SURE_YOU_WANT_TO_LEAVE_TITLE,
    ARE_YOU_SURE_YOU_WANT_TO_LEAVE_DESC,
    STEPUP_MAE_RACE,
    MARITAL_STATUS,
    ASB_MOBILE_NUMBER,
    ASB_ADDRESS_LINE_ONE,
    ASB_ADDRESS_LINE_TWO,
    ASB_ADDRESS_LINE_THREE,
    ASB_EMPLOYER_NAME,
    ASB_EMPLOYMENT_TYPE,
    OFFICE_ADDR1,
    OFFICE_ADDR2,
    OFFICE_ADDR3,
    OFFICE_PHNO,
    COMMON_ERROR_MSG,
    OFFER_UPDATED,
    OFFER_UPDATED_DESCRIPTION,
    FA_VIEW_SCREEN,
    FA_SCREEN_NAME,
    LEAVE,
    CANCEL,
    OKAY,
    INTEREST_PROFIT_RATE,
    LEAVE_APPLICATION_GA,
} from "@constants/strings";

const ApplicationConfirmation = (props) => {
    const { navigation } = props;
    const { route } = props;
    // Hooks to dispatch reducer action
    const dispatch = useDispatch();
    const prePostQualReducer = useSelector((state) => state.asbServicesReducer.prePostQualReducer);
    const [loading, setLoading] = useState(false);
    const [showPopupConfirm, setShowPopupConfirm] = useState(false);
    const [result, setResponse] = useState();
    const [eligibilityResult, setEligibilityResult] = useState();
    const [stpHomeCountry, setStpHomeCountry] = useState("");
    const [stpEmployerCountry, setStpEmployerCountry] = useState("");
    const [showPopupOffer, setShowPopupOffer] = useState(false);
    const [riskValue, setRiskValue] = useState("");

    const masterDataReducer = useSelector((state) => state.asbServicesReducer.masterDataReducer);
    // Resume
    const resumeReducer = useSelector((state) => state.resumeReducer);
    const eligibilityReducer = useSelector((state) => state.eligibilityReducer);
    const resumeStpDetails = resumeReducer?.stpDetails;
    // End Resume

    const stpReferenceNumber =
        prePostQualReducer?.stpreferenceNo ?? resumeReducer?.stpDetails?.stpReferenceNo;

    const idNo = resumeReducer?.stpDetails?.stpIdno ?? prePostQualReducer?.idNo;

    const raceCode = resumeReducer?.stpDetails?.stpRaceDesc ?? prePostQualReducer?.raceValue;

    const checkEligibilityResponse =
        resumeReducer?.stpDetails?.stpEligibilityResponse ?? eligibilityReducer?.eligibilitData;

    const lastUpdatedDate =
        resumeReducer?.stpDetails?.stpLastUpdatedDate ?? prePostQualReducer?.lastUpdatedDate;

    const prevPostCodeRef = useRef();

    useEffect(() => {
        init();
        const navFocusListener = navigation.addListener("focus", () => {
            // The screen is focused
            // Call any action
            init();
        });

        // Return the function to unsubscribe from the event so it gets removed on unmount
        if (!navFocusListener) {
            return navFocusListener;
        }
    }, [navigation]);

    const init = async () => {
        try {
            const stpReferenceNo = await stpReferenceNumber;
            const idNumber = await idNumber;
            const data = {
                stpReferenceNo,
                idNumber: idNo,
            };

            const response = await applicationDetailsApi(data, true);
            if (response) {
                if (
                    response?.data?.message === "Success" &&
                    response?.data?.result?.msgBody?.stpApp
                ) {
                    setResponse && setResponse(response.data.result.msgBody.stpApp);

                    const eligibilityCheckData =
                        response.data.result.msgBody.stpApp.stpEligibilityResponse;
                    let eligibilityCheckOutcome;
                    if (
                        eligibilityCheckData?.eligibilityCheckOutcome != null ||
                        eligibilityCheckData?.eligibilityCheckOutcome != undefined ||
                        eligibilityCheckData?.eligibilityCheckOutcome
                    ) {
                        eligibilityCheckOutcome = eligibilityCheckData?.eligibilityCheckOutcome;
                    } else {
                        eligibilityCheckOutcome =
                            JSON.parse(eligibilityCheckData)?.eligibilityCheckOutcome;
                    }

                    let xyz;
                    eligibilityCheckOutcome.map((data) => {
                        if (data.dataType === "Recomendation") {
                            xyz = data;
                        } else {
                            xyz = data;
                        }
                    });

                    setEligibilityResult(xyz);

                    const result = response.data.result.msgBody.stpApp;
                    const stpData = response?.data?.result?.msgBody?.stpApp;
                    const loanInformation = {
                        stpId: stpData?.stpUserId,
                        downpayment: 0,
                        financingType: "C",
                        loanFinancingAmountRM: parseInt(removeCommas(stpData?.stpLoanAmount)),
                        loanTenure: parseInt(stpData?.stpTenure),
                    };
                    const resumeResponse = JSON.stringify(response?.data?.result?.msgBody?.stpApp);
                    const eligibilityData = JSON.parse(result?.stpEligibilityResponse);
                    const resumeData = JSON.parse(resumeResponse);
                    dispatch(resumeAction(resumeData, loanInformation, eligibilityData));
                    dispatch({
                        type: ELIGIBILITY_SUCCESS,
                        data: eligibilityData,
                    });
                    // *******************************************
                    dispatch({
                        screenNo: "10",
                        type: "RESUME_UPDATE",
                        stpEmail: result.stpEmail,
                        stpHomeAddress1: result.stpHomeAddress1,
                        stpHomeAddress2: result.stpHomeAddress2,
                        stpHomeAddress3: result.stpHomeAddress3,
                        stpHomePostcode: result.stpHomePostcode,
                        stpHomeCity: result.stpHomeCity,
                        // stpMobileContactNumber: result.stpMobileContactNumber,
                        stpMaritalStatusDesc: result.stpMaritalStatusDesc,
                        stpMaritalStatusCode: result.stpMaritalStatusCode,
                        stpEducationCode: result.stpEducationCode,
                        stpEducationDesc: result.stpEducationDesc,
                        stpHomeCountry: result.stpHomeCountry,
                        stpHomeStateCode: result.stpHomeStateCode,
                        stpHomeStateDesc: result.stpHomeStateDesc,
                    });

                    dispatch({
                        screenNo: "11",
                        type: "RESUME_UPDATE",
                        stpEmployerName: result.stpEmployerName,
                        stpOccupationDesc: result.stpOccupationDesc,
                        stpOccupationSectorCode: result.stpOccupationSectorCode,
                        stpEmploymentTypeDesc: result.stpEmploymentTypeDesc,
                    });

                    let stpEmployerCountryCodeRs = "";

                    const stpFilteredHomeCountryResume = masterDataReducer?.country?.filter(
                        (employee) => {
                            return employee.value === result?.stpEmployerCountry;
                        }
                    );

                    if (stpFilteredHomeCountryResume && stpFilteredHomeCountryResume.length > 0) {
                        stpEmployerCountryCodeRs = stpFilteredHomeCountryResume[0].value;
                    }

                    dispatch({
                        screenNo: "12",
                        type: "RESUME_UPDATE",
                        stpMobileContactNumber: result.stpMobileContactNumber,
                        stpEmployerAddress1: result.stpEmployerAddress1,
                        stpEmployerAddress2: result.stpEmployerAddress2,
                        stpEmployerAddress3: result.stpEmployerAddress3,
                        stpEmployerPostcode: result.stpEmployerPostcode,
                        stpEmployerCity: result.stpEmployerCity,
                        stpEmployerStateDesc: result.stpEmployerStateDesc,
                        stpEmployerStateCode: result.stpEmployerStateCode,
                        stpEmployerCountry: stpEmployerCountryCodeRs && stpEmployerCountryCodeRs,
                        stpEmployerContactNumber: result?.stpEmployerContactNumber,
                    });

                    const stpFilteredHomeCountry = masterDataReducer?.country?.filter(
                        (employee) => {
                            return employee.value === result.stpHomeCountry;
                        }
                    );

                    if (stpFilteredHomeCountry && stpFilteredHomeCountry.length > 0) {
                        setStpHomeCountry(stpFilteredHomeCountry[0].name);
                    }
                    const stpFilteredEmployeeCountry = masterDataReducer?.country?.filter(
                        (employee) => {
                            return employee.value === result.stpEmployerCountry;
                        }
                    );
                    if (stpFilteredEmployeeCountry && stpFilteredEmployeeCountry.length > 0) {
                        setStpEmployerCountry(stpFilteredEmployeeCountry[0].name);
                    }
                }
            }
        } catch (error) {}
    };

    function onBackTap() {
        if (resumeStpDetails) {
            navigation.navigate(ASB_DECLARATION);
        } else {
            navigation.goBack();
        }
    }

    function onCloseTap() {
        logEvent(FA_VIEW_SCREEN, {
            [FA_SCREEN_NAME]: LEAVE_APPLICATION_GA,
        });
        setShowPopupConfirm(true);
    }

    function onPopupCloseConfirm() {
        setShowPopupConfirm(false);
    }

    async function handleLeaveButton() {
        setShowPopupConfirm(false);

        const response = await saveUpdateData();

        if (response.msgHeader.responseCode === "0000") {
            navigation.navigate(APPLY_LOANS);
        } else {
            showErrorToast({
                message: COMMON_ERROR_MSG,
            });
        }
    }

    async function handleOkayButton() {
        setShowPopupOffer(false);
        await checkEligibilityApi();
    }

    async function onNextTap() {
        try {
            const stpReferenceNo = await stpReferenceNumber;
            const data = {
                stpReferenceNo,
            };

            setLoading(true);
            const response = await scorePartyApi(data, false);
            if (response?.data?.message === "Success") {
                const responseJsonString =
                    response?.data?.result?.responseJsonString &&
                    JSON.parse(response.data.result.responseJsonString.replace(/\r\n/, ""));

                AsyncStorage.setItem("applicationDetailResponse", JSON.stringify(result));
                const body = {
                    screenNo: "9",
                    stpReferenceNo,
                    customerRiskRatingCode: responseJsonString?.customerRiskRating?.code,
                    customerRiskRatingValue: responseJsonString?.customerRiskRating?.value,
                    manualRiskRatingCode: responseJsonString?.manualRiskRating?.code,
                    manualRiskRatingValue: responseJsonString?.manualRiskRating?.value,
                    assessmentId: responseJsonString?.assessmentId,
                };
                const updateResponse = await updateApiCEP(body, false);
                const resultSave = updateResponse?.data?.result;

                if (resultSave) {
                    let postcode = "";
                    let state = "";
                    if (prevPostCodeRef?.current) {
                        postcode = prevPostCodeRef && prevPostCodeRef?.current.postcode;
                        state = prevPostCodeRef && prevPostCodeRef?.current.state;
                    }

                    if (
                        !!postcode &&
                        !!state &&
                        (result?.stpHomePostcode !== postcode || result?.stpHomeStateDesc !== state)
                    ) {
                        setShowPopupOffer(true);
                        setRiskValue(responseJsonString?.customerRiskRating?.value);
                    } else {
                        if (responseJsonString?.customerRiskRating?.value === "HIGH RISK") {
                            navigation.navigate(ADDITIONALDETAILSINCOME);
                        } else {
                            navigation.navigate(APPLICATIONCONFIRMAUTH, {
                                checkEligibilityResponse,
                            });
                        }
                    }
                } else {
                    showErrorToast({
                        message: COMMON_ERROR_MSG,
                    });
                }
            } else if (response.data.message === "Unsuccessful") {
                showInfoToast({
                    message: response?.data?.result?.statusDesc,
                });
            }
        } catch (error) {
            console.log(error);
        } finally {
            setLoading(false);
        }
    }

    const saveUpdateData = async () => {
        try {
            const stpReferenceNo = await stpReferenceNumber;
            const data = {
                stpReferenceNo,
            };
            const response = await scorePartyApi(data, false);

            if (response?.data?.message === "Success") {
                const responseJsonString =
                    response?.data?.result?.responseJsonString &&
                    JSON.parse(response.data.result.responseJsonString.replace(/\r\n/, ""));

                AsyncStorage.setItem("applicationDetailResponse", JSON.stringify(result));
                const body = {
                    screenNo: "9",
                    stpReferenceNo,
                    customerRiskRatingCode: responseJsonString?.customerRiskRating?.code,
                    customerRiskRatingValue: responseJsonString?.customerRiskRating?.value,
                    manualRiskRatingCode: responseJsonString?.manualRiskRating?.code,
                    manualRiskRatingValue: responseJsonString?.manualRiskRating?.value,
                    assessmentId: responseJsonString?.assessmentId,
                };

                const updateResponse = await updateApiCEP(body, false);
                const resultSave = updateResponse?.data?.result;
                return resultSave;
            }
        } catch (error) {
            console.log(error);
        }
    };
    const checkEligibilityApi = async () => {
        try {
            const body = {
                stpReferenceNo: stpReferenceNumber,
                screenNo: "9",
            };

            const response = await asbCheckEligibilityService(body);
            if (response) {
                const result = response?.data?.result;

                const overallValidationResult =
                    result?.wolocResponse?.msgBody?.overallValidationResult;
                const dataType =
                    result?.wolocResponse?.msgBody?.eligibilityCheckOutcome[0]?.dataType;

                const checkEligibilityResponse = result?.wolocResponse?.msgBody;
                dispatch({
                    type: ELIGIBILITY_SUCCESS,
                    data: checkEligibilityResponse,
                });

                if (response.data.message === "Success") {
                    if (
                        overallValidationResult === "GREEN" &&
                        dataType === "ActualRecommendation"
                    ) {
                        navigation.navigate(ELIGIBILITY_SOFT_FAIL, {
                            reload: true,
                            eligibilityData: response?.data?.result?.wolocResponse?.msgBody,
                        });
                    } else {
                        if (riskValue === "HIGH RISK") {
                            navigation.navigate(ADDITIONALDETAILSINCOME);
                        } else {
                            navigation.navigate(APPLICATIONCONFIRMAUTH);
                        }
                    }
                } else if (response.data.message === "Unsuccessful") {
                    showInfoToast({
                        message: response?.data?.result?.statusDesc,
                    });
                }
            }
        } catch {}
    };

    return (
        <React.Fragment>
            <ScreenContainer
                backgroundType="color"
                analyticScreenName="Apply_ASBFinancing_Confirmation"
            >
                <ScreenLayout
                    header={
                        <HeaderLayout
                            headerLeftElement={<HeaderBackButton onPress={onBackTap} />}
                            headerCenterElement={
                                <Typo
                                    fontSize={16}
                                    fontWeight="600"
                                    lineHeight={20}
                                    text={CONFIRMATION}
                                />
                            }
                            headerRightElement={<HeaderCloseButton onPress={onCloseTap} />}
                        />
                    }
                    paddingHorizontal={0}
                    paddingBottom={0}
                    paddingTop={0}
                    useSafeArea
                >
                    <React.Fragment>
                        <ScrollView showsVerticalScrollIndicator={false}>
                            <KeyboardAwareScrollView
                                behavior={Platform.OS === "ios" ? "padding" : ""}
                                enabled
                            >
                                <SpaceFiller height={24} />
                                {renderFinanceDetailsView()}
                                <SpaceFiller height={24} />
                                {renderPreferredBranchDetailsView()}
                                <SpaceFiller height={24} />
                                {renderPersonalDetailsView()}
                                <SpaceFiller height={24} />
                                {renderEmploymentDetailsView()}
                                <SpaceFiller height={24} />
                            </KeyboardAwareScrollView>
                        </ScrollView>

                        <FixedActionContainer>
                            <View style={Style.bottomBtnContCls}>
                                <ActionButton
                                    fullWidth
                                    componentCenter={
                                        <Typo
                                            fontSize={14}
                                            lineHeight={18}
                                            fontWeight="600"
                                            text={SUBMIT}
                                        />
                                    }
                                    onPress={onNextTap}
                                    isLoading={loading}
                                />
                            </View>
                        </FixedActionContainer>
                    </React.Fragment>
                </ScreenLayout>
                <Popup
                    visible={showPopupConfirm}
                    onClose={onPopupCloseConfirm}
                    title={ARE_YOU_SURE_YOU_WANT_TO_LEAVE_TITLE}
                    description={ARE_YOU_SURE_YOU_WANT_TO_LEAVE_DESC}
                    primaryAction={{
                        text: LEAVE,
                        onPress: handleLeaveButton,
                    }}
                    secondaryAction={{
                        text: CANCEL,
                        onPress: onPopupCloseConfirm,
                    }}
                />
                <Popup
                    visible={showPopupOffer}
                    onClose={handleOkayButton}
                    title={OFFER_UPDATED}
                    description={OFFER_UPDATED_DESCRIPTION}
                    primaryAction={{
                        text: OKAY,
                        onPress: handleOkayButton,
                    }}
                />
            </ScreenContainer>
        </React.Fragment>
    );

    function onEditBranchDetailsTap() {
        const loanInformation = {
            stpId: stpReferenceNumber,
            downpayment: 0,
            financingType: "C",
            loanFinancingAmountRM: parseInt(result?.stpLoanAmount),
            loanTenure: parseInt(result?.stpTenure),
        };
        navigation &&
            navigation.navigate(CURRENT_LOCATION, {
                comingFrom: APPLICATIONCONFIRMATION,
                loanInformation,
            });
    }

    function onEditOccupationDetailsTap() {
        navigation &&
            navigation.navigate(OCCUPATION_INFORMATION, {
                comingFrom: APPLICATIONCONFIRMATION,
                reload: true,
            });
    }

    function onEditDidTap() {
        prevPostCodeRef.current = {
            postcode: result?.stpHomePostcode,
            state: result?.stpHomeStateDesc,
        };
        navigation &&
            navigation.navigate(PERSONAL_INFORMATION, {
                comingFrom: APPLICATIONCONFIRMATION,
                reload: true,
            });
    }

    function getAddressLineOneValue(address) {
        return maskAddress(address);
    }

    function capitalizeFirst(str) {
        return str.charAt(0).toUpperCase() + str.slice(1);
    }

    function getPostalCodeValue(postalCode) {
        return postalCode;
    }

    function getMobileNumberValue(mobileNumber) {
        return maskMobile(mobileNumber);
    }

    function getEmailAddressValue(emailAddress) {
        return maskEmail(emailAddress);
    }

    function getCityValue(city) {
        return maskAddress(city);
    }

    function renderFinanceDetailsView() {
        return (
            <View style={Style.whiteContainer}>
                <View style={Style.contentContainer}>
                    <View style={Style.rowContent}>
                        <Typo
                            fontSize={14}
                            fontWeight="600"
                            lineHeight={18}
                            textAlign="left"
                            text={FINANCING_DETAILS}
                        />
                    </View>
                    <View style={Style.rowContent}>
                        <View style={Style.labelContainer}>
                            <Typo
                                fontSize={14}
                                fontWeight="400"
                                lineHeight={21}
                                textAlign="left"
                                text={TYPE_OF_FINANCING}
                            />
                        </View>
                        <View style={Style.dataContainer}>
                            <Typo
                                fontSize={14}
                                fontWeight="600"
                                lineHeight={21}
                                textAlign="right"
                                text={
                                    result?.stpTypeOfLoan && result?.stpTypeOfLoan === "I"
                                        ? "Islamic Financing"
                                        : "Conventional Financing"
                                }
                            />
                        </View>
                    </View>
                    {!!eligibilityResult && !!eligibilityResult?.loanAmount && (
                        <View style={Style.rowContent}>
                            <View style={Style.labelContainer}>
                                <Typo
                                    fontSize={14}
                                    fontWeight="400"
                                    lineHeight={21}
                                    textAlign="left"
                                    text={AMOUNT_NEED}
                                />
                            </View>
                            <View style={Style.dataContainer}>
                                <Typo
                                    fontSize={14}
                                    fontWeight="600"
                                    lineHeight={21}
                                    textAlign="right"
                                    text={
                                        !!eligibilityResult &&
                                        !!eligibilityResult?.loanAmount &&
                                        `RM ${numeral(eligibilityResult?.loanAmount).format(
                                            ",0.00"
                                        )}`
                                    }
                                />
                            </View>
                        </View>
                    )}
                    {result?.stpAsbHolderNum && (
                        <View style={Style.rowContent}>
                            <View style={Style.labelContainer}>
                                <Typo
                                    fontSize={14}
                                    fontWeight="400"
                                    lineHeight={21}
                                    textAlign="left"
                                    text={ASNB_ACCOUNT}
                                />
                            </View>
                            <View style={Style.dataContainer}>
                                <Typo
                                    fontSize={14}
                                    fontWeight="600"
                                    lineHeight={21}
                                    textAlign="right"
                                    text={"Amanah Saham Bumiputera" + " " + result?.stpAsbHolderNum}
                                />
                            </View>
                        </View>
                    )}
                    {result?.stpCertificatesNum && (
                        <View style={Style.rowContent}>
                            <View style={Style.labelContainer}>
                                <Typo
                                    fontSize={14}
                                    fontWeight="400"
                                    lineHeight={21}
                                    textAlign="left"
                                    text={NO_OF_CERTIFICATE}
                                />
                            </View>
                            <View style={Style.dataContainer}>
                                <Typo
                                    fontSize={14}
                                    fontWeight="600"
                                    lineHeight={21}
                                    textAlign="right"
                                    text={result?.stpCertificatesNum}
                                />
                            </View>
                        </View>
                    )}

                    {eligibilityResult?.tenure && (
                        <View style={Style.rowContent}>
                            <View style={Style.labelContainer}>
                                <Typo
                                    fontSize={14}
                                    fontWeight="400"
                                    lineHeight={21}
                                    textAlign="left"
                                    text={TENURE}
                                />
                            </View>
                            <View style={Style.dataContainer}>
                                <Typo
                                    fontSize={14}
                                    fontWeight="600"
                                    lineHeight={21}
                                    textAlign="right"
                                    text={`${eligibilityResult?.tenure} Years`}
                                />
                            </View>
                        </View>
                    )}

                    {eligibilityResult?.tierList[0]?.interestRate && (
                        <View style={Style.rowContent}>
                            <View style={Style.labelContainer}>
                                <Typo
                                    fontSize={14}
                                    fontWeight="400"
                                    lineHeight={21}
                                    textAlign="left"
                                    text={INTEREST_PROFIT_RATE}
                                />
                            </View>
                            <View style={Style.dataContainer}>
                                <Typo
                                    fontSize={14}
                                    fontWeight="600"
                                    lineHeight={21}
                                    textAlign="right"
                                    text={
                                        eligibilityResult?.tierList[0]?.interestRate &&
                                        `${numeral(
                                            eligibilityResult?.tierList[0]?.interestRate
                                        ).format(",0.00")}% p.a.`
                                    }
                                />
                            </View>
                        </View>
                    )}
                    {eligibilityResult?.tierList[0]?.installmentAmount && (
                        <View style={Style.rowContent}>
                            <View style={Style.labelContainer}>
                                <Typo
                                    fontSize={14}
                                    fontWeight="400"
                                    lineHeight={21}
                                    textAlign="left"
                                    text={MONTHLY_PAYMENT}
                                />
                            </View>
                            <View style={Style.dataContainer}>
                                <Typo
                                    fontSize={14}
                                    fontWeight="600"
                                    lineHeight={21}
                                    textAlign="right"
                                    text={`RM ${numeral(
                                        eligibilityResult?.tierList[0]?.installmentAmount
                                    ).format(",0.00")}`}
                                />
                            </View>
                        </View>
                    )}
                    {!!eligibilityResult && !!eligibilityResult?.totalGrossPremium && (
                        <View style={Style.rowContent}>
                            <View style={Style.labelContainer}>
                                <Typo
                                    fontSize={14}
                                    fontWeight="400"
                                    lineHeight={21}
                                    textAlign="left"
                                    text={PLSTP_SUCCESS_ADDON}
                                />
                            </View>
                            <View style={Style.dataContainer}>
                                <Typo
                                    fontSize={14}
                                    fontWeight="600"
                                    lineHeight={21}
                                    textAlign="right"
                                    text={`RM ${numeral(
                                        eligibilityResult?.totalGrossPremium
                                    ).format(",0.00")}`}
                                />
                            </View>
                        </View>
                    )}
                    {result?.stpGrossIncome && (
                        <View style={Style.rowContent}>
                            <View style={Style.labelContainer}>
                                <Typo
                                    fontSize={14}
                                    fontWeight="400"
                                    lineHeight={21}
                                    textAlign="left"
                                    text={MONTHLY_GROSS_INC}
                                />
                            </View>
                            <View style={Style.dataContainer}>
                                <Typo
                                    fontSize={14}
                                    fontWeight="600"
                                    lineHeight={21}
                                    textAlign="right"
                                    text={
                                        !!result &&
                                        !!result?.stpGrossIncome &&
                                        `RM ${numeral(result?.stpGrossIncome).format(",0.00")}`
                                    }
                                />
                            </View>
                        </View>
                    )}
                    <View style={Style.rowContent}>
                        <View style={Style.labelContainer}>
                            <Typo
                                fontSize={14}
                                fontWeight="400"
                                lineHeight={21}
                                textAlign="left"
                                text={TOTAL_MONTHLY_NONBANK_COMMITMENTS}
                            />
                        </View>
                        <View style={Style.dataContainer}>
                            <Typo
                                fontSize={14}
                                fontWeight="600"
                                lineHeight={21}
                                textAlign="right"
                                text={
                                    !!result && !!result?.stpOtherCommitments
                                        ? `RM ${numeral(result?.stpOtherCommitments).format(
                                              ",0.00"
                                          )}`
                                        : `RM 0.00`
                                }
                            />
                        </View>
                    </View>
                    <SpaceFiller height={24} />
                </View>
            </View>
        );
    }

    function renderPreferredBranchDetailsView() {
        return (
            <View style={Style.whiteContainer}>
                <View style={Style.contentContainer}>
                    <View style={Style.rowContent}>
                        <Typo
                            fontSize={14}
                            fontWeight="600"
                            lineHeight={18}
                            textAlign="left"
                            text={PREFERRED_BRANCH_DETAILS}
                        />
                        <TouchableOpacity onPress={onEditBranchDetailsTap}>
                            <Typo
                                fontSize={14}
                                fontWeight="600"
                                lineHeight={18}
                                textAlign="right"
                                text={EDIT}
                                color={ROYAL_BLUE}
                            />
                        </TouchableOpacity>
                    </View>
                    <View style={Style.rowContent}>
                        <View style={Style.labelContainer}>
                            <Typo
                                fontSize={14}
                                fontWeight="400"
                                lineHeight={21}
                                textAlign="left"
                                text={AREA}
                            />
                        </View>
                        <View style={Style.dataContainer}>
                            <Typo
                                fontSize={14}
                                fontWeight="600"
                                lineHeight={21}
                                textAlign="right"
                                text={result?.stpArea}
                            />
                        </View>
                    </View>
                    <View style={Style.rowContent}>
                        <View style={Style.labelContainer}>
                            <Typo
                                fontSize={14}
                                fontWeight="400"
                                lineHeight={21}
                                textAlign="left"
                                text={STEPUP_MAE_ADDRESS_STATE}
                            />
                        </View>
                        <View style={Style.dataContainer}>
                            <Typo
                                fontSize={14}
                                fontWeight="600"
                                lineHeight={21}
                                textAlign="right"
                                text={result?.stpState}
                            />
                        </View>
                    </View>
                    <View style={Style.rowContent}>
                        <View style={Style.labelContainer}>
                            <Typo
                                fontSize={14}
                                fontWeight="400"
                                lineHeight={21}
                                textAlign="left"
                                text={STEPUP_MAE_BRANCH}
                            />
                        </View>
                        <View style={Style.dataContainer}>
                            <Typo
                                fontSize={14}
                                fontWeight="600"
                                lineHeight={21}
                                textAlign="right"
                                text={result?.stpBranch}
                            />
                        </View>
                    </View>

                    <SpaceFiller height={24} />
                </View>
            </View>
        );
    }

    function renderPersonalDetailsView() {
        return (
            <View style={Style.whiteContainer}>
                <View style={Style.contentContainer}>
                    <View style={Style.rowContent}>
                        <Typo
                            fontSize={14}
                            fontWeight="600"
                            lineHeight={18}
                            textAlign="left"
                            text={ASB_PERSONAL_DETAILS}
                        />
                        <TouchableOpacity onPress={onEditDidTap}>
                            <Typo
                                fontSize={14}
                                fontWeight="600"
                                lineHeight={18}
                                textAlign="right"
                                text={EDIT}
                                color={ROYAL_BLUE}
                            />
                        </TouchableOpacity>
                    </View>
                    <Typo
                        fontSize={12}
                        fontWeight="400"
                        lineHeight={18}
                        color={APPROX_SUVA_GREY}
                        text={`last updated on ${moment(lastUpdatedDate, "DD MM YYYY").format(
                            "D MMMM YYYY"
                        )}`}
                        textAlign="left"
                    />
                    <View style={Style.rowContent}>
                        <View style={Style.labelContainer}>
                            <Typo
                                fontSize={14}
                                fontWeight="400"
                                lineHeight={21}
                                textAlign="left"
                                text={MARITAL_STATUS}
                            />
                        </View>
                        <View style={Style.dataContainer}>
                            <Typo
                                fontSize={14}
                                fontWeight="600"
                                lineHeight={21}
                                textAlign="right"
                                text={result?.stpMaritalStatusDesc}
                            />
                        </View>
                    </View>
                    <View style={Style.rowContent}>
                        <View style={Style.labelContainer}>
                            <Typo
                                fontSize={14}
                                fontWeight="400"
                                lineHeight={21}
                                textAlign="left"
                                text={PLSTP_EDUCATION}
                            />
                        </View>
                        <View style={Style.dataContainer}>
                            <Typo
                                fontSize={14}
                                fontWeight="600"
                                lineHeight={21}
                                textAlign="right"
                                text={result?.stpEducationDesc}
                            />
                        </View>
                    </View>
                    {raceCode === "NATIVE" && (
                        <View style={Style.rowContent}>
                            <View style={Style.labelContainer}>
                                <Typo
                                    fontSize={14}
                                    fontWeight="400"
                                    lineHeight={21}
                                    textAlign="left"
                                    text={STEPUP_MAE_RACE}
                                />
                            </View>
                            <View style={Style.dataContainer}>
                                <Typo
                                    fontSize={14}
                                    fontWeight="600"
                                    lineHeight={21}
                                    textAlign="right"
                                    text={result?.stpRaceDesc}
                                />
                            </View>
                        </View>
                    )}
                    <View style={Style.rowContent}>
                        <View style={Style.labelContainer}>
                            <Typo
                                fontSize={14}
                                fontWeight="400"
                                lineHeight={21}
                                textAlign="left"
                                text={ASB_MOBILE_NUMBER}
                            />
                        </View>
                        <View style={Style.dataContainer}>
                            <Typo
                                fontSize={14}
                                fontWeight="600"
                                lineHeight={21}
                                textAlign="right"
                                text={
                                    result?.stpMobileContactNumber && result?.stpMobileContactPrefix
                                        ? 0 +
                                          getMobileNumberValue(
                                              result?.stpMobileContactPrefix * 1 +
                                                  result?.stpMobileContactNumber
                                          )
                                        : result?.stpMobileContactNumber &&
                                          0 + getMobileNumberValue(result?.stpMobileContactNumber)
                                }
                            />
                        </View>
                    </View>
                    <View style={Style.rowContent}>
                        <View style={Style.labelContainer}>
                            <Typo
                                fontSize={14}
                                fontWeight="400"
                                lineHeight={21}
                                textAlign="left"
                                text={EMAIL_LBL}
                            />
                        </View>
                        <View style={Style.dataContainer}>
                            <Typo
                                fontSize={14}
                                fontWeight="600"
                                lineHeight={21}
                                textAlign="right"
                                text={
                                    !!result?.stpEmail &&
                                    getEmailAddressValue(result?.stpEmail?.replace(/\r\n/, ""))
                                }
                            />
                        </View>
                    </View>
                    <View style={Style.rowContent}>
                        <View style={Style.labelContainer}>
                            <Typo
                                fontSize={14}
                                fontWeight="400"
                                lineHeight={21}
                                textAlign="left"
                                text={COUNTRY_LBL}
                            />
                        </View>
                        <View style={Style.dataContainer}>
                            <Typo
                                fontSize={14}
                                fontWeight="600"
                                lineHeight={21}
                                textAlign="right"
                                text={
                                    !!stpHomeCountry &&
                                    capitalizeFirst(stpHomeCountry?.toLowerCase())
                                }
                            />
                        </View>
                    </View>
                    <View style={Style.rowContent}>
                        <View style={Style.labelContainer}>
                            <Typo
                                fontSize={14}
                                fontWeight="400"
                                lineHeight={21}
                                textAlign="left"
                                text={ASB_ADDRESS_LINE_ONE}
                            />
                        </View>
                        <View style={Style.dataContainer}>
                            <Typo
                                fontSize={14}
                                fontWeight="600"
                                lineHeight={21}
                                textAlign="right"
                                text={
                                    !!result?.stpHomeAddress1 &&
                                    getAddressLineOneValue(result?.stpHomeAddress1)
                                }
                            />
                        </View>
                    </View>
                    <View style={Style.rowContent}>
                        <View style={Style.labelContainer}>
                            <Typo
                                fontSize={14}
                                fontWeight="400"
                                lineHeight={21}
                                textAlign="left"
                                text={ASB_ADDRESS_LINE_TWO}
                            />
                        </View>
                        <View style={Style.dataContainer}>
                            <Typo
                                fontSize={14}
                                fontWeight="600"
                                lineHeight={21}
                                textAlign="right"
                                text={
                                    !!result?.stpHomeAddress2 &&
                                    getAddressLineOneValue(result?.stpHomeAddress2)
                                }
                            />
                        </View>
                    </View>
                    <View style={Style.rowContent}>
                        <View style={Style.labelContainer}>
                            <Typo
                                fontSize={14}
                                fontWeight="400"
                                lineHeight={21}
                                textAlign="left"
                                text={ASB_ADDRESS_LINE_THREE}
                            />
                        </View>
                        <View style={Style.dataContainer}>
                            <Typo
                                fontSize={14}
                                fontWeight="600"
                                lineHeight={21}
                                textAlign="right"
                                text={
                                    !!result?.stpHomeAddress3 &&
                                    getAddressLineOneValue(result?.stpHomeAddress3)
                                }
                            />
                        </View>
                    </View>
                    <View style={Style.rowContent}>
                        <View style={Style.labelContainer}>
                            <Typo
                                fontSize={14}
                                fontWeight="400"
                                lineHeight={21}
                                textAlign="left"
                                text={STEPUP_MAE_ADDRESS_POSTAL}
                            />
                        </View>
                        <View style={Style.dataContainer}>
                            <Typo
                                fontSize={14}
                                fontWeight="600"
                                lineHeight={21}
                                textAlign="right"
                                text={
                                    !!result?.stpHomePostcode &&
                                    getPostalCodeValue(result?.stpHomePostcode)
                                }
                            />
                        </View>
                    </View>
                    <View style={Style.rowContent}>
                        <View style={Style.labelContainer}>
                            <Typo
                                fontSize={14}
                                fontWeight="400"
                                lineHeight={21}
                                textAlign="left"
                                text={STEPUP_MAE_ADDRESS_STATE}
                            />
                        </View>
                        <View style={Style.dataContainer}>
                            <Typo
                                fontSize={14}
                                fontWeight="600"
                                lineHeight={21}
                                textAlign="right"
                                text={result?.stpHomeStateDesc}
                            />
                        </View>
                    </View>
                    <View style={Style.rowContent}>
                        <View style={Style.labelContainer}>
                            <Typo
                                fontSize={14}
                                fontWeight="400"
                                lineHeight={21}
                                textAlign="left"
                                text={STEPUP_MAE_ADDRESS_CITY}
                            />
                        </View>
                        <View style={Style.dataContainer}>
                            <Typo
                                fontSize={14}
                                fontWeight="600"
                                lineHeight={21}
                                textAlign="right"
                                text={!!result?.stpHomeCity && getCityValue(result?.stpHomeCity)}
                            />
                        </View>
                    </View>
                    <SpaceFiller height={24} />
                </View>
            </View>
        );
    }

    function renderEmploymentDetailsView() {
        return (
            <View style={Style.whiteContainer}>
                <View style={Style.contentContainer}>
                    <View style={Style.rowContent}>
                        <Typo
                            fontSize={14}
                            fontWeight="600"
                            lineHeight={18}
                            textAlign="left"
                            text={ASB_EMPLOYMENT_DETAILS}
                        />
                        <TouchableOpacity onPress={onEditOccupationDetailsTap}>
                            <Typo
                                fontSize={14}
                                fontWeight="600"
                                lineHeight={18}
                                textAlign="right"
                                text={EDIT}
                                color={ROYAL_BLUE}
                            />
                        </TouchableOpacity>
                    </View>
                    <Typo
                        fontSize={12}
                        fontWeight="400"
                        lineHeight={18}
                        color={APPROX_SUVA_GREY}
                        text={`last updated on ${moment(lastUpdatedDate, "DD MM YYYY").format(
                            "D MMMM YYYY"
                        )}`}
                        textAlign="left"
                    />
                    <View style={Style.rowContent}>
                        <View style={Style.labelContainer}>
                            <Typo
                                fontSize={14}
                                fontWeight="400"
                                lineHeight={21}
                                textAlign="left"
                                text={STEPUP_MAE_OCUPATION}
                            />
                        </View>
                        <View style={Style.dataContainer}>
                            <Typo
                                fontSize={14}
                                fontWeight="600"
                                lineHeight={21}
                                textAlign="right"
                                text={result?.stpOccupationDesc}
                            />
                        </View>
                    </View>
                    <View style={Style.rowContent}>
                        <View style={Style.labelContainer}>
                            <Typo
                                fontSize={14}
                                fontWeight="400"
                                lineHeight={21}
                                textAlign="left"
                                text={STEPUP_MAE_SECTOR}
                            />
                        </View>
                        <View style={Style.dataContainer}>
                            <Typo
                                fontSize={14}
                                fontWeight="600"
                                lineHeight={21}
                                textAlign="right"
                                text={result?.stpOccupationSectorDesc}
                            />
                        </View>
                    </View>
                    <View style={Style.rowContent}>
                        <View style={Style.labelContainer}>
                            <Typo
                                fontSize={14}
                                fontWeight="400"
                                lineHeight={21}
                                textAlign="left"
                                text={ASB_EMPLOYER_NAME}
                            />
                        </View>
                        <View style={Style.dataContainer}>
                            <Typo
                                fontSize={14}
                                fontWeight="600"
                                lineHeight={21}
                                textAlign="right"
                                text={result?.stpEmployerName}
                            />
                        </View>
                    </View>
                    <View style={Style.rowContent}>
                        <View style={Style.labelContainer}>
                            <Typo
                                fontSize={14}
                                fontWeight="400"
                                lineHeight={21}
                                textAlign="left"
                                text={ASB_EMPLOYMENT_TYPE}
                            />
                        </View>
                        <View style={Style.dataContainer}>
                            <Typo
                                fontSize={14}
                                fontWeight="600"
                                lineHeight={21}
                                textAlign="right"
                                text={result?.stpEmploymentTypeDesc}
                            />
                        </View>
                    </View>
                    <View style={Style.rowContent}>
                        <View style={Style.labelContainer}>
                            <Typo
                                fontSize={14}
                                fontWeight="400"
                                lineHeight={21}
                                textAlign="left"
                                text={COUNTRY_LBL}
                            />
                        </View>
                        {/* vk */}
                        <View style={Style.dataContainer}>
                            <Typo
                                fontSize={14}
                                fontWeight="600"
                                lineHeight={21}
                                textAlign="right"
                                text={
                                    !!stpEmployerCountry &&
                                    capitalizeFirst(stpEmployerCountry?.toLowerCase())
                                }
                            />
                        </View>
                    </View>
                    <View style={Style.rowContent}>
                        <View style={Style.labelContainer}>
                            <Typo
                                fontSize={14}
                                fontWeight="400"
                                lineHeight={21}
                                textAlign="left"
                                text={OFFICE_ADDR1}
                            />
                        </View>
                        <View style={Style.dataContainer}>
                            <Typo
                                fontSize={14}
                                fontWeight="600"
                                lineHeight={21}
                                textAlign="right"
                                text={
                                    !!result?.stpEmployerAddress1 &&
                                    getAddressLineOneValue(result?.stpEmployerAddress1)
                                }
                            />
                        </View>
                    </View>
                    <View style={Style.rowContent}>
                        <View style={Style.labelContainer}>
                            <Typo
                                fontSize={14}
                                fontWeight="400"
                                lineHeight={21}
                                textAlign="left"
                                text={OFFICE_ADDR2}
                            />
                        </View>
                        <View style={Style.dataContainer}>
                            <Typo
                                fontSize={14}
                                fontWeight="600"
                                lineHeight={21}
                                textAlign="right"
                                text={
                                    !!result?.stpEmployerAddress2 &&
                                    getAddressLineOneValue(result?.stpEmployerAddress2)
                                }
                            />
                        </View>
                    </View>
                    <View style={Style.rowContent}>
                        <View style={Style.labelContainer}>
                            <Typo
                                fontSize={14}
                                fontWeight="400"
                                lineHeight={21}
                                textAlign="left"
                                text={OFFICE_ADDR3}
                            />
                        </View>
                        <View style={Style.dataContainer}>
                            <Typo
                                fontSize={14}
                                fontWeight="600"
                                lineHeight={21}
                                textAlign="right"
                                text={
                                    !!result?.stpEmployerAddress3 &&
                                    getAddressLineOneValue(result?.stpEmployerAddress3)
                                }
                            />
                        </View>
                    </View>
                    <View style={Style.rowContent}>
                        <View style={Style.labelContainer}>
                            <Typo
                                fontSize={14}
                                fontWeight="400"
                                lineHeight={21}
                                textAlign="left"
                                text={STEPUP_MAE_ADDRESS_POSTAL}
                            />
                        </View>
                        <View style={Style.dataContainer}>
                            <Typo
                                fontSize={14}
                                fontWeight="600"
                                lineHeight={21}
                                textAlign="right"
                                text={
                                    !!result?.stpEmployerPostcode &&
                                    getPostalCodeValue(result?.stpEmployerPostcode)
                                }
                            />
                        </View>
                    </View>
                    <View style={Style.rowContent}>
                        <View style={Style.labelContainer}>
                            <Typo
                                fontSize={14}
                                fontWeight="400"
                                lineHeight={21}
                                textAlign="left"
                                text={STEPUP_MAE_ADDRESS_STATE}
                            />
                        </View>
                        <View style={Style.dataContainer}>
                            <Typo
                                fontSize={14}
                                fontWeight="600"
                                lineHeight={21}
                                textAlign="right"
                                text={
                                    !!result?.stpEmployerStateDesc &&
                                    getCityValue(result?.stpEmployerStateDesc)
                                }
                            />
                        </View>
                    </View>
                    <View style={Style.rowContent}>
                        <View style={Style.labelContainer}>
                            <Typo
                                fontSize={14}
                                fontWeight="400"
                                lineHeight={21}
                                textAlign="left"
                                text={STEPUP_MAE_ADDRESS_CITY}
                            />
                        </View>
                        <View style={Style.dataContainer}>
                            <Typo
                                fontSize={14}
                                fontWeight="600"
                                lineHeight={21}
                                textAlign="right"
                                text={
                                    !!result?.stpEmployerCity &&
                                    getCityValue(result?.stpEmployerCity)
                                }
                            />
                        </View>
                    </View>
                    <View style={Style.rowContent}>
                        <View style={Style.labelContainer}>
                            <Typo
                                fontSize={14}
                                fontWeight="400"
                                lineHeight={21}
                                textAlign="left"
                                text={OFFICE_PHNO}
                            />
                        </View>
                        <View style={Style.dataContainer}>
                            <Typo
                                fontSize={14}
                                fontWeight="600"
                                lineHeight={21}
                                textAlign="right"
                                text={
                                    !!result?.stpEmployerContactNumber &&
                                    result?.stpEmployerContactPrefix +
                                        `${getMobileNumberValue(result?.stpEmployerContactNumber)}`
                                }
                            />
                        </View>
                    </View>
                    <SpaceFiller height={24} />
                </View>
            </View>
        );
    }
};

ApplicationConfirmation.propTypes = {
    route: PropTypes.object,
    navigation: PropTypes.object,
    addressLineOne: PropTypes.string,
    addressLineTwo: PropTypes.string,
    addressLineThree: PropTypes.string,
    postalCode: PropTypes.string,
    city: PropTypes.string,
};

const Style = StyleSheet.create({
    bottomBtnContCls: {
        flexDirection: "row",
        justifyContent: "space-around",
        width: "100%",
    },

    contentContainer: {
        marginHorizontal: 24,
    },

    dataContainer: {
        flex: 1,
    },

    labelContainer: {
        flex: 1,
    },

    rowContent: {
        alignItems: "center",
        flexDirection: "row",
        justifyContent: "space-between",
        marginTop: 16,
    },

    whiteContainer: {
        backgroundColor: WHITE,
    },
});

export default ApplicationConfirmation;
