import React from "react";
import { StyleSheet, View, FlatList, TouchableOpacity } from "react-native";
import PropTypes from "prop-types";

import Typo from "@components/Text";
import DynamicImage from "@components/Others/DynamicImage";

import { SEPARATOR_GRAY } from "@constants/colors";

const ImageFatList = ({ onItemPressed, items, textKey }) => {
    const renderItems = ({ item, index }) => {
        function handlePress() {
            onItemPressed(item);
        }

        return (
            <TouchableOpacity
                activeOpacity={0.8}
                onPress={handlePress}
                style={{ marginBottom: index === items.length - 1 ? 30 : 0 }}
            >
                <View style={styles.listView}>
                    <DynamicImage item={item} />
                    <Typo
                        fontSize={14}
                        fontWeight="600"
                        fontStyle="normal"
                        lineHeight={18}
                        letterSpacing={0}
                        color="#000000"
                        text={item[textKey]}
                        style={styles.title}
                    />
                </View>
                <View style={styles.seperator} />
            </TouchableOpacity>
        );
    };

    return (
        <View style={styles.container}>
            <FlatList
                data={items}
                renderItem={renderItems}
                showsVerticalScrollIndicator={false}
                keyExtractor={(item, index) => `${index}`}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    listView: {
        alignItems: "center",
        flexDirection: "row",
        height: 90,
        marginHorizontal: 24,
    },
    seperator: {
        backgroundColor: SEPARATOR_GRAY,
        flex: 1,
        height: 1,
        marginHorizontal: 24,
    },
    title: {
        marginLeft: 18,
    },
});

ImageFatList.propTypes = {
    onItemPressed: PropTypes.func.isRequired,
    items: PropTypes.array,
    textKey: PropTypes.string,
};

export { ImageFatList };
