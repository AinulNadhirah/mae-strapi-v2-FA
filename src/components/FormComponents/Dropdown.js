import React from "react";
import { TouchableOpacity, View, Image, StyleSheet } from "react-native";
import PropTypes from "prop-types";

import Typo from "@components/Text";
import { WHITE, GREY } from "@constants/colors";
import Assets from "@assets";

const InnerBody = ({ value }) => {
    return (
        <>
            <Typo
                fontSize={14}
                lineHeight={18}
                fontWeight="600"
                textAlign="left"
                text={value}
                ellipsizeMode="tail"
                numberOfLines={1}
                style={Style.textCls}
            />

            <Image source={Assets.downArrow} style={Style.imgCls} resizeMode="contain" />
        </>
    );
};

InnerBody.propTypes = {
    value: PropTypes.any,
};

const Dropdown = ({ value, onPress, style, disabled, customInnerBody }) => {
    function onDropdownPress() {
        if (!disabled) onPress(value);
    }

    return (
        <>
            {disabled ? (
                <View style={[Style.wrapperCls, style, Style.disabledCls]}>
                    <InnerBody value={value} />
                </View>
            ) : (
                <TouchableOpacity
                    style={[Style.wrapperCls, style]}
                    onPress={onDropdownPress}
                    activeOpacity={0.7}
                >
                    {customInnerBody || <InnerBody value={value} />}
                </TouchableOpacity>
            )}
        </>
    );
};

Dropdown.propTypes = {
    disabled: PropTypes.bool,
    onPress: PropTypes.func,
    style: PropTypes.any,
    value: PropTypes.string,
    customInnerBody: PropTypes.element,
};

Dropdown.defaultProps = {
    value: "",
    onPress: () => {},
    disabled: false,
    customInnerBody: null,
};

const Style = StyleSheet.create({
    disabledCls: {
        opacity: 0.5,
    },

    imgCls: {
        height: 15,
        marginLeft: 10,
        width: 15,
    },

    textCls: {
        flex: 1,
    },

    wrapperCls: {
        alignItems: "center",
        backgroundColor: WHITE,
        borderColor: GREY,
        borderRadius: 25,
        borderStyle: "solid",
        borderWidth: 1,
        flexDirection: "row",
        height: 50,
        paddingHorizontal: 24,
        paddingVertical: 10,
    },
});

export default React.memo(Dropdown);
