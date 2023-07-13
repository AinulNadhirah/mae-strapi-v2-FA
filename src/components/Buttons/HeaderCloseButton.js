import PropTypes from "prop-types";
import React from "react";

import GenericImageButton from "@components/Buttons/GenericImageButton";

import Assets from "@assets";

const HeaderCloseButton = ({ onPress, isWhite, ...props }) => (
    <GenericImageButton
        style={styles.container}
        hitSlop={styles.hitSlop}
        width={15}
        height={15}
        onPress={onPress}
        image={isWhite ? Assets.icCloseWhite : Assets.icCloseBlack}
        {...props}
    />
);

const styles = {
    container: { paddingHorizontal: 20, width: 15, height: 16 },
    hitSlop: { top: 15, left: 15, bottom: 15, right: 15 },
};

HeaderCloseButton.propTypes = {
    onPress: PropTypes.func.isRequired,
    isWhite: PropTypes.bool,
};

HeaderCloseButton.defaultProps = {
    isWhite: false,
};

export default HeaderCloseButton;
