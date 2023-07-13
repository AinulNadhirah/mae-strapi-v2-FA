import PropTypes from "prop-types";
import React, { Component } from "react";
import { View, ScrollView, Animated, FlatList, RefreshControl } from "react-native";

import * as navigationConstant from "@navigation/navigationConstant";

import CarouselCardLoader from "@components/Cards/CarouselCardLoader";
import ContentCardLoader from "@components/Cards/ContentCard/ContentCardLoader";
import ContentCard from "@components/Cards/ContentCard/index";
import CountdownCard from "@components/Cards/CountdownCard";
import PromotionsCarouselCard from "@components/Cards/PromotionsCarouselCard";
import ScreenContainer from "@components/Containers/ScreenContainer";
import ListFooter from "@components/Footers/ListFooter";
import Typo from "@components/Text";

import { withModelContext } from "@context";

import {
    getAllCountdownBanners,
    getPromosByTag,
    getFeaturedPromosByTag,
    LikeHomeContent,
    BookmarkHomeContent,
} from "@services";
import { FAArticleScreen } from "@services/analytics/analyticsArticles";
import { FAPromotionsScreen } from "@services/analytics/analyticsPromotions";

import { MEDIUM_GREY } from "@constants/colors";
import { ENDPOINT_BASE } from "@constants/url";

import { calcSecondsToDate } from "@utils/time";

import styles from "@styles/Promotions/PromotionsTabStyles";

class PromotionsTabScreen extends Component {
    state = {
        showCountdown: false,
        countdownLength: 0,
        countdownTitle: "",
        countdownImageUrl: "",
        countdownHeightAnimated: new Animated.Value(0),
        countdownOpacityAnimated: new Animated.Value(0),
        page: 0,
        latestList: [],
        refreshing: false,
        isLoadingMore: false,
        isLastPage: false,
        additionalQuery: "",
        bottomSectionTitle: "Latest",
        articleMode: this.props.article ?? false,
    };

    static propTypes = {
        article: PropTypes.bool,
        navigation: PropTypes.object.isRequired,
        getModel: PropTypes.func,
        updateModel: PropTypes.func,
        resetModel: PropTypes.func,
    };

    componentDidMount = () => {
        this._syncDataWithAPI();
    };

    _syncDataWithAPI = async () => {
        await this._prepareFeatured();
        await this._prepareLatest(0);

        // this._prepareCountdown(); //not as important, so can proceed with/without

        // Stop refresh indicator
        this.setState({ refreshing: false });
    };

    _onRefresh = async () => {
        // Reset screen state
        this.setState({
            showCountdown: false,
            showFeatured: false,
            showLatest: false,
            countdownLength: 0,
            countdownTitle: "",
            countdownImageUrl: "",
            countdownHeightAnimated: new Animated.Value(0),
            countdownOpacityAnimated: new Animated.Value(0),
            page: 0,
            latestList: [],
            featuredList: [],
            refreshing: true,
            isLoadingMore: false,
            isLastPage: false,
        });

        // Fetch content from APIs
        this._syncDataWithAPI();
    };

    _loadQuery = async (query) => {
        // change section title if sorting mode changed
        let newTitle = "";
        if (query.includes("sort=seenUser,desc")) {
            newTitle = "Popular";
        } else if (query.includes("sort=updatedDate,asc")) {
            newTitle = "Oldest";
        } else {
            newTitle = "Latest";
        }

        // Reset latest state
        this.setState({
            showLatest: false,
            page: 0,
            latestList: [],
            isLoadingMore: false,
            isLastPage: false,
            additionalQuery: query,
            bottomSectionTitle: newTitle,
        });

        // call API to get results with query applied
        await this._prepareLatest(0);
    };

