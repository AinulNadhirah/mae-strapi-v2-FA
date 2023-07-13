import PropTypes from "prop-types";
import React from "react";
import { View, StyleSheet, TouchableOpacity, Text } from "react-native";

import ActionButton from "@components/Buttons/ActionButton";
import Typo from "@components/Text";

import { TAB_BAR_BG, WHITE } from "@constants/colors";

const PickerHeader = ({ onDoneButtonPressed, onCancelButtonPressed, headerHeight, isDarkMode }) => {
    const containerStyle = [styles.container];
    if (headerHeight === "small") containerStyle.push({ height: 48 });
    else containerStyle.push({ height: 60 });
    isDarkMode
        ? containerStyle.push({ backgroundColor: TAB_BAR_BG })
        : containerStyle.push({ backgroundColor: WHITE });
    return (
        <View style={containerStyle}>
            <TouchableOpacity onPress={onCancelButtonPressed}>
                <Typo fontSize={14} fontWeight="600" lineHeight={16} color="#2892e9">
                    <Text>Cancel</Text>
                </Typo>
            </TouchableOpacity>
            <ActionButton
                componentCenter={
                    <Typo fontSize={12} fontWeight="600" lineHeight={16}>
                        <Text>Done</Text>
                    </Typo>
                }
                width={114}
                height={30}
                borderRadius={15}
                onPress={onDoneButtonPressed}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        alignItems: "center",
        borderTopLeftRadius: 16,
        borderTopRightRadius: 16,
        flexDirection: "row",
        justifyContent: "space-between",
        paddingHorizontal: 24,
        width: "100%",
    },
});

PickerHeader.propTypes = {
    onDoneButtonPressed: PropTypes.func.isRequired,
    onCancelButtonPressed: PropTypes.func.isRequired,
    headerHeight: PropTypes.oneOf(["small", "tall"]),
    isDarkMode: PropTypes.bool,
};

PickerHeader.defaultProps = {
    headerHeight: "small",
};

export default React.memo(PickerHeader);
