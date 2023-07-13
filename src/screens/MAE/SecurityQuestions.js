import moment from "moment";
import PropTypes from "prop-types";
import React, { Component } from "react";
import {
    View,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Image,
    Keyboard,
    Platform,
} from "react-native";
import DeviceInfo from "react-native-device-info";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import LinearGradient from "react-native-linear-gradient";

import { navigateToS2UCooling, navigateToS2UReg } from "@screens/OneTapAuth/CoolingNavigator";
import {
    handleCasaUserWithoutM2U,
    isNTBUser,
    isWithoutM2UUser,
} from "@screens/Premier/helpers/premierHelpers";
import {
    APPLY_M2U_COMPLETED,
    APPLY_M2U_SECURITY_QUESTIONS,
    MAKE_AN_APPOINTMENT,
} from "@screens/ZestCASA/helpers/AnalyticsEventConstants";

import * as navigationConstant from "@navigation/navigationConstant";

import HeaderLayout from "@layouts/HeaderLayout";
import ScreenLayout from "@layouts/ScreenLayout";

import ActionButton from "@components/Buttons/ActionButton";
import HeaderBackButton from "@components/Buttons/HeaderBackButton";
import HeaderCloseButton from "@components/Buttons/HeaderCloseButton";
import ScreenContainer from "@components/Containers/ScreenContainer";
import OtpModal from "@components/Modals/OtpModal";
import Secure2uAuthenticationModal from "@components/Modals/Secure2uAuthenticationModal";
import ScrollPicker from "@components/Pickers/ScrollPicker";
import Typo from "@components/Text";
import TextInput from "@components/TextInput";
import { showErrorToast, showSuccessToast } from "@components/Toast";
import { withModelContext } from "@context";

import {
    retrieveSecurityQuestions,
    updateSecurityQuestions,
    registerRSA,
    requestTAC,
    registerCasaRSA,
} from "@services";
import { logEvent } from "@services/analytics";
import { GASettingsScreen } from "@services/analytics/analyticsSettings";

import { STATUS_CODE_SUCCESS } from "@constants/api";
import {
    YELLOW,
    DISABLED,
    BLACK,
    WHITE,
    DISABLED_TEXT,
    MEDIUM_GREY,
    TRANSPARENT,
    GREY,
} from "@constants/colors";
import { LOAN_FD, M2U, S2U_PUSH, SELECT, SMS_TAC } from "@constants/data";
import { FN_CHANGE_SQ } from "@constants/fundConstants";
import {
    PM1_DRAFT_USER,
    PM1_NTB_USER,
    PMA_NTB_USER,
    PMA_DRAFT_USER,
    KAWANKU_SAVINGS_NTB_USER,
    KAWANKU_SAVINGS_DRAFT_USER,
    KAWANKU_SAVINGSI_NTB_USER,
    KAWANKU_SAVINGSI_DRAFT_USER,
} from "@constants/premierConfiguration";
import { PM1, PMA } from "@constants/premierStrings";
import {
    APPLICATION_SUCCESSFUL,
    EZYQ,
    FA_ACTION_NAME,
    FA_FORM_COMPLETE,
    FA_SCREEN_NAME,
    FA_SELECT_ACTION,
    FA_VIEW_SCREEN,
    M2U_PREMIER,
    YES,
    ZEST,
    ZEST_CASA_VISIT_BRANCH_DESCRIPTION,
    FA_SETTINGS_CHANGE_SECURITYQUESTION,
    FA_APPLY_M2U_SECURITY_QUESTION,
    COMMON_ERROR_MSG,
    SETTINGS,
    UPDATE_DETAILS,
    SECURITY_QUESTION_SUCCESSFUL,
    SECURITY_QUESTION_UNSUCCESSFUL,
    INVALID_SPECIAL_CHAR_ERR_MSG,
    IDENTITY_MSG,
    CHANGE_SECURITY_QUESTIONS,
    SETUP_SECURITY_QUESTIONS,
    SECURITY_QUESTION_1,
    SECURITY_QUESTION_2,
    SECURITY_QUESTION_3,
    CONTINUE,
    SECURITY_QUESTION_SAVED,
} from "@constants/strings";
import { EZYQ_URL } from "@constants/url";
import { ZEST_NTB_USER } from "@constants/zestCasaConfiguration";

import { maskedMobileNumber } from "@utils";
import { isPureHuawei } from "@utils/checkHMSAvailability";
import * as DataModel from "@utils/dataModel";
import {
    handleS2UAcknowledgementScreen,
    init,
    initChallenge,
    s2uSdkLogs,
} from "@utils/dataModel/s2uSDKUtil";
import * as Utility from "@utils/dataModel/utility";
// import { getMobileSdkParams } from "@utils";
import { getDeviceRSAInformation } from "@utils/dataModel/utility";

import Assets from "@assets";

import * as MAEOnboardController from "./Onboarding/MAEOnboardController";

class SecurityQuestions extends Component {
    static propTypes = {
        getModel: PropTypes.func,
        updateModel: PropTypes.func,
        route: PropTypes.object,
        navigation: PropTypes.any,
    };
    static navigationOptions = () => ({
        title: "",
        header: null,
    });