    _prepareCountdown = async () => {
        const countdown = await this._getCountdown();

        if (countdown) {
            //Difference in number of days
            let Seconds_Between_Dates = calcSecondsToDate(countdown.validDate.end);

            // set state to set and show countdown
            this.setState({
                showCountdown: true,
                countdownLength: Seconds_Between_Dates,
                countdownTitle: countdown.title,
                countdownImageUrl: countdown.imageUrl,
                refresh: false,
            });

            // animate appearance
            Animated.parallel([
                Animated.timing(this.state.countdownHeightAnimated, {
                    toValue: 82,
                    duration: 100,
                }).start(),
                Animated.timing(this.state.countdownOpacityAnimated, {
                    toValue: 1,
                    duration: 200,
                }).start(),
            ]).start();
        }
    };

    _prepareFeatured = async () => {
        const featuredData = await this._getFeaturedPromos();

        this.setState({
            featuredList: featuredData,
            showFeatured: true,
        });
    };

    _prepareLatest = async (page) => {
        console.log("page: " + page + " getting latest promo");

        const { refresh, latestList } = this.state;
        const latestData = await this._getLatestPromos(page);

        this.setState({
            latestList: [...latestList, ...latestData],
            showLatest: true,
            refresh: !refresh,
            isLoadingMore: false,
        });
    };

    _getCountdown = async () => {
        try {
            const { getModel } = this.props;
            const { cmsUrl, cmsCloudEnabled } = getModel("cloud");
            const endpoint = cmsCloudEnabled ? cmsUrl : `${ENDPOINT_BASE}/cms/api/v1`;
            const {
                data: { result: content },
            } = await getAllCountdownBanners(endpoint);
            return content;
        } catch (error) {
            this.setState({ countdownError: true });
            console.log(error);
            throw error;
        }
    };

    _getFeaturedPromos = async () => {
        try {
            const { getModel } = this.props;
            const {
                auth: { token },
                cloud: { cmsUrl, cmsCloudEnabled },
            } = getModel(["auth", "cloud"]);
            const endpoint = cmsCloudEnabled ? cmsUrl : `${ENDPOINT_BASE}/cms/api/v1`;
            const { articleMode } = this.state;

            const {
                data: { content: data },
            } = await getFeaturedPromosByTag(endpoint, "", 0, 15, "AND", token, articleMode);
            console.log(data);
            return data;
        } catch (error) {
            this.setState({ featuredPromosError: true });
            console.log(error);
            // todo: hide featured section?
            throw error;
        }
    };

    _getLatestPromos = async (page) => {
        try {
            const { getModel } = this.props;
            const { additionalQuery, articleMode } = this.state;
            const {
                auth: { token },
                cloud: { cmsUrl, cmsCloudEnabled },
            } = getModel(["auth", "cloud"]);
            const endpoint = cmsCloudEnabled ? cmsUrl : `${ENDPOINT_BASE}/cms/api/v1`;

            const {
                data: { content: data, totalPages: totalPage },
            } = await getPromosByTag(
                endpoint,
                null,
                page,
                10,
                additionalQuery,
                "AND",
                token,
                null,
                articleMode
            );
            console.log(data);

            //set last page flag for pagination purposes
            let lastPage = false;
            if (!totalPage || page === totalPage - 1) {
                lastPage = true;
            }

            this.setState({ isLastPage: lastPage });

            return data;
        } catch (error) {
            this.setState({ latestPromosError: true, isLoadingMore: false, isLastPage: true });
            console.log(error);
            // todo: hide featured section?
            throw error;
        }
    };

    _onScrollHandler = () => {
        const { isLastPage } = this.state;

        if (!isLastPage) {
            this.setState(
                {
                    page: this.state.page + 1,
                    isLoadingMore: true,
                },
                () => {
                    console.log("onScrollHandler.. prepping page " + this.state.page);
                    this._prepareLatest(this.state.page);
                }
            );
        }
    };

    startCountdown = (length) => {
        this.setState({ showCountdown: true, countdownLength: length });
    };

    _onContentCardBodyPress = (item, index, origin) => {
        if (this.props.article) {
            FAArticleScreen.cardBodyPress(origin, item.title);
        } else {
            FAPromotionsScreen.cardBodyPress(origin, item.title);
        }
        this.props.navigation.navigate("promosModule", {
            screen: navigationConstant.PROMO_DETAILS,
            params: {
                itemDetails: item,
                callPage: "Promotions-" + origin,
                onGoBack: this._refreshData,
                index: index,
                page: this.props.article ?? "",
            },
        });
    };

