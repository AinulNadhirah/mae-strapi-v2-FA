import moment from "moment";
import PassKit, { AddPassButton } from "natives/react-native-passkit-wallet";
import numeral from "numeral";
import PropTypes from "prop-types";
import React, { Component } from "react";
import {
    View,
    TouchableOpacity,
    FlatList,
    Image,
    StyleSheet,
    ImageBackground,
    ScrollView,
    Platform,
} from "react-native";
import DeviceInfo from "react-native-device-info";
import { ApplePayButton } from "react-native-payments";
import SwitchToggle from "react-native-switch-toggle";

import {
    checkCardEligibility,
    payWithApplePay,
    onApplePayBtnPress,
    rsaChallengeQuestion,
} from "@screens/ApplePay/ApplePayController";
import {
    RenderAddedItems,
    RenderFooterItems,
    RenderWatchItems,
    RenderDeviceItems,
    LearnAP,
} from "@screens/ApplePay/ApplePayUI";
import { onMAETopUpButtonTap } from "@screens/MAE/Topup/TopupController";
import { navigateToS2UCooling } from "@screens/OneTapAuth/CoolingNavigator";

import {
    APPLY_CARD_INTRO,
    MAE_CARD_STATUS,
    MAE_CARD_OVERSEAS_DATES,
    CARD_UCODE_PIN,
    MAE_CARD_ADDRESS,
    MAE_CARDDETAILS,
    BANKINGV2_MODULE,
    ONE_TAP_AUTH_MODULE,
    MAE_CARD_PURCHASE_LIMIT,
    SETTINGS_MODULE,
    APPLE_PAY_FAIL_SCREEN,
    APPLE_PAY_ACK,
    SECURE2U_COOLING,
    MAE_RENEW_VIRTUAL_CARD,
    COMMON_MODULE,
    RSA_DENY_SCREEN,
    TAB_NAVIGATOR,
    TAB,
    DASHBOARD,
} from "@navigation/navigationConstant";

import HeaderLayout from "@layouts/HeaderLayout";
import ScreenLayout from "@layouts/ScreenLayout";

import HeaderBackButton from "@components/Buttons/HeaderBackButton";
import MAECardLoader from "@components/Cards/MAECardLoader";
import ScreenContainer from "@components/Containers/ScreenContainer";
import FixedActionContainer from "@components/Footers/FixedActionContainer";
import ScreenLoader from "@components/Loaders/ScreenLoader";
import OtpModal from "@components/Modals/OtpModal";
import Secure2uAuthenticationModal from "@components/Modals/Secure2uAuthenticationModal";
import Popup from "@components/Popup";
import ChallengeQuestion from "@components/RSA/ChallengeQuestion";
import Typo from "@components/Text";
import { showErrorToast } from "@components/Toast";

import { withModelContext } from "@context";
import { GABankingApplePay } from "@services/analytics/analyticsBanking";
import { GAMAECardScreen } from "@services/analytics/analyticsSTPMae";
import { FACardManagement } from "@services/analytics/analyticsWallet";
import {
    invokeL3,
    requestTAC,
    frzUnfrzReq,
    ovrSeasFlagReq,
    getMAEMasterData,
    getGCIFDetails,
    getGCIFV2Details,
    cvvEnquiryReq,
    autoTopupInquiry,
    getCardRplmFee,
    getMAEPurchaseLimit,
    invokeL2,
} from "@services/index";

import {
    BLACK,
    WHITE,
    DARK_GREY,
    SWITCH_GREY,
    SWITCH_GREEN,
    MEDIUM_GREY,
    SHADOW,
    ROYAL_BLUE,
    TRANSPARENT,
} from "@constants/colors";
import { MAE_CARD_DETAILS } from "@constants/data";
import {
    CARD_REPLACE_DESC,
    CARD_REPLACE_TITLE,
    COMMON_ERROR_MSG,
    CONTINUE,
    DATE_AND_TIME,
    DEACTIVATE,
    FAIL_STATUS,
    INSUFF_BALANCE_POPUP_MSG,
    INSUFF_BALANCE_TITLE,
    MAECARD_CVVENQ_FAIL,
    MAECARD_CVVENQ_SUCC,
    MAECARD_FREEZE_FAIL,
    MAECARD_FREEZE_SUCC,
    MAECARD_FREEZE_SUCC_SUBTEXT,
    MAECARD_OVERSEASDEACTIVATE_FAIL,
    MAECARD_OVERSEASDEACTIVATE_SUCC,
    MAECARD_UNFREEZE_FAIL,
    MAECARD_UNFREEZE_SUCC,
    MAECARD_UNFREEZE_SUCC_SUBTEXT,
    MAE_CARDMANAGEMENT,
    OVRS_DEACTV_POPUP_MSG,
    OVRS_DEACTV_POPUP_TITLE,
    REFERENCE_ID,
    SUCC_STATUS,
    TOPUP_NOW,
    TRANSACTION_TYPE,
    APPLE_PAY,
    FA_CARD_MANAGEMENT,
    MAECARD_FREEZE_FAIL_SUBTEXT,
    UNBLOCK_MAE_CARD,
    BLOCK_MAE_CARD,
} from "@constants/strings";
import { GCIF_DETAILS_API_V2, AUTO_TOPUP_INQ, MAE_REQ_TAC, ABOUT_APPLE_PAY } from "@constants/url";

import { maskedMobileNumber } from "@utils";
import {
    convertMayaMobileFormat,
    maskAccount,
    formateAccountNumber,
    checks2UFlow,
    autoTopupNavigate,
    maskCards,
    getDeviceRSAInformation,
} from "@utils/dataModel/utility";
import { returnCardDetails, isCardProvisioned } from "@utils/dataModel/utilityApplePay";

import Assets from "@assets";

import {
    retrieveMAECardData,
    fetchChipMasterData,
    checkServerOperationTime,
    getApplyMAECardNavParams,
    massageMasterData,
    massageGCIFData,
} from "./CardManagementController";

class CardDetails extends Component {
    constructor(props) {
        super(props);

        this.state = {
            // Account & Card Related
            cardDetails: "",
            cardExpiry: "",
            cardNo: "",
            isCardFrozen: false,
            maeAcctNo: null,
            refNo: null,
            masterData: null,
            gcifData: null,
            cardRplmFeeData: null,

            //Apple Pay
            cardDevProv: false,
            cardWatchProv: false,
            isApplePayEnable: false,
            isEligibleDevice: false,
            appleWalletEligibility: false,

            // OTP Modal
            showOTP: false,
            token: null,
            mobileNumber: null,
            maskedMobileNumber: null,

            // Logged in User Info
            m2uUserId: null,

            // Popup related
            showPopup: false,
            popupAction: null, // TOPUP | DEACTIVATE_OVERSEAS
            popupTitle: OVRS_DEACTV_POPUP_TITLE,
            popupMsg: OVRS_DEACTV_POPUP_MSG,
            popupPrimaryBtnText: DEACTIVATE,

            // Others
            type: "",
            data: "",
            navParamsObj: {},
            maeCustomerInfo: {},
            transactionType: null,
            transactionItemId: null,
            isLoading: true,
            isReplaceLoading: false,

            //s2u
            secure2uValidateData: {},
            flow: "",
            showS2u: false,
            pollingToken: "",
            s2uTransactionDetails: [],
            detailsArray: [],
            secure2uExtraParams: null,
            nonTxnData: {},
            tempItem: {},

            // Replacement/Insufficient Balance popup
            showRenewPopup: false,
            activePopup: "",
            physicalRplmAction: "",
            rplmPopupDesc: CARD_REPLACE_DESC,
            insuffBalPopupDesc: INSUFF_BALANCE_POPUP_MSG,

            customerName: "",
            token: "",
            showRSALoader: false,
            showRSAChallengeQuestion: false,
            rsaChallengeQuestion: "",
            showRSAError: false,
            challengeRequest: {},
            rsaCount: 0,
        };
    }

    componentDidMount = () => {
        console.log("[CardDetails] >> [componentDidMount]");

        const { reload, redirectFrom } = this.props.route.params;
        if (reload && (redirectFrom === "MOMENTS" || redirectFrom === "PUSH_NOTIFICATION")) {
            const response = this.checkL2Auth();
            if (!response) {
                return;
            }
        }

        // Fetch details of logged in user
        this.retrieveLoggedInUserDetails();

        // Using Focus to handle props with new values
        this.props.navigation.addListener("focus", this.onScreenFocus);
    };

    componentWillUnmount() {
        // Remove event listener
        if (this.state.appleWalletEligibility) {
            PassKit.removeEventListener(
                "addPassesViewControllerDidFinish",
                this.onAddPassesViewControllerDidFinish
            );
        }
    }

