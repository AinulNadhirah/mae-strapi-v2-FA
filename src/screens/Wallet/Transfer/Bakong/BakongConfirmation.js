import numeral from "numeral";
import PropTypes from "prop-types";
import React, { Component } from "react";
import {
    View,
    ScrollView,
    StyleSheet,
    Platform,
    TouchableOpacity,
    KeyboardAvoidingView,
} from "react-native";
import DeviceInfo from "react-native-device-info";

import { navigateToS2UCooling } from "@screens/OneTapAuth/CoolingNavigator";

import {
    COMMON_MODULE,
    DASHBOARD,
    FUNDTRANSFER_MODULE,
    ONE_TAP_AUTH_MODULE,
    RSA_DENY_SCREEN,
    TAB_NAVIGATOR,
    TRANSFER_TAB_SCREEN,
    DASHBOARD_STACK,
    SECURE2U_COOLING,
} from "@navigation/navigationConstant";

import HeaderLayout from "@layouts/HeaderLayout";
import ScreenLayout from "@layouts/ScreenLayout";

import ActionButton from "@components/Buttons/ActionButton";
import HeaderBackButton from "@components/Buttons/HeaderBackButton";
import HeaderCloseButton from "@components/Buttons/HeaderCloseButton";
import { CircularLogoImage } from "@components/Common";
import ScreenContainer from "@components/Containers/ScreenContainer";
import FixedActionContainer from "@components/Footers/FixedActionContainer";
import Secure2uAuthenticationModal from "@components/Modals/Secure2uAuthenticationModal";
import TacModal from "@components/Modals/TacModal";
import Popup from "@components/Popup";
import ChallengeQuestion from "@components/RSA/ChallengeQuestion";
import Typography from "@components/Text";
import { showInfoToast, showSuccessToast } from "@components/Toast";

import { withModelContext } from "@context";

import { bakongTransferAPI } from "@services";
import { logEvent } from "@services/analytics";

import { BLACK, FADE_GREY, MEDIUM_GREY, ROYAL_BLUE, YELLOW } from "@constants/colors";
import {
    DATE_AND_TIME,
    FA_SCREEN_NAME,
    FA_VIEW_SCREEN,
    FIRST_TIME_FAVOURITES,
    REFERENCE_ID,
    SECURE2U_IS_DOWN,
} from "@constants/strings";

import {
    checks2UFlow,
    formateAccountNumber,
    formatBakongMobileNumbers,
    getDeviceRSAInformation,
} from "@utils/dataModel/utility";
import { ErrorLogger } from "@utils/logs";

const S2UFlowEnum = Object.freeze({
    s2u: "S2U",
    s2uReg: "S2UReg",
    tac: "TAC",
});

const bakongS2uTxnCode = 40;
class BakongConfirmation extends Component {
    static propTypes = {
        navigation: PropTypes.object.isRequired,
        route: PropTypes.object.isRequired,
        getModel: PropTypes.func.isRequired,
        updateModel: PropTypes.func.isRequired,
    };

    /***
     * constructor
     * props
     */
    constructor(props) {
        super(props);
        this.state = {
            loader: false,
            screenData: {
                image: "",
                name: "",
                description1: "",
                description2: "",
            },
            error: false,
            errorMessage: "",
            transferParams: this.props.route?.params?.transferParams ?? {},

            // s2u/tac
            showS2UModal: false,
            s2uToken: "",
            s2uServerDate: "",
            s2uTransactionType: "",
            s2uTransactionReferenceNumber: "",
            s2uTransactionDetails: [],
            showTACModal: false,
            tacParams: {},
            transferApiParams: {},
            tacTransactionReferenceNumber: "",
            tacServerDate: "",
            userKeyedInTacValue: "",

            // RSA
            showRSALoader: false,
            showRSAChallengeQuestion: false,
            rsaChallengeQuestion: "",
            showRSAError: false,
            challengeRequest: {},
            rsaCount: 0,

            // form data
            paymentDetailsText: null,

            //discard modal
            close: false,
        };
    }

    /***
     * componentDidMount
     */
    async componentDidMount() {
        console.log("[BakongConfirmation] >> [componentDidMount] : ");
        this._checkS2UStatus();

        this.focusSubscription = this.props.navigation.addListener("focus", () => {
            console.log("[BakongConfirmation] >> [componentDidMount] focusSubscription : ");
            this.updateData();

            if (this.props.route.params.isS2URegistrationAttempted)
                this._handlePostS2URegistration();
        });
    }

    /***
     * componentWillUnmount
     * Handle Screen UnMount Event
     */
    componentWillUnmount() {
        console.log("[BakongConfirmation] >> [componentWillUnmount] : ");
        this.focusSubscription();
    }

    // Firebase analytics
    _logAnalyticsConfirmation = () => {
        const { transferParams } = this.state;
        const isFav = transferParams?.favorite ?? false;

        try {
            logEvent("confirmation_details", {
                [FA_SCREEN_NAME]: "M2U_TRF_Overseas_Bakong_6Confirmation",
                ["date_paid"]: "Today",
                ["transfer_mode"]: "Bakong_Transfer",
                ["service_fee"]: "RM10.00",
                ["identifier"]: "Mobile",
                ["mobile_prefix"]: "+855",
                ["nationality"]: transferParams.recipientNationality,
                ["country"]: transferParams.addressCountry,
                ["purpose"]: transferParams.purpose,
                ["subpurpose"]: transferParams.subpurpose,
                ["currency_selected"]: transferParams.amountCurrency,
                ["transaction_type"]: isFav ? "Favorite" : "Open",
                ["amount_entered"]: `${
                    transferParams.amountCurrency === "MYR" ? "RM" : transferParams.amountCurrency
                } ${transferParams.amountValue}`,
                ["standardised_amount_usd"]:
                    transferParams.amountCurrency === "MYR"
                        ? transferParams.contraAmount
                        : transferParams.amountValue,
                ["standardised_amount_myr"]:
                    transferParams.amountCurrency === "MYR"
                        ? transferParams.amountValue
                        : transferParams.contraAmount,
                // ["reference_id"]: refId ?? "NA",
            });
        } catch (error) {
            ErrorLogger(error);
            console.log(
                "[BakongConfirmation][_logAnalyticsConfirmation] failed to log analytics with error: ",
                error
            );
        }
    };

