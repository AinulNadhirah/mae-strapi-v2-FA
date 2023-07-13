import PropTypes from "prop-types";
import React from "react";
import { FlatList } from "react-native";

import OrderFlatListItem from "./OrderFlatListItem";

const OrderFlatList = ({
    onItemPressed,
    items,
    isSst,
    sstPercentage,
    onEndReached,
    ListFooterComponent,
    isLoading,
}) => {
    function renderItem({ item }) {
        function handlePress() {
            onItemPressed(item);
        }
        return (
            <OrderFlatListItem
                isSst={isSst}
                sstPercentage={sstPercentage}
                item={item}
                handlePress={handlePress}
            />
        );
    }
    renderItem.propTypes = {
        item: PropTypes.object,
    };

    function keyExtractor(item, index) {
        return `${item.merchantId}-${index}`;
    }

    return (
        <FlatList
            ListFooterComponent={ListFooterComponent}
            data={items}
            renderItem={renderItem}
            extraData={isLoading}
            keyExtractor={keyExtractor}
            showsVerticalScrollIndicator={false}
            initialNumToRender={20}
            onEndReachedThreshold={0.1}
            onEndReached={onEndReached}
        />
    );
};
OrderFlatList.propTypes = {
    isLoading: PropTypes.bool,
    onItemPressed: PropTypes.func,
    items: PropTypes.array,
    onEndReached: PropTypes.func,
    ListFooterComponent: PropTypes.object,
    isSst: PropTypes.bool,
    sstPercentage: PropTypes.number,
};

export default React.memo(OrderFlatList);
