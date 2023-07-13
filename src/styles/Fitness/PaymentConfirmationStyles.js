import { StyleSheet } from 'react-native';
import { Dimensions, Image } from 'react-native';
export const { width, height } = Dimensions.get('window');
import * as mainStyles from '../main';



export default StyleSheet.create({
    mainView:{
        backgroundColor :mainStyles.greyBackgroundColor,
        width:width
    },
    partnerView:{
        marginTop:28*height/667,
        width:305*width/375,
        height:50*height/667,
        marginLeft : 35*width/375,
        flexDirection:'row'
    },
    partnerImage:{
        height:70*height/667,
        width:70*height/667,
        resizeMode : 'contain',
        marginRight : 15*width/375,
        backgroundColor:'transparent'
    },
    partnerNameView : {
        flexDirection :'column',
    },
    partnerNameText:{
        fontFamily:mainStyles.montserratSemiBold,
        fontSize : 15,
        lineHeight:19*height/667,
        color : 'black',
        textAlign:'left'
    },
    refLabelText:{
        fontFamily:mainStyles.montserratRegular,
        fontSize : 15,
        lineHeight:19*height/667,
        color : 'black',
        textAlign:'left',
        backgroundColor:'green'
    },
    gymmembershipText:{
        fontFamily:mainStyles.montserratSemiBold,
        fontSize : 15,
        lineHeight:19*height/667,
        color : 'black',
        textAlign:'right',
        width:228*width/375,
    },
    optionalText:{
        fontFamily:mainStyles.montserratRegular,
        fontSize : 11,
        lineHeight:17*height/667,
        color : rgb(124,124,125),
        textAlign:'left',
        width:60*width/375,
    },
    notesValueText:{
        width:205*width/375,
        fontFamily:mainStyles.montserratSemiBold,
        fontSize : 15,
        lineHeight:19*height/667,
        color:rgb(74,144,226),
        textAlign:'right',
    },
    partnerNumText:{
        marginTop:4*height/667,
        fontFamily:mainStyles.montserratRegular,
        fontSize : 15,
        lineHeight:19*height/667,
        color : 'black',
        textAlign:'left'
    },
    firstmonthtext:{
        fontFamily:mainStyles.montserratSemiBold,
        fontSize : 15,
        lineHeight:19*height/667,
        color : rgb(74,144,226),
        textAlign:'right',
        width:196*width/375,
    },

    amountText:{
        marginTop : 40*height/667,
        marginBottom : 40*height/667,
        color:rgb(74,144,226),
        fontFamily:mainStyles.montserratBold,
        fontSize:23,
        lineHeight:31*height/667,
        textAlign:'center',
        
    },
    referenceView:{
        marginLeft:35*width/375,
        height:20*height/667,
        width:305*width/375,
        marginBottom : 20*height/667,
        flexDirection:'row'
    },
    autoDebitView:{
        marginLeft:35*width/375,
        height:41*height/667,
        width:305*width/375,
        marginBottom : 70*height/667,
        backgroundColor:'red',

    },
    alerBillView:{
        marginTop:10*height/667,
        marginLeft:35*width/375,
        height:20*height/667,
        width:305*width/375,
        marginBottom : 22*height/667,
        justifyContent : 'center',
        flexDirection:'row'
    },
    toggleView:{
        width:167*width/375,
        height:'100%',
        alignItems : 'flex-end'
    },
    toggleView1:{
        width:147*width/375,
        height:'100%',
        alignItems : 'flex-end'
    },
    dateText:{
        marginLeft:35*width/375,
        lineHeight:17*height/667,
        marginTop:-18*height/667,
        fontFamily:mainStyles.montserratRegular,
        fontSize:11,
    },
    allAccountsView:{
        height:139*height/667,
        flexDirection:'column',
        marginTop :70*height/667
    },
    payfromText:{
        marginLeft:35*width/375,
        color : 'black',
        fontFamily : mainStyles.montserratSemiBold,
        fontSize:15,
        lineHeight:19*height/667,
        marginBottom:10*height/667
    },
    accountscrollView:{
        height : 110*height/667,
    },
    payView:{
        marginTop:18*width/375,
        marginLeft:35*width/375,
        width:305*width/375,
        height:45*height/667,
        backgroundColor :  rgb (248,210,28),
        borderRadius : 22.5*width/375,
        justifyContent:'center',
        alignItems:'center',
        marginBottom:29*width/375
    },
    paytext:{
        color : 'black',
        fontFamily : mainStyles.montserratSemiBold,
        fontSize:15,
        lineHeight:19*height/667,
        textAlign:'center'
    },
    infoImage:{
        height:20*height/667,
        width:20*height/667,
        resizeMode:'contain'
    }








})