import React from "react";
import { TouchableOpacity, View, Image } from "react-native";

const NextRightButton = ({ onPress, isArrow,imageSource,isdisabled,rightMargin = true }) => {
  return (
    <View style={!rightMargin ? Style.nextButtonMarginContainer:Style.nextButtonContainer}>
      <TouchableOpacity
       disabled={isdisabled}
        style={isdisabled ? Style.nextButtonBottomDisabled : Style.nextButtonBottom}
        onPress={onPress}
        accessibilityLabel={"moveToNext"}
      >
      <View>
          <Image
            style={Style.nextButtonBottomImage}
            source={imageSource}
          />
       
        </View>
      </TouchableOpacity>
    </View>
  );
};

const Style = {
  nextButtonContainer: {
    
    flex: 1,
    height: 50,
    marginBottom: "15%",
    marginRight: "10%",
  },
  nextButtonMarginContainer: {
    flex: 1,
    height: 50,
    marginBottom: "15%",
  },
  nextButtonBottom: {
    justifyContent: "center",
  },
  nextButtonBottomDisabled: {
    opacity: 0.3,
    justifyContent: "center",
  },
  nextButtonBottomImage: {
    width: 75,
    height: 75,
    borderRadius: 75/2
  }
};
export { NextRightButton };
