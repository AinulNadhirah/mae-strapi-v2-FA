import { StyleSheet } from 'react-native';
import { Dimensions, Image } from 'react-native';
export const { width, height } = Dimensions.get('window');

export default StyleSheet.create({

    mainView:{
        height:606*height/667,
        width:width,
        flex:1,
        backgroundColor:'white'
    },
    challengeTitleView:{
        left:50*height/667,
        marginTop:14*height/667,
        height:height*23/667,
        marginBottom:10*height/667
    },
    challengeTitleText:{
        fontFamily:'Montserrat-SemiBold',
        // fontWeight:'600',
        fontSize:17,
        color:'black'
    },
    challengeBodyView:{
        left:50*height/667,
        width:275*width/375,
        // height:132*height/667,
        // backgroundColor:'green'
    },
    challengeBodyText:{
        fontFamily:'Montserrat-Light',
        fontSize:21,
        color:'black',
        // fontWeight:'300',
        lineHeight:33,
    },
    TnCView:{
        marginTop:10*height/667,
        width:235*width/375,
        left:50*height/667,
        height:16*height/667,
        flexDirection:'row'
    },
    TnCTextU:{
        fontSize:9,
        fontFamily:'Montserrat-Regular',
        // fontWeight:'400',
        textDecorationLine: 'underline',
        color: rgb(74, 144, 226)
    },
    TnCText:{
        fontSize:9,
        fontFamily:'Montserrat-Regular',
        // fontWeight:'400',
        // marginBottom:16*height/667,
        color:'black',
    },
    challengeImageView:{
        left:50*height/667,
        width:275*width/375,
        height:height*186/667,
        alignItems:'center',
        justifyContent:'center',
        // marginBottom:5*height/667,
        // backgroundColor:'yellow'
    },
    challengeImage:{
        width:126*width/375,
        height:height*186/667,
        resizeMode:'contain'
    },

    challengeMarkerView:{
        // left:50*height/667,
        height:height*60/667,
    },
    challengeOfferView:{
        width:275*width/375,
        marginTop:7,
        flexDirection:'row',
        left:50*width/375,
        alignItems:'center',
        justifyContent:'center',
    },
    others:{
        width:45*width/375,
        height:height*60/667,
        flexDirection:'row',
        alignItems:'center',
    },
    equalView:{        
        marginTop:20,
        marginLeft:10*width/375,
        width:8*width/375,
        height:45*height/667,
        // backgroundColor:'green',
        alignItems:'center',
        justifyContent:'center'
    },    
    equalText:{
        fontFamily:'Montserrat-Light',
        fontSize:18,
        // fontWeight:'300',
        color:'black'
    },
    offerView:{
        marginTop:12*height/667,
        marginLeft:15*width/375,
        width:43*width/375,
        height:46*height/667,
        justifyContent:'center'
    },
    offerText:{
        fontFamily:'Montserrat-SemiBold',
        fontSize:17,
        // fontWeight:'600',
        color:'black'
    },
    confirmView:{
        backgroundColor:rgb(207,238,248),
        marginBottom:100*height/667,
        width:width,        
    },
    confirmQuesView:{
        width:width*275/375,
        height:66*height/667,
        left:50*width/375,
        marginTop:40*height/667
    },
    confirmQues:{
        fontSize:23,
        fontFamily:'Montserrat-Light',
        lineHeight:33,
        // fontWeight:'300',
        color:'black'
    },
    responseView:{
        backgroundColor:rgb(207,238,248),
        marginTop:25*height/667,
        left:50*height/667,
        // height:50*height/667,
        flexDirection:'row',
        },
    resImageView:{
        width:50*height/667,
        height:50*height/667,
        marginLeft:0,
        // backgroundColor:'red',
        alignItems:'center',
        justifyContent:'center'
    },
    responseImage:{
        width:70*height/667,
        height:70*height/667,
        resizeMode:'contain',
    },
    confirmTextView:{
        marginLeft:13*width/375,
        justifyContent:'center',
        alignItems:'center'
    },
    confirmText:{
        fontFamily:'Montserrat-SemiBold',
        fontSize:17,
        // fontWeight:'600',
        lineHeight:23,
        color:'black'

    }


})