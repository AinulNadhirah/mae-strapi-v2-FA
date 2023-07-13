import React from "react";
import { View, StyleSheet, ImageBackground } from "react-native";
import PropTypes from "prop-types";

import Assets from "@assets";
import Spring from "@components/Animations/Spring";

import { WHITE } from "@constants/colors";
import { getShadow } from "@utils/dataModel/utility";

const ProductApplyMAECard = ({ onCardPressed, cardType }) => {
    return (
        <View style={styles.shadow}>
            <Spring
                style={[styles.container, { height: cardType === "BIG" ? 144 : 116 }]}
                onPress={onCardPressed}
                activeOpacity={0.9}
            >
                <ImageBackground
                    source={
                        cardType === "BIG" ? Assets.applyMaeCardbgBIG : Assets.applyMaeCardbgSMALL
                    }
                    style={styles.cardBg}
                    imageStyle={styles.cardBgImg}
                    resizeMode="cover"
                />
            </Spring>
        </View>
    );
};

ProductApplyMAECard.propTypes = {
    onCardPressed: PropTypes.func.isRequired,
    cardType: PropTypes.oneOf(["BIG", "SMALL"]),
};

ProductApplyMAECard.defaultProps = {
    onCardPressed: () => {},
    cardType: "SMALL",
};

const styles = StyleSheet.create({
    cardBg: {
        height: "100%",
        width: "100%",
    },

    cardBgImg: {
        borderRadius: 8,
    },

    container: {
        backgroundColor: WHITE,
        borderRadius: 8,
        marginBottom: 16,
        overflow: "hidden",
        width: "100%",
    },

    shadow: {
        ...getShadow({}),
    },
});

export default React.memo(ProductApplyMAECard);
