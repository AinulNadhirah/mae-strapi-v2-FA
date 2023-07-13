import { StyleSheet } from "react-native";
import { Platform } from "react-native";

export default StyleSheet.create({
  content: {
    flex: 1,
    flexDirection: "column"
  },
  wrapper: {
    flex: 1
  },
  flex: {
    flex: 1
  },
  firstSectionBackGround: {
    resizeMode: "stretch",
    height: 850
  },
  firstSectionBackGround1: {
    resizeMode: "stretch",
    height: 650,
    backgroundColor: "#b0ddf2"
  },
  firstSectionBackGround2: {
    resizeMode: "stretch",
    height: 400,
    backgroundColor: "#fdd835"
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
    marginLeft: 25,
    marginTop: 25
  },

  avatarImageLayout: {
    marginLeft: 8,
    marginTop: 100
  },
  textWelcome: {
    marginLeft: "7%",
    marginTop: 10,
    marginBottom: 10
  },
  textDescMargin: {
    marginLeft: 25,
    marginLeft: 25,
    marginTop: 0
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
    color: "#000000"
  },
  textDesc: {
    marginLeft: "7%",
    marginTop: 45
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
    fontFamily: "montserrat",
    color: "#000000"
  },

  goalCarouselback1: {
    resizeMode: "stretch",
    height: 90,
    backgroundColor: "#b0ddf2"
  },
  goalCarouselback2: {
    resizeMode: "stretch",
    height: 150,
    backgroundColor: "#fdd835"
  },
  goalCarousel: {
    top: 10,
    height: 160,
    position: "absolute"
  },
  pointsMainContainer: {
    flex: 1,
    alignSelf: "stretch",
    height: 400,
    width: "100%",
    flexGrow: 1,
    flexDirection: "column",
    backgroundColor: "transparent",
    marginTop: Platform.OS === "ios" ? 35 : -40
  },
  pointsContainer: {
    flex: 1
  },
  pointsBox: {
    position: "absolute",
    marginTop: 60,
    flex: 1,
    width: "100%",
    alignSelf: "stretch",
    backgroundColor: "transparent",
    flexGrow: 1
  },
  pointsBox1: {
    flexDirection: "column",
    backgroundColor: "transparent"
  },
  pointsTitleBox: {
    alignSelf: "stretch",
    transform: [{ translate: [0, 0, 1] }],
    backgroundColor: "transparent",
    height: 100,
    flexDirection: "row",
    marginLeft: 50,
    backgroundColor: "transparent"
  },
  pointsTitleBox1: {
    flex: 1.2,
    justifyContent: "flex-start",
    alignContent: "flex-start",
    alignItems: "flex-start"
  },
  pointsTitleBox2: {
    flex: 0.8,
    marginTop: -10,
    justifyContent: "flex-start",
    alignContent: "flex-start",
    alignItems: "flex-start"
  },

  mayaFloatingIcon: {
    height: 120,
    width: 120
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
    fontSize: 25,
    fontWeight: "bold",
    fontStyle: "normal",
    lineHeight: 23,
    letterSpacing: 0
  },
  textReminderDesc: {
    marginLeft: 25,
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
    letterSpacing: -0.4
  },
  mpIcon: {
    width: 40,
    height: 40,
    marginTop: 40,
    marginStart: 35
  },
  textReminderDesc1: {
    marginLeft: 25,
    marginTop: 1
  },
  textReminder: {
    color: "#000",
    fontSize: 22,
    left: 30,
    marginLeft: 25
  },
  budgetingMainContainer: {
   backgroundColor: "#fdd835",

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
    marginTop: 40
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
    marginLeft: 30,
    width: 300
  },
  avatar: {
    width: 65,
    height: 65,
    marginBottom: 20,
    borderRadius: 65 / 2,
    resizeMode: "stretch"
  },
  avatarContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center"
  },
  avatarButton: {
    backgroundColor: "blue",
    marginBottom: 10
  },
  avatarButtonText: {
    color: "white",
    fontSize: 20,
    textAlign: "center"
  }
});
