import React, { Component } from "react";
import {
    View,
    Image,
    StyleSheet,
    Picker,
    Text,
    TouchableOpacity,
    Alert,
    FlatList,
} from "react-native";
import LinearGradient from "react-native-linear-gradient";
import commonStyle from "@styles/main";
import PDFView from "react-native-view-pdf";

const PdfViewer = ({ pdfFile, onBackPress, onSharePress, noShare, type }) => {
    function maskAccount(text) {
        let acc = text.substring(0, 12);
        let mask = "**** **** " + acc.substring(8, 12);
        return mask;
    }
    return (
        <View style={{ flex: 1 }}>
            <View
                style={{ flex: 1, flexDirection: "row", justifyContent: "center", width: "100%" }}
            >
                <View style={{ alignItems: "flex-start", width: "50%", marginLeft: 30 }}>
                    <TouchableOpacity
                        style={{
                            height: 50,
                            width: 50,
                            alignItems: "center",
                            justifyContent: "center",
                            flex: 1,
                        }}
                        onPress={() => {
                            onBackPress();
                        }}
                        accessibilityLabel={"btnShare"}
                    >
                        <Image
                            style={{
                                height: 30,
                                width: 50,
                            }}
                            source={require("@assets/icons/icn_back.png")}
                        />
                    </TouchableOpacity>
                </View>
                <View style={{ alignItems: "flex-end", width: "50%", marginRight: 30 }}>
                    <TouchableOpacity
                        style={{
                            height: 50,
                            width: 50,
                            alignItems: "center",
                            justifyContent: "center",
                            flex: 1,
                        }}
                        onPress={async () => {
                            onSharePress();
                        }}
                        accessibilityLabel={"btnShare"}
                    >
                        <Image
                            style={{
                                height: 30,
                                width: 50,
                            }}
                            source={require("@assets/icons/ic_share_black.png")}
                        />
                    </TouchableOpacity>
                </View>
            </View>

            <PDFView
                fadeInDuration={250.0}
                style={{ flex: 9 }}
                resource={pdfFile}
                resourceType={type}
                onLoad={() => console.log("PDF rendered from " + pdfFile)}
                onError={(error) => {
                    console.log("Cannot render PDF", error);
                    Alert.alert(JSON.stringify(error));
                }}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        marginTop: 4,
        width: "100%",
        backgroundColor: "#ffffff",
        borderTopRightRadius: 10,
        borderTopLeftRadius: 10,
        justifyContent: "center",
    },
    block: {
        height: 40,
        flexDirection: "row",
        justifyContent: "flex-start",
        alignItems: "center",
        marginTop: 20,
    },
    txtContainer: { height: 40, alignItems: "flex-start", justifyContent: "center", flex: 4 },
    text: { color: "#000000", marginLeft: 25, fontWeight: "700" },
    topView: {
        flexDirection: "column",
        justifyContent: "flex-start",
        alignItems: "center",
    },
    bottomView: {
        flexDirection: "column",
        justifyContent: "flex-start",
        alignItems: "center",
        marginBottom: 11,
    },
    imgContainer: {
        justifyContent: "center",
        alignItems: "center",
        flex: 1,
        marginRight: 25,
    },
    image: {
        height: 40,
        width: 40,
    },
});

export { PdfViewer };
