import PropTypes from "prop-types";
import React from "react";
import { StyleSheet, View, FlatList } from "react-native";

import ProductFlatListItem from "@components/SSL/MerchantDetails/ProductFlatListItem";
import Typo from "@components/Text";

import { TRANSPARENT } from "@constants/colors";

function SearchResultFlatList({
    searchString,
    searchResult,
    isMerchantOpen,
    totalIndex,
    onEndReached,
    onPressProduct,
    ListFooterComponent,
}) {
    function renderItem({ item }) {
        return (
            <ProductFlatListItem
                item={item}
                isMerchantOpen={isMerchantOpen}
                onPressItem={onPressProduct}
            />
        );
    }
    renderItem.propTypes = {
        item: PropTypes.object.isRequired,
    };

    function keyExtractor(item, index) {
        return `${item.merchantId}-${index}`;
    }

    return (
        <View style={styles.transparentContainer}>
            <View style={styles.titleContainer}>
                <Typo
                    fontWeight="semi-bold"
                    fontSize={16}
                    lineHeight={18}
                    textAlign="left"
                    text={`${totalIndex} ${
                        totalIndex === 1 ? "item" : "items"
                    } with "${searchString}"`}
                />
            </View>
            <FlatList
                ListFooterComponent={ListFooterComponent}
                data={searchResult}
                renderItem={renderItem}
                keyExtractor={keyExtractor}
                showsVerticalScrollIndicator={false}
                style={styles.container}
                contentContainerStyle={styles.merchantScroller}
                initialNumToRender={20}
                onEndReachedThreshold={0.1}
                onEndReached={onEndReached}
            />
        </View>
    );
}
const styles = StyleSheet.create({
    container: { flex: 1 },
    merchantScroller: { paddingBottom: 24 },
    titleContainer: { marginHorizontal: 24, paddingBottom: 20 },
    transparentContainer: {
        backgroundColor: TRANSPARENT,
        flex: 1,
        marginTop: 20,
    },
});
SearchResultFlatList.propTypes = {
    item: PropTypes.object,
    isMerchantOpen: PropTypes.bool,
    searchString: PropTypes.string,
    searchResult: PropTypes.array,
    totalIndex: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    onPressMerchant: PropTypes.func.isRequired,
    onEndReached: PropTypes.func.isRequired,
    onPressProduct: PropTypes.func.isRequired,
    ListFooterComponent: PropTypes.oneOfType([PropTypes.object, PropTypes.bool]),
};
SearchResultFlatList.defaultProps = {
    searchString: "",
    searchResult: [],
};

export default SearchResultFlatList;
