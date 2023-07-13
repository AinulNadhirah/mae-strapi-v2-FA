import React from "react";
import { Text, TouchableOpacity, View } from "react-native";

const ButtonRound = ({ onPress, headerText, backgroundColor,
  isCenter = false }) => {
  const {
    buttonStyle,
    textStyle,
    budgetingContent,
    budgetingContent1,
    budgetingContent2,
    budgetingContentCenter
  } = styles;
  return (
    <View style={isCenter ? budgetingContentCenter:budgetingContent}>
      <TouchableOpacity
        onPress={onPress}
        style={[
          styles.buttonStyle,
          {
            backgroundColor: backgroundColor === null ? "#fff" : backgroundColor
          }
        ]}
        underlayColor={"#fff"}
      >
        <Text style={styles.textStyle}>{headerText}</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = {
  textStyle: {
     textAlign: 'center', // <-- the magic
    fontWeight: 'bold',
    fontSize: 18,
    fontWeight: "300",
    marginTop: 0,
    width: '100%',
    // backgroundColor: 'green',

  },
  buttonStyle: {
    alignContent: "center",
    justifyContent: "center",
    height: 55,
    borderRadius: 25,
    width:'90%'
  },
  budgetingContent: {
    flexDirection: "row",
    width: "100%",
    marginBottom: 15,
    minWidth: 80,
    alignItems: 'flex-end',
    flexDirection: 'column',
    paddingRight:40
  },
  budgetingContentCenter: {
    flexDirection: "row",
    width: "100%",
    marginBottom: 15,
    minWidth: 80,
    alignItems: 'center',
    justifyContent: "center",
    flexDirection: 'column',
  }
};
export { ButtonRound };
