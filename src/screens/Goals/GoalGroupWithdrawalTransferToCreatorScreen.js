import moment from "moment";
import numeral from "numeral";
import PropTypes from "prop-types";
import React from "react";
import { StyleSheet, View, ScrollView, TouchableOpacity, Image } from "react-native";
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
import ScreenContainer from "@components/Containers/ScreenContainer";
import FixedActionContainer from "@components/Footers/FixedActionContainer";
import Secure2uAuthenticationModal from "@components/Modals/Secure2uAuthenticationModal";
import TacModal from "@components/Modals/TacModal";
import SpaceFiller from "@components/Placeholders/SpaceFiller";
import ChallengeQuestion from "@components/RSA/ChallengeQuestion";
import Typo from "@components/Text";
import { showInfoToast } from "@components/Toast";

import { withModelContext } from "@context";

import { goalWithdraw, invokeL3 } from "@services";

import { LIGHT_GREY } from "@constants/colors";
import { SECURE2U_IS_DOWN } from "@constants/strings";

import {
    formateAccountNumber,
    checks2UFlow,
    getDeviceRSAInformation,
} from "@utils/dataModel/utility";
import { ErrorLogger } from "@utils/logs";

const S2UFlowEnum = Object.freeze({
    s2u: "S2U",
    s2uReg: "S2UReg",
    tac: "TAC",
});

const REFERENCE_ID_LABEL = "Reference ID";
const DATE_TIME_LABEL = "Date & time";

class GoalGroupWithdrawalTransferToCreator extends React.Component {
    static propTypes = {
        navigation: PropTypes.object.isRequired,
        route: PropTypes.object.isRequired,
        getModel: PropTypes.func.isRequired,
    };

    state = {
        showLoader: true,
        showS2UModal: false,
        s2uToken: "",
        s2uServerDate: "",
        s2uTransactionType: "",
        s2uTransactionReferenceNumber: "",
        showTACModal: false,
        tacParams: {},
        tacTransferApiParams: {},
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
        this._checkS2UStatus();
        this._unsubscribeFocusListener = this.props.navigation.addListener("focus", () => {
            if (this.props.route.params.isS2URegistrationAttempted)
                this._handlePostS2URegistration();
        });
    }

    _handlePostS2URegistration = async () => {
        const {
            route: {
                params: { isS2URegistrationAttempted },
            },
            navigation: { goBack },
            getModel,
            updateModel,
        } = this.props;
        //passing new paramerter updateModel for s2u interops
        const { flow } = await checks2UFlow(20, getModel, updateModel);
        if (flow === S2UFlowEnum.s2uReg && isS2URegistrationAttempted) goBack();
        else this.setState({ showLoader: false });
    };

    _checkS2UStatus = async () => {
        console.log("_checkS2UStatus -> tabung creation");
        const request = await this._requestL3Permission();
        if (!request) this.props.navigation.goBack();
        //passing new paramerter updateModel for s2u interops
        const { flow, secure2uValidateData } = await checks2UFlow(
            20,
            this.props.getModel,
            this.props.updateModel
        );
        this.setState({ secure2uValidateData: secure2uValidateData });

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
                            screen: "GoalGroupWithdrawalTransferToCreator",
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
            this.setState({ showLoader: false }, () =>
                showInfoToast({
                    message: SECURE2U_IS_DOWN,
                })
            );
        } else this.setState({ showLoader: false });
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

    _onHeaderBackButtonPressed = () => this.props.navigation.goBack();

    _generateCredential = (str) => {
        const nameArray = str.split(" ");

        if (nameArray.length > 1) {
            return `${nameArray[0].substring(0, 1).toUpperCase()}${nameArray[1]
                .substring(0, 1)
                .toUpperCase()}`;
        } else {
            return nameArray[0].substring(0, 2).toUpperCase();
        }
    };

