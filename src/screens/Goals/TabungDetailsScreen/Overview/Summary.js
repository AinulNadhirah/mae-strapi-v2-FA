import PropTypes from "prop-types";
import React from "react";
import { View, StyleSheet } from "react-native";

import SpaceFiller from "@components/Placeholders/SpaceFiller";
import Typo from "@components/Text";

import { formateAccountNumber } from "@utils/dataModel/utility";

const Summary = ({
    formattedTotalAmount,
    formattedStartDate,
    formattedEndDate,
    duration,
    userDetails,
    ownerDetails,
}) => (
    <View style={styles.container}>
        <View style={styles.detailsRowContainer}>
            <Typo text="Target amount" fontSize={14} lineHeight={19} />
            <Typo
                text={`RM ${formattedTotalAmount}`}
                fontSize={14}
                fontWeight="600"
                lineHeight={19}
                textAlign="right"
            />
        </View>
        <SpaceFiller height={16} />
        {!userDetails?.withdrawFull && (
            <React.Fragment>
                <View style={styles.detailsRowContainer}>
                    <Typo text="Duration" fontSize={14} lineHeight={19} />
                    <Typo
                        text={`${duration}`}
                        fontSize={14}
                        fontWeight="600"
                        lineHeight={19}
                        textAlign="right"
                    />
                </View>
                <SpaceFiller height={16} />
            </React.Fragment>
        )}
        <View style={styles.detailsRowContainer}>
            <Typo text="Start date" fontSize={14} lineHeight={19} />
            <Typo
                text={`${formattedStartDate}`}
                fontSize={14}
                fontWeight="600"
                lineHeight={19}
                textAlign="right"
            />
        </View>
        <SpaceFiller height={16} />
        <View style={styles.detailsRowContainer}>
            <Typo text="End date" fontSize={14} lineHeight={19} />
            <Typo
                text={`${formattedEndDate}`}
                fontSize={14}
                fontWeight="600"
                lineHeight={19}
                textAlign="right"
            />
        </View>
        <SpaceFiller height={16} />
        <View style={styles.detailsRowContainer}>
            <Typo text="Total contributed" fontSize={14} lineHeight={19} />
            <Typo
                text={`RM ${userDetails?.formattedTotContributedAmount}`}
                fontSize={14}
                fontWeight="600"
                lineHeight={19}
                textAlign="right"
            />
        </View>
        {userDetails?.withdrawFull && userDetails?.formattedTotContributedAmount !== "0.00" && (
            <React.Fragment>
                <SpaceFiller height={16} />
                <View style={styles.transferDetailRowContainer}>
                    <Typo text="Transferred to" fontSize={14} lineHeight={19} />
                    <View style={styles.transferDetailTextContainer}>
                        <Typo
                            text={
                                userDetails?.transferToOwner
                                    ? ownerDetails?.name ?? ""
                                    : userDetails?.name ?? ""
                            }
                            fontSize={14}
                            fontWeight="600"
                            lineHeight={19}
                            textAlign="right"
                        />
                        <Typo
                            text={`${formateAccountNumber(
                                userDetails?.transferToAcct?.substring(0, 12) ?? ""
                            )}`}
                            fontSize={14}
                            fontWeight="600"
                            lineHeight={19}
                            textAlign="right"
                        />
                    </View>
                </View>
            </React.Fragment>
        )}
    </View>
);

const styles = StyleSheet.create({
    container: {
        marginHorizontal: 12,
        marginVertical: 36,
    },
    detailsRowContainer: {
        alignItems: "center",
        flexDirection: "row",
        justifyContent: "space-between",
    },
    transferDetailRowContainer: {
        alignItems: "flex-start",
        flexDirection: "row",
        justifyContent: "space-between",
    },
    transferDetailTextContainer: {
        alignItems: "flex-end",
        flex: 1,
        justifyContent: "flex-start",
    },
});

Summary.propTypes = {
    formattedTotalAmount: PropTypes.string.isRequired,
    formattedStartDate: PropTypes.string.isRequired,
    formattedEndDate: PropTypes.string.isRequired,
    duration: PropTypes.string.isRequired,
    userDetails: PropTypes.object.isRequired,
    ownerDetails: PropTypes.object.isRequired,
};

export default React.memo(Summary);