    casaUsers = [
        PM1_NTB_USER,
        PMA_NTB_USER,
        PM1_DRAFT_USER,
        PMA_DRAFT_USER,
        KAWANKU_SAVINGS_NTB_USER,
        KAWANKU_SAVINGS_DRAFT_USER,
        KAWANKU_SAVINGSI_NTB_USER,
        KAWANKU_SAVINGSI_DRAFT_USER,
    ];
    isCASA = false;
    constructor(props) {
        super(props);
        this.isCASA = this.casaUsers.includes(
            props.route.params?.filledUserDetails?.onBoardDetails2?.from
        );

        this.state = {
            filledUserDetails: props.route.params?.filledUserDetails,

            isNextDisabled: true,

            question1: SELECT,
            question2: SELECT,
            question3: SELECT,

            question1id: "",
            question2id: "",
            question3id: "",

            question1Data: [],
            question2Data: [],
            question3Data: [],

            answer1: "",
            answer2: "",
            answer3: "",

            isValidAnswer1: "",
            isValidAnswer2: "",
            isValidAnswer3: "",

            question1DisplayPicker: false,
            question2DisplayPicker: false,
            question3DisplayPicker: false,

            showTACModal: false,
            token: null,
            maskedMobileNo: null,

            // S2U V4
            showS2UModal: false,
            mapperData: {},
            nonTxnData: { isNonTxn: true },
            isS2UDown: false,
        };

        if (
            props.route.params?.filledUserDetails?.onBoardDetails2?.from === ZEST_NTB_USER ||
            isNTBUser(props.route.params?.filledUserDetails?.onBoardDetails2?.from)
        ) {
            logEvent(FA_VIEW_SCREEN, {
                [FA_SCREEN_NAME]: APPLY_M2U_SECURITY_QUESTIONS,
            });
        }
    }

    componentDidMount() {
        const { filledUserDetails } = this.state;
        if (this.props.route.params?.username) {
            const usernameDetails = {
                username: this.props.route.params?.username,
                password: this.props.route.params?.pw,
            };
            filledUserDetails.usernameDetails = usernameDetails;
        }

        if (filledUserDetails.from === UPDATE_DETAILS) {
            this.updateUserDetails();
        } else if (filledUserDetails.rsaIndicator && filledUserDetails.rsaIndicator !== 0) {
            this.enrollmentCall();
        } else if (filledUserDetails.from === SETTINGS) {
            this.getSecurityQuestions();
        } else {
            this.registerRSA();
        }
    }

    updateUserDetails = async () => {
        const { filledUserDetails } = this.state;
        if (filledUserDetails.rsaIndicator && filledUserDetails.rsaIndicator !== 0) {
            this.getSecurityQuestions();
        } else {
            this.registerRSA();
        }
    };
    registerRSA = () => {
        const { filledUserDetails } = this.state;
        const { deviceInformation, deviceId } = this.props.getModel("device");
        const mobileSDKData = Utility.securityQuestionsRSAInfo(
            deviceInformation,
            DeviceInfo,
            deviceId
        );
        const params = {
            mobileSDKData,
            username: filledUserDetails.usernameDetails.username,
            deviceId,
            customerId: filledUserDetails.onBoardDetails2.idNo,
        };

        const registerRSAMethod = this.isCASA ? registerCasaRSA : registerRSA;

        registerRSAMethod(params)
            .then((response) => {
                console.log("[SecurityQuestions][getSecurityQuestions] >> Success");
                const result = response?.data?.result;
                if (result.statusCode === STATUS_CODE_SUCCESS) {
                    if (filledUserDetails.from === UPDATE_DETAILS) {
                        this.getSecurityQuestions();
                    } else {
                        this.enrollmentCall();
                    }
                } else {
                    throw new Error(result.statusDesc);
                }
            })
            .catch(() => {
                console.log("[SecurityQuestions][getSecurityQuestions] >> Failure");
                if (filledUserDetails.from === UPDATE_DETAILS) {
                    this.getSecurityQuestions();
                } else {
                    this.enrollmentCall();
                }
            });
    };

    enrollmentCall = async () => {
        const { updateModel } = this.props;
        const { filledUserDetails } = this.state;
        // const deviceInformation = this.props.getModel("device");
        const { deviceInformation, deviceId } = this.props.getModel("device");
        // const mobileSDKData = getMobileSdkParams({ ...deviceInformation, deviceId });
        const mobileSDKData = getDeviceRSAInformation({
            ...deviceInformation,
            DeviceInfo,
            deviceId,
        });
        const response = await MAEOnboardController.enrollmentCall(
            filledUserDetails,
            mobileSDKData
        );
        if (response.message) {
            showErrorToast({
                message: response.message,
            });
        } else {
            const {
                access_token: accessToken,
                refresh_token: refreshToken,
                cus_key: cusKey,
                contact_number: contactNumber,
            } = response.data;
            updateModel({
                auth: {
                    token: accessToken,
                    refreshToken,
                    customerKey: cusKey,
                },
                m2uDetails: {
                    m2uPhoneNumber: contactNumber,
                },
            });
            const { filledUserDetails } = this.state;
            filledUserDetails.authData = response.data;
            this.getSecurityQuestions();
        }
    };

