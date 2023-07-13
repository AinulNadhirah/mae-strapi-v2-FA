import numeral from "numeral";
import PropTypes from "prop-types";
import React, { Component } from "react";
import { View, StyleSheet, Dimensions, Platform } from "react-native";

import HeaderLayout from "@layouts/HeaderLayout";
import ScreenLayout from "@layouts/ScreenLayout";

import HeaderBackButton from "@components/Buttons/HeaderBackButton";
import HeaderCloseButton from "@components/Buttons/HeaderCloseButton";
import CacheeImageWithDefault from "@components/CacheeImageWithDefault";
import ScreenContainer from "@components/Containers/ScreenContainer";
import NumericalKeyboard from "@components/NumericalKeyboard";
import Typo from "@components/Text";
import TextInput from "@components/TextInput";
import { showErrorToast } from "@components/Toast";

import { withModelContext } from "@context";

import { logEvent } from "@services/analytics";
import { ScanPayGA } from "@services/analytics/analyticsScanPay";

import { BLACK, DARK_GREY, MEDIUM_GREY, TRANSPARENT } from "@constants/colors";
import * as Strings from "@constants/strings";

import withFestive from "@utils/withFestive";

import Styles from "@styles/Wallet/TransferEnterAmountStyle";

const { width } = Dimensions.get("window");

class QREnterAmountRoot extends Component {
    static propTypes = {
        amount: PropTypes.string,
        applyBackspaceTint: PropTypes.bool,
        date: PropTypes.string,
        decimal: PropTypes.bool,
        description: PropTypes.string,
        footer: PropTypes.string,
        getModel: PropTypes.func,
        navigation: PropTypes.any,
        onBackPress: PropTypes.func,
        onDonePress: PropTypes.func,
        quickAction: PropTypes.bool,
        size: PropTypes.number,
        title: PropTypes.string,
        withTouch: PropTypes.bool,
        routeFromTab: PropTypes.any,
        festiveAssets: PropTypes.object,
        fxData: PropTypes.object,
    };

    static defaultProps = {
        applyBackspaceTint: true,
        decimal: false,
        size: 0,
        withTouch: true,
    };

    constructor(props) {
        super(props);

        if (this.props.amount == null) {
            this.state = {
                amount: "000",
                lengthError: false,
                amountText: "",
                numericKeyboardVal: "",
            };
        } else {
            this.state = {
                amount: this.props.amount,
                lengthError: false,
                amountText: this.props.amount,
                numericKeyboardVal: this.props.amount,
            };
        }

        console.log("loaded Edit Screen");
    }

    componentDidMount() {
        this.init();
    }

    init() {
        if (this.props.amount) {
            this.setState({ numericKeyboardVal: this.props.amount });
            //this._virtualKeyboard.setValue(this.props.amount);
        } else {
            this.setState({ amountZero: true });
        }
        if (this.props?.fxData?.result?.foreignCurrency) {
            ScanPayGA.viewScreenEnterAmount(this.props.fxData?.result?.foreignCurrency);
        }
        if (this.props?.routeFromTab === 0 && !this.props?.fxData?.result?.foreignCurrency) {
            logEvent(Strings.FA_VIEW_SCREEN, {
                [Strings.FA_SCREEN_NAME]: Strings.FA_SCANPAY_PAY_ENTERAMOUNT,
            });
        }
    }

