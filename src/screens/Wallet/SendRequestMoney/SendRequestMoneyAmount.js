import PropTypes from "prop-types";
import React, { Component } from "react";
import { View, Dimensions, ScrollView } from "react-native";

import { navigateToS2UCooling } from "@screens/OneTapAuth/CoolingNavigator";

import * as navigationConstant from "@navigation/navigationConstant";

import HeaderLayout from "@layouts/HeaderLayout";
import ScreenLayout from "@layouts/ScreenLayout";

import HeaderBackButton from "@components/Buttons/HeaderBackButton";
import HeaderCloseButton from "@components/Buttons/HeaderCloseButton";
import CacheeImageWithDefault from "@components/CacheeImageWithDefault";
import { AccountDetailsView } from "@components/Common";
import ScreenContainer from "@components/Containers/ScreenContainer";
import NumericalKeyboard from "@components/NumericalKeyboard";
import Typo from "@components/Text";
import TextInput from "@components/TextInput";

import { withModelContext } from "@context";

import { MEDIUM_GREY, BLACK } from "@constants/colors";
import {
    AMOUNT_ERROR,
    AMOUNT_EXCEEDS_MAXIMUM,
    AMOUNT_NEEDS_TO_BE_001,
    CURRENCY_CODE,
    ENTER_AMOUNT,
    SEND_AND_REQUEST,
} from "@constants/strings";

import {
    formatMobileNumbersRequest,
    getContactNameInitial,
    checks2UFlow,
} from "@utils/dataModel/utility";
import withFestive from "@utils/withFestive";

import { FASendRequestDashboard } from "../../../services/analytics/analyticsSendRequest";

const { width, height } = Dimensions.get("window");

class SendRequestMoneyAmount extends Component {
    static navigationOptions = { title: "", header: null };

    constructor(props) {
        super(props);
        this.state = {
            amount: "",
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
            transferFlow: 15,
            secure2uValidateData: {},
            amountValue: 0,
            height: 800,

            // Festive Campaign related
            festiveFlag: false,
            festiveImage: {},
            fromCta: false,
        };
    }

    async componentDidMount() {
        this.updateData();
        const params = this.props?.route?.params ?? {};
        FASendRequestDashboard.onMoneyAmount(params.sendMoneyFlow);
        this.focusSubscription = this.props.navigation.addListener("focus", () => {
            this.updateData();
        });
    }

    componentWillUnmount() {
        this.focusSubscription();
    }

    updateData = async () => {
        console.log("SendRequestMoneyAmount updateData ==> ");
        console.log("[SendRequestMoneyAmount] >> [_updateScreenUI] height : ", height);
        console.log("[SendRequestMoneyAmount] >> [_updateScreenUI] width : ", width);
        const params = this.props?.route?.params ?? {};
        const transferParams = params?.transferParams ?? {};
        const festiveFlag = params?.festiveFlag ?? false;
        const fromCta = params?.fromCta ?? false;
        const festiveImage = params?.festiveObj?.backgroundImage ?? {};
        const transferFlow = transferParams.transferFlow;
        console.log("SendRequestMoneyAmount updateData transferParams==> ", transferParams);
        console.log("SendRequestMoneyAmount updateData transferFlow==> ", transferFlow);

        if (transferParams && transferParams.amount) {
            let amountValue = transferParams.amount;
            amountValue = amountValue
                ? amountValue.toString().replace(/,/g, "").replace(".", "")
                : "0.00";
            // amountValue = transferParams.amount ? Numeral(amountValue).value() : 0;
            console.log("updateData amountValue ==> ", amountValue);
            if (amountValue >= 0.01) {
                console.log("updateData UPDATED amountValue ==> ", amountValue);
                this._updateAmount(amountValue);
            }
        }
        const screenData = {
            image: {
                shortName: getContactNameInitial(transferParams.name),
                image: transferParams.image,
            },
            name: transferParams.name,
            description1: formatMobileNumbersRequest(transferParams.phoneNumber),
            description2: "",
            imageName: "",
        };
        console.log("SendRequestMoneyAmount updateData screenData ==> ", screenData);

        this.setState({
            height,
            transferFlow: transferParams.transferFlow,
            transferParams,
            errorMessage: AMOUNT_ERROR,
            screenData,
            image: transferParams.image,
            festiveFlag,
            festiveImage,
            fromCta,
        });
    };

