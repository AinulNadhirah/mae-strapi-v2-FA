import React from "react";
import PropTypes from "prop-types";
import Typo from "@components/Text";

const TransferDetailNotesDescription = ({ value, style }) => {
    return (
        <Typo
            fontSize={12}
            // fontWeight="600"
            fontStyle="normal"
            letterSpacing={0}
            lineHeight={18}
            textAlign="left"
            color={"#787878"}
            text={value}
            style={style}
        />
    );
};

TransferDetailNotesDescription.propTypes = {
    value: PropTypes.string,
};

TransferDetailNotesDescription.defaultProps = {
    value: "",
};

const Memoiz = React.memo(TransferDetailNotesDescription);

export default Memoiz;
