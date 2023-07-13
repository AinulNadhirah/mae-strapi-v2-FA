import PropTypes from "prop-types";
import React, { Component } from "react";
import { View, ScrollView } from "react-native";

import { TRANSFER_REFERENCE_AMOUNT } from "@navigation/navigationConstant";

import HeaderLayout from "@layouts/HeaderLayout";
import ScreenLayout from "@layouts/ScreenLayout";

import HeaderBackButton from "@components/Buttons/HeaderBackButton";
import { AccountDetailsView } from "@components/Common";
import ScreenContainer from "@components/Containers/ScreenContainer";
import NumericalKeyboard from "@components/NumericalKeyboard";
import Typo from "@components/Text";
import TextInput from "@components/TextInput";

import { GATransfer } from "@services/analytics/analyticsTransfer";
import { fundTransferInquiryApi } from "@services/index";

import { MEDIUM_GREY } from "@constants/colors";
import { FUND_TRANSFER_TYPE_INTERBANK, FUND_TRANSFER_TYPE_MAYBANK } from "@constants/fundConstants";
import {
    AMOUNT_ERROR,
    AMOUNT_EXCEEDS_MAXIMUM,
    ENTER_AMOUNT,
    CURRENCY_CODE,
    TRANSFER_TO_HEADER,
} from "@constants/strings";

import { getTransferAccountType } from "@utils/dataModel/utilityPartial.5";

("use strict");

class TransferEnterAmount extends Component {
    static navigationOptions = { title: "", header: null };

    /***
     * constructor
     * props
     */
    constructor(props) {
        super(props);
        this.state = {
            amount: "",
            fullName: "",
            loader: false,
            screenData: {
                image: "",
                name: "",
                description1: "",
                description2: "",
            },
            showLocalError: false,
            showLocalErrorMessage: "",
            errorMessage: AMOUNT_ERROR,
            transferParams: {},
            image: "",
            transferFlow: 0,
            amountZero: true,
            amountValue: 0,
        };
    }

    /***
     * componentDidMount
     * Update Screen date
     */
    async componentDidMount() {
        console.log("[TransferEnterAmount] >> [componentDidMount] : ");
        this.updateData();

        this.focusSubscription = this.props.navigation.addListener("focus", () => {
            console.log("[TransferEnterAmount] >> [componentDidMount] focusSubscription : ");
            this.updateData();
        });

        const transferParams = this.props.route.params?.transferParams;
        GATransfer.viewScreenAmount(getTransferAccountType(transferParams.transferFlow));
    }

    /***
     * componentWillUnmount
     * Handle Screen UnMount Event
     */
    componentWillUnmount() {
        console.log("[TransferEnterAmount] >> [componentWillUnmount] : ");
        this.focusSubscription();
    }

    /***
     * updateData
     * Update Screen Date
     */
    async updateData() {
        console.log("[TransferEnterAmount] >> [updateData] : ");
        const transferParams = this.props.route.params?.transferParams ?? this.state.screenData;
        console.log("[TransferEnterAmount] >> [updateData] transferParams==> ", transferParams);
        console.log(
            "[TransferEnterAmount] >> [updateData] transferParams.image==> ",
            transferParams.image
        );
        const screenData = {
            image: transferParams.image,
            name: transferParams.formattedToAccount,
            description1: transferParams.accountName,
            description2: transferParams.bankName,
        };
        const amountValue =
            transferParams && transferParams.amountValue
                ? transferParams.amountValue.toString().replace(/,/g, "").replace(".", "")
                : 0.0;

        console.log("updateData amountValue ==> ", amountValue);
        if (amountValue && amountValue >= 0.01) {
            console.log("updateData UPDATED amountValue ==> ", amountValue);
            this._updateAmount(amountValue);
        }
        console.log("[TransferEnterAmount] >> [updateData] screenData ==> ", screenData);
        this.setState(
            {
                transferFlow: transferParams.transferFlow,
                transferParams: transferParams,
                errorMessage: AMOUNT_ERROR,
                screenData: screenData,
                amountValue: amountValue,
            },
            () => {
                if (transferParams.transferFlow === 2 && transferParams.isMaybankTransfer) {
                    this.setState({ loader: true });

                    this._fundTransferInquiryApi(transferParams);
                } else {
                    this.setState({ fullName: transferParams.accountName });
                }
            }
        );

        let tempAmount =
            transferParams.amount && transferParams.amount > parseFloat("0.00")
                ? transferParams.amount.replace(",", "")
                : "";
        //tempAmount = tempAmount.replace(".", "");
        const amountZero = tempAmount <= parseFloat("0.00") ? true : false;

        this.setState({
            loader: false,
            amount: tempAmount ? tempAmount : "",
            amountZero: amountZero,
        });
    }