    getSecurityQuestions = () => {
        const { filledUserDetails } = this.state;
        const { deviceInformation, deviceId } = this.props.getModel("device");
        const mobileSDKData = Utility.securityQuestionsRSAInfo(
            deviceInformation,
            DeviceInfo,
            deviceId
        );

        const { username } =
            filledUserDetails?.from === SETTINGS
                ? this.props.getModel("user")
                : filledUserDetails.usernameDetails;

        const params = {
            mobileSDKData,
            username,
            deviceId,
        };

        retrieveSecurityQuestions(params)
            .then((response) => {
                const result = response?.data?.result;
                if (result.statusCode === STATUS_CODE_SUCCESS) {
                    const questionsList =
                        response.data.result?.retrieveQuestionsResult?.questionsList;

                    const dropdownData = questionsList.map((items) => {
                        return filledUserDetails?.from === SETTINGS
                            ? items.challengeQuestion.slice(0, 5)
                            : items.challengeQuestion;
                    });

                    this.setState({
                        question1Data: this.scrollPickerData(dropdownData[0]) || [],
                        question2Data: this.scrollPickerData(dropdownData[1]) || [],
                        question3Data: this.scrollPickerData(dropdownData[2]) || [],
                    });
                } else {
                    throw new Error(result.statusDesc);
                }
            })
            .catch((error) => {
                showErrorToast({
                    message: error.message,
                });
            });
    };

