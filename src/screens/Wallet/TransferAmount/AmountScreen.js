import Numeral from "numeral";
import PropTypes from "prop-types";
import React, { Component } from "react";
import { View, ScrollView, Platform, Dimensions } from "react-native";

import {
    REQUEST_TO_PAY_CONFIRMATION_SCREEN,
    REQUEST_TO_PAY_STACK,
} from "@navigation/navigationConstant";

import HeaderLayout from "@layouts/HeaderLayout";
import ScreenLayout from "@layouts/ScreenLayout";

import HeaderBackButton from "@components/Buttons/HeaderBackButton";
import CacheeImageWithDefault from "@components/CacheeImageWithDefault";
import { AccountDetailsView } from "@components/Common";
import ScreenContainer from "@components/Containers/ScreenContainer";
import NumericalKeyboard from "@components/NumericalKeyboard";
import Typo from "@components/Text";
import TextInput from "@components/TextInput";

import { MEDIUM_GREY } from "@constants/colors";
import * as Strings from "@constants/strings";

import { formatMobileNumber } from "@utils/dataModel/utility";
import withFestive from "@utils/withFestive";

const { width } = Dimensions.get("window");

class AmountScreen extends Component {
    static navigationOptions = ({ navigation: { navigate } }) => ({
        title: "",
        header: null,
    });

    static propTypes = {
        getModel: PropTypes.func,
        resetModel: PropTypes.func,
        route: PropTypes.object,
        navigation: PropTypes.object,
    };

    constructor(props) {
        super(props);
        this.state = {
            image: "",
            errorMessage: "",
            showLocalError: false,
            showLocalErrorMessage: "",
            transferParams: [],
            screenData: {
                image: "",
                name: "",
                description1: "",
                description2: "",
                imageBase64: false,
            },
            amount: "",
            maxAmount: 0.0,
            screenLabel: Strings.ENTER_AMOUNT,
            screenTitle: Strings.TRANSFER,
            imageBase64: true,
            amountLength: 8,
            amountValue: 0,
        };
    }

    async componentDidMount() {
        this._updateDataInScreen();
        this.focusSubscription = this.props.navigation.addListener("focus", async () => {});
    }

    componentWillUnmount() {
        this.focusSubscription();
    }

    _updateDataInScreen = async () => {
        const transferParams = this.props.route.params?.transferParams ?? this.state.screenData;

        const {
            amount,
            screenTitle,
            screenLabel,
            imageBase64,
            maxAmount,
            amountError,
            transferFlow,
            image,
            formattedToAccount,
            accountName,
            bankName,
            amountLength,
            maxAmountError,
            idTypeText,
            phoneNumber,
            name,
        } = transferParams;

        const screenData = {
            image:
                transferFlow === 15 || transferFlow === 16
                    ? { shortName: accountName, image }
                    : image,
            name:
                transferFlow === 15 || transferFlow === 16
                    ? formatMobileNumber(phoneNumber)
                    : formattedToAccount,
            description1: transferFlow === 15 || transferFlow === 16 ? name : accountName,
            description2:
                transferFlow === 12
                    ? idTypeText
                    : transferFlow === 15 || transferFlow === 16
                    ? ""
                    : bankName,
        };
        const amountTemp = amount ? amount.toString().replace(/,/g, "").replace(".", "") : 0.0;
        const amountValue = amountTemp ? Numeral(amountTemp).value() : 0;
        if (amountValue >= 0.01) {
            this.changeText(amountValue);
        }
        this.setState({
            screenTitle,
            screenLabel,
            imageBase64,
            maxAmount,
            transferParams,
            errorMessage: amountError,
            screenData,
            amountLength: amountLength ?? 8,
            maxAmountError: maxAmountError ?? amountError,
            image,
        });
    };

