import PropTypes from "prop-types";
import { StyleSheet, TouchableOpacity, Image } from 'react-native';
import React from 'react';

import Typo from "@components/Text";
import Assets from "@assets";

const OwnershipRow = ({ data, onPress, ownership }) => {
    const onOwnershipRowPress = () => {
        if (onPress) onPress(data);
    };

    return (
        <TouchableOpacity
            onPress={onOwnershipRowPress}
            style={styles.textTickRow}
            activeOpacity={0.8}
        >
            <Typo fontSize={14} lineHeight={18} textAlign="left" text={data?.name} />
            <Image
                style={styles.radioImage}
                source={ownership === data?.value ? Assets.icRadioChecked : Assets.icRadioUnchecked}
            />
        </TouchableOpacity>
    );
};

OwnershipRow.propTypes = {
    data: PropTypes.object,
    onPress: PropTypes.func,
    ownership: PropTypes.string,
};

const styles = StyleSheet.create({
    textTickRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginTop: 18,
    },
    radioImage: {
        height: 20,
        width: 20,
    },
});

export default OwnershipRow;
