import PropTypes from "prop-types";
import React, { Component } from "react";
import { View, Keyboard } from "react-native";

import {
    ONE_TAP_AUTH_MODULE,
    FUNDTRANSFER_MODULE,
    TRANSFER_CONFIRMATION_SCREEN,
    TAB_NAVIGATOR,
    BANKINGV2_MODULE,
    ACCOUNT_DETAILS_SCREEN,
    TRANSFER_TYPE_MODE_SCREEN,
} from "@navigation/navigationConstant";

import HeaderLayout from "@layouts/HeaderLayout";
import ScreenLayout from "@layouts/ScreenLayout";

import ActionButton from "@components/Buttons/ActionButton";
import HeaderBackButton from "@components/Buttons/HeaderBackButton";
import { AccountDetailsView } from "@components/Common";
import ScreenContainer from "@components/Containers/ScreenContainer";
import Typography from "@components/Text";
import TextInput from "@components/TextInput";
import { showErrorToast } from "@components/Toast";

import { withModelContext } from "@context";

import { fundTransferInquiryApi } from "@services";

import { MEDIUM_GREY, YELLOW, DISABLED, DISABLED_TEXT, BLACK } from "@constants/colors";
import {
    AMOUNT_ERROR,
    TRANSFER,
    CONTINUE,
    PLEASE_REMOVE_INVALID_SPECIAL_CHARACTERS,
    ACCOUNT_NUMBER_INVALID,
} from "@constants/strings";

import { alphaNumericWithDashOnlyRegex } from "@utils/dataModel";
import { formateIDName } from "@utils/dataModel/utility";

import Styles from "@styles/Wallet/TransferEnterAmountStyle";

("use strict");

class TransferUserNameScreen extends Component {
    static navigationOptions = { title: "", header: null };

    /***
     * constructor
     * props
     */
    constructor(props) {
        super(props);
        this.state = {
            payeeName: "",
            errorMsg: false,
            errorMessageTxt: "",
            showLocalError: false,
            showLocalErrorMessage: "",
            errorMessage: "",
            screenData: {
                image: "",
                name: "",
                description1: "",
                description2: "",
            },
            transferParams: {},
            transferFlow: 0,
            image: "",
            disabled: true,
            functionsCode: 0,
        };
    }

    /***
     * componentDidMount
     * Update Screen date
     */
    componentDidMount() {
        console.log("[TransferUserNameScreen] >> [componentDidMount] : ", this.props.route.params);
        this._updateDataInScreen();
        this.focusSubscription = this.props.navigation.addListener("focus", () => {
            this._updateDataInScreen();
        });
        this.blurSubscription = this.props.navigation.addListener("blur", () => {});
    }

    /***
     * componentWillUnmount
     * Handle Screen UnMount Event
     */
    componentWillUnmount() {
        this.focusSubscription();
        this.blurSubscription();
    }

    /***
     * _updateDataInScreen
     * Handle one time screen load
     */
    _updateDataInScreen = () => {
        const transferParams = this.props.route.params?.transferParams ?? this.state.screenData;

        const screenData = {
            image: transferParams.image,
            name: transferParams.formattedToAccount,
            description1: transferParams.accountName,
            description2: transferParams.bankName,
        };
        this.setState({
            transferParams: transferParams,
            errorMessage: AMOUNT_ERROR,
            screenData: screenData,
            transferFlow: transferParams.transferFlow,
            functionsCode: transferParams.functionsCode,
            payeeName: transferParams?.accountHolderName ?? "",
        });
    };

    /***
     * _onTextInputValueChanged
     * on Text Input Value Changed
     */
    _onTextInputValueChanged = (text) => {
        this.setState({
            showLocalError: false,
            payeeName: text,
            disabled: text && text.length < 3,
        });
    };

    /***
     * _onTextDone
     * on Text Done
     */
    _onTextDone = () => {
        Keyboard.dismiss();
        this._proceedToNextScreen();
    };

