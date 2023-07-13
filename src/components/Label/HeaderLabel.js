import React from "react";
import { BLACK } from "@constants/colors";
import Typo from "@components/Text";
import PropTypes from "prop-types";

const HeaderLabel = ({ children }) => (
    <Typo fontSize={16} fontWeight="600" color={BLACK} lineHeight={19}>
        {children}
    </Typo>
);

HeaderLabel.propTypes = {
    children: PropTypes.element.isRequired,
};

export default HeaderLabel;
