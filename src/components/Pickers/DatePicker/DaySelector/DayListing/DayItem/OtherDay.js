import PropTypes from "prop-types";
import React from "react";

import Typo from "@components/Text";

import { BLACK, DARK_GREY, GREY, MEDIUM_GREY } from "@constants/colors";

const OtherDay = ({ day, isDarkMode, isDisabled }) => {
    function getTextColor() {
        let color;

        if (isDarkMode) {
            color = isDisabled ? DARK_GREY : MEDIUM_GREY;
        } else {
            color = isDisabled ? GREY : BLACK;
        }
        return color;
    }

    return (
        <Typo fontSize={18} fontWeight="400" lineHeight={27} color={getTextColor()} text={day} />
    );
};

OtherDay.propTypes = {
    day: PropTypes.string.isRequired,
    isDarkMode: PropTypes.bool,
    isDisabled: PropTypes.bool,
};

export default React.memo(OtherDay);
