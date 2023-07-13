/* eslint-disable react-hooks/exhaustive-deps */

/* eslint-disable react/jsx-no-bind */
import { CacheeImage } from "cachee";
import PropTypes from "prop-types";
import React, { useState, useRef, useCallback, useMemo, useEffect } from "react";
import {
    StyleSheet,
    View,
    TouchableOpacity,
    Animated,
    Image,
    Platform,
    Dimensions,
    ActivityIndicator,
} from "react-native";

import ActionButton from "@components/Buttons/ActionButton";
import Typo from "@components/Text";

import { WHITE, FADE_GREY, GREY, YELLOW, OFF_WHITE, LOADER_DARK_GRAY } from "@constants/colors";
import { SELECT_PROPERTY, APDL_TAG, REACHED_END_OF_LIST } from "@constants/strings";

import { getShadow } from "@utils/dataModel/utility";

import Assets from "@assets";

import BookmarkIcon from "./BookmarkIcon";
import LoadingPropertyTile from "./LoadingPropertyTile";

const screenWidth = Dimensions.get("window").width;
const dynamicDimension = (screenWidth * 12) / 100;
const dynamicDimensionHalf = dynamicDimension / 2;
const indicatorDelay = 500; // milliseconds

function PropertyTile({
    data,
    isLastItem,
    token,
    lastItemPadding,
    isLastPage,
    isSkeletonTile,
    onPress,
    selectable,
    onSelectProperty,
    onPressBookmark,
    onPressInfo,
    isBookmarked,
    onBookmarkError,
    onBookmarkDone,
    isSimplified,
}) {
    const [defaultPropImage, setDefaultPropImage] = useState(false);
    const [imgLoaded, setImgLoaded] = useState(false);

    const priceRange = data?.price_range ?? "";
    const propertyName = data?.property_name ?? "";
    const location = data?.area ?? null;
    const propertySize = data?.size ?? null;
    const imagesArray = data?.images ?? [];
    const buildingsArray = data?.buildings ?? [];
    const propImg = imagesArray.length ? imagesArray[0].url : "";
    const developerInfo = data?.developer ?? [];
    const developerInfoTrimmed = developerInfo.slice(0, 5); // Trim down to max 5 as per design requirement
    const isFeatured = data?.is_featured ?? false;
    const apdl = data?.apdl ?? false;
    const [propertyType, setPropertyType] = useState(null);
    const [propertyTypeIcon, setPropertyTypeIcon] = useState(Assets.landedBuilding);
    const highRiseIconIds = ["6", "7", "8", "14", "15", "16", "17", "18"];

    useEffect(() => {
        // Reset/Clean up state before unmount
        return () => {
            setDefaultPropImage(true);
            setImgLoaded(true);
        };
    }, []);

    // Used to set Property Type based on buildingsArray
    useEffect(() => {
        const count = buildingsArray.length;
        if (count === 1) {
            const buildingId = buildingsArray[0]?.building_id ?? "";
            const isHighRise = highRiseIconIds.indexOf(buildingId) !== -1;

            setPropertyType(buildingsArray[0]?.name ?? "");
            setPropertyTypeIcon(isHighRise ? Assets.highRiseBuilding : Assets.landedBuilding);
        } else {
            setPropertyType("Multiple Property Types");
        }
    }, [buildingsArray, highRiseIconIds]);

    const imageAnimated = useRef(new Animated.Value(0)).current;

    const onPropImgLoadError = useCallback(() => {
        setTimeout(() => {
            setImgLoaded(true);
            setDefaultPropImage(true);
        }, indicatorDelay);
    }, []);

    const onPropImgLoad = useCallback(() => {
        setTimeout(() => {
            setImgLoaded(true);
            Animated.timing(imageAnimated, {
                toValue: 1,
                duration: 500,
                useNativeDriver: true,
            }).start();
        }, indicatorDelay);
    }, []);

    const onTilePress = () => {
        if (onPress) onPress(data);
    };

    const onInfoSelect = () => {
        onPressInfo?.(data);
    };

    function onSelectPress() {
        if (onSelectProperty) onSelectProperty(data);
    }

    // Developer Logos Component
    const developerLogos = useMemo(() => {
        return developerInfoTrimmed.map((item, index) => {
            return (
                <DeveloperLogo
                    key={index}
                    logo={item.logo}
                    token={token}
                    style={Style.developerLogo(index)}
                />
            );
        });
    }, [developerInfoTrimmed]);

    return (
        <View style={[Platform.OS === "ios" ? Style.shadow : {}, Style.container]}>
            {isLastItem && isSkeletonTile && !isLastPage && !isSimplified ? (
                <View>
                    <TouchableOpacity
                        style={[Platform.OS === "ios" ? {} : Style.shadow, Style.subContainer()]}
                        activeOpacity={0.8}
                        onPress={onTilePress}
                    >
                        {/* Property Image */}
                        <View style={Style.imageContainer}>
                            {defaultPropImage ? (
                                <View style={Style.defaultImgCont}>
                                    <Image
                                        source={Assets.propertyIconColor}
                                        style={Style.defaultImgCls}
                                    />
                                </View>
                            ) : (
                                <CacheeImage
                                    source={{
                                        uri: propImg,
                                        headers: {
                                            Authorization: token,
                                        },
                                    }}
                                    style={Style.propImgCls}
                                    onLoad={onPropImgLoad}
                                    onError={onPropImgLoadError}
                                    useNativeDriver
                                />
                            )}

                            {/* Featured */}
                            {isFeatured && (
                                <View style={Style.featuredCont}>
                                    <Typo
                                        fontSize={14}
                                        lineHeight={18}
                                        fontWeight="600"
                                        text="Featured"
                                    />
                                </View>
                            )}

                            {!imgLoaded && (
                                <ActivityIndicator
                                    size="small"
                                    style={Style.indicator}
                                    color={OFF_WHITE}
                                />
                            )}
                        </View>

                        {/* Developer Logo & Bookmark Icon Container */}
                        <View style={Style.logosContainer(dynamicDimension, dynamicDimensionHalf)}>
                            {developerLogos}

                            {/* Horizontal Spacer */}
                            <View style={Style.defaultFlex} />

                            {/* Bookmark Icon */}
                            <BookmarkIcon
                                data={data}
                                onPressBookmark={onPressBookmark}
                                isBookmarked={isBookmarked}
                                onBookmarkError={onBookmarkError}
                                onBookmarkDone={onBookmarkDone}
                            />
                        </View>

                        {/* Property details */}
                        <View style={Style.contentContainer}>
                            <Typo fontSize={12} lineHeight={15} text="From" color={FADE_GREY} />

                            {/* Price Range */}
                            <Typo
                                fontSize={16}
                                lineHeight={19}
                                fontWeight="600"
                                text={priceRange}
                                style={Style.priceRange}
                            />

                            {/* Property Name */}
                            <View style={Style.propertyNameContainer}>
                                <Typo
                                    lineHeight={18}
                                    fontWeight="600"
                                    textAlign="left"
                                    numberOfLines={1}
                                    text={propertyName}
                                    style={Style.propertyNameCls}
                                />
                                {!apdl && (
                                    <Typo
                                        fontSize={12}
                                        lineHeight={15}
                                        textAlign="left"
                                        text={APDL_TAG}
                                        color={FADE_GREY}
                                        style={Style.apdl}
                                    />
                                )}
                            </View>
                            {/* Location */}
                            {location && (
                                <IconContent icon={Assets.iconGreyLocation} content={location} />
                            )}

                            {/* Property Type */}
                            {propertyType && propertyTypeIcon && (
                                <IconContent icon={propertyTypeIcon} content={propertyType} />
                            )}

                            {/* Property Area Size */}
                            {propertySize && (
                                <IconContent icon={Assets.iconGreySqf} content={propertySize} />
                            )}

                            {/* Bottom button container */}
                            {selectable && (
                                <View style={Style.bottomBtnContainer}>
                                    {/* Info button */}
                                    <ActionButton
                                        width={120}
                                        backgroundColor={WHITE}
                                        borderStyle="solid"
                                        borderWidth={1}
                                        borderColor={GREY}
                                        componentCenter={
                                            <Typo fontWeight="600" lineHeight={18} text="Info" />
                                        }
                                        onPress={onInfoSelect}
                                    />

                                    {/* Select property button */}
                                    <ActionButton
                                        width={160}
                                        backgroundColor={YELLOW}
                                        componentCenter={
                                            <Typo
                                                fontWeight="600"
                                                lineHeight={18}
                                                text={SELECT_PROPERTY}
                                            />
                                        }
                                        onPress={onSelectPress}
                                    />
                                </View>
                            )}
                        </View>
                    </TouchableOpacity>

                    {/* Skeleton Tile */}
                    <View
                        style={[
                            Style.shadow,
                            Style.subContainer(isLastItem && lastItemPadding ? 50 : 0),
                        ]}
                        activeOpacity={0.5}
                    >
                        {/* Property Image */}
                        <LoadingPropertyTile key={0} />
                    </View>
                </View>
            ) : (
                <View>
                    <TouchableOpacity
                        style={[
                            Platform.OS === "ios" ? {} : Style.shadow,
                            Style.subContainer(isLastItem && lastItemPadding ? 50 : 0),
                        ]}
                        activeOpacity={0.8}
                        onPress={onTilePress}
                    >
                        {/* Property Image */}
                        <View style={isSimplified ? Style.imageContainerSim : Style.imageContainer}>
                            {defaultPropImage ? (
                                <View style={Style.defaultImgCont}>
                                    {!isSimplified && (
                                        <Image
                                            source={Assets.propertyIconColor}
                                            style={Style.defaultImgCls}
                                        />
                                    )}
                                </View>
                            ) : (
                                <>
                                    {!isSimplified && (
                                        <CacheeImage
                                            source={{
                                                uri: propImg,
                                                headers: {
                                                    Authorization: token,
                                                },
                                            }}
                                            style={Style.propImgCls}
                                            onLoad={onPropImgLoad}
                                            onError={onPropImgLoadError}
                                            useNativeDriver
                                        />
                                    )}
                                </>
                            )}

                            {/* Featured */}
                            {isFeatured && (
                                <View style={Style.featuredCont}>
                                    <Typo
                                        fontSize={14}
                                        lineHeight={18}
                                        fontWeight="600"
                                        text="Featured"
                                    />
                                </View>
                            )}

                            {!imgLoaded && (
                                <ActivityIndicator
                                    size="small"
                                    style={Style.indicator}
                                    color={OFF_WHITE}
                                />
                            )}
                        </View>

                        {/* Developer Logo & Bookmark Icon Container */}
                        <View style={Style.logosContainer(dynamicDimension, dynamicDimensionHalf)}>
                            {developerLogos}

                            {/* Horizontal Spacer */}
                            <View style={Style.defaultFlex} />

                            {/* Bookmark Icon */}
                            {!isSimplified && (
                                <BookmarkIcon
                                    data={data}
                                    onPressBookmark={onPressBookmark}
                                    isBookmarked={isBookmarked}
                                    onBookmarkError={onBookmarkError}
                                    onBookmarkDone={onBookmarkDone}
                                />
                            )}
                        </View>

                        {/* Property details */}
                        <View style={Style.contentContainer}>
                            <Typo fontSize={12} lineHeight={15} text="From" color={FADE_GREY} />

                            {/* Price Range */}
                            <Typo
                                fontSize={16}
                                lineHeight={19}
                                fontWeight="600"
                                text={priceRange}
                                style={Style.priceRange}
                            />

                            {/* Property Name */}
                            <View
                                style={
                                    isSimplified
                                        ? propertyName.length > 15
                                            ? Style.propertyNameContainerForSimplified("wrap")
                                            : Style.propertyNameContainerForSimplified("nowrap")
                                        : Style.propertyNameContainer
                                }
                            >
                                <Typo
                                    lineHeight={18}
                                    fontWeight="600"
                                    textAlign="left"
                                    numberOfLines={isSimplified ? 0 : 1}
                                    text={propertyName}
                                    style={Style.propertyNameCls}
                                />

                                {!apdl && (
                                    <Typo
                                        fontSize={12}
                                        lineHeight={15}
                                        textAlign="left"
                                        text={APDL_TAG}
                                        color={FADE_GREY}
                                        style={Style.apdl}
                                    />
                                )}
                            </View>
                            {/* Location */}
                            {!isSimplified && location && (
                                <IconContent icon={Assets.iconGreyLocation} content={location} />
                            )}

                            {/* Property Type */}
                            {propertyType && propertyTypeIcon && (
                                <IconContent icon={propertyTypeIcon} content={propertyType} />
                            )}

                            {/* Property Area Size */}
                            {!isSimplified && propertySize && (
                                <IconContent icon={Assets.iconGreySqf} content={propertySize} />
                            )}

                            {/* Bottom button container */}
                            {selectable && (
                                <View style={Style.bottomBtnContainer}>
                                    {/* Info button */}
                                    <ActionButton
                                        width={120}
                                        backgroundColor={WHITE}
                                        borderStyle="solid"
                                        borderWidth={1}
                                        borderColor={GREY}
                                        componentCenter={
                                            <Typo fontWeight="600" lineHeight={18} text="Info" />
                                        }
                                        onPress={onInfoSelect}
                                    />

                                    {/* Select property button */}
                                    <ActionButton
                                        width={160}
                                        backgroundColor={YELLOW}
                                        componentCenter={
                                            <Typo
                                                fontWeight="600"
                                                lineHeight={18}
                                                text={SELECT_PROPERTY}
                                            />
                                        }
                                        onPress={onSelectPress}
                                    />
                                </View>
                            )}
                        </View>
                    </TouchableOpacity>

                    {isLastItem && isLastPage ? (
                        <View style={Style.endlistCheckMarkContainer}>
                            <Image
                                source={Assets.reachedEnd}
                                style={[Style.defaultImgCls, Style.marginBottom]}
                            />
                            <Typo
                                fontSize={14}
                                lineHeight={18}
                                fontWeight="600"
                                color={FADE_GREY}
                                text={REACHED_END_OF_LIST}
                            />
                        </View>
                    ) : null}
                </View>
            )}
        </View>
    );
}