    changeText = (val) => {
        const value = val ? parseInt(val) : 0;

        if (value > 0) {
            const formatted = this.numberWithCommas(value);
            this.setState({ amount: formatted, amountValue: value, showLocalError: false });
        } else {
            this.setState({ amount: "", amountValue: value, showLocalError: false });
        }
    };

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

    // formateAmount(text) {
    //     return text.substring(0, text.length - 2) + "." + text.substring(text.length - 2);
    // }

    doneClick = () => {
        let { amount, maxAmount, errorMessage, maxAmountError } = this.state;
        const amountFinal = amount;
        amount = amount ? amount.toString().replace(/,/g, "") : "0.00";
        let amountText = Numeral(amount).value();

        if (amountText == null || amountText === "undefined" || amountText.length === 0) {
            amountText = 0;
        }

        if (amountText < 0.01) {
            this.setState({ showLocalErrorMessage: errorMessage, showLocalError: true });
        } else if (amountText > maxAmount) {
            this.setState({
                showLocalErrorMessage: maxAmountError,
                showLocalError: true,
            });
        } else {
            this.setState({ showLocalError: false });
            if (this.props.route.params?.isRTPAmount) {
                const { transferParams } = this.state;
                const modParams = { ...transferParams };
                const amountValue = amountFinal
                    ? amountFinal.toString().replace(/,/g, "").replace(".", "")
                    : 0;
                modParams.amount = amountFinal;
                modParams.formattedAmount = amountFinal;
                modParams.amountValue = amountValue;
                modParams.serviceFee = amountText > 5000.0 ? 0.5 : 0.0;

                this.props.navigation.navigate(REQUEST_TO_PAY_STACK, {
                    screen: REQUEST_TO_PAY_CONFIRMATION_SCREEN,
                    params: {
                        transferParams: modParams,
                        isAmountHigher: amountText > 5000.0,
                        errorMessage: amountText > 5000.0 ? Strings.SERVICE_FEE_CONFIRM : "",
                    },
                });
            } else {
                this.props.navigation.goBack();
                this.onLoginSuccess(amountFinal);
            }
        }
    };

    onLoginSuccess = (data) => {
        this.props.route.params?.onLoginSuccess(data);
    };

    _onBackPress = () => {
        this.props.navigation.pop();
    };

    render() {
        const { navigation, route, festiveAssets } = this.props;
        const { showLocalError, errorMessage, index, showErrorModal } = this.state;
        const festiveFlag = route?.params?.festiveFlag ?? false;
        const festiveImage = route?.params?.festiveObj?.backgroundImage ?? {};

        return (
            <ScreenContainer
                backgroundType="color"
                showErrorModal={showErrorModal}
                errorMessage={errorMessage}
                showOverlay={false}
                backgroundColor={MEDIUM_GREY}
            >
                {festiveFlag && (
                    <CacheeImageWithDefault
                        resizeMode={Platform.OS === "ios" ? "stretch" : "cover"}
                        style={Styles.imgBg}
                        image={festiveAssets?.qrPay.background}
                    />
                )}
                <ScreenLayout
                    header={
                        <HeaderLayout
                            headerCenterElement={
                                <Typo
                                    fontSize={16}
                                    fontWeight="600"
                                    lineHeight={19}
                                    text={this.state.screenTitle}
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
                        <ScrollView
                            showsHorizontalScrollIndicator={false}
                            showsVerticalScrollIndicator={false}
                        >
                            <View style={Styles.container}>
                                <View style={Styles.logoInfoContainer}>
                                    <AccountDetailsView
                                        data={this.state.screenData}
                                        base64={this.state.imageBase64}
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
                                        text={this.state.screenLabel}
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
                                        prefix={Strings.CURRENCY_CODE}
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
                            maxLength={this.state.amountLength}
                            onDone={this.doneClick}
                        />
                    </React.Fragment>
                </ScreenLayout>
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
    imgBg: {
        flex: 1,
        height: "35%",
        width,
        position: "absolute",
    },
};
export default withFestive(AmountScreen);
