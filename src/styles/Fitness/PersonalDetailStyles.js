import { StyleSheet } from 'react-native';
import { Dimensions, } from 'react-native';
export const { width, height } = Dimensions.get('window');
import main, * as mainStyles from '../main';


export default StyleSheet.create({

    mainView: {
        backgroundColor: mainStyles.blueBackgroundColor,
        height: height,
        flexDirection:'column'
    },
    hpview: {
        flexDirection: 'row',
        alignItems: 'center',
    }
    ,
    subView: {
        marginTop: 28 * height / 667,
        marginLeft: 35 * width / 375,
        width: 305 * width / 375,
    },
    nameLabel: {
        marginLeft: 0,
        width: 305 * width / 375,
        height: 19 * height / 667,
    },
    dobtextview: {
        justifyContent: 'center',
        // marginTop: 9 * height / 667,
    },
    labelText: {
        color: 'black',
        fontSize: 15,
        lineHeight: 19 * height / 667,
        fontFamily: mainStyles.montserratSemiBold,
    },
    nameInputView: {
        height: 30 * height / 667,
        marginTop: 4 * height / 667,
        marginLeft: 0,
    },
    grayText: {
        color: rgb(117, 117, 117),
        fontSize: 20,
        lineHeight: 30 * height / 667,
        fontFamily: mainStyles.montserratLight
    },
    inputPrefixText: {

    },
    inputText: {
        color: rgb(117, 117, 117),
        fontSize: 20,
        lineHeight: 30 * height / 667,
        fontFamily: mainStyles.montserratLight,
        textAlign: "left",
        marginTop: 4 * height / 667,
    },
    splitView: {
        marginTop: 26 * height / 667,
        flexDirection: 'row',
        width:315*width/375,
    },
    midView: {
        width: 183 * width / 375,
        marginLeft: 0,
        justifyContent:'center',
    },
    secondMidView: {
        width: 132 * width / 375,
        marginLeft: 0,
        justifyContent:'center',
    },
    margintopp: {
        marginTop: 26 * height / 667
    },
    optionView: {
        marginTop: 15 * height / 667,
        height: 30 * height / 667,
        flexDirection: 'row',
        alignItems: 'center',
        width: 152 * width / 375

    },
    genderView: {
        marginTop: 15 * height / 667,
        height: 30 * height / 667,
        flexDirection: 'row',
        alignItems: 'center'
    },

    genderLabeltext: {
        color: 'black',
        fontSize: 15,
        lineHeight: 17 * height / 667,
        fontFamily: mainStyles.montserratRegular,
        textAlign: "left",
        marginRight: 65 * width / 375
    },
    tnclabel: {
        color: 'black',
        fontSize: 13,
        lineHeight: 17 * height / 667,
        fontFamily: mainStyles.montserratRegular,
        textAlign: "left",
        marginRight: 65 * width / 375
    },
    outerCircle: {
        height: 20 * height / 667,
        width: 20 * height / 667,
        backgroundColor: 'transparent',
        borderRadius: 10 * height / 667,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1.5,
        borderColor: 'black',
        marginRight: 20 * width / 667
    },

    inputValueText:{
        color: 'black',
        fontSize: 20,
        lineHeight: 30 * height / 667,
        fontFamily: mainStyles.montserratLight,
        textAlign: "left",
        marginTop: 4 * height / 667,
    },

    innerCircle: {
        height: 20 * height / 667,
        width: 20 * height / 667,
        backgroundColor: rgb(248,210,28),
        borderRadius: 10 * height / 667,
        justifyContent: 'center',
        borderWidth:1,
        borderColor:'black'
    },

    stateView: {
        marginTop: 13 * height / 667,
        height: 45 * height / 667,
        borderRadius: 22.5 * height / 667,
        backgroundColor: 'white',
        elevation: 3,
        justifyContent: 'center',
        flexDirection: 'row',
        alignItems: 'center',
        width: 305 * width / 375
    },
    cardrulestext: {
        marginTop: 16 * height / 667,
        marginLeft: 30 * width / 375,
        color: rgb(65, 144, 183),
        fontSize: 15,
        lineHeight: 19 * height / 667,
        fontFamily: mainStyles.montserratSemiBold,
        marginBottom: 30 * height / 667
    },
    tncText: {
        marginTop: 16 * height / 667,
        marginLeft: 30 * width / 375,
        color: rgb(65, 144, 183),
        fontSize: 15,
        lineHeight: 19 * height / 667,
        fontFamily: mainStyles.montserratSemiBold,
    },
    forwardArrowView: {
        height: 75 * height / 667,
        marginBottom: 41 * height / 667,
        marginLeft: 240 * width / 375,
        alignItems: 'center',
        justifyContent: 'center'
    },
    arrowImage: {
        height: 75 * height / 667,
        width: 75 * height / 667,
    },
    downArrowImage: {
        width: 15 * width / 375,
        height: 8 * height / 667,
        resizeMode: 'contain'
    },
    listtickimage: {
        width: 17 * width / 375,
        height: 10 * height / 667,
        resizeMode: 'contain',
    },
    stateText: {
        width: 229 * width / 375,
        lineHeight: 19 * height / 667,
        color: 'black',
        fontFamily: mainStyles.montserratSemiBold,
        fontSize: 15,
        height: 19 * height / 667,
        textAlign: 'left',
        marginRight: 11 * width / 375
    },
    modalstyles: {
        position: 'absolute',
        height: height * 0.6,
        width: width,
        // marginTop: 130 * height / 667
    },
    modalmainview: {
        position: 'absolute',
        height: '100%',
        width: width,
    },
    modaldobview: {
        position: 'absolute',
        height: '100%',
        width: width,
    },
    keypadmodal: {
        // position: 'absolute',
        height: height/3.3,
        width: width,
        backgroundColor:'#ffde00',
        // bottom :0
    },
    hptext:{
        marginLeft:3*width/375,
    }


})