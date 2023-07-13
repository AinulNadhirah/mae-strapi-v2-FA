import PropTypes from "prop-types";
import React from "react";
import { StyleSheet, View, TouchableOpacity, Dimensions, Image } from "react-native";

import ActionButton from "@components/Buttons/ActionButton";
import Typo from "@components/Text";

import { BLACK, YELLOW, WHITE, SHADOW_LIGHT, GREY, FADE_GREY } from "@constants/colors";

import assets from "@assets";

import { FILTER_SECTION_L3 } from "./types";

const { width } = Dimensions.get("window");

export function Buttons({ data, onButtonItemPressed, enumType, selectedIds }) {
    function ButtonItem(item) {
        function onPress() {
            onButtonItemPressed(item, enumType);
        }
        const index = selectedIds?.findIndex((id) => id === item.value);
        const isSelected = index > -1 ? true : false;
        return (
            <TouchableOpacity
                style={[styles.tagsView, isSelected && styles.selectedTagView]}
                onPress={onPress}
                disabled={item?.isDisabled}
            >
                {!!item?.img && <Image style={styles.buttonIcon} source={item.img} />}
                <Typo
                    fontSize={12}
                    fontWeight="normal"
                    lineHeight={18}
                    text={item?.name}
                    color={item?.isDisabled && !isSelected ? FADE_GREY : BLACK}
                />
                {enumType === FILTER_SECTION_L3 && (
                    <Image style={styles.cancelIcon} source={assets.icCloseBlack} />
                )}
            </TouchableOpacity>
        );
    }
    return (
        <View style={styles.priceContainer}>
            {data?.map((item) => (
                <ButtonItem key={`${item.value}`} {...item} />
            ))}
        </View>
    );
}
Buttons.propTypes = {
    data: PropTypes.array,
    onButtonItemPressed: PropTypes.func,
    enumType: PropTypes.string,
    selectedIds: PropTypes.array,
};

export function L3Buttons({ data, onPressL3Cancel, onPressAdd }) {
    function ButtonItem(item) {
        function onPress() {
            onPressL3Cancel(item);
        }
        return (
            <TouchableOpacity style={[styles.tagsView, styles.selectedTagView]} onPress={onPress}>
                <Typo
                    fontSize={12}
                    fontWeight="normal"
                    lineHeight={18}
                    text={`${item?.name}`}
                    color={BLACK}
                />
                <Image style={styles.cancelIcon} source={assets.SSLFilterAdd} />
            </TouchableOpacity>
        );
    }
    return (
        <View style={styles.priceContainer}>
            {data?.map((item) => (
                <ButtonItem key={`${item.value}`} {...item} />
            ))}
            <TouchableOpacity style={styles.tagsView} onPress={onPressAdd}>
                <Image style={styles.buttonIcon} source={assets.SSLFilterAdd} />
                <Typo fontSize={12} fontWeight="normal" lineHeight={18} text="Add" color={BLACK} />
            </TouchableOpacity>
        </View>
    );
}
L3Buttons.propTypes = {
    data: PropTypes.array,
    onPressL3Cancel: PropTypes.func,
    onPressAdd: PropTypes.func,
    enumType: PropTypes.string,
};

export function Title({ title }) {
    return (
        <Typo
            style={styles.titleContainer}
            fontSize={14}
            fontWeight="600"
            lineHeight={24}
            text={title}
            textAlign="left"
        />
    );
}
Title.propTypes = {
    title: PropTypes.string,
};

export function ClearAllBtn({ disabled, onPress, text }) {
    return (
        <ActionButton
            disabled={disabled}
            borderRadius={25}
            onPress={onPress}
            backgroundColor={WHITE}
            style={styles.actionButton}
            componentCenter={
                <Typo
                    text={text}
                    fontSize={14}
                    fontWeight="600"
                    lineHeight={18}
                    color={disabled ? GREY : BLACK}
                />
            }
        />
    );
}
ClearAllBtn.propTypes = {
    disabled: PropTypes.bool,
    onPress: PropTypes.func,
    text: PropTypes.string,
};

export function ApplyFiltersBtn({ disabled, onPress, text }) {
    return (
        <ActionButton
            disabled={disabled}
            borderRadius={25}
            onPress={onPress}
            backgroundColor={YELLOW}
            style={styles.actionButton}
            componentCenter={
                <Typo
                    text={text}
                    fontSize={14}
                    fontWeight="600"
                    lineHeight={18}
                    color={disabled ? GREY : BLACK}
                />
            }
        />
    );
}
ApplyFiltersBtn.propTypes = {
    disabled: PropTypes.bool,
    onPress: PropTypes.func,
    text: PropTypes.string,
};

const styles = StyleSheet.create({
    actionButton: {
        width: width * 0.4,
    },
    buttonIcon: {
        height: 16,
        marginRight: 8,
        width: 16,
    },
    cancelIcon: {
        height: 16,
        marginLeft: 8,
        transform: [{ rotate: "45deg" }],
        width: 16,
    },
    priceContainer: {
        flexDirection: "row",
        flexWrap: "wrap",
        marginBottom: 14,
    },
    selectedTagView: {
        backgroundColor: YELLOW,
    },
    tagsView: {
        backgroundColor: WHITE,
        borderRadius: 18.5,
        elevation: 8,
        flexDirection: "row",
        marginBottom: 10,
        marginRight: 8,
        paddingHorizontal: 20,
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
        marginBottom: 12,
    },
});
