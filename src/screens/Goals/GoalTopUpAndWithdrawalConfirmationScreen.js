import moment from "moment";
import numeral from "numeral";
import PropTypes from "prop-types";
import React from "react";
import {
    StyleSheet,
    View,
    ScrollView,
    Image,
    FlatList,
    Dimensions,
    TouchableOpacity,
} from "react-native";
import DeviceInfo from "react-native-device-info";

import { navigateToS2UCooling } from "@screens/OneTapAuth/CoolingNavigator";

import {
    ONE_TAP_AUTH_MODULE,
    DASHBOARD,
    TAB_NAVIGATOR,
    COMMON_MODULE,
    RSA_DENY_SCREEN,
    SECURE2U_COOLING,
} from "@navigation/navigationConstant";

import HeaderLayout from "@layouts/HeaderLayout";
import ScreenLayout from "@layouts/ScreenLayout";

import BorderedAvatar from "@components/Avatars/BorderedAvatar";
import ActionButton from "@components/Buttons/ActionButton";
import HeaderBackButton from "@components/Buttons/HeaderBackButton";
import HeaderCloseButton from "@components/Buttons/HeaderCloseButton";
import AccountListingCarouselCard from "@components/Cards/AccountListingCarouselCard";
import ScreenContainer from "@components/Containers/ScreenContainer";
import FixedActionContainer from "@components/Footers/FixedActionContainer";
import Secure2uAuthenticationModal from "@components/Modals/Secure2uAuthenticationModal";
import TacModal from "@components/Modals/TacModal";
import SpaceFiller from "@components/Placeholders/SpaceFiller";
import ChallengeQuestion from "@components/RSA/ChallengeQuestion";
import Typo from "@components/Text";
import { showErrorToast, showInfoToast } from "@components/Toast";

import { withModelContext } from "@context";

import { bankingGetDataMayaM2u, fundTabungAPI, goalWithdraw, invokeL3 } from "@services";
import { logEvent } from "@services/analytics";

import { SWITCH_GREY, BLACK, BLUE } from "@constants/colors";
import {
    SECURE2U_IS_DOWN,
    FA_TABUNG_REMOVETABUNG_REVIEWDETAILS,
    FA_SCREEN_NAME,
    FA_VIEW_SCREEN,
    FA_TABUNG_FUNDAMOUNT_REVIEWDETAILS,
    FA_TABUNG_WITHDRAWFUND_REVIEWDETAILS,
    FUND_TABUNG,
    TABUNG_LOWER,
} from "@constants/strings";

import {
    formateAccountNumber,
    checks2UFlow,
    getDeviceRSAInformation,
} from "@utils/dataModel/utility";
import { ErrorLogger } from "@utils/logs";

import Assets from "@assets";

const S2UFlowEnum = Object.freeze({
    s2u: "S2U",
    s2uReg: "S2UReg",
    tac: "TAC",
});

const REFERENCE_ID = "Reference ID";
const DATE_TIME = "Date & time";

class GoalTopUpAndWithdrawalConfirmation extends React.Component {
    static propTypes = {
        navigation: PropTypes.object.isRequired,
        route: PropTypes.object.isRequired,
        getModel: PropTypes.func.isRequired,
    };

    state = {
        accountListData: [],
        showLoader: true,
        selectedAccountIndex: 0,
        selectedAccountNumber: "",
        selectedAccountName: "",
        showS2UModal: false,
        s2uToken: "",
        s2uServerDate: "",
        s2uTransactionType: "",
        s2uTransactionReferenceNumber: "",
        showTACModal: false,
        tacParams: {},
        tacTransferApiParams: {},
        tacTransferApi: () => {},
        tacSuccessfulHandler: () => {},
        tacFailureHandler: () => {},
        tacTransactionReferenceNumber: "",
        tacServerDate: "",
        showRSALoader: false,
        showRSAChallengeQuestion: false,
        rsaChallengeQuestion: "",
        showRSAError: false,
        challengeRequest: {},
        rsaCount: 0,
        userKeyedInTacValue: "",
        secure2uValidateData: {},
    };

    componentDidMount() {
        const {
            route: {
                params: { isTopUpConfirmation, isWithdrawalConfirmation, isIncompleteRemoval },
            },
        } = this.props;

        logEvent(FA_VIEW_SCREEN, {
            [FA_SCREEN_NAME]: isTopUpConfirmation
                ? FA_TABUNG_FUNDAMOUNT_REVIEWDETAILS
                : isWithdrawalConfirmation && isIncompleteRemoval
                ? FA_TABUNG_REMOVETABUNG_REVIEWDETAILS
                : isWithdrawalConfirmation
                ? FA_TABUNG_WITHDRAWFUND_REVIEWDETAILS
                : "",
        });

        this._checkS2UStatus();
        this._unsubscribeFocusListener = this.props.navigation.addListener("focus", () => {
            if (this.props.route.params.isS2URegistrationAttempted)
                this._handlePostS2URegistration();
        });
    }

    _handlePostS2URegistration = async () => {
        //passing new paramerter updateModel for s2u interops
        const { flow } = await checks2UFlow(
            this._getTransactionCode(),
            this.props.getModel,
            this.props.updateModel
        );
        const {
            route: {
                params: { isS2URegistrationAttempted },
            },
            navigation: { goBack },
        } = this.props;
        if (flow === S2UFlowEnum.s2uReg && isS2URegistrationAttempted) goBack();
        else this._syncDataToState();
    };

    _checkS2UStatus = async () => {
        const request = await this._requestL3Permission();
        if (!request) {
            this.props.navigation.goBack();
            return;
        }
        //passing new paramerter updateModel for s2u interops
        const { flow, secure2uValidateData } = await checks2UFlow(
            this._getTransactionCode(),
            this.props.getModel,
            this.props.updateModel
        );
        this.setState({ secure2uValidateData });
        if (flow === SECURE2U_COOLING) {
            const {
                navigation: { navigate },
            } = this.props;
            navigateToS2UCooling(navigate);
        } else if (flow === S2UFlowEnum.s2uReg) {
            const {
                navigation: { setParams, navigate },
            } = this.props;
            setParams({ isS2URegistrationAttempted: true });
            navigate(ONE_TAP_AUTH_MODULE, {
                screen: "Activate",
                params: {
                    flowParams: {
                        success: {
                            stack: "TabungMain",
                            screen: "GoalTopUpAndWithdrawalConfirmationScreen",
                        },
                        fail: {
                            stack: "TabungMain",
                            screen: "TabungDetailsScreen",
                        },
                        params: { ...this.props.route.params },
                    },
                },
            });
        } else if (flow === S2UFlowEnum.tac) {
            showInfoToast({ message: SECURE2U_IS_DOWN });
            this._syncDataToState();
        } else this._syncDataToState();
    };

