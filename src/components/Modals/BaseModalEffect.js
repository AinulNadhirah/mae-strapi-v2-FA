import PropTypes from "prop-types";
import React, { useState, useEffect, useRef } from "react";
import {
    View,
    StyleSheet,
    TouchableOpacity,
    TouchableWithoutFeedback,
    Dimensions,
    Image,
} from "react-native";
import * as Animatable from "react-native-animatable";

import ActionButton from "@components/Buttons/ActionButton";
import Typo from "@components/Text";

import { BLACK, GREY, MEDIUM_GREY, WHITE, YELLOW } from "@constants/colors";

import { usePrevious } from "@utils/hooks";

import assets from "@assets";

const { width } = Dimensions.get("window");

/** Modal effect without using react-native modal and blur
 * react-native-modal and blur will cause issue if 2 modal/blur present at the same time
 */
function BaseModalEffect({
    isShow,
    title,
    onDismiss,
    doneDismissCallback = () => {},
    children,
    actionBtnLbl,
    actionBtnOnClick,
    actionBtnIsDisabled = false,
}) {
    const bgRef = useRef();
    const viewRef = useRef();

    const [isShowLocal, setIsShowLocal] = useState(false);
    const prevIsShowLocal = usePrevious(isShowLocal);

    const prevIsShow = usePrevious(isShow);
    useEffect(() => {
        if (!prevIsShow && isShow && !isShowLocal) {
            // Show
            setIsShowLocal(true);
        } else if (prevIsShow && !isShow && isShowLocal) {
            // Hide
            bgRef.current.fadeOut(200);
            viewRef.current.slideOutDown(800).then((endState) => {
                endState.finished && setIsShowLocal(false);
            });
        } else if (prevIsShowLocal && !isShowLocal) {
            // On done hidding
            doneDismissCallback();
        }
    }, [isShow, prevIsShow, prevIsShowLocal, isShowLocal, doneDismissCallback]);

    return (
        <>
            {isShowLocal && (
                <View style={styles.mainContainer}>
                    <Animatable.View
                        ref={bgRef}
                        style={styles.fadeBg}
                        animation="fadeIn"
                        duration={200}
                    />

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
                            ref={viewRef}
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
                                    onPress={actionBtnIsDisabled ? null : actionBtnOnClick}
                                    backgroundColor={actionBtnIsDisabled ? WHITE : YELLOW}
                                    borderRadius={48 / 2}
                                    borderWidth={actionBtnIsDisabled ? 1 : 0}
                                    borderColor={actionBtnIsDisabled ? GREY : null}
                                    style={styles.actionBtnContainer}
                                    componentCenter={
                                        <Typo
                                            fontSize={14}
                                            fontWeight="semi-bold"
                                            lineHeight={18}
                                            text={actionBtnLbl}
                                            color={actionBtnIsDisabled ? GREY : BLACK}
                                        />
                                    }
                                />
                            </View>
                        </Animatable.View>
                    </View>
                </View>
            )}
        </>
    );
}
BaseModalEffect.propTypes = {
    isShow: PropTypes.bool,
    title: PropTypes.string,
    onDismiss: PropTypes.func,
    doneDismissCallback: PropTypes.func,
    children: PropTypes.any,
    actionBtnLbl: PropTypes.string,
    actionBtnOnClick: PropTypes.func,
    actionBtnIsDisabled: PropTypes.bool,
};

const styles = StyleSheet.create({
    actionBtnContainer: {
        height: 48,
        marginBottom: 44,
        marginTop: 20,
        width: width - 50,
    },
    animatedCard: {
        backgroundColor: MEDIUM_GREY,
        borderTopLeftRadius: 16,
        borderTopRightRadius: 16,
        overflow: "hidden",
        width: "100%",
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
    containerView: {
        alignItems: "center",
        flex: 1,
        justifyContent: "flex-end",
    },
    contentContainer: {
        marginTop: 31,
        paddingHorizontal: 24,
        width: "100%",
    },
    empty: {
        flex: 1,
        width: "100%",
    },
    fadeBg: {
        backgroundColor: `rgba(0,0,0,0.5)`,
        bottom: 0,
        left: 0,
        position: "absolute",
        right: 0,
        top: 0,
    },
    height20: { height: 20 },
    mainContainer: { height: "100%", position: "absolute", width: "100%", zIndex: 99 },
    topContainerClose: { alignItems: "flex-end" },
    touchable: {
        flex: 1,
        height: "100%",
        width: "100%",
    },
});

export default BaseModalEffect;
