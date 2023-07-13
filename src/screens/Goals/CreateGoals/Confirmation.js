import moment from "moment";
import numeral from "numeral";
import PropTypes from "prop-types";
import React, { Component } from "react";
import { TouchableOpacity, View, ScrollView, Image, StyleSheet, FlatList } from "react-native";

import { navigateToS2UCooling, navigateToS2UReg } from "@screens/OneTapAuth/CoolingNavigator";

import * as navigationConstant from "@navigation/navigationConstant";

import HeaderLayout from "@layouts/HeaderLayout";
import ScreenLayout from "@layouts/ScreenLayout";

import BorderedAvatar from "@components/Avatars/BorderedAvatar";
import ActionButton from "@components/Buttons/ActionButton";
import HeaderBackButton from "@components/Buttons/HeaderBackButton";
import HeaderCloseButton from "@components/Buttons/HeaderCloseButton";
import { ErrorMessage, ScrollPickerView } from "@components/Common";
import ScreenContainer from "@components/Containers/ScreenContainer";
import FixedActionContainer from "@components/Footers/FixedActionContainer";
import OtpModal from "@components/Modals/OtpModal";
import Secure2uAuthenticationModal from "@components/Modals/Secure2uAuthenticationModal";
import TabungAccountDetailList from "@components/Others/TabungAccountDetailList";
import Popup from "@components/Popup";
import ChallengeQuestion from "@components/RSA/ChallengeQuestion";
import Typo from "@components/Text";
import { showErrorToast } from "@components/Toast";

import { withModelContext } from "@context";

import ApiManager, { TIMEOUT, METHOD_GET } from "@services/ApiManager";
import { logEvent } from "@services/analytics";
import {
    goalCreate,
    disableEsi,
    requestOTP,
    createSoloGoal,
    getCalculatedGoalESIFrequency,
} from "@services/index";

import { OTP_TYPE_CREATEUSER, TOKEN_TYPE_M2U } from "@constants/api";
import { YELLOW, WHITE, MEDIUM_GREY, GREY, DARKEST_GRAY } from "@constants/colors";
import { SMS_TAC, S2U_PUSH, M2U } from "@constants/data";
import { FN_CREATE_GROUP_TABUNG } from "@constants/fundConstants";
import {
    WE_FACING_SOME_ISSUE,
    APP_NAME_ALERTS,
    FA_TABUNG_CREATE_TABUNG_REVIEWDETAILS,
    FA_FORM_PROCEED,
    FA_FIELD_INFORMATION,
    FA_SCREEN_NAME,
    FA_FORM_ERROR,
    FA_VIEW_SCREEN,
    FA_TABUNG_CREATE_TABUNG_FAILED,
    FA_TABUNG_ENABLE_AUTODEDUCTION,
    FA_TABUNG_DISABLE_AUTODEDUCTION,
    FA_NA,
    TRANSFER_FROM,
    CREATE_TABUNG,
    TABUNG_ENABLE_AUTODEDUCTION,
    TABUNG_DISABLE_AUTODEDUCTION,
    JOIN_TABUNG,
    UNSAVED_CHANGES,
    CREATE_GROUP_TABUNG,
    TABUNG_CREATE_SUCCESS,
    TABUNG_CREATE_FAILURE,
} from "@constants/strings";
import { ENDPOINT_BASE } from "@constants/url";

import { ErrorLogger, maskedMobileNumber } from "@utils";
import { encryptData } from "@utils/dataModel";
import {
    handleS2UAcknowledgementScreen,
    init,
    initChallenge,
    s2uSdkLogs,
} from "@utils/dataModel/s2uSDKUtil";
import { getDeviceRSAInformation, formateAccountNumber } from "@utils/dataModel/utility";
import { errorMessageMap } from "@utils/errorMap";

import assets from "@assets";

const S2U_FLOW = "S2U";

class Confirmation extends Component {
    static propTypes = {
        getModel: PropTypes.func,
        navigation: PropTypes.shape({
            addListener: PropTypes.func,
            goBack: PropTypes.func,
            navigate: PropTypes.func,
        }),
        resetModel: PropTypes.func,
        route: PropTypes.shape({
            params: PropTypes.shape({
                S2UStatus: PropTypes.shape({
                    isGroupGoal: PropTypes.any,
                    secure2uValidateData: PropTypes.shape({
                        pull: PropTypes.string,
                    }),
                }),
            }),
        }),
        updateModel: PropTypes.func,
    };

    state = {
        error: false,
        errorMessage: "",

        frequency: "Select frequency",
        dropDownView: false,
        accountList: [],
        frequencyList: [],
        esiEnabled: false,
        fromAccount: "",
        close: false,
        nonMayaExisits: false,
        maeError: false,
        selectedIndex: 0,
        loaded: false,
        showInitLoader: true,

        // RSA Stuff
        isRSARequired: false,
        challengeQuestion: "",
        challengeRequest: {},
        isRSALoader: true,
        RSACount: 0,
        RSAError: false,

        // OTP stuff
        showOTP: false,
        otpValue: "",
        mobileNumber: null,
        loading: false,

        //S2U State
        showS2UModal: false,
        s2uToken: "",
        s2uServerDate: "",
        s2uTransactionType: "",
        s2uTransactionReferenceNumber: "",
        secure2uValidateData: {},
        s2uTransactionDetails: [],

        //S2U V4
        mapperData: {},
        nonTxnData: { isNonTxn: false },
        isS2uV4: false,
        isS2UDown: false,
    };

    // OTP STUFF

    _getOtpCode = async (otpRequestPayload) => {
        try {
            return await requestOTP(otpRequestPayload);
        } catch (error) {
            ErrorLogger(error);
            throw error;
        }
    };

    _requestOTP = async () => {
        console.log("[Confirmation] >> [requestOTP]");
        this.setState({ loading: true });

        const { getModel } = this.props;
        const { m2uPhoneNumber } = getModel("m2uDetails");

        try {
            const request = await this._getOtpCode({
                mobileNo: m2uPhoneNumber,
                otpType: OTP_TYPE_CREATEUSER,
                transactionType: "GOAL_CREATE",
            });

            this.setState({
                otpValue: request?.data?.result?.otpValue ?? "",
                mobileNumber: m2uPhoneNumber,
            });
            this.showOTPModal();
        } catch (error) {
            showErrorToast({
                message: error.message ? error.message : "Something is wrong. Try again later.",
            });
            this.setState({ loading: false });
        }
    };

    showOTPModal = () => {
        console.log("[MAECardEmployment] >> [showOTPModal]");

        this.setState({ showOTP: true });
    };

    onOTPDone = async (otp, otpModalErrorCb) => {
        console.log("[MAECardEmployment] >> [onOTPDone]");

        // Show loading
        this.setState({ loading: true, userOTP: otp }, async () => {
            // proceed to call saveGoal API
            const encryptedOtp = await encryptData(otp);
            this._createGoal(encryptedOtp, otpModalErrorCb);
        });
    };

    // verifyOTP = async (otp) => {
    //     console.log("[Confirmation] >> [verifyOTP]");

    //     // const encryptedOtp = await encryptData(otp);

    //     // const { getModel } = this.props;
    //     // const { deviceInformation, deviceId } = getModel("device");
    //     // const { mobileNumber, fullName } = getModel("user");
    //     // const params = {
    //     //     mobileNo: mobileNumber,
    //     //     fullName,
    //     //     otp: encryptedOtp,
    //     //     deviceId: deviceId,
    //     //     deviceOs: Platform.OS,
    //     //     deviceOsVersion: deviceInformation.DeviceSystemVersion,
    //     //     deviceDetail: deviceInformation.DeviceName,
    //     // };

