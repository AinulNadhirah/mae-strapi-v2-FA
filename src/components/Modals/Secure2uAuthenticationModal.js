/* eslint-disable camelcase */
import AsyncStorage from "@react-native-community/async-storage";
import Numeral from "numeral";
import PropTypes from "prop-types";
import React, { Component } from "react";
import { View, Image, Text, ScrollView, Dimensions, Modal, StyleSheet } from "react-native";
import RNLibSodiumSdk from "react-native-libsodium-sdk";
import HTML from "react-native-render-html";

import ScreenLayout from "@layouts/ScreenLayout";

import ActionButton from "@components/Buttons/ActionButton";
import ScreenContainer from "@components/Containers/ScreenContainer";
import PollingS2u from "@components/Modals/PollingS2u";
import ChallengeQuestion from "@components/RSA/ChallengeQuestion";
import Typo from "@components/Text";

import { withModelContext } from "@context";

import { secure2uChallengeApi, secure2uSignTransactionApi } from "@services";
import { logEvent } from "@services/analytics";

import { GREY_DARK, WHITE, YELLOW } from "@constants/colors";
import { APPROVE_CHECK, REJECT_CHECK } from "@constants/data";
import {
    APPROVE,
    APP_ID,
    AUTHORISATION_FAILURE,
    AUTHORISATION_WAS_REJECTED,
    COMMON_ERROR_MSG,
    CURRENCY,
    FA_SCREEN_NAME,
    FA_VIEW_SCREEN,
    REJECT,
    S2U_AUTHORISATION,
    S2U_AUTHORISATION_HAS_EXPIRED,
    S2U_VERIFICATION_AUTHORIZATION_EXPIRED,
    SECURE2U_APPROVED,
    SECURE2U_APPROVED_DESC,
    SECURE2U_FAILURE,
    SECURE2U_FAILURE_DESC,
    SECURE_VERIFICATION_AUTHORIZATION_EXPIRED,
    WE_FACING_SOME_ISSUE,
} from "@constants/strings";

import hotp from "@libs/hotp";
import SecureCryptoJS from "@libs/pbkdf2";

import {
    validateChallenge,
    execute,
    decryptS2uPush,
    s2uSdkLogs,
} from "@utils/dataModel/s2uSDKUtil";
import { callS2uMultiOTP } from "@utils/dataModel/utility";
import { updateWalletBalance } from "@utils/dataModel/utilityWallet";

const { height } = Dimensions.get("window");

// local to class only
let local_deviceSecretKey = "";
let local_encryptedChallenge = "";
let local_nonceChallenge = "";
// let local_transactionResponseError = "";
let local_decryptedChallengeSecureJson = {};
// let local_decryptedChallenge = "";
let local_decryptedChallengePlainText = {};
let local_signingDataNonce;
let local_signingDataCipherText;
let decryptedPushMessage = {};

// let props_isSecure2uFlow = false;

class Secure2uAuthenticationModal extends Component {
    static navigationOptions = { title: "", header: null };
    static propTypes = {
        getModel: PropTypes.func.isRequired,
        updateModel: PropTypes.func.isRequired,
        customTitle: PropTypes.string,
        customSignTransactionSubURL: PropTypes.string,
        nonTxnData: PropTypes.object,
        s2uFlow: PropTypes.object,
        amount: PropTypes.number,
        s2uEnablement: PropTypes.bool,
    };
    static defaultProps = {
        customTitle: "",
        customSignTransactionSubURL: "",
        nonTxnData: null,
        s2uFlow: null,
        amount: 0,
        s2uEnablement: false,
    };

    constructor(props) {
        super(props);
        this.state = {
            isLoading: false,
            transactionDetails: [],
            transactionMapperDetails: {},
            formatedAckPushData: [],
            amount: "0",
            s2uPollingFlow: false,
            currentS2uDevice: "",
            title: "",
            subTitle: "",
            s2uEnablement: this.props?.s2uEnablement,
            token: "",

            //RSA
            isRSARequired: false,
            challengeQuestion: "",
            isRSALoader: true,
            RSACount: 0,
            RSAError: false,
            challenge: {},
            action: "",
            isV4Push: false,
        };

        const getModel = this.props.getModel;
        this.ota = getModel("ota");
        this.isSubmit = false;
    }

    async componentDidMount() {
        logEvent(FA_VIEW_SCREEN, { [FA_SCREEN_NAME]: S2U_AUTHORISATION });
        const s2uPollingData = this.props.s2uPollingData;
        const s2uPollingFlow = s2uPollingData?.pull === "N";
        //check s2u registered in RMBP - Polling flow
        if (s2uPollingFlow) {
            //show waiting screen, user will approve in RMBP
            this._updateDataPull(s2uPollingFlow, s2uPollingData);
        } else {
            this._startBackgroundTimer();
            // this._updateDataInScreen();
            this._updateDataInScreenAlways();
        }
    }

    componentWillUnmount() {
        console.log(" componentWillUnmount");
        this._stopBackgroundTimer();
    }

    _startBackgroundTimer = () => {
        //changed timer from 60000 to 50000, as per s2u interops changes
        console.log(" _startBackgroundTimer --> 50000");
        this.s2uTimer = setTimeout(() => {
            console.log(" BackgroundTimer.runBackgroundTimer COMPLETED");
            // props_isSecure2uFlow = false;
            this._stopBackgroundTimer();
            this._secure2uTransactionTimedOut();
        }, 50000);
    };

    _stopBackgroundTimer = async () => {
        console.log(" _stopBackgroundTimer --> ");
        // props_isSecure2uFlow = false;
        clearTimeout(this.s2uTimer);
    };

    _updateDataPull = (pullStatus, s2uPollingData) => {
        const s2uDevice = s2uPollingData?.device_name ?? "";
        this.setState({ s2uPollingFlow: pullStatus, currentS2uDevice: s2uDevice });
    };

