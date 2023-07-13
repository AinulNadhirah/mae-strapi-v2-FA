import React from "react";
import { View, Dimensions } from "react-native";
import PropTypes from "prop-types";

const screenWidth = Dimensions.get("window").width;
const rightTextWidth = (screenWidth * 45) / 100;

const TransferDetailLayout = ({ left, right, marginBottom }) => {
    return (
        <View style={[Styles.viewRow, { marginBottom: marginBottom }]}>
            <View style={Styles.viewRowLeftItem}>{left}</View>
            <View style={[Styles.viewRowRightItem, { maxWidth: rightTextWidth }]}>{right}</View>
        </View>
    );
};

TransferDetailLayout.propTypes = {
    left: PropTypes.element,
    right: PropTypes.element,
    marginBottom: PropTypes.number,
};

TransferDetailLayout.defaultProps = {
    left: <View />,
    right: <View />,
    marginBottom: 16,
};

const Memoiz = React.memo(TransferDetailLayout);

export default Memoiz;

const Styles = {
    viewRow: {
        alignContent: "flex-start",
        alignItems: "flex-start",
        flexDirection: "row",
        justifyContent: "space-between",
        marginLeft: 0,
        // flex: 1,
        // borderWidth: 1,
        // borderColor: "red",
    },
    viewRowLeftItem: {
        // alignContent: "flex-start",
        alignItems: "flex-start",
        flexDirection: "row",
        justifyContent: "flex-start",
        marginLeft: 0,
        marginTop: 0,
        // flex: 1,
    },
    viewRowRightItem: {
        // alignContent: "flex-end",
        alignItems: "flex-end",
        flexDirection: "column",
        // justifyContent: "space-between",
        marginLeft: 5,
        marginTop: 0,
        paddingLeft: 5,
        flex: 1,
    },
};
