import PropTypes from "prop-types";
import React, { useState, useRef, useEffect } from "react";
import {
    StyleSheet,
    View,
    Dimensions,
    ActivityIndicator,
    Animated,
    Platform,
    StatusBar,
} from "react-native";
import { TapGestureHandler } from "react-native-gesture-handler";
import ImageViewer from "react-native-image-zoom-viewer";
import { useSafeArea } from "react-native-safe-area-context";

import HeaderCloseButton from "@components/Buttons/HeaderCloseButton";
import { BlurView } from "@components/Common/BlurView";
import Typo from "@components/Text";

import { WHITE, OFF_WHITE } from "@constants/colors";

import Assets from "@assets";

const screenHeight =
    Platform.OS === "android" && Platform.Version > 26
        ? Dimensions.get("screen").height - StatusBar.currentHeight
        : Dimensions.get("window").height;

function UnitTypeSwiper({ showModal, onClose, initialIndex, data = [] }) {
    const safeAreaInsets = useSafeArea();

    const [images, setImages] = useState([]);

    // Animation Refs
    const containerTranslateYAnimationValue = useRef(new Animated.Value(0)).current;
    const opacityAnimationValue = useRef(new Animated.Value(0)).current;

    // UI Dimensions
    const headerHeight = safeAreaInsets.top > 0 ? safeAreaInsets.top + 40 : 70;
    const footerHeight = safeAreaInsets.bottom > 0 ? safeAreaInsets.bottom + 20 : 50;

    // UI state mgmt
    const [title, setTitle] = useState(data?.[initialIndex]?.name ?? "");
    const [renderSwiper, setRenderSwiper] = useState(false);
    const [activeIndex, setActiveIndex] = useState(initialIndex);

    useEffect(() => {
        updateImagesArray();
    }, [data]);

    useEffect(() => {
        setTitle(data?.[initialIndex]?.name ?? "");

        if (showModal) {
            Animated.sequence([
                Animated.timing(containerTranslateYAnimationValue, {
                    toValue: screenHeight,
                    duration: 1,
                    useNativeDriver: true,
                }),
                Animated.timing(opacityAnimationValue, {
                    toValue: 1,
                    duration: 500,
                    useNativeDriver: true,
                }),
            ]).start();

            // Delay added because on iOS the images are not rendering initially after animation
            setTimeout(
                () => {
                    setRenderSwiper(true);
                },
                Platform.OS === "ios" ? 100 : 0
            );
        } else {
            setRenderSwiper(false);

            Animated.sequence([
                Animated.timing(opacityAnimationValue, {
                    toValue: 0,
                    duration: 500,
                    useNativeDriver: true,
                }),
                Animated.timing(containerTranslateYAnimationValue, {
                    toValue: 0,
                    duration: 1,
                    useNativeDriver: true,
                }),
            ]).start();
        }
    }, [showModal]);

    useEffect(() => {
        setActiveIndex(initialIndex);
    }, [initialIndex]);

    const updateImagesArray = () => {
        //const imageWidth = Dimensions.get("window").width;
        //const imageHeight = imageWidth + 100;

        const imagesArray = data?.map((item) => {
            return {
                url: item?.image_url ?? null,
                props: {
                    resizeMode: "contain",
                    resizeMethod: "resize",
                },
            };
        });
        setImages(imagesArray);
    };

    const onIndexChanged = (index) => {
        setTitle(data?.[index]?.name);
    };

    const loadingRender = () => {
        return <ActivityIndicator style={Style.indicator} size="small" color={OFF_WHITE} />;
    };

    return (
        <Animated.View
            style={[
                Style.blurOverlay(screenHeight),
                {
                    transform: [
                        {
                            translateY: containerTranslateYAnimationValue,
                        },
                    ],
                    opacity: opacityAnimationValue,
                },
            ]}
            useNativeDriver
        >
            <BlurView style={Style.blurOverlay(screenHeight)}>
                <></>
            </BlurView>

            <View style={Style.container(safeAreaInsets.top, safeAreaInsets.bottom)}>
                <TapGestureHandler onHandlerStateChange={onClose}>
                    <View style={Style.headerContainer(safeAreaInsets.top, headerHeight)}>
                        <View style={Style.headerSmallElement} />
                        <View style={Style.headerMainElement}>
                            <Typo
                                fontSize={16}
                                fontWeight="600"
                                lineHeight={19}
                                text={title}
                                color={WHITE}
                            />
                        </View>
                        <View style={Style.headerSmallElement}>
                            <HeaderCloseButton isWhite={true} onPress={onClose} />
                        </View>
                    </View>
                </TapGestureHandler>

                {renderSwiper && (
                    <View style={Style.mainContainer}>
                        {images && images.length > 0 && (
                            <ImageViewer
                                style={Style.imgContainer}
                                imageUrls={images}
                                index={activeIndex}
                                onChange={onIndexChanged}
                                loadingRender={loadingRender}
                                backgroundColor="transparent"
                                failImageSource={{ url: Assets.propertyIconColor }}
                                useNativeDriver={true}
                                renderIndicator={() => <></>}
                                menus={() => null}
                            />
                        )}
                    </View>
                )}

                <TapGestureHandler onHandlerStateChange={onClose}>
                    <View style={Style.footerContainer(footerHeight)} />
                </TapGestureHandler>
            </View>
        </Animated.View>
    );
}

UnitTypeSwiper.propTypes = {
    showModal: PropTypes.bool,
    onClose: PropTypes.func,
    initialIndex: PropTypes.number,
    data: PropTypes.array,
};

const Style = StyleSheet.create({
    blurOverlay: (screenHeight) => ({
        backgroundColor: "transparent",
        height: screenHeight,
        bottom: 0,
        left: 0,
        position: "absolute",
        right: 0,
        top: -screenHeight,
    }),

    container: (top, bottom) => ({
        flex: 1,
        position: "absolute",
        left: 0,
        right: 0,
        top,
        bottom,
    }),

    footerContainer: (height) => ({
        height: height,
    }),

    headerContainer: (paddingTop, height) => ({
        alignItems: "center",
        flexDirection: "row",
        justifyContent: "space-between",
        paddingHorizontal: 16,
        width: "100%",
        zIndex: 1,
        // paddingTop,
        height,
    }),

    headerMainElement: {
        flex: 1,
    },

    headerSmallElement: {
        alignItems: "center",
        height: 45,
        justifyContent: "center",
        width: 45,
    },

    indicator: {
        bottom: 0,
        left: 0,
        position: "absolute",
        right: 0,
        top: 0,
    },

    mainContainer: {
        flex: 1,
    },

    imgContainer: {
        flex: 1,
        justifyContent: "center",
    },
});

export default UnitTypeSwiper;
