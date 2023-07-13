import { debounce } from "lodash";
import PropTypes from "prop-types";
import React, { Component } from "react";
import {
    View,
    StyleSheet,
    TouchableOpacity,
    Image,
    ImageBackground,
    Dimensions,
    TextInput,
    ScrollView,
    FlatList,
} from "react-native";

// import NavigationService from "@navigation/navigationService";
import * as navigationConstant from "@navigation/navigationConstant";

import HeaderLayout from "@layouts/HeaderLayout";
import ScreenLayout from "@layouts/ScreenLayout";

import ActionButton from "@components/Buttons/ActionButton";
import ContentCardLoader from "@components/Cards/ContentCard/ContentCardLoader";
import ContentCard from "@components/Cards/ContentCard/index";
import ScreenContainer from "@components/Containers/ScreenContainer";
import ListFooter from "@components/Footers/ListFooter";
import SortAndFilterModal from "@components/Modals/SortAndFilterModal";
import Typo from "@components/Text";

import { withModelContext } from "@context";

import { getPromosByFilter, LikeHomeContent, BookmarkHomeContent } from "@services";
import { FAArticleScreen } from "@services/analytics/analyticsArticles";
import { FASearchAndFilter, FASearchPromotions } from "@services/analytics/analyticsPromotions";

import { BLACK, BLUE, YELLOW, WHITE, MEDIUM_GREY, DARK_GREY } from "@constants/colors";
import { SUCCESS_NO_RESULT, SUCCESS_RESULT } from "@constants/strings";
import { ENDPOINT_BASE } from "@constants/url";

import assets from "@assets";

export const { width, height } = Dimensions.get("window");

class SearchScreen extends Component {
    static navigationOptions = () => ({
        title: "",
        header: null,
    });

    static propTypes = {
        getModel: PropTypes.func,
        navigation: PropTypes.object.isRequired,
        resetModel: PropTypes.func,
        route: PropTypes.shape({
            params: PropTypes.shape({
                article: PropTypes.bool,
            }),
        }),
        updateModel: PropTypes.func,
    };

    state = {
        viewState: "",
        searchValue: "",
        showSortAndFilterModal: false,
        isLoadingMore: false,
        page: 0,
        isLastPage: false,
        searchResultList: [],
        showResults: false,
        totalResults: 0,
        additionalQuery: "",
        additionalCategory: null,
        articleMode: this.props.route?.params?.article ?? false,
    };

    toggleSortAndFilterModal = () => {
        console.log("toggleSortAndFilterModal triggered!");
        if (
            this.state.viewState === SUCCESS_RESULT ||
            (this.state.viewState === SUCCESS_NO_RESULT && !this.props.route.params.article)
        ) {
            FASearchPromotions.onPressFilter();
        } else {
            FAArticleScreen.onPressFilter();
        }
        this.setState({ showSortAndFilterModal: !this.state.showSortAndFilterModal });
        FASearchAndFilter.onScreen();
    };

    _prepareSearch = async (page) => {
        this.setState({ isLoadingMore: true });

        console.log("[SearchScreen][_prepareSearch] state: ", this.state);
        console.log("[SearchScreen][_prepareSearch] page: " + page + " GET search results");

        const resultData = await this._getSearchResults(page);

        console.log(
            "[SearchScreen][_prepareSearch] page: " +
                page +
                " RECEIVED search results, length: " +
                this.state.searchResultList.length
        );

        this.setState({
            searchResultList: [...this.state.searchResultList, ...resultData],
            refresh: !this.state.refresh,
            isLoadingMore: false,
        });

        // console.log(this.state.searchResultList);

        if (this.state.searchResultList.length > 0) {
            this.setState({ viewState: "success_results" });
        } else {
            this.setState({ isLastPage: true, viewState: "success_no_results" });
        }
        FASearchPromotions.onScreen(this.state.searchValue);
    };

