import React, { Component } from "react";
import { View, Text, StyleSheet, TouchableOpacity, Image } from "react-native";
import { MyView } from "@components/Common";
import { Dialog } from "react-native-simple-dialogs";
import Typo from "@components/Text";

const ErrorMessageV2 = ({
    title,
    description,
    showOk,
    onClose,
    showClose = true,
    customParam1,
    customParam2,
    onParam1Press,
    onParam2Press,
    customParam,
    onParamPress,
}) => {
    console.log(showClose, customParam, onParamPress, showOk);
    return (
        <View>
            <Dialog
                visible={true}
                onTouchOutside={() => {}}
                animationType="fade"
                onRequestClose={onClose}
                dialogStyle={{ borderRadius: 10 }}
                overlayStyle={{}}
                contentStyle={{}}
            >
                <View>
                    <View style={styles.block}>
                        <View style={styles.titleContainer} />
                        <View style={styles.imageContainer}>
                            <MyView hide={!showClose}>
                                <TouchableOpacity onPress={onClose}>
                                    <Image
                                        style={styles.button}
                                        source={require("@assets/icons/ic_close.png")}
                                    />
                                </TouchableOpacity>
                            </MyView>
                        </View>
                    </View>
                    <View style={{ paddingHorizontal: 24 }}>
                        <Typo fontSize={14} fontWeight={"600"} lineHeight={18} textAlign={"left"}>
                            <Text>{title}</Text>
                        </Typo>
                        {description ? (
                            <View style={styles.descriptionContainer}>
                                <Typo
                                    fontSize={14}
                                    fontWeight={"normal"}
                                    lineHeight={20}
                                    textAlign={"left"}
                                    text={description}
                                />
                            </View>
                        ) : null}
                        <View style={styles.deleteCollectionButtonContainer}>
                            {customParam1 && (
                                <TouchableOpacity
                                    style={styles.primaryButton}
                                    onPress={onParam1Press}
                                >
                                    <Typo
                                        fontSize={14}
                                        fontWeight={"600"}
                                        lineHeight={18}
                                        text={customParam1}
                                    />
                                </TouchableOpacity>
                            )}

                            {customParam2 && (
                                <TouchableOpacity
                                    style={styles.secondaryButton}
                                    onPress={onParam2Press}
                                >
                                    <Typo
                                        fontSize={14}
                                        fontWeight={"600"}
                                        lineHeight={18}
                                        color={"#4a90e2"}
                                        text={customParam2}
                                    />
                                </TouchableOpacity>
                            )}
                        </View>
                    </View>
                </View>
            </Dialog>
        </View>
    );
};

const styles = StyleSheet.create({
    block: { flexDirection: "row", alignItems: "center" },
    imageContainer: { alignItems: "flex-end", flex: 1 },
    titleContainer: { alignItems: "flex-start", flex: 4 },
    descriptionContainer: { marginTop: 10 },
    button: {
        height: 40,
        width: 40,
    },
    deleteCollectionButtonContainer: {
        marginBottom: 32,
    },
    primaryButton: {
        width: "100%",
        height: 46,
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#ffde00",
        alignSelf: "center",
        borderRadius: 24,
        marginTop: 40,
    },
    secondaryButton: {
        height: 60,
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "transparent",
        alignSelf: "center",
        marginTop: 5,
    },
});

export { ErrorMessageV2 };
