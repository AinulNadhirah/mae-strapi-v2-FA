import moment from "moment";
import numeral from "numeral";
import PropTypes from "prop-types";
import React, { Component } from "react";
import { StyleSheet, View, Text, Platform, TouchableOpacity, Modal, Image } from "react-native";
import DeviceInfo from "react-native-device-info";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";

import { navigateToS2UCooling } from "@screens/OneTapAuth/CoolingNavigator";

import {
    PDF_VIEWER,
    MAE_CARD_STATUS,
    TAB,
    TAB_NAVIGATOR,
    MAYBANK2U,
    DASHBOARD,
    MAE_CARDDETAILS,
    ONE_TAP_AUTH_MODULE,
    BANKINGV2_MODULE,
    MAE_CARD_ADDRESS,
    SECURE2U_COOLING,
} from "@navigation/navigationConstant";

import HeaderLayout from "@layouts/HeaderLayout";
import ScreenLayout from "@layouts/ScreenLayout";

import ActionButton from "@components/Buttons/ActionButton";
import HeaderBackButton from "@components/Buttons/HeaderBackButton";
import { LongTextInput } from "@components/Common";
import RadioChecked from "@components/Common/RadioChecked";
import RadioUnchecked from "@components/Common/RadioUnchecked";
import ScreenContainer from "@components/Containers/ScreenContainer";
import FixedActionContainer from "@components/Footers/FixedActionContainer";
import LabeledDropdown from "@components/FormComponents/LabeledDropdown";
import OtpModal from "@components/Modals/OtpModal";
import Secure2uAuthenticationModal from "@components/Modals/Secure2uAuthenticationModal";
import ScrollPicker from "@components/Pickers/ScrollPicker";
import StateScrollPickerItem from "@components/Pickers/ScrollPicker/StateScrollPickerItem";
import Popup from "@components/Popup";
import Typo from "@components/Text";
import TextInput from "@components/TextInput";
import { showErrorToast } from "@components/Toast";

import { withModelContext } from "@context";

import { requestTAC, maeCardApplication, dbtCrdRpm } from "@services";
import { GAMAECardScreen } from "@services/analytics/analyticsSTPMae";

import { BLACK, YELLOW, MEDIUM_GREY, DISABLED } from "@constants/colors";
import { CARDS_REQ_OTP } from "@constants/data";
import {
    PLEASE_SELECT,
    MAE_REQUESTCARD,
    MAECARD_APPLY_SERVCHARGETEXT,
    CARD_REPLACE_TITLE,
    CARD_REPLACE_SUBTEXT,
    TERMS_CONDITIONS,
    COMMON_ERROR_MSG,
    MAECARD_APPLY_FAIL,
    REFERENCE_ID,
    DATE_AND_TIME,
    SUCC_STATUS,
    MAECARD_APPLY_SUCC,
    MAECARD_APPLY_SUCC_HR,
    FAIL_STATUS,
    MAECARD_REPLACE_FAIL,
    MAECARD_REPLACE_SUCC,
    MAE_FATCA_TNC,
    CONTINUE,
    ADDRESS,
    RENEWAL_FEE,
    RENEWAL_FEE_AMT,
    FROM,
    CARD_REPLACE_ADDRESS_TITLE,
    CARD_REPLACE_WHERE_DO_YOU_WANT,
    STEPUP_MAE_ADDRESS_ONE,
    STEPUP_MAE_ADDRESS_TWO,
    STEPUP_MAE_ADDRESS_ONE_DESC,
    STEPUP_MAE_ADDRESS_ONE_PLACEHOLDER,
    STEPUP_MAE_ADDRESS_TWO_PLACEHOLDER,
    STEPUP_MAE_CITY_PLACEHOLDER,
    STEPUP_MAE_POSTCODE_PLACEHOLDER,
    STEPUP_MAE_ADDRESS_ONE_CARDRPM_PLACEHOLDER,
    STEPUP_MAE_ADDRESS_TWO_CARDRPM_PLACEHOLDER,
    STEPUP_MAE_CITY_CARDRPM_PLACEHOLDER,
    STEPUP_MAE_POSTCODE_CARDRPM_PLACEHOLDER,
    MAECARD_REPLACE_SUCC_DESC,
    S2U_RETRY_AFTER_SOMETIME,
    MAE_CRD_RPM,
    FA_CARD_REPLACEMENT,
    FA_CARD_REQUESTCARD_MAE_DELIVERYADDRESS,
} from "@constants/strings";
import { MAE_REQ_TAC, MAE_CARD_RPM_TNC, MAE_CARD_APPLY_TNC } from "@constants/url";
import { MAE_CARD_APPLICATION, MAE_CARD_APPLICATION_V2 } from "@constants/url";

import { maskedMobileNumber } from "@utils";
import { getDeviceRSAInformation, checks2UFlow } from "@utils/dataModel/utility";

import assets from "@assets";

import {
    validateAddressOne,
    validateAddressTwo,
    validateCity,
    validatePostcode,
    constructCardApplicationParams,
} from "./CardManagementController";

class MAECardAddress extends Component {
    constructor(props) {
        super(props);
        this.state = {
            // Address 1
            addressOne: "",
            addressOneValid: true,
            addressOneErrorMsg: "",

            // Address 2
            addressTwo: "",
            addressTwoValid: true,
            addressTwoErrorMsg: "",

            // City
            city: "",
            cityValid: true,
            cityErrorMsg: "",

            // State
            state: PLEASE_SELECT,
            stateValue: null,
            stateValid: true,
            stateErrorMsg: "",
            stateData: null,
            stateKeyVal: null,
            showStatePicker: false,
            stateIndex: 0,

            // Postcode
            postcode: "",
            postcodeValid: true,
            postcodeErrorMsg: "",

            // Terms & Condition
            tnc: false,
            tncValid: true,
            tncErrorMsg: "",

            // OTP Modal
            showOTP: false,
            token: null,
            mobileNumber: null,
            maskedMobileNumber: null,

            // Others
            flowType: null,
            isContinueDisabled: true,
            applyCardParams: null,
            transactionType: null,
            pickerItemHeight: 44,
            mobileSDKData: null,
            trinityFlag: null,

            // Form label
            titleText: MAE_REQUESTCARD,
            noteText: MAECARD_APPLY_SERVCHARGETEXT,
            //s2u
            secure2uValidateData: {},
            flow: "",
            showS2u: false,
            pollingToken: "",
            s2uTransactionDetails: [],
            detailsArray: [],
            secure2uExtraParams: null,
            nonTxnData: {},
            serviceCharge: this.props?.route?.params?.serviceCharge,

            // Info Popup for Address Line 1
            showInfoPopup: false,
        };
        this.cardType = "PHYSICAL";
    }

