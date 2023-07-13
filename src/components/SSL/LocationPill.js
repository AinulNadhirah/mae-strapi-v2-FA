import PropTypes from "prop-types";
import React from "react";
import { StyleSheet, View, TouchableOpacity, Image } from "react-native";

import ShimmerPlaceHolder from "@components/ShimmerPlaceholder";
import Typo from "@components/Text";

import { BLACK, GREY_100, GREY_200, WHITE } from "@constants/colors";

import SSLStyles from "@styles/SSLStyles";

import assets from "@assets";

function LocationPill({ onPressLocationPill, isLoading, locationLbl }) {
    return (
        <>
            {isLoading ? (
                <LocationShimmer />
            ) : (
                <TouchableOpacity
                    style={[styles.pillContainer, SSLStyles.pillShadow]}
                    onPress={onPressLocationPill}
                >
                    <Image style={styles.blackPin} source={assets.blackPin} />
                    <View style={styles.middleColumnTextContainer}>
                        <Typo
                            fontSize={10}
                            fontWeight="normal"
                            fontStyle="normal"
                            letterSpacing={0}
                            lineHeight={14}
                            textAlign="left"
                            text="Your Location"
                            color={BLACK}
                        />
                        <Typo
                            fontSize={14}
                            fontWeight="bold"
                            fontStyle="normal"
                            letterSpacing={0}
                            lineHeight={18}
                            textAlign="left"
                            text={locationLbl}
                            color={BLACK}
                            numberOfLines={2}
                        />
                    </View>
                    <Image
                        source={assets.downArrow}
                        style={styles.downArrowStyle}
                        resizeMode="contain"
                    />
                </TouchableOpacity>
            )}
        </>
    );
}
LocationPill.propTypes = {
    onPressLocationPill: PropTypes.func,
    isLoading: PropTypes.bool,
    locationLbl: PropTypes.string,
};
LocationPill.defaultProps = {
    isLoading: false,
    locationLbl: "Menara Maybank",
};
const Memoiz = React.memo(LocationPill);
export default Memoiz;

function LocationShimmer() {
    return (
        <View style={[styles.pillContainer, SSLStyles.pillShadow]}>
            <Image style={styles.blackPin} source={assets.blackPin} />
            <View style={styles.middleColumnTextContainer}>
                <ShimmerPlaceHolder style={styles.loaderTitle} />
                <ShimmerPlaceHolder style={styles.loaderDesc} />
            </View>
            <Image source={assets.downArrow} style={styles.downArrowStyle} resizeMode="contain" />
        </View>
    );
}

/* eslint-disable react-native/sort-styles */
const styles = StyleSheet.create({
    blackPin: { height: 16, marginLeft: 16, marginRight: 8, width: 16 },
    downArrowStyle: {
        height: 15,
        marginRight: 15,
        width: 15,
    },
    middleColumnTextContainer: { flex: 1, justifyContent: "center" },
    pillContainer: {
        alignItems: "center",
        backgroundColor: WHITE,
        borderRadius: 64 / 2,
        flexDirection: "row",
        height: 64,
        marginTop: 4,
    },

    // Shimmer styles
    loaderTitle: {
        backgroundColor: GREY_100,
        borderRadius: 4,
        height: 8,
        maxWidth: 80,
        marginBottom: 6,
    },
    loaderDesc: {
        backgroundColor: GREY_200,
        borderRadius: 8,
        height: 16,
        maxWidth: 184,
    },
});