    _getSearchResults = async (page) => {
        const {
            searchValue,
            additionalQuery,
            additionalCategory,
            searchResultList,
            totalResults,
            articleMode,
        } = this.state;

        try {
            const { getModel } = this.props;
            const {
                auth: { token },
                cloud: { cmsUrl, cmsCloudEnabled },
            } = getModel(["auth", "cloud"]);
            const endpoint = cmsCloudEnabled ? cmsUrl : `${ENDPOINT_BASE}/cms/api/v1`;

            const {
                data: {
                    content: data,
                    // totalPages: totalPage,
                    totalElements: resultCount,
                    last: lastPage,
                },
            } = await getPromosByFilter(
                endpoint,
                searchValue,
                page,
                10,
                additionalQuery,
                "AND",
                token,
                additionalCategory,
                articleMode
            );
            console.log(data);

            this.setState({
                searchResultsError: false,
                isLastPage: lastPage,
                totalResults: searchResultList.length === 0 ? resultCount : totalResults,
            });

            return data;
        } catch (error) {
            this.setState({
                searchResultsError: true,
                isLoadingMore: false,
                isLastPage: true,
                totalResults: 0,
            });
            console.log(error);
            // todo: hide featured section?
            throw error;
        }
    };

    _onScrollHandler = () => {
        if (this.state.isLastPage === false) {
            this.setState(
                {
                    page: this.state.page + 1,
                    isLoadingMore: true,
                },
                () => {
                    console.log("onScrollHandler.. prepping page " + this.state.page);
                    this._prepareSearch(this.state.page);
                }
            );
        }
    };

    _refreshData = (item, index) => {
        const { searchResultList, refresh } = this.state;

        var updatedSearchList = searchResultList;
        updatedSearchList[index] = item;

        console.log(updatedSearchList);

        this.setState({
            searchResultList: updatedSearchList,
            refresh: !refresh,
        });
    };

    resetSearchState = () => {
        FASearchPromotions.onNewSearch();
        const { refresh } = this.state;

        this.setState({
            viewState: "",
            searchValue: "",
            showSortAndFilterModal: false,
            isLoadingMore: false,
            isLastPage: false,
            searchResultList: [],
            refresh: !refresh,
            totalResults: 0,
            page: 0,
            // additionalQuery: ''
        });

        // take time to use createRef soon since refs api is deprecated
        this.refs.SearchInput.focus();
    };

    _onInputFocus = () => {
        const { refresh } = this.state;

        this.setState({
            viewState: "",
            // searchValue: '',
            isLoadingMore: false,
            isLastPage: false,
            searchResultList: [],
            refresh: !refresh,
            totalResults: 0,
            page: 0,
            //additionalQuery: ''
        });
    };

    renderSearchBar = () => {
        const { searchValue } = this.state;

        return (
            <View style={stylesSearchBar.container}>
                <View style={stylesSearchBar.containerSearchBar}>
                    <View style={stylesSearchBar.containerSearchPill}>
                        <Image
                            style={stylesSearchBar.searchBarIcon}
                            source={require("@assets/icons/search.png")}
                        />
                        <TextInput
                            style={stylesSearchBar.searchLabelContainer}
                            underlineColorAndroid="transparent"
                            autoFocus={true}
                            onFocus={this._onInputFocus}
                            onChangeText={(text) => this.setState({ searchValue: text })}
                            value={searchValue}
                            ref="SearchInput"
                            enablesReturnKeyAutomatically={true}
                            onSubmitEditing={() => this._prepareSearch(this.state.page)}
                            selectionColor={BLACK}
                            placeholderTextColor={DARK_GREY}
                            placeholder="Type to search"
                        />

                        {/* Clear search icon button */}
                        {searchValue !== null && searchValue.length > 0 && (
                            <TouchableOpacity onPress={this.resetSearchState}>
                                <Image
                                    style={stylesSearchBar.searchBarIcon}
                                    source={require("@assets/icons/ic_close.png")}
                                />
                            </TouchableOpacity>
                        )}
                    </View>

                    {/* Filter icon button */}
                    <TouchableOpacity onPress={this.toggleSortAndFilterModal}>
                        <Image
                            style={stylesSearchBar.filterIcon}
                            source={assets.icFilter}
                            resizeMode="contain"
                        />
                    </TouchableOpacity>
                </View>
            </View>
        );
    };

