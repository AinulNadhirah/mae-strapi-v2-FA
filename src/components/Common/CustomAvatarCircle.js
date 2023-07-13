import React from "react";
import PropTypes from "prop-types";
import { View, Image, TouchableOpacity, TouchableWithoutFeedback } from "react-native";

const CustomAvatarCircle = ({
    onPress,
    source,
    radious,
    tick = false,
    tickSource,
    big = false,
}) => {
    //const { text } = data;

    return (
        <TouchableWithoutFeedback style={styles.avatarLayout} onPress={onPress}>
            <View>
                <Image
                    style={big === true ? styles.avatarBig : styles.avatar}
                    source={source}
                    // source={require("@assets/icons/ic_avatar_200.png")}
                />

                {tick === true ? (
                    <Image
                        style={{
                            position: "absolute",
                            width: 20,
                            height: 20,
                            borderRadius: 10,
                            marginLeft: 40,
                            marginTop: 40,
                        }}
                        source={tickSource}
                    />
                ) : null}
            </View>
        </TouchableWithoutFeedback>
    );
};

const styles = {
    avatarLayout: {
        width: 100,
        height: 100,
        flexDirection: "column",
        borderRadius: 100 / 2,
        backgroundColor: "transparent",
        //  backgroundColor:'transparent',
        alignItems: "center",
        justifyContent: "center",
    },
    avatar: {
        width: 60,
        height: 60,
        borderRadius: 60 / 2,
    },
    avatarBig: {
        width: 80,
        height: 80,
        borderRadius: 80 / 2,
    },
};
export { CustomAvatarCircle };