    _requestLikeContent = async (id, index, title) => {
        if (this.props.article) {
            FAArticleScreen.onAddToFavouriteArticle(title);
        } else {
            FAPromotionsScreen.onLikePress(title);
        }
        const { latestList, refresh } = this.state;
        const { getModel } = this.props;
        const { cmsUrl, cmsCloudEnabled } = getModel("cloud");
        const endpoint = cmsCloudEnabled ? cmsUrl : `${ENDPOINT_BASE}/user/v2/users`;

        this.setState({ loader: true });

        LikeHomeContent(endpoint, id)
            .then(async (response) => {
                const result = response.data.result;
                // firebase.analytics().logEvent('LikeContent', result);

                let updatedLatestList = latestList;
                let updatedItem = updatedLatestList[index];
                if (
                    updatedItem.userContent != null &&
                    updatedItem.userContent.emotionStatus == "LIKE"
                ) {
                    updatedItem.likeCount--;
                } else {
                    updatedItem.likeCount++;
                }

                updatedItem.userContent.emotionStatus = result.emotionStatus;
                updatedLatestList[index] = updatedItem;

                this.setState({ latestList: updatedLatestList, refresh: !refresh });
            })
            .catch((err) => {
                console.log(" like ERROR: ", err);
            });
    };

    _requestBookmarkContent = async (id, index) => {
        const { latestList, refresh } = this.state;

        this.setState({ loader: true });

        BookmarkHomeContent(id)
            .then(async (response) => {
                const result = response.data.result;

                // set state to latest bookmark value
                let updatedLatestList = latestList;
                let updatedItem = updatedLatestList[index];
                updatedItem.userContent.isBookmarked = result.isBookmarked;

                // firebase.analytics().logEvent('BookMarkContent', result);

                this.setState({
                    latestList: updatedLatestList,
                    refresh: !refresh,
                });
            })
            .catch((err) => {
                console.log(" bookmark ERROR: ", err);
                // this.setState({ phoneError: true, alertText: err.message });
            });
    };

    _refreshData = (item, index, origin) => {
        const { latestList, refresh, featuredList } = this.state;

        if (origin === "Promotions-Latest") {
            let updatedLatestList = latestList;
            updatedLatestList[index] = item;

            console.log(updatedLatestList);

            this.setState({
                latestList: updatedLatestList,
                refresh: !refresh,
            });
        } else if (origin === "Promotions-Featured") {
            let updatedFeaturedList = featuredList;
            updatedFeaturedList[index] = item;

            console.log(updatedFeaturedList);

            this.setState({
                featuredList: updatedFeaturedList,
                refresh: !refresh,
            });
        }
    };

    renderCountdown = () => {
        const {
            showCountdown,
            countdownLength,
            countdownTitle,
            countdownImageUrl,
            countdownHeightAnimated,
            countdownOpacityAnimated,
        } = this.state;

        if (showCountdown && countdownLength) {
            return (
                <Animated.View
                    style={{
                        height: countdownHeightAnimated,
                        marginBottom: 24,
                        opacity: countdownOpacityAnimated,
                    }}
                >
                    <CountdownCard
                        show={showCountdown}
                        length={countdownLength}
                        title={countdownTitle}
                        imageUrl={countdownImageUrl}
                    />
                </Animated.View>
            );
        }
    };

    onCardBodyPress = ({ item, index }) => {
        this._onContentCardBodyPress(item, index, "Featured");
    };
    _renderCarouselCard = ({ item, index }) => {
        return (
            <PromotionsCarouselCard
                item={item}
                index={index}
                onPress={this.onCardBodyPress}
                isLastItem={index === this.state.featuredList.length - 1}
            />
        );
    };

    renderSeparator() {
        return <View style={styles.separator} />;
    }