    //     // try {
    //     //     const response = await validateOTP(params);

    //     //     if (response && response.data && response.data.message === "successful") {
    //     //         // Close OTP modal
    //     //         this.onOTPClose();
    //     //         // proceed to call saveGoal API
    //     //         this._createGoal(otp);
    //     //     }
    //     // } catch (error) {
    //     //     console.log(error);

    //     //     this.setState({ otpValue: "" });

    //     //     showErrorToast({
    //     //         message: error?.error?.message || error?.message,
    //     //     });
    //     // }
    // };

    onOTPClose = () => {
        this.setState({ showOTP: false, otpValue: null, loading: false });
    };

    onOTPResend = () => {
        this.setState({ showOTP: false, otpValue: null, loading: false }, () => {
            this._requestOTP();
        });
    };

    componentDidMount() {
        console.log("[Confirmation] componentDidMount ");

        this.focusSubscription = this.props.navigation.addListener("focus", async () => {
            console.log("[Confirmation] focusSubscription ");
            this._initData();
        });
    }

    _onPressClose = () => {
        this.setState({ close: true });
    };

    _onPressBack = () => {
        this.props.navigation.goBack();
    };

    _initData = () => {
        const { getModel } = this.props;
        const { goalData } = getModel("goals");
        const { mobileNumber } = getModel("user");

        this.setState({ goalData, mobileNumber }, async () => {
            // Set selected account
            this.setAccountSelected();
            console.log("[_initData] setState: ", goalData);

            // If coming from ESI/join goal flow, do below?
            if (
                goalData.esiActivation === true ||
                goalData.esiDiactivation === true ||
                goalData.joinGoal === true
            ) {
                console.log("initData 4.1");
                if (goalData.esiDiactivation === true) {
                    this.setState({
                        frequency: goalData.frequencyMessage,
                    });
                } else {
                    const primary = goalData.frequencyList.find((f) => f.primary);
                    this.setState({
                        frequency: primary ? primary.title : "",
                    });
                    // this.dropdown.resetData(goalData.frequencyList);
                }
            } else {
                console.log("initData 4.2");
                await this.calculateFrequency();
                // this.addSelectedUsers(ModelClass.SELECTED_CONTACT);
            }
            this.setState({ showInitLoader: false });
        });

        logEvent(FA_FORM_PROCEED, {
            [FA_SCREEN_NAME]: FA_TABUNG_CREATE_TABUNG_REVIEWDETAILS,
            [FA_FIELD_INFORMATION]: goalData?.esiEnabled
                ? FA_TABUNG_ENABLE_AUTODEDUCTION
                : FA_TABUNG_DISABLE_AUTODEDUCTION,
        });
    };

    _getMaskedMobileNo = async () => {
        try {
            const response = await ApiManager.service({
                url: `${ENDPOINT_BASE}/wallet/v1/qrpay/getMaskedMobileNo`,
                reqType: METHOD_GET,
                tokenType: TOKEN_TYPE_M2U,
                timeout: TIMEOUT,
                promptError: false,
            });
            if (response) return response;
            throw new Error(response);
        } catch (error) {
            // ErrorLogger(error);
            return null;
        }
    };

    onChallengeSnackClosePress = () => {
        this.setState({ RSAError: false });
    };

    onChallengeQuestionSubmitPress = async (answer) => {
        const {
            challengeRequest: { challenge },
        } = this.state;

        this.setState(
            {
                challengeRequest: {
                    ...this.state.challengeRequest,
                    challenge: {
                        ...challenge,
                        answer,
                    },
                },
                isRSALoader: true,
                RSAError: false,
            },
            async () => {
                if (!this.props.route?.params?.S2UStatus?.isGroupGoal) {
                    this._handleSoloGoalCreation();
                    return;
                }
                const encryptedOtp = await encryptData(this.state.userOTP);
                this._createGoal(encryptedOtp, null, this.state.challengeRequest);
            }
        );
    };

    _createGoal = (tac, otpModalErrorCb, challenge) => {
        const request = this.getAPIParams();

        // OTP stuff
        request.otp = tac;

        if (challenge) {
            request.challenge = challenge.challenge;
        }

        console.log("[Confirmation] create goal request obj ", request);

        goalCreate("/goal/saveGoal", JSON.stringify(request))
            .then(async (response) => {
                console.log("RES", response);
                const regObject = response.data;
                console.log("Object", regObject);

                this.setState({ showOTP: false, otpValue: null, isRSARequired: false });

                this.successScreen(regObject);
            })
            .catch((err) => {
                console.log("[goalCreate] error caught");

                this._goalCreationFailed(err, otpModalErrorCb);
            });
    };

    successScreen = (regObject) => {
        const { goalData } = this.state;
        this._updateGoalDataContext(
            {
                ...goalData,
                success: regObject.code === 0,
                created: regObject.result?.formattedCreatedDateAmPm || "NA",
                ref: regObject.result?.trxRefId ?? regObject.result?.transactionRefNumber ?? FA_NA,
                message:
                    regObject.code === 0
                        ? TABUNG_CREATE_SUCCESS
                        : regObject?.message || TABUNG_CREATE_FAILURE,
                subMessage: regObject.code === 0 ? null : "-",
            },
            () => {
                this.props.navigation.navigate(navigationConstant.GOALS_MODULE, {
                    screen: navigationConstant.CREATE_GOALS_ACKNOWLEDGMENT,
                    params: {
                        s2w: regObject.result?.s2w,
                    },
                });
            }
        );
    };

