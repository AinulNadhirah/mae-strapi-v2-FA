import PropTypes from "prop-types";
import React, { useCallback } from "react";
import { View, StyleSheet, Dimensions, FlatList } from "react-native";

import Typo from "@components/Text";

import { DARK_GREY, WHITE, BLACK, RED, LIGHT_GREY, TRANSPARENT } from "@constants/colors";

export const { width, height } = Dimensions.get("window");

// const dataS = [
//     {
//         date: "16 05 30",
//         notifications: [{ message: "new goal created", formattedTime: "2.00 pm", seen: false }],
//     },
//     {
//         date: "Yesterday",
//         notifications: [
//             { message: "Friend joined", formattedTime: "1.00 am", seen: true },
//             { message: "goal funded 50.00", formattedTime: "3.00 pm", seen: false },
//         ],
//     },
//     {
//         date: "Today",
//         notifications: [
//             { message: "goal funded by 200.00 ", formattedTime: "12.00 pm", seen: true },
//             { message: "goal funded by 30.00 ", formattedTime: "11.00 pm", seen: false },
//             {
//                 message:
//                     "Deprecated Gradle features were used in this build, making it incompatible with Gradle 6.0. \nUse '--warning-mode all' to show the individual \ndeprecation warnings.See https://docs.gradle.org/5.4.1/userguide/command_line_interface.html#sec:command_line_warnings ",
//                 formattedTime: "4.00 pm",
//                 seen: true,
//             },
//         ],
//     },
// ];

const MainItems = ({ item }) => {
    const renderSubItems = useCallback(({ item }) => <SubItems item={item} />, []);

    return (
        <View>
            <View style={styles.titleView}>
                <Typo
                    fontSize={12}
                    fontWeight="500"
                    fontStyle="normal"
                    lineHeight={18}
                    letterSpacing={0}
                    color={BLACK}
                    textAlign="left"
                    text={item.date}
                    style={styles.title}
                />
            </View>
            <FlatList data={item.notifications} renderItem={renderSubItems} />
        </View>
    );
};

MainItems.propTypes = {
    item: PropTypes.shape({
        date: PropTypes.any,
        notifications: PropTypes.any,
    }),
};

const SubItems = ({ item }) => {
    return (
        <View style={styles.contentMainView}>
            <View style={styles.contentView}>
                <Typo
                    fontSize={12}
                    fontWeight="300"
                    fontStyle="normal"
                    lineHeight={18}
                    letterSpacing={0}
                    color={BLACK}
                    textAlign="left"
                    text={item.message}
                    style={styles.contentTitle}
                />
                <Typo
                    fontSize={12}
                    fontWeight="300"
                    fontStyle="normal"
                    lineHeight={18}
                    letterSpacing={0}
                    color={DARK_GREY}
                    textAlign="left"
                    text={item.formattedTime}
                    style={styles.contentTime}
                />
            </View>
            <View style={styles.dotContainer}>
                {item.seen ? <View style={styles.dot} /> : <View style={styles.reddot} />}
            </View>
        </View>
    );
};

SubItems.propTypes = {
    item: PropTypes.shape({
        formattedTime: PropTypes.any,
        message: PropTypes.any,
        seen: PropTypes.any,
    }),
};

const Activity = (data) => {
    const renderItem = useCallback(({ item }) => <MainItems item={item} />, []);

    return (
        <View style={data.data.length > 0 ? styles.container : styles.plain}>
            <FlatList data={data.data} renderItem={renderItem} style={{ marginBottom: 30 }} />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        alignItems: "center",
        backgroundColor: TRANSPARENT,
        flex: 1,
        justifyContent: "center",
        width: "100%",
    },
    contentMainView: {
        alignItems: "flex-start",
        backgroundColor: WHITE,
        borderColor: LIGHT_GREY,
        borderRadius: 10,
        borderWidth: 1,
        flexDirection: "row",
        marginTop: 16,
        width: width - 60,
    },
    contentTime: {
        marginBottom: 12,
        marginLeft: 16,
        marginTop: 12,
    },
    contentTitle: {
        marginLeft: 16,
        marginRight: 30,
        marginTop: 12,
    },
    contentView: {
        alignItems: "flex-start",
        flexDirection: "column",
        marginTop: 2,
        width: width - 80,
    },
    dot: {
        alignSelf: "center",
        backgroundColor: TRANSPARENT,
        borderRadius: 8,
        height: 8,
        marginRight: 10,
        marginTop: 10,
        width: 8,
    },
    dotContainer: {
        alignContent: "center",
        alignItems: "center",
        marginTop: 4,
        width: 10,
    },
    plain: {
        alignItems: "center",
        backgroundColor: TRANSPARENT,
        flex: 1,
        justifyContent: "center",
        width: "100%",
    },
    reddot: {
        alignSelf: "center",
        backgroundColor: RED,
        borderRadius: 8,
        height: 8,
        marginRight: 10,
        marginTop: 10,
        width: 8,
    },
    title: {
        marginTop: 24,
    },
    titleView: {
        alignItems: "flex-start",
        flexDirection: "row",
    },
});

export default React.memo(Activity);
