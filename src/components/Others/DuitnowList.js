import React, { Component } from "react";
import {
    Text,
    View,
    TouchableOpacity,
    ImageBackground,
    Alert,
    FlatList,
    Image,
    Switch,
    Dimensions,
} from "react-native";
import { CircularNameView } from "@components/Common";
import Swipeout from "react-native-swipeout";
import commonStyle from "@styles/main";
import * as ModelClass from "@utils/dataModel/modelClass";
import * as Utility from "@utils/dataModel/utility";
import SwitchToggle from "react-native-switch-toggle";
export const { width, height } = Dimensions.get("window");

const DuitnowList = ({
    data,
    editCall,
    switchCall,
    removeCall,
    addCall,
    scrollToIndex,
    showAdd,
}) => {
    function callbackEvent(item) {
        callback(item);
    }

    function renderItem({ item }) {
        console.log("Item", item);
        return (
            <View
                style={{
                    width: "100%",
                    height: 85,
                    alignItems: "center",
                    justifyContent: "center",
                    backgroundColor: "#ffffff",
                    marginTop: 10,
                }}
            >
                <Swipeout
                    accessible={true}
                    testID={"swipeAccount"}
                    accessibilityLabel={"swipeAccount"}
                    style={{
                        width: width,
                        height: 75,
                        backgroundColor: "#ffffff",
                        marginTop: 2,
                        marginBottom: 10,
                    }}
                    buttonWidth={120}
                    disabled={item.maybank !== true || item.by === "BANK"}
                    left={[
                        {
                            text: "Remove",
                            type: "delete",
                            color: "#000000",
                            onPress: () => {
                                removeCall(item);
                            },
                        },
                    ]}
                >
                    <View style={{ flexDirection: "row", marginTop: 10, marginBottom: 10 }}>
                        <View
                            style={{
                                flex: 1.5,
                                marginLeft: 50,
                                flexDirection: "column",
                                alignContent: "flex-start",
                                justifyContent: "center",
                            }}
                        >
                            <View>
                                <Text
                                    style={[
                                        { color: "#000000", fontWeight: "500", fontSize: 15 },
                                        commonStyle.font,
                                    ]}
                                >
                                    {Utility.maskFirstPart(item.source)}
                                </Text>
                            </View>
                            <View>
                                <Text style={[{ fontSize: 11, marginTop: 5 }, commonStyle.font]}>
                                    {item.bank}
                                </Text>
                            </View>
                            <View>
                                <Text style={[{ fontSize: 11, marginTop: 5 }, commonStyle.font]}>
                                    {Utility.maskFirstPart(item.account)}
                                </Text>
                            </View>
                        </View>
                        <View
                            style={{
                                flex: 1,
                                flexDirection: "row",
                                marginLeft: 2,
                                alignItems: "center",
                                alignContent: "center",
                                justifyContent: "center",
                            }}
                        >
                            {item.maybank === true && item.status === true ? (
                                <View>
                                    <TouchableOpacity
                                        style={{
                                            marginTop: 10,
                                            marginLeft: 10,
                                        }}
                                        testID={"btnEditAmount"}
                                        accessibilityLabel={"btnEditAmount"}
                                        onPress={() => {
                                            editCall(item);
                                        }}
                                    >
                                        <Image
                                            style={{
                                                width: 18,
                                                height: 18,
                                            }}
                                            source={require("@assets/icons/ic_edit_black.png")}
                                        />
                                    </TouchableOpacity>
                                </View>
                            ) : (
                                <View
                                    style={{
                                        marginTop: 28,
                                        marginLeft: 28,
                                    }}
                                />
                            )}
                            <View style={{ marginLeft: 15, marginTop: 10, width: 50 }}>
                                <SwitchToggle
                                    accessible={true}
                                    testID={"switchAccount"}
                                    accessibilityLabel={"switchAccount"}
                                    switchOn={item.status}
                                    onPress={() => {
                                        switchCall(item);
                                    }}
                                    containerStyle={{
                                        marginTop: 1,
                                        width: 45,
                                        height: 25,
                                        borderRadius: 20,
                                        backgroundColor: "#cccccc",
                                        padding: 1,
                                    }}
                                    circleStyle={{
                                        width: 23,
                                        height: 23,
                                        borderRadius: 13,
                                        backgroundColor: "#ffffff",
                                    }}
                                    backgroundColorOn="#4cd863"
                                    backgroundColorOff="#cccccc"
                                    circleColorOff="#ffffff"
                                    circleColorOn="#ffffff"
                                    type={0}
                                />

                                {/* <TouchableOpacity
                  style={{
                    marginTop: 10,
                    marginLeft: 10
                  }}
                  testID={"btnEditAmount"}
                  accessibilityLabel={"btnEditAmount"}
                  onPress={() => {
                    switchCall(item);
                  }}
                >
                  {item.status === true ?
                    <Image
                      style={{
                        width: 30,
                        height: 20,
                      }}
                      source={require("@assets/icons/ic_switch_on.png")}
                    />
                    :
                    <Image
                      style={{
                        width: 30,
                        height: 20,
                      }}
                      source={require("@assets/icons/ic_switch_off.png")}
                    />
                  }

                </TouchableOpacity> */}

                                {/* <Switch
                  style={{
                    marginTop: '25%',
                    marginLeft: '12%',
                    width: 15,
                    height: 20,

                  }}
                  onValueChange={() => {
                    switchCall(item);
                  }}
                  value={item.status}
                /> */}
                            </View>
                        </View>
                    </View>
                </Swipeout>

                <View
                    style={{
                        width: "100%",
                        borderWidth: 0.4,
                        borderColor: "#cccccc",
                        marginTop: 1,
                    }}
                />
            </View>
        );
    }

    return (
        <View>
            <View>
                <FlatList
                    style={{
                        flexGrow: 0,
                    }}
                    data={data}
                    showsHorizontalScrollIndicator={false}
                    showIndicator={false}
                    keyExtractor={(item, index) => `${item.contentId}-${index}`}
                    renderItem={renderItem}
                    testID={"favList"}
                    accessibilityLabel={"favList"}
                />
            </View>
            {showAdd ? (
                <View
                    style={{
                        height: 40,
                        flexDirection: "row",
                        justifyContent: "flex-start",
                        alignItems: "center",
                        marginTop: 20,
                        position: "relative",
                    }}
                >
                    <View
                        style={{
                            height: 40,
                            alignItems: "flex-start",
                            justifyContent: "center",
                            flex: 1,
                        }}
                    >
                        <Text
                            style={[
                                {
                                    color: "#000000",
                                    marginLeft: 50,
                                    fontWeight: "700",
                                    fontSize: 18,
                                    fontFamily: "montserrat",
                                },
                                commonStyle.font,
                            ]}
                        >
                            Add Account
                        </Text>
                    </View>
                    <TouchableOpacity
                        onPress={() => {
                            addCall();
                        }}
                    >
                        <View
                            style={{
                                justifyContent: "center",
                                alignItems: "center",
                                flex: 1,
                                marginRight: 10,
                            }}
                        >
                            <Image
                                accessible={true}
                                testID={"imgWalAddMay"}
                                accessibilityLabel={"imgWalAddMay"}
                                style={{
                                    height: 40,
                                    width: 40,
                                }}
                                source={require("@assets/icons/ic_add_white.png")}
                            />
                        </View>
                    </TouchableOpacity>
                </View>
            ) : null}
        </View>
    );
};
const Styles = {
    newTransferView: {
        width: "94%",
        height: 80,
        borderRadius: 50,
        marginLeft: 0,
        marginBottom: 10,
        backgroundColor: "#fff",
        flexDirection: "row",
    },
    newTransferViewInner1: {
        flex: 1,
        borderTopLeftRadius: 50,
        borderBottomLeftRadius: 50,
        flexDirection: "column",
    },
    newTransferViewInner2: {
        flex: 3,

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
        width: "88%",
        // backgroundColor: "#D8D8D8",
        fontSize: 13,
        fontWeight: "bold",
        fontStyle: "normal",
        marginLeft: 15,
        color: "#000",
    },
    accountLabelBlack: {
        fontFamily: "montserrat",
        fontSize: 13,
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
    //
    circleImageView: {
        width: 64,
        height: 64,
        borderRadius: 60,
        marginLeft: 7,
        marginTop: 8,
        backgroundColor: "#D8D8D8",
        flexDirection: "row",
        justifyContent: "center",
        alignContent: "center",
        alignItems: "center",
    },
    newTransferCircle: {
        width: 64,
        height: 64,
        borderRadius: 50,
        backgroundColor: "#D8D8D8",
        flexDirection: "row",
        justifyContent: "center",
        alignContent: "center",
        alignItems: "center",
    },
    //
    newTransferCircleImage: {
        width: 64,
        height: 64,
    },
    newTransferCircleIcon: {
        width: 48,
        height: 48,
    },
};
export default DuitnowList;
