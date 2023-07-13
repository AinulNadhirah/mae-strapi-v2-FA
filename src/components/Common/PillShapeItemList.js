import React from "react";
import PropTypes from "prop-types";
import { Text, TouchableOpacity, View, Image } from "react-native";
import { getShortNameTransfer } from "@utils/dataModel/utility";
import { getShadow } from "@utils/dataModel/utility";

const getIconUI = (iconImage, iconType, title, iconBgColor) => {
    if (title == null) {
        title = "--";
    }
    let returnUI;

    if (typeof iconImage === "undefined" || iconImage == null || iconImage == "") {
        iconType = "alphabet";
    }

    switch (iconType) {
        case "small":
            returnUI = (
                <View style={Styles.pillShapeViewInner1}>
                    <View style={[Styles.pillShapeCircle, { backgroundColor: iconBgColor }]}>
                        <Image
                            style={Styles.pillShapeCircleIcon}
                            source={iconImage}
                            resizeMode="center"
                        />
                    </View>
                </View>
            );
            break;
        case "big":
            returnUI = (
                <View style={Styles.pillShapeViewInner1}>
                    <View style={[Styles.pillShapeCircle, { backgroundColor: iconBgColor }]}>
                        <Image
                            style={Styles.pillShapeCircleFull}
                            source={iconImage}
                            resizeMode="center"
                        />
                    </View>
                </View>
            );
            break;
        case "alphabet":
            returnUI = (
                <View style={Styles.pillShapeViewInner1}>
                    <View style={[Styles.pillShapeCircle, { backgroundColor: iconBgColor }]}>
                        <Text
                            style={[Styles.shortNameLabelBlack]}
                            accessible={true}
                            testID={"txtByClickingNext"}
                            accessibilityLabel={"txtByClickingNext"}
                        >
                            {getShortNameTransfer(title)}
                        </Text>
                    </View>
                </View>
            );
            break;
        default:
            break;
    }
    return returnUI;
};

const getLabelUI = (labelType, title, text1, text2) => {
    let returnUI;

    switch (labelType) {
        case 1:
            returnUI = (
                <View style={Styles.pillShapeViewInner2}>
                    <Text
                        style={[Styles.pillShapeLabel, Styles.pillShapeLabelType1]}
                        accessible={true}
                    >
                        {title}
                    </Text>
                </View>
            );
            break;
        case 2:
            returnUI = (
                <View style={Styles.pillShapeViewInner2}>
                    <Text
                        numberOfLines={1}
                        style={[
                            Styles.pillShapeLabel,
                            Styles.pillShapeLabelBlack,
                            Styles.pillShapeLabelType2,
                            Styles.pillShapeRow1,
                        ]}
                        accessible={true}
                    >
                        {title}
                    </Text>
                    <Text
                        numberOfLines={1}
                        style={[Styles.pillShapeLabel, Styles.pillShapeLabelType2]}
                        accessible={true}
                    >
                        {text1}
                    </Text>
                    <Text
                        numberOfLines={1}
                        style={[
                            Styles.pillShapeLabel,
                            Styles.pillShapeLabelType2,
                            Styles.pillShapeRow3,
                        ]}
                        accessible={true}
                    >
                        {text2}
                    </Text>
                </View>
            );
            break;
        case 3:
            returnUI = (
                <View style={Styles.pillShapeViewInner2}>
                    <Text
                        style={[
                            Styles.pillShapeLabel,
                            Styles.pillShapeLabelType1,
                            Styles.pillShapeLabelBlack,
                        ]}
                        accessible={true}
                    >
                        {title}
                    </Text>
                </View>
            );
            break;
        default:
            break;
    }

    return returnUI;
};

const PillShapeItemList = ({
    onPress,
    data,
    iconImage,
    iconType,
    iconBgColor,
    labelType,
    title,
    text1,
    text2,
    pillWidth,
}) => {
    function onPressFunc() {
        onPress(data);
    }

    return (
        <TouchableOpacity
            activeOpacity={0.8}
            onPress={onPressFunc}
            style={[Styles.pillShapeMain, { width: pillWidth }]}
        >
            <View style={Styles.pillShapeView}>
                {getIconUI(iconImage, iconType, title, iconBgColor)}
                {getLabelUI(labelType, title, text1, text2)}
            </View>
        </TouchableOpacity>
    );
};

// Specifies the default values for props:
PillShapeItemList.defaultProps = {
    iconImage: "",
    iconType: "big",
    iconBgColor: "#D8D8D8",
    labelType: 1,
    title: "--",
    pillWidth: 200,
    onPress: () => {},
};

PillShapeItemList.propTypes = {
    data: PropTypes.object,
    onPress: PropTypes.func.isRequired,
    iconImage: PropTypes.oneOfType([PropTypes.string, PropTypes.number, PropTypes.object]),
    iconType: PropTypes.oneOf(["small", "big", "alphabet"]),
    iconBgColor: PropTypes.string,
    labelType: PropTypes.oneOf([1, 2, 3]),
    title: PropTypes.string.isRequired,
    text1: PropTypes.string,
    text2: PropTypes.string,
    pillWidth: PropTypes.number,
};

const Styles = {
    pillShapeMain: {
        alignSelf: "flex-start",
    },
    pillShapeView: {
        height: 80,
        borderRadius: 50,
        marginLeft: 0,
        backgroundColor: "#fff",
        flexDirection: "row",
        ...getShadow({}),
    },
    pillShapeViewInner1: {
        borderTopLeftRadius: 50,
        borderBottomLeftRadius: 50,
        flexDirection: "column",
    },
    pillShapeViewInner2: {
        flex: 1,
        marginLeft: 15,
        marginRight: 10,
        borderTopRightRadius: 50,
        borderBottomRightRadius: 50,
        justifyContent: "center",
        flexDirection: "column",
        alignItems: "flex-start",
    },
    pillShapeLabel: {
        fontFamily: "montserrat",
        fontStyle: "normal",
    },
    pillShapeLabelBlack: {
        fontWeight: "bold",
    },
    pillShapeLabelType1: {
        fontSize: 15,
        lineHeight: 15,
        color: "#000",
    },
    pillShapeLabelType2: {
        fontSize: 13,
        color: "#000",
    },
    pillShapeRow1: {
        marginTop: 10,
    },
    pillShapeRow3: {
        marginBottom: 10,
    },
    pillShapeCircle: {
        width: 64,
        height: 64,
        borderRadius: 50,
        marginLeft: 7,
        marginTop: 8,
        flexDirection: "row",
        justifyContent: "center",
        alignContent: "center",
        alignItems: "center",
        borderWidth: 1,
        borderColor: "white",
    },
    pillShapeCircleIcon: {
        width: 48,
        height: 48,
    },
    pillShapeCircleFull: {
        width: 64,
        height: 64,
    },
    shortNameLabelBlack: {
        fontFamily: "montserrat",
        fontSize: 23,
        fontWeight: "normal",
        fontStyle: "normal",
        color: "#9B9B9B",
    },
};
export default PillShapeItemList;