    //TODO Need to re-visit after jan for MDIP counter mis-match
    _secure2uTransactionTimedOut = async () => {
        console.log("Secure2uAuthenticationModal _secure2uTransactionTimedOut  ==> ");
        console.log(" _secure2uTransactionTimedOut --> ");

        const signResponse = {
            text: SECURE_VERIFICATION_AUTHORIZATION_EXPIRED,
            statusDescription: SECURE_VERIFICATION_AUTHORIZATION_EXPIRED,
            additionalStatusDescription: null,
            status: "M408",
        };
        if (this.props?.s2uFlow === "PUSH" && this.state.isV4Push) {
            signResponse.text = S2U_VERIFICATION_AUTHORIZATION_EXPIRED;
            this.s2uPushNavigation(signResponse);
            return;
        }
        if (this.props?.s2uEnablement) execute({}); //Making silent call for CCPP record.
        this.props.onS2UDone({
            s2uSignRespone: signResponse,
            executePayload: {
                payload: { message: S2U_VERIFICATION_AUTHORIZATION_EXPIRED },
                code: "M408",
                executed: false,
            },
            transactionStatus: false,
            pushData: this.props?.s2uFlow === "PUSH" ? [...this.state.formatedAckPushData] : [], //added extra param, notification data
        });
    };
    //TODO Need to re-visit after jan for MDIP counter mis-match
    _secure2uTransactionFailedLocal = () => {
        console.log("Secure2uAuthenticationModal secure2uTransactionFailedLocal  ==> ");
        const signResponse = {
            text: WE_FACING_SOME_ISSUE,
            statusDescription: WE_FACING_SOME_ISSUE,
            additionalStatusDescription: null,
            status: "M911",
        };
        this.props.onS2UDone({
            s2uSignRespone: signResponse,
            executePayload: {
                payload: { message: WE_FACING_SOME_ISSUE },
                code: "M911",
                executed: false,
            },
            transactionStatus: false,
        });
    };
    //TODO Need to re-visit after jan for MDIP counter mis-match
    _clearSecure2uLocalRegistration = () => {
        console.log("Secure2uAuthenticationModal _clearSecure2uLocalRegistration  ==> ");
        const updateModel = this.props.updateModel;
        updateModel({
            ota: {
                isEnabled: false,
                mdipCounter: 1,
                hOtp: "",
                tOtp: "",
            },
        });
    };

    // OK
    // _updateDataInScreen = async () => {
    //     console.log(" _updateDataInScreen --> ");
    //     const formatedTodayDate = DataModel.getFormatedTodaysMoments("DD MMM YYYY");
    //     this.setState({ todayDate: formatedTodayDate });
    // };

    // OK
    _updateDataInScreenAlways = async () => {
        local_deviceSecretKey = this.ota.deviceSecretKey; // await AsyncStorage.getItem("deviceSecretKey");
        if (this.props?.s2uFlow === "PUSH") {
            //directly decrypt notification data challenge and nonce
            this.setState({ isLoading: true });
            local_encryptedChallenge = this.props.pushData.encryptedChallenge;
            local_nonceChallenge = this.props.pushData.nonce;
            console.log(local_encryptedChallenge);
            // this._decryptSecure2uChallenge();
            this.decryptV3S2UPush(); //S2U V4
        } else if (this.props.s2uEnablement) {
            this.setState({
                transactionMapperDetails: this.props.transactionDetails,
                amount: this.props.amount,
            });
        } else {
            this.setState(
                {
                    isLoading: true,
                    transactionDetails: this.props.transactionDetails,
                    amount: this.props.amount,
                    title: this._generateTitle(),
                    subTitle: this.props.subTitle,
                },
                () => {
                    this._getTransferChallenge();
                }
            );
        }
    };

    _getTransferChallenge = async () => {
        console.log("_getTransferChallenge");
        const user = this.props.getModel("user");
        const tokenNumber = this.props.token; // this.props.transactionResponseObject.pollingToken
        // ? this.props.transactionResponseObject.pollingToken
        // : this.props.transactionResponseObject.token;

        console.log(" tokenNumber --> ", tokenNumber);
        const { mdipS2uEnable } = this.props.getModel("s2uIntrops");
        //s2u interops changes call v2 url when MDIP migrated
        const subUrl = `2fa/${mdipS2uEnable ? "v2" : "v1"}/secure2u/challenge`;
        let params = {};
        try {
            params = {
                app_id: APP_ID, //???
                application_userid: user.m2uUserName,
                tokenNumber: tokenNumber || "",
                sameDevice: true,
            };
            console.log("secure2uChallengeApi ==> ", params);
            secure2uChallengeApi(subUrl, params)
                .then((response) => {
                    const responseObject = response.data;
                    console.log("/secure2u/challenge ==> ", responseObject);

                    if (responseObject.text && responseObject.text.toLowerCase() === "success") {
                        local_encryptedChallenge = responseObject.payload[0].encryptedChallenge;
                        local_nonceChallenge = responseObject.payload[0].nonce;

                        this._decryptSecure2uChallenge();
                    } else {
                        // local_transactionResponseError = responseObject.text;
                    }
                })
                .catch((error) => {
                    console.log("ERROR ===> ", error);
                });
        } catch (e) {
            console.log("ERROR ===> ", e);
        }
    };

