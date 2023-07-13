import PropTypes from "prop-types";
import React, { Component } from "react";
import { View, StyleSheet, ScrollView, TouchableOpacity } from "react-native";
import DeviceInfo from "react-native-device-info";

import {
    RELOAD_SELECT_AMOUNT,
    RELOAD_STATUS,
    BANKINGV2_MODULE,
    ACCOUNT_DETAILS_SCREEN,
    TAB_NAVIGATOR,
    TAB,
    MORE,
    DASHBOARD,
} from "@navigation/navigationConstant";

import HeaderLayout from "@layouts/HeaderLayout";
import ScreenLayout from "@layouts/ScreenLayout";

import ActionButton from "@components/Buttons/ActionButton";
import HeaderBackButton from "@components/Buttons/HeaderBackButton";
import HeaderCloseButton from "@components/Buttons/HeaderCloseButton";
import ScreenContainer from "@components/Containers/ScreenContainer";
import FixedActionContainer from "@components/Footers/FixedActionContainer";
import InlineEditor from "@components/Inputs/InlineEditor";
import Secure2uAuthenticationModal from "@components/Modals/Secure2uAuthenticationModal";
import TacModal from "@components/Modals/TacModal";
import DynamicImage from "@components/Others/DynamicImage";
import ChallengeQuestion from "@components/RSA/ChallengeQuestion";
import Typo from "@components/Text";
import { showErrorToast, showInfoToast } from "@components/Toast";
import AccountList from "@components/Transfers/TransferConfirmationAccountList";

import { withModelContext } from "@context";

import { invokeL3, mobileReloadInquiry, mobileReload } from "@services";
import { logEvent } from "@services/analytics";

import { MEDIUM_GREY, GREY, YELLOW, ROYAL_BLUE } from "@constants/colors";
import {
    SECURE2U_IS_DOWN,
    PAYMENT_FAILED,
    RELOAD_FAIL,
    FAIL_STATUS,
    SUCC_STATUS,
    RELOAD_SUCCESS,
    CONFIRMATION,
    PAY_FROM,
    PAY_NOW,
    FA_VIEW_SCREEN,
    FA_SCREEN_NAME,
    FA_RELOAD_REVIEWDETAILS,
} from "@constants/strings";

import { getSendingFormatDate } from "@utils/dataModel";
import { getDeviceRSAInformation, formatReloadMobileNumber } from "@utils/dataModel/utility";

class ReloadConfirmation extends Component {
    constructor(props) {
        super(props);
        this.state = {
            // Telco Details
            mobileNumber: "",
            amount: "",
            seletedTelco: [],
            telcoImage: "",
            telcoName: "",
            dateText: getSendingFormatDate(new Date(), "short"),
            seletedAmount: "",
            seletedPayee: "",
            mbbPincode: "",

            // CASA Accounts related
            casaAccounts: [],
            selectedAccount: {},

            // S2u/TAC related
            secure2uValidateData: {},
            flow: "",
            showS2u: false,
            pollingToken: "",
            s2uTransactionDetails: [],
            showTAC: false,
            tacParams: null,
            formattedTransactionRefNumber: null,
            additionalStatusDescription: null,
            serverDate: null,
            secure2uExtraParams: {
                metadata: { txnType: "MOBILE_RELOAD" },
            },
            detailsArray: [],
            stateData: {},
            reloadParams: null,
            isTAC: false,
            buttonDisabled: false,

            // RSA-CQ Related
            challenge: null,
            isCQRequired: false,
            challengeQuestion: "",
            showCQLoader: true,
            rsaRetryCount: 0,
            showCQError: false,
        };
    }

    componentDidMount() {
        console.log("[ReloadConfirmation] >> [componentDidMount]");
        logEvent(FA_VIEW_SCREEN, {
            [FA_SCREEN_NAME]: FA_RELOAD_REVIEWDETAILS,
        });

        const stateData = this.props?.route?.params;
        if (stateData) this.updateScreenUI(stateData);
        console.log("[ReloadConfirmation] >> [componentDidMount]", stateData);
    }

