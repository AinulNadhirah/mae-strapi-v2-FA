import PropTypes from "prop-types";
import React, { Component } from "react";
import { View } from "react-native";

import {
    REQUEST_TO_PAY_AMOUNT,
    REQUEST_TO_PAY_CONFIRMATION_SCREEN,
} from "@navigation/navigationConstant";

import HeaderLayout from "@layouts/HeaderLayout";
import ScreenLayout from "@layouts/ScreenLayout";

import ActionButton from "@components/Buttons/ActionButton";
import HeaderBackButton from "@components/Buttons/HeaderBackButton";
import { AccountDetailsView } from "@components/Common";
import ScreenContainer from "@components/Containers/ScreenContainer";
import Typography from "@components/Text";
import TextInput from "@components/TextInput";
import { showErrorToast, hideToast } from "@components/Toast";

import { fundTransferInquiryApi } from "@services";

import { MEDIUM_GREY, YELLOW, DISABLED, DISABLED_TEXT, BLACK } from "@constants/colors";
import { VALID_ACC_NUMBER } from "@constants/data/DuitNowRPP";
import { FUND_TRANSFER_TYPE_MAYBANK, FUND_TRANSFER_TYPE_INTERBANK } from "@constants/fundConstants";
import {
    ACCOUNT_NUMBER_REQUIRED,
    REQUEST_TO_PAY,
    CDD_ACCOUNT_NUMBER,
    CONTINUE,
} from "@constants/strings";

import Styles from "@styles/Wallet/TransferEnterAmountStyle";

import Assets from "@assets";

("use strict");

// TODO: need to refactor
class RequestToPayAccount extends Component {
    static navigationOptions = { title: "", header: null };
    static propTypes = {
        navigation: PropTypes.object,
        route: PropTypes.object,
    };

    /***
     * constructor
     * props
     */
    constructor(props) {
        super(props);
        this.forwardItem = this.props?.route?.params?.forwardItem;
        this.state = {
            accountNumberText: "",
            accountNumber: "",
            accountNumberLength: 20,
            accountNumberCorrectLength: 12,
            showLocalError: false,
            showLocalErrorMessage: "",
            image: "",
            screenData: {
                image: "",
                name: "",
                description1: "",
                description2: "",
            },
            transferParams: {},
            disabled: false,
        };
    }

    /***
     * componentDidMount
     * Update Screen date
     */
    componentDidMount() {
        this._updateDataInScreen();
    }

    /***
     * _updateDataInScreen
     * Handle one time screen load
     */
    _updateDataInScreen = () => {
        const transferParams = this.props?.route?.params?.transferParams ?? {};
        const isMaybankTransfer = transferParams.swiftCode === "MBBEMYKL";
        const accountNumberLength = isMaybankTransfer ? 14 : 24;
        const accountNumberCorrectLength = isMaybankTransfer ? 12 : 22;

        const screenData = {
            image: transferParams?.image,
            imageName: "icDuitNowCircle",
            imageUrl: "icDuitNowCircle",
            name: transferParams?.bankName,
            description1: "",
            description2: "",
        };
        this.setState(
            {
                image: Assets.icDuitNowCircle,
                transferParams,
                showLocalErrorMessage: ACCOUNT_NUMBER_REQUIRED,
                screenData,
                accountNumberLength,
                accountNumberCorrectLength,
            },
            this.setDefaultVale
        );
    };

    setDefaultVale = () => {
        const transferParams = this.props?.route?.params?.transferParams;
        this._onTextInputValueChanged(transferParams?.toAccount ?? "vvv");
    };

    /***
     * onDoneClick
     * Handle on Done Button Click
     */
    onDoneClick = () => {
        const { transferParams } = this.state;
        const { accountNumber, accountNumberLength } = this.state;
        const text = accountNumber.replace(/ /g, "").replace(/ /g, "");

        const formattedToAccount = text
            .substring(0, accountNumberLength - 2)
            .replace(/[^\dA-Z]/g, "")
            .replace(/(.{4})/g, "$1 ")
            .trim();
        transferParams.toAccount = text;
        transferParams.accounts = text;
        transferParams.addingFavouriteFlow = false;
        transferParams.formattedToAccount = formattedToAccount
            .substring(0, accountNumberLength - 2)
            .replace(/[^\dA-Z]/g, "")
            .replace(/(.{4})/g, "$1 ")
            .trim();

        // if (text === "" || text === undefined || text === null || text.length === 0) {
        //     this.setState({
        //         loader: false,
        //         showLocalErrorMessage: "Please enter valid transfer details.1", //PLEASE_ENTER_ACCOUNT_NUMBER,
        //         showLocalError: true,
        //     });
        // } else if (text.length >= 1) {
        //     if (text.length < accountNumberLength - 2 && transferParams.isMaybankTransfer) {
        //         this.setState({
        //             loader: false,
        //             showLocalErrorMessage: "Please enter valid transfer details.2", // PLEASE_INPUT_A_VALID_ACCOUNT_NUMBER,
        //             showLocalError: true,
        //         });
        //     } else {
        //         if (transferParams.isMaybankTransfer) {
        //             this._fundTransferInquiryApi(transferParams);
        //         } else {
        //             this._fundTransferInquiryApiOthers(transferParams);
        //         }
        //     }
        if (text.length > 3) {
            if (transferParams.isMaybankTransfer) {
                this._fundTransferInquiryApi(transferParams);
            } else {
                this._fundTransferInquiryApiOthers(transferParams);
            }
        } else {
            this.setState({
                showLocalErrorMessage: "Please input valid transfer details.", // ACCOUNT_NUMBER_CANNOT,
                showLocalError: true,
            });
        }
    };

