import React from "react";
import { View, StyleSheet, ActivityIndicator, ViewPropTypes } from "react-native";
import BaseSolidButton from "@components/Buttons/Base/BaseSolidButton";
import PropTypes from "prop-types";
import SpaceFiller from "@components/Placeholders/SpaceFiller";
import { YELLOW, BLACK } from "@constants/colors";

const ActionButton = ({
    height,
    width,
    borderRadius,
    borderStyle,
    borderWidth,
    borderColor,
    backgroundColor,
    componentLeft,
    componentCenter,
    componentRight,
    fullWidth,
    isLoading,
    style,
    ...props
}) => {
    let buttonWidth = width;
    if (fullWidth) buttonWidth = "100%";
    return (
        <BaseSolidButton
            style={[
                {
                    backgroundColor,
                    borderRadius,
                    borderStyle,
                    borderWidth,
                    borderColor,
                    height,
                    width: buttonWidth,
                },
                style,
            ]}
            fullWidth={fullWidth}
            {...props}
        >
            <View style={styles.container}>
                <View style={styles.itemLeft}>{componentLeft}</View>
                <View style={styles.itemCenter}>
                    {isLoading ? <ActivityIndicator size="small" color={BLACK} /> : componentCenter}
                </View>
                <View style={styles.itemRight}>{componentRight}</View>
            </View>
        </BaseSolidButton>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
    },
    itemCenter: {
        alignItems: "center",
        justifyContent: "center",
    },
    itemLeft: {
        alignItems: "center",
        justifyContent: "flex-start",
    },
    itemRight: {
        alignItems: "center",
        justifyContent: "flex-end",
    },
});

ActionButton.propTypes = {
    style: ViewPropTypes.style,
    height: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
    width: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
    borderRadius: PropTypes.number,
    backgroundColor: PropTypes.string,
    componentLeft: PropTypes.element,
    componentRight: PropTypes.element,
    componentCenter: PropTypes.element,
    borderWidth: PropTypes.number,
    borderStyle: PropTypes.string,
    borderColor: PropTypes.string,
    fullWidth: PropTypes.bool,
    isLoading: PropTypes.bool,
};

ActionButton.defaultProps = {
    componentLeft: <SpaceFiller />,
    componentCenter: <SpaceFiller />,
    componentRight: <SpaceFiller />,
    width: null,
    height: 48,
    borderRadius: 24,
    backgroundColor: YELLOW,
    borderWidth: 0,
    borderStyle: "solid",
    borderColor: "#eaeaea",
    fullWidth: false,
    isLoading: false,
};

export default ActionButton;
