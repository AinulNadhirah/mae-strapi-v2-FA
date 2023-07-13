import { StyleSheet } from 'react-native';
import { Dimensions, Image } from 'react-native';
export const { width, height } = Dimensions.get('window');

export default StyleSheet.create({

    imageBackgroundView: {
        height: height * 595 / 667,
        width: width,
        backgroundColor: 'transparent',
    },
    imageBackground: {
        resizeMode: 'stretch',
        height: '100%',
        width: '100%',
        // opacity:0.4
    },
    profileStackView: {
        marginTop: height * 29 / 667,
        height: height * 44 / 667,
        marginLeft: width * 50 / 375,
        width: '100%',
        backgroundColor: 'transparent'
    },

    challengeTitleView: {
        marginTop: height * 19 / 667,
        height: height * 23 / 667,
        marginLeft: width * 50 / 375,
    },
    challengeTitleText: {
        fontFamily: 'Montserrat-SemiBold',
        // fontWeight:'600',
        fontSize: 19,
        lineHeight: 23,
        color: '#FFFFFF'
    },
    challengeTextView: {
        marginTop: 2,
        width: width * 295 / 375,
        // height:height*67/667,
        marginLeft: width * 50 / 375,
    },
    challengeText: {
        fontFamily: 'Montserrat-Light',
        // fontWeight: '300',
        fontSize: 23,
        lineHeight: 33,
        color: '#FFFFFF',
    },
    challengeRemainView: {
        // position: 'absolute',
        // bottom: height * 230 / 667,
        marginTop: height * 30 / 667,
        marginLeft: width * 50 / 375,
        height: height * 22 / 667,
    },
    challengeRemainText: {
        fontFamily: 'Montserrat-Regular',
        // fontWeight: '400',
        fontSize: 13,
        lineHeight: 21,
        color: '#FFFFFF',
    },
    bottomAlignedView:{
        position:'absolute',
        bottom:height*50/667,
    },
    challengeAcceptView: {
        //position: 'absolute',
        left: width * 37 / 375,
        top: height * 45 / 667,
        //backgroundColor: "black",
        width: width * 240 / 375,
        height: height * 50 / 667
    },
    shoeImageView: {
        left: width * -2 / 375,
        right: width * 275 / 375,
        top: height * -10 / 667,
        width: width * 80 / 375,
        height: height * 80 / 667
    },
    shoeImage: {
        resizeMode: 'contain',
        width: width * 80 / 375,
        height: height * 80 / 667
    },
    acceptView:{
        marginTop:height*20/667,
        height:height*54/667,
        marginLeft:width*50/375,
        flexDirection:'row',
        // justifyContent:'center',
        alignItems:'center',
        // backgroundColor:'red'
    },
    acceptImageView:{
        marginTop:height*7/667,
        height:width*54/375,
        width:width*54/375,
        borderRadius:27,
        backgroundColor:'transparent',
        alignItems:'center',
        justifyContent:'center',
    },
    declineImageView:{
        height:width*54/375,
        width:width*54/375,
        borderRadius:27,
        backgroundColor:'transparent',
        alignItems:'center',
        justifyContent:'center',
    },
    acceptImage:{
        resizeMode:'contain',
        width:width*80/375,
        height:width*80/375,
    },
    acceptTextView:{
        marginLeft:width*10/375,
        justifyContent:'center',
        // alignItems:'center',
        // backgroundColor:'white',
        height:height*54/667
    },
    declineView:{
        marginTop:height*10/667,
        height:height*54/667,
        marginLeft:width*50/375,
        flexDirection:'row',
        // justifyContent:'center',
        alignItems:'center',
        // backgroundColor:'blue'
    },
    acceptText: {
        fontFamily: 'Montserrat-SemiBold',
        // fontWeight: '600',
        fontSize: 17,
        lineHeight: 23,
        color: '#FFFFFF',
    },
    howWorkView: {
        // position: 'absolute',
        // bottom: height * 56 / 667,
        marginTop: height * 20 / 667,
        marginLeft: width * 50 / 375,
        height: height * 23 / 667,
    },
    howWork: {
        fontFamily: 'Montserrat-Regular',
        // fontWeight: '400',
        fontSize: 15,
        lineHeight: 23,
        color: '#FFFFFF',
        textDecorationLine: 'underline'
    },
    declinedChallengeView: {
        marginTop: 2,
        width: width * 300 / 375,
        // height:height*67/667,
        marginLeft: width * 50 / 375,
    },
    declinedChallenge: {
        fontFamily: 'Montserrat-Light',
        // fontWeight: '300',
        fontSize: 23,
        lineHeight: 33,
        color: '#FFFFFF',
    }
});