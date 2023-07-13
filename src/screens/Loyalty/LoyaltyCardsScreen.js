import AsyncStorage from "@react-native-community/async-storage";
import React, { Component } from "react";
import { View, StyleSheet, FlatList, TouchableOpacity, Image, Dimensions } from "react-native";

import EmptyStateScreen from "@screens/CommonScreens/EmptyStateScreen";

import {
    LOYALTY_MODULE_STACK,
    LOYALTY_ADD_CARD,
    LOYALTY_CONFIRM_CARD,
} from "@navigation/navigationConstant";

import HeaderLayout from "@layouts/HeaderLayout";
import ScreenLayout from "@layouts/ScreenLayout";

import ActionButton from "@components/Buttons/ActionButton";
import HeaderBackButton from "@components/Buttons/HeaderBackButton";
import ScreenContainer from "@components/Containers/ScreenContainer";
import Popup from "@components/Popup";
import Typo from "@components/Text";

import { withModelContext } from "@context";

import { checkS2WEarnedChances, getLoyalityCards } from "@services";
import { logEvent } from "@services/analytics";

import { BLACK, WHITE, DISABLED, SHADOW_LIGHTER } from "@constants/colors";
import {
    ADD_CARD,
    FA_ACTION_NAME,
    FA_ADD_CARD,
    FA_LOYALTY,
    FA_SCREEN_NAME,
    FA_SELECT_ACTION,
    FA_VIEW_LOYALTY_CARD,
    LOYALTY,
    LOYALTY_CARD_BTN_TEXT,
    LOYALTY_CARD_INFO,
    LOYALTY_CARD_NOTE_TEXT,
    LOYALTY_CARD_SAFETY_PRECAUTION,
    LOYALTY_CARD_SUBTEXT,
    LOYALTY_CARD_WALLET_HEADER,
    PROCEED,
} from "@constants/strings";

import { accountNumSeparator } from "@utils/dataModel/utility";

import Assets from "@assets";

let loyaltyCardsList = {};

class LoyaltyCardsScreen extends Component {
    constructor(props) {
        super(props);
        loyaltyCardsList = {};
        this.state = {
            ...loyaltyCardsList,
            emptyData: true,
            data: [],
            refresh: false,
            addBtnDisable: false,
            pageNo: 0,
            endPage: 0,
            resultCount: 0,
            totalPage: 0,
            loadMoreData: false,
            firstTimePrompt: false,
            loadOnTrigger: false,
            colorWhiteList: [
                "#ff1744",
                "#ff9100",
                "#6200ea",
                "#7c909b",
                "#d12f6a",
                "#00b0ff",
                "#7a2f2f",
                "#f15b3d",
                "#1684b1",
                "#04bf1e",
                "#720a79",
                "#be0434",
            ],
        };
    }

    componentDidMount = () => {
        console.log("[LoyaltyCardsScreen] >> [componentDidMount]");
        this.loadCards();
        // check for earned chances
        // this.checkForEarnedChances();
        this.props.navigation.addListener("focus", this.onScreenFocus);
    };

    componentWillUnmount() {
        this.timer && clearTimeout(this.timer);
    }

    handleClose = () => {
        this.setState({ firstTimePrompt: false });
    };

    /**
     * S2W chances earned checkers
     */
    checkForEarnedChances = () => {
        const {
            misc: { isCampaignPeriod, isTapTasticReady, tapTasticType },
            s2w: { txnTypeList },
        } = this.props.getModel(["misc", "s2w"]);
        // check if campaign is running and check if it matched the list
        // delayed the check a lil bit to let user see the acknowledge screen
        this.timer && clearTimeout(this.timer);
        // if (!this.props.route.params?.s2w) {
        //     return;
        // }

        this.timer = setTimeout(async () => {
            try {
                if (!this.props.route.params?.s2w) {
                    const resp = await checkS2WEarnedChances({
                        txnType: "MAELOYALTYCARD",
                    });
                    if (resp?.data) {
                        const { displayPopup, generic, chance } = resp.data;
                        console.log("displayPopup", displayPopup, "chance", chance);
                        if (
                            (isCampaignPeriod || isTapTasticReady) &&
                            txnTypeList.includes("MAELOYALTYCARD") &&
                            displayPopup
                        ) {
                            this.props.navigation.push("TabNavigator", {
                                screen: "CampaignChancesEarned",
                                params: {
                                    chances: chance,
                                    isCapped: generic,
                                    isTapTasticReady,
                                    tapTasticType,
                                },
                            });
                        }
                    }
                } else {
                    const { txnType, displayPopup, chance, generic } = this.props.route.params?.s2w;
                    if (
                        (isCampaignPeriod || isTapTasticReady) &&
                        (txnTypeList.includes(txnType) || txnTypeList.includes("MAELOYALTYCARD")) &&
                        displayPopup
                    ) {
                        this.props.navigation.push("TabNavigator", {
                            screen: "CampaignChancesEarned",
                            params: {
                                chances: chance,
                                isCapped: generic,
                                isTapTasticReady,
                                tapTasticType,
                            },
                        });
                    }
                }
            } catch (e) {}
        }, 400);
    };

