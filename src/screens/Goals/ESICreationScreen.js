import PropTypes from "prop-types";
import React, { useCallback } from "react";
import { View, StyleSheet, ScrollView, Image, TouchableOpacity, FlatList } from "react-native";

import { navigateToS2UCooling, navigateToS2UReg } from "@screens/OneTapAuth/CoolingNavigator";

import {
    COMMON_MODULE,
    TABUNG_DETAILS_SCREEN,
    PDF_VIEW,
    TABUNG_MAIN,
} from "@navigation/navigationConstant";

import HeaderLayout from "@layouts/HeaderLayout";
import ScreenLayout from "@layouts/ScreenLayout";

import ActionButton from "@components/Buttons/ActionButton";
import HeaderCloseButton from "@components/Buttons/HeaderCloseButton";
import AccountListingCarouselCard from "@components/Cards/AccountListingCarouselCard";
import ScreenContainer from "@components/Containers/ScreenContainer";
import FixedActionContainer from "@components/Footers/FixedActionContainer";
import ScreenLoader from "@components/Loaders/ScreenLoader";
import OtpModal from "@components/Modals/OtpModal";
import Secure2uAuthenticationModal from "@components/Modals/Secure2uAuthenticationModal";
import ScrollPicker from "@components/Pickers/ScrollPicker";
import SpaceFiller from "@components/Placeholders/SpaceFiller";
import Typo from "@components/Text";
import { showErrorToast } from "@components/Toast";

import { useModelState } from "@context";

import {
    bankingGetDataMayaM2u,
    esiPostServiceWrapper,
    requestOTP,
    validateOTP,
    invokeL3,
} from "@services";

import { GREY, WHITE, RADIO_BTN_YELLOW } from "@constants/colors";
import { M2U, S2U_PUSH, SMS_TAC } from "@constants/data";
import { FN_ENABLE_ESI } from "@constants/fundConstants";
import {
    AUTO_DEDUCTION_DISABLED_UNSUCCESSFUL,
    AUTO_DEDUCTION_DISABLE_SUCCESSFUL,
    AUTO_DEDUCTION_SUCCESSFUL,
    AUTO_DEDUCTION_UNSUCCESSFUL,
    SUCC_STATUS,
} from "@constants/strings";

import { maskedMobileNumber } from "@utils";
import { encryptData } from "@utils/dataModel";
import {
    handleS2UAcknowledgementScreen,
    init,
    initChallenge,
    s2uSdkLogs,
} from "@utils/dataModel/s2uSDKUtil";
import { formateAccountNumber, getShadow } from "@utils/dataModel/utility";
import { ErrorLogger } from "@utils/logs";

import Assets from "@assets";

const AccountItem = ({
    accountName,
    accountNumber,
    accountFormattedAmount,
    isSelected,
    onAccountItemPressed,
    index,
}) => {
    const onPress = useCallback(
        () => onAccountItemPressed({ accountNumber, index }),
        [onAccountItemPressed, accountNumber, index]
    );

    return (
        <TouchableOpacity style={styles.accountItemContainer} onPress={onPress}>
            <View style={styles.accountItemTextContainer}>
                <Typo text={accountName} fontSize={12} fontWeight="600" lineHeight={18} />
                <Typo text={accountNumber} fontSize={12} lineHeight={18} color="#7c7c7d" />
                <Typo text={`RM ${accountFormattedAmount}`} fontSize={12} lineHeight={18} />
            </View>
            <View style={styles.accountItemImageContainer}>
                {isSelected && (
                    <Image style={styles.tickGreenImage} source={Assets.icRoundedGreenTick} />
                )}
            </View>
        </TouchableOpacity>
    );
};

AccountItem.propTypes = {
    accountName: PropTypes.string.isRequired,
    accountNumber: PropTypes.string.isRequired,
    accountFormattedAmount: PropTypes.string.isRequired,
    isSelected: PropTypes.bool.isRequired,
    onAccountItemPressed: PropTypes.func.isRequired,
    index: PropTypes.number.isRequired,
};
class ESICreation extends React.Component {
    static propTypes = {
        navigation: PropTypes.object.isRequired,
        route: PropTypes.object.isRequired,
        model: PropTypes.object.isRequired,
    };

