import PropTypes from "prop-types";
import React, { useState, useEffect, useRef } from "react";
import { View, StyleSheet, TouchableOpacity } from "react-native";
import * as Animatable from "react-native-animatable";

import { MEDIUM_GREY } from "@constants/colors";

import { usePrevious } from "@utils/hooks";

/** Modal effect without using react-native modal and blur
 * react-native-modal and blur will cause issue if 2 modal/blur present at the same time
 *
 * Clean version - without title, X , and ActionButton.
 */
function BaseModalEffectClean({ isShow, onDismiss, doneDismissCallback = () => {}, children }) {
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
                        <TouchableOpacity
                            activeOpacity={1}
                            onPress={onDismiss}
                            style={styles.touchable}
                        />
                        <Animatable.View
                            animation="slideInUp"
                            duration={300}
                            useNativeDriver
                            style={styles.animatedCard}
                            ref={viewRef}
                        >
                            <View style={styles.contentContainer}>{children}</View>
                        </Animatable.View>
                    </View>
                </View>
            )}
        </>
    );
}
BaseModalEffectClean.propTypes = {
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
    animatedCard: {
        backgroundColor: MEDIUM_GREY,
        borderTopLeftRadius: 16,
        borderTopRightRadius: 16,
        overflow: "hidden",
        width: "100%",
    },
    containerView: {
        alignItems: "center",
        flex: 1,
        justifyContent: "flex-end",
    },
    contentContainer: {
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
    mainContainer: { height: "100%", position: "absolute", width: "100%" },
    touchable: {
        flex: 1,
        height: "100%",
        width: "100%",
    },
});

export default BaseModalEffectClean;
