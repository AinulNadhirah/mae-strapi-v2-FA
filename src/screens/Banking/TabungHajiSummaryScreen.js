import PropTypes from "prop-types";
import React from "react";
import { FlatList, StyleSheet, View } from "react-native";

import {
    TABUNG_HAJI_TRANSACTION_HISTORY_SCREEN,
    BANKINGV2_MODULE,
} from "@navigation/navigationConstant";

import HeaderLayout from "@layouts/HeaderLayout";
import ScreenLayout from "@layouts/ScreenLayout";

import HeaderBackButton from "@components/Buttons/HeaderBackButton";
import SwitchButton from "@components/Buttons/SwitchButton";
import ScreenContainer from "@components/Containers/ScreenContainer";
import Typo from "@components/Text";
import TransferProductCard from "@components/TransferProductCard";

import { GABanking } from "@services/analytics/analyticsBanking";
import { TabungHajiAnalytics } from "@services/analytics/analyticsTabungHaji";

import { TOTAL_AMOUNT, TABUNG_HAJI } from "@constants/strings";

import { numberWithCommas } from "@utils/dataModel/utility";
import { switchEnum, switchOptions } from "@utils/dataModel/utilityEnum";

export default class TabungHajiSummaryScreen extends React.Component {
    static propTypes = {
        navigation: PropTypes.object.isRequired,
        route: PropTypes.object.isRequired,
    };

    state = {
        showSwitch: true,
        totalAmount: "",
        tabungHajiAccountData: [],
        currentSelectedList: switchEnum.self,
        guardianDetail: this.props?.route?.params?.guardianDetail,
        minorDetail: this.props.route?.params?.minorDetail,
    };

    componentDidMount() {
        this._hydrateScreen();

        TabungHajiAnalytics.summaryAccountLoaded();
        GABanking.viewScreenTabungHaji();
    }

    _hydrateScreen = async () => {
        const { guardianDetail, minorDetail } = this.state;
        this.setState({
            tabungHajiAccountData: guardianDetail ?? [],
            totalAmount: `RM ${guardianDetail?.[0]?.balanceFormatted ?? ""}`,
            showSwitch: minorDetail.length !== 0,
        });
    };

    _onHeaderBackButtonPressed = () => this.props.navigation.goBack();

    _onTHProductCardPressed = (obj) => {
        const { guardianDetail } = this.state;
        const accName = obj.accountName;
        TabungHajiAnalytics.summaryAccountSelected(accName);

        this.props.navigation.navigate(BANKINGV2_MODULE, {
            screen: TABUNG_HAJI_TRANSACTION_HISTORY_SCREEN,
            params: {
                ...obj,
                guardianDetail,
            },
        });
    };

    _tabungHajiAccountListKeyExtractor = (item, index) =>
        `${item.accountName}-${item.accountNo}-${item.balanceFormatted}`;

    _renderTabungHajiAccountListItems = ({ item }) => (
        <TransferProductCard {...item} onCardPressed={this._onTHProductCardPressed} />
    );

    _switchTHListings = () => {
        const { guardianDetail, minorDetail } = this.state;

        if (this.state.currentSelectedList === switchEnum.self) {
            let minorAccTotalBalance = 0;
            minorDetail.forEach((element) => {
                minorAccTotalBalance += element?.balance;
            });
            this.setState({
                tabungHajiAccountData: minorDetail ?? [],
                totalAmount: `RM ${numberWithCommas(minorAccTotalBalance.toFixed(2)) ?? ""}`,
                currentSelectedList: switchEnum.dependent,
            });
        } else {
            this.setState({
                tabungHajiAccountData: guardianDetail ?? [],
                totalAmount: `RM ${guardianDetail?.[0]?.balanceFormatted ?? ""}`,
                currentSelectedList: switchEnum.self,
            });
        }
    };

    render() {
        const { totalAmount, tabungHajiAccountData, showSwitch } = this.state;

        return (
            <ScreenContainer backgroundType="color">
                <ScreenLayout
                    useSafeArea
                    paddingBottom={0}
                    header={
                        <HeaderLayout
                            headerCenterElement={
                                <Typo
                                    text={TABUNG_HAJI}
                                    fontSize={16}
                                    lineHeight={18}
                                    fontWeight="600"
                                />
                            }
                            headerLeftElement={
                                <HeaderBackButton onPress={this._onHeaderBackButtonPressed} />
                            }
                        />
                    }
                >
                    <>
                        {showSwitch && (
                            <View style={Styles.switch}>
                                <SwitchButton
                                    initial={switchEnum.overview}
                                    onPress={this._switchTHListings}
                                    options={switchOptions}
                                />
                            </View>
                        )}
                        <View style={Styles.totalAmount}>
                            <Typo
                                text={totalAmount}
                                fontSize={26}
                                fontWeight="bold"
                                lineHeight={32}
                            />
                            <Typo text={TOTAL_AMOUNT} style={Styles.totalAmountTitle} />
                        </View>
                        <FlatList
                            showsVerticalScrollIndicator={false}
                            data={tabungHajiAccountData}
                            keyExtractor={this._tabungHajiAccountListKeyExtractor}
                            renderItem={this._renderTabungHajiAccountListItems}
                        />
                    </>
                </ScreenLayout>
            </ScreenContainer>
        );
    }
}

const Styles = StyleSheet.create({
    switch: {
        paddingHorizontal: 12,
    },
    totalAmount: {
        alignItems: "center",
        marginBottom: 24,
        marginTop: 30,
        width: "100%",
    },
    totalAmountTitle: {
        lineHeight: 20,
        textTransform: "capitalize",
    },
});
