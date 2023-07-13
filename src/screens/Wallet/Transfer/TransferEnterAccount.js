import PropTypes from "prop-types";
import React, { Component } from "react";
import { View } from "react-native";

import { TRANSFER_ENTER_AMOUNT } from "@navigation/navigationConstant";

import HeaderLayout from "@layouts/HeaderLayout";
import ScreenLayout from "@layouts/ScreenLayout";

import ActionButton from "@components/Buttons/ActionButton";
import HeaderBackButton from "@components/Buttons/HeaderBackButton";
import { AccountDetailsView } from "@components/Common";
import ScreenContainer from "@components/Containers/ScreenContainer";
import Typo from "@components/Text";
import TextInput from "@components/TextInput";
import { showErrorToast, hideToast } from "@components/Toast";

import { fundTransferInquiryApi } from "@services";
import { GATransfer } from "@services/analytics/analyticsTransfer";

import { MEDIUM_GREY, YELLOW, DISABLED, DISABLED_TEXT, BLACK } from "@constants/colors";
import { FUND_TRANSFER_TYPE_MAYBANK } from "@constants/fundConstants";
import {
    ACCOUNT_NUMBER_REQUIRED,
    PLEASE_ENTER_ACCOUNT_NUMBER,
    PLEASE_INPUT_A_VALID_ACCOUNT_NUMBER,
    ACCOUNT_NUMBER_CANNOT,
    ACCOUNT_NUMBER_INVALID,
    TRANSFER,
    CDD_ACCOUNT_NUMBER,
    CONTINUE,
    TRANSFER_TO_HEADER,
} from "@constants/strings";

import { getTransferAccountType } from "@utils/dataModel/utilityPartial.5";

import Styles from "@styles/Wallet/TransferEnterAmountStyle";

class TransferEnterAccount extends Component {
    static navigationOptions = { title: "", header: null };

    /***
     * constructor
     * props
     */
    constructor(props) {
        super(props);
        this.state = {
            accountNumberText: "",
            accountNumber: "",
            accountNumberLength: 14,
            accountNumberCorrectLength: 12,
            lengthError: false,
            fullName: "",
            loader: false,
            showLocalError: false,
            showLocalErrorMessage: "",
            errorMessage: "",
            image: "",
            screenData: {
                image: "",
                name: "",
                description1: "",
                description2: "",
            },
            transferParams: {},
            transferFlow: 3,
            disabled: false,
        };
    }

    /***
     * componentDidMount
     * Update Screen date
     */
    componentDidMount() {
        console.log("[TransferEnterAccount] >> [componentDidMount] : ");
        this._updateDataInScreen();

        GATransfer.viewScreenAccountNo(getTransferAccountType(this.state.transferFlow));
    }

    /***
     * componentWillUnmount
     * Handle Screen UnMount Event
     */
    componentWillUnmount() {
        console.log("[TransferEnterAccount] >> [componentWillUnmount] : ");
    }

    /***
     * _updateDataInScreen
     * Handle one time screen load
     */
    _updateDataInScreen = () => {
        console.log("[TransferEnterAccount] >> [_updateDataInScreen] : ");
        const transferParams = this.props.route.params?.transferParams ?? 3;
        console.log(
            "[TransferEnterAccount] >> [_updateDataInScreen] transferParams : ",
            transferParams
        );

        console.log(
            "[TransferEnterAccount] >> [_updateDataInScreen] _updateDataInScreen ==> ",
            transferParams
        );
        const transferFlow = transferParams.transferFlow;
        const accountNumberLength = transferFlow === 4 || transferFlow === 5 ? 27 : 14;
        const accountNumberCorrectLength = transferFlow === 4 || transferFlow === 5 ? 22 : 12;

        console.log(
            "[TransferEnterAccount] >> [_updateDataInScreen] transferFlow ==> ",
            transferFlow
        );
        console.log(
            "[TransferEnterAccount] >> [_updateDataInScreen] accountNumberLength ==> ",
            accountNumberLength
        );

        const screenData = {
            image: transferParams.image,
            name: transferParams.bankName,
            description1: "",
            description2: "",
        };
        console.log("[TransferEnterAccount] >> [_updateDataInScreen] screenData ==> ", screenData);
        console.log(
            "[TransferEnterAccount] >> [_updateDataInScreen] image ==> ",
            transferParams.image
        );
        this.setState({
            image: transferParams.image,
            transferParams: transferParams,
            errorMessage: ACCOUNT_NUMBER_REQUIRED,
            showLocalErrorMessage: ACCOUNT_NUMBER_REQUIRED,
            screenData: screenData,
            transferFlow: transferFlow,
            accountNumberLength: accountNumberLength,
            accountNumberCorrectLength: accountNumberCorrectLength,
        });
    };