    checkL2Auth = async () => {
        const response = await invokeL2().catch((error) => {
            this.props.navigation.navigate(TAB_NAVIGATOR, {
                screen: TAB,
                params: {
                    screen: DASHBOARD,
                },
            });
        });
        return response;
    };

    onAddPassesViewControllerDidFinish = () => {
        console.log("onAddPassesViewControllerDidFinish");
        PassKit.getAddCardResult()
            .then((res) => {
                console.log("In App Provisionig Final Result ::: ", res);
                this.storeResult(res);
                if (res?.cardNo && res?.cardName) {
                    const details = [
                        {
                            title: TRANSACTION_TYPE,
                            value: "Apple Pay Activation",
                        },
                        {
                            title: "Card details",
                            value: `${res?.cardName} ${maskCards(res?.cardNo)}`, //TODO : need to get card name and get type and pass 2nd param
                        },
                    ];
                    this.props.navigation.navigate(BANKINGV2_MODULE, {
                        screen: APPLE_PAY_FAIL_SCREEN,
                        params: {
                            details,
                            entryPoint: "CARD_DETAILS",
                        },
                    });
                } else if (res === "launch") {
                    console.log("Stay in this screen");
                } else {
                    this.props.navigation.navigate(BANKINGV2_MODULE, {
                        screen: APPLE_PAY_ACK,
                        params: {
                            entryPoint: "CARD_DETAILS",
                        },
                    });
                }
            })
            .catch((err) => console.log(" Pass Error ****", err));
    };

    onScreenFocus = () => {
        console.log("[CardDetails] >> [onScreenFocus]");

        const params = this.props.route?.params ?? null;
        if (!params) return;

        const { reload, ekycSuccess, isFromS2uReg } = params;

        //s2u Flow Card Details
        if (isFromS2uReg) this.handleS2uFlow();

        // Reload MAE Card Details
        if (reload) this.reloadCardDetails();

        // Update local value for ekyc status
        if (ekycSuccess) this.updateeKYCStatus();
    };

    onBackTap = () => {
        console.log("[CardDetails] >> [onBackTap]");

        const { isFromStatusScreen } = this.props.route?.params;

        if (isFromStatusScreen) {
            this.decrementLastRefreshed();
        }
        this.props.navigation.goBack();
    };

    storeResult = (res) => {
        const { updateModel } = this.props;
        updateModel({
            applePayData: {
                inAppProvisionResult: res,
            },
        });
    };

    retrieveLoggedInUserDetails = () => {
        console.log("[CardDetails] >> [retrieveLoggedInUserDetails]");

        const { reload } = this.props.route?.params;
        const { getModel } = this.props;
        const { m2uUserId, customerName } = getModel("user");
        const { m2uPhoneNumber } = getModel("m2uDetails");
        const { token } = this.props.getModel("auth");
        const { isApplePayEnable, isEligibleDevice } = getModel("applePay");
        const userMayaFormatNum = convertMayaMobileFormat(m2uPhoneNumber);

        this.setState(
            {
                m2uUserId,
                mobileNumber: userMayaFormatNum,
                maskedMobileNumber: maskedMobileNumber(m2uPhoneNumber),
                isApplePayEnable: isApplePayEnable,
                isEligibleDevice: isEligibleDevice,
                customerName,
                token,
            },
            () => {
                // Call method to manage data after init
                if (!reload) this.manageDataOnInit();
            }
        );
    };

    decrementLastRefreshed = () => {
        const { updateModel } = this.props;
        updateModel({
            banking: {
                lastRefreshed: new Date().getTime() - 60000,
            },
        });
    };

    removeVirtualCardRenewal = (cardData) => {
        const cardRenewItemIndex = cardData?.findIndex((obj) => obj.itemId === "CARD_RENEWAL");
        if (cardRenewItemIndex > 0) {
            cardData.splice(cardRenewItemIndex, 1);
        }
        return cardData;
    };

    manageDataOnInit = () => {
        console.log("[CardDetails] >> [manageDataOnInit]");

        const { cardDetails, type, data, isCardFrozen, maeCustomerInfo } = this.props.route.params;
        const { cardExpiringOrExpired, maeCardFlag: isMAECard } = cardDetails;
        const { cardRenewalReady } = this.props.getModel("misc");

        let cardData = data || MAE_CARD_DETAILS;

        // Remove renewal option if either card renewal is disabled, or card is active(not expiring or expired card), or card is not MAE Debit card
        if (!cardRenewalReady || !cardExpiringOrExpired || !isMAECard) {
            cardData = this.removeVirtualCardRenewal(cardData);
        }

        const { maeCardUpdateLimitReady } = this.props.getModel("misc");
        if (!maeCardUpdateLimitReady) {
            const maeCardUpdateIndex = cardData?.findIndex(
                (obj) => obj.itemId === "MAE_PURCHASE_LIMIT"
            );
            if (maeCardUpdateIndex > 0) cardData.splice(maeCardUpdateIndex, 1);
        }

        this.setState(
            {
                cardDetails,
                isCardFrozen,
                type,
                data: cardData,
                maeCustomerInfo,
            },
            () => {
                // Call method to format card details
                this.formatCardDetails();
            }
        );
    };

    formatCardDetails = async () => {
        console.log("[CardDetails] >> [formatCardDetails]");

        const { cardDetails, type, isEligibleDevice, isApplePayEnable, isCardFrozen } = this.state;
        if (!cardDetails) return;

        let cardNo = cardDetails?.cardNo ?? null;
        let cardExpiry = cardDetails?.cardExpiry ?? null;
        const maeAcctNo = cardDetails?.maeAcctNo ?? null;
        const refNo = cardDetails?.refNo ?? null;

        //Trigger Apple Pay SDK
        if (Platform.OS === "ios" && isApplePayEnable && isEligibleDevice && !isCardFrozen) {
            // cardDevProv, cardWatchProv
            const { cards } = this.props.getModel("applePay");
            const cardDetails = returnCardDetails(cards, cardNo);
            const suffix = cardNo.substring(cardNo.length - 4, cardNo.length);
            const res = await checkCardEligibility(cardDetails?.fpanID, suffix);
            if (res) {
                this.setState({
                    cardDevProv: res.device,
                    cardWatchProv: res.watch,
                });
                if (!res.device || !res.watch) {
                    this.setState({
                        appleWalletEligibility: true,
                    });
                }
                //TODO: remove later, for testing purpose, to check result in context
                const { updateModel } = this.props;
                updateModel({
                    applePayData: {
                        isCardProvisioned: res,
                    },
                });
            }
        } else {
            this.setState({
                appleWalletEligibility: false,
            });
        }

        // Format Expiry date
        if (type !== "PHYSICAL_CARD_MGMT" && cardExpiry && cardExpiry.length == 4) {
            cardExpiry = cardExpiry.substr(2, 2) + "/" + cardExpiry.substr(0, 2);
        }

        // Mask card number for Physical Card Mgmt
        if (cardNo && type === "PHYSICAL_CARD_MGMT" && cardNo.length > 8) {
            cardNo = maskAccount(cardNo);
        } else {
            cardNo = formateAccountNumber(cardNo, cardNo.length);
        }

        this.setState({
            cardNo,
            cardExpiry,
            maeAcctNo,
            refNo,
        });

        // Update loading flag
        this.setLoading(false);
    };

    updateeKYCStatus = () => {
        console.log("[CardDetails] >> [updateeKYCStatus]");

        const { maeCustomerInfo } = this.state;

        // Update navigation params data
        this.props.navigation.setParams({
            ekycSuccess: null,
        });

        this.setState({
            maeCustomerInfo: {
                ...maeCustomerInfo,
                ekycStatus: "05",
            },
        });
    };

    reloadCardDetails = async () => {
        console.log("[CardDetails] >> [reloadCardDetails]");

        // Update loading flag
        this.setLoading(true);
        const { getModel } = this.props;
        const { isError, errorMsg, maeCustomerInfo, cardDetails, type, data, isCardFrozen } =
            await retrieveMAECardData(getModel);

        // If error, show toast and return
        if (isError) {
            showErrorToast({
                message: errorMsg || COMMON_ERROR_MSG,
            });

            return;
        }

        // Update navigation params data
        this.props.navigation.setParams({
            maeCustomerInfo,
            cardDetails,
            type,
            data,
            isCardFrozen,
            reload: false,
        });

        // Re-render view with reloaded data
        this.manageDataOnInit();
    };

    handleS2uFlow = () => {
        const params = this.props.route?.params ?? null;
        const { auth, item } = params;
        // Update navigation params data
        this.props.navigation.setParams({
            isFromS2uReg: false,
        });
        // Show reg fail error msg for S2u
        if (auth === "fail") {
            showErrorToast({
                message: "Failed to register for Secure2u. Please proceed with TAC.",
            });
            this.setState({
                flow: "TAC",
            });
        } else {
            this.setState({
                flow: "S2U",
            });
        }
        this.onListTap(item);
    };

