import React from "react";
import Typo from "@components/Text";
import PropTypes from "prop-types";

const TransferDetailLabel = ({ value }) => {
    return (
        <Typo
            fontSize={14}
            fontWeight="400"
            fontStyle="normal"
            letterSpacing={0}
            lineHeight={19}
            textAlign="left"
            text={value}
        />
    );
};

TransferDetailLabel.propTypes = {
    value: PropTypes.string,
};

TransferDetailLabel.defaultProps = {
    value: "",
};

const Memoiz = React.memo(TransferDetailLabel);

export default Memoiz;
