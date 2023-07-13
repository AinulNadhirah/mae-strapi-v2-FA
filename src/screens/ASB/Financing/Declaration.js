import AsyncStorage from "@react-native-community/async-storage";
import moment from "moment";
import PropTypes from "prop-types";
import React, { useState, useEffect } from "react";
import { StyleSheet, View, ScrollView } from "react-native";
import { useDispatch, useSelector } from "react-redux";

import {
    SETTINGS_MODULE,
    APPLICATIONCONFIRMATION,
    APPLY_LOANS,
    PERSONAL_INFORMATION,
    OCCUPATION_INFORMATION,
    FATCADECLARATION,
} from "@navigation/navigationConstant";

import HeaderLayout from "@layouts/HeaderLayout";
import ScreenLayout from "@layouts/ScreenLayout";

import ActionButton from "@components/Buttons/ActionButton";
import HeaderBackButton from "@components/Buttons/HeaderBackButton";
import HeaderCloseButton from "@components/Buttons/HeaderCloseButton";
import RadioButton from "@components/Buttons/RadioButton";
import ScreenContainer from "@components/Containers/ScreenContainer";
import FixedActionContainer from "@components/Footers/FixedActionContainer";
import SpaceFiller from "@components/Placeholders/SpaceFiller";
import Popup from "@components/Popup";
import Typo from "@components/Text";
import { showErrorToast } from "@components/Toast";

import { updateApiCEP, applicationDetailsApi } from "@services";
import { logEvent } from "@services/analytics";

import { YELLOW, DISABLED, TRANSPARENT } from "@constants/colors";
import {
    PLSTP_AGREE,
    DECLARATION,
    PLSTP_TNC_NOTE,
    PLSTP_PDS_BOLD,
    OTHER_RELEVANT_DOCUMENTS_ASB,
    AND,
    ATTACHED,
    ASB_POINT_1,
    ASB_POINT_2,
    PLSTP_AGREE_NOTE,
    ASB_NON_OF_SPOUSE,
    TERMS_CONDITIONS,
    LEAVE,
    CONFIRM,
    KINDLY_CONFIRM,
    KINDLY_CONFIRM_DETAILS,
    LEAVE_TITLE,
    LEAVE_DES,
    CANCEL,
    COMMON_ERROR_MSG,
    ASB_POINT_3_1,
    ASB_POINT_3_2,
    ASB_POINT_3_3,
    ASB_REQ,
    PRIVACY_STATEMENT,
    ASB_PRIVACY_AGREE,
    ASB_ALLOW_PROCESS,
    PLSTP_NOT_ALLOW_PROCESS,
    DECLARATION_FORM,
    FA_VIEW_SCREEN,
    FA_SCREEN_NAME,
    LEAVE_APPLICATION_GA,
} from "@constants/strings";

