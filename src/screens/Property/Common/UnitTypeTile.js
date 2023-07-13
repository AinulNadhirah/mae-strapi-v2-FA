/* eslint-disable react/jsx-no-bind */
import { CacheeImage } from "cachee";
import PropTypes from "prop-types";
import React, { useState, useRef, useCallback } from "react";
import {
    StyleSheet,
    Image,
    TouchableOpacity,
    View,
    Animated,
    ActivityIndicator,
} from "react-native";

import Typo from "@components/Text";

import { DARK_GREY, WHITE, SHADOW_LIGHT, OFF_WHITE } from "@constants/colors";

import Assets from "@assets";

const INDICATOR_DELAY = 500;

function UnitTypeTile({ data, onPress, index, selectedItem, isSimplified }) {
    const [imgLoaded, setImgLoaded] = useState(false);
    const [defaultImage, setDefaultImage] = useState(false);

    const imageAnimated = useRef(new Animated.Value(0)).current;
    const image = data?.image_url ?? null;

    const selectedUnitID = selectedItem?.unit_id ?? "";
    const isSelected = selectedUnitID === data.unit_id;

    const onImgLoadError = useCallback(() => {
        console.log("[UnitTypeTile] >> [onImgLoadError]");

        setTimeout(() => {
            setImgLoaded(true);
            setDefaultImage(true);
        }, INDICATOR_DELAY);
    }, []);

    const onImgLoad = useCallback(() => {
        setTimeout(() => {
            setImgLoaded(true);
            Animated.timing(imageAnimated, {
                toValue: 1,
                duration: 500,
                useNativeDriver: true,
            }).start();
        }, INDICATOR_DELAY);
    }, [imageAnimated]);

    const onTilePress = () => {
        if (onPress) onPress(data, index);
    };

    return (
        <TouchableOpacity
            style={[Style.unitTypeTileCls(isSimplified ? "100%" : 240), Style.unitTypeTileSpacing]}
            activeOpacity={0.8}
            onPress={onTilePress}
        >
            {/* Type Name */}
            <Typo fontSize={12} lineHeight={18} fontWeight="600" text={data.name} />

            {/* Image */}
            {!isSimplified && (
                <View style={Style.unitTypeImgCont}>
                    {defaultImage ? (
                        <View style={Style.unitTypeDefaultImgCont}>
                            <Image
                                style={Style.unitTypeDefaultImgCls}
                                source={Assets.propertyIconColor}
                            />
                        </View>
                    ) : (
                        <CacheeImage
                            source={{ uri: image }}
                            style={Style.unitItemImg}
                            onLoad={onImgLoad}
                            onError={onImgLoadError}
                            useNativeDriver
                        />
                    )}

                    {!imgLoaded && (
                        <ActivityIndicator size="small" style={Style.indicator} color={OFF_WHITE} />
                    )}
                </View>
            )}

            {/* Price Range */}
            <Typo
                fontSize={14}
                lineHeight={18}
                fontWeight="600"
                text={data.priceRange}
                style={Style.marginTop}
            />

            {/* Unit Details */}
            {!isSimplified && (
                <View style={Style.unitTypeDetailsSection}>
                    <SetUnitTypeSubDetail
                        text={data?.bedroom_count}
                        icon={Assets.iconGreyBedroom}
                    />
                    <SetUnitTypeSubDetail
                        text={data?.bathroom_count}
                        icon={Assets.iconGreyBathroom}
                    />
                    <SetUnitTypeSubDetail text={data?.carPark} icon={Assets.iconGreyParking} />
                    <SetUnitTypeSubDetail text={data?.size} icon={Assets.iconGreyFloorPlan} />
                </View>
            )}

            {/* Tick Icon */}
            {isSelected && (
                <Image
                    accessibilityId={"tickImage"}
                    testID={"tickImage"}
                    style={Style.tickImage}
                    source={Assets.tickIcon}
                />
            )}
        </TouchableOpacity>
    );
}

UnitTypeTile.propTypes = {
    data: PropTypes.object,
    onPress: PropTypes.func,
    index: PropTypes.number,
    selectedItem: PropTypes.object,
    isSimplified: PropTypes.bool,
};

UnitTypeTile.defaultProps = {
    selectedItem: {},
};

const SetUnitTypeSubDetail = ({ text, icon }) => {
    return (
        <View style={Style.metaUnitSubDetail}>
            <Image style={Style.metaUnitSubDetailIconCls} source={icon}></Image>
            <Typo
                fontSize={10}
                fontWeight="normal"
                textAlign="left"
                color={DARK_GREY}
                text={text}
            />
        </View>
    );
};

SetUnitTypeSubDetail.propTypes = {
    text: PropTypes.string,
    icon: PropTypes.number,
};

const Style = StyleSheet.create({
    indicator: {
        bottom: 0,
        left: 0,
        position: "absolute",
        right: 0,
        top: 0,
    },

    marginTop: {
        marginTop: 5,
    },

    metaUnitSubDetail: {
        alignItems: "center",
        flexDirection: "row",
        marginTop: 8,
        paddingHorizontal: 8,
        paddingVertical: 4,
        width: "50%",
    },
    metaUnitSubDetailIconCls: {
        height: 24,
        marginRight: 5,
        width: 24,
    },

    tickImage: {
        height: 20,
        width: 20,
    },

    unitItemImg: {
        height: "100%",
        resizeMode: "contain",
        width: "100%",
    },

    unitTypeDefaultImgCls: {
        height: 50,
        width: 50,
    },

    unitTypeDefaultImgCont: {
        alignItems: "center",
        flex: 1,
        justifyContent: "center",
    },

    unitTypeDetailsSection: {
        flexDirection: "row",
        flexWrap: "wrap",
        marginTop: 15,
    },

    unitTypeImgCont: {
        height: 208,
        marginBottom: 4,
        marginTop: 8,
        width: 160,
    },

    unitTypeTileCls: (fullWidth) => ({
        alignItems: "center",
        backgroundColor: WHITE,
        borderRadius: 8,
        elevation: 8,
        justifyContent: "center",
        marginRight: 12,
        padding: 16,
        shadowColor: SHADOW_LIGHT,
        shadowOffset: {
            width: 0,
            height: 5,
        },
        shadowOpacity: 1,
        shadowRadius: 15,
        width: fullWidth,
    }),

    unitTypeTileSpacing: {
        marginTop: 15,
        padding: 20,
    },
});

export default UnitTypeTile;
