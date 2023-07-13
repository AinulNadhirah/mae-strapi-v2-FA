import PropTypes from "prop-types";
import React from "react";
import { View } from "react-native";

import Typo from "@components/Text";

import { WHITE, ORANGE, BLUE_VERY_LIGHT, STATUS_GREEN, RED, DARK_GREY } from "@constants/colors";
import {
    BLUE_VERY_LIGHT_STATUS,
    GREEN_STATUS,
    RED_STATUS,
    GREY_STATUS,
    ORANGE_STATUS,
} from "@constants/data";

const StatusTextView = ({ status, style }) => {
    const statusText = status?.toString().toLowerCase();
    const bgColorRed = RED_STATUS.includes(statusText) ? RED : null;
    const bgColorGreen = GREEN_STATUS.includes(statusText) ? STATUS_GREEN : null;
    const bgColorBlue = BLUE_VERY_LIGHT_STATUS.includes(statusText) ? BLUE_VERY_LIGHT : null;
    const bgColorGrey = GREY_STATUS.includes(statusText) ? DARK_GREY : null;
    const bgColorOrange = ORANGE_STATUS.includes(statusText) ? ORANGE : null;

    return (
        <View
            style={[
                Styles.statusView,
                {
                    backgroundColor:
                        bgColorRed || bgColorOrange || bgColorGreen || bgColorBlue || bgColorGrey,
                },
                style,
            ]}
        >
            <Typo
                fontSize={9}
                fontWeight="normal"
                fontStyle="normal"
                letterSpacing={0}
                lineHeight={18}
                color={WHITE}
                textAlign="left"
                text={status.toString().toLowerCase() === "received" ? "Incoming" : status}
            />
        </View>
    );
};

const Styles = {
    statusView: {
        width: 68,
        height: 21,
        borderRadius: 10.5,
        justifyContent: "center",
        alignItems: "center",
        alignContent: "center",
    },

    statusPendingText: {
        fontFamily: "montserrat",
        fontSize: 9,
        fontWeight: "600",
        fontStyle: "normal",
        lineHeight: 11,
        letterSpacing: 0,
        textAlign: "center",
        color: WHITE,
    },
};

StatusTextView.propTypes = {
    status: PropTypes.string,
    module: PropTypes.string,
    style: PropTypes.any,
};
export { StatusTextView };