    componentDidMount = () => {
        console.log("[MAECardAddress] >> [componentDidMount]");

        // Call method to manage data after init
        this.manageDataOnInit();
        // Using Focus to handle props with new values
        this.props.navigation.addListener("focus", this.onScreenFocus);
    };

    manageDataOnInit = () => {
        console.log("[MAECardAddress] >> [manageDataOnInit]");

        const params = this.props?.route?.params ?? {};
        const { gcifData, masterData, mobileNumber, flowType, serviceCharge, trinityFlag } = params;

        const { stateData, stateKeyVal } = masterData;
        const deviceInfo = this.props.getModel("device");
        const mobileSDKData = getDeviceRSAInformation(deviceInfo.deviceInformation, DeviceInfo);

        // Pre-populate information if exists
        if (gcifData) {
            const index = stateData.findIndex((stateItem) => stateItem.value === gcifData?.state);
            this.setState(
                {
                    addressOne: gcifData?.addressOne ?? "",
                    addressTwo: gcifData?.addressTwo ?? "",
                    city: gcifData?.city ?? "",
                    postcode: gcifData?.postcode ?? "",
                    state: stateKeyVal[gcifData?.state] ?? PLEASE_SELECT,
                    stateValue: gcifData?.state ?? null,
                    stateIndex: index,
                },
                () => {
                    this.checkEmptyState();
                }
            );
        }

        // Label changes specific to "Card Replacement" flow
        if (flowType === "MAE_CRD_RPM") {
            this.setState({
                titleText: CARD_REPLACE_TITLE,
                noteText: CARD_REPLACE_SUBTEXT.replace(
                    "[serviceCharge]",
                    numeral(serviceCharge).format("0,0.00")
                ),
            });
        } else {
            this.setState({
                titleText: MAE_REQUESTCARD,
                noteText: MAECARD_APPLY_SERVCHARGETEXT.replace(
                    "[serviceCharge]",
                    numeral(serviceCharge).format("0,0.00")
                ),
            });
        }

        // Update state data from master
        this.setState({
            stateData,
            stateKeyVal,
            mobileNumber,
            flowType,
            maskedMobileNumber: maskedMobileNumber(mobileNumber),
            mobileSDKData,
            trinityFlag,
        });
    };

    onScreenFocus = () => {
        console.log("[MAECardAddress] >> [onScreenFocus]");

        const params = this.props.route?.params ?? null;
        if (!params) return;
        const { isFromS2uReg } = params;
        if (isFromS2uReg) this.handleS2uFlow();
    };

    handleS2uFlow = () => {
        const params = this.props.route?.params ?? null;
        const { auth, flowFrom } = params;
        console.log(params);
        // Update navigation params data
        this.props.navigation.setParams({
            isFromS2uReg: false,
        });
        // Show reg fail error msg for S2u
        if (auth === "fail") {
            showErrorToast({
                message: "Failed to register for Secure2u. Please proceed with TAC.",
            });
            this.setState({ flow: "TAC" }, () => {
                this.requestOTP();
            });
        } else {
            this.setState({ flow: "S2U" }, () => {
                if (flowFrom === "MAE_CRD_RPM") {
                    this.cardReplaceAPI("");
                } else {
                    this.applyMAECardAPI("");
                }
            });
        }
    };

    onBackTap = () => {
        console.log("[MAECardAddress] >> [onBackTap]");

        this.props.navigation.goBack();
    };

    onAddressOneChange = (value) => this.onTextInputChange("addressOne", value);

    onAddressTwoChange = (value) => this.onTextInputChange("addressTwo", value);

    onCityChange = (value) => this.onTextInputChange("city", value);

    onPostcodeChange = (value) => this.onTextInputChange("postcode", value);

    showStatePicker = () => {
        console.log("[MAECardAddress] >> [onPickerCancel]");

        this.setState({ showStatePicker: true });
    };

    onPickerCancel = () => {
        console.log("[MAECardAddress] >> [onPickerCancel]");

        this.setState({ showStatePicker: false });
    };

    onPickerDone = (value) => {
        console.log("[MAECardAddress] >> [onPickerDone]");

        const { stateData, stateKeyVal } = this.state;
        const state = stateKeyVal[value];
        const index = stateData.findIndex((stateItem) => stateItem.value === value);

        this.setState({ state, stateValue: value, stateIndex: index }, () => {
            this.checkEmptyState();
        });

        // Close picker
        this.onPickerCancel();
    };

    onTextInputChange = (key, value) => {
        console.log("[MAECardAddress][onTextInputChange] >> Key: " + key + " | value: " + value);
        this.setState(
            {
                [key]: value,
            },
            () => {
                this.checkEmptyState();
            }
        );
    };

    checkEmptyState = () => {
        console.log("[MAECardAddress] >> [checkEmptyState]");

        const { addressOne, addressTwo, city, postcode, stateValue, tnc } = this.state;
        if (
            addressOne.trim() == "" ||
            addressTwo.trim() == "" ||
            city.trim() == "" ||
            postcode.trim() == "" ||
            stateValue == null ||
            tnc === false
        ) {
            this.setState({
                isContinueDisabled: true,
            });
        } else {
            this.setState({
                isContinueDisabled: false,
            });
        }
    };

    onTnCLinkTap = () => {
        console.log("[MAECardAddress] >> [onTnCLinkTap]");

        const { flowType } = this.state;
        let tncLink;

        if (flowType === "MAE_CRD_RPM") {
            tncLink = MAE_CARD_RPM_TNC;
        } else {
            tncLink = MAE_CARD_APPLY_TNC;
        }

        this.props.navigation.navigate(PDF_VIEWER, {
            file: tncLink,
            type: "url",
            title: TERMS_CONDITIONS,
            showShare: false,
        });
    };