    _onDoneClick = (val) => {
        console.log("doneClick val ", val);
        console.log("doneClick this.state.amountText ", this.state.amountText);
        const qrtempAmount = this.props.fxData
            ? numeral(
                  (1 / parseFloat(this.props.fxData?.result?.exchangeRate)) *
                      parseFloat(this.state.amountText.replace(/,/g, ""))
              ).format("0,0.00")
            : null;
        const tempAmount =
            qrtempAmount?.replace(/,/g, "") ?? this.state.amountText
                ? this.state.amountText.replace(/,/g, "")
                : "0.00";
        const tempErrorMessageAmount = this.props?.fxData?.result?.exchangeRate
            ? numeral(0.01 / (1 / parseFloat(this.props?.fxData?.result?.exchangeRate))).format(
                  "0.000"
              )
            : 0.01;
        const tempMaxLimitErrorMessageAmount = this.props?.fxData?.result?.exchangeRate
            ? numeral(1000 / (1 / parseFloat(this.props?.fxData?.result?.exchangeRate))).format(
                  "0.000"
              )
            : 1000.0;
        console.log("doneClick parseFloat(tempAmount) > 1000.00", parseFloat(tempAmount) > 1000.0);
        if (
            this.state.amountText.length <= 1 ||
            parseFloat(tempAmount) < parseFloat(tempErrorMessageAmount)
        ) {
            if (this.props?.fxData?.result?.exchangeRate != null) {
                showErrorToast({
                    message:
                        "Your amount should be at least " +
                        this.props.fxData.result.foreignCurrency +
                        " " +
                        tempErrorMessageAmount,
                });
            } else {
                showErrorToast({
                    message: Strings.QRPAY_MIN_LIMIT,
                });
            }

            if (this.state.amountText.length <= 0) {
                this.setState({ amountText: "0.00" });
            }
        } else if (parseFloat(tempAmount) > parseFloat(tempMaxLimitErrorMessageAmount)) {
            console.log("doneClick  ", Strings.QR_EXCEEDS_MAXIMUM);
            showErrorToast({ message: Strings.QR_MAXIMUM_LIMIT });
        } else {
            if (this.state.amountText.length != 0 && this.state.amountText != "000") {
                this.setState({
                    showLocalError: false,
                });
                this.setState({ showLocalError: false });
                this.props.onDonePress(tempAmount);
            }
        }
    };

    changeText = (val) => {
        console.log("changeText : ", val);
        const amt = val ? val.replace(/^0+/, "") : "0.00";
        console.log("changeText : ", amt);
        console.log("changeText : ", amt.length);
        console.log("changeText : ", parseFloat(amt));
        if (val && val !== "") {
            if (amt.length === 0) {
                this.setState({ amountText: "", numericKeyboardVal: "", amountZero: true });
            } else {
                if (parseFloat(amt) > 0) {
                    this.setState({ amountZero: false, amountText: this.numberWithCommas(amt) });
                } else {
                    this.setState({
                        amountText: "",
                        numericKeyboardVal: "",
                        amountZero: true,
                    });
                    //this._virtualKeyboard.setValue("");
                }
            }
        } else {
            //this._virtualKeyboard.setValue("000");
            this.setState({ amountText: "", numericKeyboardVal: "", amountZero: true });
        }
    };

