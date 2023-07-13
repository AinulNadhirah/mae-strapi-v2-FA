import PropTypes from "prop-types";
import { StyleSheet, View, Image, Animated, ActivityIndicator } from 'react-native';
import React, { useState, useRef, useCallback, useEffect } from 'react';
import Typo from "@components/Text";

import { OFF_WHITE, WHITE, SHADOW } from "@constants/colors";
import Assets from "@assets";

const INDICATOR_DELAY = 500;

const DeveloperRow = ({ data, index }) => {
    const [imgLoaded, setImgLoaded] = useState(false);
    const [defaultImage, setDefaultImage] = useState(false);

    const imageAnimated = useRef(new Animated.Value(0)).current;
    const image = data?.logo ?? null;

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
            console.log("[PropertyDetails][Developer Icon] >> [onImgLoadError]", error);
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
        <View style={styles.developerItemCls} key={index}>
            <View style={styles.developerContainer}>
                <View style={styles.developerInner}>
                    {/* Image */}
                    {defaultImage 
                    ? (
                        <View style={styles.unitTypeDefaultImgCont}>
                            <Image
                                style={styles.developerDefaultImg}
                                source={Assets.propertyIconColor}
                            />
                        </View>
                    ) 
                    : (
                        <Animated.Image
                            source={{ uri: image }}
                            style={styles.developerLogo}
                            onLoad={onImgLoad}
                            onError={onImgLoadError}
                            useNativeDriver
                        />
                    )}

                    {!imgLoaded && (
                        <ActivityIndicator
                            size="small"
                            style={styles.indicator}
                            color={OFF_WHITE}
                        />
                    )}
                </View>
            </View>

            {/* right fields - developer name and child developer */}
            <View style={styles.developerDetailsCls}>
                <Typo
                    fontSize={14}
                    lineHeight={18}
                    fontWeight="600"
                    textAlign="left"
                    text={data?.name}
                    ellipsizeMode="tail"
                    numberOfLines={1}
                />
                <Typo
                    fontSize={14}
                    lineHeight={20}
                    textAlign="left"
                    text={data?.child_developer}
                    style={styles.headerNameCls}
                    ellipsizeMode="tail"
                    numberOfLines={2}
                />
            </View>
        </View>
    );
};

DeveloperRow.propTypes = {
    data: PropTypes.object,
    index: PropTypes.number,
};

const styles = StyleSheet.create({
    developerContainer: {
        alignItems: "center",
        backgroundColor: WHITE,
        borderRadius: 30,
        elevation: 12,
        height: 60,
        justifyContent: "center",
        marginRight: 30,
        shadowColor: SHADOW,
        shadowOffset: {
            width: 0,
            height: 6,
        },
        shadowOpacity: 1,
        shadowRadius: 15,
        width: 60,
    },

    developerDefaultImg: {
        height: 30,
        width: 30,
    },

    developerDetailsCls: {
        alignContent: "center",
        flex: 1,
        justifyContent: "center",
        marginTop: 4,
    },

    developerInner: {
        alignItems: "center",
        backgroundColor: WHITE,
        borderRadius: 30,
        height: "90%",
        justifyContent: "center",
        overflow: "hidden",
        width: "90%",
    },

    developerItemCls: {
        alignContent: "center",
        flexDirection: "row",
        flex: 1,
        marginVertical: 8,
    },

    developerLogo: {
        height: "90%",
        resizeMode: "center",
        width: "90%",
    },

    indicator: {
        bottom: 0,
        left: 0,
        position: "absolute",
        right: 0,
        top: 0,
    },

    headerNameCls: {
        paddingBottom: 8,
    },

    unitTypeDefaultImgCont: {
        alignItems: "center",
        flex: 1,
        justifyContent: "center",
    },
});

export default DeveloperRow;
