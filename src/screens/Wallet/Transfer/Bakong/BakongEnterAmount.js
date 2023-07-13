import PropTypes from "prop-types";
import React, { Component } from "react";
import { View, ScrollView, TouchableOpacity, Image } from "react-native";

import HeaderLayout from "@layouts/HeaderLayout";
import ScreenLayout from "@layouts/ScreenLayout";

import HeaderBackButton from "@components/Buttons/HeaderBackButton";
import { AccountDetailsView } from "@components/Common";
import ScreenContainer from "@components/Containers/ScreenContainer";
import NumericalKeyboard from "@components/NumericalKeyboard";
import ScrollPicker from "@components/Pickers/ScrollPicker";
import Typography from "@components/Text";
import TextInput from "@components/TextInput";
import { errorToastProp, showErrorToast } from "@components/Toast";

import { bankingGetDataMayaM2u, invokeL3 } from "@services";
import ApiManager from "@services/ApiManager";
import { logEvent } from "@services/analytics";

import { METHOD_POST, TIMEOUT, TOKEN_TYPE_M2U } from "@constants/api";
import {
    DARK_GREY,
    FADE_SELECT_GREY,
    MEDIUM_GREY,
    PINKISH_GREY,
    ROYAL_BLUE,
} from "@constants/colors";
import {
    AMOUNT_EXCEEDS_MAXIMUM,
    ENTER_AMOUNT,
    FA_SCREEN_NAME,
    FA_VIEW_SCREEN,
} from "@constants/strings";
import { BAKONG_ENDPOINT } from "@constants/url";

import { formateAccountNumber, formatBakongMobileNumbers } from "@utils/dataModel/utility";
import { ErrorLogger } from "@utils/logs";

import assets from "@assets";

const AMOUNT_ERROR =
    "The minimum amount for this transaction is RM1.00 or USD0.01. Please try again.";

class BakongEnterAmount extends Component {
    /***
     * constructor
     * props
     */
    constructor(props) {
        super(props);
        this.state = {
            amount: "",
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
            amountZero: true,
            amountValue: 0,
            selectedCurrency: "USD",
            showConversion: false,
            converted: false,
            convertedAmount: "", // "USD xx" / "MYR xx"
            convertedRate: "", // "USD xx = MYR xx"
            showScrollPicker: false,
            scrollPickerData: [
                {
                    title: "USD",
                    value: 0,
                },
                {
                    title: "MYR",
                    value: 1,
                },
            ],
            // first account data
            accountList: [],
            fromAccountNo: "",
            fromAccountType: "",
            fromAccountCode: "",
        };
    }

    /***
     * componentDidMount
     * Update Screen date
     */
    async componentDidMount() {
        console.log("[BakongEnterAmount] >> [componentDidMount] : ");

        this.focusSubscription = this.props.navigation.addListener("focus", () => {
            console.log("[BakongEnterAmount] >> [componentDidMount] focusSubscription : ");
            // this._fetchUserAccountsList();
            this._requestL3Permission();
            this.updateData();
        });

        // Analytics - view_screen
        this._logAnalyticsEvent("M2U_TRF_Overseas_Bakong_2Amount");
    }

    /***
     * componentWillUnmount
     * Handle Screen UnMount Event
     */
    componentWillUnmount() {
        console.log("[BakongEnterAmount] >> [componentWillUnmount] : ");
        this.focusSubscription();
    }

