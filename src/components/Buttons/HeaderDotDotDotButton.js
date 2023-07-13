import React from "react";
import GenericImageButton from "@components/Buttons/GenericImageButton";
import PropTypes from "prop-types";

const HeaderDotDotDotButton = ({ onPress, ...props }) => (
    <GenericImageButton
        width={44}
        height={44}
        onPress={onPress}
        image={require("@assets/icons/ic_more_black.png")}
        {...props}
    />
);

HeaderDotDotDotButton.propTypes = {
    onPress: PropTypes.func.isRequired,
};

export default React.memo(HeaderDotDotDotButton);