    onTnCRadioBtnTap = () => {
        console.log("[MAECardAddress] >> [onTnCRadioBtnTap]");

        const { tnc } = this.state;

        this.setState(
            {
                tnc: !tnc,
            },
            () => {
                this.checkEmptyState();
            }
        );
    };

    resetValidationErrors = () => {
        console.log("[MAECardAddress] >> [resetValidationErrors]");

        this.setState({
            addressOneValid: true,
            addressOneErrorMsg: "",
            addressTwoValid: true,
            addressTwoErrorMsg: "",
            cityValid: true,
            cityErrorMsg: "",
            postcodeValid: true,
            postcodeErrorMsg: "",
        });
    };

    getFormData = () => {
        console.log("[MAECardAddress] >> [getFormData]");

        const { addressOne, addressTwo, city, state, stateValue, postcode, maskedMobileNumber } =
            this.state;

        return {
            addressOne,
            addressTwo,
            city,
            state,
            stateValue,
            postcode,
            maskedMobileNumber,
        };
    };

    validateFormDetails = () => {
        console.log("[MAECardAddress] >> [validateFormDetails]");

        // Reset existing error state
        this.resetValidationErrors();

        const { addressOne, addressTwo, city, postcode, flowType } = this.state;
        const { cardDetails } = this.props.route.params;
        const maeAcctNo = cardDetails?.maeAcctNo ?? null;

        // Address One
        const { isValid: addressOneValid, message: addressOneErrorMsg } = validateAddressOne(
            addressOne,
            flowType
        );
        if (!addressOneValid) this.setState({ addressOneValid, addressOneErrorMsg });

        // Address Two
        const { isValid: addressTwoValid, message: addressTwoErrorMsg } = validateAddressTwo(
            addressTwo,
            flowType
        );
        if (!addressTwoValid) this.setState({ addressTwoValid, addressTwoErrorMsg });

        // City
        const { isValid: cityValid, message: cityErrorMsg } = validateCity(city, flowType);
        if (!cityValid) this.setState({ cityValid, cityErrorMsg });

        // Post Code
        const { isValid: postcodeValid, message: postcodeErrorMsg } = validatePostcode(
            postcode,
            flowType
        );
        if (!postcodeValid) this.setState({ postcodeValid, postcodeErrorMsg });

        if (!addressOneValid || !addressTwoValid || !cityValid || !postcodeValid) {
            return false;
        }

        if (!maeAcctNo) {
            showErrorToast({
                message: "Missing account details. Please try again later.",
            });
            return false;
        }

        // Return true if all validation checks are passed
        return true;
    };

    isETB = (applicantType) => {
        if (
            applicantType == "0" ||
            applicantType == "5" ||
            applicantType == "6" ||
            applicantType == "7" ||
            applicantType == "8"
        ) {
            return true;
        }
        return false;
    };

    onContinue = async () => {
        console.log("[MAECardAddress] >> [onContinue]");

        const { isContinueDisabled, flowType, mobileSDKData } = this.state;
        const params = this.props?.route?.params ?? {};
        const { gcifData, customerType, applicantType } = params;

        // Return if button is in disabled state
        if (isContinueDisabled) return;

        // Return is form validation fails
        const isFormValid = this.validateFormDetails();
        if (!isFormValid) return;

        if (flowType === "MAE_CRD_RPM") {
            // Card Replacement Flow
            const { flow, secure2uValidateData } = await checks2UFlow(
                38,
                this.props.getModel,
                this.props.updateModel
            );
            const {
                navigation: { navigate },
            } = this.props;
            this.setState(
                {
                    transactionType: flowType,
                    flow: flow,
                    secure2uValidateData: secure2uValidateData,
                    nonTxnData: { isNonTxn: true, nonTxnTitle: "Card Replacement/Renewal" },
                    secure2uExtraParams: {
                        metadata: { txnType: "MAE_CRD_RPM" },
                    },
                },
                () => {
                    switch (flow) {
                        case SECURE2U_COOLING:
                            navigateToS2UCooling(navigate);
                            break;
                        case "S2UReg":
                            navigate(ONE_TAP_AUTH_MODULE, {
                                screen: "Activate",
                                params: {
                                    flowParams: {
                                        success: {
                                            stack: BANKINGV2_MODULE,
                                            screen: MAE_CARD_ADDRESS,
                                        },
                                        fail: {
                                            stack: BANKINGV2_MODULE,
                                            screen: MAE_CARD_ADDRESS,
                                        },

                                        params: {
                                            ...params,
                                            flow: "S2UReg",
                                            isFromS2uReg: true,
                                            secure2uValidateData: secure2uValidateData,
                                            flowFrom: flowType,
                                        },
                                    },
                                },
                            });
                            break;
                        case "S2U":
                            this.cardReplaceAPI("");
                            break;
                        case "TAC":
                            this.requestOTP();
                            break;
                        default:
                            break;
                    }
                }
            );
        } else {
            // Apply Card Flow
            const { flow, secure2uValidateData } = await checks2UFlow(
                37,
                this.props.getModel,
                this.props.updateModel
            );
            const isETB = this.isETB(applicantType);
            const accumulatedData = {
                ...params,
                ...this.getFormData(),
                mobileSDKData,
                isETB,
            };
            const applyCardParams = constructCardApplicationParams(
                accumulatedData,
                gcifData,
                customerType
            );
            const {
                navigation: { navigate },
            } = this.props;

            this.setState(
                {
                    applyCardParams,
                    transactionType: CARDS_REQ_OTP,
                    flow: flow,
                    secure2uValidateData: secure2uValidateData,
                    nonTxnData: { isNonTxn: true, nonTxnTitle: "Request Card" },
                    secure2uExtraParams: {
                        metadata: { txnType: "MAE_APPLY_CARD" },
                    },
                },
                () => {
                    switch (flow) {
                        case SECURE2U_COOLING:
                            navigateToS2UCooling(navigate);
                            break;
                        case "S2UReg":
                            navigate(ONE_TAP_AUTH_MODULE, {
                                screen: "Activate",
                                params: {
                                    flowParams: {
                                        success: {
                                            stack: BANKINGV2_MODULE,
                                            screen: MAE_CARD_ADDRESS,
                                        },
                                        fail: {
                                            stack: BANKINGV2_MODULE,
                                            screen: MAE_CARD_ADDRESS,
                                        },
                                        params: {
                                            ...params,
                                            flow: "S2UReg",
                                            isFromS2uReg: true,
                                            secure2uValidateData: secure2uValidateData,
                                            flowFrom: flowType,
                                        },
                                    },
                                },
                            });
                            break;
                        case "S2U":
                            this.applyMAECardAPI("");
                            break;
                        case "TAC":
                            this.requestOTP();
                            break;
                        default:
                            break;
                    }
                }
            );
        }
    };

