import PropTypes from "prop-types";
import React, { Component } from "react";
import { View, StyleSheet, TouchableOpacity } from "react-native";

import { navigateToS2UCooling, navigateToS2UReg } from "@screens/OneTapAuth/CoolingNavigator";

import {
    DUITNOW_SUCESS,
    DUITNOW_FAILURE,
    SETTINGS_MODULE,
    DUITNOW_CONFIRMATION,
    COMMON_MODULE,
    PDF_VIEW,
    DUITNOW_DASHBOARD,
} from "@navigation/navigationConstant";

import HeaderLayout from "@layouts/HeaderLayout";
import ScreenLayout from "@layouts/ScreenLayout";

import ActionButton from "@components/Buttons/ActionButton";
import HeaderBackButton from "@components/Buttons/HeaderBackButton";
import ScreenContainer from "@components/Containers/ScreenContainer";
import FixedActionContainer from "@components/Footers/FixedActionContainer";
import Secure2uAuthenticationModal from "@components/Modals/Secure2uAuthenticationModal";
import Typo from "@components/Text";
import { showErrorToast } from "@components/Toast";

import { withModelContext } from "@context";

import { duitnowServices } from "@services";

import { MEDIUM_GREY, YELLOW } from "@constants/colors";
import { M2U, S2U_PUSH, SMS_TAC, SUCCESS } from "@constants/data";
import { FN_DN_TRANSFER, FN_DN_UPDATE } from "@constants/fundConstants";
import {
    DUITNOW,
    FA_SETTINGS_DUITNOW_REGISTRATION_CONFIRMDETAILS,
    FA_SETTINGS_DUITNOW_SWITCHACCOUNT_CONFIRMDETAILS,
    SELECT_ACCOUNT,
    TERMS_CONDITIONS,
    DUITNOW_CONFIRMATION as DUITNOWCONFIRMATION,
    DUITNOW_TERMS_AND_CONDITIONS_FILE_URL,
    COMMON_ERROR_MSG,
    AGREE_AND_CONFIRM,
    SWITCH_DUITNOW_SUCCESS,
    SWITCH_DUITNOW_UNSUCCESS,
} from "@constants/strings";

import {
    handleS2UAcknowledgementScreen,
    init,
    initChallenge,
    s2uSdkLogs,
    showS2UDownToast,
} from "@utils/dataModel/s2uSDKUtil";
import { maskIdValue, formatMobileNumber } from "@utils/dataModel/utility";

import * as DuitNowController from "./DuitNowController";

class DuitnowConfirmation extends Component {
    static propTypes = {
        getModel: PropTypes.func,
        navigation: PropTypes.object,
        route: PropTypes.shape({
            params: PropTypes.shape({
                proxyDetails: PropTypes.shape({
                    accountInfo: PropTypes.any,
                    proxyDetails: PropTypes.shape({
                        type: PropTypes.any,
                        seletedItem: PropTypes.any,
                        proxyDetails: PropTypes.any,
                    }),
                }),
            }),
        }),
    };

    constructor(props) {
        super(props);
        this.state = {
            selectedAccInfo: props.route?.params?.proxyDetails?.accountInfo,
            selectedProxyInfo: props.route?.params?.proxyDetails?.proxyDetails?.seletedItem,
            proxyDetails: props.route?.params?.proxyDetails?.proxyDetails?.proxyDetails,
            type: props.route?.params?.proxyDetails?.proxyDetails?.type,
            proxyIdNo: props.route?.params?.proxyDetails?.proxyDetails?.seletedItem
                ?.isregisteredProxy
                ? props.route?.params?.proxyDetails?.proxyDetails?.seletedItem?.idVal || ""
                : props.route?.params?.proxyDetails?.proxyDetails?.seletedItem?.value || "",

            //S2U V4
            showS2UModal: false,
            mapperData: {},
            nonTxnData: { isNonTxn: true },
        };
    }

    handleBack = () => {
        console.log("[DuitnowDetails] >> [handleBack]");
        this.props.navigation.goBack();
    };

    componentDidMount = () => {
        console.log("[DuitnowConfirmation] >> [componentDidMount]");
        this.props.navigation.addListener("focus", this.onScreenFocus);
    };

    onScreenFocus = () => {
        console.log("[DuitnowConfirmation] >> [onScreenFocus]");
        const params = this.props?.route?.params;
        this.handleSuccessFail(params);
    };

    handleSuccessFail = (params) => {
        if (params?.auth === "successful") {
            this.props.navigation.setParams({ auth: "" });
            this.props.navigation.navigate(DUITNOW_SUCESS, {
                selectedAccInfo: params?.selectedAccInfo,
                selectedProxyInfo: params?.selectedProxyInfo,
                type: params?.proxyDetails?.proxyDetails?.type,
            });
        } else if (params?.auth === "fail") {
            this.props.navigation.setParams({ auth: "" });
            this.props.navigation.navigate(DUITNOW_FAILURE, {
                seletedItem: params?.seletedItem,
                errorobj: params?.errorobj,
                type: params?.proxyDetails?.proxyDetails?.type,
            });
        }
    };

