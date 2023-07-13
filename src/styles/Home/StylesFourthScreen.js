import { StyleSheet } from 'react-native';
import { Platform, Dimensions } from "react-native";

export const { width, height } = Dimensions.get('window');

export default StyleSheet.create({

  content: {
    flex: 1,
    flexDirection: "column",
    backgroundColor:'rgb(207, 238, 248)'
  },
  wrapper: {
    flex: 1
  },
  flex: {
    flex: 1
  },
  firstSectionBackGround: {
    resizeMode: "stretch",
    height: 850,

  },
  firstSectionBackGround1: {
    resizeMode: "stretch",
    height: 850,
   
  },
  firstSectionBackGround2: {
    resizeMode: "stretch",
    height: 400,
    // backgroundColor: "#fdd835",
    backgroundColor:'red'
  },
  firstSectionBackGroundColor: {
     backgroundColor: "#b0ddf2"
  },
  firstSectionLayout: {
    flex: 1,
    alignSelf: "stretch",
    backgroundColor: "transparent"
  },
  avatarLayout: {
    marginLeft: "7%",
   
  },

  avatarImageLayout: {
    marginLeft: 8,
    marginTop: 120
  },
  textWelcome: {
    marginLeft: "7%",
    marginTop: 10,
    marginBottom: 10
  },
  textDescMargin: {
    marginTop: 0,
    marginLeft: "7%",

  },
  textDescription: {
    marginLeft: "7%",
    marginTop: 0,
    fontSize: 23,
    fontWeight: "300",
    fontStyle: "normal",
    lineHeight: 33,
    letterSpacing: 0,
    fontFamily: "montserrat",
    color: "#000000",
    width: width * 307 / 375,
    height: height * 172 / 667

  },
  textDesc: {
    marginLeft: "7%",
    marginTop: 45,
  },
  textWelcomeBold: {
    marginLeft: "7%",
    marginTop: 5,
    marginBottom: 10,
    color: "#000",
    fontSize: 19,
    fontWeight: "600",
    fontStyle: "normal",
    lineHeight: 23,
    letterSpacing: 0,
    fontFamily: "Montserrat-SemiBold",
    color: "#000000"
  },
  
  mayaFloatingIcon: {
    height:120,
    width:120
  },
  textBlack: {
    color: "#000",
    fontSize: 30,
    left: 25,
    fontWeight: "normal"
  },

  textBlack1: {
    color: "#000",
    fontSize: 17,
    marginLeft: 45,
    fontWeight: "normal"
  },
  textReminderDesc2: {
    color: "#000",
    marginLeft: 50,
    marginTop: 69,
    marginBottom: 0,
    fontSize: 23,
    fontWeight: "bold",
    fontStyle: "normal",
    lineHeight: 33,
    letterSpacing: 0,

  },
  textReminderDesc: {
    marginLeft: "7%",
    marginTop: 10,
    marginBottom: 0
  },
  textReminderDesc5: {
    color: "#000",
    fontSize: 30,
    marginLeft: 50,
    marginTop: 10,
    marginBottom: 0,
    fontWeight: "300",
    fontStyle: "normal",
    lineHeight: 33,
    letterSpacing: -0.4,
  },
  mpIcon: {
    width: 40,
    height: 40,
    marginTop: 40,
    marginStart: 35
  },
  textReminderDesc1: {
    marginLeft: "7%",
    marginTop: 1,
  },
  textReminder: {
    color: "#000",
    fontSize: 22,
    left: 30,
    marginLeft: 25,
  },
  budgetingMainContainer: {
  //  backgroundColor: "#fdd835",
    backgroundColor: "gray",

    flex: 1,
    top: 25,
    alignSelf: "stretch",
    height: 400,
    width: "100%",
    flexGrow: 1,
    flexDirection: "column"
  },
  budgetingContainer: {
    flex: 1,
    flexGrow: 1
  },
  budgetingButton: {
    marginTop: 40,

  },
  text: {
    color: "#fff",
    fontSize: 30
  },
  textB: {
    color: "#000"
  },
  roundButtonStyle: {
    borderRadius: 15,
    borderWidth: 1,
    borderColor: "#fdd835"
  },
  updateView: {
     top: 20,
     marginLeft:40,
     width:300,
    
 },

});