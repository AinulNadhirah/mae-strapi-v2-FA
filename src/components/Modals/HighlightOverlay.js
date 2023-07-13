import MaskedView from "@react-native-community/masked-view";
import PropTypes from "prop-types";
import React from "react";
import { View, TouchableOpacity, StyleSheet } from "react-native";
import * as Animatable from "react-native-animatable";

import Typo from "@components/Text";

import { YELLOW, WHITE, GREY, BLACK, MAGENTA } from "@constants/colors";

const Button = ({ buttonText, buttonStyle, onCloseHandle }) => {
    return (
        <TouchableOpacity style={buttonStyle} onPress={onCloseHandle}>
            <Typo
                fontSize={12}
                fontWeight="bold"
                color={BLACK}
                lineHeight={18}
                textAlign="center"
                text={buttonText}
            />
        </TouchableOpacity>
    );
};

Button.propTypes = {
    buttonStyle: PropTypes.object,
    buttonText: PropTypes.string,
    onCloseHandle: PropTypes.func,
};

const HighlightOverlay = ({
    highlightPosition,
    showHighlight,
    onClose,
    onNext,
    children,
    title,
    description,
    primaryBtn,
    secondaryBtn,
}) => {
    const { h, w, x, y } = highlightPosition;

    const styleCircle = {
        backgroundColor: MAGENTA,
        borderRadius: 200,
        height: h,
        width: w,
        position: "absolute",
        top: y,
        left: x,
    };

    const dialogPosition = {
        top: y + h + 20,
    };

    const pointerPosition = {
        left: x,
        top: y + h + 5,
    };

    return (
        <>
            {showHighlight ? (
                <>
                    <View style={styles.background} pointerEvents="none">
                        <MaskedView
                            style={StyleSheet.absoluteFill}
                            maskElement={
                                <View style={styles.maskBg}>
                                    <View style={styleCircle} />
                                </View>
                            }
                        >
                            {children}
                        </MaskedView>
                    </View>
                    <Animatable.View
                        animation="fadeIn"
                        duration={350}
                        delay={350}
                        useNativeDriver
                        style={{ ...styles.triangle, ...pointerPosition }}
                    />
                    <Animatable.View
                        animation="fadeIn"
                        duration={350}
                        delay={350}
                        useNativeDriver
                        style={{ ...styles.dialogBox, ...dialogPosition }}
                    >
                        <View>
                            <Typo
                                text={title}
                                fontWeight="600"
                                fontSize={14}
                                lineHeight={18}
                                style={styles.margin10}
                                textAlign="center"
                            />
                            <Typo
                                text={description}
                                fontWeight="normal"
                                fontSize={14}
                                lineHeight={18}
                                textAlign="center"
                            />
                        </View>
                        <View style={styles.dialogBottom}>
                            {secondaryBtn && (
                                <Button
                                    buttonText={secondaryBtn}
                                    buttonStyle={styles.nextContainer}
                                    onCloseHandle={onClose}
                                />
                            )}
                            <Button
                                buttonText={primaryBtn}
                                buttonStyle={styles.buttonContainer}
                                onCloseHandle={onNext}
                            />
                        </View>
                    </Animatable.View>
                </>
            ) : (
                <React.Fragment>{children}</React.Fragment>
            )}
        </>
    );
};

const styles = StyleSheet.create({
    background: {
        backgroundColor: BLACK,
        flex: 1,
    },
    buttonContainer: {
        backgroundColor: YELLOW,
        borderRadius: 35 / 2,
        height: 35,
        justifyContent: "center",
        margin: 5,
        width: "50%",
    },
    dialogBottom: {
        flexDirection: "row",
        justifyContent: "space-evenly",
        marginTop: 15,
    },
    dialogBox: {
        alignSelf: "center",
        backgroundColor: WHITE,
        borderRadius: 10,
        padding: 15,
        position: "absolute",
        width: "90%",
    },
    margin10: { marginBottom: 10 },
    // eslint-disable-next-line react-native/no-color-literals
    maskBg: {
        backgroundColor: "rgba(0,0,0,0.3)",
        flex: 1,
    },
    nextContainer: {
        backgroundColor: WHITE,
        borderColor: GREY,
        borderRadius: 35 / 2,
        borderWidth: 1,
        height: 35,
        justifyContent: "center",
        margin: 5,
        width: "50%",
    },
    triangle: {
        borderBottomColor: WHITE,
        borderBottomWidth: 20,
        borderLeftWidth: 15,
        borderRightWidth: 15,
        position: "absolute",
    },
});

HighlightOverlay.propTypes = {
    highlightPosition: PropTypes.object,
    onClose: PropTypes.func,
    onNext: PropTypes.func,
    showHighlight: PropTypes.bool,
    children: PropTypes.node,
    title: PropTypes.string,
    description: PropTypes.string,
    primaryBtn: PropTypes.string,
    secondaryBtn: PropTypes.string,
};

export default HighlightOverlay;
