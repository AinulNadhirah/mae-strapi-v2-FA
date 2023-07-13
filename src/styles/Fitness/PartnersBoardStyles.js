import { StyleSheet } from 'react-native';
import { Dimensions, Image } from 'react-native';
export const { width, height } = Dimensions.get('window');
import * as mainStyles from '../main';
import RNImgToBase64 from 'react-native-image-base64';

export default StyleSheet.create({
    main:{
        flex:1,
        backgroundColor:'#FFFFFF',
    },
    imageBackgroundView: {
        height: height,//height * 595 / 667,
        width: width,
        backgroundColor: 'transparent',
    },
    imageBackground: {
        height: '100%',
        width: '100%',
    },
    profileStackView: {
        marginTop: height * 28 / 667,
        height: height * 44 / 667,
        marginLeft: width * 50 / 375,
        width: '100%',
        backgroundColor: 'transparent'
    },
    cardBackground:{
        height:'100%',
        width:'100%'
    },
    challengeTitleView: {
        marginTop: height * 18 / 667,
        height: height * 23 / 667,
        marginLeft: width * 50 / 375,
    },
    challengeTitleText: {
        fontFamily: mainStyles.montserratSemiBold,
        // fontWeight:'600',
        fontSize: 19,
        lineHeight: 23,
        color: '#FFFFFF'
    },
    challengeTextView: {
        marginTop: 2,
        width: width * 275 / 375,
        height: height * 132 / 667,
        marginLeft: width * 50 / 375,
    },
    challengeText: {
        fontFamily: mainStyles.montserratLight,
        // fontWeight:'300',
        fontSize: 23,
        lineHeight: 33,
        color: '#FFFFFF',
        textAlign: 'left'
    },
    cardsView:{
        position:'absolute',
        bottom: 130*height/667,
        height:175*height/667,
        width:width,
        // backgroundColor:'red'
    },
    cardsScrollview:{

    },
    spaceBeforeCard:{
        width:50*width/375,
        // backgroundColor:'blue'
    },
    partnersMemberCard:{
        width:275*width/375,
        height:175*height/667,
        marginRight:10*width/375,
        borderRadius:11*width/375,
        backgroundColor:'gray',
    },
    cardNoView:{
        marginTop:140*height/667,
        height:15*height/667,
        marginLeft : 15*width/375,
        // marginBottom:15*height/667,
    },
    cardNoText:{
        fontFamily: mainStyles.montserratLight,
        // fontWeight:'300',
        fontSize: 15,
        lineHeight: 15,
        color: '#FFFFFF',
        textAlign: 'left'
    },
    planClassView:{
        marginTop:52*height/667,
        height:height*46/667,
        width:302*width/375,
        marginLeft:37*width/375,
        marginBottom:50*height/667
 
    },
    plassClassText:{
        fontFamily: mainStyles.montserratRegular,
        // fontWeight:'300',
        fontSize: 17,
        lineHeight: 23,
        color: 'black',
        textAlign: 'center'
    },
    clubView:{
        marginTop:102*height/667,
        height:45*height/667,
        // width:354*width/375,
        // backgroundColor:'red',
        marginLeft:21*width/375,
        marginRight:21*width/375,
        marginBottom:20*height/667,
        flexDirection:'row',
        // backgroundColor:'yellow'
    },
    selectClubView:{
        // backgroundColor:'red',
        marginLeft:0,
        width:291*width/375,
        marginRight:17*width/375,
        borderRadius:21*height/667,
        borderColor:rgb(243,243,243),
        borderWidth:1*height/667,
        elevation:1,
        flexDirection:'row',
        // justifyContent:'center',
        alignItems:'center'
    },
    filterView:{
        // backgroundColor:'green',
        width:30*width/375,
        alignItems:'center',
        justifyContent:'center'
    },
    classListView:{
        marginLeft:21*width/375,
        backgroundColor:'yellow',
        marginRight:21*width/375, //marginbottom after ever item : 10 pts
        marginBottom:30*height/667,
        height:100*height/667
    },
    dropDownView:{
        // backgroundColor:'red',
        marginRight:27*width/375,
        width:15*width/375,
        height:8*height/667,
        alignItems:'center'

    },
    clubtextview:{
        // backgroundColor:'green',
        marginLeft:27*width/375,
        width:217*width/375,
        marginRight:10*width/375,
        marginLeft:27*width/375
    },
    clubtext:{
        fontFamily: mainStyles.montserratRegular,
        // fontWeight:'300',
        fontSize: 17,
        lineHeight: 23,
        color: 'black',
        textAlign: 'left'
    },
    dropdownImage:{
        resizeMode:'contain',
        width:15*width/375,
        height:8*height/667
    },
    filterImage:{
        resizeMode:'contain',
        width:25*width/375,
        height:16*height/667
    },
    contentTitleView:{
        marginTop:16*height/667,
        marginLeft:20*width/375,
        // backgroundColor:'green',
        height:18*height/667,
        marginRight:20*width/375
    },
    contentShortTextView:{
        height:72*height/667,
        marginLeft:20*width/375,
        marginTop:53*height/667,
        marginBottom:16*height/667,
        // backgroundColor:'red',
        marginRight:20*width/375
    },
    contentTitleText:{
        fontFamily: mainStyles.montserratSemiBold,
        fontSize: 13,
        lineHeight: 18,
        color: 'white',
        textAlign: 'left'
    },
    contentDescText:{
        fontFamily: mainStyles.montserratRegular,
        fontSize: 13,
        lineHeight: 18,
        color: 'white',
        textAlign: 'left'
    },
    addCardView:{
        backgroundColor:'black',
        opacity:0.5,
        width:275*width/375,
        height:175*height/667,
        borderRadius:11*width/375,
        alignItems:'center',
        justifyContent:'center'
    },
    addCardText:{
        fontFamily: mainStyles.montserratRegular,
        fontSize: 15,
        color: 'white',
        textAlign: 'center'
    }

});