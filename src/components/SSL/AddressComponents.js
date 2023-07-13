import PropTypes from "prop-types";
import React from "react";
import { View, TouchableOpacity, Image, Dimensions, StyleSheet } from "react-native";

import ActionButton from "@components/Buttons/ActionButton.js";
import Typo from "@components/Text";

import { WHITE, FADE_GREY, LIGHT_GREY } from "@constants/colors";

import assets from "@assets";

const { width } = Dimensions.get("window");

export function AddressHomeFlatListItem({ item, onPress, onPressRightArrow }) {
    function handlePress() {
        onPress(item);
    }

    function handlePressRightArrow() {
        onPressRightArrow(item);
    }

    const description = item?.addressLine1
        ? `${item.addressLine1} ${item.city}`
        : "Set Home Address";

    return (
        <TouchableOpacity onPress={handlePress}>
            <View style={styles.mainContainer}>
                <Image source={assets.iconBlackHouse} style={styles.leftIcon} />
                <View style={styles.middleContainer}>
                    <View style={styles.titleContainer}>
                        <Typo fontWeight="semi-bold" fontSize={14} textAlign="left" text="Home" />
                    </View>
                    <Typo
                        numberOfLines={1}
                        fontWeight="normal"
                        fontSize={12}
                        textAlign="left"
                        color={FADE_GREY}
                        text={description}
                    />
                </View>
                {!!item.addressLine1 && (
                    <TouchableOpacity
                        onPress={handlePressRightArrow}
                        hitSlop={{ top: 15, left: 15, bottom: 15, right: 15 }}
                    >
                        <Image
                            source={assets.icChevronRight24Black}
                            style={styles.rightArrowIcon}
                        />
                    </TouchableOpacity>
                )}
            </View>

            <View style={styles.separator} />
        </TouchableOpacity>
    );
}
AddressHomeFlatListItem.propTypes = {
    item: PropTypes.object,
    onPress: PropTypes.func,
    onPressRightArrow: PropTypes.func,
};

export function AddressWorkFlatListItem({ item, onPress, onPressRightArrow }) {
    function handlePress() {
        onPress(item);
    }

    function handlePressRightArrow() {
        onPressRightArrow(item);
    }

    const description = item?.addressLine1
        ? `${item.addressLine1} ${item.city}`
        : "Set Work Address";

    return (
        <TouchableOpacity onPress={handlePress}>
            <View style={styles.mainContainer}>
                <Image source={assets.iconBlackWork} style={styles.leftIcon} />
                <View style={styles.middleContainer}>
                    <View style={styles.titleContainer}>
                        <Typo fontWeight="semi-bold" fontSize={14} textAlign="left" text="Work" />
                    </View>
                    <Typo
                        numberOfLines={1}
                        fontWeight="normal"
                        fontSize={12}
                        textAlign="left"
                        color={FADE_GREY}
                        text={description}
                    />
                </View>
                {!!item.addressLine1 && (
                    <TouchableOpacity
                        onPress={handlePressRightArrow}
                        hitSlop={{ top: 15, left: 15, bottom: 15, right: 15 }}
                    >
                        <Image
                            source={assets.icChevronRight24Black}
                            style={styles.rightArrowIcon}
                        />
                    </TouchableOpacity>
                )}
            </View>

            <View style={styles.separator} />
        </TouchableOpacity>
    );
}
AddressWorkFlatListItem.propTypes = {
    item: PropTypes.object,
    onPress: PropTypes.func,
    onPressRightArrow: PropTypes.func,
};

