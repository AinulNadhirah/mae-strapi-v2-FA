import PropTypes from "prop-types";
import React, { useState, useCallback, useRef } from "react";
import { View, TouchableOpacity, Image, StyleSheet } from "react-native";

import { PROMOS_DASHBOARD, PROMO_DETAILS } from "@navigation/navigationConstant";

import { TouchableSpring, Animated } from "@components/Animations/TouchableSpring";
import ActionButton from "@components/Buttons/ActionButton";
import ShimmerPlaceHolder from "@components/ShimmerPlaceholder";
import Typo from "@components/Text";
import { showErrorToast } from "@components/Toast";

import { withModelContext } from "@context";

import { LikeHomeContent } from "@services";
import { logEvent } from "@services/analytics";
import { withApi } from "@services/api";
import { getDashboardPromoAndArticles } from "@services/apiServiceCmsCloud";

import {
    WHITE,
    GREY,
    GREY_100,
    GREY_300,
    GREY_200,
    LIGHT_GREY,
    SHADOW_LIGHT,
    MEDIUM_GREY,
} from "@constants/colors";
import { FA_FIELD_INFORMATION, FA_SCREEN_NAME, FA_SELECT_ARTICLE } from "@constants/strings";
import { ENDPOINT_BASE } from "@constants/url";

import { generateHaptic } from "@utils";

import Images from "@assets";

import DashboardViewPortAware from "./ViewPortAware";

const styles = StyleSheet.create({
    articleContainer: {
        flex: 1,
        // paddingBottom: 36,
        paddingHorizontal: 24,
    },
    articleFooter: {
        marginBottom: 36,
    },
    articleHeading: {
        marginBottom: 24,
    },
    articleList: {
        marginBottom: 4,
    },
    loadingArticleAction: {
        backgroundColor: GREY_100,
        borderRadius: 15,
        height: 24,
        marginRight: 20,
        width: 60,
    },
    loadingArticleActionGutter: {
        backgroundColor: GREY_100,
        borderRadius: 15,
        height: 16,
        marginRight: 16,
        width: 48,
    },
    loadingArticleActionTwo: {
        backgroundColor: GREY_100,
        borderRadius: 15,
        height: 24,
        width: 60,
    },
    loadingArticleContainer: {
        backgroundColor: GREY,
        borderRadius: 8,
        marginBottom: 24,
        overflow: "hidden",
        paddingTop: 204,
    },
    loadingArticleMain: {
        alignItems: "center",
        flexDirection: "row",
        justifyContent: "space-between",
        marginTop: 24,
    },
    loadingArticleMainGroup: { alignItems: "center", flexDirection: "row" },
    loadingArticleSecondary: {
        backgroundColor: GREY,
        borderRadius: 8,
        marginBottom: 24,
        overflow: "hidden",
        paddingLeft: 109,
    },
    loadingArticleSecondaryAction: {
        backgroundColor: GREY_100,
        borderRadius: 15,
        height: 16,
        width: 48,
    },
    loadingArticleSecondaryActions: {
        alignItems: "center",
        flexDirection: "row",
        marginTop: 16,
    },
    loadingArticleSecondaryContent: {
        backgroundColor: GREY_300,
        padding: 16,
    },
    loadingTitleFull: {
        backgroundColor: GREY_200,
        borderRadius: 4,
        height: 8,
        marginBottom: 8,
        width: "100%",
    },
    mainArticleActionContainer: {
        alignItems: "center",
        borderTopColor: LIGHT_GREY,
        borderTopWidth: 1,
        flexDirection: "row",
        justifyContent: "space-between",
        paddingHorizontal: 20,
        paddingVertical: 16,
    },
    mainArticleActionGroup: {
        alignItems: "center",
        flexDirection: "row",
    },
    mainArticleContainer: {
        backgroundColor: WHITE,
        borderRadius: 8,
        elevation: 8,
        marginBottom: 24,
        shadowColor: SHADOW_LIGHT,
        shadowOffset: {
            width: 0,
            height: 4,
        },
        shadowOpacity: 1,
        shadowRadius: 16,
    },
    mainArticleContent: {
        borderTopLeftRadius: 8,
        borderTopRightRadius: 8,
        overflow: "hidden",
    },
    mainArticleFeatImg: { height: 204, width: "100%" },
    mainArticleGutter: {
        marginLeft: 6,
    },
    mainArticleLike: {
        height: 19,
        width: 22,
    },
    mainArticleSeen: {
        height: 14,
        width: 25,
    },
    mainArticleTitle: {
        padding: 16,
    },
    promoLoadingContent: {
        backgroundColor: GREY_300,
        padding: 20,
    },
    singleActionGutter: {
        marginLeft: 36,
    },
    singleArticleActionContainer: {
        alignItems: "flex-end",
    },
    singleArticleActionContainerInner: {
        alignItems: "center",
        flexDirection: "row",
        justifyContent: "space-between",
        paddingLeft: 16,
        width: "70%",
    },
    singleArticleActionGroup: {
        alignItems: "center",
        flexDirection: "row",
    },
    singleArticleContainer: {
        marginBottom: 30,
    },
    singleArticleContainerInner: { flexDirection: "row" },
    singleArticleContent: {
        paddingLeft: 16,
        width: "70%",
    },
    singleArticleFeatImg: { borderRadius: 8, height: 88, width: "30%" },
    singleArticleLike: {
        height: 19,
        width: 22,
    },
    singleArticleLikeCount: {
        marginLeft: 6,
    },
    singleArticleSeen: {
        height: 14,
        width: 24,
    },
    singleArticleSeenCount: {
        marginLeft: 6,
    },
});

