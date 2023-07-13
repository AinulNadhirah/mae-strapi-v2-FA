import PropTypes from "prop-types";
import React from "react";
import { StyleSheet, View, FlatList } from "react-native";

import { TRANSPARENT } from "@constants/colors";

import MerchantFlatListItem from "./MerchantFlatListItem";

const MerchantFlatList = ({
    onItemPressed,
    items,
    onEndReached,
    ListFooterComponent,
    onScrollBeginDrag = () => {},
}) => {
    function renderItem({ item }) {
        function handlePress() {
            onItemPressed(item);
        }
        return <MerchantFlatListItem item={item} handlePress={handlePress} />;
    }
    renderItem.propTypes = {
        item: PropTypes.object,
    };
    function keyExtractor(item, index) {
        return `${item.merchantId}-${index}`;
    }

    return (
        <View style={styles.transparentContainer}>
            <FlatList
                onScrollBeginDrag={onScrollBeginDrag}
                scrollEventThrottle={32}
                ListFooterComponent={ListFooterComponent}
                data={items}
                renderItem={renderItem}
                keyExtractor={keyExtractor}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.merchantScroller}
                initialNumToRender={20}
                onEndReachedThreshold={0.5}
                onEndReached={onEndReached}
            />
        </View>
    );
};
MerchantFlatList.propTypes = {
    onItemPressed: PropTypes.func,
    items: PropTypes.array,
    onEndReached: PropTypes.func,
    ListFooterComponent: PropTypes.oneOfType([PropTypes.object, PropTypes.bool]),
    onScrollBeginDrag: PropTypes.func,
};

const styles = StyleSheet.create({
    merchantScroller: { paddingBottom: 24, paddingHorizontal: 24 },
    transparentContainer: {
        backgroundColor: TRANSPARENT,
        flex: 1,
        // paddingHorizontal: 24,
    },
});

export default React.memo(MerchantFlatList);
