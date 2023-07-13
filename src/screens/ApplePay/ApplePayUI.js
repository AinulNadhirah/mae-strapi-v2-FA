import React from "react";
import { Image, View, StyleSheet, TouchableOpacity } from "react-native";
import PassKit, { AddPassButton } from "react-native-passkit-wallet";

import Typo from "@components/Text";

import { BLACK, ROYAL_BLUE, WHITE } from "@constants/colors";
import { ADDED_TO_WALLET, LEARN_APPLE_PAY, USE_APPLE_PAY } from "@constants/strings";

import assets from "@assets";

export function RenderAddedItems() {
    return (
        <View style={styles.addedDevice}>
            <Image source={assets.applePay} style={styles.applePayImage} />
            <Typo
                color={BLACK}
                fontSize={14}
                fontWeight="600"
                lineHeight={18}
                style={styles.addPassButton}
                text={ADDED_TO_WALLET}
            />
        </View>
    );
}

export function RenderFooterItems({ onPress }) {
    console.log("Render Footer Items");
    return (
        <View style={styles.addToWallet}>
            <TouchableOpacity activeOpacity={0.8} style={styles.buttonMargin}>
                <Typo
                    color={BLACK}
                    fontSize={14}
                    fontWeight="600"
                    lineHeight={18}
                    text={USE_APPLE_PAY}
                />
            </TouchableOpacity>
            <AddPassButton
                style={styles.addPassButton}
                addPassButtonStyle={PassKit.AddPassButtonStyle.black}
                onPress={() => onPress({})}
            />
        </View>
    );
}

export function RenderWatchItems({ onPress }) {
    console.log("Render Watch Items");
    return (
        <View style={styles.applePairedDevice}>
            <Image source={assets.appleWatch} style={styles.appleWatchImage} />
            <Typo
                color={BLACK}
                fontSize={14}
                fontWeight="600"
                lineHeight={18}
                style={styles.deviceText}
                text="Apple Watch"
            />
            <AddPassButton
                style={styles.addPassWatchButton}
                addPassButtonStyle={PassKit.AddPassButtonStyle.black}
                onPress={() => onPress({})}
            />
        </View>
    );
}

export function RenderDeviceItems({ onPress }) {
    console.log("Render Device Items");
    return (
        <View style={styles.applePairedDevice}>
            <Image source={assets.appleDevice} style={styles.appleIphoneImage} />
            <Typo
                color={BLACK}
                fontSize={14}
                fontWeight="600"
                lineHeight={18}
                style={styles.deviceText}
                text="iPhone"
            />
            <AddPassButton
                style={styles.addPassDeviceButton}
                addPassButtonStyle={PassKit.AddPassButtonStyle.black}
                onPress={() => onPress({})}
            />
        </View>
    );
}

export function LearnAP({ onPress }) {
    return (
        <TouchableOpacity onPress={onPress} activeOpacity={0.8}>
            <Typo
                color={ROYAL_BLUE}
                fontSize={14}
                fontWeight="600"
                lineHeight={18}
                text={LEARN_APPLE_PAY}
            />
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    addPassButton: {
        height: 50,
        marginTop: 20,
        width: "100%",
    },
    applePairedDevice: {
        backgroundColor: WHITE,
        borderRadius: 8,
        flexDirection: "row",
        marginBottom: 20,
        alignItems: "center",
        width: "100%",
        height: 76,
    },
    addPassDeviceButton: {
        height: 50,
        marginLeft: "15%",
        width: "51%",
    },
    addPassWatchButton: {
        height: 50,
        marginLeft: "6%",
        width: "51%",
    },
    addToWallet: {
        marginBottom: 20,
    },
    addedDevice: {
        alignItems: "center",
        flexDirection: "column",
        justifyContent: "space-between",
        width: "100%",
    },
    appleIphoneImage: {
        width: 14,
        height: 28,
        marginLeft: "8%",
    },
    applePayImage: {
        alignItems: "center",
        justifyContent: "center",
        width: 66,
    },
    appleWatchImage: {
        width: 16,
        height: 29,
        marginLeft: "4%",
    },
    buttonMargin: {
        marginTop: 20,
    },
    deviceText: {
        marginLeft: "3%",
    },
});
