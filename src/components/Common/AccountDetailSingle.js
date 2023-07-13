import React, { Component } from "react";
import { Text, View, TouchableOpacity, ImageBackground } from "react-native";

const AccountDetailSingle = ({ account, accountName, accountBalance, onPress }) => {
    return (
        <View>
            <TouchableOpacity onPress={onPress}>
                <View style={[Styles.accHorMainViewNoBorder]}>
                    <View style={Styles.accFirstView}>
                        <ImageBackground
                            resizeMode={"cover"}
                            style={[Styles.accountItemImage]}
                            source={require("@assets/icons/ic_maybank_casa_small.png")}
                        >
                            <Text style={[Styles.accountNumberSmall, Styles.font]}>{account}</Text>
                        </ImageBackground>
                    </View>

                    <View style={Styles.accSecondView}>
                        <Text style={[Styles.accountBalanceLabel, Styles.font]}>
                            {accountBalance}
                        </Text>

                        <Text style={[Styles.accountFromLabel, Styles.font]}>From</Text>

                        <Text style={[Styles.accountNameLabel, Styles.font]}>{accountName}</Text>
                    </View>
                </View>
            </TouchableOpacity>
        </View>
    );
};
const Styles = {
    accHorMainView: {
        height: 115,
        width: 330,
        marginLeft: 10,
        marginRight: 10,
        backgroundColor: "#fff",
        justifyContent: "center",
        flexDirection: "row",
        borderRadius: 10,
    },
    accHorMainViewNoBorder: {
        height: 115,
        width: 330,
        marginLeft: 10,
        marginRight: 10,
        justifyContent: "center",
        flexDirection: "row",
    },
    accountItemImage: {
        width: 129,
        height: 90,
        marginTop: 15,
    },
    accountNumberSmall: {
        color: "#000000",
        fontWeight: "900",
        fontSize: 9,
        marginLeft: 12,
        marginTop: 34,
    },
    accountFromLabel: {
        color: "gray",
        fontWeight: "500",
        fontSize: 13,
        marginLeft: 20,
        marginTop: 2,
    },
    accountNameLabel: {
        color: "#fff",
        fontWeight: "900",
        fontSize: 13,
        marginLeft: 20,
        marginTop: 5,
    },
    accountBalanceLabel: {
        color: "#fff",
        fontWeight: "900",
        fontSize: 23,
        marginLeft: 20,
        marginTop: 8,
    },
    accFirstView: {
        flex: 1,
        marginLeft: 10,
        marginTop: 10,
        marginBottom: 10,
    },
    accSecondView: {
        flex: 1,
        justifyContent: "flex-start",
        flexDirection: "column",
        marginTop: 10,
        marginRight: 10,
        marginBottom: 10,
    },
    font: {
        fontFamily: "montserrat",
    },
};

export { AccountDetailSingle };