function ArticleLoader() {
    return (
        <View>
            <View style={styles.loadingArticleContainer}>
                <View style={styles.promoLoadingContent}>
                    <ShimmerPlaceHolder style={styles.loadingTitleFull} />
                    <ShimmerPlaceHolder style={styles.loadingTitleFull} />
                    <ShimmerPlaceHolder style={styles.loadingTitleFull} />
                    <View style={styles.loadingArticleMain}>
                        <View style={styles.loadingArticleMainGroup}>
                            <ShimmerPlaceHolder
                                autoRun
                                visible={false}
                                style={styles.loadingArticleAction}
                            />
                            <ShimmerPlaceHolder
                                autoRun
                                visible={false}
                                style={styles.loadingArticleActionTwo}
                            />
                        </View>
                        <ShimmerPlaceHolder
                            autoRun
                            visible={false}
                            style={styles.loadingArticleActionTwo}
                        />
                    </View>
                </View>
            </View>
            <View style={styles.loadingArticleSecondary}>
                <View style={styles.loadingArticleSecondaryContent}>
                    <ShimmerPlaceHolder style={styles.loadingTitleFull} />
                    <ShimmerPlaceHolder style={styles.loadingTitleFull} />
                    <View style={styles.loadingArticleSecondaryActions}>
                        <ShimmerPlaceHolder
                            autoRun
                            visible={false}
                            style={styles.loadingArticleActionGutter}
                        />
                        <ShimmerPlaceHolder
                            autoRun
                            visible={false}
                            style={styles.loadingArticleSecondaryAction}
                        />
                    </View>
                </View>
            </View>
            <View style={styles.loadingArticleSecondary}>
                <View style={styles.loadingArticleSecondaryContent}>
                    <ShimmerPlaceHolder style={styles.loadingTitleFull} />
                    <ShimmerPlaceHolder style={styles.loadingTitleFull} />
                    <View style={styles.loadingArticleSecondaryActions}>
                        <ShimmerPlaceHolder
                            autoRun
                            visible={false}
                            style={styles.loadingArticleActionGutter}
                        />
                        <ShimmerPlaceHolder
                            autoRun
                            visible={false}
                            style={styles.loadingArticleSecondaryAction}
                        />
                    </View>
                </View>
            </View>
        </View>
    );
}

function MainArticle({
    id,
    imageUrl,
    title,
    likeCount,
    seenUser,
    seen,
    refreshData,
    navigation,
    onLike,
    userContent,
}) {
    function handleGoToArticle() {
        logEvent(FA_SELECT_ARTICLE, {
            [FA_SCREEN_NAME]: "Dashboard",
            [FA_FIELD_INFORMATION]: `Articles: ${title}`,
        });

        navigation.navigate("promosModule", {
            screen: PROMO_DETAILS,
            params: {
                itemDetails: {
                    id,
                },
                callPage: "Dashboard",
                onGoBack: refreshData,
                index: 0,
            },
        });
    }

    function onPress() {
        onLike(id);
        generateHaptic("selection", true);
    }

    return (
        <TouchableSpring onPress={handleGoToArticle}>
            {({ animateProp }) => (
                <Animated.View
                    style={[
                        styles.mainArticleContainer,
                        {
                            transform: [
                                {
                                    scale: animateProp,
                                },
                            ],
                        },
                    ]}
                >
                    <View style={styles.mainArticleContent}>
                        {imageUrl ? (
                            <Image
                                source={{
                                    uri: imageUrl,
                                }}
                                style={styles.mainArticleFeatImg}
                            />
                        ) : (
                            <View style={[styles.mainArticleFeatImg, { backgroundColor: GREY }]} />
                        )}
                        <View style={styles.mainArticleTitle}>
                            <Typo
                                fontSize={16}
                                fontWeight="normal"
                                lineHeight={22}
                                text={title}
                                textAlign="left"
                                numberOfLines={2}
                            />
                        </View>
                    </View>
                    {/* </TouchableOpacity> */}
                    <View style={styles.mainArticleActionContainer}>
                        <TouchableSpring scaleTo={0.88} onPress={onPress}>
                            {({ animateProp }) => (
                                <Animated.View
                                    style={[
                                        styles.mainArticleActionGroup,
                                        {
                                            transform: [
                                                {
                                                    scale: animateProp,
                                                },
                                            ],
                                        },
                                    ]}
                                >
                                    <Image
                                        source={
                                            userContent?.emotionStatus === "LIKE"
                                                ? Images.dashboardLikeFilled
                                                : Images.dashboardLike
                                        }
                                        style={styles.mainArticleLike}
                                    />
                                    <View style={styles.mainArticleGutter}>
                                        <Typo
                                            fontSize={12}
                                            fontWeight="normal"
                                            lineHeight={18}
                                            text={`${likeCount}`}
                                            textAlign="left"
                                        />
                                    </View>
                                </Animated.View>
                            )}
                        </TouchableSpring>

                        <View style={styles.mainArticleActionGroup}>
                            <Image source={Images.dashboardSeen} style={styles.mainArticleSeen} />
                            <View style={styles.mainArticleGutter}>
                                <Typo
                                    fontSize={12}
                                    fontWeight="normal"
                                    lineHeight={18}
                                    text={`${seenUser || seen || 0}`}
                                    textAlign="left"
                                />
                            </View>
                        </View>
                    </View>
                </Animated.View>
            )}
        </TouchableSpring>
    );
}

