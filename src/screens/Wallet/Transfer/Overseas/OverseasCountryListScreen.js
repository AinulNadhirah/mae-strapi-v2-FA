import PropTypes from "prop-types";
import React, { Component, useCallback } from "react";
import { Text, View, FlatList, TouchableOpacity, Keyboard } from "react-native";

import HeaderLayout from "@layouts/HeaderLayout";
import ScreenLayout from "@layouts/ScreenLayout";

import HeaderBackButton from "@components/Buttons/HeaderBackButton";
import ScreenContainer from "@components/Containers/ScreenContainer";
import SearchInput from "@components/SearchInput";
import Typo from "@components/TextWithInfo";
import TransferImageAndDetails from "@components/Transfers/TransferImageAndDetails";

import { withModelContext } from "@context";

import { RemittanceAnalytics } from "@services/analytics/analyticsRemittance";

import { BLACK, MEDIUM_GREY, VERY_LIGHT_GREY } from "@constants/colors";
import { ENDPOINT_BASE } from "@constants/url";

import { arraySearchByObjProp } from "@utils/array";

const ListItem = ({ title, item, image, onPress }) => {
    const onPressItem = useCallback(() => onPress(item), [item, onPress]);
    return (
        <TouchableOpacity onPress={onPressItem} activeOpacity={0.9} style={Styles.listItem}>
            <TransferImageAndDetails logo="show" title={title} image={image} />
            <View style={Styles.bottomLine} />
        </TouchableOpacity>
    );
};

ListItem.propTypes = {
    title: PropTypes.string,
    item: PropTypes.object,
    image: PropTypes.any,
    onPress: PropTypes.func,
};

const CountryList = ({ list, createRenderItem, extraData }) => {
    const keyExtractor = useCallback((item, index) => {
        return `${item.contentId}-${index}`;
    }, []);
    return (
        <FlatList
            maxToRenderPerBatch={30}
            style={Styles.countryContainer}
            data={list}
            extraData={extraData}
            showsHorizontalScrollIndicator={false}
            showIndicator={false}
            keyExtractor={keyExtractor}
            renderItem={createRenderItem}
            testID="CountryList"
            accessibilityLabel="CountryList"
            ListEmptyComponent={
                <NoDataView
                    title="No Results Found"
                    description="We couldn't find any items matching your search."
                />
            }
        />
    );
};

CountryList.propTypes = {
    list: PropTypes.array,
    createRenderItem: PropTypes.func,
    extraData: PropTypes.object,
};

// No Data View Class
const NoDataView = ({ title, description }) => {
    return (
        <View style={Styles.noData}>
            <View style={Styles.noDataTitle}>
                <Typo
                    fontSize={18}
                    fontWeight="bold"
                    letterSpacing={0}
                    lineHeight={32}
                    color={BLACK}
                >
                    <Text>{title}</Text>
                </Typo>
            </View>
            <View style={Styles.noDataDesc}>
                <Typo fontSize={14} lineHeight={20}>
                    <Text>{description}</Text>
                </Typo>
            </View>
        </View>
    );
};

NoDataView.propTypes = {
    title: PropTypes.string,
    description: PropTypes.string,
};

class OverseasCountryListScreen extends Component {
    constructor(props) {
        super(props);
        this.state = {
            countryList: [],
            showSearchInput: false,
            searchText: "",
            isLoading: true,
            listRefresh: false,
        };
    }

    componentDidMount() {
        RemittanceAnalytics.countrySelectionLoaded(!this.props.route?.params?.from);
        this.fetchListData();
    }
    fetchListData = () => {
        const { getModel } = this.props;
        const { countryList, senderCountryList, bakongRecipientList } =
            getModel("overseasTransfers");
        const { showSenderCountryList, from, isBakong } = this.props.route.params;

        if (isBakong) {
            this.setState({ countryList: bakongRecipientList, isLoading: false });
        } else if (showSenderCountryList && countryList) {
            this.setState({ countryList: senderCountryList, isLoading: false });
        } else if (countryList) {
            const list = countryList
                .map((item, index) => {
                    item.key = index;
                    return item;
                })
                .filter((countryItem) => {
                    if (!from) {
                        return countryItem?.countryCode !== "MY";
                    } else {
                        return countryItem;
                    }
                });
            this.setState({ countryList: list, isLoading: false });
        } else {
            this.setState({ isLoading: false });
        }
    };

    // -----------------------
    // EVENT HANDLER
    // -----------------------

    onBackPress = () => {
        this.props.navigation.goBack();
    };