export function AddressFlatListItem({ item, onPress, onPressRightArrow, rightIcon }) {
    function handlePress() {
        onPress(item);
    }

    function handlePressRightArrow() {
        onPressRightArrow(item);
    }

    const description = item?.addressLine1 ? `${item.addressLine1} ${item.city}` : "";

    return (
        <TouchableOpacity onPress={handlePress}>
            <View style={styles.mainContainer}>
                <Image source={assets.iconBlackContactBook} style={styles.leftIcon} />
                <View style={styles.middleContainer}>
                    <View style={styles.titleContainer}>
                        <Typo
                            fontWeight="semi-bold"
                            fontSize={14}
                            textAlign="left"
                            text={item.name}
                        />
                    </View>
                    <Typo
                        numberOfLines={1}
                        fontWeight="normal"
                        fontSize={12}
                        textAlign="left"
                        color={FADE_GREY}
                        text={description}
                    />
                </View>

                {rightIcon && (
                    <TouchableOpacity
                        onPress={handlePressRightArrow}
                        hitSlop={{ top: 15, left: 15, bottom: 15, right: 15 }}
                    >
                        <Image source={rightIcon} style={styles.rightArrowIcon} />
                    </TouchableOpacity>
                )}
            </View>

            <View style={styles.separator} />
        </TouchableOpacity>
    );
}
AddressFlatListItem.propTypes = {
    item: PropTypes.object,
    onPress: PropTypes.func,
    onPressRightArrow: PropTypes.func,
    rightIcon: PropTypes.any,
};

export function LocationFlatListItem({
    iconLeftSource = assets.icon24BlackClock,
    item,
    onPress,
    onPressLocationBookmark,
    isShowBookmark,
}) {
    function handlePress() {
        onPress(item);
    }
    function handlePressBookmark() {
        onPressLocationBookmark(item);
    }
    // console.log("LocationFlatListItem", item);
    const title = item?.addressLine1;
    let description = "";
    if (item?.postcode) {
        // Can try remove the next phase. We controlled locations at the source
        description = `${item?.postcode} ${item?.city} ${item?.state}`;
    }
    return (
        <TouchableOpacity onPress={handlePress}>
            <View style={styles.mainContainer}>
                <Image source={iconLeftSource} style={styles.leftIcon} />
                <View style={styles.middleContainer}>
                    <View style={styles.titleContainer}>
                        <Typo
                            fontWeight="semi-bold"
                            fontSize={14}
                            textAlign="left"
                            text={title}
                            numberOfLines={2}
                        />
                    </View>
                    <Typo
                        numberOfLines={1}
                        fontWeight="normal"
                        fontSize={12}
                        textAlign="left"
                        color={FADE_GREY}
                        text={description}
                    />
                </View>
                {isShowBookmark && (
                    <TouchableOpacity
                        onPress={handlePressBookmark}
                        hitSlop={{ top: 15, left: 15, bottom: 15, right: 15 }}
                    >
                        <Image source={assets.tinyIconBookmark} style={styles.rightArrowIcon} />
                    </TouchableOpacity>
                )}
            </View>

            <View style={styles.separator} />
        </TouchableOpacity>
    );
}
LocationFlatListItem.propTypes = {
    iconLeftSource: PropTypes.any,
    item: PropTypes.object,
    onPress: PropTypes.func,
    onPressLocationBookmark: PropTypes.func,
    isShowBookmark: PropTypes.bool,
};

export function AddNewAddressBtn({ title, onPress }) {
    return (
        <ActionButton
            style={{ width: width - 50 }}
            borderRadius={25}
            onPress={onPress}
            borderWidth={1}
            borderColor="#cfcfcf"
            backgroundColor={WHITE}
            componentCenter={
                <Typo text={title} fontSize={14} fontWeight="semi-bold" lineHeight={18} />
            }
        />
    );
}
AddNewAddressBtn.propTypes = {
    title: PropTypes.string,
    onPress: PropTypes.func,
};

const styles = StyleSheet.create({
    leftIcon: {
        height: 25,
        width: 25,
    },
    mainContainer: {
        alignItems: "center",
        flexDirection: "row",
        height: 73,
        paddingLeft: 24,
        paddingRight: 26,
    },
    middleContainer: { flex: 1, flexDirection: "column", marginHorizontal: 15 },
    rightArrowIcon: {
        height: 20,
        width: 20,
    },
    separator: { backgroundColor: LIGHT_GREY, height: 1, marginHorizontal: 24 },
    titleContainer: {
        alignItems: "flex-end",
        flexDirection: "row",
        marginBottom: 5,
    },
});
