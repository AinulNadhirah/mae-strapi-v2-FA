import PropTypes from "prop-types";
import React, { Component } from "react";
import { View, StyleSheet } from "react-native";

import { navigateToS2UCooling } from "@screens/OneTapAuth/CoolingNavigator";

import {
    CARD_UCODE_PIN,
    MAE_CARD_STATUS,
    TAB_NAVIGATOR,
    TAB,
    MAYBANK2U,
    DASHBOARD,
    MAE_CARDDETAILS,
    SPLASHSCREEN,
    ONE_TAP_AUTH_MODULE,
    BANKINGV2_MODULE,
    SECURE2U_COOLING,
} from "@navigation/navigationConstant";
import NavigationService from "@navigation/navigationService";

import HeaderLayout from "@layouts/HeaderLayout";
import ScreenLayout from "@layouts/ScreenLayout";

import HeaderBackButton from "@components/Buttons/HeaderBackButton";
import ScreenContainer from "@components/Containers/ScreenContainer";
import OtpModal from "@components/Modals/OtpModal";
import Secure2uAuthenticationModal from "@components/Modals/Secure2uAuthenticationModal";
import OtpEnter from "@components/OtpEnter";
import ChallengeQuestion from "@components/RSA/ChallengeQuestion";
import { showErrorToast } from "@components/Toast";

import { withModelContext } from "@context";

import { requestTAC, uCodeServiceReq, chipValidate } from "@services";
import { GAMAECardScreen } from "@services/analytics/analyticsSTPMae";

import { MEDIUM_GREY } from "@constants/colors";
import {
    VERIFY_CARD,
    UCODE_SUBTXT1,
    UCODE_SUBTXT2,
    UCode_ERR_MSG,
    CHG_CARD_PIN,
    CREATE_PIN,
    CREATE_PIN_SUBTXT1,
    CREATE_PIN_SUBTXT2,
    PIN_ERR_MSG,
    CONFIRM_PIN_SUBTXT1,
    COMMON_ERROR_MSG,
    MAECARD_ACTIVATE_FAIL,
    REFERENCE_ID,
    DATE_AND_TIME,
    MAECARD_ACTIVATE_SUCC,
    SUCC_STATUS,
    MAECARD_ACTIVATE_PIN_FAIL,
    MAECARD_CHGPIN_SUCC,
    MAECARD_CHGPIN_FAIL,
    FAIL_STATUS,
} from "@constants/strings";
import { MAE_REQ_TAC } from "@constants/url";

import { maskedMobileNumber } from "@utils";
import {
    checks2UFlow,
    convertMayaMobileFormat,
    getDeviceRSAInformation,
} from "@utils/dataModel/utility";

import { formatCreditCardNumber, get_pinBlockEncrypt } from "./CardManagementController";

class CardUCodePIN extends Component {
    constructor(props) {
        super(props);
        this.state = {
            // Scenario/flow related
            currentScreen: "", // UCODE | PIN | CONFIRMPIN
            flowType: "",
            cardNo: "",

            // UI Handling related
            header: "",
            subText1: "",
            subText2: "",
            pinCodeErrMsg: "",

            // OTP Modal
            showOTP: false,
            token: null,
            mobileNumber: null,
            maskedMobileNumber: null,
            otpErrorMessage: null,

            // Logged in User Info
            m2uUserId: null,

            // Others
            mobileSDKData: null,
            cardActivationParams: null,
            changePINParams: null,

            // RSA-CQ Related
            challenge: null,
            isCQRequired: false,
            challengeQuestion: "",
            showCQLoader: true,
            rsaRetryCount: 0,
            showCQError: false,
            isLocked: false,
            //s2u
            flow: props.route.params?.flow ?? null,
            secure2uValidateData: props.route.params?.secure2uValidateData ?? null,
            showS2u: false,
            pollingToken: "",
            s2uTransactionDetails: [],
            detailsArray: [],
            secure2uExtraParams: props.route.params?.secure2uExtraParams ?? null,
            nonTxnData: props.route.params?.nonTxnData ?? {},
        };
    }

