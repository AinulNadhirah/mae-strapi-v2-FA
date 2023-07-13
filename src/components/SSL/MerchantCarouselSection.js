import PropTypes from "prop-types";
import React from "react";
import { View, StyleSheet } from "react-native";
import { FlatList } from "react-native-gesture-handler";

import LoadingDiscover from "@components/FnB/LoadingDiscover";
import MerchantCarouselCard from "@components/SSL/MerchantCarouselCard";
import TitleViewAllHeader from "@components/SSL/TitleViewAllHeader";

function MerchantCarouselSection({ merchantsData, isLoading, onPressItem, title, onPressViewAll }) {
    function renderItem({ item }) {
        return <MerchantCarouselCard item={item} title={title} onPressItem={onPressItem} />;
    }
    renderItem.propTypes = {
        item: PropTypes.object,
    };

    function keyExtractor(item, index) {
        return item.merchantId ? `${item.merchantId}_${index}` : `${index}`;
    }

    function renderSeparator() {
        return <View style={styles.separator} />;
    }

    return (
        <View>
            <TitleViewAllHeader title={title} onPressViewAll={onPressViewAll} />
            {isLoading ? (
                <LoadingDiscover />
            ) : (
                <FlatList
                    data={merchantsData}
                    ItemSeparatorComponent={renderSeparator}
                    renderItem={renderItem}
                    horizontal
                    nestedScrollEnabled
                    showsHorizontalScrollIndicator={false}
                    keyExtractor={keyExtractor}
                    contentContainerStyle={styles.carouselContainer}
                />
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    carouselContainer: { paddingHorizontal: 20 },
    separator: { width: 20 },
});

MerchantCarouselSection.propTypes = {
    merchantsData: PropTypes.array,
    isLoading: PropTypes.bool,
    onPressItem: PropTypes.func,
    onPressViewAll: PropTypes.func,
    title: PropTypes.string,
};
export default React.memo(MerchantCarouselSection);
