import { StyleSheet } from "react-native";
import { Dimensions } from "react-native";

const screenWidth = Dimensions.get("window").width;
const screenHight = Dimensions.get("window").height;

export default StyleSheet.create({

  dropDownsView:{
    marginTop: 2,
    height: '20%',
    width: "100%",
    backgroundColor: "transparent",
    flexDirection: "row",
    alignItems: "center",

  },
  blurContainer:{
    flex: 1,
    alignItems: "center",
    position: "absolute",
    justifyContent: "center",
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "rgba(0, 0, 0, 0.88)" 
  },
  travelGoalLabel: {
    color: "black",
    fontSize: 25,
    fontWeight: "bold",
    fontFamily: "montserrat",
    marginTop: 120,
    marginLeft: 40
  },
  nameLabel: {
    color: "black",
    fontSize: 30,
    fontWeight: "normal",
    marginTop: 10,
    marginLeft: 40
  },
  textInput: {
    fontSize: 30,
    fontWeight: "normal",
    marginTop: 10,
    marginLeft: 40,
    color: "black"
  },
  placeList: {
    marginTop: "3%",
    height: 60,
    // width: "90%",
    backgroundColor: "#C6E4EE"
  },
  calenderView: {
    marginLeft: 20,
    marginRight: 20,
    marginTop: 45,
    position: "absolute"
  },
  descLabel: {
    color: "black",
    fontSize: 28,
    fontWeight: "normal",
    marginTop: 10,
    marginLeft: 40
  },
  currencyView: {
    flexDirection: "row",
    marginTop: 30
  },
  budgetInput: {
    fontSize: 35,
    fontWeight: "bold",
    color: "#000",
    marginTop: 8,
    marginLeft: 1
  },
  currencyLabel: {
    color: "black",
    fontSize: 35,
    fontWeight: "normal",
    marginTop: 30,
    marginLeft: 40
  },
  placeInputView: {
    height: 100
  },
  placeInput: {
    height: 100
  },
  currencyAndAmtLabel: {
    color: "#538ded",
    fontWeight: "bold",
    fontSize: 30,
    marginTop: 8,
    marginLeft: 40,
    flex: 1.5
  },
  periodDropDownView: {
    flex: 1.2,
    marginRight: 10,
    borderRadius: 45,
    borderWidth: 1,
    borderColor: "#a4a6a8",
    shadowColor: "#a4a6a8",
    shadowOffset: { width: 2, height: 2 },
    shadowOpacity: 0.9,
    shadowRadius: 2
  },
  periodDropDown: {
    flex: 1,
    marginRight: 10,
    marginLeft: 20,
    marginBottom: 10,
    marginTop: 10
  },
  periodDropDownText: {
    fontWeight: "bold",
    fontSize: 24
  },
  amountView: {
    flexDirection: "row",
    marginLeft: 65,
    alignItems: "center",
    marginTop: 15
  },
  amountView1: {
    flexDirection: "row",
    marginLeft: 65,
    alignItems: "center",
    marginTop: 15
  },

  amountView2: {
    flexDirection: "row",
    marginLeft: 65,
    alignItems: "center",
    marginTop: 15,
    height: 65
  },
  amtLabel: {
    color: "black",
    fontSize: 17,
    fontWeight: "bold",
    fontFamily: "montserrat",
    flex: 2
  },
  amtLabel1: {
    color: "black",
    fontSize: 17,
    fontWeight: "bold",
    fontFamily: "montserrat",
    flex: 1.2
  },
  
  amtValueLabel: {
    color: "black",
    fontSize: 20,
    fontWeight: "bold",
    fontFamily: "montserrat",
    flex: 2,
    textAlign: "right",
    marginRight: 10
  },
  targetLabel: {
    color: "black",
    fontSize: 16,
    fontWeight: "bold",
    fontFamily: "montserrat",
    flex: 2,
    marginTop:20,
    marginLeft:62,
    marginBottom:20
  },
  rmZeroLabel: {
    color: "#d6d6d6",
    fontSize: 12,
    marginTop:20,
    marginBottom:-40,
    marginStart:50,
    fontWeight: "bold",
    fontFamily: "montserrat",
    textAlign: "left",
  },

  chartDateLabel1: {
    color: "#000",
    fontSize: 12,
    flex:1,
    fontWeight: "bold",
    fontFamily: "Montserrat",
    textAlign: "left",
  },


  chartDateLabel2: {
    color: "#d6d6d6",
    fontSize: 12,
    flex:1,
    fontWeight: "bold",
    fontFamily: "Montserrat",
    textAlign: "center",
  },
  chartDateLabel3: {
    color: "#000",
    fontSize: 12,
    flex:1,
    fontWeight: "bold",
    fontFamily: "Montserrat",
    textAlign: "right",
  },
  editIcon: {
    width: 18,
    height: 18
  },
  editIconView: {
    flex: 1,
    alignItems: "center",
    flexDirection: "row"
  },
  firstLayout: {
    backgroundColor: "#fff",
    flex: 1
  },
  secondLayout: {
    backgroundColor: "#b0ddf2",
    height: 400
  },

  thirdLayout: {
    backgroundColor: "#fff",
    height: 5
  },

  chartView: {
    marginLeft: 40,
    flexDirection: "column"
  },
  chartDateView: {
    height:20,
    width:290,
    marginTop:-34,
    marginLeft:45,
    flexDirection: "row",
    justifyContent:"space-between"
  },
  commentsView1: {
    flex: 1
  },
  commentsView: {
    width: "100%",
    height: 50
  },
  commentsImageView: {
    width: 55,
    height: 55,
    borderRadius: 55 / 2,
    justifyContent: "center",
    alignItems: "center"
  },
  commentsImg: {
    height: 55,
    width: 55,
    borderRadius: 55 / 2
  },
  comments1View: {
    position: "absolute",
    marginLeft: 2
  },
  comments2View: {
    position: "absolute",
    marginLeft: 45
  },
  comments3View: {
    position: "absolute",
    marginLeft: 50
  },
  comments4View: {
    position: "absolute",
    marginLeft: 75,
    backgroundColor: "#4079c4"
  },
  comments5View: {
    position: "absolute",
    marginLeft: 145
  },
  commentsViewText: {
    color: "#ffffff",
    fontSize: 10
  },
  calender: {
    alignItems: 'flex-start',
    backgroundColor: '#ffde00',
    height: '68%',
     width:'100%',
    //flex: 1,
    position: 'absolute',
    //justifyContent: 'center',
    bottom: 0,
    left: 0,
    right: 0,
  },
  testView:{
    height: 55,
    backgroundColor: "red",
    marginLeft: "13%",

  },
  dropdownViewone: {
    marginTop:'3%',
    marginLeft: "5%",
    width: "40%",
    backgroundColor: "white",
    // alignItems: "center",
    // flexDirection: "row",
    height: 55,
    borderRadius: 25
    // shadowColor: "white",
    // shadowOffset: { width: 20, height: 20 },
    // shadowOpacity: 1,
    // shadowRadius: 2,
    // borderWidth: 0.1,
  },
  dropdownViewTwo: {
    marginTop:'3%',
    marginLeft: "10%",
    width: "40%",
    backgroundColor: "white",
    // alignItems: "center",
    // flexDirection: "row",
    height: 55,
    borderRadius: 25
    // shadowColor: "white",
    // shadowOffset: { width: 20, height: 20 },
    // shadowOpacity: 1,
    // shadowRadius: 2,
    // borderWidth: 0.1,
  },
dropdownoneLabel: {
    fontFamily: "Montserrat",
    fontSize: 17,
    fontWeight: "600",
    fontStyle: "normal",
    lineHeight: 23,
    letterSpacing: 0,
    color: "#000000",
    marginLeft: "5%",
    marginTop:'7%'
  },
  dropdownoneicon: {
    width: 15,
    height: 8,
    marginLeft: "85%",
    marginTop: "-13%"
  },
 
  touchableView: {
    marginLeft: "6%",
    width: "90%",
    marginTop: "3%",
    // backgroundColor: "red",
    flexDirection: "row",
    alignItems: "center"
  }
});