    _decryptSecure2uChallenge = async () => {
        //V3 Push : decrupting the message
        console.log("_decryptSecure2uChallenge Called.................. ==> --> ");
        const publicKey = this.ota.serverPublicKey;
        const message = local_encryptedChallenge;
        const secretKey = local_deviceSecretKey;
        const nonce = local_nonceChallenge;
        console.log("encriptedSeeds  : " + message);
        console.log("deviceSecretKey : " + secretKey);
        console.log("nonceChallenge  : " + nonce);

        try {
            console.log("device Public  : ", publicKey);
            const data = [message, publicKey, nonce, secretKey];

            const msg = await RNLibSodiumSdk.decryptAndVerify(data);

            if (msg) {
                console.log("Decryption after reg Sucessful ==> ", msg);
                if (!Object.prototype.hasOwnProperty.call(msg, "ERROR")) {
                    const tempMsg = msg;
                    // local_decryptedChallenge = tempMsg;
                    console.log(
                        "_decryptSecure2uChallenge Success...........:..........." +
                            JSON.stringify(tempMsg)
                    );
                    console.log(
                        "_decryptSecure2uChallenge Success...........:...........",
                        tempMsg
                    );
                    const plainText = JSON.parse(tempMsg.plainText);
                    local_decryptedChallengePlainText = plainText;
                    console.log(
                        "_decryptSecure2uChallenge plainText...........:..........." +
                            JSON.stringify(plainText)
                    );
                    const secret = JSON.parse(plainText.secret);
                    local_decryptedChallengeSecureJson = secret;
                    console.log(
                        "_decryptSecure2uChallenge secret model issss...........:...........",
                        local_decryptedChallengeSecureJson
                    );
                    console.log(
                        "_decryptSecure2uChallenge secret model issss...........:..........." +
                            JSON.stringify(local_decryptedChallengeSecureJson)
                    );
                }

                if (this.props?.s2uFlow === "PUSH") {
                    //process the decypted notification data
                    this._onPushMapper();
                } else {
                    this.setState({ isLoading: false });
                }
            }

            this.setState({ isLoading: false });
        } catch (error) {
            console.log("perform decryptNverifyNew,  fail ");
        }
    };
    /**
     * Notifcation data contains uiMapper- getting  array of transactions details from MDIP with key value pair
     * Process of amount field
     * Process of camelcase(_Capitalize)
     */
    _onPushMapper = () => {
        const s2uTransactionDetails = [];
        const s2uTransactionAckDetails = [];
        const pushSecureData = local_decryptedChallengeSecureJson;
        let amt = "";
        const requiredPushData = pushSecureData?.uiMapper ?? [];
        console.log(
            "_onPushMapper secret...........:..........." + JSON.stringify(requiredPushData)
        );
        const isV3 = local_decryptedChallengePlainText?.s2uVer;
        if (isV3) {
            //S2U V4
            this.setState({
                transactionMapperDetails: pushSecureData,
                isV4Push: true,
            });
        } else {
            requiredPushData.forEach((k) => {
                if (k.key === "AMOUNT") {
                    amt = k.value;
                } else {
                    if (k.key.indexOf("__") === -1) {
                        s2uTransactionDetails.push({
                            label: this._Capitalize(k.key),
                            value: k.value,
                        });
                    }
                }
                s2uTransactionAckDetails.push({
                    label: this._Capitalize(k.key),
                    value: k.value,
                });
            });

            this.setState({ isLoading: false, amount: amt }, () => {
                console.log("_onPushMapper isLoading");
                this.setState({
                    transactionDetails: s2uTransactionDetails,
                    formatedAckPushData: s2uTransactionAckDetails,
                    title: this._generateTitle(),
                });
            });
        }
    };

    //turn off pushReceived when tap on approve.
    _offPushLaunchFlag() {
        const updateModel = this.props.updateModel;
        updateModel({
            s2uIntrops: {
                pushReceived: false,
            },
        });
    }
    //covert to CamelCase
    _Capitalize = (str) => {
        return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
    };

    /***
     * onPollCallback()
     * Handle Close of Polling page Flow
     */
    onPollCallback = (response) => {
        console.log("response" + response);
        if (response?.text === "M408") {
            this.props.onS2UDone({
                s2uSignRespone: {
                    text: S2U_AUTHORISATION_HAS_EXPIRED,
                    statusDescription: S2U_AUTHORISATION_HAS_EXPIRED,
                    additionalStatusDescription: null,
                    status: "M408",
                },
                transactionStatus: false,
                pushData: null,
            });
        } else if (
            response?.statusCode === "M000" ||
            response?.text?.toLowerCase() === "successful"
        ) {
            this.props.onS2UDone({
                // transactionResponse: this.props.transactionResponseObject,
                s2uSignRespone: response,
                transactionStatus: true,
                pushData: null,
            });
        } else {
            //As per FRD need to hide statusDescription
            if (response?.text === "Unsuccessful" || response?.text === "Failed") {
                response.text = "";
            }

            //Rejected Case
            if (response?.text === "Rejected" && response.status) {
                response.status = response.statusCode === "M201" ? "M201" : response.status;
            }

            this.props.onS2UDone({
                // transactionResponse: this.props.transactionResponseObject,
                s2uSignRespone: response,
                transactionStatus: false,
                pushData: null,
            });
        }
    };

    _onTextChange = (text) => {
        console.log("_onTextChange  ", text);
    };

    _onTextDone = (text) => {
        console.log("_onTextDone  ", text);
    };