    _goalCreationFailed = (error, otpModalErrorCb) => {
        logEvent(FA_VIEW_SCREEN, {
            [FA_SCREEN_NAME]: FA_TABUNG_CREATE_TABUNG_FAILED,
        });
        const { goalData } = this.state;

        console.log("[_goalCreationFailed] error: ", error);

        if (error.status === 428) {
            // Display RSA Challenge Questions if status is 428
            this.setState((prevState) => ({
                showOTP: false,
                challengeRequest: {
                    ...prevState.challengeRequest,
                    challenge: error.error.result.rsaResponse.challenge,
                },
                isRSARequired: true,
                isRSALoader: false,
                challengeQuestion: error.error.result.rsaResponse.challenge.questionText,
                RSACount: prevState.RSACount + 1,
                RSAError: prevState.RSACount > 0,
            }));
        } else if (error.status === 423) {
            // Display RSA Account Locked Error Message
            console.log("423:", error);
            this.setState(
                {
                    showOTP: false,
                    // update state values
                    isRSARequired: false,
                    isRSALoader: false,
                },
                () => {
                    this._updateGoalDataContext(
                        {
                            ...goalData,
                            created: error?.error?.result?.rsaResponse?.serverDate ?? "NA",
                            ref:
                                error?.error?.result?.trxRefId ??
                                error?.error?.result?.transactionRefNumber ??
                                FA_NA,
                            success: false,
                            message:
                                error?.error?.result?.rsaResponse?.statusDescription ??
                                WE_FACING_SOME_ISSUE,
                        },
                        () => {
                            const serverDate =
                                error?.error?.result?.rsaResponse?.serverDate ?? "N/A";
                            this.props.navigation.navigate("OneTapAuthModule", {
                                screen: "Locked",
                                params: {
                                    reason:
                                        error?.error?.result?.rsaResponse?.statusDescription ??
                                        "N/A",
                                    loggedOutDateTime: serverDate,
                                    lockedOutDateTime: serverDate,
                                },
                            });
                        }
                    );
                }
            );
        } else if (error.status === 400) {
            // Invalid OTP
            if (otpModalErrorCb) {
                otpModalErrorCb(errorMessageMap(error));
            } else {
                this.setState({
                    loading: false,
                    isRSARequired: false,
                    challengeQuestion: "",
                    challengeRequest: {},
                    isRSALoader: true,
                    RSACount: 0,
                    RSAError: false,
                    otpValue: null,
                    userOTP: null,
                });
                showErrorToast({
                    message: error.error.message
                        ? error.message
                        : "Something is wrong. Try again later.",
                });
            }
        } else {
            //Handle All other failure cases
            this.setState(
                {
                    // update state values
                    isRSARequired: false,
                    isRSALoader: false,
                    loading: false,
                    showOTP: false,
                    otpValue: null,
                },
                () => {
                    // console.log(error);
                    this._updateGoalDataContext(
                        {
                            ...goalData,
                            created: error?.error?.result?.rsaResponse?.serverDate ?? "NA",
                            ref:
                                error?.error?.result?.trxRefId ??
                                error?.error?.result?.transactionRefNumber ??
                                FA_NA,
                            success: false,
                            message:
                                error?.error?.result?.rsaResponse?.statusDescription ??
                                "Tabung was not created.\nPlease try again.",
                            subMessage:
                                (errorMessageMap(error) !== "Deny" && errorMessageMap(error)) ||
                                null,
                        },
                        () => {
                            this.props.navigation.navigate(navigationConstant.GOALS_MODULE, {
                                screen: navigationConstant.CREATE_GOALS_ACKNOWLEDGMENT,
                            });
                        }
                    );
                }
            );
        }
    };

    _updateGoalDataContext = async (goalData, callback) => {
        const { updateModel } = this.props;

        this.setState({ goalData }, async () => {
            await updateModel({
                goals: {
                    goalData,
                },
            });

            callback();
            console.log("[_updateGoalDataContext] updated goalData state: ", this.state.goalData);
        });
    };

    _getCalculatedGoalESIFrequency = async (startDate, endDate, amount) => {
        try {
            const response = await getCalculatedGoalESIFrequency(startDate, endDate, amount);
            if (response?.status === 200) return response;
            return null;
        } catch (error) {
            return null;
        }
    };

    calculateFrequency = async () => {
        const { goalData, loaded } = this.state;
        const dateFormat = "yyyy-MM-DD";

        if (!loaded) {
            const goalEndDate = moment(goalData.goalEndObj);
            if (goalData.typeCode === 3) goalEndDate.add(10, "years");
            const request = await this._getCalculatedGoalESIFrequency(
                moment(goalData.goalStartObj).format(dateFormat),
                goalEndDate.format(dateFormat),
                goalData?.youAmount
            );
            if (!request) return;

            const weeklyAmount = request.data?.weeklyAmount ?? 0;
            const weeklyTitle = `Save RM ${numeral(weeklyAmount).format("0,0.00")} / week`;
            const weeklyDetails = {
                type: "W",
                title: weeklyTitle,
                name: weeklyTitle,
                description: "",
                primary: false,
                select: false,
                amount: weeklyAmount,
            };

            const monthlyAmount = request.data?.monthlyAmount ?? 0;
            const monthlyTitle = `Save RM ${numeral(monthlyAmount).format("0,0.00")} / month`;
            const monthlyDetails = {
                type: "M",
                title: monthlyTitle,
                name: monthlyTitle,
                description: "",
                primary: true,
                select: true,
                amount: monthlyAmount,
            };

            this._updateGoalDataContext({
                ...goalData,
                frequencyType: monthlyDetails.type,
                frequencyAmount: monthlyDetails.amount,
            });

            this.setState(
                {
                    frequencyList: [weeklyDetails, monthlyDetails],
                    loaded: true,
                    frequency: monthlyDetails.title,
                    selectedIndex: 1,
                },
                () => {
                    this._toggleESI();
                }
            );
        }
    };

    onAccountListClick = (item) => {
        const { goalData, accountList } = this.state;
        console.log("[Confirmation][onAccountListClick] item:", item);

        // item.description
        goalData.fromAccountNo = item.number;
        goalData.fromAccountCode = item.code;
        goalData.fromAccountName = item.name;
        goalData.fromAccountType = item.type;
        // ModelClass.TRANSFER_DATA.fromAccountName = item.title; -- shahid: commented out - is this really necessary?

        //Alert.alert("item " + item.acctNo);
        const tempArray = accountList;
        for (let i = 0; i < tempArray.length; i++) {
            tempArray[i].id = i;
            if (tempArray[i].number === item.number) {
                tempArray[i].selected = true;
            } else {
                tempArray[i].selected = false;
            }
        }
        //this.state.fromAccount = item.description;
        this._updateGoalDataContext(goalData);
        this.setState({ accountList: tempArray, fromAccount: item.number });
    };

    setAccountSelected = () => {
        const { goalData } = this.state;

        const tempArray = goalData.accountList;
        let tempAccount = "";
        let selectedAccountObj = "";
        const nonSelectedAccounts = [];
        const targetSelectedAccounts = [];
        for (let j = 0; j < tempArray.length; j++) {
            if (j === 0) {
                tempArray[j].selected = true;
                selectedAccountObj = tempArray[j];
                console.log("selectedAccountObj is..", selectedAccountObj);
                tempAccount = selectedAccountObj.description;

                goalData.fromAccountNo = selectedAccountObj.number;
                goalData.fromAccountCode = selectedAccountObj.code;
                goalData.fromAccountName = selectedAccountObj.title;
                goalData.fromAccountType = selectedAccountObj.type;

                this._updateGoalDataContext(goalData);
                // ModelClass.TRANSFER_DATA.fromAccountName = selectedAccountObj.title; -- Shahid: commented out, is this really needed?

                // console.log(
                //     "[Confirmation][setAccountSelected] goalData.fromAccountNo ... ",
                //     goalData.fromAccountNo
                // );
            } else {
                tempArray[j].selected = false;
                nonSelectedAccounts.push(tempArray[j]);
            }
        }
        //Set Selected Account in Account List add it First to Account list
        if (selectedAccountObj != null && selectedAccountObj !== "") {
            targetSelectedAccounts.push(selectedAccountObj);
        }
        targetSelectedAccounts.push(...nonSelectedAccounts);

        this.setState({ accountList: targetSelectedAccounts, fromAccount: tempAccount });
    };