    // ********* //
    // S2U START //
    // ********* //
    _handlePostS2URegistration = async () => {
        const { flow } = await checks2UFlow(bakongS2uTxnCode, this.props.getModel);
        const {
            route: {
                params: { isS2URegistrationAttempted },
            },
            navigation: { goBack },
        } = this.props;
        if (flow === S2UFlowEnum.s2uReg && isS2URegistrationAttempted) goBack();
    };

    _checkS2UStatus = async () => {
        const { flow } = await checks2UFlow(bakongS2uTxnCode, this.props.getModel);

        const { transferParams } = this.state;
        const isFav = transferParams?.favorite ?? false;
        const favFlag = transferParams?.favFlag ?? "";

        // if it's not a fav txn && flow is s2u register, go to s2u registration flow
        if (!isFav && flow === SECURE2U_COOLING) {
            const {
                navigation: { navigate },
            } = this.props;
            navigateToS2UCooling(navigate);
        } else if (!isFav && flow === S2UFlowEnum.s2uReg) {
            const {
                navigation: { setParams, navigate },
            } = this.props;
            setParams({ isS2URegistrationAttempted: true });
            navigate(ONE_TAP_AUTH_MODULE, {
                screen: "Activate",
                params: {
                    flowParams: {
                        success: {
                            stack: "fundTransferModule",
                            screen: "BakongConfirmation",
                        },
                        fail: {
                            stack: "fundTransferModule",
                            screen: "TransferTabScreen",
                        },
                        params: { ...this.props.route.params },
                    },
                },
            });
        } else if (!isFav && flow === S2UFlowEnum.tac) {
            showInfoToast({ message: SECURE2U_IS_DOWN });
        }

        // Favourite check
        console.tron.log("[_checkS2UStatus] fav check:", transferParams);
        // favFlag: 1 - first time txn, 0 - subsequent txn
        if (isFav && favFlag === "1") {
            // first time fav
            showSuccessToast({
                message: FIRST_TIME_FAVOURITES,
            });
        }
    };

    _getTransactionCode = () => {
        const {
            route: {
                params: { isTopUpConfirmation, isIncompleteRemoval },
            },
        } = this.props;
        if (isTopUpConfirmation) return 19;
        else if (isIncompleteRemoval) return 21;
        else return 20;
    };

    _generateS2UTransactionDetails = (serverDate) => {
        const { transferParams } = this.state;
        console.log("[_generateS2UTransactionDetails] transferParams:", transferParams);
        const { fromAccountName, fromAccountNo } = transferParams.fromAccountData;
        const { name } = transferParams;

        const formattedSelectedAccountName = `${fromAccountName}\n${formateAccountNumber(
            fromAccountNo.replace(/\s/g, ""),
            12
        )}`;

        const s2uTransactionDetails = [
            {
                label: "To",
                value: name,
            },
            {
                label: "From",
                value: formattedSelectedAccountName,
            },
            { label: "Transaction Type", value: "Bakong Transfer" },
            {
                label: "Date",
                value: serverDate,
            },
        ];

        console.tron.log(
            "[_generateS2UTransactionDetails] s2uTransactionDetails",
            s2uTransactionDetails
        );

        this.setState({
            s2uTransactionDetails,
        });
    };

    // ********* //
    // S2U   END //
    // ********* //

    /***
     * updateData
     * Update Screen Data upon screen focused
     */
    async updateData() {
        const transferParams = this.props.route.params.transferParams;
        console.log("[BakongConfirmation] >> [updateData] transferParams==> ", transferParams);

        const screenData = {
            image: transferParams.image,
            name: "+855 " + formatBakongMobileNumbers(transferParams.mobileNo),
            description1: transferParams.name,
            description2: transferParams.transactionTo,
        };
        console.log("[BakongConfirmation] >> [updateData] screenData ==> ", screenData);

        this.setState(
            {
                transferParams,
                screenData,
            },
            () => this._logAnalyticsConfirmation()
        );

        console.tron.log(
            "[BakongConfirmation] >> [updateData] transferParams ==> ",
            transferParams
        );
    }

    doneClick = async () => {
        console.log("[BakongConfirmation] >> [doneClick] : ");
        this.setState({ loader: true });

        const { transferParams } = this.state;
        const { fromAccountData } = transferParams;
        const { fromAccountNo, fromAccountCode } = fromAccountData;
        const { getModel } = this.props;

        const { flow, secure2uValidateData } = await checks2UFlow(
            bakongS2uTxnCode,
            this.props.getModel,
            this.props.updateModel
        );
        const { deviceInformation, deviceId } = getModel("device");
        const mobileSDKData = getDeviceRSAInformation(deviceInformation, DeviceInfo, deviceId);

        const isFav = transferParams?.favorite ?? false;
        const favFlag = transferParams?.favFlag ?? "";

        const payload = {
            address: {
                addressLine1: transferParams.addressLine1,
                addressLine2: transferParams.addressLine2,
                country: transferParams.addressCountry,
            },
            idNo: transferParams.recipientIdNumber,
            idType: transferParams.recipientIdType === "NID" ? "NATIONAL_ID" : "PASSPORT",
            mobileNo: transferParams.inquiryData.phone,
            mobileSDKData,
            fromAccountNo: fromAccountNo.replace(/\s/g, ""),
            fromAccountCode: fromAccountCode,
            nationality: transferParams.recipientNationality,
            recipientName: transferParams.inquiryData.name,
            transferAmount: numeral(transferParams.amountValue).value(),
            transferCurrency: transferParams.amountCurrency,
            transferType: "BANKING_TRANSFER",
            type: isFav ? "FAVORITE" : "OPEN",
            reference: transferParams.recipientRef,
            paymentDetails: transferParams.paymentDetails,
            contraAmount: transferParams.contraAmount,
            recipientReference: transferParams.recipientRef,
        };

        if (isFav) {
            // FAV TRANSFER
            if (favFlag === "1") {
                // FIRST-TIME FAV TRANSFER
                // do tac flow first
                console.tron.log("[BakongConfirmation][doneClick] flow: first-time fav txn - TAC");
                this._handleTACTransfer({ ...payload, twoFAType: "TAC", type: "FAVORITE" });
            } else {
                // SUBSEQUENT FAV TRANSFER
                // SKIP TAC flow and call txn api
                console.tron.log("[BakongConfirmation][doneClick] flow: subsequent fav txn");
                this.setState({ transferApiParams: payload, loader: true }, () => {
                    this._onTACDone("");
                });
            }
        } else if (flow === S2UFlowEnum.s2u) {
            // S2U OPEN TRANSFER
            console.tron.log("[BakongConfirmation][doneClick] flow: open transfer - S2U");
            const twoFAS2uType =
                secure2uValidateData?.pull === "N" ? "SECURE2U_PUSH" : "SECURE2U_PULL"; //s2u interops changes
            this._handleS2UTransfer({
                ...payload,
                twoFAType: twoFAS2uType,
                smsTac: "",
                type: "OPEN",
                secure2uValidateData,
            });
        } else {
            // TAC OPEN TRANSFER
            console.tron.log("[BakongConfirmation][doneClick] flow: open transfer - TAC");
            this._handleTACTransfer({ ...payload, twoFAType: "TAC", type: "OPEN" });
        }
    };

