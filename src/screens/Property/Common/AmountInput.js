import PropTypes from "prop-types";
import React from "react";
import { StyleSheet, View, Image } from "react-native";
import { TouchableOpacity } from "react-native-gesture-handler";

import Typo from "@components/Text";
import TextInput from "@components/TextInput";

import { DARK_GREY } from "@constants/colors";

import Assets from "@assets";

function AmountInput({
    show,
    label,
    subLabel,
    onPress,
    value,
    note,
    style,
    infoIcon,
    infoIconPress,
    ...props
}) {
    let header;
    if (infoIcon && subLabel) {
        header = (
            <View style={Style.infoLabelContainerCls}>
                <Typo fontSize={14} lineHeight={19} textAlign="left" text={label} />
                {subLabel && (
                    <>
                        <Typo
                            fontSize={12}
                            lineHeight={16}
                            textAlign="left"
                            text={subLabel}
                            color={DARK_GREY}
                        />
                    </>
                )}
                <TouchableOpacity onPress={infoIconPress} activeOpacity={0.8}>
                    <Image style={Style.infoIcon} source={Assets.icInformation} />
                </TouchableOpacity>
            </View>
        );
    } else if (infoIcon) {
        header = (
            <View style={Style.infoLabelContainerCls}>
                <Typo fontSize={14} lineHeight={19} textAlign="left" text={label} />
                {subLabel && (
                    <>
                        <Typo
                            fontSize={12}
                            lineHeight={16}
                            textAlign="left"
                            text={subLabel}
                            color={DARK_GREY}
                        />
                    </>
                )}
                <TouchableOpacity onPress={infoIconPress} activeOpacity={0.8}>
                    <Image style={Style.infoIcon} source={Assets.icInformation} />
                </TouchableOpacity>
            </View>
        );
    } else {
        header = <Typo fontSize={14} lineHeight={19} textAlign="left" text={label} />;
    }

    return (
        <>
            {show && (
                <View style={[Style.container, style]}>
                    <TouchableOpacity onPress={onPress} activeOpacity={1}>
                        {header}
                        <TextInput
                            prefix="RM"
                            placeholder="0.00"
                            value={value}
                            editable={false}
                            {...props}
                        />
                        {note && (
                            <Typo
                                fontSize={12}
                                lineHeight={16}
                                textAlign="left"
                                text={note}
                                color={DARK_GREY}
                                style={Style.noteCls}
                            />
                        )}
                    </TouchableOpacity>
                </View>
            )}
        </>
    );
}

AmountInput.propTypes = {
    show: PropTypes.bool,
    label: PropTypes.string.isRequired,
    subLabel: PropTypes.string,
    onPress: PropTypes.func.isRequired,
    value: PropTypes.string,
    note: PropTypes.string,
    style: PropTypes.object,
    infoIcon: PropTypes.bool,
    infoIconPress: PropTypes.func,
};

AmountInput.defaultProps = {
    show: true,
    onPress: () => {},
    subLabel: null,
    note: null,
    style: {},
    infoIcon: false,
    infoIconPress: () => {},
};

const Style = StyleSheet.create({
    container: {
        marginBottom: 20,
    },

    infoIcon: {
        height: 16,
        marginLeft: 10,
        width: 16,
    },

    infoLabelContainerCls: {
        alignItems: "center",
        flexDirection: "row",
        paddingVertical: 2,
    },

    noteCls: {
        marginTop: 8,
    },
});

export default AmountInput;
