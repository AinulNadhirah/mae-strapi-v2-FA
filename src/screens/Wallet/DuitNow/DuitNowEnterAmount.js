import PropTypes from "prop-types";
import React, { Component } from "react";
import { View, ScrollView } from "react-native";
import FlashMessage from "react-native-flash-message";

import { DUITNOW_ENTER_REFERENCE, DUITNOW_ENTER_ID } from "@navigation/navigationConstant";

import HeaderLayout from "@layouts/HeaderLayout";
import ScreenLayout from "@layouts/ScreenLayout";

import HeaderBackButton from "@components/Buttons/HeaderBackButton";
import { AccountDetailsView } from "@components/Common";
import ScreenContainer from "@components/Containers/ScreenContainer";
import NumericalKeyboard from "@components/NumericalKeyboard";
import Typo from "@components/Text";
import TextInput from "@components/TextInput";
import Toast, { hideToast, showInfoToast } from "@components/Toast";

import { GATransfer } from "@services/analytics/analyticsTransfer";

import { MEDIUM_GREY, DARK_GREY, BLACK } from "@constants/colors";
import {
    AMOUNT_ERROR_RTP,
    AMOUNT_NEEDS_TO_BE_001,
    AMOUNT_EXCEEDS_MAXIMUM,
    DUITNOW,
    ENTER_AMOUNT,
    CURRENCY_CODE,
} from "@constants/strings";

import { getTransferAccountType } from "@utils/dataModel/utilityPartial.5";

class DuitNowEnterAmount extends Component {
    static navigationOptions = { title: "", header: null };
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
            amount: "0.00",
            fullName: "",
            screenData: {
                image: "",
                name: "",
                description1: "",
                description2: "",
            },
            showLocalError: false,
            showLocalErrorMessage: "",
            errorMessage: AMOUNT_NEEDS_TO_BE_001,
            transferParams: {},
            image: "",
            transferFav: false,
            isSendMoneyDuitNowFlow: false,
            recipientNameMasked: false,
            recipientNameMaskedMessage: "",
            amountValue: 0,