    requestOTP = async (isResend = false, showOTPCb = () => {}) => {
        console.log("[MAECardAddress] >> [requestOTP]");

        const { mobileNumber, transactionType } = this.state;
        const { cardDetails } = this.props?.route?.params;
        const cardNo = transactionType === "MAE_CRD_RPM" ? cardDetails?.cardNo ?? "" : "";

        const params = {
            mobileNo: mobileNumber,
            idNo: "",
            transactionType: transactionType,
            otp: "",
            preOrPostFlag: "postlogin",
            cardNo: cardNo,
            cardType: this.cardType,
        };

        const httpResp = await requestTAC(params, true, MAE_REQ_TAC).catch((error) => {
            console.log("[MAECardAddress][requestOTP] >> Exception: ", error);
        });
        const statusCode = httpResp?.data?.statusCode ?? null;
        const statusDesc = httpResp?.data?.statusDesc ?? null;

        if (statusCode !== "0000") {
            showErrorToast({
                message: statusDesc || COMMON_ERROR_MSG,
            });
            return;
        }

        const token = httpResp?.data?.token ?? null;
        // Update token and show OTP modal
        this.setState({ token }, () => {
            this.showOTPModal();

            if (isResend) showOTPCb();
        });
    };

    showOTPModal = () => {
        console.log("[MAECardAddress] >> [onOTPDone]");

        this.setState({ showOTP: true });
    };

    onOTPDone = (otp, otpModalErrorCb) => {
        console.log("[MAECardAddress] >> [onOTPDone]");

        const { flowType } = this.state;
        if (flowType == "MAE_CRD_RPM") {
            this.cardReplaceAPI(otp, otpModalErrorCb);
        } else {
            this.applyMAECardAPI(otp, otpModalErrorCb);
        }
    };

    closeOTPModal = () => {
        console.log("[MAECardAddress] >> [closeOTPModal]");

        this.setState({ showOTP: false, token: null });
    };

    onOTPClose = () => {
        console.log("[MAECardAddress] >> [onOTPClose]");

        // Close OTP Modal
        this.closeOTPModal();

        // Navigate back to entry point
        this.onStatusPgDone();
    };

    onOTPResend = (showOTPCb) => {
        console.log("[MAECardAddress] >> [onOTPResend]");

        this.requestOTP(true, showOTPCb);
    };

    applyMAECardAPI = (otp, otpModalErrorCb) => {
        console.log("[MAECardAddress] >> [applyMAECardAPI]");

        const { applyCardParams, flow, secure2uValidateData } = this.state;
        const trinityFlag = this.props?.route?.params?.trinityFlag ?? null;
        const url = trinityFlag === "Y" ? MAE_CARD_APPLICATION_V2 : MAE_CARD_APPLICATION;
        const params = {
            ...applyCardParams,
            tacBlock: otp,
            twoFAType:
                flow === "S2U"
                    ? secure2uValidateData?.pull === "N"
                        ? "SECURE2U_PUSH"
                        : "SECURE2U_PULL"
                    : "TAC",
        };

        maeCardApplication(params, url)
            .then((httpResp) => {
                console.log("[MAECardAddress][applyMAECardAPI] >> Response: ", httpResp);

                const result = httpResp?.data?.result ?? null;
                if (!result) {
                    // Close OTP modal
                    this.closeOTPModal();

                    // Navigate to Fail Status page
                    this.gotoFailStatusPage({
                        headerText: MAECARD_APPLY_FAIL,
                    });
                    GAMAECardScreen.onAcknowledgeRequestCard(FAIL_STATUS, []);
                    return;
                }

                let detailsArray = [];
                const { statusCode, statusDesc, txnRefNo, dtTime, formattedTransactionRefNumber } =
                    result;

                // Check for Ref ID
                if (formattedTransactionRefNumber || txnRefNo) {
                    detailsArray.push({
                        key: REFERENCE_ID,
                        value: formattedTransactionRefNumber || txnRefNo,
                    });
                }

                // Check for Server Date/Time
                if (dtTime) {
                    detailsArray.push({
                        key: DATE_AND_TIME,
                        value: dtTime,
                    });
                }

                switch (statusCode) {
                    case "000":
                    case "0000":
                        if (flow === "S2U") {
                            this.setState({ detailsArray }, () => {
                                this.showS2uModal(result);
                            });
                        } else {
                            // Close OTP modal
                            this.closeOTPModal();

                            // Success scenario
                            this.props.navigation.navigate(MAE_CARD_STATUS, {
                                status: SUCC_STATUS,
                                headerText: MAECARD_APPLY_SUCC,
                                detailsArray,
                                onDone: this.onStatusPgDone,
                                isShowS2w: true,
                            });
                            GAMAECardScreen.onAcknowledgeRequestCard(SUCC_STATUS, detailsArray);
                        }
                        break;
                    case "0A5":
                    case "00A5":
                        otpModalErrorCb(statusDesc || "Wrong OTP entered");
                        break;
                    case "HR01":
                        // Close OTP modal
                        this.closeOTPModal();

                        // High Risk User scenario
                        this.props.navigation.navigate(MAE_CARD_STATUS, {
                            status: SUCC_STATUS,
                            headerText: statusDesc || MAECARD_APPLY_SUCC_HR,
                            detailsArray,
                            onDone: this.onStatusPgDone,
                            isShowS2w: true,
                        });
                        break;
                    default:
                        // Close OTP modal
                        this.closeOTPModal();

                        // Failure scenario
                        this.gotoFailStatusPage({
                            headerText: MAECARD_APPLY_FAIL,
                            detailsArray,
                            serverError: statusDesc || "",
                        });
                        GAMAECardScreen.onAcknowledgeRequestCard(FAIL_STATUS, detailsArray);
                        break;
                }
            })
            .catch((error) => {
                console.log("[MAECardAddress][applyMAECardAPI] >> Exception: ", error);

                // Close OTP modal
                this.closeOTPModal();

                // Navigate to Fail Status page
                this.gotoFailStatusPage({
                    headerText: MAECARD_APPLY_FAIL,
                    serverError: error?.error?.error?.message ?? "",
                });
                GAMAECardScreen.onAcknowledgeRequestCard(FAIL_STATUS, []);
            });
    };

