import PropTypes from "prop-types";
import React, { Component, useCallback } from "react";
import { Text, View, FlatList, TouchableOpacity, Keyboard } from "react-native";

import HeaderLayout from "@layouts/HeaderLayout";
import ScreenLayout from "@layouts/ScreenLayout";

import ActionButton from "@components/Buttons/ActionButton";
import HeaderBackButton from "@components/Buttons/HeaderBackButton";
import ScreenContainer from "@components/Containers/ScreenContainer";
import FixedActionContainer from "@components/Footers/FixedActionContainer";
import HeaderLabel from "@components/Label/HeaderLabel";
import SearchInput from "@components/SearchInput";
import Typo from "@components/TextWithInfo";
import TransferImageAndDetails from "@components/Transfers/TransferImageAndDetails";

import { withModelContext } from "@context";

import { RemittanceAnalytics } from "@services/analytics/analyticsRemittance";

import {
    MEDIUM_GREY,
    WHITE,
    BLACK,
    YELLOW,
    DISABLED,
    DISABLED_TEXT,
    VERY_LIGHT_GREY,
} from "@constants/colors";
import { CONTINUE } from "@constants/strings";

import { arraySearchByObjProp } from "@utils/array";

const ListItem = ({ item, onPress, clicked }) => {
    const onPressItem = useCallback(() => onPress(item), [item, onPress]);
    return (
        <TouchableOpacity
            onPress={onPressItem}
            activeOpacity={0.9}
            style={Styles.listItem}
            key={item?.key}
        >
            <TransferImageAndDetails
                title={item.stateName}
                selectedState={clicked}
                hideLogo
                fontWeight="400"
            />
            <View style={Styles.bottomLine} />
        </TouchableOpacity>
    );
};

ListItem.propTypes = {
    item: PropTypes.object,
    image: PropTypes.any,
    onPress: PropTypes.func,
    clicked: PropTypes.bool,
};

const StateList = ({ list, createRenderItem, extraData }) => {
    const keyExtractor = useCallback((item, index) => {
        return `${item.contentId}-${index}`;
    }, []);
    return (
        <FlatList
            //maxToRenderPerBatch={20}
            windowSize={20}
            style={Styles.cityStateContainer}
            data={list}
            extraData={extraData}
            scrollToIndex={0}
            showsHorizontalScrollIndicator={false}
            showIndicator={false}
            keyExtractor={keyExtractor}
            renderItem={createRenderItem}
            testID="StateList"
            accessibilityLabel="StateList"
            ListEmptyComponent={
                <NoDataView
                    title="No Results Found"
                    description="We couldn't find any items matching your search."
                />
            }
        />
    );
};

StateList.propTypes = {
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

class OverseasCountryStateList extends Component {
    constructor(props) {
        super(props);
        this.state = {
            stateList: [],
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
        const { countryStateCityList } = getModel("overseasTransfers");
        console.info("fetchListData: -> ", countryStateCityList);
        if (countryStateCityList) {
            const countryName = this.props?.route?.params?.countryName;
            const list = countryStateCityList.filter((stateData) => {
                return stateData?.countryName === countryName;
            });
            this.setState({
                stateList: list[0]?.stateCityList,
                isLoading: false,
                countryData: this.props?.route?.params?.transferParams?.countryData,
            });
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

    stateItemPress = (item) => {
        console.info("item -> ", item);
        this.setState({ item });
        this.setState({ stateName: item?.stateName });
        this.setState({ stateCode: item?.stateCode });
        this.setState({ cityList: item?.cityList });
    };

    handleProceed = (item) => {
        if (!this.props.route?.params?.from) {
            this.props.updateModel({
                overseasTransfers: {
                    selectedState: this.state.item,
                },
            });
        }

        const transferParams = {
            countryData: this.state.countryData,
            stateData: this.state.item,
        };

        if (this.props.route?.params?.from) {
            if (this.props.route?.params?.callBackFunction) {
                this.props.route.params.callBackFunction(item);
            }
            this.props.navigation.navigate(this.props.route?.params?.from, {
                ...this.props.route?.params,
                selectedState: this.state.item,
            });
        } else {
            if (this.state.cityList === null) {
                this.props.navigation.navigate("OverseasAccountsListScreen", {
                    ...this.props.route?.params,
                    transferParams,
                    countryData: this.state.countryData,
                    stateName: this.state.stateName,
                    stateCode: this.state.stateCode,
                });
            } else {
                this.props.navigation.navigate("OverseasCountryStateCityList", {
                    ...this.props.route.params,
                    transferParams,
                    countryData: this.state.countryData,
                    stateName: this.state.stateName,
                    stateCode: this.state.stateCode,
                    cityList: this.state.cityList,
                });
            }
        }
    };

    // SearchInput Event
    onSearchTextChange = (val) => {
        this.setState({ searchText: val }, () => {
            this.setState({ listRefresh: !this.state.listRefresh });
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
                    <HeaderLabel>
                        <Text>Select State</Text>
                    </HeaderLabel>
                }
            />
        );
    };

    createRenderItem = ({ item }) => {
        return (
            <ListItem
                title={item?.stateName}
                item={item}
                onPress={this.stateItemPress}
                clicked={this.state.stateName}
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
                                {this.state.stateList && (
                                    <StateList
                                        list={arraySearchByObjProp(
                                            this.state.stateList,
                                            this.state.searchText,
                                            ["stateName"]
                                        )}
                                        createRenderItem={this.createRenderItem}
                                        extraData={this.state.listRefresh}
                                    />
                                )}
                            </View>
                        </View>

                        <FixedActionContainer>
                            <ActionButton
                                disabled={!this.state.stateName}
                                fullWidth
                                borderRadius={25}
                                onPress={this.handleProceed}
                                testID="choose_account_continue"
                                backgroundColor={!this.state.stateName ? DISABLED : YELLOW}
                                componentCenter={
                                    <Typo
                                        color={!this.state.stateName ? DISABLED_TEXT : BLACK}
                                        text={CONTINUE}
                                        fontSize={14}
                                        fontWeight="600"
                                        lineHeight={18}
                                    />
                                }
                            />
                        </FixedActionContainer>
                    </ScreenLayout>
                )}
            </ScreenContainer>
        );
    }
}

OverseasCountryStateList.propTypes = {
    getModel: PropTypes.func,
    updateModel: PropTypes.func,
    route: PropTypes.object,
    navigation: PropTypes.any,
};

export default withModelContext(OverseasCountryStateList);

const Styles = {
    container: {
        flex: 1,
        alignItems: "flex-start",
    },
    cityStateContainer: { width: "100%", backgroundColor: WHITE },
    listContainer: {
        width: "100%",
        alignItems: "flex-start",
        paddingHorizontal: 8,
        marginBottom: 90,
        backgroundColor: WHITE,
    },
    searchContainer: { width: "100%", paddingVertical: 16, paddingHorizontal: 24 },
    noData: { flex: 1, paddingTop: 20, justifyContent: "center", backgroundColor: MEDIUM_GREY },
    noDataDesc: { paddingTop: 10, paddingHorizontal: "10%" },
    listItem: {
        paddingTop: 22,
        paddingLeft: 10,
        paddingRight: 10,
    },
    bottomLine: {
        paddingTop: 17,
        borderBottomWidth: 1,
        borderBottomColor: VERY_LIGHT_GREY,
    },
};
