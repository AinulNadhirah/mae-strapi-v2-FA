import PropTypes from "prop-types";
import React from "react";
import { StyleSheet, View } from "react-native";

import SpaceFiller from "@components/Placeholders/SpaceFiller";
import Typo from "@components/Text";

import { CDD_ACCOUNT_NUMBER, DATE_AND_TIME, ACCCOUNT_TYPE, REFERENCE_ID } from "@constants/strings";

export const SuccessDetailsViewWithAccountNumber = ({
    accountType,
    accountNumber,
    dateAndTime,
    referenceId,
}) => {
    return (
        <React.Fragment>
            {accountType ? (
                <View style={Style.rowedContainer}>
                    <View style={Style.descriptionBox}>
                        <Typo
                            fontSize={12}
                            fontWeight="400"
                            lineHeight={18}
                            textAlign="left"
                            text={ACCCOUNT_TYPE}
                        />
                    </View>
                    <View style={Style.dataBox}>
                        <Typo
                            fontSize={12}
                            fontWeight="600"
                            lineHeight={18}
                            textAlign="right"
                            text={accountType}
                        />
                    </View>
                </View>
            ) : null}
            {accountType ? <SpaceFiller height={16} /> : null}
            {accountNumber ? (
                <View style={Style.rowedContainer}>
                    <View style={Style.descriptionBox}>
                        <Typo
                            fontSize={12}
                            fontWeight="400"
                            lineHeight={18}
                            textAlign="left"
                            text={CDD_ACCOUNT_NUMBER}
                        />
                    </View>
                    <View style={Style.dataBox}>
                        <Typo
                            fontSize={12}
                            fontWeight="600"
                            lineHeight={18}
                            textAlign="right"
                            text={accountNumber}
                        />
                    </View>
                </View>
            ) : null}
            {accountNumber ? <SpaceFiller height={16} /> : null}
            {referenceId ? (
                <View style={Style.rowedContainer}>
                    <View style={Style.descriptionBox}>
                        <Typo
                            fontSize={12}
                            fontWeight="400"
                            lineHeight={18}
                            textAlign="left"
                            text={REFERENCE_ID}
                        />
                    </View>
                    <View style={Style.dataBox}>
                        <Typo
                            fontSize={12}
                            fontWeight="600"
                            lineHeight={18}
                            textAlign="right"
                            text={referenceId}
                        />
                    </View>
                </View>
            ) : null}
            {referenceId ? <SpaceFiller height={16} /> : null}
            <View style={Style.rowedContainer}>
                <View style={Style.descriptionBox}>
                    <Typo
                        fontSize={12}
                        fontWeight="400"
                        lineHeight={18}
                        textAlign="left"
                        text={DATE_AND_TIME}
                    />
                </View>
                <View style={Style.dataBox}>
                    <Typo
                        fontSize={12}
                        fontWeight="600"
                        lineHeight={18}
                        textAlign="right"
                        text={dateAndTime}
                    />
                </View>
            </View>
        </React.Fragment>
    );
};

SuccessDetailsViewWithAccountNumber.propTypes = {
    accountType: PropTypes.string,
    accountNumber: PropTypes.string,
    dateAndTime: PropTypes.string,
    referenceId: PropTypes.string,
};

const Style = StyleSheet.create({
    dataBox: {
        width: 160,
    },

    descriptionBox: {
        width: 153,
    },

    rowedContainer: {
        flexDirection: "row",
        justifyContent: "space-between",
    },
});
