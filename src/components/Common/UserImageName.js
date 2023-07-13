import React from 'react'
import {Text, TouchableOpacity, View, ImageBackground, Image} from 'react-native'

const UserImageName = ({text, source, showImage = true}) => {
  function callbackEvent(item) {
    onPress(item);
  }

    return (
        <View >
        <View style={Styles.newTransferViewInner1}>
            {showImage ? (
              <View style={Styles.circleImageView}>
                <Image
                  style={Styles.newTransferCircle}
                  // source={item.image}
                  source={{
                    uri: `data:image/gif;base64,${
                      source
                      }`
                  }}
                  resizeMode="contain"
                />
              </View>
            ) : (
                <View style={Styles.newTransferCircleImage}>
                  <Text
                    style={[Styles.shortNameLabelBlack]}
                    accessible={true}
                    testID={"txtByClickingNext"}
                    accessibilityLabel={"txtByClickingNext"}
                  >
                    {text}
                  </Text>
                </View>
              )}
          </View>
      </View>
    )
}


const Styles = {

      newTransferViewInner1: {
        flex: 1,
        borderTopLeftRadius: 50,
        borderBottomLeftRadius: 50,
        flexDirection: "column"
      },
      newTransferViewInner2: {
        flex: 3,
       
        borderTopRightRadius: 50,
        borderBottomRightRadius: 50,
        justifyContent: "center",
        flexDirection: "column"
      },
      newTranfLabelBlack: {
        fontFamily: "montserrat",
        fontSize: 15,
        fontWeight: "bold",
        fontStyle: "normal",
        marginLeft: 15,
        lineHeight: 33,
        color: "#000"
      },
      shortNameLabelBlack: {
        fontFamily: 'montserrat',
        fontSize: 23,
        fontWeight: 'normal',
        fontStyle: 'normal',
        color: '#9B9B9B',
      },
      nameLabelBlack: {
        fontFamily: "montserrat",
        width: "88%",
       // backgroundColor: "#D8D8D8",
        fontSize: 13,
        fontWeight: "bold",
        fontStyle: "normal",
        marginLeft: 15,
        color: "#000"
      },
      accountLabelBlack: {
        fontFamily: "montserrat",
        fontSize: 13,
        fontWeight: "normal",
        fontStyle: "normal",
        marginLeft: 15,
        color: "#000"
      },
      bankLabelBlack: {
        fontFamily: "montserrat",
        fontSize: 13,
        fontWeight: "normal",
        fontStyle: "normal",
        marginLeft: 15,
        color: "#9B9B9B"
      },
      //
      circleImageView: {
        width: 64,
        height: 64,
        borderRadius: 64,
        marginLeft: 7,
        marginTop: 8,
      
        flexDirection: "row",
        justifyContent: "center",
        alignContent: "center",
        alignItems: "center"
      },
      newTransferCircle: {
        width: 64,
        height: 64,
        borderRadius: 64,
        borderWidth: 1,
       borderColor: "#fff",
        flexDirection: "row",
        justifyContent: "center",
        alignContent: "center",
        alignItems: "center"
      },
      //
      newTransferCircleImage: {
        width: 64,
      height: 64,
      borderRadius: 50,
      marginLeft: 7,
      marginTop: 8,
      backgroundColor: '#D8D8D8',
      flexDirection: 'row',
      justifyContent: 'center',
      alignContent: 'center',
      alignItems: 'center',
      },
      newTransferCircleIcon: {
        width: 48,
        height: 48
      }
}
export {UserImageName}
