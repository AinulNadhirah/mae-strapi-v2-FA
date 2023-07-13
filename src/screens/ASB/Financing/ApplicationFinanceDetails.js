import AsyncStorage from "@react-native-community/async-storage";
import moment from "moment";
import numeral from "numeral";
import PropTypes from "prop-types";
import React, { useEffect, useReducer, useCallback, useState, useRef } from "react";
import { View, StyleSheet, TouchableOpacity, Image, Platform, Keyboard } from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { useDispatch, useSelector } from "react-redux";

import { addCommas, removeCommas } from "@screens/PLSTP/PLSTPController";

import {
    ELIGIBILITY_SOFT_FAIL,
    CURRENT_LOCATION,
    APPLY_LOANS,
    ASB_CONSENT,
    COMMON_MODULE,
    PDF_VIEW,
} from "@navigation/navigationConstant";

import HeaderLayout from "@layouts/HeaderLayout";
import ScreenLayout from "@layouts/ScreenLayout";

import ActionButton from "@components/Buttons/ActionButton";
import ColorRadioButton from "@components/Buttons/ColorRadioButton";
import HeaderBackButton from "@components/Buttons/HeaderBackButton";
import HeaderCloseButton from "@components/Buttons/HeaderCloseButton";
import { ScrollPickerView } from "@components/Common";
import { ScrollPickerViewWithResetOption } from "@components/Common/ScrollPickerViewWithResetOption";
import ScreenContainer from "@components/Containers/ScreenContainer";
import FixedActionContainer from "@components/Footers/FixedActionContainer";
import Dropdown from "@components/FormComponents/Dropdown";
import InlineTypography from "@components/FormComponents/InlineTypography";
import Popup from "@components/Popup";
import Typo from "@components/Text";
import TextInput from "@components/TextInput";
import { showErrorToast, showInfoToast } from "@components/Toast";

import { calculateProfitEarningPremium, viewPartyDownload, updateApiCEP } from "@services";
import { logEvent } from "@services/analytics";

import { FINANCE_DETAILS_LOAN_TYPE } from "@redux/actions/ASBFinance/financeDetailsAction";

import {
    MEDIUM_GREY,
    YELLOW,
    DISABLED_TEXT,
    BLACK,
    WHITE,
    TRANSPARENT,
    ROYAL_BLUE,
    TXT_GREY,
    GREY,
    SEPARATOR,
    DISABLED,
} from "@constants/colors";
import {
    PLEASE_SELECT,
    DONE,
    CANCEL,
    ASB_FINANCING,
    AMOUNT_I_NEED,
    AMOUNT_PLACEHOLDER,
    CURRENCY_CODE,
    MIN_AMOUNT_NOTE,
    AMOUNT_NEED_NOTE,
    MONTHLY_PAYMENT,
    PROFIT_INTEREST,
    TAKAFUL_INSURANCE_FEE,
    SAVE_NEXT,
    CALCULATE,
    ARE_YOU_SURE_YOU_WANT_TO_LEAVE_TITLE,
    ARE_YOU_SURE_YOU_WANT_TO_LEAVE_DESC,
    COMMON_ERROR_MSG,
    FA_VIEW_SCREEN,
    FA_SCREEN_NAME,
    FA_FORM_PROCEED,
    FA_FIELD_INFORMATION,
    FA_FIELD_INFORMATION_2,
    POTENTIAL_EARNING,
    POTENTIAL_EARNING_RATE,
    PLEASE_FILL_YOUR_FINANCING_DETAILS,
    TYPE_OF_LOAN_FINANCING,
    ISLAMIC_FINANCING,
    CONVENTIANAL_FINANCING,
    NO_OF_CERT,
    RM50_PER_CERT,
    TENURE,
    TAKAFUK_INSURANCE_PLAN,
    NO_OF_CERT_DECS,
    SHARIAH_COMPLIANT,
    COMPETITIVE_FINANCING,
    INSURANCE_TAKAFUL_PLAN_DESC,
    THE_MIN_AMOUNT,
    ADDING_INSURANCE,
    TAKAFUL_INSURANCE_PLAN,
    PLEASE_LET_US_KNOW_IF_U_SMOKE,
    VIEW,
    YOUR_ESTIMATED_PROFIT,
    RECALCULATE,
    SKIP,
    LEAVE,
    ASB_NOTE,
    LEAVE_APPLICATION_GA,
} from "@constants/strings";

import Assets from "@assets";

import SelectAccount from "./SelectAccount";

const initialState = {
    step: 1,
    // CC Type related
    title: PLEASE_SELECT,
    titleValue: null,
    titleObj: {},
    titleValid: true,
    titleErrorMsg: "",
    titleData: [],
    titleValueIndex: 0,
    titlePicker: false,

    //Info Popup
    showInfo: false,
    infoTitle: "ID number",
    infoDescription: "You may select the Principal Card with a maximum of 5 cards per application",
    // Others
    isContinueDisabled: false,
    isPostLogin: false,
    //Amount Need
    amountNeed: "",
    amountNeedValid: true,
    amountNeedErrorMsg: "",

    //Min Amount
    minAmount: "",
    minAmountValid: true,
    minAmountErrorMsg: "",
    eligibleMinAmount: MIN_AMOUNT_NOTE,
    eligibleMaxAmount: AMOUNT_NEED_NOTE,
    showPopup: false,
};