    //S2U V4
    decryptV3S2UPush = async () => {
        const data = {
            message: local_encryptedChallenge,
            nonce: local_nonceChallenge,
        };
        const pushMessage = await decryptS2uPush(data);
        console.log("decryptV3S2UPush Push Message : ", pushMessage);
        local_decryptedChallengeSecureJson = pushMessage?.secret;
        local_decryptedChallengePlainText = pushMessage?.decryptPushMessage;
        this.setState({ isLoading: false });
        if (
            pushMessage?.error ||
            !local_decryptedChallengeSecureJson ||
            !local_decryptedChallengePlainText
        ) {
            const error = pushMessage?.error ? pushMessage?.error : pushMessage;
            s2uSdkLogs(error, "S2U SDK Decrypt S2U Push");
            const title = SECURE2U_FAILURE;
            const description = SECURE2U_FAILURE_DESC;
            this.props.onS2UDone({
                s2uSignRespone: { message: "Failed", code: "" },
                transactionStatus: false,
                pushData: [],
                isV4: true,
                v4Details: { title, description, details: [] },
            });
            return;
        }
        if (local_decryptedChallengePlainText?.s2uVer === "V3") {
            decryptedPushMessage = pushMessage?.decryptPushMessage;
        }
        this._onPushMapper();
    };
    //S2U V4
    verifyChallenge = async (action) => {
        const updateModel = this.props.updateModel;
        let mdipCounter = parseInt(this.ota.mdipCounter);
        if (!mdipCounter || isNaN(mdipCounter)) {
            mdipCounter = 1;
            this.updateMdipCounter(1);
        }
        const data = {
            action,
            hOtp: this.ota.hOtp,
            mdipCounter,
        };
        /**
         * Validate Challenge call
         *
         * data: It is a JSON object with action, hotp and mdip counter.
         * decryptedPushMessage: It contains the s2u push data. It is transaction initiation from M2U Web.
         */

        const pushMessage = decryptedPushMessage || "";
        const validateChallengeResult = await validateChallenge(data, pushMessage);
        console.log("validateChallengeResult", validateChallengeResult);
        const incMdipCounter = parseInt(mdipCounter) + 1;
        this.updateMdipCounter(incMdipCounter);
        updateModel({
            ota: {
                mdipCounter: incMdipCounter,
            },
        });
        local_decryptedChallengePlainText = {};
        local_decryptedChallengeSecureJson = {};

        if (this.props?.s2uFlow === "PUSH") {
            //Need to navigate to push flow
            this._offPushLaunchFlag();
            this.s2uPushNavigation(validateChallengeResult);
            return;
        }

        if (validateChallengeResult?.message || !validateChallengeResult?.payload?.token) {
            this.props.onS2UDone({
                executePayload: {
                    payload: {
                        message: validateChallengeResult?.message || COMMON_ERROR_MSG,
                    },
                    code: "",
                    executed: true,
                },
                s2uSignRespone: {
                    text: validateChallengeResult?.message || COMMON_ERROR_MSG,
                    code: "",
                },
                transactionStatus: false,
                pushData: [],
            });
            execute({}); //Making silent call for CCPP record.
            return;
        }
        this.setState({ token: validateChallengeResult?.payload?.token });
        this.executeS2uCall(validateChallengeResult?.payload?.token);
    };

    //S2U V4
    executeS2uCall = async (token) => {
        /**
         * Final sign transaction call
         * NOTE:
         * Do not pass any additinoal parameters here.
         * Do not pass the transaction payload that sent in init() call
         * Params :
         * token: End to end transaction token that generates in init() transaction call
         * transactionPayload: here we using it for CQ purpose only.
         */
        const payload = {
            token,
            transactionPayload: JSON.stringify({ challenge: this.state.challenge }),
        };

        const executeResp = await execute(payload);
        console.log("executeResp : ", executeResp);
        this.setState({ isLoading: false });
        if (executeResp?.message) {
            this.props.onS2UDone({
                executePayload: {
                    payload: { message: executeResp?.message },
                    code: "",
                    executed: true,
                },
                transactionStatus: false,
                pushData: [],
            });
        } else {
            /**
             * executeResp contains : statusCode, statusDesc, payload
             */
            const transactionPayload = executeResp?.payload;
            if (executeResp?.executed && executeResp.statusCode === 0) {
                transactionPayload.executed = true;
                this.props.onS2UDone({
                    executePayload: transactionPayload,
                    transactionStatus: true,
                    pushData: [],
                });
            } else {
                //Failure at MAE BE SDK
                this.handleRSA(executeResp);
            }
        }
    };

    //S2U V4
    handleRSA = (result) => {
        const error = result?.payload && JSON.parse(result.payload);
        const { action } = this.state;
        if (result.statusCode === 428) {
            console.log("RSA Challenge");
            const cqResponse =
                error?.result?.rsaResponse?.challenge ||
                error?.result?.challenge ||
                error?.challenge;
            // Display RSA Challenge Questions if status is 428
            this.setState(() => ({
                challenge: cqResponse,
                isRSARequired: true,
                isRSALoader: false,
                challengeQuestion: cqResponse?.questionText,
                RSACount: this.state.RSACount + 1,
                RSAError: this.state.RSACount > 0,
            }));
        } else if (result.statusCode === 423 || result.statusCode === 422) {
            // Display RSA Account Locked Error Message
            this.setState({
                isRSARequired: false,
                isRSALoader: false,
            });
            this.props.onS2UDone({
                executePayload: {
                    payload: error,
                    code: result.statusCode,
                    executed: true,
                },
                transactionStatus: false,
                pushData: [],
            });
        } else {
            this.props.onS2UDone({
                executePayload: {
                    payload: result.payload ? JSON.parse(result.payload) : result,
                    code: result.statusCode,
                    executed: action !== REJECT_CHECK,
                },
                transactionStatus: false,
                pushData: [],
            });
        }
    };

    s2uPushNavigation = (verifyResult) => {
        decryptedPushMessage = {}; //Reset the s2uv4 push data
        this.setState({ isLoading: false });
        const { transactionMapperDetails, action } = this.state;
        const { acknowledgeMapper } = transactionMapperDetails;
        // status, isV3, title, description, details
        if (verifyResult?.status === "MS3000" && action === APPROVE_CHECK) {
            const transactionPayload = verifyResult?.payload;
            this.props.onS2UDone({
                s2uSignRespone: transactionPayload,
                transactionStatus: true,
                pushData: [],
                isV4: true,
                v4Details: {
                    title: acknowledgeMapper?.successTitle || SECURE2U_APPROVED,
                    description: acknowledgeMapper?.successDescription || SECURE2U_APPROVED_DESC,
                    details: acknowledgeMapper?.body,
                },
            });
        } else {
            let title =
                action === APPROVE_CHECK
                    ? acknowledgeMapper?.failureTitle || SECURE2U_FAILURE
                    : AUTHORISATION_FAILURE;
            let description =
                action === APPROVE_CHECK
                    ? acknowledgeMapper?.failureDescription || SECURE2U_FAILURE_DESC
                    : AUTHORISATION_WAS_REJECTED;
            if (verifyResult?.status === "M408") {
                description = verifyResult?.text;
            } else if (verifyResult?.status === "MS3022") {
                //handle expire scenario in interop
                title = AUTHORISATION_FAILURE;
                description = S2U_VERIFICATION_AUTHORIZATION_EXPIRED;
            }
            this.props.onS2UDone({
                s2uSignRespone: { message: "Expired", code: "" },
                transactionStatus: false,
                pushData: [],
                isV4: true,
                v4Details: { title, description, details: acknowledgeMapper?.body },
            });
        }
    };

