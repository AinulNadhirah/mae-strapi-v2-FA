import moment from "moment";
import PropTypes from "prop-types";
import React, { Component, useCallback } from "react";
import { ScrollView, View, StyleSheet, Image, TouchableOpacity } from "react-native";

import { navigateToS2UCooling } from "@screens/OneTapAuth/CoolingNavigator";

import {
    BANKINGV2_MODULE,
    DASHBOARD_STACK,
    FIXED_DEPOSIT_STACK,
    MAYBANK2U,
    ONE_TAP_AUTH_MODULE,
} from "@navigation/navigationConstant";

import HeaderLayout from "@layouts/HeaderLayout";
import ScreenLayout from "@layouts/ScreenLayout";

import BorderedAvatar from "@components/Avatars/BorderedAvatar";
import ActionButton from "@components/Buttons/ActionButton";
import HeaderCloseButton from "@components/Buttons/HeaderCloseButton";
import ScreenContainer from "@components/Containers/ScreenContainer";
import FixedActionContainer from "@components/Footers/FixedActionContainer";
import Secure2uAuthenticationModal from "@components/Modals/Secure2uAuthenticationModal";
import TacModal from "@components/Modals/TacModal";
import SpaceFiller from "@components/Placeholders/SpaceFiller";
import Typography from "@components/Text";
import { showErrorToast } from "@components/Toast";
import TransactionConfirmationDetails from "@components/TransactionConfirmationDetails";
import TransactionConfirmationNotes from "@components/TransactionConfirmationNotes";

import { withModelContext } from "@context";

import { executeFDPlacement, fetchFDSummary, invokeL3 } from "@services";

import {
    ROYAL_BLUE,
    SWITCH_GREY,
    BLACK,
    FADE_GREY,
    YELLOW,
    LIGHTER_YELLOW,
    DISABLED_TEXT,
} from "@constants/colors";
import { FD_TYPE_CODE } from "@constants/data";
import {
    COMMON_ERROR_MSG,
    FA_APPLY_FIXEDDEPOSIT_CONFIRMATION,
    CREDIT_TO_ACCOUNT,
    FD_ISLAMIC,
    INTEREST,
    PROFIT,
    STATEMENT,
    TERMS_CONDITIONS,
    PIDM_BROCHURE,
} from "@constants/strings";
import {
    GOVERN_BANK_ACC,
    GOVERN_BANK_ACC_CONV,
    IFD_STATEMEMNT,
    MDA_STATEMENT,
    PIDM_BROCHURE_PDF,
} from "@constants/url";

import { getNetworkMsg } from "@utils";
import { checks2UFlow, S2UFlowEnum, formateAccountNumber } from "@utils/dataModel/utility";

import Assets from "@assets";

const PDPA_KEY = Object.freeze({
    agree: 1,
    disagree: 0,
});

const nonTxnData = { isNonTxn: false };

const PDPARadioButton = ({ title, isSelected, onRadioButtonPressed, pdpaKey }) => {
    const onPress = useCallback(
        () => onRadioButtonPressed(pdpaKey),
        [onRadioButtonPressed, pdpaKey]
    );

    return (
        <TouchableOpacity style={styles.radioButtonContainer} onPress={onPress}>
            <Image
                style={styles.radioButtonImage}
                source={isSelected ? Assets.icRadioChecked : Assets.icRadioUnchecked}
            />
            <Typography
                text={title}
                fontSize={12}
                textAlign="left"
                lineHeight={18}
                color={FADE_GREY}
            />
        </TouchableOpacity>
    );
};

PDPARadioButton.propTypes = {
    title: PropTypes.string.isRequired,
    isSelected: PropTypes.bool.isRequired,
    onRadioButtonPressed: PropTypes.bool.isRequired,
    pdpaKey: PropTypes.number.isRequired,
};

class FDConfirmationScreen extends Component {
    static propTypes = {
        navigation: PropTypes.object.isRequired,
        route: PropTypes.object.isRequired,
        getModel: PropTypes.func,
        updateModel: PropTypes.func,
    };

    state = {
        title: "",
        subtitle: "",
        isLoadingBtn: false,
        amount: "",
        details: [],
        selectedPDPAKey: -1,
        showTACModal: false,
        tacParams: {},
        tacPlacementApiParams: {},
        showS2UModal: false,
        s2uPollingToken: "",
        s2uServerDateTime: "N/A",
        s2uData: {},
        s2uInfo: {},
        transactionReferenceNumber: "N/A",
    };

