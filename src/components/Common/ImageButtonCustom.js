import React from "react";
import { Text, View, Image, TouchableOpacity } from "react-native";

const ImageButtonCustom = ({ text, url, onPress }) => {

  return (
    <View   style={Style.setupContainer}>
    <TouchableOpacity onPress={onPress} >
      <View   style={Style.setupContainerView}>
      <View   style={Style.iconView} >
        <Image
          style={Style.icon}
          source={url}
        />
        </View>
        <Text style={Style.text}>{text}</Text>
      </View>
    </TouchableOpacity>
    </View>
  );
};
const iconWidth =105;
const iconWidthView =70;
const Style = {
  setupContainer: {
    marginTop: 20,
    marginLeft: 30,
    flexDirection: "row",
    alignItems: "center"
  },
  setupContainerView: {
    flexDirection: "row",
    alignItems: "center"
  },
  iconView: {
    width: iconWidth,
    height: iconWidth,
    borderRadius: iconWidth,
  },
  icon: {
    width: iconWidth,
    height: iconWidth,
    borderRadius: iconWidth,
    flexWrap: 'wrap',
    alignItems: "center",
  },
  text: {
    color: "#000",
    fontSize: 22,
    fontWeight: "600",
    fontStyle: "normal",
    lineHeight: 23,
    letterSpacing: 0,
    marginLeft: 10,
    marginTop: -15,
    fontFamily: "montserrat",
  },
};
export { ImageButtonCustom };
