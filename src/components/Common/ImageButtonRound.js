import React from "react";
import { Text, TouchableOpacity, View, Image } from "react-native";

const ImageButtonRound = ({ onPress, headerText, backgroundColor, source }) => {

  return (
    <View style={Styles.budgetingContent}>
      <TouchableOpacity
        onPress={onPress}
        style={[
          Styles.buttonStyle
        ]}
        underlayColor={"#fff"}
      >

        <Image source={require(source)}></Image>
      </TouchableOpacity>
    </View>
  );
};

const Styles = {
  buttonStyle: {

  },
  budgetingContent: {

  }
};
export { ImageButtonRound };
