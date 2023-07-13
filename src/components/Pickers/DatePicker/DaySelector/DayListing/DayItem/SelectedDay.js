import PropTypes from "prop-types";
import React from "react";

import Typo from "@components/Text";

const SelectedDay = ({ day }) => <Typo fontSize={18} fontWeight="600" lineHeight={27} text={day} />;

SelectedDay.propTypes = {
    day: PropTypes.string.isRequired,
};

export default React.memo(SelectedDay);