    _onTransferNowButtonPressed = async () => {
        this.setState({ showLoader: true });
        const {
            route: {
                params: { goalId, formattedAmount, creatorAccountCode, creatorAccountNumber },
            },
            getModel,
            updateModel,
        } = this.props;
        //passing new paramerter updateModel for s2u interops
        const { flow, secure2uValidateData } = await checks2UFlow(20, getModel, updateModel);
        const { deviceInformation, deviceId } = getModel("device");
        const mobileSDKData = getDeviceRSAInformation(deviceInformation, DeviceInfo, deviceId);

        const payload = {
            accountNo: creatorAccountNumber.substring(0, 12),
            amount: numeral(formattedAmount).value(),
            frmAcctCode: creatorAccountCode,
            goalId,
            transferToOwner: true,
            remove: false,
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
            this._handleS2UTransferToCreator({
                ...payload,
                twoFAType: twoFAS2uType,
                smsTac: "",
            });
        } else this._handleTACTransferToCreator({ ...payload, twoFAType: "TAC" });
    };

    _withdrawFundFromTabung = async (payload) => {
        try {
            return await goalWithdraw("/withdraw", payload);
        } catch (error) {
            ErrorLogger(error);
            throw error;
        }
    };

    _handleS2UTransferToCreator = async (payload) => {
        try {
            const request = await this._withdrawFundFromTabung(payload);
            if (request.status === 200)
                this.setState({
                    showS2UModal: true,
                    s2uToken: request.data.result.pollingToken,
                    s2uServerDate: request.data.result.serverDate,
                    s2uTransactionType: "Withdraw Funds",
                    s2uTransactionReferenceNumber: request.data.result.refId,
                    showRSAChallengeQuestion: false,
                });
            else
                this.setState({ showRSAChallengeQuestion: false }, () =>
                    this.props.navigation.navigate("TabungMain", {
                        screen: "GoalTransferAcknowledgementScreen",
                        params: {
                            isTransferSuccessful: false,
                            errorMessage: request.message,
                            transferDetailsData: [
                                {
                                    title: REFERENCE_ID_LABEL,
                                    value: request.data.result.refId,
                                },
                                { title: DATE_TIME_LABEL, value: request.data.result.serverDate },
                            ],
                        },
                    })
                );
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

    _handleStateOnWithdrawalApiCallException = (error) =>
        this.setState({ showRSAChallengeQuestion: false }, () =>
            this.props.navigation.navigate("TabungMain", {
                screen: "GoalTransferAcknowledgementScreen",
                params: {
                    errorMessage: error?.message ?? "N/A",
                    isTransferSuccessful: false,
                    transferDetailsData: [
                        {
                            title: REFERENCE_ID_LABEL,
                            value: error?.error?.result?.refId || error?.error?.refId || "N/A",
                        },
                        {
                            title: DATE_TIME_LABEL,
                            value:
                                error?.error?.result?.serverDate ||
                                error?.error?.serverDate ||
                                "N/A",
                        },
                    ],
                },
            })
        );

    _onS2UModalApproveButtonPressed = (s2uResponse) => {
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
                params: { creatorAccountNumber, creatorName, goalTitle, formattedAmount },
            },
        } = this.props;
        this.props.navigation.navigate("TabungMain", {
            screen: "GoalTransferAcknowledgementScreen",
            params: {
                isTransferSuccessful: s2uResponse.transactionStatus,
                errorMessage: s2uResponse.s2uSignRespone?.text ?? "N/A",
                transferDetailsData: [
                    { title: REFERENCE_ID_LABEL, value: transactionReferenceNumber },
                    { title: DATE_TIME_LABEL, value: serverDate },
                ],
                transactionDetails: {
                    creatorName,
                    creatorAccountNumber,
                    referenceId: transactionReferenceNumber,
                    serverDate,
                    goalTitle,
                    transferAmount: formattedAmount,
                },
            },
        });
    };

