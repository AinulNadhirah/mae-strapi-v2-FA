import React from "react";
import { StyleSheet, View } from "react-native";

import ActionButton from "@components/Buttons/ActionButton";
import Typo from "@components/Text";

import { BLACK, YELLOW, WHITE, GREY } from "@constants/colors";

export function SecondaryPrimaryBtn({
    marginTop = 0,
    secondaryLbl,
    secondaryOnPress,
    secondaryIsDisabled,
    primaryLbl,
    primaryOnPress,
    primaryIsDisabled,
}) {
    return (
        <View style={[styles.buttonsView, { marginTop }]}>
            <View style={styles.callNowView}>
                <ActionButton
                    fullWidth
                    height={48}
                    borderRadius={24}
                    borderColor={GREY}
                    borderWidth={1}
                    borderStyle="solid"
                    onPress={secondaryOnPress}
                    disabled={secondaryIsDisabled}
                    backgroundColor={WHITE}
                    componentCenter={
                        <Typo
                            color={BLACK}
                            text={secondaryLbl}
                            fontSize={14}
                            fontWeight="600"
                            lineHeight={18}
                        />
                    }
                />
            </View>
            <View style={styles.directionView}>
                <ActionButton
                    fullWidth
                    height={48}
                    borderRadius={24}
                    onPress={primaryOnPress}
                    backgroundColor={YELLOW}
                    disabled={primaryIsDisabled}
                    componentCenter={
                        <Typo
                            color={BLACK}
                            text={primaryLbl}
                            fontSize={14}
                            fontWeight="600"
                            lineHeight={18}
                        />
                    }
                />
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    buttonsView: {
        alignItems: "center",
        flexDirection: "row",
    },
    callNowView: {
        alignItems: "center",
        paddingRight: 8,
        width: "50%",
    },
    directionView: {
        alignItems: "center",
        paddingLeft: 8,
        width: "50%",
    },
});