    _onApproveClick = () => {
        this.onApproveRejectClick(APPROVE_CHECK);
    };

    _onRejectClick = () => {
        this.onApproveRejectClick(REJECT_CHECK);
    };

    onApproveRejectClick = (action) => {
        if (this.isSubmit) {
            return;
        }
        const { s2uEnablement } = this.state;
        this.setState({ action });
        this.isSubmit = true;
        this._stopBackgroundTimer();
        this.setState(
            {
                isLoading: true,
                s2uEnablement: s2uEnablement || local_decryptedChallengePlainText?.s2uVer === "V3",
            },
            () => {
                //S2U V4
                this.state.s2uEnablement
                    ? this.verifyChallenge(action)
                    : this._performSigningAndEncryption(action);
            }
        );
        //turn off pushReceived when tap on approve.
        if (this.props?.s2uFlow === "PUSH") {
            this._offPushLaunchFlag();
        }
    };

    bin2String = (array) => {
        return String.fromCharCode.apply(String, array);
    };

    _performSigningAndEncryption = async (action) => {
        const challengeValue = local_decryptedChallengePlainText.value;
        const secret = local_decryptedChallengeSecureJson;

        console.log("challengeValue: " + challengeValue);

        if (secret !== null && secret !== "") {
            console.log("secret: " + secret.toString());
        }
        console.log("perform encryption 6,", "start");
        try {
            console.log("hotp: " + this.ota.hOtp);

            const mdipCounter = parseInt(this.ota.mdipCounter);
            console.log("mdipCounter: " + mdipCounter);
            if (mdipCounter != null && mdipCounter >= 1) {
                // eslint-disable-next-line no-unused-vars
                const userAction = action === APPROVE_CHECK ? "0" : "1";

                console.log("hotp+++++  " + this.ota.hOtp);

                /* Step 1 : Create HOTP*/
                const generatedHOTP = hotp(this.ota.hOtp, mdipCounter, "dec6");

                console.log("generatedHOTP: " + generatedHOTP + "   mdipCounter: " + mdipCounter);

                /*Step2 : Create H1*/
                const h1 = SecureCryptoJS.PBKDF2(generatedHOTP, challengeValue, {
                    keySize: 8,
                    iterations: 1,
                });

                console.log("h1+++++  ", h1);

                if (h1 !== null && h1 !== "") {
                    console.log("secret: " + h1.toString());
                }

                /*Step3 : Create H2*/

                // if (h1 !== null && h1 !== "") {
                const h2 = SecureCryptoJS.PBKDF2(
                    h1.toString(),
                    JSON.stringify(local_decryptedChallengeSecureJson),
                    {
                        keySize: 8,
                        iterations: 1,
                    }
                );
                //}

                console.log("h2+++++  ", h2);

                if (h2 !== null && h2 !== "") {
                    console.log("h2+++++str  ", h2.toString());
                }

                const obj = {
                    hotp: generatedHOTP,
                    hash: h2.toString(),
                    userAction,
                };

                const objStringify = JSON.stringify(obj);
                console.log("objStringify+++++  " + objStringify);
                if (objStringify !== null && objStringify !== "") {
                    console.log("objStringify.toString+++++  " + objStringify.toString());
                }

                if (objStringify !== null && objStringify !== "") {
                    this.encryptSigningData(objStringify.toString());
                }
            } else {
                if (mdipCounter !== null && mdipCounter !== "") {
                    this.updateMdipCounter(mdipCounter);
                }
                console.log("performSigningAndEncryption counter+++" + mdipCounter);
                console.log("UNSUCCESSFULL", "AC0");
                console.log("perform encryption 6,", "fail - AC0");
                //TODO Need to re-visit after jan for MDIP counter mis-match
                this._clearSecure2uLocalRegistration();
                //TODO Need to re-visit after jan for MDIP counter mis-match
                this._secure2uTransactionFailedLocal();
                //TODO Have to added -ve Flow
            }
        } catch (e) {
            console.log("perform encryption 6,  fail - AC01");
            console.log("perform encryption 6,  fail - exception : e :");
            // update AS and context

            if (e !== null && e !== "") {
                console.log("perform encryption 6,  fail - exception : e :" + e.toString());
            }

            // local_transactionResponseError = Strings.SERVER_ERROR;
            //TODO Need to re-visit after jan for MDIP counter mis-match
            this._clearSecure2uLocalRegistration();
            //TODO Need to re-visit after jan for MDIP counter mis-match
            this._secure2uTransactionFailedLocal();
        }
    };

    encryptSigningData = async (message) => {
        let nonce, cipherText;
        console.log("encryptSigningData.....................................");
        console.log("message+++++  " + message);

        let publicKey = this.ota.serverPublicKey;
        const secretKey = local_deviceSecretKey;

        const public_key = this.ota.serverPublicKey;
        const updateModel = this.props.updateModel;

        try {
            publicKey = this.ota.serverPublicKey;

            console.log("device Public  : ", public_key);

            const data = [message, publicKey, secretKey];

            const msg = await RNLibSodiumSdk.encryptAndAuthenticate(data);

            if (msg) {
                console.log("Encryption Sucessful ==> ", msg);

                if (!Object.prototype.hasOwnProperty.call(msg, "ERROR")) {
                    const tempCipherText = msg;
                    cipherText = tempCipherText.ct;
                    nonce = tempCipherText.nonce;

                    console.log("cipherText Success...........:..........." + cipherText);
                    console.log("Nonce Success...........:..........." + nonce);

                    local_signingDataNonce = nonce; // ??
                    local_signingDataCipherText = cipherText; // ??

                    const mdipCounter = parseInt(this.ota.mdipCounter);
                    const ctrPlus = mdipCounter + 1;
                    this.updateMdipCounter(ctrPlus);

                    updateModel({
                        ota: {
                            mdipCounter: ctrPlus,
                        },
                    });

                    this._secure2uSignTransaction();
                }
            }
        } catch (e) {
            console.log("encryptNauthenticate error : ", e);

            //TODO Need to re-visit after jan for MDIP counter mis-match
            this._clearSecure2uLocalRegistration();
            this._secure2uTransactionFailedLocal();
        }
    };

