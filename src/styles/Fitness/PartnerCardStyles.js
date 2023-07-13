import { StyleSheet } from "react-native";
import { Platform,Dimensions } from "react-native";
export const { width, height } = Dimensions.get('window');

export default StyleSheet.create({
  flex: {
    flex: 1,
    flexDirection: "row",
  },
  innerFlex: {
    flex: 1,
    flexDirection: "column",
    // marginLeft: 50*width/375,
    // backgroundColor:'yellow'
  },
  innerFlexNoMargin: {
    flex: 1,
    flexDirection: "column",
  },
  innerFlex1: {
    flex: 1,
    flexDirection: "column",
  },
  container: {
    flex: 1,
    backgroundColor: "#fff",
    marginTop: Platform.OS === "ios" ? 20 : 0
  },

  cardView: {
    flexDirection: "row",
    marginTop: 30*height/667,
  },
  cardItemFill: {
    flex: 1,
    flexDirection: "column",
    alignItems: "center",
    marginLeft:10*width/375,
  },
  cardItemView: {
    flexDirection: "row",
    alignItems: "center",
    width: 275*width/375,
    height: 175*height/667,
    backgroundColor:"#f8f5f3",
    borderRadius: 18*height/667,
    borderWidth: 1,
    borderColor: "gray",
    justifyContent:'center',
    alignContent:'center',
  },


  imgViewRemovePage:{
    justifyContent: "center",
    alignItems: "center",
    alignContent: "center",
    // marginTop:11.5*height/667,
    width: 275*width/375,
    height: 175*height/667,
    // backgroundColor:"#f8f5f3",
    borderRadius: 18*height/667,
  },

  cardItemViewNo: {
    flexDirection: "row",
    alignItems: "center",
    width: "90%",
    height: 200,
    borderRadius: 18,
    borderWidth: 0,
    borderColor: "gray",
    marginTop: 20,
  },

  cardItemViewPageNo: {
    flexDirection: "row",
    alignItems: "center",
    width: "90%",
    height: 200,
    borderRadius: 18,
    borderWidth: 0,
    borderColor: "gray",
    marginTop: 20,
    marginLeft:50*width/375
  },

  cardButtonView: {
    flexDirection: "column",
    width: "100%",
    height: 200,
    justifyContent: "center",
    borderRadius: 18,
    alignItems: "center",
  },

  cardButtonViewPage: {
    flexDirection: "column",
    width: "100%",
    height: 200,
    justifyContent: "center",
    alignItems: "center",
  },

  cardButtonInnerView: {
    flexDirection: "column",
    width: "100%",
    height: 175*height/667,
    borderRadius: 18*height/667,
    justifyContent: "center",
    alignItems: "center",
    alignContent: "center",
    backgroundColor:'transparent'
  },

  cardButtonInnerImage: {
    flexDirection: "column",
    width: "100%",
    height: 200,
    marginTop:10,
    justifyContent: "flex-end",
    alignItems: "flex-end"
  },

  viewCardImage:{
    width: "80%",
    height: 200,
    justifyContent: "center",
    alignItems: "center",
  },

  addCardLabel: {
    color: "gray",
    fontSize: 20,
    fontSize: 15,
    fontWeight: "normal",
    fontFamily: "montserrat"
  },

  loyaltyCardLabel: {
    color: "#000",
    fontSize: 22,
    fontWeight: "bold",
    fontFamily: "montserrat",
    fontStyle: "normal",
    lineHeight: 23,
    letterSpacing: 0,
    marginTop: 35,
    marginEnd: 50,
    marginLeft:50*width/375
  },

  loyaltyCardDesLabel: {
    color: "#000",
    fontSize: 24,
    fontFamily: "montserrat",
    fontWeight: "300",
    fontStyle: "normal",
    lineHeight: 33,
    letterSpacing: -0.43,
    marginTop: 35,
    marginEnd: 50,
    marginLeft:50*width/375
  },

  yourCardLabel: {
    color: "#000",
    fontSize: 23,
    fontFamily: "montserrat",
    fontStyle: "normal",
    lineHeight: 35,
    letterSpacing: 0,
    marginTop: 10,
    marginEnd: 50
  },

  viewCardButtonView: {
    marginTop: 20,
    marginLeft:30*width/375,
    height:100,
  },

  backToButtonView: {
    marginTop: -20,
    marginLeft:30*width/375,
    height:100
  },

  fontLabel: {
    color: "gray",
    fontSize: 11,
    fontWeight: "normal",
    fontFamily: "montserrat",
    marginTop: 10
  },

  addCardIcon: {
    width: 75,
    height: 75,
    resizeMode: "contain"
  },
  amountView: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 13,
    marginLeft:20,
    height: 50,
    flex:1
  },

  amountView9: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 13,
    marginLeft:5,
    height: 60,
    flex:1
  },

  viewLoyaltyCardsView: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 0,
    marginLeft:50*width/375,
    height: 40,
    flex:1,
  },

  viewLoyaltyCardsViewLast: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 0,
    marginLeft:50*width/375,
    height: 40,
    marginBottom:90,
    flex:1
  },


  amountView7: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 10,
    marginLeft:50*width/375,
    marginRight:50,
    height: 50,
    flex:1
  },

  formView: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 2,
    marginLeft:50*width/375,
    marginRight:50,
    height: 50,
    flex:1
  },

  amountView3: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 10,
    width: "100%",
    height: 50,
    marginLeft:5,
    marginBottom: 100
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
    fontSize: 15,
    fontWeight: "normal",
    fontFamily: "montserrat",
    flex: 2
  },
  amtValueLabel: {
    color: "black",
    fontSize: 15,
    fontWeight: "bold",
    fontFamily: "montserrat",
    flex: 1,
    textAlign: "right",
    marginRight: 0
  },
  amtValueLabel5: {
    color: "black",
    fontSize: 18,
    height:120,
    fontWeight: "bold",
    fontFamily: "montserrat",
    flex: 3,
    textAlign: "right",
    marginRight: 0,
  },
  inputCardNoView: {
    flex: 3.1,
    height: 50,
    flexDirection: "column",
    justifyContent: "center",
    marginRight: 4
  },

  inputCardNoView2: {
    flex: 2.8,
    height: 55,
    flexDirection: "column",
    justifyContent: "center",
    marginRight: 60
  },
  inputCardNoView7: {
    flex: 2.8,
    height: 55,
    flexDirection: "column",
    justifyContent: "center",
    marginRight: 60,
    marginTop:30,
    // marginLeft:50*width/375,
    // backgroundColor:'red'
  },

  inputCardNoView1: {
    flex: 2.8,
    height: 25,
    flexDirection: "column",
    justifyContent: "center"
  },

  inputCardNoView5: {
    flex: 3.3,
    height: 35,
    flexDirection: "column",
    justifyContent: "center",
    marginRight: 10
  },

  editIconView: {
    flex: 0.4,
    alignItems: "center",
    flexDirection: "row"
  },

  editIconView1: {
    flex: 1,
    alignItems: "center",
    flexDirection: "row",
    
  },
  editIconView1: {
    flex: 1,
    alignItems: "center",
    flexDirection: "row"
  },
  editIcon: {
    width: 18,
    height: 18
  },
  cardNameLabel: {
    color: "#000000",
    fontSize: 15,
    fontWeight: "normal",
    fontFamily: "montserrat",
    flex: 1.8,
  },
  cardNameLabel1: {
    color: "#000000",
    fontSize: 19,
    fontWeight: "normal",
    fontFamily: "montserrat",
    height: 55,
    flex: 1.8,
  },

  barcodetext:{
    color: "#000000",
    marginTop: 20,
    textAlign: "center",
    fontSize: 17,
    fontWeight: "normal",
    fontFamily: "montserrat",
    flex: 1,
  },

  cardnbarcodeview:{
    alignItems:'center',
    justifyContent:'center',
    width:width,
  },

  cardNumberLabel: {
    color: "#000000",
    marginTop: 20,
    textAlign: "center",
    fontSize: 17,
    fontWeight: "normal",
    fontFamily: "montserrat",
    flex: 1,
    marginLeft: -20
  },
  cardName1: {
    color: "gray",
    fontSize: 20,
    fontWeight: "bold",
    fontFamily: "montserrat",
    flex: 1,
    textAlign: "right",
    marginRight: 20
  },
  optionalLabel: {
    color: "gray",
    fontSize: 11,
    fontWeight: "bold",
    fontFamily: "montserrat",
    flex: 1,
    textAlign: "left",
    marginTop: -10,
    marginLeft: 50*width/375
  },
  amtLabel1: {
    color: "black",
    fontSize: 20,
    fontWeight: "bold",
    fontFamily: "montserrat",
    flex: 1
  },

  confirmView: {
    width: "100%",
    marginTop: 25,
    height: 50,
    marginBottom:50
    
  },


  cameraView: {
    flex: 1,
  },
  cameraViewPort: {
    flex: 1,
    flexDirection: "column"
  },

  dummyView: {
    flex: 2,
  },

  dummyView2: {
    flex: 10,
  },


  secondView: {
    width: "100%",
    height: "100%",
    position:"absolute"
  },
  secondViewOverlay: {
    flex: 1,
    flexDirection: "column"
  },

  secondViewOverlayInner: {
    flex: 1,
    flexDirection: "column",
    
  },
 
  enterManuallyLabel: {
    marginTop: 30,
    color: "#fff",
    fontSize: 20,
    textAlign: "center",
    fontWeight: "600",
    fontStyle: "normal",
    lineHeight: 23,
    letterSpacing: 0,
    marginRight: 55
  },
  scanLabel: {
    marginTop: "85%",
    marginLeft:55,
    marginRight:55,
    color: "#c6c6c6",
    textAlign:"center",
    fontSize: 17,
    fontWeight: "600",
    fontStyle: "normal",
    lineHeight: 23,
    letterSpacing: 0,
  },
  captureButtonView: {
    width: "100%",
    height: 120,
    
    flexDirection:"row",
    justifyContent: "center",
    alignItems: "center",
    alignContent: "center",
  // backgroundColor: "#fff",
  },
  captureButton: {
    width: 100,
    height: 100
  },
  barCodeImage: {
    flexDirection:'row',
    width: 150*width/375,
    height: 120*height/667,
    marginTop: 25,
    justifyContent: "center",
    alignItems: "center",
    alignContent: "center",
    // marginLeft: 115*width/374,
  },
  barCode: {
    // marginRight: 55
  },
  setupContainer: {
    display: "flex",
    justifyContent: "flex-start",
    flexDirection: "row",
    alignItems: "center",
    marginLeft: 40*width/375
  },

  icon: {
    width: 60,
    height: 60
  },

  iconBig: {
    width: 85,
    height: 85
  },
  setupText: {
    color: "black",
    fontSize: 20,
    marginTop: -10,
    fontWeight: "600",
    width: "100%",
    height: 23,
    fontFamily: "montserrat",
    fontStyle: "normal",
    lineHeight: 23,
    letterSpacing: 0
  },

  textWelcomeBold1: {
    marginLeft: 2,
    marginLeft:55,
    marginTop: 30,
    marginBottom: 10,
    color: "#fff",
    fontSize: 24,
    fontWeight: "600",
    fontStyle: "normal",
    lineHeight: 23,
    letterSpacing: 0
  },
});