    setLoading = (value = false) => {
        console.log("[CardDetails][setLoading] >> value: " + value);

        this.setState({
            isLoading: value,
        });
    };

    onListTap = (item) => {
        console.log("[CardDetails] >> [onListTap]");

        const { itemId, disabled } = item;

        // Return back if item is disabled
        if (disabled) return;

        switch (itemId) {
            case "CVV":
                this.initCVV(item);
                break;
            case "VC_PIN":
                this.initPin(item);
                break;
            case "APPLY_CARD":
                this.initApplyMAECard(item);
                break;
            case "CARD_RENEWAL":
                this.initRenewMAEVirtualCard(item);
                break;
            case "FREEZE_UNFREEZE":
                this.initFreezeUnfreeze(item);
                break;
            case "PC_PIN":
                this.initPin(item);
                break;
            case "REPLACE":
                this.initReplace(item);
                break;
            case "OVERSEAS":
                this.initOverseas(item);
                break;
            case "AUTOTOPUP":
                this.initAutoTopup(item);
                break;
            case "MAE_PURCHASE_LIMIT":
                this.initPurchaseLimit(item);
                break;
            default:
                break;
        }
    };

    stepUpL3 = async (showLoader = true) => {
        console.log("[CardDetails] >> [stepUpL3]");

        const { getModel } = this.props;
        const { isPostPassword } = getModel("auth");

        // L3 call to invoke login page
        if (!isPostPassword) {
            const httpResp = await invokeL3(showLoader).catch((error) => {
                console.log("[stepUpL3][invokeL3] >> Exception: ", error);
                return false;
            });
            const code = httpResp?.data?.code ?? null;
            if (code !== 0) return false;

            // Update m2uPhoneNumber, as it is available only after L3 login
            const { m2uPhoneNumber } = getModel("m2uDetails");
            const userMayaFormatNum = convertMayaMobileFormat(m2uPhoneNumber);
            this.setState({
                mobileNumber: userMayaFormatNum,
                maskedMobileNumber: maskedMobileNumber(m2uPhoneNumber),
            });
        }

        return true;
    };