    _generateSignTransactionSubURL = () => {
        const { getModel, nonTxnData, customSignTransactionSubURL } = this.props;

        if (customSignTransactionSubURL) return customSignTransactionSubURL;

        const { mdipS2uEnable } = getModel("s2uIntrops");
        let subURL = `2fa/${mdipS2uEnable ? "v2" : "v1"}/secure2u/signTransaction`;

        if (nonTxnData?.isNonTxn) subURL = "2fa/v2/secure2u/nonMonetarySignTxn";

        return subURL;
    };

    _secure2uSignTransaction = () => {
        console.log("_secure2uSignTransaction==> ");
        const { deviceId: otaDeviceId } = this.props.getModel("ota");
        const { mdipS2uEnable } = this.props.getModel("s2uIntrops");
        const subUrl = this._generateSignTransactionSubURL();
        const deviceInfo = this.props.getModel("device");

        console.log(
            "[Secure2uAuthenticationModal] >> [_secure2uSignTransaction] local_decryptedChallengeSecureJson : ",
            local_decryptedChallengeSecureJson
        );
        let params = {
            app_id: APP_ID, // ??
            challenge_id: local_decryptedChallengePlainText.id,
            cipher_text: local_signingDataCipherText,
            device_nonce: local_signingDataNonce,
            user_id: local_decryptedChallengePlainText.mtou_userid,
            svcId: local_decryptedChallengeSecureJson?.SvcId ?? "",
            reserve1: local_decryptedChallengeSecureJson?.Reserve1 ?? "",
            effectiveDate: local_decryptedChallengeSecureJson?.EffectiveDate ?? "",
            application_id: local_decryptedChallengeSecureJson?.ApplID ?? "",
        };
        let pushDetails = [];
        if (this.props?.s2uFlow === "PUSH") {
            pushDetails = this.state.formatedAckPushData;
        }
        const extraParams = this.props.extraParams;

        // add this maybe...

        if (extraParams) params = { ...params, ...extraParams }; // xtraParams come from properties maybe..

        console.log("_onCallBillPaidAPI ==> ", params);
        secure2uSignTransactionApi(subUrl, params)
            .then((response) => {
                const responseObject = response?.data;
                console.log("/secure2u/signTransaction1 ==> ", responseObject);

                let transactionStatus = false;
                // Added All Transaction Status Special cases Handling
                const responseStatus = responseObject?.status ?? "";
                const responseStatusDescription = responseObject?.statusDescription ?? "";
                console.log("/secure2u/signTransaction2 ==> ", responseStatus);
                if (
                    (responseStatus &&
                        (responseStatus === "M000" ||
                            responseStatus === "M001" ||
                            responseStatus === "M100" ||
                            responseStatus === "00U1" ||
                            responseStatus === "000" ||
                            responseStatus === "Accepted")) ||
                    (responseStatusDescription && responseStatusDescription === "Accepted")
                ) {
                    transactionStatus = true;
                }
                //Added UpdatemultiOTP api to rereg s2u for M213 and M208
                if (responseStatus === "M213" || responseStatus === "M208") {
                    transactionStatus = false;
                    if (mdipS2uEnable) {
                        callS2uMultiOTP(otaDeviceId, deviceInfo.deviceId, this.props.updateModel);
                    } else {
                        this._clearSecure2uLocalRegistration();
                    }
                }

                // [[UPDATE_BALANCE]] Update balance from response if transaction is success
                const { isUpdateBalanceEnabled } = this.props.getModel("wallet");

                if (isUpdateBalanceEnabled && transactionStatus) {
                    updateWalletBalance(this.props.updateModel, responseObject?.wallet ?? null);
                }

                this.props.onS2UDone({
                    // transactionResponse: this.props.transactionResponseObject,
                    s2uSignRespone: responseObject,
                    transactionStatus,
                    pushData: pushDetails,
                });
            })
            .catch((error) => {
                console.log("/secure2u/signTransaction 3 Error ==> ", error);
                this.props.onS2UDone({
                    // transactionResponse: this.props.transactionResponseObject,
                    s2uSignRespone: { text: error.message, code: error.code },
                    transactionStatus: false,
                    pushData: pushDetails,
                });
            });
    };

    _generateTitle = () => {
        const { nonTxnData, s2uFlow, amount, customTitle } = this.props;

        if (customTitle) return customTitle;
        if (nonTxnData?.isNonTxn) return nonTxnData?.nonTxnTitle ?? "";
        if (s2uFlow?.toUpperCase?.() === "PUSH") return this.state.amount;
        else return `${CURRENCY} ${Numeral(amount).format("0,0.00")}`;
    };

    onChallengeSnackClosePress = () => {
        this.setState({
            isRSARequired: false,
            challengeQuestion: "",
            isRSALoader: true,
            RSACount: 0,
            RSAError: false,
        });
    };

    onChallengeQuestionSubmitPress = (answer) => {
        const { challenge } = this.state;
        const cqAns = {
            ...challenge,
            answer,
        };
        this.setState({ challenge: cqAns, isRSALoader: true, RSAError: false }, () => {
            //trigger execute again
            const { token } = this.state;
            this.executeS2uCall(token);
        });
    };

    updateMdipCounter = (value) => {
        AsyncStorage.setItem("SEC2U_MDIP_COUNTER", value.toString());
    };

    mapperDescText = (value, from) => {
        return (
            <View style={from === "body" ? Styles.keysStyle : Styles.s2uSubtitle}>
                <Typo
                    fontSize={14}
                    fontWeight="400"
                    fontStyle="normal"
                    lineHeight={18}
                    textAlign="left"
                    color={WHITE}
                    text={value}
                />
            </View>
        );
    };

