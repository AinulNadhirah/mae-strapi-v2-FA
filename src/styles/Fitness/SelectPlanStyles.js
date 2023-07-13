import { StyleSheet } from 'react-native';
import { Dimensions,  } from 'react-native';
export const { width, height } = Dimensions.get('window');
import main, * as mainStyles from '../main';


export default StyleSheet.create({

    mainView : {
        backgroundColor:mainStyles.blueBackgroundColor,
        width:width
    },
    membershiptype:{
        marginTop:28*height/667,
        marginLeft: 35*width/375,
    },
    membershipTypeText : {
        fontFamily : mainStyles.montserratSemiBold,
        fontSize : 17,
        lineHeight : 19*height/667,
        color : 'black'
    },

    membershipDesc:{
        height: height*60/667,
        width:305*width/375,
        marginLeft:35*width/375,
        marginTop:2*height/667
    },
    selectplantext :{
        fontFamily : mainStyles.montserratLight,
        fontSize : 20,
        lineHeight : 30*height/667,
        color : 'black'
    },

    planListView:{
        height: height*185/667,
        marginTop:50*height/667
    },
    spaceBeforeCards :{
        width:35*width/375,
    },
    membershipCard : {
        width:138*width/375,
        borderRadius:11*width/375,
        height:height*185/667,
        marginRight:10*width/375,
        elevation:2,
        backgroundColor:'gray'
    },
    membershipImage:{
        width:138*width/375,
        height:height*185/667,
        borderRadius:11*width/375,
    },

    spaceAfterCards : {
        width:25*width/375,
    },
    tickView:{
        marginTop : 10*height/667,
        marginLeft : 103*width/375,
        height:25*height/667,
        width:25*height/667,
        borderRadius:12.5*height/667,
        backgroundColor:rgb(126,126,126)
    },
    planNameView:{
        marginLeft:20*width/375,
        width:98*width/375,
        marginTop:56*height/667,
        height:38*height/667
    },
    planNametext:{
        fontFamily: mainStyles.montserratSemiBold,
        color : 'white',
        fontSize:15,
        lineHeight:17*height/667
    },
    amountView:{
        marginLeft:20*width/375,
        marginTop:10*height/667,
        height:23*height/667,
        width:98*width/375,
    },
    amountText:{
        fontFamily: mainStyles.montserratSemiBold,
        color : 'white',
        fontSize:17,
        lineHeight:23*height/667
    },
    tickImage:{
        height:25*height/667,
        width:25*height/667,
    },
    tncView:{
        marginTop:50*height/667,
        marginLeft:35*width/375,
        width:305*width/375,
    },
    tncTitle : {
        fontFamily: mainStyles.montserratSemiBold,
        color : 'black',
        fontSize:15,
        lineHeight:23*height/667,
        marginBottom:10*height/667
    },
    tncTextView  :{
        // height:170*height/667,
        // backgroundColor:'red',
        width:305*width/375
    },
    AddOnView:{
        marginTop : 40*height/667,
        marginLeft:35*width/375,
        width:305*width/375,
        marginBottom : 20*height/667
    },
    Addontext:{
        fontFamily: mainStyles.montserratSemiBold,
        color : 'black',
        fontSize:15,
        lineHeight:23*height/667
    },
    addonlistview:{
        height:110*height/667,
        marginBottom:98*height/667
    },
    addOnCard:{
        backgroundColor:'white',
        marginRight:10*width/375,
        height:110*height/667,
        width:305*width/375,
        elevation:2,
        borderRadius:11*width/375,
    },
    addOntickView:{
        marginTop : 10*height/667,
        marginLeft : 270*width/375,
        height:25*height/667,
        width:25*height/667,
        borderRadius:12.5*height/667,
        backgroundColor:rgb(237,237,237),
        borderColor : rgb(181,181,181),
        borderWidth: 1,
        alignItems :'center',
        justifyContent : 'center'
    },
    AddOnImage:{
        height:55*height/667,
        width:55*height/667,
        resizeMode: 'stretch',
        borderRadius:9.3*height/667,
    },
    addonimageview:{
        position:'absolute',
        marginLeft:15*width/375,
        marginTop:27*height/667,
        height:55*height/667,
        width:55*height/667,
        resizeMode: 'contain',
        elevation:1,
        // borderRadius:9.3*height/667,
    },
    addOnNameText:{
        position:'absolute',
        marginTop:15*height/667,
        marginLeft:85*width/375,
        fontFamily:mainStyles.montserratSemiBold,
        fontSize:15,
        lineHeight:19*height/667,
        color:'black',
        width:175*width/375,
        height:19*height/667,
    },  
    addOndescText:{
        position:'absolute',
        marginTop:36*height/667,
        marginLeft:85*width/375,
        fontFamily:mainStyles.montserratRegular,
        fontSize:13,
        lineHeight:17*height/667,
        color:'black',
        width:205*width/375,
        height:34*height/667,
    },
    addOnAmountText:{
        position:'absolute',
        marginTop:72*height/667,
        marginLeft:85*width/375,
        fontFamily:mainStyles.montserratSemiBold,
        fontSize:17,
        lineHeight:23*height/667,
        color:'black',
        width:175*width/375,
        height:23*height/667,
    },
    totalAmountView :{
        backgroundColor:'white',
        width:width,
        height:85*height/667,
    },
    totalText:{
        position:'absolute',
        marginLeft:35*width/375,
        marginTop:15*height/667,
        color:'black',
        fontFamily:mainStyles.montserratRegular,
        fontSize:11,
        lineHeight:17*height/667

    },
    forwardimage:{
        // marginLeft:295*width/375,
        position:'absolute',
        width:65*height/667,
        height:65*height/667,
        resizeMode:'stretch',
        // marginTop:12*height/667
    },
    forwardView:{
        marginLeft:295*width/375,
        position:'absolute',
        width:65*height/667,
        height:65*height/667,
        marginTop:12*height/667,
        backgroundColor:'transparent'
    },
    totalamtText:{
        marginLeft:35*width/375,
        height:31*height/667,
        marginTop:35*height/667,
        fontFamily:mainStyles.montserratRegular,
        fontSize:17,
        lineHeight:31*height/667,
        color:'black',
        width:260*width/375,
    },
    highlightText:{
        fontFamily:mainStyles.montserratBold,
        fontSize:23,
        lineHeight:31*height/667,
        color:'black',
    },
    tncItemView:{
        flexDirection:'row',
        width:305*width/375,
        // alignItems:'center',
        marginBottom:16*height/667,
    },
    bulletImage:{
        marginTop:2*height/667,
        height:10*height/667,
        width:10*height/375,
        resizeMode:'contain'
    },
    tncText:{
        color:'black',
        fontFamily:mainStyles.montserratRegular,
        fontSize:13,
        lineHeight:17*height/667,
        textAlign : 'left',
        marginLeft:10*width/375,
        width:280*width/375,
    }



    


    

});