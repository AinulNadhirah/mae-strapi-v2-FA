import PropTypes from "prop-types";
import React, { useCallback, Component } from "react";
import { View, FlatList, StyleSheet, ImageBackground, TouchableOpacity, Image } from "react-native";

import * as navigationConstant from "@navigation/navigationConstant";
import NavigationService from "@navigation/navigationService";

import HeaderLayout from "@layouts/HeaderLayout";
import ScreenLayout from "@layouts/ScreenLayout";

import HeaderBackButton from "@components/Buttons/HeaderBackButton";
import HeaderCloseButton from "@components/Buttons/HeaderCloseButton";
import { GridButtons } from "@components/Common";
import { Avatar } from "@components/Common";
import ScreenContainer from "@components/Containers/ScreenContainer";
import Popup from "@components/Popup";
import RollingTab from "@components/Tabs/RollingTab";
import Typo from "@components/Text";

import { MEDIUM_GREY, BLACK, WHITE, LIGHT_GREY, MARINER, SEPARATOR_GRAY } from "@constants/colors";
import * as Strings from "@constants/strings";

import Assets from "@assets";

import * as TopupController from "./TopupController";

const DISABLED_TEXT = "rgba(0,0,0, .3)";

const BankListItem = ({ title, item, image, onPress }) => {
    function onListItemPressed() {
        onPress(item);
    }
    return (
        <TouchableOpacity onPress={onListItemPressed} activeOpacity={0.9} disabled={item.disabled}>
            <View style={styles.bankInfo}>
                <View style={styles.circleImageView}>
                    <View style={styles.circleImageView}>
                        {image.type === "local" && (
                            <Image
                                style={styles.circleImageView}
                                source={image.source}
                                resizeMode="stretch"
                                resizeMethod="scale"
                            />
                        )}
                        {image.type === "url" && (
                            <Avatar imageUri={image.source} name="name" radius={64} />
                        )}
                    </View>
                </View>
                <View style={styles.bankInfoText}>
                    <Typo
                        fontSize={14}
                        fontWeight="600"
                        fontStyle="normal"
                        letterSpacing={0}
                        lineHeight={18}
                        textAlign="left"
                        text={title}
                        color={item.disabled ? DISABLED_TEXT : BLACK}
                    />
                </View>
            </View>
            <View style={styles.seperator} />
        </TouchableOpacity>
    );
};

BankListItem.propTypes = {
    image: PropTypes.shape({
        source: PropTypes.any,
        type: PropTypes.string,
    }),
    item: PropTypes.shape({
        disabled: PropTypes.any,
    }),
    onPress: PropTypes.func,
    title: PropTypes.any,
    type: PropTypes.any,
};

const CardListItem = ({ title, item, image, onPress, type, onCardRemoveIconPress }) => {
    const onListItemPressed = useCallback(() => {
        onPress(item);
    }, [item, onPress]);

    const onRemove = useCallback(() => {
        onCardRemoveIconPress(item);
    }, [item, onCardRemoveIconPress]);

    return (
        <TouchableOpacity onPress={onListItemPressed} activeOpacity={0.9}>
            <View style={styles.bankInfo}>
                <View style={styles.circleImageView}>
                    <View style={styles.circleImageView}>
                        {image.type === "local" && (
                            <Image
                                style={image.imgStyle}
                                source={image.source}
                                resizeMethod="scale"
                            />
                        )}
                        {image.type === "url" && (
                            <Avatar imageUri={image.source} name="name" radius={64} />
                        )}
                    </View>
                </View>
                <View style={styles.bankInfoText}>
                    <Typo
                        fontSize={14}
                        fontWeight="600"
                        fontStyle="normal"
                        letterSpacing={0}
                        lineHeight={18}
                        color={BLACK}
                        textAlign="left"
                        text={title}
                    />
                </View>
                {type === "card" && (
                    <View style={styles.removeIconsContainer}>
                        <TouchableOpacity
                            onPress={onRemove}
                            accessibilityLabel={"removeBtn"}
                            testID={"removeBtn"}
                        >
                            <View>
                                <Image style={styles.closeImg} source={Assets.closeBGIcon} />
                            </View>
                        </TouchableOpacity>
                    </View>
                )}
            </View>
            <View style={styles.seperator} />
        </TouchableOpacity>
    );
};

