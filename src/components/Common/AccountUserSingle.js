import React, { Component } from "react";
import { Text, View, TouchableOpacity, ImageBackground } from "react-native";

const AccountUserSingle = ({
  account,
  accountName,
  accountBalance,
  shortName,
  bankName,
  onPress
}) => {
  return (
    <View>
      <TouchableOpacity onPress={onPress}>
        <View style={[Styles.accHorMainViewNoBorder]}>
          <View style={Styles.accFirstView}>
          <View style={Styles.newTransferCircle}>
            <Text
              style={[Styles.shortNameLabelBlack]}
              accessible={true}
              testID={"txtByClickingNext"}
              accessibilityLabel={"txtByClickingNext"}
            >
             {shortName}
          </Text>
            </View>
          </View>

          <View style={Styles.accSecondView}>
           

            <Text style={[Styles.accountFromLabel, Styles.font]}>{bankName}</Text>

            <Text style={[Styles.accountNameLabel, Styles.font]}>
              {accountName}
            </Text>
            <Text style={[Styles.fullNameLabel, Styles.font]}>
              {accountBalance}
            </Text>
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
    borderRadius: 10
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
    marginTop: 15
  },
  accountNumberSmall: {
    color: "#000000",
    fontWeight: "900",
    fontSize: 7,
    marginLeft: 12,
    marginTop: 34
  },
  accountFromLabel: {
    color: "gray",
    fontWeight: "500",
    fontSize: 13,
    marginLeft: 20,
    marginTop: 10,
    color: "#69686e",
  },
  accountNameLabel: {
    color: "#69686e",
    fontWeight: "900",
    fontSize: 13,
    marginLeft: 20,
    marginTop: 5
  },
  fullNameLabel: {
    color: "#fff",
    fontWeight: "900",
    fontSize: 13,
    marginLeft: 20,
    marginTop: 8
  },
  accFirstView: {
    flex: 1,
    marginLeft: 10,
    marginTop: 10,
    marginBottom: 10
  },
  accSecondView: {
    flex: 1,
    justifyContent: "flex-start",
    flexDirection: "column",
    marginTop: 10,
    marginRight: 10,
    marginBottom: 10
  },
  font: {
    fontFamily: "montserrat"
  },
  newTransferCircle: {
    width: 85,
    height: 85,
    borderRadius: 85,
    marginLeft: 7,
    marginTop: 8,
    borderColor: "#fff",
    borderWidth: 3,
    backgroundColor: "#D8D8D8",
    flexDirection: "row",
    justifyContent: 'center',
    alignContent: 'center',
    alignItems: 'center',
  },
  shortNameLabelBlack: {
    fontFamily: "montserrat",
    fontSize: 23,
    fontWeight: "normal",
    fontStyle: "normal",
    color: "#9B9B9B"
  },
};
export { AccountUserSingle };