    esiDisable = async () => {
        const { goalData } = this.state;
        const request = {
            nextDeduction: goalData.frequencyNextDeduction,
            lastDeduction: goalData.frequencylastDeduction,
        };
        if (goalData.frequencyType === "M") {
            request.frequency = "M";
        } else {
            request.frequency = "W";
        }

        request.esiOn = false;
        request.amount = goalData.frequencyAmount;
        request.goalId = goalData.goalId;
        request.fromAcct = goalData.fromAccountNo;

        await disableEsi("/esi/create", JSON.stringify(request))
            .then(async (response) => {
                console.log("RES", response);
                const regObject = await response.data;
                console.log("Object", regObject);
                goalData.success = regObject.code === 0;
                goalData.created = regObject.result.createdDate;
                goalData.ref = regObject.result.trxRefId;
                if (goalData.success === true) {
                    goalData.message = "You’ve successfully disabled your auto deduction.";
                } else {
                    if (regObject.message) {
                        goalData.message = regObject.message;
                    } else {
                        goalData.message = "Failed to disable your auto deduction.";
                    }
                }
                this._updateGoalDataContext(goalData);

                this.props.navigation.navigate(navigationConstant.GOALS_MODULE, {
                    screen: navigationConstant.CREATE_GOALS_ACKNOWLEDGMENT,
                });
            })
            .catch((err) => {
                console.log("ERR", err);
                goalData.created = "";
                goalData.ref = "";
                goalData.success = false;
                goalData.message = "Oops! Something went wrong. Try again.";

                this._updateGoalDataContext(goalData);

                this.props.navigation.navigate(navigationConstant.GOALS_MODULE, {
                    screen: navigationConstant.CREATE_GOALS_ACKNOWLEDGMENT,
                });
            });
    };

    _onPressDoneScrollPickerView = (val, index) => {
        const { goalData } = this.state;

        console.log("DN Val " + index, val);
        const list = this.state.frequencyList.slice();
        for (const item in list) {
            list[item].select = false;
            list[item].primary = false;
        }
        list[index].select = true;
        list[index].primary = true;
        goalData.frequencyType = val.type;
        goalData.frequencyAmount = val.amount;
        if (goalData.esiActivation === true) {
            goalData.goalEnd = val.formattedLastDeductionDate;
            goalData.frequencylastDeduction = val.formattedLastDeductionDate;
        }
        this._updateGoalDataContext(goalData);

        this.setState({
            frequencyList: list,
            dropDownView: false,
            frequency: val.title,
            selectedIndex: index,
        });
    };

    _onPressCloseScrollPickerView = () => {
        console.log("_onPressCloseScrollPickerView");

        this.setState({
            dropDownView: false,
        });
    };

    _toggleCloseModal = () => {
        this.setState({ close: !this.state.close });
    };

    _createSoloGoal = async (payload) => {
        try {
            const response = await createSoloGoal(payload);
            if (response?.status === 200) return response;
            this._handleS2UUnexpectedHttpStatus(response);
            return null;
        } catch (error) {
            this._goalCreationFailed(error, null);
            return null;
        }
    };

    _prepareSoloGoalPayload = () => {
        const { getModel } = this.props;
        const { username } = getModel("user");
        const { deviceId, deviceInformation } = getModel("device");
        const mobileSDKData = getDeviceRSAInformation(deviceInformation, null, deviceId);
        const {
            goalData: {
                goalAmount,
                typeValue,
                goalName,
                goalStart,
                goalEnd,
                fullContactsList,
                accountNo,
                accountCode,
                esiEnabled,
                fromAccountNo,
                frequencyAmount,
                frequencyType,
            },
            challengeRequest,
        } = this.state;

        const participantsList = [];
        fullContactsList?.forEach?.((contact, index) => {
            const participant = {
                frequency: frequencyType,
                contributionAmount: contact.amount,
                userId: contact.mayaUserId,
                hpNo: contact.phoneNumber,
            };
            if (index === 0) {
                // Self
                participantsList.push({
                    ...participant,
                    toAccount: accountNo,
                    toAcctCode: accountCode,
                    fromAccount: esiEnabled === true ? fromAccountNo : "",
                    status: "ACCEPT",
                    name: username,
                    esiAmount: esiEnabled === true ? frequencyAmount : "",
                    esiStatus: esiEnabled === true ? "PENDING_ON" : "OFF",
                });
            } else {
                // Friends
                participantsList.push({
                    ...participant,
                    toAccount: "",
                    fromAccount: "",
                    status: "PENDING",
                    name: contact.mayaUserName,
                    esiAmount: "",
                    esiStatus: "OFF",
                });
            }
        });

        return {
            amount: goalAmount,
            goalType: typeValue,
            goalName,
            startDate: goalStart,
            endDate: goalEnd,
            hpNo: fullContactsList[0].phoneNumber,
            deviceId,
            mobileSDKData,
            participants: participantsList,
            challenge: challengeRequest?.challenge,
        };
    };

    _handleSoloGoalCreation = () => {
        const payload = this._prepareSoloGoalPayload();
        const {
            route: {
                params: {
                    S2UStatus: { flow },
                },
            },
        } = this.props;
        if (flow?.toUpperCase() !== S2U_FLOW) {
            this.setState({ loading: true }, () => {
                this._requestOTP();
            });
            return;
        }
        this._handleS2USoloGoalCreation(payload);
    };

    _handleAcknowledgementNavigation = (result) =>
        this.props.navigation.navigate(navigationConstant.GOALS_MODULE, {
            screen: navigationConstant.CREATE_GOALS_ACKNOWLEDGMENT,
            params: {
                s2w: result?.result?.s2w,
            },
        });

    _handleS2UUnexpectedHttpStatus = (response) => {
        logEvent(FA_FORM_ERROR, {
            [FA_SCREEN_NAME]: FA_TABUNG_CREATE_TABUNG_FAILED,
            [FA_FIELD_INFORMATION]: response?.data?.result?.transactionRefNumber,
        });
        this._updateGoalDataContext(
            {
                goalData: this.state.goalData,
                created: response?.data?.result?.serverDate ?? "N/A",
                ref:
                    response?.data?.result?.trxRefId ??
                    response?.data?.result?.transactionRefNumber ??
                    FA_NA,
                success: false,
                message: "Tabung was not created.\nPlease try again.",
                subMessage: response?.message ?? "",
            },
            () => this._handleAcknowledgementNavigation(response?.data)
        );
    };

    _handleS2USoloGoalCreation = async (payload) => {
        const request = await this._createSoloGoal({
            ...payload,
            twoFAType:
                this.props.route.params?.S2UStatus?.secure2uValidateData?.pull === "N"
                    ? "SECURE2U_PUSH"
                    : "SECURE2U_PULL",
        });
        if (!request) return;
        const {
            goalData: { goalName, goalStart, goalEnd, goalAmount, accountName, accountNo },
        } = this.state;
        const s2uServerDate = request?.data?.result?.formattedServerDate ?? "N/A";
        this.setState({
            isRSARequired: false,
            showS2UModal: true,
            s2uToken: request?.data?.result?.pollingToken,
            s2uServerDate,
            s2uTransactionType: "Tabung Setup",
            s2uTransactionReferenceNumber:
                request?.data?.result?.trxRefId ??
                request?.data?.result?.transactionRefNumber ??
                FA_NA,
            secure2uValidateData: this.props.route.params.S2UStatus.secure2uValidateData,
            s2uTransactionDetails: [
                { label: "Tabung name", value: goalName },
                {
                    label: "Target amount",
                    value: `RM ${numeral(goalAmount).format("0,0.00")}`,
                },
                { label: "Start date", value: goalStart },
                { label: "End date", value: goalEnd },
                {
                    label: "Linked account",
                    value: accountName + "\n" + formateAccountNumber(accountNo, 12),
                },
                { label: "Date", value: s2uServerDate },
            ],
        });
    };

