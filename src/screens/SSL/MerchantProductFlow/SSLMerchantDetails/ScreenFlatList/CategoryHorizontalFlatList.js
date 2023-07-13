import PropTypes from "prop-types";
import React from "react";
import { StyleSheet, View, TouchableOpacity } from "react-native";

import FlatListScrollToIndex from "@components/FlatListCustom/FlatListScrollToIndex";
import Typo from "@components/Text";

import { BLACK, FADE_TEXT_GREY, WHITE } from "@constants/colors";

const CategoryFlatListItem = React.memo(({ handlePress, item, index, selectedCategory }) => {
    function onPress() {
        handlePress(item);
    }

    return (
        <TouchableOpacity onPress={onPress}>
            <View style={styles.item(selectedCategory === index ? true : false)}>
                <Typo
                    fontSize={14}
                    fontWeight="semi-bold"
                    lineHeight={15}
                    textAlign="left"
                    color={selectedCategory === index ? WHITE : FADE_TEXT_GREY}
                    text={item}
                />
            </View>
        </TouchableOpacity>
    );
});
CategoryFlatListItem.displayName = "CategoryFlatListItem";
CategoryFlatListItem.propTypes = {
    handlePress: PropTypes.func,
    selectedCategory: PropTypes.number,
    item: PropTypes.string,
    index: PropTypes.number,
};
const styles = StyleSheet.create({
    item: (isHighlighted) => ({
        justifyContent: "center",
        backgroundColor: isHighlighted ? BLACK : WHITE,
        borderRadius: 16,
        paddingHorizontal: 16,
        paddingVertical: 8,
        marginHorizontal: 4,
        marginTop: 16,
    }),
});

const CategoryHorizontalFlatList = ({
    categoryHorizontalRef,
    items,
    onItemPressed,
    selectedCategory,
}) => {
    function renderItem({ item, index }) {
        function handlePress() {
            onItemPressed(item);

            categoryHorizontalRef?.current?.scrollToIndex({
                animated: true,
                index,
            });
        }

        return (
            <CategoryFlatListItem
                selectedCategory={selectedCategory}
                item={item}
                handlePress={handlePress}
                index={index}
            />
        );
    }
    renderItem.propTypes = {
        item: PropTypes.object,
        index: PropTypes.number,
    };

    function keyExtractor(item) {
        return `${item}`;
    }

    return (
        <FlatListScrollToIndex
            ref={categoryHorizontalRef}
            data={items}
            renderItem={renderItem}
            extraData={selectedCategory}
            keyExtractor={keyExtractor}
            showsVerticalScrollIndicator={false}
            showsHorizontalScrollIndicator={false}
            initialNumToRender={20}
            horizontal={true}
        />
    );
};
CategoryHorizontalFlatList.propTypes = {
    categoryHorizontalRef: PropTypes.object,
    onItemPressed: PropTypes.func,
    items: PropTypes.array,
    selectedCategory: PropTypes.number,
};

export default React.memo(CategoryHorizontalFlatList);
