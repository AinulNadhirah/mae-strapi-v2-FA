import { StyleSheet } from 'react-native';
import { Dimensions, Image } from 'react-native';
export const { width, height } = Dimensions.get('window');

export default StyleSheet.create({
    imageBackgroundView:{
        height:height*595/667,
        width:width,
        backgroundColor:'transparent',
    },
    imageBackground:{
        resizeMode: 'stretch',
        height:'100%',
        width:'100%',
        // opacity:0.4
    },
    profileStackView:{ 
        marginTop: height*28/667, 
        height: height*44/667, 
        marginLeft: width*50/375, 
        width: '100%', 
        backgroundColor: 'transparent' },
        challengeTitleView:{
        marginTop:height*18/667,
        height:height*23/667,
        marginLeft: width*50/375, 
    },
    challengeTitleText:{
        fontFamily:'Montserrat-SemiBold',
        // fontWeight:'600',
        fontSize:19,
        lineHeight:23,
        color:'#FFFFFF'
    },
    challengeTextView:{
        marginTop:2,
        width:width*300/375,
        // height:height*67/667,
        marginLeft: width*50/375, 
    },
    challengeText:{
        fontFamily:'Montserrat-Light',
        // fontWeight:'300',
        fontSize:23,
        lineHeight:33,
        color:'#FFFFFF',
    },
    challengeRemainView:{
        position:'absolute',
        bottom: height*260/667,
        // marginTop:height*10/667,
        marginLeft:width*50/375,
        height:height*22/667,
    },
    challengeRemainText:{
        fontFamily:'Montserrat-Regular',
        // fontWeight:'400',
        fontSize:13,
        lineHeight:21,
        color:'#FFFFFF',
    },
    leaderBoardView:{
        position: 'absolute',
        // marginTop:height*60/667,
        bottom:height*50/667,
        marginLeft:width*50/375,
        height:height*180/667,
        width:width*275/375,
        backgroundColor:'white',
        borderRadius:width*11/375,
        elevation:2,
    },
    downArrowView:{
        position:'absolute',
        top:height*569/667,
        left:width*60/375,
        height:width*45/375,
        width:width*45/375,
        backgroundColor:'white',
        borderRadius:width*22.5/375,
        elevation:5,
    },
    downArrow:{
        height:'100%',
        width:'100%',
        borderRadius:width*22.5/375,
    },
    leaderboardLabel:{
        top:height*18/667,
        left:width*20/375,
        height:height*19/667,
        fontFamily:'Montserrat-Bold',
        // fontWeight:'800',
        fontSize:13,
        lineHeight:18 ,
        letterSpacing:-0.15,
        color:'#000000',
    },
    leaderboardMargin:{paddingTop:10},
    leaderboardRows:{
        flexDirection:'row',
        marginTop:height*15/667,
        // left:width*19/375,
        width:'100%',
        height:height*26/667,
        // backgroundColor:'red',
        alignItems:'center',

    },
    yellowRankView:{
        marginLeft:width*19/375,
        width:width*26/375,
        height:width*26/375,
        backgroundColor:'#ffde00',
        borderRadius:width*13/375,
        alignItems:'center',
        justifyContent:'center',
    },
    yellowRank:{
        fontFamily:'Montserrat-SemiBold',
        // fontWeight:'600',
        fontSize:13,
        color:'#000000',
    },
    leaderNameView:{
        marginLeft:width*10/375,
        width:width*140/375,
        // justifyContent:'center',
        // alignItems:'center',
        // backgroundColor:'green'
    },
    leaderNameText:{
        fontFamily: 'Montserrat-SemiBold',
        // fontWeight:'600',
        fontSize: 15,
        lineHeight:18,
        color:'#000000',
    },
    leaderNameTextYou:{
        fontFamily: 'Montserrat-SemiBold',
        // fontWeight:'600',
        fontSize: 15,
        lineHeight:18,
        color:'#4a90e2',
    },
    leaderStepsView:{
        // marginRight:width*25/375,
        justifyContent:'center',
        // backgroundColor:'blue',
        width:width*60/375
        // alignItems:'flex-end'
    },
    leaderStepsText:{
        fontFamily: 'Montserrat-Regular',
        // fontWeight:'400',
        fontSize: 15,
        lineHeight:18,
        color:'#000000',
        // position:'absolute',
        textAlign:'right'
    },
    acceptView:{
        position:'absolute',
        bottom:height*260/667,
        // marginTop:height*30/667,
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
    acceptText: {
        fontFamily: 'Montserrat-SemiBold',
        // fontWeight: '600',
        fontSize: 17,
        lineHeight: 23,
        color: '#FFFFFF',
    },
});