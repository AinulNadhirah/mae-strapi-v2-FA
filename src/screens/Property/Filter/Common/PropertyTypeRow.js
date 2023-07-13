import PropTypes from "prop-types";
import { StyleSheet, TouchableOpacity, Image } from 'react-native';
import React from 'react';

import Typo from "@components/Text";
import Assets from "@assets";

const PropertyTypeRow = ({ data, onPress, selectedPropertyTypes }) => {
    const onPropertyTypePress = () => {
        if (onPress) onPress(data);
    };

    return (
        <TouchableOpacity
            onPress={onPropertyTypePress}
            style={styles.textTickRow}
            activeOpacity={0.8}
        >
            <Typo fontSize={14} lineHeight={18} textAlign="left" text={data?.name} />
            <Image
                style={styles.radioImage}
                source={
                    selectedPropertyTypes && selectedPropertyTypes.includes(data?.value)
                        ? Assets.icRadioChecked
                        : Assets.icRadioUnchecked
                }
            />
        </TouchableOpacity>
    );
};

PropertyTypeRow.propTypes = {
    data: PropTypes.object,
    onPress: PropTypes.func,
    selectedPropertyTypes: PropTypes.array,
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

export default PropertyTypeRow;
