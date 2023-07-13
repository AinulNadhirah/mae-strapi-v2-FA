import PropTypes from "prop-types";
import React from "react";

import GenericImageButton from "@components/Buttons/GenericImageButton";

import Assets from "@assets";

const HeaderRefreshButton = ({ onPress, ...props }) => (
    <GenericImageButton
        hitSlop={{ top: 12, left: 12, bottom: 12, right: 12 }}
        width={20}
        height={20}
        onPress={onPress}
        image={props?.isWhite ? Assets.refreshWhite : Assets.refresh}
        {...props}
    />
);

HeaderRefreshButton.propTypes = {
    onPress: PropTypes.func.isRequired,
    isWhite: PropTypes.bool,
};

HeaderRefreshButton.defaultProps = {
    isWhite: false,
};

export default React.memo(HeaderRefreshButton);
