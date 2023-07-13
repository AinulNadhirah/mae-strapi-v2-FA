import PropTypes from "prop-types";
import React from "react";
import { View } from "react-native";

const SpaceFiller = ({ width, height, borderRadius, backgroundColor }) => {
    return (
        <View
            style={{
                width,
                height,
                borderRadius,
                backgroundColor,
            }}
        />
    );
};

SpaceFiller.propTypes = {
    width: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
    height: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
    borderRadius: PropTypes.number,
    backgroundColor: PropTypes.string,
};

SpaceFiller.defaultProps = {
    width: 1,
    height: 1,
    borderRadius: 0,
    backgroundColor: "transparent",
};

export default SpaceFiller;