    componentDidMount() {
        this._hydrateScreen();
        this._unSubNavigationFocusListener = this.props.navigation.addListener(
            "focus",
            this._handleOnFocusEvent
        );
    }

    componentWillUnmount() {
        this._unSubNavigationFocusListener();
    }

    _hydrateScreen = () => {
        const {
            route: {
                params: {
                    fdDetails: {
                        fdTypeDetails,
                        placementTypeDetails,
                        formattedAmountString,
                        selectedFDAccountDetails,
                    },
                },
            },
        } = this.props;

        this.setState({
            title: fdTypeDetails.name,
            subtitle: selectedFDAccountDetails
                ? formateAccountNumber(selectedFDAccountDetails.number)
                : placementTypeDetails.title,
            amount: `RM ${formattedAmountString}`,
            details: this._generateDetails(),
        });
    };

    // _isIslamicOrConventionalFDWith15OrHigherTenureAndPlacementAmountOfLessThan10k = () => {
    //     const {
    //         route: {
    //             params: {
    //                 fdDetails: { amount, fdTypeDetails, tenureDetails },
    //             },
    //         },
    //     } = this.props;
    //     return (
    //         (fdTypeDetails.value === FD_TYPE_CODE[FD_ISLAMIC] ||
    //             fdTypeDetails.value === FD_TYPE_CODE["Maybank Conventional Fixed Deposit"]) &&
    //         amount < 10000 &&
    //         parseInt(tenureDetails.value, 10) >= 15
    //     );
    // };

    // _isIslamicOrConventionalFDWith15OrHigherTenureAndPlacementAmountOfMoreThan10k = () => {
    //     const {
    //         route: {
    //             params: {
    //                 fdDetails: { amount, fdTypeDetails, tenureDetails },
    //             },
    //         },
    //     } = this.props;
    //     return (
    //         (fdTypeDetails.value === FD_TYPE_CODE[FD_ISLAMIC] ||
    //             fdTypeDetails.value === FD_TYPE_CODE["Maybank Conventional Fixed Deposit"]) &&
    //         amount >= 10000 &&
    //         parseInt(tenureDetails.value, 10) >= 15
    //     );
    // };

    _generateDetails = () => {
        const {
            route: {
                params: {
                    fdDetails: {
                        tenureDetails,
                        placementTypeDetails,
                        paymentFrequency,
                        paymentMode,
                        instructionsOnMaturity,
                        selectedCASAAccountDetails: { accountName, accountNumber },
                        selectedFDAccountDetails,
                        creditToAccountDetails,
                    },
                },
            },
        } = this.props;

        return [
            { title: "Date", value: moment().format("DD MMM yyyy") },
            ...(selectedFDAccountDetails
                ? [{ title: "Placement type", value: placementTypeDetails.title }]
                : []),
            { title: "Tenure", value: this._formatDetailsValue(tenureDetails.name) },
            {
                title: "Transfer from",
                value: accountName + "\n" + formateAccountNumber(accountNumber, 12),
            },
            {
                title: `${this._generateLabelPrefix()} payment frequency`,
                value: this._formatDetailsValue(paymentFrequency.title),
            },
            {
                title: `${this._generateLabelPrefix()} payment mode`,
                value: this._formatDetailsValue(paymentMode.title),
            },
            ...(paymentMode.value === "4"
                ? [
                      {
                          title: CREDIT_TO_ACCOUNT,
                          value:
                              creditToAccountDetails.originalName +
                              "\n" +
                              creditToAccountDetails.formattedAccountNumber,
                      },
                  ]
                : []),
            {
                title: "Instruction on maturity",
                value: this._formatDetailsValue(instructionsOnMaturity.title),
                onPress: this._updateInstructionOnMaturity,
            },
            ...(instructionsOnMaturity.value === "5"
                ? [
                      {
                          title: CREDIT_TO_ACCOUNT,
                          value:
                              creditToAccountDetails.originalName +
                              "\n" +
                              creditToAccountDetails.formattedAccountNumber,
                      },
                  ]
                : []),
        ];
    };

