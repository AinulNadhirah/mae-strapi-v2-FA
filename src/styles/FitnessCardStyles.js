import { StyleSheet } from 'react-native';
import { Dimensions, Image } from 'react-native';
import * as mainStyles from './main';
export const { width, height } = Dimensions.get('window');

export default StyleSheet.create({
    brandCardBackground: {
        width: width * 275 / 375,
        backgroundColor: '#FFFFFF',
        borderRadius: 11,
        paddingTop: height * 18 / 667,

    },
    tickImage:{
        elevation:1,
        position:'absolute',
        left:75*width/375,
        top:80*height/667,
        width:25*width/375,
        height:25*width/375

    },
    challengeNameView: {
        paddingLeft: width * 20 / 375,
        paddingTop: 0,
        paddingBottom: height * 18 / 667,
        // backgroundColor:'red',
        // position: 'absolute',
        // left: width * 20 / 375,
        // top: height * 18 / 667,
        // height: height * 18 / 667,
        //width:width*100/375,
    },
    challengeName: {
        fontFamily: mainStyles.montserratSemiBold,
        // fontFamily: 'montserrat',
        fontSize: 13,
        lineHeight: 18,
        letterSpacing: -0.15,
        // fontWeight: '600',
        color: '#000000',
        fontWeight: "bold" 

    },
    challengeSubtitle: {
        fontFamily: mainStyles.montserratRegular,
        fontSize: 9,
        lineHeight: 16,
        letterSpacing: 0,
        // fontWeight: '400',
    },
    challengeDataView: {
        // position: 'absolute',
        // left: width * 131 / 375,
        //top: height * 58 / 667,
        //width:width,
        flexDirection: 'row',
        //height: height * 50 / 667
    },
    challengeImageView: {
        // position: 'absolute',
        // left: width * 131 / 375,
        //top: height * 66 / 667,
        // height: height * 119 / 375,
        // width:width*131/375,
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        // backgroundColor:'red',
    },
    challengeImage: {
        resizeMode: 'contain',
        height: 60,
        width: 60,
    },
    challengeImageBranded: {
        resizeMode: 'contain',
        height: 130,
        width: 78,
    },
    challengeTextView: {
        flex: 1,
        //flex:-1,
        //position: 'absolute',
        // left: width * 61 / 375,
        //top: height * 66 / 667,
        width: width * 119 / 375,
        //height: height * 119 / 375,
        // height:'auto',
        // display: 'flex',
        // alignItems:'flex-start',
        // justifyContent:'flex-start',
        //alignItems:'center',
        justifyContent: 'center',
        alignSelf: 'stretch',
        // backgroundColor: 'green',
        paddingRight: width * 25 / 375,
        paddingLeft: width * 15 / 375,
        paddingBottom: height * 6 / 667,
    },
    challengeText: {
        fontFamily: mainStyles.montserratRegular,
        fontSize: 13,
        lineHeight: 21,
        letterSpacing: -0.15,
        // fontWeight: '400',
        color: '#000000',
    },
    actionText: {
        fontFamily: mainStyles.montserratBold,
        fontSize: 11,
        lineHeight: 16,
        letterSpacing: 0,
        color: '#4a90e2',
        marginTop: 10,
        // fontWeight: '800',
        // alignSelf:'flex-end'
    },
    actionTextDPT: {
        fontFamily: mainStyles.montserratBold,
        fontSize: 9,
        lineHeight: 16,
        letterSpacing: 0,
        color: '#4a90e2',
        // alignSelf:'flex-end',
        textAlign: 'right',
        // fontWeight: '800',
        fontWeight: "bold"
    },
    subTextView: {
        paddingTop: height * 10 / 667,
        paddingBottom: height * 10 / 667,
        paddingLeft: width * 20 / 375,
    },
    subTextViewDPTMain: {
        paddingTop: height * 10 / 667,
        paddingBottom: height * 10 / 667,
        paddingLeft: width * 20 / 375,
        flexDirection: 'row',
    },
    subTextViewDPTNormal: {
        flex: 3,
        // alignItems:'center',
        //justifyContent:'center',
        paddingTop: height * 0.5 / 667,
    },
    subTextViewDPTAction: {
        flex: 1,
        //position:'absolute',
        // alignItems:'center',
        // justifyContent:'center',
        paddingRight: width * 20 / 375,
        // paddingLeft:width*10/375,
        fontWeight: "bold"

    },
    subTextViewAbsent: {
        paddingTop: height * 8 / 667,
    },
    subTextViewAbsentBranded: {
        paddingTop: height * 5 / 667,
    },
    challengeInfoView: {
        flexDirection: 'row',
        borderBottomEndRadius: 11,
        // height:height*35.5/667
    },
    challengeInfoText: {
        fontFamily: mainStyles.montserratSemiBold,
        fontSize: 12*width/375,
        letterSpacing: -0.15,
        color: '#000000',
        // fontWeight: '600',
        marginLeft: 5
    },
    challengeInfoTextInitial: {
        fontFamily: mainStyles.montserratSemiBold,
        fontSize: 13,
        letterSpacing: -0.15,
        // fontWeight: '600',
        color: 'rgb(143,143,143)',
        marginLeft: 5,
    },
    challengeInfoView1: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        //justifyContent: 'center',
        // backgroundColor:'red',
        paddingBottom: height * 10 / 667,
        paddingTop: height * 10 / 667,
        paddingLeft: width * 20 / 375,
        paddingRight: width * 5 / 375,
        borderBottomLeftRadius: 11,
        borderTopWidth: 1,
        borderRightWidth: 1,
        borderColor: 'rgba(0, 0, 0, 0.1)',
    },
    challengeInfoView2: {
        flex: 1,
        flexDirection: 'row',
        // backgroundColor:'green',
        alignItems: 'center',
        //justifyContent: 'center',
        paddingLeft: width * 10 / 375,
        paddingBottom: height * 10 / 667,
        paddingTop: height * 10 / 667,
        paddingRight: width * 10 / 375,
        borderBottomRightRadius: 11,
        borderTopWidth: 1,
        borderColor: 'rgba(0, 0, 0, 0.1)'
    },
    challengeInfoImage1: {
        resizeMode: 'contain',
        height: height * 18 / 667,
        width: width * 22 / 375
    },
    challengeInfoImage2: {
        resizeMode: 'contain',
        height: height * 18 / 667,
        width: width * 22 / 375,
    },
    stepCount: {
        fontFamily: mainStyles.montserratSemiBold,
        fontSize: 19,
        lineHeight: 28,
        letterSpacing: 0,
        // fontWeight: '600',
        color: 'black'

    },
    stepLabel: {
        fontFamily: mainStyles.montserratRegular,
        fontSize: 9,
        lineHeight: 12,
        letterSpacing: 0.14,
        // fontWeight: '400'
    },
    challengeInviter:{
        position:'absolute',
        top:height*3/667,
        right:width*20/667,
        // backgroundColor:'green',
    },
    challengeInviterText:{
        fontFamily:mainStyles.montserratRegular,
        fontSize:9,
        // fontWeight:'400',
        color:'rgba(0,0,0,0.5)',
    },
    overlappingPictures:{ 
        marginLeft: width*5/375, 
        marginBottom: height*18/667 },
});