    _onS2UConfirmation = (s2uResponse) => {
        const { s2uServerDate, s2uTransactionReferenceNumber } = this.state;
        const serverDate = s2uServerDate;
        const transactionReferenceNumber = s2uTransactionReferenceNumber;
        this.setState({
            showS2UModal: false,
            s2uToken: "",
            s2uServerDate: "",
            s2uTransactionType: "",
            s2uTransactionReferenceNumber: "",
        });
        const isCreationSuccessful = s2uResponse?.s2uSignRespone?.statusCode === "M000";
        let message = "Tabung created successfully.";
        if (!isCreationSuccessful) {
            message =
                s2uResponse?.s2uSignRespone?.text || "Tabung was not created. Please try again.";
        }
        let subMessage = null;
        if (!isCreationSuccessful) {
            subMessage = s2uResponse?.s2uSignRespone?.statusDescription || "";
        }
        this._updateGoalDataContext(
            {
                goalData: this.state.goalData,
                success: isCreationSuccessful,
                created: serverDate,
                ref: transactionReferenceNumber,
                message,
                subMessage,
            },
            () => this._handleAcknowledgementNavigation(s2uResponse.data)
        );
    };

    _onPressContinue = () => {
        const { goalData } = this.state;

        if (goalData.esiActivation === false) {
            goalData.pinValidate = 1;
        } else {
            goalData.pinValidate = 2;
        }

        this._updateGoalDataContext(goalData);

        if (goalData.esiDiactivation === true) {
            this.esiDisable();
        } else {
            if (this.state.frequency != "Select frequency") {
                if (
                    (this.state.esiEnabled == true || goalData.esiActivation == true) &&
                    goalData.fromAccountCode == "OY" &&
                    goalData.frequencyAmount > 2999.99
                ) {
                    this.setState({ maeError: true });
                } else {
                    goalData.fromRoute = navigationConstant.CREATE_GOALS_CONFIRMATION;
                    this._updateGoalDataContext(goalData);

                    // Show TAC Modal
                    // this._navigateToTACFlow();
                    if (!this.props.route?.params?.S2UStatus?.isGroupGoal) {
                        this._handleSoloGoalCreation();
                        return;
                    }
                    this.setState({ loading: true }, () => {
                        console.log("initiate s2usdk");
                        this.initiateS2USdk();
                    });
                }
            } else {
                this.setState({
                    error: true,
                    errorMessage: "Please select a frequency",
                });
            }
        }
    };

    // S2U V4
    initiateS2USdk = async () => {
        try {
            const s2uInitResponse = await this.s2uSDKInit();
            console.log("S2U SDK s2uInitResponse : ", s2uInitResponse);
            if (s2uInitResponse?.message || s2uInitResponse?.statusCode !== 0) {
                console.log("s2uInitResponse error : ", s2uInitResponse.message);
                showErrorToast({
                    message: s2uInitResponse.message,
                });
            } else {
                if (s2uInitResponse?.actionFlow === SMS_TAC) {
                    //Tac Flow
                    const { getModel } = this.props;
                    const { isS2uV4ToastFlag } = getModel("misc");
                    this.setState({ isS2UDown: isS2uV4ToastFlag ?? false });
                    this._requestOTP();
                } else if (s2uInitResponse?.actionFlow === S2U_PUSH) {
                    if (s2uInitResponse?.s2uRegistrationDetails?.app_id === M2U) {
                        this.doS2uRegistration(this.props.navigation.navigate);
                    }
                } else {
                    //S2U Pull Flow
                    this.initS2UPull(s2uInitResponse);
                }
            }
        } catch (error) {
            s2uSdkLogs(error, CREATE_GROUP_TABUNG);
        }
    };

    //S2U V4
    s2uSDKInit = async () => {
        console.log("s2usdkinit");
        const transactionPayload = await this.getAPIParams();
        delete transactionPayload.mobileSDKData;
        return await init(FN_CREATE_GROUP_TABUNG, transactionPayload);
    };

    getAPIParams = () => {
        const { getModel } = this.props;
        const { username } = getModel("user");
        const { deviceId, deviceInformation } = getModel("device");
        const mobileSDKData = getDeviceRSAInformation(deviceInformation, null, deviceId);
        const { goalData } = this.state;

        const request = {
            amount: goalData.goalAmount,
            goalType: goalData.typeValue,
            goalName: goalData.goalName,
            startDate: goalData.goalStart,
            endDate: goalData.goalEnd,
            hpNo: goalData.fullContactsList[0].phoneNumber,
            deviceId,
            mobileSDKData,
        };
        const participantsList = [];
        console.log(" get Api params goalData.fullContactsList", goalData.fullContactsList);

        for (let i = 0; i < goalData.fullContactsList.length; i++) {
            const object = {};
            if (i === 0) {
                // Self
                object.toAccount = goalData.accountNo;
                object.toAcctCode = goalData.accountCode;
                object.fromAccount = goalData.esiEnabled === true ? goalData.fromAccountNo : "";
                object.status = "ACCEPT";
                object.name = username;
                object.esiAmount = goalData.esiEnabled === true ? goalData.frequencyAmount : "";
                object.esiStatus = goalData.esiEnabled === true ? "PENDING_ON" : "OFF";
            } else {
                // Friends
                object.toAccount = "";
                object.fromAccount = "";
                object.status = "PENDING";
                object.name = goalData.fullContactsList[i].mayaUserName;
                object.esiAmount = "";
                object.esiStatus = "OFF";
            }

            object.frequency = goalData.frequencyType;
            object.contributionAmount = goalData.fullContactsList[i].amount;
            object.userId = goalData.fullContactsList[i].mayaUserId;
            object.hpNo = goalData.fullContactsList[i].phoneNumber;

            participantsList.push(object);
        }

        request.participants = participantsList;
        request.linkedAcctNo = formateAccountNumber(goalData.accountNo, 12);
        request.linkedAcctName = goalData.accountName;
        console.log("get api params [Confirmation] create goal request obj ", request);
        return request;
    };

    //S2U V4
    initS2UPull = async (s2uInitResponse) => {
        const {
            navigation: { navigate },
        } = this.props;
        if (s2uInitResponse?.s2uRegistrationDetails?.isActive) {
            if (s2uInitResponse?.s2uRegistrationDetails?.isUnderCoolDown) {
                //S2U under cool down period
                navigateToS2UCooling(navigate);
            } else {
                const challengeRes = await initChallenge();
                console.log("challenge res goal", challengeRes);
                if (challengeRes?.message) {
                    showErrorToast({ message: challengeRes?.message });
                } else {
                    console.log("init s2upull challengeRes", challengeRes);
                    this.setState({ mapperData: challengeRes?.mapperData, isS2uV4: true });
                }
            }
        } else {
            //Redirect user to S2U registration flow
            this.doS2uRegistration(navigate);
        }
    };

    //S2U V4
    doS2uRegistration = (navigate) => {
        const redirect = {
            succStack: navigationConstant.GOALS_MODULE,
            succScreen: navigationConstant.CREATE_GOALS_CONFIRMATION,
        };
        navigateToS2UReg(navigate, this.props?.route?.params, redirect, this.props.getModel);
    };

    //S2U V4
    onS2uClose = () => {
        this.setState({ isS2uV4: false });
    };

    //S2U V4
    onS2uDone = (response) => {
        const { executePayload } = response;
        console.log("executePayload", executePayload);
        // Close S2u popup
        this.onS2uClose();
        if (executePayload.code === 422 || executePayload.code === 423) {
            this._goalCreationFailed(executePayload);
        } else {
            this.navigateToAcknowledgementScreen(response);
        }
    };