    /***
     * _fundTransferInquiryApi
     * fund Transfer Inquiry Api call
     */
    _fundTransferInquiryApi = (transferParams) => {
        console.log("[TransferEnterAmount] >> [_fundTransferInquiryApi] : ");

        let subUrl = "/fundTransfer/inquiry";
        let params = {};

        try {
            params = {
                bankCode: transferParams.bankCode,
                fundTransferType: !transferParams.isMaybankTransfer
                    ? FUND_TRANSFER_TYPE_INTERBANK
                    : FUND_TRANSFER_TYPE_MAYBANK,
                toAccount: transferParams.toAccount,
                payeeCode: transferParams.toAccountCode,
                swiftCode: transferParams.swiftCode,
            };
            console.log("[TransferEnterAmount] >> [_fundTransferInquiryApi] params ==> ", params);

            fundTransferInquiryApi(subUrl, params)
                .then((response) => {
                    const responseObject = response.data;
                    console.log(
                        "[TransferEnterAmount] >> [_fundTransferInquiryApi] authenticationObject ==> ",
                        responseObject
                    );
                    if (responseObject) {
                        if (responseObject.accountHolderName) {
                            let fullName = responseObject.accountHolderName;

                            if (fullName != undefined && fullName.length >= 1) {
                                transferParams.accountName = fullName;
                                transferParams.recipientFullName = fullName;
                                transferParams.recipientName = fullName;
                                this.setState({
                                    fullName: fullName,
                                    transferParams: transferParams,
                                });
                            }
                        }
                        this.setState({ loader: false });
                    } else {
                        this.setState({ loader: false, error: true });
                    }
                })
                .catch((error) => {
                    console.log(
                        "[TransferEnterAmount] >> [_fundTransferInquiryApi] ERROR==> ",
                        error
                    );
                    this.setState({ loader: false });
                });
        } catch (e) {
            console.log("[TransferEnterAmount] >> [_fundTransferInquiryApi] catch ERROR==> " + e);
        }
    };

    /***
     * doneClick
     * on Done Button Click
     */
    doneClick = () => {
        console.log("[TransferEnterAmount] >> [doneClick] : ");
        const { amountValue, amount, fullName } = this.state;
        console.log("[TransferEnterAmount] >> [doneClick] this.state.amount ", amount);

        let amountText = amount ? amount.toString().replace(/,/g, "") : "";

        console.log("[TransferEnterAmount] >> [doneClick] amount ==> ", amount);
        console.log("[TransferEnterAmount] >> [doneClick] amountText ==> ", amountText);
        console.log(
            "[TransferEnterAmount] >> [doneClick] amountText > 999999.99 ==> ",
            amountText > 999999.99
        );

        if (!amountText) {
            amountText = 0;
        }

        if (amountText < 0.01) {
            this.setState({ showLocalErrorMessage: this.state.errorMessage, showLocalError: true });
        } else if (amountText > 999999.99) {
            console.log("[TransferEnterAmount] >> [doneClick]  ", AMOUNT_EXCEEDS_MAXIMUM);
            this.setState({
                showLocalErrorMessage: AMOUNT_EXCEEDS_MAXIMUM,
                showLocalError: true,
            });
        } else {
            if (amountText <= 999999.99) {
                let { transferParams } = this.state;
                this.setState({ showLocalError: false });
                transferParams.amountValue = amountValue
                    ? amountValue.toString().replace(/,/g, "").replace(".", "")
                    : 0;
                transferParams.amount = amount;
                transferParams.formattedAmount = amount;
                transferParams.fullName = fullName ? fullName : transferParams.fullName;
                transferParams.accountName = fullName ? fullName : transferParams.accountName;
                transferParams.recipientFullName = fullName
                    ? fullName
                    : transferParams.recipientFullName;
                transferParams.recipientName = fullName ? fullName : transferParams.recipientName;

                console.log(
                    "[TransferEnterAmount] >> [doneClick] transferParams ==> ",
                    transferParams
                );
                this.props.navigation.navigate(TRANSFER_REFERENCE_AMOUNT, {
                    transferParams,
                });
            }
        }
    };

    /***
     * _updateAmount
     * update the screen amount
     */
    _updateAmount = (val) => {
        console.log("[TransferEnterAmount] >> [doneClick] changeText : ", val);
        let value = val ? parseInt(val) : 0;
        // const amountVal = parseInt(val, 10) / 100;
        // const amountString = Numeral(amountVal).format("0,0.00");

        // this.setState({ amount: amountString, amountValue: val }, () => {
        //     console.log("changeText: ", amountString);
        // });

        if (value > 0) {
            const formatted = this.numberWithCommas(value);
            console.log("[TransferEnterAmount] >> [doneClick] formatted : ", formatted);
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
        console.log("[TransferEnterAmount] >> [changeText] val : ", val);
        let value = val ? parseInt(val) : 0;
        // const amountVal = parseInt(val, 10) / 100;
        // const amountString = Numeral(amountVal).format("0,0.00");

        // this.setState({ amount: amountString, amountValue: val }, () => {
        //     console.log("changeText: ", amountString);
        // });

        if (value > 0) {
            const formatted = this.numberWithCommas(value);
            console.log("[TransferEnterAmount] >> [changeText]  formatted : ", formatted);
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
        console.log("[TransferEnterAmount] >> [numberWithCommas] val : ", val);
        let text = JSON.stringify(val);
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
        console.log("[TransferEnterAmount] >> [numberWithCommas] text : ", text);
        return text.substring(0, text.length - 2) + "." + text.substring(text.length - 2);
    };

    /***
     * _onBackPress
     * on back button click event
     */
    _onBackPress = () => {
        console.log("[TransferEnterAmount] >> [_onBackPress] : ");
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
                        <ScrollView showsHorizontalScrollIndicator={false}>
                            <View style={Styles.container}>
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
                                        text={ENTER_AMOUNT}
                                    />
                                </View>

                                <View style={Styles.amountViewTransfer}>
                                    <TextInput
                                        style={Styles.duitNowAmount}
                                        prefixStyle={[Styles.duitNowAmountFaded]}
                                        accessibilityLabel={"Password"}
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
                        <NumericalKeyboard
                            value={`${this.state.amountValue}`}
                            onChangeText={this.changeText}
                            maxLength={8}
                            onDone={this.doneClick}
                        />
                    </React.Fragment>
                </ScreenLayout>
            </ScreenContainer>
        );
    }
}

TransferEnterAmount.propTypes = {
    navigation: PropTypes.object,
    route: PropTypes.object,
};

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
//make this component available to the app
export default TransferEnterAmount;