CardListItem.propTypes = {
    image: PropTypes.shape({
        imgStyle: PropTypes.any,
        source: PropTypes.any,
        type: PropTypes.string,
    }),
    item: PropTypes.any,
    onCardRemoveIconPress: PropTypes.func,
    onPress: PropTypes.func,
    title: PropTypes.any,
    type: PropTypes.string,
};

const BankList = ({ list, onItemPress }) => {
    return (
        <FlatList
            style={{ width: "100%" }}
            data={list}
            extraData={list}
            scrollToIndex={0}
            showsHorizontalScrollIndicator={false}
            showIndicator={false}
            keyExtractor={(item, index) => `${item.contentId}-${index}`}
            renderItem={({ item, index }) => (
                <BankListItem
                    title={item.name}
                    item={item}
                    image={{
                        type: "url",
                        source: item.image,
                    }}
                    onPress={onItemPress}
                />
            )}
            ListEmptyComponent={
                <NoDataView title="No Results Found" description="We couldn't find any cards." />
            }
        />
    );
};

BankList.propTypes = {
    list: PropTypes.any,
    onItemPress: PropTypes.any,
};

export const CardList = ({ list, onItemPress, onCardRemoveIconPress }) => {
    return (
        <FlatList
            style={{ width: "100%" }}
            data={list}
            extraData={list}
            scrollToIndex={0}
            showsHorizontalScrollIndicator={false}
            showIndicator={false}
            keyExtractor={(item, index) => `${item.contentId}-${index}`}
            renderItem={({ item, index }) => (
                <CardListItem
                    title={item.name}
                    item={item}
                    image={{
                        type: "local",
                        source: item.image,
                        imgStyle: item.imgStyle,
                    }}
                    onPress={onItemPress}
                    type="card"
                    onCardRemoveIconPress={onCardRemoveIconPress}
                />
            )}
            ListEmptyComponent={
                <NoDataView title="No Results Found" description="We couldn't find any items." />
            }
        />
    );
};

CardList.propTypes = {
    list: PropTypes.any,
    onCardRemoveIconPress: PropTypes.any,
    onItemPress: PropTypes.any,
};

// No Data View Class
const NoDataView = ({ title, description }) => {
    return (
        <View style={styles.noData}>
            <View style={styles.noDataTitle}>
                <Typo
                    fontSize={14}
                    fontWeight="bold"
                    letterSpacing={0}
                    lineHeight={18}
                    color={BLACK}
                    text={title}
                />
            </View>
            <View style={styles.noDataDesc}>
                <Typo fontSize={12} lineHeight={14} fontWeight={"100"} text={description} />
            </View>
        </View>
    );
};

NoDataView.propTypes = {
    description: PropTypes.any,
    title: PropTypes.any,
};

class TopupCardBankListScreen extends Component {
    constructor(props) {
        console.log("[TopupCardBankListScreen] >> [Constructor]");
        super(props);
        this.state = {
            currentTabIndex: 1,
            cardToBeRemoved: null,
            cardRemovePopup: false,
            hideAddCard: false,
            data: props.route.params.data ?? null,
            acctNo: props.route.params.data.acctNo ?? null,
            bankListArray: props.route.params.callMergeData.bankListArray ?? [],
            cardListArray: props.route.params.callMergeData.cardListArray ?? [],
        };
    }

    componentDidMount = () => {
        console.log("[TopupCardBankListScreen] >> [componentDidMount]");
        // Retrieve Banks data as default is online banking
        TopupController.fetchBanksData(this, this.state.bankListArray);
        TopupController.fetchCardsData(this, this.state.cardListArray);
    };

    /* EVENT HANDLERS */

    onBackButtonPress = () => {
        console.log("[TopupCardBankListScreen] >> [onBackButtonPress]");
        this.props.navigation.goBack();
    };

    onCloseButtonPress = () => {
        console.log("[TopupCardBankListScreen] >> [onCloseButtonPress]");
        this.props.navigation.goBack();
    };

