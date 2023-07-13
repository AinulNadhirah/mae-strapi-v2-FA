import React from "react";
import { Text, TouchableOpacity, View } from "react-native";

const ButtonRoundLeft = ({ onPress, headerText, backgroundColor }) => {
  const {
    buttonStyle,
    textStyle,
    budgetingContent,
    budgetingContent1,
    budgetingContent2
  } = styles;
  return (
    <View style={budgetingContent}>
      <TouchableOpacity
        onPress={onPress}
        style={[
          buttonStyle,
          {
            backgroundColor: backgroundColor === null ? backgroundColor : "#fff"
          }
        ]}
        underlayColor={"#fff"}
      >
        <Text style={textStyle}>{headerText}</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = {
  textStyle: {
    textAlign: "center",
    fontFamily: "montserrat",
    color: "#000",
    fontSize: 20,
    fontWeight: "600",
    fontWeight: "bold",
    //padding: 25,
    marginTop: 10,
    marginBottom: 10,
    marginRight: 20,
    marginLeft: 20
  },
  buttonStyle: {
    alignContent: "center",
    justifyContent: "center",
    height: 55,
    borderRadius: 25
  },
  budgetingContent: {
    flexDirection: "row",
    width: "100%",
    marginBottom: 15,
    minWidth: 80,
    alignItems: 'flex-start',
    flexDirection: 'column',
    marginRight:40,
    

  }
};
export { ButtonRoundLeft };
