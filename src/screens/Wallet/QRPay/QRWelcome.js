import React, { Component } from "react";
import {
    View,
    Image,
    StyleSheet,
    Picker,
    Text,
    ImageBackground,
    Alert,
    Dimensions,
} from "react-native";
import { Input, AvatarCircle } from "@components/Common";
import { SetupNow } from "@components/Common";
import commonStyle from "@styles/main";
import Typo from "@components/Text";
export const { width, height } = Dimensions.get("window");

const QRWelcome = () => {
    return (
        <View style={styles.container}>
            <View style={styles.block}>
                <View
                    style={{
                        height: "50%",
                        overflow: "hidden",
                        width: "90%",
                        marginLeft: 20,
                        top: 0,
                    }}
                >
                    <Image
                        source={require("@assets/images/im_qrpay.png")}
                        resizeMode="contain"
                        style={{
                            left: 0,
                            position: "absolute",
                            top: 0,
                        }}
                    />
                </View>
                <View style={styles.titleContainer}>
                    <Typo
                        fontSize={20}
                        fontWeight={"600"}
                        color={"#000000"}
                        lineHeight={22}
                        textAlign={"center"}
                        style={{ marginTop: 20 }}
                        text={"Scan. Pay. Go!"}
                    />
                </View>
                <View style={styles.descriptionContainer}>
                    <Typo
                        fontSize={16}
                        fontWeight={"100"}
                        color={"#000000"}
                        lineHeight={20}
                        textAlign={"center"}
                        style={{ marginTop: 10 }}
                        text={
                            "Go cashless with Scan & Pay! Simply scan the QR code at participating merchants to pay."
                        }
                    />
                </View>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: { backgroundColor: "transparent", flex: 1, width: "100%" },
    block: { flexDirection: "column" },
    titleContainer: { marginTop: 10, width: width - 36, justifyContent: "center" },
    titleText: { color: "#000000", fontWeight: "700", fontSize: 18 },
    descriptionContainer: {
        marginTop: 5,
        width: width - 36,
        justifyContent: "center",
    },
    descriptionText: { color: "#000000", fontWeight: "100", fontSize: 24 },
    imageContainer: { marginTop: 20, justifyContent: "center", alignItems: "center" },
    imageText: { color: "#000000", fontWeight: "400", fontSize: 20 },
    setupContainer: { marginLeft: 30, marginTop: 30 },
    bgContainer: { width: "100%", marginTop: 10, marginBottom: 1, backgroundColor: "blue" },
    bg: {
        marginLeft: 25,
        marginRight: 10,
        marginTop: 40,
        backgroundColor: "red",
    },
});

export default QRWelcome;
