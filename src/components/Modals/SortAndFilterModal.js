import PropTypes from "prop-types";
import React, { Component } from "react";
import {
    View,
    StyleSheet,
    Dimensions,
    Modal,
    TouchableOpacity,
    ScrollView,
    Image,
} from "react-native";
import ScrollPicker from "react-native-picker-scrollview";

import HeaderLayout from "@layouts/HeaderLayout";
import ScreenLayout from "@layouts/ScreenLayout";

import ActionButton from "@components/Buttons/ActionButton";
import RadioButtons from "@components/Buttons/RadioButtons";
import Typo from "@components/Text";

import { withModelContext } from "@context";

import { getTagsByRouting } from "@services";
import { FAArticleScreen } from "@services/analytics/analyticsArticles";

import { BLACK, BLUE, YELLOW, WHITE, MEDIUM_GREY } from "@constants/colors";

import assets from "@assets";

export const { width, height } = Dimensions.get("window");
class SortAndFilterModal extends Component {
    static propTypes = {
        getModel: PropTypes.func,
    };

    state = {
        showFilterByModal: false,
        sortByValue: "latest",
        filterByCategoryValue: "",
        filterByCategoryIndex: 0,
        appliedBefore: false,
        categoryNames: [],
        fetchedFilters: false,
        articleMode: this.props?.article ?? false,
    };

    componentDidMount = () => {
        this._prepareCategories();
    };

    toggleFilterByModal = () => {
        this.setState({
            showFilterByModal: !this.state.showFilterByModal,
            // filterByKey: filter,
        });
    };

    _onFilterByPressClose = () => {
        this.setState({
            showFilterByModal: !this.state.showFilterByModal,
            filterByCategoryValue: "",
        });
    };

    renderFilterByModal = () => {
        const { filterByCategoryValue, categoryNames, filterByCategoryIndex } = this.state;

        return (
            <View style={stylesFilterBy.containerBottom}>
                <View style={stylesFilterBy.containerModal}>
                    {/* Top bar section */}
                    <View style={stylesFilterBy.containerTopBar}>
                        {/* Close button */}
                        <View style={stylesFilterBy.btnClose}>
                            <TouchableOpacity onPress={this._onFilterByPressClose}>
                                <Typo
                                    fontSize={14}
                                    fontWeight="600"
                                    lineHeight={18}
                                    textAlign="left"
                                    color={BLUE}
                                    text="Close"
                                />
                            </TouchableOpacity>
                        </View>
                        {/* Done button */}
                        <View style={stylesFilterBy.btnDone}>
                            <ActionButton
                                backgroundColor={YELLOW}
                                borderRadius={15}
                                height={30}
                                width={96}
                                componentCenter={
                                    <Typo
                                        fontSize={12}
                                        color={BLACK}
                                        fontWeight="600"
                                        lineHeight={15}
                                        text="Done"
                                    />
                                }
                                onPress={this.toggleFilterByModal}
                            />
                        </View>
                    </View>

                    {/* Picker section */}
                    <View style={stylesFilterBy.containerPicker}>
                        <ScrollPicker
                            //ref={(sp) => {this.sp = sp}}
                            dataSource={categoryNames}
                            selectedIndex={filterByCategoryIndex}
                            itemHeight={44}
                            wrapperHeight={240}
                            wrapperColor={"#fff"}
                            highlightColor={"#d8d8d8"}
                            renderItem={(data, index, isSelected) => {
                                return (
                                    <View>
                                        {isSelected ? (
                                            <View style={stylesFilterBy.selectedItemContainer}>
                                                <Typo
                                                    fontSize={16}
                                                    fontWeight="600"
                                                    lineHeight={19}
                                                    color={BLACK}
                                                    text={data}
                                                />
                                            </View>
                                        ) : (
                                            <Typo
                                                fontSize={16}
                                                fontWeight="normal"
                                                lineHeight={19}
                                                color={"#7c7c7d"}
                                                text={data}
                                            />
                                        )}
                                    </View>
                                );
                            }}
                            onValueChange={(data, selectedIndex) => {
                                this.setState({
                                    filterByCategoryValue: data,
                                    filterByCategoryIndex: selectedIndex,
                                });
                            }}
                        />
                    </View>
                </View>
            </View>
        );
    };

