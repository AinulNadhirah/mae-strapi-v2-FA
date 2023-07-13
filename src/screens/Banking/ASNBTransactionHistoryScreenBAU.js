import PropTypes from "prop-types";
import React, { Component } from "react";
import { SectionList, StyleSheet, View, Image } from "react-native";

import { FUNDTRANSFER_MODULE, TRANSFER_TAB_SCREEN } from "@navigation/navigationConstant";

import HeaderLayout from "@layouts/HeaderLayout";
import ScreenLayout from "@layouts/ScreenLayout";

import ActionButton from "@components/Buttons/ActionButton";
import HeaderCloseButton from "@components/Buttons/HeaderCloseButton";
import ProductCard from "@components/Cards/ProductCard";
import ScreenContainer from "@components/Containers/ScreenContainer";
import FixedActionContainer from "@components/Footers/FixedActionContainer";
import TrackerListItem from "@components/ListItems/TrackerListItem";
import TrackerSectionItem from "@components/ListItems/TrackerSectionItem";
import Typo from "@components/Text";

import { bankingPostDataMayaM2u } from "@services/index";

import { WHITE } from "@constants/colors";

import { formateAccountNumber, getShadow } from "@utils/dataModel/utility";
import { ErrorLogger } from "@utils/logs";

import Assets from "@assets";

export default class ASNBTransactionHistoryScreen extends Component {
    static propTypes = {
        navigation: PropTypes.object.isRequired,
        route: PropTypes.object.isRequired,
    };

    state = {
        transactionHistory: [],
        asnbType: "",
        asnbIdNumber: "",
        asnbAmount: 0,
    };

    componentDidMount() {
        this._syncParamsToState();
        this._syncRemoteDataToState();
    }

    _syncParamsToState = () =>
        this.setState({
            asnbType: this.props.route?.params?.fullName ?? "",
            asnbIdNumber: this.props.route?.params?.membNo ?? "",
            asnbAmount: this.props.route?.params?.unitHldng ?? 0,
        });

    _syncRemoteDataToState = async () => {
        const request = await this._getTransactionHistoryData();
        const sectionListData = this._transformTransactionHistoriesToSectionListData(
            request?.data?.UPLOAD_TXN_ACK?.POLICYTYPEDETAIL?.TRANSACTIONDETAIL ?? []
        );
        this.setState({
            transactionHistory: sectionListData,
        });
    };

    _transformTransactionHistoriesToSectionListData = (transactionHistories) => {
        if (!transactionHistories) return transactionHistories;
        const titles = transactionHistories.map(
            (transactionHistory) => transactionHistory.TRANSACTIONDATE
        );
        const sectionListMap = new Map();
        titles.forEach((title) => {
            const data = [];
            transactionHistories.forEach((transactionHistory) => {
                if (transactionHistory.TRANSACTIONDATE === title)
                    data.push({
                        transactionType: transactionHistory.TRANSACTIONTYPE,
                        transactionAmount: transactionHistory.TRANSACTIONAMOUNT,
                    });
            });
            sectionListMap.set(title, {
                title,
                data,
            });
        });
        const sectionListData = [];
        // eslint-disable-next-line no-unused-vars
        for (const value of sectionListMap.values()) {
            sectionListData.push(value);
        }
        return sectionListData;
    };

    _getTransactionHistoryData = async () => {
        try {
            const response = await bankingPostDataMayaM2u(
                `/asnb/getASNBTransactionHistory`,
                {
                    asnbType: this.props.route?.params?.shortName ?? "",
                    idNo: this.props.route?.params?.idNo ?? "",
                    idType: this.props.route?.params?.idType ?? "",
                    memberNo: this.props.route?.params?.membNo ?? "",
                },
                true
            );
            if (response?.status === 200) return response;
            else return null;
        } catch (error) {
            ErrorLogger(error);
            return null;
        }
    };

    _onHeaderCloseButtonPressed = () => this.props.navigation.goBack();

    _renderSectionHeader = ({ section: { title } }) => (
        <TrackerSectionItem date={title} dateFormat="DD/MM/YYYY" hideAmount />
    );

    _renderTransactionHistoryItem = ({ item }) => {
        let convertedAmount = 0;
        const transactionAmount = item?.transactionAmount ?? "0";
        if (transactionAmount.match(/[,.]/g)?.length)
            convertedAmount = parseFloat(transactionAmount.replace(/[,.]/g, "")) / 100;
        else convertedAmount = parseFloat(transactionAmount);
        return (
            <View style={styles.listItemContainer}>
                <TrackerListItem title={item.transactionType} amount={convertedAmount} hideIcon />
            </View>
        );
    };

    _transactionHistoryListKeyExtractor = ({ transactionType }, index) =>
        `${transactionType}-${index}`;

    _handleNewTransferButtonPressed = () =>
        this.props.navigation.navigate(FUNDTRANSFER_MODULE, {
            screen: TRANSFER_TAB_SCREEN,
            params: {
                screenDate: { routeFrom: "ASNBTransactionHistoryScreen" },
                isNewASNBTransferEntryPoint: true,
            },
        });

    render() {
        const { asnbType, asnbAmount, asnbIdNumber, transactionHistory } = this.state;
        return (
            <ScreenContainer backgroundType="color">
                <ScreenLayout
                    header={
                        <HeaderLayout
                            headerRightElement={
                                <HeaderCloseButton onPress={this._onHeaderCloseButtonPressed} />
                            }
                        />
                    }
                    useSafeArea
                    paddingHorizontal={0}
                    paddingBottom={0}
                >
                    <>
                        <View style={styles.headerContainer}>
                            <ProductCard
                                title={asnbType}
                                desc={formateAccountNumber(asnbIdNumber, 12)}
                                amount={asnbAmount}
                                image={Assets.investmentCardBackground}
                                isWhite
                                disabled
                            />
                        </View>
                        <SectionList
                            showsVerticalScrollIndicator={false}
                            sections={transactionHistory}
                            renderSectionHeader={this._renderSectionHeader}
                            renderItem={this._renderTransactionHistoryItem}
                            keyExtractor={this._transactionHistoryListKeyExtractor}
                        />
                        <FixedActionContainer>
                            <View style={styles.shadow}>
                                <ActionButton
                                    height={40}
                                    width={165}
                                    backgroundColor={WHITE}
                                    componentCenter={
                                        <View style={styles.wrapper}>
                                            <Image
                                                source={Assets.icon32BlackAdd}
                                                style={styles.addImage}
                                            />
                                            <Typo
                                                text="New Transfer"
                                                fontWeight="600"
                                                lineHeight={18}
                                                fontSize={14}
                                                textAlign="center"
                                            />
                                        </View>
                                    }
                                    onPress={this._handleNewTransferButtonPressed}
                                />
                            </View>
                        </FixedActionContainer>
                    </>
                </ScreenLayout>
            </ScreenContainer>
        );
    }
}

const styles = StyleSheet.create({
    addImage: { height: 16, marginRight: 10, width: 16 },
    headerContainer: {
        paddingBottom: 40,
        paddingHorizontal: 24,
        paddingTop: 16,
    },
    listItemContainer: {
        paddingHorizontal: 8,
        width: "100%",
    },
    shadow: {
        ...getShadow({}),
    },
    wrapper: {
        alignItems: "center",
        flexDirection: "row",
        justifyContent: "space-between",
        paddingLeft: 19,
        paddingRight: 23,
    },
});