MainArticle.propTypes = {
    id: PropTypes.number,
    refreshData: PropTypes.func,
    onLike: PropTypes.func,
    userContent: PropTypes.object,
    imageUrl: PropTypes.string,
    title: PropTypes.string,
    likeCount: PropTypes.number,
    seenUser: PropTypes.number,
    seen: PropTypes.number,
    navigation: PropTypes.object,
};

function Article({
    id,
    imageUrl,
    title,
    likeCount,
    seenUser,
    refreshData,
    navigation,
    onLike,
    userContent,
}) {
    function handleGoToArticle() {
        logEvent(FA_SELECT_ARTICLE, {
            [FA_SCREEN_NAME]: "Dashboard",
            [FA_FIELD_INFORMATION]: `Articles: ${title}`,
        });

        navigation.navigate("promosModule", {
            screen: PROMO_DETAILS,
            params: {
                itemDetails: {
                    id,
                },
                callPage: "Dashboard",
                onGoBack: refreshData,
                index: 0,
            },
        });
    }

    function onPress() {
        onLike(id);
        generateHaptic("selection", true);
    }

    return (
        <View style={styles.singleArticleContainer}>
            <TouchableOpacity
                onPress={handleGoToArticle}
                activeOpacity={0.8}
                style={styles.singleArticleContainerInner}
            >
                {imageUrl ? (
                    <Image
                        source={{
                            uri: imageUrl,
                        }}
                        style={styles.singleArticleFeatImg}
                    />
                ) : (
                    <View style={[styles.singleArticleFeatImg, { backgroundColor: GREY }]} />
                )}
                <View style={styles.singleArticleContent}>
                    <Typo
                        fontSize={14}
                        fontWeight="normal"
                        lineHeight={20}
                        text={title}
                        textAlign="left"
                        numberOfLines={3}
                    />
                </View>
            </TouchableOpacity>
            <View style={styles.singleArticleActionContainer}>
                <View style={styles.singleArticleActionContainerInner}>
                    <TouchableSpring scaleTo={0.88} onPress={onPress}>
                        {({ animateProp }) => (
                            <Animated.View
                                style={[
                                    styles.singleArticleActionGroup,
                                    {
                                        transform: [
                                            {
                                                scale: animateProp,
                                            },
                                        ],
                                    },
                                ]}
                            >
                                <Image
                                    source={
                                        userContent?.emotionStatus === "LIKE"
                                            ? Images.dashboardLikeFilled
                                            : Images.dashboardLike
                                    }
                                    style={styles.singleArticleLike}
                                />
                                <View style={styles.singleArticleLikeCount}>
                                    <Typo
                                        fontSize={12}
                                        fontWeight="normal"
                                        lineHeight={18}
                                        text={`${likeCount}`}
                                        textAlign="left"
                                    />
                                </View>
                            </Animated.View>
                        )}
                    </TouchableSpring>
                    <View style={[styles.singleArticleActionGroup, styles.singleActionGutter]}>
                        <Image source={Images.dashboardSeen} style={styles.singleArticleSeen} />
                        <View style={styles.singleArticleSeenCount}>
                            <Typo
                                fontSize={12}
                                fontWeight="normal"
                                lineHeight={18}
                                text={`${seenUser || 0}`}
                                textAlign="left"
                            />
                        </View>
                    </View>

                    {/* <TouchableOpacity activeOpacity={0.8} style={styles.singleArticleActionGroup}>
                        <Image
                            source={Images.dashboardBookmark}
                            style={styles.singleActionBookmark}
                        />
                    </TouchableOpacity> */}
                </View>
            </View>
        </View>
    );
}

