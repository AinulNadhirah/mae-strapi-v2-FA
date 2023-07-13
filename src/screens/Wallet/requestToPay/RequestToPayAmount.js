import PropTypes from "prop-types";
import React, { Component } from "react";
import { View, ScrollView } from "react-native";

import { REQUEST_TO_PAY_REFERENCE } from "@navigation/navigationConstant";

import HeaderLayout from "@layouts/HeaderLayout";
import ScreenLayout from "@layouts/ScreenLayout";

import HeaderBackButton from "@components/Buttons/HeaderBackButton";
import { AccountDetailsView } from "@components/Common";
import ScreenContainer from "@components/Containers/ScreenContainer";
import NumericalKeyboard from "@components/NumericalKeyboard";
import Typography from "@components/Text";
import TextInput from "@components/TextInput";
import { showInfoToast } from "@components/Toast";

import { BLACK, DARK_GREY, MEDIUM_GREY } from "@constants/colors";
// import { FUND_TRANSFER_TYPE_INTERBANK, FUND_TRANSFER_TYPE_MAYBANK } from "@constants/fundConstants";
import {
    AMOUNT_NEEDS_TO_BE_001,
    REQUEST_TO_PAY,
    ENTER_AMOUNT,
    CURRENCY_CODE,
    AMOUNT_EXCEEDS_FIFTY_THOUSAND,
    DUINTNOW_IMAGE,
} from "@constants/strings";

import Assets from "@assets";

("use strict");

class RequestToPayAmount extends Component {
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
        this.state = {
            amount: "0.00",
            loader: true,
            screenData: {
                image: "",
                name: "",
                description1: "",
                description2: "",
            },
            showLocalError: false,
            showLocalErrorMessage: "",
            recipientNameMaskedMessage: "",
            errorMessage: AMOUNT_NEEDS_TO_BE_001,
            transferParams: {},
            image: "",
            amountValue: 0,
        };

