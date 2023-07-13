import React from "react";
import { View, StyleSheet } from "react-native";
import BaseSolidButton from "@components/Buttons/Base/BaseSolidButton";
import PropTypes from "prop-types";
import SpaceFiller from "@components/Placeholders/SpaceFiller";
import { YELLOW } from "@constants/colors";

const FloatingBarButton = ({
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
    ...props
}) => {
    let buttonWidth = width;
    if (fullWidth) buttonWidth = "100%";
    return (
        <BaseSolidButton
            style={{
                backgroundColor,
                borderRadius,
                borderStyle,
                borderWidth,
                borderColor,
                height,
                width: buttonWidth,
                elevation: 5,
                shadowColor: "rgba(0,0,0,0.18)",
                shadowOffset: {
                    width: 0,
                    height: 4,
                },
                shadowRadius: 8,
                shadowOpacity: 1,
            }}
            fullWidth={fullWidth}
            activeOpacity={1}
            {...props}
        >
            <View style={styles.container}>
                <View style={styles.itemLeft}>{componentLeft}</View>
                <View style={styles.itemCenter}>{componentCenter}</View>
                <View style={styles.itemRight}>{componentRight}</View>
            </View>
        </BaseSolidButton>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        flexDirection: "row",
        justifyContent: "center",
        alignItems: "center",
    },
    itemCenter: {
        alignItems: "center",
        justifyContent: "center",
    },
    itemLeft: {
        alignItems: "center",
        flex: 1.5,
        justifyContent: "center",
    },
    itemRight: {
        alignItems: "center",
        flex: 1,
        justifyContent: "center",
    },
});

FloatingBarButton.propTypes = {
    height: PropTypes.number,
    width: PropTypes.number,
    borderRadius: PropTypes.number,
    backgroundColor: PropTypes.string,
    componentLeft: PropTypes.element,
    componentRight: PropTypes.element,
    componentCenter: PropTypes.element,
    borderWidth: PropTypes.number,
    borderStyle: PropTypes.string,
    borderColor: PropTypes.string,
    fullWidth: PropTypes.bool,
};

FloatingBarButton.defaultProps = {
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
};

const Memoiz = React.memo(FloatingBarButton);

export default Memoiz;