    updateSecurityQuestions = (code = "", otpModalErrorCb = () => {}) => {
        const {
            filledUserDetails,
            question1id,
            question2id,
            question3id,
            answer1,
            answer2,
            answer3,
        } = this.state;
        const { deviceInformation, deviceId } = this.props.getModel("device");
        const mobileSDKData = Utility.securityQuestionsRSAInfo(
            deviceInformation,
            DeviceInfo,
            deviceId
        );

        console.log("TAC", code);

        const challengeQuestion1 = {
            questionId: question1id,
            userAnswer: answer1,
        };
        const challengeQuestion2 = {
            questionId: question2id,
            userAnswer: answer2,
        };
        const challengeQuestion3 = {
            questionId: question3id,
            userAnswer: answer3,
        };

        const challengeQuestion = [challengeQuestion1, challengeQuestion2, challengeQuestion3];
        let params = {};

        if (filledUserDetails?.from === SETTINGS) {
            const { username } = this.props.getModel("user");
            params = { tac: code, username, mobileSDKData, challengeQuestion };
        } else {
            params = {
                mobileSDKData,
                username: filledUserDetails?.usernameDetails.username,
                deviceId,
                challengeQuestion,
            };
        }

        console.log("PARAMS", params);

        updateSecurityQuestions(params)
            .then((response) => {
                console.log("[SecurityQuestions][updateSecurityQuestions] >> Success");
                const result = response?.data?.result;
                if (result.statusCode === STATUS_CODE_SUCCESS) {
                    const filledUserDetails = this.prepareUserDetails();
                    if (
                        filledUserDetails?.from === UPDATE_DETAILS &&
                        filledUserDetails?.toScreenName
                    ) {
                        this.props.navigation.navigate(filledUserDetails?.toStackName, {
                            screen: filledUserDetails?.toScreenName,
                            params: { filledUserDetails },
                        });
                        return;
                    } else if (filledUserDetails?.from === UPDATE_DETAILS) {
                        const { applicant_type: applicantType } = filledUserDetails.loginData;
                        if (
                            applicantType === "1" ||
                            applicantType === "2" ||
                            applicantType === "3" ||
                            applicantType === "4"
                        ) {
                            this.props.navigation.navigate(navigationConstant.VIRTUAL_CARD_SCREEN, {
                                filledUserDetails,
                            });
                        } else {
                            this.resumeETBWOM2U(filledUserDetails);
                        }
                        return;
                    } else if (filledUserDetails?.from === SETTINGS) {
                        this.setState({ showTACModal: false });
                        showSuccessToast({
                            message: SECURITY_QUESTION_SAVED,
                        });
                        GASettingsScreen.onSuccessfulUpdateSecurityQuestion();
                        this.props.navigation.navigate(navigationConstant.DASHBOARD, {
                            screen: SETTINGS,
                        });
                        return;
                    }
                    const custInqRes = filledUserDetails?.onBoardDetails2?.maeCustomerInquiry;
                    const custStatus = custInqRes?.custStatus;
                    const m2uIndicator = custInqRes?.m2uIndicator;
                    const { isZoloz } = this.props.getModel("misc");

                    if (filledUserDetails?.onBoardDetails2?.from === LOAN_FD) {
                        const { isSignupCampaignPeriod } = this.props.getModel("misc");
                        if (isSignupCampaignPeriod) {
                            const { updateModel } = this.props;
                            updateModel({
                                misc: {
                                    isNewUser: true,
                                },
                            });
                            this.props.navigation.navigate(navigationConstant.ON_BOARDING_MODULE, {
                                screen: "OnboardingM2uSignUpCampaign",
                                params: {
                                    filledUserDetails,
                                    newUserStatus: true,
                                },
                            });
                        } else {
                            this.props.navigation.navigate(navigationConstant.MAE_SUCCESS2, {
                                filledUserDetails,
                            });
                        }
                    } else if (
                        (custInqRes.statusCode === "0C21" || custInqRes.statusCode === "0C02") &&
                        ((custStatus === "0" && m2uIndicator === "0") ||
                            (custStatus === "0" && m2uIndicator === "4") ||
                            (custStatus === "0" && m2uIndicator === "5") ||
                            (custStatus === "0" && m2uIndicator === "6") ||
                            (custStatus === "5" && m2uIndicator === "0") ||
                            (custStatus === "6" && m2uIndicator === "0"))
                    ) {
                        this.resumeETBWOM2U(filledUserDetails);
                    } else if (
                        this.state.filledUserDetails?.onBoardDetails2?.from === ZEST_NTB_USER
                    ) {
                        logEvent(FA_FORM_COMPLETE, {
                            [FA_SCREEN_NAME]: APPLY_M2U_COMPLETED,
                        });
                        if (this.state.filledUserDetails?.bookAppointmentAtBranch === YES) {
                            this.props.navigation.navigate(navigationConstant.ZEST_CASA_STACK, {
                                screen: navigationConstant.ZEST_CASA_SUCCESS,
                                params: {
                                    title: APPLICATION_SUCCESSFUL,
                                    description: ZEST_CASA_VISIT_BRANCH_DESCRIPTION,
                                    isHighRiskUser: true,
                                    accountNumber: filledUserDetails?.accountNumber,
                                    dateAndTime: moment().format("DD MMM YYYY, HH:mm A"),
                                    accountType: filledUserDetails?.onBoardDetails2?.isZestI
                                        ? ZEST
                                        : M2U_PREMIER,
                                    onBookAppointmentButtonDidTap: () => {
                                        logEvent(FA_SELECT_ACTION, {
                                            [FA_SCREEN_NAME]: APPLY_M2U_COMPLETED,
                                            [FA_ACTION_NAME]: MAKE_AN_APPOINTMENT,
                                        });
                                        const title = EZYQ;
                                        const url = `${EZYQ_URL}?serviceNum=2`;

                                        const paramSend = {
                                            title,
                                            source: url,
                                            headerColor: TRANSPARENT,
                                        };

                                        this.props.navigation.navigate(
                                            navigationConstant.SETTINGS_MODULE,
                                            {
                                                screen: "PdfSetting",
                                                params: paramSend,
                                            }
                                        );
                                    },
                                    analyticScreenName: APPLY_M2U_COMPLETED,
                                    needFormAnalytics: true,
                                },
                            });
                        } else {
                            this.props.navigation.navigate(navigationConstant.ZEST_CASA_STACK, {
                                screen: navigationConstant.ZEST_CASA_ACTIVATION_CHOICE,
                                params: { filledUserDetails },
                            });
                        }
                    } else if (
                        isWithoutM2UUser(this.state.filledUserDetails?.onBoardDetails2?.m2uStatus)
                    ) {
                        handleCasaUserWithoutM2U(
                            this.state.filledUserDetails?.onBoardDetails2?.m2uStatus,
                            this.state.filledUserDetails?.onBoardDetails2?.navigation
                        );
                    } else if (isNTBUser(this.state.filledUserDetails?.onBoardDetails2?.from)) {
                        if (
                            this.state.filledUserDetails?.bookAppointmentAtBranch === YES ||
                            (isPureHuawei && !isZoloz)
                        ) {
                            this.props.navigation.navigate(
                                navigationConstant.PREMIER_MODULE_STACK,
                                {
                                    screen: navigationConstant.PREMIER_M2U_SUCCESS,
                                    params: {
                                        title: APPLICATION_SUCCESSFUL,
                                        description: ZEST_CASA_VISIT_BRANCH_DESCRIPTION,
                                        isHighRiskUser: true,
                                        accountNumber: filledUserDetails?.accountNumber,
                                        dateAndTime: moment().format("DD MMM YYYY, HH:mm A"),
                                        accountType: filledUserDetails?.onBoardDetails2?.isPM1
                                            ? PM1
                                            : PMA,
                                        analyticScreenName: APPLY_M2U_COMPLETED,
                                        needFormAnalytics: true,
                                        onDoneButtonDidTap: () => {
                                            this.props.navigation.popToTop();
                                            this.props.navigation.navigate(
                                                filledUserDetails?.entryStack ||
                                                    navigationConstant.MORE,
                                                {
                                                    screen:
                                                        filledUserDetails?.entryScreen ||
                                                        navigationConstant.APPLY_SCREEN,
                                                    params: filledUserDetails?.entryParams,
                                                }
                                            );
                                        },
                                    },
                                }
                            );
                        } else {
                            this.props.navigation.navigate(
                                navigationConstant.PREMIER_MODULE_STACK,
                                {
                                    screen: navigationConstant.PREMIER_ACTIVATION_CHOICE,
                                    params: { filledUserDetails },
                                }
                            );
                        }
                    } else {
                        const { isSignupCampaignPeriod } = this.props.getModel("misc");
                        if (isSignupCampaignPeriod) {
                            const { updateModel } = this.props;
                            updateModel({
                                misc: {
                                    isNewUser: true,
                                },
                            });
                            // eslint-disable-next-line react/prop-types
                            this.props.navigation.navigate(navigationConstant.ON_BOARDING_MODULE, {
                                screen: "OnboardingM2uSignUpCampaign",
                                params: {
                                    filledUserDetails,
                                    newUserStatus: true,
                                },
                            });
                        } else {
                            this.props.navigation.navigate(navigationConstant.VIRTUAL_CARD_SCREEN, {
                                filledUserDetails,
                            });
                        }
                    }
                } else {
                    throw new Error(result.statusDesc);
                }
            })
            .catch((error) => {
                console.log("[SecurityQuestions][updateSecurityQuestions] >> Failure");
                if (filledUserDetails?.from === SETTINGS) {
                    otpModalErrorCb(error.message || COMMON_ERROR_MSG);
                }
                showErrorToast({
                    message: error.message,
                });
            });
    };
    resumeETBWOM2U = async (filledUserDetails) => {
        const data = {
            customerId: filledUserDetails?.onBoardDetails2?.idNo,
            mobileNo: filledUserDetails?.onBoardDetails?.mobileNumber,
        };
        const response = await MAEOnboardController.resumeMAE(data);
        if (response.message) {
            showErrorToast({
                message: response.message,
            });
        } else {
            const result = response.data.result;
            if (result.statusCode === STATUS_CODE_SUCCESS) {
                const { isSignupCampaignPeriod } = this.props.getModel("misc");
                if (isSignupCampaignPeriod) {
                    // eslint-disable-next-line react/prop-types
                    this.props.navigation.navigate(navigationConstant.ON_BOARDING_MODULE, {
                        screen: "OnboardingM2uSignUpCampaign",
                        params: {
                            filledUserDetails,
                        },
                    });
                } else {
                    filledUserDetails.MAEAccountCreateResult = result;
                    this.props.navigation.navigate(navigationConstant.MAE_SUCCESS2, {
                        filledUserDetails,
                    });
                }

                return;
            }
            showErrorToast({
                message: result.statusDesc,
            });
        }
    };

