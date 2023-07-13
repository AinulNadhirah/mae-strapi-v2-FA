import { StyleSheet } from 'react-native';
import { Dimensions, Image } from 'react-native';
export const { width, height } = Dimensions.get('window');

export default StyleSheet.create({
    imageBackgroundView:{
        // height:height*595/667,
        height:height,
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
        height:height*99/667,
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
        marginTop:height*10/667,
        marginLeft:width*50/375,
        height:height*23/667,
    },
    challengeRemainText:{
        fontFamily:'Montserrat-Regular',
        // fontWeight:'400',
        fontSize:13,
        lineHeight:21,
        color:'#FFFFFF',
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
    fitnessCardDPTview:{
        left:width*50/375,
        marginTop:height*20/667,
        marginBottom:height*115/667
    }

});