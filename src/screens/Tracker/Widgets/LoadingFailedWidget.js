import React from "react";
import { View, Text, StyleSheet, Image } from "react-native";

import Typo from "@components/Text";
import PropTypes from "prop-types";
import TrackerWidgetCard from "@components/Cards/TrackerWidgetCard";

const LoadingFailedWidget = ({ title, ...props }) => (
    <TrackerWidgetCard title={title}>
        <View style={styles.contentContainer}>
            <Image style={styles.emptyIcon} source={require("@assets/icons/Tracker/noData.png")} />

            <View style={styles.rightContentContainer}>
                <Typo textAlign="left" fontSize={14} lineHeight={19}>
                    <Text>Data Unavailable.</Text>
                </Typo>

                <Typo textAlign="left" fontSize={14} lineHeight={19}>
                    <Text>Please check your connection or try again later.</Text>
                </Typo>
            </View>
        </View>
    </TrackerWidgetCard>
);

LoadingFailedWidget.propTypes = {
    title: PropTypes.string.isRequired,
};

LoadingFailedWidget.defaultProps = {
    title: "-",
};

const Memoiz = React.memo(LoadingFailedWidget);

export default Memoiz;

const styles = StyleSheet.create({
    contentContainer: {
        flexDirection: "row",
        justifyContent: "space-between",
        width: "100%",
        alignItems: "flex-start",
        marginBottom: 24,
    },
    rightContentContainer: {
        flex: 1,
        flexDirection: "column",
    },
    emptyIcon: { width: 48, height: 48, marginRight: 16, marginLeft: 8, marginTop: 4 },
});
