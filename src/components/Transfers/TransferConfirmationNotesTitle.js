import React from "react";
import PropTypes from "prop-types";
import Typo from "@components/Text";

const TransferDetailNotesTitle = ({ value }) => {
    return (
        <Typo
            fontSize={12}
            fontWeight="600"
            fontStyle="normal"
            letterSpacing={0}
            lineHeight={18}
            textAlign="left"
            color={"#787878"}
            text={value}
        />
    );
};

TransferDetailNotesTitle.propTypes = {
    value: PropTypes.string,
};

TransferDetailNotesTitle.defaultProps = {
    value: "",
};

const Memoiz = React.memo(TransferDetailNotesTitle);

export default Memoiz;