    updateScreenUI = (stateData) => {
        console.log("[ReloadConfirmation] >> [updateScreenUI]");

        let flow = "";
        const selectedParams = stateData?.selectedParams ?? {};
        const mobileNo = selectedParams?.mobileNo ?? "";

        switch (stateData?.flow) {
            case "S2UReg":
                if (stateData?.auth == "fail") {
                    showErrorToast({
                        message: "Failed to register for Secure2u.Please use TAC.",
                    });
                    flow = "TAC";
                } else {
                    flow = "S2U";
                }
                break;
            case "S2U":
                flow = "S2U";
                break;
            case "TAC":
                showInfoToast({
                    message: SECURE2U_IS_DOWN,
                });
                flow = "TAC";
                break;
            default:
                break;
        }

        this.setState({
            mobileNumber: mobileNo,
            amount: selectedParams?.amount,
            seletedTelco: selectedParams?.seletedTelco,
            telcoImage: selectedParams?.seletedTelco?.image,
            seletedAmount: selectedParams?.selectedAmount?.mvAmount,
            seletedPayee: selectedParams?.seletedTelco?.payeeCode,
            telcoName: selectedParams?.seletedTelco?.shortName,
            casaAccounts: stateData?.casaAccounts,
            selectedAccount: stateData?.selectedAccount,
            stateData: stateData,
            flow: flow,
        });
    };

    onCloseTap = () => {
        console.log("[ReloadConfirmation] >> [onCloseTap]");

        const routeFrom = this.props.route.params?.selectedParams?.routeFrom ?? "";

        if (routeFrom === "AccountDetails") {
            this.props.navigation.navigate(BANKINGV2_MODULE, {
                screen: ACCOUNT_DETAILS_SCREEN,
            });
            return;
        }

        if (routeFrom === "WALLET_DASHBOARD") {
            this.props.navigation.navigate(TAB_NAVIGATOR, {
                screen: TAB,
                params: {
                    screen: MORE,
                },
            });
            return;
        }

        this.props.navigation.navigate(TAB_NAVIGATOR, {
            screen: TAB,
            params: {
                screen: DASHBOARD,
                params: { refresh: true },
            },
        });
    };

    onAccountSelect = (item) => {
        console.log("[ReloadConfirmation] >> [onAccountSelect]");

        const selectedAccNum = item.number;
        const { casaAccounts } = this.state;

        const casaUpdated = casaAccounts.map((item) => {
            return {
                ...item,
                selected: item.number === selectedAccNum,
            };
        });

        this.setState({ casaAccounts: casaUpdated, selectedAccount: item });
    };

    mobileReloadEnquiry = async (params) => {
        console.log("[ReloadConfirmation] >> [mobileReloadEnquiry]");

        const httpResp = await mobileReloadInquiry(params);
        const response = httpResp.data;
        if (response != null && response.code === 200) {
            this.setState({ mbbPincode: response.result.AcctSel.MBB_PinlessCode });
            return true;
        } else {
            showErrorToast({
                message: response.result.errorStatus,
            });
            return false;
        }
    };

    getReloadParams = () => {
        console.log("[ReloadConfirmation] >> [getReloadParams]");

        const { getModel } = this.props;
        const { username } = getModel("user");
        const deviceInfo = getModel("device");
        const mobileSDK = getDeviceRSAInformation(deviceInfo.deviceInformation, DeviceInfo);
        const {
            selectedAccount,
            seletedPayee,
            mbbPincode,
            seletedAmount,
            mobileNumber,
            telcoName,
        } = this.state;

        return {
            customerName: username,
            effectiveDate: "00000000",
            fromAccount: selectedAccount?.number,
            fromAccountCode: selectedAccount?.code,
            mbbaccountType: selectedAccount?.type,
            mbbbankCode: seletedPayee,
            secure2UPull: true,
            twoFAType: "SECURE2U_PULL",
            smsTac: "",
            toAccount: mbbPincode,
            transferAmount: seletedAmount,
            mobileNumber: mobileNumber,
            mobileSDKData: mobileSDK,
            recipientName: telcoName,
        };
    };

