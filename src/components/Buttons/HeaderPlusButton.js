import React from "react";
import PropTypes from "prop-types";
import GenericImageButton from "@components/Buttons/GenericImageButton";
import Assets from "@assets";

const HeaderPlusButton = ({ onPress, ...props }) => (
    <GenericImageButton
        hitSlop={{ top: 6, left: 6, bottom: 6, right: 6 }}
        width={32}
        height={32}
        onPress={onPress}
        image={Assets.plusIcon}
        {...props}
    />
);

HeaderPlusButton.propTypes = {
    onPress: PropTypes.func.isRequired,
};

export default React.memo(HeaderPlusButton);