const ASBDeclaration = ({ route, navigation }) => {
    const dispatch = useDispatch();
    const [isChecked, setIsChecked] = useState("");
    const [isLoanType, setLoanType] = useState("");
    const [cancelPopup, setCancelPopup] = useState(false);
    const [confirmPopup, setConfirmPopup] = useState(false);
    const [pointOne, setPointOne] = useState(false);
    const [pointTwo, setPointTwo] = useState(false);
    const [pointThree, setPointThree] = useState(false);
    const prequalReducer = useSelector((state) => state.asbServicesReducer.prePostQualReducer);
    const checkEligibilityResponse = route?.params?.checkEligibilityResponse;
    const selectedAccountNo = route?.params?.selectedAccountNo;
    const resumeReducer = useSelector((state) => state.resumeReducer);
    const resumeStpDetails = resumeReducer?.stpDetails;

    const stpReferenceNumber =
        prequalReducer?.stpreferenceNo ?? resumeReducer?.stpDetails?.stpReferenceNo;

    const idNo = resumeReducer?.stpDetails?.stpIdno ?? prequalReducer?.idNo;

    const lastUpdatedDate =
        resumeReducer?.stpDetails?.stpLastUpdatedDate ?? prequalReducer?.lastUpdatedDate;

    useEffect(() => {
        getLoanTypeIni();
        const jsonValue = checkEligibilityResponse && JSON.stringify(checkEligibilityResponse);
        const jsonValueTotalGrossPremium =
            checkEligibilityResponse &&
            JSON.stringify(checkEligibilityResponse?.eligibilityCheckOutcome[0]?.totalGrossPremium);

        if (jsonValue) {
            AsyncStorage.setItem("checkEligibilityResponse", jsonValue);
        }

        if (jsonValueTotalGrossPremium) {
            AsyncStorage.setItem("totalGrossPremiumString", jsonValueTotalGrossPremium);
        }

        if (checkEligibilityResponse) {
            AsyncStorage.setItem(
                "loanAmount",
                checkEligibilityResponse?.eligibilityCheckOutcome[0]?.loanAmount
            );
            AsyncStorage.setItem(
                "tenure",
                checkEligibilityResponse?.eligibilityCheckOutcome[0]?.tenure
            );
            AsyncStorage.setItem(
                "tierList",
                checkEligibilityResponse?.eligibilityCheckOutcome[0]?.tierList
            );
            AsyncStorage.setItem(
                "totalGrossPremium",
                checkEligibilityResponse?.eligibilityCheckOutcome[0]?.totalGrossPremium
            );
        }

        if (selectedAccountNo) {
            AsyncStorage.setItem("selectedAccountNo", selectedAccountNo);
        }
    }, []);

    useEffect(() => {
        const reload = route?.params?.reload;
        if (reload || resumeStpDetails) {
            setIsChecked(resumeStpDetails?.stpDeclarePdpa);
            if (resumeStpDetails?.stpDeclarePdpa) {
                setPointOne(true);
                setPointTwo(true);
                setPointThree(true);
            }
        }
    }, [route.params]);

    const getLoanTypeIni = async () => {
        try {
            const value = await AsyncStorage.getItem("loanType");
            if (value !== null) {
                setLoanType(value);
            } else {
                if (resumeReducer?.stpDetails?.stpTypeOfLoan) {
                    setLoanType(resumeReducer?.stpDetails?.stpTypeOfLoan);
                }
            }
        } catch (e) {
            console.log(e);
        }
    };

    function onBackTap() {
        navigation.navigate(FATCADECLARATION, { reload: true }); // resume *
    }
    function onCloseTap() {
        setCancelPopup(true);
    }

    function onAgreeRadioButtonDidTap() {
        setIsChecked("Y");
    }

    function onDisagreeRadioButtonDidTap() {
        setIsChecked("N");
    }

    const onCancelPopupLeave = async () => {
        setConfirmPopup(false);
        setCancelPopup(false);
        logEvent(FA_VIEW_SCREEN, {
            [FA_SCREEN_NAME]: LEAVE_APPLICATION_GA,
        });
        const response = await saveUpdateData(false);
        if (response === "0000") {
            navigation.navigate(APPLY_LOANS);
        } else {
            showErrorToast({
                message: COMMON_ERROR_MSG,
            });
        }
    };

    function onCancelPopup() {
        setConfirmPopup(false);
        setCancelPopup(false);
    }

    const closeConfirmPopup = async () => {
        setConfirmPopup(false);
        const response = await saveUpdateData(false);
        let isEmployeeDataMissing = false;
        if (response === "0000") {
            try {
                const stpReferenceNo = await stpReferenceNumber;
                const idNumber = await idNo;
                const data = {
                    stpReferenceNo,
                    idNumber,
                };
                const response = await applicationDetailsApi(data);
                if (response) {
                    if (
                        response?.data?.message === "Success" &&
                        response?.data?.result?.msgBody?.stpApp
                    ) {
                        const result = response.data.result.msgBody.stpApp;
                        if (
                            result?.stpMaritalStatusDesc === null ||
                            result?.stpEducationDesc === null ||
                            (prequalReducer?.raceValue === "NATIVE" &&
                                result?.stpRaceDesc === null) ||
                            result?.stpMobileContactNumber === null ||
                            result?.stpEmail === null ||
                            result?.stpHomeCountry === null ||
                            result?.stpHomeAddress1 === null ||
                            result?.stpHomeAddress2 === null ||
                            // result?.stpHomeAddress3 === null ||
                            result?.stpHomePostcode === null ||
                            result?.stpHomeCity === null ||
                            result?.stpHomePostcode === null
                        ) {
                            if (
                                result?.stpOccupationDesc === null ||
                                result?.stpEmployerName === null ||
                                result?.stpOccupationSectorDesc === null ||
                                result?.stpEmploymentTypeDesc === null ||
                                result?.stpHomeCountry === null ||
                                result?.stpEmployerAddress1 === null ||
                                result?.stpEmployerAddress2 === null ||
                                // result?.stpEmployerAddress3 === null ||
                                result?.stpEmployerPostcode === null ||
                                result?.stpEmployerStateDesc === null ||
                                result?.stpEmployerCity === null ||
                                result?.stpEmployerContactNumber === null
                            ) {
                                isEmployeeDataMissing = true;
                            }
                            navigation &&
                                navigation.navigate(PERSONAL_INFORMATION, {
                                    comingFrom: DECLARATION,
                                    isEmployeeDataMissing,
                                });
                        } else if (
                            result?.stpOccupationDesc === null ||
                            result?.stpEmployerName === null ||
                            result?.stpOccupationSectorDesc === null ||
                            result?.stpEmploymentTypeDesc === null ||
                            result?.stpHomeCountry === null ||
                            result?.stpEmployerAddress1 === null ||
                            result?.stpEmployerAddress2 === null ||
                            // result?.stpEmployerAddress3 === null ||
                            result?.stpEmployerPostcode === null ||
                            result?.stpEmployerStateDesc === null ||
                            result?.stpEmployerCity === null ||
                            result?.stpEmployerContactNumber === null
                        ) {
                            dispatch({
                                screenNo: "11",
                                type: "RESUME_UPDATE",
                                stpEmployerName: result?.stpEmployerName,
                                stpOccupationDesc: result?.stpOccupationDesc,
                                stpEmploymentTypeDesc: result?.stpEmploymentTypeDesc,
                            });

                            dispatch({
                                screenNo: "12",
                                type: "RESUME_UPDATE",
                                stpEmployerContactNumber: result?.stpEmployerContactNumber,
                                stpEmployerAddress1: result?.stpEmployerAddress1?.trim(),
                                stpEmployerAddress2: result?.stpEmployerAddress2?.trim(),
                                stpEmployerAddress3: result?.stpEmployerAddress3?.trim(),
                                stpEmployerPostcode: result?.stpEmployerPostcode,
                                stpEmployerCity: result?.stpEmployerCity,
                            });

                            navigation &&
                                navigation.navigate(OCCUPATION_INFORMATION, {
                                    comingFrom: DECLARATION,
                                });
                        } else {
                            navigation.navigate(APPLICATIONCONFIRMATION, {
                                checkEligibilityResponse,
                                declarationIsChecked: isChecked,
                                selectedAccountNo,
                            });
                        }
                    }
                }
            } catch (error) {
                console.log("applicationDetailsApi => error", error);
            }
        } else {
            showErrorToast({
                message: COMMON_ERROR_MSG,
            });
        }
    };
    const saveUpdateData = async () => {
        try {
            const body = {
                screenNo: "8",
                stpReferenceNo: stpReferenceNumber,
                declarePdpa: isChecked,
            };

            dispatch({
                screenNo: "8",
                type: "RESUME_UPDATE",
                stpDeclarePdpa: isChecked,
            });
            AsyncStorage.setItem("declarationIsChecked", isChecked);

            const response = await updateApiCEP(body, false);

            const result = response?.data?.result.msgHeader;

            if (result.responseCode === "0000") {
                return result.responseCode;
            }
        } catch (error) {
            showErrorToast({
                message: COMMON_ERROR_MSG,
            });
        }
    };

    function onAgreeConfirm() {
        setConfirmPopup(true);
    }

    function onTNCLinkDidTap() {
        const title = "";
        const url =
            isLoanType === "I"
                ? "https://www.maybank2u.com.my/iwov-resources/pdf/personal/loans/ASB_Islamic_tnc.pdf"
                : "https://www.maybank2u.com.my/iwov-resources/pdf/personal/loans/ASB_Conventional_tnc.pdf";
        const props = {
            title,
            source: url,
            headerColor: TRANSPARENT,
            loader: true,
        };
        navigation.navigate(SETTINGS_MODULE, {
            screen: "PdfSetting",
            params: props,
        });
    }

    function onPDSLinkDidTap() {
        const title = "";

        const url =
            isLoanType === "I"
                ? "https://www.maybank2u.com.my/iwov-resources/pdf/personal/loans/ASB_Islamic_PDS.pdf"
                : "https://www.maybank2u.com.my/iwov-resources/pdf/personal/loans/ASB_Conventional_PDS.pdf";
        const props = {
            title,
            source: url,
            headerColor: TRANSPARENT,
            loader: true,
        };
        navigation.navigate(SETTINGS_MODULE, {
            screen: "PdfSetting",
            params: props,
        });
    }
    function onDeclarationFormDidTap() {
        const title = "";

        const url =
            isLoanType === "I"
                ? "https://www.maybank2u.com.my/iwov-resources/pdf/personal/loans/investment/asb-stp-declaration-islamic_0822.pdf"
                : "https://www.maybank2u.com.my/iwov-resources/pdf/personal/loans/investment/asb-stp-declaration-conventional_0822.pdf";
        const props = {
            title,
            source: url,
            headerColor: TRANSPARENT,
            loader: true,
        };
        navigation.navigate(SETTINGS_MODULE, {
            screen: "PdfSetting",
            params: props,
        });
    }

    function onSuratAkuan() {
        const title = "";
        const url =
            "https://www.maybank2u.com.my/iwov-resources/pdf/personal/loans/investment/e_surat-akuan-dan-pengesahan.pdf";
        const props = {
            title,
            source: url,
            headerColor: TRANSPARENT,
            loader: true,
        };
        setPointTwo(true);
        navigation.navigate(SETTINGS_MODULE, {
            screen: "PdfSetting",
            params: props,
        });
    }

    function onRisalahKYL() {
        const title = "";
        const url =
            "https://www.maybank2u.com.my/iwov-resources/pdf/personal/loans/investment/asnb-kyl-brochure-en_200622.pdf";
        const props = {
            title,
            source: url,
            headerColor: TRANSPARENT,
            loader: true,
        };
        setPointOne(true);
        navigation.navigate(SETTINGS_MODULE, {
            screen: "PdfSetting",
            params: props,
        });
    }

    function onPenyataDidTap() {
        const title = "";
        const url =
            "https://www.maybank2u.com.my/iwov-resources/pdf/personal/loans/investment/e_rds.pdf";
        const props = {
            title,
            source: url,
            headerColor: TRANSPARENT,
            loader: true,
        };
        setPointThree(true);
        navigation.navigate(SETTINGS_MODULE, {
            screen: "PdfSetting",
            params: props,
        });
    }

    function onPrivacyLinkDidTap() {
        const title = "";
        const url =
            "https://www.maybank2u.com.my/iwov-resources/pdf/personal/loans/investment/PDPA-form-individual.pdf";

        const props = {
            title,
            source: url,
            headerColor: TRANSPARENT,
            loader: true,
        };
        navigation.navigate(SETTINGS_MODULE, {
            screen: "PdfSetting",
            params: props,
        });
    }

    return (
        <React.Fragment>
            <ScreenContainer
                backgroundType="color"
                analyticScreenName="Apply_ASBFinancing_TermsAndConditions"
            >
                <ScreenLayout
                    header={
                        <HeaderLayout
                            headerLeftElement={<HeaderBackButton onPress={onBackTap} />}
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
                            <View style={Style.formContainer}>
                                <View style={Style.contentContainer}>
                                    <Typo
                                        fontSize={16}
                                        fontWeight="600"
                                        lineHeight={24}
                                        textAlign="left"
                                        text={DECLARATION}
                                    />
                                    <SpaceFiller height={24} />
                                    {buildTNCParagraph()}
                                    <SpaceFiller height={24} />
                                    {documentAttachedText()}
                                    <SpaceFiller height={24} />
                                    {buildPointParagraph()}
                                    <SpaceFiller height={24} />
                                    {buildNonOfSpouseParagraph()}
                                    <SpaceFiller height={24} />
                                    {buildPrivacyParagraph()}
                                    <SpaceFiller height={16} />
                                    {buildRadioButtonGroupView()}
                                    <SpaceFiller height={24} />
                                    {buildProductAndServicesParagraph()}
                                </View>
                            </View>
                        </ScrollView>

                        <FixedActionContainer>
                            <View style={Style.bottomBtnContCls}>
                                <ActionButton
                                    disabled={
                                        pointOne && pointTwo && pointThree && isChecked
                                            ? false
                                            : true
                                    }
                                    backgroundColor={
                                        pointOne && pointTwo && pointThree && isChecked
                                            ? YELLOW
                                            : DISABLED
                                    }
                                    fullWidth
                                    componentCenter={
                                        <Typo
                                            fontSize={14}
                                            lineHeight={18}
                                            fontWeight="600"
                                            text={PLSTP_AGREE}
                                        />
                                    }
                                    onPress={onAgreeConfirm}
                                />
                            </View>
                        </FixedActionContainer>
                        <Popup
                            visible={cancelPopup}
                            title={LEAVE_TITLE}
                            description={LEAVE_DES}
                            onClose={onCancelPopup}
                            primaryAction={{
                                text: LEAVE,
                                onPress: onCancelPopupLeave,
                            }}
                            secondaryAction={{
                                text: CANCEL,
                                onPress: onCancelPopup,
                            }}
                        />
                        <Popup
                            visible={confirmPopup}
                            title={KINDLY_CONFIRM}
                            description={
                                KINDLY_CONFIRM_DETAILS +
                                moment(lastUpdatedDate, "DD MM YYYY").format("D MMMM YYYY") +
                                "."
                            }
                            onClose={onCancelPopup}
                            primaryAction={{
                                text: CONFIRM,
                                onPress: closeConfirmPopup,
                            }}
                            secondaryAction={{
                                text: LEAVE,
                                onPress: onCancelPopupLeave,
                            }}
                        />
                    </React.Fragment>
                </ScreenLayout>
            </ScreenContainer>
        </React.Fragment>
    );

    function buildTNCParagraph() {
        return (
            <Typo fontSize={14} lineHeight={21} fontWeight="400" textAlign="left">
                {PLSTP_TNC_NOTE}
                <Typo
                    fontSize={14}
                    lineHeight={21}
                    fontWeight="600"
                    letterSpacing={0}
                    textAlign="left"
                    style={Style.underline}
                    text={TERMS_CONDITIONS + ","}
                    onPress={onTNCLinkDidTap}
                />
                <Typo
                    fontSize={14}
                    lineHeight={21}
                    fontWeight="600"
                    letterSpacing={0}
                    textAlign="left"
                    text={" "}
                />

                <Typo
                    fontSize={14}
                    lineHeight={21}
                    fontWeight="600"
                    letterSpacing={0}
                    textAlign="left"
                    style={Style.underline}
                    text={PLSTP_PDS_BOLD}
                    onPress={onPDSLinkDidTap}
                />

                <Typo
                    fontSize={14}
                    lineHeight={21}
                    fontWeight="600"
                    letterSpacing={0}
                    textAlign="left"
                    style={Style.underline}
                    text={" " + DECLARATION_FORM}
                    onPress={onDeclarationFormDidTap}
                />

                <Typo
                    fontSize={14}
                    lineHeight={21}
                    fontWeight="400"
                    letterSpacing={0}
                    textAlign="left"
                    text={AND}
                />
                <Typo
                    fontSize={14}
                    lineHeight={21}
                    fontWeight="400"
                    letterSpacing={0}
                    textAlign="left"
                    text={OTHER_RELEVANT_DOCUMENTS_ASB}
                />
                <Typo
                    fontSize={14}
                    lineHeight={21}
                    fontWeight="400"
                    letterSpacing={0}
                    textAlign="left"
                    text={` ${ATTACHED}.`}
                />
            </Typo>
        );
    }

    function buildPointParagraph() {
        return (
            <>
                <View style={Style.row}>
                    <RadioButton
                        title={
                            <Typo
                                fontSize={14}
                                lineHeight={21}
                                fontWeight="600"
                                letterSpacing={0}
                                textAlign="left"
                                style={Style.underline}
                                text={ASB_POINT_1}
                                onPress={onRisalahKYL}
                            />
                        }
                        isSelected={pointOne}
                        onRadioButtonPressed={onRisalahKYL}
                        fontSize={14}
                        fontWeight="400"
                    />
                </View>
                <SpaceFiller height={10} />
                <View style={Style.row}>
                    <RadioButton
                        title={
                            <Typo
                                fontSize={14}
                                lineHeight={21}
                                fontWeight="600"
                                letterSpacing={0}
                                textAlign="left"
                                style={Style.underline}
                                text={ASB_POINT_2}
                                onPress={onSuratAkuan}
                            />
                        }
                        isSelected={pointTwo}
                        onRadioButtonPressed={onSuratAkuan}
                        fontSize={14}
                        fontWeight="400"
                    />
                </View>

                <SpaceFiller height={10} />
                <View style={Style.pointThree}>
                    <View style={Style.pointThreeCol}>
                        <RadioButton
                            title={
                                <>
                                    <Typo
                                        fontSize={14}
                                        lineHeight={21}
                                        fontWeight="600"
                                        letterSpacing={0}
                                        textAlign="left"
                                        onPress={onPenyataDidTap}
                                    />
                                </>
                            }
                            isSelected={pointThree}
                            onRadioButtonPressed={onPenyataDidTap}
                            fontSize={14}
                            fontWeight="400"
                        />
                    </View>
                    <View>
                        <Typo
                            fontSize={14}
                            lineHeight={21}
                            fontWeight="600"
                            letterSpacing={0}
                            textAlign="left"
                            style={Style.underline}
                            text={ASB_POINT_3_1}
                            onPress={onPenyataDidTap}
                        />
                        <Typo
                            fontSize={14}
                            lineHeight={21}
                            fontWeight="600"
                            letterSpacing={0}
                            textAlign="left"
                            style={Style.underline}
                            text={ASB_POINT_3_2}
                            onPress={onPenyataDidTap}
                        />
                        <Typo
                            fontSize={14}
                            lineHeight={21}
                            fontWeight="600"
                            letterSpacing={0}
                            textAlign="left"
                            style={Style.underline}
                            text={ASB_POINT_3_3}
                            onPress={onPenyataDidTap}
                        />
                    </View>
                </View>
            </>
        );
    }

    function buildPrivacyParagraph() {
        return (
            <Typo fontSize={14} lineHeight={21} fontWeight="400" textAlign="left">
                {ASB_PRIVACY_AGREE + " "}
                <Typo
                    fontSize={14}
                    lineHeight={21}
                    fontWeight="600"
                    textAlign="left"
                    style={Style.underline}
                    text={`${PRIVACY_STATEMENT}`}
                    onPress={onPrivacyLinkDidTap}
                />
            </Typo>
        );
    }

    function buildRadioButtonGroupView() {
        return (
            <React.Fragment>
                <View style={Style.radioOption}>
                    <RadioButton
                        style={Style.viewContainer}
                        isSelected={isChecked === "Y" ? true : false}
                        onRadioButtonPressed={onAgreeRadioButtonDidTap}
                        fontSize={14}
                        fontWeight="400"
                    />
                    <Typo
                        fontSize={14}
                        lineHeight={21}
                        fontWeight="400"
                        textAlign="left"
                        text={`${ASB_ALLOW_PROCESS}`}
                        onPress={onAgreeRadioButtonDidTap}
                    />
                </View>
                <SpaceFiller height={15} />
                <View style={Style.radioOption}>
                    <RadioButton
                        style={Style.viewContainer}
                        isSelected={isChecked === "N" ? true : false}
                        onRadioButtonPressed={onDisagreeRadioButtonDidTap}
                        fontSize={14}
                        fontWeight="400"
                    />
                    <Typo
                        fontSize={14}
                        lineHeight={21}
                        fontWeight="400"
                        textAlign="left"
                        text={`${PLSTP_NOT_ALLOW_PROCESS}`}
                        onPress={onDisagreeRadioButtonDidTap}
                    />
                </View>
            </React.Fragment>
        );
    }

    function buildNonOfSpouseParagraph() {
        return (
            <Typo fontSize={14} lineHeight={21} fontWeight="400" textAlign="left">
                {ASB_NON_OF_SPOUSE}
            </Typo>
        );
    }

    function documentAttachedText() {
        return (
            <Typo fontSize={14} lineHeight={21} fontWeight="400" textAlign="left">
                {ASB_REQ}
            </Typo>
        );
    }

    function buildProductAndServicesParagraph() {
        return (
            <Typo
                fontSize={14}
                lineHeight={21}
                fontWeight="400"
                textAlign="left"
                text={PLSTP_AGREE_NOTE}
            />
        );
    }
};

ASBDeclaration.propTypes = {
    route: PropTypes.any,
    navigation: PropTypes.any,
};

export const declarationPropTypes = (ASBDeclaration.propTypes = {
    // State
    isAgreeToBeContacted: PropTypes.string,
    privacyPolicy: PropTypes.string,
    fatcaStateDeclaration: PropTypes.string,
    termsAndConditions: PropTypes.string,
    isDeclarationContinueButtonEnabled: PropTypes.bool,

    // Dispatch
    updateAgreeToBeContacted: PropTypes.func,
    checkButtonEnabled: PropTypes.func,
    clearDeclarationReducer: PropTypes.func,
});

const Style = StyleSheet.create({
    bottomBtnContCls: {
        flexDirection: "row",
        justifyContent: "space-around",
        width: "100%",
    },

    contentContainer: {
        marginHorizontal: 24,
    },

    pointThree: { alignItems: "flex-start", flexDirection: "row" },

    pointThreeCol: { top: 5 },
    radioOption: {
        alignItems: "flex-start",
        flexDirection: "row",
        paddingRight: 25,
    },
    row: {
        flexDirection: "row",
    },
    underline: {
        textDecorationLine: "underline",
    },
    viewContainer: {
        top: 5,
    },
});

export default ASBDeclaration;
