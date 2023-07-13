import {
    StyleSheet
} from 'react-native';
import {
    Dimensions
} from 'react-native';

const screenWidth = Dimensions.get("window").width;
const screenHight = Dimensions.get("window").height;


export default StyleSheet.create({
    HelloLabel: {
        color: "black",
        fontSize: 30,
        fontWeight: "normal",
        marginTop: screenHight / 2 - 50,
        marginLeft: 40,

    },
    mayaLabel: {
        color: "black",
        fontSize: 30,
        fontWeight: "normal",
        marginTop: 10,
        marginLeft: 40,

    },

    mainViewWrapper: {
        marginTop: 288,
        height: 150,
       // backgroundColor: 'white',

    },
    buttonContainer: {
        marginTop: 288,
        height: 60,
        width: 50,
       // backgroundColor: 'white',

    },
    loginButton: {
       // width: 43,
       opacity: 0.6,
        height: 23,
        fontFamily: "montserrat",
        fontSize: 20,
        fontWeight: "normal",
        fontStyle: "normal",
        lineHeight: 23,
        letterSpacing: 0,
        color: "#000000",
        marginLeft: 60,
        marginTop: '5%',
        textDecorationLine: 'underline'

    },
    splashText: {
        marginLeft: 60,
        fontFamily: "montserrat",
        fontSize: 23,
        fontWeight: "300",
        fontStyle: "normal",
        lineHeight: 33,
        letterSpacing: 0,
        color: "#000000"

    },
    mayaLogoSmallView: {
        marginTop: 189,
        marginLeft: 35,
        width: 100,
        height: 100,
        position: 'absolute'
    },
    mayaLogoSmall: {
        width: 100,
        height: 100,
    },
    onbordingSliderView: {
        width: "100%",
        height: "100%",
        position: 'absolute'
    },
    footerView: {
        // alignItems:"flex-end",
        // justifyContent: 'flex-end',
        width: "100%",
        height: 50,
        marginBottom: 36,
        marginRight: 20
    },

});