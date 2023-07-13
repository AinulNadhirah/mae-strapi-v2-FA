import PropTypes from "prop-types";
import React from "react";
import { View, StyleSheet } from "react-native";
import DeviceInfo from "react-native-device-info";

import { navigateToS2UCooling } from "@screens/OneTapAuth/CoolingNavigator";

import { MAYBANK2U, ONE_TAP_AUTH_MODULE, SECURE2U_COOLING } from "@navigation/navigationConstant";

import HeaderLayout from "@layouts/HeaderLayout";
import ScreenLayout from "@layouts/ScreenLayout";

import HeaderBackButton from "@components/Buttons/HeaderBackButton";
import ScreenContainer from "@components/Containers/ScreenContainer";
import Secure2uAuthenticationModal from "@components/Modals/Secure2uAuthenticationModal";
import TacModal from "@components/Modals/TacModal";
import NumericalKeyboard from "@components/NumericalKeyboard";
import SpaceFiller from "@components/Placeholders/SpaceFiller";
import Typography from "@components/Text";
import TextInput from "@components/TextInput";
import { showErrorToast, showInfoToast } from "@components/Toast";
import TransferImageAndDetails from "@components/Transfers/TransferImageAndDetails";

import { withModelContext } from "@context";

import { bankingPostDataMayaM2u, invokeL3 } from "@services";
import { GABanking } from "@services/analytics/analyticsBanking";

import { MEDIUM_GREY } from "@constants/colors";
import { DATE_AND_TIME, REFERENCE_ID, SECURE2U_IS_DOWN } from "@constants/strings";

import {
    checks2UFlow,
    getCardNoLength,
    getCardProviderFullLogo,
    getDeviceRSAInformation,
    maskAccount,
} from "@utils/dataModel/utility";
import { ErrorLogger } from "@utils/logs";

const S2UFlowEnum = Object.freeze({
    s2u: "S2U",
    s2uReg: "S2UReg",
    tac: "TAC",
});

const CCActivationTxnCodeS2u = 35;
class EnterCardExpiryYearScreen extends React.Component {
    static propTypes = {
        navigation: PropTypes.object.isRequired,
        route: PropTypes.object.isRequired,
        getModel: PropTypes.func.isRequired,
        updateModel: PropTypes.func.isRequired,
    };

    state = {
        year: "",
        errorMsg: "",
        prevData: this.props.route.params?.prevData ?? {},

        // TAC
        showTACModal: false,
        tacParams: {},

        // S2U
        showS2UModal: false,
        s2uToken: "",
        s2uServerDate: "",
        s2uTransactionType: "",
        s2uTransactionReferenceNumber: "",
        secure2uExtraParams: {
            metadata: { txnType: "CARD_ACTIVATION" },
        },
        nonTxnData: { isNonTxn: true },
    };

    componentDidMount() {
        GABanking.viewScreenCreditCardActivation();
        this._checkS2UStatus();
        this._unsubscribeFocusListener = this.props.navigation.addListener("focus", () => {
            if (this.props.route.params.isS2URegistrationAttempted) {
                this._handlePostS2URegistration();
            }
        });
    }

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

