import PropTypes from "prop-types";
import React, { Component } from "react";
import {
    View,
    ScrollView,
    StyleSheet,
    Platform,
    TextInput,
    TouchableOpacity,
    KeyboardAvoidingView,
    FlatList,
} from "react-native";

import { DASHBOARD_STACK } from "@navigation/navigationConstant";

import HeaderLayout from "@layouts/HeaderLayout";
import ScreenLayout from "@layouts/ScreenLayout";

import ActionButton from "@components/Buttons/ActionButton";
import HeaderBackButton from "@components/Buttons/HeaderBackButton";
import { CircularLogoImage } from "@components/Common";
import ScreenContainer from "@components/Containers/ScreenContainer";
import FixedActionContainer from "@components/Footers/FixedActionContainer";
import TabungAccountDetailList from "@components/Others/TabungAccountDetailList";
import Typography from "@components/Text";
import { errorToastProp, showErrorToast } from "@components/Toast";

import { bankingGetDataMayaM2u, invokeL3 } from "@services";
import ApiManager from "@services/ApiManager";

import { TOKEN_TYPE_M2U, METHOD_POST, TIMEOUT } from "@constants/api";
import { BLACK, FADE_GREY, GREY, MEDIUM_GREY, ROYAL_BLUE, YELLOW } from "@constants/colors";
import { BAKONG_ENDPOINT } from "@constants/url";

import { formateAccountNumber, formatBakongMobileNumbers } from "@utils/dataModel/utility";
import { ErrorLogger } from "@utils/logs";

class BakongSummary extends Component {
    static propTypes = {
        navigation: PropTypes.object.isRequired,
        route: PropTypes.object.isRequired,
    };

    /***
     * constructor
     * props
     */
    constructor(props) {
        super(props);
        this.state = {
            loader: true,
            screenData: {
                image: "",
                name: "",
                description1: "",
                description2: "",
            },
            error: false,
            errorMessage: "",
            transferParams: {},

            // accounts data
            accountList: [],
            fromAccount: "",

            // form data
            paymentDetailsText: null,
        };
        this.paymentDetailsTextInputRef = null;
    }

    /***
     * componentDidMount
     */
    async componentDidMount() {
        console.log("[BakongSummary] >> [componentDidMount] : ");

        this.focusSubscription = this.props.navigation.addListener("focus", () => {
            console.log("[BakongSummary] >> [componentDidMount] focusSubscription : ");
            this.updateData();
            this._fetchUserAccountsList();
        });
        this.paymentDetailsTextInputRef.setNativeProps({
            style: {
                fontFamily: "Montserrat-Bold",
                fontWeight: "normal",
            },
        });
    }

    /***
     * componentWillUnmount
     * Handle Screen UnMount Event
     */
    componentWillUnmount() {
        console.log("[BakongSummary] >> [componentWillUnmount] : ");
        this.focusSubscription();
    }

    /***
     * updateData
     * Update Screen Data upon screen focused
     */
    async updateData() {
        const transferParams = this.props.route.params.transferParams;
        console.log("[BakongSummary] >> [updateData] transferParams==> ", transferParams);

        // Passport/ID number masking
        const { recipientIdNumber } = transferParams;
        // var first4 = cardnumber.substring(0, 4);
        const last4 = recipientIdNumber.substring(recipientIdNumber.length - 4);
        const mask = recipientIdNumber
            .substring(0, recipientIdNumber.length - 4)
            .replace(/./g, "*");
        const maskedIdNo = mask + last4;

        const screenData = {
            image: transferParams.image,
            name: "+855 " + formatBakongMobileNumbers(transferParams.mobileNo),
            description1: transferParams.name,
            description2: transferParams.transactionTo,
        };
        console.log("[BakongSummary] >> [updateData] screenData ==> ", screenData);

        this.setState({
            transferParams: { ...transferParams, recipientIdNumberMasked: maskedIdNo },
            screenData: screenData,
        });
    }

    _requestL3Permission = async () => {
        try {
            const response = await invokeL3(false);
            console.log("[BakongSummary][_requestL3Permission] response: ", response);
            if (response && response.status === 200) return response;
            return null;
        } catch (error) {
            ErrorLogger(error);
            return null;
        }
    };

