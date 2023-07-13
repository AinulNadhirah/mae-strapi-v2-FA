import React, { Component } from "react";
import { View, TouchableOpacity } from "react-native";

import * as navigationConstant from "@navigation/navigationConstant";

import HeaderLayout from "@layouts/HeaderLayout";
import ScreenLayout from "@layouts/ScreenLayout";

import HeaderBackButton from "@components/Buttons/HeaderBackButton";
import ScreenContainer from "@components/Containers/ScreenContainer";
import HeaderLabel from "@components/Label/HeaderLabel";
import Typo from "@components/Text";
import { showErrorToast, showInfoToast } from "@components/Toast";
import TransferImageAndDetails from "@components/Transfers/TransferImageAndDetails";

import { withModelContext } from "@context";

// import {  } from "@components/Common";
import { bankingGetDataMayaM2u, invokeL3 } from "@services";
import { logEvent } from "@services/analytics";

import { MEDIUM_GREY } from "@constants/colors";
import { FA_VIEW_SCREEN, FA_SCREEN_NAME } from "@constants/strings";

import { getAccountExtraInfo, maskCard } from "@utils/dataModel/utility";

("use strict");

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

const ListItem = ({ title, subtitle, item, image, onPress }) => {
    return (
        <TouchableOpacity onPress={() => onPress(item)} activeOpacity={0.9} style={Styles.listItem}>
            <TransferImageAndDetails
                title={title}
                subtitle={subtitle}
                image={image}
            ></TransferImageAndDetails>
        </TouchableOpacity>
    );
};

const CardList = ({ cards, onPress }) => {
    return cards.map((item, index) => {
        return (
            <View key={index}>
                <ListItem
                    title={item.name}
                    subtitle={maskCard(item.number)}
                    image={{ type: "local", source: item.image }}
                    onPress={onPress}
                    item={item}
                />
            </View>
        );
    });
};

class PayCardsAdd extends Component {
    constructor(props) {
        console.log("PayCardsAdd =====", props.route.params);
        super(props);

        // clear context
        props.resetModel(["payCards"]);

        const tempCard = props.route.params.data?.isSupplementary
            ? props.route.params.data.primaryAcc
            : props.route.params.data;

        if (tempCard) {
            if (tempCard.cardType) {
                // cardType, acctType
                this.prevSelectedAccount = {
                    ...tempCard,
                    accountType: "card",
                    number: tempCard.cardNo ? tempCard.cardNo : tempCard.number,
                    type: tempCard.acctType,
                };
            } else {
                this.prevSelectedAccount = {
                    ...props.route.params.data,
                    number: tempCard.cardNo ? tempCard.cardNo : tempCard.number,
                    type: tempCard.acctType,
                };
            }

            this.fromModule = props.route.params.fromModule;
            this.fromScreen = props.route.params.fromScreen;
            this.dataForNav = props.route.params.dataForNav;
        }

        this.state = { isLoading: true, cards: [], isCardApiCalled: false };

        this.props.updateModel({
            ui: {
                onCancelLogin: this.onCancelLogin,
            },
        });
    }

    onCancelLogin = () => {
        this.props.navigation.goBack();
    };

    componentDidMount() {
        // this.setState({ isLoading: false });
        this.invokeL3();
        this.focusSubscription = this.props.navigation.addListener("focus", () => {
            if (
                (this.state.isCardApiCalled && this.prevSelectedAccount?.accountType == "card") ||
                this.state.cards.length == 1
            ) {
                this.props.navigation.goBack();
            }
        });

        logEvent(FA_VIEW_SCREEN, {
            [FA_SCREEN_NAME]: "Transfer_Card_SelectCard",
        });
    }

    componentWillUnmount() {
        this.focusSubscription();
    }