    _handleS2UTransfer = async (payload) => {
        try {
            // Save transfer api params into state in case needed in RSA flow later.
            this.setState({ transferApiParams: payload });

            this._logAnalyticsEvent("M2U_TRF_Overseas_Bakong_7.2S2U");

            // Make transfer api call
            const request = await this._transferFundToBakong(payload);
            if (request?.status === 200) {
                const serverDate = request?.data?.serverDate ?? "N/A";
                this._generateS2UTransactionDetails(request.data.serverDate);
                this.setState({
                    showS2UModal: true,
                    s2uToken: request.data.pollingToken,
                    s2uServerDate: serverDate,
                    s2uTransactionType: "Bakong Transfer",
                    s2uTransactionReferenceNumber:
                        request.data?.formattedTransactionRefNumber ??
                        request.data?.transactionRefNumber ??
                        "N/A",
                    showRSAChallengeQuestion: false,
                    secure2uValidateData: payload.secure2uValidateData,
                });
                this.transactionDetails = payload;
            } else {
                // Go to Acknowledgement with failure message
                const refID =
                    request.data?.formattedTransactionRefNumber ??
                    request.data?.refId ??
                    request.data?.transactionRefNumber ??
                    "N/A";

                this.props.navigation.navigate("BakongAcknowledgement", {
                    errorMessage: request.message,
                    isTransferSuccessful: false,
                    refId: refID,
                    transferDetailsData: [
                        {
                            title: REFERENCE_ID,
                            value: refID,
                        },
                        {
                            title: DATE_AND_TIME,
                            value: request.data?.serverDate ?? "N/A",
                        },
                    ],
                    ...this.getCampaignInfo(),
                });
            }
        } catch (error) {
            const status = error?.status ?? 0;
            if (status === 428 || status === 423 || status === 422) {
                this._handleRSAFailure(error);
                return;
            }
            this._handleStateOnTransferApiCallException(error);
        } finally {
            this.setState({
                loader: false,
            });
        }
    };

    _handleTACTransfer = async (payload) => {
        console.tron.log("[_handleTACTransfer] payload:", payload);

        //Log to analytics
        this._logAnalyticsEvent("M2U_TRF_Overseas_Bakong_7.1TAC");

        this.setState({
            showTACModal: true,
            loader: true,

            transferApiParams: {
                ...payload,
            },
            tacParams: {
                accCode: payload.fromAccountCode,
                amount: payload.transferAmount,
                fromAcctNo: payload.fromAccountNo.substring(0, 12),
                payeeName: payload.recipientName,
                fundTransferType: "BAKONG_OPEN_PAYMENT",
                bakongMobileNo: payload.mobileNo,
                type: payload.type ?? "OPEN",
            },
        });
        this.transactionDetails = payload;
    };

    _hideTACModal = () => {
        this.setState({
            showTACModal: false,
            loader: false,
        });
    };

    _onTACDone = async (tac) => {
        console.log("[BakongConfirmation] >> [_onTACDone] transferParams");

        // Retrieve reload params and override TAC values
        const { transferApiParams, transferParams } = this.state;

        // Call Transfer API
        try {
            const request = await this._transferFundToBakong({
                ...transferApiParams,
                tacNo: tac,
            });

            this._hideTACModal();
            this.setState({ showRSAChallengeQuestion: false, userKeyedInTacValue: tac });

            console.log("[BakongConfirmation] >> [_onTACDone] success response:", request);

            const refID =
                request?.data?.formattedTransactionRefNumber ??
                request?.data?.refId ??
                request?.data?.transactionRefNumber ??
                "N/A";

            // Success, go to acknowledgement screen with transfer data
            this.props.navigation.navigate("BakongAcknowledgement", {
                transferParams: { ...transferParams },
                transactionDetails: request.data,
                isTransferSuccessful: request.status === 200,
                errorMessage: request?.message ?? "N/A",
                refId: refID,
                transferDetailsData: [
                    {
                        title: REFERENCE_ID,
                        value: refID,
                    },
                    { title: DATE_AND_TIME, value: request?.data?.serverDate ?? "N/A" },
                ],
                ...this.getCampaignInfo(),
            });
        } catch (error) {
            console.log("[BakongConfirmation] >> [_onTACDone] error:", error);
            this._hideTACModal();
            this.setState({ showRSAChallengeQuestion: false, userKeyedInTacValue: tac }, () => {
                const status = error?.status ?? 0;
                if (status === 428 || status === 423 || status === 422) {
                    // Failed because of RSA
                    this._handleRSAFailure(error);
                    return;
                }
                // Failed for other reasons
                this._handleStateOnTransferApiCallException(error);
            });
        }
    };