    _generateSearchSummary = (totalResults) => {
        const { articleMode } = this.state;
        let text = "";

        if (articleMode) text = totalResults === 1 ? "article" : "articles";
        else text = totalResults === 1 ? "promotion" : "promotions";

        return `We found ${totalResults} ${text} that match your search.`;
    };

    renderSuccessWithResults = () => {
        const { searchResultList, totalResults, isLastPage, isLoadingMore } = this.state;

        const searchSummary = this._generateSearchSummary(totalResults);

        return (
            <ScrollView
                horizontal={false}
                // style={styles.scrollViewStyle}
                contentContainerStyle={styles.scrollView}
            >
                <View style={styles.contentContainer}>
                    {/* Title */}
                    <View style={styles.containerSummary}>
                        <Typo
                            fontSize={16}
                            fontWeight="600"
                            fontStyle="normal"
                            letterSpacing={0}
                            lineHeight={19}
                            textAlign="left"
                            color={BLACK}
                            text="Search Results"
                        />
                    </View>

                    {/* Description */}
                    <View style={styles.containerSummary}>
                        <Typo
                            fontSize={14}
                            letterSpacing={0}
                            lineHeight={18}
                            textAlign="left"
                            color={BLACK}
                            text={searchSummary}
                        />
                    </View>

                    {/* FlatList of cards w/ lazy-loading */}
                    <View style={styles.containerResults}>
                        {searchResultList.length > 0 && (
                            <FlatList
                                data={searchResultList}
                                extraData={this.state.refresh}
                                renderItem={this.renderResultItem}
                                keyExtractor={(item) => item.id.toString()}
                                onEndReached={debounce(this._onScrollHandler, 500)}
                                onEndReachedThreshold={1}
                                // style={styles.resultList}
                            />
                        )}

                        {isLoadingMore && (
                            <View style={styles.containerResults}>
                                <ContentCardLoader />
                            </View>
                        )}

                        {isLastPage && <ListFooter />}
                    </View>
                </View>
            </ScrollView>
        );
    };

    renderResultItem = ({ item, index }) => {
        return (
            <View style={styles.containerResultCard}>
                <ContentCard
                    imageUrl={item.imageUrl}
                    likeCount={item.likeCount}
                    isLiked={
                        item.userContent != null && item.userContent.emotionStatus == "LIKE"
                            ? true
                            : false
                    }
                    isBookmarked={
                        item.userContent != null && item.userContent.isBookmarked ? true : false
                    }
                    onCardPressed={() => this._onContentCardBodyPress({ item, index })}
                    onLikeButtonPressed={() => this._requestLikeContent({ item, index })}
                    onBookmarkButtonPressed={() => this._requestBookmarkContent({ item, index })}
                    title={item.title}
                    containerMode={"list"}
                />
            </View>
        );
    };

    renderSuccessWithNoResults = () => {
        return (
            <View style={styles.container}>
                <ImageBackground
                    style={styles.imageBackground}
                    source={require("@assets/search/no_results_illustration.png")}
                    imageStyle={styles.imageBackgroundStyle}
                />
                <View style={styles.contentContainer}>
                    {/* Title */}
                    <View style={styles.containerSummary}>
                        <Typo
                            fontSize={18}
                            fontWeight="600"
                            fontStyle="normal"
                            letterSpacing={0}
                            lineHeight={32}
                            color={BLACK}
                            text="Bummer, No Results Found"
                        />
                    </View>

                    {/* Description */}
                    <View style={styles.containerSummary}>
                        <Typo
                            fontSize={12}
                            letterSpacing={0}
                            lineHeight={18}
                            color={BLACK}
                            text={`Couldn't find what you're looking for?\nSearch or select a different filter.`}
                        />
                    </View>

                    <View style={styles.containerCentered}>
                        <ActionButton
                            backgroundColor={YELLOW}
                            height={48}
                            width={160}
                            borderRadius={24}
                            componentCenter={
                                <Typo
                                    fontSize={14}
                                    color={BLACK}
                                    fontWeight="600"
                                    lineHeight={18}
                                    text="New Search"
                                />
                            }
                            onPress={this.resetSearchState}
                        />
                        <View style={styles.btnCancel}>
                            <TouchableOpacity onPress={this._handleGoBack}>
                                <Typo
                                    fontSize={14}
                                    color={BLUE}
                                    fontWeight="600"
                                    lineHeight={18}
                                    text="Cancel"
                                />
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </View>
        );
    };

