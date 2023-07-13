import PropTypes from "prop-types";
import React from "react";
import { View, StyleSheet, TouchableOpacity, Image } from "react-native";

import Typo from "@components/Text";

import { RED_ERROR } from "@constants/colors";

import assets from "@assets";

import Dropdown from "./Dropdown";

const LabeledDropdown = ({
    label,
    dropdownValue,
    isValid,
    errorMessage,
    onPress,
    style,
    disabled,
    customInnerBody,
    infoDetail,
    onInfoPress,
}) => {
    //info tooltip
    const infoTitle = infoDetail?.title ?? "";
    const infoDesc = infoDetail?.desc ?? "";

    function onLabeledDropdownPress(val) {
        if (!disabled) onPress(val);
    }

    function onHandlePress() {
        onInfoPress({ title: infoTitle, desc: infoDesc });
    }

    return (
        <View style={style}>
            {/* Label */}
            <View style={styles.labelRow}>
                <Typo
                    fontSize={14}
                    lineHeight={18}
                    fontWeight="normal"
                    textAlign="left"
                    text={label}
                />
                {/* Conditional Information Tooltip */}
                {infoDetail && (
                    <TouchableOpacity onPress={onHandlePress}>
                        <Image style={styles.infoIcon} source={assets.icInformation} />
                    </TouchableOpacity>
                )}
            </View>
            {/* Dropdown component */}
            <Dropdown
                value={dropdownValue}
                style={styles.dropdown}
                onPress={onLabeledDropdownPress}
                disabled={disabled}
                customInnerBody={customInnerBody}
            />

            {/* Validation Error Message */}
            {!isValid && (
                <Typo
                    textAlign="left"
                    text={errorMessage}
                    fontSize={12}
                    lineHeight={16}
                    fontWeight="normal"
                    color={RED_ERROR}
                    style={styles.errorText}
                />
            )}
        </View>
    );
};

LabeledDropdown.propTypes = {
    label: PropTypes.string,
    dropdownValue: PropTypes.string,
    isValid: PropTypes.bool,
    errorMessage: PropTypes.string,
    onPress: PropTypes.func,
    disabled: PropTypes.bool,
    customInnerBody: PropTypes.element,
    infoDetail: PropTypes.object,
    onInfoPress: PropTypes.func,
};

LabeledDropdown.defaultProps = {
    label: "",
    dropdownValue: "",
    isValid: true,
    errorMessage: "",
    onPress: () => {},
    disabled: false,
    customInnerBody: null,
    infoDetail: null,
    onInfoPress: () => {},
};

const styles = StyleSheet.create({
    dropdown: {
        marginTop: 10,
    },
    errorText: {
        marginBottom: 0,
        marginTop: 15,
    },
    infoIcon: {
        height: 18,
        marginLeft: 10,
        width: 18,
    },
    labelRow: {
        alignItems: "center",
        flexDirection: "row",
    },
});

export default React.memo(LabeledDropdown);