    doneClick = async () => {
        console.log("[SendRequestMoneyAmount] >> [doneClick] ==> ");
        const { amountValue, amount, secure2uValidateData, transferFlow, festiveFlag } = this.state;
        console.log("[SendRequestMoneyAmount] >> [doneClick] amount ", amount);
        const params = this.props?.route?.params ?? {};
        const sendMoneyFlow = params.sendMoneyFlow;

        let amountText = amount ? amount.toString().replace(/,/g, "") : "0.00";
        console.log("[SendRequestMoneyAmount] >> [doneClick] amountText ==> ", amountText);
        if (amountText == null || amountText === "undefined" || amountText.length === 0) {
            amountText = 0;
        }
        console.log(
            "[SendRequestMoneyAmount] >> [doneClick] amountText ==> ",
            amountText > 99999.99
        );
        if (amountText < 0.01) {
            this.setState({
                showLocalErrorMessage: AMOUNT_NEEDS_TO_BE_001,
                showLocalError: true,
            });
        } else if (amountText > 99999.99) {
            this.setState({
                showLocalErrorMessage: AMOUNT_EXCEEDS_MAXIMUM,
                showLocalError: true,
            });
        } else {
            let { transferParams, fromCta } = this.state;
            const festiveObj = this.props.route?.params?.festiveObj ?? {};

            transferParams.amountValue = amountValue;
            transferParams.amount = amount;
            transferParams.formattedAmount = amount;
            console.log(
                "[SendRequestMoneyAmount] >> [doneClick] this.props.route?.params ",
                this.props.route?.params
            );
            console.log("[SendRequestMoneyAmount] >> [doneClick] transferFlow ", transferFlow);
            console.log("[SendRequestMoneyAmount] >> [doneClick] transferParams ", transferParams);
            this.setState({ showLocalError: false, transferParams: transferParams });
            if (transferFlow === 16) {
                this.props.navigation.navigate(navigationConstant.FUNDTRANSFER_MODULE, {
                    screen: navigationConstant.TRANSFER_CONFIRMATION_SCREEN,
                    params: {
                        transferParams,
                        secure2uValidateData,
                        festiveFlag,
                        festiveObj,
                        sendMoneyFlow,
                    },
                });
            } else if (transferFlow === 15) {
                const { getModel, updateModel } = this.props;
                const ota = getModel("ota");
                let stateData = {};
                // const festiveObj = this.props.route?.params?.festiveObj ?? {};

                console.log("_proceedToNextScreen ota ==> ", ota);
                // Fetch CASA accounts
                //const casaAccounts = await this.fetchAccountsList();
                stateData.transferParams = transferParams;
                // Check for S2u registration //passing new paramerter updateModel for s2u interops
                let { flow, secure2uValidateData } = await checks2UFlow(
                    transferFlow,
                    getModel,
                    updateModel
                );
                stateData.flow = flow;
                stateData.secure2uValidateData = secure2uValidateData;
                stateData.festiveFlag = festiveFlag;
                stateData.festiveObj = festiveObj;
                const { params } = this.props.route;
                const eDuitRayaFlow =
                    fromCta ||
                    params?.routeFrom === "SortToWin" ||
                    params?.transferParams?.routeFrom === "SortToWin" ||
                    params?.includeGreeting;

                const greetingsParams = {
                    ...params,
                    eDuitData: {
                        secure2uValidateData,
                        transferParams,
                        flow,
                        festiveFlag,
                        festiveObj,
                        fromCta,
                        includeGreeting: true,
                    },
                };

                console.log("_proceedToNextScreen stateData ==> ", stateData);
                console.log(
                    "_proceedToNextScreen  this.props.route.params ==> ",
                    this.props.route.params
                );
                const {
                    navigation: { navigate },
                } = this.props;
                if (flow === navigationConstant.SECURE2U_COOLING) {
                    navigateToS2UCooling(navigate);
                } else if (flow === "S2UReg") {
                    stateData.flowType = flow;
                    console.log("_proceedToNextScreen stateData ==> ", stateData);
                    navigate(navigationConstant.ONE_TAP_AUTH_MODULE, {
                        screen: "Activate",
                        params: {
                            flowParams: {
                                success: {
                                    stack:
                                        !festiveObj?.templateId && eDuitRayaFlow
                                            ? navigationConstant.DASHBOARD_STACK
                                            : navigationConstant.FUNDTRANSFER_MODULE,
                                    screen:
                                        !festiveObj?.templateId && eDuitRayaFlow
                                            ? "Dashboard"
                                            : navigationConstant.TRANSFER_CONFIRMATION_SCREEN,
                                },
                                fail: {
                                    stack: navigationConstant.SEND_REQUEST_MONEY_STACK,
                                    screen: navigationConstant.SEND_REQUEST_MONEY_DASHBOARD,
                                },
                                params:
                                    !festiveObj?.templateId && eDuitRayaFlow
                                        ? {
                                              screen: "SendGreetingsDesign",
                                              params: { ...stateData, ...greetingsParams },
                                          }
                                        : stateData,
                            },
                        },
                    });
                } else {
                    if (!festiveObj?.templateId && eDuitRayaFlow) {
                        navigate(navigationConstant.DASHBOARD_STACK, {
                            screen: "Dashboard",
                            params: {
                                screen: "SendGreetingsDesign",
                                params: greetingsParams,
                            },
                        });
                    } else {
                        navigate(navigationConstant.FUNDTRANSFER_MODULE, {
                            screen: navigationConstant.TRANSFER_CONFIRMATION_SCREEN,
                            params: {
                                secure2uValidateData,
                                transferParams,
                                flow,
                                festiveFlag,
                                festiveObj,
                                fromCta,
                            },
                        });
                    }
                }
            }
        }
    };