    onScreenFocus = () => {
        if (this.state.loadOnTrigger && this.props.route.params?.loadCards) {
            this.props.navigation.setParams({ loadCards: false });
            this.setState({ pageNo: 0, data: [] }, () => this.loadCards());
        } else {
            this.setState({
                loadOnTrigger: true,
            });
        }
    };

    loadCards = () => {
        const { pageNo, data } = this.state;
        this.setState({
            loadMoreData: true,
        });
        getLoyalityCards(pageNo)
            .then((response) => {
                console.log("[LoyaltyCardsScreen][loadCards] >> Success", response);
                if (response.status === 200) {
                    if (response.data.resultList.length > 0) {
                        const { resultList, resultCount, endPage, totalPage } = response.data;
                        this.setState({
                            data: pageNo > 0 ? [...data, ...resultList] : resultList,
                            emptyData: false,
                            endPage: endPage,
                            totalPage: totalPage,
                            resultCount: resultCount,
                            loadMoreData: pageNo >= endPage,
                        });
                        if (resultCount === 100) {
                            this.setState({ addBtnDisable: true });
                        }
                    }
                    this.showPopup();
                }
            })
            .catch((error) => {
                console.log("[LoyaltyCardsScreen][loadCards] >> Failure", error);
                // this.onBackTap();
            });
    };
    showPopup = async () => {
        let loyaltyVisitFirstTime = null;
        try {
            loyaltyVisitFirstTime = await AsyncStorage.getItem("loyaltyVisitFirstTime");
        } catch (error) {
            loyaltyVisitFirstTime = null;
        }

        if (!loyaltyVisitFirstTime) {
            AsyncStorage.setItem("loyaltyVisitFirstTime", "true");
            this.setState({ firstTimePrompt: true });
        }
    };

    loadMore = () => {
        const { loadMoreData } = this.state;
        if (!loadMoreData) {
            this.setState(
                {
                    pageNo: this.state.pageNo + 1,
                    loadMoreData: true,
                },
                () => {
                    if (this.state.pageNo < this.state.totalPage) {
                        this.loadCards(this.state.pageNo);
                    }
                }
            );
        }
    };

    onCardClick = (item) => {
        console.log("[LoyaltyCardsScreen] >> [onCardClick]", item.cardName);
        logEvent(FA_SELECT_ACTION, {
            [FA_SCREEN_NAME]: FA_LOYALTY,
            [FA_ACTION_NAME]: FA_VIEW_LOYALTY_CARD,
        });
        this.loyaltyCardsList = this.prepareCardListDetails();
        const colorText = this.state.colorWhiteList.includes(item.color.colorCode) ? WHITE : BLACK;
        this.props.navigation.navigate(LOYALTY_MODULE_STACK, {
            screen: LOYALTY_CONFIRM_CARD,
            params: {
                cardDetails: item,
                from: "viewCard",
                colorText,
            },
        });
    };

    handleGoToLoyalty = () => {
        console.log("[LoyaltyCardsScreen] >> [handleGoToLoyalty]");
        logEvent(FA_SELECT_ACTION, {
            [FA_SCREEN_NAME]: FA_LOYALTY,
            [FA_ACTION_NAME]: FA_ADD_CARD,
        });
        this.loyaltyCardsList = this.prepareCardListDetails();
        this.props.navigation.navigate(LOYALTY_MODULE_STACK, {
            screen: LOYALTY_ADD_CARD,
            params: {
                from: "addCard",
            },
        });
    };

    prepareCardListDetails = () => {
        this.loyaltyCardsList = { ...this.state, from: "LoyaltyCardsScreen" };
        console.log("LoyaltyCardsScreen >> loyaltyCardsList >> ", this.loyaltyCardsList);
        return this.loyaltyCardsList;
    };

    onBackTap = () => {
        console.log("[LoyaltyCardsScreen] >> [onBackTap]");
        this.props.navigation.goBack();
    };

