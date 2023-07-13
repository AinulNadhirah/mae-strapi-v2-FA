import React from "react";
import Typo from "@components/Text";
import PropTypes from "prop-types";

const TransferDetailLabel = ({ value }) => {
    return (
        <Typo
            fontSize={12}
            fontWeight="400"
            fontStyle="normal"
            letterSpacing={0}
            lineHeight={18}
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
