
import { StyleSheet } from 'react-native';
import { Dimensions, Image } from 'react-native';
export const { width, height } = Dimensions.get('window');
import * as mainStyles from '../main';


export default StyleSheet.create({
    mainView:{
        backgroundColor:'white',
        flex:1
    },
    voucherDetailsView:{
        width:width,
        backgroundColor:'white',
        // height:height*819/667
    },
    useVouchertext:{
        fontFamily:mainStyles.montserratSemiBold,
        fontSize:15,
        // fontWeight:'600',
        // marginLeft:15*width/375,
        lineHeight:33,
        color:rgb(0,0,0), 
        textAlign:'left' ,
    },
    imageView:{
        height:185*height/667,
        alignItems:'center',
        marginTop:25*height/667,
        left:50*width/375,
        justifyContent:'center',
        width:275*width/375,
    },
    challengeImage:{
        resizeMode:'contain',
        width:width*126/375,
        height:186*width/667,
    },
    voucherDetailText:{
        fontFamily:mainStyles.montserratSemiBold,
        fontSize:23,
        // fontWeight:'600',
        lineHeight:33,
        color:rgb(0,0,0), 
        textAlign:'center'       
    },
    voucherDetailView:{
        height:66*height/667,
        alignItems:'center',
        marginTop:6*height/667,
        left:50*width/375,
        width:275*width/375,
    },
    voucherCodeView:{
        left:50*width/375,
        marginTop:30*height/667,
        height:45*height/667,
        width:275*width/375,
        elevation:2,
        borderColor:rgb(223,223,223),
        borderRadius:width*21/375,
        borderWidth:1,
        alignItems:'center',
        justifyContent:'center',
        // backgroundColor:'yellow',
        flexDirection:'row',
    },
    voucherCodeText:{
        fontFamily:mainStyles.montserratSemiBold,
        fontSize:15,
        // fontWeight:'600',
        lineHeight:33,
        color:rgb(143,143,143),
        textAlign:'right',
        // marginLeft:45*width/375,
        alignItems:'flex-start',
        marginRight:0
    },
    disclaimerView:{
        left:50*width/375,
        marginTop:10*height/667,
        // height:32*height/667,
        width:275*width/375,
    },
    disclaimerText:{
        fontFamily:mainStyles.montserratRegular,
        fontSize:11,
        // fontWeight:'400',
        lineHeight:16,
        color:rgb(143,143,143),
        textAlign:'center'
    },
    tncLabelView:{
        flexDirection:'row',
        left:50*width/375,
        marginTop:55*height/667,
        height:28*height/667,
        width:275*width/375,
        alignItems:'flex-start'
    },
    tncLabelText:{
        fontFamily:mainStyles.montserratSemiBold,
        fontSize:17,
        // fontWeight:'600',
        lineHeight:23,
        color:'black',
    },
    tncBodyView:{
        left:50*width/375,
        marginTop:15*height/667,
        width:275*width/375,
        marginBottom:59*height/669
    },
    tncBodyText:{
        fontFamily:mainStyles.montserratRegular,
        fontSize:17,
        // fontWeight:'400',
        lineHeight:23,
        color:'black',
        textAlign:'justify'

    }

});