import PropTypes from "prop-types";
import React from "react";
import { Image, StyleSheet, TouchableOpacity, View } from "react-native";

import SpaceFiller from "@components/Placeholders/SpaceFiller";
import Typo from "@components/Text";

import { ARSENIC, AUBERGINE } from "@constants/colors";

import { commaAdder } from "@utils/dataModel/utilityPartial.1";

import Assets from "@assets";

const MainBalance = ({ onPressVisible, balance, showBalance }) => {
    const maskedFormat = "RM ****";
    const formattedBalance = `${Math.sign(balance) === -1 ? "-" : ""}RM ${commaAdder(
        Math.abs(balance).toFixed(2)
    )}`;
    const value = showBalance ? formattedBalance : maskedFormat;
    const icon = showBalance
        ? Assets.dashboard.topSection.showValue
        : Assets.dashboard.topSection.hideValue;

    const onPress = () => {
        onPressVisible && onPressVisible(!showBalance);
    };

    return (
        <View style={styles.container}>
            <Typo
                testID={"dashboard_main_balance"}
                text={value}
                fontWeight="700"
                fontSize={26}
                lineHeight={28}
                textAlign="left"
                numberOfLines={1}
                color={AUBERGINE}
            />
            <SpaceFiller width={24} />
            <TouchableOpacity
                style={styles.iconContainer}
                onPress={onPress}
                testID={"dashboard_show_hide_balance"}
            >
                <Image source={icon} />
            </TouchableOpacity>
        </View>
    );
};

MainBalance.propTypes = {
    onPressVisible: PropTypes.func,
    balance: PropTypes.number,
    showBalance: PropTypes.bool,
};

const styles = StyleSheet.create({
    container: {
        paddingLeft: 48,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
    },
    iconContainer: {
        height: 28,
        width: 28,
        justifyContent: "center",
        alignItems: "center",
    },
    icon: {
        tintColor: ARSENIC,
    },
});
export default MainBalance;