    onBackTap = () => {
        this.props.navigation.goBack();
    };

    onCloseTap = () => {
        const { filledUserDetails } = this.state;
        this.props.navigation.navigate(filledUserDetails?.entryStack || navigationConstant.MORE, {
            screen: filledUserDetails?.entryScreen || navigationConstant.APPLY_SCREEN,
            params: filledUserDetails?.entryParams,
        });
    };

    onContinueTap = () => {
        const { filledUserDetails } = this.state;
        const validateQuestions = this.validateAnswer();
        if (validateQuestions) {
            filledUserDetails?.from === SETTINGS
                ? this.initiateS2USdk()
                : this.updateSecurityQuestions();
        }
    };
    //S2U V4
    initiateS2USdk = async () => {
        try {
            const s2uInitResponse = await this.s2uSDKInit();
            if (s2uInitResponse?.message || s2uInitResponse.statusCode !== 0) {
                showErrorToast({
                    message: s2uInitResponse.message,
                });
            } else {
                if (s2uInitResponse?.actionFlow === SMS_TAC) {
                    const { getModel } = this.props;
                    const { isS2uV4ToastFlag } = getModel("misc");
                    this.setState({ isS2UDown: isS2uV4ToastFlag ?? false });
                    this.navigateTACFlow();
                } else if (s2uInitResponse?.actionFlow === S2U_PUSH) {
                    if (s2uInitResponse?.s2uRegistrationDetails?.app_id === M2U) {
                        this.doS2uRegistration(this.props.navigation.navigate);
                    }
                } else {
                    this.initS2UPull(s2uInitResponse);
                }
            }
        } catch (error) {
            console.log("Security questions s2u catch : ", error);
            s2uSdkLogs(error, "Security Questions");
        }
    };
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
                if (challengeRes?.message) {
                    showErrorToast({ message: challengeRes?.message });
                } else {
                    this.setState({
                        showS2UModal: true,
                        mapperData: challengeRes?.mapperData,
                    });
                }
            }
        } else {
            //Redirect user to S2U registration flow
            this.doS2uRegistration(navigate);
        }
    };

    doS2uRegistration = (navigate) => {
        const redirect = {
            succStack: navigationConstant.MAE_MODULE_STACK,
            succScreen: navigationConstant.MAE_SECURITY_QUESTIONS,
        };
        navigateToS2UReg(navigate, this?.route?.params, redirect);
    };

    //S2U V4
    s2uSDKInit = async () => {
        const { question1id, question2id, question3id, answer1, answer2, answer3 } = this.state;
        const challengeQuestion1 = {
            questionId: question1id,
            userAnswer: answer1,
        };
        const challengeQuestion2 = {
            questionId: question2id,
            userAnswer: answer2,
        };
        const challengeQuestion3 = {
            questionId: question3id,
            userAnswer: answer3,
        };
        const challengeQuestion = [challengeQuestion1, challengeQuestion2, challengeQuestion3];
        const { username } = this.props.getModel("user");
        const params = {
            username,
            challengeQuestion,
        };
        return await init(FN_CHANGE_SQ, params);
    };
    //S2U V4
    onS2uClose = () => {
        this.setState({ showS2UModal: false });
    };
    //S2U V4
    onS2uDone = (response) => {
        // Close S2u popup
        this.onS2uClose();
        this._navigateToAcknowledgementScreen(response);
    };
    _navigateToAcknowledgementScreen = (response) => {
        const { transactionStatus, executePayload } = response;
        const onServiceCompleteNav = this.props.route?.params?.onServiceCompleteNav ?? {};
        const entryPoint = {
            entryStack: navigationConstant.SETTINGS,
            entryScreen: onServiceCompleteNav?.screen,
            params: {
                ...this.props.route.params,
            },
        };
        const ackDetails = {
            executePayload,
            transactionSuccess: transactionStatus,
            entryPoint,
            navigate: this.props.navigation.navigate,
        };
        if (executePayload?.executed) {
            const result = executePayload?.result;
            const titleMessage =
                result?.statusCode === STATUS_CODE_SUCCESS
                    ? SECURITY_QUESTION_SUCCESSFUL
                    : SECURITY_QUESTION_UNSUCCESSFUL;
            if (result?.statusCode === STATUS_CODE_SUCCESS) {
                GASettingsScreen.onSuccessfulUpdateSecurityQuestion();
            }
            ackDetails.titleMessage = titleMessage;
            ackDetails.transactionSuccess = result?.statusCode === STATUS_CODE_SUCCESS;
        }
        handleS2UAcknowledgementScreen(ackDetails);
    };
    navigateTACFlow = () => {
        const { getModel } = this.props;
        const { m2uPhoneNumber } = getModel("m2uDetails");
        this.setState({ maskedMobileNo: maskedMobileNumber(m2uPhoneNumber) });
        this.requestOTP();
    };
    prepareUserDetails = () => {
        const { answer1, answer2, answer3, filledUserDetails } = this.state;
        const securityQuestions = {
            answer1,
            answer2,
            answer3,
        };
        const MAEUserDetails = filledUserDetails || {};
        MAEUserDetails.securityQuestions = securityQuestions;

        return MAEUserDetails;
    };

    validateAnswer = () => {
        const err = INVALID_SPECIAL_CHAR_ERR_MSG;
        const { answer1, answer2, answer3 } = this.state;
        if (!DataModel.securityQuestionRegex(answer1)) {
            this.setState({ isValidAnswer1: err });
            return false;
        }
        if (!DataModel.securityQuestionRegex(answer2)) {
            this.setState({ isValidAnswer2: err });
            return false;
        }
        if (!DataModel.securityQuestionRegex(answer3)) {
            this.setState({ isValidAnswer3: err });
            return false;
        }
        // Return true if no validation error
        return true;
    };

    onInputTextChange = (params) => {
        const key = params.key;
        const value = params.value.trimStart();
        this.setState(
            {
                [key]: value,
                isValidAnswer1: "",
                isValidAnswer2: "",
                isValidAnswer3: "",
            },
            () => {
                this.enableDisableBtn();
            }
        );
    };

    enableDisableBtn = () => {
        const { answer1, answer2, answer3, question1, question2, question3 } = this.state;
        if (
            answer1 &&
            answer2 &&
            answer3 &&
            question1 !== SELECT &&
            question2 !== SELECT &&
            question3 !== SELECT
        ) {
            this.setState({
                isNextDisabled: false,
            });
        } else {
            this.setState({
                isNextDisabled: true,
            });
        }
    };

    onQuestionPressed = (key) => {
        Keyboard.dismiss();
        this.setState({ [key]: true });
    };

    onDone1ButtonPress = (value) => {
        const { question1Data } = this.state;
        if (value) {
            const questionDetails = question1Data.find(
                (questionInfo) => questionInfo.value === value
            );
            this.setState(
                {
                    question1id: value,
                    question1: questionDetails.title,
                    question1DisplayPicker: false,
                },
                () => {
                    this.enableDisableBtn();
                }
            );
        }
    };
    onDone2ButtonPress = (value) => {
        const { question2Data } = this.state;
        if (value) {
            const questionDetails = question2Data.find(
                (questionInfo) => questionInfo.value === value
            );
            this.setState(
                {
                    question2id: value,
                    question2: questionDetails.title,
                    question2DisplayPicker: false,
                },
                () => {
                    this.enableDisableBtn();
                }
            );
        }
    };
    onDone3ButtonPress = (value) => {
        const { question3Data } = this.state;
        if (value) {
            const questionDetails = question3Data.find(
                (questionInfo) => questionInfo.value === value
            );
            this.setState(
                {
                    question3id: value,
                    question3: questionDetails.title,
                    question3DisplayPicker: false,
                },
                () => {
                    this.enableDisableBtn();
                }
            );
        }
    };
    onCancelButtonPress = (key) => {
        this.setState({
            [key]: false,
        });
    };

    scrollPickerData = (data) => {
        return data.map((obj) => {
            const { questionText, questionId } = obj;
            return {
                title: questionText,
                value: questionId,
            };
        });
    };

    requestOTP = async (isResend = false, showOTPCb = () => {}) => {
        const params = {
            fundTransferType: "CHANGE_M2U_CHALLENGE_QUESTION",
        };

        const httpResp = await requestTAC(params, false, "2fa/v1/tac").catch((error) => {
            showErrorToast({
                message: error.message || COMMON_ERROR_MSG,
            });
        });

        const serverToken = httpResp?.data?.token ?? null;
        // Update token and show OTP modal
        this.setState({ token: serverToken });
        this.showOTPModal();
        if (isResend) showOTPCb();
    };

    showOTPModal = () => {
        this.setState({ showTACModal: true });
    };

    onOTPDone = (otp, otpModalErrorCb) => {
        this.updateSecurityQuestions(otp, otpModalErrorCb);
    };

    onOTPClose = () => {
        this.setState({ showTACModal: false, token: null });
    };

    onOTPResend = (showOTPCb) => {
        this.requestOTP(true, showOTPCb);
    };

    render() {
        const {
            question1,
            question2,
            question3,
            question1Data,
            question2Data,
            question3Data,
            answer1,
            answer2,
            answer3,
            isValidAnswer1,
            isValidAnswer2,
            isValidAnswer3,
            question1DisplayPicker,
            question2DisplayPicker,
            question3DisplayPicker,
            isNextDisabled,
            filledUserDetails,
            token,
            mapperData,
            nonTxnData,
            showS2UModal,
            maskedMobileNo,
            showTACModal,
            isS2UDown,
        } = this.state;
        const analyticScreenName =
            filledUserDetails?.from === SETTINGS
                ? FA_SETTINGS_CHANGE_SECURITYQUESTION
                : FA_APPLY_M2U_SECURITY_QUESTION;

        return (
            <React.Fragment>
                <ScreenContainer
                    backgroundType="color"
                    backgroundColor={MEDIUM_GREY}
                    showOverlay={
                        question1DisplayPicker || question2DisplayPicker || question3DisplayPicker
                    }
                    analyticScreenName={analyticScreenName}
                >
                    <View style={styles.viewContainer}>
                        <ScreenLayout
                            paddingBottom={0}
                            paddingTop={0}
                            paddingHorizontal={0}
                            useSafeArea
                            header={
                                filledUserDetails?.from !== UPDATE_DETAILS ? (
                                    filledUserDetails?.from === SETTINGS ? (
                                        <HeaderLayout
                                            headerLeftElement={
                                                <HeaderBackButton onPress={this.onBackTap} />
                                            }
                                        />
                                    ) : (
                                        <HeaderLayout
                                            headerRightElement={
                                                <HeaderCloseButton onPress={this.onCloseTap} />
                                            }
                                        />
                                    )
                                ) : null
                            }
                        >
                            <ScrollView>
                                <KeyboardAwareScrollView
                                    style={styles.container}
                                    behavior={Platform.OS === "ios" ? "padding" : ""}
                                    enabled
                                >
                                    <View
                                        style={
                                            filledUserDetails?.from === UPDATE_DETAILS
                                                ? styles.updateFormContainer
                                                : styles.formContainer
                                        }
                                    >
                                        <Typo
                                            fontSize={14}
                                            lineHeight={23}
                                            fontWeight="600"
                                            letterSpacing={0}
                                            textAlign="left"
                                            text={
                                                filledUserDetails?.from === SETTINGS
                                                    ? CHANGE_SECURITY_QUESTIONS
                                                    : SETUP_SECURITY_QUESTIONS
                                            }
                                        />
                                        <Typo
                                            fontSize={20}
                                            lineHeight={33}
                                            fontWeight="300"
                                            letterSpacing={0}
                                            textAlign="left"
                                            text={IDENTITY_MSG}
                                        />
                                        <View style={styles.fieldContainer}>
                                            <Typo
                                                fontSize={14}
                                                fontWeight="normal"
                                                fontStyle="normal"
                                                lineHeight={18}
                                                textAlign="left"
                                                text={SECURITY_QUESTION_1}
                                            />
                                            <View style={styles.dropDownView}>
                                                <TouchableOpacity
                                                    style={styles.touchableView}
                                                    onPress={() =>
                                                        this.onQuestionPressed(
                                                            "question1DisplayPicker"
                                                        )
                                                    }
                                                >
                                                    <View>
                                                        <Typo
                                                            fontSize={13}
                                                            fontWeight="600"
                                                            fontStyle="normal"
                                                            lineHeight={23}
                                                            letterSpacing={0}
                                                            color={BLACK}
                                                            textAlign="left"
                                                            text={question1}
                                                            style={styles.dropDownText}
                                                        />

                                                        <Image
                                                            style={styles.dropDownIcon}
                                                            source={Assets.downArrow}
                                                        />
                                                    </View>
                                                </TouchableOpacity>
                                            </View>
                                            <TextInput
                                                maxLength={50}
                                                isValid={!isValidAnswer1}
                                                isValidate
                                                errorMessage={isValidAnswer1}
                                                value={answer1}
                                                placeholder="Your Answer"
                                                onChangeText={(value) => {
                                                    this.onInputTextChange({
                                                        key: "answer1",
                                                        value,
                                                    });
                                                }}
                                            />
                                        </View>
                                        <View style={styles.fieldContainer}>
                                            <Typo
                                                fontSize={14}
                                                fontWeight="normal"
                                                fontStyle="normal"
                                                lineHeight={18}
                                                textAlign="left"
                                                text={SECURITY_QUESTION_2}
                                            />
                                            <View style={styles.dropDownView}>
                                                <TouchableOpacity
                                                    style={styles.touchableView}
                                                    onPress={() =>
                                                        this.onQuestionPressed(
                                                            "question2DisplayPicker"
                                                        )
                                                    }
                                                >
                                                    <View>
                                                        <Typo
                                                            fontSize={13}
                                                            fontWeight="600"
                                                            fontStyle="normal"
                                                            lineHeight={23}
                                                            letterSpacing={0}
                                                            color={BLACK}
                                                            textAlign="left"
                                                            text={question2}
                                                            style={styles.dropDownText}
                                                        />

                                                        <Image
                                                            style={styles.dropDownIcon}
                                                            source={Assets.downArrow}
                                                        />
                                                    </View>
                                                </TouchableOpacity>
                                            </View>
                                            <TextInput
                                                maxLength={50}
                                                isValid={!isValidAnswer2}
                                                isValidate
                                                errorMessage={isValidAnswer2}
                                                value={answer2}
                                                placeholder="Your Answer"
                                                onChangeText={(value) => {
                                                    this.onInputTextChange({
                                                        key: "answer2",
                                                        value,
                                                    });
                                                }}
                                            />
                                        </View>
                                        <View style={styles.fieldContainer}>
                                            <Typo
                                                fontSize={14}
                                                fontWeight="normal"
                                                fontStyle="normal"
                                                lineHeight={18}
                                                textAlign="left"
                                                text={SECURITY_QUESTION_3}
                                            />
                                            <View style={styles.dropDownView}>
                                                <TouchableOpacity
                                                    style={styles.touchableView}
                                                    onPress={() =>
                                                        this.onQuestionPressed(
                                                            "question3DisplayPicker"
                                                        )
                                                    }
                                                >
                                                    <View>
                                                        <Typo
                                                            fontSize={13}
                                                            fontWeight="600"
                                                            fontStyle="normal"
                                                            lineHeight={23}
                                                            letterSpacing={0}
                                                            color={BLACK}
                                                            textAlign="left"
                                                            text={question3}
                                                            style={styles.dropDownText}
                                                        />

                                                        <Image
                                                            style={styles.dropDownIcon}
                                                            source={Assets.downArrow}
                                                        />
                                                    </View>
                                                </TouchableOpacity>
                                            </View>
                                            <TextInput
                                                maxLength={50}
                                                isValid={!isValidAnswer3}
                                                isValidate
                                                errorMessage={isValidAnswer3}
                                                value={answer3}
                                                placeholder="Your Answer"
                                                onChangeText={(value) => {
                                                    this.onInputTextChange({
                                                        key: "answer3",
                                                        value,
                                                    });
                                                }}
                                            />
                                        </View>
                                    </View>
                                </KeyboardAwareScrollView>
                            </ScrollView>
                            {/* Continue Button */}
                            <View style={styles.bottomBtnContCls}>
                                <LinearGradient
                                    colors={["#efeff300", MEDIUM_GREY]}
                                    style={styles.linearGradient}
                                />
                                <ActionButton
                                    fullWidth
                                    onPress={this.onContinueTap}
                                    disabled={isNextDisabled}
                                    backgroundColor={isNextDisabled ? DISABLED : YELLOW}
                                    componentCenter={
                                        <Typo
                                            fontSize={14}
                                            fontWeight="600"
                                            lineHeight={18}
                                            color={isNextDisabled ? DISABLED_TEXT : BLACK}
                                            text={CONTINUE}
                                        />
                                    }
                                />
                            </View>
                            {showS2UModal && (
                                <Secure2uAuthenticationModal
                                    token=""
                                    onS2UDone={this.onS2uDone}
                                    onS2uClose={this.onS2uClose}
                                    s2uPollingData={mapperData}
                                    transactionDetails={mapperData}
                                    secure2uValidateData={mapperData}
                                    nonTxnData={nonTxnData}
                                    s2uEnablement={true}
                                    navigation={this.props.navigation}
                                    extraParams={{
                                        metadata: {
                                            txnType: navigationConstant.MAE_SECURITY_QUESTIONS,
                                        },
                                    }}
                                />
                            )}
                        </ScreenLayout>
                    </View>
                </ScreenContainer>
                <ScrollPicker
                    showPicker={question1DisplayPicker}
                    items={question1Data}
                    onCancelButtonPressed={() => this.onCancelButtonPress("question1DisplayPicker")}
                    onDoneButtonPressed={this.onDone1ButtonPress}
                    itemHeight={60}
                />
                <ScrollPicker
                    showPicker={question2DisplayPicker}
                    items={question2Data}
                    onCancelButtonPressed={() => this.onCancelButtonPress("question2DisplayPicker")}
                    onDoneButtonPressed={this.onDone2ButtonPress}
                    itemHeight={60}
                />
                <ScrollPicker
                    showPicker={question3DisplayPicker}
                    items={question3Data}
                    onCancelButtonPressed={() => this.onCancelButtonPress("question3DisplayPicker")}
                    onDoneButtonPressed={this.onDone3ButtonPress}
                    itemHeight={60}
                />
                {showTACModal && (
                    <OtpModal
                        otpCode={token}
                        onOtpDonePress={this.onOTPDone}
                        onOtpClosePress={this.onOTPClose}
                        onResendOtpPress={this.onOTPResend}
                        mobileNumber={maskedMobileNo}
                        isS2UDown={isS2UDown}
                    />
                )}
            </React.Fragment>
        );
    }
}