Article.propTypes = {
    imageUrl: PropTypes.string,
    title: PropTypes.string,
    likeCount: PropTypes.number,
    seenUser: PropTypes.number,
    seen: PropTypes.number,
    navigation: PropTypes.object,
    id: PropTypes.number,
    refreshData: PropTypes.func,
    onLike: PropTypes.func,
    userContent: PropTypes.object,
};
function FeaturedArticles({ navigation, getModel, api, initialLoaded }) {
    const [loading, setLoading] = useState(false);
    const [articles, setArticles] = useState([]);
    const [loaded, setLoaded] = useState(0);
    const {
        auth: { token },
        cloud: { cmsUrl, cmsCloudEnabled },
    } = getModel(["auth", "cloud"]);
    const isUnmount = useRef(false);
    const endpoint = cmsCloudEnabled ? cmsUrl : `${ENDPOINT_BASE}/cms/api/v1`;
    const likeEndpoint = cmsCloudEnabled ? cmsUrl : `${ENDPOINT_BASE}/user/v2/users`;

    const getArticles = useCallback(
        async (withLoading = true) => {
            if (withLoading && !isUnmount.current) setLoading(true);

            try {
                const params = {
                    tagSearch: {
                        tags: ["ARTICLES_EXPLORE"],
                        operand: "OR",
                    },
                    publish: true,
                    promote: true,
                    type: null,
                    auth: `bearer ${token}`,
                };
                const query = `page=0&size=5&sort=seenUser,desc`;
                const response = await getDashboardPromoAndArticles(endpoint, params, query);

                if (response && response.data) {
                    const { content } = response.data;

                    if (content.length && !isUnmount.current) {
                        setArticles(content);
                    }
                } else {
                    console.log("Not getting response");
                    throw new Error(response);
                }
            } catch (error) {
                // error
            } finally {
                !isUnmount.current && setLoading(false);
            }
        },
        [api, token]
    );

    const refreshData = useCallback(() => {
        getArticles(false);
    }, [getArticles]);

    async function onLike(id) {
        if (id && token) {
            try {
                const response = await LikeHomeContent(likeEndpoint, id, false);

                if (response) {
                    // reload the data
                    refreshData();
                }
            } catch (error) {
                showErrorToast({
                    message: "Fail to update content.",
                });
            }
        }
    }

    function onViewMoreContent() {
        navigation.navigate("promosModule", {
            screen: PROMOS_DASHBOARD,
            params: {
                article: true,
            },
        });
    }

    const _handleViewportEnter = () => {
        if (loaded !== initialLoaded) {
            isUnmount.current = false;
            setLoaded(initialLoaded);

            if (!articles.length) getArticles();
        }
        return () => {
            isUnmount.current = true;
        };
    };

    return (
        <DashboardViewPortAware callback={_handleViewportEnter} preTriggerRatio={0.5}>
            <View style={styles.articleContainer}>
                <View style={styles.articleHeading}>
                    <Typo
                        fontSize={16}
                        fontWeight="600"
                        lineHeight={22}
                        text="Top Reads"
                        textAlign="left"
                    />
                </View>
                {loading && <ArticleLoader />}
                {!loading && (
                    <>
                        {articles && articles[0] && (
                            <MainArticle
                                navigation={navigation}
                                refreshData={refreshData}
                                onLike={onLike}
                                {...articles[0]}
                            />
                        )}
                        <View style={styles.articleList}>
                            {articles
                                .filter((a, index) => index > 0)
                                .map((article) => (
                                    <Article
                                        key={`${article.id}`}
                                        navigation={navigation}
                                        refreshData={refreshData}
                                        onLike={onLike}
                                        {...article}
                                    />
                                ))}
                        </View>
                    </>
                )}
                <View style={styles.articleFooter}>
                    <ActionButton
                        backgroundColor={WHITE}
                        borderColor={GREY}
                        borderWidth={1}
                        borderRadius={20}
                        height={42}
                        componentCenter={
                            <Typo
                                fontSize={14}
                                fontWeight="600"
                                lineHeight={18}
                                text="View More Content"
                            />
                        }
                        onPress={onViewMoreContent}
                    />
                </View>
            </View>
        </DashboardViewPortAware>
    );
}

FeaturedArticles.propTypes = {
    navigation: PropTypes.object,
    api: PropTypes.object,
    getModel: PropTypes.func,
    initialLoaded: PropTypes.number,
};

export default withApi(withModelContext(FeaturedArticles));
