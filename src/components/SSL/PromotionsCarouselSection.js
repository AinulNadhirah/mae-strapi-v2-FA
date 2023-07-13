import PropTypes from "prop-types";
import React from "react";
import { StyleSheet, View } from "react-native";
import { FlatList } from "react-native-gesture-handler";

import PromotionsCarouselCard from "@components/Cards/PromotionsCarouselCard";
import LoadingDiscover from "@components/FnB/LoadingDiscover";
import TitleViewAllHeader from "@components/SSL/TitleViewAllHeader";

export default function PromotionsCarouselSection({
    promotionData,
    isLoading,
    onPress,
    onViewAll,
}) {
    function handlePromoPress({ item }) {
        onPress({ item });
    }

    function renderPromotionCard({ index, item, ...props }) {
        if (!item.title) {
            item.title = item.categoryName;
        }
        return (
            <PromotionsCarouselCard
                {...props}
                item={item}
                onPress={handlePromoPress}
                isLastItem={index === promotionData.length - 1}
            />
        );
    }
    renderPromotionCard.propTypes = {
        item: PropTypes.object,
        index: PropTypes.number,
    };

    function promotionKey(item, index) {
        return item.categoryId ? `${item.categoryId}_${index}` : `${index}`;
    }
    promotionKey.propTypes = {
        item: PropTypes.object,
    };

    function renderSeparator() {
        return <View style={styles.separator} />;
    }

    return (
        <View>
            <TitleViewAllHeader title="Promotions" onPressViewAll={onViewAll} />
            {isLoading ? (
                <LoadingDiscover />
            ) : (
                <FlatList
                    data={promotionData}
                    ItemSeparatorComponent={renderSeparator}
                    renderItem={renderPromotionCard}
                    horizontal
                    nestedScrollEnabled
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.carouselContainer}
                    keyExtractor={promotionKey}
                />
            )}
        </View>
    );
}
PromotionsCarouselSection.propTypes = {
    promotionData: PropTypes.array,
    isLoading: PropTypes.bool,
    onPress: PropTypes.func,
    onViewAll: PropTypes.func,
};

export const styles = StyleSheet.create({
    carouselContainer: { paddingHorizontal: 20 },
    separator: { width: 20 },
});
