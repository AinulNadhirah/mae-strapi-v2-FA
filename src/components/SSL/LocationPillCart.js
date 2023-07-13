import PropTypes from "prop-types";
import React from "react";
import { StyleSheet, View, TouchableOpacity, Image } from "react-native";

import Typo from "@components/Text";

import { BLACK, OFF_WHITE, PICTON_BLUE, WHITE } from "@constants/colors";

import SSLStyles from "@styles/SSLStyles";

import assets from "@assets";

function LocationPillCart({
    onPressLocationPill,
    onPressDeliveryType,
    selectedDeliveryId,
    locationLbl,
    locationColor,
    deliveryOptions,
}) {
    let deliveryOptionsLbl = "Change";
    if (selectedDeliveryId === 1 || selectedDeliveryId === 3) {
        deliveryOptionsLbl = deliveryOptions.find((obj) => {
            return obj.id == 1 || obj.id == 3;
        });
    } else {
        deliveryOptionsLbl = deliveryOptions.find((obj) => obj.id == selectedDeliveryId);
    }
    return (
        <>
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
                        text="Delivering to"
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
                        color={locationColor}
                        numberOfLines={2}
                    />
                </View>

                {deliveryOptions?.length > 1 ? (
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
                ) : (
                    <Image
                        source={assets.downArrow}
                        style={styles.downArrowStyle}
                        resizeMode="contain"
                    />
                )}
            </TouchableOpacity>
        </>
    );
}
LocationPillCart.propTypes = {
    onPressLocationPill: PropTypes.func.isRequired,
    onPressDeliveryType: PropTypes.func.isRequired,
    locationLbl: PropTypes.string,
    locationColor: PropTypes.string,
    selectedDeliveryId: PropTypes.number,
    deliveryOptions: PropTypes.array,
};
LocationPillCart.defaultProps = {
    locationLbl: "Menara Maybank",
    deliveryOptions: [],
    locationColor: BLACK,
};
const Memoiz = React.memo(LocationPillCart);
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
