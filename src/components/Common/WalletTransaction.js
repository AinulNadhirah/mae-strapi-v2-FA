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

const WalletTransaction = ({ trnData, onPress, dataAvailable }) => {
    function maskAccount(text) {
        let acc = text.substring(0, 12);
        let mask = "**** **** " + acc.substring(8, 12);
        return mask;
    }
    console.log("dataAvailable", dataAvailable);
    return (
        <View style={styles.container}>
            {dataAvailable === true ? (
                <View style={styles.topView}>
                    <FlatList
                        accessible={true}
                        testID={"lstWalAccounts"}
                        accessibilityLabel={"lstWalAccounts"}
                        data={trnData}
                        keyExtractor={(item, index) => `${item.id}-${index}`}
                        renderItem={({ item, index }) => (
                            <View
                                style={{
                                    backgroundColor: "rgba(0, 0, 0, 0.01)",
                                    borderColor: "#dfdfdf",
                                    borderWidth: 1,
                                    marginTop: 7,
                                    borderRadius: 30,
                                    height: 60,
                                    width: 300,
                                    alignItems: "center",
                                    flexDirection: "row",
                                }}
                            >
                                <View style={{ flexDirection: "row" }}>
                                    <View
                                        style={{
                                            flex: 1,
                                            flexDirection: "column",
                                            height: 40,
                                            alignContent: "center",
                                            justifyContent: "center",
                                            marginLeft: 10,
                                        }}
                                    >
                                        <View
                                            style={{
                                                flex: 1,
                                                margin: 2,
                                                height: 40,
                                                alignContent: "center",
                                                justifyContent: "center",
                                            }}
                                        >
                                            {item.indicator === "C" ? (
                                                <Image
                                                    style={{ width: 30, height: 30 }}
                                                    source={require("@assets/icons/ic_reward_unlock_104.png")}
                                                />
                                            ) : (
                                                <Image
                                                    style={{ width: 30, height: 30 }}
                                                    source={require("@assets/icons/ic_walet_yellow_104.png")}
                                                />
                                            )}
                                        </View>
                                    </View>

                                    <View
                                        style={{
                                            flex: 5,
                                            flexDirection: "column",
                                            height: 45,
                                            alignContent: "center",
                                            justifyContent: "center",
                                            marginLeft: 10,
                                        }}
                                    >
                                        <View
                                            style={{
                                                flex: 1,
                                                margin: 2,
                                                alignContent: "center",
                                                justifyContent: "center",
                                            }}
                                        >
                                            <Text
                                                style={[
                                                    commonStyle.font,
                                                    {
                                                        textAlign: "left",
                                                        marginRight: 5,
                                                        fontSize: 10,
                                                        fontWeight: "600",
                                                        color: "#000000",
                                                    },
                                                ]}
                                                accessible={true}
                                                testID={"lblWalAcc"}
                                                accessibilityLabel={"lblWalAcc"}
                                            >
                                                {item.desc}
                                            </Text>
                                        </View>
                                        {/* <View style={{ flex: 1, margin: 2 }}>
                                    <Text style={[commonStyle.font, { textAlign: "justify", marginRight: 5, fontSize: 11, }]}
                                        accessible={true}
                                        testID={"lblWalAcc"}
                                        accessibilityLabel={"lblWalAcc"}>
                                        {item.time}
                                    </Text>
                                </View> */}
                                    </View>

                                    <View
                                        style={{
                                            flex: 3.5,
                                            flexDirection: "column",
                                            height: 35,
                                            alignContent: "center",
                                            justifyContent: "center",
                                            marginRight: 10,
                                            alignSelf: "center",
                                        }}
                                    >
                                        <View style={{ flex: 1, margin: 2, marginBottom: 0 }}>
                                            <Text
                                                style={[
                                                    commonStyle.font,
                                                    {
                                                        textAlign: "right",
                                                        marginRight: 5,
                                                        color:
                                                            item.indicator === "D"
                                                                ? "#d0021b"
                                                                : "#5dbc7d",
                                                        fontSize: 10,
                                                        fontWeight: "200",
                                                    },
                                                ]}
                                                accessible={true}
                                                testID={"lblWalAcc"}
                                                accessibilityLabel={"lblWalAcc"}
                                            >
                                                {item.indicator === "D"
                                                    ? "- RM " + item.amt
                                                    : "RM " + item.amt}
                                            </Text>
                                        </View>
                                        <View style={{ flex: 1, margin: 2, marginTop: 0 }}>
                                            <Text
                                                style={[
                                                    commonStyle.font,
                                                    {
                                                        textAlign: "right",
                                                        marginRight: 5,
                                                        fontSize: 10,
                                                    },
                                                ]}
                                                accessible={true}
                                                testID={"lblWalAcc"}
                                                accessibilityLabel={"lblWalAcc"}
                                            >
                                                {item.postingDate}
                                            </Text>
                                        </View>
                                    </View>
                                </View>
                            </View>
                        )}
                        style={{ width: "100%" }}
                    />
                </View>
            ) : (
                <View style={{ alignItems: "center", alignContent: "center" }}>
                    <Text
                        style={{
                            padding: 10,
                            paddingBottom: 5,
                            alignSelf: "center",
                            textAlign: "center",
                            color: "grey",
                        }}
                    >
                        No transaction history available
                    </Text>
                </View>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        marginTop: 4,
        width: "100%",
        backgroundColor: "#ffffff",
        borderRadius: 10,
        justifyContent: "center",
        paddingBottom: 10,
        borderColor: "#fdd835",
        borderWidth: 2,
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
        paddingLeft: 5,
        paddingRight: 5,
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

//make this component available to the app
export { WalletTransaction };
