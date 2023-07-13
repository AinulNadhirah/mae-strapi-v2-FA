import PropTypes from "prop-types";
import React from "react";
import { StyleSheet, View, Image, TouchableOpacity, TouchableWithoutFeedback } from "react-native";

import Typo from "@components/Text";

import { WHITE, LIGHT_GREY } from "@constants/colors";

import { getShadow } from "@utils/dataModel/utilityPartial.2";
import { sslOrdersStatusMapping } from "@utils/dataModel/utilitySSL";

import assets from "@assets";

function FloatingOrderPill({ onPressTrackerPill, onPressCloseTracker, obj, index }) {
    function handlePressTracker() {
        onPressTrackerPill(obj?.order_id);
    }
    function handlePressCloseTracker() {
        onPressCloseTracker(obj?.order_id);
    }
    return (
        <TouchableWithoutFeedback key={`${index}`} onPress={handlePressTracker}>
            <View key={`${index}`} style={styles.pillContainer}>
                <View style={styles.pillImageContainer}>
                    <Image style={styles.pillImage} source={assets.SSLIconColor} />
                </View>
                <View style={styles.pillRightContainer}>
                    <Typo
                        fontSize={14}
                        fontWeight="semi-bold"
                        text={obj.order_status_text}
                        textAlign="left"
                    />

                    {!obj.arriving_time && (
                        <Typo fontSize={12} text={obj.merchant_name} textAlign="left" />
                    )}

                    {obj.arriving_time && (
                        <Typo
                            fontSize={12}
                            text={`${obj.merchant_name} - Arriving by ${obj.arriving_time}`}
                            textAlign="left"
                        />
                    )}
                    <View style={styles.progressBar}>
                        <View
                            style={styles.progressBarDynamic({
                                deliveryId: obj?.delivery_id,
                                deliveryStatus: obj?.delivery_status,
                                orderStatus: obj?.status,
                            })}
                        />
                    </View>
                </View>
                <TouchableOpacity
                    style={styles.closeButtonTouchable}
                    onPress={handlePressCloseTracker}
                >
                    <Image style={styles.closeButton} source={assets.icClose} />
                </TouchableOpacity>
            </View>
        </TouchableWithoutFeedback>
    );
}
FloatingOrderPill.propTypes = {
    onPressTrackerPill: PropTypes.func,
    onPressCloseTracker: PropTypes.func,
    index: PropTypes.number,
    obj: PropTypes.object,
};

const styles = StyleSheet.create({
    closeButton: {
        height: 40,
        position: "absolute",
        right: 0,
        top: 0,
        width: 40,
    },
    closeButtonTouchable: {
        height: 30,
        width: 30,
    },
    pillContainer: {
        backgroundColor: WHITE,
        borderRadius: 8,
        flexDirection: "row",
        height: 87,
        marginBottom: 24,
        marginHorizontal: 15,
        ...getShadow({
            height: 4,
            shadowRadius: 16,
            elevation: 8,
        }),
    },
    pillImage: {
        height: 36,
        marginHorizontal: 16,
        width: 36,
    },
    pillImageContainer: {
        justifyContent: "center",
    },
    pillRightContainer: {
        flex: 1,
        justifyContent: "center",
        marginRight: 16,
    },
    progressBar: {
        backgroundColor: LIGHT_GREY,
        borderRadius: 4,
        height: 8,
        marginTop: 8,
        width: "100%",
    },
    progressBarDynamic: ({ deliveryId, deliveryStatus, orderStatus }) => ({
        backgroundColor: sslOrdersStatusMapping({ deliveryId, deliveryStatus, orderStatus }).color,
        borderRadius: 4,
        height: 8,
        width: sslOrdersStatusMapping({ deliveryId, deliveryStatus, orderStatus }).width,
    }),
});

export default FloatingOrderPill;
