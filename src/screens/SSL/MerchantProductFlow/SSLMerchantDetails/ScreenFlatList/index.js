import { useNavigation, useRoute } from "@react-navigation/core";
import PropTypes from "prop-types";
import React, { useEffect, useRef, useState } from "react";
import { StyleSheet, View, TouchableOpacity, Image, RefreshControl } from "react-native";

import { SSL_PRODUCT_DETAILS, SSL_SEARCH_IN_STORE } from "@navigation/navigationConstant";

import FlatListScrollToIndex from "@components/FlatListCustom/FlatListScrollToIndex";
import { dissolveStyle } from "@components/SSL/BottomDissolveCover.js";
import FooterText from "@components/SSL/FooterText";
import ProductFlatListItem from "@components/SSL/MerchantDetails/ProductFlatListItem";
import Typo from "@components/Text";

import { MEDIUM_GREY } from "@constants/colors";

import assets from "@assets";

import CategoryHorizontalFlatList from "./CategoryHorizontalFlatList";

const ScreenFlatList = ({
    merchantDetail,
    categoryTitleArr,
    cartV1,
    productData,
    ListHeaderComponent,
    init,
    showProductOrderModal,
}) => {
    // console.log("reerender ScreenFlatList");
    const navigation = useNavigation();
    const route = useRoute();
    const [selectedCategory, setSelectedCategory] = useState(0);
    const isAutoScrolling = useRef(false);
    const flatlistRef = useRef();
    const categoryHorizontalRef = useRef();

    /**
     * Check if auto scroll + go product screen. Happens to the below 2 scenarios
     * 1. SSL Deeplink straight to product m2ulife://m2usamasama?mid=MBUAT1205391&pid=MKPRD1000734
     * 2. SSLSearchScreen user on click product
     */
    // route.params = { productId: "MKPRD1279098" }; // uncomment to test
    useEffect(() => {
        let timer1 = null;
        if (productData.length > 0 && route.params?.productId) {
            const index = productData.findIndex(
                (obj) => obj?.productId === route.params?.productId
            );
            console.log(
                "SSLMerchantDetails autoScrollAndNavigateToProduct route.params?.productId",
                route.params?.productId,
                "index",
                index
            );
            if (index > -1) {
                const tempSelectedCategory = categoryTitleArr.findIndex(
                    (obj) => obj === productData[index]?.categoryTitle
                );
                setSelectedCategory(tempSelectedCategory);
                isAutoScrolling.current = true;
                timer1 = setTimeout(() => {
                    categoryHorizontalRef.current?.scrollToIndex({
                        animated: true,
                        index: tempSelectedCategory,
                    });
                    flatlistRef.current?.scrollToIndex({
                        animated: true,
                        index,
                    });
                }, 500);
                setTimeout(() => {
                    isAutoScrolling.current = false;
                }, 1000);

                navigation.navigate(SSL_PRODUCT_DETAILS, {
                    merchantDetail,
                    item: productData[index],
                });
            }
            navigation.setParams({ productId: null });
        }

        return () => {
            timer1 && clearTimeout(timer1);
        };
    }, [
        categoryTitleArr,
        flatlistRef,
        merchantDetail,
        navigation,
        productData,
        route.params?.productId,
    ]);

    //#region Category Horizontal Flatlist
    function onPressProduct(item, cartV1) {
        const productId = item?.productId;
        const productInCart = cartV1?.cartProducts?.filter((obj) => obj.productId === productId);

        if (productInCart?.length) {
            showProductOrderModal(productInCart, item);
            return;
        }
        navigation.navigate(SSL_PRODUCT_DETAILS, {
            merchantDetail,
            item,
        });
    }

    function onSearchButton() {
        navigation.navigate(SSL_SEARCH_IN_STORE, {
            products: productData,
            merchantDetail,
        });
    }

    function scrollToCategory(item) {
        setSelectedCategory(categoryTitleArr.findIndex((obj) => obj === item));

        const index = productData.findIndex(
            (product) => product.categoryTitle === item && product.isFirstProductOfCategory
        );
        if (index > -1) {
            isAutoScrolling.current = true;
            flatlistRef.current?.scrollToIndex({
                animated: true,
                index,
            });
            setTimeout(() => {
                isAutoScrolling.current = false;
            }, 500);
        }
    }
    //#endregion

    //#region Flatlist functions
    const onViewRef = useRef(({ viewableItems, _changed }) => {
        if (isAutoScrolling.current) return; // list is auto scrolling
        // console.log("viewableItems", viewableItems);

        const index = categoryTitleArr.findIndex(
            (obj) => obj === viewableItems?.[0]?.item.categoryTitle
        );
        if (index > -1) {
            setSelectedCategory(index);
            categoryHorizontalRef.current?.scrollToIndex({
                animated: true,
                index,
            });
        }
    });

    function keyExtractor(item, index) {
        return item.productId ? `${item.productId}_${index}` : `${index}`;
    }

    function renderItem({ item, index }) {
        if (item === "categoryPlaceholder") {
            return (
                <View style={styles.horizontalBar}>
                    <TouchableOpacity onPress={onSearchButton}>
                        <Image style={styles.searchIcon} source={assets.search} />
                    </TouchableOpacity>
                    <CategoryHorizontalFlatList
                        categoryHorizontalRef={categoryHorizontalRef}
                        items={categoryTitleArr}
                        selectedCategory={selectedCategory}
                        onItemPressed={scrollToCategory}
                    />
                </View>
            );
        }

        return (
            <View>
                {item?.categoryTitle && item?.isFirstProductOfCategory && (
                    <Typo
                        style={styles.categoryTitle}
                        fontSize={17}
                        lineHeight={21}
                        fontWeight="600"
                        textAlign="left"
                        text={item?.categoryTitle}
                    />
                )}
                <ProductFlatListItem
                    isHighlighted={item.productId === route.params?.productId}
                    onPressItem={onPressProduct}
                    isSst={merchantDetail?.isSst}
                    sstPercentage={merchantDetail?.sstPercentage}
                    isMerchantOpen={merchantDetail?.open}
                    item={item}
                    cartV1={cartV1}
                />
            </View>
        );
    }
    renderItem.propTypes = {
        item: PropTypes.object,
        index: PropTypes.number,
    };

    function listFooterComponent() {
        return (
            <>
                <FooterText text="You’ve seen all items" />
                <View style={dissolveStyle.scrollPadding} />
            </>
        );
    }
    //#endregion

    return (
        <FlatListScrollToIndex
            showsVerticalScrollIndicator={false}
            onViewableItemsChanged={onViewRef.current}
            viewabilityConfig={{ viewAreaCoveragePercentThreshold: 100 }}
            ref={flatlistRef}
            refreshControl={<RefreshControl refreshing={false} onRefresh={init} />}
            ListHeaderComponent={ListHeaderComponent}
            removeClippedSubviews={false}
            data={["categoryPlaceholder", ...productData]}
            keyExtractor={keyExtractor}
            renderItem={renderItem}
            stickyHeaderIndices={[1]}
            ListFooterComponent={productData.length > 0 && listFooterComponent}
        />
    );
};
ScreenFlatList.propTypes = {
    merchantDetail: PropTypes.object,
    categoryTitleArr: PropTypes.array,
    cartV1: PropTypes.object,
    productData: PropTypes.array,
    ListHeaderComponent: PropTypes.object,
    init: PropTypes.func,
    showProductOrderModal: PropTypes.func,
};

const styles = StyleSheet.create({
    categoryTitle: {
        marginBottom: 16,
        marginLeft: 24,
        marginTop: 24,
    },
    horizontalBar: {
        backgroundColor: MEDIUM_GREY,
        flexDirection: "row",
    },
    searchIcon: {
        height: 44,
        marginBottom: 8,
        marginLeft: 12,
        marginTop: 8,
        width: 44,
    },
});

export default ScreenFlatList;
