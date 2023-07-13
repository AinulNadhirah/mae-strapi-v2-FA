import PropTypes from "prop-types";
import React from "react";
import { FlatList, StyleSheet, TouchableOpacity, View } from "react-native";

import { WHITE } from "@constants/colors";

const BORDER_COLOR = "#D7D7D7";

// refer goal simulation / propTypes for batteryObject
const BatteryBar = ({ batteryObject, stripeHeight, width }) => {
    // return different styles for top and bottom bar
    const barStyle = (index, barIndex, count) => {
        if (index === 0 && barIndex === 0) {
            return styles.topStack;
        } else if (index === batteryObject?.length - 1 && barIndex === count - 1) {
            return styles.bottomStack;
        } else {
            return styles.innerBars;
        }
    };

    function renderBar({ item, index }) {
        return Array.from({ length: item?.stripe }, (_, barIndex) => (
            <View
                style={[
                    barStyle(index, barIndex, item?.stripe),
                    { backgroundColor: item?.color, height: stripeHeight, width },
                ]}
                key={barIndex}
            />
        ));
    }

    function keyExtractor(item, index) {
        return `${item?.id}-${index}`;
    }

    return (
        <TouchableOpacity
            activeOpacity={0.8}
            style={[styles.mainContainerStack, { width: width + 16 }]}
        >
            <FlatList data={batteryObject} renderItem={renderBar} keyExtractor={keyExtractor} />
        </TouchableOpacity>
    );
};

BatteryBar.propTypes = {
    batteryObject: PropTypes.arrayOf(
        PropTypes.exact({ color: PropTypes.string, stripe: PropTypes.number })
    ),
    width: PropTypes.number,
    stripeHeight: PropTypes.number,
};

BatteryBar.defaultProps = {
    width: 40,
    stripeHeight: 8,
};

const styles = StyleSheet.create({
    bottomStack: {
        borderBottomLeftRadius: 10,
        borderBottomRightRadius: 10,
        marginBottom: 4,
        marginHorizontal: 5,
        marginTop: 2,
    },
    innerBars: {
        height: 8,
        marginBottom: 2,
        marginHorizontal: 5,
        marginTop: 2,
    },
    mainContainerStack: {
        alignItems: "center",
        backgroundColor: WHITE,
        borderBottomLeftRadius: 10,
        borderBottomRightRadius: 10,
        borderColor: BORDER_COLOR,
        borderTopLeftRadius: 10,
        borderTopRightRadius: 10,
        borderWidth: 1,
        justifyContent: "center",
        padding: 2,
    },
    topStack: {
        borderTopLeftRadius: 10,
        borderTopRightRadius: 10,
        marginBottom: 2,
        marginHorizontal: 5,
        marginTop: 4,
    },
});

export default React.memo(BatteryBar);
