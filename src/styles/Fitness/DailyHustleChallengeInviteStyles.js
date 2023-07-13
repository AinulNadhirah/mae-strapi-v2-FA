import { StyleSheet } from 'react-native';
import { Dimensions, Image } from 'react-native';
export const { width, height } = Dimensions.get('window');

const screenWidth = Dimensions.get("window").width;
const screenHight = Dimensions.get("window").height;


export default StyleSheet.create({
    mayaBackground1: {
        backgroundColor: "#c0e4f2",
        flex: 1
    },
    crossIconImageView: {
        right: width * 24 / 375
    },
    DailyHustleView: {
        left: width * 50 / 375,
        height: height * 23 / 667,
    },
    DailyHustle: {
        fontFamily: "Montserrat-SemiBold",
        fontSize: 17,
        // fontWeight: "600",
        lineHeight: 23,
        letterSpacing: 0,
        color: "#000000"
    },
    StepUpView: {
        left: width * 51 / 375,
        // height: height * 132 / 667,
        width: width * 275 / 375
    },
    StepUp: {
        fontFamily: "Montserrat-Light",
        fontSize: 23,
        lineHeight: 33,
        letterSpacing: 0,
        color: "#000000"
    },
    HowDoesItWorkView: {
        left: width * 50 / 375,
        top: height * 10 / 667,
        height: height * 23 / 667,
        opacity: 0.6
    },
    HowDoesItWork: {
        fontFamily: "Montserrat-SemiBold",
        fontSize: 15,
        // fontWeight: "600",
        lineHeight: 23,
        letterSpacing: 0,
        color: "#000000",
        textDecorationLine: 'underline'
    },
    contactsView: {
        marginLeft: width * 45 / 375,
        marginTop: height * 30 / 667,
        width: width * 285 / 375,
        height: height * 341 / 667,
    },
    tickImageView: {
        position: 'absolute',
        bottom: height * 20 / 667,
        width: width * 60 / 375,
        height: width * 60 / 375,
        marginLeft: width * 300/375,
    },
    tickImage: {
        resizeMode: 'contain',
        width: width * 65 / 375,
        height: height * 65 / 667
    },
    callCards: {
        marginLeft: width * 45 / 375,
        height: height * 200 / 375,
        // backgroundColor: "red"
    },
    spaceBetweenCards: {
        height: height * 9 / 667
    },
    pokemonModal: {
        position: 'absolute',
        height: height * 590 / 667,
        width: width * 315 / 375,
        borderRadius: width * 11 / 375
    },
    crossIconImageView: {
        left: width * 260 / 375,
        right: width * 24 / 375,
        top: height * 10 / 667
    },
    crossImage: {
        resizeMode: 'contain',
        width: width * 45 / 375,
        height: height * 45 / 667
    },
    commonViewOne: {
        left: width * 1 / 375,
        top: height * -5 / 667
    },
    TittleViewOne: {
        left: width * 30 / 375,
        height: height * 23 / 667,
        top: height * -15 / 667,
        width: width * 200 / 375,
    },
    brandedTitle:{
        left: width * 30 / 375,
        height: height * 23 / 667,
        top: height * -15 / 667,
        width: width * 230 / 375,
        marginBottom:10*height/667
    },

    TittleViewTwo: {
        left: width * 30 / 375,
        height: height * 23 / 667,
        top: height * -3 / 667,
        width: width * 150 / 375

    },
    Tittle: {
        fontFamily: "Montserrat-SemiBold",
        fontSize: 17,
        // fontWeight: "600",
        lineHeight: 23,
        letterSpacing: 0,
        color: "#000000",
    },
    commonTittleView: {
        left: width * 30 / 375,
        width: width * 251 / 375
    },
    commonTittle: {
        fontFamily: "Montserrat-SemiBold",
        fontSize: 14,
        // fontWeight: "600",
        lineHeight: 23,
        letterSpacing: 0,
        color: "#000000"
    },
    commonTittleBody: {
        fontFamily: "Montserrat-Light",
        fontSize: 14,
        // fontWeight: "300",
        lineHeight: 23,
        letterSpacing: 0,
        color: "#000000"
    },
    gapViewOne: {
        left: width * 30 / 375,
        height: height * 18 / 667
    },
    gapViewTwo: {
        left: width * 30 / 375,
        height: height * 8 / 667
    }
}
)