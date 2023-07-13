import PropTypes from "prop-types";
import React from "react";
import { View, StyleSheet } from "react-native";

import { TouchableSpring, Animated } from "@components/Animations/TouchableSpring";
import CacheeImageWithDefault from "@components/CacheeImageWithDefault/index";

import { WHITE, SHADOW_LIGHT } from "@constants/colors";

function Banner({ onPress, image, defaultImage }) {
    return (
        <View style={styles.fnbContainer}>
            <TouchableSpring onPress={onPress}>
                {({ animateProp }) => (
                    <Animated.View
                        style={{
                            transform: [
                                {
                                    scale: animateProp,
                                },
                            ],
                        }}
                    >
                        <View style={styles.fnbContainerCard}>
                            {/* editherefor ssl banner */}
                            <CacheeImageWithDefault
                                image={image}
                                defaultImage={defaultImage}
                                style={styles.fnbCardBg}
                            />
                        </View>
                    </Animated.View>
                )}
            </TouchableSpring>
        </View>
    );
}

Banner.propTypes = {
    onPress: PropTypes.func.isRequired,
    image: PropTypes.string,
    defaultImage: PropTypes.number,
};

const styles = StyleSheet.create({
    fnbCardBg: {
        aspectRatio: 981 / 432,
        borderRadius: 8,
        width: "100%",
    },
    fnbContainer: {
        paddingBottom: 36,
        paddingHorizontal: 24,
    },
    fnbContainerCard: {
        backgroundColor: WHITE,
        borderRadius: 8,
        elevation: 8,
        flex: 1,
        flexDirection: "row",
    },
});

export default Banner;