    //S2U V4
    s2uSDKInit = async (screenParams) => {
        const params = this.getParams("");
        delete params.tac;
        return await init(screenParams?.functionCode, params);
    };

    //S2U V4
    initiateS2USdk = async () => {
        try {
            const { selectedProxyInfo, selectedAccInfo, proxyDetails, type } = this.state;
            const screenParams = {
                selectedProxyInfo,
                selectedAccInfo,
                proxyDetails,
                type,
                functionCode: selectedProxyInfo?.maybank ? FN_DN_UPDATE : FN_DN_TRANSFER,
            };
            if (type === "SelectAccount") {
                this.handleProceedOtp(screenParams);
                return;
            }
            const s2uInitResponse = await this.s2uSDKInit(screenParams);
            if (s2uInitResponse?.message || s2uInitResponse.statusCode !== 0) {
                showErrorToast({
                    message: s2uInitResponse.message || COMMON_ERROR_MSG,
                });
            } else {
                if (s2uInitResponse?.actionFlow === SMS_TAC) {
                    //............ ConfirmScreen
                    showS2UDownToast();
                    this.handleProceedOtp(screenParams);
                } else if (s2uInitResponse?.actionFlow === S2U_PUSH) {
                    if (s2uInitResponse?.s2uRegistrationDetails?.app_id === M2U) {
                        this.doS2uRegistration(this.props.navigation.navigate);
                    }
                } else {
                    this.initS2UPull(s2uInitResponse);
                }
            }
        } catch (error) {
            console.log("Duitnow confirmation s2u catch : ", error);
            s2uSdkLogs(error, "DuitNow Confirmation");
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
            succScreen: DUITNOW_CONFIRMATION,
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
            const result = executePayload?.result;
            ackDetails.titleMessage =
                result?.status === SUCCESS ? SWITCH_DUITNOW_SUCCESS : SWITCH_DUITNOW_UNSUCCESS;
            ackDetails.transactionSuccess = result?.status === SUCCESS;
        }
        handleS2UAcknowledgementScreen(ackDetails);
    };

    handleProceedOtp = (screenParams) => {
        console.log("[DuitnowConfirmation] >> [handleProceedOtp]");
        const { selectedProxyInfo, proxyIdNo, type } = this.state;
        const { m2uPhoneNumber } = this.props.getModel("m2uDetails");
        const mobileNumber =
            m2uPhoneNumber.indexOf("60") < 0 ? `60${m2uPhoneNumber}` : m2uPhoneNumber;

        const otpReqBody = {
            fundTransferType: selectedProxyInfo?.maybank
                ? "DUITNOW_MAINT_UPDATE"
                : "DUITNOW_MAINT_TRANSFER",
            proxyIdNo,
        };
        if (type === "updateAccount") {
            this.props.navigation.navigate(SETTINGS_MODULE, {
                screen: "ConfirmPhoneNumber",
                params: {
                    externalSource: {
                        stack: SETTINGS_MODULE,
                        screen: DUITNOW_CONFIRMATION,
                        params: {
                            reqParams: {
                                reqOTPURL: "2fa/v1/tac",
                                validateOTPURL: "transfer/v1/duitnow/register",
                                reqBody: otpReqBody,
                            },
                            screenParams,
                            from: "switchAccount",
                        },
                    },
                    // temp fix since userDetails still doesn't save the number with 60
                    phone: mobileNumber,
                },
            });
            return;
        }

        const params = this.getParams("");
        this.getDuitNowAPICall(params, screenParams);
    };
    // DuitNow Services API Call
    // -----------------------
    getDuitNowAPICall = (params, screenParams) => {
        console.log("[DuitnowDetails] >> [getDuitNowAPICall]");
        const { selectedAccInfo, selectedProxyInfo } = this.state;
        duitnowServices(params)
            .then((respone) => {
                const result = respone.data.result;
                console.log("[DuitnowDetails] >> [getDuitNowAPICall] ", respone.code, screenParams);
                if (result.status === "SUCCESS") {
                    DuitNowController.getDuitNowGADetails(screenParams?.serviceType, true);
                    this.props.navigation.navigate(DUITNOW_SUCESS, {
                        selectedAccInfo,
                        selectedProxyInfo,
                    });
                    return;
                }
                DuitNowController.getDuitNowGADetails(screenParams?.serviceType, false);
                this.props.navigation.navigate(DUITNOW_FAILURE, {
                    seletedItem: selectedProxyInfo,
                    errorobj: result?.duitnowResponseList[0],
                });
            })
            .catch((error) => {
                DuitNowController.getDuitNowGADetails(screenParams?.serviceType, false);
                console.log(`is Error`, error);
            });
    };
    getParams = (tacNumber) => {
        console.log("[DuitnowConfirmation] >> [getParams]");
        const { selectedAccInfo, selectedProxyInfo, proxyDetails, type } = this.state;
        return {
            pan: "",
            actionForceExpire: "000",
            noOfTrx: 1,
            proxyBankCode: "MBBEMYKL",
            registrationRequests: [
                {
                    accHolderName: "",
                    accHolderType: "S",
                    accName: selectedAccInfo.name || "",
                    accNo: selectedAccInfo?.number?.substring(0, 12).replace(/\s/g, "") || "",
                    accType: "S",
                    proxyIdNo: selectedProxyInfo?.isregisteredProxy
                        ? selectedProxyInfo?.idVal || ""
                        : selectedProxyInfo?.value || "",
                    proxyIdType: selectedProxyInfo?.proxyTypeCode || "",
                    regRefNo: selectedProxyInfo?.regRefNo || "",
                    regStatus: "",
                },
            ],
            secondaryId: proxyDetails?.secondaryId || "",
            secondaryIdType: proxyDetails?.secondaryIdType || "",
            service:
                type === "SelectAccount"
                    ? "REGISTER"
                    : selectedProxyInfo?.maybank
                        ? "UPDATE"
                        : "TRANSFER",
            tac: type === "SelectAccount" ? "" : tacNumber,
        };
    };