    _syncDataToState = async () => {
        const request = await this._getBankingAccountList();
        const accountListData = request?.data?.result?.accountListings ?? [];
        const mappedAccountListData = accountListData.map((account) => ({
            accountName: account.name,
            accountNumber: account.number,
            accountFormattedAmount: account.balance,
            accountCode: account.code,
        }));
        this.setState({
            accountListData: mappedAccountListData,
            showLoader: false,
            selectedAccountNumber: mappedAccountListData[0].accountNumber.substring(0, 12),
            selectedAccountName: mappedAccountListData[0].accountName,
        });
    };

    _requestL3Permission = async () => {
        try {
            const response = await invokeL3(false);
            if (response && response.status === 200) return response;
            return null;
        } catch (error) {
            ErrorLogger(error);
            return null;
        }
    };

    _getBankingAccountList = async () => {
        try {
            const response = await bankingGetDataMayaM2u("/summary?type=A", false);
            if (response && response.status === 200) return response;
            return null;
        } catch (error) {
            ErrorLogger(error);
            return null;
        }
    };

    _transferFundToTabung = async (payload) => {
        try {
            return await fundTabungAPI("/goal/fund", payload);
        } catch (error) {
            ErrorLogger(error);
            throw error;
        }
    };

    _withdrawFundFromTabung = async (payload) => {
        try {
            return await goalWithdraw("/withdraw", payload);
        } catch (error) {
            ErrorLogger(error);
            throw error;
        }
    };

    _generateTodayFormattedDate = () => moment().format("DD MMM YYYY");

    _onHeaderBackButtonPressed = () => this.props.navigation.goBack();

    _onHeaderCloseButtonPressed = () =>
        this.props.navigation.navigate("TabungMain", {
            screen: "TabungDetailsScreen",
        });

    _renderAccountListItems = ({ item, index }) => {
        const { accountName, accountNumber, accountFormattedAmount } = item;
        return (
            <View style={styles.accountListingCarouselCardGutter}>
                <AccountListingCarouselCard
                    accountName={accountName}
                    accountNumber={formateAccountNumber(accountNumber, 12)}
                    accountFormattedAmount={accountFormattedAmount}
                    isSelected={index === this.state.selectedAccountIndex}
                    index={index}
                    onAccountItemPressed={this._onAccountItemPressed}
                />
            </View>
        );
    };

    _accountListItemKeyExtractor = (item, index) => `${item.accountNumber}-${index}`;

    _onAccountItemPressed = ({ index, accountNumber, accountName }) => {
        this.setState(
            {
                selectedAccountIndex: index,
                selectedAccountNumber: accountNumber,
                selectedAccountName: accountName,
                accountListData: [...this.state.accountListData],
            },
            () =>
                this.accountListingFlatListReference.scrollToIndex({
                    index,
                    animated: true,
                    viewPosition: 0.5,
                })
        );
    };

    _getTransactionCode = () => {
        const {
            route: {
                params: { isTopUpConfirmation, isIncompleteRemoval },
            },
        } = this.props;
        if (isTopUpConfirmation) return 18;
        if (isIncompleteRemoval) return 20;
        return 19;
    };

    _getTabungTitle = (goalTitle) => {
        return goalTitle ? `${TABUNG_LOWER} (${goalTitle})` : "";
    };

    _onActionButtonPressed = async () => {
        this.setState({ showLoader: true });
        const { selectedAccountNumber, accountListData, selectedAccountIndex } = this.state;
        const {
            route: {
                params: {
                    goalId,
                    formattedAmount,
                    isTopUpConfirmation,
                    isWithdrawalConfirmation,
                    isIncompleteRemoval,
                    goalTitle,
                },
            },
            getModel,
        } = this.props;

        if (
            isTopUpConfirmation &&
            numeral(accountListData[selectedAccountIndex].accountFormattedAmount).value() <
                numeral(formattedAmount).value()
        ) {
            this.setState({ showLoader: false });
            showErrorToast({
                message: "Your account balance is insufficient. Please try again.",
            });
            return;
        }
        //passing new paramerter updateModel for s2u interops
        const { flow, secure2uValidateData } = await checks2UFlow(
            this._getTransactionCode(),
            this.props.getModel,
            this.props.updateModel
        );
        const { deviceInformation, deviceId } = getModel("device");
        const mobileSDKData = getDeviceRSAInformation(deviceInformation, DeviceInfo, deviceId);

        if (isWithdrawalConfirmation) {
            const payload = {
                accountNo: selectedAccountNumber.replace(/\s/g, ""),
                amount: numeral(formattedAmount).value(),
                frmAcctCode: accountListData[selectedAccountIndex].accountCode,
                goalId,
                transferToOwner: false,
                remove: !!isIncompleteRemoval,
                mobileSDKData,
            };
            if (flow === SECURE2U_COOLING) {
                const {
                    navigation: { navigate },
                } = this.props;
                navigateToS2UCooling(navigate);
            } else if (flow === S2UFlowEnum.s2u) {
                const twoFAS2uType =
                    secure2uValidateData?.pull === "N" ? "SECURE2U_PUSH" : "SECURE2U_PULL"; //s2u interops changes
                this._handleS2UWithdrawal({ ...payload, twoFAType: twoFAS2uType, smsTac: "" });
            } else this._handleTACWithdrawal({ ...payload, twoFAType: "TAC" });
        } else {
            const payload = {
                fromAccount: selectedAccountNumber.replace(/\s/g, ""),
                fromAccountCode: accountListData[selectedAccountIndex].accountCode,
                goalId,
                transferAmount: numeral(formattedAmount).value(),
                mobileSDKData,
                transferTo: this._getTabungTitle(goalTitle),
                recipientReference: FUND_TABUNG,
            };
            if (flow === S2UFlowEnum.s2u) {
                const twoFAS2uType =
                    secure2uValidateData?.pull === "N" ? "SECURE2U_PUSH" : "SECURE2U_PULL"; //s2u interops changes
                this._handleS2UTopUp({ ...payload, twoFAType: twoFAS2uType, smsTac: "" });
            } else this._handleTACTopUp({ ...payload, twoFAType: "TAC" });
        }
    };

