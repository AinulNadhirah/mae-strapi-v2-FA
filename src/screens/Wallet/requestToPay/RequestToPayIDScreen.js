import PropTypes from "prop-types";
import React, { Component } from "react";
import {
    View,
    Image,
    StyleSheet,
    Keyboard,
    TouchableOpacity,
    Platform,
    ScrollView,
    KeyboardAvoidingView,
} from "react-native";

import {
    REQUEST_TO_PAY_AMOUNT,
    REQUEST_TO_PAY_ACCOUNT,
    REQUEST_TO_PAY_CONFIRMATION_SCREEN,
    REQUEST_TO_PAY_REFERENCE,
} from "@navigation/navigationConstant";

import HeaderLayout from "@layouts/HeaderLayout";
import ScreenLayout from "@layouts/ScreenLayout";

import ActionButton from "@components/Buttons/ActionButton";
import HeaderBackButton from "@components/Buttons/HeaderBackButton";
import { ScrollPickerView } from "@components/Common";
import { Dropdown } from "@components/Common/DropDownButtonCenter";
import ScreenContainer from "@components/Containers/ScreenContainer";
import FixedActionContainer from "@components/Footers/FixedActionContainer";
import Typography from "@components/Text";
import TextInput from "@components/TextInput";
import { showErrorToast, hideToast } from "@components/Toast";

import { withModelContext } from "@context";

import { duitnowStatusInquiry, loadCountries, getBanksListApi, invokeL3 } from "@services";

import { MEDIUM_GREY, YELLOW, DISABLED, DISABLED_TEXT, BLACK } from "@constants/colors";
import { duitNowPasspostCodeSubUrl, duitnowProxyList } from "@constants/data/DuitNowRPP";
import { MBB_BANK_CODE } from "@constants/fundConstants";
import {
    AMOUNT_ERROR_RTP,
    ENTER_AMOUNT,
    REQUEST_TO_PAY,
    DUITNOW_ID_INQUIRY_FAILED,
    FORWARD_REQUEST_VIA,
    MOBNUM_LBL,
    NRIC_NUMBER,
    ENTER_NRIC_NUMBER,
    PASSPORTID_LBL,
    ENTER_PASSPORT_NUMBER,
    ISSUING_COUNTRY,
    CONTINUE,
    THIRD_PARTY_TRANSFER,
    INSTANT_TRANSFER,
    ID_TYPE,
    RTP_AUTODEBIT,
    REQUEST_VIA,
    DUINTNOW_IMAGE,
} from "@constants/strings";

import { checkFormatNumber } from "@utils/dataModel/rtdHelper";
import {
    formatICNumber,
    formatMobileNumbersNew,
    openNativeContactPicker,
} from "@utils/dataModel/utility";

import images from "@assets";

class IDScreen extends Component {
    static propTypes = {
        navigation: PropTypes.object,
        route: PropTypes.object,
        updateModel: PropTypes.func,
        getModel: PropTypes.func,
    };

    /***
     * constructor
     * props
     */
    constructor(props) {
        super(props);
        // notes: for CASA - validation happen at requestToPayAccount screen. Have error message there

        this.state = {
            idValue: "",
            error: false,
            errorMessage: "",
            proxyTypeDropView: false,
            selectedCountry: null,
            countryView: false,
            selectedIDTypeIndex: 0,
            transferParams: {},
            showLoaderModal: true,
            countryList: [],
            //Dropdown Selection options
            proxyList: duitnowProxyList,
            idLabel: PASSPORTID_LBL,
            idPlaceHolder: ENTER_PASSPORT_NUMBER,
            selectedBank: null,
            mbbBanksList: [],
            bankView: false,
            selectedProxy: duitnowProxyList[0],
            selectedContact: [],
        };

        this.forwardItem = this.props.route.params?.forwardItem;
    }

    /***
     * componentDidMount
     * Update Screen data
     */
    async componentDidMount() {
        const request = await this._requestL3Permission();
        if (!request) this.props.navigation.goBack();

        this.setState({ showLoaderModal: false });
        this._selectDefaultProxy();
        this.loadAllCountries();
        this.getBanksListsApi();

        this.focusSubscription = this.props.navigation.addListener("focus", async () => {
            //
        });
    }

    /***
     * componentWillUnmount
     * Handle Screen UnMount Event
     */
    componentWillUnmount() {
        if (this.focusSubscription && this.blurSubscription) {
            this.focusSubscription();
        }
    }

