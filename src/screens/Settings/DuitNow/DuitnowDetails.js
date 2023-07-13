import PropTypes from "prop-types";
import React, { Component } from "react";
import { View, StyleSheet, TouchableOpacity } from "react-native";

import { navigateToS2UCooling, navigateToS2UReg } from "@screens/OneTapAuth/CoolingNavigator";
import { getServiceParams } from "@screens/Settings/DuitNow/DuitNowController";

import {
    DUITNOW_CHOOSEACCOUNT,
    SETTINGS_MODULE,
    DUITNOW_DASHBOARD,
    DUITNOW_DETAILS,
} from "@navigation/navigationConstant";

import HeaderLayout from "@layouts/HeaderLayout";
import ScreenLayout from "@layouts/ScreenLayout";

import ActionButton from "@components/Buttons/ActionButton";
import HeaderBackButton from "@components/Buttons/HeaderBackButton";
import ScreenContainer from "@components/Containers/ScreenContainer";
import FixedActionContainer from "@components/Footers/FixedActionContainer";
import Secure2uAuthenticationModal from "@components/Modals/Secure2uAuthenticationModal";
import Popup from "@components/Popup";
import Typo from "@components/Text";
import { showErrorToast } from "@components/Toast";

import { withModelContext } from "@context";

import { GASettingsScreen } from "@services/analytics/analyticsSettings";

import { MEDIUM_GREY, YELLOW, GREY, WHITE, ROYAL_BLUE } from "@constants/colors";
import { ACTIVATE, DEREGISTER, M2U, S2U_PUSH, SMS_TAC, SUCCESS, SUSPEND } from "@constants/data";
import { FN_DN_ACTIVATE, FN_DN_DEREGISTER, FN_DN_SUSPEND } from "@constants/fundConstants";
import {
    ACTIVE,
    COMMON_ERROR_MSG,
    DEACTIVATE_DUITNOW_SUCCESS,
    DEACTIVATE_DUITNOW_UNSUCCESS,
    DEREGISTER_DUITNOW,
    DEREGISTER_DUITNOW_TEMP,
    DISABLE_DUITNOW,
    DISABLE_DUITNOW_TEMP,
    DISABLE_TEMP,
    DUITNOW,
    ENABLE,
    FA_SETTINGS_DUITNOW_ACCOUNTDETAILS,
    INACTIVE,
    REACTIVATE_DUITNOW_SUCCESS,
    REACTIVATE_DUITNOW_UNSUCCESS,
    RECEIVING_BANK,
    RECEVING_ACCOUNT,
    REMOVE_DUITNOW_SUCCESS,
    REMOVE_DUITNOW_UNSUCCESS,
} from "@constants/strings";

import {
    handleS2UAcknowledgementScreen,
    init,
    initChallenge,
    s2uSdkLogs,
    showS2UDownToast,
} from "@utils/dataModel/s2uSDKUtil";

import * as DuitNowController from "./DuitNowController";

class DuitnowDetails extends Component {
    static propTypes = {
        getModel: PropTypes.func,
        route: PropTypes.object,
        navigation: PropTypes.object,
    };

    constructor(props) {
        super(props);
        this.state = {
            proxyData: props.route.params?.proxyDetails?.seletedItem,
            isSwitchAccount: false,
            isPopupDisplay: false,
            popupTitle: "",
            popupDesc: "",
            popupType: "",
            proxyIdNo: props.route.params?.proxyDetails?.seletedItem?.isregisteredProxy
                ? props.route.params?.proxyDetails?.seletedItem?.idVal || ""
                : props.route.params?.proxyDetails?.seletedItem?.value || "",
            isSuspendedby:
                !props.route.params?.proxyDetails?.seletedItem?.proxyStatus &&
                props.route.params?.proxyDetails?.seletedItem?.isProxySuspendedBy === "BANK",
            //S2U V4
            screenParams: {},
            showS2UModal: false,
            mapperData: {},
            nonTxnData: { isNonTxn: true },
        };
    }
    componentDidMount() {
        if (
            !this.props.route.params?.proxyDetails?.seletedItem?.proxyStatus &&
            this.props.route.params?.proxyDetails?.seletedItem?.isProxySuspendedBy === "BANK"
        ) {
            showErrorToast({
                message: "This proxy is suspended by bank.Please contact customer service.",
            });
            return;
        }
        this.props.navigation.addListener("focus", this.onScreenFocus);
    }
    onScreenFocus = () => {
        if (this.props?.route?.params?.auth === "Failure") {
            this.props.navigation.setParams({ auth: "" });
            this.setState({ isSwitchAccount: true });
        }
    };