    _onS2UConfirmation = async (s2uResponse) => {
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
        const {
            route: {
                params: {
                    isWithdrawalConfirmation,
                    goalTitle,
                    formattedAmount,
                    participantAccountNumber,
                    creatorName,
                    creatorAccountNumber,
                    isCompletionWithdrawal,
                    isIncompleteRemoval,
                },
            },
        } = this.props;
        const { accountListData, selectedAccountIndex } = this.state;
        if (isWithdrawalConfirmation) {
            if (isCompletionWithdrawal) {
                this.props.navigation.navigate("TabungMain", {
                    screen: "GoalTransferAcknowledgementScreen",
                    params: {
                        isTransferSuccessful: s2uResponse.transactionStatus,
                        errorMessage: s2uResponse.s2uSignRespone?.text ?? "N/A",
                        transferDetailsData: [
                            { title: REFERENCE_ID, value: transactionReferenceNumber },
                            { title: DATE_TIME, value: serverDate },
                        ],
                        transactionDetails: {
                            ...this.transactionDetails,
                            creatorName,
                            creatorAccountNumber,
                            referenceId: transactionReferenceNumber,
                            serverDate,
                            goalTitle,
                            transferAmount: formattedAmount,
                            isTransferringToOwnAccount: true,
                            participantAccountNumber,
                            accountName: accountListData[selectedAccountIndex].accountName,
                        },
                        isS2uFlow: true,
                    },
                });
            } else if (isIncompleteRemoval) {
                this.props.navigation.navigate("TabungMain", {
                    screen: "GoalRemovalAcknowledgementScreen",
                    params: {
                        isWithdrawalSuccessful: s2uResponse.transactionStatus,
                        errorMessage: s2uResponse.s2uSignRespone?.text ?? "N/A",
                        topUpDetailsData: [
                            { title: REFERENCE_ID, value: transactionReferenceNumber },
                            { title: DATE_TIME, value: serverDate },
                        ],
                        goalTitle,
                        formattedAmount,
                        transactionDetails: {
                            ...this.transactionDetails,
                            transactionReferenceNumber,
                            serverDate,
                            participantAccountNumber,
                            accountName: accountListData[selectedAccountIndex].accountName,
                        },
                        isS2uFlow: true,
                    },
                });
            } else {
                this.props.navigation.navigate("TabungMain", {
                    screen: "GoalWithdrawalAcknowledgementScreen",
                    params: {
                        isWithdrawalSuccessful: s2uResponse.transactionStatus,
                        errorMessage: s2uResponse.s2uSignRespone?.text ?? "N/A",
                        topUpDetailsData: [
                            { title: REFERENCE_ID, value: transactionReferenceNumber },
                            { title: DATE_TIME, value: serverDate },
                        ],
                        goalTitle,
                        transactionDetails: {
                            ...this.transactionDetails,
                            transactionReferenceNumber,
                            serverDate,
                            participantAccountNumber,
                            accountName: accountListData[selectedAccountIndex].accountName,
                        },
                    },
                    isS2uFlow: true,
                });
            }
        } else {
            this.props.navigation.navigate("TabungMain", {
                screen: "GoalTopUpAcknowledgementScreen",
                params: {
                    isTopUpSuccessful: s2uResponse.transactionStatus,
                    errorMessage: s2uResponse.s2uSignRespone?.text ?? "N/A",
                    topUpDetailsData: [
                        { title: REFERENCE_ID, value: transactionReferenceNumber },
                        { title: DATE_TIME, value: serverDate },
                    ],
                    transactionDetails: {
                        ...this.transactionDetails,
                        referenceId: transactionReferenceNumber,
                        serverDate,
                        goalTitle,
                        participantAccountNumber,
                    },
                    isS2uFlow: true,
                },
            });
        }
    };

    _handleS2UTopUp = async (payload) => {
        try {
            const request = await this._transferFundToTabung(payload);
            if (request?.status === 200) {
                this.setState({
                    showS2UModal: true,
                    s2uToken: request.data.result.pollingToken,
                    s2uServerDate: request.data.result.serverDate,
                    s2uTransactionType: FUND_TABUNG,
                    s2uTransactionReferenceNumber: request.data.result.transactionRefNumber,
                    showRSAChallengeQuestion: false,
                });
                this.transactionDetails = payload;
            } else {
                this.setState(
                    {
                        showRSAChallengeQuestion: false,
                    },
                    () =>
                        this.props.navigation.navigate("TabungMain", {
                            screen: "GoalTopUpAcknowledgementScreen",
                            params: {
                                errorMessage: request.message,
                                isTopUpSuccessful: false,
                                topUpDetailsData: [
                                    {
                                        title: REFERENCE_ID,
                                        value: request.data.result.transactionRefNumber,
                                    },
                                    {
                                        title: DATE_TIME,
                                        value: request.data.result.serverDate,
                                    },
                                ],
                            },
                        })
                );
            }
        } catch (error) {
            const status = error?.status ?? 0;
            if (status === 428 || status === 423 || status === 422) {
                this._handleRSAFailure(error);
                return;
            }
            this._handleStateOnTopUpApiCallException(error);
        } finally {
            this.setState({
                showLoader: false,
            });
        }
    };

    _handleTACTopUp = async (payload) => {
        const {
            route: {
                params: { participantAccountNumber },
            },
        } = this.props;
        this.setState({
            showTACModal: true,
            showLoader: false,
            tacTransferApi: this._transferFundToTabung,
            tacFailureHandler: this._onTACTopUpFailure,
            tacSuccessfulHandler: this._onTACTopUpSuccessful,
            tacTransferApiParams: {
                ...payload,
            },
            tacParams: {
                accCode: payload.fromAccountCode,
                amount: payload.transferAmount,
                fromAcctNo: participantAccountNumber.substring(0, 12),
                fundTransferType: "GOAL_FUND",
                toAcctNo: payload.fromAccount,
            },
        });
        this.transactionDetails = payload;
    };

