import moment from "moment";
import Numeral from "numeral";
import PropTypes from "prop-types";
import React, { Component } from "react";
import { View, Image } from "react-native";

import * as navigationConstant from "@navigation/navigationConstant";

import HeaderLayout from "@layouts/HeaderLayout";
import ScreenLayout from "@layouts/ScreenLayout";

import ActionButton from "@components/Buttons/ActionButton";
import HeaderBackButton from "@components/Buttons/HeaderBackButton";
import HeaderCloseButton from "@components/Buttons/HeaderCloseButton";
import ScreenContainer from "@components/Containers/ScreenContainer";
import FixedActionContainer from "@components/Footers/FixedActionContainer";
import HeaderLabel from "@components/Label/HeaderLabel";
import Typo from "@components/Text";

import { invokeL3 } from "@services/index";

import { MEDIUM_GREY, YELLOW, WHITE, FADE_GREY, GREY } from "@constants/colors";
import {
    CONTINUE,
    CURRENCY,
    DATE,
    FA_PARTNER_KLIA_SUMMARY,
    FROM,
    TICKETS,
    TO,
    TRIP,
} from "@constants/strings";

import StylesKLIA from "@styles/Wallet/KilaEkspress";

import assets from "@assets";

// -----------------------
// GET UI
// -----------------------

const Header = ({ onBackPress, onClosePress, headerTitle }) => {
    return (
        <HeaderLayout
            horizontalPaddingMode="custom"
            horizontalPaddingCustomLeftValue={24}
            horizontalPaddingCustomRightValue={24}
            headerLeftElement={<HeaderBackButton onPress={onBackPress} />}
            headerRightElement={<HeaderCloseButton onPress={onClosePress} />}
            headerCenterElement={<HeaderLabel>{headerTitle}</HeaderLabel>}
        />
    );
};

const DetailTitle = ({ text }) => {
    return (
        <Typo
            fontSize={14}
            fontWeight="600"
            fontStyle="normal"
            letterSpacing={0}
            lineHeight={18}
            textAlign="left"
            text={text}
        />
    );
};
const DetailValue = ({ text }) => {
    return (
        <View style={Styles.summaryValueTextView}>
            <Typo
                fontSize={14}
                fontWeight="400"
                fontStyle="normal"
                letterSpacing={0}
                lineHeight={19}
                textAlign="left"
                text={text} //{this.state.fromPlace}
            />
        </View>
    );
};

const DetailIcon = ({ icon }) => {
    return (
        <Image
            source={icon}
            style={Styles.summaryIcon}
            resizeMethod="resize"
            resizeMode="stretch"
        />
    );
};

class TicketBookingSummaryScreen extends Component {
    constructor(props) {
        super(props);

        const navParams = props?.route?.params;
        this.state = {
            from: navParams?.fromLocation?.name,
            to: navParams?.toLocation?.name,
            selectedDate: navParams?.selectedDate,
            numOfChild: navParams?.numOfChild,
            numOfAdult: navParams?.numOfAdult,
            selectedTripType: navParams?.selectedTripType,
            amount: navParams?.amount,
            normalAmount: navParams?.normalAmount,
        };

        console.log("TicketBookingSummaryScreen:----------", props);
    }

    componentDidMount() {
        this.focusSubscription = this.props.navigation.addListener("willFocus", () => {
            // do something here or remove it later
        });
        this.blurSubscription = this.props.navigation.addListener("willBlur", () => {
            // do something here or remove it later
        });
    }

    componentWillUnmount() {
        this.focusSubscription();
        this.blurSubscription();
    }

    // -----------------------
    // EVENT HANDLER
    // -----------------------

    onBackPress = () => {
        this.props.navigation.goBack();
    };

    onClosePress = () => {
        // TODO: go to ticket dashboard
        // this.props.navigation.goBack();
        this.props.navigation.navigate(navigationConstant.KLIA_EKSPRESS_STACK, {
            screen: navigationConstant.KLIA_EKSPRESS_DASHBOARD,
            // params: {
            //     data: this.state.data,
            //     fromModule: navigationConstant.TAB_NAVIGATOR,
            //     fromScreen: "more",
            //     onGoBack: this._loadWallet,
            // },
        });
    };

    onDonePress = () => {
        this.invokeL3();
    };

    // -----------------------
    // API CALL
    // -----------------------
    invokeL3 = async () => {
        const l3Resp = await invokeL3(true);
        console.log("invokeL3:respone:", l3Resp);
        const result = l3Resp.data;
        const { code, message } = result;
        if (code != 0) {
            // this.props.navigation.goBack();
            return;
        }

        const params = this.prepareNavParams();
        this.props.navigation.navigate(navigationConstant.KLIA_EKSPRESS_STACK, {
            screen: "KLIAEkspressConfirmationScreen",
            params: params,
        });
    };

    // -----------------------
    // OTHER PROCESS
    // -----------------------

    prepareNavParams = () => {
        let navParam = { ...this.props.route.params };
        return navParam;
    };