    handleBack = () => {
        this.props.navigation.goBack();
    };

    disableAction = () => {
        GASettingsScreen.onDeactivateDuitNowAccount();
        if (this.state.proxyData.proxyStatus) {
            this.setState({
                isPopupDisplay: true,
                popupTitle: DISABLE_DUITNOW,
                popupDesc: DISABLE_DUITNOW_TEMP,
                popupType: "disable",
            });
            return;
        }
        this.duitnowDeRegister(ACTIVATE, "DUITNOW_MAINT_ACTIVATE", FN_DN_ACTIVATE);
    };

    deRegisterAction = () => {
        GASettingsScreen.onDeregisterDuitNowAccount();
        this.setState({
            isPopupDisplay: true,
            popupTitle: DEREGISTER_DUITNOW,
            popupDesc: DEREGISTER_DUITNOW_TEMP,
            popupType: "deRegister",
        });
    };
    handleClose = () => {
        this.setState({ isPopupDisplay: false });
    };

    //S2U V4
    s2uSDKInit = async (screenParams) => {
        const params = getServiceParams(screenParams, screenParams.selectedAccount);
        delete params.tac;
        return await init(screenParams?.functionCode, params);
    };

    //S2U V4
    initiateS2USdk = async (screenParams, otpType) => {
        try {
            const s2uInitResponse = await this.s2uSDKInit(screenParams);
            if (s2uInitResponse?.message || s2uInitResponse.statusCode !== 0) {
                showErrorToast({
                    message: s2uInitResponse.message || COMMON_ERROR_MSG,
                });
            } else {
                if (s2uInitResponse?.actionFlow === SMS_TAC) {
                    //............ ConfirmScreen
                    showS2UDownToast();
                    this.handleProceedOtp(screenParams, otpType);
                } else if (s2uInitResponse?.actionFlow === S2U_PUSH) {
                    if (s2uInitResponse?.s2uRegistrationDetails?.app_id === M2U) {
                        this.doS2uRegistration(this.props.navigation.navigate);
                    }
                } else {
                    this.initS2UPull(s2uInitResponse);
                }
            }
        } catch (error) {
            console.log("Duitnow details s2u catch : ", error);
            s2uSdkLogs(error, "DuitNow Details");
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
                if (challengeRes?.mapperData) {
                    this.setState({
                        showS2UModal: true,
                        mapperData: challengeRes.mapperData,
                    });
                } else {
                    showErrorToast({ message: challengeRes?.message });
                }
            }
        } else {
            //Redirect user to S2U registration flow
            this.doS2uRegistration(navigate);
        }
    };

    doS2uRegistration = (navigate) => {
        const redirect = {
            succStack: SETTINGS_MODULE,
            succScreen: DUITNOW_DETAILS,
        };
        navigateToS2UReg(navigate, this.props?.route?.params, redirect);
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

    //S2U V4
    _navigateToAcknowledgementScreen = (response) => {
        const { transactionStatus, executePayload } = response;
        const { screenParams } = this.state;
        const entryPoint = {
            entryStack: SETTINGS_MODULE,
            entryScreen: DUITNOW_DASHBOARD,
        };
        const ackDetails = {
            executePayload,
            transactionSuccess: transactionStatus,
            entryPoint,
            navigate: this.props.navigation.navigate,
        };

        if (executePayload?.executed) {
            if (executePayload?.result?.status === SUCCESS) {
                ackDetails.titleMessage =
                    screenParams?.serviceType === ACTIVATE
                        ? REACTIVATE_DUITNOW_SUCCESS
                        : screenParams?.serviceType === SUSPEND
                        ? DEACTIVATE_DUITNOW_SUCCESS
                        : REMOVE_DUITNOW_SUCCESS;
            } else {
                ackDetails.titleMessage =
                    screenParams?.serviceType === ACTIVATE
                        ? REACTIVATE_DUITNOW_UNSUCCESS
                        : screenParams?.serviceType === SUSPEND
                        ? DEACTIVATE_DUITNOW_UNSUCCESS
                        : REMOVE_DUITNOW_UNSUCCESS;
            }
            ackDetails.transactionSuccess = executePayload?.result?.status === SUCCESS;
            DuitNowController.getDuitNowGADetails(
                screenParams?.serviceType,
                ackDetails.transactionSuccess
            );
        }
        handleS2UAcknowledgementScreen(ackDetails);
    };

    duitnowDeRegister = (serviceType, otpType, functionCode) => {
        console.log("[DuitnowDetails] >> [duitnowDeRegister]");
        const screenParams = {
            serviceType,
            selectedAccount: this.state.proxyData,
            proxyDetails: this.props.route?.params?.proxyDetails,
            functionCode,
        };
        this.setState({ screenParams });
        this.initiateS2USdk(screenParams, otpType);
    };
    handleProceedOtp = (screenParams, otpType) => {
        const { m2uPhoneNumber } = this.props.getModel("m2uDetails");
        const mobileNumber =
            m2uPhoneNumber.indexOf("60") < 0 ? `60${m2uPhoneNumber}` : m2uPhoneNumber;

        const otpReqBody = {
            fundTransferType: otpType,
            proxyIdNo: this.state.proxyIdNo,
        };
        this.props.navigation.navigate(SETTINGS_MODULE, {
            screen: "ConfirmPhoneNumber",
            params: {
                externalSource: {
                    stack: SETTINGS_MODULE,
                    screen: DUITNOW_DASHBOARD,
                    params: {
                        reqParams: {
                            reqOTPURL: "2fa/v1/tac",
                            validateOTPURL: "transfer/v1/duitnow/register",
                            reqBody: otpReqBody,
                        },
                        screenParams,
                        from: "register",
                    },
                },
                // temp fix since userDetails still doesn't save the number with 60
                phone: mobileNumber,
            },
        });
    };
    handleConfirmPress = () => {
        this.setState({ isPopupDisplay: false });

        switch (this.state.popupType) {
            case "deRegister":
                this.duitnowDeRegister(DEREGISTER, "DUITNOW_MAINT_DEREGISTER", FN_DN_DEREGISTER);
                break;
            case "disable":
                this.duitnowDeRegister(SUSPEND, "DUITNOW_MAINT_SUSPEND", FN_DN_SUSPEND);
                break;
            default:
                break;
        }
    };

    switchAccPress = () => {
        if (this.state.isSwitchAccount) {
            this.props.navigation.navigate(DUITNOW_CHOOSEACCOUNT, {
                proxyDetails: { seletedItem: this.props.route?.params?.proxyDetails },
            });
            return;
        }
        this.props.navigation.navigate(DUITNOW_CHOOSEACCOUNT, {
            proxyDetails: this.props.route?.params?.proxyDetails,
        });
    };

    render() {
        const {
            proxyData,
            isPopupDisplay,
            popupTitle,
            popupDesc,
            isSuspendedby,
            showS2UModal,
            mapperData,
            nonTxnData,
        } = this.state;
        return (
            <ScreenContainer
                backgroundType="color"
                backgroundColor={MEDIUM_GREY}
                analyticScreenName={FA_SETTINGS_DUITNOW_ACCOUNTDETAILS}
            >
                <ScreenLayout
                    paddingBottom={0}
                    paddingTop={0}
                    paddingHorizontal={0}
                    header={
                        <HeaderLayout
                            backgroundColor={YELLOW}
                            headerCenterElement={
                                <Typo
                                    text={DUITNOW}
                                    fontWeight="600"
                                    fontSize={16}
                                    lineHeight={19}
                                />
                            }
                            headerLeftElement={<HeaderBackButton onPress={this.handleBack} />}
                        />
                    }
                    useSafeArea
                >
                    <View style={styles.container}>
                        <Typo
                            text={proxyData.idType}
                            fontWeight="600"
                            fontStyle="normal"
                            fontSize={14}
                            lineHeight={18}
                            textAlign="left"
                            style={styles.linkAccountText}
                        />

                        <Typo
                            text={proxyData.idVal}
                            fontWeight="300"
                            fontStyle="normal"
                            fontSize={20}
                            lineHeight={28}
                            textAlign="left"
                            style={styles.mobileNumberText}
                        />
                        <View style={styles.statusView}>
                            <Typo
                                text="Status"
                                fontWeight="normal"
                                fontSize={14}
                                lineHeight={19}
                                textAlign="left"
                                style={styles.valueText}
                            />
                            <Typo
                                text={proxyData.proxyStatus ? ACTIVE : INACTIVE}
                                fontWeight="normal"
                                fontSize={14}
                                lineHeight={18}
                                textAlign="left"
                                style={styles.statusText}
                            />
                        </View>
                        <View style={styles.accountView}>
                            <Typo
                                text={RECEIVING_BANK}
                                fontWeight="normal"
                                fontSize={14}
                                lineHeight={19}
                                textAlign="left"
                                style={styles.bankText}
                            />
                            <Typo
                                text={proxyData.bankName}
                                fontWeight="600"
                                fontSize={14}
                                lineHeight={18}
                                textAlign="left"
                                style={styles.bankNameText}
                            />
                        </View>
                        <View style={styles.accountView}>
                            <Typo
                                text={RECEVING_ACCOUNT}
                                fontWeight="normal"
                                fontSize={14}
                                lineHeight={19}
                                textAlign="left"
                                style={styles.bankText}
                            />
                            <View style={styles.displayView}>
                                <Typo
                                    text={proxyData.accountNo}
                                    fontWeight="600"
                                    fontSize={14}
                                    lineHeight={18}
                                    textAlign="left"
                                    style={styles.accountnumberText}
                                />
                                {!isSuspendedby && proxyData.proxyStatus && (
                                    <TouchableOpacity
                                        style={styles.switchAccView}
                                        onPress={this.switchAccPress}
                                    >
                                        <Typo
                                            text="Switch account"
                                            fontWeight="600"
                                            fontSize={14}
                                            lineHeight={18}
                                            textAlign="left"
                                            color={ROYAL_BLUE}
                                            style={styles.switchAccText}
                                        />
                                    </TouchableOpacity>
                                )}
                            </View>
                        </View>
                    </View>
                    {proxyData.maybank && !isSuspendedby && (
                        <FixedActionContainer>
                            <View style={styles.containerButton}>
                                <ActionButton
                                    fullWidth
                                    backgroundColor={WHITE}
                                    borderColor={GREY}
                                    borderWidth={1}
                                    componentCenter={
                                        <Typo
                                            fontSize={14}
                                            fontWeight="600"
                                            fontStyle="normal"
                                            letterSpacing={0}
                                            lineHeight={18}
                                            text={DEREGISTER_DUITNOW}
                                        />
                                    }
                                    onPress={this.deRegisterAction}
                                />
                                <ActionButton
                                    fullWidth
                                    backgroundColor={YELLOW}
                                    style={styles.disableCTA}
                                    componentCenter={
                                        <Typo
                                            fontSize={14}
                                            fontWeight="600"
                                            fontStyle="normal"
                                            letterSpacing={0}
                                            lineHeight={18}
                                            text={proxyData.proxyStatus ? DISABLE_TEMP : ENABLE}
                                        />
                                    }
                                    onPress={this.disableAction}
                                />
                            </View>
                        </FixedActionContainer>
                    )}
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
                                    txnType: DUITNOW_DETAILS,
                                },
                            }}
                        />
                    )}
                </ScreenLayout>
                <Popup
                    visible={isPopupDisplay}
                    title={popupTitle}
                    description={popupDesc}
                    onClose={this.handleClose}
                    primaryAction={{
                        text: "Confirm",
                        onPress: this.handleConfirmPress,
                    }}
                />
            </ScreenContainer>
        );
    }
}

