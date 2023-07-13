import PropTypes from "prop-types";
import React from "react";

import GenericImageButton from "@components/Buttons/GenericImageButton";

import Assets from "@assets";

const HeaderChatButton = ({ onPress, isWhite, ...props }) => (
    <GenericImageButton
        hitSlop={{ top: 15, left: 15, bottom: 15, right: 15 }}
        width={21}
        height={21}
        onPress={onPress}
        image={isWhite ? Assets.icCloseWhite : Assets.loanChatIcon}
        {...props}
    />
);

HeaderChatButton.propTypes = {
    onPress: PropTypes.func.isRequired,
    isWhite: PropTypes.bool,
};

HeaderChatButton.defaultProps = {
    isWhite: false,
};

export default HeaderChatButton;