function reducer(state, action) {
    const { actionType, payload } = action;
    switch (actionType) {
        case "showPopup":
            return {
                ...state,
                showPopup: true,
                popupTitle: payload?.title ?? "",
                popupDescription: payload?.description ?? "",
                secondaryDescription: payload?.secondaryDescription ?? "",
                secondaryTitle: payload?.secondaryTitle ?? "",
            };
        case "hidePopup":
            return {
                ...state,
                showPopup: false,
                popupTitle: "",
                popupDescription: "",
                secondaryTitle: "",
                secondaryDescription: "",
            };
        case "amountNeed":
            return {
                ...state,
                amountNeed: payload.amountNeed,
                amountNeedValid: payload.amountNeedValid,
                amountNeedErrorMsg: payload.amountNeedErrorMsg,
            };
        default:
            return { ...state };
    }
}

function ApplicationFinanceDetails({ navigation, route }) {
    const [state, dispatch] = useReducer(reducer, initialState);
    const [isIslamic, setisIslamic] = useState(true);
    const [pdpYes, setPdpYes] = useState(true);
    const [pdpNo, setPdpNo] = useState(false);
    const [step] = useState(1);
    const [selectTenure, setSelectTenure] = useState("");
    const [selectNoOfCertificates, setSelectNoOfCertificates] = useState("");
    const [showTenure, setShowTenure] = useState(false);
    const [showNoOfCertificates, setShowNoOfCertificates] = useState(false);
    const [showAdvanceDetails, setShowAdvanceDetails] = useState(false);
    const masterDataReducer = useSelector((state) => state.asbServicesReducer.masterDataReducer);
    const prePostQualReducer = useSelector((state) => state.asbServicesReducer.prePostQualReducer);
    const [pdpVal, setPdpVal] = useState("Y");
    const [result, setResult] = useState("");

    const [tenure, setTenure] = useState("");
    const [loading, setLoading] = useState(false);
    const _loading = useRef(false);
    const [keyboardShow, setKeyboardShow] = React.useState();
    const [showPopupConfirm, setShowPopupConfirm] = useState(false);
    const [amountNeedChangeMax, setAmountNeedChangeMax] = useState("");
    const [showNext, setShowNext] = useState(true);
    const [viewPDFURL, setViewPDFURL] = useState();
    const [resetValueNoOfCertificate, setResetValueNoOfCertificate] = useState(false);

    // Hooks for dispatch reducer action
    const dispatchRedux = useDispatch();

    // Resume
    const resumeReducer = useSelector((state) => state.resumeReducer);
    const resumeStpDetails = resumeReducer?.stpDetails;
    const stpReferenceNumber =
        prePostQualReducer?.data?.stpreferenceNo ?? resumeReducer?.stpDetails?.stpReferenceNo;

    const userDOB = resumeReducer?.stpDetails?.stpCustomerDob ?? prePostQualReducer.dateOfBirth;

    var count = 0;

    var tenureArray = [
            {
                name: "1 Year",
                value: 1,
            },
            {
                name: "2 Years",
                value: 2,
            },
            {
                name: "3 Years",
                value: 3,
            },
            {
                name: "4 Years",
                value: 4,
            },
            {
                name: "5 Years",
                value: 5,
            },
        ],
        noofcertificatesArray = [
            {
                name: 1,
                value: 1,
            },
            {
                name: 2,
                value: 2,
            },
            {
                name: 3,
                value: 3,
            },
            {
                name: 4,
                value: 4,
            },
        ];
    const [noOfCertificates, setNoOfCertificates] = useState([]);
    const [noOfTenures, setNOfTenures] = useState([]);
    useEffect(() => {
        init();
        AsyncStorage.setItem("loanType", "I");
        logEvent(FA_VIEW_SCREEN, {
            [FA_SCREEN_NAME]: "Apply_ASBFinancing_FinancingDetails",
        });
    }, [init]);

    const init = useCallback(async () => {
        getNoOfTenures();
        try {
            const tenures = masterDataReducer?.tenure[0]?.value;
            tenures.split(",").forEach((key) => {
                const temp = {
                    name: key,
                    value: key,
                };
                tenureArray.push(temp);
            });

            const noofcertificates = masterDataReducer?.noofcertificates[0]?.value;
            noofcertificates.split(",").forEach((key) => {
                const temp = {
                    name: key,
                    value: key,
                };
                noofcertificatesArray.push(temp);
            });

            const keyboardDidShowListener = Keyboard.addListener("keyboardDidShow", () => {
                setKeyboardShow(true);
            });
            const keyboardDidHideListener = Keyboard.addListener("keyboardDidHide", () => {
                setKeyboardShow(false);
            });

            return () => {
                keyboardDidHideListener.remove();
                keyboardDidShowListener.remove();
            };
        } catch (error) {}
    }, []);

    useEffect(() => {
        const reload = route?.params?.reload;
        if (reload || resumeStpDetails) {
            onAmountNeedChange(resumeReducer?.stpDetails?.stpLoanAmount);
            setSelectNoOfCertificates(resumeReducer?.stpDetails?.stpCertificatesNum);
            setSelectTenure(
                resumeReducer?.stpDetails?.stpTenure
                    ? `${resumeReducer?.stpDetails?.stpTenure}  Years`
                    : ""
            );
            setTenure(resumeReducer?.stpDetails?.stpTenure);
            dispatchRedux({
                type: FINANCE_DETAILS_LOAN_TYPE,
                loanTypeIsConv:
                    resumeReducer?.stpDetails?.stpTypeOfLoan === null ||
                    resumeReducer?.stpDetails?.stpTypeOfLoan === "I"
                        ? true
                        : false,
            });
            setisIslamic(
                resumeReducer?.stpDetails?.stpTypeOfLoan === null ||
                    resumeReducer?.stpDetails?.stpTypeOfLoan === "I"
                    ? true
                    : false
            );
            if (resumeReducer?.stpDetails?.stpPlInsrnce === "MORPLAN1") {
                setPdpNo(true);
                setPdpYes(false);
                setPdpVal("N");
            } else {
                setPdpYes(true);
                setPdpNo(false);
                setPdpVal("Y");
            }
        }
    }, [state.title, state.cidType, state.name, state.idNum, route?.params]);

    function handleBack() {
        navigation.navigate(ASB_CONSENT, { reload: true });
    }

    function onPopupCloseConfirm() {
        setShowPopupConfirm(false);
    }

    const handleLeaveButton = async () => {
        setShowPopupConfirm(false);

        const body = {
            screenNo: "2",
            stpReferenceNo: stpReferenceNumber,
        };

        const response = await updateApiCEP(body, false);
        const result = response?.data?.result;
        if (result) {
            navigation.navigate(APPLY_LOANS);
        } else {
            showErrorToast({
                message: COMMON_ERROR_MSG,
            });
        }
    };

    async function handleClose() {
        logEvent(FA_VIEW_SCREEN, {
            [FA_SCREEN_NAME]: LEAVE_APPLICATION_GA,
        });
        setShowPopupConfirm(true);
    }

    function onPopupClose() {
        dispatch({ actionType: "hidePopup", payload: false });
    }

    function onNoOfCertificatesInfoPress() {
        dispatch({
            actionType: "showPopup",
            payload: {
                title: NO_OF_CERT,
                description: NO_OF_CERT_DECS,
            },
        });
    }

    function onFinanceTypePress() {
        dispatch({
            actionType: "showPopup",
            payload: {
                title: ISLAMIC_FINANCING,
                description: SHARIAH_COMPLIANT,
                secondaryTitle: CONVENTIANAL_FINANCING,
                secondaryDescription: COMPETITIVE_FINANCING,
            },
        });
    }

    function onPickerDone(item) {
        setSelectNoOfCertificates(item.name);
        setResetValueNoOfCertificate(false);
        onPickerCancel();
    }

    function onPickerTenureDone(item) {
        setSelectTenure(item.name);
        setTenure(item.value);

        onPickerTenureCancel();
    }

    function onPickerCancel() {
        setShowNoOfCertificates(false);
    }
    function onPickerTenureCancel() {
        setShowTenure(false);
    }

    function onDropdownPress() {
        getNoOfCertificates();
        setShowNoOfCertificates(true);
    }

    const getNoOfCertificates = () => {
        let noofcertificates = masterDataReducer?.noofcertificates[0]?.value;

        noofcertificates = noofcertificates.split(",");
        var arr = [];
        const amount = removeCommas(state.amountNeed);
        var len;
        if (amount < 50000) {
            len = 2;
        } else if (amount >= 50000 && amount <= 100000) {
            len = 3;
        } else {
            len = noofcertificates.length;
        }

        for (var i = 0; i < len; i++) {
            arr.push({
                name: noofcertificates[i],
                value: noofcertificates[i],
            });
        }
        setNoOfCertificates(arr);
        setShowNext(false);
    };

    const getNoOfTenures = () => {
        try {
            const noOfTenures = [];
            const age = calculateAge(userDOB);
            const tenures = 65 - age > 35 ? 35 : 65 - age;
            for (var i = 5; i <= tenures; i++) {
                noOfTenures.push({
                    name: i + " Years",
                    value: i,
                });
            }
            setNOfTenures(noOfTenures);
            setShowNext(false);
        } catch (error) {}
    };

    function onDropdownTenurePress() {
        setShowTenure(true);
    }

    function onLinkTap() {
        dispatch({
            actionType: "showPopup",
            payload: {
                title: TAKAFUK_INSURANCE_PLAN,
                description: INSURANCE_TAKAFUL_PLAN_DESC,
            },
        });
    }

    function handleToggle() {
        dispatchRedux({
            type: FINANCE_DETAILS_LOAN_TYPE,
            loanTypeIsConv: !isIslamic ? false : true,
        });
        setisIslamic(!isIslamic);
    }

    const calculateAge = (dob1) => {
        var today = new Date();
        var age = today.getFullYear() - moment(dob1, "DD/MM/YYYY").year() + 1;
        return age;
    };

    function onAmountNeedChange(value) {
        const min = 10000;
        if (resumeReducer?.stpDetails) {
            const max = resumeReducer?.stpDetails?.stpUbcUnits
                ? Math.floor(removeCommas(resumeReducer?.stpDetails?.stpUbcUnits) / 1000) * 1000
                : 200000;
            setAmountNeedChangeMax(max);

            setSelectNoOfCertificates("");
            setResetValueNoOfCertificate(true);
        } else {
            const fundDetails =
                prePostQualReducer?.data?.pnbResponse?.pnbResponse?.WM_UHAccountInquiryResponse
                    ?.WM_UHAccountInquiryResult?.UPLOAD_UH_ACK?.FUNDDETAIL;
            setSelectNoOfCertificates("");
            setResetValueNoOfCertificate(true);
            const asbFundDetails =
                fundDetails &&
                fundDetails.filter((item) => {
                    if (item.FUNDID === "ASB") {
                        return item;
                    }
                });

            const max =
                asbFundDetails && asbFundDetails[0]?.ELIGIBLELOANUNITS
                    ? Math.floor(removeCommas(asbFundDetails[0].ELIGIBLELOANUNITS) / 1000) * 1000
                    : 200000;
            setAmountNeedChangeMax(max);
        }

        const max = parseInt(amountNeedChangeMax);

        let result = addCommas(value);
        let err = "";
        let isValid = false;
        if (removeCommas(value) < min) {
            if (value?.length > 0) {
                err = THE_MIN_AMOUNT;
                isValid = false;
            } else {
                err = "";
                isValid = true;
            }
        } else if (removeCommas(value) > max) {
            if (value?.length > 0) {
                err = `The maximum amount you can finance is RM ${addCommas(max)}`;
                isValid = false;
            } else {
                err = "";
                isValid = true;
            }
        } else {
            setShowNext(false);
            err = "";
            isValid = true;

            result = addCommas(Math.round(removeCommas(value) / 1000) * 1000);
        }
        dispatch({
            actionType: "amountNeed",
            payload: {
                amountNeed: result,
                amountNeedErrorMsg: err,
                amountNeedValid: isValid,
            },
        });
    }

    async function updateApi() {
        if (step === 5) {
            navigation.navigate(ELIGIBILITY_SOFT_FAIL);
        }
        const loanInformation = {
            stpId: stpReferenceNumber,
            downpayment: 0,
            financingType: "C",
            loanFinancingAmountRM: parseInt(removeCommas(state.amountNeed)),
            loanTenure: parseInt(tenure),
        };
        if (step === 1) {
            logEvent(FA_FORM_PROCEED, {
                [FA_SCREEN_NAME]: "Apply_ASBFinancing_FinancingDetails",
                [FA_FIELD_INFORMATION]: `loan_type: ${
                    isIslamic ? "Islamic Financing" : "Conventional Financing"
                }; amount: ${state.amountNeed}; `,
                [FA_FIELD_INFORMATION_2]: `certificate: ${selectNoOfCertificates}; tenure: ${tenure} years; insurance: No`,
            });

            navigation.navigate(CURRENT_LOCATION, {
                loanInformation,
            });
        }
    }

    function handleProceedButton() {
        updateApi();
    }
    async function handleCalculate() {
        try {
            const totalAmount = removeCommas(state.amountNeed);
            const data = {
                stpReferenceNo: stpReferenceNumber,
                screenNo: "2",
                financingType: isIslamic ? "I" : "C",
                loanAmount: parseInt(totalAmount),
                tenure: parseInt(tenure),
                insuredTenure: parseInt(tenure),
                noOfCert: parseInt(selectNoOfCertificates),
                insurancePlan: isIslamic ? "MORPLAN4" : "MORPLAN1",
                applicantType: "M",
                ifYouSmoke: pdpVal,
                isInsured: "Y",
                insuredLoanAmount: parseInt(totalAmount),
            };
            dispatchRedux({
                screenNo: "2",
                type: "RESUME_UPDATE",
                stpLoanAmount: parseInt(totalAmount),
                stpCertificatesNum: parseInt(selectNoOfCertificates),
                stpTenure: parseInt(tenure),
                stpTypeOfLoan: isIslamic ? "I" : "C",
                stpPlInsrnce: isIslamic ? "MORPLAN4" : "MORPLAN1",
                stpCustomerDob: userDOB,
            });

            AsyncStorage.setItem("loanType", isIslamic ? "I" : "C");
            _loading.current = true;
            setLoading(true);

            const successResponse = await calculateProfitEarningPremium(data, false);

            if (successResponse.data.message === "Success") {
                setShowAdvanceDetails(true);
                setResult(successResponse.data.result.msgBody);
            } else if (successResponse.data.message === "Unsuccessful") {
                showInfoToast({
                    message: successResponse?.data?.result?.overallStatus?.statusDescription,
                });
            }
        } catch (error) {
        } finally {
            setShowNext(true);
            setLoading(false);
            _loading.current = false;
            if (result?.quotationId) {
                const data = {
                    quotationId: result?.quotationId,
                    stpReferenceNo: stpReferenceNumber,
                };
                const responseViewPDF = await viewPartyDownload(data, false, false);
                logEvent(FA_VIEW_SCREEN, {
                    [FA_SCREEN_NAME]: "Apply_ASBFinancing_ViewInsuranceFee",
                });
                setViewPDFURL(responseViewPDF?.data?.result);
            }
        }
    }

    async function handleViewParty() {
        if (viewPDFURL) {
            const params = {
                file: { base64: viewPDFURL },
                share: true,
                type: "base64",
                title: TAKAFUK_INSURANCE_PLAN,
                pdfType: "shareReceipt",
            };

            navigation.navigate(COMMON_MODULE, {
                screen: PDF_VIEW,
                params: { params },
            });
        } else {
            try {
                const data = {
                    quotationId: result?.quotationId,
                    stpReferenceNo: stpReferenceNumber,
                };
                const response = await viewPartyDownload(data, true);
                logEvent(FA_VIEW_SCREEN, {
                    [FA_SCREEN_NAME]: "Apply_ASBFinancing_ViewInsuranceFee",
                });
                const title = TAKAFUK_INSURANCE_PLAN;
                const url = response?.data?.result;
                setViewPDFURL(url);
                const params = {
                    file: { base64: url },
                    share: true,
                    type: "base64",
                    title,
                    pdfType: "shareReceipt",
                };

                navigation.navigate(COMMON_MODULE, {
                    screen: PDF_VIEW,
                    params: { params },
                });
            } catch (error) {}
        }
    }

    const InfoLabel = () => {
        return (
            <View style={styles.infoLabelContainerCls}>
                <Typo fontSize={14} lineHeight={18} textAlign="left" text="Estimated profit" />
                <TouchableOpacity onPress={onPinInfoPress}>
                    <Image style={styles.infoIcon} source={Assets.icInformation} />
                </TouchableOpacity>
            </View>
        );
    };

    const onPinInfoPress = () => {
        dispatch({
            actionType: "showPopup",
            payload: {
                title: POTENTIAL_EARNING,
                description: POTENTIAL_EARNING_RATE,
            },
        });
    };

    function onRadioBtnPDPATapYes() {
        setPdpNo(false);
        setPdpYes(true);
        setPdpVal("Y");
    }

    function onRadioBtnPDPATapNo() {
        setPdpYes(false);
        setPdpNo(true);
        setPdpVal("N");
    }

    function getNoOfCertificatesIndex(value) {
        return noOfCertificates.findIndex((obj) => obj.name === value);
    }

    function getTenuresIndex(value) {
        return noOfTenures.findIndex((obj) => obj.name === value);
    }

    function onResetValueCallback() {
        setResetValueNoOfCertificate(false);
    }

    return (
        <ScreenContainer backgroundType="color" backgroundColor={MEDIUM_GREY}>
            <>
                <ScreenLayout
                    paddingBottom={36}
                    paddingTop={16}
                    paddingHorizontal={0}
                    header={
                        <HeaderLayout
                            headerRightElement={<HeaderCloseButton onPress={handleClose} />}
                            headerCenterElement={
                                <Typo
                                    text="Step 2 of 5"
                                    fontWeight="300"
                                    fontSize={16}
                                    lineHeight={19}
                                />
                            }
                            headerLeftElement={<HeaderBackButton onPress={handleBack} />}
                        />
                    }
                    useSafeArea
                    neverForceInset={["bottom"]}
                >
                    <View style={styles.container}>
                        <KeyboardAwareScrollView
                            style={styles.containerView}
                            behavior={Platform.OS === "ios" ? "padding" : ""}
                            enabled
                            showsVerticalScrollIndicator={false}
                        >
                            {step === 1 && (
                                <>
                                    <View style={styles.wrapper}>
                                        <Typo
                                            fontSize={14}
                                            fontWeight="300"
                                            lineHeight={18}
                                            text={ASB_FINANCING}
                                            textAlign="left"
                                        />

                                        <Typo
                                            fontSize={14}
                                            fontWeight="600"
                                            lineHeight={28}
                                            style={styles.label}
                                            text={PLEASE_FILL_YOUR_FINANCING_DETAILS}
                                            textAlign="left"
                                        />

                                        <View style={styles.fieldViewCls}>
                                            <View style={styles.infoLabelContainerCls}>
                                                <Typo
                                                    fontSize={15}
                                                    lineHeight={18}
                                                    fontWeight="400"
                                                    textAlign="left"
                                                    text={TYPE_OF_LOAN_FINANCING}
                                                    style={styles.label}
                                                />
                                                <TouchableOpacity onPress={onFinanceTypePress}>
                                                    <Image
                                                        style={styles.infoIcon}
                                                        source={Assets.icInformation}
                                                    />
                                                </TouchableOpacity>
                                            </View>

                                            <View style={styles.radioContainer}>
                                                <View>
                                                    <ColorRadioButton
                                                        title={ISLAMIC_FINANCING}
                                                        isSelected={isIslamic}
                                                        fontSize={14}
                                                        onRadioButtonPressed={handleToggle}
                                                    />
                                                </View>
                                                <View style={styles.rightRadioBtn}>
                                                    <ColorRadioButton
                                                        title={CONVENTIANAL_FINANCING}
                                                        isSelected={!isIslamic}
                                                        fontSize={14}
                                                        onRadioButtonPressed={handleToggle}
                                                    />
                                                </View>
                                            </View>
                                        </View>

                                        <View style={styles.fieldViewCls}>
                                            <Typo
                                                fontSize={14}
                                                lineHeight={18}
                                                textAlign="left"
                                                text={AMOUNT_I_NEED}
                                            />
                                            <TextInput
                                                isValidate
                                                isValid={state.amountNeedValid}
                                                errorMessage={state.amountNeedErrorMsg}
                                                maxLength={keyboardShow ? 7 : 10}
                                                keyboardType="number-pad"
                                                value={
                                                    keyboardShow
                                                        ? state.amountNeed
                                                        : state.amountNeed
                                                        ? numeral(state.amountNeed).format(",0.00")
                                                        : ""
                                                }
                                                placeholder={AMOUNT_PLACEHOLDER}
                                                onChangeText={onAmountNeedChange}
                                                prefix={CURRENCY_CODE}
                                                prefixStyle={
                                                    state.amountNeed
                                                        ? styles.prefixStyle
                                                        : { color: GREY }
                                                }
                                            />
                                        </View>

                                        <View style={styles.fieldViewCls}>
                                            <View style={styles.infoLabelContainerCls}>
                                                <Typo
                                                    fontSize={14}
                                                    lineHeight={18}
                                                    textAlign="left"
                                                    text={NO_OF_CERT}
                                                    style={styles.label}
                                                />

                                                <TouchableOpacity
                                                    onPress={onNoOfCertificatesInfoPress}
                                                >
                                                    <Image
                                                        style={styles.infoIcon}
                                                        source={Assets.icInformation}
                                                    />
                                                </TouchableOpacity>
                                            </View>
                                            <View style={styles.dropdownContainer}>
                                                <Dropdown
                                                    value={
                                                        selectNoOfCertificates
                                                            ? selectNoOfCertificates
                                                            : PLEASE_SELECT
                                                    }
                                                    onPress={onDropdownPress}
                                                />
                                            </View>

                                            <Typo
                                                fontSize={12}
                                                fontWeight="400"
                                                lineHeight={18}
                                                color={TXT_GREY}
                                                text={RM50_PER_CERT}
                                                textAlign="left"
                                            />
                                        </View>

                                        <View style={styles.fieldViewCls}>
                                            <Typo
                                                fontSize={14}
                                                lineHeight={18}
                                                textAlign="left"
                                                text={TENURE}
                                                style={styles.label}
                                            />
                                            <View style={styles.dropdownContainer}>
                                                <Dropdown
                                                    value={
                                                        selectTenure ? selectTenure : PLEASE_SELECT
                                                    }
                                                    onPress={onDropdownTenurePress}
                                                />
                                            </View>
                                        </View>

                                        <View style={styles.viewStyle}>
                                            <Typo
                                                fontSize={14}
                                                fontWeight="400"
                                                lineHeight={18}
                                                text={TAKAFUK_INSURANCE_PLAN}
                                                textAlign="left"
                                            />
                                            <Typo
                                                fontSize={12}
                                                lineHeight={20}
                                                fontWeight="normal"
                                                letterSpacing={0}
                                                textAlign="left"
                                                style={styles.viewStyle}
                                            >
                                                {ADDING_INSURANCE}
                                                <Typo
                                                    fontSize={12}
                                                    lineHeight={25}
                                                    fontWeight="600"
                                                    letterSpacing={0}
                                                    textAlign="left"
                                                    style={styles.textStyle}
                                                    text={TAKAFUL_INSURANCE_PLAN}
                                                    onPress={onLinkTap}
                                                />
                                                <Typo
                                                    fontSize={12}
                                                    lineHeight={20}
                                                    fontWeight="normal"
                                                    letterSpacing={0}
                                                    textAlign="left"
                                                    text={PLEASE_LET_US_KNOW_IF_U_SMOKE}
                                                />
                                            </Typo>
                                        </View>
                                        <View style={styles.groupContainer}>
                                            <TouchableOpacity onPress={onRadioBtnPDPATapYes}>
                                                <ColorRadioButton
                                                    title="Yes"
                                                    isSelected={pdpYes}
                                                    fontSize={14}
                                                    fontWeight="400"
                                                    onRadioButtonPressed={onRadioBtnPDPATapYes}
                                                />
                                            </TouchableOpacity>
                                            <TouchableOpacity
                                                style={styles.noRadioBtn}
                                                onPress={onRadioBtnPDPATapNo}
                                            >
                                                <ColorRadioButton
                                                    title="No"
                                                    isSelected={pdpNo}
                                                    fontSize={14}
                                                    fontWeight="400"
                                                    onRadioButtonPressed={onRadioBtnPDPATapNo}
                                                />
                                            </TouchableOpacity>
                                        </View>
                                        {!showAdvanceDetails && (
                                            <View style={styles.showAdvanceDetailsCol}>
                                                <FixedActionContainer>
                                                    <View style={styles.footer}>
                                                        <ActionButton
                                                            fullWidth
                                                            disabled={
                                                                !state.amountNeed?.length > 0 ||
                                                                !state.amountNeedValid ||
                                                                !selectTenure ||
                                                                !selectNoOfCertificates
                                                            }
                                                            borderRadius={25}
                                                            onPress={handleCalculate}
                                                            backgroundColor={WHITE}
                                                            isLoading={loading}
                                                            componentCenter={
                                                                <Typo
                                                                    text={CALCULATE}
                                                                    fontSize={14}
                                                                    fontWeight="600"
                                                                    lineHeight={18}
                                                                    color={
                                                                        !state.amountNeed?.length >
                                                                            0 ||
                                                                        !state.amountNeedValid ||
                                                                        !selectTenure ||
                                                                        !selectNoOfCertificates
                                                                            ? DISABLED_TEXT
                                                                            : BLACK
                                                                    }
                                                                />
                                                            }
                                                        />
                                                    </View>
                                                </FixedActionContainer>
                                            </View>
                                        )}
                                        {showAdvanceDetails && (
                                            <View style={styles.detailsContainer}>
                                                {!!result &&
                                                    !!result.profitRates &&
                                                    result.profitRates.map((data, index) => {
                                                        count += data.year;
                                                        return (
                                                            <View style={styles.recRow} key={index}>
                                                                <View style={styles.cardBodyColL}>
                                                                    <Typo
                                                                        fontSize={14}
                                                                        lineHeight={18}
                                                                        fontWeight="600"
                                                                        letterSpacing={0}
                                                                        textAlign="left"
                                                                        text={
                                                                            result?.profitRates
                                                                                .length === 1
                                                                                ? ""
                                                                                : data.tier === 1
                                                                                ? "First " +
                                                                                  data.year +
                                                                                  " years"
                                                                                : index !=
                                                                                  result
                                                                                      ?.profitRates
                                                                                      .length -
                                                                                      1
                                                                                ? count + " years"
                                                                                : index +
                                                                                  3 +
                                                                                  "-" +
                                                                                  count +
                                                                                  " years"
                                                                        }
                                                                    />
                                                                </View>
                                                                {/* Interest/Profit Rate */}
                                                                <InlineTypography
                                                                    label={PROFIT_INTEREST}
                                                                    value={
                                                                        !!data &&
                                                                        data?.interestRate &&
                                                                        `${numeral(
                                                                            data?.interestRate
                                                                        ).format(",0.00")}%`
                                                                    }
                                                                    componentID="interestRate"
                                                                    style={
                                                                        styles.detailsRowContainer
                                                                    }
                                                                />

                                                                {/* Monthly Payments */}
                                                                <InlineTypography
                                                                    label={MONTHLY_PAYMENT}
                                                                    value={
                                                                        !!data &&
                                                                        data?.installmentAmount &&
                                                                        `RM ${numeral(
                                                                            data?.installmentAmount
                                                                        ).format(",0.00")}`
                                                                    }
                                                                    infoBtn={false}
                                                                    componentID="monthlyPayments"
                                                                    style={
                                                                        styles.detailsRowContainer
                                                                    }
                                                                />
                                                            </View>
                                                        );
                                                    })}

                                                <InlineTypography
                                                    label={TAKAFUL_INSURANCE_FEE}
                                                    value={
                                                        result.totalNetPremium &&
                                                        `RM ${numeral(
                                                            result.totalNetPremium
                                                        ).format(",0.00")}`
                                                    }
                                                    componentID="loanAmount"
                                                    style={styles.detailsRowContainer}
                                                />
                                                <View style={styles.invertCardFooter}>
                                                    <View style={styles.invertCardFooterColOne}>
                                                        <TouchableOpacity onPress={handleViewParty}>
                                                            <Typo
                                                                fontSize={14}
                                                                lineHeight={18}
                                                                fontWeight="600"
                                                                letterSpacing={0}
                                                                textAlign="center"
                                                                text={VIEW}
                                                                color={ROYAL_BLUE}
                                                            />
                                                        </TouchableOpacity>
                                                    </View>
                                                </View>
                                            </View>
                                        )}

                                        {showAdvanceDetails && (
                                            <View style={styles.detailsContainer}>
                                                <View style={styles.potentialContainer}>
                                                    {InfoLabel()}
                                                    <Typo
                                                        fontSize={24}
                                                        lineHeight={28}
                                                        fontWeight="600"
                                                        letterSpacing={0}
                                                        textAlign="left"
                                                        text={
                                                            result.potentialEarning &&
                                                            `RM ${numeral(
                                                                addCommas(result.potentialEarning)
                                                            ).format(",0.00")}`
                                                        }
                                                    />
                                                </View>
                                            </View>
                                        )}

                                        {showAdvanceDetails && (
                                            <View style={styles.fieldContainer}>
                                                <Typo
                                                    fontSize={12}
                                                    lineHeight={25}
                                                    fontWeight="normal"
                                                    letterSpacing={0}
                                                    style={styles.potentialStyle}
                                                    textAlign="left"
                                                    text={YOUR_ESTIMATED_PROFIT}
                                                />
                                                <Typo
                                                    fontSize={12}
                                                    lineHeight={25}
                                                    fontWeight="normal"
                                                    letterSpacing={0}
                                                    style={styles.potentialStyle}
                                                    textAlign="left"
                                                    text={ASB_NOTE}
                                                />
                                            </View>
                                        )}
                                    </View>
                                </>
                            )}

                            {step === 5 && (
                                <>
                                    <SelectAccount />
                                </>
                            )}

                            {step === 1 && showAdvanceDetails && (
                                <View style={styles.view}>
                                    <View style={styles.footer}>
                                        <ActionButton
                                            fullWidth
                                            disabled={
                                                !state.amountNeed.length > 0 ||
                                                !state.amountNeedValid ||
                                                !selectTenure ||
                                                !selectNoOfCertificates
                                            }
                                            borderRadius={25}
                                            onPress={handleCalculate}
                                            backgroundColor={WHITE}
                                            isLoading={loading}
                                            componentCenter={
                                                <Typo
                                                    text={RECALCULATE}
                                                    fontSize={14}
                                                    fontWeight="600"
                                                    lineHeight={18}
                                                    color={
                                                        !state.amountNeed.length > 0 ||
                                                        !state.amountNeedValid ||
                                                        !selectTenure ||
                                                        !selectNoOfCertificates
                                                            ? DISABLED_TEXT
                                                            : BLACK
                                                    }
                                                />
                                            }
                                        />
                                    </View>

                                    <ActionButton
                                        fullWidth
                                        disabled={!showNext}
                                        borderRadius={25}
                                        onPress={handleProceedButton}
                                        backgroundColor={!showNext ? DISABLED : YELLOW}
                                        componentCenter={
                                            <Typo
                                                text={SAVE_NEXT}
                                                fontSize={14}
                                                fontWeight="600"
                                                lineHeight={18}
                                                color={!showNext ? DISABLED_TEXT : BLACK}
                                            />
                                        }
                                    />
                                </View>
                            )}

                            {showAdvanceDetails && (
                                <View>
                                    {step > 1 && (
                                        <FixedActionContainer>
                                            <View style={styles.footer}>
                                                <ActionButton
                                                    fullWidth
                                                    disabled={state.isContinueDisabled}
                                                    borderRadius={25}
                                                    onPress={handleProceedButton}
                                                    backgroundColor={MEDIUM_GREY}
                                                    componentCenter={
                                                        <Typo
                                                            text={SKIP}
                                                            fontSize={14}
                                                            fontWeight="600"
                                                            lineHeight={18}
                                                            color={ROYAL_BLUE}
                                                        />
                                                    }
                                                />
                                            </View>
                                        </FixedActionContainer>
                                    )}
                                </View>
                            )}
                        </KeyboardAwareScrollView>
                        <Popup
                            visible={state.showPopup}
                            onClose={onPopupClose}
                            title={state.popupTitle}
                            description={state.popupDescription}
                            secondaryTitle={state.secondaryTitle}
                            secondaryDescription={state.secondaryDescription}
                        />
                        <ScrollPickerViewWithResetOption
                            showMenu={showNoOfCertificates}
                            list={noOfCertificates}
                            onRightButtonPress={onPickerDone}
                            onLeftButtonPress={onPickerCancel}
                            rightButtonText={DONE}
                            leftButtonText={CANCEL}
                            selectedIndex={
                                selectNoOfCertificates
                                    ? getNoOfCertificatesIndex(selectNoOfCertificates)
                                    : 0
                            }
                            resetValue={resetValueNoOfCertificate}
                            onResetValueCallback={onResetValueCallback}
                        />
                        <ScrollPickerView
                            showMenu={showTenure}
                            list={noOfTenures}
                            onRightButtonPress={onPickerTenureDone}
                            onLeftButtonPress={onPickerTenureCancel}
                            rightButtonText={DONE}
                            leftButtonText={CANCEL}
                            selectedIndex={selectTenure ? getTenuresIndex(selectTenure) : 0}
                        />
                    </View>
                </ScreenLayout>

                <Popup
                    visible={state.showInfo}
                    title={state.infoTitle}
                    description={state.infoDescription}
                    onClose={onPopupClose}
                />
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
            </>
        </ScreenContainer>
    );
}

