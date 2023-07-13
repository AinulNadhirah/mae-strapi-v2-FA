import PropTypes from "prop-types";
import React, { useState, useRef, useCallback } from "react";
import { View, TouchableOpacity, ScrollView, StyleSheet, Image } from "react-native";

import { PROMO_DETAILS } from "@navigation/navigationConstant";

import { TouchableSpring, Animated } from "@components/Animations/TouchableSpring";
import ShimmerPlaceHolder from "@components/ShimmerPlaceholder";
import Typo from "@components/Text";

import { withModelContext } from "@context";

import { logEvent } from "@services/analytics";
import { withApi } from "@services/api";
import { getDashboardPromoAndArticles } from "@services/apiServiceCmsCloud";

import {
    ROYAL_BLUE,
    SHADOW_LIGHT,
    WHITE,
    GREY,
    GREY_300,
    GREY_200,
    MEDIUM_GREY,
} from "@constants/colors";
import { FA_FIELD_INFORMATION, FA_SCREEN_NAME, FA_SELECT_PROMOTION } from "@constants/strings";
import { ENDPOINT_BASE } from "@constants/url";

import DashboardViewPortAware from "./ViewPortAware";

const styles = StyleSheet.create({
    loadingTitleFull: {
        backgroundColor: GREY_200,
        borderRadius: 4,
        height: 8,
        marginBottom: 8,
        width: "100%",
    },
    promoContainer: {
        flex: 1,
        paddingBottom: 12,
    },
    promoHeading: {
        alignItems: "center",
        flexDirection: "row",
        justifyContent: "space-between",
        paddingHorizontal: 24,
    },
    promoItem: {
        paddingHorizontal: 12,
    },
    promoItemCard: {
        backgroundColor: WHITE,
        borderRadius: 8,
        elevation: 8,
        height: 200,
        shadowColor: SHADOW_LIGHT,
        shadowOffset: {
            width: 0,
            height: 4,
        },
        shadowOpacity: 1,
        shadowRadius: 16,
        width: 200,
    },
    promoItemCardInner: {
        borderRadius: 8,
        overflow: "hidden",
    },
    promoItemDescription: {
        padding: 16,
    },
    promoItemFeatImg: { height: 120, width: "100%" },
    promoListContainer: {
        paddingHorizontal: 12,
        paddingVertical: 24,
    },
    promoLoadingContainer: {
        flexDirection: "row",
        flexWrap: "nowrap",
        marginTop: 24,
    },
    promoLoadingContent: {
        backgroundColor: GREY_300,
        padding: 20,
    },
    promoLoadingItem: {
        backgroundColor: GREY,
        borderRadius: 8,
        height: 200,
        marginLeft: 24,
        overflow: "hidden",
        paddingTop: 120,
        width: 192,
    },
});

function PromoLoader() {
    return (
        <View style={styles.promoLoadingContainer}>
            <View style={styles.promoLoadingItem}>
                <View style={styles.promoLoadingContent}>
                    <ShimmerPlaceHolder style={styles.loadingTitleFull} />
                    <ShimmerPlaceHolder style={styles.loadingTitleFull} />
                    <ShimmerPlaceHolder style={styles.loadingTitleFull} />
                </View>
            </View>
            <View style={styles.promoLoadingItem}>
                <View style={styles.promoLoadingContent}>
                    <ShimmerPlaceHolder style={styles.loadingTitleFull} />
                    <ShimmerPlaceHolder style={styles.loadingTitleFull} />
                    <ShimmerPlaceHolder style={styles.loadingTitleFull} />
                </View>
            </View>
        </View>
    );
}

function PromoItem({ id, index, onPress, imageUrl, title, ...item }) {
    function handlePress() {
        onPress(
            {
                id,
                imageUrl,
                title,
                ...item,
            },
            index
        );
    }
    return (
        <TouchableSpring onPress={handlePress}>
            {({ animateProp }) => (
                <Animated.View
                    style={[
                        styles.promoItemCard,
                        {
                            transform: [
                                {
                                    scale: animateProp,
                                },
                            ],
                        },
                    ]}
                >
                    <View style={styles.promoItemCardInner}>
                        {imageUrl ? (
                            <Image
                                source={{
                                    uri: imageUrl,
                                }}
                                style={styles.promoItemFeatImg}
                            />
                        ) : (
                            <View
                                style={[
                                    styles.promoItemFeatImg,
                                    {
                                        backgroundColor: GREY,
                                    },
                                ]}
                            />
                        )}
                        <View style={styles.promoItemDescription}>
                            <Typo
                                fontSize={12}
                                fontWeight="normal"
                                lineHeight={16}
                                text={title}
                                textAlign="left"
                                numberOfLines={3}
                            />
                        </View>
                    </View>
                </Animated.View>
            )}
        </TouchableSpring>
    );
}

