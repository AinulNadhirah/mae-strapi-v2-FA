import { BlurView } from "@react-native-community/blur";
import PropTypes from "prop-types";
import React from "react";
import {
    View,
    StyleSheet,
    TouchableOpacity,
    TouchableWithoutFeedback,
    Dimensions,
    Image,
} from "react-native";
import * as Animatable from "react-native-animatable";
import Modal from "react-native-modal";

import ActionButton from "@components/Buttons/ActionButton";
import Typo from "@components/Text";

import { BLACK, WHITE, YELLOW } from "@constants/colors";

import assets from "@assets";

const { width } = Dimensions.get("window");

function RadioButtonModal({ isShow, title, onDismiss, children, actionBtnLbl, actionBtnOnClick }) {
    return (
        <>
            {isShow && (
                <Animatable.View style={styles.blur} animation="fadeIn" duration={200}>
                    <BlurView style={styles.blur} blurType="dark" blurAmount={10} />
                </Animatable.View>
            )}
            <Modal
                avoidKeyboard
                animationIn="fadeIn"
                animationOut="fadeOut"
                visible={isShow}
                style={styles.modal}
                onRequestClose={onDismiss}
                useNativeDriver
                transparent
            >
                <View style={styles.containerView}>
                    <TouchableWithoutFeedback onPress={onDismiss} style={styles.touchable}>
                        <View style={styles.empty}>
                            <View />
                        </View>
                    </TouchableWithoutFeedback>
                    <Animatable.View
                        animation="slideInUp"
                        duration={300}
                        useNativeDriver
                        style={styles.animatedCard}
                    >
                        <View style={styles.topContainerClose}>
                            <TouchableOpacity onPress={onDismiss} style={styles.closeTouchable}>
                                <Image source={assets.icCloseBlack} style={styles.closeIcon} />
                            </TouchableOpacity>
                        </View>

                        <View style={styles.contentContainer}>
                            <Typo
                                fontSize={18}
                                fontWeight="bold"
                                color={BLACK}
                                textAlign="left"
                                lineHeight={22}
                                text={title}
                            />
                            <View style={styles.height20} />
                            {children}
                            <ActionButton
                                onPress={actionBtnOnClick}
                                backgroundColor={YELLOW}
                                borderRadius={48 / 2}
                                style={styles.actionBtnContainer}
                                componentCenter={
                                    <Typo
                                        fontSize={14}
                                        color={BLACK}
                                        fontWeight="semi-bold"
                                        lineHeight={18}
                                        text={actionBtnLbl}
                                    />
                                }
                            />
                        </View>
                    </Animatable.View>
                </View>
            </Modal>
        </>
    );
}
RadioButtonModal.propTypes = {
    isShow: PropTypes.bool,
    title: PropTypes.string,
    onDismiss: PropTypes.func,
    children: PropTypes.any,
    actionBtnLbl: PropTypes.string,
    actionBtnOnClick: PropTypes.func,
};

const styles = StyleSheet.create({
    actionBtnContainer: {
        height: 48,
        marginBottom: 44,
        marginTop: 20,
        width: width - 50,
    },
    animatedCard: {
        backgroundColor: WHITE,
        borderTopLeftRadius: 16,
        borderTopRightRadius: 16,
        overflow: "hidden",
        width: "100%",
    },
    blur: {
        bottom: 0,
        elevation: 99,
        left: 0,
        position: "absolute",
        right: 0,
        top: 0,
    },
    btnClose: {
        backgroundColor: WHITE,
        flex: 1,
    },
    btnDone: {
        flex: 1,
        flexDirection: "row",
        justifyContent: "flex-end",
        backgroundColor: WHITE,
    },
    closeIcon: { height: 16, width: 16 },
    closeTouchable: {
        alignItems: "center",
        height: 44,
        justifyContent: "center",
        position: "absolute",
        right: 0,
        top: 0,
        width: 44,
    },
    containerBottom: {
        alignItems: "center",
        flex: 1,
        justifyContent: "flex-end",
    },
    containerModal: {
        height: 397,
        width: "100%",
    },
    containerTopBar: {
        alignItems: "center",
        backgroundColor: WHITE,
        borderTopLeftRadius: 16,
        borderTopRightRadius: 16,
        flexDirection: "row",
        height: 60,
        paddingHorizontal: 24,
        width: "100%",
    },
    containerView: {
        alignItems: "center",
        flex: 1,
        justifyContent: "flex-end",
    },
    contentContainer: {
        backgroundColor: WHITE,
        marginTop: 31,
        paddingHorizontal: 24,
        width: "100%",
    },
    empty: {
        flex: 1,
        width: "100%",
    },
    height20: { height: 20 },
    itemRowContainer: {
        alignItems: "center",
        flexDirection: "row",
        justifyContent: "center",
        paddingHorizontal: 10,
    },
    itemRowSelectedContainer: {
        alignItems: "center",
        flexDirection: "row",
        justifyContent: "center",
    },
    modal: { margin: 0 },
    topContainerClose: { alignItems: "flex-end" },
    touchable: {
        flex: 1,
        height: "100%",
        width: "100%",
    },
});

export default RadioButtonModal;
