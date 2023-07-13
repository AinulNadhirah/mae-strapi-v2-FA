import React from "react";
import { Text, TouchableOpacity, View, Image } from "react-native";

const Headercontrols = ({ onbackPress, onclosePress, dots, source, backSource, closeSource }) => {
    return (
        <View>
            <View>
                <TouchableOpacity
                    onPress={onbackPress}
                    style={[Styles.buttonStyle]}
                    underlayColor={"#fff"}
                >
                    {/* <Image source={require(backSource)}></Image> */}

                    <Image
                        // style={styles.avatar}
                        // source={source}
                        source={require("@assets/icons/group6.png")}
                    />
                </TouchableOpacity>
            </View>
            <View>{/* <Image source={require(source)}></Image> */}</View>
            <View>
                <TouchableOpacity
                    onPress={onclosePress}
                    style={[Styles.buttonStyle]}
                    underlayColor={"#fff"}
                >
                    {/* <Image source={require(closeSource)}></Image> */}
                </TouchableOpacity>
            </View>
        </View>
    );
};

const Styles = {
    mainView: {
        backgroundColor: "black",
        width: 320,
        hight: 200,
    },
};
export { Headercontrols };