    _formatDetailsValue = (text) =>
        text
            .split("")
            .map((char, index) => {
                if (index === 0) return char.toUpperCase();
                else return char.toLowerCase();
            })
            .join("");

    _updateInstructionOnMaturity = () =>
        this.props.navigation.push("FDPlacementDetailsScreen", {
            ...this.props.route.params,
            isConfirmationDetailsEdit: true,
        });

    _generateLabelPrefix = () =>
        this.props.route.params.fdDetails.isIslamicPlacement ? PROFIT : INTEREST;

    _handleOnFocusEvent = () => {
        const {
            route: {
                params: { isConfirmationAmountEdit, isConfirmationDetailsEdit },
            },
        } = this.props;

        if (isConfirmationAmountEdit) {
            this._updateAmount();
        }
        if (isConfirmationDetailsEdit) this._updateDetailsPostEdit();
    };

    _updateDetailsPostEdit = () =>
        this.setState({
            details: this._generateDetails(),
        });

    _updateAmount = () => {
        const {
            route: {
                params: {
                    fdDetails: { formattedAmountString },
                },
            },
        } = this.props;

        this.setState({
            amount: `RM ${formattedAmountString}`,
            details: this._generateDetails(),
        });
    };

    _handleNavigationToEntryPoint = () => {
        const {
            route: {
                params: { fdEntryPointModule, fdEntryPointScreen },
            },
            navigation: { navigate },
        } = this.props;
        navigate(fdEntryPointModule, {
            screen: fdEntryPointScreen,
        });
    };

    _handleAmountEdit = () =>
        this.props.navigation.push("FDPlacementAmountScreen", {
            ...this.props.route.params,
            isConfirmationAmountEdit: true,
        });

    _navigateToPDFViewer = ({ url, title }) => {
        this.props.navigation.navigate(DASHBOARD_STACK, {
            screen: "ExternalUrl",
            params: {
                url,
                title,
            },
        });
    };

    _showPIDMBrochure = () =>
        this._navigateToPDFViewer({
            url: PIDM_BROCHURE_PDF,
            title: PIDM_BROCHURE,
        });

    _showIslamicAgreement = () => {
        if (FD_TYPE_CODE[FD_ISLAMIC] === this.props.route.params.fdDetails.fdTypeDetails.value) {
            this._navigateToPDFViewer({
                url: IFD_STATEMEMNT,
                title: STATEMENT,
            });
        } else {
            this._navigateToPDFViewer({
                url: MDA_STATEMENT,
                title: STATEMENT,
            });
        }
    };

    _showIslamicTNC = () =>
        this._navigateToPDFViewer({
            url: GOVERN_BANK_ACC,
            title: TERMS_CONDITIONS,
        });

    _showConventionalTNC = () =>
        this._navigateToPDFViewer({
            url: GOVERN_BANK_ACC_CONV,
            title: TERMS_CONDITIONS,
        });

    _generateNotesComponents = () => {
        const notes = [
            <Typography key="pidmNote" textAlign="left">
                <Typography
                    text="I/We have read the "
                    fontSize={12}
                    lineHeight={18}
                    color="#787878"
                    textAlign="left"
                />
                <Typography
                    text="PIDM’s DIS brochure"
                    color={BLACK}
                    fontSize={12}
                    lineHeight={18}
                    textAlign="left"
                    fontWeight="600"
                    style={styles.textUnderline}
                    onPress={this._showPIDMBrochure}
                />
                <Typography
                    text=" and understand this product is protected by PIDM up to RM250,000 for each depositor."
                    fontSize={12}
                    lineHeight={18}
                    color="#787878"
                    textAlign="left"
                />
            </Typography>,
        ];

        if (this.props.route.params.fdDetails.isIslamicPlacement) {
            notes.push(
                <Typography key="islamicTNC" textAlign="left">
                    <Typography
                        text="I agree with this "
                        fontSize={12}
                        lineHeight={18}
                        color="#787878"
                        textAlign="left"
                    />
                    <Typography
                        text="Statement"
                        color={BLACK}
                        fontSize={12}
                        lineHeight={18}
                        textAlign="left"
                        fontWeight="600"
                        style={styles.textUnderline}
                        onPress={this._showIslamicAgreement}
                    />
                    <Typography
                        text=" and accept the "
                        fontSize={12}
                        lineHeight={18}
                        color="#787878"
                        textAlign="left"
                    />
                    <Typography
                        text="Terms & Conditions"
                        color={BLACK}
                        fontSize={12}
                        lineHeight={18}
                        textAlign="left"
                        fontWeight="600"
                        style={styles.textUnderline}
                        onPress={this._showIslamicTNC}
                    />
                    <Typography
                        text=" for this product."
                        fontSize={12}
                        lineHeight={18}
                        color="#787878"
                        textAlign="left"
                    />
                </Typography>
            );
        } else {
            notes.push(
                <Typography key="conventionalTNC" textAlign="left">
                    <Typography
                        text="I agree and accept the "
                        fontSize={12}
                        lineHeight={18}
                        color="#787878"
                        textAlign="left"
                    />
                    <Typography
                        text="Terms & Conditions"
                        color={BLACK}
                        fontSize={12}
                        lineHeight={18}
                        textAlign="left"
                        fontWeight="600"
                        style={styles.textUnderline}
                        onPress={this._showConventionalTNC}
                    />
                    <Typography
                        text=" for this product."
                        fontSize={12}
                        lineHeight={18}
                        color="#787878"
                        textAlign="left"
                    />
                </Typography>
            );
        }

        return notes;
    };