    /***
     * _fundTransferInquiryApi
     * fund Transfer Inquiry Api call for Maybank casa account
     */
    _fundTransferInquiryApi = async (transferParams) => {
        const { accountNumberText } = this.state;
        const subUrl = "/fundTransfer/inquiry";
        try {
            const params = {
                bankCode: transferParams?.bankCode,
                fundTransferType: FUND_TRANSFER_TYPE_MAYBANK,
                toAccount: transferParams?.toAccount,
                payeeCode: transferParams?.toAccountCode,
                swiftCode: transferParams?.swiftCode,
            };
            const response = await fundTransferInquiryApi(subUrl, params);
            const responseObject = response?.data;

            const amount = this.forwardItem ? this.forwardItem.amount : transferParams?.amount;
            const reference = this.forwardItem
                ? this.forwardItem.reference
                : transferParams?.reference;
            const paymentDesc = this.forwardItem
                ? this.forwardItem.paymentDesc
                : transferParams?.paymentDesc;

            if (responseObject?.accountHolderName) {
                transferParams.nameMasked = responseObject?.nameMasked;
                transferParams.recipientNameMaskedMessage =
                    responseObject?.recipientNameMaskedMessage;
                transferParams.recipientNameMasked = responseObject?.recipientNameMasked;
                transferParams.actualAccHolderName = responseObject?.actualAccHolderName;
                transferParams.accHolderName = responseObject?.accountHolderName;
                // transferParams.actualAccHolderName =  responseObject?.actualAccHolderName;
                // transferParams.accountHolderName =  responseObject?.accountHolderName;
                // transferParams.recipientName =  responseObject?.recipientName;
                // transferParams.recipientName =  responseObject?.accountHolderName;
                transferParams.transferProxyRefNo = responseObject?.lookupReference;
                transferParams.idTypeText = "Account number";
                transferParams.idValueFormatted = accountNumberText;
                transferParams.idValue = transferParams.toAccount;
                transferParams.transferAccType = "";
                transferParams.idType = "ACCT";
                transferParams.amount = amount; //this?.forwardItem?.amount ?? "0.00";
                transferParams.reference = reference; //this?.forwardItem?.reference ?? "";
                transferParams.paymentDesc = paymentDesc; // this?.forwardItem?.paymentDesc ?? "";
                hideToast();
                this.props.navigation.navigate(
                    this.forwardItem ? REQUEST_TO_PAY_CONFIRMATION_SCREEN : REQUEST_TO_PAY_AMOUNT,
                    {
                        ...this.props.route.params,
                        transferParams,
                        forwardItem: this.forwardItem,
                    }
                );
            } else {
                showErrorToast({
                    message: VALID_ACC_NUMBER,
                });
            }
        } catch (error) {
            showErrorToast({
                message: error?.message ?? VALID_ACC_NUMBER,
            });
        }
    };

    /***
     * _fundTransferInquiryApiOthers
     * Other Bank Account Inquiry Api
     */
    _fundTransferInquiryApiOthers = async (transferParams) => {
        const { accountNumberText } = this.state;
        const subUrl = "/fundTransfer/inquiry";

        try {
            const params = {
                bankCode: transferParams?.bankCode,
                fundTransferType: FUND_TRANSFER_TYPE_INTERBANK,
                toAccount: transferParams?.toAccount,
                payeeCode: transferParams?.toAccountCode,
                swiftCode: transferParams?.swiftCode,
                interbankPaymentType: "TRANSFER",
            };

            const response = await fundTransferInquiryApi(subUrl, params);
            const responseObject = response?.data;

            if (responseObject?.accountHolderName) {
                transferParams.nameMasked = responseObject?.nameMasked;
                transferParams.recipientNameMaskedMessage =
                    responseObject?.recipientNameMaskedMessage;
                transferParams.recipientNameMasked = responseObject?.recipientNameMasked;
                transferParams.actualAccHolderName = responseObject?.actualAccHolderName;
                transferParams.accHolderName = responseObject?.accountHolderName;
                // transferParams.actualAccHolderName =  responseObject?.actualAccHolderName;
                // transferParams.accountHolderName =  responseObject?.accountHolderName;
                // transferParams.recipientName =  responseObject?.recipientName;
                // transferParams.recipientName =  responseObject?.accountHolderName;
                transferParams.transferProxyRefNo = responseObject?.lookupReference;
                transferParams.idTypeText = "Account number";
                transferParams.idValueFormatted = accountNumberText;
                transferParams.idValue = transferParams.toAccount;
                transferParams.transferAccType = "";
                transferParams.idType = "ACCT";
                transferParams.amount = this?.forwardItem?.amount ?? "0.00";
                transferParams.reference = this?.forwardItem?.reference ?? "";
                transferParams.paymentDesc = this?.forwardItem?.paymentDesc ?? "";

                hideToast();
                this.props.navigation.navigate(
                    this.forwardItem ? REQUEST_TO_PAY_CONFIRMATION_SCREEN : REQUEST_TO_PAY_AMOUNT,
                    {
                        ...this.props.route.params,
                        transferParams,
                        forwardItem: this.forwardItem,
                    }
                );
            } else {
                showErrorToast({
                    message: VALID_ACC_NUMBER,
                });
            }
        } catch (error) {
            showErrorToast({
                message: error?.message ?? VALID_ACC_NUMBER,
            });
        }
    };

