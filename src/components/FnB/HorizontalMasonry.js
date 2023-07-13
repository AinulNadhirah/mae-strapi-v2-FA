import PropTypes from "prop-types";
import React, { useCallback } from "react";
import { StyleSheet, View, TouchableOpacity } from "react-native";

import Typo from "@components/Text";

import { YELLOW, WHITE, SHADOW_LIGHT, PICTON_BLUE } from "@constants/colors";

export function toPickerFormat(data, nameKey, valueKey) {
    return data.map((obj) => {
        return {
            name: obj[nameKey], // id
            value: obj[valueKey], // display value
        };
    });
}

function HorizontalMasonry({
    title,
    viewAllLbl = "View All",
    onPressViewAll,
    data,
    onPress,
    selectedIdArr = [],
}) {
    function Pill({ item }) {
        const handlePress = useCallback(() => {
            onPress(item);
        }, [item]);

        const isSelected = selectedIdArr.find((id) => id === item.value);
        return (
            <View key={`${item.value}`} style={styles.tags}>
                <TouchableOpacity
                    style={[styles.tagsView, isSelected && styles.selectedTagView]}
                    onPress={handlePress}
                >
                    <Typo fontSize={12} fontWeight="normal" lineHeight={18} text={item.name} />
                </TouchableOpacity>
            </View>
        );
    }
    Pill.propTypes = {
        item: PropTypes.object,
    };

    return (
        <View style={styles.horizontalMasonryContainer}>
            {!!title && (
                <View style={styles.titleContainer}>
                    <Typo
                        style={styles.typoStyle}
                        fontSize={14}
                        fontWeight="600"
                        lineHeight={24}
                        text={title}
                        textAlign="left"
                    />

                    {onPressViewAll && (
                        <TouchableOpacity
                            onPress={onPressViewAll}
                            hitSlop={{ top: 30, bottom: 30, left: 30, right: 30 }}
                        >
                            <Typo
                                fontSize={14}
                                fontWeight="600"
                                fontStyle="normal"
                                letterSpacing={0}
                                lineHeight={19}
                                textAlign="left"
                                text={viewAllLbl}
                                color={PICTON_BLUE}
                            />
                        </TouchableOpacity>
                    )}
                </View>
            )}
            <View style={styles.categoryView}>
                {data.map((item) => (
                    <Pill key={`${item.value}`} item={item} />
                ))}
            </View>
        </View>
    );
}
HorizontalMasonry.propTypes = {
    title: PropTypes.string,
    viewAllLbl: PropTypes.string,
    onPressViewAll: PropTypes.func,
    data: PropTypes.array,
    onPress: PropTypes.func,
    selectedIdArr: PropTypes.array,
};

const styles = StyleSheet.create({
    categoryView: {
        flexDirection: "row",
        flexWrap: "wrap",
        justifyContent: "flex-start",
        marginHorizontal: -9,
    },
    horizontalMasonryContainer: {
        marginTop: 24,
    },
    selectedTagView: {
        backgroundColor: YELLOW,
    },

    tags: {
        marginBottom: 10,
        marginHorizontal: 9,
    },
    tagsView: {
        backgroundColor: WHITE,
        borderRadius: 18.5,
        elevation: 8,
        paddingHorizontal: 18,
        paddingVertical: 10,
        shadowColor: SHADOW_LIGHT,
        shadowOffset: {
            width: 0,
            height: 4,
        },
        shadowOpacity: 1,
        shadowRadius: 5,
    },
    titleContainer: {
        alignItems: "center",
        flexDirection: "row",
        justifyContent: "space-between",
        marginBottom: 14,
    },
});

export default HorizontalMasonry;