    /***
     * updateData
     * Update Screen Date
     */
    async updateData() {
        const transferParams = this.props.route.params.transferParams;
        console.log("[BakongEnterAmount] >> [updateData] transferParams==> ", transferParams);
        console.log(
            "[BakongEnterAmount] >> [updateData] transferParams.image==> ",
            transferParams.image
        );
        const screenData = {
            image: transferParams.image,
            name: "+855 " + formatBakongMobileNumbers(transferParams.mobileNo),
            description1: transferParams.name,
            description2: transferParams.transactionTo,
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
        console.log("[BakongEnterAmount] >> [updateData] screenData ==> ", screenData);
        this.setState(
            {
                transferParams: transferParams,
                errorMessage: AMOUNT_ERROR,
                screenData: screenData,
                amountValue: amountValue,
            },
            () => {
                // TODO: go to next step
                // this.setState({ loader: true });
                // this._fundTransferInquiryApi(transferParams);
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

    _fetchUserAccountsList = async (redirect) => {
        const request = await this._requestL3Permission();
        if (!request) {
            // this.props.navigation.goBack();
            this._onBackPress();
            return;
        }

        const subUrl = "/summary";
        const params = "?type=A";

        bankingGetDataMayaM2u(subUrl + params, true)
            .then((response) => {
                const result = response.data.result;
                console.tron.log(
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

                    console.log(
                        "[BakongEnterAmount][_fetchUserAccountList] newAccountList:",
                        newAccountList
                    );

                    // Save into state details about first account number
                    if (newAccountList.length) {
                        const { number, type, code } = newAccountList[0];
                        this.setState(
                            {
                                fromAccountNo: number,
                                fromAccountType: type,
                                fromAccountCode: code,
                            },
                            () => {
                                console.tron.log(
                                    "[BakongEnterAmount][_fetchUserAccountList] saved first account! state:",
                                    this.state
                                );
                                this._getConversionData(redirect);
                            }
                        );
                    } else {
                        showErrorToast(
                            errorToastProp({
                                message: "Unable to retrieve your accounts. Please try again.",
                            })
                        );
                        // this.props.navigation.goBack();
                        this._onBackPress();
                    }
                } else {
                    console.log("[Summary][_fetchUserAccountList] No results!");
                    showErrorToast(
                        errorToastProp({
                            message: "Unable to retrieve your accounts. Please try again.",
                        })
                    );
                    // this.props.navigation.goBack();
                    this._onBackPress();
                }
            })
            .catch((Error) => {
                console.log("[Summary][_fetchUserAccountList] ERROR: ", Error);
                showErrorToast(
                    errorToastProp({
                        message: "Unable to retrieve your accounts. Please try again.",
                    })
                );
                // this.props.navigation.goBack();
                this._onBackPress();
            });
    };

    _getConvertedAmount = async (data) => {
        try {
            return await ApiManager.service({
                url: `${BAKONG_ENDPOINT}/payment/currencyAmountInquiry?status=RFQ_1`,
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

    _onPressConvert = () => {
        this._fetchUserAccountsList(false);
    };

    _getConversionData = async (redirect) => {
        console.tron.log("[BakongEnterAmount][_getConversionData]");
        try {
            const { amount, selectedCurrency, fromAccountNo, fromAccountType, fromAccountCode } =
                this.state;
            const response = await this._getConvertedAmount({
                currency: selectedCurrency,
                transferAmount: amount,
                fromAccount: fromAccountNo,
                fromAccountType: fromAccountType,
                fromAccountCode: fromAccountCode,
            });
            const { data } = response;
            console.log("[BakongEnterAmount][_onPressConvert] data: ", data);
            const { allinRate, contraAmount } = data;
            this.setState({
                converted: true,
                convertedRate: `USD 1 = MYR ${allinRate}`,
                convertedAmount:
                    selectedCurrency === "USD" ? `MYR ${contraAmount}` : `USD ${contraAmount}`,
            });
            if (data.statusCode === "0000" && redirect) this.continueToNextScreen();
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

    continueToNextScreen = () => {
        const { transferParams } = this.state;

        if (this.props.route.params.confirmation) {
            this.props.navigation.navigate("BakongSummary", {
                transferParams: { ...transferParams },
            });
        } else if (transferParams.favorite) {
            this.props.navigation.navigate("BakongEnterPurpose", {
                transferParams: { ...transferParams },
            });
        } else {
            this.props.navigation.navigate("BakongEnterRecipientID", {
                transferParams: { ...transferParams },
            });
        }
    };

    /***
     * doneClick
     * on Done Button Click
     */
    doneClick = async () => {
        console.log("[BakongEnterAmount] >> [doneClick] : ");
        const { amount, selectedCurrency, converted } = this.state;
        console.log("[BakongEnterAmount] >> [doneClick] this.state.amount ", amount);

        let amountText = amount ? amount.toString().replace(/,/g, "") : "";

        console.log("[BakongEnterAmount] >> [doneClick] amount ==> ", amount);
        console.log("[BakongEnterAmount] >> [doneClick] amountText ==> ", amountText);
        console.log(
            "[BakongEnterAmount] >> [doneClick] amountText > 999999.99 ==> ",
            amountText > 999999.99
        );

        if (!amountText) {
            amountText = 0;
        }

        if (
            (selectedCurrency === "USD" && amountText < 0.01) ||
            (selectedCurrency === "MYR" && amountText < 1)
        ) {
            this.setState({ showLocalErrorMessage: AMOUNT_ERROR, showLocalError: true });
        } else if (amountText > 999999.99) {
            console.log("[BakongEnterAmount] >> [doneClick]  ", AMOUNT_EXCEEDS_MAXIMUM);
            this.setState({
                showLocalErrorMessage: AMOUNT_EXCEEDS_MAXIMUM,
                showLocalError: true,
            });
        } else {
            if (amountText <= 999999.99) {
                this.setState({ showLocalError: false });

                let { transferParams } = this.state;
                // transferParams.amountValue = amountValue
                //     ? amountValue.toString().replace(/,/g, "").replace(".", "")
                //     : 0;
                transferParams.amountValue = amount;
                transferParams.amountCurrency = selectedCurrency;
                // transferParams.fullName = fullName ? fullName : transferParams.fullName;
                // transferParams.accountName = fullName ? fullName : transferParams.accountName;
                // transferParams.recipientFullName = fullName
                //     ? fullName
                //     : transferParams.recipientFullName;
                // transferParams.recipientName = fullName ? fullName : transferParams.recipientName;

                console.log(
                    "[BakongEnterAmount] >> [doneClick] transferParams ==> ",
                    transferParams
                );
                try {
                    if (!converted) {
                        await this._fetchUserAccountsList(true);
                    } else {
                        this.continueToNextScreen();
                    }
                } catch (error) {
                    showErrorToast(
                        errorToastProp({
                            message:
                                error.message ??
                                "Unable to get indicative conversion rate. Please try again.",
                        })
                    );
                    ErrorLogger(error);
                }
            }
        }
    };

    /***
     * _updateAmount
     * update the screen amount
     */
    _updateAmount = (val) => {
        console.log("[BakongEnterAmount] >> [doneClick] changeText : ", val);
        let value = val ? parseInt(val) : 0;
        // const amountVal = parseInt(val, 10) / 100;
        // const amountString = Numeral(amountVal).format("0,0.00");

        // this.setState({ amount: amountString, amountValue: val }, () => {
        //     console.log("changeText: ", amountString);
        // });

        if (value > 0) {
            const formatted = this.numberWithCommas(value);
            console.log("[BakongEnterAmount] >> [doneClick] formatted : ", formatted);
            setTimeout(() => {
                this.setState({ amount: formatted, amountValue: value, showConversion: true });
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
        console.log("[BakongEnterAmount] >> [changeText] val : ", val);
        let value = val ? parseInt(val) : 0;
        // const amountVal = parseInt(val, 10) / 100;
        // const amountString = Numeral(amountVal).format("0,0.00");

        // this.setState({ amount: amountString, amountValue: val }, () => {
        //     console.log("changeText: ", amountString);
        // });

        if (value > 0) {
            const formatted = this.numberWithCommas(value);
            console.log("[BakongEnterAmount] >> [changeText]  formatted : ", formatted);
            this.setState({
                amount: formatted,
                amountValue: value,
                showLocalError: false,
                showConversion: true,
                converted: false,
                convertedAmount: "",
            });
        } else {
            this.setState({
                amount: "",
                amountValue: value,
                showLocalError: false,
                showConversion: false,
            });
        }
    };

    /***
     * numberWithCommas
     * formate amount with comma
     */
    numberWithCommas = (val) => {
        console.log("[BakongEnterAmount] >> [numberWithCommas] val : ", val);
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
        console.log("[BakongEnterAmount] >> [numberWithCommas] text : ", text);
        return text.substring(0, text.length - 2) + "." + text.substring(text.length - 2);
    };

    /***
     * _onBackPress
     * on back button click event
     */
    _onBackPress = () => {
        console.log("[BakongEnterAmount] >> [_onBackPress] : ");
        const { transferParams } = this.state;
        if (this.props.route.params.confirmation) {
            this.props.navigation.navigate("BakongSummary", {
                transferParams: { ...transferParams },
            });
        } else {
            this.props.navigation.navigate("BakongEnterMobileNo", {
                transferParams: { ...transferParams },
            });
            // this.props.navigation.goBack();
        }
    };

    _onScrollPickerShow = () => {
        this._logAnalyticsEvent("M2U_TRF_Overseas_Bakong_2.1AmountCurrency");
        this.setState({ showScrollPicker: true });
    };

    _onScrollPickerDismissed = () => this.setState({ showScrollPicker: false });

    _onScrollPickerDoneButtonPressed = (value) =>
        this.setState({
            selectedCurrency: value === 0 ? "USD" : "MYR",
            showScrollPicker: false,
            converted: false,
        });

    _logAnalyticsEvent = (screenName) => {
        logEvent(FA_VIEW_SCREEN, {
            [FA_SCREEN_NAME]: screenName,
        });
    };

    render() {
        const {
            showErrorModal,
            errorMessage,
            showConversion,
            converted,
            showScrollPicker,
            scrollPickerData,
        } = this.state;
        return (
            <React.Fragment>
                <ScreenContainer
                    backgroundType="color"
                    showErrorModal={showErrorModal}
                    errorMessage={errorMessage}
                    showOverlay={showScrollPicker}
                    backgroundColor={MEDIUM_GREY}
                    // analyticScreenName="M2U_TRF_Overseas_Bakong_2Amount"
                >
                    <ScreenLayout
                        header={
                            <HeaderLayout
                                headerCenterElement={
                                    <Typography
                                        fontSize={16}
                                        fontWeight="600"
                                        lineHeight={19}
                                        text="Bakong"
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
                                            base64
                                            greyed
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
                                            text={ENTER_AMOUNT}
                                        />
                                    </View>

                                    <View style={Styles.amountViewTransfer}>
                                        <TouchableOpacity
                                            onPress={this._onScrollPickerShow}
                                            style={Styles.touchableCurrencyContainer}
                                        >
                                            <Typography
                                                fontSize={20}
                                                fontWeight="600"
                                                fontStyle="normal"
                                                letterSpacing={0}
                                                lineHeight={22}
                                                color={FADE_SELECT_GREY}
                                                textAlign="left"
                                                text={this.state.selectedCurrency}
                                            />

                                            <Image
                                                style={Styles.icDropDown}
                                                source={assets.downArrow}
                                            />
                                        </TouchableOpacity>

                                        <View style={Styles.inputContainer}>
                                            <TextInput
                                                isValidate={this.state.showLocalError}
                                                errorMessage={this.state.showLocalErrorMessage}
                                                onSubmitEditing={this.onDone}
                                                value={this.state.amount}
                                                clearButtonMode="while-editing"
                                                returnKeyType="done"
                                                editable={false}
                                                placeholder="0.00"
                                            />
                                        </View>
                                    </View>
                                    {showConversion && (
                                        <View>
                                            {!converted ? (
                                                <TouchableOpacity onPress={this._onPressConvert}>
                                                    <Typography
                                                        fontSize={14}
                                                        fontWeight="600"
                                                        fontStyle="normal"
                                                        letterSpacing={0}
                                                        lineHeight={22}
                                                        color={ROYAL_BLUE}
                                                        textAlign="left"
                                                        text={`View amount in ${
                                                            this.state.selectedCurrency === "USD"
                                                                ? "MYR"
                                                                : "USD"
                                                        } `}
                                                    />
                                                </TouchableOpacity>
                                            ) : (
                                                <View>
                                                    <Typography
                                                        fontSize={12}
                                                        fontWeight="600"
                                                        fontStyle="normal"
                                                        letterSpacing={0}
                                                        lineHeight={22}
                                                        color={DARK_GREY}
                                                        textAlign="left"
                                                        text={`Approximately ${this.state.convertedAmount}`}
                                                    />
                                                    <View style={Styles.conversionNote}>
                                                        <Typography
                                                            fontSize={12}
                                                            fontWeight="normal"
                                                            fontStyle="normal"
                                                            letterSpacing={0}
                                                            lineHeight={14}
                                                            color={DARK_GREY}
                                                            textAlign="left"
                                                            text={`Based on Maybank indicative exchange rate of ${this.state.convertedRate}`}
                                                        />
                                                    </View>
                                                </View>
                                            )}
                                        </View>
                                    )}
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
                <ScrollPicker
                    showPicker={showScrollPicker}
                    items={scrollPickerData}
                    onDoneButtonPressed={this._onScrollPickerDoneButtonPressed}
                    onCancelButtonPressed={this._onScrollPickerDismissed}
                />
            </React.Fragment>
        );
    }
}

BakongEnterAmount.propTypes = {
    navigation: PropTypes.shape({
        addListener: PropTypes.func,
        navigate: PropTypes.func,
    }),
    route: PropTypes.shape({
        params: PropTypes.shape({
            confirmation: PropTypes.any,
            transferParams: PropTypes.shape({
                amount: PropTypes.shape({
                    replace: PropTypes.func,
                }),
                amountValue: PropTypes.shape({
                    toString: PropTypes.func,
                }),
                image: PropTypes.any,
                mobileNo: PropTypes.any,
                name: PropTypes.any,
                transactionTo: PropTypes.any,
            }),
        }),
    }),
};

const Styles = {
    container: {
        flex: 1,
        alignItems: "flex-start",
        paddingEnd: 38,
        paddingStart: 36,
        marginBottom: 60,
    },
    conversionNote: {
        marginTop: 12,
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
        flexDirection: "row",
        marginTop: 4,
        marginBottom: 8,
        width: "100%",
    },
    titleContainerTransferNew: {
        justifyContent: "flex-start",
    },
    icDropDown: {
        width: 12,
        height: 6,
        resizeMode: "contain",
        marginLeft: 6,
    },
    inputContainer: { flex: 1 },
    touchableCurrencyContainer: {
        flexDirection: "row",
        alignItems: "center",
        borderBottomColor: PINKISH_GREY,
        borderBottomWidth: 1,
        paddingVertical: 13,
        marginRight: 14,
        height: 49,
    },
};
//make this component available to the app
export default BakongEnterAmount;
