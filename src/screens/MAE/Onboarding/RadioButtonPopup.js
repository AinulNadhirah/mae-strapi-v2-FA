/* eslint-disable react-native/no-color-literals */
import React, { useState } from "react";
import { View, StyleSheet, TouchableOpacity, Image } from "react-native";
import PropTypes from "prop-types";
import { Dialog } from "react-native-simple-dialogs";
import { MyView, RadioChecked, RadioUnchecked } from "@components/Common";
import Typo from "@components/Text";

const RadioButtonPopup = ({ title, onClose, showClose, onConfirmPress }) => {
    const [state, setState] = useState({
        accountType: "Conventional",
        islamicChecked: false,
        conventional: true,
    });
    const onConventionalPress = () => {
        console.log("[RadioButtonPopup] >> [Select Conventional]");
        setState({
            ...state,
            accountType: "Conventional",
            conventional: true,
            islamicChecked: false,
        });
    };
    const onIslamicPress = () => {
        console.log("[RadioButtonPopup] >> [Select Islamic]");
        setState({ ...state, accountType: "Islamic", islamicChecked: true, conventional: false });
    };

    const confirmPress = () => {
        console.log("[RadioButtonPopup] >> [Confirm Press]");
        onConfirmPress(state.accountType);
    };

    return (
        <View>
            <Dialog
                visible
                onTouchOutside={onClose}
                animationType="fade"
                onRequestClose={onClose}
                dialogStyle={styles.dialogBox}
            >
                <View>
                    <View style={styles.block}>
                        <View style={styles.titleContainer} />
                        <View style={styles.imageContainer}>
                            <MyView hide={!showClose}>
                                <TouchableOpacity onPress={onClose}>
                                    <Image
                                        style={styles.button}
                                        source={require("@assets/icons/ic_close.png")}
                                    />
                                </TouchableOpacity>
                            </MyView>
                        </View>
                    </View>
                    <View style={styles.titleView}>
                        <Typo
                            fontSize={14}
                            fontWeight="600"
                            lineHeight={18}
                            textAlign="left"
                            text={title}
                        />

                        <View style={styles.buttonContainer}>
                            <TouchableOpacity onPress={onConventionalPress}>
                                {state.conventional ? (
                                    <RadioChecked
                                        label="Conventional"
                                        paramLabelCls={styles.maeRadioLabelCls}
                                        paramImageCls={styles.tickimage}
                                    />
                                ) : (
                                    <RadioUnchecked
                                        label="Conventional"
                                        paramLabelCls={styles.maeRadioLabelCls}
                                        paramImageCls={styles.tickimage}
                                    />
                                )}
                            </TouchableOpacity>
                        </View>

                        <View style={styles.buttonContainer}>
                            <TouchableOpacity onPress={onIslamicPress}>
                                {state.islamicChecked ? (
                                    <RadioChecked
                                        label="Islamic"
                                        paramLabelCls={styles.maeRadioLabelCls}
                                        paramImageCls={styles.tickimage}
                                    />
                                ) : (
                                    <RadioUnchecked
                                        label="Islamic"
                                        paramLabelCls={styles.maeRadioLabelCls}
                                        paramImageCls={styles.tickimage}
                                    />
                                )}
                            </TouchableOpacity>
                        </View>
                        <View style={styles.conFirmButtonContainer}>
                            <TouchableOpacity style={styles.primaryButton} onPress={confirmPress}>
                                <Typo
                                    fontSize={14}
                                    fontWeight="600"
                                    lineHeight={18}
                                    text="Confirm"
                                />
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Dialog>
        </View>
    );
};

RadioButtonPopup.propTypes = {
    onConfirmPress: PropTypes.func.isRequired,
    onClose: PropTypes.func.isRequired,
    showClose: PropTypes.bool,
    title: PropTypes.string,
};

RadioButtonPopup.defaultProps = {
    onConfirmPress: () => {},
    onClose: () => {},
    showClose: true,
};

const styles = StyleSheet.create({
    block: { alignItems: "center", flexDirection: "row" },
    button: {
        height: 40,
        width: 40,
    },
    buttonContainer: {
        marginTop: 20,
    },
    conFirmButtonContainer: {
        marginTop: 10,
    },
    dialogBox: {
        borderRadius: 10,
    },
    imageContainer: { alignItems: "flex-end", flex: 1 },
    maeRadioLabelCls: {
        color: "#000000",
        fontFamily: "montserrat",
        fontSize: 14,
        fontStyle: "normal",
        fontWeight: "normal",
        letterSpacing: 0,
        lineHeight: 19,
        marginLeft: 10,
    },
    primaryButton: {
        alignItems: "center",
        alignSelf: "center",
        backgroundColor: "#ffde00",
        borderRadius: 24,
        height: 46,
        justifyContent: "center",
        marginTop: 32,
        width: "100%",
    },
    tickimage: {
        height: 18,
        paddingBottom: 10,
        width: 18,
    },
    titleContainer: { alignItems: "flex-start", flex: 4 },
    titleView: { paddingHorizontal: 24 },
});

export default RadioButtonPopup;