    _updatePDPASelection = (pdpaKey) =>
        this.setState({
            selectedPDPAKey: pdpaKey,
        });

    handleClose = () => {
        const { route, navigation } = this.props;
        const { asnbAccountData, origin } = route.params;
        const { index } = asnbAccountData;
        console.info("FDConfirmationScreen >> [handleClose]");
        if (origin === BANKINGV2_MODULE) {
            navigation.navigate({
                name: MAYBANK2U,
                params: {
                    index,
                },
            });
        }
    };

    _dismissTACModal = () =>
        this.setState({
            showTACModal: false,
        });

    checkS2UStatus = async () => {
        this.setState({ isLoadingBtn: true });
        const {
            route,
            navigation: { setParams, navigate },
            getModel,
            updateModel,
        } = this.props;
        const { flow, secure2uValidateData } = await checks2UFlow(52, getModel, updateModel);
        this.setState({
            s2uData: secure2uValidateData,
        });
        const twoFAType =
            flow === S2UFlowEnum.s2u
                ? secure2uValidateData?.pull === "N"
                    ? S2UFlowEnum.s2uPush
                    : S2UFlowEnum.s2uPull
                : S2UFlowEnum.tac;
        if (flow === S2UFlowEnum.s2uReg) {
            const { isPostPassword } = getModel("auth");

            // L3 call to invoke login page
            if (!isPostPassword) {
                const httpResp = await invokeL3(true).catch((error) => {
                    console.log("[FDConfirmationScreen][invokeL3] >> Exception: ", error);
                });
                const code = httpResp?.data?.code ?? null;
                if (code !== 0) {
                    this.handleClose();
                    return;
                }
            }
            this.setState({ isLoadingBtn: false });
            setParams({ isS2UReg: true });
            navigate(ONE_TAP_AUTH_MODULE, {
                screen: "Activate",
                params: {
                    flowParams: {
                        success: {
                            stack: FIXED_DEPOSIT_STACK,
                            screen: "FDConfirmationScreen",
                        },
                        fail: {
                            stack: FIXED_DEPOSIT_STACK,
                            screen: "",
                        },
                        params: { ...route.params, secure2uValidateData, flow },
                    },
                },
            });
        } else if (flow === S2UFlowEnum.s2u) {
            const params = this.generateParams(twoFAType);
            this.getFDSummary(params);
        } else if (flow === S2UFlowEnum.s2uCooling) {
            this.setState({ isLoadingBtn: false });
            navigateToS2UCooling(navigate);
        } else {
            this._promptTAC(twoFAType);
        }
    };

