import React from "react";
import { View, StyleSheet } from "react-native";
import PropTypes from "prop-types";
import { BLACK, OFF_WHITE, NEARYLY_DARK_GREY } from "@constants/colors";

const BorderedAvatar = ({ width, height, borderRadius, children, backgroundColor, ...props }) => {
    return (
        <View
            style={[styles.container, { width, height, borderRadius, backgroundColor }]}
            {...props}
        >
            <View
                style={[
                    styles.innerContainer,
                    {
                        width: width - 4,
                        height: height - 4,
                        borderRadius: borderRadius,
                        backgroundColor,
                    },
                ]}
            >
                {children}
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        alignItems: "center",
        borderColor: OFF_WHITE,
        borderStyle: "solid",
        borderWidth: 2,
        elevation: 5,
        justifyContent: "center",
        shadowColor: BLACK,
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
    },
    innerContainer: {
        alignItems: "center",
        justifyContent: "center",
        overflow: "hidden",
    },
});

BorderedAvatar.propTypes = {
    width: PropTypes.number,
    height: PropTypes.number,
    borderRadius: PropTypes.number,
    children: PropTypes.element.isRequired,
    backgroundColor: PropTypes.string,
};

BorderedAvatar.defaultProps = {
    width: 36,
    height: 36,
    borderRadius: 36 / 2,
    backgroundColor: NEARYLY_DARK_GREY,
};

const Memoiz = React.memo(BorderedAvatar);

export default Memoiz;
