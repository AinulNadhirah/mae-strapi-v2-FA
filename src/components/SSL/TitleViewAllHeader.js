import React from "react";
import { StyleSheet, View, TouchableOpacity } from "react-native";

import Typo from "@components/Text";

import { BLACK, PICTON_BLUE } from "@constants/colors";

export default function TitleViewAllHeader({ title, viewAllLbl = "View All", onPressViewAll }) {
    return (
        <View style={styles.containerHeaderTitle}>
            <Typo
                fontSize={16}
                fontWeight="600"
                fontStyle="normal"
                letterSpacing={0}
                lineHeight={19}
                textAlign="left"
                text={title}
                color={BLACK}
            />
            {onPressViewAll && (
                <TouchableOpacity
                    onPress={onPressViewAll}
                    hitSlop={{ top: 30, bottom: 30, left: 30, right: 30 }}
                >
                    <Typo
                        fontSize={14}
                        fontWeight="600"
                        fontStyle="normal"
                        letterSpacing={0}
                        lineHeight={19}
                        textAlign="left"
                        text={viewAllLbl}
                        color={PICTON_BLUE}
                    />
                </TouchableOpacity>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    containerHeaderTitle: {
        alignItems: "center",
        flexDirection: "row",
        justifyContent: "space-between",
        paddingBottom: 20,
        paddingHorizontal: 24,
    },
});