    //S2U V4
    navigateToAcknowledgementScreen = (response) => {
        console.log("nav2ackscreen response", response);
        const { transactionStatus, executePayload } = response;
        const entryPoint = {
            entryStack: navigationConstant.DASHBOARD,
            entryScreen: navigationConstant.TAB,
            params: {
                screen: navigationConstant.TABUNG_TAB,
                params: {
                    refresh: true,
                },
            },
        };
        const ackDetails = {
            executePayload,
            transactionSuccess: transactionStatus,
            entryPoint,
            navigate: this.props.navigation.navigate,
        };
        if (executePayload?.executed) {
            if (executePayload.code === 0) {
                this.successScreen(executePayload);
                return;
            }
            ackDetails.titleMessage = executePayload?.message || TABUNG_CREATE_FAILURE;
            ackDetails.transactionSuccess = executePayload?.code === 0;
        }
        console.log("ackDetails", ackDetails);
        handleS2UAcknowledgementScreen(ackDetails);
    };

    _toggleESI = () => {
        const { esiEnabled } = this.state;
        const { goalData } = this.state;

        goalData.esiEnabled = !esiEnabled;
        this._updateGoalDataContext(goalData);

        this.setState({ esiEnabled: goalData.esiEnabled });
    };

    _cancelTabung = () => {
        this.setState({ close: false });

        const { goalData } = this.state;

        if (goalData.goalFlow === 2) {
            this.props.navigation.navigate("TabungStack", {
                screen: "TabungMain",
            });
        } else {
            this.props.navigation.navigate("Dashboard", {
                screen: "TabungTab",
            });
        }

        // Reset context
        console.log("Resetting Context!");
        this._resetGoalDataContext();
    };

    _onPressTncLink = () => {
        const params = {
            file: "https://www.maybank2u.com.my/iwov-resources/pdf/upload/maeapp/MAEApp_Terms&Conditions_202009.pdf",
            share: false,
            type: "url",
            title: "Terms & Conditions",
            pdfType: "shareReceipt",
        };

        this.props.navigation.navigate(navigationConstant.COMMON_MODULE, {
            screen: navigationConstant.PDF_VIEW,
            params: { params },
        });
    };

    _resetGoalDataContext = () => {
        const { resetModel } = this.props;
        resetModel(["goals"]);

        console.log("Context reset!");
        const { getModel } = this.props;
        const { goalData } = getModel("goals");
        console.log("goalData is now... ", goalData);
    };

    renderWhosSaving() {
        console.log("renderWhosSaving");
        const { goalData } = this.state;

        return (
            <View style={styles.whosSavingContainer}>
                <View style={styles.whosSavingTitleContainer}>
                    <Typo
                        fontSize={16}
                        lineHeight={18}
                        fontWeight="600"
                        textAlign="left"
                        text="Who's saving?"
                    />
                </View>
                <View style={styles.whosSavingContentContainer}>
                    <FlatList
                        style={styles.whosSavingFlatList}
                        data={goalData.fullContactsList}
                        showIndicator={false}
                        keyExtractor={(item, index) => `${item.contentId}-${index}`}
                        renderItem={({ item }) => (
                            <View style={styles.whosSavingItemContainer}>
                                <BorderedAvatar
                                    width={44}
                                    height={44}
                                    borderRadius={22}
                                    backgroundColor={GREY}
                                >
                                    {item.profilePicUrl && item.profilePicUrl !== ""
? (
                                        <Image
                                            style={styles.newTransferCircle}
                                            source={{ uri: item.profilePicUrl }}
                                        />
                                    )
: (
                                        <Typo
                                            fontSize={14}
                                            lineHeight={22}
                                            fontWeight="300"
                                            text={item.initials}
                                        />
                                    )}
                                </BorderedAvatar>

                                <View style={styles.whosSavingInnerContainerLeft}>
                                    <Typo
                                        fontSize={14}
                                        lineHeight={19}
                                        textAlign="left"
                                        text={item.mayaUserName}
                                    />
                                </View>
                                <View style={styles.whosSavingInnerContainerRight}>
                                    <Typo
                                        fontSize={14}
                                        fontWeight="600"
                                        lineHeight={18}
                                        textAlign="right"
                                        text={"RM " + numeral(item.amount).format("0,0.00")}
                                    />
                                </View>
                            </View>
                        )}
                    />
                </View>
            </View>
        );
    }

