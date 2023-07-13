import PropTypes from "prop-types";
import React, { useState } from "react";
import { View, TouchableOpacity, Image, FlatList, ImageBackground, StyleSheet } from "react-native";
import SwitchToggle from "react-native-switch-toggle";

import ProductHoldingsListItem from "@components/ListItems/ProductHoldingsListItem";
import TabView from "@components/Specials/TabView";
import Typo from "@components/Text";

import { DARK_GREY, GREY, SWITCH_GREEN, SWITCH_GREY, WHITE } from "@constants/colors";
import { CURRENT, SAVINGS, SET_CARD_PIN } from "@constants/data";
import {
    BLOCK_CARD,
    CC,
    CC_EXPIRED,
    CHANGE_CARD_PIN,
    DETAILS,
    MAE_TITLE,
    MAKE_PRIMARY_ACC,
    MANAGE,
    SET_AS_PRIMARY,
    SUSPEND_ACCOUNT,
    TEMPORARILY_DEACTIVATE_ACC,
    TEMPORARILY_DEACTIVATE_CARD,
} from "@constants/strings";

import { isEmpty } from "@utils/dataModel/utility";

import assets from "@assets";

function keyExtractor(item, index) {
    return index.toString();
}

const MAEBanner = ({ item, _onPressBanner }) => (
    <View
        style={
            item.categoryName === "ApplyCard"
                ? stylesList.upgradeViewMarginRight
                : stylesList.upgradeView
        }
    >
        <TouchableOpacity
            style={stylesList.bannerImageContainer}
            onPress={() => _onPressBanner(item.id)}
        >
            <ImageBackground
                resizeMode="cover"
                style={stylesList.imageBackground}
                source={item.imageUrl}
            />
        </TouchableOpacity>
    </View>
);

MAEBanner.propTypes = {
    _onPressBanner: PropTypes.func,
    item: PropTypes.shape(),
};

