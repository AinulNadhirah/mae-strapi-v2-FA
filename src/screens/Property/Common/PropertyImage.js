import PropTypes from "prop-types";
import { StyleSheet, View, Image, Animated, ActivityIndicator } from 'react-native';
import React, { useState, useRef, useCallback, useEffect } from 'react';
import * as Animatable from "react-native-animatable";

import { LOADER_DARK_GRAY, OFF_WHITE } from "@constants/colors";
import Assets from "@assets";

const INDICATOR_DELAY = 500;

function PropertyImage({ url, index }) {
    const [imgLoaded, setImgLoaded] = useState(false);
    const [defaultImage, setDefaultImage] = useState(false);

    const imageAnimated = useRef(new Animated.Value(0)).current;
    const image = url ?? null;

    useEffect(
        () => {
          return () => {
            clearTimeout(onImgLoad);
            clearTimeout(onImgLoadError);
          };
        },
        []
      );

    const onImgLoadError = useCallback(
        (error) => {
            console.log("[PropertyDetails][PropertyImage] >> [onImgLoadError]", error);
            setTimeout(() => {
                setImgLoaded(true);
                setDefaultImage(true);
            }, INDICATOR_DELAY);
        },
        [image]
    );

    const onImgLoad = useCallback(() => {
        setTimeout(() => {
            setImgLoaded(true);
            Animated.timing(imageAnimated, {
                toValue: 1,
                duration: 500,
                useNativeDriver: true,
            }).start();
        }, INDICATOR_DELAY);
    }, [image]);

    return (
        <View style={styles.swiperItem} key={`intro-${index}`}>
            {defaultImage 
            ? (
                <View style={styles.unitTypeDefaultImgCont}>
                    <Image style={styles.unitTypeDefaultImgCls} source={Assets.propertyIconColor} />
                </View>
            ) 
            : (
                <Animatable.Image
                    animation="fadeInUp"
                    duration={300}
                    source={{ uri: image }}
                    style={styles.propertyBannerCls}
                    resizeMode="cover"
                    onLoad={onImgLoad}
                    onError={onImgLoadError}
                    useNativeDriver
                />
            )}

            {!imgLoaded && (
                <ActivityIndicator size="small" style={styles.indicator} color={OFF_WHITE} />
            )}
        </View>
    );
}

PropertyImage.propTypes = {
    url: PropTypes.string,
    index: PropTypes.number,
};

const styles = StyleSheet.create({
    swiperItem: {
        backgroundColor: LOADER_DARK_GRAY,
        flex: 1,
    },
    unitTypeDefaultImgCont: {
        alignItems: "center",
        flex: 1,
        justifyContent: "center",
    },
    unitTypeDefaultImgCls: {
        height: 50,
        width: 50,
    },
    propertyBannerCls: {
        height: "100%",
        width: "100%",
    },
});

export default PropertyImage;
