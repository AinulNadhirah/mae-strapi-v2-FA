import PropTypes from "prop-types";
import React, { Component } from "react";
import { View, Image, StyleSheet, Keyboard, TouchableOpacity, Platform } from "react-native";

import { DUITNOW_ENTER_AMOUNT, TRANSFER_TAB_SCREEN } from "@navigation/navigationConstant";

import HeaderLayout from "@layouts/HeaderLayout";
import ScreenLayout from "@layouts/ScreenLayout";

import ActionButton from "@components/Buttons/ActionButton";
import HeaderBackButton from "@components/Buttons/HeaderBackButton";
import { ScrollPickerView } from "@components/Common";
import { Dropdown } from "@components/Common/DropDownButtonCenter";
import ScreenContainer from "@components/Containers/ScreenContainer";
import Typo from "@components/Text";
import TextInput from "@components/TextInput";
import { showErrorToast, hideToast } from "@components/Toast";

import { duitnowStatusInquiry, loadCountries } from "@services";
import { GATransfer } from "@services/analytics/analyticsTransfer";

import { MEDIUM_GREY, YELLOW, DISABLED, DISABLED_TEXT, BLACK } from "@constants/colors";
import {
    AMOUNT_ERROR_RTP,
    ENTER_AMOUNT,
    DUITNOW,
    DUITNOW_ID_INQUIRY_FAILED,
    ID_TYPE,
    MOBNUM_LBL,
    NRIC_NUMBER,
    ENTER_NRIC_NUMBER,
    PASSPORTID_LBL,
    ARMY_POLICE_ID,
    BUSINESS_REGISTRATION_NUMBER,
    ENTER_PASSPORT_NUMBER,
    ENTER_BUSINESS_REG_NO,
    ISSUING_COUNTRY,
    CONTINUE,
    DUINTNOW_IMAGE,
} from "@constants/strings";

import {
    formatICNumber,
    formatMobileNumbers,
    openNativeContactPicker,
} from "@utils/dataModel/utility";

class DuitNowEnterID extends Component {
    static propTypes = {
        withTouch: PropTypes.bool,
        title: PropTypes.string,
        description: PropTypes.string,
        footer: PropTypes.string,
        mobileNo: PropTypes.string,
        navigation: PropTypes.object.isRequired,
        route: PropTypes.object.isRequired,
    };

    static defaultProps = {
        applyBackspaceTint: true,
        decimal: false,
        size: 0,
        withTouch: true,
    };

    /***
     * constructor
     * props
     */
    constructor(props) {
        super(props);

        this.state = {
            idValue: "",
            error: false,
            errorMessage: "",
            idType: 0,
            idCode: "",
            dropView: false,
            //Default options
            selectedID: "Select ID type",
            selectedCountry: "Select Country",
            countryView: false,
            countryCode: "",
            selectedIDTypeIndex: 0,
            selectedCountryIndex: 0,
            transferParams: {},
            countryList: [],
            //Dropdown Selection options
            dropList: [
                {
                    no: 1,
                    type: MOBNUM_LBL,
                    selected: true,
                    code: "MBNO",
                    name: MOBNUM_LBL,
                    const: "MBNO",
                    isSelected: false,
                    index: 0,
                },
                {
                    no: 2,
                    type: "NRIC Number",
                    selected: false,
                    code: "NRIC",
                    name: "NRIC Number",
                    const: "NRIC",
                    isSelected: false,
                    index: 1,
                },
                {
                    no: 3,
                    type: "Passport Number",
                    selected: false,
                    code: "PSPT",
                    name: "Passport Number",
                    const: "PSPT",
                    isSelected: false,
                    index: 2,
                },
                {
                    no: 4,
                    type: "Army/Police ID",
                    selected: false,
                    code: "ARMN",
                    name: "Army/Police ID",
                    const: "ARMN",
                    isSelected: false,
                    index: 3,
                },
                {
                    no: 5,
                    type: "Business Registration Number",
                    selected: false,
                    code: "BREG",
                    name: "Business Registration Number",
                    const: "BREG",
                    isSelected: false,
                    index: 4,
                },
            ],
            idLabel: PASSPORTID_LBL,
            idPlaceHolder: ENTER_PASSPORT_NUMBER,
        };
    }

