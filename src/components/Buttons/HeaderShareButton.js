import React from "react";
import GenericImageButton from "@components/Buttons/GenericImageButton";
import PropTypes from "prop-types";

const HeaderShareButton = ({ onPress, ...props }) => (
    <GenericImageButton
        width={44}
        height={44}
        onPress={onPress}
        image={require("@assets/icons/ic_share_black.png")}
        {...props}
    />
);

HeaderShareButton.propTypes = {
    onPress: PropTypes.func.isRequired,
};

export default React.memo(HeaderShareButton);
