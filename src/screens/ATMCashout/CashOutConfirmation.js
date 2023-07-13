import AsyncStorage from "@react-native-community/async-storage";
import { isEmpty, isNull } from "lodash";
import PropTypes from "prop-types";
import React from "react";
import { View, TouchableOpacity, Image, StyleSheet, PixelRatio } from "react-native";

import { navigateToS2UCooling, navigateToS2UReg } from "@screens/OneTapAuth/CoolingNavigator";

import * as navigationConstant from "@navigation/navigationConstant";

import HeaderLayout from "@layouts/HeaderLayout";
import ScreenLayout from "@layouts/ScreenLayout";

import ActionButton from "@components/Buttons/ActionButton";
import HeaderBackButton from "@components/Buttons/HeaderBackButton";
import RadioButton from "@components/Buttons/RadioButton";
import ScreenContainer from "@components/Containers/ScreenContainer";
import ScreenLoader from "@components/Loaders/ScreenLoader";
import Secure2uAuthenticationModal from "@components/Modals/Secure2uAuthenticationModal";
import Typo from "@components/Text";
import { showErrorToast, showInfoToast } from "@components/Toast";

import { withModelContext } from "@context";

import { checkAtmOnboarding, getMobileInfo, invokeL2, invokeL3 } from "@services";

import { MEDIUM_GREY, DARK_GREY, BLACK, YELLOW, DISABLED } from "@constants/colors";
import { M2U, S2U_PUSH, SMS_TAC } from "@constants/data";
import { FN_ATM_CASHOUT } from "@constants/fundConstants";
import {
    COMMON_ERROR_MSG,
    SECURE2U_IS_UNAVAILABLE,
    ATM_QR,
    FA_SETTINGS_ATMCASHOUT_INTRODUCTION,
    ATM_CASHOUT_UNSUCCESS,
} from "@constants/strings";

//S2U V4
import {
    handleS2UAcknowledgementScreen,
    init,
    initChallenge,
    s2uSdkLogs,
    showS2UDownToast,
} from "@utils/dataModel/s2uSDKUtil";
//S2U V4 END
import { checks2UFlow } from "@utils/dataModel/utility";
import { convertMayaMobileFormat } from "@utils/dataModel/utilityPartial.4";
import { errorCodeMap } from "@utils/errorMap";
import { ErrorLogger } from "@utils/logs";

import Images from "@assets";

const CloseButton = ({ onPress }) => (
    <TouchableOpacity onPress={onPress} style={styles.closeButton}>
        <Image source={Images.icCloseBlack} style={styles.closeButtonIcon} />
    </TouchableOpacity>
);

CloseButton.propTypes = {
    onPress: PropTypes.func,
};

const S2UFlowEnum = Object.freeze({
    s2u: "S2U",
    s2uReg: "S2UReg",
    tac: "TAC",
});

const nonTxnData = { isNonTxn: true };

const styles = StyleSheet.create({
    // atmDesc: { color: BLACK, fontSize: 20 },
    bgContainer: {
        position: "absolute",
        top: PixelRatio.getPixelSizeForLayoutSize(180),
        width: "120%",
        zIndex: -1,
    },
    bgImg: {
        marginLeft: "-10%",
        marginTop: "-88%",
        position: "absolute",
        width: "130%",
        zIndex: -1,
    },
    btn: { marginHorizontal: "5%", width: "90%" },
    btnContainer: { bottom: 20, flexDirection: "column", position: "absolute", width: "100%" },
    closeButton: {
        height: 44,
        justifyContent: "center",
        width: 44,
    },
    closeButtonIcon: {
        height: 17,
        width: 17,
    },
    confirm: {
        width: "100%",
    },
    layout: { paddingHorizontal: 25 },
    note: { marginTop: 20 },
    tncContainer: {
        bottom: 80,
        flexDirection: "row",
        lineHeight: 20,
        marginHorizontal: 25,
        marginTop: 20,
        position: "absolute",
        width: "80%",
    },
    tncText: {
        textDecorationLine: "underline",
    },
});