PromoItem.propTypes = {
    id: PropTypes.number,
    onPress: PropTypes.func,
    imageUrl: PropTypes.string,
    title: PropTypes.string,
    index: PropTypes.number,
};
function FeaturedPromos({ navigation, api, getModel, initialLoaded }) {
    const [loading, setLoading] = useState(false);
    const [promos, setPromos] = useState([]);
    const isUnmount = useRef(false);
    const [loaded, setLoaded] = useState(0);

    const { cmsUrl, cmsCloudEnabled } = getModel("cloud");
    const endpoint = cmsCloudEnabled ? cmsUrl : `${ENDPOINT_BASE}/cms/api/v1`;

    const getLatestPromo = useCallback(async () => {
        try {
            !isUnmount.current && setLoading(true);
            const params = {
                tagSearch: {
                    tags: ["PROMODEALS_EXPLORE"],
                    operand: "OR",
                },
                publish: true,
                promote: true,
                type: null, // type: "PROMOTION",
            };
            const query = `page=0&size=5&sort=updatedDate,desc`;
            const response = await getDashboardPromoAndArticles(endpoint, params, query);

            if (response && response.data) {
                const { content } = response.data;

                if (content.length && !isUnmount.current) {
                    setPromos(content);
                }
            } else {
                console.log("Not getting response");
                throw new Error(response);
            }
        } catch (error) {
            // error
            console.log("error retrieving promos");
        } finally {
            !isUnmount.current && setLoading(false);
        }
    }, [api]);

    function handleOnCta() {
        logEvent(FA_SELECT_PROMOTION, {
            [FA_SCREEN_NAME]: "Dashboard",
            [FA_FIELD_INFORMATION]: "View All",
        });

        navigation.navigate("promosModule", {
            screen: "PromotionsDashboardScreen",
            params: { article: false },
        });
    }

    function handlePromoTap({ id, title }, index) {
        logEvent(FA_SELECT_PROMOTION, {
            [FA_SCREEN_NAME]: "Dashboard",
            [FA_FIELD_INFORMATION]: `Deals: ${title}`,
        });

        navigation.navigate("promosModule", {
            screen: PROMO_DETAILS,
            params: {
                itemDetails: {
                    id,
                },
                callPage: "Dashboard",
                onGoBack: () => {},
                index,
            },
        });
    }

    const _handleViewportEnter = () => {
        if (loaded !== initialLoaded) {
            isUnmount.current = false;
            setLoaded(initialLoaded);
            getLatestPromo();
        }
        return () => {
            isUnmount.current = true;
        };
    };

    return (
        <DashboardViewPortAware callback={_handleViewportEnter} preTriggerRatio={0.5}>
            <View style={styles.promoContainer}>
                <View style={styles.promoHeading}>
                    <Typo fontSize={16} fontWeight="600" lineHeight={18} text="Deals For You" />
                    <TouchableOpacity onPress={handleOnCta}>
                        <Typo
                            color={ROYAL_BLUE}
                            fontSize={14}
                            fontWeight="600"
                            lineHeight={18}
                            text="View All"
                        />
                    </TouchableOpacity>
                </View>
                {loading && <PromoLoader />}
                {!loading && (
                    <ScrollView
                        contentContainerStyle={styles.promoListContainer}
                        horizontal
                        showsHorizontalScrollIndicator={false}
                    >
                        {promos.map((promo, index) => (
                            <View key={`${promo.id}`} style={styles.promoItem}>
                                <PromoItem index={index} onPress={handlePromoTap} {...promo} />
                            </View>
                        ))}
                    </ScrollView>
                )}
            </View>
        </DashboardViewPortAware>
    );
}

FeaturedPromos.propTypes = {
    navigation: PropTypes.object,
    api: PropTypes.object,
    getModel: PropTypes.func,
    initialLoaded: PropTypes.number,
};

export default withApi(withModelContext(FeaturedPromos));