    _requestL3Permission = async () => {
        try {
            const response = await invokeL3(false);
            if (response && response?.status === 200) return response;
            return null;
        } catch (error) {
            return null;
        }
    };

    /***
     * unselect all proxy
     */
    _unselectAllProxy() {
        const proxyList = this.state.proxyList;
        for (const item in proxyList) {
            proxyList[item].selected = false;
        }
        return proxyList;
    }

    /***
     * _selectDefaultProxy
     * set mobile number value as selected ID value
     */
    _selectDefaultProxy() {
        // if resend

        const { transferParams } = this.props.route.params;
        const { proxyList } = this.state;

        // loop and check proxy type
        const proxyIndex = proxyList.findIndex(
            (item) => transferParams?.senderProxyType === item.code
        );

        const isNRIC = transferParams?.senderProxyType === "OLIC";
        const noProxy = !transferParams?.senderProxyType && transferParams?.senderProxyValue;

        if (isNRIC || noProxy) {
            this._onProxySelectionChange(isNRIC ? 2 : 0, transferParams?.senderProxyValue ?? "");
            return;
        }

        this._onProxySelectionChange(
            proxyIndex >= 0 ? proxyIndex : 0,
            transferParams?.senderProxyValue ?? ""
        );
    }

    _selectDefaultBank = () => {
        const { transferParams } = this.props.route.params;
        // if senderProxyValue have value, meaning we in resend mode, AND when senderProxyType = null, meaning resnd is account proxy
        if (!transferParams?.senderProxyType && transferParams?.senderProxyValue) {
            const { mbbBanksList } = this.state;

            // loop and check swiftCode
            const bankIndex = mbbBanksList.findIndex(
                (item) => transferParams?.swiftCode === item.swiftCode
            );

            if (bankIndex >= 0) {
                this._onBankRightButtonPress({}, bankIndex);
            }
        }
    };

    _selectDefaultCountry = () => {
        const { transferParams } = this.props.route.params;
        // if senderProxyValue have value, meaning we in resend mode, AND when senderProxyType = null, meaning resnd is account proxy
        if (transferParams?.senderProxyType === "PSPT") {
            const { countryList } = this.state;

            // loop and check country code
            const countryIndex = countryList.findIndex(
                (item) => transferParams?.swiftCode === item.desc
            );

            if (countryList >= 0) {
                this._onCountryRightButtonPress({}, countryIndex);
            }
        }
    };

    _onProxySelectionChange = (index, defaultValue = "") => {
        const proxyList = this._unselectAllProxy();
        const selectedProxy = proxyList[index];
        selectedProxy.selected = true;

        this.setState(
            {
                proxyTypeDropView: false,
                idLabel: selectedProxy.idLabel,
                idValue: "",
                selectedIDTypeIndex: index,
                proxyList,
                idPlaceHolder: selectedProxy.idPlaceHolder,
                selectedProxy,
            },
            () => {
                this._onTextChange(defaultValue);
            }
        );
    };

    /***
     * _onTextChange
     * on Text Change formate state
     */
    _onTextChange = (text) => {
        const { selectedProxy } = this.state;
        if (selectedProxy.code === "MBNO") {
            const mobileNumber = formatMobileNumbersNew(text);
            this.setState({
                idValue: mobileNumber,
            });
        } else if (selectedProxy.code === "NRIC") {
            const ic = formatICNumber(text);
            this.setState({
                idValue: ic,
            });
        } else {
            this.setState({ idValue: text });
        }
    };

    _handleProxy = (proxyType) => {
        // check selected country
        if (!this.state.selectedCountry && proxyType === "PSPT") {
            this.setState({
                error: true,
                errorMessage: "Please select an Issuing Country.",
            });
            return;
        }
        this.duitnowIdInquiry();
    };