    countryItemPress = (item) => {
        let GoBackToConfirmation = "";
        if (!this.props.route?.params?.from) {
            this.props.updateModel({
                overseasTransfers: {
                    selectedCountry: item,
                    FTTRecipientBankDetails: {},
                    FTTRecipientDetails: {},
                    FTTTransferPurpose: {},
                },
            });
        }

        const transferParams = {
            countryData: item,
        };

        if (this.props.route?.params?.from) {
            GoBackToConfirmation = "0";
            if (this.props.route?.params?.callBackFunction) {
                this.props.route.params.callBackFunction(item);
            }
            if (this.props.route?.params?.editingCountry === "EditCountry") {
                GoBackToConfirmation = "1";
                this.props.navigation.navigate(this.props.route?.params?.from, {
                    ...this.props.route?.params,
                    selectedCountry: item,
                    GoBackToConfirmation,
                    from: "FTTConfirmation",
                });
            } else {
                this.props.navigation.navigate(this.props.route?.params?.from, {
                    ...this.props.route?.params,
                    selectedCountry: item,
                });
            }
        } else {
            if (item?.countryName === "United States" || item?.countryName === "Mexico") {
                this.props.navigation.navigate("OverseasCountryStateList", {
                    ...this.props.route.params,
                    transferParams,
                    countryName: item?.countryName,
                });
            } else {
                this.props.navigation.navigate("OverseasAccountsListScreen", {
                    ...this.props.route?.params,
                    transferParams,
                });
                RemittanceAnalytics.countrySelected(item?.countryName);
            }
        }
    };

    // SearchInput Event
    onSearchTextChange = (val) => {
        this.setState({ searchText: val }, () => {
            this.setState({
                listRefresh: !this.state.listRefresh,
            });
        });
    };

    doSearchToogle = () => {
        Keyboard.dismiss();
        this.setState({ showSearchInput: !this.state.showSearchInput, searchText: "" });
    };

    // -----------------------
    // GET UI
    // -----------------------

    getHeaderUI = () => {
        return (
            <HeaderLayout
                horizontalPaddingMode="custom"
                horizontalPaddingCustomLeftValue={24}
                horizontalPaddingCustomRightValue={24}
                headerLeftElement={<HeaderBackButton onPress={this.onBackPress} />}
                headerCenterElement={
                    <Typo
                        text={this.props.route?.params?.isInit ? "Transfer To" : "Select Country"}
                        fontSize={16}
                        lineHeight={19}
                        fontWeight="600"
                        textAlign="center"
                    />
                }
            />
        );
    };

    createRenderItem = ({ item }) => {
        const imgUrl = `${ENDPOINT_BASE}/wallet/bankAndTelcoImages/avatar/remittance/country/${item?.countryCode}.png`;
        return (
            <ListItem
                title={item.countryName}
                item={item}
                image={{
                    type: "url",
                    source: imgUrl,
                }}
                onPress={this.countryItemPress}
            />
        );
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
                        keyboardShouldPersistTaps="handled"
                        scrollable={false}
                        header={this.getHeaderUI()}
                        paddingHorizontal={0}
                    >
                        <View style={Styles.container}>
                            <View style={Styles.searchContainer}>
                                <SearchInput
                                    doSearchToogle={this.doSearchToogle}
                                    showSearchInput={this.state.showSearchInput}
                                    onSearchTextChange={this.onSearchTextChange}
                                    marginHorizontal={0}
                                />
                            </View>
                            <View style={Styles.listContainer}>
                                {this.state.countryList && (
                                    <CountryList
                                        list={arraySearchByObjProp(
                                            this.state.countryList,
                                            this.state.searchText,
                                            ["countryName"]
                                        )}
                                        extraData={this.state.listRefresh}
                                        createRenderItem={this.createRenderItem}
                                    />
                                )}
                            </View>
                        </View>
                    </ScreenLayout>
                )}
            </ScreenContainer>
        );
    }
}

OverseasCountryListScreen.propTypes = {
    getModel: PropTypes.func,
    updateModel: PropTypes.func,
    route: PropTypes.object,
    navigation: PropTypes.any,
};

export default withModelContext(OverseasCountryListScreen);

const Styles = {
    container: {
        flex: 1,
        alignItems: "flex-start",
    },
    countryContainer: { width: "100%", paddingTop: 10 },
    listContainer: {
        width: "100%",
        alignItems: "flex-start",
        paddingHorizontal: 8,
        paddingBottom: 40,
    },
    searchContainer: { width: "100%", paddingTop: 16, paddingHorizontal: 24 },
    noData: { flex: 1, paddingTop: 20, justifyContent: "center" },
    noDataDesc: { paddingTop: 10 },
    listItem: {
        paddingTop: 22,
        paddingLeft: 10,
        paddingRight: 10,
    },
    bottomLine: {
        paddingTop: 17,
        marginLeft: 6,
        marginRight: 6,
        borderBottomWidth: 1,
        borderBottomColor: VERY_LIGHT_GREY,
    },
};
