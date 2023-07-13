import React from "react";
import {  View, Image } from "react-native";

const ImageView = ({ url ,ImageStyle}) => {
    return (
        <View style={styles.setupContainer}>
          <Image
            style={ImageStyle}
            source={url}
          />
        </View>
    );
  };

  const styles = {
    setupContainer: {
      display: "flex",
      justifyContent: "flex-start",
      flexDirection: "row",
      alignItems: "center",
    },
  
  icon: {
      width: 230,
      height: 310
   },
    
  
  };
  
  export { ImageView };
  