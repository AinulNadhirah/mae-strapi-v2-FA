import React from "react";
import { View } from "react-native";
import PropTypes from "prop-types";

const TransferDetailNotesRow = ({ children }) => {
    return <View style={Styles.viewRowDescriberItem}>{children}</View>;
};

TransferDetailNotesRow.propTypes = {
    children: PropTypes.array,
};

TransferDetailNotesRow.defaultProps = {
    children: <View></View>,
};

const Memoiz = React.memo(TransferDetailNotesRow);

export default Memoiz;

const Styles = {
    viewRowDescriberItem: {
        alignContent: "flex-start",
        alignItems: "flex-start",
        flexDirection: "column",
        justifyContent: "flex-start",
        marginLeft: 0,
        marginTop: 0,
    },
};
