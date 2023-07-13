import PropTypes from "prop-types";
import { StyleSheet, View } from 'react-native';
import React from 'react';

import Typo from "@components/Text";
import Assets from "@assets";

import RoundIconImage from "./RoundIconImage";

const ANY = "Any";
const ROOM_CARPARKS_ARRAY = [ANY, "1+", "2+", "3+", "4+", "5+"];

const RoomsCarparksRow = ({ label, type, value, onPressPlus, onPressMinus }) => {
    const isDisabledMinus = value === ANY;
    const isDisabledPlus = value === ROOM_CARPARKS_ARRAY[ROOM_CARPARKS_ARRAY.length - 1];

    const onRoomsCarparksRowMinusPress = () => {
        if (onPressMinus) onPressMinus(type);
    };

    const onRoomsCarparksRowPlusPress = () => {
        if (onPressPlus) onPressPlus(type);
    };

    return (
        <View style={styles.textTickRow}>
            <Typo fontSize={14} fontWeight="normal" lineHeight={18} textAlign="left" text={label} />
            <View style={styles.roomcarparkRightContainer}>
                <RoundIconImage
                    icon={Assets.icon32BlackMinus}
                    iconStyle={styles.minusImage}
                    onPress={onRoomsCarparksRowMinusPress}
                    type={type}
                    isDisabled={isDisabledMinus}
                />
                <Typo
                    fontSize={14}
                    fontWeight="normal"
                    lineHeight={18}
                    textAlign="center"
                    text={value}
                    style={styles.roomsText}
                />
                <RoundIconImage
                    icon={Assets.ic_Plus}
                    iconStyle={styles.plusImage}
                    onPress={onRoomsCarparksRowPlusPress}
                    type={type}
                    isDisabled={isDisabledPlus}
                />
            </View>
        </View>
    );
};

RoomsCarparksRow.propTypes = {
    label: PropTypes.string,
    type: PropTypes.string,
    value: PropTypes.string,
    onPressPlus: PropTypes.func,
    onPressMinus: PropTypes.func,
};

const styles = StyleSheet.create({
    textTickRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginTop: 18,
    },
    roomcarparkRightContainer: {
        flexDirection: "row",
    },
    minusImage: {
        height: 1,
        width: 9,
    },
    roomsText: {
        marginHorizontal: 23,
        width: 28,
    },
    plusImage: {
        height: 16,
        width: 16,
    },
});

export default RoomsCarparksRow;
