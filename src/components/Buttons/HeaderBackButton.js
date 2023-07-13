import PropTypes from "prop-types";
import React from "react";

import GenericImageButton from "@components/Buttons/GenericImageButton";

import Assets from "@assets";

const HeaderBackButton = ({ onPress, isWhite, ...props }) => (
    <GenericImageButton
        hitSlop={{ top: 11, left: 11, bottom: 11, right: 11 }}
        width={22}
        height={22}
        onPress={onPress}
        image={isWhite ? Assets.icBackWhite : Assets.icBackBlack}
        {...props}
    />
);

HeaderBackButton.propTypes = {
    onPress: PropTypes.func.isRequired,
    isWhite: PropTypes.bool,
};

HeaderBackButton.defaultProps = {
    isWhite: false,
};

export default React.memo(HeaderBackButton);
