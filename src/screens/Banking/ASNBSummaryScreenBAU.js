import PropTypes from "prop-types";
import React, { Component, useCallback } from "react";
import { FlatList, StyleSheet, View } from "react-native";

import { BANKINGV2_MODULE } from "@navigation/navigationConstant";

import HeaderLayout from "@layouts/HeaderLayout";
import ScreenLayout from "@layouts/ScreenLayout";

import HeaderBackButton from "@components/Buttons/HeaderBackButton";
import SwitchButton from "@components/Buttons/SwitchButton";
import ProductCard from "@components/Cards/ProductCard";
import ScreenContainer from "@components/Containers/ScreenContainer";
import Typo from "@components/Text";

import { WHITE } from "@constants/colors";

import { formateAccountNumber } from "@utils/dataModel/utility";

import Assets from "@assets";

const switchEnum = Object.freeze({
    self: 0,
    dependent: 1,
});

const switchOptions = Object.freeze([
    {
        label: "Self",
        value: switchEnum.self,
        activeColor: WHITE,
    },
    {
        label: "Dependent",
        value: switchEnum.dependent,
        activeColor: WHITE,
    },
]);

const ASNBProductCard = ({
    membNo,
    unitHldng,
    idNo,
    idType,
    fullName,
    shortName,
    onASNBProductCardPressed,
}) => {
    const asnbAmount = unitHldng ? parseFloat(unitHldng.replace(/[,.]/g, "")) / 100 : 0;

    const onProductCardPressed = useCallback(
        () =>
            onASNBProductCardPressed({
                fullName,
                shortName,
                idNo,
                idType,
                membNo,
                unitHldng: asnbAmount,
            }),
        [membNo, idNo, idType, shortName, fullName, onASNBProductCardPressed, asnbAmount]
    );

    return (
        <ProductCard
            title={fullName}
            desc={formateAccountNumber(membNo, 12)}
            amount={asnbAmount}
            onCardPressed={onProductCardPressed}
            image={Assets.investmentCardBackground}
            isWhite
        />
    );
};

ASNBProductCard.propTypes = {
    fullName: PropTypes.string.isRequired,
    membNo: PropTypes.string.isRequired,
    unitHldng: PropTypes.string.isRequired,
    idNo: PropTypes.string.isRequired,
    idType: PropTypes.string.isRequired,
    shortName: PropTypes.string.isRequired,
    onASNBProductCardPressed: PropTypes.func.isRequired,
};

export default class ASNBSummaryScreen extends Component {
    static propTypes = {
        navigation: PropTypes.object.isRequired,
        route: PropTypes.object.isRequired,
    };

    state = {
        showSwitch: false,
        totalAmount: "",
        asnbList: [],
        currentSelectedList: switchEnum.self,
    };

    componentDidMount() {
        this._hydrateScreen();
    }

    _hydrateScreen = async () => {
        const {
            route: {
                params: { guardianDetail, showMinor },
            },
        } = this.props;
        this.setState({
            asnbList: guardianDetail?.guardianList ?? [],
            totalAmount: `RM ${guardianDetail?.guardianTotalAmount ?? ""}`,
            showSwitch: showMinor,
        });
    };

    _onHeaderBackButtonPressed = () => this.props.navigation.goBack();

    _onASNBProductCardPressed = (obj) =>
        this.props.navigation.navigate(BANKINGV2_MODULE, {
            screen: "ASNBTransactionHistoryScreenBAU",
            params: { ...obj },
        });

    _summaryListingKeyExtractor = (item) => `${item.beneName}-${item.membNo}-${item.unitHldng}`;

    _renderSummaryListingItems = ({ item }) => (
        <ASNBProductCard {...item} onASNBProductCardPressed={this._onASNBProductCardPressed} />
    );

    _switchASNBListings = () => {
        const {
            route: {
                params: { guardianDetail, minorDetail },
            },
        } = this.props;

        if (this.state.currentSelectedList === switchEnum.self)
            this.setState({
                asnbList: minorDetail?.minorList ?? [],
                totalAmount: `RM ${minorDetail?.minorTotalAmount ?? ""}`,
                currentSelectedList: switchEnum.dependent,
            });
        else
            this.setState({
                asnbList: guardianDetail?.guardianList ?? [],
                totalAmount: `RM ${guardianDetail?.guardianTotalAmount ?? ""}`,
                currentSelectedList: switchEnum.self,
            });
    };

    render() {
        const { asnbList, totalAmount, showSwitch } = this.state;

        return (
            <ScreenContainer backgroundType="color">
                <ScreenLayout
                    header={
                        <HeaderLayout
                            headerCenterElement={
                                <Typo
                                    text="ASNB Accounts"
                                    fontSize={16}
                                    fontWeight="600"
                                    lineHeight={19}
                                />
                            }
                            headerLeftElement={
                                <HeaderBackButton onPress={this._onHeaderBackButtonPressed} />
                            }
                        />
                    }
                    useSafeArea
                    neverForceInset={["bottom"]}
                    paddingBottom={0}
                >
                    <>
                        {showSwitch && (
                            <View style={styles.switch}>
                                <SwitchButton
                                    initial={switchEnum.overview}
                                    onPress={this._switchASNBListings}
                                    options={switchOptions}
                                />
                            </View>
                        )}
                        <View
                            style={[
                                styles.totalAmount,
                                ...[showSwitch ? { marginTop: 30 } : { marginTop: 20 }],
                            ]}
                        >
                            <Typo
                                text={totalAmount}
                                fontSize={26}
                                fontWeight="bold"
                                lineHeight={32}
                            />
                            <Typo text="Total Amount" lineHeight={18} />
                        </View>
                        <FlatList
                            data={asnbList}
                            renderItem={this._renderSummaryListingItems}
                            keyExtractor={this._summaryListingKeyExtractor}
                            showsVerticalScrollIndicator={false}
                        />
                    </>
                </ScreenLayout>
            </ScreenContainer>
        );
    }
}

const styles = StyleSheet.create({
    switch: {
        paddingHorizontal: 12,
    },
    totalAmount: {
        alignItems: "center",
        marginBottom: 24,
        width: "100%",
    },
});