    gotoFailStatusPage = ({
        detailsArray = null,
        headerText = MAECARD_APPLY_FAIL,
        serverError = "",
        isLocked = false,
    }) => {
        console.log("[MAECardAddress] >> [gotoFailStatusPage]");

        const { detailsArray: stateDetailsArray } = this.state;

        // Update status of isLocked
        this.setState({ isLocked });

        this.props.navigation.navigate(MAE_CARD_STATUS, {
            status: FAIL_STATUS,
            headerText,
            detailsArray: detailsArray || stateDetailsArray || false,
            serverError,
            onDone: this.onStatusPgDone,
        });
    };

    cardReplaceAPI = async (otp, otpModalErrorCb) => {
        console.log("[MAECardAddress] >> [cardReplaceAPI]");

        const {
            addressOne,
            addressTwo,
            city,
            stateValue,
            flowType,
            postcode,
            mobileSDKData,
            flow,
            secure2uValidateData,
            serviceCharge,
        } = this.state;
        const { cardDetails } = this.props.route.params;
        const amount = numeral(serviceCharge).format("0,0.00");

        // Request object
        const params = {
            tacBlock: otp,
            refNo: cardDetails?.refNo ?? "",
            acctNo: cardDetails?.maeAcctNo ?? "",
            reqType: flowType,
            address1: addressOne,
            address2: addressTwo,
            address3: city,
            address4: "",
            postalCode: postcode,
            city: city,
            state: stateValue,
            amount,
            isVirtual: false,
            cardType: this.cardType,
            mobileSDKData,
            twoFAType:
                flow === "S2U"
                    ? secure2uValidateData?.pull === "N"
                        ? "SECURE2U_PUSH"
                        : "SECURE2U_PULL"
                    : "TAC",
        };

        // Card Replace API Call
        dbtCrdRpm(params, true)
            .then((httpResp) => {
                console.log("[MAECardAddress][cardReplaceAPI] >> Response: ", httpResp);

                const result = httpResp?.data?.result ?? null;
                if (!result) {
                    // Close OTP modal
                    this.closeOTPModal();

                    this.props.navigation.navigate(MAE_CARD_STATUS, {
                        status: FAIL_STATUS,
                        headerText: MAECARD_REPLACE_FAIL,
                        onDone: this.onStatusPgDone,
                    });
                    GAMAECardScreen.onAcknowledgeReplaceCard(FAIL_STATUS, []);
                    return;
                }

                let detailsArray = [];
                const { statusCode, statusDesc, txnRefNo, dtTime, formattedTransactionRefNumber } =
                    result;

                // Check for Ref ID
                if (formattedTransactionRefNumber || txnRefNo) {
                    detailsArray.push({
                        key: REFERENCE_ID,
                        value: formattedTransactionRefNumber || txnRefNo,
                    });
                }

                // Check for Server Date/Time
                if (dtTime) {
                    detailsArray.push({
                        key: DATE_AND_TIME,
                        value: dtTime,
                    });
                }

                switch (statusCode) {
                    case "000":
                    case "0000":
                        if (flow === "S2U") {
                            console.log(this.state);
                            this.setState({ detailsArray }, () => {
                                this.showS2uModal(result);
                            });
                        } else {
                            // Close OTP modal
                            this.closeOTPModal();

                            // Navigate to Status page
                            this.props.navigation.navigate(MAE_CARD_STATUS, {
                                status: SUCC_STATUS,
                                headerText: MAECARD_REPLACE_SUCC,
                                serverError: MAECARD_REPLACE_SUCC_DESC,
                                detailsArray,
                                onDone: this.onStatusPgDone,
                            });
                            GAMAECardScreen.onAcknowledgeReplaceCard(SUCC_STATUS, detailsArray);
                        }
                        break;
                    case "0A5":
                    case "00A5":
                        if (flow === "TAC") otpModalErrorCb(statusDesc || "Wrong OTP entered");
                        break;
                    case "0D9":
                    case "00D9":
                        this.gotoFailStatusPage({
                            headerText: MAECARD_REPLACE_FAIL,
                            serverError: statusDesc || S2U_RETRY_AFTER_SOMETIME,
                            detailsArray,
                        });
                        break;
                    default:
                        // Close OTP modal
                        this.closeOTPModal();

                        // Navigate to Fail Status page
                        this.gotoFailStatusPage({
                            headerText: MAECARD_REPLACE_FAIL,
                            detailsArray,
                            serverError: statusDesc || "",
                        });
                        GAMAECardScreen.onAcknowledgeReplaceCard(FAIL_STATUS, detailsArray);
                        break;
                }
            })
            .catch((error) => {
                console.log("[MAECardAddress][cardReplaceAPI] >> Exception: ", error);

                // Close OTP modal
                this.closeOTPModal();

                // Navigate to Fail Status page
                this.gotoFailStatusPage({
                    headerText: MAECARD_REPLACE_FAIL,
                    serverError: error?.error?.error?.message ?? "",
                });
                GAMAECardScreen.onAcknowledgeReplaceCard(FAIL_STATUS, []);
            });
    };

