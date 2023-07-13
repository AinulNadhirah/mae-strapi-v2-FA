/* eslint-disable react-native/no-color-literals */
/* eslint-disable react-native/no-inline-styles */
/* eslint-disable prettier/prettier */
import React from "react";
import { Text, View, Image, Dimensions } from "react-native";
import { checkifUrlImage } from "@utils/dataModel/utility";

export const { width, height } = Dimensions.get("window");

export const OverlappingPictures = ({
    picArray, // array of objects: {participantPic,participantName}
    small = false,
    medium = false,
    addBuddies = false,
    reverse = false,
    colored = false,
    valid = false,
    customSize = 36,
    custom = false,
    backgroundColor = "#E8E8E8",
}) => {
    // alert("OverlappingPictures:"+ picArray);
    // alert("pictures array: " + picArray)
    let length = picArray.length;
    if (length == 0) return null;
    // console.log("picArray length: "+picArray.length+ ".m.m.m"+length);
    // console.log("small : "+small)
    let returnArray = [];

    let initial = reverse
        ? function () {
              return length - 1;
          }
        : function (i) {
              return 0;
          };

    let condition = reverse
        ? function (i) {
              return i >= 0;
          }
        : function (i) {
              return i < length;
          };

    function loop(i) {
        // console.log("iteration number " + i + " ... " + picArray[i].participantPic + " ... " + picArray[i].participantName)
        let initials;
        let firstName = "";
        let secondName = "";

        try {
            firstName =
                picArray[i] != null && picArray[i].participantName != null
                    ? picArray[i].participantName.split(" ")[0]
                    : "";
            secondName =
                picArray[i] != null && picArray[i].participantName != null
                    ? picArray[i].participantName.split(" ")[1]
                    : "";

            if (secondName) {
                let firstName0 =
                    firstName[0] != null && firstName[0] != "undefined" && firstName[0] != undefined
                        ? firstName[0]
                        : "";
                let secondName0 =
                    secondName[0] != null &&
                    secondName[0] != "undefined" &&
                    secondName[0] != undefined
                        ? secondName[0]
                        : "";
                // initials=firstName.substr(0)+secondName.substr(0);
                let name1 = firstName0 + secondName0;
                initials =
                    name1 != null && name1 != "undefined" && name1 != undefined
                        ? name1.toUpperCase()
                        : "";
            } else {
                // initials=firstName.substr(0,1);
                let firstName0 =
                    firstName[0] != null && firstName[0] != "undefined" && firstName[0] != undefined
                        ? firstName[0]
                        : "";
                let firstName1 =
                    firstName[1] != null && firstName[1] != "undefined" && firstName[1] != undefined
                        ? firstName[1]
                        : "";
                let firstName2 =
                    firstName[2] != null && firstName[2] != "undefined" && firstName[2] != undefined
                        ? firstName[2]
                        : "";

                let name2 = firstName0 + firstName1;

                // console.log('name2 : ' + name2)
                initials =
                    name2 === null ||
                    name2 === "NaN" ||
                    name2 === undefined ||
                    name2 === "NaN" ||
                    name2 === NaN
                        ? ""
                        : name2.toUpperCase();

                if (reverse) {
                    if (i === length) {
                        let name3 = firstName0 + firstName1 + firstName2;
                        initials = name3 != null && name3 != undefined ? name3.toUpperCase() : "";
                    }
                }
            }
        } catch (e) {
            console.log(e);
        }
        // alert(picArray[0].participantPic)
        returnArray.push(
            <View
                key={i}
                style={
                    addBuddies
                        ? {
                              marginLeft: (30 * i * width) / 375,
                              width: (55 * width) / 375,
                              height: (55 * width) / 375,
                              backgroundColor: "white",
                              borderRadius: (55 * width) / 375 / 2,
                              elevation: length - i,
                              alignItems: "center",
                              justifyContent: "center",
                              borderWidth: 1,
                          }
                        : small
                        ? {
                              position: "absolute",
                              marginLeft: (13.5 * i * width) / 375,
                              width: (21 * width) / 375,
                              height: (21 * width) / 375,
                              backgroundColor: colored === true ? "#f8d31c" : "white",
                              borderRadius: (21 * width) / 375 / 2,
                              elevation: reverse ? length + i : length - i,
                              alignItems: "center",
                              justifyContent: "center",
                              borderWidth: 0.5,
                          }
                        : medium
                        ? {
                              position: "absolute",
                              marginLeft: (28 * i * width) / 375,
                              width: (36 * width) / 375,
                              height: (36 * width) / 375,
                              backgroundColor: colored === true ? "#f8d31c" : "white",
                              borderRadius: (36 * width) / 375 / 2,
                              elevation: reverse ? length + i : length - i,
                              alignItems: "center",
                              justifyContent: "center",
                              borderColor: "#fff",
                              borderWidth: 1,
                          }
                        : custom
                        ? {
                              position: "absolute",
                              marginLeft:
                                  ((customSize - 10 >= 1 ? customSize - 10 : 1) * i * width) / 375,
                              width: (customSize * width) / 375,
                              height: (customSize * width) / 375,
                              backgroundColor: colored === true ? "#f8d31c" : "white",
                              borderRadius: (customSize * width) / 375 / 2,
                              elevation: reverse ? length + i : length - i,
                              alignItems: "center",
                              justifyContent: "center",
                              borderColor: "#fff",
                              borderWidth: 1,
                          }
                        : {
                              position: "absolute",
                              marginLeft: (34 * i * width) / 375,
                              width: (46 * width) / 375,
                              height: (46 * width) / 375,
                              backgroundColor: colored === true ? "#f8d31c" : "white",
                              borderRadius: (46 * width) / 375 / 2,
                              elevation: reverse ? length + i : length - i,
                              alignItems: "center",
                              justifyContent: "center",
                              borderColor: valid === false ? "#fff" : "#ffffff",
                              borderWidth: 1,
                          }
                }
            >
                {picArray[i].participantPic ? ( // && picArray[i].participantPic.uri?
                    <Image
                        style={
                            addBuddies
                                ? {
                                      width: (54 * width) / 375,
                                      height: (54 * width) / 375,
                                      borderRadius: (54 * width) / 375 / 2,
                                  }
                                : small
                                ? {
                                      width: (19 * width) / 375,
                                      height: (19 * width) / 375,
                                      borderRadius: (19 * width) / 375 / 2,
                                  }
                                : medium
                                ? {
                                      width: (36 * width) / 375,
                                      height: (36 * width) / 375,
                                      borderRadius: (36 * width) / 375 / 2,
                                      borderColor: "#fff",
                                      borderWidth: 1.3,
                                  }
                                : custom
                                ? {
                                      width: customSize / 375,
                                      height: customSize / 375,
                                      borderRadius: (customSize * width) / 375 / 2,
                                      borderColor: "#fff",
                                      borderWidth: 1.3,
                                  }
                                : {
                                      width: (42 * width) / 375,
                                      height: (42 * width) / 375,
                                      borderRadius: (21 * width) / 375,
                                  }
                        }
                        // source={{ uri : picArray[i].participantPic }}
                        source={
                            checkifUrlImage(picArray[i].participantPic)
                                ? { uri: picArray[i].participantPic }
                                : { uri: "data:image/jpeg;base64," + picArray[i].participantPic }
                        }
                    />
                ) : (
                    <View
                        style={[
                            addBuddies
                                ? {
                                      width: (52 * width) / 375,
                                      height: (52 * width) / 375,
                                      borderRadius: (27 * width) / 375,
                                      alignItems: "center",
                                      justifyContent: "center",
                                      borderColor: "#FFFFFF",
                                      borderWidth: 1,
                                  }
                                : small
                                ? {
                                      width: (17 * width) / 375,
                                      height: (17 * width) / 375,
                                      borderRadius: (9.5 * width) / 375,
                                      alignItems: "center",
                                      justifyContent: "center",
                                      borderColor: "#FFFFFF",
                                      borderWidth: 0.5,
                                  }
                                : medium
                                ? {
                                      width: (36 * width) / 375,
                                      height: (36 * width) / 375,
                                      borderRadius: (36 * width) / 375 / 2,
                                      alignItems: "center",
                                      justifyContent: "center",
                                      borderColor: "#FFFFFF",
                                      borderWidth: 1.5,
                                  }
                                : custom
                                ? {
                                      width: (customSize * width) / 375,
                                      height: (customSize * width) / 375,
                                      borderRadius: (customSize * width) / 375,
                                      alignItems: "center",
                                      justifyContent: "center",
                                      borderColor: "#FFFFFF",
                                      borderWidth: 1,
                                  }
                                : {
                                      width: (40 * width) / 375,
                                      height: (40 * width) / 375,
                                      borderRadius: (21 * width) / 375,
                                      alignItems: "center",
                                      justifyContent: "center",
                                      borderColor: "#FFFFFF",
                                      borderWidth: 0.5,
                                  },
                            { backgroundColor: backgroundColor },
                        ]}
                    >
                        <Text
                            style={{
                                fontSize: small ? 8 : medium ? 11 : 17,
                                fontFamily: "montserrat",
                                fontWeight: "300",
                                fontStyle: "normal",
                                letterSpacing: -0.5,
                                textAlign: "center",
                                color: "#000000",
                            }}
                        >
                            {initials}
                        </Text>
                    </View>
                )}
            </View>
        );
    }
    function selectViewOrder() {
        for (let i = initial(length); condition(i); i++) {
            loop(i);
        }
    }
    function selectReverseViewOrder() {
        for (let i = initial(length); condition(i); i--) {
            loop(i);
        }
    }

    reverse ? selectReverseViewOrder() : selectViewOrder();

    //  console.log("returnArray"+ returnArray)
    returnArray.push(<Text style={{ color: "transparent", fontSize: 1 }}>Math.random()</Text>);
    return returnArray;
};