    componentDidMount() {
        console.log("[CardUCodePIN] >> [componentDidMount]");

        // Fetch details of logged in user
        this.retrieveLoggedInUserDetails();

        // Call method to manage data after init
        this.manageDataOnInit();
        this.props.navigation.addListener("focus", this.onScreenFocus);
    }

    retrieveLoggedInUserDetails = () => {
        console.log("[CardUCodePIN] >> [retrieveLoggedInUserDetails]");

        const { getModel } = this.props;
        const { m2uUserId } = getModel("user");
        const { m2uPhoneNumber } = getModel("m2uDetails");
        const userMayaFormatNum = convertMayaMobileFormat(m2uPhoneNumber);

        this.setState({
            m2uUserId,
            mobileNumber: userMayaFormatNum,
            maskedMobileNumber: maskedMobileNumber(m2uPhoneNumber),
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
        const { auth, flowType } = params;
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
                if (flowType === "ACTIVATE") {
                    this.validateUcode("");
                }
            });
        }
    };

    manageDataOnInit = () => {
        console.log("[CardUCodePIN] >> [manageDataOnInit]");

        const params = this.props?.route?.params ?? {};
        const currentScreen = params?.currentScreen ?? "UCODE";
        const flowType = params?.flowType ?? "";
        const cardNo = params?.cardNo ?? "";
        const deviceInfo = this.props.getModel("device");
        const mobileSDKData = getDeviceRSAInformation(deviceInfo.deviceInformation);

        switch (currentScreen) {
            case "UCODE":
                this.setState({
                    header: VERIFY_CARD,
                    subText1: UCODE_SUBTXT1,
                    subText2: UCODE_SUBTXT2,
                    pinCodeErrMsg: UCode_ERR_MSG,
                });
                GAMAECardScreen.onActivationCode();
                break;
            case "PIN":
                this.setState({
                    header: flowType === "MAE_CARD_SETPIN" ? CHG_CARD_PIN : CREATE_PIN,
                    subText1: CREATE_PIN_SUBTXT1,
                    subText2: CREATE_PIN_SUBTXT2,
                    pinCodeErrMsg: PIN_ERR_MSG,
                });
                GAMAECardScreen.onCreatePIN(flowType);
                break;
            case "CONFIRMPIN":
                this.setState({
                    header: flowType === "MAE_CARD_SETPIN" ? CHG_CARD_PIN : CREATE_PIN,
                    subText1: CONFIRM_PIN_SUBTXT1,
                    subText2: CREATE_PIN_SUBTXT2,
                    pinCodeErrMsg: PIN_ERR_MSG,
                });
                GAMAECardScreen.onConfirmPIN(flowType);
                break;
            default:
                break;
        }

        this.setState({ currentScreen, flowType, cardNo, mobileSDKData });
    };

    onBackTap = () => {
        console.log("[CardUCodePIN] >> [onBackTap]");

        this.props.navigation.goBack();
    };

    onKeypadDone = async (value) => {
        console.log("[CardUCodePIN] >> [onKeypadDone]");

        const { currentScreen, flowType } = this.state;
        const params = this.props.route.params;

        switch (currentScreen) {
            case "UCODE":
                this.props.navigation.push(CARD_UCODE_PIN, {
                    ...params,
                    ucode: value,
                    currentScreen: "PIN",
                });
                break;
            case "PIN":
                this.props.navigation.push(CARD_UCODE_PIN, {
                    ...params,
                    pin: value,
                    currentScreen: "CONFIRMPIN",
                });
                break;
            case "CONFIRMPIN": {
                const { pin } = params;

                // Check PIN match
                if (pin !== value) {
                    showErrorToast({
                        message: "PIN does not match. Please re-enter the same PIN again",
                    });
                    return;
                }
                if (flowType === "ACTIVATE") {
                    const { flow, secure2uValidateData } = await checks2UFlow(
                        41,
                        this.props.getModel,
                        this.props.updateModel
                    );
                    const {
                        navigation: { navigate },
                    } = this.props;
                    this.setState(
                        {
                            flow: flow,
                            secure2uValidateData: secure2uValidateData,
                            nonTxnData: { isNonTxn: true, nonTxnTitle: "Activate MAE card" },
                            secure2uExtraParams: {
                                metadata: { txnType: "MAE_CARD_UCODE_PIN" },
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
                                                    screen: CARD_UCODE_PIN,
                                                },
                                                fail: {
                                                    stack: BANKINGV2_MODULE,
                                                    screen: CARD_UCODE_PIN,
                                                },

                                                params: { flow: "S2UReg", isFromS2uReg: true },
                                            },
                                        },
                                    });
                                    break;
                                case "S2U":
                                    this.validateUcode("");
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
                    const { flow } = this.state;
                    flow === "S2U" ? this.changePIN("") : this.requestOTP();
                }
                break;
            }
            default:
                break;
        }
    };

    requestOTP = async (isResend = false, showOTPCb = () => {}) => {
        console.log("[CardUCodePIN] >> [requestOTP]");

        const { mobileNumber, flowType, cardNo } = this.state;
        const params = {
            mobileNo: mobileNumber,
            idNo: "",
            transactionType: flowType === "ACTIVATE" ? "MAE_CARD_UCODE" : flowType,
            otp: "",
            preOrPostFlag: "postlogin",
            cardNo: cardNo,
        };

        const httpResp = await requestTAC(JSON.stringify(params), true, MAE_REQ_TAC).catch(
            (error) => {
                console.log("[CardUCodePIN][requestTAC] >> Exception: ", error);
            }
        );
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
        console.log("[CardUCodePIN] >> [onOTPDone]");

        this.setState({ showOTP: true });
    };

    showOTPModalWithError = (otpErrorMessage = "") => {
        console.log("[CardUCodePIN] >> [showOTPModalWithError]");

        this.setState({
            showOTP: true,
            otpErrorMessage,
            otpCode: null,
        });
    };

    onOTPDone = (otp, otpModalErrorCb) => {
        console.log("[CardUCodePIN] >> [onOTPDone]");

        const { flowType } = this.state;

        if (flowType === "ACTIVATE") {
            // Call API to verify OTP and activate card
            this.validateUcode(otp, otpModalErrorCb);
        } else {
            // Call API to verify OTP and Set/Change PIN
            this.changePIN(otp, otpModalErrorCb);
        }
    };

    closeOTPModal = () => {
        console.log("[CardUCodePIN] >> [closeOTPModal]");

        this.setState({ showOTP: false, token: null });
    };

    onOTPClose = () => {
        console.log("[CardUCodePIN] >> [onOTPClose]");

        // Close OTP Modal
        this.closeOTPModal();

        // Navigate back to entry point
        this.onStatusPgDone();
    };

    onOTPResend = (showOTPCb) => {
        console.log("[CardUCodePIN] >> [onOTPResend]");

        this.requestOTP(true, showOTPCb);
    };

    showS2uModal = (response) => {
        console.log("[CardUCodePIN] >> [showS2uModal]");
        const { pollingToken, token, dtTime } = response;
        const s2uPollingToken = pollingToken || token || "";
        let s2uTransactionDetails = [];
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
        const { transactionStatus, statusDesc, s2uSignRespone } = response;
        const { detailsArray, flowType } = this.state;
        // Close S2u popup
        this.onS2uClose();
        if (flowType === "ACTIVATE") {
            if (transactionStatus) {
                this.props.navigation.navigate(MAE_CARD_STATUS, {
                    headerText: MAECARD_ACTIVATE_SUCC,
                    status: SUCC_STATUS,
                    detailsArray,
                    onDone: this.onStatusPgDone,
                });
                GAMAECardScreen.onAcknowledgeActivation(SUCC_STATUS, detailsArray);
            } else {
                this.gotoFailStatusPage({
                    headerText: MAECARD_ACTIVATE_FAIL,
                    detailsArray,
                    serverError:
                        s2uSignRespone?.text ??
                        s2uSignRespone?.additionalStatusDescription ??
                        statusDesc ??
                        "",
                });
                GAMAECardScreen.onAcknowledgeActivation(FAIL_STATUS, detailsArray);
            }
        } else {
            if (transactionStatus) {
                this.props.navigation.navigate(MAE_CARD_STATUS, {
                    status: SUCC_STATUS,
                    headerText: MAECARD_CHGPIN_SUCC,
                    detailsArray,
                    onDone: this.onStatusPgDone,
                });
                GAMAECardScreen.onAcknowledgePINChange(SUCC_STATUS, detailsArray);
            } else {
                this.gotoFailStatusPage({
                    headerText: MAECARD_CHGPIN_FAIL,
                    detailsArray,
                    serverError:
                        s2uSignRespone?.text ??
                        s2uSignRespone?.additionalStatusDescription ??
                        statusDesc ??
                        "",
                });
                GAMAECardScreen.onAcknowledgePINChange(FAIL_STATUS, detailsArray);
            }
        }
    };

    onS2uClose = () => {
        this.setState({ showS2u: false });
    };

    validateUcode = async (otp, otpModalErrorCb) => {
        console.log("[CardUCodePIN] >> [validateUcode]");

        const navParams = this.props.route?.params ?? {};
        const ucode = navParams?.ucode ?? "";
        const pinParams = this.getChangePINParams(otp);

        // Request object
        const params = {
            ...pinParams,
            refNo: navParams?.refNo ?? "",
            acctNo: navParams?.maeAcctNo ?? "",
            ekycInd: "",
            reqType: "MAE_CARD_UCODE_PIN",
            ucode: ucode,
        };

        // Save params in state
        this.setState({ cardActivationParams: params });

        this.cardActivationAPICall(params, otpModalErrorCb);
    };

    cardActivationAPICall = (params, otpModalErrorCb) => {
        console.log("[CardUCodePIN] >> [cardActivationAPICall]");

        uCodeServiceReq(params, true)
            .then((httpResp) => {
                console.log("[CardUCodePIN][cardActivationAPICall] >> Response: ", httpResp);

                const result = httpResp?.data?.result ?? null;
                if (!result) {
                    // Close OTP modal
                    this.closeOTPModal();

                    // Navigate to Fail Status page
                    this.gotoFailStatusPage({
                        headerText: MAECARD_ACTIVATE_FAIL,
                    });
                    return;
                }

                const { statusCode, statusDesc, txnRefNo, dtTime, formattedTransactionRefNumber } =
                    result;
                let detailsArray = [];
                let headerText = "";

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

                // Reset RSA/CQ flags
                this.resetCQFlags();

                // Navigate to Status page
                switch (statusCode) {
                    case "000":
                    case "0000": {
                        if (this.state.flow === "S2U") {
                            this.setState({ detailsArray }, () => {
                                this.showS2uModal(result);
                            });
                        } else {
                            // Close OTP modal
                            this.closeOTPModal();

                            headerText = MAECARD_ACTIVATE_SUCC;

                            this.props.navigation.navigate(MAE_CARD_STATUS, {
                                status: SUCC_STATUS,
                                headerText: headerText,
                                detailsArray,
                                onDone: this.onStatusPgDone,
                            });
                            GAMAECardScreen.onAcknowledgeActivation(SUCC_STATUS, detailsArray);
                        }
                        break;
                    }
                    case "0A5":
                    case "00A5": {
                        const otpErrorMessage = statusDesc || "Wrong OTP entered";
                        if (this.state.showOTP) {
                            otpModalErrorCb(otpErrorMessage);
                        } else {
                            // This is needed when OTP page is hidden due to RSA CQ
                            this.showOTPModalWithError(otpErrorMessage);
                        }
                        break;
                    }
                    default:
                        // Close OTP modal
                        this.closeOTPModal();

                        headerText =
                            statusCode === "0009"
                                ? MAECARD_ACTIVATE_PIN_FAIL
                                : MAECARD_ACTIVATE_FAIL;

                        // Navigate to Fail Status page
                        this.gotoFailStatusPage({
                            headerText,
                            detailsArray,
                            serverError: statusDesc || "",
                        });
                        GAMAECardScreen.onAcknowledgeActivation(FAIL_STATUS, detailsArray);
                        break;
                }
            })
            .catch((error) => {
                console.log("[CardUCodePIN][cardActivationAPICall] >> Exception: ", error);

                const {
                    status,
                    error: { challenge },
                } = error;

                if (status === 428) {
                    // Display RSA Challenge Questions if status is 428
                    this.setState((prevState) => ({
                        challenge: challenge,
                        isCQRequired: true,
                        showCQLoader: false,
                        challengeQuestion: challenge?.questionText,
                        rsaRetryCount: prevState.rsaRetryCount + 1,
                        showCQError: prevState.rsaRetryCount > 0,
                        showOTP: false,
                    }));
                } else {
                    if (this.state.flow === "S2U") {
                        this.onS2uClose();
                    } else {
                        // Close OTP modal
                        this.closeOTPModal();
                    }

                    this.setState(
                        {
                            cardActivationParams: null,
                            showCQLoader: false,
                            showCQError: false,
                            isCQRequired: false,
                        },
                        () => {
                            // Navigate to acknowledgement screen
                            this.handleAPIException(error, MAECARD_ACTIVATE_FAIL);
                            GAMAECardScreen.onAcknowledgeActivation(FAIL_STATUS, null);
                        }
                    );
                }
            });
    };

    getChangePINParams = (otp = "") => {
        console.log("[CardUCodePIN] >> [getChangePINParams]");

        const navParams = this.props?.route?.params ?? {};
        const chipMasterData = navParams?.chipMasterData ?? {};
        const pinNum = navParams?.pin ?? "";
        const chipCardNum = navParams?.cardNo ?? "";
        const chipCardType = "Z";
        const chipCardCode = "VS";
        const hsmTpk = chipMasterData.hsmTpk;

        // Retrieve PIN Block data
        const chipCardNum16digit = formatCreditCardNumber(chipCardNum, chipCardType, chipCardCode);
        const pinBlock = get_pinBlockEncrypt(pinNum, chipCardNum16digit, hsmTpk, chipMasterData);

        return {
            acctNo: navParams?.maeAcctNo ?? null,
            refNo: navParams?.refNo ?? null,
            pinBlock: pinBlock,
            tacBlock: otp,
            cardType: null,
            cardCode: null,
            s2uInd: "N",
            clearTPK: hsmTpk,
            deviceTokenCookie: null,
            devicePrint: null,
            reqType: "MAE_CARD_SETPIN",
            mobileSDKData: this.state.mobileSDKData,
            twoFAType:
                this.state.flow === "S2U"
                    ? this.state.secure2uValidateData?.pull === "N"
                        ? "SECURE2U_PUSH"
                        : "SECURE2U_PULL"
                    : "TAC",
        };
    };

    changePIN = async (otp, otpModalErrorCb) => {
        console.log("[CardUCodePIN] >> [changePIN]");

        // Request object
        const params = await this.getChangePINParams(otp);
        // Save params in state
        this.setState({ changePINParams: params });

        // Call API to change PIN
        this.changePINAPICall(params, otpModalErrorCb);
    };

    changePINAPICall = (params, otpModalErrorCb) => {
        console.log("[CardUCodePIN] >> [changePINAPICall]");

        chipValidate(params, true)
            .then((httpResp) => {
                console.log("[CardUCodePIN][changePINAPICall] >> Response: ", httpResp);

                const result = httpResp?.data?.result ?? null;
                if (!result) {
                    otpModalErrorCb(COMMON_ERROR_MSG);
                    return;
                }

                const { statusCode, statusDesc, txnRefNo, dtTime, formattedTransactionRefNumber } =
                    result;
                let detailsArray = [];

                // Check for Ref ID
                if (txnRefNo || formattedTransactionRefNumber) {
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

                // Reset RSA/CQ flags
                this.resetCQFlags();

                switch (statusCode) {
                    case "000":
                    case "0000":
                        if (this.state.flow === "S2U") {
                            this.setState({ detailsArray }, () => {
                                this.showS2uModal(result);
                            });
                        } else {
                            // Close OTP modal
                            this.closeOTPModal();

                            // Navigate to Status page
                            this.props.navigation.navigate(MAE_CARD_STATUS, {
                                status: SUCC_STATUS,
                                headerText: MAECARD_CHGPIN_SUCC,
                                detailsArray,
                                onDone: this.onStatusPgDone,
                            });
                            GAMAECardScreen.onAcknowledgePINChange(SUCC_STATUS, detailsArray);
                        }
                        break;
                    case "0A5":
                    case "00A5": {
                        const otpErrorMessage = statusDesc || "Wrong OTP entered";
                        if (this.state.showOTP) {
                            otpModalErrorCb(otpErrorMessage);
                        } else {
                            // This is needed when OTP page is hidden due to RSA CQ
                            this.showOTPModalWithError(otpErrorMessage);
                        }
                        break;
                    }
                    default:
                        // Close OTP modal
                        this.closeOTPModal();

                        // Navigate to Fail Status page
                        this.gotoFailStatusPage({
                            headerText: MAECARD_CHGPIN_FAIL,
                            detailsArray,
                            serverError: statusDesc || "",
                        });
                        GAMAECardScreen.onAcknowledgePINChange(FAIL_STATUS, detailsArray);
                        break;
                }
            })
            .catch((error) => {
                console.log("[CardUCodePIN][changePINAPICall] >> Exception: ", error);

                const {
                    status,
                    error: { challenge },
                } = error;

                if (status === 428) {
                    // Display RSA Challenge Questions if status is 428
                    this.setState((prevState) => ({
                        challenge: challenge,
                        isCQRequired: true,
                        showCQLoader: false,
                        challengeQuestion: challenge?.questionText,
                        rsaRetryCount: prevState.rsaRetryCount + 1,
                        showCQError: prevState.rsaRetryCount > 0,
                        showOTP: false,
                    }));
                } else {
                    // Close OTP modal
                    this.closeOTPModal();

                    this.setState(
                        {
                            changePINParams: null,
                            showCQLoader: false,
                            showCQError: false,
                            isCQRequired: false,
                        },
                        () => {
                            // Navigate to acknowledgement screen
                            this.handleAPIException(error, MAECARD_CHGPIN_FAIL);
                            GAMAECardScreen.onAcknowledgePINChange(FAIL_STATUS, null);
                        }
                    );
                }
            });
    };

    handleAPIException = (error, defaultHeaderText) => {
        console.log("[CardUCodePIN] >> [handleAPIException]");

        let detailsArray = [];
        const {
            error: {
                serverDate,
                formattedTransactionRefNumber,
                statusDescription,
                additionalStatusDescription,
                txnRefNo,
                dtTime,
            },
            message,
            status,
        } = error;
        const serverError = additionalStatusDescription || statusDescription || message || "";
        const lockServerError = serverDate ? `Logged out on ${serverDate}` : "Logged out";
        const refID = formattedTransactionRefNumber || txnRefNo || null;
        const dateTime = serverDate || dtTime || null;

        // Default values
        let statusServerError = serverError;
        let statusHeaderText = defaultHeaderText;

        // Check for Ref ID
        if (refID) {
            detailsArray.push({
                key: REFERENCE_ID,
                value: refID,
            });
        }

        // Check for Server Date/Time
        if (dateTime) {
            detailsArray.push({
                key: DATE_AND_TIME,
                value: dateTime,
            });
        }

        // Header & Desc Text Handling for diff status code
        if (status === 423) {
            // RSA Locked
            statusServerError = lockServerError;
            statusHeaderText = serverError;
        } else if (status === 422) {
            // RSA Denied
            statusServerError = "";
            statusHeaderText = serverError;
        }

        // Navigate to fail status page
        this.gotoFailStatusPage({
            detailsArray,
            serverError: statusServerError,
            headerText: statusHeaderText,
            isLocked: status === 423,
        });
    };

    gotoFailStatusPage = ({
        detailsArray = null,
        headerText = MAECARD_CHGPIN_FAIL,
        serverError = "",
        isLocked = false,
    }) => {
        console.log("[CardUCodePIN] >> [gotoFailStatusPage]");

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

    onStatusPgDone = () => {
        console.log("[CardUCodePIN] >> [onStatusPgDone]");

        // If RSA locked, navigate back to dashboard with lock popup
        if (this.state.isLocked) {
            NavigationService.resetAndNavigateToModule(SPLASHSCREEN, "", {
                skipIntro: true,
                rsaLocked: true,
            });
            return;
        }

        const { entryPoint } = this.props.route?.params ?? "";
        switch (entryPoint) {
            case "CARDS_TAB":
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
                // Reload data on Card details
                this.props.navigation.navigate(MAE_CARDDETAILS, {
                    reload: true,
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

    resetCQFlags = () => {
        console.log("[CardUCodePIN] >> [resetCQFlags]");

        this.setState({
            showCQLoader: false,
            showCQError: false,
            isCQRequired: false,
        });
    };

    onCQSnackClosePress = () => {
        console.log("[CardUCodePIN] >> [onCQSnackClosePress]");
        this.setState({ showCQError: false });
    };

    onCQSubmitPress = (answer) => {
        console.log("[CardUCodePIN] >> [onCQSubmitPress]");

        const { challenge, cardActivationParams, flowType, changePINParams } = this.state;

        this.setState(
            {
                showCQLoader: true,
                showCQError: false,
            },
            () => {
                if (flowType === "ACTIVATE") {
                    this.cardActivationAPICall({
                        ...cardActivationParams,
                        challenge: { ...challenge, answer },
                    });
                } else {
                    this.changePINAPICall({
                        ...changePINParams,
                        challenge: { ...challenge, answer },
                    });
                }
            }
        );
    };

    render() {
        const {
            header,
            subText1,
            subText2,
            pinCodeErrMsg,
            showOTP,
            token,
            otpErrorMessage,
            maskedMobileNumber,
            showCQLoader,
            isCQRequired,
            showCQError,
            challengeQuestion,
            secure2uValidateData,
            showS2u,
            pollingToken,
            s2uTransactionDetails,
            secure2uExtraParams,
            nonTxnData,
        } = this.state;

        return (
            <ScreenContainer backgroundType="color" backgroundColor={MEDIUM_GREY}>
                <React.Fragment>
                    {/* OTP Modal */}
                    {showOTP ? (
                        <OtpModal
                            otpCode={token}
                            onOtpDonePress={this.onOTPDone}
                            onOtpClosePress={this.onOTPClose}
                            onResendOtpPress={this.onOTPResend}
                            mobileNumber={maskedMobileNumber}
                            onLoadErrorMessage={otpErrorMessage}
                        />
                    ) : (
                        <ScreenLayout
                            scrollable
                            header={
                                <HeaderLayout
                                    headerLeftElement={
                                        <HeaderBackButton onPress={this.onBackTap} />
                                    }
                                />
                            }
                            paddingHorizontal={0}
                            paddingBottom={0}
                            paddingTop={0}
                        >
                            <View style={Style.outerView}>
                                <OtpEnter
                                    onDonePress={this.onKeypadDone}
                                    title={header}
                                    description={subText1}
                                    subdescription={subText2}
                                    customErrMsg={pinCodeErrMsg}
                                    securepin={true}
                                    withTouch={false}
                                    disabled={false}
                                    otpScreen={false}
                                />
                            </View>
                        </ScreenLayout>
                    )}
                    {/* S2u Modal */}
                    {showS2u && (
                        <Secure2uAuthenticationModal
                            token={pollingToken}
                            amount={""}
                            nonTxnData={nonTxnData}
                            onS2UDone={this.onS2uDone}
                            onS2UClose={this.onS2uClose}
                            s2uPollingData={secure2uValidateData}
                            transactionDetails={s2uTransactionDetails}
                            extraParams={secure2uExtraParams}
                        />
                    )}
                    {/* Challenge Question */}
                    <ChallengeQuestion
                        loader={showCQLoader}
                        display={isCQRequired}
                        displyError={showCQError}
                        questionText={challengeQuestion}
                        onSubmitPress={this.onCQSubmitPress}
                        onSnackClosePress={this.onCQSnackClosePress}
                    />
                </React.Fragment>
            </ScreenContainer>
        );
    }
}

CardUCodePIN.propTypes = {
    getModel: PropTypes.func,
    navigation: PropTypes.shape({
        addListener: PropTypes.func,
        goBack: PropTypes.func,
        navigate: PropTypes.func,
        push: PropTypes.func,
        setParams: PropTypes.func,
    }),
    route: PropTypes.shape({
        params: PropTypes.string,
    }),
    updateModel: PropTypes.any,
};

const Style = StyleSheet.create({
    outerView: {
        flex: 1,
        width: "100%",
    },
});

export default withModelContext(CardUCodePIN);