const AccountDetailsTabView = ({
    getModel,
    navigation,
    route,
    state: parentState,
    isSupplementary,
    _navigateToSetPin,
    _updatePrimary,
    _onPressBanner,
    onPressSuspendAccount,
    onPressBlockCard,
}) => {
    const [activeTabIndex, setActiveTabIndex] = useState(0);

    const { data, type, setPin, isAccountSuspended, maeBannerData } = parentState;
    const { isShowBlockCard, isShowSuspendCASA } = getModel("misc");
    const CASADetails = [
        {
            title: "Current balance",
            value: `RM ${data.currentBalance}`,
        },
        {
            title: "One-day float",
            value: `RM ${data.oneDayFloat}`,
        },
        {
            title: "Two-day float",
            value: `RM ${data.twoDayFloat}`,
        },
        {
            title: "Late clearing/Outstation cheque float",
            value: `RM ${data.lateClearing}`,
        },
    ];
    const cardsDetails = [
        {
            title: "Total Credit Limit",
            value: `RM ${data.creditLimit}`,
            isVisible: data.cardType !== "R",
        },
        {
            title: "Available Credit Limit",
            value: `RM ${data.availableCreditLimit}`,
            isVisible: !isSupplementary,
        },
        {
            title: "Outstanding Balance",
            value: `RM ${data.outstandingBalance}`,
            isVisible: !isSupplementary,
        },
        {
            title: "Statement Balance",
            value: `RM ${data.statementBalance}`,
            isVisible: !isSupplementary,
        },
        {
            title: "Statement Date",
            value: data.statementDate,
            isVisible: true,
        },
        {
            title: "Payment Due Date",
            value: data.paymentDueDate,
            isVisible: true,
        },
        {
            title: "Minimum Payment Amount",
            value: `RM ${data.minPaymentAmt}`,
            isVisible: data.cardType !== "R" && !isSupplementary,
        },
        {
            title: "Last Payment Amount",
            value: `RM ${data.lastPaymentAmt}`,
            isVisible: true,
        },
        {
            title: "Last Payment Date",
            value: data.lastPaymentDate,
            isVisible: true,
        },
    ];

    const cardsManageContent = [
        {
            showOption: true,
            onPress: onPressBlockCard,
            title: BLOCK_CARD,
            description: TEMPORARILY_DEACTIVATE_CARD,
            showToggle: false,
        },
        {
            showOption: setPin,
            onPress: () => _navigateToSetPin(SET_CARD_PIN),
            title: CHANGE_CARD_PIN,
            showToggle: false,
        },
    ];

    const CASAManageContent = [
        {
            showOption: isShowSuspendCASA,
            onPress: onPressSuspendAccount,
            title: SUSPEND_ACCOUNT,
            description: TEMPORARILY_DEACTIVATE_ACC,
            showToggle: false,
        },
        {
            showOption: true,
            onPress: _updatePrimary,
            title: SET_AS_PRIMARY,
            description: MAKE_PRIMARY_ACC,
            showToggle: true,
            toggleSwitchOn: data?.primary,
            onTogglePress: _updatePrimary,
        },
    ];

    // set height for each item inside tab section
    const cardsDetailHeight = 55;
    const CASADetailHeight = 55;
    const cardsManageContentHeight = 90;
    const CASAManageContentHeight = 90;

    const [ccTabHeight, setCcTabHeight] = useState(
        type === MAE_TITLE
            ? CASAManageContent.length * CASAManageContentHeight
            : type === CC
            ? cardsDetails.length * cardsDetailHeight
            : CASADetails.length * CASADetailHeight
    );

    const _renderAccountDetails = () => {
        return (
            <>
                {[CURRENT, SAVINGS].includes(type) && (
                    <View style={stylesList.containerAccDetails}>
                        {CASADetails.map(({ title, value }) => (
                            <ProductHoldingsListItem
                                title={title}
                                isString={true}
                                string={value}
                                key={title}
                            />
                        ))}
                    </View>
                )}
                {[CC, CC_EXPIRED].includes(type) && data.cardType !== "J" && (
                    <View style={stylesList.containerCardDetails}>
                        {cardsDetails.map(
                            ({ title, value, isVisible }) =>
                                value &&
                                isVisible && (
                                    <ProductHoldingsListItem
                                        title={title}
                                        isString={true}
                                        string={value}
                                        key={title}
                                    />
                                )
                        )}
                    </View>
                )}
            </>
        );
    };
    const renderManageTabContent = () => {
        if (type === CC) {
            return (
                <View style={stylesList.manageParentContainer(isAccountSuspended)}>
                    {cardsManageContent.map((item, index) => {
                        return (
                            item.showOption && (
                                <View key={index} style={stylesList.manageContainer}>
                                    <TouchableOpacity
                                        onPress={item.onPress}
                                        style={stylesList.listContainer}
                                    >
                                        <View style={stylesList.textBox}>
                                            <Typo
                                                text={item.title}
                                                fontWeight="600"
                                                fontSize={16}
                                                lineHeight={20}
                                                textAlign="left"
                                            />
                                            {item.description && (
                                                <Typo
                                                    text={item.description}
                                                    fontWeight="normal"
                                                    fontSize={12}
                                                    lineHeight={18}
                                                    textAlign="left"
                                                    style={stylesList.description}
                                                    color={DARK_GREY}
                                                />
                                            )}
                                        </View>
                                        {item.showToggle ? (
                                            <SwitchToggle
                                                containerStyle={
                                                    stylesList.manageItemChildSwitchContainer
                                                }
                                                circleStyle={stylesList.manageItemChildSwitchCircle}
                                                switchOn={item.toggleSwitchOn}
                                                onPress={item.onTogglePress}
                                                backgroundColorOn={SWITCH_GREEN}
                                                backgroundColorOff={SWITCH_GREY}
                                                circleColorOff={WHITE}
                                                circleColorOn={WHITE}
                                                duration={200}
                                            />
                                        ) : (
                                            <Image
                                                source={assets.icChevronRight24Black}
                                                style={stylesList.manageItemChildChevron}
                                            />
                                        )}
                                    </TouchableOpacity>
                                </View>
                            )
                        );
                    })}
                </View>
            );
        } else if ([CURRENT, SAVINGS, MAE_TITLE].includes(type)) {
            return (
                <View style={stylesList.manageParentContainer(isAccountSuspended)}>
                    {CASAManageContent.map((item, index) => {
                        return (
                            item.showOption && (
                                <View key={index} style={stylesList.manageContainer}>
                                    <TouchableOpacity
                                        onPress={item.onPress}
                                        style={stylesList.listContainer}
                                    >
                                        <View style={stylesList.textBox}>
                                            <Typo
                                                text={item.title}
                                                fontWeight="600"
                                                fontSize={16}
                                                lineHeight={20}
                                                textAlign="left"
                                            />
                                            {item.description && (
                                                <Typo
                                                    text={item.description}
                                                    fontWeight="normal"
                                                    fontSize={12}
                                                    lineHeight={18}
                                                    textAlign="left"
                                                    style={stylesList.description}
                                                    color={DARK_GREY}
                                                />
                                            )}
                                        </View>
                                        {item.showToggle ? (
                                            <SwitchToggle
                                                containerStyle={
                                                    stylesList.manageItemChildSwitchContainer
                                                }
                                                circleStyle={stylesList.manageItemChildSwitchCircle}
                                                switchOn={item.toggleSwitchOn}
                                                onPress={item.onTogglePress}
                                                backgroundColorOn={SWITCH_GREEN}
                                                backgroundColorOff={SWITCH_GREY}
                                                circleColorOff={WHITE}
                                                circleColorOn={WHITE}
                                                duration={200}
                                            />
                                        ) : (
                                            <Image
                                                source={assets.icChevronRight24Black}
                                                style={stylesList.manageItemChildChevron}
                                            />
                                        )}
                                    </TouchableOpacity>
                                </View>
                            )
                        );
                    })}
                </View>
            );
        }
    };

    const renderItem = ({ item }) => {
        return <MAEBanner item={item} _onPressBanner={_onPressBanner} />;
    };

    const _renderMAEBanner = () => {
        return (
            <FlatList
                style={stylesList.upgradeWalletView}
                horizontal
                data={maeBannerData}
                showsHorizontalScrollIndicator={false}
                renderItem={renderItem}
                keyExtractor={keyExtractor}
            />
        );
    };

    const handleTabChange = (tabInd) => {
        setActiveTabIndex(tabInd);
        type === CC
            ? tabInd === 0
                ? setCcTabHeight(cardsDetails.length * cardsDetailHeight)
                : setCcTabHeight(cardsManageContent.length * cardsManageContentHeight)
            : type === MAE_TITLE
            ? tabInd === 0
                ? setCcTabHeight(CASAManageContent.length * CASAManageContentHeight)
                : setCcTabHeight(0) // as of now only one tab for MAE Card, can update this to be dynamic in future if new tabs are added
            : tabInd === 0
            ? setCcTabHeight(CASADetails.length * CASADetailHeight)
            : setCcTabHeight(CASAManageContent.length * CASAManageContentHeight);
    };

    const renderTabView = () => {
        if ([CURRENT, SAVINGS].includes(type) || (isShowBlockCard && type === CC)) {
            return (
                <View style={stylesList.tabContainer(type)}>
                    <TabView
                        defaultTabIndex={activeTabIndex}
                        titles={[DETAILS, MANAGE]}
                        onTabChange={handleTabChange}
                        scrollToEnd={false}
                        height={ccTabHeight}
                        screens={[
                            <View key="0">{_renderAccountDetails()}</View>,
                            <View key="1">{renderManageTabContent()}</View>,
                        ]}
                    />
                </View>
            );
        } else if (type === MAE_TITLE) {
            return (
                <>
                    <View style={stylesList.tabContainer(type)}>
                        <TabView
                            defaultTabIndex={activeTabIndex}
                            titles={[MANAGE]}
                            onTabChange={handleTabChange}
                            scrollToEnd={false}
                            height={ccTabHeight}
                            screens={[<View key="0">{renderManageTabContent()}</View>]}
                        />
                    </View>
                    {!isEmpty(maeBannerData) && _renderMAEBanner()}
                </>
            );
        } else {
            return _renderAccountDetails();
        }
    };

    return renderTabView();
};

