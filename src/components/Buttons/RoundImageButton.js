import React from "react";
import PropTypes from "prop-types";
import BaseImageButton from "@components/Buttons/Base/BaseImageButton";

const RoundImageButton = ({ image, size, ...props }) => {
    return (
        <BaseImageButton
            image={image}
            style={{ width: size, height: size, borderRadius: size / 2 }}
            {...props}
        />
    );
};

RoundImageButton.defaultProps = {
    size: 45,
};

RoundImageButton.propTypes = {
    image: PropTypes.number.isRequired,
    size: PropTypes.number,
};

const Memoized = React.memo(RoundImageButton);

export default Memoized;