    _fetchUserAccountsList = async () => {
        const request = await this._requestL3Permission();
        if (!request) {
            this.props.navigation.goBack();
            return;
        }

        const subUrl = "/summary";
        const params = "?type=A";

        bankingGetDataMayaM2u(subUrl + params, true)
            .then((response) => {
                const result = response.data.result;
                console.log(
                    "[Summary][_fetchUserAccountsList] /summary with param: " + params + " ==> "
                );
                if (result != null) {
                    console.log(result);
                    let newAccountList = [];

                    result.accountListings.map((account) => {
                        account.title = account.name;
                        account.name =
                            account.name + "\n" + formateAccountNumber(account.number, 12);

                        if (
                            !(
                                account.type === "D" &&
                                (account.group === "0YD" || account.group === "CCD")
                            )
                        )
                            newAccountList.push(account);
                    });

                    console.log("[Summary][_fetchUserAccountList] newAccountList:", newAccountList);
                    this.setState({ accountList: newAccountList, loader: false }, () => {
                        this.setAccountSelected();
                    });
                } else {
                    console.log("[Summary][_fetchUserAccountList] No results!");
                    this.props.navigation.goBack();
                }
            })
            .catch((Error) => {
                console.log("[Summary][_fetchUserAccountList] ERROR: ", Error);
                this.props.navigation.goBack();
            });
    };

    _getConvertedAmount = async (data, indicative) => {
        try {
            return await ApiManager.service({
                url: `${BAKONG_ENDPOINT}/payment/currencyAmountInquiry${
                    indicative ? "?status=RFQ_1" : "?status=RFQ_2"
                }`,
                data,
                reqType: METHOD_POST,
                tokenType: TOKEN_TYPE_M2U,
                timeout: TIMEOUT,
                promptError: false,
                showPreloader: true,
            });
        } catch (error) {
            showErrorToast(
                errorToastProp({
                    message: error.message ?? "Unable to add new categories. Please try again.",
                })
            );
            ErrorLogger(error);
            throw error;
        }
    };

    _callRfqOne = async () => {
        try {
            this._callRfqTwo();
        } catch (error) {
            showErrorToast(
                errorToastProp({
                    message:
                        error.message ??
                        "Unable to get indicative conversion rate. Please try again.",
                })
            );
            ErrorLogger(error);
            throw error;
        }
    };

    _callRfqTwo = async () => {
        try {
            const { paymentDetailsText, transferParams, transferData } = this.state;
            console.log("[BakongSummary][_callRfqTwo] transferParams: ", transferParams);
            // console.log("[BakongSummary][_callRfqTwo] transferData: ", transferData);
            const params = {
                currency: transferParams.amountCurrency,
                transferAmount: transferParams.amountValue,
                fromAccount: transferData.fromAccountNo,
                fromAccountType: transferData.fromAccountType,
                fromAccountCode: transferData.fromAccountCode,
                purposeCode: transferParams.subpurposeCode ?? "",
                bopCode: transferParams.subpurposeBopCode ?? "",
                mbbCode: transferParams.subpurposeMbbCode ?? "",
                applicantName: transferParams.name,
                customerName: transferParams.name,
            };
            // console.log("[BakongSummary][_callRfqTwo] params: ", params);
            const response = await this._getConvertedAmount(params, false);
            const { data } = response;
            console.log("[BakongSummary][_callRfqTwo] data: ", data);
            const { allinRate, contraAmount } = data;

            // update transferParams data
            const paymentDetailsTextTrimmed = paymentDetailsText ? paymentDetailsText.trim() : "";
            this.setState(
                {
                    transferParams: {
                        ...transferParams,
                        paymentDetails: paymentDetailsTextTrimmed,
                        fromAccountData: transferData,
                        allinRate,
                        contraAmount,
                    },
                },
                () => {
                    console.log(
                        "[BakongSummary][doneClick] transferParams ==> ",
                        this.state.transferParams
                    );
                    this.props.navigation.navigate("BakongConfirmation", {
                        transferParams: this.state.transferParams,
                    });
                }
            );
        } catch (error) {
            showErrorToast(
                errorToastProp({
                    message:
                        error.message ?? "Unable to get final conversion rate. Please try again.",
                })
            );
            ErrorLogger(error);
            throw error;
        }
    };