    render() {
        const {
            goalData,
            isRSARequired,
            showOTP,
            loading,
            showS2UModal,
            s2uToken,
            secure2uValidateData,
            s2uTransactionDetails,
            showInitLoader,
            mapperData,
            nonTxnData,
            isS2uV4,
            isS2UDown,
        } = this.state;

        return (
            <React.Fragment>
                <ScreenContainer
                    backgroundType="color"
                    backgroundColor={MEDIUM_GREY}
                    showLoaderModal={loading || showInitLoader}
                    analyticScreenName={FA_TABUNG_CREATE_TABUNG_REVIEWDETAILS}
                >
                    <ScreenLayout
                        paddingBottom={0}
                        paddingTop={0}
                        paddingHorizontal={0}
                        header={
                            <HeaderLayout
                                headerLeftElement={
                                    goalData &&
                                    !(
                                        goalData.esiActivation === true ||
                                        goalData.esiDiactivation === true
                                    ) && <HeaderBackButton onPress={this._onPressBack} />
                                }
                                headerCenterElement={
                                    <Typo
                                        text="Confirmation"
                                        fontWeight="600"
                                        fontSize={16}
                                        lineHeight={19}
                                    />
                                }
                                headerRightElement={
                                    <HeaderCloseButton onPress={this._onPressClose} />
                                }
                            />
                        }
                        useSafeArea
                    >
                        {goalData && (
                            <>
                                <ScrollView showsVerticalScrollIndicator={false}>
                                    <View style={styles.container}>
                                        <View style={styles.rowListContainer}>
                                            <View style={styles.rowListItemLeftContainer}>
                                                <Typo
                                                    fontSize={14}
                                                    lineHeight={19}
                                                    textAlign="left"
                                                    text="Name"
                                                />
                                            </View>
                                            <View style={styles.rowListItemRightContainer}>
                                                <Typo
                                                    fontSize={14}
                                                    fontWeight="600"
                                                    lineHeight={18}
                                                    textAlign="right"
                                                    text={goalData.goalName}
                                                />
                                            </View>
                                        </View>
                                        <View style={styles.rowListContainer}>
                                            <View style={styles.rowListItemLeftContainer}>
                                                <Typo
                                                    fontSize={14}
                                                    lineHeight={19}
                                                    textAlign="left"
                                                    text="Target amount"
                                                />
                                            </View>
                                            <View style={styles.rowListItemRightContainer}>
                                                <Typo
                                                    fontSize={14}
                                                    fontWeight="600"
                                                    lineHeight={18}
                                                    textAlign="right"
                                                    text={
                                                        "RM " +
                                                        numeral(goalData.goalAmount).format(
                                                            "0,0.00"
                                                        )
                                                    }
                                                />
                                            </View>
                                        </View>

                                        {goalData.esiActivation === true ||
                                            (goalData.esiDiactivation === true && (
                                                <View style={styles.rowListContainer}>
                                                    <View style={styles.rowListItemLeftContainer}>
                                                        <Typo
                                                            fontSize={14}
                                                            lineHeight={19}
                                                            textAlign="left"
                                                            text="Your contribution"
                                                        />
                                                    </View>
                                                    <View style={styles.rowListItemRightContainer}>
                                                        <Typo
                                                            fontSize={14}
                                                            fontWeight="600"
                                                            lineHeight={18}
                                                            textAlign="right"
                                                            text={
                                                                "RM " +
                                                                numeral(goalData.youAmount).format(
                                                                    "0,0.00"
                                                                )
                                                            }
                                                        />
                                                    </View>
                                                </View>
                                            ))}

                                        <View style={styles.rowListContainer}>
                                            <View style={styles.rowListItemLeftContainer}>
                                                {goalData.esiActivation === true ||
                                                goalData.esiDiactivation === true
? (
                                                    <Typo
                                                        fontSize={14}
                                                        lineHeight={19}
                                                        textAlign="left"
                                                        text="Next deduction"
                                                    />
                                                )
: (
                                                    <Typo
                                                        fontSize={14}
                                                        lineHeight={19}
                                                        textAlign="left"
                                                        text="Start date"
                                                    />
                                                )}
                                            </View>
                                            <View style={styles.rowListItemRightContainer}>
                                                <Typo
                                                    fontSize={14}
                                                    fontWeight="600"
                                                    lineHeight={18}
                                                    textAlign="right"
                                                    text={goalData.goalStart}
                                                />
                                            </View>
                                        </View>

                                        {goalData.typeCode != 3 && (
                                            <View style={styles.rowListContainer}>
                                                <View style={styles.rowListItemLeftContainer}>
                                                    {goalData.esiActivation === true ||
                                                    goalData.esiDiactivation === true
? (
                                                        <Typo
                                                            fontSize={14}
                                                            lineHeight={19}
                                                            textAlign="left"
                                                            text="Last deduction"
                                                        />
                                                    )
: (
                                                        <Typo
                                                            fontSize={14}
                                                            lineHeight={19}
                                                            textAlign="left"
                                                            text="End date"
                                                        />
                                                    )}
                                                </View>

                                                <View style={styles.rowListItemRightContainer}>
                                                    <Typo
                                                        fontSize={14}
                                                        fontWeight="600"
                                                        lineHeight={18}
                                                        textAlign="right"
                                                        text={goalData.goalEnd}
                                                    />
                                                </View>
                                            </View>
                                        )}

                                        {goalData.esiActivation === false &&
                                            goalData.esiDiactivation === false && (
                                                <View style={styles.rowListContainer}>
                                                    <View style={styles.rowListItemLeftContainer}>
                                                        <Typo
                                                            fontSize={14}
                                                            lineHeight={19}
                                                            textAlign="left"
                                                            text="Linked account"
                                                        />
                                                    </View>
                                                    <View style={styles.rowListItemRightContainer}>
                                                        <Typo
                                                            fontSize={14}
                                                            fontWeight="600"
                                                            lineHeight={18}
                                                            textAlign="right"
                                                            text={
                                                                goalData.accountName +
                                                                "\n" +
                                                                formateAccountNumber(
                                                                    goalData.accountNo,
                                                                    12
                                                                )
                                                            }
                                                        />
                                                    </View>
                                                </View>
                                            )}
                                    </View>

                                    {((goalData.esiActivation === false &&
                                        goalData.esiDiactivation === false) ||
                                        goalData.joinGoal === true) &&
                                        goalData.fullContactsList &&
                                        goalData.fullContactsList.length > 1 &&
                                        this.renderWhosSaving()}

                                    <View style={styles.line} />

                                    <View style={styles.block}>
                                        <Typo
                                            fontSize={14}
                                            lineHeight={19}
                                            textAlign="left"
                                            text="Select frequency"
                                        />
                                    </View>

                                    <View style={styles.frequencyButtonContainer}>
                                        <ActionButton
                                            fullWidth
                                            height={48}
                                            borderWidth={1}
                                            borderStyle="solid"
                                            borderRadius={24}
                                            backgroundColor={WHITE}
                                            borderColor="#cfcfcf"
                                            componentLeft={
                                                <View style={styles.frequencyContainer}>
                                                    <Typo
                                                        fontSize={14}
                                                        fontWeight="600"
                                                        lineHeight={18}
                                                        text={this.state.frequency}
                                                        textAlign="left"
                                                    />
                                                </View>
                                            }
                                            componentRight={
                                                <Image
                                                    source={assets.downArrow}
                                                    style={styles.dropDownArrowImage}
                                                />
                                            }
                                            onPress={() => {
                                                this.setState({
                                                    dropDownView: true,
                                                });
                                            }}
                                            disable={goalData.esiDiactivation === true}
                                        />
                                    </View>

                                    {goalData.esiActivation === false &&
                                        goalData.esiDiactivation === false && (
                                            <View style={styles.esiContainer}>
                                                <TouchableOpacity onPress={this._toggleESI}>
                                                    <View style={styles.toggleEsiContainer}>
                                                        <Image
                                                            style={styles.esiImage}
                                                            source={
                                                                this.state.esiEnabled
                                                                    ? assets.icRadioChecked
                                                                    : assets.icRadioUnchecked
                                                            }
                                                        />
                                                        <Typo
                                                            fontSize={14}
                                                            fontWeight="600"
                                                            lineHeight={18}
                                                            textAlign="left"
                                                            text="Auto Deduction (optional)"
                                                        />
                                                    </View>
                                                </TouchableOpacity>

                                                <View style={styles.descriptionContainer}>
                                                    <Typo
                                                        fontSize={14}
                                                        lineHeight={20}
                                                        textAlign="left"
                                                        text="Never worry about forgetting to save for your goal again."
                                                    />

                                                    <View style={styles.subDescriptionContainer}>
                                                        {this.state.esiEnabled && (
                                                            <Typo
                                                                fontSize={12}
                                                                fontWeight="600"
                                                                lineHeight={18}
                                                                textAlign="left"
                                                                text={`First deduction will start on ${goalData.goalStart}`}
                                                            />
                                                        )}
                                                    </View>
                                                    <TouchableOpacity
                                                        onPress={this._onPressTncLink}
                                                    >
                                                        <Typo
                                                            fontSize={12}
                                                            lineHeight={18}
                                                            textAlign="left"
                                                            textDecorationLine="underline"
                                                            color={DARKEST_GRAY}
                                                            style={styles.tncText}
                                                            text="I agree to the Terms & Conditions"
                                                        />
                                                    </TouchableOpacity>
                                                </View>
                                            </View>
                                        )}

                                    {(this.state.esiEnabled === true ||
                                        goalData.esiActivation === true) && (
                                        <>
                                            <View style={styles.bottomView}>
                                                <Typo
                                                    fontSize={14}
                                                    lineHeight={18}
                                                    fontWeight="600"
                                                    textAlign="left"
                                                    text={TRANSFER_FROM}
                                                />
                                            </View>
                                            <FlatList
                                                style={styles.accountsFlatlist}
                                                data={this.state.accountList}
                                                extraData={this.state}
                                                horizontal={true}
                                                scrollToIndex={0}
                                                showsHorizontalScrollIndicator={false}
                                                showIndicator={false}
                                                keyExtractor={(item, index) =>
                                                    `${item.contentId}-${index}`
                                                }
                                                renderItem={({ item, index }) => (
                                                    <TabungAccountDetailList
                                                        item={item}
                                                        index={index}
                                                        scrollToIndex={3}
                                                        onPress={() =>
                                                            this.onAccountListClick(item)
                                                        }
                                                    />
                                                )}
                                                ListHeaderComponent={
                                                    <View style={styles.listMarginComponent} />
                                                }
                                                ListFooterComponent={
                                                    <View style={styles.listMarginComponent} />
                                                }
                                            />
                                        </>
                                    )}

                                    <View style={styles.bottomMarginComponent} />
                                </ScrollView>

                                <FixedActionContainer>
                                    <ActionButton
                                        height={48}
                                        fullWidth
                                        backgroundColor={YELLOW}
                                        borderRadius={24}
                                        componentCenter={
                                            <Typo
                                                fontSize={14}
                                                fontWeight="600"
                                                fontStyle="normal"
                                                letterSpacing={0}
                                                lineHeight={18}
                                                text={
                                                    goalData.goalFlow === 2
                                                        ? JOIN_TABUNG
                                                        : goalData.esiActivation === false &&
                                                          goalData.esiDiactivation === false
                                                        ? CREATE_TABUNG
                                                        : goalData.esiActivation === true
                                                        ? TABUNG_ENABLE_AUTODEDUCTION
                                                        : TABUNG_DISABLE_AUTODEDUCTION
                                                }
                                            />
                                        }
                                        onPress={this._onPressContinue}
                                        disabled={this.state.loading}
                                    />
                                </FixedActionContainer>
                            </>
                        )}
                    </ScreenLayout>
                </ScreenContainer>

                {/* OTP Modal */}
                {showOTP && (
                    <OtpModal
                        otpCode={this.state.otpValue}
                        onOtpDonePress={this.onOTPDone}
                        onOtpClosePress={this.onOTPClose}
                        onResendOtpPress={this.onOTPResend}
                        mobileNumber={maskedMobileNumber(this.state.mobileNumber)}
                        isS2UDown= {isS2UDown}
                    />
                )}

                {isRSARequired && (
                    <ChallengeQuestion
                        loader={this.state.isRSALoader}
                        display={this.state.isRSARequired}
                        displyError={this.state.RSAError}
                        questionText={this.state.challengeQuestion}
                        onSubmitPress={this.onChallengeQuestionSubmitPress}
                        onSnackClosePress={this.onChallengeSnackClosePress}
                    />
                )}

                {this.state.maeError == true
? (
                    <ErrorMessage
                        onClose={() => {
                            this.setState({ maeError: false });
                        }}
                        title={APP_NAME_ALERTS}
                        description="You have exceeded the maximum transaction limit for MAE"
                        showOk={true}
                        onOkPress={() => {
                            this.setState({ maeError: false });
                        }}
                    />
                )
: null}

                {this.state.error == true
? (
                    <ErrorMessage
                        onClose={() => {
                            this.setState({ error: false });
                        }}
                        title="Select Frequency"
                        description={this.state.errorMessage}
                        showOk={true}
                        onOkPress={() => {
                            this.setState({ error: false });
                        }}
                    />
                )
: null}

                <ScrollPickerView
                    showMenu={this.state.dropDownView}
                    list={this.state.frequencyList}
                    selectedIndex={this.state.selectedIndex}
                    onRightButtonPress={(value, index) =>
                        this._onPressDoneScrollPickerView(value, index)
                    }
                    onLeftButtonPress={this._onPressCloseScrollPickerView}
                    rightButtonText="Done"
                    leftButtonText="Cancel"
                />

                {showS2UModal && (
                    <Secure2uAuthenticationModal
                        customTitle="Tabung Setup"
                        token={s2uToken}
                        amount={goalData.goalAmount}
                        onS2UDone={this._onS2UConfirmation}
                        s2uPollingData={secure2uValidateData}
                        transactionDetails={s2uTransactionDetails}
                        extraParams={{
                            metadata: {
                                txnType: "GOALS2UCREATION",
                            },
                        }}
                    />
                )}

                {isS2uV4 && (
                    <Secure2uAuthenticationModal
                        token={s2uToken}
                        onS2UDone={this.onS2uDone}
                        s2uPollingData={mapperData}
                        transactionDetails={mapperData}
                        extraParams={{
                            metadata: {
                                txnType: "GOALS2UCREATION",
                            },
                        }}
                        onS2uClose={this.onS2uClose}
                        secure2uValidateData={mapperData}
                        nonTxnData={nonTxnData}
                        s2uEnablement={true}
                        navigation={this.props.navigation}
                    />
                )}

                {this.state.close === true && (
                    <Popup
                        visible={true}
                        onClose={this._toggleCloseModal}
                        title={UNSAVED_CHANGES}
                        description="Are you sure you want to leave this page? Any unsaved changes will be discarded."
                        primaryAction={{
                            text: "Discard",
                            onPress: this._cancelTabung,
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

const styles = StyleSheet.create({
    accountsFlatlist: {
        overflow: "visible",
    },
    block: { flexDirection: "column", marginHorizontal: 36, marginTop: 24 },
    bottomView: {
        flexDirection: "column",
        marginHorizontal: 36,
        marginTop: 24,
    },
    container: {
        alignItems: "center",
        justifyContent: "center",
        marginHorizontal: 36,
        marginTop: 10,
    },
    descriptionContainer: {
        marginLeft: 28,
        marginTop: 4,
    },
    dropDownArrowImage: {
        height: 8,
        marginRight: 20,
        resizeMode: "contain",
        width: 15,
    },
    esiContainer: {
        marginHorizontal: 36,
    },
    frequencyButtonContainer: {
        flexDirection: "row",
        justifyContent: "center",
        marginBottom: 24,
        marginHorizontal: 36,
        marginTop: 16,
    },
    line: {
        borderColor: "#cccccc",
        borderWidth: StyleSheet.hairlineWidth,
        marginHorizontal: 36,
        marginTop: 24,
    },
    listMarginComponent: {
        width: 24,
    },
    newTransferCircle: {
        borderRadius: 20,
        height: 40,
        resizeMode: "contain",
        width: 40,
    },
    rowListContainer: {
        flex: 1,
        flexDirection: "row",
        marginTop: 20,
    },
    rowListItemLeftContainer: {
        flex: 0.4,
    },
    rowListItemRightContainer: {
        alignContent: "flex-end",
        alignItems: "flex-end",
        flex: 0.6,
    },
    subDescriptionContainer: {
        marginBottom: 4,
        marginTop: 4,
    },
    whosSavingContainer: {
        marginTop: 24,
    },
    whosSavingContentContainer: {
        marginTop: 22,
        overflow: "visible",
    },
    whosSavingFlatList: { overflow: "visible" },
    whosSavingInnerContainerLeft: {
        flex: 1,
        flexDirection: "column",
        justifyContent: "center",
        marginLeft: 14,
    },
    whosSavingInnerContainerRight: {
        alignItems: "flex-end",
        flexDirection: "column",
        justifyContent: "center",
    },
    whosSavingItemContainer: {
        alignItems: "center",
        flexDirection: "row",
        height: 50,
        justifyContent: "center",
        marginBottom: 15,
        overflow: "visible",
        paddingHorizontal: 36,
    },
    whosSavingTitleContainer: { paddingHorizontal: 36 },
    frequencyContainer: { marginLeft: 24 },
    toggleEsiContainer: {
        flexDirection: "row",
        alignItems: "center",
    },
    esiImage: {
        height: 20,
        width: 20,
        marginRight: 8,
    },
    tncText: {
        textDecorationLine: "underline",
    },
    bottomMarginComponent: { height: 50 },
});

export default withModelContext(Confirmation);