    _onPressSortBy = (sortBy) => {
        console.log("[SortAndFilterModal][_onPressSortBy]: " + sortBy);

        this.setState({ sortByValue: sortBy });
    };

    // Check this when user presses "Apply" button
    _getSortByQuery = () => {
        console.log("[SortAndFilterModal][_getSortByQuery]");

        const { sortByValue } = this.state;
        switch (sortByValue) {
            case "popularity":
                return "&sort=seenUser,desc";
            case "latest":
                return "&sort=updatedDate,desc";
            case "oldest":
                return "&sort=updatedDate,asc";
            default:
                return "";
        }
    };

    _getFilterByCategoryQuery = () => {
        console.log("[SortAndFilterModal][_getFilterByCategoryQuery]");

        const { filterByCategoryValue, filterByCategoryIndex } = this.state;

        if (filterByCategoryIndex !== 0) {
            return filterByCategoryValue;
        } else {
            return "";
        }
    };

    _onPressApply = () => {
        //combine sortByQuery and category filter query
        const query = this._getSortByQuery();
        const queryFormatted = query.replace(new RegExp(" ", "g"), "_");
        const queryCategoryFilter = this._getFilterByCategoryQuery();

        console.log("[SortAndFilterModal][_onPressApply]: " + queryFormatted);
        this.props.queryBuilder(queryFormatted, queryCategoryFilter);

        // set appliedBefore to true
        this.setState({ appliedBefore: true });

        // hide modal
        this.props.toggleSortAndFilterModal();
        if (this.props.article) {
            FAArticleScreen.onFilterApply(this.state.sortByValue, this.state.filterByCategoryValue);
        } else {
            this.props.logApplyButton(query, queryCategoryFilter);
        }
    };

    _onPressClear = () => {
        //clear filter
        this.props.queryBuilder("", null);
        //reset sort back to "Latest"
        this.setState({
            sortByValue: "latest",
            filterByCategoryValue: "",
            filterByCategoryIndex: 0,
        });

        // hide modal
        this.props.toggleSortAndFilterModal();
    };

    _onPressClose = () => {
        // if(!this.state.appliedBefore){
        //     //clear filter
        //     this.props.queryBuilder('');
        //     //reset sort back to "Latest"
        //     this.setState({ sortByValue: 'latest' });
        // }

        this._onPressApply();
    };

    _prepareCategories = async () => {
        const categoriesData = await this._getFilterCategories();

        console.log("[SortAndFilterModal][_prepareCategories] categoriesData:", categoriesData);

        //var categoryNames = await categoriesData.map(function(item) { return item['name']; });
        var categoryNames = await categoriesData.flatMap((i) =>
            i.used > 0 ? [i.name.replace(new RegExp("_", "g"), " ")] : []
        );
        categoryNames.unshift("None");

        console.log(categoryNames);

        this.setState({
            categoryNames: categoryNames,
            fetchedFilters: true,
        });

        console.log(this.state);
    };

    _getFilterCategories = async () => {
        try {
            const { articleMode } = this.state;
            const { cmsUrl, cmsCloudEnabled } = this.props.getModel("cloud");
            const endpoint = cmsCloudEnabled ? cmsUrl : `${ENDPOINT_BASE}/cms/api/v1`;
            const {
                data: { content: data },
            } = await getTagsByRouting(endpoint, false, articleMode ? "ARTICLE" : "PROMOTION");
            console.log(data);
            return data;
        } catch (error) {
            this.setState({ getFilterCategoriesError: true });
            console.log(error);
            // todo: hide featured section?
            throw error;
        }
    };