const styles = StyleSheet.create({
    bottomBtnContCls: {
        flexDirection: "row",
        justifyContent: "space-around",
        paddingHorizontal: 24,
        paddingVertical: 25,
    },
    container: {
        flex: 1,
    },
    dropDownIcon: {
        height: 8,
        marginLeft: "88%",
        marginTop: -10,
        width: 15,
    },
    dropDownText: {
        height: 19,
        marginLeft: "5%",
        marginTop: -10,
        maxWidth: "75%",
        width: "75%",
    },
    dropDownView: {
        backgroundColor: WHITE,
        borderRadius: 24,
        height: 48,
        marginTop: 16,
        width: "100%",
        borderStyle: "solid",
        borderWidth: 1,
        borderColor: GREY,
    },
    fieldContainer: {
        marginTop: 24,
    },
    formContainer: {
        marginBottom: 40,
        marginHorizontal: 36,
    },
    linearGradient: {
        height: 30,
        left: 0,
        position: "absolute",
        right: 0,
        top: -30,
    },
    touchableView: {
        alignItems: "center",
        flexDirection: "row",
        height: "100%",
        marginLeft: "6%",
        width: "100%",
    },
    updateFormContainer: {
        marginBottom: 40,
        marginHorizontal: 36,
        marginTop: 80,
    },
    viewContainer: {
        flex: 1,
    },
});

SecurityQuestions.propTypes = {
    route: PropTypes.any,
    navigation: PropTypes.any,
};

export default withModelContext(SecurityQuestions);