    _updateAmount = (val) => {
        console.log("changeText : ", val);
        let value = val ? parseInt(val) : 0;
        // const amountVal = parseInt(val, 10) / 100;
        // const amountString = Numeral(amountVal).format("0,0.00");

        // this.setState({ amount: amountString, amountValue: val }, () => {
        //     console.log("changeText: ", amountString);
        // });

        if (value > 0) {
            const formatted = this.numberWithCommas(value);
            console.log("formatted : ", formatted);
            setTimeout(() => {
                this.setState({ amount: formatted, amountValue: value });
            }, 1);
        } else {
            this.setState({ amount: "", amountValue: value });
        }
    };

    changeText = (val) => {
        console.log("changeText : ", val);
        let value = val ? parseInt(val) : 0;
        // const amountVal = parseInt(val, 10) / 100;
        // const amountString = Numeral(amountVal).format("0,0.00");

        // this.setState({ amount: amountString, amountValue: val }, () => {
        //     console.log("changeText: ", amountString);
        // });

        if (value > 0) {
            const formatted = this.numberWithCommas(value);
            console.log("formatted : ", formatted);

            this.setState({ amount: formatted, amountValue: value, showLocalError: false });
        } else {
            this.setState({ amount: "", amountValue: value, showLocalError: false });
        }
    };