    numberWithCommas = (text) => {
        // console.log("numberWithCommas : ", text);
        let x = "0.00";
        let textTemp = "";
        text =
            text && text.length >= 3 && text.toString().substring(0, 3) === "000"
                ? text.toString().substring(3, text.length)
                : text;

        textTemp = text.replace(/,/g, "").replace(".", "");
        text = textTemp.trim();
        if (text && parseInt(text) > 0) {
            //this._virtualKeyboard.setValue(text);
            this.setState({ numericKeyboardVal: text });
        }

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

    formateAmount = (text) => {
        return text.substring(0, text.length - 2) + "." + text.substring(text.length - 2);
    };

    _onBackPress = () => {
        console.log("_onBackPress");
        this.props.onBackPress();
    };

    render() {
        const { getModel, fxData, festiveAssets } = this.props;
        const { showErrorModal, errorMessage } = this.state;
        const { isTapTasticReady } = getModel("misc");

        calculateForeignRate = (fxData, amountText) => {
            const exchangeRate = fxData?.result?.exchangeRate;
            const amount = parseFloat(amountText?.replace(/,/g, "")) || 0;
            const approximateAmount = (1 / exchangeRate) * amount;
            const formattedAmount = numeral(approximateAmount).format("0,0.00");
            return `Approx. MYR ${formattedAmount}`;
        };

        calculateIndicativeExchangeRate = (fxData) => {
            const exchangeRate = parseFloat(fxData?.result?.exchangeRate);
            const foreignCurrency = fxData?.result?.foreignCurrency;
            const approximateAmount = numeral(String(1 / exchangeRate));
            const formattedAmount = approximateAmount.format("0,0.000000");
            return `Based on Maybank's indicative exchange rate of\n${"1.00"} ${foreignCurrency} = ${formattedAmount} MYR`;
        };

        return (
            <ScreenContainer
                backgroundType="color"
                showErrorModal={showErrorModal}
                errorMessage={errorMessage}
                showOverlay={false}
                backgroundColor={MEDIUM_GREY}
                analyticScreenName={
                    this.props?.routeFromTab === 1 ? Strings.FA_SCANPAY_RECEIVE_ENTERAMOUNT : null
                }
            >
                <CacheeImageWithDefault
                    resizeMode={Platform.OS === "ios" ? "stretch" : "cover"}
                    style={styles.imgBg}
                    image={festiveAssets?.qrPay.background}
                />
                <ScreenLayout
                    header={
                        <HeaderLayout
                            headerCenterElement={
                                <Typo
                                    fontSize={16}
                                    fontWeight="600"
                                    lineHeight={19}
                                    color={isTapTasticReady && BLACK}
                                    text={festiveAssets?.qrPay.enterAmountTitle}
                                />
                            }
                            headerLeftElement={<HeaderBackButton onPress={this._onBackPress} />}
                            headerRightElement={<HeaderCloseButton onPress={this._onBackPress} />}
                        />
                    }
                    useSafeArea
                    neverForceInset={["bottom"]}
                    paddingHorizontal={0}
                    paddingBottom={0}
                >
                    <React.Fragment>
                        <View
                            style={
                                // this.props.quickAction
                                isTapTasticReady ? styles.plainContainer : styles.blockContainer
                            }
                        >
                            <View style={Styles.blockNew}>
                                <View style={Styles.titleContainerTransferNew}>
                                    {/* <AccountDetailsView
                                        data={this.state.screenData}
                                        base64={this.state.transferParams !== 1}
                                        image={this.state.image}
                                    /> */}
                                </View>

                                <View style={Styles.descriptionContainerAmount1}>
                                    <Typo
                                        fontSize={14}
                                        fontWeight="600"
                                        fontStyle="normal"
                                        letterSpacing={0}
                                        lineHeight={18}
                                        textAlign="left"
                                        text="Amount"
                                    />
                                    <Typo
                                        fontSize={20}
                                        fontWeight="300"
                                        fontStyle="normal"
                                        letterSpacing={0}
                                        lineHeight={28}
                                        textAlign="left"
                                        style={styles.amount}
                                        text={Strings.ENTER_AMOUNT}
                                    />
                                </View>

                                <View style={Styles.amountViewTransfer1}>
                                    <TextInput
                                        // style={{ color: this.state.amountZero ? GREY : BLACK }}
                                        placeholder="0.00"
                                        accessibilityLabel="Enter amount"
                                        isValidate={this.state.showLocalError}
                                        errorMessage={this.state.showLocalErrorMessage}
                                        onSubmitEditing={this.onDone}
                                        value={this.state.amountText}
                                        prefix={
                                            fxData?.result?.foreignCurrency ?? Strings.CURRENCY_CODE
                                        }
                                        clearButtonMode="while-editing"
                                        returnKeyType="done"
                                        editable={false}
                                    />
                                </View>
                                {fxData?.result?.exchangeRate && (
                                    <>
                                        <View style={styles.amountDesc}>
                                            <Typo
                                                fontSize={12}
                                                fontWeight="400"
                                                fontStyle="normal"
                                                letterSpacing={0}
                                                lineHeight={15}
                                                textAlign="left"
                                                color={DARK_GREY}
                                                style={styles.amountDesc}
                                                text={calculateForeignRate(
                                                    fxData,
                                                    this.state.amountText
                                                )}
                                            />
                                        </View>
                                        <View style={styles.amountDesc}>
                                            <Typo
                                                fontSize={12}
                                                fontWeight="400"
                                                fontStyle="normal"
                                                letterSpacing={0}
                                                lineHeight={15}
                                                textAlign="left"
                                                color={DARK_GREY}
                                                style={styles.amountDesc}
                                                text={calculateIndicativeExchangeRate(fxData)}
                                            />
                                        </View>
                                    </>
                                )}
                            </View>
                        </View>
                    </React.Fragment>
                </ScreenLayout>
                {/* <VirtualKeyboard
                    ref={(vk) => (this._virtualKeyboard = vk)}
                    color="black"
                    pressMode="string"
                    decimal={true}
                    onPress={this.changeText}
                    onDonePress={this._onDoneClick}
                    size={10}
                /> */}
                <NumericalKeyboard
                    value={this.state.numericKeyboardVal}
                    onChangeText={this.changeText}
                    maxLength={10}
                    onDone={this._onDoneClick}
                />
            </ScreenContainer>
        );
    }
}

//     render() {
//         return (
//             <View style={styles.container}>
//                 <HeaderPageIndicator
//                     showBack={this.props.noBack === true ? false : true}
//                     showClose={true}
//                     showIndicator={false}
//                     showTitle={false}
//                     showBackIndicator={false}
//                     pageTitle={""}
//                     numberOfPages={1}
//                     currentPage={this.state.currentScreen}
//                     navigation={this.props.navigation}
//                     noPop={true}
//                     noClose={true}
//                     moduleName={navigationConstant.WALLET_MODULE}
//                     routeName={navigationConstant.QRPAY_MAIN}
//                     onBackPress={() => {
//                         this.props.onBackPress();
//                     }}
//                     onClosePress={() => {
//                         this.props.onBackPress();
//                     }}
//                 />
//                 <View style={styles.block}>
//                     <View style={styles.titleContainer}>
//                         <Text style={[styles.titleText, commonStyle.font]}>QRPay</Text>
//                     </View>
//                     <View style={styles.descriptionContainer}>
//                         <Text style={[styles.descriptionText, commonStyle.font]}>
//                             Please enter your amount{" "}
//                         </Text>
//                     </View>
//                     <View style={styles.inputContainer}>
//                         <Text
//                             style={{ color: "#000000", fontWeight: "800", fontSize: 20 }}
//                             accessible={true}
//                             testID={"txtByClickingNext"}
//                             accessibilityLabel={"txtByClickingNext"}
//                         >
//                             {Strings.CURRENCY_CODE}
//                         </Text>
//                         <HighlightAmount
//                             highlightStyle={{ color: "#000000", fontWeight: "800", fontSize: 20 }}
//                             searchWords={[this.state.amount.toString()]}
//                             style={[
//                                 { marginLeft: 10 },
//                                 { color: "#000000", fontWeight: "800", fontSize: 20 },
//                                 commonStyle.font,
//                             ]}
//                             textToHighlight={this.state.amount.toString()}
//                             testID={"inputAmount"}
//                             accessibilityLabel={"inputAmount"}
//                         />
//                     </View>
//                 </View>
//                 {this.state.lengthError == true ? (
//                     <ErrorMessage
//                         onClose={() => {
//                             this.setState({ lengthError: false });
//                         }}
//                         title="Alert"
//                         description="Please enter valid Amount"
//                         showOk={true}
//                         onOkPress={() => {
//                             this.setState({ lengthError: false });
//                         }}
//                     />
//                 ) : null}
//                 <VirtualKeyboard
//                     ref={(vk) => (this._virtualKeyboard = vk)}
//                     color="black"
//                     pressMode="string"
//                     decimal={true}
//                     onPress={(val) => this.changeText(val)}
//                     onDonePress={(val) => this.doneClick(val)}
//                     size={10}
//                 />
//             </View>
//         );
//     }
// }

const styles = StyleSheet.create({
    amount: { marginTop: 5 },
    amountDesc: {
        flexDirection: "row",
        marginVertical: 5,
    },
    blockContainer: {
        backgroundColor: MEDIUM_GREY,
        flex: 1,
        width: "100%",
    },
    imgBg: {
        flex: 1,
        height: "25%",
        position: "absolute",
        width,
    },
    plainContainer: {
        backgroundColor: TRANSPARENT,
        flex: 1,
        width: "100%",
    },
});

const QREnterAmount = withModelContext(withFestive(QREnterAmountRoot));

export { QREnterAmount };