            // Festive Campaign related
            festiveFlag: false,
            festiveImage: {},
        };
    }

    /***
     * componentDidMount
     * Update Screen date
     */
    componentDidMount() {
        GATransfer.viewScreenAmount(getTransferAccountType(this.state.transferFlow));
        this.updateData();
        this.focusSubscription = this.props.navigation.addListener("focus", () => {
            this.updateData();
        });
    }

    /***
     * componentWillUnmount
     * Handle Screen UnMount Event
     */
    componentWillUnmount() {}

    /***
     * updateData
     * Handle one time screen load
     */
    updateData = () => {
        const params = this.props?.route?.params ?? {};
        const festiveFlag = params?.festiveFlag ?? false;
        const festiveImage = params?.festiveObj?.backgroundImage ?? {};
        const transferParams = params?.transferParams ?? this.state.screenData;
        const isSendMoneyDuitNowFlow = params?.isSendMoneyDuitNowFlow ?? false;

        const amountValue = 0;
        if (transferParams && transferParams.amount) {
            let amountValue = transferParams.amount;
            amountValue = amountValue
                ? amountValue.toString().replace(/,/g, "").replace(".", "")
                : "0.00";
            if (amountValue >= 0.01) {
                this._updateAmount(amountValue);
            }
        }
        const screenData = {
            image: transferParams.image,
            name: transferParams.idValueFormatted,
            description1: transferParams.accountName,
            description2: transferParams.idTypeText,
        };
        this.setState(
            {
                transferParams,
                errorMessage: AMOUNT_ERROR_RTP,
                screenData,
                transferFav: transferParams.transferFav,
                isSendMoneyDuitNowFlow,
                recipientNameMasked: transferParams.recipientNameMasked,
                recipientNameMaskedMessage: transferParams.recipientNameMaskedMessage,
                amountValue,

                festiveFlag,
                festiveImage,
            },
            () => {
                if (this.state.recipientNameMasked) {
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
    };

    /***
     * refForToast
     * ref For Toast message
     */
    refForToast = (ref) => {
        this.toastRef = ref;
    };

    /***
     * renderToastComponent
     * render Toast Component
     */
    renderToastComponent = (props) => <Toast {...props} />;

    /***
     * doneClick
     * On Done button Click event after amount entered
     * Validate amount and proceed to next screen
     */
    doneClick = () => {
        const { amountValue, amount, fullName, festiveFlag } = this.state;

        let amountText = amount ? amount.toString().replace(/,/g, "") : "0.00";

        if (amountText == null || amountText === "undefined" || amountText.length === 0) {
            amountText = 0;
        }

        if (amountText < 0.01) {
            this.setState({
                showLocalErrorMessage: AMOUNT_NEEDS_TO_BE_001,
                showLocalError: true,
            });
            if (amountText.length <= 0) {
                this.setState({ amount: "0.00" });
            }
        } else if (amountText > 999999.99) {
            this.setState({
                showLocalErrorMessage: AMOUNT_EXCEEDS_MAXIMUM,
                showLocalError: true,
            });
        } else {
            const { transferParams } = this.state;
            transferParams.amountValue = amountValue
                ? amountValue.toString().replace(/,/g, "").replace(".", "")
                : 0;
            transferParams.amount = amount;
            transferParams.formattedAmount = amount;
            transferParams.fullName = fullName;
            transferParams.amount = amount;
            transferParams.formattedAmount = amount;
            this.setState({
                showLocalError: false,
                transferParams,
            });
            hideToast();
            this.props.navigation.navigate(DUITNOW_ENTER_REFERENCE, {
                transferParams,
                festiveFlag,
                festiveObj: this.props.route?.params?.festiveObj ?? {},
            });
        }
    };

    /***
     * _updateAmount
     * On Screen load next time update the amount in screen with previous amount entered and formate the amount
     */
    _updateAmount = (val) => {
        const value = val ? parseInt(val) : 0;
        if (value > 0) {
            const formatted = this.numberWithCommas(value);
            setTimeout(() => {
                this.setState({ amount: formatted, amountValue: value });
            }, 1);
        } else {
            this.setState({ amount: "0.00", amountValue: value });
        }
    };

    /***
     * changeText
     * On User enter amount formate the amount
     */
    changeText = (val) => {
        const value = val ? parseInt(val) : 0;

        if (value > 0) {
            const formatted = this.numberWithCommas(value);

            this.setState({ amount: formatted, amountValue: value });
        } else {
            this.setState({ amount: "0.00", amountValue: value });
        }
    };

    /***
     * numberWithCommas
     * formate amount value in screen
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
     * numberWithCommas
     * formate amount value in screen with decimal
     */
    formateAmount = (text) => {
        return text.substring(0, text.length - 2) + "." + text.substring(text.length - 2);
    };

    /***
     * _onBackPress
     * On Screen Back press handle
     */
    _onBackPress = () => {
        const { transferFav, transferParams, isSendMoneyDuitNowFlow } = this.state;

        hideToast();
        if (this.props.route?.params?.festiveFlag) {
            this.props.navigation.navigate("DashboardStack", {
                screen: "Dashboard",
                params: {
                    screen: "FestiveQuickActionScreen",
                },
            });
        } else if (isSendMoneyDuitNowFlow) {
            this.props.navigation.goBack();
        } else if (!transferFav) {
            this.props.navigation.navigate(DUITNOW_ENTER_ID, {
                transferParams,
            });
        } else {
            this.props.navigation.goBack();
        }
    };

    render() {
        const { showErrorModal, errorMessage, festiveFlag, festiveImage } = this.state;
        return (
            <ScreenContainer
                backgroundType={festiveFlag ? "image" : "color"}
                backgroundImage={festiveFlag ? festiveImage : null}
                backgroundColor={MEDIUM_GREY}
                showErrorModal={showErrorModal}
                errorMessage={errorMessage}
                showOverlay={false}
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
                    neverForceInset={["bottom"]}
                    paddingHorizontal={0}
                    paddingBottom={0}
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
                                        accessibilityLabel="Amount"
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
                <FlashMessage MessageComponent={this.renderToastComponent} ref={this.refForToast} />
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
//make this component available to the app
export default DuitNowEnterAmount;