class CashOutConfirmation extends React.Component {
    static propTypes = {
        getModel: PropTypes.func,
        updateModel: PropTypes.func,
        navigation: PropTypes.object.isRequired,
        route: PropTypes.object.isRequired,
    };
    constructor(props) {
        super(props);
        this.state = {
            pressed: false,
            showLoader: true,
            secure2uValidateData: {},
            isOnboardCompleted: null,
            isBlocked: false,
            blockMsg: "",
            //S2U V4
            showS2UModal: false,
            mapperData: {},
        };
    }
    async componentDidMount() {
        console.log("[CashoutConfirmation][componentDidMount]");
        this.init();
        await this._checkS2UStatus();
        this._unsubscribeFocusListener = this.props.navigation.addListener(
            "focus",
            this.handleOnfocus
        );
    }
    handleOnfocus = () => {
        if (this.props?.route?.params?.flow === "ATM") this.checkAtmOnboardingStatus();
        if (this.props.route?.params?.isS2URegistrationAttempted) this._handlePostS2URegistration();
        else this.checkAtmOnboardingStatus();
    };
    _requestL2Permission = async (isL3) => {
        try {
            const response = isL3 ? await invokeL3(isL3) : await invokeL2(false);
            if (response && response.status === 200) return response;
            return null;
        } catch (error) {
            ErrorLogger(error);
            return null;
        }
    };

    checkAtmOnboardingStatus = async () => {
        try {
            const response = await checkAtmOnboarding();
            const { code, result } = response && response.data;
            if (code === 200) {
                this.setState({ isBlocked: false });
                if (result?.status === "PENDING") {
                    showInfoToast({
                        message:
                            "For security purposes, there will be 24-hour waiting period after set up before you can use the ATM Cash-out feature to withdraw cash.",
                    });
                }
                this.setState({
                    isOnboardCompleted: result?.status === "ACTIVE",
                    showLoader: false,
                });
                return;
            }
        } catch (e) {
            this.goBack();
            const exObj = errorCodeMap(e);
            if (exObj?.message) {
                this.setState({ isBlocked: true, blockMsg: exObj?.message });
                showErrorToast({ message: exObj?.message ?? COMMON_ERROR_MSG });
            }
        } finally {
            this.setState({
                showLoader: false,
            });
        }
    };
    init = async () => {
        console.tron.log("[CashOutConfirmation] >> init ");
        const { isPostPassword } = this.props.getModel("auth");
        if (!isPostPassword) {
            const request = await this._requestL2Permission(true);
            if (!request) {
                this.props.navigation.goBack();
            }
        }
    };

    _checkS2UStatus = async () => {
        try {
            //passing new paramerter updateModel for s2u interops
            const { flow, secure2uValidateData } = await checks2UFlow(
                46,
                this.props.getModel,
                this.props.updateModel
            );
            if (flow === S2UFlowEnum.s2uReg) {
                const {
                    navigation: { setParams, navigate },
                } = this.props;
                setParams({ isS2URegistrationAttempted: true });
                this.navigateToS2URegistration(navigate);
                this.setState({ secure2uValidateData });
            } else if (flow === S2UFlowEnum.tac) {
                this.setState({ showLoader: false, secure2uValidateData }, () => {
                    showInfoToast({
                        message: SECURE2U_IS_UNAVAILABLE,
                    });
                    this.goBack();
                });
            } else if (flow === navigationConstant.SECURE2U_COOLING) {
                const {
                    navigation: { navigate },
                } = this.props;
                this.goBack();
                navigateToS2UCooling(navigate);
            } else {
                this.checkAtmOnboardingStatus();
                this.setState({ secure2uValidateData });
            }
        } catch (ex) {
            console.log("[CashOutConfirmation] >> [ex]", ex);

            const { error } = ex;

            this.setState({
                showLoader: false,
            });

            if (error?.status === "nonetwork") {
                this.goBack();
            } else {
                this.goBack();
                showErrorToast({ message: COMMON_ERROR_MSG });
            }
        }
    };

