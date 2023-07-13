import { BlurView } from "@react-native-community/blur";
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

function SingleTextInputModal({
    isShow,
    title,
    onDismiss,
    children,
    actionBtnLbl,
    actionBtnOnClick,
}) {
    return (
        <>
            {isShow && (
                <Animatable.View style={styles.blur} animation="fadeIn" duration={200}>
                    <BlurView style={styles.blur} blurType="dark" blurAmount={10} />
                </Animatable.View>
            )}
            <Modal
                avoidKeyboard={true}
                animationIn="fadeIn"
                animationOut="fadeOut"
                visible={isShow}
                style={styles.modal}
                onRequestClose={onDismiss}
                useNativeDriver
                transparent
            >
                <View style={styles.container}>
                    <TouchableWithoutFeedback onPress={onDismiss} style={styles.touchable}>
                        <View style={styles.empty}>
                            <View />
                        </View>
                    </TouchableWithoutFeedback>
                    <Animatable.View
                        animation="slideInUp"
                        duration={300}
                        useNativeDriver
                        style={styles.animatedCardContainer}
                    >
                        <View style={styles.topBar}>
                            <TouchableOpacity onPress={onDismiss} style={styles.closeContainer}>
                                <Image source={assets.icCloseBlack} style={styles.closeIcon} />
                            </TouchableOpacity>
                        </View>

                        <View style={styles.bodyContainer}>
                            <Typo
                                fontSize={18}
                                fontWeight="bold"
                                color={BLACK}
                                textAlign="left"
                                lineHeight={22}
                                text={title}
                            />
                            <View style={styles.midPadding} />
                            {children}
                            <ActionButton
                                onPress={actionBtnOnClick}
                                backgroundColor={YELLOW}
                                borderRadius={48 / 2}
                                style={styles.actionBtn}
                                componentCenter={
                                    <Typo
                                        fontSize={14}
                                        color={BLACK}
                                        fontWeight="600"
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

const styles = StyleSheet.create({
    actionBtn: {
        height: 48,
        marginBottom: 44,
        marginTop: 56,
        width: width - 50,
    },
    animatedCardContainer: {
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
    bodyContainer: {
        backgroundColor: WHITE,
        marginTop: 31,
        paddingHorizontal: 24,
        width: "100%",
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
    closeContainer: {
        alignItems: "center",
        height: 44,
        justifyContent: "center",
        position: "absolute",
        right: 0,
        top: 0,
        width: 44,
    },
    closeIcon: { height: 16, width: 16 },
    container: {
        alignItems: "center",
        flex: 1,
        justifyContent: "flex-end",
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
    empty: {
        flex: 1,
        width: "100%",
    },
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
    midPadding: { height: 32 },
    modal: { margin: 0 },
    topBar: { alignItems: "flex-end" },
    touchable: {
        flex: 1,
        height: "100%",
        width: "100%",
    },
});

export default SingleTextInputModal;