    initCVV = async (item) => {
        console.log("[CardDetails] >> [initCVV]");

        FACardManagement.onSelectCVV();

        const { action, itemId } = item;

        // L3 call to invoke login page
        const isLogin = await this.stepUpL3();
        if (!isLogin) return;

        // Check for S2u registration //passing new paramerter updateModel for s2u interops
        const { flow, secure2uValidateData } = await checks2UFlow(
            42,
            this.props.getModel,
            this.props.updateModel
        );

        const {
            navigation: { navigate },
        } = this.props;
        this.setState(
            {
                transactionType: action,
                transactionItemId: itemId,
                flow: flow,
                secure2uValidateData: secure2uValidateData,
                nonTxnData: { isNonTxn: true, nonTxnTitle: "Show CVV" },
                secure2uExtraParams: {
                    metadata: { txnType: "MAE_CVV_INQ" },
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
                                        screen: MAE_CARDDETAILS,
                                    },
                                    fail: {
                                        stack: BANKINGV2_MODULE,
                                        screen: MAE_CARDDETAILS,
                                    },

                                    params: { flow: "S2UReg", isFromS2uReg: true, item: item },
                                },
                            },
                        });
                        break;
                    case "S2U":
                        this.cvvAPICall("");
                        break;
                    case "TAC":
                        this.requestOTP();
                        break;
                    default:
                        break;
                }
            }
        );
    };

    cvvAPICall = async (otp, otpModalErrorCb) => {
        console.log("[CardDetails] >> [cvvAPICall]");

        const { refNo, maeAcctNo, flow, secure2uValidateData } = this.state;

        // Request object
        const params = {
            tacBlock: otp,
            refNo: refNo,
            acctNo: maeAcctNo,
            twoFAType:
                flow === "S2U"
                    ? secure2uValidateData?.pull === "N"
                        ? "SECURE2U_PUSH"
                        : "SECURE2U_PULL"
                    : "TAC",
        };

        // API Call
        const httpResp = await cvvEnquiryReq(params, true).catch((error) => {
            console.log("[CardDetails][cvvAPICall] >> Exception: ", error);

            // Close OTP modal
            this.onOTPClose();

            this.props.navigation.navigate(MAE_CARD_STATUS, {
                status: FAIL_STATUS,
                headerText: MAECARD_CVVENQ_FAIL,
                serverError: error?.message || "",
                onDone: this.onStatusPgDone,
            });
        });

        // Response error checking
        const result = httpResp?.data?.result ?? null;
        if (!result) {
            if (this.state.showOTP) otpModalErrorCb(COMMON_ERROR_MSG);
            return;
        }

        let detailsArray = [];
        const {
            statusCode,
            statusDesc,
            txnRefNo,
            dtTime,
            pinBlock,
            formattedTransactionRefNumber,
        } = result;

        // Check for Reference ID
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

        if ((statusCode === "0000" || statusCode === "000") && pinBlock && flow !== "S2U") {
            // Close OTP modal
            this.onOTPClose();

            this.props.navigation.navigate(MAE_CARD_STATUS, {
                status: SUCC_STATUS,
                headerText: MAECARD_CVVENQ_SUCC + pinBlock,
                detailsArray,
                onDone: this.onStatusPgDone,
            });
        } else if ((statusCode === "0000" || statusCode === "000") && flow === "S2U") {
            this.setState({ detailsArray }, () => {
                this.showS2uModal(result);
            });
        } else if (statusCode === "0A5" || statusCode === "00A5") {
            otpModalErrorCb(statusDesc || "Wrong OTP entered");
            return;
        } else {
            // Close OTP modal
            this.onOTPClose();

            this.props.navigation.navigate(MAE_CARD_STATUS, {
                status: FAIL_STATUS,
                headerText: MAECARD_CVVENQ_FAIL,
                detailsArray,
                serverError: statusDesc || "",
                onDone: this.onStatusPgDone,
            });
        }
    };

    initPin = async (item) => {
        console.log("[CardDetails] >> [initPin]");

        FACardManagement.onChangePIN();

        const { action } = item;

        // L3 call to invoke login page
        const isLogin = await this.stepUpL3();
        if (!isLogin) return;
        // Check for S2u registration //passing new paramerter updateModel for s2u interops
        const { flow, secure2uValidateData } = await checks2UFlow(
            36,
            this.props.getModel,
            this.props.updateModel
        );
        this.setState({ flow: flow, secure2uValidateData: secure2uValidateData });
        const { cardDetails } = this.state;

        const chipMasterData = await fetchChipMasterData(cardDetails.cardNo);
        const { statusCode, statusDesc } = chipMasterData;
        const {
            navigation: { navigate },
        } = this.props;
        if (statusCode === "0000") {
            if (flow === SECURE2U_COOLING) {
                navigateToS2UCooling(navigate);
            } else if (flow === "S2UReg") {
                navigate(ONE_TAP_AUTH_MODULE, {
                    screen: "Activate",
                    params: {
                        flowParams: {
                            success: {
                                stack: BANKINGV2_MODULE,
                                screen: MAE_CARDDETAILS,
                            },
                            fail: {
                                stack: BANKINGV2_MODULE,
                                screen: MAE_CARDDETAILS,
                            },
                            params: { flow: "S2UReg", isFromS2uReg: true, item: item },
                        },
                    },
                });
            } else {
                navigate(CARD_UCODE_PIN, {
                    ...cardDetails,
                    flowType: action,
                    currentScreen: "PIN",
                    entryPoint: "CARD_MGMT",
                    chipMasterData,
                    flow: flow,
                    secure2uValidateData: secure2uValidateData,
                    nonTxnData: { isNonTxn: true, nonTxnTitle: "Change Card PIN" },
                    secure2uExtraParams: {
                        metadata: { txnType: "MAE_CRD_SETPIN" },
                    },
                });
            }
        } else {
            showErrorToast({
                message: statusDesc || COMMON_ERROR_MSG,
            });
        }
    };

    initApplyMAECard = async () => {
        console.log("[CardDetails] >> [initApplyMAECard]");

        FACardManagement.onApplyMAECard();

        // Retrieve Card & Account Details
        const { maeCustomerInfo } = this.state;

        // Check Operation time
        const operationTime = await checkServerOperationTime("maePhysicalCard");
        const { statusCode, statusDesc, trinityFlag } = operationTime;
        if (statusCode !== "0000") {
            showErrorToast({
                message: statusDesc || COMMON_ERROR_MSG,
            });
            return;
        }

        // L3 call to invoke login page
        const isLogin = await this.stepUpL3();
        if (!isLogin) return;

        const navParams = getApplyMAECardNavParams(maeCustomerInfo, trinityFlag);
        this.props.navigation.navigate(BANKINGV2_MODULE, {
            screen: APPLY_CARD_INTRO,
            params: {
                ...navParams,
                entryPoint: "CARD_DETAILS",
            },
        });
    };

    initRenewMAEVirtualCard = async () => {
        console.log("[CardDetails] >> [initRenewMAEVirtualCard]");

        // Check Operation time
        const operationTime = await checkServerOperationTime("maeCardRplm");
        const { statusCode, statusDesc } = operationTime;
        if (statusCode != "0000") {
            showErrorToast({
                message: statusDesc || COMMON_ERROR_MSG,
            });
            return;
        }

        // L3 call to invoke login page
        const isLogin = await this.stepUpL3();
        if (!isLogin) return;

        // Retrieve Card & Account Details
        const { maeCustomerInfo, cardDetails, type } = this.state;
        this.props.navigation.navigate(BANKINGV2_MODULE, {
            screen: MAE_RENEW_VIRTUAL_CARD,
            params: {
                maeCustomerInfo,
                cardDetails: cardDetails,
                entryPoint: "CARD_DETAILS",
                type: type,
                mobileNumber: this.props.getModel("user").mobileNumber,
            },
        });
    };

    initFreezeUnfreeze = async (item) => {
        console.log("[CardDetails] >> [initFreezeUnfreeze]");

        // L3 call to invoke login page
        const isLogin = await this.stepUpL3();
        if (!isLogin) return;
        const nonTrnString = item.action === "MAE_CARD_UNFREEZE" ? UNBLOCK_MAE_CARD : BLOCK_MAE_CARD;
        FACardManagement.onFreezeUnfreezeCard(nonTrnString);
        const { flow, secure2uValidateData } = await checks2UFlow(
            36,
            this.props.getModel,
            this.props.updateModel
        );
        const {
            navigation: { navigate },
        } = this.props;
        this.setState(
            {
                transactionType: item.action,
                transactionItemId: item.itemId,
                flow: flow,
                secure2uValidateData: secure2uValidateData,
                nonTxnData: { isNonTxn: true, nonTxnTitle: nonTrnString },
                secure2uExtraParams: {
                    metadata: { txnType: item.action },
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
                                        screen: MAE_CARDDETAILS,
                                    },
                                    fail: {
                                        stack: BANKINGV2_MODULE,
                                        screen: MAE_CARDDETAILS,
                                    },

                                    params: { flow: "S2UReg", isFromS2uReg: true, item: item },
                                },
                            },
                        });
                        break;
                    case "S2U":
                        this.freezeUnfreezeAPICall("");
                        break;
                    case "TAC":
                        this.requestOTP();
                        break;
                    default:
                        break;
                }
            }
        );
    };

    freezeUnfreezeAPICall = async (otp, otpModalErrorCb) => {
        console.log("[CardDetails] >> [freezeUnfreezeAPICall]");

        const { refNo, maeAcctNo, transactionType, flow, secure2uValidateData } = this.state;

        // Request object
        const params = {
            tacBlock: otp,
            refNo: refNo,
            acctNo: maeAcctNo,
            reqType: transactionType,
            twoFAType:
                flow === "S2U"
                    ? secure2uValidateData?.pull === "N"
                        ? "SECURE2U_PUSH"
                        : "SECURE2U_PULL"
                    : "TAC",
        };

        // API Call
        const httpResp = await frzUnfrzReq(params, true);

        // Response error checking
        const result = httpResp?.data?.result ?? null;
        if (!result) {
            // Close OTP modal
            this.onOTPClose();

            this.props.navigation.navigate(MAE_CARD_STATUS, {
                status: FAIL_STATUS,
                headerText:
                    transactionType === "MAE_CARD_FREEZE"
                        ? MAECARD_FREEZE_FAIL
                        : MAECARD_UNFREEZE_FAIL,
                detailsArray: null,
                serverError: MAECARD_FREEZE_FAIL_SUBTEXT,
                onDone: this.onStatusPgDone,
            });
            GAMAECardScreen.onToggleCardFreeze(FAIL_STATUS, null, transactionType);
            return;
        }

        let detailsArray = [];
        const { statusCode, statusDesc, txnRefNo, dtTime, formattedTransactionRefNumber } = result;

        // Check for Reference ID
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

        switch (statusCode) {
            case "000":
            case "0000":
                if (flow === "S2U") {
                    this.setState({ detailsArray }, () => {
                        this.showS2uModal(result);
                    });
                } else {
                    // Close OTP modal
                    this.onOTPClose();
                    this.gotoFreezeUnfreezeSuccessPage(detailsArray);
                }
                break;
            case "0A5":
            case "00A5":
                if (flow === "TAC") otpModalErrorCb(statusDesc || "Wrong OTP entered");
                break;
            default:
                // Close OTP modal
                this.onOTPClose();

                this.props.navigation.navigate(MAE_CARD_STATUS, {
                    status: FAIL_STATUS,
                    headerText:
                        transactionType === "MAE_CARD_FREEZE"
                            ? MAECARD_FREEZE_FAIL
                            : MAECARD_UNFREEZE_FAIL,
                    detailsArray,
                    serverError: statusDesc || MAECARD_FREEZE_FAIL_SUBTEXT,
                    onDone: this.onStatusPgDone,
                });
                GAMAECardScreen.onToggleCardFreeze(FAIL_STATUS, detailsArray, transactionType);
                break;
        }
    };

    gotoFreezeUnfreezeSuccessPage = (detailsArray) => {
        const { transactionType } = this.state;
        this.props.navigation.navigate(MAE_CARD_STATUS, {
            status: SUCC_STATUS,
            headerText:
                transactionType == "MAE_CARD_FREEZE" ? MAECARD_FREEZE_SUCC : MAECARD_UNFREEZE_SUCC,
            detailsArray,
            serverError:
                transactionType == "MAE_CARD_FREEZE"
                    ? MAECARD_FREEZE_SUCC_SUBTEXT
                    : MAECARD_UNFREEZE_SUCC_SUBTEXT,
            onDone: this.onStatusPgDone,
        });

        GAMAECardScreen.onToggleCardFreeze(SUCC_STATUS, detailsArray, transactionType);
    };

    initReplace = async (item) => {
        console.log("[CardDetails] >> [initReplace]");

        FACardManagement.onCardReplacement();

        const { action } = item;
        const { maeCustomerInfo, rplmPopupDesc, insuffBalPopupDesc } = this.state;

        this.setState({ physicalRplmAction: action });
        // Check if request is already placed and is under process
        if (action === "MAE_CRD_RPM_INPROG") {
            showErrorToast({
                message: "You have already placed a request for card replacement/renewal",
            });
            return;
        }

        this.setState({ isReplaceLoading: true });
        // Check Operation time
        const operationTime = await checkServerOperationTime("maeCardRplm", false);
        const { statusCode, statusDesc, trinityFlag } = operationTime;
        if (statusCode != "0000") {
            showErrorToast({
                message: statusDesc || COMMON_ERROR_MSG,
            });

            this.setState({ isReplaceLoading: false });
            return;
        }

        // L3 call to invoke login page
        const isLogin = await this.stepUpL3(false);
        if (!isLogin) {
            this.setState({ isReplaceLoading: false });
            return;
        }

        // Fetch Master Data
        const masterDataResp = await getMAEMasterData(false).catch((error) => {
            console.log("[CardDetails][getMAEMasterData] >> Exception: ", error);
        });
        const masterData = masterDataResp?.data?.result ?? null;
        this.setState({ masterData: masterData });

        // Fetch GCIF data - for prepopulation
        let gcifResp;
        const gcifParams = trinityFlag === "Y" ? { requestType: "maeCardRplm" } : null;
        if (trinityFlag === "Y") {
            gcifResp = await getGCIFDetails(GCIF_DETAILS_API_V2, gcifParams, false).catch(
                (error) => {
                    console.log("[CardDetails][getGCIFDetails] >> Exception: ", error);
                }
            );
        } else {
            gcifResp = await getGCIFV2Details(false).catch((error) => {
                console.log("[CardDetails][getGCIFDetails] >> Exception: ", error);
            });
        }

        const gcifData = gcifResp?.data?.result ?? null;

        const cardRplmFeeResp = await getCardRplmFee(false).catch((error) => {
            console.log("[CardDetails][getCardRplmFee] >> Exception: ", error);
        });

        const cardRplmFeeData = cardRplmFeeResp?.data?.result;
        this.setState({ gcifData: gcifData, cardRplmFeeData: cardRplmFeeData });

        const { m2uPhoneNumber } = this.props.getModel("m2uDetails");

        // Check if Card Replacement or Renewal
        const currentDate = maeCustomerInfo?.debitInq?.currentDate;
        const expiryDate = maeCustomerInfo?.debitInq?.cardExpiry;
        const serviceFee = this.extractFee(cardRplmFeeData?.fee);

        const rplmPopupDescription = rplmPopupDesc.replace("[serviceCharge]", serviceFee || "0.00");
        const insuffBalPopupDescription = insuffBalPopupDesc.replace(
            "[serviceCharge]",
            serviceFee || "0.00"
        );

        this.setState({ isReplaceLoading: false });

        const todayObj = moment(currentDate, "YYYYMMDD");
        const expiryDateObj = moment(expiryDate, "YYMM");
        if (
            todayObj.diff(expiryDateObj, "years") >= 1 ||
            todayObj.diff(expiryDateObj, "years") <= -1
        ) {
            this.setState({
                rplmPopupDesc: rplmPopupDescription,
                insuffBalPopupDesc: insuffBalPopupDescription,
                activePopup: "RPLM",
                showRenewPopup: true,
            });
        } else {
            this.navToMaeCardAddress();
        }
    };

    gotoTopUpFlow = () => {
        console.log("[CardDetails] >> [gotoTopUpFlow]");

        // Hide popup
        this.hidePopup();

        const { cardDetails } = this.state;

        // Navigate to Top Up flow
        onMAETopUpButtonTap({
            data: {
                acctNo: cardDetails.maeAcctNo,
            },
            routeFrom: MAE_CARDDETAILS,
        });
    };

    initOverseas = async (item) => {
        console.log("[CardDetails] >> [initOverseas]");

        const { action, itemId } = item;

        FACardManagement.onActivateDeactivateCard(action);

        if (action == "MAE_CRD_OVERSEAS_ACTIVATE") {
            // L3 call to invoke login page
            const isLogin = await this.stepUpL3();
            if (!isLogin) return;
            const { flow, secure2uValidateData } = await checks2UFlow(
                36,
                this.props.getModel,
                this.props.updateModel
            );
            const { mobileNumber, maskedMobileNumber } = this.state;
            const {
                navigation: { navigate },
            } = this.props;
            this.setState({ flow: flow, secure2uValidateData: secure2uValidateData }, () => {
                // Navigate to overseas date screen
                if (flow === SECURE2U_COOLING) {
                    navigateToS2UCooling(navigate);
                } else if (flow === "S2UReg") {
                    navigate(ONE_TAP_AUTH_MODULE, {
                        screen: "Activate",
                        params: {
                            flowParams: {
                                success: {
                                    stack: BANKINGV2_MODULE,
                                    screen: MAE_CARDDETAILS,
                                },
                                fail: {
                                    stack: BANKINGV2_MODULE,
                                    screen: MAE_CARDDETAILS,
                                },
                                params: { flow: "S2UReg", isFromS2uReg: true, item: item },
                            },
                        },
                    });
                } else {
                    navigate(MAE_CARD_OVERSEAS_DATES, {
                        ...this.props.route.params,
                        mobileNumber,
                        maskedMobileNumber,
                        transactionType: action,
                        flow: flow,
                        secure2uValidateData: secure2uValidateData,
                        nonTxnData: { isNonTxn: true, nonTxnTitle: "Activate Overseas Debit" },
                        secure2uExtraParams: {
                            metadata: { txnType: "MAE_CRD_OVERSEAS_ACTIVATE" },
                        },
                    });
                }
            });
        } else {
            this.setState(
                { transactionType: action, transactionItemId: itemId, tempItem: item },
                () => {
                    // Show deactivate confirmation popup
                    this.showPopup("DEACTIVATE_OVERSEAS");
                }
            );
        }
    };

    initAutoTopup = async () => {
        const { maeCustomerInfo } = this.state;

        FACardManagement.onSelectAutoTopup();

        // L3 call to invoke login page
        const isLogin = await this.stepUpL3();
        if (!isLogin) return;

        const navParams = {
            fromModule: BANKINGV2_MODULE,
            fromScreen: "CardDetails",
            moreParams: { reload: true },
        };

        const { screen, params } = await autoTopupNavigate(maeCustomerInfo, navParams);
        this.props.navigation.navigate(screen, params);
    };

    initPurchaseLimit = async (item) => {
        console.log("[CardDetails] >> [initPurchaseLimit]");

        const { maeCustomerInfo, cardDetails, type } = this.state;
        console.log("maeCustomerInfo");
        FACardManagement.onPurchaseLimit();

        const { m2uPhoneNumber } = this.props.getModel("m2uDetails");

        // L3 call to invoke login page
        const isLogin = await this.stepUpL3();
        if (!isLogin) return;

        let maxLimit;
        if (type === "VIRTUAL_CARD_MGMT") {
            maxLimit = 4999.99;
        } else {
            maxLimit = 10000;
        }

        const urlParams = {
            cardNo: cardDetails?.cardNo,
            acctNo: cardDetails?.maeAcctNo,
            refNo: cardDetails?.refNo,
            tacLength: "00",
            tacBlock: "",
        };
        const response = await getMAEPurchaseLimit(urlParams);
        const { amount, statusCode, statusDesc } = response?.data?.result;

        if (statusCode !== "0000") {
            showErrorToast({
                message: statusDesc || COMMON_ERROR_MSG,
            });
            return;
        }

        this.props.navigation.navigate(MAE_CARD_PURCHASE_LIMIT, {
            cardDetails,
            minValue: 0,
            maxValue: maxLimit,
            interval: 1000,
            mobileNumber: m2uPhoneNumber,
            currentLimit: Number(amount),
        });
    };

    deactivateOverseasDebit = async () => {
        console.log("[CardDetails] >> [deactivateOverseasDebit]");

        // Hide popup
        this.hidePopup();

        // L3 call to invoke login page
        const isLogin = await this.stepUpL3();
        if (!isLogin) return;
        const { flow, secure2uValidateData } = await checks2UFlow(
            36,
            this.props.getModel,
            this.props.updateModel
        );
        const { tempItem } = this.state;
        const {
            navigation: { navigate },
        } = this.props;
        this.setState(
            {
                flow: flow,
                secure2uValidateData: secure2uValidateData,
                nonTxnData: { isNonTxn: true, nonTxnTitle: "Deactivate Overseas Debit" },
                secure2uExtraParams: {
                    metadata: { txnType: "MAE_CRD_OVERSEAS_DACTIVATE" },
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
                                        screen: MAE_CARDDETAILS,
                                    },
                                    fail: {
                                        stack: BANKINGV2_MODULE,
                                        screen: MAE_CARDDETAILS,
                                    },

                                    params: { flow: "S2UReg", isFromS2uReg: true, item: tempItem },
                                },
                            },
                        });
                        break;
                    case "S2U":
                        this.overseasAPICall("");
                        break;
                    case "TAC":
                        this.requestOTP();
                        break;
                    default:
                        break;
                }
            }
        );
        // Initiate request OTP call
    };

    overseasAPICall = async (otp, otpModalErrorCb) => {
        console.log("[CardDetails] >> [overseasAPICall]");

        const { transactionType, cardDetails, flow, secure2uValidateData } = this.state;

        const params = {
            tacBlock: otp,
            refNo: cardDetails.refNo,
            acctNo: cardDetails.maeAcctNo,
            reqType: transactionType,
            ovrSeasFlgStDt: cardDetails.ovrSeasFlgStDt,
            ovrSeasFlgEndDt: cardDetails.ovrSeasFlgEndDt,
            twoFAType:
                flow === "S2U"
                    ? secure2uValidateData?.pull === "N"
                        ? "SECURE2U_PUSH"
                        : "SECURE2U_PULL"
                    : "TAC",
        };

        const httpResp = await ovrSeasFlagReq(params);

        // Response error checking
        const result = httpResp?.data?.result ?? null;
        if (!result) {
            // Close OTP modal
            this.onOTPClose();

            this.props.navigation.navigate(MAE_CARD_STATUS, {
                status: FAIL_STATUS,
                headerText: MAECARD_OVERSEASDEACTIVATE_FAIL,
                detailsArray: null,
                serverError: null,
                onDone: this.onStatusPgDone,
            });
            GAMAECardScreen.onFailRequestOverseasDebit(null);
            return;
        }

        let detailsArray = [];
        const { statusCode, statusDesc, txnRefNo, dtTime, formattedTransactionRefNumber } = result;

        // Check for Reference ID
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
                    this.onOTPClose();
                    this.gotoDeactivateSuccessPage(detailsArray);
                }
                break;
            case "0A5":
            case "00A5":
                if (flow === "TAC") otpModalErrorCb(statusDesc || "Wrong OTP entered");
                break;
            default:
                // Close OTP modal
                this.onOTPClose();
                this.gotoDeactivateFailPage(detailsArray, statusDesc);
                break;
        }
    };

    gotoDeactivateSuccessPage = (detailsArray) => {
        this.props.navigation.navigate(MAE_CARD_STATUS, {
            status: SUCC_STATUS,
            headerText: MAECARD_OVERSEASDEACTIVATE_SUCC,
            detailsArray,
            onDone: this.onStatusPgDone,
        });
        GAMAECardScreen.onDisableOverseasDebit(detailsArray);
    };

    gotoDeactivateFailPage = (detailsArray, statusDesc) => {
        this.props.navigation.navigate(MAE_CARD_STATUS, {
            status: FAIL_STATUS,
            headerText: MAECARD_OVERSEASDEACTIVATE_FAIL,
            detailsArray,
            serverError: statusDesc || "",
            onDone: this.onStatusPgDone,
        });
        GAMAECardScreen.onFailRequestOverseasDebit(detailsArray);
    };

    showPopup = (popupAction) => {
        console.log("[CardDetails] >> [showPopup]");

        const { maeCustomerInfo } = this.state;
        const serviceCharge = maeCustomerInfo?.svcChrg ?? 0;

        // Set Content based on action
        if (popupAction == "TOPUP") {
            this.setState({
                popupTitle: INSUFF_BALANCE_TITLE,
                popupMsg: INSUFF_BALANCE_POPUP_MSG.replace(
                    "[serviceCharge]",
                    numeral(serviceCharge).format("0,0.00")
                ),
                popupPrimaryBtnText: TOPUP_NOW,
            });
        } else {
            this.setState({
                popupTitle: OVRS_DEACTV_POPUP_TITLE,
                popupMsg: OVRS_DEACTV_POPUP_MSG,
                popupPrimaryBtnText: DEACTIVATE,
            });
        }

        this.setState({ showPopup: true, popupAction });
    };

    hidePopup = () => {
        console.log("[CardDetails] >> [hidePopup]");

        this.setState({ showPopup: false, popupAction: null });
    };

    onPopupClose = () => {
        console.log("[CardDetails] >> [onPopupClose]");

        this.setState({ showRenewPopup: false, activePopup: "" });
    };

    onRplmPopupContinue = () => {
        console.log("[CardDetails] >> [onRplmPopupContinue]");

        const { maeCustomerInfo, cardRplmFeeData } = this.state;
        const maeAcctBalance = maeCustomerInfo?.maeAcctBalance;
        const serviceCharge = parseFloat(this.extractFee(cardRplmFeeData?.fee));
        this.setState({ showRenewPopup: false, activePopup: "" });
        const currentDate = maeCustomerInfo?.debitInq?.currentDate || moment();
        const expiryDate = maeCustomerInfo?.debitInq?.cardExpiry;

        const todayObj = moment(currentDate, "YYYYMMDD");
        const expiryDateObj = moment(expiryDate, "YYMM");
        if (
            todayObj.diff(expiryDateObj, "years") >= 1 ||
            todayObj.diff(expiryDateObj, "years") <= -1
        ) {
            if (isNaN(maeAcctBalance) || isNaN(serviceCharge)) {
                showErrorToast({
                    message: COMMON_ERROR_MSG,
                });
            } else if (parseFloat(maeAcctBalance) >= parseFloat(serviceCharge)) {
                this.navToMaeCardAddress();
            } else {
                this.setState({ showRenewPopup: true, activePopup: "INSUFF_BAL" });
            }
        } else {
            this.navToMaeCardAddress();
        }
    };

    onTopupContinue = async () => {
        console.log("[CardDetails] >> [onTopupContinue]");

        this.setState({ showRenewPopup: false, activePopup: "" });

        // Navigate to Top Up flow
        onMAETopUpButtonTap({
            data: {
                acctNo: this.state.cardDetails.maeAcctNo,
            },
            routeFrom: MAE_CARDDETAILS,
            routeTo: MAE_CARD_ADDRESS,
        });
    };

    navToMaeCardAddress = () => {
        const {
            masterData,
            maeCustomerInfo,
            gcifData,
            cardRplmFeeData,
            cardDetails,
            physicalRplmAction,
        } = this.state;
        const idType = maeCustomerInfo?.idType;
        const serviceCharge = this.extractFee(cardRplmFeeData?.fee);

        // Navigate to Address screen
        this.props.navigation.navigate(MAE_CARD_ADDRESS, {
            entryPoint: "CARD_MGMT",
            masterData: massageMasterData(masterData, idType),
            gcifData: massageGCIFData(gcifData),
            maeCustomerInfo,
            cardDetails,
            mobileNumber: this.props.getModel("m2uDetails").m2uPhoneNumber,
            flowType: physicalRplmAction,
            isFromS2uReg: false,
            serviceCharge: parseFloat(serviceCharge) ?? 0,
        });
    };

    onPopupBtnPress = () => {
        console.log("[CardDetails] >> [onPopupBtnPress]");

        const { popupAction } = this.state;

        if (popupAction == "TOPUP") {
            this.gotoTopUpFlow();
        } else {
            this.deactivateOverseasDebit();
        }
    };

    extractFee = (fee) => {
        if (fee) return fee.replace("RM", "");
        else return "0.00";
    };

    requestOTP = async (isResend = false, showOTPCb = () => {}) => {
        console.log("[CardDetails] >> [requestOTP]");

        const { mobileNumber, transactionType, cardDetails } = this.state;
        if (!transactionType) return;

        const params = {
            mobileNo: mobileNumber,
            idNo: "",
            transactionType: transactionType,
            otp: "",
            preOrPostFlag: "postlogin",
            cardNo: cardDetails.cardNo,
        };

        const httpResp = await requestTAC(params, true, MAE_REQ_TAC).catch((error) => {
            console.log("[CardDetails][requestTAC] >> Exception: ", error);
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
        console.log("[CardDetails] >> [showOTPModal]");

        this.setState({ showOTP: true });
    };

    onOTPClose = () => {
        console.log("[CardDetails] >> [onOTPClose]");

        this.setState({
            showOTP: false,
            token: null,
            transactionType: null,
            transactionItemId: null,
        });
    };

    onOTPResend = (showOTPCb) => {
        console.log("[CardDetails] >> [onOTPResend]");

        this.requestOTP(true, showOTPCb);
    };

    onOTPDone = (otp, otpModalErrorCb) => {
        console.log("[CardDetails] >> [onOTPDone]");

        const { transactionItemId } = this.state;

        switch (transactionItemId) {
            case "CVV":
                this.cvvAPICall(otp, otpModalErrorCb);
                break;
            case "FREEZE_UNFREEZE":
                this.freezeUnfreezeAPICall(otp, otpModalErrorCb);
                break;
            case "OVERSEAS":
                this.overseasAPICall(otp, otpModalErrorCb);
                break;
            default:
                break;
        }
    };

    showS2uModal = (response) => {
        console.log("[CardDetails] >> [showS2uModal]");
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
        console.log("[CardDetails] >> [onS2uDone]");

        const { transactionStatus, s2uSignRespone, statusDesc } = response;
        const { transactionItemId, detailsArray } = this.state;
        // Close S2u popup
        this.onS2uClose();
        switch (transactionItemId) {
            case "FREEZE_UNFREEZE":
                if (transactionStatus) {
                    this.gotoFreezeUnfreezeSuccessPage(detailsArray);
                } else {
                    const { transactionType } = this.state;
                    this.props.navigation.navigate(MAE_CARD_STATUS, {
                        status: FAIL_STATUS,
                        headerText:
                            transactionType === "MAE_CARD_FREEZE"
                                ? MAECARD_FREEZE_FAIL
                                : MAECARD_UNFREEZE_FAIL,
                        detailsArray,
                        serverError:
                            s2uSignRespone?.text ??
                            s2uSignRespone?.additionalStatusDescription ??
                            statusDesc ??
                            MAECARD_FREEZE_FAIL_SUBTEXT,
                        onDone: this.onStatusPgDone,
                    });
                    GAMAECardScreen.onToggleCardFreeze(FAIL_STATUS, detailsArray, transactionType);
                }
                break;
            case "CVV": {
                if (transactionStatus && s2uSignRespone?.pinBlock) {
                    //need to check backend where to get pinBlock
                    this.props.navigation.navigate(MAE_CARD_STATUS, {
                        status: SUCC_STATUS,
                        headerText: MAECARD_CVVENQ_SUCC + s2uSignRespone?.pinBlock,
                        detailsArray,
                        onDone: this.onStatusPgDone,
                    });
                } else {
                    this.props.navigation.navigate(MAE_CARD_STATUS, {
                        status: FAIL_STATUS,
                        headerText: MAECARD_CVVENQ_FAIL,
                        detailsArray,
                        serverError:
                            s2uSignRespone?.text ??
                            s2uSignRespone?.additionalStatusDescription ??
                            statusDesc ??
                            "",
                        onDone: this.onStatusPgDone,
                    });
                }
                break;
            }
            case "OVERSEAS":
                if (transactionStatus) {
                    this.gotoDeactivateSuccessPage(detailsArray);
                } else {
                    this.gotoDeactivateFailPage(detailsArray, statusDesc);
                }
                break;
            default:
                break;
        }
    };

    onS2uClose = () => {
        console.log("[CardDetails] >> [onS2uClose]");
        // will close tac popup
        this.setState({ showS2u: false });
    };

    onStatusPgDone = () => {
        console.log("[CardDetails] >> [onStatusPgDone]");

        // Pop status page
        this.props.navigation.goBack();

        // Call method to reload data
        this.reloadCardDetails();
    };

    checkRSA = async (challengeParams = {}) => {
        console.log("check RSA CQ");
        const { deviceInformation, deviceId } = this.props.getModel("device");
        const mobileSDKData = getDeviceRSAInformation(deviceInformation, DeviceInfo, deviceId);
        const deviceDetails = {};
        deviceDetails.device_model = deviceInformation.DeviceModel;
        deviceDetails.os_version = deviceInformation.DeviceSystemVersion;
        const { cardDetails } = this.props.route.params;
        const params = {
            mobileSDKData,
            deviceDetails,
            challengeMode: "",
            notifyStatus: "",
            cardNo: cardDetails?.cardNo,
            ...challengeParams,
        };
        console.log(params);
        const result = await rsaChallengeQuestion(params);
        console.log("checkRSA result ::: ", result);
        const code = result?.status;
        if (code === 428 || code === 423 || code === 422) {
            this._handleRSAFailure(result);
        } else {
            //200
            this.setState({ showRSAChallengeQuestion: false });
            this.onAPBtnPress();
        }
    };

    _handleRSAFailure = (error) => {
        if (error.status === 428)
            this.setState((prevState) => ({
                challengeRequest: {
                    ...prevState.challengeRequest,
                    challenge: error?.error?.challenge,
                },
                showRSAChallengeQuestion: true,
                showRSALoader: false,
                rsaChallengeQuestion: error?.error?.challenge?.questionText,
                rsaCount: prevState.rsaCount + 1,
                showRSAError: prevState.rsaCount > 0,
            }));
        else if (error.status === 423) {
            this.setState({
                showRSAChallengeQuestion: false,
            });
            const serverDate = error?.error?.serverDate ?? "N/A";
            this.props.navigation.navigate(ONE_TAP_AUTH_MODULE, {
                screen: "Locked",
                params: {
                    reason: error?.error?.statusDescription ?? "N/A",
                    loggedOutDateTime: serverDate,
                    lockedOutDateTime: serverDate,
                },
            });
        } else {
            this.setState({
                showRSAChallengeQuestion: false,
            });
            this.props.navigation.navigate(COMMON_MODULE, {
                screen: RSA_DENY_SCREEN,
                params: {
                    statusDescription: error?.error?.statusDescription ?? "N/A",
                    additionalStatusDescription: error?.error?.additionalStatusDescription ?? "",
                    serverDate: error?.error?.serverDate ?? "N/A",
                    nextParams: { screen: DASHBOARD, params: { refresh: false } },
                    nextModule: TAB_NAVIGATOR,
                    nextScreen: "Tab",
                },
            });
        }
    };

    _handleRSAChallengeQuestionAnswered = (answer) => {
        this.setState({ showRSAError: false, showRSALoader: true }, async () => {
            const params = {
                challenge: {
                    ...this.state.challengeRequest.challenge,
                    answer,
                },
            };
            await this.checkRSA(params);
        });
    };

    _handleRSAChallengeQuestionClosed = () => this.setState({ showRSAError: false });

    onAPBtnPress = () => {
        GABankingApplePay.addToAppleWallet(FA_CARD_MANAGEMENT);
        console.log("CardsList ::: onAPBtnPress ::: ");
        const { customerName, token } = this.state;
        const { cardDetails } = this.props.route.params;

        const { cards } = this.props.getModel("applePay");
        const selectedCardDetails = isCardProvisioned(cardDetails?.cardNo, cards);
        console.log("card details ::: ", selectedCardDetails);

        PassKit.addEventListener(
            "addPassesViewControllerDidFinish",
            this.onAddPassesViewControllerDidFinish
        );

        //(token,cardNo, cardName, customerName, isMaeDebit)
        onApplePayBtnPress(
            token,
            cardDetails?.cardNo,
            "MAE Visa Card",
            customerName,
            true,
            selectedCardDetails?.fpanID
        );
    };

    aboutApplePay = () => {
        GABankingApplePay.learnAboutApplePay(FA_CARD_MANAGEMENT);
        console.log("Show about apple pay in inapp browser");
        const props = {
            title: APPLE_PAY,
            source: ABOUT_APPLE_PAY,
            headerColor: TRANSPARENT,
        };

        this.props.navigation.navigate(SETTINGS_MODULE, {
            screen: "PdfSetting",
            params: props,
        });
    };

    renderItems = ({ item }) => {
        return (
            <TouchableOpacity
                activeOpacity={item.disabled ? 1 : 0.2}
                onPress={() => this.onListTap(item)}
            >
                <View
                    style={
                        item.disabled ? [Style.serviceslist, { opacity: 0.3 }] : Style.serviceslist
                    }
                >
                    {/* Header & Subtext Outer View */}
                    <View style={Style.cardMgmtContentOuterView}>
                        {/* Header Text */}
                        <Typo
                            fontSize={15}
                            lineHeight={23}
                            fontWeight="600"
                            color={BLACK}
                            textAlign="left"
                            text={item.header}
                        />

                        {/* Sub Text */}
                        {item.subText && (
                            <Typo
                                fontSize={11}
                                lineHeight={17}
                                fontWeight="normal"
                                color={DARK_GREY}
                                textAlign="left"
                                text={item.subText}
                            />
                        )}
                    </View>

                    {/* Right Icon Outer View */}
                    <View style={Style.cardMgmtIconOuterView}>
                        {item.iconType == "arrow" ? (
                            <Image source={Assets.nextArrow} style={Style.cardMgmtArrowIcon} />
                        ) : (
                            <SwitchToggle
                                accessible={true}
                                testID={"maeCardMgmtSwitch"}
                                accessibilityLabel={"maeCardMgmtSwitch"}
                                switchOn={!(item.iconState == "OFF")}
                                onPress={() => this.onListTap(item)}
                                containerStyle={Style.switchContainer}
                                circleStyle={Style.switchCircleStyle}
                                backgroundColorOn={SWITCH_GREEN}
                                backgroundColorOff={SWITCH_GREY}
                                circleColorOff={WHITE}
                                circleColorOn={WHITE}
                                type={0}
                            />
                        )}
                    </View>
                </View>
            </TouchableOpacity>
        );
    };

    onPayBtnPress = () => {
        GABankingApplePay.payWithApplePay(FA_CARD_MANAGEMENT);   
        console.log("onPayBtnPress"); //Need to redirect to apple wallet screen
        const { cardDetails } = this.state;
        if (!cardDetails) return;
        let cardNo = cardDetails?.cardNo ?? null;
        const { cards } = this.props.getModel("applePay");
        const selectedCardDetails = isCardProvisioned(cardNo, cards);
        const suffix = selectedCardDetails.number?.substring(
            selectedCardDetails.number.length - 4,
            selectedCardDetails.number.length
        );
        payWithApplePay(selectedCardDetails?.fpanID, suffix);
    };

    render() {
        const {
            cardNo,
            cardExpiry,
            type,

            token,
            maskedMobileNumber,
            showOTP,

            isCardFrozen,
            data,
            isLoading,
            isReplaceLoading,

            showPopup,
            popupTitle,
            popupMsg,
            popupPrimaryBtnText,

            secure2uValidateData,
            showS2u,
            pollingToken,
            s2uTransactionDetails,
            secure2uExtraParams,
            nonTxnData,

            appleWalletEligibility,
            cardDevProv,
            cardWatchProv,

            showRSALoader,
            showRSAChallengeQuestion,
            rsaChallengeQuestion,
            showRSAError,
        } = this.state;

        const renewPopupContent =
            this.state.activePopup === "RPLM"
                ? {
                      renewPopupTitle: CARD_REPLACE_TITLE,
                      renewPopupDescription: this.state.rplmPopupDesc,
                      onCloseRenewPopup: this.onPopupClose,
                      renewPopupPrimaryAction: {
                          text: CONTINUE,
                          onPress: this.onRplmPopupContinue,
                      },
                  }
                : {
                      renewPopupTitle: INSUFF_BALANCE_TITLE,
                      renewPopupDescription: this.state.insuffBalPopupDesc,
                      onCloseRenewPopup: this.onPopupClose,
                      renewPopupPrimaryAction: {
                          text: TOPUP_NOW,
                          onPress: this.onTopupContinue,
                      },
                  };

        return (
            <React.Fragment>
                <ScreenContainer
                    backgroundType="color"
                    backgroundColor={MEDIUM_GREY}
                    analyticScreenName={FA_CARD_MANAGEMENT}
                >
                    <React.Fragment>
                        <ScreenLayout
                            useSafeArea
                            header={
                                <HeaderLayout
                                    headerLeftElement={
                                        <HeaderBackButton onPress={this.onBackTap} />
                                    }
                                    headerCenterElement={
                                        <Typo
                                            fontSize={16}
                                            fontWeight="600"
                                            color={BLACK}
                                            lineHeight={19}
                                            text={MAE_CARDMANAGEMENT}
                                        />
                                    }
                                />
                            }
                            paddingHorizontal={0}
                            paddingBottom={0}
                            paddingTop={0}
                        >
                            {isLoading ? (
                                <MAECardLoader />
                            ) : (
                                <React.Fragment>
                                    <ScrollView>
                                        <View style={Style.cardContainerCls}>
                                            <ImageBackground
                                                resizeMode="stretch"
                                                style={Style.cardImageCls}
                                                imageStyle={Style.cardImageStyle}
                                                source={
                                                    isCardFrozen
                                                        ? Assets.maeCardFreeze
                                                        : Assets.debitCardFrontImage
                                                }
                                            >
                                                <Typo
                                                    textAlign="left"
                                                    fontSize={14}
                                                    lineHeight={28}
                                                    color={isCardFrozen ? WHITE : BLACK}
                                                    fontWeight="300"
                                                    text={cardNo}
                                                    style={Style.cardNumberCls}
                                                />

                                                {type == "VIRTUAL_CARD_MGMT" && (
                                                    <Typo
                                                        textAlign="left"
                                                        fontSize={10}
                                                        lineHeight={18}
                                                        color={BLACK}
                                                        fontWeight="bold"
                                                        text={cardExpiry}
                                                        style={Style.cardExpiryCls}
                                                    />
                                                )}
                                            </ImageBackground>
                                        </View>
                                        {cardDevProv && (
                                            <View style={Style.payBtn}>
                                                <ApplePayButton
                                                    type="inStore"
                                                    style="black"
                                                    onPress={this.onPayBtnPress}
                                                />
                                            </View>
                                        )}

                                        <View style={Style.listWrapperViewCls}>
                                            <FlatList
                                                data={data}
                                                renderItem={this.renderItems}
                                                scrollEnabled={false}
                                            />
                                        </View>
                                    </ScrollView>
                                    <FixedActionContainer>
                                        {cardDevProv && cardWatchProv && (
                                            <View style={Style.bottomBtnContCls}>
                                                <React.Fragment>
                                                    <RenderAddedItems />
                                                </React.Fragment>
                                            </View>
                                        )}
                                        {appleWalletEligibility && (
                                            <View style={Style.bottomBtnContCls}>
                                                {cardDevProv && !cardWatchProv && (
                                                    <React.Fragment>
                                                        <RenderWatchItems onPress={this.checkRSA} />
                                                    </React.Fragment>
                                                )}
                                                {!cardDevProv && cardWatchProv && (
                                                    <React.Fragment>
                                                        <RenderDeviceItems
                                                            onPress={this.checkRSA}
                                                        />
                                                    </React.Fragment>
                                                )}
                                                {!cardDevProv && !cardWatchProv && (
                                                    <React.Fragment>
                                                        <RenderFooterItems
                                                            onPress={this.checkRSA}
                                                        />
                                                    </React.Fragment>
                                                )}
                                                <LearnAP onPress={this.aboutApplePay} />
                                            </View>
                                        )}
                                    </FixedActionContainer>
                                </React.Fragment>
                            )}
                        </ScreenLayout>

                        {/* Confirmation/Alert POPUP */}
                        <Popup
                            visible={showPopup}
                            title={popupTitle}
                            description={popupMsg}
                            onClose={this.hidePopup}
                            primaryAction={{
                                text: popupPrimaryBtnText,
                                onPress: this.onPopupBtnPress,
                            }}
                        />
                        <ChallengeQuestion
                            loader={showRSALoader}
                            display={showRSAChallengeQuestion}
                            displyError={showRSAError}
                            questionText={rsaChallengeQuestion}
                            onSubmitPress={this._handleRSAChallengeQuestionAnswered}
                            onSnackClosePress={this._handleRSAChallengeQuestionClosed}
                        />
                    </React.Fragment>
                </ScreenContainer>

                {/* Replacement/Insufficient Balance Popup for Physical Card */}
                {
                    <Popup
                        visible={this.state.showRenewPopup}
                        title={renewPopupContent.renewPopupTitle}
                        description={renewPopupContent.renewPopupDescription}
                        onClose={renewPopupContent.onCloseRenewPopup}
                        primaryAction={renewPopupContent.renewPopupPrimaryAction}
                    />
                }

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
                        amount={""}
                        nonTxnData={nonTxnData}
                        onS2UDone={this.onS2uDone}
                        onS2UClose={this.onS2uClose}
                        s2uPollingData={secure2uValidateData}
                        transactionDetails={s2uTransactionDetails}
                        extraParams={secure2uExtraParams}
                    />
                )}
                <ScreenLoader showLoader={isReplaceLoading} />
            </React.Fragment>
        );
    }
}