    _onS2UConfirmation = async (s2uResponse) => {
        console.log("[_onS2UConfirmation] s2uResponse:", s2uResponse);
        const { s2uServerDate, s2uTransactionReferenceNumber, transferParams } = this.state;
        const serverDate = s2uServerDate;
        const transactionReferenceNumber = s2uTransactionReferenceNumber;
        this.setState({
            showS2UModal: false,
            s2uToken: "",
            s2uServerDate: "",
            s2uTransactionType: "",
            s2uTransactionReferenceNumber: "",
        });

        const refID = transactionReferenceNumber ?? "N/A";

        const status = s2uResponse?.s2uSignRespone?.status?.toUpperCase?.();
        const statusDescription = s2uResponse?.s2uSignRespone?.statusDescription ?? "";

        let message = `${
            status === "M201" ? "Transaction" : "Payment"
        } ${statusDescription.toLowerCase()}`;

        if (status === "M408") message = `${statusDescription}`;

        // Success, go to acknowledgement screen with transfer data
        this.props.navigation.navigate("BakongAcknowledgement", {
            transferParams: { ...transferParams },
            transactionDetails: s2uResponse.s2uSignRespone,
            isTransferSuccessful: s2uResponse.transactionStatus,
            refId: refID,
            message,
            errorMessage: s2uResponse.s2uSignRespone?.text ?? "N/A",
            transferDetailsData: [
                {
                    title: REFERENCE_ID,
                    value: refID,
                },
                { title: DATE_AND_TIME, value: serverDate ?? "N/A" },
            ],
            ...this.getCampaignInfo(),
        });
    };

    _transferFundToBakong = async (payload) => {
        console.log("[BakongConfirmation] >> [_transferFundToBakong] payload: ", payload);
        try {
            return await bakongTransferAPI("/payment/transfer", payload);
        } catch (error) {
            ErrorLogger(error);
            throw error;
        }
    };

    _handleStateOnTransferApiCallException = (error) => {
        console.tron.log(
            "[BakongConfirmation] >> [_handleStateOnTransferApiCallException] error:",
            error
        );
        console.tron.log(
            "[BakongConfirmation] >> [_handleStateOnTransferApiCallException] states:",
            this.state
        );

        this.setState({ showRSAChallengeQuestion: false }, () => {
            const refID =
                error?.error?.formattedTransactionRefNumber ??
                error?.error?.refId ??
                error?.error?.transactionRefNumber ??
                "N/A";

            this.props.navigation.navigate("BakongAcknowledgement", {
                errorMessage: error?.error?.message ?? "N/A",
                refId: refID,
                isTransferSuccessful: false,
                transferDetailsData: [
                    {
                        title: REFERENCE_ID,
                        value: refID,
                    },
                    {
                        title: DATE_AND_TIME,
                        value: error?.error?.serverDate ?? "N/A",
                    },
                ],
                ...this.getCampaignInfo(),
            });
        });
    };

    _onTacModalCloseButtonPressed = () => this.setState({ showTACModal: false, loader: false });