const IconContent = ({ icon, content }) => {
    return (
        <View style={Style.iconContentContainer}>
            <CacheeImage style={Style.iconCls} source={icon} />
            <Typo fontSize={12} lineHeight={18} text={content} color={FADE_GREY} />
        </View>
    );
};

IconContent.propTypes = {
    icon: PropTypes.string,
    content: PropTypes.string,
};

const DeveloperLogo = ({ logo, token, style = {} }) => {
    const [useDefault, setUseDefault] = useState(false);
    const [imgLoaded, setImgLoaded] = useState(false);
    const logoAnimated = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        // Reset/Clean up state before unmount
        return () => {
            setUseDefault(true);
            setImgLoaded(true);
        };
    }, []);

    const onDevLogoLoad = useCallback(() => {
        setTimeout(() => {
            setImgLoaded(true);
            Animated.timing(logoAnimated, {
                toValue: 1,
                duration: 1000,
                useNativeDriver: true,
            }).start();
        }, indicatorDelay);
    }, [logo]);

    const onDevLogoLoadError = useCallback(() => {
        setTimeout(() => {
            setImgLoaded(true);
            setUseDefault(true);
        }, indicatorDelay);
    }, [logo]);

    return (
        <View style={Platform.OS === "ios" ? Style.shadow : {}}>
            <View
                style={[
                    Platform.OS === "ios" ? {} : Style.shadow,
                    Style.devLogoCont(dynamicDimension),
                    style,
                ]}
            >
                {!imgLoaded && (
                    <ActivityIndicator size="small" style={Style.indicator} color={GREY} />
                )}

                {useDefault ? (
                    <View style={Style.defaultImgCont}>
                        <Image
                            style={Style.defaultDevLogoIcon(dynamicDimensionHalf)}
                            source={Assets.propertyIconColor}
                        />
                    </View>
                ) : (
                    <Animated.Image
                        source={{
                            uri: logo,
                            headers: {
                                Authorization: token,
                            },
                        }}
                        style={[Style.developerLogoImg, { opacity: logoAnimated }]}
                        onLoad={onDevLogoLoad}
                        onError={onDevLogoLoadError}
                        useNativeDriver
                    />
                )}
            </View>
        </View>
    );
};

