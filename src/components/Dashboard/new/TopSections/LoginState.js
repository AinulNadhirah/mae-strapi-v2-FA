import PropTypes from "prop-types";
import React from "react";
import { Image, StyleSheet, View, TouchableOpacity } from "react-native";

import SpaceFiller from "@components/Placeholders/SpaceFiller";
import Typo from "@components/Text";

import { GREY, RHYTHM, WHITE } from "@constants/colors";
import {
    LOG_IN_NOW,
    LOGIN_STATE_TOP_SECTION_DESC,
    LOGIN_STATE_TOP_SECTION_TITLE,
} from "@constants/strings";

import Images from "@assets";

const LoginState = ({ onPress }) => {
    return (
        <View style={styles.container}>
            <Image source={Images.dashboard.icons.maybankLogo} style={styles.image} />
            <SpaceFiller height={16} />
            <Typo
                text={LOGIN_STATE_TOP_SECTION_TITLE}
                fontWeight="600"
                fontSize={18}
                lineHeight={20}
                textAlign="center"
            />
            <SpaceFiller height={8} />
            <Typo
                text={LOGIN_STATE_TOP_SECTION_DESC}
                fontWeight="400"
                fontSize={12}
                lineHeight={18}
                textAlign="center"
                color={RHYTHM}
            />
            <SpaceFiller height={16} />
            <TouchableOpacity style={styles.buttonContainer} onPress={onPress}>
                <Typo
                    text={LOG_IN_NOW}
                    fontWeight="600"
                    fontSize={12}
                    lineHeight={18}
                    textAlign="center"
                />
            </TouchableOpacity>
        </View>
    );
};

LoginState.propTypes = {
    onPress: PropTypes.func,
};

const styles = StyleSheet.create({
    container: {
        alignItems: "center",
    },
    buttonContainer: {
        backgroundColor: WHITE,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: GREY,
        alignSelf: "center",
        paddingHorizontal: 24,
        paddingVertical: 4.5,
    },
    image: {
        height: 36,
        width: 36,
    },
});
export default LoginState;