    onPayNow = async () => {
        //TODO: prevent multiple triggering button, thus proceed ahead only if Validation successful
        if (this.state.buttonDisabled || !this.state.selectedAccount) {
            return;
        }
        console.log("[ReloadConfirmation] >> [onPayNow]");
        const { getModel } = this.props;
        const { isPostPassword } = getModel("auth");
        const { seletedAmount, mobileNumber, seletedPayee, flow, stateData } = this.state;
        // Check for  Reload enquiry
        const params = {
            denominationAmount: seletedAmount,
            mobileNo: mobileNumber,
            payeeCode: seletedPayee,
        };
        const enquiry = await this.mobileReloadEnquiry(params);
        console.log("enquiry iss", enquiry);
        if (enquiry) {
            // L3 call to invoke login page
            if (!isPostPassword) {
                const httpResp = await invokeL3(true).catch((error) => {
                    console.log("[ReloadConfirmation][onPayNow] >> Exception: ", error);
                    return;
                });
                const code = httpResp?.data?.code ?? null;
                if (code !== 0) return;
            }

            let reloadParams = this.getReloadParams();
            this.setState({ reloadParams });
            if (flow === "S2U") {
                // Call Reload API
                this.invokeReloadAPI(
                    {
                        ...reloadParams,
                        twoFAType:
                            stateData.secure2uValidateData?.pull === "N"
                                ? "SECURE2U_PUSH"
                                : reloadParams.twoFAType,
                    },
                    false
                );
            } else {
                this.navigateToTACFlow();
            }
        }
        this.setState({ buttonDisabled: true });
    };

    navigateToTACFlow = () => {
        console.log("[ReloadConfirmation] >> [navigateToTACFlow]");

        const { seletedAmount, stateData, mbbPincode, seletedTelco } = this.state;

        // Show TAC Modal
        this.setState({
            isTAC: true,
            showTAC: true,
            tacParams: {
                amount: seletedAmount,
                fundTransferType: "MOBILE_RELOAD_OTP",
                accCode: stateData?.selectedAccount?.code,
                toAcctNo: mbbPincode,
                payeeBank: seletedTelco?.shortName,
            },
        });
    };

    invokeReloadAPI = (parmas, isTAC) => {
        console.log("[ReloadConfirmation] >> [invokeReloadAPI]");

        let detailsArray = [];
        const { telcoName, mobileNumber, seletedAmount } = this.state;

        mobileReload(parmas)
            .then((httpResp) => {
                console.log("[ReloadConfirmation][invokeReloadAPI] >> Response: ", httpResp);

                // Hide TAC Modal
                if (isTAC) this.hideTAC();

                const data = httpResp?.data ?? "";
                if (data) {
                    const {
                        statusCode,
                        formattedTransactionRefNumber,
                        serverDate,
                        additionalStatusDescription,
                        statusDescription,
                    } = data;

                    // Check for Ref ID
                    if (formattedTransactionRefNumber) {
                        detailsArray.push({
                            key: "Reference ID",
                            value: formattedTransactionRefNumber,
                        });
                    }

                    // Check for Server Date/Time
                    if (serverDate) {
                        detailsArray.push({
                            key: "Date & time",
                            value: serverDate,
                        });
                    }

                    // Reset RSA/CQ flags
                    this.resetCQFlags();

                    if (statusCode === "0") {
                        if (telcoName) {
                            detailsArray.push({
                                key: "Provider",
                                value: telcoName,
                            });
                        }

                        if (mobileNumber) {
                            detailsArray.push({
                                key: "Mobile Number",
                                value: formatReloadMobileNumber(mobileNumber.replace("6", "")),
                            });
                        }

                        if (seletedAmount) {
                            detailsArray.push({
                                key: "Amount",
                                value: `RM ${seletedAmount}`,
                            });
                        }

                        // To be used later for S2u flow
                        this.setState({
                            detailsArray,
                            formattedTransactionRefNumber,
                            serverDate,
                            additionalStatusDescription,
                        });

                        if (isTAC) {
                            // Show success page
                            this.gotoSuccessStatusPage({ detailsArray });
                        } else {
                            this.showS2uModal(data);
                        }
                    } else {
                        const serverError = additionalStatusDescription || statusDescription || "";
                        this.gotoFailStatusPage({ detailsArray, serverError });
                    }
                }
            })
            .catch((error) => {
                console.log("[ReloadConfirmation][invokeReloadAPI] >> Exception: ", error);

                // Hide TAC Modal
                if (isTAC) this.hideTAC();

                const {
                    status,
                    error: { challenge },
                } = error;

                if (status == 428) {
                    // Display RSA Challenge Questions if status is 428
                    this.setState((prevState) => ({
                        challenge: challenge,
                        isCQRequired: true,
                        showCQLoader: false,
                        buttonDisabled: false,
                        challengeQuestion: challenge?.questionText,
                        rsaRetryCount: prevState.rsaRetryCount + 1,
                        showCQError: prevState.rsaRetryCount > 0,
                    }));
                } else {
                    this.setState(
                        {
                            reloadParams: null,
                            showCQLoader: false,
                            showCQError: false,
                            isCQRequired: false,
                            buttonDisabled: false,
                        },
                        () => {
                            // Navigate to acknowledgement screen
                            this.handleAPIException(error, isTAC);
                        }
                    );
                }
            });
    };

