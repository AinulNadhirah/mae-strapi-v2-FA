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

const ContactList = ({ data, callback, scrollToIndex }) => {
    function callbackEvent(item) {
        callback(item);
    }

    function renderItem({ item }) {
        return (
            <TouchableOpacity
                onPress={() =>
                    callback(item.givenName, item.phoneNumbers[0].number, item.thumbnailPath)
                }
            >
                <View style={Styles.newTransferView}>
                    <View style={Styles.newTransferViewInner1}>
                        {item.hasThumbnail ? (
                            <View style={Styles.circleImageView}>
                                <ImageBackground
                                    style={Styles.newTransferCircle}
                                    source={{
                                        uri: item.thumbnailPath,
                                    }}
                                    resizeMode="center"
                                />
                            </View>
                        ) : (
                            <View style={Styles.circleImageView}>
                                <ImageBackground
                                    style={Styles.newTransferCircle}
                                    source={require("@assets/icons/ic_phone.png")}
                                    resizeMode="center"
                                />
                            </View>
                        )}
                    </View>
                    <View style={Styles.newTransferViewInner2}>
                        <Text
                            style={[Styles.shortNameLabelBlack]}
                            accessible={true}
                            testID={"txtByClickingNext"}
                            accessibilityLabel={"txtByClickingNext"}
                        >
                            {item.givenName}
                        </Text>
                        <Text
                            style={[Styles.nameLabelBlack]}
                            accessible={true}
                            testID={"txtByClickingNext"}
                            accessibilityLabel={"txtByClickingNext"}
                        >
                            {item.phoneNumbers[0].number}
                        </Text>
                    </View>
                </View>
            </TouchableOpacity>
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
        width: "90%",
        height: 50,
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
        fontSize: 13,
        fontWeight: "normal",
        fontStyle: "normal",
        color: "#9B9B9B",
    },
    nameLabelBlack: {
        fontFamily: "montserrat",
        width: "88%",
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
        width: 40,
        height: 40,
        borderRadius: 35,
        marginLeft: 7,
        marginTop: 5,
        marginBottom: 5,
        backgroundColor: "#fff",
        flexDirection: "row",
        justifyContent: "center",
        alignContent: "center",
        alignItems: "center",
    },
    newTransferCircle: {
        width: 35,
        height: 35,
        borderRadius: 35 / 2,
        backgroundColor: "#fff",
        flexDirection: "row",
        justifyContent: "center",
        alignContent: "center",
        alignItems: "center",
        alignSelf: "center",
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
export default ContactList;