const styles = StyleSheet.create({
    accountView: {
        backgroundColor: WHITE,
        borderTopColor: GREY,
        borderTopWidth: 1,
        height: 90,
    },

    accountnumberText: {
        marginLeft: 24,
        width: "56%",
    },

    bankNameText: {
        marginLeft: 24,
        marginTop: 10,
    },
    bankText: {
        marginLeft: 24,
        marginTop: 17,
    },
    container: {
        flex: 1,
    },
    containerButton: {
        width: "100%",
    },
    displayView: {
        alignItems: "center",
        flexDirection: "row",
        height: 20,
        marginTop: 5,
    },
    linkAccountText: {
        marginLeft: 24,
        marginRight: 48,
        marginTop: 20,
    },
    mobileNumberText: {
        marginLeft: 24,
        marginRight: 48,
        marginTop: 10,
    },
    statusText: {
        width: "25%",
    },
    statusView: {
        alignItems: "center",
        backgroundColor: WHITE,
        borderTopColor: GREY,
        borderTopWidth: 1,
        flexDirection: "row",
        height: 80,
        marginTop: 20,
    },
    switchAccText: {
        width: "100%",
    },
    switchAccView: {
        width: "40%",
    },

    valueText: {
        marginLeft: 24,
        width: "65%",
    },
    disableCTA: { marginTop: 24 },
});

export default withModelContext(DuitnowDetails);