    /***
     * _onTextInputValueChanged
     * on Account in put formate the account number and update state
     */
    _onTextInputValueChanged = (text) => {
        const { accountNumberCorrectLength, accountNumberLength } = this.state;

        const account = text ?? "";
        const accountPasted = text
            ? text
                  .toString()
                  .trim()
                  .replace(/\D/g, "")
                  .replace(/[^\w\s]/gi, "")
                  .replace(/-/g, "")
                  .replace(/[ \t\r]+/g, "")
            : "";

        if (account?.length <= accountNumberLength) {
            this.setState({
                showLocalError: false,
                accountNumber:
                    accountPasted?.length > accountNumberCorrectLength
                        ? accountPasted.substring(0, accountNumberCorrectLength)
                        : account,
                accountNumberText: account
                    .substring(0, accountNumberLength)
                    .replace(/[^\dA-Z]/g, "")
                    .replace(/(.{4})/g, "$1 ")
                    .trim(),
            });
        } else {
            if (!account || account.length === 0) {
                this.setState({
                    accountNumberText: "",
                    accountNumber: "",
                });
            }
        }
    };

    /***
     * _onBackPress
     * Handle on Back button click
     */
    _onBackPress = () => {
        hideToast();
        this.props.navigation.goBack();
    };

    render() {
        const { showErrorModal } = this.state;
        return (
            <ScreenContainer
                backgroundType="color"
                showErrorModal={showErrorModal}
                // errorMessage={errorMessage}
                showOverlay={false}
                backgroundColor={MEDIUM_GREY}
                analyticScreenName={"DuitNowRequest_AccountNumber"}
            >
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
                    <React.Fragment>
                        <View style={Styles.container}>
                            <View style={Styles.blockNew}>
                                <View style={Styles.titleContainerTransferNew}>
                                    <AccountDetailsView
                                        data={this.state.screenData}
                                        base64={true}
                                        image={this.state.image}
                                    />
                                </View>

                                <View style={Styles.descriptionContainerAmount}>
                                    <Typography
                                        fontSize={14}
                                        fontWeight="normal"
                                        fontStyle="normal"
                                        letterSpacing={0}
                                        lineHeight={19}
                                        color={BLACK}
                                        textAlign="left"
                                        text={CDD_ACCOUNT_NUMBER}
                                    />
                                </View>

                                <View style={Styles.amountViewTransfer}>
                                    <TextInput
                                        maxLength={this.state.accountNumberLength}
                                        keyboardType="numeric"
                                        onChangeText={this._onTextInputValueChanged}
                                        value={this.state.accountNumberText}
                                        isValidate={this.state.showLocalError}
                                        errorMessage={this.state.showLocalErrorMessage}
                                        onSubmitEditing={this.onDoneClick}
                                        clearButtonMode="while-editing"
                                        returnKeyType="done"
                                        editable={true}
                                        placeholder=""
                                        autoFocus
                                    />
                                </View>
                            </View>
                        </View>
                        <View style={Styles.footerButton}>
                            <ActionButton
                                disabled={this.state.disabled}
                                fullWidth
                                borderRadius={25}
                                onPress={this.onDoneClick}
                                backgroundColor={this.state.disabled ? DISABLED : YELLOW}
                                componentCenter={
                                    <Typography
                                        color={this.state.disabled ? DISABLED_TEXT : BLACK}
                                        text={CONTINUE}
                                        fontSize={14}
                                        fontWeight="600"
                                        lineHeight={18}
                                    />
                                }
                            />
                        </View>
                    </React.Fragment>
                </ScreenLayout>
            </ScreenContainer>
        );
    }
}

export default RequestToPayAccount;