    renderFeatured = () => {
        const { showFeatured, featuredList, refresh, articleMode } = this.state;

        if (showFeatured) {
            // Render results
            return (
                <View style={styles.featuredContainer}>
                    <View style={styles.containerHeaderTitle}>
                        <Typo
                            fontSize={16}
                            fontWeight="600"
                            fontStyle="normal"
                            letterSpacing={0}
                            lineHeight={19}
                            textAlign="left"
                            text={articleMode ? "Fab Reads" : "Featured"}
                        />
                    </View>
                    <FlatList
                        data={featuredList}
                        extraData={refresh}
                        renderItem={this._renderCarouselCard}
                        keyExtractor={(item) => item.id.toString()}
                        horizontal={true}
                        showsHorizontalScrollIndicator={false}
                        ItemSeparatorComponent={this.renderSeparator}
                        contentContainerStyle={styles.carouselContainer}
                    />
                </View>
            );
        } else {
            // Render loading shimmer view
            return (
                <View style={styles.featuredContainer}>
                    <View style={styles.containerHeaderTitle}>
                        <Typo
                            fontSize={16}
                            fontWeight="600"
                            fontStyle="normal"
                            letterSpacing={0}
                            lineHeight={19}
                            textAlign="left"
                            text="Featured"
                        />
                    </View>
                    <ScrollView horizontal={true} showsHorizontalScrollIndicator={false}>
                        <View style={{ width: 12, height: 200 }} />
                        <CarouselCardLoader />
                        <CarouselCardLoader />
                        <CarouselCardLoader />
                        <View style={{ width: 24 }} />
                    </ScrollView>
                </View>
            );
        }
    };

    _renderLatestItem = ({ item, index }) => {
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
                    onCardPressed={() => this._onContentCardBodyPress(item, index, "Latest")}
                    onLikeButtonPressed={() =>
                        this._requestLikeContent(item?.id?.toString(), index, item?.title)
                    }
                    onBookmarkButtonPressed={() =>
                        this._requestBookmarkContent(item?.id?.toString(), index)
                    }
                    title={item.title}
                    containerMode={"list"}
                />
            </View>
        );
    };

    renderContent = () => {
        const {
            bottomSectionTitle,
            latestList,
            showLatest,
            refresh,
            refreshing,
            isLastPage,
            articleMode,
        } = this.state;

        return (
            <>
                {/* FlatList of cards w/ lazy-loading */}
                <FlatList
                    data={latestList}
                    extraData={refresh}
                    renderItem={this._renderLatestItem}
                    keyExtractor={(item) => item.id.toString()}
                    onEndReached={this._onScrollHandler}
                    onEndReachedThreshold={0.7}
                    style={styles.featuredList}
                    initialNumToRender={10}
                    refreshControl={
                        <RefreshControl refreshing={refreshing} onRefresh={this._onRefresh} />
                    }
                    ListHeaderComponent={
                        <>
                            {/* Countdown banner section */}
                            {this.renderCountdown()}

                            {/* Featured section */}
                            {this.renderFeatured()}

                            <View style={styles.containerLatest}>
                                <View style={styles.containerHeaderTitle}>
                                    <Typo
                                        fontSize={16}
                                        fontWeight="600"
                                        fontStyle="normal"
                                        letterSpacing={0}
                                        lineHeight={19}
                                        textAlign="left"
                                        text={articleMode ? "What's New" : bottomSectionTitle}
                                    />
                                </View>
                            </View>

                            {!showLatest && (
                                <View style={[styles.containerResults, { marginHorizontal: 24 }]}>
                                    <ContentCardLoader />
                                </View>
                            )}
                        </>
                    }
                    ListFooterComponent={
                        <>
                            {isLastPage ? (
                                <ListFooter />
                            ) : (
                                <View style={[styles.containerResults, { marginHorizontal: 24 }]}>
                                    <ContentCardLoader />
                                </View>
                            )}
                        </>
                    }
                />
            </>
        );
    };

    render() {
        return (
            <ScreenContainer backgroundType="color" backgroundColor={MEDIUM_GREY}>
                {this.renderContent()}
            </ScreenContainer>
        );
    }
}

export default withModelContext(PromotionsTabScreen);