    _handleCasa = (selectedBank, selectedProxy, amount, reference, paymentDesc) => {
        const { transferParams } = this.props.route.params;
        const transferParamsPrevious = this.state.transferParams;

        const prevData = transferParamsPrevious.prevData;
        const existingParams = {
            accountName: "",
            toAccount: transferParams?.senderProxyValue,
            toAccountCode: selectedBank.aquirerId,
            formattedToAccount: "",
            image: {
                image: "icDuitNowCircle",
                imageName: "icDuitNowCircle",
                imageUrl: "icDuitNowCircle",
                shortName: selectedBank.bankName,
            },
            imageBank: selectedBank.image,
            bankName: selectedBank.bankName,
            amount,
            formattedAmount: amount,
            reference: this?.forwardItem?.reference ?? reference,
            paymentDesc: this?.forwardItem?.paymentDesc ?? paymentDesc,
            bankCode: selectedBank.bankCode,
            toAccountBank: selectedBank.bankName,
            aquirerId: selectedBank.aquirerId,
            swiftCode: selectedBank.swiftCode,
            isSecure2uRegisterFlow: true,
            referenceNumber: "",
            transactionDate: "",
            transactionStartDate: "",
            transactionEndDate: "",
            isRecurringTransfer: false,
            isFutureTransfer: false,
            fromAccount: transferParamsPrevious.fromAccount,
            fromAccountCode: "",
            fromAccountName: "",
            formattedFromAccount: "",
            transferType: null,
            transferSubType: null,
            twoFAType: null,
            mbbbankCode: null,
            routeFrom: transferParamsPrevious.routeFrom,
            endDateInt: 0,
            startDateInt: 0,
            transactionResponseError: "",
            prevData,
            selectedProxy,
        };
        const params =
            selectedBank.bankCode === MBB_BANK_CODE
                ? {
                      ...existingParams,
                      transferFlow: 25,
                      functionsCode: 3,
                      transferTypeName: "Other Account Transfer",
                      transactionMode: "Other Account Transfer",
                      isMaybankTransfer: true,

                      receiptTitle: THIRD_PARTY_TRANSFER,

                      idCode: "CASA",
                  }
                : {
                      ...existingParams,
                      transferFlow: 25,
                      functionsCode: 4,
                      transferTypeName: "Interbank Transfer",
                      transactionMode: "Interbank Transfer",
                      isMaybankTransfer: false,
                      receiptTitle: INSTANT_TRANSFER,
                      idCode: "ACC",
                      idType: "ACC",
                  };

        this.props.navigation.navigate(REQUEST_TO_PAY_ACCOUNT, {
            ...this.props.route.params,
            transferParams: params,
            forwardItem: this.forwardItem,
            screenDate: this.props.route.params?.screenDate,
        });
    };

    /***
     * _OnSubmit
     */
    _OnSubmit = () => {
        const val = this.state?.idValue.replace(/\s/g, "");
        const { selectedBank, selectedProxy } = this.state;
        const valueLength =
            selectedProxy.minLength + this.state.idValue?.split(" ").length - 1 ?? 0;
        // empty or less than min length
        if (val.length < valueLength) {
            this.setState({
                error: true,
                errorMessage: selectedProxy.minErrorMessage,
            });

            return;
        }
        // check max
        if (val.length > selectedProxy.maxLength) {
            this.setState({
                error: true,
                errorMessage: selectedProxy.maxErrorMessage,
            });

            return;
        }
        const { reference, amount, paymentDesc } = this.props.route.params?.transferParams ?? {};
        switch (selectedProxy.code) {
            case "CASA":
                this._handleCasa(
                    selectedBank,
                    selectedProxy,
                    amount ?? "0.00",
                    reference,
                    paymentDesc
                );
                break;
            case "PSPT":
            case "MBNO":
            case "NRIC":
            case "ARMN":
            case "BREG":
                this._handleProxy(selectedProxy.code);
                break;
            default:
                break;
        }
    };

