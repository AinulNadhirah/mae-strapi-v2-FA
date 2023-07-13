import React from "react";
import { Text, View, Image, TouchableOpacity } from "react-native";

const CircularTextButton = ({ text, url, onPress, isBigIcon = false, isWhiteLabel = false }) => {
  //const { text } = data;

  return (

    <View style={styles.setupContainer}>
      <TouchableOpacity onPress={onPress}>
        <View style={styles.clickContainer}>
          <Image style={[isBigIcon ? styles.iconBig : styles.icon]} source={url}
            accessible={true}
            testID={"imgSetup"}
            accessibilityLabel={"imgSetup"} />
          <Text style={isWhiteLabel ? styles.textWhite : styles.text}>{text}</Text>
        </View>
      </TouchableOpacity>
    </View>

  );
};

const styles = {
  setupContainer: {
    display: "flex",
    justifyContent: "flex-start",
    flexDirection: "row",
    alignItems: "flex-start",
    alignContent: 'flex-start',
    height: 55,
   // backgroundColor: "yellow",
    borderRadius: 40,
    marginRight: 110,
    marginBottom: 5,
  },

  clickContainer: {
    flexDirection: "row",
    justifyContent: "flex-start",
    alignItems: "center",
    
  },

  icon: {
    width: 60,
    height: 60,
    marginTop: -10,
    marginLeft: 0,
  },

  iconBig: {
    width: 85,
    height: 85,
    marginTop: -10,
    marginLeft: -15,
  },
  text: {
    color: "black",
    fontSize: 20,
    marginTop: -15,
    marginLeft: -8,
    fontFamily: "montserrat",
    fontStyle: "normal",
    lineHeight: 23,
    
    letterSpacing: 0
  },
  textWhite: {
    color: "#fff",
    fontSize: 20,
    marginTop: -5,
    fontWeight: "600",
    fontFamily: "montserrat",
    fontStyle: "normal",
    lineHeight: 23,
    letterSpacing: 0
  }
};

export { CircularTextButton };
