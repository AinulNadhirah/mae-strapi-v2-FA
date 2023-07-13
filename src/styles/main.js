import { StyleSheet, Dimensions, Platform } from "react-native";

import {
    GREEN,
    RED,
    WHITE,
    BLACK,
    OFF_WHITE,
    PRIMARY_YELLO,
    TRANSPARENT,
    GREY,
} from "@constants/colors";

export const IS_IOS = Platform.OS === "ios";
export const { width: viewportWidth, height: viewportHeight } = Dimensions.get("window");

export function wp(percentage) {
    const value = (percentage * viewportWidth) / 100;
    return Math.round(value);
}

/////////////////////////////////////////////////////
export const slideHeight = viewportHeight * 0.25;
export const slideWidth = wp(80);
export const itemHorizontalMargin = wp(2);

export const sliderWidth = viewportWidth;
export const itemWidth = slideWidth + itemHorizontalMargin * 2;

export const entryBorderRadius = 15;

/////////////////////////////////////////////////////

//export const slideWidthGoalSelect = wp(20);
//export const itemWidthGoalSelect = slideWidthGoalSelect + itemHorizontalMargin * 2;

export const slideWidthGoalSelect = wp(30);

export const itemHorizontalMarginGoalSelect = wp(3);

export const itemWidthGoalSelect = slideWidthGoalSelect + itemHorizontalMarginGoalSelect * 2;

export const itemHeightGoalSelect = viewportHeight * 0.32;

export const sliderWidthGaolItem = viewportWidth + 160;
export const sliderHeightGoalSelect = 5;

export const entryBorderRadiusGoalSelect = 15;
/////////////////////////////////////////////////////

export const blueBackgroundColor = "#f8f5f3";

export const greyBackgroundColor = "#f8f5f3";

export const yellowBackgroundColor = PRIMARY_YELLO;

export const whiteBackgroundColor = "#ffffff";

export const whiteLightBackgroundColor = OFF_WHITE;

export const montserratBold = "montserrat";
export const montserratSemiBold = "montserrat";
export const montserratRegular = "montserrat";
export const montserratLight = "montserrat";
export const montserrat = "Montserrat";

const FLEX_START = "flex-start";
const DROPDOWN_COLOR = "#a4a6a8";
const ERROR_COLOR = "#d0021b";
const LABEL_COLOR = "#212121";
const TITLE_COLOR = "rgba(0, 0, 0, 0.5)";