    /***
     * duitnowIdInquiry
     * duitnow Id Inquiry Api call
     */
    duitnowIdInquiry = async () => {
        const { idValue, selectedProxy, selectedCountry } = this.state;
        const { reference, amount, paymentDesc, receiverAcct } =
            this.props.route.params?.transferParams ?? {};

        const idValueInTextView = idValue;
        const idValueClean = this.state.idValue.toString().replace(/\s/g, "");
        const idCode = selectedProxy.code.toString().replace(/\s/g, "");
        const countryCode = selectedProxy.code === "PSPT" ? selectedCountry?.desc ?? "" : "";
        const subUrl =
            "/duitnow/status/inquiry?proxyId=" +
            idValueClean +
            countryCode +
            "&proxyIdType=" +
            idCode +
            "&requestType=RTP";

        const transferParamsPrevious = this.props.route.params?.transferParams ?? {};

        const prevData = transferParamsPrevious.prevData;
        const routeFrom = transferParamsPrevious.routeFrom;

        const response = await duitnowStatusInquiry(subUrl);
        const result = response?.data;
        if (result !== null) {
            const resultData = result?.result;
            if (result?.code === 200) {
                const transferParams = {
                    transferFlow: 25,
                    transferTypeName: "Duit Now",
                    transactionMode: "Duit Now",
                    rtpType: this.props.route.params?.rtpType ?? "",
                    isMaybankTransfer: false,
                    transferRetrievalRefNo: resultData?.retrievalRefNo,
                    transferProxyRefNo: resultData?.proxyRefNo,
                    transferRegRefNo: resultData?.regRefNo,
                    transferAccType: resultData?.accType,
                    transferBankCode: resultData?.bankCode,
                    toAccountCode: resultData?.bankCode,
                    //
                    nameMasked: resultData?.nameMasked,
                    recipientNameMaskedMessage: resultData?.recipientNameMaskedMessage,
                    recipientNameMasked: resultData?.recipientNameMasked,
                    actualAccHolderName: resultData?.actualAccHolderName,
                    accHolderName: resultData?.accHolderName,
                    //
                    accountName: resultData?.accHolderName,
                    transferBankName: resultData?.bankName,
                    transferAccHolderName: resultData?.accHolderName,
                    transferLimitInd: resultData?.limitInd,
                    transferMaybank: resultData?.maybank,
                    transferOtherBank: !resultData?.maybank,
                    transferAccNumber: resultData?.accNo,
                    formattedToAccount: resultData?.accNo,
                    idValueFormatted: idValueInTextView,
                    idValue: idValueClean,
                    idType: idCode,
                    idCode,
                    idTypeText: selectedProxy.name,
                    image: {
                        image: DUINTNOW_IMAGE,
                        imageName: DUINTNOW_IMAGE,
                        imageUrl: DUINTNOW_IMAGE,
                        shortName: resultData?.accHolderName,
                        type: true,
                    },
                    bankName: resultData?.maybank ? "Maybank" : "",
                    imageBase64: true,
                    amount: this?.forwardItem?.amount ?? amount ?? "0.00",
                    formattedAmount: amount ?? "0.00",
                    reference: this?.forwardItem?.reference ?? reference,
                    paymentDesc: this?.forwardItem?.paymentDesc ?? paymentDesc,
                    minAmount: 0.0,
                    maxAmount: 50000.0,
                    amountError: AMOUNT_ERROR_RTP,
                    screenLabel: ENTER_AMOUNT,
                    screenTitle: REQUEST_TO_PAY,
                    toAccount: resultData?.accNo,
                    receiptTitle: REQUEST_TO_PAY,
                    transactionDate: "",
                    isFutureTransfer: false,
                    toAccountBank: resultData?.maybank ? "Maybank" : "",
                    fromAccount: receiverAcct,
                    formattedFromAccount: "",
                    transferType: null,
                    transferSubType: null,
                    twoFAType: null,
                    mbbbankCode: resultData?.bankCode,
                    bankCode: resultData?.bankCode,
                    swiftCode: resultData?.bankCode,
                    endDateInt: 0,
                    startDateInt: 0,
                    selectedIDTypeIndex: this.state.selectedIDTypeIndex,
                    transferFav: false,
                    functionsCode: resultData?.maybank ? 12 : 27,
                    countryCode: selectedCountry?.desc ?? "",
                    routeFrom,
                    prevData,
                };

                this.setState({
                    transferParams,
                });
                hideToast();

                this.props.navigation.navigate(
                    this.props.route.params?.rtpType === RTP_AUTODEBIT
                        ? REQUEST_TO_PAY_REFERENCE
                        : this.forwardItem
                        ? REQUEST_TO_PAY_CONFIRMATION_SCREEN
                        : REQUEST_TO_PAY_AMOUNT,
                    {
                        ...this.props.route.params,
                        transferParams,
                        forwardItem: this.forwardItem,
                        screenDate: this.props.route.params?.screenDate,
                    }
                );
            } else {
                showErrorToast({
                    message: resultData?.statusDesc,
                });
            }
        } else {
            showErrorToast({
                message: DUITNOW_ID_INQUIRY_FAILED,
            });
        }
    };

    /***
     * selectContact
     */
    selectContact = (itemIndex) => {
        // this.setState({ showContactPicker: true });
        openNativeContactPicker()
            .then((result) => {
                if (result.phoneNumber !== null) {
                    const idValueFormatted = checkFormatNumber(result.phoneNumber, true);
                    this.setState({
                        idValue: idValueFormatted,
                    });
                } else {
                    showErrorToast({
                        message: "Invalid contact selected",
                    });
                }
            })
            .catch((error) => {
                this.setState({
                    error: true,
                    errorMessage: error.message,
                });
            });
    };