    showS2uModal = (response) => {
        console.log("[MAECardAddress] >> [showS2uModal]");
        const { pollingToken, token, dtTime } = response;
        const { addressOne, addressTwo, city, postcode, state } = this.state;
        const { maeCustomerInfo } = this.props?.route?.params;
        const s2uPollingToken = pollingToken || token || "";
        let s2uTransactionDetails = [];
        if (maeCustomerInfo?.debitInq) {
            const currentDate = maeCustomerInfo?.debitInq?.currentDate;
            const expiryDate = maeCustomerInfo?.debitInq?.cardExpiry;
            const todayObj = moment(currentDate, "YYYYMMDD");
            const expiryDateObj = moment(expiryDate, "YYMM");
            if (
                todayObj.diff(expiryDateObj, "years") >= 1 ||
                todayObj.diff(expiryDateObj, "years") <= -1
            ) {
                s2uTransactionDetails.push({
                    label: RENEWAL_FEE,
                    value: RENEWAL_FEE_AMT,
                });

                if (maeCustomerInfo.debitInq?.maeAcctNo) {
                    s2uTransactionDetails.push({
                        label: FROM,
                        value: `MAE\n${maeCustomerInfo.debitInq?.maeAcctNo}`,
                    });
                }
            }
        }
        //get the address
        if (addressOne || addressTwo || city || postcode || state) {
            s2uTransactionDetails.push({
                label: ADDRESS,
                value: `${addressOne}, ${addressTwo},\n${city}, ${postcode},\n${state}`,
            });
        }
        // Check for Server Date/Time
        if (dtTime) {
            s2uTransactionDetails.push({
                label: DATE_AND_TIME,
                value: dtTime,
            });
        }
        this.setState({ pollingToken: s2uPollingToken, s2uTransactionDetails }, () => {
            this.setState({ showS2u: true });
        });
    };

    onS2uDone = (response) => {
        console.log("[MAECardOverseasDates] >> [onS2uDone]");

        const { statusDesc, transactionStatus, s2uSignRespone } = response;
        const { detailsArray, flowType } = this.state;

        // Close S2u popup
        this.onS2uClose();

        if (transactionStatus) {
            let headerTxt = flowType === "MAE_CRD_RPM" ? MAECARD_REPLACE_SUCC : MAECARD_APPLY_SUCC;
            let serverError = flowType === "MAE_CRD_RPM" ? MAECARD_REPLACE_SUCC_DESC : "";
            headerTxt =
                s2uSignRespone?.maeCustRisk === "Y"
                    ? statusDesc || MAECARD_APPLY_SUCC_HR
                    : headerTxt;
            //need to add flow for MAECARD_APPLY_SUCC_HR
            this.props.navigation.navigate(MAE_CARD_STATUS, {
                status: SUCC_STATUS,
                headerText: headerTxt,
                serverError,
                detailsArray,
                onDone: this.onStatusPgDone,
                isShowS2w: !(flowType === "MAE_CRD_RPM"),
            });
            if (flowType === MAE_CRD_RPM) {
                GAMAECardScreen.onAcknowledgeReplaceCard(SUCC_STATUS, detailsArray);
            } else {
                GAMAECardScreen.onAcknowledgeRequestCard(SUCC_STATUS, detailsArray);
            }
        } else {
            let headerFailTxt =
                flowType === "MAE_CRD_RPM" ? MAECARD_REPLACE_FAIL : MAECARD_APPLY_FAIL;

            // Failure scenario
            this.gotoFailStatusPage({
                headerText: headerFailTxt,
                detailsArray,
                serverError:
                    s2uSignRespone?.text ??
                    s2uSignRespone?.additionalStatusDescription ??
                    statusDesc ??
                    "",
            });
            if (flowType === MAE_CRD_RPM) {
                GAMAECardScreen.onAcknowledgeReplaceCard(FAIL_STATUS, detailsArray);
            } else {
                GAMAECardScreen.onAcknowledgeRequestCard(FAIL_STATUS, detailsArray);
            }
        }
    };

    onS2uClose = () => {
        console.log("[MAECardOverseasDates] >> [onS2uClose]");
        // will close tac popup
        this.setState({ showS2u: false });
    };

    onInfoPopupToggle = () => {
        this.setState((prevState) => ({ showInfoPopup: !prevState.showInfoPopup }));
    };

    onStatusPgDone = () => {
        console.log("[MAECardAddress] >> [onStatusPgDone]");

        const { entryPoint } = this.props.route.params;

        switch (entryPoint) {
            case "CARD_DETAILS":
            case "ACCOUNT_DETAILS":
            case "CARDS_TAB":
            case "MAE_ONBOARD":
            case "MAE_ONBOARD_TOPUP":
                this.props.navigation.navigate(TAB_NAVIGATOR, {
                    screen: TAB,
                    params: {
                        screen: MAYBANK2U,
                    },
                });
                break;
            case "MOMENTS":
                this.props.navigation.navigate(TAB_NAVIGATOR, {
                    screen: TAB,
                    params: {
                        screen: DASHBOARD,
                        params: { refresh: true },
                    },
                });
                break;
            case "CARD_MGMT":
                // Update navigation params data
                this.props.navigation.setParams({
                    isFromS2uReg: false,
                });
                // Reload data on Card details
                this.props.navigation.navigate(MAE_CARDDETAILS, {
                    reload: true,
                    isFromStatusScreen: true,
                });
                break;
            default:
                // By default, go to Dashboard
                this.props.navigation.navigate(TAB_NAVIGATOR, {
                    screen: TAB,
                    params: {
                        screen: DASHBOARD,
                        params: { refresh: true },
                    },
                });
                break;
        }
    };

    renderScrollPickerItem = (item, index, isSelected) => (
        <StateScrollPickerItem
            stateName={item?.display ?? ""}
            isSelected={isSelected}
            itemHeight={this.state.pickerItemHeight}
        />
    );