    _checkS2UStatus = async () => {
        const request = await this._requestL3Permission();
        if (!request) {
            this.props.navigation.goBack();
            return;
        }
        //passing new paramerter updateModel for s2u interops
        const { flow, secure2uValidateData } = await checks2UFlow(
            CCActivationTxnCodeS2u,
            this.props.getModel,
            this.props.updateModel
        );
        this.setState({ secure2uValidateData });
        console.log("[_checkS2UStatus] flow: ", flow);

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
                            stack: MAYBANK2U,
                            screen: "CCAEnterCardExpiryYearScreen",
                        },
                        fail: {
                            stack: MAYBANK2U,
                            screen: "",
                        },
                        params: { ...this.props.route.params },
                    },
                },
            });
        } else if (flow === S2UFlowEnum.tac) {
            showInfoToast({ message: SECURE2U_IS_DOWN });
        }
    };

    _handlePostS2URegistration = async () => {
        //passing new paramerter updateModel for s2u interops
        const { flow } = await checks2UFlow(
            CCActivationTxnCodeS2u,
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
    };

    handleBack = () => {
        this.props.navigation.canGoBack() && this.props.navigation.goBack();
    };

    handleKeyboardChange = (text) => {
        this.setState({ year: text });
    };

    handleKeyboardDone = async () => {
        const { year, prevData } = this.state;
        const { getModel } = this.props;

        if (year && year.length === 4) {
            const { flow, secure2uValidateData } = await checks2UFlow(
                CCActivationTxnCodeS2u,
                this.props.getModel,
                this.props.updateModel
            );
            console.log("[handleKeyboardDone] flow: ", flow);
            const { deviceInformation, deviceId } = getModel("device");
            const mobileSDKData = getDeviceRSAInformation(deviceInformation, DeviceInfo, deviceId);

            // process card no.
            const length = getCardNoLength(prevData.number);
            const cardNo = prevData.number.substring(0, length);

            const payload = {
                cardNo,
                cardExpiry: year,
                mobileSDKData,
            };
            if (flow === SECURE2U_COOLING) {
                const { navigate } = this.props.navigation;
                navigateToS2UCooling(navigate);
            } else if (flow === S2UFlowEnum.s2u) {
                // S2U flow
                const twoFAS2uType =
                    secure2uValidateData?.pull === "N" ? "SECURE2U_PUSH" : "SECURE2U_PULL"; //s2u interops changes
                this.setState(
                    { payload: { ...payload, twoFAType: twoFAS2uType, tacBlock: "" } },
                    () => this.navigateToS2UFlow()
                );
            } else {
                // TAC flow
                this.setState({ payload: { ...payload, twoFAType: "TAC" } }, () =>
                    this.navigateToTACFlow()
                );
            }
        } else {
            showErrorToast({
                message: "Expiry year must consist of at least 4 digits.",
            });
            this.setState({ year: "" });
        }
    };

    navigateToS2UFlow = async () => {
        try {
            const { payload } = this.state;
            console.log("[navigateToS2UFlow] payload:", payload);
            const response = await this._activateCard(payload);
            console.log("[navigateToS2UFlow] _activateCard response:", response);
            if (response?.status === 200 && response?.data?.result?.statusCode === "0000") {
                this.setState({
                    showS2UModal: true,
                    s2uToken: response.data.result.pollingToken,
                    s2uServerDate:
                        response.data?.result?.hostDt ?? response.data?.result?.serverDate ?? "N/A",
                    s2uTransactionType: "Card Activation",
                    s2uTransactionReferenceNumber: response.data.result.txnRefNo ?? "N/A",
                });
            } else {
                this._handleApiCallFailure(response);
            }
        } catch (error) {
            this._handleApiCallFailure(error);
        } finally {
            this.setState({
                loader: false,
            });
        }
    };

    _onS2UConfirmation = async (s2uResponse) => {
        const { s2uServerDate, s2uTransactionReferenceNumber } = this.state;

        this.setState({
            showS2UModal: false,
            s2uToken: "",
            s2uServerDate: "",
            s2uTransactionType: "",
            s2uTransactionReferenceNumber: "",
        });

        console.tron.log("[_onS2UConfirmation] s2uResponse:", s2uResponse);

        const s2uSignResponse = s2uResponse.s2uSignRespone ?? null;

        this.props.navigation.navigate("CCAAcknowledgementScreen", {
            ...this.props.route.params,
            isSuccessful: s2uSignResponse?.statusCode === "M000",
            errorMessage: s2uSignResponse?.statusDescription ?? "N/A",
            detailsData: [
                {
                    title: REFERENCE_ID,
                    value:
                        s2uSignResponse?.formattedTransactionRefNumber ??
                        s2uTransactionReferenceNumber ??
                        "N/A",
                },
                {
                    title: DATE_AND_TIME,
                    value:
                        s2uSignResponse?.dateTime ??
                        s2uSignResponse?.serverDate ??
                        s2uServerDate ??
                        "N/A",
                },
            ],
        });
    };

    _onS2UClose = () => {
        console.log("[_onS2UClose]");
        // will close s2u modal
        this.setState({ showS2u: false });
    };

    _generateS2UTransactionDetails = () => {
        const { s2uServerDate, s2uTransactionType, prevData } = this.state;

        const formattedCardDetails = `${prevData.name}\n${maskAccount(prevData?.number) ?? ""}`;

        return [
            { label: "Transaction Type", value: "Card Activation" },
            {
                label: "Date & time",
                value: s2uServerDate,
            },
            {
                label: "Card details",
                value: formattedCardDetails,
            },
        ];
    };

    navigateToTACFlow = () => {
        console.log("[navigateToTACFlow]");
        const {
            prevData: { number },
        } = this.state;
        // Show TAC Modal
        const params = {
            fundTransferType: "CARDACTIVATION",
            cardNo: number,
        };
        this.setState({ showTACModal: true, tacParams: params, loader: true });
    };

    onTACDone = async (tac) => {
        console.log("[onTACDone]" + tac);
        this.setState({ showTACModal: false });

        // Call card activation api with TAC
        const { payload } = this.state;
        try {
            const response = await this._activateCard({ ...payload, tacBlock: tac });
            console.log("[onTACDone] resp", response);
            this.props.navigation.navigate("CCAAcknowledgementScreen", {
                ...this.props.route.params,
                isSuccessful: response?.data?.result.statusCode === "0000",
                errorMessage: response?.data?.result?.statusDesc ?? "N/A",
                detailsData: [
                    {
                        title: REFERENCE_ID,
                        value: response?.data?.result?.txnRefNo ?? "N/A",
                    },
                    {
                        title: DATE_AND_TIME,
                        value:
                            response?.data?.result?.serverDate ??
                            response?.data?.result?.hostDt ??
                            "N/A",
                    },
                ],
            });
        } catch (error) {
            this._handleApiCallFailure(error);
        } finally {
            this.setState({
                loader: false,
            });
        }
    };

    onTacModalCloseButtonPressed = () => {
        console.log("[onTacModalCloseButtonPressed]");
        this.setState({ showTACModal: false, loader: false });
    };

    _activateCard = async (payload) => {
        try {
            return await bankingPostDataMayaM2u("/ccActivate/ccActivation", payload, true);
        } catch (error) {
            ErrorLogger(error);
            throw error;
        }
    };

    _handleApiCallFailure = (error) => {
        const { errorResult } = error?.error?.result || error?.data?.result || {};
        this.setState(
            {
                loader: false,
            },
            () =>
                this.props.navigation.navigate("CCAAcknowledgementScreen", {
                    ...this.props.route.params,
                    errorMessage:
                        error?.message ?? error?.error?.message ?? errorResult?.statusDesc ?? "N/A",
                    isSuccessful: false,
                    detailsData: [
                        {
                            title: REFERENCE_ID,
                            value:
                                errorResult?.transactionRefNumber ?? errorResult?.txnRefNo ?? "N/A",
                        },
                        {
                            title: DATE_AND_TIME,
                            value: errorResult?.serverDate ?? errorResult?.hostDt ?? "N/A",
                        },
                    ],
                })
        );
    };

    render() {
        const {
            prevData,
            showTACModal,
            tacParams,
            showS2UModal,
            s2uToken,
            secure2uValidateData,
            secure2uExtraParams,
            nonTxnData,
            loader,
        } = this.state;

        const s2uTransactionDetails = this._generateS2UTransactionDetails();

        return (
            <ScreenContainer
                backgroundType="color"
                backgroundColor={MEDIUM_GREY}
                showLoaderModal={loader}
            >
                <>
                    <ScreenLayout
                        paddingBottom={0}
                        paddingTop={16}
                        paddingHorizontal={0}
                        header={
                            <HeaderLayout
                                headerCenterElement={
                                    <Typography
                                        fontSize={16}
                                        fontWeight="600"
                                        lineHeight={19}
                                        text="Activate Card"
                                    />
                                }
                                headerLeftElement={<HeaderBackButton onPress={this.handleBack} />}
                            />
                        }
                        scrollable
                        useSafeArea
                        neverForceInset={["bottom"]}
                    >
                        <View style={styles.wrapper}>
                            <View style={styles.container}>
                                <TransferImageAndDetails
                                    title={prevData?.name ?? ""}
                                    subtitle={maskAccount(prevData?.number) ?? ""}
                                    image={{
                                        type: "local",
                                        source: getCardProviderFullLogo(prevData?.number) ?? null,
                                    }}
                                />
                                <SpaceFiller height={22} />
                                <Typography
                                    fontSize={14}
                                    fontWeight="normal"
                                    lineHeight={18}
                                    style={styles.label}
                                    text="Card expiry year"
                                    textAlign="left"
                                />
                                <SpaceFiller height={4} />
                                <TextInput
                                    value={this.state.year}
                                    clearButtonMode="while-editing"
                                    returnKeyType="done"
                                    editable={false}
                                    errorMessage={this.state.errorMsg}
                                    placeholder="YYYY"
                                    // style={{ color: amount === 0 ? GREY : BLACK }}
                                    // isValid={isTransferAmountValid}
                                    // isValidate
                                />
                            </View>
                        </View>
                    </ScreenLayout>

                    <NumericalKeyboard
                        value={this.state.year}
                        onChangeText={this.handleKeyboardChange}
                        maxLength={4}
                        onDone={this.handleKeyboardDone}
                    />

                    {showS2UModal && (
                        <Secure2uAuthenticationModal
                            token={s2uToken}
                            amount=""
                            nonTxnData={nonTxnData}
                            onS2UDone={this._onS2UConfirmation}
                            onS2UClose={this._onS2UClose}
                            s2uPollingData={secure2uValidateData}
                            transactionDetails={s2uTransactionDetails}
                            extraParams={secure2uExtraParams}
                        />
                    )}
                    {showTACModal && (
                        <TacModal
                            tacParams={tacParams}
                            validateByOwnAPI={true}
                            validateTAC={this.onTACDone}
                            onTacClose={this.onTacModalCloseButtonPressed}
                        />
                    )}
                </>
            </ScreenContainer>
        );
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingHorizontal: 36,
    },
    label: {
        paddingBottom: 4,
        paddingTop: 8,
    },
    wrapper: {
        flex: 1,
        flexDirection: "column",
        justifyContent: "space-between",
    },
});

export default withModelContext(EnterCardExpiryYearScreen);