    numberWithCommas = (val) => {
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

    formateAmount = (text) => {
        return text.substring(0, text.length - 2) + "." + text.substring(text.length - 2);
    };

    _onBackPress = () => {
        console.log("_onBackPress");
        this.props.navigation.goBack();
    };

    _onClosePress = () => {
        const { transferParams, transferFlow } = this.state;
        const { routeFrom } = transferParams;
        console.log("_onClosePress==> transferParams ", transferParams);
        console.log("_onClosePress ", this.state.transferFlow);
        const route = routeFrom ? routeFrom : "Dashboard";
        const routedFromQuickAction =
            routeFrom !== "SortToWin" &&
            routeFrom !== "SendGreetingsReceived" &&
            routeFrom !== "SendGreetingsReview";
        console.log("route ", routeFrom);

        // uncomment this when campaign have entry point from festives QA
        // if (festiveFlag && (transferFlow === 15 || transferFlow === 12)) {
        // Handle screen navigation back to Festive entry points
        if (routedFromQuickAction && this.props.route?.params?.festiveFlag) {
            this.props.navigation.navigate("DashboardStack", {
                screen: "Dashboard",
                params: {
                    screen: "FestiveQuickActionScreen",
                },
            });
        } else if ((transferFlow === 15 || transferFlow === 16) && !routedFromQuickAction) {
            this.props.navigation.pop(2);
        } else {
            if (route == "AccountDetails") {
                this.props.navigation.navigate(navigationConstant.BANKINGV2_MODULE, {
                    screen: navigationConstant.ACCOUNT_DETAILS_SCREEN,
                });
            } else if (route === "WalletMainDashboard") {
                this.props.navigation.navigate(navigationConstant.TAB_NAVIGATOR, {
                    screen: "Dashboard",
                });
            } else {
                // TODO: Add necessary params
                this.props.navigation.navigate(navigationConstant.TAB_NAVIGATOR);
            }
        }
    };

    render() {
        const { showErrorModal, errorMessage, festiveFlag, festiveImage } = this.state;
        const { festiveAssets } = this.props;
        const { getModel } = this.props;
        const { isTapTasticReady } = getModel("misc");
        return (
            <ScreenContainer
                backgroundType={"color"}
                backgroundColor={MEDIUM_GREY}
                showErrorModal={showErrorModal}
                errorMessage={errorMessage}
                showOverlay={false}
                scrollable={true}
            >
                {festiveFlag && (
                    <CacheeImageWithDefault
                        resizeMode="stretch"
                        style={Styles.imageBG}
                        image={festiveAssets?.greetingSend.topContainer}
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
                                    color={isTapTasticReady && BLACK}
                                    text={
                                        festiveFlag
                                            ? festiveAssets?.sendMoney?.headerTitleEnterAmount
                                            : SEND_AND_REQUEST
                                    }
                                />
                            }
                            headerLeftElement={
                                <HeaderBackButton
                                    onPress={this._onBackPress}
                                    isWhite={festiveAssets?.isWhiteColorOnFestive}
                                />
                            }
                            headerRightElement={
                                <HeaderCloseButton
                                    onPress={this._onClosePress}
                                    isWhite={festiveAssets?.isWhiteColorOnFestive}
                                />
                            }
                        />
                    }
                    useSafeArea
                    neverForceInset={["bottom"]}
                    paddingHorizontal={0}
                    paddingBottom={0}
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
                                        base64={this.state.image ? false : true}
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
                                        accessibilityLabel={"Password"}
                                        isValidate={this.state.showLocalError}
                                        errorMessage={this.state.showLocalErrorMessage}
                                        onSubmitEditing={this.onDone}
                                        value={this.state.amount}
                                        placeholder={"0.00"}
                                        prefix={CURRENCY_CODE}
                                        clearButtonMode="while-editing"
                                        returnKeyType="done"
                                        editable={false}
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

SendRequestMoneyAmount.propTypes = {
    getModel: PropTypes.func,
    navigation: PropTypes.shape({
        addListener: PropTypes.func,
        goBack: PropTypes.func,
        navigate: PropTypes.func,
    }),
    route: PropTypes.shape({
        params: PropTypes.shape({
            festiveFlag: PropTypes.any,
            festiveObj: PropTypes.object,
            fromCta: PropTypes.bool,
        }),
    }),
    updateModel: PropTypes.any,
    sendMoneyFlow: PropTypes.any,
    festiveAssets: PropTypes.object,
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
    topContainer: { width: "100%", height: "35%" },
    imageBG: {
        flex: 1,
        height: 375,
        position: "absolute",
        width: "100%",
    },
};
//make this component available to the app
export default withModelContext(withFestive(SendRequestMoneyAmount));
