import PropTypes from "prop-types";
import React from "react";
import { View, StyleSheet } from "react-native";
import { FlatList } from "react-native-gesture-handler";

import RecommendationCard from "@components/Cards/RecommendationCard";
import LoadingDiscover from "@components/FnB/LoadingDiscover";
import TitleViewAllHeader from "@components/SSL/TitleViewAllHeader";

function FnBMerchantCarouselSection({
    merchantsData,
    isLoading,
    onPressItem,
    title,
    onPressViewAll,
}) {
    function renderItem(obj) {
        const item = obj.item;
        let cuisineLbl = "";
        if (item?.cuisinesTypes?.length) {
            cuisineLbl = item?.cuisinesTypes.reduce((accumulator, currentValue, index) => {
                if (index === 0) return (accumulator += currentValue?.cuisineType);
                else return (accumulator += `, ${currentValue?.cuisineType}`);
            }, "");
        }

        console.log("item", item);

        let distance = "";
        if (item?.distance) {
            distance = item?.distance?.substring(0, item?.distance.indexOf(".") + 2) + " km";
        }

        function onCardPressed() {
            onPressItem(item);
        }
        return (
            <RecommendationCard
                item={item}
                imageUrl={item?.merchantLogo ? item?.merchantLogo : item?.logo}
                text={item.shopName}
                cuisineType={cuisineLbl}
                priceRange={item.priceRange}
                distance={distance}
                onCardPressed={onCardPressed}
            />
        );
    }
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

FnBMerchantCarouselSection.propTypes = {
    merchantsData: PropTypes.array,
    isLoading: PropTypes.bool,
    onPressItem: PropTypes.func.isRequired,
    title: PropTypes.string,
    onPressViewAll: PropTypes.func,
};

FnBMerchantCarouselSection.defaultProps = {
    merchantsData: [],
    isLoading: false,
    title: "",
};

export default React.memo(FnBMerchantCarouselSection);