    _handleTACTopUpPostRSA = async (payload) => {
        try {
            const { tacTransferApiParams, userKeyedInTacValue } = this.state;
            const request = await this._transferFundToTabung({
                ...tacTransferApiParams,
                ...payload,
                smsTac: userKeyedInTacValue,
            });
            this.setState({
                showRSAChallengeQuestion: false,
            });
            this.props.navigation.navigate("TabungMain", {
                screen: "GoalTopUpAcknowledgementScreen",
                params: {
                    errorMessage: request.message,
                    isTopUpSuccessful: request?.status === 200,
                    topUpDetailsData: [
                        {
                            title: REFERENCE_ID,
                            value: request.data.result.transactionRefNumber,
                        },
                        {
                            title: DATE_TIME,
                            value: request.data.result.serverDate,
                        },
                    ],
                },
            });
        } catch (error) {
            const status = error?.status ?? 0;
            if (status === 428 || status === 423 || status === 422) {
                this._handleRSAFailure(error);
                return;
            }
            this._handleStateOnTopUpApiCallException(error);
        }
    };

    _handleStateOnTopUpApiCallException = (error) =>
        this.setState(
            {
                showRSAChallengeQuestion: false,
            },
            () =>
                this.props.navigation.navigate("TabungMain", {
                    screen: "GoalTopUpAcknowledgementScreen",
                    params: {
                        errorMessage: error.message ?? error.error.message,
                        isTopUpSuccessful: false,
                        topUpDetailsData: [
                            {
                                title: REFERENCE_ID,
                                value: error?.error?.result?.transactionRefNumber ?? "N/A",
                            },
                            {
                                title: DATE_TIME,
                                value: error?.error?.result?.serverDate ?? "N/A",
                            },
                        ],
                    },
                })
        );

    _onTACTopUpSuccessful = (tacResponse) => {
        this.setState({ showTACModal: false });
        const transactionRefNumber = tacResponse?.result?.transactionRefNumber ?? "N/A";
        const serverDate = tacResponse?.result?.serverDate ?? "N/A";
        const {
            route: {
                params: { goalTitle, participantAccountNumber },
            },
        } = this.props;
        this.props.navigation.navigate("TabungMain", {
            screen: "GoalTopUpAcknowledgementScreen",
            params: {
                isTopUpSuccessful: true,
                topUpDetailsData: [
                    {
                        title: REFERENCE_ID,
                        value: transactionRefNumber,
                    },
                    { title: DATE_TIME, value: serverDate },
                ],
                transactionDetails: {
                    ...this.transactionDetails,
                    referenceId: transactionRefNumber,
                    serverDate,
                    goalTitle,
                    participantAccountNumber,
                },
            },
        });
    };

    _onTACTopUpFailure = (tacResponse, userKeyedInTacValue) =>
        this.setState({ showTACModal: false, userKeyedInTacValue }, () => {
            const status = tacResponse?.status ?? 0;
            if (status === 428 || status === 423 || status === 422) {
                this._handleRSAFailure(tacResponse);
                return;
            }
            this.props.navigation.navigate("TabungMain", {
                screen: "GoalTopUpAcknowledgementScreen",
                params: {
                    errorMessage: tacResponse.error.message ?? "N/A",
                    isTopUpSuccessful: false,
                    topUpDetailsData: [
                        {
                            title: REFERENCE_ID,
                            value: tacResponse?.error?.result?.transactionRefNumber ?? "N/A",
                        },
                        {
                            title: DATE_TIME,
                            value: tacResponse?.error?.result?.serverDate ?? "N/A",
                        },
                    ],
                },
            });
        });

    _handleS2UWithdrawal = async (payload) => {
        const {
            route: {
                params: {
                    goalTitle,
                    formattedAmount,
                    participantAccountNumber,
                    creatorName,
                    creatorAccountNumber,
                    isCompletionWithdrawal,
                    isIncompleteRemoval,
                },
            },
        } = this.props;
        const { accountListData, selectedAccountIndex } = this.state;
        try {
            const request = await this._withdrawFundFromTabung(payload);
            const refId = request?.data?.result?.refId ?? "N/A";
            const serverDate = request?.data?.result?.serverDate ?? "N/A";
            if (request.status === 200) {
                this.setState({
                    showS2UModal: true,
                    s2uToken: request.data.result.pollingToken,
                    s2uServerDate: serverDate,
                    s2uTransactionType: "Withdraw Funds",
                    s2uTransactionReferenceNumber: refId,
                    showRSAChallengeQuestion: false,
                });
                this.transactionDetails = payload;
            } else {
                this.setState(
                    {
                        showRSAChallengeQuestion: false,
                    },
                    () => {
                        if (isCompletionWithdrawal)
                            this.props.navigation.navigate("TabungMain", {
                                screen: "GoalTransferAcknowledgementScreen",
                                params: {
                                    isTransferSuccessful: false,
                                    errorMessage: request.message,
                                    transferDetailsData: [
                                        { title: REFERENCE_ID, value: refId },
                                        { title: DATE_TIME, value: serverDate },
                                    ],
                                    transactionDetails: {
                                        creatorName,
                                        creatorAccountNumber,
                                        referenceId: refId,
                                        serverDate,
                                        goalTitle,
                                        transferAmount: formattedAmount,
                                    },
                                },
                            });
                        else if (isIncompleteRemoval)
                            this.props.navigation.navigate("TabungMain", {
                                screen: "GoalRemovalAcknowledgementScreen",
                                params: {
                                    isWithdrawalSuccessful: false,
                                    errorMessage: request.message,
                                    topUpDetailsData: [
                                        { title: REFERENCE_ID, value: refId },
                                        { title: DATE_TIME, value: serverDate },
                                    ],
                                    goalTitle,
                                    formattedAmount,
                                    transactionDetails: {
                                        ...this.transactionDetails,
                                        transactionReferenceNumber: refId,
                                        serverDate,
                                        participantAccountNumber,
                                        accountName:
                                            accountListData[selectedAccountIndex].accountName,
                                    },
                                },
                            });
                        else
                            this.props.navigation.navigate("TabungMain", {
                                screen: "GoalWithdrawalAcknowledgementScreen",
                                params: {
                                    isWithdrawalSuccessful: false,
                                    errorMessage: request.message,
                                    topUpDetailsData: [
                                        { title: REFERENCE_ID, value: refId },
                                        { title: DATE_TIME, value: serverDate },
                                    ],
                                    goalTitle,
                                    transactionDetails: {
                                        ...this.transactionDetails,
                                        transactionReferenceNumber: refId,
                                        serverDate,
                                        participantAccountNumber,
                                        accountName:
                                            accountListData[selectedAccountIndex].accountName,
                                    },
                                },
                            });
                    }
                );
            }
        } catch (error) {
            const status = error?.status ?? 0;
            if (status === 428 || status === 423 || status === 422) {
                this._handleRSAFailure(error);
                return;
            }
            this._handleStateOnWithdrawalApiCallException(error);
        } finally {
            this.setState({
                showLoader: false,
            });
        }
    };