    renderDropdownButton(item) {
        const { filterByCategoryValue, filterByCategoryIndex } = this.state;

        return (
            <View style={stylesSortAndFilter.containerDropDownButton} key={item.key}>
                <ActionButton
                    backgroundColor={WHITE}
                    borderWidth={1}
                    borderColor={"#cfcfcf"}
                    borderStyle="solid"
                    borderRadius={24}
                    height={48}
                    componentLeft={
                        <View style={stylesSortAndFilter.containerDropDownLabel}>
                            <Typo
                                fontSize={14}
                                fontWeight="600"
                                lineHeight={18}
                                text={
                                    filterByCategoryIndex !== 0
                                        ? "Category: " + filterByCategoryValue
                                        : "Categories"
                                }
                            />
                        </View>
                    }
                    componentRight={
                        <Image
                            style={stylesSortAndFilter.iconDropDown}
                            source={require("@assets/icons/dropDownIcon.png")}
                        />
                    }
                    onPress={this.toggleFilterByModal}
                />
            </View>
        );
    }

    render() {
        const { showSortAndFilterModal } = this.props;
        const { showFilterByModal, filterByCategoryValue, fetchedFilters } = this.state;

        return (
            <Modal
                animationIn={"fadeIn"}
                animationOut={"fadeOut"}
                visible={showSortAndFilterModal}
                style={{ margin: 0 }}
                hideModalContentWhileAnimating
                useNativeDriver
            >
                <Modal
                    animationIn={"fadeIn"}
                    animationOut={"fadeOut"}
                    hasBackdrop={false}
                    visible={showFilterByModal}
                    style={{ margin: 0 }}
                    hideModalContentWhileAnimating
                    useNativeDriver
                    transparent
                    // onRequestClose={() => {
                    //     Alert.alert('Modal has been closed.');
                    // }}
                >
                    {this.renderFilterByModal()}
                </Modal>

                <ScreenLayout
                    paddingBottom={0}
                    paddingTop={0}
                    paddingHorizontal={24}
                    useSafeArea
                    neverForceInset={["bottom"]}
                    backgroundColor={MEDIUM_GREY}
                    header={
                        <HeaderLayout
                            backgroundColor={MEDIUM_GREY}
                            horizontalPaddingMode="custom"
                            horizontalPaddingCustomLeftValue={24}
                            horizontalPaddingCustomRightValue={24}
                            headerCenterElement={
                                <Typo
                                    fontSize={16}
                                    fontWeight="600"
                                    lineHeight={19}
                                    text="Sort & Filter"
                                />
                            }
                            headerRightElement={
                                <TouchableOpacity onPress={this._onPressClose}>
                                    <Image source={assets.icCloseBlack} />
                                </TouchableOpacity>
                                // {/* <TouchableOpacity onPress={() => this._onPressClear()}>
                                //     <Typo
                                //         fontSize={14}
                                //         fontWeight="600"
                                //         color={WHITE}
                                //         lineHeight={18}
                                //     >
                                //         <Text style={{ color: "white" }}>Clear</Text>
                                //     </Typo>
                                // </TouchableOpacity> */}
                            }
                        />
                    }
                >
                    <React.Fragment>
                        <ScrollView
                            horizontal={false}
                            contentContainerStyle={{ flexGrow: 1 }}
                            showsVerticalScrollIndicator={false}
                        >
                            {/* Sort section  */}
                            <View style={stylesSortAndFilter.containerSortTitle}>
                                <Typo fontWeight="600" textAlign="left" text="Sort by" />
                            </View>

                            <View>
                                <RadioButtons
                                    options={sortOptions}
                                    select={this.state.sortByValue}
                                    windowWidth={width}
                                    onPressSortBy={this._onPressSortBy}
                                />
                            </View>

                            {/* Separator Line */}
                            <View style={stylesSortAndFilter.separatorLine} />

                            {/* Filter By Section */}
                            {fetchedFilters && (
                                <React.Fragment>
                                    <View style={stylesSortAndFilter.containerFilterTitle}>
                                        <Typo fontWeight="600" textAlign="left" text="Filter by" />
                                    </View>

                                    <View>
                                        {filterOptions.map((item) =>
                                            this.renderDropdownButton(item)
                                        )}
                                    </View>
                                </React.Fragment>
                            )}
                            <View style={{ height: 120, flex: 1 }} />
                        </ScrollView>
                        <View style={stylesSortAndFilter.containerBottom}>
                            <View style={{ flex: 1, marginRight: 16 }}>
                                <ActionButton
                                    backgroundColor={WHITE}
                                    borderWidth={1}
                                    borderColor={"#cfcfcf"}
                                    borderStyle="solid"
                                    borderRadius={24}
                                    height={48}
                                    componentCenter={
                                        <Typo
                                            fontSize={14}
                                            color={BLACK}
                                            fontWeight="600"
                                            lineHeight={18}
                                            text="Clear"
                                        />
                                    }
                                    onPress={this._onPressClear}
                                />
                            </View>
                            <View style={{ flex: 1 }}>
                                <ActionButton
                                    backgroundColor={YELLOW}
                                    borderRadius={24}
                                    height={48}
                                    width="100%"
                                    componentCenter={
                                        <Typo
                                            fontSize={14}
                                            color={BLACK}
                                            fontWeight="600"
                                            lineHeight={18}
                                            text="Apply Filter"
                                        />
                                    }
                                    onPress={this._onPressApply}
                                />
                            </View>
                        </View>
                    </React.Fragment>
                </ScreenLayout>
            </Modal>
        );
    }
}