    _logApplyButton = (sort, category) => {
        FASearchAndFilter.onApplyFilter(sort, category);
    };

    _onContentCardBodyPress = ({ item, index }) => {
        this.props.navigation.navigate(navigationConstant.PROMO_DETAILS, {
            itemDetails: item,
            callPage: "Promotions-Search",
            onGoBack: this._refreshData,
            index: index,
            page: this.props.route?.params?.article,
        });
        if (this.state.articleMode) {
            FAArticleScreen.onSelectArticle(item.title);
        } else {
            FASearchPromotions.onSelectPromotion(item.title);
        }
    };

    _requestLikeContent = async ({ item, index }) => {
        this.setState({ loader: true });
        const { getModel } = this.props;
        const { cmsUrl, cmsCloudEnabled } = getModel("cloud");
        const endpoint = cmsCloudEnabled ? cmsUrl : `${ENDPOINT_BASE}/user/v2/users`;

        LikeHomeContent(endpoint, item.id.toString())
            .then(async (response) => {
                const result = response.data.result;

                var updatedSearchList = this.state.searchResultList;
                var updatedItem = updatedSearchList[index];
                if (
                    updatedItem.userContent != null &&
                    updatedItem.userContent.emotionStatus == "LIKE"
                ) {
                    updatedItem.likeCount--;
                } else {
                    updatedItem.likeCount++;
                }

                updatedItem.userContent.emotionStatus = result.emotionStatus;
                updatedSearchList[index] = updatedItem;

                this.setState({
                    searchResultList: updatedSearchList,
                    refresh: !this.state.refresh,
                });
            })
            .catch((err) => {
                console.log(" like ERROR: ", err);
            });
        if (this.state.articleMode) {
            FAArticleScreen.onAddToFavouriteSearch(item.title);
        } else {
            FASearchPromotions.onLikePress(item.title);
        }
    };

    _requestBookmarkContent = async ({ item, index }) => {
        this.setState({ loader: true });

        BookmarkHomeContent(item.id.toString())
            .then(async (response) => {
                const result = response.data.result;

                // set state to latest bookmark value
                var updatedSearchList = this.state.searchResultList;
                var updatedItem = updatedSearchList[index];
                updatedItem.userContent.isBookmarked = result.isBookmarked;

                // firebase.analytics().logEvent('BookMarkContent', result);

                this.setState({
                    searchResultList: updatedSearchList,
                    refresh: !this.state.refresh,
                });
            })
            .catch((err) => {
                console.log(" bookmark ERROR: ", err);
                // this.setState({ phoneError: true, alertText: err.message });
            });
    };

    _queryBuilder = async (query, category) => {
        await this.setState({ query: query });
        console.log("[SearchScreen][_queryBuilder]: " + this.state.query);

        // trigger SearchScreen result list reload
        //this.PromotionsTabScreen._loadQuery(this.state.query);
        this.setState({
            isLoadingMore: false,
            isLastPage: false,
            searchResultList: [],
            refresh: !this.state.refresh,
            totalResults: 0,
            additionalQuery: query,
            additionalCategory: category,
            page: 0,
            viewState: "",
        });

        //call api again
        this._prepareSearch(0);
    };

    _handleGoBack = () => {
        this.props.navigation.goBack();
    };