    navigateToS2URegistration = (navigate) => {
        const redirect = {
            succStack: navigationConstant.ATM_CASHOUT_STACK,
            succScreen: navigationConstant.ATM_CASHOUT_CONFIRMATION,
        };
        navigateToS2UReg(navigate, this.props.route.params, redirect);
    };

    _handlePostS2URegistration = async () => {
        //passing new paramerter updateModel for s2u interops
        const { flow } = await checks2UFlow(46, this.props.getModel, this.props.updateModel);
        const {
            route: {
                params: { isS2URegistrationAttempted, routeFrom },
            },
            navigation: { setParams, goBack },
        } = this.props;

        if (flow === S2UFlowEnum.s2uReg && isS2URegistrationAttempted) {
            setParams({ isS2URegistrationAttempted: false });
            if (!routeFrom || routeFrom !== ATM_QR) {
                goBack();
            }
            return;
        }
        this.checkAtmOnboardingStatus();
    };

    goBack = () => {
        console.tron.log("[CASHOUT CONFIRMATION] >> [goBack]");
        if (this.props.route?.params?.routeFrom === "Dashboard") {
            this.props.navigation.navigate(navigationConstant.TAB_NAVIGATOR, {
                screen: navigationConstant.TAB,
                params: {
                    screen: navigationConstant.DASHBOARD,
                    params: { refresh: false },
                },
            });
            return;
        }
        this.props.navigation.goBack();
    };

