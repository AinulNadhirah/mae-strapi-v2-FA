import PropTypes from "prop-types";
import React, { useCallback } from "react";
import {
    View,
    StyleSheet,
    ImageBackground,
    Dimensions,
    TouchableOpacity,
    Text,
} from "react-native";

import ActionButton from "@components/Buttons/ActionButton";
import Typo from "@components/Text";

import { BLACK, YELLOW, ROYAL_BLUE } from "@constants/colors";

const screenWidth = Dimensions.get("window").width;
const screenHeight = Dimensions.get("window").height;

const EmptyStateScreen = ({
    headerText,
    subText,
    showBtn,
    btnText,
    btnBGColor,
    onBtnPress,
    imageSrc,
    showCancelBtn,
    onCancelBtnPress,
    isDisplayStyle,
    headerStyle,
    showNote,
    noteText,
}) => {
    const onBtnTap = useCallback(() => {
        onBtnPress();
    }, [onBtnPress]);

    const onCancelBtnTap = useCallback(() => {
        onCancelBtnPress();
    }, [onCancelBtnPress]);

    return (
        <View style={Style.container}>
            <View style={Style.contentContainerCls}>
                {/* Header Text */}
                <Typo
                    fontSize={18}
                    lineHeight={32}
                    fontWeight="bold"
                    color={BLACK}
                    text={headerText}
                    style={isDisplayStyle ? headerStyle : Style.headerText}
                />

                {/* Sub Header Text */}
                <Typo
                    fontSize={14}
                    lineHeight={20}
                    fontWeight="normal"
                    color={BLACK}
                    text={subText}
                    style={{ marginBottom: 20 }}
                />

                {showNote && (
                    <Typo
                        fontSize={14}
                        lineHeight={20}
                        fontWeight="600"
                        color={BLACK}
                        style={{ marginBottom: 20 }}
                    >
                        <Text>Note: </Text>
                        <Typo
                            fontSize={14}
                            lineHeight={20}
                            // fontWeight="normal"
                            color={BLACK}
                            text={noteText}
                            style={{ marginBottom: 20, fontWeight: "normal" }}
                        />
                    </Typo>
                )}

                {/* Button component */}
                {showBtn && (
                    <ActionButton
                        backgroundColor={btnBGColor}
                        borderRadius={20}
                        height={40}
                        width={130}
                        componentCenter={
                            <Typo fontSize={14} fontWeight="600" lineHeight={18} text={btnText} />
                        }
                        onPress={onBtnTap}
                    />
                )}
                {/*  cancel Button component */}
                {showCancelBtn && (
                    <TouchableOpacity onPress={onCancelBtnTap}>
                        <Typo
                            fontSize={14}
                            fontWeight="600"
                            lineHeight={18}
                            text="Cancel"
                            color={ROYAL_BLUE}
                            style={Style.cancelButtontext}
                        />
                    </TouchableOpacity>
                )}
            </View>

            {/* Image component */}
            <ImageBackground
                style={{
                    width: "100%",
                    height: 300,
                }}
                source={imageSrc}
                imageStyle={{
                    resizeMode: "cover",
                }}
            />
        </View>
    );
};

const Style = StyleSheet.create({
    cancelButtontext: {
        marginTop: 20,
    },
    container: {
        height: "100%",
        justifyContent: "space-between",
        width: "100%",
    },
    contentContainerCls: {
        alignItems: "center",
        // height: 200,
        justifyContent: "space-around",
        marginHorizontal: (screenWidth * 15) / 100,
        paddingTop: (screenHeight * 6) / 100,
    },
    headerText: {
        marginBottom: 10,
    },
});

EmptyStateScreen.propTypes = {
    headerText: PropTypes.string.isRequired,
    subText: PropTypes.string.isRequired,
    showBtn: PropTypes.bool.isRequired,
    btnText: PropTypes.string,
    btnBGColor: PropTypes.string,
    onBtnPress: PropTypes.func,
    imageSrc: PropTypes.any,
    onCancelBtnPress: PropTypes.func,
    showCancelBtn: PropTypes.bool,
    isDisplayStyle: PropTypes.bool,
    headerStyle: PropTypes.any,
    showNote: PropTypes.bool,
    noteText: PropTypes.string,
};

EmptyStateScreen.defaultProps = {
    headerText: "",
    subText: "",
    showBtn: false,
    btnText: "",
    btnBGColor: YELLOW,
    onBtnPress: () => {},
    onCancelBtnPress: () => {},
    imageSrc: "",
    showNote: false,
    noteText: "",
};

const Memoiz = React.memo(EmptyStateScreen);

export default Memoiz;
