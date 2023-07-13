"use strict";

import React, { Component } from "react";
import { View, TouchableOpacity, Image } from "react-native";
import ScreenContainer from "@components/Containers/ScreenContainer";
import ScreenLayout from "@layouts/ScreenLayout";
import HeaderLayout from "@layouts/HeaderLayout";
import HeaderBackButton from "@components/Buttons/HeaderBackButton";
import HeaderLabel from "@components/Label/HeaderLabel";
import Typo from "@components/Text";
import { maskCard, getAccountExtraInfo } from "@utils/dataModel/utility";
import { showErrorToast } from "@components/Toast";

import * as Strings from "@constants/strings";
import * as navigationConstant from "@navigation/navigationConstant";

import { logEvent } from "@services/analytics";
// import {  } from "@components/Common";
import { getCardsDetailApi } from "@services/index";
import TransferImageAndDetails from "@components/Transfers/TransferImageAndDetails";
import { withModelContext } from "@context";
import { getShadow } from "@utils/dataModel/utility";
import { BLACK, BLUE, MEDIUM_GREY } from "@constants/colors";
import Numeral from "numeral";

// -----------------------
// GET UI
// -----------------------

const Header = ({ onBackPress }) => {
    return (
        <HeaderLayout
            horizontalPaddingMode="custom"
            horizontalPaddingCustomLeftValue={24}
            horizontalPaddingCustomRightValue={24}
            headerLeftElement={<HeaderBackButton onPress={onBackPress} />}
            headerCenterElement={<HeaderLabel>Pay Card</HeaderLabel>}
        />
    );
};

const ListItem = ({ label, value, onPress, index }) => {
    const valueStr = value ? value : `0.00`;
    return (
        <TouchableOpacity
            style={Styles.amountItem}
            onPress={() => onPress(index, valueStr)}
            activeOpacity={0.9}
        >
            <View style={Styles.amountLabel}>
                <Typo fontSize={14} lineHeight={19} text={label} textAlign={"left"}></Typo>
            </View>
            <View style={Styles.amountValue}>
                <Typo
                    fontSize={14}
                    color={index === 4 ? BLUE : BLACK}
                    lineHeight={18}
                    fontWeight={"bold"}
                    text={`RM ${valueStr}`}
                ></Typo>
            </View>
        </TouchableOpacity>
    );
};

class PayCardsSelectAmount extends Component {
    constructor(props) {
        super(props);
        console.log("PayCardsSelectAmount =====", props.route.params);

        if (props.route.params.data) {
            if (props.route.params.data.cardType) {
                // cardType, acctType
                this.prevSelectedAccount = {
                    ...props.route.params.data,
                    accountType: "card",
                    number: props.route.params.data.cardNo,
                    type: props.route.params.data.acctType,
                };
            } else {
                this.prevSelectedAccount = {
                    ...props.route.params.data,
                    number: props.route.params.data.acctNo,
                    type: props.route.params.data.acctType,
                };
            }

            this.fromModule = this.props.route.params.fromModule;
            this.fromScreen = this.props.route.params.fromScreen;
        }

        this.state = {
            isLoading: true,
            selectedCard: props.route.params.selectedCard.isSupplementary
                ? props.route.params.selectedCard.primaryAcc
                : props.route.params.selectedCard,
            selectedCardDetails: {},
        };
    }

    componentDidMount() {
        this.getCardsDetailApi();

        logEvent(Strings.FA_VIEW_SCREEN, {
            [Strings.FA_SCREEN_NAME]: "Transfer_Card_SelectAmount",
        });
    }

    componentWillUnmount() {}

    // -----------------------
    // API CALL
    // -----------------------
    getCardsDetailApi = () => {
        let subUrl = `/cards/detail?accountNo=${this.state.selectedCard.number}&curCode=MYR&type=${this.state.selectedCard.type}`;
        let selectedCardDetails = {};
        getCardsDetailApi(subUrl)
            .then(async (response) => {
                console.log(response);
                selectedCardDetails = response.data;
            })
            .catch((err) => {
                console.log(err);
                showErrorToast({
                    message: err.message,
                });
            })
            .finally(() => {
                this.setState({ isLoading: false, selectedCardDetails: selectedCardDetails });
            });
    };

    // -----------------------
    // EVENT HANDLER
    // -----------------------

    onBackPress = () => {
        this.props.navigation.goBack();
    };

