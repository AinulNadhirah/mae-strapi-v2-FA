import PropTypes from "prop-types";
import React from "react";
import { Image, SafeAreaView, StyleSheet, View } from "react-native";
import Config from "react-native-config";
import DeviceInfo from "react-native-device-info";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import CacheeImageWithDefault from "@components/CacheeImageWithDefault";
import SpaceFiller from "@components/Placeholders/SpaceFiller";
import Typo from "@components/Text";

import { BLACK, YELLOW } from "@constants/colors";
import { DEV_OPTIONS } from "@constants/strings";

import useFestive from "@utils/useFestive";

import assets from "@assets";

const Header = ({ isTestingEnv }) => {
    const buildInfo = `${Config.ENV_FLAG}${Config.APP_ENV ?? ""} | ${DeviceInfo.getVersion()}`;
    const { festiveAssets } = useFestive();
    const insets = useSafeAreaInsets();

    const FestiveWrapper = () => {
        return (
            <View style={styles.festiveContainer}>
                <CacheeImageWithDefault
                    image={festiveAssets?.qrPay.background}
                    style={styles.festiveContainer}
                />
                <Content />
            </View>
        );
    };

    const Wrapper = () => {
        return (
            <SafeAreaView style={styles.safeAreaContainer}>
                <Content />
            </SafeAreaView>
        );
    };

    const Content = () => {
        return (
            <View style={[styles.headerContainer, isTestingEnv && { top: insets.top }]}>
                <Image source={assets.maeIcon} style={styles.logo} />
                <SpaceFiller width={16} />
                <View style={styles.headerTextContainer}>
                    <Typo
                        fontSize={24}
                        lineHeight={24}
                        color={BLACK}
                        fontWeight="500"
                        text={DEV_OPTIONS}
                        style={styles.uppercase}
                    />
                    <Typo
                        fontSize={14}
                        lineHeight={20}
                        fontWeight="300"
                        text={buildInfo}
                        style={styles.uppercase}
                    />
                    <Typo fontSize={10} lineHeight={20} fontWeight="300" text={Config?.APP_ID} />
                </View>
            </View>
        );
    };
    return isTestingEnv ? <FestiveWrapper /> : <Wrapper />;
};

Header.propTypes = {
    isTestingEnv: PropTypes.bool,
};

Header.defaultProps = {
    isTestingEnv: false,
};

const styles = StyleSheet.create({
    festiveContainer: { height: "50%", position: "absolute", width: "100%" },
    headerContainer: {
        alignItems: "center",
        flexDirection: "row",
        padding: 16,
    },
    headerTextContainer: {
        alignItems: "flex-start",
    },
    logo: {
        borderRadius: 32,
        height: 50,
        tintColor: BLACK,
        width: 50,
    },
    safeAreaContainer: {
        backgroundColor: YELLOW,
        position: "absolute",
        width: "100%",
    },
    uppercase: {
        textTransform: "uppercase",
    },
});

export default Header;
