import PropTypes from "prop-types";
import React from "react";
import { StyleSheet, View, TouchableOpacity, Image } from "react-native";

import Typo from "@components/Text";

import { BLACK, BLUE, OFF_WHITE, PICTON_BLUE, WHITE } from "@constants/colors";

import SSLStyles from "@styles/SSLStyles";

import assets from "@assets";

function LocationPillCartPickup({
    onPress,
    onPressDeliveryType,
    fullNameString,
    deliveryOptions,
    isLoading,
}) {
    const deliveryOptionsLbl = deliveryOptions.find((obj) => obj.id == 2); // == because API can't guarantee strongly typed variable
    return (
        <>
            <TouchableOpacity
                style={[styles.pillContainer, SSLStyles.pillShadow]}
                onPress={onPress}
            >
                <Image style={styles.blackPin} source={assets.SSLLocationPillPickup} />
                <View style={styles.middleColumnTextContainer}>
                    <Typo
                        fontSize={10}
                        fontWeight="normal"
                        fontStyle="normal"
                        letterSpacing={0}
                        lineHeight={14}
                        textAlign="left"
                        text="Pick up by"
                        color={BLACK}
                    />
                    <Typo
                        fontSize={14}
                        fontWeight="bold"
                        fontStyle="normal"
                        letterSpacing={0}
                        lineHeight={18}
                        textAlign="left"
                        text={fullNameString ? fullNameString : "Enter Person Info"}
                        numberOfLines={1}
                        color={BLUE}
                    />
                </View>

                {deliveryOptions?.length > 1 && !isLoading && (
                    <TouchableOpacity style={styles.deliveryType} onPress={onPressDeliveryType}>
                        <Typo
                            style={styles.container}
                            fontSize={12}
                            fontWeight="semi-bold"
                            textAlign="center"
                            text={deliveryOptionsLbl?.title ?? "Change"}
                            color={PICTON_BLUE}
                        />

                        <Image
                            source={assets.downArrow}
                            style={styles.downArrowInside}
                            resizeMode="contain"
                        />
                    </TouchableOpacity>
                )}
            </TouchableOpacity>
        </>
    );
}
LocationPillCartPickup.propTypes = {
    onPress: PropTypes.func.isRequired,
    onPressDeliveryType: PropTypes.func.isRequired,
    fullNameString: PropTypes.string,
    deliveryOptions: PropTypes.array,
    isLoading: PropTypes.bool,
};
LocationPillCartPickup.defaultProps = {
    fullNameString: "",
    deliveryOptions: [],
    isLoading: true,
};
const Memoiz = React.memo(LocationPillCartPickup);
export default Memoiz;

const styles = StyleSheet.create({
    blackPin: { height: 16, marginLeft: 16, marginRight: 8, width: 16 },
    container: { flex: 1 },
    deliveryType: {
        alignItems: "center",
        backgroundColor: OFF_WHITE,
        borderRadius: 48 / 2,
        flexDirection: "row",
        height: 48,
        justifyContent: "center",
        marginRight: 11,
        width: 120,
    },
    downArrowInside: {
        height: 15,
        marginRight: 10,
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