    _handleTACWithdrawal = async (payload) => {
        const {
            route: {
                params: {
                    isCompletionWithdrawal,
                    isIncompleteRemoval,
                    participantAccountCode,
                    participantAccountNumber,
                },
            },
        } = this.props;

        let fundTransferType = "";
        if (isCompletionWithdrawal) fundTransferType = "GOAL_WITHDRAW_COMPLETED";
        else if (isIncompleteRemoval) fundTransferType = "GOAL_REMOVE";
        else fundTransferType = "GOAL_WITHDRAW";

        this.setState({
            showLoader: false,
            showTACModal: true,
            tacTransferApi: this._withdrawFundFromTabung,
            tacFailureHandler: this._onTACWithdrawalFailure,
            tacSuccessfulHandler: this._onTACWithdrawalSuccessful,
            tacTransferApiParams: { ...payload },
            tacParams: {
                accCode: participantAccountCode,
                amount: payload.amount,
                fromAcctNo: participantAccountNumber.substring(0, 12),
                fundTransferType,
                toAcctNo: this.state.selectedAccountNumber.replace(/\s/g, ""),
            },
        });
        this.transactionDetails = payload;
    };

    _handleTACWithdrawalPostRSA = async (payload) => {
        const {
            route: {
                params: {
                    goalTitle,
                    formattedAmount,
                    participantAccountNumber,
                    creatorName,
                    creatorAccountNumber,
                    isCompletionWithdrawal,
                    isIncompleteRemoval,
                },
            },
        } = this.props;
        const { accountListData, selectedAccountIndex, tacTransferApiParams, userKeyedInTacValue } =
            this.state;
        try {
            const request = await this._withdrawFundFromTabung({
                ...tacTransferApiParams,
                ...payload,
                smsTac: userKeyedInTacValue,
            });
            const refId = request?.data?.result?.refId ?? "N/A";
            const serverDate = request?.data?.result?.serverDate ?? "N/A";
            this.setState({
                showRSAChallengeQuestion: false,
            });
            if (isCompletionWithdrawal)
                this.props.navigation.navigate("TabungMain", {
                    screen: "GoalTransferAcknowledgementScreen",
                    params: {
                        isTransferSuccessful: request?.status === 200,
                        errorMessage: request.message,
                        transferDetailsData: [
                            { title: REFERENCE_ID, value: refId },
                            { title: DATE_TIME, value: serverDate },
                        ],
                        transactionDetails: {
                            creatorName,
                            creatorAccountNumber,
                            referenceId: refId,
                            serverDate,
                            goalTitle,
                            transferAmount: formattedAmount,
                        },
                    },
                });
            else if (isIncompleteRemoval)
                this.props.navigation.navigate("TabungMain", {
                    screen: "GoalRemovalAcknowledgementScreen",
                    params: {
                        isWithdrawalSuccessful: request?.status === 200,
                        errorMessage: request.message,
                        topUpDetailsData: [
                            { title: REFERENCE_ID, value: refId },
                            { title: DATE_TIME, value: serverDate },
                        ],
                        goalTitle,
                        formattedAmount,
                        transactionDetails: {
                            ...this.transactionDetails,
                            transactionReferenceNumber: refId,
                            serverDate,
                            participantAccountNumber,
                            accountName: accountListData[selectedAccountIndex].accountName,
                        },
                    },
                });
            else
                this.props.navigation.navigate("TabungMain", {
                    screen: "GoalWithdrawalAcknowledgementScreen",
                    params: {
                        isWithdrawalSuccessful: request?.status === 200,
                        errorMessage: request.message,
                        topUpDetailsData: [
                            { title: REFERENCE_ID, value: refId },
                            { title: DATE_TIME, value: serverDate },
                        ],
                        goalTitle,
                        transactionDetails: {
                            ...this.transactionDetails,
                            transactionReferenceNumber: refId,
                            serverDate,
                            participantAccountNumber,
                            accountName: accountListData[selectedAccountIndex].accountName,
                        },
                    },
                });
        } catch (error) {
            const status = error?.status ?? 0;
            if (status === 428 || status === 423 || status === 422) {
                this._handleRSAFailure(error);
                return;
            }
            this._handleStateOnWithdrawalApiCallException(error);
        }
    };

