import PropTypes from "prop-types";
import React from "react";
import { StyleSheet, View, FlatList } from "react-native";

import { TRANSPARENT } from "@constants/colors";

import { massageOrder, OrderCardCancelled, OrderCardComplete, OrderCard } from "./OrderCardItem";

const OrderCardFlatList = ({
    refreshControl,
    items,
    onEndReached,
    ListFooterComponent,
    handleGoTo,
    onPressMerchant,
    onPressReOrder,
}) => {
    function renderItem({ item }) {
        switch (item?.status) {
            case 1: // completed
                return (
                    <OrderCardComplete
                        onPress={handleGoTo}
                        onPressMerchant={onPressMerchant}
                        onPressReorder={onPressReOrder}
                        {...massageOrder(item)}
                    />
                );
            case 0: // canceled
            case 4: // canceled
                return (
                    <OrderCardCancelled
                        onPress={handleGoTo}
                        onPressMerchant={onPressMerchant}
                        onPressReorder={onPressReOrder}
                        {...massageOrder(item)}
                    />
                );
            default:
                return (
                    <OrderCard
                        onPress={handleGoTo}
                        onPressMerchant={onPressMerchant}
                        {...massageOrder(item)}
                    />
                );
        }
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
                refreshControl={refreshControl}
                ListFooterComponent={ListFooterComponent}
                data={items}
                renderItem={renderItem}
                keyExtractor={keyExtractor}
                showsVerticalScrollIndicator={false}
                scrollEnabled={true}
                style={styles.container}
                contentContainerStyle={styles.merchantScroller}
                initialNumToRender={5}
                onEndReachedThreshold={0.1}
                onEndReached={onEndReached}
            />
        </View>
    );
};
OrderCardFlatList.propTypes = {
    refreshControl: PropTypes.object,
    items: PropTypes.array,
    onEndReached: PropTypes.func,
    ListFooterComponent: PropTypes.any,
    handleGoTo: PropTypes.func,
    onPressMerchant: PropTypes.func,
    onPressReOrder: PropTypes.func,
};

const styles = StyleSheet.create({
    merchantScroller: { paddingBottom: 24 },
    transparentContainer: {
        backgroundColor: TRANSPARENT,
        flex: 1,
    },
});

export default React.memo(OrderCardFlatList);
