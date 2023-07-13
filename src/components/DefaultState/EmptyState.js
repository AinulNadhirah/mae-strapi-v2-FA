import PropTypes from "prop-types";
import React, { useState } from "react";
import { View, Image, Dimensions, StyleSheet } from "react-native";

import { DropDownButtonNoIcon } from "@components/Common";
import Typo from "@components/Text";

import { YELLOW } from "@constants/colors";

import assets from "@assets";

const { height } = Dimensions.get("window");

const EmptyState = ({
    onActionBtnClick,
    title,
    titleContainerStyle,
    subTitle,
    subTitleContainerStyle,
    buttonLabel,
    buttonContainerStyle,
}) => {
    const [isShowBg, setIsShowBg] = useState(true);
    function onLayout(event) {
        const screenHeight = event.nativeEvent.layout.height;
        if (screenHeight < height / 2) {
            setIsShowBg(false);
        } else {
            setIsShowBg(true);
        }
    }

    return (
        <View style={styles.container} onLayout={onLayout}>
            {isShowBg && <Image style={styles.imgBG} source={assets.illustrationEmptyState} />}
            <View style={styles.emptyContainer}>
                <View style={[styles.emptyTitle, titleContainerStyle]}>
                    <Typo
                        fontSize={18}
                        fontWeight="bold"
                        fontStyle="normal"
                        letterSpacing={0}
                        lineHeight={32}
                        text={title}
                    />
                </View>

                <View style={[styles.emptyDesc, subTitleContainerStyle]}>
                    <Typo
                        fontSize={14}
                        fontWeight="400"
                        fontStyle="normal"
                        letterSpacing={0}
                        lineHeight={18}
                        text={subTitle}
                    />
                </View>
                {!!buttonLabel && (
                    <View style={[styles.emptyActionContainer, buttonContainerStyle]}>
                        <DropDownButtonNoIcon
                            headerText={buttonLabel}
                            iconType={1}
                            showIconType={false}
                            textLeft={false}
                            backgroundColor={YELLOW}
                            onPress={onActionBtnClick}
                        />
                    </View>
                )}
            </View>
            <View style={styles.paddingBottom} />
        </View>
    );
};
EmptyState.propTypes = {
    onActionBtnClick: PropTypes.func,
    title: PropTypes.string,
    subTitle: PropTypes.string,
    buttonLabel: PropTypes.string,
    titleContainerStyle: PropTypes.object,
    subTitleContainerStyle: PropTypes.object,
    buttonContainerStyle: PropTypes.object,
};
const styles = StyleSheet.create({
    container: {
        flex: 1,
        marginTop: 27,
    },
    emptyActionContainer: {
        marginTop: 24,
        width: 160,
    },
    emptyContainer: {
        alignItems: "center",
        flex: 0.3,
        flexDirection: "column",
        justifyContent: "center",
        paddingHorizontal: 36,
    },
    emptyDesc: {
        marginTop: 8,
    },
    emptyTitle: {
        // marginTop: 40,
    },
    imgBG: {
        bottom: 0,
        height: height * 0.4,
        position: "absolute",
        width: "100%",
    },
    paddingBottom: {
        flex: 0.7,
        width: "100%",
    },
});

export default EmptyState;