    render() {
        const {
            from,
            to,
            selectedDate,
            numOfChild,
            numOfAdult,
            selectedTripType,
            amount,
            normalAmount,
        } = this.state;
        return (
            <ScreenContainer
                backgroundType="color"
                backgroundColor={MEDIUM_GREY}
                analyticScreenName={FA_PARTNER_KLIA_SUMMARY}
            >
                <ScreenLayout
                    // scrollable={true}
                    useSafeArea
                    paddingBottom={0}
                    paddingHorizontal={0}
                    header={
                        <Header
                            onBackPress={this.onBackPress}
                            onClosePress={this.onClosePress}
                            headerTitle={"Summary"}
                        />
                    }
                >
                    <React.Fragment>
                        <View style={Styles.mainContainer}>
                            <View
                                style={[
                                    Styles.summaryRowInnerView,
                                    Styles.summaryRowInnerViewFirstChild,
                                ]}
                            >
                                <DetailIcon icon={assets.icon24BlackKliaEkspres} />
                                <View style={StylesKLIA.summaryTextView}>
                                    <DetailTitle text={FROM} />
                                    <DetailValue text={from} />
                                </View>
                                <View style={StylesKLIA.summaryTextView}>
                                    <DetailTitle text={TO} />
                                    <DetailValue text={to} />
                                </View>
                            </View>

                            <View style={Styles.summaryRowInnerView}>
                                <DetailIcon icon={assets.icon24BlackClock} />
                                <View style={StylesKLIA.summaryTextView}>
                                    <DetailTitle text={DATE} />
                                    <DetailValue
                                        text={moment(selectedDate).format("DD MMM YYYY")}
                                    />
                                </View>
                            </View>

                            <View style={Styles.summaryRowInnerView}>
                                <DetailIcon icon={assets.icon24BlackTicket} />
                                <View style={StylesKLIA.summaryTextView}>
                                    <DetailTitle text={TICKETS} />
                                    <DetailValue text={`${numOfAdult} x Adult`} />
                                    <DetailValue text={`${numOfChild} x Child`} />
                                </View>
                            </View>

                            <View
                                style={[
                                    Styles.summaryRowInnerView,
                                    Styles.summaryRowInnerViewLastChild,
                                ]}
                            >
                                <DetailIcon icon={assets.icon24BlackDirection} />
                                <View style={StylesKLIA.summaryTextView}>
                                    <DetailTitle text={TRIP} />
                                    <DetailValue
                                        text={selectedTripType === "single" ? "Single" : "Return"}
                                    />
                                </View>
                            </View>

                            <View style={Styles.summaryAmountCoverView}>
                                <Typo
                                    fontSize={14}
                                    fontWeight="300"
                                    fontStyle="normal"
                                    letterSpacing={0}
                                    lineHeight={18}
                                    textAlign="center"
                                    text={"Total amount"}
                                />
                                <Typo
                                    fontSize={18}
                                    fontWeight="600"
                                    fontStyle="normal"
                                    letterSpacing={0}
                                    lineHeight={32}
                                    textAlign="center"
                                    text={`${CURRENCY}${Numeral(amount).format("0,0.00")}`}
                                />
                                <Typo
                                    fontSize={14}
                                    fontWeight="300"
                                    fontStyle="normal"
                                    letterSpacing={0}
                                    lineHeight={18}
                                    color={FADE_GREY}
                                    textAlign="center"
                                    text={`${CURRENCY}${Numeral(normalAmount).format("0,0.00")}`}
                                    style={Styles.amountOld}
                                />
                            </View>
                        </View>
                        <FixedActionContainer>
                            <ActionButton
                                height={48}
                                fullWidth
                                backgroundColor={YELLOW}
                                borderRadius={24}
                                componentCenter={
                                    <Typo
                                        fontSize={14}
                                        fontWeight="600"
                                        fontStyle="normal"
                                        letterSpacing={0}
                                        lineHeight={18}
                                        text={CONTINUE}
                                    />
                                }
                                onPress={this.onDonePress}
                            />
                        </FixedActionContainer>
                    </React.Fragment>
                </ScreenLayout>
            </ScreenContainer>
        );
    }
}

TicketBookingSummaryScreen.propTypes = {
    navigation: PropTypes.object.isRequired,
};

TicketBookingSummaryScreen.defaultProps = {
    navigation: {},
};

export default TicketBookingSummaryScreen;

const Styles = {
    mainContainer: {
        flex: 1,
        paddingHorizontal: 36,
    },
    titleContainer: {
        paddingTop: 38,
        justifyContent: "flex-start",
    },
    summaryIcon: {
        height: 24,
        paddingTop: 6,
        width: 24,
    },
    locationSelectionContainer: {
        paddingTop: 24,
        justifyContent: "flex-start",
    },

    summaryRowInnerView: {
        flexDirection: "row",
        justifyContent: "flex-start",
        width: "100%",
        borderBottomWidth: 1,
        borderBottomColor: GREY,
        paddingTop: 16,
        paddingBottom: 16,
    },

    summaryRowInnerViewFirstChild: {
        paddingTop: 0,
    },
    summaryRowInnerViewLastChild: {
        borderBottomWidth: 0,
        paddingBottom: 0,
    },

    summaryAmountCoverView: {
        backgroundColor: WHITE,
        borderRadius: 8,
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        marginTop: 36,
        paddingVertical: 16,
        width: "100%",
    },
    summaryValueTextView: { marginTop: 5 },
    amountOld: {
        textDecorationLine: "line-through",
    },
    footerContainer: {
        width: "100%",
        flexDirection: "column",
        justifyContent: "flex-end",
    },
};