    _handleTACTransferToCreator = (payload) => {
        const {
            route: {
                params: { creatorAccountNumber, participantAccountCode, participantAccountNumber },
            },
        } = this.props;

        this.setState({
            showLoader: false,
            showTACModal: true,
            tacTransferApiParams: { ...payload },
            tacParams: {
                accCode: participantAccountCode,
                amount: payload.amount,
                fromAcctNo: participantAccountNumber.substring(0, 12),
                fundTransferType: "GOAL_REMOVE",
                toAcctNo: creatorAccountNumber.substring(0, 12),
            },
        });
    };

    _onTACWithdrawalSuccessful = (tacResponse) => {
        this.setState({
            showTACModal: false,
        });
        const transactionRefNumber = tacResponse?.result?.refId ?? "N/A";
        const serverDate = tacResponse?.result?.serverDate ?? "N/A";
        const {
            route: {
                params: { creatorAccountNumber, creatorName, goalTitle, formattedAmount },
            },
        } = this.props;
        this.props.navigation.navigate("TabungMain", {
            screen: "GoalTransferAcknowledgementScreen",
            params: {
                isTransferSuccessful: true,
                transferDetailsData: [
                    {
                        title: REFERENCE_ID_LABEL,
                        value: transactionRefNumber,
                    },
                    { title: DATE_TIME_LABEL, value: serverDate },
                ],
                transactionDetails: {
                    creatorName,
                    creatorAccountNumber,
                    referenceId: transactionRefNumber,
                    serverDate,
                    goalTitle,
                    transferAmount: formattedAmount,
                },
            },
        });
    };

    _onTACWithdrawalFailure = (tacResponse, userKeyedInTacValue) =>
        this.setState(
            {
                showTACModal: false,
                userKeyedInTacValue,
            },
            () => {
                const status = tacResponse?.status ?? 0;
                if (status === 428 || status === 423 || status === 422) {
                    this._handleRSAFailure(tacResponse);
                    return;
                }
                this.props.navigation.navigate("TabungMain", {
                    screen: "GoalTransferAcknowledgementScreen",
                    params: {
                        isTransferSuccessful: false,
                        errorMessage: tacResponse?.error?.message ?? "N/A",
                        transferDetailsData: [
                            {
                                title: REFERENCE_ID_LABEL,
                                value: tacResponse?.error?.refId ?? "N/A",
                            },
                            {
                                title: DATE_TIME_LABEL,
                                value: tacResponse?.error?.serverDate ?? "N/A",
                            },
                        ],
                    },
                });
            }
        );

    _onTacModalCloseButtonPressed = () => this.setState({ showTACModal: false });

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

    _handleRSAChallengeQuestionAnswered = (answer) => {
        this.setState({ showRSAError: false, showRSALoader: true }, async () => {
            const {
                route: {
                    params: { goalId, formattedAmount, creatorAccountCode, creatorAccountNumber },
                },
                getModel,
                updateModel,
            } = this.props;
            //passing new paramerter updateModel for s2u interops
            const { flow, secure2uValidateData } = await checks2UFlow(20, getModel, updateModel);
            const { deviceInformation, deviceId } = getModel("device");
            const mobileSDKData = getDeviceRSAInformation(deviceInformation, DeviceInfo, deviceId);

            const payload = {
                accountNo: creatorAccountNumber.substring(0, 12),
                amount: numeral(formattedAmount).value(),
                frmAcctCode: creatorAccountCode,
                goalId,
                transferToOwner: true,
                remove: false,
                mobileSDKData,
                challenge: { ...this.state.challengeRequest.challenge, answer },
            };
            if (flow === SECURE2U_COOLING) {
                const {
                    navigation: { navigate },
                } = this.props;
                navigateToS2UCooling(navigate);
            } else if (flow === S2UFlowEnum.s2u) {
                const twoFAS2uType =
                    secure2uValidateData?.pull === "N" ? "SECURE2U_PUSH" : "SECURE2U_PULL"; //s2u interops changes
                this._handleS2UTransferToCreator({
                    ...payload,
                    twoFAType: twoFAS2uType,
                    smsTac: "",
                });
            } else this._handleTACTransferToCreatorPostRSA({ ...payload, twoFAType: "TAC" });
        });
    };

