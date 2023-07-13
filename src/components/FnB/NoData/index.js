import React from "react";
import { View, StyleSheet } from "react-native";
import { ScrollView } from "react-native";
import * as Animatable from "react-native-animatable";

import Typo from "@components/Text";

import { COMEBACK_LATER, MERCHANTPORTAL_DOWN_TEXT } from "@constants/strings";

import assets from "@assets";

const styles = StyleSheet.create({
    noDataBg: {
        bottom: 0,
        height: 280,
        left: 0,
        position: "absolute",
        right: 0,
    },
    noDataBgImg: {
        height: "100%",
        width: "100%",
    },
    noDataContainer: {
        flex: 1,
        position: "relative",
    },
    noDataScroll: {
        flex: 1,
        paddingHorizontal: 40,
        paddingVertical: 90,
    },
    noDataTitle: {
        marginBottom: 8,
    },
});

function NoData() {
    return (
        <View style={styles.noDataContainer}>
            <View style={styles.noDataBg}>
                <Animatable.Image
                    animation="fadeInUp"
                    duration={500}
                    source={assets.NoResults}
                    style={styles.noDataBgImg}
                />
            </View>
            <ScrollView contentContainerStyle={styles.noDataScroll}>
                <Animatable.View animation="fadeInDown" duration={250} delay={500}>
                    <Typo
                        fontSize={18}
                        fontWeight="bold"
                        lineHeight={32}
                        text={COMEBACK_LATER}
                        style={styles.noDataTitle}
                    />
                </Animatable.View>
                <Animatable.View animation="fadeInDown" duration={250} delay={700}>
                    <Typo
                        fontSize={14}
                        fontWeight="normal"
                        lineHeight={20}
                        text={MERCHANTPORTAL_DOWN_TEXT}
                    />
                </Animatable.View>
            </ScrollView>
        </View>
    );
}

export default NoData;