    render() {
        const {
            emptyData,
            data,
            refresh,
            addBtnDisable,
            loadMoreData,
            firstTimePrompt,
            colorWhiteList,
        } = this.state;
        return (
            <ScreenContainer backgroundType="color" analyticScreenName={LOYALTY}>
                <ScreenLayout
                    paddingTop={0}
                    paddingBottom={0}
                    // useSafeArea
                    header={
                        <HeaderLayout
                            headerLeftElement={<HeaderBackButton onPress={this.onBackTap} />}
                            headerCenterElement={
                                <Typo
                                    fontSize={16}
                                    fontWeight="600"
                                    lineHeight={19}
                                    text={LOYALTY}
                                />
                            }
                        />
                    }
                >
                    <React.Fragment>
                        {!emptyData && (
                            <React.Fragment>
                                <View style={styles.listView}>
                                    {data && (
                                        <FlatList
                                            contentContainerStyle={styles.container}
                                            data={data}
                                            extraData={refresh}
                                            renderItem={({ item, index }) => (
                                                <React.Fragment>
                                                    <TouchableOpacity
                                                        style={[
                                                            styles.cardOverview,
                                                            {
                                                                backgroundColor: item.color
                                                                    .colorCode
                                                                    ? item.color.colorCode
                                                                    : "#1684b1",
                                                            },
                                                        ]}
                                                        accessibilityId={"loyalityCard"}
                                                        testID={"loyalityCard"}
                                                        onPress={() => this.onCardClick(item)}
                                                    >
                                                        <View style={styles.cardName}>
                                                            <Typo
                                                                fontSize={14}
                                                                textAlign="left"
                                                                color={
                                                                    colorWhiteList.includes(
                                                                        item.color.colorCode
                                                                    )
                                                                        ? WHITE
                                                                        : BLACK
                                                                }
                                                                fontWeight="600"
                                                                text={item.cardName}
                                                            />
                                                        </View>
                                                        <View style={styles.cardNumber}>
                                                            <Typo
                                                                fontSize={12}
                                                                textAlign="left"
                                                                color={
                                                                    colorWhiteList.includes(
                                                                        item.color.colorCode
                                                                    )
                                                                        ? WHITE
                                                                        : BLACK
                                                                }
                                                                lineHeight={13}
                                                                fontWeight="300"
                                                                text={accountNumSeparator(
                                                                    item.cardNo
                                                                )}
                                                            />
                                                        </View>
                                                    </TouchableOpacity>
                                                </React.Fragment>
                                            )}
                                            onEndReached={this.loadMore}
                                            onEndReachedThreshold={0.1}
                                            showsHorizontalScrollIndicator={false}
                                            showsVerticalScrollIndicator={false}
                                        />
                                    )}
                                </View>
                                <View style={styles.contentContainer}>
                                    <ActionButton
                                        backgroundColor={addBtnDisable ? DISABLED : WHITE}
                                        borderRadius={24}
                                        height={40}
                                        width={136}
                                        style={styles.addBtn}
                                        disabled={addBtnDisable}
                                        componentCenter={
                                            <View style={styles.addBtnView}>
                                                <Image
                                                    style={styles.cameraImage}
                                                    source={Assets.ic_Plus}
                                                />
                                                <Typo
                                                    text={ADD_CARD}
                                                    fontSize={14}
                                                    fontWeight="600"
                                                    lineHeight={18}
                                                />
                                            </View>
                                        }
                                        onPress={this.handleGoToLoyalty}
                                    />
                                </View>
                            </React.Fragment>
                        )}
                    </React.Fragment>
                </ScreenLayout>
                <Popup
                    visible={firstTimePrompt}
                    title={LOYALTY_CARD_INFO}
                    description={LOYALTY_CARD_SAFETY_PRECAUTION}
                    onClose={this.handleClose}
                    primaryAction={{
                        text: PROCEED,
                        onPress: this.handleClose,
                    }}
                />
                {emptyData && (
                    <View style={styles.emptyContainer}>
                        <EmptyStateScreen
                            headerText={LOYALTY_CARD_WALLET_HEADER}
                            subText={LOYALTY_CARD_SUBTEXT}
                            showBtn={true}
                            btnText={LOYALTY_CARD_BTN_TEXT}
                            showNote={true}
                            noteText={LOYALTY_CARD_NOTE_TEXT}
                            imageSrc={Assets.loyaltyEmptyBackground}
                            onBtnPress={this.handleGoToLoyalty}
                        />
                    </View>
                )}
            </ScreenContainer>
        );
    }
}

const styles = StyleSheet.create({
    addBtn: {
        elevation: 8,
        shadowColor: SHADOW_LIGHTER,
        shadowOffset: {
            width: 0,
            height: 4,
        },
        shadowOpacity: 1,
        shadowRadius: 8,
    },
    addBtnView: {
        alignItems: "center",
        flexDirection: "row",
        justifyContent: "flex-start",
    },
    cameraImage: {
        alignItems: "center",
        height: 24,
        width: 24,
    },
    cardName: {
        height: 30,
        marginLeft: 15,
        marginTop: 20,
    },
    cardNumber: {
        height: 50,
        marginLeft: 15,
        marginTop: 5,
    },
    cardOverview: {
        // backgroundColor: "#19cc9f",
        borderRadius: 8,
        fontFamily: "montserrat",
        height: 117,
        marginTop: 20,
        // shadowColor: "rgba(0, 0, 0, 0.08)",
        // shadowOffset: {
        // 	width: 0,
        // 	height: 4
        // },
        // shadowOpacity: 1,
        // shadowRadius: 16,
        width: "100%",
    },
    container: {
        paddingBottom: 80,
    },
    contentContainer: {
        // flex:1,
        // flexDirection:'row',
        // alignItems:'center',
        // justifyContent:'center',
        alignItems: "center",
        bottom: 20,
        justifyContent: "center",
        position: "absolute",
        width: Dimensions.get("window").width,
    },
    emptyContainer: {
        marginTop: 80,
    },
    listView: {
        height: "100%",
    },
});

export default withModelContext(LoyaltyCardsScreen);
