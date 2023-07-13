import { StyleSheet } from 'react-native';
import { Dimensions, Image } from 'react-native';
export const { width, height } = Dimensions.get('window');
import * as mainStyles from '../main';


export default StyleSheet.create({

    mayaBackground: {
        backgroundColor: 'white'
    },

    imageBackgroundView: {
        height: height * 595 / 667,
        width: width,
        backgroundColor: 'transparent',
    },
    imageBackground: {
        resizeMode: 'contain',
        height: '100%',
        width: '100%',
    },
    profileStackView: {
        marginTop: height * 28 / 667,
        height: height * 44 / 667,
        marginLeft: width * 50 / 375,
        width: '100%',
        backgroundColor: 'transparent'
    },
    challengeTitleView: {
        marginTop: height * 18 / 667,
        height: height * 23 / 667,
        marginLeft: width * 50 / 375,
    },
    challengeTitleText: {
        fontFamily: mainStyles.montserratSemiBold,
        // fontWeight:'600',
        fontSize: 19,
        lineHeight: 23,
        color: '#FFFFFF'
    },
    challengeTextView: {
        marginTop: 2,
        width: width * 275 / 375,
        height: height * 132 / 667,
        marginLeft: width * 50 / 375,
    },
    challengeText: {
        fontFamily: mainStyles.montserratLight,
        // fontWeight:'300',
        fontSize: 23,
        lineHeight: 33,
        color: '#FFFFFF',
        textAlign: 'left'
    },
    leaderBoardView: {
        marginTop: height * 60 / 667,
        bottom: height * 50 / 667,
        marginLeft: width * 50 / 375,
        height: height * 180 / 667,
        width: width * 275 / 375,
        borderRadius: width * 11 / 375,
        elevation: 2,
        backgroundColor: 'white'
    },
    progressLabelView: {
        marginLeft: 20 * width / 375,
        height: 18 * height / 667,
        marginTop: 18 * height / 667,
        marginBottom: 10 * height / 667,
        flexDirection:'row',
        justifyContent:'space-between'
    },
    promoView:{
        alignItems:'flex-end',
        marginRight:20 * width / 375,
        flexDirection:'row',
        height: 18 * height / 667,
        // backgroundColor:'red',
        justifyContent:'center',
        alignItems:'center'

    },
    viewPromoText:{
        fontFamily: mainStyles.montserratSemiBold,
        fontSize: 13,
        lineHeight: 18,
        color:rgb(74, 144, 226),
        textAlign:'right',
        marginRight:20*width/375
        // backgroundColor:'red'
    },
    progressText: {
        fontFamily: mainStyles.montserratSemiBold,
        fontSize: 13,
        lineHeight: 18,
        color: 'black',
        alignItems:'center',
        justifyContent:'center'

    },
    challengeCompletetext: {
        fontFamily: mainStyles.montserratRegular,
        fontSize: 15,
        // fontWeight:'400',
        color: 'black',
        lineHeight: 23
    },

    challengeStatusView: {
        height: 46 * height / 667,
        width: 235 * width / 375,
        marginLeft: 20 * width / 375,
    },
    dayremainText: {
        fontFamily: mainStyles.montserratRegular,
        fontSize: 11,
        // fontWeight:'400',
        color: 'black',
    },
    currentStepsText: {
        fontFamily: mainStyles.montserratRegular,
        fontSize: 15,
        // fontWeight:'400',
        color: 'black',
        lineHeight: 28
    },
    timelineView: {
        marginTop: 10 * height / 667,
        height: 55 * height / 667,
        alignItems: 'center',
        marginBottom: 11 * height / 667,
        backgroundColor: 'transparent'
    },
    downArrowView: {
        position: 'absolute',
        top: height * 569 / 667,
        left: width * 60 / 375,
        height: width * 45 / 375,
        width: width * 45 / 375,
        backgroundColor: 'white',
        borderRadius: width * 22.5 / 375,
        elevation: 5,
    },
    downArrow: {
        height: '100%',
        width: '100%',
        borderRadius: width * 22.5 / 375,
    },
    leaderboardMargin: { paddingTop: 10 },
    aboutChallengeView: {
        // left:50*width/375,
        height: 23 * height / 667,
        width: 275 * width / 375,
        marginTop: 20 * height / 375
    },
    aboutChallengeTitle: {
        fontFamily: mainStyles.montserratSemiBold,
        fontSize: 17,
        lineHeight: 18,
        // fontWeight:'600',
        color: 'black'
    },
    challengeBodyText: {
        fontFamily: mainStyles.montserratRegular,
        fontSize: 15,
        lineHeight: 23,
        // fontWeight:'400',
        color: 'black',
        textAlign: 'justify'
    },
    body: {
        marginTop: 15 * height / 667,
        width: 275 * width / 375,
    },
    detailsView: {
        marginTop: 30 * height / 667,
        marginBottom: 70 * height / 667,
    }

}
);