    onTabPress = (ind) => {
        console.log("[TopupCardBankListScreen] >> [onTabPress]" + ind);
        this.setState({ currentTabIndex: ind });
    };

    onFPXTnCPress = () => {
        console.log("[TopupCardBankListScreen] >> [onFPXTnCPress]");
        TopupController.onFPXTnCTap();
    };

    onAddNewCardButtonPress = () => {
        console.log("[TopupCardBankListScreen] >> [onAddNewCardButtonPress]");
        NavigationService.navigateToModule(
            navigationConstant.BANKINGV2_MODULE,
            navigationConstant.TOPUP_ADD_CARD_SCREEN,
            this.prepareNavParams()
        );
    };

    onBankListItemPress = (item) => {
        console.log("[TopupCardBankListScreen] >> [onBankListItemPress]", item);
        TopupController.onBankSelect(this, item);
    };

    onCardListItemPress = (item) => {
        console.log("[TopupCardBankListScreen] >> [onCardListItemPress]", item);
        TopupController.onCardSelect(this, item);
    };

    onCardRemoveIconPress = (item) => {
        console.log("[TopupCardBankListScreen] >> [onCardRemoveIconPress]", item);
        this.setState({ cardRemovePopup: true, cardToBeRemoved: item });
    };

    onCancelRemoveCard = () => {
        console.log("[TopupCardBankListScreen] >> [onCancelRemoveCard]");
        this.setState({ cardRemovePopup: false, cardToBeRemoved: null });
    };

    onConfirmRemoveCard = () => {
        console.log("[TopupCardBankListScreen] >> [onConfirmRemoveCard]");
        TopupController.onCardRemoveConfirm(this);
        this.setState({ cardRemovePopup: false });
    };

    /* OTHERS */

    processSelectedItem = (item) => {
        let requiredFieldArray = [];

        if (item.billAcctRequired == "0" && requiredFieldArray.length < 2) {
            requiredFieldArray.push(
                this.createRequiredFieldObj(item.bilAcctDispName, item.acctId, "bilAcct")
            );
        }

        if (item.billRefRequired == "0" && requiredFieldArray.length < 2) {
            requiredFieldArray.push(
                this.createRequiredFieldObj(item.billRefDispName, "", "billRef")
            );
        }

        return requiredFieldArray;
    };

    prepareNavParams = () => {
        let navParam = { ...this.props.route.params };
        navParam.acctNo = this.state.acctNo;
        return navParam;
    };

    /* UI */

    renderOnlineBankingTab = () => {
        console.log("[TopupCardBankListScreen] >> [renderOnlineBankingTab]");
        return (
            <View>
                {/* FPX Logo Block */}
                <View style={styles.fpxLogoBlockCls}>
                    {/* FPX Image */}
                    <ImageBackground
                        resizeMode="cover"
                        style={styles.fpxIconImgViewCls}
                        imageStyle={styles.defaultProfileImgCls}
                        source={require("@assets/MAE/fpxLogo.png")}
                    />

                    {/* FPX Label */}
                    <Typo
                        fontSize={14}
                        style={styles.fpxTextCls}
                        text={Strings.FPX_TNC}
                        onPress={this.onFPXTnCPress}
                    />
                </View>

                {/* Banks List */}
                <View style={styles.listContainer}>
                    <BankList
                        list={this.state.bankListArray}
                        onItemPress={this.onBankListItemPress}
                    />
                </View>
            </View>
        );
    };

    renderDebitCardsTab = () => {
        console.log("[TopupCardBankListScreen] >> [renderDebitCardsTab]");

        return (
            <View>
                <View style={styles.newAddCardContainer}>
                    {/* Add New Card Block */}
                    <GridButtons
                        data={{
                            key: "1",
                            title: "Add New Card",
                            source: Assets.icAddDebitCard,
                        }}
                        callback={this.onAddNewCardButtonPress}
                    />
                </View>
                {/*  Card List */}
                <View style={styles.listContainer}>
                    <CardList
                        list={this.state.cardListArray}
                        onItemPress={this.onCardListItemPress}
                        onCardRemoveIconPress={this.onCardRemoveIconPress}
                    />
                </View>
            </View>
        );
    };

