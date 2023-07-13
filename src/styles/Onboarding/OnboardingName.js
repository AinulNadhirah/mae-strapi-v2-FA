import { StyleSheet } from 'react-native';
import { Dimensions } from 'react-native';

const screenWidth = Dimensions.get("window").width;
const screenHight = Dimensions.get("window").height;


export default StyleSheet.create({
    meetyouLabel: {
        color: "black",
        fontSize: 30,
        fontWeight: "bold",
        marginTop: 150,
        marginLeft: 40,
    },
    helloLabel: {
        color: "black",
        marginTop: "6.5%",
        marginLeft: "14%",
        marginRight:'14%',
        width: 208,
        fontSize: 17,
        fontWeight: "600",
        fontStyle: "normal",
        lineHeight: 23,
        letterSpacing: 0,
        fontFamily: "Montserrat",
    },
    nameLabel: {
        fontSize: 23,
        marginTop: "1.5%",
        marginLeft: "14%",
        marginRight:'14%',
        fontWeight: "300",
        fontStyle: "normal",
        lineHeight: 33,
        letterSpacing: -0.4,
        color: "#000000"
    },
    textInput: {
        fontSize: 30,
        fontWeight: "normal",
        marginTop: 10,
        marginLeft: 40,
        color: "black",
    },
    secDecLabel: {
        marginTop: "2%",
        marginLeft: "14%",
        marginRight:'14%',
        marginLeft:55,
        marginRight:55,
        fontFamily: "montserrat",
        fontSize: 11,
        fontWeight: "300",

        fontStyle: "normal",
        lineHeight: 16,
        letterSpacing: 0,
        color: "#000000"
    },
    otpPinView: {
        marginTop: 14,
        marginLeft: 55,
       // backgroundColor: 'red',
        height: 80,
        width: "100%",
        justifyContent: 'flex-start'
    },

    phoneView: {
        flexDirection: 'row',
        height: 50,
        width: "100%",
        marginTop: "5%",
        marginLeft: "14%",
        alignItems: 'center'
    },
    phoneLabel: {
        fontFamily: "montserrat",
        fontSize: 23,
        fontWeight: "300",
        fontStyle: "normal",
        lineHeight: 33,
        letterSpacing: -0.43,
        color: "gray"
    },

    phoneLabelBlack: {
        fontFamily: "montserrat",
        fontSize: 23,
        fontWeight: "300",
        fontStyle: "normal",
        lineHeight: 33,
        letterSpacing: -0.43,
        color: "#000"
    },
    phoneNumberInput1: {
        fontFamily: "montserrat",
        fontSize: 23,
        fontWeight: "300",
        fontStyle: "normal",
        lineHeight: 33,
        letterSpacing: -0.43,
        marginTop: "0%",
       // height: 50,
        marginLeft: 0,
        width: "100%",
        //backgroundColor:'red'

    },

});