    /***
     * onDoneClick
     * Handle on Done Button Click
     */
    onDoneClick = () => {
        console.log("[TransferEnterAccount] >> [onDoneClick] : ");
        this.setState({ loader: true });
        let { transferParams } = this.state;
        console.log("[TransferEnterAccount] >> [onDoneClick] transferParams : ", transferParams);
        const { accountNumber, accountNumberLength } = this.state;
        let text = accountNumber.replace(/ /g, "").replace(/ /g, "");
        console.log("[TransferEnterAccount] >> [onDoneClick] accountNumber : ", accountNumber);
        console.log("[TransferEnterAccount] >> [onDoneClick] text : ", text);
        console.log("[TransferEnterAccount] >> [onDoneClick] text.length : ", text.length);
        console.log(
            "[TransferEnterAccount] >> [onDoneClick] accountNumberLength : ",
            accountNumberLength
        );

        //To ensure the toAccount param received fully numeric input
        const numericAccountNo = text
            .replace(/[^\dA-Z]/g, "")
            .trim()
            .substring(0, accountNumberLength - 2);
        const formattedToAccount = numericAccountNo.replace(/(.{4})/g, "$1 "); //UI display for spacing purpose
        text = numericAccountNo; //Redeclare the text variable
        transferParams.toAccount = text;
        transferParams.accounts = text;
        transferParams.addingFavouriteFlow = false;
        transferParams.formattedToAccount = formattedToAccount;
        if (text === "" || text === undefined || text === null || text.length === 0) {
            this.setState({
                loader: false,
                showLocalErrorMessage: PLEASE_ENTER_ACCOUNT_NUMBER,
                showLocalError: true,
            });
        } else if (text.length >= 1 && transferParams.transferFlow === 3) {
            if (text.length < accountNumberLength - 2) {
                console.log("[TransferEnterAccount] >> [onDoneClick] Invalid Account==> ");
                this.setState({
                    loader: false,
                    showLocalErrorMessage: PLEASE_INPUT_A_VALID_ACCOUNT_NUMBER,
                    showLocalError: true,
                });
            } else {
                console.log("[TransferEnterAccount] >> [onDoneClick] Valid Account==> ");
                this._fundTransferInquiryApi(transferParams);
            }
        } else if (!transferParams.isMaybankTransfer < accountNumberLength - 2) {
            this.setState({ loader: false, transferParams: transferParams });

            if (text.length < 5) {
                console.log("[TransferEnterAccount] >> [onDoneClick] Invalid Account==> ");
                this.setState({
                    loader: false,
                    showLocalErrorMessage: PLEASE_INPUT_A_VALID_ACCOUNT_NUMBER,
                    showLocalError: true,
                });
            } else {
                hideToast();

                this.props.navigation.navigate(TRANSFER_ENTER_AMOUNT, {
                    transferParams,
                });
            }
        } else {
            this.setState({
                loader: false,
                showLocalErrorMessage: ACCOUNT_NUMBER_CANNOT,
                showLocalError: true,
            });
        }
    };