    _handleStateOnWithdrawalApiCallException = (error) => {
        const {
            route: {
                params: {
                    goalTitle,
                    formattedAmount,
                    participantAccountNumber,
                    creatorName,
                    creatorAccountNumber,
                    isCompletionWithdrawal,
                    isIncompleteRemoval,
                },
            },
        } = this.props;
        const { accountListData, selectedAccountIndex } = this.state;
        this.setState({ showRSAChallengeQuestion: false }, () => {
            const refId = error?.error?.result?.refId || error?.error?.refId || "N/A";
            const serverDate =
                error?.error?.result?.serverDate || error?.error?.serverDate || "N/A";
            if (isCompletionWithdrawal)
                this.props.navigation.navigate("TabungMain", {
                    screen: "GoalTransferAcknowledgementScreen",
                    params: {
                        isTransferSuccessful: false,
                        errorMessage: error.message ?? error.error.message,
                        transferDetailsData: [
                            { title: REFERENCE_ID, value: refId },
                            { title: DATE_TIME, value: serverDate },
                        ],
                        transactionDetails: {
                            creatorName,
                            creatorAccountNumber,
                            referenceId: refId,
                            serverDate,
                            goalTitle,
                            transferAmount: formattedAmount,
                        },
                    },
                });
            else if (isIncompleteRemoval)
                this.props.navigation.navigate("TabungMain", {
                    screen: "GoalRemovalAcknowledgementScreen",
                    params: {
                        isWithdrawalSuccessful: false,
                        errorMessage: error.message ?? error.error.message,
                        topUpDetailsData: [
                            { title: REFERENCE_ID, value: refId },
                            { title: DATE_TIME, value: serverDate },
                        ],
                        goalTitle,
                        formattedAmount,
                        transactionDetails: {
                            ...this.transactionDetails,
                            transactionReferenceNumber: refId,
                            serverDate,
                            participantAccountNumber,
                            accountName: accountListData[selectedAccountIndex].accountName,
                        },
                    },
                });
            else
                this.props.navigation.navigate("TabungMain", {
                    screen: "GoalWithdrawalAcknowledgementScreen",
                    params: {
                        isWithdrawalSuccessful: false,
                        errorMessage: error.message ?? error.error.message,
                        topUpDetailsData: [
                            { title: REFERENCE_ID, value: refId },
                            { title: DATE_TIME, value: serverDate },
                        ],
                        goalTitle,
                        transactionDetails: {
                            ...this.transactionDetails,
                            transactionReferenceNumber: refId,
                            serverDate,
                            participantAccountNumber,
                            accountName: accountListData[selectedAccountIndex].accountName,
                        },
                    },
                });
        });
    };

    _onTACWithdrawalSuccessful = (tacResponse) => {
        this.setState({ showTACModal: false });
        const {
            route: {
                params: {
                    goalTitle,
                    participantAccountNumber,
                    formattedAmount,
                    creatorName,
                    creatorAccountNumber,
                    isCompletionWithdrawal,
                    isIncompleteRemoval,
                },
            },
        } = this.props;
        const {
            result: { refId, serverDate },
        } = tacResponse;
        const { accountListData, selectedAccountIndex } = this.state;
        if (isCompletionWithdrawal)
            this.props.navigation.navigate("TabungMain", {
                screen: "GoalTransferAcknowledgementScreen",
                params: {
                    isTransferSuccessful: true,
                    transferDetailsData: [
                        { title: REFERENCE_ID, value: refId },
                        { title: DATE_TIME, value: serverDate },
                    ],
                    transactionDetails: {
                        ...this.transactionDetails,
                        creatorName,
                        creatorAccountNumber,
                        referenceId: refId,
                        serverDate,
                        goalTitle,
                        transferAmount: formattedAmount,
                        isTransferringToOwnAccount: true,
                        participantAccountNumber,
                        accountName: accountListData[selectedAccountIndex].accountName,
                    },
                },
            });
        else if (isIncompleteRemoval)
            this.props.navigation.navigate("TabungMain", {
                screen: "GoalRemovalAcknowledgementScreen",
                params: {
                    isWithdrawalSuccessful: true,
                    topUpDetailsData: [
                        { title: REFERENCE_ID, value: refId },
                        { title: DATE_TIME, value: serverDate },
                    ],
                    goalTitle,
                    formattedAmount,
                    transactionDetails: {
                        ...this.transactionDetails,
                        transactionReferenceNumber: refId,
                        serverDate,
                        participantAccountNumber,
                        accountName: accountListData[selectedAccountIndex].accountName,
                    },
                },
            });
        else
            this.props.navigation.navigate("TabungMain", {
                screen: "GoalWithdrawalAcknowledgementScreen",
                params: {
                    isWithdrawalSuccessful: true,
                    topUpDetailsData: [
                        {
                            title: REFERENCE_ID,
                            value: refId,
                        },
                        { title: DATE_TIME, value: serverDate },
                    ],
                    goalTitle,
                    transactionDetails: {
                        ...this.transactionDetails,
                        refId,
                        serverDate,
                        participantAccountNumber,
                        accountName: accountListData[selectedAccountIndex].accountName,
                    },
                },
            });
    };

    _onTACWithdrawalFailure = (tacResponse, userKeyedInTacValue) =>
        this.setState({ showTACModal: false, userKeyedInTacValue }, () => {
            const status = tacResponse?.status ?? 0;
            if (status === 428 || status === 423 || status === 422) {
                this._handleRSAFailure(tacResponse);
                return;
            }
            const {
                route: {
                    params: {
                        isCompletionWithdrawal,
                        isIncompleteRemoval,
                        goalTitle,
                        formattedAmount,
                        participantAccountNumber,
                    },
                },
            } = this.props;
            const { accountListData, selectedAccountIndex } = this.state;
            const errorMessage = tacResponse.error.message ?? "N/A";
            const refId = tacResponse?.error?.refId ?? "N/A";
            const serverDate = tacResponse?.error?.serverDate ?? "N/A";
            if (isCompletionWithdrawal)
                this.props.navigation.navigate("TabungMain", {
                    screen: "GoalTransferAcknowledgementScreen",
                    params: {
                        isTransferSuccessful: false,
                        errorMessage,
                        transferDetailsData: [
                            {
                                title: REFERENCE_ID,
                                value: refId,
                            },
                            {
                                title: DATE_TIME,
                                value: serverDate,
                            },
                        ],
                    },
                });
            else if (isIncompleteRemoval)
                this.props.navigation.navigate("TabungMain", {
                    screen: "GoalRemovalAcknowledgementScreen",
                    params: {
                        isWithdrawalSuccessful: false,
                        errorMessage,
                        topUpDetailsData: [
                            { title: REFERENCE_ID, value: refId },
                            { title: DATE_TIME, value: serverDate },
                        ],
                        goalTitle,
                        formattedAmount,
                        transactionDetails: {
                            ...this.transactionDetails,
                            transactionReferenceNumber: refId,
                            serverDate,
                            participantAccountNumber,
                            accountName: accountListData[selectedAccountIndex].accountName,
                        },
                    },
                });
            else
                this.props.navigation.navigate("TabungMain", {
                    screen: "GoalWithdrawalAcknowledgementScreen",
                    params: {
                        errorMessage,
                        isWithdrawalSuccessful: false,
                        topUpDetailsData: [
                            {
                                title: REFERENCE_ID,
                                value: refId,
                            },
                            {
                                title: DATE_TIME,
                                value: serverDate,
                            },
                        ],
                    },
                });
        });

    _onTacModalCloseButtonPressed = () => this.setState({ showTACModal: false });

