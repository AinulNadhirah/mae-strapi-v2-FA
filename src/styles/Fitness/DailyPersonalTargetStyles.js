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

    mayaBackground2: {
        backgroundColor: "#FFFFFF",
        flex: 0.63
    },
    dailyPersonalTargetView: {
        position: 'absolute',
        left: width * 50 / 375,
        top: height * 86 / 667,
        height: height * 23 / 667
    },
    dailyPersonalTargetText: {
        fontFamily: "Montserrat-SemiBold",
        // fontWeight: "600",
        fontSize: 17,
        lineHeight: 23,
        letterSpacing: 0,
        color: "#000000"
    },
    bodyView: {
        position: 'absolute',
        left: width * 50 / 375,
        top: height * 111 / 667,
        width: width * 275 / 375,
        height: height * 111 / 667,
        // backgroundColor: 'red'
    },
    bodyText: {
        fontFamily: "Montserrat-Light",
        fontSize: 22,
        lineHeight: 33,
        color: "#000000"
    },
    typefaceView: {
        position: 'absolute',
        left: width * 50 / 375,
        top: height * 440 / 667,
        width: width * 275 / 375,
        height: height * 111 / 667
    },
    typefaceText: {
        fontFamily: "Montserrat-Light",
        fontSize: 22,
        lineHeight: 33,
        color: "#000000"
    },
    ConfirmButton: {
        position: 'absolute',
        flexDirection: 'row',
        left: width * 36 / 375,
        top: height * 522 / 667,
        width: width * 170 / 375,
        height: height * 75 / 667,
        // backgroundColor: 'red'
    },
    ImageView: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingTop: width * 10 / 375,
        // backgroundColor: 'black'
    },
    Image: {
        resizeMode: 'contain',
        width: width * 80 / 375,
        height: width * 80 / 375,
    },
    ConfirmTextView: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    ConfirmText: {
        fontFamily: "Montserrat-SemiBold",
        fontSize: 17,
        lineHeight: 23,
        letterSpacing: 0,
        color: "#000000",
    },
    syncDeviceView: {
        position: 'absolute',
        left: width * 50 / 375,
        top: height * 352 / 667,
        height: height * 18 / 667,
        width: 275 * width / 375,
        alignItems: 'center',
        justifyContent: 'center',
    },
    syncDeviceText: {
        fontFamily: "Montserrat-Regular",
        fontSize: 11,
        lineHeight: 18,
        letterSpacing: 0,
        color: "#8f8f8f"
    },
    thumbImage: {
        backgroundColor: 'white',
        borderStyle: "solid",
        borderWidth: 6.0,
        borderColor: "#4A90E2"
    },
    trackStyle: {
        height: 7 * height / 667,
        borderRadius: 3.5 * height / 667
    },
    slider: {
        position: 'absolute',
        marginLeft: 48 * width / 375,
        marginTop: 282 * height / 667,
        // alignItems: "stretch",
        width: 288 * width / 375,
        // height: 20,
        // backgroundColor:'black',
    },
    sliderIconsView: {
        position: 'absolute',
        marginLeft: 48 * width / 375,
        width: 288 * width / 375,
        marginTop: 315 * height / 667,
        // backgroundColor: "red",
        height: height * 20 / 667,
        flexDirection: "row",
        // alignItems: "baseline"
    },
    sandleIconView: {
        flex: 1,
        paddingTop: 8 * height / 667,
        // justifyContent: 'flex-start',
        // marginTop: "25.2%"
    },
    sandleSliderIcon: {
        width: width * 29 / 375,
        height: height * 12 / 667,
        resizeMode: 'contain',
        // marginTop: "25.2%"
    },
    shoeIconView: {
        flex: 1,
        alignItems: 'flex-end',
    },
    shoeSliderIcon: {
        width: 28 * width / 375,
        height: 20 * height / 667,
        resizeMode: 'contain',
        // marginLeft: "81.86%"
    },
    kitView: {
        position: 'absolute',
        // left: width * 100 / 375,
        top: height * 230 / 667,
        height: height * 31 / 667,
        width: width,
        alignItems: 'center',
        justifyContent: 'center'
    },
    toolButton: {
        flexDirection: "row",
        backgroundColor: "#4A90E2",
        borderRadius: width * 16.5 / 375,
        alignItems: 'center',
        justifyContent: 'center',
        paddingLeft: 28 * width / 375,
        paddingTop: 7.1 * height / 667,
        paddingBottom: 7.9 * height / 667,
        paddingRight: 27 * width / 375
    },
    toolText: {
        fontFamily: "Montserrat-Bold",
        fontSize: 11,
        // fontWeight: "bold",
        fontStyle: "normal",
        lineHeight: 16,
        letterSpacing: 0,
        color: "white",
    },

    toolImage: {
        width: 9 * width / 375,
        height: 9 * width / 375,
        resizeMode: 'contain',
    },

    // Manual Edit styles
    textInputView: {
        position: 'absolute',
        marginTop: 251 * height / 667,
        marginLeft: 50 * width / 375,
        height: 33 * height / 667,
        width: width,
    },
    defaultText: {
        fontFamily: "Montserrat-Regular",
        fontSize: 23,
        lineHeight: 33,
        letterSpacing: -0.43,
        marginTop: 0,
        color: "grey",
    },

    valueEnteredText: {
        fontFamily: "Montserrat-Light",
        fontSize: 23,
        lineHeight: 33,
        letterSpacing: -0.43,
        width: "100%",
        color: "black",
    },
    DetailTextLabel: {
        position: 'absolute',
        fontFamily: "Montserrat-Light",
        fontSize: 23,
        marginTop: 122 * height / 667,
        marginLeft: 50 * width / 375,
        marginRight: 50 * width / 375,
        lineHeight: 33,
        letterSpacing: -0.43,
        color: "#000000",
    },
    TitleLabel: {
        position: 'absolute',
        color: "#000000",
        marginTop: 97 * height / 667,
        marginLeft: 50 * width / 375,
        fontFamily: "Montserrat-SemiBold",
        fontSize: 17,
        lineHeight: 23,
        letterSpacing: -0.43,
    },
    modalMain: {
        height: 630*height/667,
        width: 600*width/375,
        borderTopLeftRadius: 300*width/375,
        borderTopRightRadius: 300*width/375,
        backgroundColor: 'rgb(255,222,0)'
    },
    modalView: {
        marginTop: height*90/667,
        marginLeft: width*165/375,
        height: height*540/667,
    },
    modalTitle: {
        fontFamily: 'Montserrat-SemiBold',
        fontSize: 17,
        // fontWeight: '600',
        lineHeight: 23,
        color: 'black',
        letterSpacing: 0
    },
    modalBody: {
        marginTop: height*2/667,
        width: width*275/375
    },
    modalBodyText: {
        fontFamily:'Montserrat-Regular',
        fontSize: 23,
        lineHeight: 33,
        // fontWeight: '300',
        color: 'black'
    },
    modalBodySubText: {
        fontFamily:'Montserrat-Regular',
        fontSize: 15,
        lineHeight: 23,
        // fontWeight: '300',
        color: 'black'
    },
    modalImageView: {
        position: 'absolute',
        bottom: height*35/667,
        right: width*150/375,
        height: width*55/375,
        width: width*55/375,
        // backgroundColor:'green'
    },
    modalImage:{
        height:width*70/375,
        width:width*70/375,
        resizeMode:"contain"
    },
}
)