DeveloperLogo.propTypes = {
    logo: PropTypes.string,
    token: PropTypes.string,
    style: PropTypes.object,
};
PropertyTile.defaultProps = {
    data: {},
    isLastItem: false,
    lastItemPadding: false,
    selectable: false,
    onPressBookmark: () => {},
};

PropertyTile.propTypes = {
    data: PropTypes.object,
    isLastItem: PropTypes.bool,
    token: PropTypes.string,
    lastItemPadding: PropTypes.bool,
    isLastPage: PropTypes.bool,
    isSkeletonTile: PropTypes.bool,
    onPress: PropTypes.func,
    selectable: PropTypes.bool,
    onSelectProperty: PropTypes.func,
    onPressBookmark: PropTypes.func,
    onPressInfo: PropTypes.func,
    isBookmarked: PropTypes.bool,
    onBookmarkError: PropTypes.func,
    onBookmarkDone: PropTypes.func,
    isSimplified: PropTypes.bool,
};

const Style = StyleSheet.create({
    apdl: {
        paddingTop: 2,
    },

    bottomBtnContainer: {
        flexDirection: "row",
        flexWrap: "nowrap",
        justifyContent: "space-around",
        marginTop: 25,
        width: "100%",
    },

    container: {
        paddingBottom: 0,
    },

    contentContainer: {
        alignItems: "flex-start",
        paddingHorizontal: 15,
        paddingVertical: 20,
    },

    defaultDevLogoIcon: (dimensionHalf) => ({
        height: dimensionHalf,
        width: dimensionHalf,
    }),

    defaultFlex: {
        flex: 1,
    },

    defaultImgCls: {
        height: 70,
        width: 70,
    },

    defaultImgCont: {
        alignItems: "center",
        flex: 1,
        justifyContent: "center",
    },

    devLogoCont: (dimension) => ({
        height: dimension,
        width: dimension,
        borderRadius: dimension / 2,
        alignItems: "center",
        justifyContent: "center",
        overflow: "hidden",
        marginRight: 5,
        backgroundColor: WHITE,
        padding: 4,
    }),

    developerLogo: (index) => ({
        marginLeft: index === 0 ? 15 : 0,
    }),

    developerLogoImg: {
        height: "100%",
        resizeMode: "center",
        width: "100%",
    },

    endlistCheckMarkContainer: {
        alignItems: "center",
        flex: 1,
        justifyContent: "center",
        padding: 25,
    },

    featuredCont: {
        alignItems: "center",
        backgroundColor: YELLOW,
        borderRadius: 8,
        height: 26,
        justifyContent: "center",
        left: 12,
        position: "absolute",
        top: 12,
        width: 100,
    },

    iconCls: {
        height: 16,
        marginRight: 8,
        width: 16,
    },

    iconContentContainer: {
        flexDirection: "row",
        marginTop: 7,
    },

    imageContainer: {
        backgroundColor: LOADER_DARK_GRAY,
        height: 205,
    },

    imageContainerSim: {
        height: 20,
        paddingTop: 35,
    },

    indicator: {
        bottom: 0,
        left: 0,
        position: "absolute",
        right: 0,
        top: 0,
    },

    logosContainer: (dimension, dimensionHalf) => ({
        height: dimension + 14,
        alignItems: "center",
        marginTop: -(dimensionHalf + 7),
        flexDirection: "row",
        flex: 1,
    }),

    marginBottom: {
        marginBottom: 15,
    },

    priceRange: {
        marginTop: 3,
    },

    propImgCls: {
        height: "100%",
        width: "100%",
    },

    propertyNameCls: {
        paddingBottom: 6,
        paddingRight: 6,
    },

    propertyNameContainer: {
        marginTop: 15,
    },

    propertyNameContainerForSimplified: (flexWrap) => ({
        flexDirection: "row",
        flexWrap,
        marginTop: 15,
    }),

    shadow: {
        ...getShadow({
            elevation: 8,
        }),
    },

    subContainer: (marginBottom) => ({
        backgroundColor: WHITE,
        borderRadius: 8,
        marginHorizontal: 24,
        marginTop: 20,
        overflow: "hidden",
        marginBottom,
    }),
});

// const Memoiz = React.memo(PropertyTile);
// export default Memoiz;

export default PropertyTile;