    generateParams = (twoFAType) => {
        const {
            route: {
                params: {
                    fdDetails: {
                        selectedCASAAccountDetails: { accountNumber },
                        placementTypeDetails: { placementTypeCode },
                        fdTypeDetails: { value: fdType },
                        paymentMode: { value: intPayMode },
                        tenureDetails: { value: term },
                        creditToAccountDetails,
                        selectedFDAccountDetails,
                        paymentFrequency: { value: intPayFreq },
                        instructionsOnMaturity: { value: renewal },
                        trinityDetails,
                        amount,
                    },
                },
            },
        } = this.props;
        const selectedFDAccountNumber = selectedFDAccountDetails?.number ?? "";
        const isHighRiskCustomer = trinityDetails?.isHighRiskCustomer ?? false;
        return {
            amount,
            twoFAType,
            placementCode: placementTypeCode,
            fdType,
            intPayMode,
            term,
            creditToAccount: creditToAccountDetails?.originalAccountNumber ?? "",
            fromAccount: accountNumber,
            placementType: !selectedFDAccountNumber ? "new" : "subsequent",
            fdAccount: selectedFDAccountNumber,
            intPayFreq,
            renewal,
            ...(isHighRiskCustomer && {
                fdSourceOfWealth: trinityDetails?.sourceOfWealth?.value ?? "",
                fdSourcefund: trinityDetails?.primaryIncome?.value ?? "",
                fdSourceOfWealthText: trinityDetails?.sourceOfWealth?.name ?? "",
                fdSourcefundText: trinityDetails?.primaryIncome?.name ?? "",
            }),
        };
    };

    _promptTAC = (twoFAType) => {
        const tacPlacementApiParams = this.generateParams(twoFAType);
        this.setState({
            showTACModal: true,
            tacParams: {
                fundTransferType: "FD_PLACEMENT",
                amount: tacPlacementApiParams.amount,
            },
            tacPlacementApiParams,
            isLoadingBtn: false,
        });
    };

    _showTACErrorToast = (tacResponse) => {
        const { descMsg } = getNetworkMsg(tacResponse?.message);
        this._dismissTACModal();
        const {
            navigation: { navigate },
            route: {
                params: { fdEntryPointModule, fdEntryPointScreen },
            },
        } = this.props;
        const error = tacResponse?.error;
        navigate("FDPlacementAcknowledgementScreen", {
            isPlacementSuccessful: false,
            placementErrorMessage: descMsg ?? error?.message ?? "N/A",
            placementDetails: {
                referenceID: error?.transactionRefNumber ?? error?.refId ?? "N/A",
                dateAndTime: error?.serverDate ?? "N/A",
            },
            fdEntryPointModule,
            fdEntryPointScreen,
            isDeclined: false,
        });
    };

    _navigateToAcknowledgementScreen = (response, isS2uFlow = false) => {
        const { status = "" } = response;
        const {
            navigation: { navigate },
            route: {
                params: {
                    fdEntryPointModule,
                    fdEntryPointScreen,
                    fdDetails: {
                        tenureDetails,
                        formattedAmountString,
                        selectedFDAccountDetails,
                        fdTypeDetails,
                        firstTimeFd,
                    },
                    fdAccounts,
                },
            },
        } = this.props;
        const { showS2UModal, transactionReferenceNumber, s2uServerDateTime } = this.state;
        const placementDetails = {
            referenceID: response?.transactionReferenceNumber ?? transactionReferenceNumber,
            dateAndTime: showS2UModal ? s2uServerDateTime : response?.serverDate,
        };
        const successfulPlacementDetails = {
            ...placementDetails,
            ...(selectedFDAccountDetails
                ? {
                      to:
                          (selectedFDAccountDetails?.originalName ??
                              selectedFDAccountDetails?.name) +
                          "\n" +
                          formateAccountNumber(selectedFDAccountDetails.number, 12),
                  }
                : { fdType: fdTypeDetails.name }),
            certificateNumber: response?.certificateNumber ?? "N/A",
            tenure: this._formatDetailsValue(tenureDetails.name),
            amount: `RM ${formattedAmountString}`,
        };
        if (
            response?.statusCode === "0" ||
            response?.statusCode === "M000" ||
            response?.statusCode === "M100"
        ) {
            navigate("FDPlacementAcknowledgementScreen", {
                isPlacementSuccessful: true,
                placementDetails: successfulPlacementDetails,
                fdEntryPointModule,
                fdEntryPointScreen,
                selectedFDAccountDetails,
                fdAccounts,
                firstTimeFd,
                isS2uFlow,
            });
        } else {
            navigate("FDPlacementAcknowledgementScreen", {
                isPlacementSuccessful: false,
                placementErrorMessage:
                    showS2UModal && status !== "M408"
                        ? response?.additionalStatusDescription
                        : response?.statusDescription,
                placementDetails,
                fdEntryPointModule,
                fdEntryPointScreen,
                isDeclined: response?.statusCode === "M201",
            });
        }
        this._dismissTACModal();
        this.onS2uClose();
    };

