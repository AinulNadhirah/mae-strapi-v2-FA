import { useNavigation, useRoute } from "@react-navigation/core";
import { CacheeImage } from "cachee";
import PropTypes from "prop-types";
import React, { useMemo, useEffect } from "react";
import { StyleSheet, View } from "react-native";
import { FlatList } from "react-native-gesture-handler";

import { SSL_CART_SCREEN, SSL_MERCHANT_LISTING_V2 } from "@navigation/navigationConstant";

import HeaderLayout from "@layouts/HeaderLayout";
import ScreenLayout from "@layouts/ScreenLayout";

import { TouchableSpring, Animated } from "@components/Animations/TouchableSpring";
import HeaderBackButton from "@components/Buttons/HeaderBackButton";
import ScreenContainer from "@components/Containers/ScreenContainer";
import FloatingCart from "@components/SSL/FloatingCart";
import Typo from "@components/Text";

import { withModelContext, useModelController } from "@context";

import { FAPromotionsViewAllListing } from "@services/analytics/analyticsSSL";

import { WHITE, BLACK, MEDIUM_GREY } from "@constants/colors";

import { getShadow } from "@utils/dataModel/utility";

import assets from "@assets";

function SSLPromotionsViewAllListing() {
    const navigation = useNavigation();
    const route = useRoute();
    const { getModel } = useModelController();
    const { cartV1 } = getModel("ssl");

    const item = useMemo(() => route.params?.item ?? [], [route.params.item]);

    useEffect(() => {
        FAPromotionsViewAllListing.onScreen();
    }, []);

    function onCloseTap() {
        navigation.goBack();
    }

    function handlePromoPress(item) {
        console.log(item); // {categoryDefaultLogo,categoryId,categoryName,title}
        FAPromotionsViewAllListing.handlePromoPress(item);
        navigation.navigate(SSL_MERCHANT_LISTING_V2, {
            title: item?.title,
            subtitle: item?.categoryDesc ?? "",
            isShowFilter: true,
            L2Category: item?.categoryId, // 80
        });
    }

    function renderPromotionCard({ item }) {
        item.title = item.categoryName;

        function onPress() {
            handlePromoPress(item);
        }

        let imageUrl = assets.maeFBMerchant;
        if (item?.logo) {
            imageUrl = { uri: item?.logo };
        } else if (item?.categoryBanner) {
            imageUrl = { uri: item?.categoryBanner };
        }

        return (
            <TouchableSpring onPress={onPress}>
                {({ animateProp }) => (
                    <Animated.View
                        style={{
                            transform: [
                                {
                                    scale: animateProp,
                                },
                            ],
                        }}
                    >
                        <View style={styles.cardContainer}>
                            <View style={styles.listView}>
                                <View style={styles.imageView}>
                                    <CacheeImage
                                        source={imageUrl}
                                        style={styles.image}
                                        resizeMode="stretch"
                                    />
                                </View>
                                <View style={styles.textView}>
                                    <Typo
                                        fontSize={14}
                                        fontWeight="600"
                                        fontStyle="normal"
                                        letterSpacing={0}
                                        textAlign="left"
                                        lineHeight={18}
                                        style={styles.titleText}
                                        numberOfLines={2}
                                        ellipsizeMode="clip"
                                        text={item?.title}
                                    />
                                </View>
                            </View>
                        </View>
                    </Animated.View>
                )}
            </TouchableSpring>
        );
    }
    renderPromotionCard.propTypes = {
        item: PropTypes.object,
    };

    function promotionKey(item, index) {
        return item.categoryId ? `${item.categoryId}` : `${index}`;
    }

    function renderSeparator() {
        return <View style={styles.separator} />;
    }

    const cartCount = cartV1?.cartProducts?.reduce((acc, curr) => {
        return (acc += curr.count);
    }, 0);
    function onPressCart() {
        navigation.navigate(SSL_CART_SCREEN);
    }
    return (
        <ScreenContainer backgroundType="color" backgroundColor={MEDIUM_GREY}>
            <ScreenLayout
                header={
                    <HeaderLayout
                        headerLeftElement={<HeaderBackButton onPress={onCloseTap} />}
                        headerCenterElement={
                            <Typo
                                fontSize={16}
                                fontWeight="600"
                                color={BLACK}
                                lineHeight={19}
                                text={route.params?.title}
                            />
                        }
                    />
                }
                useSafeArea
                neverForceInset={["bottom"]}
                paddingLeft={0}
                paddingRight={0}
                paddingBottom={0}
                paddingTop={0}
            >
                <View style={styles.container}>
                    <FlatList
                        data={item}
                        ItemSeparatorComponent={renderSeparator}
                        renderItem={renderPromotionCard}
                        nestedScrollEnabled
                        showsHorizontalScrollIndicator={false}
                        contentContainerStyle={styles.carouselContainer}
                        keyExtractor={promotionKey}
                    />
                </View>
                {!!cartCount && <FloatingCart count={cartCount} onPress={onPressCart} />}
            </ScreenLayout>
        </ScreenContainer>
    );
}

const styles = StyleSheet.create({
    cardContainer: {
        marginBottom: 16,
        paddingHorizontal: 24,
    },
    container: {
        flex: 1,
    },
    image: {
        flex: 1,
    },
    imageView: {
        borderBottomLeftRadius: 8,
        borderTopLeftRadius: 8,
        height: 87,
        overflow: "hidden",
        width: 137,
    },
    listView: {
        backgroundColor: WHITE,
        borderRadius: 8,
        flexDirection: "row",
        height: 87,
        ...getShadow({
            height: 4,
            shadowRadius: 16,
            elevation: 8,
        }),
    },
    textView: {
        flex: 1,
        flexDirection: "column",
        justifyContent: "flex-start",
        marginHorizontal: 16,
        marginVertical: 10,
    },
    titleText: {
        color: BLACK,
        letterSpacing: 0,
    },
});

export default withModelContext(SSLPromotionsViewAllListing);
