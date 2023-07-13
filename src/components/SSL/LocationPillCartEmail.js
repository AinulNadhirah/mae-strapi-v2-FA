import PropTypes from "prop-types";
import React from "react";
import { StyleSheet, View, TouchableOpacity, Image } from "react-native";

import Typo from "@components/Text";

import { BLACK, BLUE, OFF_WHITE, WHITE } from "@constants/colors";

import SSLStyles from "@styles/SSLStyles";

import assets from "@assets";

function LocationPillCartEmail({ onPress, emailString }) {
    return (
        <>
            <TouchableOpacity
                style={[styles.pillContainer, SSLStyles.pillShadow]}
                onPress={onPress}
            >
                <Image style={styles.blackPin} source={assets.SSLLocationPillEmail} />
                <View style={styles.middleColumnTextContainer}>
                    <Typo
                        fontSize={10}
                        fontWeight="normal"
                        fontStyle="normal"
                        letterSpacing={0}
                        lineHeight={14}
                        textAlign="left"
                        text="Send to Email"
                        color={BLACK}
                    />
                    <Typo
                        fontSize={14}
                        fontWeight="bold"
                        fontStyle="normal"
                        letterSpacing={0}
                        lineHeight={18}
                        textAlign="left"
                        text={emailString ? emailString : "Enter an Email"}
                        numberOfLines={1}
                        color={BLUE}
                    />
                </View>
            </TouchableOpacity>
        </>
    );
}
LocationPillCartEmail.propTypes = {
    onPress: PropTypes.func.isRequired,
    emailString: PropTypes.string,
};
LocationPillCartEmail.defaultProps = {
    emailString: "",
};
const Memoiz = React.memo(LocationPillCartEmail);
export default Memoiz;

const styles = StyleSheet.create({
    blackPin: { height: 16, marginLeft: 16, marginRight: 8, width: 16 },
    deliveryType: {
        backgroundColor: OFF_WHITE,
        borderRadius: 48 / 2,
        height: 48,
        justifyContent: "center",
        marginRight: 11,
        width: 104,
    },
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
});
