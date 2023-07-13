import { StyleSheet } from "react-native";
import { Dimensions } from "react-native";
export const { width, height } = Dimensions.get('window');

const screenWidth = Dimensions.get("window").width;
const screenHight = Dimensions.get("window").height;

export default StyleSheet.create({
  goalsView: {
    marginTop: "5%",
    flex: 1,
    //  backgroundColor: 'green',
    width: "100%",
    marginLeft: "15%",
  },
  goalTextView: {
    //  backgroundColor: 'red',
    marginTop: "10%",
    width: "100%",
    marginLeft: "15%"
  },
  titleLabel: {
    color: "white",
    marginTop: "40%",
    marginLeft: "14%",
    width: 208,
    fontFamily: "montserrat",
    fontSize: 17,
    fontWeight: "600",
    fontStyle: "normal",
    lineHeight: 23,
    letterSpacing: 0
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

  deActivateDetailText: {
    marginTop: "1%",
    marginLeft: "14%",
    width: "80%",
    fontFamily: "Montserrat",
    fontSize: 13,
    fontWeight: "normal",
    fontStyle: "normal",
    lineHeight: 19,
    letterSpacing: 0,
    color: "#000000"
    //height:'80%'
  },
  boosterCloseView: {
    width: "90%",
    height: 70,
    justifyContent: "center",
    alignItems: "center",
    marginLeft: "50%",
    marginBottom: "10%",
    bottom: 0,
    position: "absolute",
    flexDirection: "row"
  },
  RightImageView: {
    width: "90%",
    height: 70,
    justifyContent: "center",
    alignItems: "center",
    marginLeft: "80%",
    marginBottom: "30%",
    bottom: 0,
    position: "absolute",
    flexDirection: "row"
  },
  textSpaceView: {
    marginTop: "5%"
  },

  detailTextLabel: {
    fontSize: 23,
    marginTop: "3%",
    marginLeft: "14%",
    fontFamily: "montserrat",
    fontWeight: "300",
    marginRight: 50,
    fontStyle: "normal",
    lineHeight: 33,
    letterSpacing: -0.43,
    color: "white"
  },
  boosterTextLabel: {
    marginTop: "3%",
    marginLeft: "14%",
    fontFamily: "Montserrat",
    fontSize: 23,
    fontWeight: "300",
    fontStyle: "normal",
    lineHeight: 33,
    letterSpacing: -0.43,
    color: "#000000"
    //marginRight: 50,
  },
  categoryLimittitleLabel: {
    color: "#000000",
    marginTop: "5%",
    marginLeft: "14%",
    width: 208,
    fontFamily: "montserrat",
    fontSize: 17,
    fontWeight: "600",
    fontStyle: "normal",
    lineHeight: 23,
    letterSpacing: 0
  },
  categorytitleLabel: {
    color: "#000000",
    marginTop: "5%",
    marginLeft: "10%",
    width: 208,
    fontFamily: "montserrat",
    fontSize: 17,
    fontWeight: "600",
    fontStyle: "normal",
    lineHeight: 23,
    letterSpacing: 0
  },
  categoryImageView: {
    marginTop: "2%"
  },

  closeImageView: {
    width: "90%",
    justifyContent: "center",
    alignItems: "center",
    marginLeft: "50%",
    marginTop: "10%",
    bottom: 0,
    position: "absolute",
    flexDirection: "row"
  },
  rightImageView: {
    width: "90%",
    height: 70,
    justifyContent: "center",
    alignItems: "center",
    marginLeft: "80%",
    marginBottom: "30%",
    bottom: 0,
    position: "absolute",
    flexDirection: "row"
  },

  bootomundelineView: {
    marginTop: "5%", //change this
    marginLeft: "14%",
    // backgroundColor:'red',
    height: 40
  },
  bottomunderlineText: {
    opacity: 0.6,
    fontFamily: "Montserrat",
    fontSize: 15,
    fontWeight: "normal",
    fontStyle: "normal",
    lineHeight: 23,
    letterSpacing: 0,
    color: "#000000",
    textDecorationLine: "underline"
  },

  subText: {
    marginTop: "5%",
    marginLeft: "14%",
    opacity: 0.5,
    fontFamily: "Montserrat",
    fontSize: 13,
    fontWeight: "300",
    fontStyle: "normal",
    lineHeight: 19,
    letterSpacing: 0,
    color: "#000000",
    width: "90%"
  },
  dropdownView: {
    marginTop: "5%",
    marginLeft: "13%",
    width: "80%",
    backgroundColor: "white",
    alignItems: "center",
    flexDirection: "row",
    height: 55,
    borderRadius: 25
    // shadowColor: "white",
    // shadowOffset: { width: 20, height: 20 },
    // shadowOpacity: 1,
    // shadowRadius: 2,
    // borderWidth: 0.1,
  },
  touchableView: {
    marginLeft: "6%",
    width: "90%",
    marginTop: "3%",
    // backgroundColor: "red",
    flexDirection: "row",
    alignItems: "center"
  },
  dropdownLabel: {
    fontFamily: "Montserrat",
    fontSize: 17,
    fontWeight: "600",
    fontStyle: "normal",
    lineHeight: 23,
    letterSpacing: 0,
    color: "#000000",
    marginLeft: "0%"
  },
  dropdownicon: {
    width: 15,
    height: 8,
    marginLeft: "90%",
    marginTop: "-8%"
  },
  sliderView: {
    marginLeft: "13%",
    marginTop: "10%",
    alignItems: "stretch",
    width: "70%"
    // backgroundColor:'red',
  },
  sliderIconsView: {
    marginLeft: "13%",
    width: "70%",
    // backgroundColor: "red",
    height: 30,
    flexDirection: "row"
    // alignItems: "center"
  },
  sliderIconStyle: {
    width: 29,
    height: 12
  },
  shoesliderIcon: {
    width: 29,
    height: 20,
    marginLeft: "85%"
  },
  FirstImageView: {
    // marginTop: "3%",
    // backgroundColor:'red',
    height: "80%",
    width: "100%"
  },
  thirdImageView: {
    marginTop: "-10%",
    height: "60%",
    width: "100%"
  },
  Image: {
    width: 266,
    height: 382,
    marginTop: "5%",
    marginLeft: "15%"
  },
  gultyPleasure: {
    width: 282,
    height: 340,
    marginTop: "5%",
    marginLeft: "15%"
  },
  qrPaybooster: {
    width: 309,
    height: 400,
    marginTop: "5%"
  },

  fitSetupImage: {
    width: 327,
    height: 284,
    marginTop: "5%"
    // marginLeft: "15%"
  },

  secondBoosterImage: {
    width: 325,
    height: 307,
    marginTop: "5%",
    marginLeft: "20%"
  },
  boosterImage: {
    width: 280,
    height: 200,
    marginTop: "5%"
    // marginLeft:"10%"
  },
  textView: {
    height: "60%",
    width: "100%"
  },

  popOverView: {
    width: 180,
    height: 31,
    //borderRadius: 10.5,
    backgroundColor: "#4a90e2"
    // backgroundColor:'transparent'
  },
  popOverText: {
    fontFamily: "Montserrat",
    fontSize: 11,
    fontWeight: "bold",
    fontStyle: "normal",
    lineHeight: 16,
    letterSpacing: 0,
    //textAlign: "right",
    color: "white",
    marginLeft: "20%",
    marginTop: "5%"
  },
  popoverToolView: {
    flexDirection: "row"
  },

  popOverImage: {
    width: 12,
    height: 12,
    marginTop: "10%",
    marginLeft: "10%"
  },

  stepsInput: {
    fontWeight: "600",

    color: "#000000",
    marginTop: "5%",
    marginLeft: "14%",
    width: "100%"
  },
  defaultInput: {
    fontFamily: "montserrat",
    fontSize: 23,
    fontWeight: "300",
    fontStyle: "normal",
    lineHeight: 33,
    letterSpacing: -0.43,
    marginTop: "5%",
    marginLeft: "14%",
    width: "100%",
    color: "gray"
    // backgroundColor:'red'
  },

  stepsAmount: {
    fontFamily: "montserrat",
    fontSize: 23,
    fontWeight: "600",
    fontStyle: "normal",
    lineHeight: 33,
    letterSpacing: -0.43,
    // marginTop: "4%",
    // marginLeft: '14%',
    width: "100%"
    //backgroundColor:'red'
  },

  phoneLabelBlack: {
    fontFamily: "montserrat",
    fontSize: 23,
    fontWeight: "600",
    fontStyle: "normal",
    lineHeight: 33,
    letterSpacing: -0.43,
    color: "#000"
    //marginTop: "4%",
  },

  phoneLabel: {
    fontFamily: "montserrat",
    fontSize: 23,
    fontWeight: "300",
    fontStyle: "normal",
    lineHeight: 33,
    letterSpacing: -0.43,
    color: "gray"
  },
  Amountlabel: {
    fontFamily: "montserrat",
    fontSize: 23,
    fontWeight: "600",
    fontStyle: "normal",
    lineHeight: 33,
    letterSpacing: -0.43,
    color: "black"
  },

  phoneView: {
    flexDirection: "row",
    height: 50,
    width: "100%",
    marginTop: "5%",
    marginLeft: "14%",
    alignItems: "center"
  },
  categoryContainer: {
    justifyContent: "center",
    marginTop: "10%",
    //backgroundColor:'red',
    height: "100%"
  },
  imageThumbnail: {
    justifyContent: "center",
    alignItems: "center",
    height: 100
    // backgroundColor:'blue'
  },
  collectioncontainer: {
    flex: 1,
    // backgroundColor:'blue',
    width: "100%"
  },
  collectionView: {
    justifyContent: "center",
    alignItems: "center",
    // backgroundColor: "red",
    flex: 1,
    flexDirection: "column",
    margin: 1,
    width: "100%",
    height: 100
  },
  categoryText: {
    marginTop: "5%",
    marginLeft: "4%",
    justifyContent: "center",
    alignItems: "center"
  },
  categorySubText: {
    marginTop: "2%",
    marginLeft: "4%",
    justifyContent: "center",
    alignItems: "center"
  },

  categoryImage: {
    width: 45,
    height: 45,
    shadowColor: "rgba(0, 0, 0, 0.1)",
    shadowOffset: {
      width: 0,
      height: 6
    },
    shadowRadius: 5,
    shadowOpacity: 1
  },
  categoriesStartView: {
    marginTop: "5%",
    marginLeft: "10%",
    marginRight: "10%",
    // backgroundColor:'red',
    height: "60%",
    width: "80%"
  },
  startCategoryView: {
    flexDirection: "row",
    margin: 1,
    width: "100%",
    height: "100%"
    // backgroundColor: "red"
  },
  categorystartImage: {
    marginLeft: "10%",
    marginTop: "5%",
    width: 45,
    height: 45,
    shadowColor: "rgba(0, 0, 0, 0.1)",
    shadowOffset: {
      width: 0,
      height: 6
    },
    shadowRadius: 5,
    shadowOpacity: 1
  },

  categoryLimitImage: {
    marginLeft: "14%",
    marginTop: "5%",
    width: 45,
    height: 45,
    shadowColor: "rgba(0, 0, 0, 0.1)",
    shadowOffset: {
      width: 0,
      height: 6
    },
    shadowRadius: 5,
    shadowOpacity: 1
  },
  categoryStartText: {
    marginTop: "7%",
    marginLeft: "10%",
    fontFamily: "Montserrat",
    fontSize: 13,
    fontWeight: "600",
    fontStyle: "normal",
    letterSpacing: 0,
    color: "#000000"
  },
  categoryStartSubText: {
    marginTop: "1%",
    marginLeft: "10%",
    fontFamily: "Montserrat",
    fontSize: 13,
    fontWeight: "normal",
    fontStyle: "normal",
    lineHeight: 19,
    letterSpacing: 0,
    color: "#000000"
  },

  deactivateAmountView: {
    marginTop: "5%",
    marginLeft: "14%",
    width: "80%",
    // backgroundColor: "red",
    // alignItems: "center",
    flexDirection: "row",
    height: "10%"
  },
  smallDetailText: {
    fontFamily: "Montserrat",
    fontSize: 15,
    fontWeight: "300",
    fontStyle: "normal",
    lineHeight: 24,
    letterSpacing: 0,
    color: "black",
    marginTop: "5%",
    height: "80%"
  },
  deactivatedropdownView: {
    marginLeft: "20%",
    width: "55%",
    backgroundColor: "white",
    alignItems: "center",
    flexDirection: "row",
    height: 55,
    borderRadius: 25
  },
  deactivatedropdownicon: {
    width: 15,
    height: 8,
    marginLeft: "85%",
    marginTop: "-15%"
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
  deactivateimageStyle: {
    width: 266,
    height: 382,
    marginTop: "5%",
    marginLeft: "15%"
  },
  deactivateqrpayimage: {
    width: 309,
    height: 400,
    marginTop: "5%"
  },
  deactivateFitView: {
    marginLeft: "14%",
    width: "80%",
    // backgroundColor: "red",
    flexDirection: "row",
    height: "5%"
  },
  deactivatedetailtext: {
    fontFamily: "Montserrat",
    fontSize: 15,
    fontWeight: "600",
    fontStyle: "normal",
    lineHeight: 24,
    letterSpacing: 0,
    textAlign: "right",
    color: "#000000",
    marginTop: "5%",
    height: "80%",
    marginLeft: "35%"
  },
  deactivateEditImage: {
    width: 12,
    height: 12,
    marginTop: "50%",
    marginLeft: "10%"
  },

  deactivateFirstImageView: {
    // marginTop: "3%",
    height: "80%",
    width: "100%"
  },
  deactivatecategoriesView: {
    marginTop: "2%",
    marginLeft: "4%",
    marginRight: "10%",
    // backgroundColor:'red',
    height: "23%",
    width: "80%"
  },
  deactivateguiltyImage: {
    width: 354,
    height: 237,
    marginTop: "5%",
    marginLeft: "15%"
  },
  sliderThumStyle: {
    backgroundColor: 'white',
    borderStyle: "solid",
    borderWidth: 6.0,
    borderColor: "#4a90e2"
  },

  alerterrorView:{
    backgroundColor: "white",
    height: 250,
    width: 315,
    opacity: 1,
    borderRadius: 11,
    shadowColor: "rgba(0, 0, 0, 0.1)",
    shadowOffset: {
      width: 0,
      height: 4
    },
    shadowRadius: 12,
    shadowOpacity: 1
  },
  alertrightView:{
    marginTop: 2,
    marginLeft:"3%",
    height: '50%',
    width: "95%",
    backgroundColor: "white",
    flexDirection: "row",
    alignItems: "center",

  },
  alerterrorTitle:{
    width: 230,
    fontFamily: "montserrat",
    fontSize: 17,
    fontWeight: "600",
    fontStyle: "normal",
    lineHeight: 23,
    letterSpacing: 0,
    color: "black",
    marginLeft: 30,
    marginTop: 30,
   // height:"40%"

  },
  alertbuttonView: {
    marginTop:'-15%',
    marginLeft:'-5%',
    width: 50,
    height: 50
  },
  button: {
    height: 50,
    width: 50
  },
  alerttextView:{
    marginTop: "4%",
    marginLeft: 30,
    flexDirection: "row",
    justifyContent: "space-between"

  },

  alerttextSecondView:{
    marginTop:'-3%',
    marginLeft: 30,
    flexDirection: "row",
    justifyContent: "space-between"
  },

  categoryStartSubTextDetail: {
    marginTop: "1%",
    marginLeft: "14%",
    fontFamily: "Montserrat",
    fontSize: 13,
    fontWeight: "normal",
    fontStyle: "normal",
    lineHeight: 19,
    letterSpacing: 0,
    color: "#000000"
  },

 categorysubDetailText: {
    marginTop: "5%",
    marginLeft: "20%",
    width: "40%",
    fontFamily: "Montserrat",
    fontSize: 13,
    fontWeight: "600",
    fontStyle: "normal",
    lineHeight: 19,
    letterSpacing: 0,
    color: "#000000",
    // backgroundColor: "red",

    //height:'80%'
  },
  categorysubDetailTextlimit: {
    marginTop: "5%",
    marginLeft: "17%",
    width: "1%",
    fontFamily: "Montserrat",
    fontSize: 13,
    fontWeight: "600",
    fontStyle: "normal",
    lineHeight: 19,
    letterSpacing: 0,
    color: "#000000"
    //height:'80%'
  },
  categorysubDetailTextAmout: {
    marginTop: "5%",
    marginLeft: "21%",
     width: "1%",
    fontFamily: "Montserrat",
    fontSize: 13,
    fontWeight: "600",
    fontStyle: "normal",
    lineHeight: 19,
    letterSpacing: 0,
    color: "#000000"
    //height:'80%'
  },
  categoryEditImage: {
    width: 12,
    height: 12,
    marginTop: "70%",
    marginLeft: "3%"
  },


});