    // RSA START
    _handleRSAFailure = (error) => {
        console.tron.log("_handleRSAFailure", error);
        if (error.status === 428)
            this.setState((prevState) => ({
                challengeRequest: {
                    ...prevState.challengeRequest,
                    challenge: error.error.challenge,
                },
                showRSAChallengeQuestion: true,
                showRSALoader: false,
                rsaChallengeQuestion: error.error.challenge.questionText,
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
            const { getModel } = this.props;
            const { transferApiParams, transferParams } = this.state;
            const { flow, secure2uValidateData } = await checks2UFlow(bakongS2uTxnCode, getModel);

            const payload = {
                ...transferApiParams,
                challenge: { ...this.state.challengeRequest.challenge, answer },
            };

            const isFav = transferParams?.favorite ?? false;
            const favFlag = transferParams?.favFlag ?? "";

            if (isFav) {
                // FAV TRANSFER
                if (favFlag === "1") {
                    // first time fav transfer - do tac flow first
                    console.tron.log(
                        "[_handleRSAChallengeQuestionAnswered] flow: first-time fav txn - TAC"
                    );
                    // this._handleTACTransfer({ ...payload, twoFAType: "TAC", type: "FAVORITE" });
                    this._handleTACTransferToCreatorPostRSA({ ...payload });
                } else {
                    // subsequent fav transfer - SKIP TAC flow and call txn api
                    console.tron.log(
                        "[_handleRSAChallengeQuestionAnswered] flow: subsequent fav txn"
                    );
                    this.setState({ transferApiParams: payload, loader: true }, () => {
                        this._onTACDone("");
                    });
                }
            } else if (flow === S2UFlowEnum.s2u) {
                // S2U OPEN TRANSFER
                console.tron.log("[_handleRSAChallengeQuestionAnswered] flow: open transfer - S2U");
                const twoFAS2uType =
                    secure2uValidateData?.pull === "N" ? "SECURE2U_PUSH" : "SECURE2U_PULL"; //s2u interops changes
                this._handleS2UTransfer({
                    ...payload,
                    twoFAType: twoFAS2uType,
                    smsTac: "",
                    type: "OPEN",
                    secure2uValidateData,
                });
            } else {
                // TAC OPEN TRANSFER
                console.tron.log("[_handleRSAChallengeQuestionAnswered] flow: open transfer - TAC");
                this._handleTACTransferToCreatorPostRSA({ ...payload });
                // this._handleTACTransfer({ ...payload, twoFAType: "TAC", type: "OPEN" });
            }

            // OLD LOGIC
            // if (flow === S2UFlowEnum.s2u) {
            //     const twoFAS2uType =
            //         secure2uValidateData?.pull === "N" ? "SECURE2U_PUSH" : "SECURE2U_PULL"; //s2u interops changes
            //     this._handleS2UTransfer({
            //         ...payload,
            //         twoFAType: twoFAS2uType,
            //         smsTac: "",
            //     });
            // } else this._handleTACTransferToCreatorPostRSA({ ...payload, twoFAType: "TAC" });
        });
    };

    _handleRSAChallengeQuestionClosed = () => this.setState({ showRSAError: false });

    _handleTACTransferToCreatorPostRSA = async (payload) => {
        console.tron.log("_handleTACTransferToCreatorPostRSA");
        const { userKeyedInTacValue, transferParams } = this.state;
        try {
            const request = await this._transferFundToBakong({
                ...payload,
                tacNo: userKeyedInTacValue,
            });
            this._hideTACModal();
            this.setState({
                showRSAChallengeQuestion: false,
            });

            // Success, go to acknowledgement screen with transfer data
            const refID =
                request?.data?.formattedTransactionRefNumber ??
                request?.data?.refId ??
                request?.data?.transactionRefNumber ??
                "N/A";
            this.props.navigation.navigate("BakongAcknowledgement", {
                transferParams: { ...transferParams },
                transactionDetails: request.data,
                isTransferSuccessful: request.status === 200,
                errorMessage: request?.message ?? "N/A",
                refId: refID,
                transferDetailsData: [
                    {
                        title: REFERENCE_ID,
                        value: refID,
                    },
                    { title: DATE_AND_TIME, value: request?.data?.serverDate ?? "N/A" },
                ],
                ...this.getCampaignInfo(),
            });
        } catch (error) {
            const status = error?.status ?? 0;
            if (status === 428 || status === 423 || status === 422) {
                this._handleRSAFailure(error);
                return;
            }
            this._handleStateOnTransferApiCallException(error);
        }
    };
    // RSA END

    _onBackPress = () => {
        console.log("[BakongConfirmation] >> [_onBackPress] : ");
        // this.props.navigation.goBack();
        const { transferParams } = this.state;
        this.props.navigation.navigate("BakongSummary", {
            transferParams,
        });
    };

    _onPressClose = () => {
        this.setState({ close: true });
    };

    _toggleCloseModal = () => {
        this.setState({ close: !this.state.close });
    };

    _cancelTransfer = () => {
        this.setState({ close: false });

        // Go back to transfer screen
        this.props.navigation.navigate(FUNDTRANSFER_MODULE, {
            screen: TRANSFER_TAB_SCREEN,
            params: {
                screenDate: { routeFrom: "Dashboard" },
                index: 3,
            },
        });
    };

    /***
     * _onPaymentDetailsTextChange
     * Notes / Payment Details text change listener
     */
    _onPaymentDetailsTextChange = (text) => {
        this.setState({ paymentDetailsText: text ? text : null });
    };

    /***
     *_onPaymentDetailsTextDone
     * Notes / Payment Details keyboard Done click listener
     */
    _onPaymentDetailsTextDone = () => {
        // if (text != null && text != undefined && text != "" && text.length >= 1) {
        //     let validate = getDayDateFormat(text);
        //     if (!validate) {
        //         this.setState({ paymentDetailsTextError: true });
        //     }
        // }
    };

    _navigateToExternalUrlScreen = ({ url, title }) => {
        this.props.navigation.navigate(DASHBOARD_STACK, {
            screen: "ExternalUrl",
            params: {
                url,
                title,
            },
        });
    };

    _onPressTncLink = () =>
        this._navigateToExternalUrlScreen({
            url: "https://www.maybank2u.com.my/iwov-resources/pdf/personal/services/funds_transfer/mbb-bakong-transfer_tnc.pdf",
            title: "Terms & Conditions",
        });

    _onPressFeaLink = () =>
        this._navigateToExternalUrlScreen({
            url: "https://www.bnm.gov.my/fep",
            title: "FEA Requirement",
        });

    _onPressAmount = () => {
        const { transferParams } = this.state;

        this.props.navigation.navigate("BakongEnterAmount", {
            transferParams,
            confirmation: true,
        });
    };

    _onPressRecipientRef = () => {
        const { transferParams } = this.state;

        this.props.navigation.navigate("BakongEnterPurpose", {
            transferParams,
            confirmation: true,
        });
    };

    getCampaignInfo = () => {
        const {
            misc: { isTapTasticReady, tapTasticType },
            s2w: { txnTypeList },
        } = this.props.getModel(["misc", "s2w"]);
        return { isTapTasticReady, txnTypeList, tapTasticType };
    };

    _logAnalyticsEvent = (screenName) => {
        logEvent(FA_VIEW_SCREEN, {
            [FA_SCREEN_NAME]: screenName,
        });
    };

    render() {
        const {
            showErrorModal,
            errorMessage,
            loader,
            transferParams,
            // S2U / TAC
            s2uToken,
            s2uTransactionDetails,
            showS2UModal,
            showTACModal,
            tacParams,
            secure2uValidateData,
            // RSA
            showRSAChallengeQuestion,
            showRSAError,
            showRSALoader,
            rsaChallengeQuestion,
        } = this.state;

        return (
            <React.Fragment>
                <ScreenContainer
                    backgroundType="color"
                    showErrorModal={showErrorModal}
                    errorMessage={errorMessage}
                    showLoaderModal={loader}
                    // showOverlay={}
                    backgroundColor={MEDIUM_GREY}
                    // analyticScreenName="M2U_TRF_Overseas_Bakong_Confirmation"
                >
                    <ScreenLayout
                        header={
                            <HeaderLayout
                                headerCenterElement={
                                    <Typography
                                        fontSize={16}
                                        fontWeight="600"
                                        lineHeight={19}
                                        text="Confirmation"
                                    />
                                }
                                headerLeftElement={<HeaderBackButton onPress={this._onBackPress} />}
                                headerRightElement={
                                    <HeaderCloseButton onPress={this._onPressClose} />
                                }
                            />
                        }
                        useSafeArea
                        paddingHorizontal={0}
                        paddingBottom={0}
                    >
                        <React.Fragment>
                            <KeyboardAvoidingView
                                style={{ flex: 1 }}
                                behavior={Platform.OS === "ios" ? "position" : "padding"}
                            >
                                <ScrollView showsHorizontalScrollIndicator={false}>
                                    <View style={Styles.container}>
                                        <View style={Styles.headerContainer}>
                                            <View style={Styles.headerImageContainer}>
                                                <CircularLogoImage
                                                    source={this.state.screenData.image}
                                                    isLocal={false}
                                                />
                                            </View>
                                            {/* <AccountDetailsView
                                            data={this.state.screenData}
                                            base64={true}
                                        /> */}
                                            <Typography
                                                fontSize={14}
                                                fontWeight="600"
                                                fontStyle="normal"
                                                letterSpacing={0}
                                                lineHeight={18}
                                                color={BLACK}
                                                text={this.state.screenData.description1}
                                            />

                                            <Typography
                                                fontSize={14}
                                                fontWeight="normal"
                                                fontStyle="normal"
                                                letterSpacing={0}
                                                lineHeight={20}
                                                color={BLACK}
                                                text={this.state.screenData.name}
                                                style={Styles.lblSubTitle}
                                            />

                                            <Typography
                                                fontSize={24}
                                                fontWeight="700"
                                                fontStyle="normal"
                                                letterSpacing={0}
                                                lineHeight={31}
                                                color={BLACK}
                                                text={`${
                                                    transferParams.amountCurrency === "MYR"
                                                        ? "RM"
                                                        : transferParams.amountCurrency
                                                } ${transferParams.amountValue}`}
                                            />

                                            <Typography
                                                fontSize={14}
                                                fontWeight="normal"
                                                fontStyle="normal"
                                                letterSpacing={0}
                                                lineHeight={18}
                                                color={BLACK}
                                                text={`${
                                                    transferParams.amountCurrency !== "MYR"
                                                        ? "RM"
                                                        : "USD"
                                                } ${transferParams.contraAmount}`}
                                                style={Styles.lblForeignCurrency}
                                            />

                                            <Typography
                                                fontSize={14}
                                                fontWeight="normal"
                                                fontStyle="normal"
                                                letterSpacing={0}
                                                lineHeight={18}
                                                color={BLACK}
                                                text={`USD 1 = MYR ${transferParams.allinRate}`}
                                                style={Styles.lblForeignCurrency}
                                            />
                                        </View>

                                        <View style={Styles.formBodyContainer}>
                                            {/* Date */}
                                            <View style={Styles.rowListContainer}>
                                                <View style={Styles.rowListItemLeftContainer}>
                                                    <Typography
                                                        fontSize={14}
                                                        lineHeight={19}
                                                        textAlign="left"
                                                        text="Date"
                                                    />
                                                </View>
                                                <View style={Styles.rowListItemRightContainer}>
                                                    <Typography
                                                        fontSize={14}
                                                        fontWeight="600"
                                                        lineHeight={18}
                                                        textAlign="right"
                                                        text="Today"
                                                    />
                                                </View>
                                            </View>

                                            {/* Transfer mode */}
                                            <View style={Styles.rowListContainer}>
                                                <View style={Styles.rowListItemLeftContainer}>
                                                    <Typography
                                                        fontSize={14}
                                                        lineHeight={19}
                                                        textAlign="left"
                                                        text="Transfer mode"
                                                    />
                                                </View>
                                                <View style={Styles.rowListItemRightContainer}>
                                                    <Typography
                                                        fontSize={14}
                                                        fontWeight="600"
                                                        lineHeight={18}
                                                        textAlign="right"
                                                        text="Bakong Transfer"
                                                    />
                                                </View>
                                            </View>

                                            {/* From account */}
                                            <View style={Styles.rowListContainer}>
                                                <View style={Styles.rowListItemLeftContainer}>
                                                    <Typography
                                                        fontSize={14}
                                                        lineHeight={19}
                                                        textAlign="left"
                                                        text="From account"
                                                    />
                                                </View>
                                                <View style={Styles.rowListItemRightContainer}>
                                                    <Typography
                                                        fontSize={14}
                                                        fontWeight="600"
                                                        lineHeight={18}
                                                        textAlign="right"
                                                        text={`${
                                                            transferParams.fromAccountData
                                                                .fromAccountName
                                                        }\n${formateAccountNumber(
                                                            transferParams.fromAccountData.fromAccountNo.replace(
                                                                /\s/g,
                                                                ""
                                                            ),
                                                            12
                                                        )}`}
                                                    />
                                                </View>
                                            </View>

                                            {/* Service fee */}
                                            <View style={Styles.rowListContainer}>
                                                <View style={Styles.rowListItemLeftContainer}>
                                                    <Typography
                                                        fontSize={14}
                                                        lineHeight={19}
                                                        textAlign="left"
                                                        text="Service fee"
                                                    />
                                                </View>
                                                <View style={Styles.rowListItemRightContainer}>
                                                    <Typography
                                                        fontSize={14}
                                                        fontWeight="600"
                                                        lineHeight={18}
                                                        textAlign="right"
                                                        text={`RM ${transferParams.serviceCharge}`}
                                                    />
                                                </View>
                                            </View>

                                            {/* Mobile no. */}
                                            <View style={Styles.rowListContainer}>
                                                <View style={Styles.rowListItemLeftContainer}>
                                                    <Typography
                                                        fontSize={14}
                                                        lineHeight={19}
                                                        textAlign="left"
                                                        text="Mobile number"
                                                    />
                                                </View>
                                                <View style={Styles.rowListItemRightContainer}>
                                                    <Typography
                                                        fontSize={14}
                                                        fontWeight="600"
                                                        lineHeight={18}
                                                        textAlign="right"
                                                        text={this.state.screenData.name}
                                                    />
                                                </View>
                                            </View>

                                            {/* Receiving bank name */}
                                            <View style={Styles.rowListContainer}>
                                                <View style={Styles.rowListItemLeftContainer}>
                                                    <Typography
                                                        fontSize={14}
                                                        lineHeight={19}
                                                        textAlign="left"
                                                        text="Receiving Bank Name"
                                                    />
                                                </View>
                                                <View style={Styles.rowListItemRightContainer}>
                                                    <Typography
                                                        fontSize={14}
                                                        fontWeight="600"
                                                        lineHeight={18}
                                                        textAlign="right"
                                                        text={
                                                            this.state.transferParams.inquiryData
                                                                ?.bankName ?? "Bakong Wallet"
                                                        }
                                                    />
                                                </View>
                                            </View>

                                            {/* Nationality */}
                                            <View style={Styles.rowListContainer}>
                                                <View style={Styles.rowListItemLeftContainer}>
                                                    <Typography
                                                        fontSize={14}
                                                        lineHeight={19}
                                                        textAlign="left"
                                                        text="Nationality"
                                                    />
                                                </View>
                                                <View style={Styles.rowListItemRightContainer}>
                                                    <Typography
                                                        fontSize={14}
                                                        fontWeight="600"
                                                        lineHeight={18}
                                                        textAlign="right"
                                                        text={
                                                            this.state.transferParams
                                                                .recipientNationality
                                                        }
                                                    />
                                                </View>
                                            </View>

                                            {/* ID Type */}
                                            <View style={Styles.rowListContainer}>
                                                <View style={Styles.rowListItemLeftContainer}>
                                                    <Typography
                                                        fontSize={14}
                                                        lineHeight={19}
                                                        textAlign="left"
                                                        text="ID Type"
                                                    />
                                                </View>
                                                <View style={Styles.rowListItemRightContainer}>
                                                    <Typography
                                                        fontSize={14}
                                                        fontWeight="600"
                                                        lineHeight={18}
                                                        textAlign="right"
                                                        text={
                                                            this.state.transferParams
                                                                .recipientIdType === "NID"
                                                                ? "National ID"
                                                                : "Passport"
                                                        }
                                                    />
                                                </View>
                                            </View>

                                            {/* Passport / National ID */}
                                            <View style={Styles.rowListContainer}>
                                                <View style={Styles.rowListItemLeftContainer}>
                                                    <Typography
                                                        fontSize={14}
                                                        lineHeight={19}
                                                        textAlign="left"
                                                        text={
                                                            this.state.transferParams
                                                                .recipientIdType === "NID"
                                                                ? "National ID"
                                                                : "Passport"
                                                        }
                                                    />
                                                </View>
                                                <View style={Styles.rowListItemRightContainer}>
                                                    <Typography
                                                        fontSize={14}
                                                        fontWeight="600"
                                                        lineHeight={18}
                                                        textAlign="right"
                                                        text={
                                                            this.state.transferParams
                                                                .recipientIdNumberMasked
                                                        }
                                                    />
                                                </View>
                                            </View>

                                            {/* Address line 1 */}
                                            <View style={Styles.rowListContainer}>
                                                <View style={Styles.rowListItemLeftContainer}>
                                                    <Typography
                                                        fontSize={14}
                                                        lineHeight={19}
                                                        textAlign="left"
                                                        text="Address line 1"
                                                    />
                                                </View>
                                                <View style={Styles.rowListItemRightContainer}>
                                                    <Typography
                                                        fontSize={14}
                                                        fontWeight="600"
                                                        lineHeight={18}
                                                        textAlign="right"
                                                        text={
                                                            this.state.transferParams.addressLine1
                                                        }
                                                    />
                                                </View>
                                            </View>

                                            {/* Address line 2 */}
                                            <View style={Styles.rowListContainer}>
                                                <View style={Styles.rowListItemLeftContainer}>
                                                    <Typography
                                                        fontSize={14}
                                                        lineHeight={19}
                                                        textAlign="left"
                                                        text="Address line 2"
                                                    />
                                                </View>
                                                <View style={Styles.rowListItemRightContainer}>
                                                    <Typography
                                                        fontSize={14}
                                                        fontWeight="600"
                                                        lineHeight={18}
                                                        textAlign="right"
                                                        text={
                                                            this.state.transferParams.addressLine2
                                                        }
                                                    />
                                                </View>
                                            </View>

                                            {/* Country */}
                                            <View style={Styles.rowListContainer}>
                                                <View style={Styles.rowListItemLeftContainer}>
                                                    <Typography
                                                        fontSize={14}
                                                        lineHeight={19}
                                                        textAlign="left"
                                                        text="Country"
                                                    />
                                                </View>
                                                <View style={Styles.rowListItemRightContainer}>
                                                    <Typography
                                                        fontSize={14}
                                                        fontWeight="600"
                                                        lineHeight={18}
                                                        textAlign="right"
                                                        text={
                                                            this.state.transferParams.addressCountry
                                                        }
                                                    />
                                                </View>
                                            </View>

                                            {/* Purpose */}
                                            <View style={Styles.rowListContainer}>
                                                <View style={Styles.rowListItemLeftContainer}>
                                                    <Typography
                                                        fontSize={14}
                                                        lineHeight={19}
                                                        textAlign="left"
                                                        text="Purpose"
                                                    />
                                                </View>
                                                <View style={Styles.rowListItemRightContainer}>
                                                    <Typography
                                                        fontSize={14}
                                                        fontWeight="600"
                                                        lineHeight={18}
                                                        textAlign="right"
                                                        text={this.state.transferParams.purpose}
                                                    />
                                                </View>
                                            </View>

                                            {/* Sub Purpose */}
                                            <View style={Styles.rowListContainer}>
                                                <View style={Styles.rowListItemLeftContainer}>
                                                    <Typography
                                                        fontSize={14}
                                                        lineHeight={19}
                                                        textAlign="left"
                                                        text="Sub purpose"
                                                    />
                                                </View>
                                                <View style={Styles.rowListItemRightContainer}>
                                                    <Typography
                                                        fontSize={14}
                                                        fontWeight="600"
                                                        lineHeight={18}
                                                        textAlign="right"
                                                        text={this.state.transferParams.subpurpose}
                                                    />
                                                </View>
                                            </View>

                                            {/* Recipient reference */}
                                            <View style={Styles.rowListContainer}>
                                                <View style={Styles.rowListItemLeftContainer}>
                                                    <Typography
                                                        fontSize={14}
                                                        lineHeight={19}
                                                        textAlign="left"
                                                        text="Additional info"
                                                    />
                                                </View>
                                                <View style={Styles.rowListItemRightContainer}>
                                                    <Typography
                                                        fontSize={14}
                                                        fontWeight="600"
                                                        lineHeight={18}
                                                        textAlign="right"
                                                        text={
                                                            this.state.transferParams
                                                                .recipientRef === ""
                                                                ? "N/A"
                                                                : this.state.transferParams
                                                                      .recipientRef
                                                        }
                                                    />
                                                </View>
                                            </View>

                                            {/* Payment details */}
                                            <View style={Styles.rowListContainer}>
                                                <View style={Styles.rowListItemLeftContainer}>
                                                    <Typography
                                                        fontSize={14}
                                                        lineHeight={19}
                                                        textAlign="left"
                                                        text="Payment details"
                                                    />
                                                </View>
                                                <View style={Styles.rowListItemRightContainer}>
                                                    <Typography
                                                        fontSize={14}
                                                        fontWeight="600"
                                                        lineHeight={18}
                                                        textAlign="right"
                                                        text={
                                                            this.state.transferParams
                                                                .paymentDetails === ""
                                                                ? "N/A"
                                                                : this.state.transferParams
                                                                      .paymentDetails
                                                        }
                                                    />
                                                </View>
                                            </View>
                                            <View style={Styles.line} />
                                        </View>

                                        <Typography
                                            fontSize={12}
                                            lineHeight={22}
                                            fontWeight="600"
                                            textAlign="left"
                                            text="Note:"
                                            color={FADE_GREY}
                                        />
                                        <Typography
                                            fontSize={12}
                                            lineHeight={18}
                                            textAlign="left"
                                            text="Money withdrawn from your insured deposit(s) is no longer protected by PIDM if transferred to non PIDM members and products."
                                            color={FADE_GREY}
                                        />

                                        <Typography
                                            fontSize={12}
                                            lineHeight={22}
                                            fontWeight="600"
                                            textAlign="left"
                                            text="Declaration:"
                                            color={FADE_GREY}
                                            style={Styles.lblDeclarationTitle}
                                        />
                                        <Typography
                                            fontSize={12}
                                            lineHeight={18}
                                            textAlign="left"
                                            text="I hereby declare that I have read and understand the terms and conditions set forth below and agree to comply with and be bound by the provision of the said terms and conditions and any amendment to the same which the bank may subsequently introduce."
                                            color={FADE_GREY}
                                        />

                                        <View style={Styles.linksContainer}>
                                            <TouchableOpacity onPress={this._onPressTncLink}>
                                                <Typography
                                                    fontSize={12}
                                                    lineHeight={18}
                                                    textDecorationLine="underline"
                                                    textAlign="left"
                                                    color={BLACK}
                                                    style={{
                                                        textDecorationLine: "underline",
                                                    }}
                                                    text="Terms & Conditions"
                                                />
                                            </TouchableOpacity>

                                            <TouchableOpacity onPress={this._onPressFeaLink}>
                                                <Typography
                                                    fontSize={12}
                                                    lineHeight={18}
                                                    textDecorationLine="underline"
                                                    textAlign="left"
                                                    color={BLACK}
                                                    text="FEA Requirement"
                                                    style={Styles.lblLink2}
                                                />
                                            </TouchableOpacity>
                                        </View>
                                    </View>
                                    <View style={{ flex: 1 }} />
                                </ScrollView>
                            </KeyboardAvoidingView>
                            <FixedActionContainer>
                                <ActionButton
                                    disabled={this.state.disabled}
                                    fullWidth
                                    borderRadius={25}
                                    onPress={this.doneClick}
                                    backgroundColor={YELLOW}
                                    componentCenter={
                                        <Typography
                                            color={BLACK}
                                            text="Transfer Now"
                                            fontSize={14}
                                            fontWeight="600"
                                            lineHeight={18}
                                        />
                                    }
                                />
                            </FixedActionContainer>
                        </React.Fragment>
                    </ScreenLayout>
                </ScreenContainer>
                {showS2UModal && (
                    <Secure2uAuthenticationModal
                        token={s2uToken}
                        amount={
                            transferParams.amountCurrency === "USD"
                                ? transferParams.contraAmount
                                : transferParams.amountValue
                        }
                        onS2UDone={this._onS2UConfirmation}
                        s2uPollingData={secure2uValidateData}
                        transactionDetails={s2uTransactionDetails}
                        extraParams={{
                            metadata: {
                                txnType: "BAKONG_TRANSFER",
                            },
                            txnType: this.getCampaignInfo()?.isTapTasticReady ? "MAEBAKONG" : "",
                        }}
                    />
                )}
                {showTACModal && (
                    <TacModal
                        tacParams={tacParams}
                        onTacClose={this._onTacModalCloseButtonPressed}
                        onGetTacError={this._hideTACModal}
                        validateByOwnAPI={true}
                        validateTAC={this._onTACDone}
                    />
                )}
                <ChallengeQuestion
                    loader={showRSALoader}
                    display={showRSAChallengeQuestion}
                    displyError={showRSAError}
                    questionText={rsaChallengeQuestion}
                    onSubmitPress={this._handleRSAChallengeQuestionAnswered}
                    onSnackClosePress={this._handleRSAChallengeQuestionClosed}
                />
                {this.state.close === true && (
                    <Popup
                        visible={true}
                        onClose={this._toggleCloseModal}
                        title={"Unsaved Changes"}
                        description={
                            "Are you sure you want to leave this page? Any unsaved changes will be discarded."
                        }
                        primaryAction={{
                            text: "Discard",
                            onPress: this._cancelTransfer,
                        }}
                        secondaryAction={{
                            text: "Cancel",
                            onPress: this._toggleCloseModal,
                        }}
                    />
                )}
            </React.Fragment>
        );
    }
}

const Styles = {
    container: {
        flex: 1,
        // alignItems: "flex-start",
        paddingEnd: 24,
        paddingStart: 24,
    },
    bottomView: {
        flexDirection: "column",
        marginTop: 24,
        marginHorizontal: 24,
    },
    accountsFlatlist: {
        overflow: "visible",
    },
    formBodyContainer: {
        alignItems: "center",
        justifyContent: "center",
        marginTop: 26,
        width: "100%",
    },
    transferFromContainer: { paddingBottom: 24 },
    headerContainer: {
        alignItems: "center",
        width: "100%",
    },
    headerImageContainer: {
        marginBottom: 12,
    },
    lblSubTitle: { marginTop: 4, marginBottom: 16 },
    lblForeignCurrency: { marginBottom: 12 },
    lblDeclarationTitle: { marginTop: 16 },
    lblLink2: { marginLeft: 16, textDecorationLine: "underline" },
    linksContainer: {
        flexDirection: "row",
        marginTop: 8,
        marginBottom: 48,
    },
    rowListContainer: {
        flex: 1,
        flexDirection: "row",
        marginTop: 20,
    },
    rowListItemLeftContainer: {
        flex: 0.5,
    },
    rowListItemRightContainer: {
        flex: 0.5,
        alignItems: "flex-end",
        alignContent: "flex-end",
    },
    commonInputConfirmIosText: {
        color: ROYAL_BLUE,
        fontFamily: "montserrat",
        fontSize: 14,
        fontStyle: "normal",
        fontWeight: "600",
        marginTop: 0,
        minWidth: 70,
    },
    commonInputConfirmText: {
        color: ROYAL_BLUE,
        fontFamily: "montserrat",
        fontSize: 14,
        fontStyle: "normal",
        fontWeight: "600",
        marginTop: -13,
        minWidth: 70,
    },
    commonInputConfirm: {
        color: BLACK,
        fontFamily: "montserrat",
        fontSize: 14,
        marginTop: -13,
        minWidth: 70,
    },
    commonInputConfirmIos: {
        color: BLACK,
        fontFamily: "montserrat",
        fontSize: 14,
        marginTop: 0,
        minWidth: 70,
    },
    line: {
        width: "100%",
        marginTop: 24,
        marginBottom: 24,
        borderWidth: StyleSheet.hairlineWidth,
        borderColor: "#cccccc",
        marginHorizontal: 36,
    },
};

export default withModelContext(BakongConfirmation);