    render() {
        const {
            addressOne,
            addressOneErrorMsg,
            addressOneValid,
            addressTwo,
            addressTwoErrorMsg,
            addressTwoValid,
            city,
            cityErrorMsg,
            cityValid,
            state,
            stateErrorMsg,
            stateValid,
            stateData,
            showStatePicker,
            stateIndex,
            postcode,
            postcodeErrorMsg,
            postcodeValid,
            isContinueDisabled,
            flowType,
            tnc,
            showOTP,
            token,
            maskedMobileNumber,
            titleText,
            pickerItemHeight,
            secure2uValidateData,
            showS2u,
            pollingToken,
            s2uTransactionDetails,
            secure2uExtraParams,
            nonTxnData,
            serviceCharge,
        } = this.state;

        const analyticScreenName =
            this.props?.route?.params?.flowType === MAE_CRD_RPM
                ? FA_CARD_REPLACEMENT
                : FA_CARD_REQUESTCARD_MAE_DELIVERYADDRESS;

        return (
            <React.Fragment>
                <ScreenContainer
                    backgroundType="color"
                    backgroundColor={MEDIUM_GREY}
                    analyticScreenName={analyticScreenName}
                >
                    <ScreenLayout
                        header={
                            <HeaderLayout
                                headerLeftElement={<HeaderBackButton onPress={this.onBackTap} />}
                                headerCenterElement={
                                    flowType !== "MAE_CRD_RPM" && (
                                        <Typo
                                            fontSize={16}
                                            fontWeight="600"
                                            color={BLACK}
                                            lineHeight={19}
                                            text={titleText}
                                        />
                                    )
                                }
                            />
                        }
                        paddingHorizontal={0}
                        paddingBottom={0}
                        paddingTop={0}
                        useSafeArea
                    >
                        <React.Fragment>
                            <KeyboardAwareScrollView
                                style={Style.containerView}
                                behavior={Platform.OS == "ios" ? "padding" : ""}
                                enabled
                                showsVerticalScrollIndicator={false}
                            >
                                {/* Note Text */}
                                {flowType === "MAE_CRD_RPM" && (
                                    <Typo
                                        color={BLACK}
                                        fontSize={14}
                                        lineHeight={18}
                                        fontWeight="400"
                                        textAlign="left"
                                        text={CARD_REPLACE_ADDRESS_TITLE}
                                    />
                                )}

                                {/* Where do you want... */}
                                <Typo
                                    fontSize={16}
                                    lineHeight={24}
                                    fontWeight="600"
                                    textAlign="left"
                                    text={CARD_REPLACE_WHERE_DO_YOU_WANT}
                                    style={
                                        flowType === "MAE_CRD_RPM"
                                            ? Style.headerCardRpmLabelCls
                                            : Style.headerLabelCls
                                    }
                                />

                                {/* Address line 1 */}
                                <View style={Style.fieldViewCls}>
                                    {flowType === "MAE_CRD_RPM" ? (
                                        <View style={Style.infoView}>
                                            <Typo
                                                fontSize={14}
                                                lineHeight={18}
                                                textAlign="left"
                                                text={STEPUP_MAE_ADDRESS_ONE}
                                            />
                                            <TouchableOpacity onPress={this.onInfoPopupToggle}>
                                                <Image
                                                    style={Style.infoIcon}
                                                    source={assets.icInformation}
                                                />
                                            </TouchableOpacity>
                                        </View>
                                    ) : (
                                        <Typo
                                            fontSize={14}
                                            lineHeight={18}
                                            textAlign="left"
                                            text={STEPUP_MAE_ADDRESS_ONE}
                                        />
                                    )}
                                    <LongTextInput
                                        minLength={5}
                                        maxLength={40}
                                        autoFocus
                                        isValidate
                                        isValid={addressOneValid}
                                        errorMessage={addressOneErrorMsg}
                                        value={addressOne}
                                        placeholder={
                                            flowType === "MAE_CRD_RPM"
                                                ? STEPUP_MAE_ADDRESS_ONE_CARDRPM_PLACEHOLDER
                                                : STEPUP_MAE_ADDRESS_ONE_PLACEHOLDER
                                        }
                                        onChangeText={this.onAddressOneChange}
                                        numberOfLines={2}
                                    />
                                </View>

                                {/* Address line 2 */}
                                <View style={Style.fieldViewCls}>
                                    <Typo
                                        fontSize={14}
                                        lineHeight={18}
                                        textAlign="left"
                                        text={STEPUP_MAE_ADDRESS_TWO}
                                    />
                                    <LongTextInput
                                        minLength={5}
                                        maxLength={40}
                                        isValidate
                                        isValid={addressTwoValid}
                                        errorMessage={addressTwoErrorMsg}
                                        value={addressTwo}
                                        placeholder={
                                            flowType === "MAE_CRD_RPM"
                                                ? STEPUP_MAE_ADDRESS_TWO_CARDRPM_PLACEHOLDER
                                                : STEPUP_MAE_ADDRESS_TWO_PLACEHOLDER
                                        }
                                        onChangeText={this.onAddressTwoChange}
                                        numberOfLines={2}
                                    />
                                </View>

                                {/* City */}
                                <View style={Style.fieldViewCls}>
                                    <Typo
                                        fontSize={14}
                                        lineHeight={18}
                                        textAlign="left"
                                        text="City"
                                    />
                                    <LongTextInput
                                        minLength={5}
                                        maxLength={40}
                                        isValidate
                                        isValid={cityValid}
                                        errorMessage={cityErrorMsg}
                                        value={city}
                                        placeholder={
                                            flowType === "MAE_CRD_RPM"
                                                ? STEPUP_MAE_CITY_CARDRPM_PLACEHOLDER
                                                : STEPUP_MAE_CITY_PLACEHOLDER
                                        }
                                        onChangeText={this.onCityChange}
                                        numberOfLines={2}
                                    />
                                </View>

                                {/* State */}
                                <LabeledDropdown
                                    label="State"
                                    dropdownValue={state}
                                    isValid={stateValid}
                                    errorMessage={stateErrorMsg}
                                    onPress={this.showStatePicker}
                                    style={Style.fieldViewCls}
                                />

                                {/* Postcode */}
                                <View style={Style.fieldViewCls}>
                                    <Typo
                                        fontSize={14}
                                        lineHeight={18}
                                        textAlign="left"
                                        text="Postcode"
                                    />
                                    <TextInput
                                        minLength={5}
                                        maxLength={5}
                                        isValidate
                                        isValid={postcodeValid}
                                        errorMessage={postcodeErrorMsg}
                                        value={postcode}
                                        placeholder={
                                            flowType === "MAE_CRD_RPM"
                                                ? STEPUP_MAE_POSTCODE_CARDRPM_PLACEHOLDER
                                                : STEPUP_MAE_POSTCODE_PLACEHOLDER
                                        }
                                        keyboardType="numeric"
                                        onChangeText={this.onPostcodeChange}
                                        blurOnSubmit
                                        returnKeyType="done"
                                    />
                                </View>

                                {/* Terms & Conditions */}
                                <View style={Style.tncViewCls}>
                                    <Typo
                                        fontSize={14}
                                        lineHeight={18}
                                        fontWeight="600"
                                        textAlign="left"
                                        text={TERMS_CONDITIONS}
                                    />

                                    {/* I have read and agree to the... */}
                                    <View style={Style.tncRadioBtnBlockCls}>
                                        <TouchableOpacity
                                            activeOpacity={1}
                                            onPress={this.onTnCRadioBtnTap}
                                        >
                                            {tnc ? (
                                                <RadioChecked checkType="color" />
                                            ) : (
                                                <RadioUnchecked />
                                            )}
                                        </TouchableOpacity>

                                        <View style={Style.tnCRadioBtnLblBlockCls}>
                                            <Text
                                                onPress={this.onTnCRadioBtnTap}
                                                style={Style.maeTnCLblCls}
                                                textAlignVertical="top"
                                            >
                                                <Text>{`${MAE_FATCA_TNC} `}</Text>
                                                <Typo
                                                    fontSize={14}
                                                    lineHeight={20}
                                                    textAlign="left"
                                                    style={Style.termsText}
                                                    text={TERMS_CONDITIONS}
                                                    onPress={this.onTnCLinkTap}
                                                ></Typo>
                                            </Text>
                                        </View>
                                    </View>
                                </View>
                            </KeyboardAwareScrollView>

                            {/* Bottom docked button container */}
                            <FixedActionContainer>
                                <View style={Style.bottomBtnContCls}>
                                    <ActionButton
                                        activeOpacity={isContinueDisabled ? 1 : 0.5}
                                        backgroundColor={isContinueDisabled ? DISABLED : YELLOW}
                                        fullWidth
                                        componentCenter={
                                            <Typo
                                                fontSize={14}
                                                fontWeight="600"
                                                lineHeight={18}
                                                text={CONTINUE}
                                            />
                                        }
                                        onPress={this.onContinue}
                                    />
                                </View>
                            </FixedActionContainer>
                        </React.Fragment>
                    </ScreenLayout>
                </ScreenContainer>

                {/* OTP Modal */}
                {showOTP && (
                    <OtpModal
                        otpCode={token}
                        onOtpDonePress={this.onOTPDone}
                        onOtpClosePress={this.onOTPClose}
                        onResendOtpPress={this.onOTPResend}
                        mobileNumber={maskedMobileNumber}
                    />
                )}
                {/* S2u Modal */}
                {showS2u && (
                    <Secure2uAuthenticationModal
                        token={pollingToken}
                        amount={serviceCharge ?? ""}
                        nonTxnData={nonTxnData}
                        onS2UDone={this.onS2uDone}
                        onS2UClose={this.onS2uClose}
                        s2uPollingData={secure2uValidateData}
                        transactionDetails={s2uTransactionDetails}
                        extraParams={secure2uExtraParams}
                    />
                )}

                {/* Info popup for Address Line 1 */}
                <Popup
                    visible={this.state.showInfoPopup}
                    title={STEPUP_MAE_ADDRESS_ONE}
                    description={STEPUP_MAE_ADDRESS_ONE_DESC}
                    onClose={this.onInfoPopupToggle}
                />

                {/* Picker */}
                <Modal
                    animationIn="fadeIn"
                    animationOut="fadeOut"
                    hasBackdrop={false}
                    visible={showStatePicker}
                    style={{ margin: 0 }}
                    hideModalContentWhileAnimating
                    useNativeDriver
                    transparent
                >
                    <View style={{ flex: 1, backgroundColor: "rgba(0, 0, 0, 0.75)" }}>
                        <ScrollPicker
                            showPicker={showStatePicker}
                            items={stateData}
                            onCancelButtonPressed={this.onPickerCancel}
                            onDoneButtonPressed={this.onPickerDone}
                            renderCustomItems
                            customItemRenderer={this.renderScrollPickerItem}
                            itemHeight={pickerItemHeight}
                            selectedIndex={stateIndex}
                        />
                    </View>
                </Modal>
            </React.Fragment>
        );
    }
}