    doneClick = async () => {
        console.log("[BakongSummary] >> [doneClick] : ");
        this.setState({ showLoader: true });

        // Call RFQ1 for conversion rate based on selected account
        this._callRfqOne();
    };

    _onBackPress = () => {
        console.log("[BakongSummary] >> [_onBackPress] : ");
        // this.props.navigation.goBack();
        const { transferParams } = this.state;
        this.props.navigation.navigate("BakongEnterPurpose", {
            transferParams: { ...transferParams },
        });
    };

    /***
     * _onPaymentDetailsTextChange
     * Notes / Payment Details text change listener
     */
    _onPaymentDetailsTextChange = (text) =>
        this.setState({ paymentDetailsText: text ? text : null });

    /***
     *_onPaymentDetailsTextDone
     * Notes / Payment Details keyboard Done click listener
     */
    _onPaymentDetailsTextDone = () => {
        // if (text != null && text != undefined && text != "" && text.length >= 1) {
        //     let validate = getDayDateFormat(text);
        //     if (!validate) {
        //         this.setState({ paymentDetailsTextError: true });
        //     }
        // }
    };

    _navigateToExternalUrlScreen = ({ url, title }) => {
        this.props.navigation.navigate(DASHBOARD_STACK, {
            screen: "ExternalUrl",
            params: {
                url,
                title,
            },
        });
    };

    _onPressTncLink = () =>
        this._navigateToExternalUrlScreen({
            title: "Terms & Conditions",
            url: "https://www.maybank2u.com.my/iwov-resources/pdf/personal/services/funds_transfer/mbb-bakong-transfer_tnc.pdf",
        });

    _onPressFeaLink = () =>
        this._navigateToExternalUrlScreen({
            url: "https://www.bnm.gov.my/fep",
            title: "FEA Requirement",
        });

    setAccountSelected = () => {
        const { accountList, transferData, transferParams } = this.state;
        const { fromAccountData } = transferParams;

        let tempTransferData = { ...transferData };
        let tempArray = accountList;
        let tempAccount = "";
        let selectedAccountObj = "";
        let nonSelectedAccounts = [];
        let targetSelectedAccounts = [];

        for (let j = 0; j < tempArray.length; j++) {
            if (
                (!fromAccountData && j === 0) ||
                (fromAccountData && tempArray[j].number === fromAccountData.fromAccountNo)
            ) {
                tempArray[j].selected = true;
                selectedAccountObj = tempArray[j];
                tempAccount = selectedAccountObj.description;

                tempTransferData.fromAccountNo = selectedAccountObj.number;
                tempTransferData.fromAccountCode = selectedAccountObj.code;
                tempTransferData.fromAccountName = selectedAccountObj.title;
                tempTransferData.fromAccountType = selectedAccountObj.type;

                this.setState({ transferData: tempTransferData });
            } else {
                tempArray[j].selected = false;
                nonSelectedAccounts.push(tempArray[j]);
            }
        }

        //Set Selected Account in Account List add it First to Account list
        if (selectedAccountObj != null && selectedAccountObj != "") {
            targetSelectedAccounts.push(selectedAccountObj);
        }
        targetSelectedAccounts.push(...nonSelectedAccounts);

        this.setState({ accountList: targetSelectedAccounts, fromAccount: tempAccount });
    };

    _onAccountListClick = (item) => {
        const { accountList } = this.state;

        let tempArray = accountList;
        for (let i = 0; i < tempArray.length; i++) {
            tempArray[i].id = i;
            if (tempArray[i].number === item.number) {
                tempArray[i].selected = true;
            } else {
                tempArray[i].selected = false;
            }
        }

        console.tron.log("[_onAccountListClick] item", item);
        this.setState(
            {
                transferData: {
                    fromAccountNo: item.number,
                    fromAccountCode: item.code,
                    fromAccountName: item.title,
                    fromAccountType: item.type,
                },
                accountList: tempArray,
                fromAccount: item.number,
            },
            () =>
                console.log(
                    "[BakongSummary][_onAccountListClick] transferData: ",
                    this.state.transferData
                )
        );
    };