    render() {
        const { showSortAndFilterModal, viewState, isLoadingMore, articleMode } = this.state;

        return (
            <React.Fragment>
                <ScreenContainer
                    backgroundType="color"
                    backgroundColor={MEDIUM_GREY}
                    analyticScreenName="Search"
                >
                    <ScreenLayout
                        paddingBottom={0}
                        paddingTop={0}
                        paddingHorizontal={0}
                        useSafeArea
                        neverForceInset={["bottom"]}
                        header={
                            <HeaderLayout
                                horizontalPaddingMode="custom"
                                horizontalPaddingCustomLeftValue={24}
                                horizontalPaddingCustomRightValue={24}
                                headerLeftElement={
                                    <TouchableOpacity
                                        style={styles.backButton}
                                        onPress={this._handleGoBack}
                                    >
                                        <Image
                                            source={require("@assets/icons/group6.png")}
                                            style={styles.backButtonImage}
                                        />
                                    </TouchableOpacity>
                                }
                            />
                        }
                    >
                        <React.Fragment>
                            {/* Search bar section */}
                            {this.renderSearchBar()}

                            {/* Result section */}
                            {viewState === "success_results" && this.renderSuccessWithResults()}
                            {viewState === "success_no_results" &&
                                this.renderSuccessWithNoResults()}
                            {viewState === "" && (
                                <View style={styles.emptyContainer}>
                                    {/* Loading card */}
                                    {isLoadingMore && (
                                        <View style={styles.loaderContainer}>
                                            <ContentCardLoader />
                                        </View>
                                    )}
                                </View>
                            )}
                        </React.Fragment>
                    </ScreenLayout>
                </ScreenContainer>

                <SortAndFilterModal
                    showSortAndFilterModal={showSortAndFilterModal}
                    toggleSortAndFilterModal={this.toggleSortAndFilterModal}
                    queryBuilder={this._queryBuilder}
                    article={articleMode}
                    logApplyButton={this._logApplyButton}
                />
            </React.Fragment>
        );
    }
}
export default withModelContext(SearchScreen);

const styles = StyleSheet.create({
    backButton: {
        height: 32,
        width: 32,
        alignItems: "center",
        justifyContent: "center",
    },
    backButtonImage: { height: 14, width: 22 },
    container: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
        paddingHorizontal: 24,
    },
    contentContainer: {
        flex: 1,
        paddingTop: 36,
        overflow: "visible",
        // paddingHorizontal: 24,
        zIndex: 1,
        position: "relative",
    },
    containerSummary: {
        marginBottom: 10,
        paddingHorizontal: 24,
    },
    containerResults: {
        marginTop: 28,
        paddingBottom: 70,
        overflow: "visible",
        flex: 1,
    },
    containerResultCard: {
        marginBottom: 36,
        overflow: "visible",
        paddingHorizontal: 24,
    },
    containerCentered: {
        flex: 1,
        alignItems: "center",
        marginTop: 36,
    },
    resultList: { overflow: "visible" },
    btnCancel: { marginTop: 24 },
    emptyContainer: { flex: 1 },
    imageBackground: {
        width: width,
        height: height * 0.4,
        position: "absolute",
        bottom: 0,
        zIndex: 0,
    },
    imageBackgroundStyle: {
        resizeMode: "cover",
        alignSelf: "flex-end",
    },
    loaderContainer: { marginTop: 32, paddingHorizontal: 24 },
    scrollView: { flexGrow: 1, overflow: "visible" },
});

const stylesSearchBar = StyleSheet.create({
    container: {
        height: 48,
        marginTop: 10,
        marginBottom: 10,
        marginHorizontal: 24,
    },
    containerSearchBar: {
        flexDirection: "row",
        alignItems: "center",
    },
    containerSearchPill: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: WHITE,
        borderRadius: 22,
        flex: 1,
        marginRight: 8,
        elevation: 12,
        shadowColor: "rgba(0, 0, 0, 0.08)",
        shadowOffset: {
            width: 0,
            height: 4,
        },
        shadowRadius: 16,
        shadowOpacity: 1,
    },
    searchBarIcon: {
        width: 45,
        height: 45,
        marginLeft: 8,
    },
    filterIcon: {
        width: 24,
        height: 24,
        marginLeft: 18,
        marginRight: 10,
    },
    searchLabelContainer: {
        flex: 1,
        fontWeight: "300",
        fontFamily: "montserrat",
        fontSize: 20,
        letterSpacing: 0,
    },
});