    // -----------------------
    // API CALL
    // -----------------------
    invokeL3 = async () => {
        try {
            const l3Resp = await invokeL3(true);
            console.log("invokeL3:respone:", l3Resp);
            const result = l3Resp.data;
            const { code, message } = result;
            if (code != 0) {
                this.props.navigation.goBack();
                return;
            }
            this.getCardsList();
        } catch (error) {
            console.log("[PayCardAdd][InvokeL3] Error, ", error);
            this.setState({ isLoading: false });

            if (error.status === "nonetwork") {
                this.props.navigation.goBack();
            }
        }
    };
    getCardsList = () => {
        console.log("getAccountsList");
        const subUrl = "/summary";
        const params = "?type=C";

        let cards = [];

        // StateManager.showLoader(true);
        bankingGetDataMayaM2u(subUrl + params, false)
            .then((response) => {
                console.log("bankingGetDataMayaM2u:", response);
                const result = response.data.result;
                if (result) {
                    cards = result.accountListings.filter((item) => item.type.toLowerCase() != "j");
                }
            })
            .catch((error) => {
                console.log("getCardsList:error", error);
                showErrorToast({
                    message: error.message,
                });
            })
            .finally(() => {
                // getAccountExtraInfo
                cards = cards.map((item) => {
                    const extraInfo = getAccountExtraInfo(item);
                    item = { ...item, ...extraInfo };
                    return item;
                });
                if (this.prevSelectedAccount?.accountType == "card") {
                    let selectedCard = cards.find((item) => {
                        return item.number === this.prevSelectedAccount.number;
                    });

                    this.setState({ cards: cards, isCardApiCalled: true }, () => {
                        this.goToNextScreen(selectedCard);
                    });
                } else if (cards.length == 0) {
                    showInfoToast({
                        message: "Sorry, you don’t have any credit cards with this account.",
                    });
                    this.props.navigation.goBack();
                } else if (cards.length == 1) {
                    let selectedCard = cards[0];
                    this.setState({ cards: cards, isCardApiCalled: true }, () => {
                        this.goToNextScreen(selectedCard);
                    });
                } else {
                    this.setState({ isLoading: false, cards: cards, isCardApiCalled: true });
                }
            });
    };

    // -----------------------
    // EVENT HANDLER
    // -----------------------

    onBackPress = () => {
        this.props.navigation.goBack();
    };

    onCardItemPress = (val) => {
        console.log("onCardItemPress:", val);

        // temporary comment out
        // if (val.statusCode !== "00") {
        //     showErrorToast({
        //         message:
        //             "Sorry, your request could not be processed. Please contact 1 300 88 6688 for assistance.",
        //     });
        //     return;
        // }

        this.goToNextScreen(val);
    };

    // -----------------------
    // OTHERS
    // -----------------------

    goToNextScreen = (val) => {
        let params = this.prepareNavParams();
        params.selectedCard = val;
        // params.selectedCard.isSupplementary = this.props.route.params.data.isSupplementary;
        // params.selectedCard.primaryAcc = this.props.route.params.data.primaryAcc;

        this.props.navigation.navigate(navigationConstant.PAYCARDS_MODULE, {
            screen: navigationConstant.PAYCARDS_SELECT_AMOUNT,
            params: params,
        });
    };

    prepareNavParams = () => {
        let navParam = {
            extraInfo: {
                amount: "0.00",
                prevSelectedAccount: this.prevSelectedAccount,
                fromModule: this.fromModule,
                fromScreen: this.fromScreen,
                dataForNav: this.dataForNav,
            },
            selectedCard: {},
        };

        return navParam;
    };

    render() {
        return (
            <ScreenContainer
                backgroundType="color"
                backgroundColor={MEDIUM_GREY}
                showLoaderModal={this.state.isLoading}
            >
                {!this.state.isLoading && (
                    <ScreenLayout
                        scrollable={true}
                        header={<Header onBackPress={this.onBackPress} />}
                    >
                        <View style={Styles.container}>
                            <View style={Styles.titleContainer}>
                                <Typo
                                    fontSize={20}
                                    lineHeight={28}
                                    textAlign={"left"}
                                    text={"Make a payment to your selected card"}
                                />
                            </View>
                            <View style={Styles.cardListContainer}>
                                <CardList cards={this.state.cards} onPress={this.onCardItemPress} />
                            </View>
                        </View>
                    </ScreenLayout>
                )}
            </ScreenContainer>
        );
    }
}

//make this component available to the app
export default withModelContext(PayCardsAdd);

const Styles = {
    container: {
        flex: 1,
        alignItems: "flex-start",
    },
    titleContainer: {
        width: "100%",
        marginTop: 16,
        alignItems: "flex-start",
        marginHorizontal: 12,
    },
    cardListContainer: {
        width: "100%",
        marginTop: 24,
    },
    listItem: {
        paddingTop: 22,
        paddingBottom: 17,
        borderBottomWidth: 1,
        borderBottomColor: "#cfcfcf",
    },
};
