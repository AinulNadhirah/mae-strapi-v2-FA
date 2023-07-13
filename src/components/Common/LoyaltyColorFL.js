import React, { useCallback } from "react";
import { StyleSheet, View, FlatList, TouchableOpacity } from "react-native";
import PropTypes from "prop-types";

import { WHITE } from "@constants/colors";

const LoyaltyColorItem = ({ item, onItemPressed, selected_item }) => {
    const handlePress = useCallback(() => onItemPressed(item), [onItemPressed, item]);

    return (
        <TouchableOpacity style={styles.gridboxes} onPress={handlePress}>
            <View style={styles.colorBackground}>
                <View
                    style={
                        selected_item === item.colorId
                            ? [
                                  styles.colorCircle,
                                  {
                                      backgroundColor: item.colorCode,
                                      opacity: 0.4,
                                  },
                              ]
                            : [
                                  styles.colorCircle,
                                  {
                                      backgroundColor: item.colorCode,
                                  },
                              ]
                    }
                />
            </View>
        </TouchableOpacity>
    );
};

const LoyaltyColorFL = ({ onItemPressed, items, selected_item }) => {
    const renderItems = useCallback(({ item }) => (
        <LoyaltyColorItem item={item} onItemPressed={onItemPressed} selected_item={selected_item} />
    ));

    const keyExtractor = useCallback((_, index) => `${index}`, []);

    return (
        <FlatList
            data={items}
            numColumns={4}
            extraData={selected_item}
            renderItem={renderItems}
            keyExtractor={keyExtractor}
        />
    );
};

const styles = StyleSheet.create({
    flatList: {
        justifyContent: "center",
        alignItems: "center",
        width: "100%",
    },
    colorBackground: {
        alignItems: "center",
        backgroundColor: WHITE,
        borderRadius: 50,
        height: 48,
        justifyContent: "center",
        width: 48,
        marginTop: 15,
        marginBottom: 15,
        shadowColor: "rgba(0, 0, 0, 0.27)",
        shadowOffset: {
            width: 0,
            height: 0,
        },
        shadowRadius: 4,
        shadowOpacity: 1,
    },
    colorCircle: {
        alignItems: "center",
        borderRadius: 50,
        height: 42,
        justifyContent: "center",
        width: 42,
    },
    gridboxes: {
        width: "23%",
        marginLeft: "1%",
        marginRight: "1%",
        justifyContent: "center",
        alignItems: "center",
    },
});

LoyaltyColorFL.propTypes = {
    onItemPressed: PropTypes.func.isRequired,
    items: PropTypes.array,
    selected_item: PropTypes.number,
};

export { LoyaltyColorFL };
