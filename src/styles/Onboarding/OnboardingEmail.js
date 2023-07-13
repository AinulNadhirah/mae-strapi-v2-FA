import { StyleSheet, Dimensions } from "react-native";

const screenWidth = Dimensions.get("window").width;
const screenHight = Dimensions.get("window").height;

export default StyleSheet.create({
  EmailLabel: {
    fontFamily: "montserrat",
    fontSize: 16,
    fontWeight: "600",
    fontStyle: "normal",
    lineHeight: 23,
    letterSpacing: 0,
    color: "#000000",
    marginTop: "5%",
    marginLeft: "14%"
  },
  TextLabel: {
    fontSize: 21,
    marginTop: "1%",
    marginLeft: "14%",
    fontFamily: "montserrat",
    fontWeight: "300",
    fontStyle: "normal",
    lineHeight: 33,
    letterSpacing: -0.4,
    color: "#000000"
  },
  emailView: {
    marginTop:-21
  },
  error: {
    width: 500,
    height: 300,
    marginLeft: 0,
    marginTop: -20
  },
  errortext: {
    width: 275,
    height: 46,
    fontFamily: "montserrat",
    fontSize: 17,
    fontWeight: "300",
    fontStyle: "normal",
    lineHeight: 23,
    letterSpacing: -0.3,
    color: "#d0021b" , 
    marginLeft:"10%"
  }
});