    /***
     * _fundTransferInquiryApi
     * fund Transfer Inquiry Api call for Maybank casa account
     */
    _fundTransferInquiryApi = async (transferParams) => {
        console.log("[TransferEnterAccount] >> [_fundTransferInquiryApi] : ");

        let subUrl = "/fundTransfer/inquiry";
        let params = {};

        try {
            params = {
                bankCode: transferParams.bankCode,
                fundTransferType: FUND_TRANSFER_TYPE_MAYBANK,
                toAccount: transferParams.toAccount,
                payeeCode: transferParams.toAccountCode,
                swiftCode: transferParams.swiftCode,
            };
            console.log("[TransferEnterAccount] >> [_fundTransferInquiryApi] params ==> ", params);

            fundTransferInquiryApi(subUrl, params)
                .then((response) => {
                    const responseObject = response.data;
                    console.log(
                        "[TransferEnterAccount] >> [_fundTransferInquiryApi] authenticationObject ==> ",
                        responseObject
                    );
                    if (responseObject !== null) {
                        if (responseObject.accountHolderName != undefined) {
                            let fullName = responseObject.accountHolderName;

                            if (fullName != undefined && fullName.length >= 1) {
                                transferParams.fullName = fullName;
                                transferParams.accountName = fullName;
                                transferParams.recipientName = fullName;
                                transferParams.recipientFullName = fullName;
                                transferParams.transferProxyRefNo = responseObject.lookupReference;
                                console.log(
                                    "[TransferEnterAccount] >> [_fundTransferInquiryApi] transferParams : ",
                                    transferParams
                                );
                                this.setState({
                                    fullName: fullName,
                                    transferParams: transferParams,
                                });
                                hideToast();

                                this.props.navigation.navigate(TRANSFER_ENTER_AMOUNT, {
                                    transferParams,
                                });
                            } else {
                                showErrorToast({
                                    message: ACCOUNT_NUMBER_INVALID,
                                });
                                // this.setState({
                                //     lengthErrorMsg:  ACCOUNT_NUMBER_INVALID,
                                //     lengthError: true,
                                // });
                            }
                        }
                        this.setState({ loader: false });
                    } else {
                        this.setState({ loader: false, error: true });
                    }
                })
                .catch((error) => {
                    console.log(
                        "[TransferEnterAccount] >> [_fundTransferInquiryApi]  ERROR==> ",
                        error
                    );
                    this.setState({ loader: false });
                });
        } catch (e) {
            console.log(subUrl + " catch ERROR==> " + e);
        }
    };

    /***
     * _onTextInputValueChanged
     * on Account in put formate the account number and update state
     */
    _onTextInputValueChanged = (text) => {
        console.log("[TransferEnterAccount] >> [_onTextInputValueChanged]");
        const { accountNumberCorrectLength, accountNumberLength } = this.state;

        let account = text ? text : "";
        let accountPasted = text
            ? text
                  .toString()
                  .trim()
                  .replace(/\D/g, "")
                  .replace(/[^\w\s]/gi, "")
                  .replace(/-/g, "")
                  .replace(/[ \t\r]+/g, "")
            : "";
        if (accountPasted && accountPasted.length > accountNumberCorrectLength) {
            account = accountPasted;
            account = account ? account.substring(0, accountNumberCorrectLength) : "";
        }

        if (account && account.length <= accountNumberLength) {
            this.setState({
                showLocalError: false,
                accountNumber: account,
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
        console.log("[TransferEnterAccount] >> [_onBackPress]");
        hideToast();
        this.props.navigation.goBack();
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
                                    text={TRANSFER_TO_HEADER}
                                />
                            }
                            headerLeftElement={<HeaderBackButton onPress={this._onBackPress} />}
                        />
                    }
                    useSafeArea
                    paddingHorizontal={0}
                    paddingBottom={0}
                    neverForceInset={["bottom"]}
                >
                    <React.Fragment>
                        <View style={Styles.container}>
                            <View style={Styles.blockNew}>
                                <View style={Styles.titleContainerTransferNew}>
                                    <AccountDetailsView
                                        data={this.state.screenData}
                                        base64={this.state.transferParams !== 1}
                                        image={this.state.image}
                                    />
                                </View>

                                <View style={Styles.descriptionContainerAmount}>
                                    <Typo
                                        fontSize={14}
                                        fontWeight="normal"
                                        fontStyle="normal"
                                        letterSpacing={0}
                                        lineHeight={19}
                                        color="#000000"
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
                                    <Typo
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

TransferEnterAccount.propTypes = {
    navigation: PropTypes.object,
    route: PropTypes.object,
};

export default TransferEnterAccount;
