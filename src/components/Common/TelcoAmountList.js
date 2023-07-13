import PropTypes from "prop-types";
import React, { useCallback } from "react";
import { StyleSheet, View, FlatList, TouchableOpacity } from "react-native";

import Typo from "@components/Text";

import { WHITE, SILVER_CHALICE, YELLOW, GREY, TRANSPARENT } from "@constants/colors";

const TelcoItem = ({ item, onPress, textKey }) => {
    const handlePress = useCallback(() => {
        onPress(item);
    }, [item, onPress]);

    return (
        <TouchableOpacity onPress={handlePress}>
            <View style={styles.listView}>
                <View style={styles.radioButton}>
                    <TouchableOpacity style={styles.circle} onPress={handlePress}>
                        {item.isSelected && <View style={styles.checkedCircle} />}
                    </TouchableOpacity>

                    <Typo
                        fontSize={16}
                        fontWeight="600"
                        fontStyle="normal"
                        lineHeight={18}
                        letterSpacing={0}
                        textAlign="left"
                        text={item[textKey]}
                        style={styles.radioBtnText}
                    />
                </View>
            </View>

            <View style={styles.seperator} />
        </TouchableOpacity>
    );
};

TelcoItem.propTypes = {
    item: PropTypes.shape({
        isSelected: PropTypes.any,
    }),
    onPress: PropTypes.func,
    textKey: PropTypes.any,
};

const TelcoAmountList = ({ onItemPressed, items, textKey }) => {
    const renderItems = useCallback(
        ({ item }) => {
            return <TelcoItem item={item} onPress={onItemPressed} textKey={textKey} />;
        },
        [onItemPressed, textKey]
    );

    return (
        <View style={styles.container}>
            <FlatList data={items} renderItem={renderItems} showsVerticalScrollIndicator={false} />
        </View>
    );
};

const styles = StyleSheet.create({
    checkedCircle: {
        backgroundColor: YELLOW,
        borderRadius: 7,
        height: 14,
        width: 14,
    },

    circle: {
        alignItems: "center",
        borderColor: SILVER_CHALICE,
        borderRadius: 10,
        borderWidth: 1,
        height: 20,
        justifyContent: "center",
        marginTop: 5,
        width: 20,
    },

    container: {
        flex: 1,
    },

    listView: {
        alignItems: "center",
        backgroundColor: WHITE,
        borderColor: GREY,
        borderRadius: 8,
        borderStyle: "solid",
        borderWidth: 1,
        flexDirection: "row",
        height: 66,
    },

    radioBtnText: {
        marginLeft: 15,
        marginTop: 5,
    },

    radioButton: {
        flexDirection: "row",
        justifyContent: "flex-start",
        marginLeft: 25,
        width: "80%",
    },

    seperator: {
        backgroundColor: TRANSPARENT,
        height: 16,
        width: "100%",
    },
});

TelcoAmountList.propTypes = {
    itemAmount: PropTypes.string,
    items: PropTypes.array,
    onItemPressed: PropTypes.func.isRequired,
    textKey: PropTypes.string,
};

export { TelcoAmountList };