export default StyleSheet.create({
    BlurContainer: {
        alignItems: "center",
        backgroundColor: BLACK,
        bottom: 0,
        flex: 1,
        justifyContent: "center",
        left: 0,
        opacity: 0.5,
        position: "absolute",
        right: 0,
        top: 0,
    },
    DetailSmallTextLabel: {
        color: BLACK,
        fontFamily: "montserrat",
        fontSize: 12,
        fontStyle: "normal",
        fontWeight: "300",
        letterSpacing: -0.43,
        lineHeight: 33,
        marginLeft: "14%",
        marginRight: 50,
        marginTop: "1%",
        width: "80%",
        //height:'80%'
    },

    DetailTextLabel: {
        color: BLACK,
        fontFamily: "montserrat",
        fontSize: 23,
        fontStyle: "normal",
        fontWeight: "300",
        letterSpacing: -0.43,
        lineHeight: 33,
        marginLeft: "14%",
        marginRight: 50,
        marginTop: "3%",
        width: "80%",
        //height:'80%'
    },

    DetaillineLabel: {
        color: BLACK,
        fontFamily: "montserrat",
        fontSize: 23,
        fontStyle: "normal",
        fontWeight: "300",
        letterSpacing: -0.43,
        lineHeight: 33,
        marginLeft: "14%",
        marginRight: 50,
        marginTop: "1%",
        width: "80%",
    },

    InputFocusStyle: {
        color: BLACK,
        fontSize: 30,
    },

    Profilenput: {
        color: BLACK,
        fontFamily: "montserrat",
        fontSize: 23,
        fontStyle: "normal",
        fontWeight: "300",
        height: 80,
        letterSpacing: 0,
        lineHeight: 33,
        marginLeft: "13%",
        width: "60%",
    },
    RightView: {
        width: "15%",
        height: 70,
        alignItems: "center",
        justifyContent: "flex-end",
        marginLeft: "80%",
        marginBottom: 5,
        bottom: 0,
        position: "absolute",
        flexDirection: "row",
    },
    TitleLabel: {
        color: BLACK,
        marginTop: "7%",
        marginLeft: "14%",
        fontFamily: "montserrat",
        fontSize: 17,
        fontWeight: "400",
        lineHeight: 23,
        letterSpacing: 0,
    },
    avatar: {
        borderRadius: 80 / 2,
        height: 80,
        width: 80,
    },

    avatarLayout: {
        width: 100,
        height: 100,
        flexDirection: "column",
        borderRadius: 100 / 2,
        backgroundColor: TRANSPARENT,
        alignItems: "center",
        justifyContent: "center",
    },
    blackColour: {
        color: BLACK,
    },
    blueBackgroundColor: {
        backgroundColor: OFF_WHITE,
    },
    whiteBackgroundColor: {},
    whiteLightBackgroundColor: { backgroundColor: whiteLightBackgroundColor },
    blueContainer: {
        alignItems: "center",
        flex: 1,
        justifyContent: "center",
    },
    boldFont: {
        fontWeight: "bold",
    },
    boldText: {
        color: BLACK,
        fontWeight: "bold",
    },
    calender: {
        alignItems: FLEX_START,
        backgroundColor: PRIMARY_YELLO,
        height: "60%",
        width: "100%",
        position: "absolute",
        bottom: 0,
        left: 0,
        right: 0,
    },
    calenderViewFull: {
        backgroundColor: GREY,
        flex: 1,
        flexDirection: "row",
        marginTop: -50,
    },
    childContainer: {
        alignItems: FLEX_START,
        flex: 1,
        justifyContent: FLEX_START,
    },
    commonInput: {
        color: BLACK,
        fontFamily: "montserrat",
        fontSize: 23,
        fontStyle: "normal",
        fontWeight: "300",
        height: 50,
        letterSpacing: 0,
        lineHeight: 33,
        marginLeft: "14%",
        width: "90%",
    },
    commonInput1: {
        color: BLACK,
        fontFamily: "montserrat",
        fontSize: 23,
        fontStyle: "normal",
        fontWeight: "300",
        height: 50,
        letterSpacing: 0,
        lineHeight: 33,
        width: "90%",
    },
    commonInput2: {
        color: BLACK,
        fontFamily: "montserrat",
        fontSize: 20,
        fontStyle: "normal",
        fontWeight: "300",
        height: 50,
        letterSpacing: 0,
        lineHeight: 30,
        width: "90%",
    },
    commonInput3: {
        fontFamily: "montserrat",
        fontSize: 23,
        fontStyle: "normal",
        fontWeight: "200",
        letterSpacing: 0,
        lineHeight: 33,
        marginLeft: 10,
    },
    commonInput4: {
        color: BLACK,
        fontFamily: "montserrat",
        fontSize: 20,
        fontStyle: "normal",
        fontWeight: "300",
        height: 50,
        letterSpacing: 0,
        lineHeight: 30,
        width: "90%",
    },
    containerStyle: {
        alignItems: "center",
        borderColor: RED,
        flexDirection: "row",
        height: 100,
        justifyContent: FLEX_START,
        width: "100%",
    },
    content: {
        flex: 1,
        flexDirection: "column",
        width: "100%",
    },
    contentBlue: {
        alignItems: FLEX_START,
        flex: 1,
        justifyContent: FLEX_START,
    },

    contentSplash: {
        flex: 1,
        flexDirection: "column",
        backgroundColor: yellowBackgroundColor,
        justifyContent: "center",
    },
    contentTab: {
        flex: 1,
        flexDirection: "column",
    },
    dropDownStyle: {
        alignItems: "center",
        borderRadius: 25,
        borderWidth: 0.1,
        flexDirection: "row",
        height: 55,
        shadowColor: DROPDOWN_COLOR,
        shadowOffset: { width: 20, height: 20 },
        shadowOpacity: 1,
        shadowRadius: 2,
        width: "100%",
    },
    dropDownView: {
        marginLeft: 50,
        marginTop: 15,
        width: "80%",
    },
    dropDownView1: {
        marginLeft: 50,
        marginTop: 20,
        width: "80%",
    },

    dropDownView5: {
        borderRadius: 25,
        borderWidth: 0.1,
        height: 55,
        marginLeft: 50,
        marginTop: 20,
        shadowColor: DROPDOWN_COLOR,
        shadowOffset: { width: 20, height: 20 },
        shadowOpacity: 1,
        shadowRadius: 2,
        width: "80%",
    },
    dropDownsView: {
        marginTop: 2,
        height: "20%",
        width: "100%",
        flexDirection: "row",
        alignItems: "center",
    },

    dropdownViewTwo: {
        marginTop: "3%",
        marginLeft: "10%",
        width: "40%",
        backgroundColor: WHITE,
        height: 55,
        borderRadius: 25,
    },

    dropdownViewone: {
        marginTop: "3%",
        marginLeft: "5%",
        width: "40%",
        backgroundColor: WHITE,
        height: 55,
        borderRadius: 25,
    },

    dropdownoneLabel: {
        color: BLACK,
        fontFamily: "Montserrat",
        fontSize: 17,
        fontStyle: "normal",
        fontWeight: "600",
        letterSpacing: 0,
        lineHeight: 23,
        marginLeft: "5%",
        marginTop: "7%",
    },

    dropdownoneicon: {
        height: 8,
        marginLeft: "85%",
        marginTop: "-13%",
        width: 15,
    },
    error: {
        width: 500,
        height: 300,
        marginLeft: 40,
    },
    errortext: {
        color: ERROR_COLOR,
        fontFamily: "montserrat",
        fontSize: 17,
        fontStyle: "normal",
        fontWeight: "300",
        height: 46,
        letterSpacing: -0.3,
        lineHeight: 23,
        width: 275,
    },

    existingUserLabel: {
        color: BLACK,
        fontFamily: "montserrat",
        fontSize: 13,
        fontStyle: "normal",
        fontWeight: "600",
        height: 21,
        letterSpacing: 0,
        lineHeight: 20,
        opacity: 0.6,
        textDecorationLine: "underline",
    },

    existingUserView: {
        alignItems: FLEX_START,
        flex: 4,
        flexDirection: "row",
        height: 70,
        justifyContent: FLEX_START,
    },
    existionguserFlow: {
        height: 95,
        marginLeft: "14%",
        marginTop: "5%",
        width: "90%",
    },
    flex: {
        flex: 1,
    },

    font: {
        fontFamily: "montserrat",
    },

    fontBlack: {
        // fontFamily: "montserrat_black"
        fontFamily: "montserrat",
    },
    fontBold: {
        // fontFamily: "montserrat_bold"
        fontFamily: "montserrat",
    },
    fontExtraLight: {
        // fontFamily: "montserrat_extra_light"
        fontFamily: "montserrat",
    },
    fontLight: {
        // fontFamily: "montserrat_light"
        fontFamily: "montserrat",
    },
    fontMedium: {
        // fontFamily: "montserrat_medium"
        fontFamily: "montserrat",
    },
    fontRegular: {
        // fontFamily: "montserrat"
        fontFamily: "montserrat",
    },
    fontRegularThin: {
        // fontFamily: "montserrat_thin"
        fontFamily: "montserrat",
    },
    fontSemiBold: {
        fontFamily: "montserrat",
    },
    fontSize10: {
        fontSize: 10,
    },
    fontSize12: {
        fontSize: 12,
    },
    fontSize15: {
        fontSize: 15,
    },

    fontSize17: {
        fontSize: 17,
    },

    fontSize19: {
        fontSize: 19,
    },

    fontSize20: {
        fontSize: 20,
    },
    fontSize25: {
        fontSize: 25,
    },
    fontSize30: {
        fontSize: 30,
    },
    fontSize35: {
        fontSize: 35,
    },
    fontSize4: {
        fontSize: 4,
    },
    fontSize40: {
        fontSize: 40,
    },
    fontSize8: {
        fontSize: 8,
    },
    footerFiftyView: {
        flex: 1,
        alignItems: FLEX_START,
        justifyContent: FLEX_START,
        flexDirection: "row",
        marginRight: 7,
    },
    footerFiftyViewRow: {
        flex: 1.8,
        alignItems: FLEX_START,
        justifyContent: FLEX_START,
        flexDirection: "row",
    },

    footerFiftyViewSec: {
        flex: 1,
        alignItems: FLEX_START,
        justifyContent: FLEX_START,
        flexDirection: "row",
        marginLeft: 7,
    },

    footerFiftyViewSecFailureRow: {
        flex: 2.5,
        alignItems: FLEX_START,
        marginTop: 14,
        justifyContent: FLEX_START,
        flexDirection: "row",
    },

    footerFiftyViewSecRow: {
        flex: 2.5,
        alignItems: FLEX_START,
        justifyContent: FLEX_START,
        flexDirection: "row",
    },
    footerView: {
        alignItems: "center",
        bottom: 0,
        flexDirection: "row",
        height: 95,
        justifyContent: "center",
        marginBottom: 1,
        marginLeft: "15.5%",
        marginRight: 50,
        position: "absolute",
        width: "90%",
    },
    footerViewButtonGray: {
        alignItems: FLEX_START,
        backgroundColor: OFF_WHITE,
        bottom: 0,
        flexDirection: "row",
        height: 45,
        justifyContent: FLEX_START,
        marginBottom: 24,
        marginLeft: 35,
        marginRight: 35,
        position: "absolute",
        width: "85%",
    },
    footerView2Button: {
        alignItems: FLEX_START,
        bottom: 0,
        flexDirection: "row",
        height: 45,
        justifyContent: FLEX_START,
        marginBottom: 40,
        marginLeft: 35,
        marginRight: 35,
        position: "absolute",
        width: "85%",
    },
    footerView2ButtonRow: {
        alignItems: FLEX_START,
        bottom: 0,
        flexDirection: "column",
        height: 180,
        justifyContent: FLEX_START,
        marginBottom: 1,
        marginLeft: 55,
        marginRight: 50,
        position: "absolute",
        width: "75%",
    },

    greyBackgroundColor: {
        backgroundColor: greyBackgroundColor,
    },
    inputContainer: {
        alignItems: "center",
        flexDirection: "row",
        height: 50,
        marginLeft: "16%",
        marginTop: 30,
        width: "100%",
    },
    inputStyle: {
        borderRadius: 1,
        color: BLACK,
        fontSize: 30,
        fontWeight: "normal",
        height: 100,
        lineHeight: 1,
        marginLeft: 40,
        marginTop: 5,
        width: "80%",
    },

    mainViewWrapper: {
        backgroundColor: TRANSPARENT,
        flex: 1,
    },
    mayaBackground: {
        backgroundColor: blueBackgroundColor,
        flex: 1,
    },
    mayaLightBackground: {
        backgroundColor: blueBackgroundColor,
        flex: 1,
    },
    mayaBackgroundYellow: {
        flex: 4.8,
        alignItems: "center",
        justifyContent: "center",
    },
    mayaLogo: {
        alignItems: "center",
        height: 201,
        justifyContent: "center",
        marginTop: 36,
        width: 201,
    },
    mayaLogoText: {
        height: 19,
        width: 124,
    },
    mayaLogoTextView: {
        alignItems: "center",
        flex: 0.2,
        justifyContent: "flex-end",
        marginBottom: 36,
    },
    myICListLabel: {
        color: LABEL_COLOR,
        fontFamily: "montserrat",
        fontSize: 11,
        fontStyle: "normal",
        fontWeight: "normal",
        letterSpacing: 0.0,
        lineHeight: 16,
        marginLeft: 55,
        marginTop: 15,
        opacity: 0.6,
    },
    normalFont: {
        fontWeight: "normal",
    },
    resendView: {
        alignItems: "center",
        backgroundColor: GREEN,
        bottom: 0,
        flexDirection: "row",
        height: 70,
        justifyContent: "center",
        marginBottom: 36,
        marginLeft: "14%",
        marginRight: 50,
        position: "absolute",
        width: "90%",
    },
    roundButtonWithImage: {
        width: "80%",
    },
    roundButtonWithImageType: {
        width: "80%",
    },
    secondTitleText: {
        color: BLACK,
        fontSize: 15,
        fontStyle: "normal",
        fontWeight: "normal",
        letterSpacing: 0,
        lineHeight: 28,
    },

    secondViewTitleText: {
        color: BLACK,
        fontSize: 23,
        fontStyle: "normal",
        fontWeight: "300",
        letterSpacing: -0.43,
        lineHeight: 33,
        marginTop: 28,
    },
    splashText: {
        color: BLACK,
        fontSize: 23,
        fontStyle: "normal",
        fontWeight: "300",
        letterSpacing: 0,
        lineHeight: 33,
        marginLeft: 50,
        marginTop: 300,
    },
    termsConditionsLabel: {
        color: BLACK,
        fontFamily: "montserrat",
        fontSize: 12,
        fontStyle: "normal",
        fontWeight: "600",
        letterSpacing: 0.0,
        lineHeight: 18,
        marginLeft: 55,
        marginTop: 35,
        opacity: 0.6,
        textDecorationLine: "underline",
    },
    termsConditionsLabel2: {
        color: BLACK,
        fontSize: 12,
        fontWeight: "bold",
        lineHeight: 18,
        marginLeft: 55,
        marginTop: 35,
        textDecorationLine: "underline",
    },
    textDescMargin: {
        marginLeft: 25,
        marginTop: 0,
    },
    textWelcome: {
        marginBottom: 10,
        marginLeft: 25,
        marginTop: 10,
    },
    textWelcomeBold: {
        color: BLACK,
        fontSize: 17,
        fontStyle: "normal",
        fontWeight: "600",
        letterSpacing: 0,
        lineHeight: 23,
        marginBottom: 10,
        marginLeft: 25,
        marginTop: 30,
    },
    textWelcomeBold1: {
        color: WHITE,
        fontSize: 24,
        fontStyle: "normal",
        fontWeight: "600",
        letterSpacing: 0,
        lineHeight: 23,
        marginBottom: 10,
        marginLeft: 2,
        marginTop: 30,
    },
    thirdTitleText: {
        color: TITLE_COLOR,
        fontSize: 12,
        fontStyle: "normal",
        fontWeight: "normal",
        letterSpacing: 0,
        lineHeight: 28,
    },
    titleText: {
        color: BLACK,
        fontSize: 15,
        fontStyle: "normal",
        fontWeight: "600",
        letterSpacing: 0,
        lineHeight: 19,
        marginTop: 17,
    },
    titleText1: {
        color: BLACK,
        fontSize: 15,
        fontStyle: "normal",
        fontWeight: "600",
        letterSpacing: 0,
        lineHeight: 19,
        marginTop: 78,
    },

    touchScreen: {
        backgroundColor: TRANSPARENT,
        flex: 1,
    },
    touchableView: {
        marginLeft: "6%",
        width: "90%",
        marginTop: "3%",
        flexDirection: "row",
        alignItems: "center",
    },
    viewFlex: {
        alignItems: FLEX_START,
        flex: 1,
    },
    defaultBackground: {
        backgroundColor: OFF_WHITE,
    },
    wrappeTransp: {
        flex: 1,
        flexDirection: "column",
    },
    wrapper: {
        backgroundColor: WHITE,
        flex: 1,
    },
    wrapperAbsolute: {
        backgroundColor: WHITE,
        flex: 1,
        position: "absolute",
    },
    wrapperBlue: {
        flex: 1,
    },
    wrapperLight: {
        backgroundColor: blueBackgroundColor,
        flex: 1,
    },
    wrapperLightBlack: {
        flex: 1,
        flexDirection: "column",
        backgroundColor: TRANSPARENT,
    },
    wrapperPlain: {
        flex: 1,
    },

    wrapperTopMenu: {
        backgroundColor: WHITE,
        flex: 1,
        position: "absolute",
    },
    wrapperTransp: {
        flex: 1,
        flexDirection: "column",
    },
    blockS2uAuth: {
        flexDirection: "column",
        flex: 1,
        marginLeft: 36,
        marginRight: 36,
    },
    containerBlack: {
        flex: 1,
        width: "100%",
    },
});
