import PropTypes from "prop-types";
import React from "react";
import { StyleSheet, View } from "react-native";

import SpaceFiller from "@components/Placeholders/SpaceFiller";
import Typo from "@components/Text";

import { CDD_ACCOUNT_NUMBER, REFERENCE_ID, DATE_AND_TIME } from "@constants/strings";

export const FailureDetailsViewWithAccountNumber = ({
    accountNumber,
    referenceId,
    dateAndTime,
}) => {
    return (
        <React.Fragment>
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
            {dateAndTime ? (
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
            ) : null}
        </React.Fragment>
    );
};

export const FailureDetailsViewWithReferenceId = ({ referenceId, dateAndTime }) => {
    return (
        <React.Fragment>
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
            <SpaceFiller height={16} />
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

export const FailureDetailsViewWithDateAndTime = ({ dateAndTime }) => {
    return (
        <React.Fragment>
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

FailureDetailsViewWithAccountNumber.propTypes = {
    accountNumber: PropTypes.string,
    dateAndTime: PropTypes.string,
    referenceId: PropTypes.string,
};

FailureDetailsViewWithReferenceId.propTypes = {
    dateAndTime: PropTypes.string,
    referenceId: PropTypes.string,
};

FailureDetailsViewWithDateAndTime.propTypes = {
    dateAndTime: PropTypes.string,
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