    populateS2UInfo = ({ pollingToken = "", serverDate = "", transactionReferenceNumber = "" }) => {
        const {
            route: {
                params: {
                    fdDetails: {
                        selectedCASAAccountDetails: { accountName = "", accountNumber = "" },
                    } = {},
                },
            },
        } = this.props;
        const { title } = this.state;
        const fdInfo = [
            { label: "Fixed deposit type", value: title },
            { label: "From", value: accountName + "\n" + formateAccountNumber(accountNumber, 12) },
            { label: "Date & Time", value: serverDate },
        ];
        this.setState({
            s2uPollingToken: pollingToken,
            s2uServerDateTime: serverDate,
            transactionReferenceNumber,
            showS2UModal: true,
            s2uInfo: fdInfo,
            isLoadingBtn: false,
        });
    };

    onS2uDone = (response) => {
        const { s2uSignRespone } = response;
        this._navigateToAcknowledgementScreen(s2uSignRespone, true);
    };

    onS2uClose = () => {
        this.setState({
            showS2UModal: false,
        });
    };

    getFDSummary = async (params) => {
        try {
            const result = await fetchFDSummary(params);
            if (result?.data?.statusCode === "0000") {
                this.populateS2UInfo(result?.data);
            } else {
                this.setState({ isLoadingBtn: false });
                showErrorToast({
                    message: result?.data?.statusDesc || result?.data?.message || COMMON_ERROR_MSG,
                });
            }
        } catch (error) {
            this.setState({ isLoadingBtn: false });
            showErrorToast({ message: error?.message });
        }
    };

