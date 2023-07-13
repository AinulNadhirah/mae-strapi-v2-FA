import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, Image } from "react-native";

import Typo from "@components/Text";
import PropTypes from "prop-types";
import TrackerWidgetCard from "@components/Cards/TrackerWidgetCard";

const EmptyStateWidget = ({
    title,
    description,
    actionTitle,
    onActionPressed,
    showInfo,
    ...props
}) => (
    <TrackerWidgetCard title={title} onInfoPressed={() => showInfo(title)}>
        <View style={styles.contentContainer}>
            {title !== "Tabung" ? (
                <Image
                    style={styles.emptyIcon}
                    source={require("@assets/icons/Tracker/emptyBill.png")}
                />
            ) : (
                <Image
                    style={styles.emptyIcon}
                    source={require("@assets/icons/Tracker/tabung.png")}
                />
            )}

            <View style={styles.rightContentContainer}>
                <Typo textAlign="left" fontSize={14} lineHeight={19}>
                    <Text>{description}</Text>
                </Typo>

                <View style={{ marginTop: 16 }}>
                    <TouchableOpacity onPress={onActionPressed}>
                        <Typo textAlign="left" fontSize={14} lineHeight={18} fontWeight="600">
                            <Text style={{ color: "#4a90e2" }}>{actionTitle}</Text>
                        </Typo>
                    </TouchableOpacity>
                </View>
            </View>
        </View>
    </TrackerWidgetCard>
);

EmptyStateWidget.propTypes = {
    title: PropTypes.string.isRequired,
    description: PropTypes.string.isRequired,
    actionTitle: PropTypes.string.isRequired,
    onActionPressed: PropTypes.func.isRequired,
    showInfo: PropTypes.func.isRequired,
};

EmptyStateWidget.defaultProps = {
    title: "-",
    description: "-",
    actionTitle: "-",
    onActionPressed: () => {},
    showInfo: () => {},
};

const Memoiz = React.memo(EmptyStateWidget);

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