    termsAndConditionsClicked = () => {
        const params = {
            file: DUITNOW_TERMS_AND_CONDITIONS_FILE_URL,
            share: false,
            type: "url",
            route: DUITNOW_CONFIRMATION,
            module: SETTINGS_MODULE,
            title: "Terms & Conditions",
            pdfType: "shareReceipt",
        };

        this.props.navigation.navigate(COMMON_MODULE, {
            screen: PDF_VIEW,
            params: { params },
        });
    };

    render() {
        const { selectedAccInfo, selectedProxyInfo, type, showS2UModal, mapperData, nonTxnData } =
            this.state;
        const analyticScreenName =
            type === SELECT_ACCOUNT
                ? FA_SETTINGS_DUITNOW_REGISTRATION_CONFIRMDETAILS
                : FA_SETTINGS_DUITNOW_SWITCHACCOUNT_CONFIRMDETAILS;
        return (
            <ScreenContainer
                backgroundType="color"
                backgroundColor={MEDIUM_GREY}
                analyticScreenName={analyticScreenName}
            >
                <ScreenLayout
                    paddingBottom={0}
                    paddingTop={0}
                    paddingHorizontal={0}
                    useSafeArea
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
                >
                    <View style={styles.container}>
                        <View style={styles.contentView}>
                            <Typo
                                fontSize={20}
                                fontWeight="300"
                                lineHeight={30}
                                text={DUITNOWCONFIRMATION}
                                textAlign="left"
                                style={styles.linkAccountText}
                            />

                            <Typo
                                fontSize={14}
                                fontWeight="600"
                                lineHeight={18}
                                text={selectedAccInfo.name}
                                textAlign="left"
                                style={styles.accountTypeText}
                            />

                            <Typo
                                fontSize={16}
                                fontWeight="normal"
                                lineHeight={22}
                                text={formatMobileNumber(selectedAccInfo.number?.substring(0, 12))}
                                textAlign="left"
                                style={styles.accountNumberText}
                            />
                            <Typo
                                fontSize={14}
                                fontWeight="600"
                                lineHeight={18}
                                text={selectedProxyInfo?.text}
                                textAlign="left"
                                style={styles.accountTypeText}
                            />

                            <Typo
                                fontSize={16}
                                fontWeight="normal"
                                lineHeight={22}
                                text={
                                    selectedProxyInfo?.isregisteredProxy
                                        ? selectedProxyInfo.idVal
                                        : maskIdValue(selectedProxyInfo?.value)
                                }
                                textAlign="left"
                                style={styles.accountNumberText}
                            />

                            <TouchableOpacity
                                style={styles.termsAndConditions}
                                onPress={this.termsAndConditionsClicked}
                            >
                                <Typo
                                    fontSize={12}
                                    fontWeight="normal"
                                    fontStyle="normal"
                                    lineHeight={18}
                                    letterSpacing={0}
                                    text={TERMS_CONDITIONS}
                                    textAlign="left"
                                    style={styles.termsText}
                                />
                            </TouchableOpacity>
                        </View>
                    </View>
                    <FixedActionContainer>
                        <ActionButton
                            fullWidth
                            onPress={this.initiateS2USdk}
                            backgroundColor={YELLOW}
                            componentCenter={
                                <Typo
                                    text={AGREE_AND_CONFIRM}
                                    fontSize={14}
                                    fontWeight="600"
                                    lineHeight={18}
                                />
                            }
                        />
                    </FixedActionContainer>
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
                                    txnType: DUITNOW_CONFIRMATION,
                                },
                            }}
                        />
                    )}
                </ScreenLayout>
            </ScreenContainer>
        );
    }
}

const styles = StyleSheet.create({
    accountNumberText: {
        marginTop: 10,
    },
    accountTypeText: {
        marginTop: 25,
    },
    container: {
        flex: 1,
    },
    contentView: {
        marginLeft: 24,
        marginRight: 48,
    },
    linkAccountText: {
        marginTop: 20,
    },
    termsAndConditions: {
        marginTop: 40,
    },
    termsText: {
        // width: 118,
        textDecorationLine: "underline",
    },
});
export default withModelContext(DuitnowConfirmation);