    _setAccountListingFlatListReference = (ref) => (this.accountListingFlatListReference = ref);

    _generateS2UTransactionDetails = () => {
        const { s2uServerDate, s2uTransactionType, selectedAccountName, selectedAccountNumber } =
            this.state;
        const {
            route: {
                params: { goalTitle, isTopUpConfirmation },
            },
        } = this.props;
        const tabungName = `Tabung\n${goalTitle}`;
        const formattedSelectedAccountName = `${selectedAccountName}\n${formateAccountNumber(
            selectedAccountNumber.replace(/\s/g, ""),
            12
        )}`;

        return [
            {
                label: "To",
                value: isTopUpConfirmation ? tabungName : formattedSelectedAccountName,
            },
            {
                label: "From",
                value: isTopUpConfirmation ? formattedSelectedAccountName : tabungName,
            },
            { label: "Transaction Type", value: s2uTransactionType },
            {
                label: "Date",
                value: s2uServerDate,
            },
        ];
    };

    _handleRSAChallengeQuestionAnswered = (answer) => {
        this.setState({ showRSAError: false, showRSALoader: true }, async () => {
            const {
                selectedAccountNumber,
                accountListData,
                selectedAccountIndex,
                challengeRequest: { challenge },
            } = this.state;
            const {
                route: {
                    params: {
                        goalId,
                        formattedAmount,
                        isWithdrawalConfirmation,
                        isIncompleteRemoval,
                        goalTitle,
                    },
                },
                getModel,
            } = this.props;
            //passing new paramerter updateModel for s2u interops
            const { flow, secure2uValidateData } = await checks2UFlow(
                this._getTransactionCode(),
                this.props.getModel,
                this.props.updateModel
            );
            const { deviceInformation, deviceId } = getModel("device");
            const mobileSDKData = getDeviceRSAInformation(deviceInformation, DeviceInfo, deviceId);

            if (isWithdrawalConfirmation) {
                const payload = {
                    accountNo: selectedAccountNumber.replace(/\s/g, ""),
                    amount: numeral(formattedAmount).value(),
                    frmAcctCode: accountListData[selectedAccountIndex].accountCode,
                    goalId,
                    transferToOwner: false,
                    remove: !!isIncompleteRemoval,
                    mobileSDKData,
                    challenge: { ...challenge, answer },
                };
                if (flow === SECURE2U_COOLING) {
                    const {
                        navigation: { navigate },
                    } = this.props;
                    navigateToS2UCooling(navigate);
                } else if (flow === S2UFlowEnum.s2u) {
                    const twoFAS2uType =
                        secure2uValidateData?.pull === "N" ? "SECURE2U_PUSH" : "SECURE2U_PULL"; //s2u interops changes
                    this._handleS2UWithdrawal({
                        ...payload,
                        twoFAType: twoFAS2uType,
                        smsTac: "",
                    });
                } else this._handleTACWithdrawalPostRSA({ ...payload, twoFAType: "TAC" });
            } else {
                const payload = {
                    fromAccount: selectedAccountNumber.replace(/\s/g, ""),
                    fromAccountCode: accountListData[selectedAccountIndex].accountCode,
                    goalId,
                    transferAmount: numeral(formattedAmount).value(),
                    mobileSDKData,
                    challenge: { ...challenge, answer },
                    transferTo: this._getTabungTitle(goalTitle),
                    recipientReference: FUND_TABUNG,
                };
                if (flow === S2UFlowEnum.s2u) {
                    const twoFAS2uType =
                        secure2uValidateData?.pull === "N" ? "SECURE2U_PUSH" : "SECURE2U_PULL"; //s2u interops changes
                    this._handleS2UTopUp({ ...payload, twoFAType: twoFAS2uType, smsTac: "" });
                } else this._handleTACTopUpPostRSA({ ...payload, twoFAType: "TAC" });
            }
        });
    };

    _handleRSAChallengeQuestionClosed = () => this.setState({ showRSAError: false });

    _handleRSAFailure = (error) => {
        if (error.status === 428)
            this.setState((prevState) => ({
                challengeRequest: {
                    ...prevState.challengeRequest,
                    challenge: error.error.result.rsaResponse.challenge,
                },
                showRSAChallengeQuestion: true,
                showRSALoader: false,
                rsaChallengeQuestion: error.error.result.rsaResponse.challenge.questionText,
                rsaCount: prevState.rsaCount + 1,
                showRSAError: prevState.rsaCount > 0,
            }));
        else if (error.status === 423) {
            this.setState({
                showRSAChallengeQuestion: false,
            });
            const serverDate = error?.error?.result?.rsaResponse?.serverDate ?? "N/A";
            this.props.navigation.navigate(ONE_TAP_AUTH_MODULE, {
                screen: "Locked",
                params: {
                    reason: error?.error?.result?.rsaResponse?.statusDescription ?? "N/A",
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
                    statusDescription:
                        error?.error?.result?.rsaResponse?.statusDescription ?? "N/A",
                    additionalStatusDescription:
                        error?.error?.result?.rsaResponse?.additionalStatusDescription ?? "",
                    serverDate: error?.error?.result?.rsaResponse?.serverDate ?? "N/A",
                    nextParams: { screen: DASHBOARD, params: { refresh: false } },
                    nextModule: TAB_NAVIGATOR,
                    nextScreen: "Tab",
                },
            });
        }
    };