    onItemPress = (index, amountStr) => {
        console.log("onItemPress:", index, amountStr);
        let params = this.prepareNavParams();
        const amount = this.convertToFloat(amountStr);

        if (amount <= 0 && index != 4) {
            showErrorToast({
                message: "Amount needs to be at least RM 0.01",
            });
            return;
        }

        if (this.prevSelectedAccount) {
            params.extraInfo.prevSelectedAccount = this.prevSelectedAccount;
            params.extraInfo.fromModule = this.fromModule;
            params.extraInfo.fromScreen = this.fromScreen;
        }
        params.extraInfo.amount = amount;
        params.selectedCardDetails = this.state.selectedCardDetails;

        if (index === 4) {
            console.log("GOTO enter amount screen", params);
            this.props.navigation.navigate(navigationConstant.PAYCARDS_MODULE, {
                screen: navigationConstant.PAYCARDS_ENTER_AMOUNT,
                params: params,
            });
        } else {
            console.log("TODO: confirmationScreen", params);
            this.props.navigation.navigate(navigationConstant.PAYCARDS_MODULE, {
                screen: navigationConstant.PAYCARDS_CONFIRMATION_SCREEN,
                params: params,
            });
        }
    };

    // -----------------------
    // OTHERS
    // -----------------------

    prepareNavParams = () => {
        let navParam = { ...this.props.route.params };
        return navParam;
    };

    // TODO:
    convertToFloat = (str) =>
        parseFloat(str.replace(/[`~!@#$%^&*()_|+\=?;:'",<>\{\}\[\]\\\/]/gi, ""));

    render() {
        const { selectedCard, selectedCardDetails, isLoading } = this.state;
        console.log("render:", selectedCard, isLoading);
        return (
            <ScreenContainer backgroundType="color" backgroundColor={MEDIUM_GREY}>
                {!isLoading && (
                    <ScreenLayout
                        scrollable={true}
                        header={<Header onBackPress={this.onBackPress} />}
                    >
                        <View style={Styles.container}>
                            <View style={Styles.logoInfoContainer}>
                                <TransferImageAndDetails
                                    title={selectedCard.name}
                                    subtitle={maskCard(selectedCard.number)}
                                    image={{ type: "local", source: selectedCard.image }}
                                ></TransferImageAndDetails>
                            </View>
                            <View style={Styles.titleContainer}>
                                <Typo
                                    fontSize={20}
                                    lineHeight={28}
                                    textAlign={"left"}
                                    text={"How much would you like to pay?"}
                                />
                            </View>
                            <View style={Styles.listContainer}>
                                <ListItem
                                    index={1}
                                    label={"Outstanding\namount"}
                                    value={selectedCardDetails.outstandingBalance}
                                    onPress={this.onItemPress}
                                ></ListItem>
                                <ListItem
                                    index={2}
                                    label={"Minimum\namount"}
                                    value={selectedCardDetails.minimumPayment}
                                    onPress={this.onItemPress}
                                ></ListItem>
                                <ListItem
                                    index={3}
                                    label={"Statement\namount"}
                                    value={selectedCardDetails.statementBalance}
                                    onPress={this.onItemPress}
                                ></ListItem>
                                <ListItem
                                    index={4}
                                    label={"Any\namount"}
                                    value={`0.00`}
                                    onPress={this.onItemPress}
                                ></ListItem>
                            </View>
                        </View>
                    </ScreenLayout>
                )}
            </ScreenContainer>
        );
    }
}

//make this component available to the app
export default withModelContext(PayCardsSelectAmount);

const Styles = {
    container: {
        flex: 1,
        alignItems: "stretch",
    },
    logoInfoContainer: {
        marginTop: 0,
    },
    titleContainer: {
        // width: "100%",
        marginTop: 24,
        alignItems: "flex-start",
        marginHorizontal: 12,
    },
    listContainer: {
        // width: "100%",
        marginTop: 24,
        marginHorizontal: 12,
    },
    amountItem: {
        backgroundColor: "white",
        height: 80,
        paddingHorizontal: 20,
        paddingVertical: 21,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        borderRadius: 8,
        marginBottom: 16,
        ...getShadow({
            // color: "#000000",
            // height: 4, // IOS
            // width: 1, // IOS
            // shadowOpacity: 0.08, // IOS
            // shadowRadius: 2, // IOS
            elevation: 4, // android
        }),
    },
    amountLabel: { flex: 1 },
    amountValue: {},
};
