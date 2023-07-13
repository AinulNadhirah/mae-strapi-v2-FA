import React from "react";
import Typo from "@components/Text";
import PropTypes from "prop-types";
import { View, StyleSheet, Image } from "react-native";
import Assets from "@assets";

const WalletLabel = () => (
    <View style={styles.labelContainer}>
        <Image source={Assets.iconMenuWallet} style={styles.image} resizeMode="contain" />
    </View>
);

const styles = StyleSheet.create({
    image: {
        width: 20,
        height: 16,
    },
    labelContainer: {
        width: 38,
        height: 38,
        borderRadius: 19,
        backgroundColor: "rgba(255,255,255, 0.4)",
        justifyContent: "center",
        alignItems: "center",
    },
});

const Memoiz = React.memo(WalletLabel);

export default Memoiz;