ApplicationFinanceDetails.propTypes = {
    route: PropTypes.object,
    navigation: PropTypes.object,
};

const styles = StyleSheet.create({
    cardBodyColL: {
        marginLeft: 20,
        width: "60%",
    },
    container: {
        flex: 1,
        flexDirection: "column",
        justifyContent: "space-between",
    },
    containerView: {
        flex: 1,
        width: "100%",
    },
    detailsContainer: {
        backgroundColor: WHITE,
        borderColor: TRANSPARENT,
        borderRadius: 8,
        marginTop: 20,
        paddingVertical: 15,
        shadowColor: BLACK,
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.15,
        shadowRadius: 3.84,
        width: "100%",
    },
    detailsRowContainer: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginTop: 10,
        paddingHorizontal: 20,
        width: "100%",
    },
    dropdownContainer: {
        paddingVertical: 5,
    },
    fieldContainer: {
        marginHorizontal: 12,
    },
    fieldViewCls: {
        marginTop: 25,
    },
    footer: {
        alignItems: "center",
        flexDirection: "column",
        marginBottom: 16,
        width: "100%",
    },
    groupContainer: {
        alignItems: "flex-start",
        flexDirection: "row",
        justifyContent: "flex-start",
        marginBottom: 24,
        marginLeft: 0,
        width: "100%",
    },
    infoIcon: {
        height: 16,
        marginLeft: 10,
        width: 16,
    },

    infoLabelContainerCls: {
        flexDirection: "row",
        paddingVertical: 2,
    },
    invertCardFooter: {
        flexDirection: "row",
        marginLeft: 20,
        paddingBottom: 5,
        paddingTop: 15,
    },
    invertCardFooterColOne: {
        alignItems: "baseline",
        justifyContent: "center",
        width: "50%",
    },
    label: {
        // marginBottom: 24,
    },
    noRadioBtn: {
        marginLeft: 20,
        width: "60%",
    },
    potentialContainer: {
        alignItems: "center",
        flexDirection: "column",
        justifyContent: "center",
        paddingTop: 10,
        width: "100%",
    },
    potentialStyle: {
        textAlign: "center",
    },
    prefixStyle: {
        color: BLACK,
    },
    radioContainer: {
        alignItems: "flex-start",
        flexDirection: "column",
        justifyContent: "flex-start",
        width: "100%",
    },
    recRow: {
        borderBottomColor: SEPARATOR,
        borderBottomLeftRadius: 20,
        borderBottomRightRadius: 20,
        borderBottomWidth: 1,
        paddingVertical: 8,
    },
    rightRadioBtn: {
        width: "100%",
    },
    showAdvanceDetailsCol: { paddingTop: 15 },
    textStyle: {
        textDecorationLine: "underline",
    },

    view: {
        marginHorizontal: 20,
        marginTop: 24,
    },
    viewStyle: {
        marginTop: 20,
    },
    wrapper: {
        paddingHorizontal: 25,
    },
});

export default ApplicationFinanceDetails;