    getHeaderUI = () => {
        return (
            <HeaderLayout
                backgroundColor={"transparent"}
                headerCenterElement={
                    <Typo text="Top Up" fontWeight="600" fontSize={16} lineHeight={19} />
                }
                headerLeftElement={<HeaderBackButton onPress={this.onBackButtonPress} />}
                headerRightElement={<HeaderCloseButton onPress={this.onCloseButtonPress} />}
            />
        );
    };

    render() {
        return (
            <ScreenContainer backgroundType="color" backgroundColor={MEDIUM_GREY}>
                <ScreenLayout
                    paddingBottom={0}
                    paddingTop={0}
                    paddingHorizontal={36}
                    header={this.getHeaderUI()}
                    useSafeArea
                    scrollable={true}
                >
                    <View style={styles.container}>
                        <View style={styles.tabContainer}>
                            <RollingTab
                                defaultTabIndex={0}
                                currentTabIndex={this.state.currentTabIndex}
                                tabs={["DEBIT CARD", "ONLINE BANKING"]}
                                onTabPressed={this.onTabPress}
                            />
                            {/* DEBIT CARD */}
                            {this.state.currentTabIndex === 0 && this.renderDebitCardsTab()}

                            {/* ONLINE BANKING */}
                            {this.state.currentTabIndex === 1 && this.renderOnlineBankingTab()}
                        </View>
                    </View>
                </ScreenLayout>

                {/* remove card popup */}
                <Popup
                    visible={this.state.cardRemovePopup}
                    onClose={this.onCancelRemoveCard}
                    title={"Remove Card"}
                    description={Strings.CARD_REMOVE_DESC}
                    primaryAction={{
                        text: "Remove",
                        onPress: this.onConfirmRemoveCard,
                    }}
                    secondaryAction={{
                        text: "Cancel",
                        onPress: this.onCancelRemoveCard,
                    }}
                />
            </ScreenContainer>
        );
    }
}

TopupCardBankListScreen.propTypes = {
    navigation: PropTypes.object,
    route: PropTypes.object,
};

export default TopupCardBankListScreen;

const styles = StyleSheet.create({
    bankInfo: {
        borderBottomColor: LIGHT_GREY,
        borderBottomWidth: 1,
        flexDirection: "row",
        paddingBottom: 17,
        paddingTop: 22,
        width: "100%",
    },
    bankInfoText: {
        flex: 1,
        flexDirection: "column",
        justifyContent: "center",
        marginLeft: 16,
    },
    circleImageView: {
        alignContent: "center",
        alignItems: "center",
        backgroundColor: WHITE,
        borderColor: WHITE,
        borderRadius: 64 / 2,
        borderWidth: 2,
        flexDirection: "row",
        height: 64,
        justifyContent: "center",
        width: 64,
    },
    closeImg: {
        height: 30,
        width: 30,
    },
    container: {
        alignItems: "flex-start",
        flex: 1,
    },
    defaultProfileImgCls: {
        height: "100%",
        width: "100%",
    },
    fpxIconImgViewCls: {
        height: 20,
        overflow: "hidden",
        width: 60,
    },
    fpxLogoBlockCls: {
        alignItems: "center",
        marginBottom: 25,
        marginTop: 25,
        width: "100%",
    },
    fpxTextCls: {
        color: MARINER,
        fontFamily: "montserrat",
        fontSize: 11,
        fontStyle: "normal",
        fontWeight: "bold",
        letterSpacing: 0,
        lineHeight: 16,
        marginTop: 10,
    },
    listContainer: { alignItems: "flex-start", width: "100%" },
    newAddCardContainer: {
        paddingTop: 16,
    },
    noData: { flex: 1, justifyContent: "center", paddingTop: 20 },
    noDataDesc: { paddingTop: 10 },
    removeIconsContainer: {
        borderBottomRightRadius: 50,
        borderTopRightRadius: 50,
        flexDirection: "column",
        justifyContent: "center",
    },
    seperator: {
        backgroundColor: SEPARATOR_GRAY,
        height: 1,
        width: "100%",
    },
    tabContainer: {
        marginTop: 10,
        width: "100%",
    },
});
