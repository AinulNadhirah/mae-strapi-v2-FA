import { StyleSheet } from "react-native";
import { Platform, Dimensions } from "react-native";
export const { width, height } = Dimensions.get('window');
import * as mainStyles from '../main';


export default StyleSheet.create({
    mainView: {
        backgroundColor: mainStyles.blueBackgroundColor,
        height: height,
        width: width,
        flex :1,
        flexDirection:'column'
    },
    partnerImageView: {

    },
    filterRow: {
        height: 45 * height / 667,
        elevation: 1,
        backgroundColor: 'white',
        marginBottom: 10 * height / 667,
        borderRadius: 22.5 * height / 667,
        flexDirection: 'row',
        alignItems: 'center',
    },
    filterTextView: {
        marginLeft: 25 * width / 375,
        height: 19 * height / 667,
        width: 230 * width / 375,
        marginRight: 5 * width / 375,
        justifyContent:'center',
        // backgroundColor:'green'
    },
    downArrowView: {
        width: 15 * width / 375,
        height: 8 * height / 667,
        marginRight:25*width/375,
        // backgroundColor:'red'
    },
    downArrowImage: {
        width: 15 * width / 375,
        height: 8 * height / 667,
        resizeMode: 'contain'
    },
    listtickimage: {
        width: 17 * width / 375,
        height: 10 * height / 667,
        resizeMode: 'contain'
    },
    selectfieldtext:{
        fontFamily: mainStyles.montserratSemiBold,
        color: 'black',
        fontSize: 15,
        lineHeight: 19 * height / 667
    },

    filterTextDefault: {
        fontFamily: mainStyles.montserratSemiBold,
        color: rgb(143, 143, 143),
        fontSize: 15,
        lineHeight: 19 * height / 667
    },
    filterOptionsView:{
        marginTop:118*height/667,
        marginLeft:40*width/375,
        width:295*width/375,
        height:90*height/667,
    },
    tickView:{
        marginTop:50*height/667,
        width:50*height/667,
        height:50*height/667,
        marginLeft:293*width/375,
        marginBottom:32*height/667,
        alignItems:'center',
        justifyContent:'center'
    },
    tickImage:{
        width:70*height/667,
        height:70*height/667,
    },
    partnerImageView:{
        marginLeft:35*width/375,
        height:50*height/667,
        // backgroundColor:'red',
        marginTop:35*height/667,
        width:50*height/667,
        borderRadius:25*height/667,
        alignItems:'center'
    },
    partnerImage :{
        height:70*height/667,
        width:70*height/667,
    },
    appTextView:{
        marginTop:2*height/667,
        marginLeft:35*width/375,
        height:90*height/667
    },
    selectpreferredclubtext:{
        fontFamily:mainStyles.montserratLight,
        fontSize: 20,
        lineHeight:30*height/667,
        color:'black'
    },
    partnerNameView:{
        marginTop:27*height/667,
        marginLeft:35*width/375,
    },
    partnerNametext:{
        fontFamily: mainStyles.montserratSemiBold,
        color:'black',
        fontSize:15,
        lineHeight:19*height/667
    }

});