    _onPressTncLink = () => {
        const params = {
            file: "https://www.maybank2u.com.my/iwov-resources/pdf/personal/digital_banking/atm-cashout-tnc.pdf",
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

    _radioChecked = () => {
        const { isBlocked, pressed, blockMsg } = this.state;
        if (!isBlocked) {
            this.setState({ pressed: !pressed });
        } else {
            showErrorToast({ message: blockMsg });
        }
    };

    handleConfirm = async () => {
        try {
            const httpResp = await getMobileInfo();
            const mobileNo = String(httpResp?.data?.result) ?? null;
            if (mobileNo) {
                const { isOverseasMobileNoEnabled } = this.props.getModel("misc");
                const formattedMobileNum = convertMayaMobileFormat(mobileNo);
                const mobileNum = isOverseasMobileNoEnabled ? mobileNo : formattedMobileNum;
                this.initiateS2USdk(mobileNum);
            }
        } catch (ex) {
            if (ex?.message || ex?.error?.message) {
                showErrorToast({
                    message: ex?.message || ex?.error?.message,
                });
            }
        }
    };
    //S2U V4
    s2uSDKInit = async (phNo) => {
        const transactionPayload = {
            requestType: "QRCLW_001",
            mobileNo: phNo,
            preOrPostFlag: "prelogin",
        };
        return await init(FN_ATM_CASHOUT, transactionPayload);
    };
    //S2U V4
    initiateS2USdk = async (phNo) => {
        try {
            const s2uInitResponse = await this.s2uSDKInit(phNo);
            console.log("S2U SDK s2uInitResponse : ", s2uInitResponse);
            if (s2uInitResponse?.message || s2uInitResponse.statusCode !== 0) {
                console.log("s2uInitResponse error : ", s2uInitResponse.message);
                showErrorToast({
                    message: s2uInitResponse.message,
                });
            } else {
                if (s2uInitResponse?.actionFlow === SMS_TAC) {
                    //Tac Flow
                    showS2UDownToast();
                    this.navToTacFlow(phNo);
                } else if (s2uInitResponse?.actionFlow === S2U_PUSH) {
                    if (s2uInitResponse?.s2uRegistrationDetails?.app_id === M2U) {
                        this.navigateToS2URegistration(this.props.navigation.navigate);
                    }
                } else {
                    //S2U Pull Flow
                    this.initS2UPull(s2uInitResponse);
                }
            }
        } catch (err) {
            console.log(err, "CashOutConfirmation");
            s2uSdkLogs(err, "ATM Cashout");
        }
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
                console.log("initChallenge RN Response :: ", challengeRes);
                if (challengeRes?.message) {
                    console.log("challenge init request failed");
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
            this.navigateToS2URegistration(navigate);
        }
    };

    //S2U V4
    navToTacFlow = (mobileNum) => {
        this.props.navigation.navigate(navigationConstant.ATM_CASHOUT_STACK, {
            screen: navigationConstant.ATM_OTP_NUMBER,
            params: {
                ...this.props.route.params,
                flow: "ATM",
                mobileNum,
            },
        });
    };
    //S2U V4
    onS2uDone = (response) => {
        const { transactionStatus, executePayload } = response;
        // Close S2u popup
        this.onS2uClose();
        //handle  based on status code
        if (transactionStatus) {
            this.navigateToSuccScreen();
        } else {
            //S2U V4 handle RSA transaction Failed
            this.handleError(executePayload);
        }
    };

    navigateToSuccScreen = () => {
        const { navigation, updateModel, route } = this.props;
        AsyncStorage.setItem("isAtmEnabled", "true");
        updateModel({
            atm: {
                isOnboarded: true,
                isEnabled: true,
                lastQrString: "",
            },
        });
        navigation.navigate(navigationConstant.ATM_CASHOUT_STACK, {
            screen: navigationConstant.ATM_CASHOUT_STATUS,
            params: { ...route?.params },
        });
    };

    //S2U V4
    onS2uClose = () => {
        this.setState({ showS2UModal: false });
    };

    //S2U V4
    handleError = (executePayload) => {
        if (executePayload.code === 423) {
            // Display RSA Account Locked executePayload Message
            console.log("RSA Lock");
            const serverDate = executePayload?.payload?.serverDate || "";
            this.props.navigation.navigate(navigationConstant.ONE_TAP_AUTH_MODULE, {
                screen: "Locked",
                params: {
                    reason: executePayload?.rsaResponse?.statusDescription ?? "N/A",
                    loggedOutDateTime: serverDate,
                    lockedOutDateTime: serverDate,
                },
            });
        } else if (executePayload.code === 422) {
            // Display RSA Account Locked executePayload Message
            console.log("RSA Deny");
            this.props.navigation.navigate(navigationConstant.COMMON_MODULE, {
                screen: navigationConstant.RSA_DENY_SCREEN,
                params: {
                    statusDescription: executePayload?.rsaResponse?.statusDescription ?? "N/A",
                    additionalStatusDescription: executePayload?.rsaResponse?.statusDescription
                        ? ""
                        : executePayload?.rsaResponse?.additionalStatusDescription ?? "",
                    serverDate: executePayload?.rsaResponse?.serverDate ?? "N/A",
                    nextParams: {
                        screen: navigationConstant.DASHBOARD,
                        params: { refresh: false },
                    },
                    nextModule: navigationConstant.TAB_NAVIGATOR,
                    nextScreen: "Tab",
                },
            });
        } else {
            const entryStack = this.props?.route?.params?.routeFrom
                ? navigationConstant.DASHBOARD
                : navigationConstant.SETTINGS;
            const entryScreen =
                !this.props?.route?.params?.routeFrom && navigationConstant.PROFILE_MODULE;
            const entryPoint = {
                entryStack,
                entryScreen,
                params: {
                    ...this.props.route.params,
                },
            };
            const ackDetails = {
                executePayload,
                transactionSuccess: false,
                entryPoint,
                navigate: this.props.navigation.navigate,
            };
            if (executePayload?.executed) {
                ackDetails.titleMessage = ATM_CASHOUT_UNSUCCESS;
            }
            handleS2UAcknowledgementScreen(ackDetails);
        }
    };
    //S2U V4 End

    render() {
        const {
            pressed,
            isOnboardCompleted,
            secure2uValidateData,
            mapperData,
            showS2UModal,
            showLoader,
            isBlocked,
        } = this.state;
        if (isNull(isOnboardCompleted) && isEmpty(secure2uValidateData)) {
            return <ScreenLoader showLoader={true} />;
        }
        return (
            <ScreenContainer
                backgroundType="color"
                backgroundColor={MEDIUM_GREY}
                showLoaderModal={showLoader}
                analyticScreenName={FA_SETTINGS_ATMCASHOUT_INTRODUCTION}
            >
                <ScreenLayout
                    header={
                        <HeaderLayout
                            headerLeftElement={<HeaderBackButton onPress={this.goBack} />}
                            headerCenterElement={
                                <Typo
                                    text="ATM Cash-out"
                                    fontWeight="600"
                                    fontSize={18}
                                    lineHeight={19}
                                />
                            }
                        />
                    }
                    paddingHorizontal={0}
                    paddingBottom={0}
                    paddingTop={0}
                    useSafeArea
                >
                    <>
                        <View style={styles.layout}>
                            <View>
                                <Typo
                                    text="Your smartphone is all you need to withdraw cash from an ATM near you! It's fast, secure and contactless too."
                                    fontSize={16}
                                    fontWeight="400"
                                    lineHeight={24}
                                    textAlign="left"
                                />
                                <Typo
                                    text="Note: "
                                    fontSize={12}
                                    fontWeight="600"
                                    lineHeight={18}
                                    textAlign="left"
                                    style={styles.note}
                                    color={DARK_GREY}
                                />
                                <Typo
                                    text="For security purposes, there will be 24-hour waiting period after set
                                up before you can use the ATM Cash-out feature to withdraw cash."
                                    fontSize={12}
                                    fontWeight="400"
                                    lineHeight={18}
                                    textAlign="left"
                                    color={DARK_GREY}
                                />
                            </View>
                        </View>
                        <View style={styles.btnContainer}>
                            <View style={styles.tncContainer}>
                                <View>
                                    <RadioButton
                                        isSelected={pressed}
                                        onRadioButtonPressed={this._radioChecked}
                                    />
                                </View>

                                <>
                                    <Image source={Images.atmCashOutBg} style={styles.bgImg} />

                                    <View style={styles.confirm}>
                                        <Typo textAlign="left">
                                            <Typo
                                                text={`I confirm that I have read the above and agree to the `}
                                                fontSize={14}
                                                fontWeight="400"
                                                lineHeight={20}
                                                textAlign="left"
                                                color={BLACK}
                                            />
                                            <Typo
                                                text="Terms & Conditions"
                                                fontSize={14}
                                                fontWeight="600"
                                                lineHeight={20}
                                                textAlign="left"
                                                color={BLACK}
                                                style={styles.tncText}
                                                onPressText={this._onPressTncLink}
                                            />
                                        </Typo>
                                    </View>
                                </>
                            </View>
                            <View style={styles.btn}>
                                <ActionButton
                                    fullWidth
                                    disabled={!pressed || isBlocked}
                                    // isLoading={loading}
                                    borderRadius={25}
                                    onPress={this.handleConfirm}
                                    backgroundColor={!pressed ? DISABLED : YELLOW}
                                    componentCenter={
                                        <Typo
                                            text="Confirm"
                                            fontSize={14}
                                            fontWeight="600"
                                            lineHeight={18}
                                        />
                                    }
                                />
                            </View>
                        </View>
                        <View style={styles.bgContainer} />
                        {showS2UModal && (
                            //S2U V4
                            <Secure2uAuthenticationModal
                                token=""
                                onS2UDone={this.onS2uDone}
                                onS2uClose={this.onS2uClose}
                                s2uPollingData={mapperData}
                                transactionDetails={mapperData}
                                secure2uValidateData={mapperData}
                                nonTxnData={nonTxnData}
                                s2uEnablement={true}
                                extraParams={{
                                    metadata: {
                                        txnType: "ATM_CASHOUT",
                                    },
                                }}
                            />
                        )}
                    </>
                </ScreenLayout>
            </ScreenContainer>
        );
    }
}

export default withModelContext(CashOutConfirmation);