    handleAPIException = (error) => {
        console.log("[ReloadConfirmation] >> [handleAPIException]");

        let detailsArray = [];
        const {
            error: {
                serverDate,
                formattedTransactionRefNumber,
                statusDescription,
                additionalStatusDescription,
            },
            message,
            status,
        } = error;
        const serverError = additionalStatusDescription || statusDescription || message || "";
        const lockServerError = serverDate ? `Logged out on ${serverDate}` : "Logged out";

        // Default values
        let statusServerError = serverError;
        let statusHeaderText = PAYMENT_FAILED;

        // Check for Ref ID
        if (formattedTransactionRefNumber) {
            detailsArray.push({
                key: "Reference ID",
                value: formattedTransactionRefNumber,
            });
        }

        // Check for Server Date/Time
        if (serverDate) {
            detailsArray.push({
                key: "Date & time",
                value: serverDate,
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

    resetCQFlags = () => {
        console.log("[ReloadConfirmation] >> [resetCQFlags]");

        this.setState({
            showCQLoader: false,
            showCQError: false,
            isCQRequired: false,
        });
    };

    onCQSnackClosePress = () => {
        console.log("[ReloadConfirmation] >> [onCQSnackClosePress]");

        this.setState({ showCQError: false });
    };

    onCQSubmitPress = (answer) => {
        console.log("[ReloadConfirmation] >> [onCQSubmitPress]");

        const { challenge, isTAC, reloadParams } = this.state;

        this.setState(
            {
                showCQLoader: true,
                showCQError: false,
            },
            () => {
                this.invokeReloadAPI(
                    {
                        ...reloadParams,
                        challenge: { ...challenge, answer },
                    },
                    isTAC
                );
            }
        );
    };

    showS2uModal = (response) => {
        console.log("[ReloadConfirmation] >> [showS2uModal]");

        const { telcoName, mobileNumber, dateText, selectedAccount } = this.state;
        const { name, number } = selectedAccount;
        const trimmedAccountNumber = number
            .substring(0, 12)
            .replace(/[^\dA-Z]/g, "")
            .replace(/(.{4})/g, "$1 ")
            .trim();
        const { pollingToken, token } = response;
        const s2uTransactionDetails = [
            {
                label: "To",
                value: `${telcoName}\n${formatReloadMobileNumber(mobileNumber.replace("6", ""))}`,
            },
            {
                label: "From",
                value: `${name}\n${trimmedAccountNumber}`,
            },
            { label: "Transaction Type", value: "Buy reload" },
            {
                label: "Date",
                value: dateText,
            },
        ];
        const s2uPollingToken = pollingToken || token || "";

        this.setState(
            {
                pollingToken: s2uPollingToken,
                s2uTransactionDetails,
            },
            () => {
                this.setState({ showS2u: true });
            }
        );
    };

    onS2uDone = (response) => {
        console.log("[ReloadConfirmation] >> [onS2uDone]");

        const { transactionStatus, s2uSignRespone } = response;

        // Close S2u popup
        this.onS2uClose();

        if (transactionStatus) {
            // Show success page
            this.gotoSuccessStatusPage({});
        } else {
            const { text } = s2uSignRespone;
            const serverError = text || "";
            this.gotoFailStatusPage({ serverError });
        }
    };

    onS2uClose = () => {
        console.log("[ReloadConfirmation] >> [onS2uClose]");
        // will close tac popup
        this.setState({ showS2u: false });
    };

    onTACDone = (tac) => {
        console.log("[ReloadConfirmation] >> [onTACDone]");

        // Retrieve reload params and override TAC values
        const reloadParams = {
            ...this.getReloadParams(),
            secure2UPull: false,
            twoFAType: "TAC",
            smsTac: tac,
        };

        // Hide TAC Modal and save params in state
        this.setState({ reloadParams, showTAC: false });

        // Call Reload API
        this.invokeReloadAPI(reloadParams, true);
    };

    hideTAC = () => {
        console.log("[ReloadConfirmation] >> [hideTAC]");

        this.setState({
            showTAC: false,
        });
    };

    onTACClose = () => {
        console.log("[ReloadConfirmation] >> [onTACClose]");

        // Hide TAC Modal
        this.hideTAC();

        // Navigate back to entry point
        this.onCloseTap();
    };

    gotoFailStatusPage = ({
        detailsArray,
        headerText = RELOAD_FAIL,
        serverError = "",
        isLocked = false,
    }) => {
        console.log("[ReloadConfirmation] >> [gotoFailStatusPage]");

        const { detailsArray: stateDetailsArray } = this.state;

        this.props.navigation.navigate(RELOAD_STATUS, {
            routeFrom: this.props.route?.params?.selectedParams?.routeFrom,
            status: FAIL_STATUS,
            headerText,
            detailsArray: detailsArray || stateDetailsArray || false,
            serverError,
            isLocked,
        });
    };

    gotoSuccessStatusPage = ({ detailsArray, serverError = "" }) => {
        console.log("[ReloadConfirmation] >> [gotoSuccessStatusPage]");

        const {
            additionalStatusDescription,
            detailsArray: stateDetailsArray,
            seletedAmount,
            telcoName,
            showS2u,
        } = this.state;

        // Get receipt details
        const receiptDetailsArray = this.constructReceiptDetailsArray();

        this.props.navigation.navigate(RELOAD_STATUS, {
            status: SUCC_STATUS,
            headerText: RELOAD_SUCCESS,
            detailsArray: detailsArray || stateDetailsArray || false,
            showShareReceipt: true,
            receiptDetailsArray,
            serverError: serverError || additionalStatusDescription || "",
            routeFrom: this.props.route?.params?.selectedParams?.routeFrom,
            amount: seletedAmount,
            telcoName,
            isS2uFlow: showS2u,
        });
    };

    constructReceiptDetailsArray = () => {
        console.log("[ReloadConfirmation] >> [constructReceiptDetailsArray]");

        const {
            formattedTransactionRefNumber,
            serverDate,
            telcoName,
            mobileNumber,
            seletedAmount,
        } = this.state;

        const receiptDetailsArray = [
            {
                label: "Reference ID",
                value: formattedTransactionRefNumber,
                showRightText: true,
                rightTextType: "text",
                rightStatusType: "",
                rightText: serverDate,
            },
            {
                label: "Provider",
                value: telcoName,
                showRightText: false,
            },
            {
                label: "Mobile Number",
                value: formatReloadMobileNumber(mobileNumber.replace("6", "")),
                showRightText: false,
            },
            {
                label: "Amount",
                value: `RM ${seletedAmount}`,
                showRightText: false,
                isAmount: true,
            },
        ];

        return receiptDetailsArray;
    };

    _onEditAmount = () => {
        console.log("[ReloadConfirmation] >> [_onEditAmount]");

        this.props.navigation.navigate(RELOAD_SELECT_AMOUNT);
    };

    onBackTap = () => {
        console.log("[ReloadConfirmation] >> [onBackTap]");
        this.props.navigation.navigate(RELOAD_SELECT_AMOUNT);
    };

    render() {
        const {
            casaAccounts,
            dateText,
            showTAC,
            tacParams,
            showS2u,
            pollingToken,
            s2uTransactionDetails,
            secure2uExtraParams,
            mobileNumber,
            amount,
            telcoName,
            seletedAmount,
            showCQLoader,
            isCQRequired,
            showCQError,
            stateData,
            challengeQuestion,
            buttonDisabled,
        } = this.state;
        return (
            <ScreenContainer backgroundType="color" backgroundColor={MEDIUM_GREY}>
                <React.Fragment>
                    <ScreenLayout
                        paddingBottom={0}
                        paddingTop={0}
                        paddingHorizontal={0}
                        useSafeArea
                        header={
                            <HeaderLayout
                                headerCenterElement={
                                    <Typo
                                        fontSize={16}
                                        fontWeight="600"
                                        lineHeight={19}
                                        text={CONFIRMATION}
                                    />
                                }
                                headerRightElement={<HeaderCloseButton onPress={this.onCloseTap} />}
                                headerLeftElement={<HeaderBackButton onPress={this.onBackTap} />}
                            />
                        }
                    >
                        <React.Fragment>
                            <ScrollView>
                                {/* Top Details View */}
                                <View style={Style.containerView}>
                                    {/* Telco Logo & Name */}
                                    <View style={Style.avatarContCls}>
                                        <DynamicImage
                                            item={this.state.seletedTelco}
                                            type="CategoryList"
                                        />
                                    </View>

                                    {/* Telco Name */}
                                    <Typo
                                        fontSize={14}
                                        lineHeight={18}
                                        fontWeight="600"
                                        text={telcoName}
                                        style={Style.nameText}
                                    />

                                    {/* Mobile Number */}
                                    <Typo
                                        fontSize={14}
                                        lineHeight={20}
                                        text={formatReloadMobileNumber(
                                            mobileNumber.replace("6", "")
                                        )}
                                        style={Style.mobileNumberText}
                                    />

                                    {/* Reload Amount */}
                                    <TouchableOpacity onPress={this._onEditAmount}>
                                        <Typo
                                            fontSize={24}
                                            lineHeight={31}
                                            fontWeight="bold"
                                            fontStyle="normal"
                                            color={ROYAL_BLUE}
                                            text={amount}
                                            style={Style.amountText}
                                        />
                                    </TouchableOpacity>
                                </View>

                                {/* Date */}
                                <View style={Style.dateView}>
                                    <InlineEditor
                                        label="Date"
                                        value={dateText}
                                        componentID="dateText"
                                        isEditable={false}
                                        editType="press"
                                        style={Style.dateText}
                                    />
                                </View>

                                {/* Gray separator line */}
                                <View style={Style.graySeparator} />

                                {/* AccountList */}
                                <View style={Style.accountsView}>
                                    <AccountList
                                        title={PAY_FROM}
                                        data={casaAccounts}
                                        onPress={this.onAccountSelect}
                                        extraData={casaAccounts}
                                        paddingLeft={24}
                                    />
                                </View>
                            </ScrollView>

                            <FixedActionContainer>
                                <View style={Style.bottomBtnContCls}>
                                    <ActionButton
                                        disabled={buttonDisabled}
                                        backgroundColor={YELLOW}
                                        fullWidth
                                        componentCenter={
                                            <Typo fontWeight="600" lineHeight={18} text={PAY_NOW} />
                                        }
                                        onPress={this.onPayNow}
                                    />
                                </View>
                            </FixedActionContainer>
                        </React.Fragment>
                    </ScreenLayout>

                    {showS2u && (
                        <Secure2uAuthenticationModal
                            token={pollingToken}
                            amount={seletedAmount}
                            onS2UDone={this.onS2uDone}
                            onS2UClose={this.onS2uClose}
                            s2uPollingData={stateData?.secure2uValidateData}
                            transactionDetails={s2uTransactionDetails}
                            extraParams={secure2uExtraParams}
                        />
                    )}

                    {showTAC && (
                        <TacModal
                            tacParams={tacParams}
                            validateByOwnAPI={true}
                            validateTAC={this.onTACDone}
                            onTacClose={this.onTACClose}
                            onGetTacError={this.hideTAC}
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

ReloadConfirmation.propTypes = {
    getModel: PropTypes.func,
    navigation: PropTypes.shape({
        navigate: PropTypes.func,
    }),
    route: PropTypes.shape({
        params: PropTypes.shape({
            selectedParams: PropTypes.shape({
                routeFrom: PropTypes.string,
            }),
        }),
    }),
};

const Style = StyleSheet.create({
    accountsView: {
        paddingTop: 25,
    },

    amountText: {
        marginTop: 25,
    },

    avatarContCls: {
        alignItems: "center",
        justifyContent: "center",
        marginTop: 15,
    },

    bottomBtnContCls: {
        flexDirection: "row",
        justifyContent: "space-around",
        width: "100%",
    },

    containerView: {
        alignItems: "center",
        justifyContent: "space-between",
        marginBottom: 30,
    },

    dateText: {
        height: 50,
    },

    dateView: {
        height: 20,
        marginBottom: 30,
        marginHorizontal: 24,
    },

    graySeparator: {
        borderColor: GREY,
        borderTopWidth: 1,
        height: 1,
        marginHorizontal: 24,
    },

    mobileNumberText: {
        marginTop: 5,
    },

    nameText: {
        marginTop: 15,
    },
});

export default withModelContext(ReloadConfirmation);