MAECardAddress.propTypes = {
    getModel: PropTypes.func,
    navigation: PropTypes.shape({
        addListener: PropTypes.func,
        goBack: PropTypes.func,
        navigate: PropTypes.func,
        setParams: PropTypes.func,
    }),
    route: PropTypes.shape({
        params: PropTypes.shape({
            cardDetails: PropTypes.shape({
                cardNo: PropTypes.string,
                maeAcctNo: PropTypes.string,
                refNo: PropTypes.string,
            }),
            entryPoint: PropTypes.any,
            trinityFlag: PropTypes.any,
            serviceCharge: PropTypes.any,
            flowType: PropTypes.string,
        }),
    }),
    updateModel: PropTypes.any,
};

const Style = StyleSheet.create({
    bottomBtnContCls: {
        flexDirection: "row",
        justifyContent: "space-around",
        width: "100%",
    },

    containerView: {
        flex: 1,
        paddingHorizontal: 36,
        width: "100%",
    },

    fieldViewCls: {
        marginTop: 25,
    },

    headerCardRpmLabelCls: {
        marginBottom: 5,
        marginTop: 10,
    },

    headerLabelCls: {
        marginTop: 15,
    },

    infoIcon: {
        height: 18,
        marginLeft: 10,
        width: 18,
    },

    infoView: {
        alignItems: "center",
        flexDirection: "row",
    },

    maeTnCLblCls: {
        color: BLACK,
        fontFamily: "montserrat",
        fontSize: 15,
        fontStyle: "normal",
        fontWeight: "normal",
        letterSpacing: 0,
        lineHeight: 20,
    },

    termsText: {
        fontFamily: "montserrat",
        fontSize: 14,
        fontWeight: "100",
        height: 25,
        textDecorationLine: "underline",
    },

    tnCRadioBtnLblBlockCls: {
        flex: 1,
        flexDirection: "row",
        alignItems: "flex-start",
        flexWrap: "wrap",
        flexShrink: 1,
        paddingBottom: 10,
        marginLeft: 10,
        marginRight: 20,
    },

    tncRadioBtnBlockCls: {
        alignItems: "flex-start",
        flexDirection: "row",
        flexWrap: "wrap",
        justifyContent: "flex-start",
        marginTop: 16,
        width: "100%",
    },

    tncViewCls: {
        marginVertical: 25,
    },
});

export default withModelContext(MAECardAddress);
