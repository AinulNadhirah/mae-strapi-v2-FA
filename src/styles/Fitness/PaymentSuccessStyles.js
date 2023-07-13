import { StyleSheet } from 'react-native';
import { Dimensions, Image } from 'react-native';
export const { width, height } = Dimensions.get('window');
import * as mainStyles from '../main';




export default StyleSheet.create({

    mainView :{
        height:height,
        width:width,
        backgroundColor : mainStyles.greyBackgroundColor
    },
    tickImage :{
        marginTop : 155*height/667,
        width:53*height/667,
        height:53*height/667,
        marginLeft: 35*width/375,
        resizeMode : 'contain'
    },
    paymentSuccessText:{
        marginTop:29*height/667,
        width:251*width/375,
        lineHeight : 30*height/667,
        fontSize :20,
        fontFamily : mainStyles.montserratLight,
        color :'black',
        textAlign : 'left',
        marginLeft:35*width/375
    },
    refText:{
        marginTop:25*height/667,
        width:251*width/375,
        lineHeight : 17*height/667,
        fontSize :13,
        fontFamily : mainStyles.montserratRegular,
        color :rgb(124,124,125),
        textAlign : 'left',
        marginLeft:35*width/375,
        marginBottom : 131*height/667
    },
    tabView:{
        marginLeft:35*width/375,
        width:305*width/375,
        height:45*height/667,
        backgroundColor :  rgb (248,210,28),
        borderRadius : 22.5*width/375,
        justifyContent:'center',
        alignItems:'center',
        marginBottom:11*width/375,
    },
    tabText:{
        color : 'black',
        fontFamily : mainStyles.montserratSemiBold,
        fontSize:15,
        lineHeight:19*height/667,
        textAlign:'center'
    },
    categoryView:{
        backgroundColor:'white',
        elevation:2,
        flexDirection:'row',
        // justifyContent:'center',
        alignItems:'center'
    }    ,
    addImage:{
        height:35*height/667,
        width:35*height/667,
        resizeMode:'contain',
        // backgroundColor:'red'
    },
    categoryText:{
        marginLeft:25*width/375,
        width:230*width/375,
        // backgroundColor:'green'
    }



})