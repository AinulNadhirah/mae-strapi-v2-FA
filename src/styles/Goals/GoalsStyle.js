import { StyleSheet } from 'react-native';
import { Dimensions } from 'react-native';

const screenWidth = Dimensions.get("window").width;
const screenHight = Dimensions.get("window").height;


export default StyleSheet.create({

  button: {
    alignItems: 'center',
    backgroundColor: '#DDDDDD',
    marginTop: 300,
    marginLeft:150
  },

  TitleLabel: {
    color: "#000000",
    marginTop: "7%",
    marginLeft: "14%",
    width: 208,
    fontFamily: "montserrat",
    fontSize: 17,
    fontWeight: "600",
    fontStyle: "normal",
    lineHeight: 23,
    letterSpacing: 0
  },
  DetailTextLabel: {
    fontSize: 23,
    marginTop: "3%",
    marginLeft: "14%",
    fontFamily: "montserrat",
    fontWeight: "300",
    marginRight:50,
    fontStyle: "normal",
    lineHeight: 33,
    letterSpacing: -0.43,
    color: "#000000",
    width:"80%",
    //height:'80%'
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

  PickerView: {
    backgroundColor: "white",
    height: "100%",
    width: "100%",
    opacity: 1,
    //borderRadius: 11,
    shadowColor: "rgba(0, 0, 0, 0.5)",
    // shadowOffset: {
    //   width: 0,
    //   height: 4
    // },
    // shadowRadius: 12,
    // shadowOpacity: 1
  },


  GoalsView: {
    marginTop: "25%",
    height: "45%",
    marginLeft: "15%",
  //  backgroundColor: 'red',

  },
  FromGoalView: {
    marginTop: "10%"
  },
  GoalInputView: {
    marginTop: "-5%",
    marginLeft: "-2%",
    backgroundColor: "red",

  },

  Input: {
    marginTop: "-7%",
    height: 50,
    marginLeft: "14%",
    width: "80%",
    fontFamily: "montserrat",
    fontSize: 23,
    fontWeight: "300",
    fontStyle: "normal",
    lineHeight: 33,
    letterSpacing: 0,
    color: "#000000",
    // backgroundColor: 'red',

  },
 

  AmountLabel: {
    fontFamily: "montserrat",
    fontSize: 23,
    fontWeight: "600",
    fontStyle: "normal",
    lineHeight: 33,
    letterSpacing: 0,
    color: "#000000"
  },
  AmountInput: {
    fontFamily: "montserrat",
    fontSize: 23,
    fontWeight: "600",
    fontStyle: "normal",
    lineHeight: 33,
    letterSpacing: 0,
    marginTop: "0%",
    // height: 50,
    marginLeft: 0,
    width: "100%",
    //backgroundColor:'red'
    color: "#000000"

  },
  
  DateView: {
    marginTop: "5%",
    marginLeft: "14%",
   // width: 300,
    backgroundColor:'#ffde00',
    alignItems: "center",
   width: "60%",
    flexDirection: "row",
    height: 55,
    borderRadius: 25,
    shadowColor: "#a4a6a8",
    shadowOffset: { width: 20, height: 20 },
    shadowOpacity: 1,
    shadowRadius: 2,
    borderWidth: 0.1,
  },

  CoinJairDurationview: {
    marginTop: "5%",
    marginLeft: "14%",
    width: '80%',
    height: 100,
    backgroundColor: 'red'

  },


  CoinJairDurationButton: {
    flexDirection: 'row',
    height: 200,
    width: "100%",
    marginLeft: "12%",
    marginTop: "-30%",
    alignItems: 'center',
   // backgroundColor: 'red',
  },
  amountTitleLabel: {
    color: "#000000",
    marginTop: "7%",
    marginLeft: "14%",
    width: 208,
    fontFamily: "montserrat",
    fontSize: 23,
    fontWeight: "600",
    fontStyle: "normal",
    lineHeight: 23,
    letterSpacing: 0
  },

  coinJarAmountLabel: {
    color: "#000000",
    marginTop: "3%",
    marginLeft: "14%",
    width: 208,
    fontFamily: "montserrat",
    fontSize: 23,
    fontWeight: "600",
    fontStyle: "normal",
    lineHeight: 23,
    letterSpacing: 0
  },

  AmountView: {
    flexDirection: 'row',
    height: 50,
    width: "100%",
    marginTop: "5%",
    alignItems: 'center',

  },

  CoinDurationText: {
    marginTop: "2%",
    fontFamily: "Montserrat",
    fontSize: 17,
    fontWeight: "600",
    fontStyle: "normal",
    lineHeight: 23,
    letterSpacing: 0,
    color: "black"  ,
    backgroundColor: '#DDDDDD',


  },
  CoinJairIcon: {

  },

  deactivatedropdownView: {
    marginLeft: "14%",
    width: "70%",
    backgroundColor: "white",
    alignItems: "center",
    flexDirection: "row",
    height: 55,
    borderRadius: 25,
    marginTop:'2%'
  },
  deactivatedropdownLabel: {
    fontFamily: "Montserrat",
    fontSize: 17,
    fontWeight: "600",
    fontStyle: "normal",
    lineHeight: 23,
    letterSpacing: 0,
    color: "#000000",
    marginLeft: "5%"
  },
  deactivatedropdownicon: {
    width: 15,
    height: 8,
    marginLeft: "85%",
    marginTop: "-10%"
  },
  touchableView: {
    marginLeft: "6%",
    width: "90%",
    marginTop: "3%",
    // backgroundColor: "red",
    flexDirection: "row",
    alignItems: "center"
  },
  
});