CardDetails.propTypes = {
    getModel: PropTypes.func,
    navigation: PropTypes.shape({
        addListener: PropTypes.func,
        goBack: PropTypes.func,
        navigate: PropTypes.func,
        setParams: PropTypes.func,
    }),
    route: PropTypes.shape({
        params: PropTypes.shape({
            cardDetails: PropTypes.any,
            data: PropTypes.any,
            isCardFrozen: PropTypes.any,
            maeCustomerInfo: PropTypes.any,
            type: PropTypes.any,
            isFromStatusScreen: PropTypes.bool,
        }),
    }),
    updateModel: PropTypes.any,
};

const Style = StyleSheet.create({
    bottomBtnContCls: {
        flexDirection: "column",
        justifyContent: "space-between",
        width: "100%",
    },
    buttonMargin: {
        marginTop: 20,
    },
    cardContainerCls: {
        alignItems: "center",
        height: 300,
        justifyContent: "center",
        width: "100%",
    },

    cardExpiryCls: {
        left: 15,
        position: "absolute",
        textShadowColor: SHADOW,
        textShadowOffset: {
            width: 0,
            height: 0,
        },
        textShadowRadius: 7,
        top: 105,
    },

    cardImageCls: {
        alignItems: "center",
        height: "100%",
        width: 180,
    },

    cardImageStyle: {
        alignItems: "center",
        height: "100%",
        width: "100%",
    },

    cardMgmtArrowIcon: {
        height: 13,
        width: 13,
    },

    cardMgmtContentOuterView: {
        flex: 1,
        height: "100%",
        justifyContent: "center",
        marginLeft: 30,
    },
    cardMgmtIconOuterView: {
        alignItems: "center",
        height: "100%",
        justifyContent: "center",
        marginLeft: 15,
        marginRight: 30,
        width: 50,
    },
    cardNumberCls: {
        left: 15,
        position: "absolute",
        textShadowColor: SHADOW,
        textShadowOffset: {
            width: 0,
            height: 0,
        },
        textShadowRadius: 8,
        top: 70,
    },
    listWrapperViewCls: {
        flex: 1,
        marginTop: 20,
    },
    payBtn: {
        width: "80%",
        marginLeft: "10%",
    },
    serviceslist: {
        backgroundColor: WHITE,
        borderColor: "#ececec",
        borderStyle: "solid",
        borderWidth: 1,
        flexDirection: "row",
        flex: 1,
        height: 83,
        width: "100%",
    },

    switchCircleStyle: {
        backgroundColor: WHITE,
        borderRadius: 13,
        height: 23,
        width: 23,
    },

    switchContainer: {
        backgroundColor: SWITCH_GREY,
        borderRadius: 20,
        height: 25,
        marginTop: 1,
        padding: 1,
        width: 45,
    },
});

export default withModelContext(CardDetails);