        this.forwardItem = this.props.route.params?.forwardItem;
    }

    /***
     * componentDidMount
     * Update Screen date
     */
    async componentDidMount() {
        this.updateData();

        this.focusSubscription = this.props.navigation.addListener("focus", () => {
            this.updateData();
        });
    }

    /***
     * componentWillUnmount
     * Handle Screen UnMount Event
     */
    componentWillUnmount() {
        if (this.focusSubscription) {
            this.focusSubscription();
        }
    }

    /***
     * updateData
     * Update Screen Date
     */

    updateData() {
        const transferParams = this.props.route.params?.transferParams ?? this.state.screenData;

        const screenData = {
            image: {
                image: "icDuitNowCircle",
                imageName: "icDuitNowCircle",
                imageUrl: "icDuitNowCircle",
                shortName: transferParams?.accountName,
            },
            imageName: DUINTNOW_IMAGE,
            imageUrl: DUINTNOW_IMAGE,
            name: transferParams?.idValueFormatted,
            description1: transferParams?.accHolderName,
            description2: transferParams?.idTypeText,
        };
        const amountValue =
            transferParams && transferParams.amountValue
                ? transferParams.amountValue.toString().replace(/,/g, "").replace(".", "")
                : 0.0;

        if (amountValue && amountValue >= 0.01) {
            this._updateAmount(amountValue);
        }

        const tempAmount =
            transferParams?.amount > parseFloat("0.00")
                ? transferParams.amount.replace(",", "")
                : "";

        this.setState(
            {
                image: Assets.icDuitNowCircle,
                transferParams,
                errorMessage: AMOUNT_NEEDS_TO_BE_001,
                screenData,
                amountValue,
                loader: false,
                amount: tempAmount ?? "",
                recipientNameMaskedMessage: transferParams?.recipientNameMaskedMessage ?? "",
            },
            () => {
                if (this.state.recipientNameMaskedMessage) {
                    setTimeout(() => {
                        showInfoToast({
                            message: `${this.state.recipientNameMaskedMessage}.`,
                            backgroundColor: DARK_GREY,
                            animated: true,
                            hideOnPress: true,
                            autoHide: true,
                        });
                    }, 1);
                }
            }
        );
    }

    /***
     * doneClick
     * on Done Button Click
     */
    doneClick = () => {
        const { amountValue, amount } = this.state;

        const amountText = amount ? amount.toString().replace(/,/g, "") : 0.0;

        if (amountText < 0.01 || amountText > 50000.0) {
            this.setState({
                showLocalErrorMessage: AMOUNT_EXCEEDS_FIFTY_THOUSAND,
                showLocalError: true,
            });
        } else {
            if (amountText <= 50000.0) {
                const { transferParams } = this.state;
                this.setState({ showLocalError: false });
                transferParams.amountValue = amountValue
                    ? amountValue.toString().replace(/,/g, "").replace(".", "")
                    : 0;
                transferParams.amount = amount;
                transferParams.formattedAmount = amount;
                this.props.navigation.navigate(REQUEST_TO_PAY_REFERENCE, {
                    senderBrn: this.props.route.params?.senderBrn,
                    rtpType: this.props.route.params?.rtpType,
                    soleProp: this.props.route.params?.soleProp,
                    isRtpEnabled: this.props.route.params?.isRtpEnabled,
                    isRtdEnabled: this.props.route.params?.isRtdEnabled,
                    sourceFunds: this.props.route.params?.sourceFunds,
                    productId: this.props.route.params?.productId,
                    merchantId: this.props.route.params?.merchantId,
                    transferParams,
                    forwardItem: this.forwardItem,
                    screenDate: this.props.route.params?.screenDate,
                });
            }
        }
    };

    /***
     * _updateAmount
     * update the screen amount
     */
    _updateAmount = (val) => {
        const value = val ? parseInt(val) : 0;

        if (value > 0) {
            const formatted = this.numberWithCommas(value);
            setTimeout(() => {
                this.setState({ amount: formatted, amountValue: value });
            }, 1);
        } else {
            this.setState({ amount: "", amountValue: value });
        }
    };

    /***
     * changeText
     * change Text update state after formatting
     */
    changeText = (val) => {
        const value = val ? parseInt(val) : 0;

        if (value > 0) {
            const formatted = this.numberWithCommas(value);
            this.setState({ amount: formatted, amountValue: value, showLocalError: false });
        } else {
            this.setState({ amount: "", amountValue: value, showLocalError: false });
        }
    };

    /***
     * numberWithCommas
     * formate amount with comma
     */
    numberWithCommas = (val) => {
        const text = JSON.stringify(val);
        let x = "0.00";
        if (text) {
            let resStr = "";
            if (text.length === 1) {
                resStr =
                    text.substring(0, text.length - 2) + "0.0" + text.substring(text.length - 2);
            } else if (text.length < 3) {
                resStr =
                    text.substring(0, text.length - 2) + "0." + text.substring(text.length - 2);
            } else {
                if (parseInt(text) > 0) {
                    resStr =
                        text.substring(0, text.length - 2) + "." + text.substring(text.length - 2);
                } else {
                    resStr = "0.00";
                }
            }

            x = resStr.toString();
            const pattern = /(-?\d+)(\d{3})/;
            while (pattern.test(x)) x = x.replace(pattern, "$1,$2");
        }
        return x;
    };

    /***
     * formateAmount
     * formate amount
     */
    formateAmount = (text) => {
        return text.substring(0, text.length - 2) + "." + text.substring(text.length - 2);
    };

    /***
     * _onBackPress
     * on back button click event
     */
    _onBackPress = () => {
        this.props.navigation.goBack();
    };

    render() {
        const { showErrorModal, errorMessage, loader } = this.state;
        return (
            <ScreenContainer
                backgroundType="color"
                showErrorModal={showErrorModal}
                errorMessage={errorMessage}
                showOverlay={false}
                backgroundColor={MEDIUM_GREY}
                showLoaderModal={loader}
                analyticScreenName={"DuitNowRequest_Amount"}
            >
                <ScreenLayout
                    neverForceInset={["bottom"]}
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
                        <ScrollView showsHorizontalScrollIndicator={false}>
                            <View style={Styles.container}>
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
                                        text={ENTER_AMOUNT}
                                    />
                                </View>

                                <View style={Styles.amountViewTransfer}>
                                    <TextInput
                                        style={Styles.duitNowAmount}
                                        prefixStyle={[Styles.duitNowAmountFaded]}
                                        accessibilityLabel="Password"
                                        isValidate={this.state.showLocalError}
                                        errorMessage={this.state.showLocalErrorMessage}
                                        onSubmitEditing={this.onDone}
                                        value={this.state.amount}
                                        prefix={CURRENCY_CODE}
                                        clearButtonMode="while-editing"
                                        returnKeyType="done"
                                        editable={false}
                                        placeholder="0.00"
                                    />
                                </View>
                            </View>
                        </ScrollView>
                    </React.Fragment>
                </ScreenLayout>
                <NumericalKeyboard
                    value={`${this.state.amountValue}`}
                    onChangeText={this.changeText}
                    maxLength={8}
                    onDone={this.doneClick}
                />
            </ScreenContainer>
        );
    }
}

const Styles = {
    container: {
        flex: 1,
        alignItems: "flex-start",
        paddingEnd: 38,
        paddingStart: 36,
        marginBottom: 60,
    },
    footerContainer: {
        flex: 1,
        width: "100%",
        flexDirection: "column",
        justifyContent: "flex-end",
    },

    descriptionContainerAmount: {
        paddingTop: 26,
    },
    amountViewTransfer: {
        alignItems: "center",
        flexDirection: "row",
        marginTop: 4,
        width: "100%",
    },
    titleContainerTransferNew: {
        justifyContent: "flex-start",
        marginLeft: 1,
        width: "100%",
    },
};
export default RequestToPayAmount;
