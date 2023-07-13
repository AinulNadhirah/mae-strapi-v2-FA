import { StyleSheet, Dimensions, Platform } from "react-native";
export const { width, height } = Dimensions.get('window');

export default StyleSheet.create({
    crossIconView:{
        position:'absolute',
        top:height*35/667,
        right:width*27/375,
        height:45,
        width:45,
        alignItems:'center',
        justifyContent:'center',
    },
    crossIcon:{
        resizeMode:'contain',
        height:45,
        width:45,
    },
    titleView:{
        position:'absolute',
        top:height*100/667,
        left:width*50/375,
        height:height*50/667,
    },
    titleText:{
        fontFamily:'Montserrat-SemiBold',
        fontSize:19,
        lineHeight:23,
        letterSpacing:0,
        color:'black',
        // fontWeight:'600'
    },
    bodyView:{
        position:'absolute',
        top:height*128/667,
        left:width*50/375,
        height:height*99/667,
        width:width*253/375
    },
    bodyText:{
        fontFamily:'Montserrat-Light',
        fontSize:23,
        lineHeight:33,
        letterSpacing:-0.43,
        color:'black',
        // fontWeight:'300',
    },
    tryAgainView:{
        position:'absolute',
        top:height*257/667,
        left:width*40/375,
        height:height*50/667,
        width:width*300/375,
        flexDirection:'row',
        alignItems:'center',
        // backgroundColor:'blue'
    },
    tryAgainImageView:{
        // position:'absolute',
        // top:height*257/667,
        // left:width*40/375,
        // height:height*50/667,
        paddingTop:height*4/667,
        width:width*50/375
    },
    tryAgainImage:{
        resizeMode:'contain',
        height:60,
        width:60,
    },
    tryAgainLabelView:{
        // position:'absolute',
        // top:height*271/667,
        paddingLeft:width*23/375,
        height:height*23/667,
    },
    tryAgainLabel:{
        fontFamily:'Montserrat-SemiBold',
        fontSize:17,
        lineHeight:23,
        letterSpacing:0,
        color:'black',
        // fontWeight:'600',
    },
    syncLaterView:{
        position:'absolute',
        top:height*322/667,
        left:width*40/375,
        height:height*50/667,
        width:width*300/375,
        flexDirection:'row',
        alignItems:'center',
        // backgroundColor:'green'
    },
    syncLaterImageView:{
        // position:'absolute',
        // top:height*322/667,
        // left:width*40/375,
        // height:height*50/667,
        paddingTop:height*4/667,
        width:width*50/375
    },
    syncLaterLabelView:{
        // position:'absolute',
        // top:height*336/667,
        paddingLeft:width*23/375,
        height:height*23/667,
    },
});