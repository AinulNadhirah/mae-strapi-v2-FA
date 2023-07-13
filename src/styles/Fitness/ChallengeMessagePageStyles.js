import { StyleSheet } from 'react-native';
import { Dimensions, Image } from 'react-native';
export const { width, height } = Dimensions.get('window');

export default StyleSheet.create({
    leaveMessageView:{
        marginTop:height*25/667,
        marginLeft:width*50/375,
        height:height*24/667,
        justifyContent:'center',
    },
    leaveMessageText:{
        fontFamily:'Montserrat-SemiBold',
        // fontWeight:'600',
        fontSize:17,
        lineHeight:23,
        color:'#000000',
        letterSpacing:0,
    },
    leaveMessageBodyView:{
        marginTop:height*2/667,
        marginLeft:width*50/375,
        width:width*275/375,
        height:height*220/667,
        // backgroundColor:'red'
        // justifyContent:'center',
    },
    leaveMessageBodyText:{
        fontFamily:'Montserrat-Light',
        // fontWeight:'300',
        fontSize:23,
        lineHeight:33,
        color:'#000000',
        letterSpacing:0,
    },
    inputStyle:{
        fontFamily:'Montserrat-Light',
        // fontWeight:'300',
        fontSize:23,
        lineHeight:33,
        color:'#000000',
        letterSpacing:0,
    },
    tickImageView:{
        position: 'absolute',
        // right: width * 24 / 375,
        // bottom: height * 40 / 375,
        bottom: height * 20 / 667,
        width: width * 60 / 375,
        height: width * 60 / 375,
        marginLeft: width * 297/375,
        // backgroundColor: 'blue'
    },
    tickImageViewKey:{
        marginTop: height * 210 / 667,
        width: width * 60 / 375,
        height: width * 60 / 375,
        marginLeft: width * 297/375,
        // backgroundColor: 'black'
    },

});