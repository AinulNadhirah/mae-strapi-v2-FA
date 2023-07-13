import React from "react";
import { TouchableOpacity, View, Text, Image } from "react-native";

const CustomCircularNameView = ({ onPress, text, tick = false, tickSource }) => {

  return (
    <View style={Styles.newTransferCircle}>
      <View >
        <Text
          style={[Styles.shortNameLabelBlack]}
          accessible={true}
          testID={"txtShortName"}
          accessibilityLabel={"txtShortName"}
        >
          {text}
        </Text>
        {tick === true ?

          <Image
            style={{ position: "absolute", width: 20, height: 20, borderRadius: 10, marginLeft: 20, marginTop: 15 }}
            source={tickSource}
          />
          : null}
      </View>
    </View >
  );
};

const Styles = {
  newTransferCircle: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "#D8D8D8",
    flexDirection: "row",
    justifyContent: 'center',
    alignContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: "#fff",
  },
  shortNameLabelBlack: {
    fontFamily: "montserrat",
    fontSize: 15,
    fontWeight: "normal",
    fontStyle: "normal",
    color: "#9B9B9B"
  },
};
export { CustomCircularNameView };