AccountDetailsTabView.propTypes = {
    getModel: PropTypes.func,
    state: PropTypes.shape(),
    navigation: PropTypes.shape(),
    route: PropTypes.shape(),
    isSupplementary: PropTypes.bool,
    _navigateToSetPin: PropTypes.func,
    _updatePrimary: PropTypes.func,
    _onPressBanner: PropTypes.func,
    onPressSuspendAccount: PropTypes.func,
    onPressBlockCard: PropTypes.func,
};
const stylesList = StyleSheet.create({
    bannerImageContainer: {
        borderRadius: 8,
        borderStyle: "solid",
        flexDirection: "row",
        flex: 1,
    },
    upgradeView: {
        height: "100%",
        marginLeft: 24,
        width: 280,
    },
    upgradeViewMarginRight: {
        height: "100%",
        marginLeft: 24,
        width: 280,
        marginRight: 24,
    },
    imageBackground: {
        alignItems: "center",
        borderRadius: 8,
        borderStyle: "solid",
        height: "100%",
        justifyContent: "center",
        overflow: "hidden",
        width: "100%",
    },
    containerAccDetails: {
        paddingHorizontal: 32,
        paddingTop: 8,
        width: "100%",
    },
    containerCardDetails: {
        paddingHorizontal: 32,
        width: "100%",
    },
    listContainer: {
        alignItems: "center",
        flexDirection: "row",
        justifyContent: "space-between",
        paddingLeft: 24,
        paddingRight: 24,
        paddingVertical: 14,
    },
    manageParentContainer: (isAccountSuspended) => ({
        opacity: isAccountSuspended ? 0.5 : 1,
    }),
    manageContainer: {
        backgroundColor: WHITE,
        borderBottomColor: GREY,
        borderBottomWidth: 1,
    },
    manageItemChildChevron: { height: 30, width: 30 },
    manageItemChildSwitchCircle: {
        backgroundColor: WHITE,
        borderRadius: 10,
        height: 20,
        width: 20,
    },
    manageItemChildSwitchContainer: {
        backgroundColor: SWITCH_GREY,
        borderRadius: 20,
        height: 22,
        padding: 1,
        width: 40,
    },
    tabContainer: (type) => ({
        marginBottom: 12,
        marginTop: 24,
        flex: 1,
    }),
    textBox: {
        marginRight: 5,
        width: "90%",
    },
    upgradeWalletView: {
        height: 114,
        marginTop: 40,
        width: "100%",
    },
});

export default AccountDetailsTabView;