    render() {
        const {
            title,
            subtitle,
            details,
            amount,
            selectedPDPAKey,
            showTACModal,
            tacParams,
            tacPlacementApiParams,
            isLoadingBtn,
            showS2UModal,
            s2uPollingToken,
            s2uData,
            s2uInfo,
        } = this.state;
        const {
            route: {
                params: {
                    fdDetails: { firstTimeFd },
                },
            },
        } = this.props;
        const isFormValid = !firstTimeFd || selectedPDPAKey !== -1;

        return (
            <ScreenContainer
                backgroundType="color"
                analyticScreenName={FA_APPLY_FIXEDDEPOSIT_CONFIRMATION}
            >
                <>
                    <ScreenLayout
                        header={
                            <HeaderLayout
                                headerCenterElement={
                                    <Typography
                                        text="Confirmation"
                                        fontSize={16}
                                        fontWeight="600"
                                        lineHeight={19}
                                    />
                                }
                                headerRightElement={
                                    <HeaderCloseButton
                                        onPress={this._handleNavigationToEntryPoint}
                                    />
                                }
                            />
                        }
                        useSafeArea
                        paddingHorizontal={0}
                        paddingBottom={0}
                    >
                        <>
                            <ScrollView
                                style={styles.container}
                                contentContainerStyle={styles.contentContainerStyle}
                                showsVerticalScrollIndicator={false}
                            >
                                <View style={styles.titleContainer}>
                                    <BorderedAvatar width={64} height={64} borderRadius={32}>
                                        <Image style={styles.avatarImage} source={Assets.MAYBANK} />
                                    </BorderedAvatar>
                                    <SpaceFiller height={14} />
                                    <Typography
                                        text={title}
                                        fontSize={14}
                                        fontWeight="600"
                                        lineHeight={18}
                                    />
                                    <SpaceFiller height={4} />
                                    <Typography text={subtitle} fontSize={14} lineHeight={20} />
                                    <SpaceFiller height={16} />
                                    <TouchableOpacity onPress={this._handleAmountEdit}>
                                        <Typography
                                            text={amount}
                                            fontSize={24}
                                            fontWeight="bold"
                                            lineHeight={31}
                                            color={ROYAL_BLUE}
                                        />
                                    </TouchableOpacity>
                                </View>
                                <TransactionConfirmationDetails details={details} />
                                <View style={styles.notesAndDetailsDivider} />
                                <TransactionConfirmationNotes
                                    noteCustomTextComponents={this._generateNotesComponents()}
                                />
                                {firstTimeFd && (
                                    <View style={styles.pdpaContainer}>
                                        <Typography
                                            text="Personal Data Protection Act (PDPA)"
                                            fontSize={12}
                                            fontWeight="500"
                                            lineHeight={18}
                                            color={FADE_GREY}
                                        />
                                        <SpaceFiller height={14} />
                                        <PDPARadioButton
                                            title="Yes, I expressly agree to Maybank Group and / or Strategic Partners
                                                processing my personal data for promotional and marketing purposes."
                                            isSelected={selectedPDPAKey === PDPA_KEY.agree}
                                            pdpaKey={PDPA_KEY.agree}
                                            onRadioButtonPressed={this._updatePDPASelection}
                                        />
                                        <SpaceFiller height={14} />
                                        <PDPARadioButton
                                            title="No, I do not agree to Maybank Group and / or Strategic Partners
                                                processing my personal data for promotional and marketing purposes."
                                            isSelected={selectedPDPAKey === PDPA_KEY.disagree}
                                            pdpaKey={PDPA_KEY.disagree}
                                            onRadioButtonPressed={this._updatePDPASelection}
                                        />
                                    </View>
                                )}
                            </ScrollView>
                            <FixedActionContainer>
                                <ActionButton
                                    fullWidth
                                    isLoading={isLoadingBtn}
                                    disabled={!isFormValid}
                                    componentCenter={
                                        <Typography
                                            text="Continue"
                                            fontSize={14}
                                            lineHeight={18}
                                            fontWeight="600"
                                            color={isFormValid ? BLACK : DISABLED_TEXT}
                                        />
                                    }
                                    backgroundColor={isFormValid ? YELLOW : LIGHTER_YELLOW}
                                    onPress={this.checkS2UStatus}
                                />
                            </FixedActionContainer>
                        </>
                    </ScreenLayout>
                    {showS2UModal && (
                        <Secure2uAuthenticationModal
                            token={s2uPollingToken}
                            onS2UDone={this.onS2uDone}
                            amount={amount}
                            onS2uClose={this.onS2uClose}
                            s2uPollingData={s2uData}
                            transactionDetails={s2uInfo}
                            secure2uValidateData={s2uData}
                            nonTxnData={nonTxnData}
                            extraParams={{
                                metadata: {
                                    txnType: "FD_PLACEMENT",
                                },
                            }}
                        />
                    )}
                    {showTACModal && (
                        <TacModal
                            tacParams={tacParams}
                            transferAPIParams={tacPlacementApiParams}
                            transferApi={executeFDPlacement}
                            onTacSuccess={this._navigateToAcknowledgementScreen}
                            onTacClose={this._dismissTACModal}
                            onTacError={this._showTACErrorToast}
                        />
                    )}
                </>
            </ScreenContainer>
        );
    }
}

const FLEX_START = "flex-start";
const CENTER = "center";

const styles = StyleSheet.create({
    avatarImage: {
        borderRadius: 32,
        height: 64,
        width: 64,
    },
    container: {
        flex: 1,
        paddingHorizontal: 24,
    },
    contentContainerStyle: { alignItems: CENTER, justifyContent: FLEX_START, paddingBottom: 24 },
    notesAndDetailsDivider: {
        backgroundColor: SWITCH_GREY,
        height: 1,
        marginVertical: 24,
        width: "100%",
    },
    pdpaContainer: {
        alignItems: FLEX_START,
        justifyContent: FLEX_START,
        marginTop: 14,
        paddingRight: 30,
        width: "100%",
    },
    radioButtonContainer: {
        alignItems: FLEX_START,
        flexDirection: "row",
        justifyContent: FLEX_START,
    },
    radioButtonImage: {
        borderColor: BLACK,
        borderRadius: 10,
        borderWidth: 1,
        height: 20,
        marginRight: 7,
        width: 20,
    },
    textUnderline: {
        textDecorationLine: "underline",
    },
    titleContainer: {
        alignItems: CENTER,
        justifyContent: FLEX_START,
        marginBottom: 36,
        width: "100%",
    },
});
export default withModelContext(FDConfirmationScreen);