    _handleRSAChallengeQuestionClosed = () => this.setState({ showRSAError: false });

    _handleTACTransferToCreatorPostRSA = async (payload) => {
        const { tacTransferApiParams, userKeyedInTacValue } = this.state;
        try {
            const request = await this._withdrawFundFromTabung({
                ...tacTransferApiParams,
                ...payload,
                smsTac: userKeyedInTacValue,
            });
            this.setState({
                showRSAChallengeQuestion: false,
            });
            this.props.navigation.navigate("TabungMain", {
                screen: "GoalTransferAcknowledgementScreen",
                params: {
                    isTransferSuccessful: request.status === 200,
                    errorMessage: request.message,
                    transferDetailsData: [
                        {
                            title: REFERENCE_ID_LABEL,
                            value: request.data.result.refId,
                        },
                        { title: DATE_TIME_LABEL, value: request.data.result.serverDate },
                    ],
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

    render() {
        const {
            route: {
                params: {
                    goalId,
                    goalTitle,
                    formattedAmount,
                    creatorImage,
                    creatorName,
                    creatorAccountNumber,
                    creatorAccountName,
                    goalParticipantId,
                },
            },
        } = this.props;

        const {
            showS2UModal,
            showTACModal,
            showLoader,
            tacParams,
            tacTransferApiParams,
            s2uToken,
            s2uServerDate,
            showRSAChallengeQuestion,
            showRSAError,
            showRSALoader,
            rsaChallengeQuestion,
            secure2uValidateData,
        } = this.state;

        const credential = this._generateCredential(creatorName);

        return (
            <ScreenContainer backgroundType="color" showLoaderModal={showLoader}>
                <React.Fragment>
                    <ScreenLayout
                        header={
                            <HeaderLayout
                                headerLeftElement={
                                    <HeaderBackButton onPress={this._onHeaderBackButtonPressed} />
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
                                    <HeaderCloseButton onPress={this._onHeaderBackButtonPressed} />
                                }
                            />
                        }
                        useSafeArea
                        paddingBottom={0}
                        paddingHorizontal={0}
                    >
                        <React.Fragment>
                            <ScrollView>
                                <View style={styles.creatorContainer}>
                                    <BorderedAvatar width={60} height={60} borderRadius={30}>
                                        {creatorImage ? (
                                            <Image
                                                style={styles.creatorImage}
                                                source={{ uri: creatorImage }}
                                            />
                                        ) : (
                                            <Typo
                                                text={credential}
                                                fontSize={20}
                                                lineHeight={24}
                                                color="#7c7c7d"
                                            />
                                        )}
                                    </BorderedAvatar>
                                    <SpaceFiller height={12} />
                                    <Typo
                                        text={creatorName}
                                        fontSize={14}
                                        fontWeight="600"
                                        lineHeight={18}
                                    />
                                    <SpaceFiller height={4} />
                                    <Typo
                                        text={formateAccountNumber(creatorAccountNumber, 12)}
                                        fontSize={14}
                                        lineHeight={20}
                                    />
                                    <SpaceFiller height={16} />
                                    <Typo
                                        text={`RM ${formattedAmount}`}
                                        fontSize={24}
                                        fontWeight="bold"
                                        lineHeight={31}
                                    />
                                </View>
                                <View style={styles.detailsContainer}>
                                    <View style={styles.detailsRowContainer}>
                                        <Typo text="Date" fontSize={14} lineHeight={19} />
                                        <Typo
                                            text={moment().format("DD MMM YYYY")}
                                            fontSize={14}
                                            lineHeight={19}
                                            fontWeight="600"
                                        />
                                    </View>
                                    <View style={styles.detailsRowContainer}>
                                        <Typo
                                            text="Recipient reference"
                                            fontSize={14}
                                            lineHeight={19}
                                        />
                                        <Typo
                                            text={goalTitle}
                                            fontSize={14}
                                            lineHeight={19}
                                            fontWeight="600"
                                        />
                                    </View>
                                    <View style={styles.detailsRowContainer}>
                                        <Typo text="Bank name" fontSize={14} lineHeight={19} />
                                        <Typo
                                            text="Maybank"
                                            fontSize={14}
                                            lineHeight={19}
                                            fontWeight="600"
                                        />
                                    </View>
                                    <View style={styles.detailsRowContainer}>
                                        <Typo
                                            text="Payment details"
                                            fontSize={14}
                                            lineHeight={19}
                                        />
                                        <TouchableOpacity>
                                            <Typo
                                                text="Optional"
                                                fontSize={14}
                                                lineHeight={19}
                                                fontWeight="600"
                                                color="#cfcfcf"
                                            />
                                        </TouchableOpacity>
                                    </View>
                                </View>
                                <View style={styles.noteContainer}>
                                    <Typo
                                        text="Note:"
                                        fontSize={12}
                                        lineHeight={18}
                                        fontWeight="600"
                                        color="#787878"
                                    />
                                    <SpaceFiller height={4} />
                                    <Typo
                                        text="Money withdrawn from your insured deposit(s) is no longer protected by PIDM if transferred to non PIDM members and products."
                                        fontSize={12}
                                        lineHeight={18}
                                        color="#787878"
                                        textAlign="left"
                                    />
                                </View>
                            </ScrollView>
                            <FixedActionContainer>
                                <ActionButton
                                    fullWidth
                                    onPress={this._onTransferNowButtonPressed}
                                    componentCenter={
                                        <Typo
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
                    {showS2UModal && (
                        <Secure2uAuthenticationModal
                            token={s2uToken}
                            amount={numeral(formattedAmount).value()}
                            onS2UDone={this._onS2UModalApproveButtonPressed}
                            s2uPollingData={secure2uValidateData}
                            transactionDetails={[
                                {
                                    label: "To",
                                    value: `${creatorAccountName}\n${formateAccountNumber(
                                        creatorAccountNumber,
                                        12
                                    )}`,
                                },
                                {
                                    label: "From",
                                    value: `Tabung\n${goalTitle}`,
                                },
                                { label: "Transaction Type", value: "Withdraw Funds" },
                                {
                                    label: "Date",
                                    value: s2uServerDate,
                                },
                            ]}
                            extraParams={{
                                metadata: {
                                    txnType: "GOAL",
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
                            transferApi={this._withdrawFundFromTabung}
                            onTacSuccess={this._onTACWithdrawalSuccessful}
                            onTacClose={this._onTacModalCloseButtonPressed}
                            onTacError={this._onTACWithdrawalFailure}
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

const styles = StyleSheet.create({
    creatorContainer: {
        alignItems: "center",
        justifyContent: "center",
        width: "100%",
    },
    creatorImage: {
        borderRadius: 31,
        height: 58,
        width: 58,
    },
    detailsContainer: {
        borderBottomColor: LIGHT_GREY,
        borderBottomWidth: 1,
        height: 124,
        justifyContent: "space-between",
        marginBottom: 24,
        marginHorizontal: 24,
        marginTop: 37,
        paddingBottom: 24,
    },
    detailsRowContainer: {
        alignItems: "center",
        flexDirection: "row",
        justifyContent: "space-between",
    },
    noteContainer: {
        alignItems: "flex-start",
        justifyContent: "flex-start",
        marginHorizontal: 24,
    },
});

export default withModelContext(GoalGroupWithdrawalTransferToCreator);