    state = {
        showScrollPicker: false,
        selectedAccountIndex: 0,
        selectedAccountNumber: "",
        selectedAccountName: "",
        accountListData: [],
        showLoader: true,
        esiDeductionListData: [],
        esiNextDecutionDate: "",
        selectedEsiDeductionObject: {},
        selectedEsiDeductionTitle: "",
        showOTPModal: false,
        otpCode: "",
        mapperData: [],
        reuestedPayloadOtp: {},
        showV4S2u: false,
        isS2UDown: false,
    };

    componentDidMount() {
        if (this.props?.route?.params?.isToggleOn) {
            this._onConfirmButtonPressed();
            return;
        }
        this._syncDataToState();
    }

    _syncDataToState = async () => {
        try {
            const request = await this._requestL3Permission();
            if (!request) this.props.navigation.goBack();

            const [bankingAccountListRequest, esiDeductionScheduleDataRequest] =
                await new Promise.all([
                    this._getBankingAccountList(),
                    this._getEsiDeductionSchedule(),
                ]);
            const accountListData = bankingAccountListRequest.data.result.accountListings;
            const mappedAccountListData = accountListData.map((account) => ({
                accountName: account.name,
                accountNumber: account.number,
                accountFormattedAmount: account.balance,
            }));
            const weeklyEsiObject = esiDeductionScheduleDataRequest.data.result.weekly;
            const weeklyEsiTitle = `Save RM ${weeklyEsiObject.formattedAmount} / weekly`;

            const monthlyEsiObject = esiDeductionScheduleDataRequest.data.result.monthly;
            const monthlyEsiTitle = `Save RM ${monthlyEsiObject.formattedAmount} / month`;
            const nextDeductionUnformattedDate =
                esiDeductionScheduleDataRequest.data.result.nextDeduction;
            const nextDeductionFormattedDate =
                esiDeductionScheduleDataRequest.data.result.formattedNextDeductionDate;

            const updatedMonthlyEsiObject = {
                ...monthlyEsiObject,
                dropDownDisplayString: monthlyEsiTitle,
                nextDeductionUnformattedDate,
                frequency: "M",
                nextDeductionFormattedDate,
            };

            const updatedWeeklyEsiObject = {
                ...weeklyEsiObject,
                dropDownDisplayString: weeklyEsiTitle,
                nextDeductionUnformattedDate,
                frequency: "W",
                nextDeductionFormattedDate,
            };

            this.setState({
                accountListData: mappedAccountListData,
                showLoader: false,
                esiNextDecutionDate:
                    esiDeductionScheduleDataRequest.data.result.formattedNextDeductionDate,
                esiDeductionListData: [
                    {
                        title: monthlyEsiTitle,
                        value: updatedMonthlyEsiObject,
                    },
                    {
                        title: weeklyEsiTitle,
                        value: updatedWeeklyEsiObject,
                    },
                ],
                selectedEsiDeductionObject: updatedMonthlyEsiObject,
                selectedEsiDeductionTitle: monthlyEsiTitle,
                selectedAccountNumber: mappedAccountListData[0].accountNumber,
                selectedAccountName: mappedAccountListData[0].accountName,
            });
        } catch (error) {
            ErrorLogger(error);
            showErrorToast({ message: "Accounts inquiry failed. Please try again later." });
            this.props.navigation.goBack();
        }
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

    _getEsiDeductionSchedule = async () => {
        try {
            const response = await esiPostServiceWrapper(
                `/esi/data?participantId=${
                    this.props?.route?.params?.goalDetailData?.ownerDetails?.participantId ?? ""
                }`
            );
            if (response && response.status === 200) return response;
            return null;
        } catch (error) {
            ErrorLogger(error);
            return null;
        }
    };

    _updateESIStatus = async (esiDetail) => {
        try {
            return await esiPostServiceWrapper(`/esi/create`, esiDetail);
        } catch (error) {
            ErrorLogger(error);
            throw error;
        }
    };

    _getOtpCode = async (otpRequestPayload) => {
        try {
            return await requestOTP(otpRequestPayload);
        } catch (error) {
            ErrorLogger(error);
            throw error;
        }
    };

    _validateOtpCode = async (validateOtpRequestPayload) => {
        try {
            const response = await validateOTP(validateOtpRequestPayload);
            if (response && response.status === 200) return response;
            return null;
        } catch (error) {
            ErrorLogger(error);
            return null;
        }
    };

    _onScrollPickerCancelButtonPressed = () => this.setState({ showScrollPicker: false });

    _onScrollPickerDoneButtonPressed = (value) =>
        this.setState({
            selectedEsiDeductionObject: value,
            selectedEsiDeductionTitle: value.dropDownDisplayString,
            showScrollPicker: false,
        });

    _onHeaderCloseButtonPressed = () => this.props.navigation.goBack();

    doS2uRegistration = (navigate) => {
        // need to change screens.
        const redirect = {
            succStack: TABUNG_MAIN,
            succScreen: TABUNG_DETAILS_SCREEN,
        };
        navigateToS2UReg(navigate, this?.route?.params, redirect);
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
                        showLoader: false,
                        showV4S2u: true,
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

    //S2U V4
    _navigateToAcknowledgementScreen = (response) => {
        const { transactionStatus, executePayload } = response;
        const { isToggleOn } = this.props.route.params;
        this.onS2uV4Close();
        const entryPoint = {
            entryStack: TABUNG_MAIN,
            entryScreen: TABUNG_DETAILS_SCREEN,
            params: {
                refresh: true,
            },
        };
        let ackDetails = {
            executePayload,
            transactionSuccess: transactionStatus,
            entryPoint,
            navigate: this.props.navigation.navigate,
        };
        if (executePayload?.executed) {
            const successMsg = executePayload?.message?.toLowerCase();
            const titleMessage =
                successMsg === SUCC_STATUS
                    ? isToggleOn
                        ? AUTO_DEDUCTION_DISABLE_SUCCESSFUL
                        : AUTO_DEDUCTION_SUCCESSFUL
                    : isToggleOn
                    ? AUTO_DEDUCTION_DISABLED_UNSUCCESSFUL
                    : AUTO_DEDUCTION_UNSUCCESSFUL;
            ackDetails = {
                ...ackDetails,
                titleMessage,
            };
        }
        handleS2UAcknowledgementScreen(ackDetails);
    };

    onS2uV4Close = () => {
        this.setState({ showV4S2u: false });
    };
    onS2uV4Done = (response) => {
        this._navigateToAcknowledgementScreen(response);
    };
    //S2U V4
    s2uSDKInit = async (requestPayload) => {
        const { selectedAccountNumber } = this.state;
        delete requestPayload.otpType;
        requestPayload.goalName = this.props.route.params.goalDetailData.name;
        requestPayload.linkedAcctName = this.state.selectedAccountName;
        requestPayload.linkedAcctNo =
            selectedAccountNumber.length > 14
                ? formateAccountNumber(selectedAccountNumber, 12)
                : selectedAccountNumber;
        return await init(FN_ENABLE_ESI, requestPayload);
    };
    _onConfirmButtonPressed = async () => {
        const {
            model: {
                device: { deviceId },
            },
            route: {
                params: {
                    goalDetailData: { ownerDetails, id, trxRefNo },
                    isToggleOn,
                },
            },
        } = this.props;
        const {
            selectedEsiDeductionObject: {
                lastDeduction,
                amount,
                frequency,
                nextDeductionUnformattedDate,
            },
            selectedAccountNumber,
        } = this.state;
        const requestPayload = {
            lastDeduction,
            frequency,
            amount,
            deviceId,
            esiOn: !isToggleOn,
            nextDeduction: nextDeductionUnformattedDate,
            goalId: id,
            participantId: ownerDetails.participantId,
            txnRefId: trxRefNo,
            fromAcct: selectedAccountNumber.replace(/\s/gi, ""),
            toAcct: ownerDetails.disAccount,
        };
        try {
            //S2U V4
            try {
                const s2uInitResponse = await this.s2uSDKInit(requestPayload);
                if (s2uInitResponse?.message || s2uInitResponse?.statusCode !== 0) {
                    showErrorToast({
                        message: s2uInitResponse.message,
                    });
                } else {
                    if (s2uInitResponse?.actionFlow === SMS_TAC) {
                        //Tac Flow
                        const { model } = this.props;
                        const { isS2uV4ToastFlag } = model.misc;
                        this.setState({ isS2UDown: isS2uV4ToastFlag ?? false });
                        const request = await this._getOtpCode({
                            mobileNo: this.props.model.m2uDetails.m2uPhoneNumber,
                            otpType: "MAYAUSER",
                            transactionType: "GOAL_ESI",
                        });
                        this.setState({
                            showOTPModal: true,
                            showLoader: false,
                            otpCode: request?.data?.result?.otpValue ?? "",
                            reuestedPayloadOtp: requestPayload,
                        });
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
                console.log(error, "ESI Creation");
                s2uSdkLogs(error, "ESI Creation");
            }
        } catch (error) {
            showErrorToast({ message: error.message });
        }
    };

    _onOTPModalDismissed = () => {
        this.setState({
            showOTPModal: false,
            otpCode: "",
        });
        const { isToggleOn } = this.props.route.params;
        if (isToggleOn) {
            this._onHeaderCloseButtonPressed();
        }
    };

    _onOTPResendButtonPressed = async (callBack) => {
        await this._onConfirmButtonPressed();
        callBack();
    };

    _onOTPDoneButtonPressed = async (otpInput) => {
        this.setState({ showLoader: true, showOTPModal: false });
        const REF_ID_TITLE = "Reference ID";
        const DATE_TITLE = "Date & time";
        try {
            // otp: encryptedOtp,
            const encryptedOtp = await encryptData(otpInput);
            const request = await this._updateESIStatus({
                ...this.state.reuestedPayloadOtp,
                otp: encryptedOtp,
            });
            const { isToggleOn } = this.props.route.params;
            this.setState({ showOTPModal: false });
            if (request?.status === 200) {
                this.props.navigation.navigate("TabungMain", {
                    screen: "ESIAcknowledgementScreen",
                    params: {
                        esiSuccessDetail: [
                            { title: REF_ID_TITLE, value: request.data.result.trxRefId },
                            {
                                title: DATE_TITLE,
                                value: request.data.result.createdDate,
                            },
                        ],
                        isEsiEnabled: !isToggleOn,
                        isSuccessful: true,
                    },
                });
            } else {
                this.props.navigation.navigate("TabungMain", {
                    screen: "ESIAcknowledgementScreen",
                    params: {
                        esiSuccessDetail: [
                            {
                                title: REF_ID_TITLE,
                                value: request.data.result.trxRefId,
                            },
                            {
                                title: DATE_TITLE,
                                value: request.data.result.createdDate,
                            },
                        ],
                        errorMessage: request.message,
                        isEsiEnabled: !isToggleOn,
                        isSuccessful: false,
                    },
                });
            }
        } catch (error) {
            const { isToggleOn } = this.props.route.params;
            this.props.navigation.navigate("TabungMain", {
                screen: "ESIAcknowledgementScreen",
                params: {
                    errorMessage: error.message,
                    esiSuccessDetail: [
                        {
                            title: REF_ID_TITLE,
                            value: error?.error?.result?.trxRefId || error?.error?.refId || "N/A",
                        },
                        {
                            title: DATE_TITLE,
                            value:
                                error?.error?.result?.serverDate ||
                                error?.error?.serverDate ||
                                "N/A",
                        },
                    ],
                    isEsiEnabled: !isToggleOn,
                    isSuccessful: false,
                },
            });
        } finally {
            this.setState({ showLoader: false, showOTPModal: false, otpCode: "" });
        }
    };

    _onFrequencyButtonPressed = () => this.setState({ showScrollPicker: true });

    _onTncButtonPressed = () => {
        const params = {
            file: "https://www.maybank2u.com.my/iwov-resources/pdf/upload/maeapp/MAEApp_Terms&Conditions_202009.pdf",
            share: false,
            type: "url",
            title: "Terms & Conditions",
            pdfType: "shareReceipt",
        };

        this.props.navigation.navigate(COMMON_MODULE, {
            screen: PDF_VIEW,
            params: { params },
        });
    };

    _onAccountItemPressed = ({ index, accountNumber, accountName }) =>
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

    _setAccountListingFlatListReference = (ref) => (this.accountListingFlatListReference = ref);

    render() {
        const {
            showScrollPicker,
            accountListData,
            showLoader,
            esiDeductionListData,
            esiNextDecutionDate,
            selectedEsiDeductionTitle,
            selectedEsiDeductionObject: { formattedLastDeductionDate, nextDeductionFormattedDate },
            showOTPModal,
            otpCode,
            mapperData,
            showV4S2u,
        } = this.state;
        const { isToggleOn } = this.props.route.params;
        if (showLoader) return <ScreenLoader showLoader />;
        return (
            <React.Fragment>
                {(!isToggleOn || showV4S2u || showOTPModal) && (
                    <>
                        <ScreenContainer backgroundType="color" showOverlay={showScrollPicker}>
                            <React.Fragment>
                                <ScreenLayout
                                    useSafeArea
                                    paddingHorizontal={0}
                                    paddingBottom={0}
                                    header={
                                        <HeaderLayout
                                            headerCenterElement={
                                                <Typo
                                                    text="Auto Deduction"
                                                    fontSize={16}
                                                    lineHeight={18}
                                                    fontWeight="600"
                                                />
                                            }
                                            headerRightElement={
                                                <HeaderCloseButton
                                                    onPress={this._onHeaderCloseButtonPressed}
                                                />
                                            }
                                        />
                                    }
                                >
                                    <React.Fragment>
                                        <ScrollView
                                            style={styles.container}
                                            contentContainerStyle={styles.contentContainer}
                                            showsVerticalScrollIndicator={false}
                                        >
                                            <View style={styles.detailsContainer}>
                                                <View style={styles.detailsRowContainer}>
                                                    <Typo
                                                        text="Name"
                                                        fontSize={14}
                                                        lineHeight={18}
                                                    />
                                                    <Typo
                                                        text={
                                                            this.props?.route?.params
                                                                ?.goalDetailData?.name ?? ""
                                                        }
                                                        fontSize={14}
                                                        lineHeight={18}
                                                        fontWeight="600"
                                                    />
                                                </View>
                                                <SpaceFiller height={17} />
                                                <View style={styles.detailsRowContainer}>
                                                    <Typo
                                                        text="Target amount "
                                                        fontSize={14}
                                                        lineHeight={18}
                                                    />
                                                    <Typo
                                                        text={
                                                            this.props?.route?.params
                                                                ?.goalDetailData
                                                                ?.formattedTotalAmount ?? ""
                                                        }
                                                        fontSize={14}
                                                        lineHeight={18}
                                                        fontWeight="600"
                                                    />
                                                </View>
                                                <SpaceFiller height={17} />
                                                <View style={styles.detailsRowContainer}>
                                                    <Typo
                                                        text="Next deduction"
                                                        fontSize={14}
                                                        lineHeight={18}
                                                    />
                                                    <Typo
                                                        text={nextDeductionFormattedDate}
                                                        fontSize={14}
                                                        lineHeight={18}
                                                        fontWeight="600"
                                                    />
                                                </View>
                                                <SpaceFiller height={17} />
                                                <View style={styles.detailsRowContainer}>
                                                    <Typo
                                                        text="Last deduction"
                                                        fontSize={14}
                                                        lineHeight={18}
                                                    />
                                                    <Typo
                                                        text={formattedLastDeductionDate}
                                                        fontSize={14}
                                                        lineHeight={18}
                                                        fontWeight="600"
                                                    />
                                                </View>
                                            </View>
                                            <View style={styles.frequencyContainer}>
                                                <Typo
                                                    text="Select frequency"
                                                    fontSize={14}
                                                    lineHeight={18}
                                                />
                                                <SpaceFiller height={16} />
                                                <ActionButton
                                                    fullWidth
                                                    backgroundColor={WHITE}
                                                    borderColor={GREY}
                                                    onPress={this._onFrequencyButtonPressed}
                                                    componentLeft={
                                                        <View
                                                            style={
                                                                styles.dropdownButtonLeftComponentContainer
                                                            }
                                                        >
                                                            <Typo
                                                                text={selectedEsiDeductionTitle}
                                                                fontSize={14}
                                                                fontWeight="600"
                                                                lineHeight={18}
                                                            />
                                                        </View>
                                                    }
                                                    componentRight={
                                                        <Image
                                                            source={Assets.icChevronDown24Black}
                                                            style={styles.chevronDownImage}
                                                        />
                                                    }
                                                />
                                                <SpaceFiller height={24} />
                                                <View style={styles.autoDeductionToggleContainer}>
                                                    <View style={styles.tickImageContainer}>
                                                        <Image
                                                            source={Assets.icTickBlackSmall}
                                                            style={styles.tickImage}
                                                        />
                                                    </View>
                                                    <View
                                                        style={
                                                            styles.autoDeductionToggleTextContainer
                                                        }
                                                    >
                                                        <Typo
                                                            text="Auto Deduction"
                                                            fontSize={14}
                                                            fontWeight="600"
                                                            lineHeight={18}
                                                        />
                                                        <Typo
                                                            text="Never worry about forgetting to save for your goal again. "
                                                            fontSize={14}
                                                            lineHeight={18}
                                                            textAlign="left"
                                                        />
                                                        <Typo
                                                            text={`First deduction will start on ${esiNextDecutionDate}`}
                                                            fontSize={12}
                                                            fontWeight="600"
                                                            lineHeight={18}
                                                            textAlign="left"
                                                        />
                                                        <TouchableOpacity
                                                            onPress={this._onTncButtonPressed}
                                                        >
                                                            <Typo
                                                                text="I agree to the Terms & Conditions"
                                                                style={styles.tncText}
                                                            />
                                                        </TouchableOpacity>
                                                    </View>
                                                </View>
                                            </View>
                                            <View style={styles.accountsSelectionContainer}>
                                                <Typo
                                                    text="Transfer from"
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
                                                contentContainerStyle={
                                                    styles.flatListContentContainer
                                                }
                                                ListFooterComponent={<SpaceFiller width={32} />}
                                                ref={this._setAccountListingFlatListReference}
                                            />
                                        </ScrollView>
                                        <FixedActionContainer>
                                            <ActionButton
                                                fullWidth
                                                onPress={this._onConfirmButtonPressed}
                                                componentCenter={
                                                    <Typo
                                                        text="Confirm"
                                                        fontSize={14}
                                                        fontWeight="600"
                                                        lineHeight={18}
                                                    />
                                                }
                                            />
                                        </FixedActionContainer>
                                    </React.Fragment>
                                </ScreenLayout>
                                {showOTPModal && (
                                    <OtpModal
                                        mobileNumber={maskedMobileNumber(
                                            this.props.model.m2uDetails.m2uPhoneNumber
                                        )}
                                        otpCode={otpCode}
                                        onOtpClosePress={this._onOTPModalDismissed}
                                        onOtpDonePress={this._onOTPDoneButtonPressed}
                                        onResendOtpPress={this._onOTPResendButtonPressed}
                                        isS2UDown={this.state.isS2UDown}
                                    />
                                )}
                                {this.state.showV4S2u && (
                                    <Secure2uAuthenticationModal
                                        token=""
                                        onS2UDone={this.onS2uV4Done}
                                        onS2UClose={this.onS2uV4Close}
                                        s2uPollingData={mapperData}
                                        transactionDetails={mapperData}
                                        secure2uValidateData={mapperData}
                                        s2uEnablement={true}
                                        navigation={this.props.navigation}
                                    />
                                )}
                            </React.Fragment>
                        </ScreenContainer>
                        <ScrollPicker
                            showPicker={showScrollPicker}
                            items={esiDeductionListData}
                            onCancelButtonPressed={this._onScrollPickerCancelButtonPressed}
                            onDoneButtonPressed={this._onScrollPickerDoneButtonPressed}
                        />
                    </>
                )}
            </React.Fragment>
        );
    }
}

const FLEX_START = "flex-start";
const SPACE_AROUND = "space-around";

const styles = StyleSheet.create({
    accountItemContainer: {
        backgroundColor: WHITE,
        borderRadius: 8,
        flexDirection: "row",
        height: 89,
        marginBottom: 12,
        marginRight: 12,
        paddingHorizontal: 20,
        paddingVertical: 12,
        width: 240,
        ...getShadow({}),
    },
    accountItemImageContainer: {
        alignItems: "center",
        justifyContent: "center",
        width: 22,
    },
    accountItemTextContainer: {
        alignItems: FLEX_START,
        flex: 1,
        justifyContent: SPACE_AROUND,
    },
    accountListingCarouselCardGutter: {
        marginBottom: 8,
        marginHorizontal: 6,
    },
    accountsSelectionContainer: {
        alignItems: FLEX_START,
        justifyContent: SPACE_AROUND,
        marginBottom: 12,
        marginLeft: 36,
    },
    autoDeductionToggleContainer: {
        flexDirection: "row",
        justifyContent: FLEX_START,
    },
    autoDeductionToggleTextContainer: {
        alignItems: FLEX_START,
        height: 106,
        justifyContent: SPACE_AROUND,
        marginLeft: 8,
        width: 275,
    },
    chevronDownImage: {
        height: 24,
        marginRight: 24,
        width: 24,
    },
    container: {
        flexGrow: 1,
    },
    contentContainer: {
        alignItems: FLEX_START,
        justifyContent: FLEX_START,
        paddingBottom: 30,
    },
    detailsContainer: {
        marginHorizontal: 36,
        paddingBottom: 24,
    },
    detailsRowContainer: {
        alignItems: "center",
        flexDirection: "row",
        justifyContent: "space-between",
        width: "100%",
    },
    dropdownButtonLeftComponentContainer: {
        alignItems: "center",
        justifyContent: "center",
        marginLeft: 24,
    },
    flatListContentContainer: { paddingLeft: 30 },
    frequencyContainer: {
        alignItems: FLEX_START,
        justifyContent: FLEX_START,
        marginVertical: 24,
        paddingHorizontal: 36,
        width: "100%",
    },
    tickGreenImage: {
        height: 22,
        width: 22,
    },
    tickImage: {
        height: 10,
        width: 10,
    },
    tickImageContainer: {
        alignItems: "center",
        backgroundColor: RADIO_BTN_YELLOW,
        borderColor: WHITE,
        borderRadius: 10,
        borderWidth: 1,
        height: 20,
        justifyContent: "center",
        width: 20,
    },
    tncText: {
        fontFamily: "montserrat",
        fontSize: 12,
        fontStyle: "normal",
        fontWeight: "normal",
        letterSpacing: 0,
        lineHeight: 18,
        textDecorationLine: "underline",
    },
});

export default function ESICreationScreen(props) {
    const model = useModelState();
    return <ESICreation model={model} {...props} />;
}
