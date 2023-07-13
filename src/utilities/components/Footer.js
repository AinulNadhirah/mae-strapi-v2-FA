import React from "react";
import { Platform, StyleSheet } from "react-native";
import DeviceInfo from "react-native-device-info";
import { SafeAreaView } from "react-native-safe-area-context";

import Typo from "@components/Text";

import { DARK_GREY } from "@constants/colors";
import { DEVICE_OS_INFORMATION } from "@constants/strings";

const Footer = () => {
    const deviceSpecs =
        DeviceInfo.getModel() + " | " + Platform.OS + " " + DeviceInfo.getSystemVersion();
    return (
        <SafeAreaView style={styles.deviceInfoContainer}>
            <Typo
                fontSize={12}
                letterSpacing={0}
                lineHeight={20}
                textAlign={"left"}
                fontWeight={"500"}
                color={DARK_GREY}
                text={DEVICE_OS_INFORMATION}
            />
            <Typo
                fontSize={14}
                letterSpacing={0}
                lineHeight={20}
                textAlign={"left"}
                fontWeight={"500"}
                color={DARK_GREY}
                text={deviceSpecs}
            />
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    deviceInfoContainer: {
        padding: 16,
    },
});

export default Footer;
