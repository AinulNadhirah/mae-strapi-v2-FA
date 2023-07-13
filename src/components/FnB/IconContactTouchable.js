import React from "react";
import { StyleSheet, View, TouchableOpacity, Image } from "react-native";
import * as Animatable from "react-native-animatable";

import Typo from "@components/Text";

import { BLACK, ROYAL_BLUE } from "@constants/colors";

export function IconContactTouchable({ icon, text, onPress, delay }) {
    return (
        <TouchableOpacity onPress={onPress}>
            <View style={styles.contactsView}>
                <Image style={styles.metaIcon} source={icon} />
                <Animatable.View
                    animation={delay ? "fadeInUp" : ""}
                    duration={250}
                    delay={600}
                    style={styles.container}
                >
                    <Typo
                        color={onPress ? ROYAL_BLUE : BLACK}
                        fontWeight={onPress ? "semi-bold" : "normal"}
                        fontSize={13}
                        textAlign="left"
                        lineHeight={20}
                        text={text}
                    />
                </Animatable.View>
            </View>
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    contactsView: {
        alignItems: "center",
        flexDirection: "row",
        marginTop: 17,
    },
    container: {
        flex: 1,
    },
    metaIcon: {
        height: 20,
        marginRight: 17,
        width: 20,
    },
});
