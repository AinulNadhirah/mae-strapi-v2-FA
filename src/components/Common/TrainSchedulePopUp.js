/* eslint-disable react/jsx-no-bind */
/* eslint-disable react/prop-types */
import React from "react";
import { View, Image, TouchableOpacity, ScrollView, Text } from "react-native";
import { HighlightText } from "./HighlightText";
import { MyView } from "@components/Common";
import { Dialog } from "react-native-simple-dialogs";
import Typo from "@components/Text";

const TrainSchedulePopUp = ({ visible, onClose }) => {
    return (
        <MyView hide={!visible} style={Styles.container}>
            <View>
                <View style={Styles.block}>
                    <View style={Styles.imageContainer}>
                        <TouchableOpacity onPress={onClose}>
                            <Image
                                style={Styles.closeButton}
                                source={require("@assets/icons/icon45WhiteCancelSmall.png")}
                            />
                        </TouchableOpacity>
                    </View>

                    <View style={Styles.titleContainer}>
                        <Typo
                            fontSize={16}
                            fontWeight="600"
                            fontStyle="normal"
                            letterSpacing={0}
                            lineHeight={16}
                            color={"#ffffff"}
                        >
                            <Text>Train Schedule</Text>
                        </Typo>
                    </View>

                    <View style={Styles.imageContainer1} />
                </View>

                <View style={Styles.descriptionContainer}>
                    <ScrollView>
                        <View style={Styles.content}>
                            <View style={Styles.firstContainerRow}>
                                <View style={Styles.modelTitleText}>
                                    <Typo
                                        fontSize={18}
                                        fontWeight="bold"
                                        fontStyle="normal"
                                        letterSpacing={0}
                                        lineHeight={32}
                                        color={"#ffffff"}
                                    >
                                        <Text>First Train</Text>
                                    </Typo>
                                </View>
                                <View style={Styles.firstTrainRow}>
                                    <View style={Styles.firstTrainItemRow}>
                                        <Typo
                                            fontSize={12}
                                            fontWeight="normal"
                                            fontStyle="normal"
                                            letterSpacing={0}
                                            lineHeight={18}
                                            color={"#ffffff"}
                                        >
                                            <Text>Origin</Text>
                                        </Typo>
                                    </View>
                                    <View style={Styles.firstTrainItemRow}>
                                        <Typo
                                            fontSize={12}
                                            fontWeight="normal"
                                            fontStyle="normal"
                                            letterSpacing={0}
                                            lineHeight={18}
                                            color={"#ffffff"}
                                        >
                                            <Text>Destination</Text>
                                        </Typo>
                                    </View>
                                    <View style={Styles.firstTrainItemRow}>
                                        <Typo
                                            fontSize={12}
                                            fontWeight="normal"
                                            fontStyle="normal"
                                            letterSpacing={0}
                                            lineHeight={18}
                                            color={"#ffffff"}
                                        >
                                            <Text>Hour</Text>
                                        </Typo>
                                    </View>
                                </View>
                                <View style={Styles.line} />

                                <View style={Styles.secondTrainRow}>
                                    <View style={Styles.firstTrainItemRow}>
                                        <Typo
                                            fontSize={14}
                                            fontWeight="normal"
                                            fontStyle="normal"
                                            letterSpacing={0}
                                            lineHeight={18}
                                            color={"#ffffff"}
                                        >
                                            <Text>KL Sentral</Text>
                                        </Typo>
                                    </View>
                                    <View style={Styles.firstTrainItemRow}>
                                        <Typo
                                            fontSize={14}
                                            fontWeight="normal"
                                            fontStyle="normal"
                                            letterSpacing={0}
                                            lineHeight={18}
                                            color={"#ffffff"}
                                        >
                                            <Text>KLIA/KLIA2</Text>
                                        </Typo>
                                    </View>
                                    <View style={Styles.firstTrainItemRow}>
                                        <Typo
                                            fontSize={14}
                                            fontWeight="normal"
                                            fontStyle="normal"
                                            letterSpacing={0}
                                            lineHeight={18}
                                            color={"#ffffff"}
                                        >
                                            <Text>05:00am</Text>
                                        </Typo>
                                    </View>
                                </View>

                                <View style={Styles.thirdTrainRow}>
                                    <View style={Styles.firstTrainItemRow}>
                                        <Typo
                                            fontSize={14}
                                            fontWeight="normal"
                                            fontStyle="normal"
                                            letterSpacing={0}
                                            lineHeight={18}
                                            color={"#ffffff"}
                                        >
                                            <Text>KLIA</Text>
                                        </Typo>
                                    </View>
                                    <View style={Styles.firstTrainItemRow}>
                                        <Typo
                                            fontSize={14}
                                            fontWeight="normal"
                                            fontStyle="normal"
                                            letterSpacing={0}
                                            lineHeight={18}
                                            color={"#ffffff"}
                                        >
                                            <Text>KL Sentral</Text>
                                        </Typo>
                                    </View>
                                    <View style={Styles.firstTrainItemRow}>
                                        <Typo
                                            fontSize={14}
                                            fontWeight="normal"
                                            fontStyle="normal"
                                            letterSpacing={0}
                                            lineHeight={18}
                                            color={"#ffffff"}
                                        >
                                            <Text>05:00am</Text>
                                        </Typo>
                                    </View>
                                </View>

                                <View style={Styles.thirdTrainRow}>
                                    <View style={Styles.firstTrainItemRow}>
                                        <Typo
                                            fontSize={14}
                                            fontWeight="normal"
                                            fontStyle="normal"
                                            letterSpacing={0}
                                            lineHeight={18}
                                            color={"#ffffff"}
                                        >
                                            <Text>KLIA2</Text>
                                        </Typo>
                                    </View>
                                    <View style={Styles.firstTrainItemRow}>
                                        <Typo
                                            fontSize={14}
                                            fontWeight="normal"
                                            fontStyle="normal"
                                            letterSpacing={0}
                                            lineHeight={18}
                                            color={"#ffffff"}
                                        >
                                            <Text>KLIA/KL Sentral</Text>
                                        </Typo>
                                    </View>
                                    <View style={Styles.firstTrainItemRow}>
                                        <Typo
                                            fontSize={14}
                                            fontWeight="normal"
                                            fontStyle="normal"
                                            letterSpacing={0}
                                            lineHeight={18}
                                            color={"#ffffff"}
                                        >
                                            <Text>04:55am</Text>
                                        </Typo>
                                    </View>
                                </View>
                            </View>

                            <View style={Styles.firstContainerRow}>
                                <View style={Styles.modelTitleText}>
                                    <Typo
                                        fontSize={18}
                                        fontWeight="bold"
                                        fontStyle="normal"
                                        letterSpacing={0}
                                        lineHeight={32}
                                        color={"#ffffff"}
                                    >
                                        <Text>Last Train</Text>
                                    </Typo>
                                </View>
                                <View style={Styles.firstTrainRow}>
                                    <View style={Styles.firstTrainItemRow}>
                                        <Typo
                                            fontSize={12}
                                            fontWeight="normal"
                                            fontStyle="normal"
                                            letterSpacing={0}
                                            lineHeight={18}
                                            color={"#ffffff"}
                                        >
                                            <Text>Origin</Text>
                                        </Typo>
                                    </View>
                                    <View style={Styles.firstTrainItemRow}>
                                        <Typo
                                            fontSize={12}
                                            fontWeight="normal"
                                            fontStyle="normal"
                                            letterSpacing={0}
                                            lineHeight={18}
                                            color={"#ffffff"}
                                        >
                                            <Text>Destination</Text>
                                        </Typo>
                                    </View>
                                    <View style={Styles.firstTrainItemRow}>
                                        <Typo
                                            fontSize={12}
                                            fontWeight="normal"
                                            fontStyle="normal"
                                            letterSpacing={0}
                                            lineHeight={18}
                                            color={"#ffffff"}
                                        >
                                            <Text>Hour</Text>
                                        </Typo>
                                    </View>
                                </View>
                                <View style={Styles.line} />

                                <View style={Styles.secondTrainRow}>
                                    <View style={Styles.firstTrainItemRow}>
                                        <Typo
                                            fontSize={14}
                                            fontWeight="normal"
                                            fontStyle="normal"
                                            letterSpacing={0}
                                            lineHeight={18}
                                            color={"#ffffff"}
                                        >
                                            <Text>KL Sentral</Text>
                                        </Typo>
                                    </View>
                                    <View style={Styles.firstTrainItemRow}>
                                        <Typo
                                            fontSize={14}
                                            fontWeight="normal"
                                            fontStyle="normal"
                                            letterSpacing={0}
                                            lineHeight={18}
                                            color={"#ffffff"}
                                        >
                                            <Text>KLIA/KLIA2</Text>
                                        </Typo>
                                    </View>
                                    <View style={Styles.firstTrainItemRow}>
                                        <Typo
                                            fontSize={14}
                                            fontWeight="normal"
                                            fontStyle="normal"
                                            letterSpacing={0}
                                            lineHeight={18}
                                            color={"#ffffff"}
                                        >
                                            <Text>00:40am</Text>
                                        </Typo>
                                    </View>
                                </View>

                                <View style={Styles.thirdTrainRow}>
                                    <View style={Styles.firstTrainItemRow}>
                                        <Typo
                                            fontSize={14}
                                            fontWeight="normal"
                                            fontStyle="normal"
                                            letterSpacing={0}
                                            lineHeight={18}
                                            color={"#ffffff"}
                                        >
                                            <Text>KLIA</Text>
                                        </Typo>
                                    </View>
                                    <View style={Styles.firstTrainItemRow}>
                                        <Typo
                                            fontSize={14}
                                            fontWeight="normal"
                                            fontStyle="normal"
                                            letterSpacing={0}
                                            lineHeight={18}
                                            color={"#ffffff"}
                                        >
                                            <Text>KL Sentral</Text>
                                        </Typo>
                                    </View>
                                    <View style={Styles.firstTrainItemRow}>
                                        <Typo
                                            fontSize={14}
                                            fontWeight="normal"
                                            fontStyle="normal"
                                            letterSpacing={0}
                                            lineHeight={18}
                                            color={"#ffffff"}
                                        >
                                            <Text>01:00am</Text>
                                        </Typo>
                                    </View>
                                </View>

                                <View style={Styles.thirdTrainRow}>
                                    <View style={Styles.firstTrainItemRow}>
                                        <Typo
                                            fontSize={14}
                                            fontWeight="normal"
                                            fontStyle="normal"
                                            letterSpacing={0}
                                            lineHeight={18}
                                            color={"#ffffff"}
                                        >
                                            <Text>KLIA2</Text>
                                        </Typo>
                                    </View>
                                    <View style={Styles.firstTrainItemRow}>
                                        <Typo
                                            fontSize={14}
                                            fontWeight="normal"
                                            fontStyle="normal"
                                            letterSpacing={0}
                                            lineHeight={18}
                                            color={"#ffffff"}
                                        >
                                            <Text>KLIA/KL Sentral</Text>
                                        </Typo>
                                    </View>
                                    <View style={Styles.firstTrainItemRow}>
                                        <Typo
                                            fontSize={14}
                                            fontWeight="normal"
                                            fontStyle="normal"
                                            letterSpacing={0}
                                            lineHeight={18}
                                            color={"#ffffff"}
                                        >
                                            <Text>00:55am</Text>
                                        </Typo>
                                    </View>
                                </View>
                            </View>
                            <View style={Styles.pealHourContainerRow}>
                                <Typo
                                    fontSize={12}
                                    fontWeight="normal"
                                    fontStyle="normal"
                                    letterSpacing={0}
                                    lineHeight={18}
                                    color={"#ffffff"}
                                >
                                    <Text>
                                        {"*Peak hours: Sunday - Friday 06:00-09:00, 16:00-22:00"}
                                    </Text>
                                </Typo>
                                <Typo
                                    fontSize={12}
                                    fontWeight="normal"
                                    fontStyle="normal"
                                    letterSpacing={0}
                                    lineHeight={18}
                                    color={"#ffffff"}
                                >
                                    <Text>{"(approximate)"}</Text>
                                </Typo>
                            </View>

                            <View style={Styles.firstContainerRow}>
                                <View style={Styles.modelTitleText}>
                                    <Typo
                                        fontSize={18}
                                        fontWeight="bold"
                                        fontStyle="normal"
                                        letterSpacing={0}
                                        lineHeight={32}
                                        color={"#ffffff"}
                                    >
                                        <Text>Frequency</Text>
                                    </Typo>
                                </View>
                                <View style={Styles.pealHourRow}>
                                    <View style={Styles.bulletDot} />
                                    <View style={Styles.listItemRow}>
                                        <Typo
                                            fontSize={14}
                                            fontWeight="normal"
                                            fontStyle="normal"
                                            letterSpacing={0}
                                            lineHeight={20}
                                            color={"#ffffff"}
                                        >
                                            <Text>Every 15 minutes during peak hours</Text>
                                        </Typo>
                                    </View>
                                </View>

                                <View style={Styles.pealHourRow}>
                                    <View style={Styles.bulletDot} />
                                    <View style={Styles.listItemRow}>
                                        <Typo
                                            fontSize={14}
                                            fontWeight="normal"
                                            fontStyle="normal"
                                            letterSpacing={0}
                                            lineHeight={20}
                                            color={"#ffffff"}
                                        >
                                            <Text>{"Every 20 minutes during off-peak hours,"}</Text>
                                        </Typo>
                                        <Typo
                                            fontSize={14}
                                            fontWeight="normal"
                                            fontStyle="normal"
                                            letterSpacing={0}
                                            lineHeight={20}
                                            color={"#ffffff"}
                                        >
                                            <Text>{"every 30 minutes after midnight"}</Text>
                                        </Typo>
                                    </View>
                                </View>
                            </View>

                            <View style={Styles.lastContainerRow}>
                                <View style={Styles.modelTitleText}>
                                    <Typo
                                        fontSize={18}
                                        fontWeight="bold"
                                        fontStyle="normal"
                                        letterSpacing={0}
                                        lineHeight={32}
                                        color={"#ffffff"}
                                    >
                                        <Text>Journey Time</Text>
                                    </Typo>
                                </View>
                                <View style={Styles.pealHourRow}>
                                    <View style={Styles.bulletDot} />
                                    <View style={Styles.listItemRow}>
                                        <Typo
                                            fontSize={14}
                                            fontWeight="normal"
                                            fontStyle="normal"
                                            letterSpacing={0}
                                            lineHeight={20}
                                            color={"#ffffff"}
                                        >
                                            <Text>KL Sentral - KLIA (28 min) / KLIA2 (33 min)</Text>
                                        </Typo>
                                    </View>
                                </View>
                            </View>
                        </View>
                    </ScrollView>
                </View>
            </View>
        </MyView>
    );
};