    pullMapperView = () => {
        const { transactionMapperDetails } = this.state;
        const mapperDisplayData = {};
        if (transactionMapperDetails?.misc?.transaction_type === "MONETARY") {
            mapperDisplayData.amount = transactionMapperDetails?.amount;
        } else {
            mapperDisplayData.header = transactionMapperDetails?.header;
            mapperDisplayData.subHeader = transactionMapperDetails?.subHeader;
        }
        mapperDisplayData.desc = transactionMapperDetails?.desc;
        mapperDisplayData.body = transactionMapperDetails?.body;
        mapperDisplayData.notes = transactionMapperDetails?.notes;
        return (
            <React.Fragment>
                {mapperDisplayData?.header && (
                    <View style={Styles.s2uTitle}>
                        <Typo
                            fontSize={24}
                            fontWeight="bold"
                            fontStyle="normal"
                            letterSpacing={0}
                            lineHeight={30}
                            textAlign="left"
                            color={WHITE}
                            text={mapperDisplayData?.header}
                        />
                    </View>
                )}
                {mapperDisplayData?.subHeader && this.mapperDescText(mapperDisplayData?.subHeader)}
                {mapperDisplayData?.amount && (
                    <View>
                        <Typo
                            fontSize={24}
                            fontWeight="bold"
                            fontStyle="normal"
                            letterSpacing={0}
                            lineHeight={30}
                            textAlign="left"
                            color={WHITE}
                            text={mapperDisplayData?.amount}
                        />
                    </View>
                )}
                {mapperDisplayData?.desc && this.mapperDescText(mapperDisplayData?.desc)}
                <View style={Styles.detailsContainer}>
                    {mapperDisplayData?.body &&
                        mapperDisplayData.body.map((item, index) => {
                            return (
                                <View style={Styles.viewRow} key={index}>
                                    <View style={Styles.viewRowLeftItem}>
                                        {this.mapperDescText(item.key, "body")}
                                    </View>
                                    <View style={Styles.viewRowRightItem}>
                                        <Typo
                                            fontSize={14}
                                            fontWeight="600"
                                            fontStyle="normal"
                                            letterSpacing={0}
                                            lineHeight={24}
                                            textAlign="right"
                                            color={WHITE}
                                            text={item.value}
                                        />
                                    </View>
                                </View>
                            );
                        })}
                </View>
                {mapperDisplayData?.notes && this.mapperDescText(mapperDisplayData?.notes)}
            </React.Fragment>
        );
    };