SortAndFilterModal.propTypes = {
    article: PropTypes.bool,
    queryBuilder: PropTypes.func,
    showSortAndFilterModal: PropTypes.any,
    toggleSortAndFilterModal: PropTypes.func,
};
export default withModelContext(SortAndFilterModal);

const stylesSortAndFilter = StyleSheet.create({
    containerBottom: {
        alignItems: "center",
        bottom: 36,
        flex: 1,
        flexDirection: "row",
        left: 0,
        marginHorizontal: 24,
        position: "absolute",
        right: 0,
    },
    containerDropDownButton: { marginBottom: 16, marginHorizontal: 12 },
    containerDropDownLabel: { marginLeft: 24 },
    containerFilterTitle: {
        marginBottom: 14,
    },
    containerSortTitle: {
        marginBottom: 14,
        marginTop: 38,
    },
    iconDropDown: {
        height: 8,
        marginRight: 22,
        width: 15,
    },
    separatorLine: {
        borderColor: "#cfcfcf",
        borderStyle: "solid",
        borderWidth: 1,
        height: 2,
        marginBottom: 40,
        marginTop: 32,
        width: width - 48,
    },
});

const stylesFilterBy = StyleSheet.create({
    btnClose: {
        backgroundColor: "white",
        flex: 1,
    },
    btnDone: {
        flex: 1,
        flexDirection: "row",
        justifyContent: "flex-end",
        backgroundColor: "white",
    },
    containerBottom: {
        alignItems: "center",
        backgroundColor: "rgba(0, 0, 0, 0.75)",
        flex: 1,
        justifyContent: "flex-end",
    },
    containerModal: {
        height: 300,
        width: width,
    },
    containerPicker: {
        height: 240,
        width: width,
    },
    containerTopBar: {
        alignItems: "center",
        backgroundColor: "white",
        borderTopLeftRadius: 16,
        borderTopRightRadius: 16,
        flexDirection: "row",
        height: 60,
        paddingHorizontal: 24,
        width: width,
    },
    selectedItemContainer: {
        alignItems: "center",
        backgroundColor: "#f8f8f8",
        height: 44,
        justifyContent: "center",
        width: width,
    },
});

const sortOptions = [
    {
        key: "popularity",
        text: "Popularity",
    },
    {
        key: "latest",
        text: "Latest",
    },
    {
        key: "oldest",
        text: "Oldest",
    },
];

const filterOptions = [
    {
        key: "categories",
        text: "Categories",
    },
    // {
    //     key: 'radius',
    //     text: 'Radius'
    // },
    // {
    //     key: 'states',
    //     text: 'States'
    // },
    // {
    //     key: 'city',
    //     text: 'City'
    // }
];