    /***
     * getBanksListsApi
     * get Banks Lists Api call
     */
    getBanksListsApi = async () => {
        try {
            const { updateModel, getModel } = this.props;
            const banksContext = getModel("rpp")?.banksContext;
            //if banks not in context initiate api call
            if (banksContext?.apiCalled === false) {
                const response = await getBanksListApi();
                if (response?.data?.resultList) {
                    const resultList = response?.data?.resultList.map((o, i) => {
                        return {
                            ...o,
                            name: o?.bankName,
                            shortName: o?.bankName,
                            image: o?.imageName,
                            const: o?.desc,
                            isSelected: o?.selected,
                            type: true,
                            index: i,
                        };
                    });
                    updateModel({
                        rpp: {
                            banksContext: {
                                list: resultList,
                                apiCalled: true,
                            },
                        },
                    });
                    this.setState({ mbbBanksList: resultList }, this._selectDefaultBank);
                }
            } else {
                this.setState({ mbbBanksList: banksContext?.list }, this._selectDefaultBank);
            }
        } catch (ex) {
            if (ex?.message || ex?.error?.message) {
                showErrorToast({
                    message: ex?.message || ex?.error?.message,
                });
            }
        }
    };

    /***
     * loadAllCountries
     * Get countries list for password proxy type
     */
    loadAllCountries = async () => {
        try {
            const { getModel, updateModel } = this.props;
            const countriesContext = getModel("rpp")?.countriesContext;
            //if banks not in context initiate api call
            if (countriesContext?.apiCalled === false) {
                const response = await loadCountries(duitNowPasspostCodeSubUrl);
                if (response?.data?.resultList) {
                    const result = response?.data;
                    const countryList = result?.resultList.map((country, index) => {
                        return {
                            ...country,
                            isSelected: country?.selected,
                            name: country?.type,
                            const: country?.desc,
                            index,
                        };
                    });
                    updateModel({
                        rpp: {
                            countriesContext: {
                                list: countryList,
                                apiCalled: true,
                            },
                        },
                    });
                    this.setState(
                        {
                            countryList,
                        },
                        this._selectDefaultCountry
                    );
                }
            } else {
                this.setState(
                    {
                        countryList: countriesContext?.list,
                    },
                    this._selectDefaultCountry
                );
            }
        } catch (ex) {
            if (ex?.message || ex?.error?.message) {
                showErrorToast({
                    message: ex?.message || ex?.error?.message,
                });
            }
        }
    };

    /***
     * _onProxyTypeRightButtonModePress
     * On Id Type pop up item selected done button click event
     */
    _onProxyTypeRightButtonModePress = (val, index) => {
        this._onProxySelectionChange(index);
    };

    /***
     * _onLeftButtonModePress
     * On Id Type pop up cancel click event close the pop up
     */
    _onProxyTypeLeftButtonModePress = (value, index) => {
        this.setState({
            proxyTypeDropView: false,
        });
    };

    /***
     * _onCountryRightButtonPress
     * On Country pop up select done click event
     */
    _onCountryRightButtonPress = (val, index) => {
        const countryList = this.state.countryList;
        for (const item in countryList) {
            countryList[item].selected = false;
            countryList[item].isSelected = false;
        }
        countryList[index].selected = true;
        countryList[index].isSelected = true;

        this.setState({
            countryView: false,
            selectedCountry: countryList[index],
            error: false,
            // countryCode: val.desc,
            countryList,
        });
    };

    /***
     * _onCountryLeftButtonPress
     * On Country pop up cancel click event close the pop up
     */
    _onCountryLeftButtonPress = (value, index) => {
        this.setState({
            countryView: false,
        });
    };

    /***
     * _onCountryClick
     * On Country dropdown click event open the pop up
     */
    _onCountryClick = () => {
        Keyboard.dismiss();

        if (this.state.countryList.length > 1) {
            this.setState({
                countryView: true,
                proxyTypeDropView: false,
            });
        } else {
            this.setState({
                error: true,
                errorMessage: "Countries not available",
            });
        }
    };

    /***
     * _onCountryRightButtonPress
     * On Bank pop up select done click event
     */
    _onBankRightButtonPress = (val, index) => {
        const mbbBanksList = [...this.state.mbbBanksList];
        for (const item in mbbBanksList) {
            mbbBanksList[item].selected = false;
            mbbBanksList[item].isSelected = false;
        }
        mbbBanksList[index].selected = true;
        mbbBanksList[index].isSelected = true;

        const selectedBank = mbbBanksList[index];

        this.setState({
            bankView: false,
            selectedBank,
            selectedBankIndex: index,
            idValue: selectedBank.name,
            error: false,
            mbbBanksList,
        });
    };