    render() {
        const {
            showLoader,
            accountListData,
            s2uToken,
            showS2UModal,
            showTACModal,
            tacParams,
            tacTransferApiParams,
            tacTransferApi,
            tacFailureHandler,
            tacSuccessfulHandler,
            showRSAChallengeQuestion,
            showRSAError,
            showRSALoader,
            rsaChallengeQuestion,
            secure2uValidateData,
        } = this.state;
        const {
            route: {
                params: {
                    goalTitle,
                    formattedAmount,
                    isAmountEditable,
                    ctaButtonTitle,
                    isTopUpConfirmation,
                    goalId,
                    goalParticipantId,
                    isIncompleteRemoval,
                },
            },
        } = this.props;
        const s2uTransactionDetails = this._generateS2UTransactionDetails();

        if (!accountListData.length)
            return (
                <ScreenContainer backgroundType="color" showLoaderModal>
                    <View style={styles.nothingness} />
                </ScreenContainer>
            );

        return (
            <ScreenContainer backgroundType="color" showLoaderModal={showLoader}>
                <React.Fragment>
                    <ScreenLayout
                        header={
                            <HeaderLayout
                                headerLeftElement={
                                    <View style={styles.headerBackButtonContainer}>
                                        <HeaderBackButton
                                            onPress={this._onHeaderBackButtonPressed}
                                        />
                                    </View>
                                }
                                headerCenterElement={
                                    <Typo
                                        text="Confirmation"
                                        fontSize={16}
                                        fontWeight="600"
                                        lineHeight={18}
                                    />
                                }
                                headerRightElement={
                                    <View style={styles.headerBackButtonContainer}>
                                        <HeaderCloseButton
                                            onPress={this._onHeaderCloseButtonPressed}
                                        />
                                    </View>
                                }
                                horizontalPaddingMode="custom"
                                horizontalPaddingCustomLeftValue={16}
                                horizontalPaddingCustomRightValue={16}
                            />
                        }
                        useSafeArea
                        paddingHorizontal={0}
                        paddingBottom={0}
                    >
                        <React.Fragment>
                            <ScrollView
                                style={styles.container}
                                contentContainerStyle={styles.contentContainer}
                            >
                                <View style={styles.titleContainer}>
                                    <BorderedAvatar width={64} height={64} borderRadius={32}>
                                        <Image
                                            style={styles.avatarImage}
                                            source={Assets.icGreenTabung}
                                        />
                                    </BorderedAvatar>
                                    <Typo
                                        text={goalTitle}
                                        fontSize={14}
                                        fontWeight="600"
                                        lineHeight={18}
                                    />
                                </View>
                                <View style={styles.amountContainer}>
                                    <TouchableOpacity
                                        disabled={!isAmountEditable}
                                        onPress={this._onHeaderBackButtonPressed}
                                    >
                                        <Typo
                                            text={`RM ${formattedAmount}`}
                                            fontSize={24}
                                            fontWeight="bold"
                                            lineHeight={31}
                                            color={
                                                this.props.route.params.isAmountEditable
                                                    ? BLUE
                                                    : BLACK
                                            }
                                        />
                                    </TouchableOpacity>
                                    <View style={styles.dateContainer}>
                                        <Typo text="Date" fontSize={14} lineHeight={19} />
                                        <Typo
                                            text={this._generateTodayFormattedDate()}
                                            fontSize={14}
                                            lineHeight={18}
                                            fontWeight="600"
                                            textAlign="right"
                                        />
                                    </View>
                                </View>
                                <View style={styles.accountsSelectionContainer}>
                                    <Typo
                                        text={`Transfer ${isTopUpConfirmation ? "from" : "to"}`}
                                        fontSize={14}
                                        fontWeight="600"
                                        lineHeight={18}
                                    />
                                </View>
                                <FlatList
                                    data={accountListData}
                                    keyExtractor={this._accountListItemKeyExtractor}
                                    renderItem={this._renderAccountListItems}
                                    horizontal
                                    showsHorizontalScrollIndicator={false}
                                    contentContainerStyle={styles.flatListContentContainer}
                                    ListFooterComponent={<SpaceFiller width={32} />}
                                    ref={this._setAccountListingFlatListReference}
                                />
                            </ScrollView>
                            <FixedActionContainer>
                                <ActionButton
                                    fullWidth
                                    onPress={this._onActionButtonPressed}
                                    componentCenter={
                                        <Typo
                                            text={ctaButtonTitle}
                                            fontSize={14}
                                            fontWeight="600"
                                            lineHeight={18}
                                        />
                                    }
                                />
                            </FixedActionContainer>
                        </React.Fragment>
                    </ScreenLayout>
                    {showS2UModal && (
                        <Secure2uAuthenticationModal
                            token={s2uToken}
                            amount={numeral(formattedAmount).value()}
                            onS2UDone={this._onS2UConfirmation}
                            s2uPollingData={secure2uValidateData}
                            transactionDetails={s2uTransactionDetails}
                            extraParams={{
                                metadata: {
                                    txnType: isIncompleteRemoval ? "GOALREMOVAL" : "GOAL",
                                    goalId,
                                    goalParticipantId,
                                },
                            }}
                        />
                    )}
                    {showTACModal && (
                        <TacModal
                            tacParams={tacParams}
                            transferAPIParams={tacTransferApiParams}
                            transferApi={tacTransferApi}
                            onTacSuccess={tacSuccessfulHandler}
                            onTacClose={this._onTacModalCloseButtonPressed}
                            onTacError={tacFailureHandler}
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
                </React.Fragment>
            </ScreenContainer>
        );
    }
}

const FLEX_START = "flex-start";
const SPACE_BETWEEN = "space-between";

const styles = StyleSheet.create({
    accountListingCarouselCardGutter: {
        marginBottom: 8,
        marginHorizontal: 6,
    },
    accountsSelectionContainer: {
        alignItems: FLEX_START,
        justifyContent: "space-around",
        marginBottom: 12,
        marginLeft: 24,
    },
    amountContainer: {
        alignItems: "center",
        borderBottomColor: SWITCH_GREY,
        borderBottomWidth: 1,
        height: 110,
        justifyContent: SPACE_BETWEEN,
        marginBottom: 24,
        marginHorizontal: 24,
        marginTop: 40,
        paddingBottom: 24,
        width: Dimensions.get("window").width - 48,
    },
    avatarImage: {
        borderRadius: 32,
        height: 64,
        width: 64,
    },
    container: {
        flexGrow: 1,
    },
    contentContainer: {
        alignItems: FLEX_START,
        justifyContent: FLEX_START,
    },
    dateContainer: {
        alignItems: "center",
        flexDirection: "row",
        justifyContent: SPACE_BETWEEN,
        width: "100%",
    },
    flatListContentContainer: { marginLeft: 18 },
    headerBackButtonContainer: {
        alignItems: "center",
        height: 45,
        justifyContent: "center",
        width: 45,
    },
    nothingness: {
        flex: 1,
    },
    titleContainer: {
        alignItems: "center",
        height: 94,
        justifyContent: SPACE_BETWEEN,
        paddingHorizontal: 24,
        width: "100%",
    },
});

export default withModelContext(GoalTopUpAndWithdrawalConfirmation);
