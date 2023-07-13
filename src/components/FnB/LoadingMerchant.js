import React from "react";
import { StyleSheet, ScrollView } from "react-native";

import { MerchantItemLoading } from "./MerchantItemLoading";

const styles = StyleSheet.create({
    merchantLoader: {
        alignItems: "center",
        justifyContent: "center",
        padding: 24,
        paddingTop: 0,
    },
});

export default function LoadingMerchant() {
    return (
        <ScrollView contentContainerStyle={styles.merchantLoader}>
            <MerchantItemLoading />
            <MerchantItemLoading />
            <MerchantItemLoading />
            <MerchantItemLoading />
            <MerchantItemLoading />
            <MerchantItemLoading />
        </ScrollView>
    );
}