    /***
     * _onBankRightLeftButtonPress
     * On Bank pop up cancel click event close the pop up
     */
    _onBankRightLeftButtonPress = (value, index) => {
        this.setState({
            bankView: false,
        });
    };

    /***
     * _onBankClick
     * On Bank dropdown click event open the pop up
     */
    _onBankClick = () => {
        Keyboard.dismiss();

        if (this.state.countryList.length > 1) {
            this.setState({
                bankView: true,
                proxyTypeDropView: false,
            });
        } else {
            this.setState({
                error: true,
                errorMessage: "Countries not available",
            });
        }
    };

    /***
     * _onShowIDDropdownPress
     * On ID Type dropdown click event open the pop up
     */
    _onShowIDDropdownPress = () => {
        Keyboard.dismiss();
        this.setState({
            proxyTypeDropView: true,
            countryView: false,
            error: false,
        });
    };

    /***
     * _onBackPress
     * On Screen Back press handle
     */
    _onBackPress = () => {
        hideToast();
        this.props.navigation.goBack();
    };

    onContactDone = () => {
        const phoneNumber = checkFormatNumber(this.state.selectedContact[0].phoneNumber);
        this.setState({
            idValue: phoneNumber,
        });
    };

    render() {
        const { showErrorModal, errorMessage, showLoaderModal, selectedProxy } = this.state;
        const valueLength =
            selectedProxy.minLength + this.state.idValue?.split(" ").length - 1 ?? 0;
        const isSubmitDisble =
            selectedProxy.isDisableSubmitBtnOnMin &&
            (this.state.idValue.length < valueLength ||
                (selectedProxy.code === "PSPT" && !this.state.selectedCountry));

        return (
            <ScreenContainer
                backgroundType="color"
                showErrorModal={showErrorModal}
                showLoaderModal={showLoaderModal}
                errorMessage={errorMessage}
                showOverlay={false}
                backgroundColor={MEDIUM_GREY}
                analyticScreenName={"DuitNowRequest_IDType"}
            >
                {!showLoaderModal && (
                    <ScreenLayout
                        header={
                            <HeaderLayout
                                headerCenterElement={
                                    <Typography
                                        fontSize={16}
                                        fontWeight="600"
                                        lineHeight={19}
                                        text={REQUEST_TO_PAY}
                                    />
                                }
                                headerLeftElement={<HeaderBackButton onPress={this._onBackPress} />}
                            />
                        }
                        useSafeArea
                        paddingHorizontal={0}
                        paddingBottom={0}
                    >
                        <KeyboardAvoidingView
                            behavior={Platform.OS === "ios" ? "padding" : ""}
                            style={styles.KeyboardAvoidingViewStyle}
                            keyboardVerticalOffset={150}
                            enabled
                        >
                            <ScrollView style={styles.scrollView}>
                                <View style={styles.container}>
                                    <View style={styles.containerInner}>
                                        <View style={styles.block}>
                                            <View style={styles.descriptionContainerAmount}>
                                                <Typography
                                                    fontSize={14}
                                                    fontWeight="normal"
                                                    fontStyle="normal"
                                                    letterSpacing={0}
                                                    lineHeight={19}
                                                    color={BLACK}
                                                    textAlign="left"
                                                    text={
                                                        this.forwardItem
                                                            ? FORWARD_REQUEST_VIA
                                                            : ID_TYPE
                                                    }
                                                />
                                            </View>

                                            <View style={styles.mt10}>
                                                <Dropdown
                                                    title={selectedProxy.name}
                                                    disable={false}
                                                    align="left"
                                                    borderWidth={0.5}
                                                    testID="txtSELECT_RL"
                                                    accessibilityLabel="txtSELECT_RZ"
                                                    onPress={this._onShowIDDropdownPress}
                                                />
                                            </View>
                                            {selectedProxy.code === "CASA" ? (
                                                <View>
                                                    <View>
                                                        <View
                                                            style={
                                                                styles.descriptionContainerAmount
                                                            }
                                                        >
                                                            <Typography
                                                                fontSize={14}
                                                                fontWeight="normal"
                                                                fontStyle="normal"
                                                                letterSpacing={0}
                                                                lineHeight={19}
                                                                color={BLACK}
                                                                textAlign="left"
                                                                text={REQUEST_VIA}
                                                            />
                                                        </View>
                                                        <View style={styles.contoryContainer}>
                                                            <Dropdown
                                                                title={
                                                                    this.state.selectedBank?.name ??
                                                                    "Please Select"
                                                                }
                                                                disable={false}
                                                                align="left"
                                                                iconType={1}
                                                                textLeft={true}
                                                                testID="txtSELECT_RL"
                                                                accessibilityLabel="txtSELECT_RZ"
                                                                borderWidth={0.5}
                                                                onPress={this._onBankClick}
                                                            />
                                                        </View>
                                                    </View>
                                                </View>
                                            ) : null}
                                            {selectedProxy.code === "MBNO" ? (
                                                <View>
                                                    <View style={styles.descriptionContainerAmount}>
                                                        <Typography
                                                            fontSize={14}
                                                            fontWeight="normal"
                                                            fontStyle="normal"
                                                            letterSpacing={0}
                                                            lineHeight={19}
                                                            color={BLACK}
                                                            textAlign="left"
                                                            text={MOBNUM_LBL}
                                                        />
                                                    </View>

                                                    <View style={styles.mobileNumberView}>
                                                        <View style={styles.mobileNumberView1}>
                                                            <TextInput
                                                                keyboardType={
                                                                    Platform.OS === "ios"
                                                                        ? "number-pad"
                                                                        : "numeric"
                                                                }
                                                                accessibilityLabel="mobileNumber"
                                                                maxLength={
                                                                    selectedProxy.maxLength +
                                                                        this.state.idValue?.split(
                                                                            " "
                                                                        ).length -
                                                                        1 ?? 0
                                                                }
                                                                isValidate={this.state.error}
                                                                errorMessage={
                                                                    this.state.errorMessage
                                                                }
                                                                value={this.state.idValue}
                                                                onChangeText={this._onTextChange}
                                                                editable={true}
                                                                onSubmitEditing={this._OnSubmit}
                                                                returnKeyType="done"
                                                                placeholder="Enter mobile number"
                                                            />
                                                        </View>
                                                        <View style={styles.mobileNumberView2}>
                                                            <TouchableOpacity
                                                                onPress={this.selectContact}
                                                            >
                                                                <Image
                                                                    accessible={true}
                                                                    testID="imgWalNext"
                                                                    accessibilityLabel="imgWalNext"
                                                                    style={
                                                                        styles.mobileNumberSelectView
                                                                    }
                                                                    source={images.icContactList}
                                                                />
                                                            </TouchableOpacity>
                                                        </View>
                                                    </View>
                                                </View>
                                            ) : null}

                                            {selectedProxy.code === "NRIC" && (
                                                <View>
                                                    <View style={styles.descriptionContainerAmount}>
                                                        <Typography
                                                            fontSize={14}
                                                            fontWeight="normal"
                                                            fontStyle="normal"
                                                            letterSpacing={0}
                                                            lineHeight={19}
                                                            color={BLACK}
                                                            textAlign="left"
                                                            text={NRIC_NUMBER}
                                                        />
                                                    </View>

                                                    <View style={styles.mobileNumberView}>
                                                        <TextInput
                                                            placeholder={ENTER_NRIC_NUMBER}
                                                            keyboardType={
                                                                Platform.OS === "ios"
                                                                    ? "number-pad"
                                                                    : "numeric"
                                                            }
                                                            accessibilityLabel="nricNumber"
                                                            maxLength={
                                                                selectedProxy.maxLength +
                                                                    this.state.idValue?.split(" ")
                                                                        .length -
                                                                    1 ?? 0
                                                            }
                                                            isValidate={this.state.error}
                                                            errorMessage={this.state.errorMessage}
                                                            value={this.state.idValue}
                                                            onChangeText={this._onTextChange}
                                                            editable={true}
                                                            onSubmitEditing={this._OnSubmit}
                                                            returnKeyType="done"
                                                        />
                                                    </View>
                                                </View>
                                            )}

                                            {selectedProxy.code === "PSPT" ||
                                            selectedProxy.code === "ARMN" ||
                                            selectedProxy.code === "BREG" ? (
                                                <View>
                                                    <View style={styles.descriptionContainerAmount}>
                                                        <Typography
                                                            fontSize={14}
                                                            fontWeight="normal"
                                                            fontStyle="normal"
                                                            letterSpacing={0}
                                                            lineHeight={19}
                                                            color={BLACK}
                                                            textAlign="left"
                                                            text={this.state.idLabel}
                                                        />
                                                    </View>
                                                    <View style={styles.mobileNumberView}>
                                                        <TextInput
                                                            placeholder={this.state.idPlaceHolder}
                                                            accessibilityLabel="nricNumber"
                                                            maxLength={
                                                                selectedProxy.maxLength +
                                                                    this.state.idValue?.split(" ")
                                                                        .length -
                                                                    1 ?? 0
                                                            }
                                                            isValidate={this.state.error}
                                                            errorMessage={this.state.errorMessage}
                                                            value={this.state.idValue}
                                                            editable={true}
                                                            // ref={(ref) => (this._idReferance = ref)}
                                                            onChangeText={this._onTextChange}
                                                            onSubmitEditing={this._OnSubmit}
                                                            autoFocus={true}
                                                            keyboardType="default"
                                                        />
                                                    </View>
                                                </View>
                                            ) : null}
                                        </View>
                                        {selectedProxy.code === "PSPT" ? (
                                            <View>
                                                <View style={styles.descriptionContainerAmount}>
                                                    <Typography
                                                        fontSize={14}
                                                        fontWeight="normal"
                                                        fontStyle="normal"
                                                        letterSpacing={0}
                                                        lineHeight={19}
                                                        color={BLACK}
                                                        textAlign="left"
                                                        text={ISSUING_COUNTRY}
                                                    />
                                                </View>
                                                <View style={styles.contoryContainer}>
                                                    <Dropdown
                                                        title={
                                                            this.state.selectedCountry?.type ??
                                                            "Select Country"
                                                        }
                                                        disable={false}
                                                        align="left"
                                                        iconType={1}
                                                        textLeft={true}
                                                        testID="txtSELECT_RL"
                                                        accessibilityLabel="txtSELECT_RZ"
                                                        borderWidth={0.5}
                                                        onPress={this._onCountryClick}
                                                    />
                                                </View>
                                            </View>
                                        ) : null}
                                    </View>
                                </View>
                            </ScrollView>
                        </KeyboardAvoidingView>
                        <FixedActionContainer>
                            <ActionButton
                                disabled={isSubmitDisble}
                                fullWidth
                                borderRadius={25}
                                onPress={this._OnSubmit}
                                backgroundColor={isSubmitDisble ? DISABLED : YELLOW}
                                componentCenter={
                                    <Typography
                                        color={isSubmitDisble ? DISABLED_TEXT : BLACK}
                                        text={CONTINUE}
                                        fontSize={14}
                                        fontWeight="600"
                                        lineHeight={18}
                                    />
                                }
                            />
                        </FixedActionContainer>
                    </ScreenLayout>
                )}
                <ScrollPickerView
                    showMenu={this.state.proxyTypeDropView}
                    list={this.state.proxyList}
                    selectedIndex={this.state.selectedIDTypeIndex}
                    onRightButtonPress={this._onProxyTypeRightButtonModePress}
                    onLeftButtonPress={this._onProxyTypeLeftButtonModePress}
                    rightButtonText="Done"
                    leftButtonText="Cancel"
                />
                <ScrollPickerView
                    showMenu={this.state.countryView}
                    list={this.state.countryList}
                    onRightButtonPress={this._onCountryRightButtonPress}
                    onLeftButtonPress={this._onCountryLeftButtonPress}
                    rightButtonText="Done"
                    leftButtonText="Cancel"
                />
                <ScrollPickerView
                    showMenu={this.state.bankView}
                    list={this.state.mbbBanksList}
                    selectedIndex={this.state.selectedBankIndex}
                    onRightButtonPress={this._onBankRightButtonPress}
                    onLeftButtonPress={this._onBankRightLeftButtonPress}
                    rightButtonText="Done"
                    leftButtonText="Cancel"
                />
            </ScreenContainer>
        );
    }
}

const styles = StyleSheet.create({
    KeyboardAvoidingViewStyle: {
        flex: 1,
        flexDirection: "column",
        width: "100%",
    },
    block: { flexDirection: "column" },
    container: { flex: 1, paddingBottom: 5, paddingHorizontal: 36, width: "100%" },
    containerInner: { flex: 1, width: "100%" },
    contoryContainer: {
        alignSelf: "flex-start",
        marginTop: 10,
        paddingBottom: 5,
        width: "100%",
    },
    descriptionContainerAmount: {
        marginTop: 30,
    },
    mobileNumberSelectView: {
        height: 30,
        resizeMode: Platform.OS !== "ios" ? "center" : "contain",
        width: 30,
    },
    mobileNumberView: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginTop: 6,
        width: "100%",
    },
    mobileNumberView1: {
        width: "90%",
    },
    mobileNumberView2: {
        width: "20%",
    },
    mt10: {
        marginTop: 10,
    },
    scrollView: {
        flex: 1,
    },
});

export default withModelContext(IDScreen);