const Styles = {
    container: {
        flex: 1,
        flexDirection: "row",
        justifyContent: "flex-start",
        alignItems: "flex-start",
        alignContent: "flex-start",
        top: 0,
        bottom: 0,
        left: 0,
        right: 0,
        opacity: 1,
        position: "absolute",
        backgroundColor: "#000000",
    },
    block: {
        flexDirection: "row",
        alignItems: "flex-start",
        justifyContent: "space-between",
        marginTop: 49,
        width: "100%",
    },
    titleContainer: { alignItems: "flex-start", flex: 3 },
    imageContainer: {
        alignItems: "flex-start",
        flex: 1,
        marginLeft: 42,
        backgroundColor: "#000000",
        opacity: 1,
    },
    imageContainer1: {
        alignItems: "flex-end",
        flex: 1,
        marginLeft: 0,
        marginRight: 32,
        backgroundColor: "#000000",
    },
    titleNormal: {
        fontFamily: "montserrat",
        fontSize: 16,
        fontWeight: "600",
        fontStyle: "normal",
        lineHeight: 18,
        letterSpacing: 0,
        color: "#ffffff",
    },
    closeButton: {
        height: 15,
        width: 15,
        backgroundColor: "#000000",
    },
    descriptionContainer: { marginTop: 10, marginLeft: 24, marginRight: 22 },
    modelTextRow: {
        flexDirection: "row",
        marginTop: 7,
        marginBottom: 7,
    },
    content: {
        flexDirection: "column",
        width: "100%",
        marginBottom: 50,
        alignContent: "flex-start",
        alignItems: "flex-start",
        justifyContent: "space-around",
    },
    firstContainerRow: {
        flexDirection: "column",
        width: "80%",
        marginTop: 14,
        alignContent: "flex-start",
        alignItems: "flex-start",
        justifyContent: "space-around",
    },
    firstTrainRow: {
        flexDirection: "row",
        width: "100%",
        marginTop: 14,
        alignContent: "flex-start",
        alignItems: "flex-start",
        justifyContent: "space-around",
    },
    pealHourRow: {
        flexDirection: "row",
        width: "100%",

        alignContent: "flex-start",
        alignItems: "flex-start",
        justifyContent: "flex-start",
        marginTop: 10,
    },
    listItemRow: {
        flexDirection: "column",
        alignContent: "flex-start",
        alignItems: "flex-start",
        alignSelf: "flex-start",
        justifyContent: "flex-start",
        marginTop: -6,
    },
    bulletDot: {
        width: 8,
        height: 8,
        borderRadius: 8 / 2,
        backgroundColor: "#ffffff",
        marginRight: 8,
    },
    firstTrainItemRow: {
        flexDirection: "row",
        flex: 1,
        alignContent: "flex-start",
        alignItems: "flex-start",
        justifyContent: "flex-start",
    },
    lastContainerRow: {
        flexDirection: "column",
        width: "80%",
        marginTop: 14,
        marginBottom: 80,
        alignContent: "flex-start",
        alignItems: "flex-start",
        justifyContent: "space-around",
    },
    secondTrainRow: {
        flexDirection: "row",
        width: "100%",
        marginTop: 15.4,

        alignContent: "flex-start",
        alignItems: "flex-start",
        justifyContent: "space-around",
    },
    thirdTrainRow: {
        flexDirection: "row",
        width: "100%",
        marginTop: 16,

        alignContent: "flex-start",
        alignItems: "flex-start",
        justifyContent: "space-around",
    },
    line: {
        flexDirection: "row",
        width: "80%",
        marginTop: 7,
        marginBottom: 7,
        height: 1,
        borderStyle: "solid",
        borderWidth: 1,
        borderColor: "#979797",
        justifyContent: "space-around",
    },

    pealHourContainerRow: {
        flexDirection: "column",
        width: "80%",
        marginTop: 39,
        alignContent: "flex-start",
        alignItems: "flex-start",
        justifyContent: "flex-start",
    },

    modelTitleText: {
        fontSize: 18,
        marginTop: 37,
        marginBottom: 4,
    },
    modelText: {
        fontFamily: "montserrat",
        fontSize: 14,
        fontWeight: "normal",
        fontStyle: "normal",
        lineHeight: 20,
        letterSpacing: 0,
        color: "#ffffff",
    },
    modelTextBold: {
        fontFamily: "montserrat",
        fontSize: 14,
        fontWeight: "700",
        fontStyle: "normal",
        lineHeight: 20,
        letterSpacing: 0,
        color: "#ffffff",
    },
};

export { TrainSchedulePopUp };