    render() {
        const s2uPollingFlow = this.state.s2uPollingFlow;
        return (
            <React.Fragment>
                {s2uPollingFlow ? (
                    <PollingS2u
                        onPollCallback={this.onPollCallback}
                        currentDevice={this.state.currentS2uDevice}
                        token={this.props.token}
                        txnType={this.props.extraParams?.metadata?.txnType}
                        extraParams={
                            this.props.extraParams?.txnType
                                ? {
                                      txnAmount: this.props?.amount,
                                      ...this.props.extraParams,
                                  }
                                : null
                        }
                    />
                ) : (
                    <Modal visible animated animationType="slide" hardwareAccelerated transparent>
                        <View style={Styles.mainContainer}>
                            <ScreenContainer
                                backgroundType="color"
                                backgroundColor={GREY_DARK}
                                showLoaderModal={this.state.isLoading}
                            >
                                <ScreenLayout
                                    paddingHorizontal={0}
                                    paddingBottom={0}
                                    paddingTop={0} // top gap 25
                                    // header={<View />}
                                >
                                    <React.Fragment>
                                        <ScrollView
                                            style={Styles.scrollView}
                                            contentContainerStyle={Styles.scrollViewContainer}
                                        >
                                            <View style={Styles.contentContainer}>
                                                <Image
                                                    source={require("@assets/icons/ic_secure2u_auth.png")}
                                                    resizeMode="contain"
                                                    style={Styles.secure2uIcon}
                                                />
                                                {/* title */}
                                                <View style={Styles.s2uTitleItem}>
                                                    <Typo
                                                        fontSize={20}
                                                        fontWeight="300"
                                                        fontStyle="normal"
                                                        letterSpacing={0}
                                                        lineHeight={30}
                                                        textAlign="left"
                                                        color={WHITE}
                                                    >
                                                        <Text
                                                            accessible={true}
                                                            testID="txtSECURE2U_AUTHORISATION"
                                                            accessibilityLabel="txtSECURE2U_AUTHORISATION"
                                                        >
                                                            Secure2u authorisation
                                                        </Text>
                                                    </Typo>
                                                </View>
                                                {/* amount */}
                                                {this.state.title !== "" && (
                                                    <View style={Styles.s2uAmountItem}>
                                                        <Typo
                                                            fontSize={24}
                                                            fontWeight="bold"
                                                            fontStyle="normal"
                                                            letterSpacing={0}
                                                            lineHeight={30}
                                                            textAlign="left"
                                                            color={WHITE}
                                                            text={this.state.title}
                                                        />
                                                    </View>
                                                )}
                                                {this.state.subTitle !== "" && (
                                                    <View style={Styles.s2uSubtitle}>
                                                        <Typo
                                                            fontSize={14}
                                                            fontWeight="400"
                                                            fontStyle="normal"
                                                            lineHeight={18}
                                                            textAlign="left"
                                                            color={WHITE}
                                                            text={this.state.subTitle}
                                                        />
                                                    </View>
                                                )}
                                                {(this.state.s2uEnablement ||
                                                    this.state.isV4Push) && (
                                                    <View style={Styles.detailsV4Container}>
                                                        {this.pullMapperView()}
                                                    </View>
                                                )}
                                                {this.state.transactionDetails && (
                                                    <View style={Styles.detailsContainer}>
                                                        {this.state.transactionDetails.map(
                                                            (item, index) => {
                                                                return (
                                                                    <View
                                                                        style={Styles.viewRow}
                                                                        key={index}
                                                                    >
                                                                        <View
                                                                            style={
                                                                                Styles.viewRowLeftItem
                                                                            }
                                                                        >
                                                                            <Typo
                                                                                fontSize={14}
                                                                                fontWeight="normal"
                                                                                fontStyle="normal"
                                                                                letterSpacing={0}
                                                                                lineHeight={18}
                                                                                textAlign="left"
                                                                                color={WHITE}
                                                                                text={item.label}
                                                                            />
                                                                        </View>
                                                                        <View
                                                                            style={
                                                                                Styles.viewRowRightItem
                                                                            }
                                                                        >
                                                                            {this.props?.s2uFlow ===
                                                                            "PUSH" ? (
                                                                                <HTML
                                                                                    html={`<div style="text-align: right">${item.value}</div>`}
                                                                                    tagsStyles={{
                                                                                        div: {
                                                                                            textAlign:
                                                                                                "right",
                                                                                        },
                                                                                    }}
                                                                                    baseFontStyle={
                                                                                        styles.htmlStyle
                                                                                    }
                                                                                />
                                                                            ) : (
                                                                                <Typo
                                                                                    fontSize={14}
                                                                                    fontWeight="600"
                                                                                    fontStyle="normal"
                                                                                    letterSpacing={
                                                                                        0
                                                                                    }
                                                                                    lineHeight={18}
                                                                                    textAlign="right"
                                                                                    color={WHITE}
                                                                                    text={
                                                                                        item.value
                                                                                    }
                                                                                />
                                                                            )}
                                                                        </View>
                                                                    </View>
                                                                );
                                                            }
                                                        )}
                                                    </View>
                                                )}
                                            </View>
                                        </ScrollView>
                                        {/* Buttons */}
                                        <View style={Styles.footer}>
                                            <View style={Styles.footerLeftBtn}>
                                                <ActionButton
                                                    fullWidth
                                                    borderRadius={24}
                                                    onPress={this._onRejectClick}
                                                    backgroundColor={WHITE}
                                                    testID="txtSELECT_S2U_REJECT"
                                                    accessibilityLabel="txtSELECT_S2U_REJECT"
                                                    componentCenter={
                                                        <Typo
                                                            text={REJECT}
                                                            fontSize={14}
                                                            fontWeight="600"
                                                            lineHeight={18}
                                                        />
                                                    }
                                                />
                                            </View>
                                            <View style={Styles.footerRightBtn}>
                                                <ActionButton
                                                    fullWidth
                                                    borderRadius={24}
                                                    onPress={this._onApproveClick}
                                                    backgroundColor={YELLOW}
                                                    testID="txtSELECT_S2U_ACCEPT"
                                                    accessibilityLabel="txtSELECT_S2U_ACCEPT"
                                                    componentCenter={
                                                        <Typo
                                                            text={APPROVE}
                                                            fontSize={14}
                                                            fontWeight="600"
                                                            lineHeight={18}
                                                        />
                                                    }
                                                />
                                            </View>
                                        </View>
                                    </React.Fragment>
                                </ScreenLayout>
                                <ChallengeQuestion
                                    loader={this.state.isRSALoader}
                                    display={this.state.isRSARequired}
                                    displyError={this.state.RSAError}
                                    questionText={this.state.challengeQuestion}
                                    onSubmitPress={this.onChallengeQuestionSubmitPress}
                                    onSnackClosePress={this.onChallengeSnackClosePress}
                                />
                            </ScreenContainer>
                        </View>
                    </Modal>
                )}
            </React.Fragment>
        );
    }
}

Secure2uAuthenticationModal.propTypes = {
    amount: PropTypes.number,
    extraParams: PropTypes.object,
    getModel: PropTypes.func,
    nonTxnData: PropTypes.shape({
        isNonTxn: PropTypes.any,
        nonTxnTitle: PropTypes.any,
    }),
    onS2UDone: PropTypes.func,
    pushData: PropTypes.shape({
        encryptedChallenge: PropTypes.any,
        nonce: PropTypes.any,
    }),
    s2uFlow: PropTypes.string,
    s2uPollingData: PropTypes.shape({
        pull: PropTypes.string,
    }),
    token: PropTypes.string,
    transactionDetails: PropTypes.object,
    updateModel: PropTypes.func,
    subTitle: PropTypes.string,
};

export default withModelContext(Secure2uAuthenticationModal);

const Styles = {
    mainContainer: { height, width: "100%" },
    containerBlack: {
        flex: 1,
        width: "100%",
    },
    detailsContainer: {
        marginTop: 40,
    },
    detailsV4Container: {
        marginTop: 20,
    },
    scrollView: {
        // marginBottom: 85,
    },
    scrollViewContainer: {},
    contentContainer: {
        flexDirection: "column",
        flex: 1,
        paddingTop: 146, // notes: 146-25 = 121 (if use useSafeArea)
        marginLeft: 36,
        marginRight: 36,
    },
    s2uTitleItem: {
        marginTop: 24,
    },
    s2uAmountItem: {
        marginTop: 16,
    },
    s2uSubtitle: {
        marginTop: 8,
    },
    keysStyle: {
        marginTop: 2,
    },
    secure2uIcon: {
        height: 64,
        marginLeft: 0,
        width: 36,
    },
    viewRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginBottom: 16,
    },
    viewRowLeftItem: {
        flex: 0.5,
    },
    viewRowRightItem: {
        alignContent: "flex-end",
        marginLeft: 10,
        flex: 1,
    },
    footer: {
        flexDirection: "row",
        padding: 36,
    },
    footerLeftBtn: {
        flex: 1,

        marginRight: 5,
    },
    footerRightBtn: {
        flex: 1,
        marginLeft: 5,
    },
};

const styles = StyleSheet.create({
    htmlStyle: {
        color: WHITE,
        fontFamily: "montserrat",
        fontSize: 14,
        fontStyle: "normal",
        fontWeight: "600",
        lineHeight: 18,
        textAlign: "right",
    },
});
