import PropTypes from "prop-types";
import React from "react";
import { View, StyleSheet } from "react-native";
import * as Anima from "react-native-animatable";

import { BLACK, GRAY_200 } from "@constants/colors";

const ifToggledAnimate = (check) => (check ? "bounceIn" : "fadeIn");
const ifToggledDuration = (check) => (check ? 1000 : 250);

const DebitCardEightDigitNumber = ({ info, pin }) => {
    return (
        <View style={styles.container}>
            {info.map((infoDetail, i) => {
                return (
                    <Anima.View
                        key={i}
                        animation={ifToggledAnimate(pin.length > i)}
                        duration={ifToggledDuration(pin.length > i)}
                        useNativeDriver
                        style={styles.pin(
                            pin,
                            infoDetail.ver,
                            infoDetail.hor,
                            infoDetail.border,
                            infoDetail.space,
                            i
                        )}
                    />
                );
            })}
        </View>
    );
};

const styles = StyleSheet.create({
    container: { alignItems: "flex-start", flexDirection: "row", marginTop: 10 },
    pin: (pin, ver, hor, border, space, position) => ({
        marginLeft: space,
        width: ver - 1,
        height: hor - 1,
        borderRadius: border,
        backgroundColor: getBorderColor(pin, position),
    }),
});

DebitCardEightDigitNumber.propTypes = {
    pin: PropTypes.string,
    info: PropTypes.array,
};

function getBorderColor(pin, position) {
    return pin.length > position ? BLACK : GRAY_200;
}

export default DebitCardEightDigitNumber;
