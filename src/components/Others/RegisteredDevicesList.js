import React, { Component } from "react";
import {
    Text,
    View,
    TouchableOpacity,
    ImageBackground,
    Alert,
    FlatList,
    Image,
} from "react-native";

const RegisteredDevicesList = ({ data, callback, scrollToIndex }) => {
    function callbackEvent(item) {
        callback(item);
    }

    function renderItem({ item }) {
        return (
            <View>
                <View style={Styles.newTransferView}>
                    <View style={Styles.newTransferViewInner1}>
                        <View style={Styles.newTransferCircle}>
                            <Text
                                style={[Styles.shortNameLabelBlack]}
                                accessible={true}
                                testID={"txtByClickingNext"}
                                accessibilityLabel={"txtByClickingNext"}
                            >
                                {item.deviceName
                                    .split(/\s/)
                                    .reduce((response, word) => (response += word.slice(0, 1)), "")
                                    .toUpperCase()
                                    .substring(0, 2)}
                            </Text>
                        </View>
                    </View>
                    <View style={Styles.newTransferViewInner2}>
                        <Text
                            style={[Styles.nameLabelBlack]}
                            accessible={true}
                            testID={"txtByClickingNext"}
                            accessibilityLabel={"txtByClickingNext"}
                        >
                            {item.deviceName}
                        </Text>
                        <Text
                            style={[Styles.accountLabelBlack]}
                            accessible={true}
                            testID={"txtByClickingNext"}
                            accessibilityLabel={"txtByClickingNext"}
                        >
                            {item.registeredOn}
                        </Text>
                        {/* <Text
              style={[Styles.bankLabelBlack]}
              accessible={true}
              testID={"txtByClickingNext"}
              accessibilityLabel={"txtByClickingNext"}
            >
               {item.registeredOn}
          </Text> */}
                    </View>

                    <View style={Styles.newTransferViewInner3}>
                        <TouchableOpacity
                            style={Styles.nextButtonBottom}
                            onPress={() =>
                                callback(
                                    item.registeredOn,
                                    item.deviceName,
                                    item.activeState,
                                    item.id
                                )
                            }
                            accessibilityLabel={"removeBtn"}
                            testID={"removeBtn"}
                        >
                            <View>
                                <Image
                                    style={Styles.closeImg}
                                    source={require("@assets/icons/closeIcon.png")}
                                />
                            </View>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        );
    }
    return (
        <View>
            <FlatList
                style={Styles.accountsFlatlist}
                data={data}
                scrollToIndex={scrollToIndex}
                showsHorizontalScrollIndicator={false}
                showIndicator={false}
                keyExtractor={(item, index) => `${item.contentId}-${index}`}
                //renderItem={({ item, index }) => renderItem(item)}
                renderItem={renderItem}
                testID={"favList"}
                accessibilityLabel={"favList"}
            />
        </View>
    );
};
const Styles = {
    newTransferView: {
        width: 280,
        height: 80,
        borderRadius: 50,
        marginLeft: 0,
        marginBottom: 10,
        backgroundColor: "#fff",
        flexDirection: "row",
    },
    newTransferViewInner1: {
        flex: 1.4,
        borderTopLeftRadius: 50,
        borderBottomLeftRadius: 50,
        flexDirection: "column",
    },
    newTransferViewInner2: {
        flex: 3.5,
        justifyContent: "center",
        flexDirection: "column",
    },
    newTransferViewInner3: {
        flex: 1,
        borderTopRightRadius: 50,
        borderBottomRightRadius: 50,
        justifyContent: "center",
        flexDirection: "column",
    },
    newTranfLabelBlack: {
        fontFamily: "montserrat",
        fontSize: 15,
        fontWeight: "bold",
        fontStyle: "normal",
        marginLeft: 15,
        lineHeight: 33,
        color: "#000",
    },
    shortNameLabelBlack: {
        fontFamily: "montserrat",
        fontSize: 23,
        fontWeight: "normal",
        fontStyle: "normal",
        color: "#9B9B9B",
    },
    nameLabelBlack: {
        fontFamily: "montserrat",
        fontSize: 13,
        fontWeight: "bold",
        fontStyle: "normal",
        marginLeft: 15,
        color: "#000",
    },
    accountLabelBlack: {
        fontFamily: "montserrat",
        fontSize: 9,
        fontWeight: "normal",
        fontStyle: "normal",
        marginLeft: 15,
        color: "#000",
    },
    bankLabelBlack: {
        fontFamily: "montserrat",
        fontSize: 13,
        fontWeight: "normal",
        fontStyle: "normal",
        marginLeft: 15,
        color: "#9B9B9B",
    },
    newTransferCircle: {
        width: 64,
        height: 64,
        borderRadius: 50,
        marginLeft: 7,
        marginTop: 8,
        backgroundColor: "#D8D8D8",
        flexDirection: "row",
        justifyContent: "center",
        alignContent: "center",
        alignItems: "center",
    },
    newTransferCircleIcon: {
        width: 48,
        height: 48,
    },
    closeImg: {
        width: 30,
        height: 30,
    },
};
export default RegisteredDevicesList;