    /***
     * componentDidMount
     * Update Screen data
     */
    componentDidMount() {
        GATransfer.viewScreenRecipient(DUITNOW);
        this._preSelectFields();
        this.focusSubscription = this.props.navigation.addListener("focus", async () => {
            this._preSelectFields();
            if (this.state.countryList.length < 1) {
                await this.loadAllCountries();
            }
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

    /***
     * _preselectMobile
     * set mobile number value as selected ID value
     */
    _preselectMobile() {
        try {
            const dropList = this.state.dropList;
            for (const item in dropList) {
                dropList[item].selected = false;
            }
            dropList[0].selected = true;

            const val = { no: 1, type: MOBNUM_LBL, selected: false, code: "MBNO" };
            this.setState({
                dropView: false,
                idType: val.no,
                selectedID: val.type,
                idValue: "",
                idCode: val.code,
                dropList,
            });
        } catch (e) {}
    }

    /***
     * _preSelectFields
     * if any value selected while coming back set as selected
     */
    _preSelectFields() {
        const transferParams = this.props.route.params?.transferParams ?? {};
        if (transferParams && transferParams.idValue && transferParams.idType) {
            const idValue = transferParams.idValue;
            const dropList = this.state.dropList;
            for (const item in dropList) {
                dropList[item].selected = false;
            }
            dropList[transferParams.selectedIDTypeIndex].selected = true;

            const val = dropList[transferParams.selectedIDTypeIndex];
            if (val.code === "MBNO") {
                //Set Mobile Number as selected
                const mobileNumber = idValue.toString().replace("+", "");
                this.setState({
                    dropView: false,
                    idType: val.no,
                    selectedID: val.type,
                    idValue: formatMobileNumbers(mobileNumber.toString()),
                    idCode: val.code,
                    dropList,
                    idLabel: val.name,
                });
            } else if (val.code === "NRIC") {
                //Set NRIC as selected
                const text = idValue;
                this.setState({
                    idType: val.no,
                    selectedID: val.type,
                    idValue: formatICNumber(text.toString()),
                    idCode: val.code,
                    dropList,
                    idLabel: val.name,
                });
            } else {
                //Set Other Types as selected
                this.setState({
                    dropView: false,
                    idType: val.no,
                    selectedID: val.type,
                    idValue: transferParams.idValue,
                    idCode: val.code,
                    dropList,
                    idLabel: val.name,
                });
            }
        } else {
            this._preselectMobile();
        }
    }

    /***
     * formatNumber
     * formate ID Value
     */
    formatNumber = (val) => {
        const first = val.toString().substring(0, 3);
        const second = val
            .toString()
            .substring(3, val.length)
            .replace(/\d{4}(?=.)/g, "$& ");
        return (first + " " + second).toString().trim();
    };

    /***
     * checkFormatNumber
     * check Format Mobile Number Value
     */
    checkFormatNumber(val) {
        try {
            val = val.replace(/\s/g, "");
            val = val.replace(/[{()}]/g, "");
            val = val.replace(/[[\]']+/g, "");
            val = val.replace(/-/g, "");
            val = val.replace(/\*/g, "");
            val = val.replace(/#/g, "");
            val = val.replace(/\D/g, "");
        } catch (e) {}
        const second = val.substring(0, 2);
        let value = "";
        if (second === "60") {
            value = val.substring(1, val.length);
        } else {
            value = val;
        }

        if (value.length > 21) {
            value = value.substring(0, 21);
        }
        return this.formatNumber(value);
    }

    /***
     * _onTextChange
     * on Text Change formate state
     */
    _onTextChange = (text) => {
        if (this.state.idCode === "MBNO") {
            const mobileNumber = formatMobileNumbers(text);
            this.setState({
                idValue: mobileNumber,
            });
        } else if (this.state.idCode === "NRIC") {
            const ic = formatICNumber(text);
            this.setState({
                idValue: ic,
            });
        } else {
            this.setState({ idValue: text });
        }
    };

    /***
     * _onTextDone
     * Handle On Done Key Press from Keyboard
     */
    _onTextDone = () => {
        let val = this.state.idValue;
        val = val.replace(/\s/g, "");
        if (val.length === 0) {
            this.setState({
                error: true,
                errorMessage: "Please enter valid transfer details.",
            });
        } else if (val.length < 5) {
            this.setState({
                error: true,
                errorMessage: "Please input valid transfer details.",
            });
        } else {
            if (this.state.idCode === "MBNO") {
                if (val.length > 20) {
                    this.setState({
                        error: true,
                        errorMessage: "Mobile number cannot be greater than 20.",
                    });
                } else {
                    setTimeout(() => {
                        this.duitnowIdInquiry();
                    }, 200);
                }
            } else if (this.state.idCode === "NRIC") {
                if (val.length !== 12) {
                    this.setState({
                        error: true,
                        errorMessage: "Please input valid transfer details.",
                    });
                } else {
                    this.duitnowIdInquiry();
                }
            } else if (this.state.idCode === "PSPT") {
                if (this.state.selectedCountry === "Select Country") {
                    this.setState({ error: true, errorMessage: "Please select a country." });
                } else {
                    if (val.length > 20) {
                        this.setState({
                            error: true,
                            errorMessage: "Passport number cannot be greater than 20",
                        });
                    } else {
                        this.setState(
                            {
                                idValue: this.state.idValue,
                            },
                            () => {
                                this.duitnowIdInquiry();
                            }
                        );
                    }
                }
            } else if (this.state.idCode === "ARMN") {
                if (val.length > 20) {
                    this.setState({
                        error: true,
                        errorMessage: "Army/Police ID cannot be greater than 20.",
                    });
                } else {
                    this.duitnowIdInquiry();
                }
            } else if (this.state.idCode === "BREG") {
                if (val.length > 20) {
                    this.setState({
                        error: true,
                        errorMessage: "Business Registration number cannot be greater than 20.",
                    });
                } else {
                    this.duitnowIdInquiry();
                }
            }
        }
    };

    /***
     * duitnowIdInquiry
     * duitnow Id Inquiry Api call
     */
    duitnowIdInquiry = async () => {
        const { selectedID, idValue } = this.state;
        const idValueInTextView = idValue;
        const idValueClean = this.state.idValue.toString().replace(/\s/g, "");
        const idCode = this.state.idCode.toString().replace(/\s/g, "");
        const countryCode = this.state.idCode === "PSPT" ? this.state.countryCode : "";
        const subUrl =
            "/duitnow/status/inquiry?proxyId=" +
            idValueClean +
            countryCode +
            "&proxyIdType=" +
            idCode;
        const transferParamsPrevious = this.props.route.params?.transferParams ?? {};

        const prevData = transferParamsPrevious.prevData;
        const routeFrom = transferParamsPrevious.routeFrom;
        const fromAccount = transferParamsPrevious.fromAccount;

        const response = await duitnowStatusInquiry(subUrl);
        const result = response.data;
        if (result != null) {
            const resultData = result.result;

            if (result.code === 200) {
                const transferParamsPrevious = this.state.transferParams;

                const transferParams = {
                    transferFlow: 12,
                    transferTypeName: "Duit Now",
                    transactionMode: "Duit Now",
                    isMaybankTransfer: false,
                    transferRetrievalRefNo: resultData.retrievalRefNo,
                    transferProxyRefNo: resultData.proxyRefNo,
                    transferRegRefNo: resultData.regRefNo,
                    transferAccType: resultData.accType,
                    transferBankCode: resultData.bankCode,
                    toAccountCode: resultData.bankCode,
                    recipientNameMaskedMessage: resultData.recipientNameMaskedMessage,
                    recipientNameMasked: resultData.recipientNameMasked,
                    nameMasked: resultData.nameMasked,
                    serviceFee: resultData.paymentMode?.serviceFee,
                    actualAccHolderName: resultData.actualAccHolderName,
                    accountName: resultData.accHolderName,
                    transferBankName: resultData.bankName,
                    transferAccHolderName: resultData.accHolderName,
                    transferLimitInd: resultData.limitInd,
                    transferMaybank: resultData.maybank,
                    transferOtherBank: !resultData.maybank,
                    transferAccNumber: resultData.accNo,
                    formattedToAccount: resultData.accNo,
                    idValueFormatted: idValueInTextView,
                    idValue: idValueClean,
                    idType: idCode,
                    idCode,
                    idTypeText: selectedID,
                    image: {
                        image: DUINTNOW_IMAGE,
                        imageName: DUINTNOW_IMAGE,
                        imageUrl: DUINTNOW_IMAGE,
                        shortName: resultData.accHolderName,
                        type: true,
                    },
                    bankName: resultData.maybank ? "Maybank" : "",
                    imageBase64: true,
                    amount: "0.00",
                    formattedAmount: "0.00",
                    reference: "",
                    minAmount: 0.0,
                    maxAmount: 50000.0,
                    amountError: AMOUNT_ERROR_RTP,
                    screenLabel: ENTER_AMOUNT,
                    screenTitle: DUITNOW,
                    toAccount: resultData.accNo,
                    receiptTitle: DUITNOW,
                    recipientName: resultData.accHolderName,
                    transactionDate: "",
                    isFutureTransfer: false,
                    toAccountBank: resultData.maybank ? "Maybank" : "",
                    fromAccount,
                    formattedFromAccount: "",
                    transferType: null,
                    transferSubType: null,
                    twoFAType: null,
                    mbbbankCode: resultData.bankCode,
                    endDateInt: 0,
                    startDateInt: 0,
                    selectedIDTypeIndex: this.state.selectedIDTypeIndex,
                    transferFav: false,
                    functionsCode: resultData.maybank ? 12 : 27,
                    countryCode,
                    routeFrom,
                    prevData,
                    activeTabIndex: transferParamsPrevious.activeTabIndex,
                };
                this.setState({
                    transferParams,
                });
                hideToast();
                this.props.navigation.navigate(DUITNOW_ENTER_AMOUNT, {
                    transferParams,
                });
            } else {
                showErrorToast({
                    message: resultData.statusDesc
                        ? resultData.statusDesc
                        : DUITNOW_ID_INQUIRY_FAILED,
                });
            }
        } else {
            showErrorToast({
                message: DUITNOW_ID_INQUIRY_FAILED,
            });
        }
    };

    /***
     * onContactPress
     */
    onContactPress = async () => {
        openNativeContactPicker()
            .then((result) => {
                if (result.phoneNumber != null) {
                    const idValueFormatted = this.checkFormatNumber(result.phoneNumber);
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
     * loadAllCountries
     * Get countries list for password proxy type
     */
    loadAllCountries = async () => {
        const subUrl = "/duitnow/passportcodes";
        let countryList = [];
        const response = loadCountries(subUrl);
        const result = response.data;
        if (result != null) {
            countryList = result.resultList;

            for (let i = 0; i < countryList.length; i++) {
                let valueObj = {};
                let newObj = {};
                valueObj = countryList[i];
                newObj = valueObj;
                newObj.name = valueObj.type;
                newObj.const = valueObj.desc;
                newObj.isSelected = valueObj.selected;
                newObj.index = i;
                countryList[i] = newObj;
            }
        }
        this.setState({
            countryList,
        });
    };

    /***
     * _onRightButtonModePress
     * On Id Type pop up item selected done button click event
     */
    _onRightButtonModePress = (val, index) => {
        const dropList = this.state.dropList;
        for (const item in dropList) {
            dropList[item].selected = false;
        }
        dropList[index].selected = true;

        let idLabel = PASSPORTID_LBL;
        let idPlaceHolder = ENTER_PASSPORT_NUMBER;
        if (val.no === 3) {
            idLabel = PASSPORTID_LBL;
            idPlaceHolder = ENTER_PASSPORT_NUMBER;
        } else if (val.no === 4) {
            idLabel = ARMY_POLICE_ID;
            idPlaceHolder = ARMY_POLICE_ID;
        } else if (val.no === 5) {
            idLabel = BUSINESS_REGISTRATION_NUMBER;
            idPlaceHolder = ENTER_BUSINESS_REG_NO;
        }
        this.setState({
            dropView: false,
            idType: val.no,
            idLabel,
            selectedID: val.type,
            idValue: "",
            idCode: val.code,
            selectedIDTypeIndex: index,
            dropList,
            idPlaceHolder,
        });
    };

    /***
     * _onLeftButtonModePress
     * On Id Type pop up cancel click event close the pop up
     */
    _onLeftButtonModePress = (value, index) => {
        this.setState({
            dropView: false,
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
            selectedCountry: val.type,
            error: false,
            countryCode: val.desc,
            selectedCountryIndex: index,
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
                dropView: false,
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
            dropView: true,
            countryView: false,
            error: false,
        });
    };

    /***
     * _onBackPress
     * On Screen Back press handle
     */
    _onBackPress = () => {
        const transferParams = this.props.route.params?.transferParams ?? {};
        hideToast();
        this.props.navigation.navigate(TRANSFER_TAB_SCREEN, {
            transferParams,
        });
    };

    render() {
        const { showErrorModal, errorMessage } = this.state;
        return (
            <ScreenContainer
                backgroundType="color"
                showErrorModal={showErrorModal}
                errorMessage={errorMessage}
                showOverlay={false}
                backgroundColor={MEDIUM_GREY}
            >
                <ScreenLayout
                    header={
                        <HeaderLayout
                            headerCenterElement={
                                <Typo
                                    fontSize={16}
                                    fontWeight="600"
                                    lineHeight={19}
                                    text={DUITNOW}
                                />
                            }
                            headerLeftElement={<HeaderBackButton onPress={this._onBackPress} />}
                        />
                    }
                    useSafeArea
                    paddingHorizontal={0}
                    paddingBottom={0}
                >
                    <React.Fragment>
                        <View style={styles.container}>
                            <View style={styles.containerInner}>
                                <View style={styles.block}>
                                    <View style={styles.descriptionContainerAmount}>
                                        <Typo
                                            fontSize={14}
                                            fontWeight="normal"
                                            fontStyle="normal"
                                            letterSpacing={0}
                                            lineHeight={19}
                                            color={BLACK}
                                            textAlign="left"
                                            text={ID_TYPE}
                                        />
                                    </View>

                                    <View style={styles.descriptionContainerAmount}>
                                        <Dropdown
                                            title={this.state.selectedID}
                                            disable={false}
                                            align="left"
                                            borderWidth={0.5}
                                            testID="txtSELECT_RL"
                                            accessibilityLabel="txtSELECT_RZ"
                                            onPress={this._onShowIDDropdownPress}
                                        />
                                    </View>
                                    {this.state.idType === 1 ? (
                                        <View>
                                            <View style={styles.descriptionContainerAmount}>
                                                <Typo
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
                                                        maxLength={25}
                                                        isValidate={this.state.error}
                                                        errorMessage={this.state.errorMessage}
                                                        value={this.state.idValue}
                                                        onChangeText={this._onTextChange}
                                                        editable={true}
                                                        onSubmitEditing={this._onTextDone}
                                                        returnKeyType="done"
                                                    />
                                                </View>
                                                <View style={styles.mobileNumberView2}>
                                                    <TouchableOpacity onPress={this.onContactPress}>
                                                        <Image
                                                            accessible={true}
                                                            testID="imgWalNext"
                                                            accessibilityLabel="imgWalNext"
                                                            style={styles.mobileNumberSelectView}
                                                            source={require("@assets/icons/ic_contact_list.png")}
                                                        />
                                                    </TouchableOpacity>
                                                </View>
                                            </View>
                                        </View>
                                    ) : null}

                                    {this.state.idType === 2 && (
                                        <View>
                                            <View style={styles.descriptionContainerAmount}>
                                                <Typo
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
                                                    maxLength={14}
                                                    isValidate={this.state.error}
                                                    errorMessage={this.state.errorMessage}
                                                    value={this.state.idValue}
                                                    onChangeText={this._onTextChange}
                                                    editable={true}
                                                    onSubmitEditing={this._onTextDone}
                                                    returnKeyType="done"
                                                />
                                            </View>
                                        </View>
                                    )}

                                    {this.state.idType === 3 ||
                                    this.state.idType === 4 ||
                                    this.state.idType === 5 ? (
                                        <View>
                                            <View style={styles.descriptionContainerAmount}>
                                                <Typo
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
                                                    maxLength={25}
                                                    isValidate={this.state.error}
                                                    errorMessage={this.state.errorMessage}
                                                    value={this.state.idValue}
                                                    editable={true}
                                                    ref={(ref) => (this._idReferance = ref)}
                                                    onChangeText={this._onTextChange}
                                                    onSubmitEditing={this._onTextDone}
                                                    autoFocus={true}
                                                    keyboardType="default"
                                                />
                                            </View>
                                        </View>
                                    ) : null}
                                </View>
                                {this.state.idType === 3 ? (
                                    <View>
                                        <View style={styles.descriptionContainerAmount}>
                                            <Typo
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
                                                title={this.state.selectedCountry}
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

                        <View style={styles.footerButton}>
                            <ActionButton
                                disabled={this.state.idValue.length < 1}
                                fullWidth
                                borderRadius={25}
                                onPress={this._onTextDone}
                                backgroundColor={this.state.idValue.length < 1 ? DISABLED : YELLOW}
                                componentCenter={
                                    <Typo
                                        color={
                                            this.state.idValue.length < 1 ? DISABLED_TEXT : BLACK
                                        }
                                        text={CONTINUE}
                                        fontSize={14}
                                        fontWeight="600"
                                        lineHeight={18}
                                    />
                                }
                            />
                        </View>

                        <ScrollPickerView
                            showMenu={this.state.dropView}
                            list={this.state.dropList}
                            selectedIndex={this.state.selectedIDTypeIndex}
                            onRightButtonPress={this._onRightButtonModePress}
                            onLeftButtonPress={this._onLeftButtonModePress}
                            rightButtonText="Done"
                            leftButtonText="Cancel"
                        />
                        <ScrollPickerView
                            showMenu={this.state.countryView}
                            list={this.state.countryList}
                            selectedIndex={this.state.selectedCountryIndex}
                            onRightButtonPress={this._onCountryRightButtonPress}
                            onLeftButtonPress={this._onCountryLeftButtonPress}
                            rightButtonText="Done"
                            leftButtonText="Cancel"
                        />
                    </React.Fragment>
                </ScreenLayout>
            </ScreenContainer>
        );
    }
}

const styles = StyleSheet.create({
    block: { flexDirection: "column" },
    container: { flex: 1, paddingHorizontal: 36, width: "100%" },
    containerInner: { flex: 1, width: "100%" },
    contoryContainer: {
        width: "100%",
        marginTop: 10,
        alignSelf: "flex-start",
    },
    descriptionContainerAmount: {
        marginTop: 26,
    },
    footerButton: { marginBottom: 36, paddingHorizontal: 36, width: "100%" },

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
});

export default DuitNowEnterID;
