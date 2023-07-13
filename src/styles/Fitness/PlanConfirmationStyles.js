import { StyleSheet } from 'react-native';
import { Dimensions, } from 'react-native';
export const { width, height } = Dimensions.get('window');
import main, * as mainStyles from '../main';



export default StyleSheet.create({

    completeView: {
        width: width,
    },
    backImg: {
        height: 457 * height / 667,
        width: width,
    },
    bckImgView: {
        backgroundColor: rgb(143, 143, 143),
        height: 457 * height / 667,
        width: width,
    },
    partnerName: {
        marginLeft: 35 * width / 375,
        width: 305 * width / 375,
        height: 19 * height / 667,
        lineHeight: 19 * height / 667,
        color: 'white',
        fontFamily: mainStyles.montserratSemiBold,
        fontSize: 15,
        marginTop: 20 * height / 667
    },
    nameView: {
        height: 19 * height / 667,
        width: 305 * height / 667,
        marginLeft: 35 * width / 375,
        flexDirection: 'row',
        marginTop: 19 * height / 667,
        alignContent: 'space-between'
    },
    dashView: {
        marginTop: 18 * height / 667,
        marginLeft: 35 * width / 375,
        width: 305 * width / 375,
        height: 1 * height / 667,
        backgroundColor: 'white'
    },
    nameLabel: {
        fontFamily: mainStyles.montserratRegular,
        fontSize: 15,
        lineHeight: 19 * height / 667,
        color: 'white',
        textAlign: 'left',
    },
    infoText: {
        fontFamily: mainStyles.montserratSemiBold,
        fontSize: 15,
        lineHeight: 19 * height / 667,
        color: 'white',
        textAlign: 'left'
    },
    infoView: {
        alignItems: 'flex-end',
        width: 250 * width / 375,
        marginLeft: 5 * width / 375
    },
    genderText: {

        height: 11 * height / 667,
        lineHeight: 11 * height / 667,
        textAlign: 'right',
        color: 'white',
        width: 305 * width / 375,
        fontFamily: mainStyles.montserratRegular,
        fontSize: 9,
        alignContent: 'flex-end',
        marginLeft: 35 * width / 375,
        marginRight:35*width/375,
        marginBottom: 9 * height / 667
    },
    icNumberText: {
        marginLeft: 87 * width / 375,
        width: 134 * width / 375,
        height: 19 * height / 667,
        lineHeight: 19 * height / 667,
        fontFamily: mainStyles.montserratSemiBold,
        fontSize: 15,
        color: 'white',
        textAlign: 'right',

    },
    dobValuetext: {
        marginLeft: 100 * width / 375,
        width: 105 * width / 375,
        height: 19 * height / 667,
        lineHeight: 19 * height / 667,
        fontFamily: mainStyles.montserratSemiBold,
        fontSize: 15,
        color: 'white',
        textAlign: 'right',
    },
    addressView: {
        marginLeft: 35 * width / 375,
        height: 80 * height / 667,
        width: 305 * width / 375,
        flexDirection: 'row',
        marginTop: 20 * height / 667
    },
    fullAddressView: {
        height: 80 * height / 667,
        width: 231 * width / 375,
        marginLeft: 10 * width / 375,
        // flexDirection:'co'
    },
    addressLineText: {
        width: 231 * width / 375,
        lineHeight: 20 * height / 667,
        fontFamily: mainStyles.montserratSemiBold,
        fontSize: 15,
        color: 'white',
        textAlign: 'right'
    },
    editdetailsText: {
        fontFamily: mainStyles.montserratSemiBold,
        fontSize: 15,
        lineHeight: 19 * height / 667,
        marginLeft: 35 * height / 667,
        color: rgb(65, 144, 183),
        textAlign: 'left',
        height: 19 * height / 667,
        marginTop: 40 * height / 667
    },
    bottomView: {
        backgroundColor: rgb(248, 245, 243),
        width: width
    },
    widget: {
        marginTop: 40 * height / 667,
        width: 305 * width / 375,
        elevation: 2,
        backgroundColor: 'white',
        marginLeft: 35 * width / 375,
        borderRadius: 11 * height / 667
    },
    gymplantext: {
        width: 130 * width / 375,
        lineHeight: 18 * height / 667,
        fontFamily: mainStyles.montserratSemiBold,
        fontSize: 13,
        marginLeft: 35 * width / 375,
        color: 'black',
        textAlign: 'left',
        marginTop: 18 * height / 667,
    },
    planDetailsView: {
        marginTop: 22 * height / 667,
        marginLeft: 35 * width / 375,
        height: 55 * height / 667,
        width: 245 * width / 375,
        flexDirection:'row'
    },
    dashOneView: {
        marginTop: 28 * height / 667,
        width: 245 * width / 375,
        marginLeft: 35 * width / 375,
        backgroundColor: rgb(204, 204, 204),
        height: 1 * height / 667
    },
    addOnsView: {
        marginTop: 14 * height / 667,
        marginLeft: 35 * width / 375,
        flexDirection: 'row',
        width: 245 * width / 375,
        marginBottom: 10 * height / 667,
    },
    planIMage:{
        height:55*height/667,
        width: 55*height/667,
        borderRadius:9.3*height/667,
        backgroundColor:rgb(26,46,126)
    },

    planNameView:{
        marginLeft:23*width/375,
        height:55*height/667,
        width :162*width/375,
        justifyContent:'center'
    },

    plannametext:{
        fontFamily: mainStyles.montserratSemiBold,
        fontSize: 13,
        lineHeight: 19 * height / 667,
        color: 'black',
        textAlign: 'left',
    },
    planpriceText:{
        fontFamily: mainStyles.montserratRegular,
        fontSize: 13,
        lineHeight: 19 * height / 667,
        color: 'black',
        textAlign: 'left',
    },


    totalView: {
        marginTop: 40 * height / 667,
        width: width,
        backgroundColor: 'white',
        height: 85 * height / 667
    },
    addOnlistView: {
        width: 166 * width / 375,
        marginLeft: 10 * width / 375,
        flexDirection: 'column',
    },
    billLabel: {
        fontFamily: mainStyles.montserratRegular,
        fontSize: 15,
        lineHeight: 19 * height / 667,
        color: 'black',
        textAlign: 'left',
    },
    addOnNametext: {
        fontFamily: mainStyles.montserratSemiBold,
        fontSize: 13,
        lineHeight: 17 * height / 667,
        color: 'black',
        textAlign: 'right',
    },
    addONpriceText: {
        fontFamily: mainStyles.montserratRegular,
        fontSize: 9,
        lineHeight: 11 * height / 667,
        color: 'black',
        textAlign: 'right',
        marginBottom: 5 * height / 667
    },
    valtext: {
        width: 100 * width / 375,
        fontFamily: mainStyles.montserratSemiBold,
        fontSize: 13,
        lineHeight: 17 * height / 667,
        color: 'black',
        textAlign: 'right',
        marginLeft: 10 * width / 375,
    },
    labelWidth: {
        width: 135 * width / 375
    },
    totalText: {
        position: 'absolute',
        marginLeft: 35 * width / 375,
        marginTop: 15 * height / 667,
        color: 'black',
        fontFamily: mainStyles.montserratRegular,
        fontSize: 11,
        lineHeight: 17 * height / 667

    },
    forwardimage: {
        // marginLeft:295*width/375,
        position: 'absolute',
        width: 65 * height / 667,
        height: 65 * height / 667,
        resizeMode: 'stretch',
        // marginTop:12*height/667
    },
    forwardView: {
        marginLeft: 295 * width / 375,
        position: 'absolute',
        width: 65 * height / 667,
        height: 65 * height / 667,
        marginTop: 12 * height / 667,
        backgroundColor: 'transparent'
    },
    totalamtText: {
        marginLeft: 35 * width / 375,
        height: 31 * height / 667,
        marginTop: 35 * height / 667,
        fontFamily: mainStyles.montserratRegular,
        fontSize: 17,
        lineHeight: 31 * height / 667,
        color: 'black',
        width: 260 * width / 375
    },
    highlightText: {
        fontFamily: mainStyles.montserratBold,
        fontSize: 23,
        lineHeight: 31 * height / 667,
        color: 'black',
    },
    editplantext: {
        fontFamily: mainStyles.montserratSemiBold,
        fontSize: 15,
        lineHeight: 19 * height / 667,
        marginLeft: 35 * height / 667,
        color: rgb(65, 144, 183),
        textAlign: 'left',
        height: 19 * height / 667,
        marginTop: 15 * height / 667,
        marginBottom:16*height/667
    }









})


