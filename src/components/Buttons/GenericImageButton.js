import PropTypes from "prop-types";
import React from "react";
import { View, StyleSheet } from "react-native";

import BaseImageButton from "@components/Buttons/Base/BaseImageButton";

import { NOTIF_RED } from "@constants/colors";

const GenericImageButton = ({ width, height, unreadMsg, radius, image, ...props }) => {
    return (
        <>
            {unreadMsg && <View style={styles.redDot} />}
            <BaseImageButton
                image={image}
                style={{ width, height, borderRadius: radius }}
                {...props}
            />
        </>
    );
};

GenericImageButton.defaultProps = {
    width: 45,
    height: 45,
    radius: 0,
};

GenericImageButton.propTypes = {
    image: PropTypes.number.isRequired,
    width: PropTypes.number,
    height: PropTypes.number,
    unreadMsg: PropTypes.bool,
    radius: PropTypes.number,
};

const Memoized = React.memo(GenericImageButton);
const styles = StyleSheet.create({
    redDot: {
        alignSelf: "flex-end",
        backgroundColor: NOTIF_RED,
        borderRadius: 4,
        height: 8,
        marginRight: 8,
        width: 8,
    },
});

export default Memoized;
