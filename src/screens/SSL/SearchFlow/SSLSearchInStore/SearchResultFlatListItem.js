/* eslint-disable react-native/sort-styles */
import PropTypes from "prop-types";
import React, { useState } from "react";
import { StyleSheet, View, Image, TouchableOpacity } from "react-native";

import MerchantFlatListItem from "@components/SSL/MerchantFlatListItem";
import Typo from "@components/Text";

import { LIGHT_GREY, PICTON_BLUE, WHITE } from "@constants/colors";

import { commaAndDecimalAdder } from "@utils/dataModel/utilityPartial.1";

import assets from "@assets";

function SearchResultFlatListItem({ item, onPressMerchant, onPressProduct }) {
    // console.log("SearchResultFlatListItem0", item);
    function onMerchantPress() {
        onPressMerchant(item.merchantId, item?.shopName);
    }
    function onProductPress(id) {
        onPressProduct(item.merchantId, id);
    }

    const hasProduct = item?.products?.length;
    const totalProductCount = item?.products?.length;
    const [isShowAllProduct, setIsShowAllProduct] = useState(false);

    function onPressToggle() {
        setIsShowAllProduct(!isShowAllProduct);
    }

    let products = [];
    if (isShowAllProduct) {
        products = item?.products;
    } else {
        products = item?.products?.slice(0, 2);
    }

    // console.log(
    //     "SearchResultFlatListItem hasProduct",
    //     hasProduct,
    //     "products",
    //     products,
    //     "totalProductCount",
    //     totalProductCount,
    //     "isShowAllProduct",
    //     isShowAllProduct
    // );
    return (
        <View style={styles.searchResultContainer}>
            <MerchantFlatListItem item={item} handlePress={onMerchantPress} isSearchView={true} />
            {!!hasProduct && <View style={styles.separator} />}
            {products?.map((product) => {
                return (
                    <SearchProductItem
                        key={`${product.productId}`}
                        productId={product.productId}
                        onPress={onProductPress}
                        imageUri={product?.imagePaths?.[0]}
                        name={product?.name}
                        price={`RM ${commaAndDecimalAdder(product.priceAmount)}`}
                    />
                );
            })}
            {totalProductCount > 2 && !isShowAllProduct && (
                <TouchableOpacity style={styles.viewMoreContainer} onPress={onPressToggle}>
                    <Typo
                        fontSize={14}
                        lineHeight={24}
                        fontWeight="semi-bold"
                        text={`See More (${totalProductCount - 2})`}
                        textAlign="right"
                        color={PICTON_BLUE}
                    />
                </TouchableOpacity>
            )}
        </View>
    );
}
SearchResultFlatListItem.propTypes = {
    item: PropTypes.object.isRequired,
    onPressMerchant: PropTypes.func.isRequired,
    onPressProduct: PropTypes.func.isRequired,
};

function SearchProductItem({ productId, imageUri, name, price, onPress }) {
    function handlePress() {
        onPress(productId);
    }
    return (
        <TouchableOpacity style={styles.productItemContainer} onPress={handlePress}>
            <View style={styles.productItemImageContainer}>
                <Image
                    source={imageUri ? { uri: imageUri } : assets.SSLProductIconPlaceholder}
                    style={styles.productItemImage}
                    resizeMode={imageUri ? "cover" : "contain"}
                />
            </View>
            <View style={styles.productItemDesc}>
                <Typo
                    fontSize={12}
                    fontWeight="semi-bold"
                    lineHeight={15}
                    textAlign="left"
                    text={name}
                    numberOfLines={2}
                />
                <Typo fontSize={12} lineHeight={15} textAlign="left" text={price} />
            </View>
        </TouchableOpacity>
    );
}
SearchProductItem.propTypes = {
    productId: PropTypes.string.isRequired,
    imageUri: PropTypes.string,
    name: PropTypes.string.isRequired,
    price: PropTypes.string.isRequired,
    onPress: PropTypes.func.isRequired,
};
SearchProductItem.defaultProps = {
    imageUri: "",
};

const styles = StyleSheet.create({
    /** ParentItem */
    searchResultContainer: {
        borderRadius: 8,
        marginHorizontal: 24,
        overflow: "hidden",
        marginBottom: 20,
    },
    separator: { borderTopWidth: 1, borderTopColor: LIGHT_GREY },
    viewMoreContainer: {
        paddingVertical: 12,
        alignItems: "center",
        backgroundColor: WHITE,
    },

    /** ProductItem */
    productItemContainer: {
        backgroundColor: WHITE,
        paddingVertical: 8,
        flexDirection: "row",
        alignItems: "center",
    },
    productItemDesc: {
        flex: 1,
        height: 50 + 8 + 8,
        paddingLeft: 16,
        marginRight: 5,
        flexDirection: "column",
        justifyContent: "center",
    },
    productItemImageContainer: { paddingLeft: 16 },
    productItemImage: { width: 50, height: 50, borderRadius: 8 },
});

export default SearchResultFlatListItem;