    _onPressAmount = () => {
        const { transferParams } = this.state;

        this.props.navigation.navigate("BakongEnterAmount", {
            transferParams: { ...transferParams },
            confirmation: true,
        });
    };

    _onPressRecipientRef = () => {
        const { transferParams } = this.state;

        this.props.navigation.navigate("BakongEnterPurpose", {
            transferParams: { ...transferParams },
            confirmation: true,
        });
    };

    _setPaymentDetailsTextInputRef = (ref) => (this.paymentDetailsTextInputRef = ref);

    render() {
        const { showErrorModal, errorMessage, loader, transferParams } = this.state;

        return (
            <React.Fragment>
                <ScreenContainer
                    backgroundType="color"
                    showErrorModal={showErrorModal}
                    errorMessage={errorMessage}
                    showLoaderModal={loader}
                    // showOverlay={}
                    backgroundColor={MEDIUM_GREY}
                >
                    <ScreenLayout
                        header={
                            <HeaderLayout
                                headerCenterElement={
                                    <Typography
                                        fontSize={16}
                                        fontWeight="600"
                                        lineHeight={19}
                                        text="Summary"
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
                            <KeyboardAvoidingView
                                style={{ flex: 1 }}
                                behavior={Platform.OS === "ios" ? "position" : "padding"}
                            >
                                <ScrollView showsHorizontalScrollIndicator={false}>
                                    <View style={Styles.container}>
                                        <View style={Styles.headerContainer}>
                                            <View style={Styles.headerImageContainer}>
                                                <CircularLogoImage
                                                    source={this.state.screenData.image}
                                                    isLocal={false}
                                                />
                                            </View>
                                            {/* <AccountDetailsView
                                            data={this.state.screenData}
                                            base64={true}
                                        /> */}
                                            <Typography
                                                fontSize={14}
                                                fontWeight="600"
                                                fontStyle="normal"
                                                letterSpacing={0}
                                                lineHeight={18}
                                                color={BLACK}
                                                text={this.state.screenData.description1}
                                            />

                                            <Typography
                                                fontSize={14}
                                                fontWeight="normal"
                                                fontStyle="normal"
                                                letterSpacing={0}
                                                lineHeight={20}
                                                color={BLACK}
                                                text={this.state.screenData.name}
                                                style={Styles.lblSubTitle}
                                            />

                                            <TouchableOpacity onPress={this._onPressAmount}>
                                                <Typography
                                                    fontSize={24}
                                                    fontWeight="700"
                                                    fontStyle="normal"
                                                    letterSpacing={0}
                                                    lineHeight={31}
                                                    color={ROYAL_BLUE}
                                                    text={`${
                                                        transferParams.amountCurrency === "MYR"
                                                            ? "RM"
                                                            : transferParams.amountCurrency
                                                    } ${transferParams.amountValue}`}
                                                />

                                                {/* <Typography
                                                    fontSize={14}
                                                    fontWeight="normal"
                                                    fontStyle="normal"
                                                    letterSpacing={0}
                                                    lineHeight={18}
                                                    color={ROYAL_BLUE}
                                                    text={"USD 20.00"}
                                                    style={Styles.lblForeignCurrency}
                                                /> */}
                                            </TouchableOpacity>

                                            {/* <Typography
                                                fontSize={14}
                                                fontWeight="normal"
                                                fontStyle="normal"
                                                letterSpacing={0}
                                                lineHeight={18}
                                                color={BLACK}
                                                text={"4.00 MYR = 1 USD"}
                                                style={Styles.lblForeignCurrency}
                                            /> */}
                                        </View>

                                        <View style={Styles.formBodyContainer}>
                                            {/* Date */}
                                            <View style={Styles.rowListContainer}>
                                                <View style={Styles.rowListItemLeftContainer}>
                                                    <Typography
                                                        fontSize={14}
                                                        lineHeight={19}
                                                        textAlign="left"
                                                        text="Date"
                                                    />
                                                </View>
                                                <View style={Styles.rowListItemRightContainer}>
                                                    <Typography
                                                        fontSize={14}
                                                        fontWeight="600"
                                                        lineHeight={18}
                                                        textAlign="right"
                                                        text="Today"
                                                    />
                                                </View>
                                            </View>

                                            {/* Transfer mode */}
                                            <View style={Styles.rowListContainer}>
                                                <View style={Styles.rowListItemLeftContainer}>
                                                    <Typography
                                                        fontSize={14}
                                                        lineHeight={19}
                                                        textAlign="left"
                                                        text="Transfer mode"
                                                    />
                                                </View>
                                                <View style={Styles.rowListItemRightContainer}>
                                                    <Typography
                                                        fontSize={14}
                                                        fontWeight="600"
                                                        lineHeight={18}
                                                        textAlign="right"
                                                        text="Bakong Transfer"
                                                    />
                                                </View>
                                            </View>

                                            {/* Service fee */}
                                            <View style={Styles.rowListContainer}>
                                                <View style={Styles.rowListItemLeftContainer}>
                                                    <Typography
                                                        fontSize={14}
                                                        lineHeight={19}
                                                        textAlign="left"
                                                        text="Service fee"
                                                    />
                                                </View>
                                                <View style={Styles.rowListItemRightContainer}>
                                                    <Typography
                                                        fontSize={14}
                                                        fontWeight="600"
                                                        lineHeight={18}
                                                        textAlign="right"
                                                        text={`RM ${transferParams.serviceCharge}`}
                                                    />
                                                </View>
                                            </View>

                                            {/* Mobile no. */}
                                            <View style={Styles.rowListContainer}>
                                                <View style={Styles.rowListItemLeftContainer}>
                                                    <Typography
                                                        fontSize={14}
                                                        lineHeight={19}
                                                        textAlign="left"
                                                        text="Mobile number"
                                                    />
                                                </View>
                                                <View style={Styles.rowListItemRightContainer}>
                                                    <Typography
                                                        fontSize={14}
                                                        fontWeight="600"
                                                        lineHeight={18}
                                                        textAlign="right"
                                                        text={this.state.screenData.name}
                                                    />
                                                </View>
                                            </View>

                                            {/* Receiving bank name */}
                                            <View style={Styles.rowListContainer}>
                                                <View style={Styles.rowListItemLeftContainer}>
                                                    <Typography
                                                        fontSize={14}
                                                        lineHeight={19}
                                                        textAlign="left"
                                                        text="Receiving Bank Name"
                                                    />
                                                </View>
                                                <View style={Styles.rowListItemRightContainer}>
                                                    <Typography
                                                        fontSize={14}
                                                        fontWeight="600"
                                                        lineHeight={18}
                                                        textAlign="right"
                                                        text={
                                                            this.state.transferParams.inquiryData
                                                                ?.bankName ?? "Bakong Wallet"
                                                        }
                                                    />
                                                </View>
                                            </View>

                                            {/* Nationality */}
                                            <View style={Styles.rowListContainer}>
                                                <View style={Styles.rowListItemLeftContainer}>
                                                    <Typography
                                                        fontSize={14}
                                                        lineHeight={19}
                                                        textAlign="left"
                                                        text="Nationality"
                                                    />
                                                </View>
                                                <View style={Styles.rowListItemRightContainer}>
                                                    <Typography
                                                        fontSize={14}
                                                        fontWeight="600"
                                                        lineHeight={18}
                                                        textAlign="right"
                                                        text={
                                                            this.state.transferParams
                                                                .recipientNationality
                                                        }
                                                    />
                                                </View>
                                            </View>

                                            {/* ID Type */}
                                            <View style={Styles.rowListContainer}>
                                                <View style={Styles.rowListItemLeftContainer}>
                                                    <Typography
                                                        fontSize={14}
                                                        lineHeight={19}
                                                        textAlign="left"
                                                        text="ID Type"
                                                    />
                                                </View>
                                                <View style={Styles.rowListItemRightContainer}>
                                                    <Typography
                                                        fontSize={14}
                                                        fontWeight="600"
                                                        lineHeight={18}
                                                        textAlign="right"
                                                        text={
                                                            this.state.transferParams
                                                                .recipientIdType === "NID"
                                                                ? "National ID"
                                                                : "Passport"
                                                        }
                                                    />
                                                </View>
                                            </View>

                                            {/* Passport / National ID */}
                                            <View style={Styles.rowListContainer}>
                                                <View style={Styles.rowListItemLeftContainer}>
                                                    <Typography
                                                        fontSize={14}
                                                        lineHeight={19}
                                                        textAlign="left"
                                                        text={
                                                            this.state.transferParams
                                                                .recipientIdType === "NID"
                                                                ? "National ID"
                                                                : "Passport"
                                                        }
                                                    />
                                                </View>
                                                <View style={Styles.rowListItemRightContainer}>
                                                    <Typography
                                                        fontSize={14}
                                                        fontWeight="600"
                                                        lineHeight={18}
                                                        textAlign="right"
                                                        text={
                                                            this.state.transferParams
                                                                .recipientIdNumberMasked
                                                        }
                                                    />
                                                </View>
                                            </View>

                                            {/* Address line 1 */}
                                            <View style={Styles.rowListContainer}>
                                                <View style={Styles.rowListItemLeftContainer}>
                                                    <Typography
                                                        fontSize={14}
                                                        lineHeight={19}
                                                        textAlign="left"
                                                        text="Address line 1"
                                                    />
                                                </View>
                                                <View style={Styles.rowListItemRightContainer}>
                                                    <Typography
                                                        fontSize={14}
                                                        fontWeight="600"
                                                        lineHeight={18}
                                                        textAlign="right"
                                                        text={
                                                            this.state.transferParams.addressLine1
                                                        }
                                                    />
                                                </View>
                                            </View>

                                            {/* Address line 2 */}
                                            <View style={Styles.rowListContainer}>
                                                <View style={Styles.rowListItemLeftContainer}>
                                                    <Typography
                                                        fontSize={14}
                                                        lineHeight={19}
                                                        textAlign="left"
                                                        text="Address line 2"
                                                    />
                                                </View>
                                                <View style={Styles.rowListItemRightContainer}>
                                                    <Typography
                                                        fontSize={14}
                                                        fontWeight="600"
                                                        lineHeight={18}
                                                        textAlign="right"
                                                        text={
                                                            this.state.transferParams.addressLine2
                                                        }
                                                    />
                                                </View>
                                            </View>

                                            {/* Country */}
                                            <View style={Styles.rowListContainer}>
                                                <View style={Styles.rowListItemLeftContainer}>
                                                    <Typography
                                                        fontSize={14}
                                                        lineHeight={19}
                                                        textAlign="left"
                                                        text="Country"
                                                    />
                                                </View>
                                                <View style={Styles.rowListItemRightContainer}>
                                                    <Typography
                                                        fontSize={14}
                                                        fontWeight="600"
                                                        lineHeight={18}
                                                        textAlign="right"
                                                        text={
                                                            this.state.transferParams.addressCountry
                                                        }
                                                    />
                                                </View>
                                            </View>

                                            {/* Purpose */}
                                            <View style={Styles.rowListContainer}>
                                                <View style={Styles.rowListItemLeftContainer}>
                                                    <Typography
                                                        fontSize={14}
                                                        lineHeight={19}
                                                        textAlign="left"
                                                        text="Purpose"
                                                    />
                                                </View>
                                                <View style={Styles.rowListItemRightContainer}>
                                                    <Typography
                                                        fontSize={14}
                                                        fontWeight="600"
                                                        lineHeight={18}
                                                        textAlign="right"
                                                        text={this.state.transferParams.purpose}
                                                    />
                                                </View>
                                            </View>

                                            {/* Sub Purpose */}
                                            <View style={Styles.rowListContainer}>
                                                <View style={Styles.rowListItemLeftContainer}>
                                                    <Typography
                                                        fontSize={14}
                                                        lineHeight={19}
                                                        textAlign="left"
                                                        text="Sub purpose"
                                                    />
                                                </View>
                                                <View style={Styles.rowListItemRightContainer}>
                                                    <Typography
                                                        fontSize={14}
                                                        fontWeight="600"
                                                        lineHeight={18}
                                                        textAlign="right"
                                                        text={this.state.transferParams.subpurpose}
                                                    />
                                                </View>
                                            </View>

                                            {/* Recipient reference */}
                                            <View style={Styles.rowListContainer}>
                                                <View style={Styles.rowListItemLeftContainer}>
                                                    <Typography
                                                        fontSize={14}
                                                        lineHeight={19}
                                                        textAlign="left"
                                                        text="Additional info"
                                                    />
                                                </View>
                                                <View style={Styles.rowListItemRightContainer}>
                                                    <TouchableOpacity
                                                        onPress={this._onPressRecipientRef}
                                                    >
                                                        <Typography
                                                            fontSize={14}
                                                            fontWeight="bold"
                                                            lineHeight={18}
                                                            textAlign="right"
                                                            text={
                                                                this.state.transferParams
                                                                    .recipientRef === ""
                                                                    ? "N/A"
                                                                    : this.state.transferParams
                                                                          .recipientRef
                                                            }
                                                            color={ROYAL_BLUE}
                                                        />
                                                    </TouchableOpacity>
                                                </View>
                                            </View>

                                            {/* Payment details */}
                                            <View style={Styles.rowListContainer}>
                                                <View style={Styles.rowListItemLeftContainer}>
                                                    <Typography
                                                        fontSize={14}
                                                        lineHeight={19}
                                                        textAlign="left"
                                                        text="Payment details"
                                                    />
                                                </View>
                                                <View style={Styles.rowListItemRightContainer}>
                                                    <TextInput
                                                        placeholderTextColor={GREY}
                                                        textAlign="right"
                                                        autoCorrect={false}
                                                        autoFocus={false}
                                                        allowFontScaling={false}
                                                        // selection={this.state.select}
                                                        ref={this._setPaymentDetailsTextInputRef}
                                                        style={
                                                            Platform.OS === "ios"
                                                                ? this.state.paymentDetailsText &&
                                                                  this.state.paymentDetailsText
                                                                      .length >= 1
                                                                    ? Styles.commonInputConfirmIosText
                                                                    : Styles.commonInputConfirmIos
                                                                : this.state.paymentDetailsText &&
                                                                  this.state.paymentDetailsText
                                                                      .length >= 1
                                                                ? Styles.commonInputConfirmText
                                                                : Styles.commonInputConfirm
                                                        }
                                                        secureTextEntry={false}
                                                        maxLength={20}
                                                        placeholder="Optional"
                                                        onSubmitEditing={
                                                            this._onPaymentDetailsTextDone
                                                        }
                                                        value={this.state.paymentDetailsText}
                                                        onChangeText={
                                                            this._onPaymentDetailsTextChange
                                                        }
                                                    />
                                                </View>
                                            </View>
                                            <View style={Styles.line} />
                                        </View>

                                        <Typography
                                            fontSize={12}
                                            lineHeight={22}
                                            fontWeight="600"
                                            textAlign="left"
                                            text="Note:"
                                            color={FADE_GREY}
                                        />
                                        <Typography
                                            fontSize={12}
                                            lineHeight={18}
                                            textAlign="left"
                                            text="Money withdrawn from your insured deposit(s) is no longer protected by PIDM if transferred to non PIDM members and products."
                                            color={FADE_GREY}
                                        />

                                        <Typography
                                            fontSize={12}
                                            lineHeight={22}
                                            fontWeight="600"
                                            textAlign="left"
                                            text="Declaration:"
                                            color={FADE_GREY}
                                            style={Styles.lblDeclarationTitle}
                                        />
                                        <Typography
                                            fontSize={12}
                                            lineHeight={18}
                                            textAlign="left"
                                            text="I hereby declare that I have read and understand the terms and conditions set forth below and agree to comply with and be bound by the provision of the said terms and conditions and any amendment to the same which the bank may subsequently introduce."
                                            color={FADE_GREY}
                                        />

                                        <View style={Styles.linksContainer}>
                                            <TouchableOpacity onPress={this._onPressTncLink}>
                                                <Typography
                                                    fontSize={12}
                                                    lineHeight={18}
                                                    textDecorationLine="underline"
                                                    textAlign="left"
                                                    color={BLACK}
                                                    style={{
                                                        textDecorationLine: "underline",
                                                    }}
                                                    text="Terms & Conditions"
                                                />
                                            </TouchableOpacity>

                                            <TouchableOpacity onPress={this._onPressFeaLink}>
                                                <Typography
                                                    fontSize={12}
                                                    lineHeight={18}
                                                    textDecorationLine="underline"
                                                    textAlign="left"
                                                    color={BLACK}
                                                    text="FEA Requirement"
                                                    style={Styles.lblLink2}
                                                />
                                            </TouchableOpacity>
                                        </View>
                                    </View>

                                    <View style={Styles.transferFromContainer}>
                                        <View style={Styles.bottomView}>
                                            <Typography
                                                fontSize={14}
                                                lineHeight={18}
                                                fontWeight="600"
                                                textAlign="left"
                                                text="Transfer from"
                                            />
                                        </View>
                                        <FlatList
                                            style={Styles.accountsFlatlist}
                                            data={this.state.accountList}
                                            extraData={this.state}
                                            horizontal={true}
                                            scrollToIndex={0}
                                            showsHorizontalScrollIndicator={false}
                                            showIndicator={false}
                                            keyExtractor={(item, index) =>
                                                `${item.contentId}-${index}`
                                            }
                                            renderItem={({ item, index }) => (
                                                <TabungAccountDetailList
                                                    item={item}
                                                    index={index}
                                                    scrollToIndex={3}
                                                    onPress={() => this._onAccountListClick(item)}
                                                />
                                            )}
                                            ListHeaderComponent={<View style={{ width: 20 }} />}
                                            ListFooterComponent={<View style={{ width: 24 }} />}
                                        />
                                    </View>
                                    <View style={{ flex: 1 }} />
                                </ScrollView>
                            </KeyboardAvoidingView>
                            <FixedActionContainer>
                                <ActionButton
                                    disabled={this.state.disabled}
                                    fullWidth
                                    borderRadius={25}
                                    onPress={this.doneClick}
                                    backgroundColor={YELLOW}
                                    componentCenter={
                                        <Typography
                                            color={BLACK}
                                            text="Continue"
                                            fontSize={14}
                                            fontWeight="600"
                                            lineHeight={18}
                                        />
                                    }
                                />
                            </FixedActionContainer>
                        </React.Fragment>
                    </ScreenLayout>
                </ScreenContainer>
            </React.Fragment>
        );
    }
}

const Styles = {
    container: {
        flex: 1,
        // alignItems: "flex-start",
        paddingEnd: 24,
        paddingStart: 24,
    },
    bottomView: {
        flexDirection: "column",
        marginTop: 24,
        marginHorizontal: 24,
    },
    accountsFlatlist: {
        overflow: "visible",
    },
    formBodyContainer: {
        alignItems: "center",
        justifyContent: "center",
        marginTop: 26,
        width: "100%",
    },
    transferFromContainer: { paddingBottom: 24 },
    headerContainer: {
        alignItems: "center",
        width: "100%",
    },
    headerImageContainer: {
        marginBottom: 12,
    },
    lblSubTitle: { marginTop: 4, marginBottom: 16 },
    lblForeignCurrency: { marginBottom: 12 },
    lblDeclarationTitle: { marginTop: 16 },
    lblLink2: { marginLeft: 16, textDecorationLine: "underline" },
    linksContainer: {
        flexDirection: "row",
        marginTop: 8,
    },
    rowListContainer: {
        flex: 1,
        flexDirection: "row",
        marginTop: 20,
    },
    rowListItemLeftContainer: {
        flex: 0.5,
    },
    rowListItemRightContainer: {
        flex: 0.5,
        alignItems: "flex-end",
        alignContent: "flex-end",
    },
    commonInputConfirmIosText: {
        color: ROYAL_BLUE,
        fontFamily: "montserrat",
        fontSize: 14,
        fontStyle: "normal",
        fontWeight: "bold",
        marginTop: 0,
        minWidth: 70,
    },
    commonInputConfirmText: {
        color: ROYAL_BLUE,
        fontSize: 14,
        fontStyle: "normal",
        marginTop: -13,
        minWidth: 70,
    },
    commonInputConfirm: {
        color: BLACK,
        fontSize: 14,
        marginTop: -13,
        minWidth: 70,
    },
    commonInputConfirmIos: {
        color: BLACK,
        fontFamily: "montserrat",
        fontSize: 14,
        marginTop: 0,
        minWidth: 70,
    },
    line: {
        width: "100%",
        marginTop: 24,
        marginBottom: 24,
        borderWidth: StyleSheet.hairlineWidth,
        borderColor: "#cccccc",
        marginHorizontal: 36,
    },
};

export default BakongSummary;
