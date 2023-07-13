import PropTypes from "prop-types";
import React, { useCallback, useState } from "react";
import { View, StyleSheet, TouchableOpacity, ScrollView } from "react-native";
import Config from "react-native-config";

import Typography from "@components/Text";

import { useModelState } from "@context";

import { BLACK_100, BLACK_50, ORANGE, RED, ROYAL_BLUE, WHITE } from "@constants/colors";

function EventRow({ item }) {
    const [expandValue, setExpand] = useState(false);

    const onExpand = useCallback(() => setExpand(true), []);
    const onCollapse = useCallback(() => setExpand(false), []);
    const getDate = useCallback(() => {
        if (!item.timestamp) return null;

        return new Date(item.timestamp).toString();
    }, [item.timestamp]);

    return (
        <View style={styles.eventRowContainer}>
            <View style={styles.eventRowMeta}>
                <Typography
                    fontWeight="300"
                    fontSize={10}
                    text={getDate()}
                    textAlign="left"
                    lineHeight={18}
                />
                <View style={styles.eventMetaStatus}>
                    {item?.isFatal && (
                        <View style={styles.eventMetaFatal}>
                            <Typography
                                fontWeight="300"
                                fontSize={8}
                                text="FATAL"
                                textAlign="right"
                                color={WHITE}
                            />
                        </View>
                    )}
                    {item?.isFromPersist && (
                        <View style={styles.eventMetaPersist}>
                            <Typography
                                fontWeight="300"
                                fontSize={8}
                                text="PERSISTED"
                                textAlign="right"
                                color="rgba(0,0,0, .55)"
                            />
                        </View>
                    )}
                </View>
            </View>
            <View style={styles.eventRowName}>
                <Typography fontWeight="300" text="Event" textAlign="left" lineHeight={18} />
                <View style={styles.eventRowNameValue}>
                    <Typography
                        fontWeight="normal"
                        text={item.name}
                        textAlign="left"
                        lineHeight={18}
                    />
                </View>
            </View>
            <View style={styles.eventRowValue}>
                <Typography fontWeight="300" text="Value" textAlign="left" lineHeight={18} />
                <View style={styles.eventRowValueObject}>
                    {expandValue ? (
                        <View>
                            <TouchableOpacity onPress={onCollapse}>
                                <Typography
                                    fontWeight="normal"
                                    textAlign="right"
                                    lineHeight={18}
                                    fontSize={12}
                                    text="Close"
                                    color={ROYAL_BLUE}
                                />
                            </TouchableOpacity>
                            <Typography
                                fontWeight="normal"
                                text={item?.value ? JSON.stringify(item?.value, null, 2) : "N/A"}
                                textAlign="left"
                                lineHeight={18}
                                fontSize={12}
                            />
                        </View>
                    ) : (
                        <TouchableOpacity onPress={onExpand}>
                            <Typography
                                fontWeight="normal"
                                textAlign="left"
                                lineHeight={18}
                                text="Show value"
                            />
                        </TouchableOpacity>
                    )}
                </View>
            </View>
        </View>
    );
}

EventRow.propTypes = {
    item: PropTypes.shape({
        isFatal: PropTypes.any,
        isFromPersist: PropTypes.any,
        name: PropTypes.any,
        timestamp: PropTypes.any,
        value: PropTypes.any,
    }),
};

function ContextViewerRoot() {
    const state = useModelState();

    return (
        <View style={styles.wrap}>
            <View style={styles.eventRowValueObject}>
                <ScrollView>
                    <Typography
                        fontWeight="normal"
                        text={state ? JSON.stringify(state, null, 2) : "N/A"}
                        textAlign="left"
                        lineHeight={18}
                        fontSize={12}
                        selectable
                    />
                </ScrollView>
            </View>
        </View>
    );
}

export default function ContextViewer({ supsonic }) {
    if (!supsonic) {
        if (Config?.DEV_ENABLE !== "true" || Config?.LOG_RESPONSE_REQUEST !== "true") return null;
    }

    return <ContextViewerRoot />;
}

ContextViewer.propTypes = {
    supsonic: PropTypes.bool,
};

const styles = StyleSheet.create({
    eventMetaFatal: {
        backgroundColor: RED,
        borderRadius: 3,
        paddingHorizontal: 4,
        paddingVertical: 2,
    },
    eventMetaPersist: {
        backgroundColor: ORANGE,
        borderRadius: 3,
        marginLeft: 6,
        paddingHorizontal: 4,
        paddingVertical: 2,
    },
    eventMetaStatus: { alignItems: "center", flexDirection: "row" },
    eventRowContainer: {
        borderBottomColor: BLACK_100,
        borderBottomWidth: 1,
        flexDirection: "column",
    },
    eventRowMeta: {
        flexDirection: "row",
        justifyContent: "space-between",
        paddingVertical: 12,
    },
    eventRowName: { alignItems: "center", flexDirection: "row", paddingVertical: 12 },
    eventRowNameValue: {
        flex: 1,
        marginLeft: 12,
    },
    eventRowValue: { alignItems: "center", flexDirection: "row", paddingVertical: 12 },
    eventRowValueObject: {
        backgroundColor: BLACK_50,
        borderRadius: 4,
        flex: 1,
        marginLeft: 12,
        padding: 12,
    },
    wrap: {
        flex: 1,
        paddingHorizontal: 24,
    },
});