    /***
     * _proceedToNextScreen
     *  proceed To Next Screen
     */
    _proceedToNextScreen = () => {
        let { payeeName } = this.state;
        let lengthCheck = payeeName.replace(/\s/g, "");
        let validate = false;
        validate = alphaNumericWithDashOnlyRegex(payeeName);

        if (lengthCheck.length <= 0) {
            this.setState({
                showLocalErrorMessage: "Please enter recipient’s name.",
                showLocalError: true,
            });
        } else if (lengthCheck.length <= 2) {
            this.setState({
                showLocalErrorMessage: "Please input a valid recipient's name.",
                showLocalError: true,
            });
        } else if (!validate) {
            this.setState({
                showLocalErrorMessage: PLEASE_REMOVE_INVALID_SPECIAL_CHARACTERS,
                showLocalError: true,
            });
        } else {
            Keyboard.dismiss();
            let subUrl = "/fundTransfer/inquiry";
            let { transferParams, secure2uValidateData } = this.props.route.params;
            const fundTransferInquiryApiParams = transferParams?.fundTransferInquiryApiParams ?? {};
            const params = {
                ...fundTransferInquiryApiParams,
                payeeName: formateIDName(this.state.payeeName, " ", 2),
                interbankTransferType: "IBG",
            };

            let { flow } = transferParams;

            // route back setting
            const { routeFrom } = transferParams;
            let stack = TAB_NAVIGATOR;
            let screen = "Tab";

            const route = routeFrom ? routeFrom : "Dashboard";
            if (route === "WalletMainDashboard") {
                stack = TAB_NAVIGATOR;
                screen = "Dashboard";
            } else if (route == "AccountDetails") {
                stack = BANKINGV2_MODULE;
                screen = ACCOUNT_DETAILS_SCREEN;
            }

            fundTransferInquiryApi(subUrl, params)
                .then((response) => {
                    const responseObject = response.data;

                    if (responseObject && responseObject.accountHolderName) {
                        let { accountHolderName, lookupReference } = responseObject;

                        if (accountHolderName && accountHolderName.length >= 1) {
                            transferParams.accountName = accountHolderName;
                            transferParams.accountHolderName = accountHolderName;
                            transferParams.recipientName = accountHolderName;
                            transferParams.transferProxyRefNo = lookupReference;

                            // not sure why in confirmation screen need transferParams and stateData
                            const nextParams = {
                                secure2uValidateData,
                                transferParams,
                                flow,
                                stateData: transferParams,
                            };

                            if (flow === "S2UReg") {
                                transferParams.flowType = flow;

                                this.props.navigation.navigate(ONE_TAP_AUTH_MODULE, {
                                    screen: "Activate",
                                    params: {
                                        flowParams: {
                                            success: {
                                                stack: FUNDTRANSFER_MODULE,
                                                screen: TRANSFER_CONFIRMATION_SCREEN,
                                            },
                                            fail: {
                                                stack: stack,
                                                screen: screen,
                                            },
                                            params: nextParams,
                                        },
                                    },
                                });
                            } else {
                                this.props.navigation.navigate(
                                    TRANSFER_CONFIRMATION_SCREEN,
                                    nextParams
                                );
                            }
                        } else {
                            showErrorToast({
                                message: ACCOUNT_NUMBER_INVALID,
                                duration: 5000,
                                autoHide: true,
                            });
                        }
                    }
                })
                .catch((error) => {
                    console.log(subUrl + " ERROR==> ", error);
                    const errorMessage =
                        error && error.message ? error.message : ACCOUNT_NUMBER_INVALID;
                    showErrorToast({
                        message: errorMessage,
                        duration: 5000,
                        autoHide: true,
                    });
                });
        }
    };

    /***
     * _onBackPress
     * On Back button click handler
     */
    _onBackPress = () => {
        let { transferParams, secure2uValidateData } = this.props.route.params;
        let { flow } = transferParams;
        this.props.navigation.navigate(TRANSFER_TYPE_MODE_SCREEN, {
            secure2uValidateData,
            transferParams,
            flow,
            stateData: transferParams,
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
                                <Typography
                                    fontSize={16}
                                    fontWeight="600"
                                    lineHeight={19}
                                    text={TRANSFER}
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
                                        image={this.state.image}
                                        base64={this.state.transferParams !== 1}
                                    />
                                </View>

                                <View style={Styles.descriptionContainerAmount}>
                                    <Typography
                                        fontSize={14}
                                        fontWeight="normal"
                                        fontStyle="normal"
                                        letterSpacing={0}
                                        lineHeight={19}
                                        color="#000000"
                                        textAlign="left"
                                        text="Recipient's Name"
                                    />
                                </View>

                                <View style={Styles.amountViewTransfer}>
                                    <TextInput
                                        maxLength={19}
                                        onChangeText={this._onTextInputValueChanged}
                                        value={this.state.payeeName}
                                        isValidate={this.state.showLocalError}
                                        errorMessage={this.state.showLocalErrorMessage}
                                        onSubmitEditing={this._onTextDone}
                                        clearButtonMode="while-editing"
                                        returnKeyType="done"
                                        placeholder=""
                                        editable={true}
                                        autoFocus
                                    />
                                </View>
                            </View>
                        </View>
                        <View style={Styles.footerButton}>
                            <ActionButton
                                disabled={this.state.payeeName.length < 3}
                                fullWidth
                                borderRadius={25}
                                onPress={this._proceedToNextScreen}
                                backgroundColor={
                                    this.state.payeeName.length < 3 ? DISABLED : YELLOW
                                }
                                componentCenter={
                                    <Typography
                                        color={
                                            this.state.payeeName.length < 3 ? DISABLED_TEXT : BLACK
                                        }
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

TransferUserNameScreen.propTypes = {
    navigation: PropTypes.shape({
        addListener: PropTypes.func,
        navigate: PropTypes.func,
    }),
    route: PropTypes.shape({
        params: PropTypes.shape({
            secure2uValidateData: PropTypes.any,
            transferParams: PropTypes.shape({
                accountHolderName: PropTypes.any,
                accountName: PropTypes.any,
                flow: PropTypes.string,
                flowType: PropTypes.any,
                fundTransferInquiryApiParams: PropTypes.object,
                recipientName: PropTypes.any,
                routeFrom: PropTypes.any,
                transferProxyRefNo: PropTypes.any,
            }),
        }),
    }),
};

export default withModelContext(TransferUserNameScreen);
