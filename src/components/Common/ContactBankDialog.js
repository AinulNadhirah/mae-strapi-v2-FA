import React, { Component } from "react";
import { View, StyleSheet, TouchableOpacity, Image } from "react-native";
import { MyView } from "@components/Common";
import { Dialog } from "react-native-simple-dialogs";
import Typo from "@components/Text";

const ContactBankDialog = ({ onClose, showClose = true, onParam1Press }) => {
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
                        <Typo
                            fontSize={14}
                            fontWeight={"600"}
                            lineHeight={18}
                            textAlign={"left"}
                            text="Contact Bank"
                        />
                        <View style={styles.descriptionContainer}>
                            <Typo
                                fontSize={14}
                                fontWeight={"normal"}
                                lineHeight={20}
                                textAlign={"left"}
                                text={`For any enquiries regarding your account, please call the\nCustomer Care Hotline at`}
                            />
                            <Typo
                                fontSize={14}
                                fontWeight={"600"}
                                lineHeight={20}
                                textAlign={"left"}
                                text="1 300 88 6688."
                            />
                        </View>
                        <View style={styles.actionBtnContainer}>
                            <TouchableOpacity style={styles.primaryButton} onPress={onParam1Press}>
                                <Typo
                                    fontSize={14}
                                    fontWeight={"600"}
                                    lineHeight={18}
                                    text="Call Now"
                                />
                            </TouchableOpacity>
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
    actionBtnContainer: {
        marginTop: 20,
    },
    primaryButton: {
        width: "100%",
        height: 46,
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#ffde00",
        alignSelf: "center",
        borderRadius: 24,
        marginTop: 32,
    },
});

export default ContactBankDialog;
