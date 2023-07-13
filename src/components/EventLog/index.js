import _ from "lodash";
import PropTypes from "prop-types";
import React, { useCallback, useState, useEffect } from "react";
import { Alert, View, StyleSheet, FlatList, TouchableOpacity } from "react-native";
import Config from "react-native-config";

import HeaderTrashCanButton from "@components/Buttons/HeaderTrashCanButton";
import Typography from "@components/Text";

import { BLACK_100, BLACK_50, ORANGE, RED, ROYAL_BLUE, WHITE } from "@constants/colors";

import { useEventStateLog } from "@utils/logs";

function keyExtractor(item) {
    return item.id;
}

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

function EventLogRoot() {
    const { events } = useEventStateLog();
    const [mainEvents, setEvents] = useState([]);

    const setupData = useCallback(() => {
        // we wanna massage the events together with the global error
        const globalError = global.errorLogs;
        const mergedEvents = [...events, ...globalError];
        const sortedEvents = _.orderBy(mergedEvents, ["timestamp"], ["desc"]);
        console.tron.log("globalError", global.errorLogs);
        console.tron.log("sortedEvents", sortedEvents);

        setEvents(sortedEvents);
    }, [events]);

    const renderItem = useCallback(({ item }) => {
        return <EventRow item={item} />;
    }, []);

    const emptyTrash = useCallback(() => {}, []);

    const clearEvents = useCallback(() => {
        Alert.alert(
            "Clear all events including persisted?",
            "Events logs up to this point will be clear",
            [
                { text: "Cancel", style: "cancel" },
                { text: "Do it", onPress: () => emptyTrash(), style: "destructive" },
            ]
        );
    }, [emptyTrash]);

    useEffect(() => {
        // we wanna massage the events together with the global error
        if (events) {
            setupData();
        }
    }, [events, setupData]);

    return (
        <View style={styles.wrap}>
            <View style={styles.deleteContainer}>
                {mainEvents.length > 0 && <HeaderTrashCanButton onPress={clearEvents} />}
            </View>
            <FlatList
                data={mainEvents}
                showsVerticalScrollIndicator={false}
                renderItem={renderItem}
                keyExtractor={keyExtractor}
                ListEmptyComponent={
                    <View style={styles.emptyList}>
                        <Typography text="No events logged yet" />
                    </View>
                }
                initialNumToRender={10}
            />
        </View>
    );
}

export default function EventLog() {
    if (Config?.DEV_ENABLE !== "true" || Config?.LOG_RESPONSE_REQUEST !== "true") return null;

    return <EventLogRoot />;
}

const styles = StyleSheet.create({
    deleteContainer: {
        flexDirection: "row",
        justifyContent: "flex-end",
    },
    emptyList: {
        alignItems: "center",
        justifyContent: "center",
        paddingVertical: 42,
    },
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
