import { StyleSheet } from 'react-native';
import { Dimensions, Image } from 'react-native';
export const { width, height } = Dimensions.get('window');

export default StyleSheet.create({

  // rewardsMainContainerTop: {
  //   flex: 1,
  //   alignSelf: "stretch",
  //   height: 370,
  //   width: "100%",
  //   flexGrow: 1,
  //   flexDirection: "column",
  //   backgroundColor: "#fdd835"
  // },
  rewardsMainContainerEmpty: {


    margin: '1%',
    width: "98%",
    height: 509,
    borderRadius: 9,
    backgroundColor: "#ffffff",

    shadowColor: "rgba(0, 0, 0, 0.15)",
    shadowOffset: {
      width: 0,
      height: 5
    },
    shadowRadius: 15,
    shadowOpacity: 1


  },
  rewardsMainContainer: {
    margin: '1%',
    width: "98%",
    height: 509,
    borderRadius: 9,
    backgroundColor: "#ffffff",

    shadowColor: "rgba(0, 0, 0, 0.15)",
    shadowOffset: {
      width: 0,
      height: 5
    },
    shadowRadius: 15,
    shadowOpacity: 1

  },


  offerPlanMainContainer: {
    backgroundColor: "#ffde00",
    height: 326,
    flexDirection: "column"

  },

  offerPlanMainContainer2: {
    backgroundColor: "#ffde00",
    // backgroundColor:'red',
    height: 326,
     //flexDirection: "row"

  },
  offerPlanMainContainer3: {
    backgroundColor: "transparent",
    // backgroundColor:'red',
    height: 326,
     //flexDirection: "row"

  },

  imageReturningtemplate: {
   height: "100%",
   width:'100%',


     //flexDirection: "row"

  },

  sliderViews: {
    marginTop: 10,
    backgroundColor: 'transparent',
    marginLeft: 35,
    marginRight: 35,
    height: '70%',

  },

  sliderViewName: {
    marginTop: 10,
    width: '100%',
    backgroundColor: 'transparent',
    flexDirection: "row",
    height: 30,


  },

  sliderViewrow: {
    marginTop: 10,
    width: '100%',
    backgroundColor: 'transparent',
    flexDirection: "row",
    height: 60,


  },

  mainSliderView: {
    flexDirection: "row",
     width: '100%',
     height: '33%',
    backgroundColor: 'transparent', 
  },

  sliderView: {
    width: '80%',
    height: '100%',
     backgroundColor:'transparent',
    flexDirection: "column",


  },
  sliderTextView: {
    marginTop: 25,
    marginLeft: 0,
    width: '20%',
    backgroundColor: 'transparent',
    flexDirection: "column",
    height: 40,

  },

  ctaTextView: {
    marginTop: 10,
    marginLeft: 35,
    marginRight:35,
    backgroundColor: 'transparent',
    flexDirection: "column",
    height: 40,

  },


  sliderTitleView: {
    marginTop: 2,
    //marginLeft:20,
    backgroundColor: 'transparent',
    marginLeft: 35,
    marginRight: 35,
    height: 60,
    //flexDirection: "row"

  },

  slidertext: {
    width: "100%",
    fontFamily: "montserrat",
    fontSize: 20,
    fontWeight: "300",
    fontStyle: "normal",
    lineHeight: 31,
    letterSpacing: 0,
    color: "#000000",
    textAlign: 'center',
    justifyContent: "center",
    marginTop: 10,
    flexDirection: "column"
  },

  slideroptiontext: {
    width: "100%",
    fontFamily: "montserrat",
    fontSize: 20,
    fontWeight: "300",
    fontStyle: "normal",
    lineHeight: 31,
    letterSpacing: 0,
    color: "#000000",
    textAlign: 'center',
    justifyContent: "center",
    marginTop: 30,
    flexDirection: "column"
  },

  slidernametext: {
    flexDirection: "row",
    width: "100%",
    fontFamily: "montserrat",
    fontSize: 15,
    fontWeight: "600",
    fontStyle: "normal",
    lineHeight: 19,
    letterSpacing: 0,
    color: "#000000",
    textAlign: "left",
    marginLeft: 5,
    marginTop: 2,
  },




  seperatorColour: {
    margin: '1%',
    shadowColor: "rgba(0, 0, 0, 0.15)",
    shadowOffset: {
      width: 0,
      height: 5
    },
    shadowRadius: 15,
    shadowOpacity: 1


  },
  Contentontainer: {
    marginLeft: '2%',
    marginRight: '2%',
    // width: "98%",
    height: 500, //(height*60)/100,
    // minHeight: 350,
    // maxHeight: 580,
    borderRadius: 9,
    backgroundColor: "#ffffff",

    shadowColor: "rgba(0, 0, 0, 0.15)",
    shadowOffset: {
      width: 0,
      height: 5
    },
    shadowRadius: 15,
    shadowOpacity: 1

  },
  rewardsContainer: {
    flex: 1,
    flexGrow: 1,
    borderRadius: 9,
    // marginTop: '2%',
    // marginBottom: '2%'
  },

  returImage: {
    backgroundColor: 'transparent',
    height: 300,
    flexDirection: "column"
  },

  returImagecontainer: {
    marginTop: '2%',
    marginLeft: '2%',
    marginRight: '2%',
    // width: "98%",
    height: 280,
    borderRadius: 9,
    backgroundColor: "#ffffff",

    shadowColor: "rgba(0, 0, 0, 0.15)",
    shadowOffset: {
      width: 0,
      height: 5
    },
    shadowRadius: 15,
    shadowOpacity: 1

  },



  rewardsBox: {
    justifyContent: 'space-around',
    // marginTop:'2%',
    // position: "absolute",
    flex: 1,
    width: "100%",
    // alignSelf: "stretch",
    // flexGrow: 1,
    //height: 400,
    borderRadius: 9,
   // height: 280
  },
  rewardsTitleBox: {
    position: "absolute",
    top: 0,
    alignSelf: "stretch",
    width: "100%",
    flexBasis: 100,
    transform: [{ translate: [0, 0, 1] }],
    backgroundColor: "transparent"
  },
  rewardsTitleButtonStyle: {
    backgroundColor: "#2b323d",
    borderRadius: 15,
    borderWidth: 1,
    borderColor: "#2b323d",
    width: 180,
    height: 35,
    left: 35,
    justifyContent: "center",
  },
  rewardsButtonTextStyle: {
    fontSize: 18,
    color: "#ffffff",
    textAlign: "center",
    fontWeight: "normal"
  },
  rewardsImage: {
    // alignSelf: "center",
    height: 280,
    width: "100%",
    borderTopLeftRadius: 9,
    borderTopRightRadius: 9,
    backgroundColor: '#dfdfe1'
    // aspectRatio: 1.5,


  },

  

  detailTitle: {
    marginTop: '10%',
    height: 46,


  },

  rewardsDesLayout: {
    top: 20,
    flex: 1
    // backgroundColor:'red'

  },
  detailHome: {
    backgroundColor: 'white',
    flex: 1

  },

  backbuttonView: {
    height: 50,
    width: 50,
    marginTop: "2%",
    marginLeft: 10,
    // backgroundColor:'red'

  },

  shareView: {
    height: 50,
    width: 50,
    marginTop: "2%",
    marginLeft: "70%",
    // backgroundColor:'red'

  },

  topRow: {
    height: 50,
    flexDirection: "row",
    width: '100%',
    // backgroundColor:'red'

  },

  button: {
    height: 45,
    width: 45
  },

  rewardsTitleLayout: {
    top: 20,
    height: 46,
    //backgroundColor:'blue'

  },
  offerValeLayout: {
    top: 2,
    // height: 19,
    // backgroundColor:'blue'

  },


  homeLikeLayout: {
    top: 30,
    height: 50,
    marginStart: 20,
    flexDirection: 'row',
  },

  offerLikeLayout: {
    marginTop:'1%',
    marginBottom: 10,
   // height: 50,
    marginStart: 20,
    flexDirection: 'row',
  },


  likeButtonIcon: {
    width: 25,
    height: 21,
  },
  disLikeButtoonIcon: {
    height: 35,
    width: 35,
  },

  bookmarkButtonIcon: {
    height: 20,
    width: 20,

    // width: 25,
    // height: 20,
  },
  offerLikeLayout1and2: {
    flex: 3.8,
    flexDirection: "row"
    // marginTop:12
  },

  offerLikeLayout1and2Full: {
    flex: 1,
    flexDirection: "row"
    // marginTop:12
  },
  offerLikeLayout1: {
    //flex: 0.8,
    width: '20%',
    // marginTop: 12
  },
  // offerLikeLayout2: {
  //   //flex: 3,
  //   //marginLeft:'2%',
  //   marginTop: 8,
  //   width: '20%',
  //   // backgroundColor:'red'
  // },

  offerLikeLayout2: {
    width: '20%',
    marginLeft: '-10%',
    marginTop: '-1%'
  },

  offerLikeLayout3: {
    top: 60,
    height: 50,
    flexDirection: 'row',

    //   marginTop: 8,
    //  // backgroundColor:'red',
    //  // height: 80,
    //    flex: 1,
  },

  commentsView: {
    width: "100%",
    height: 90,
    top: -60,
    flexDirection: "row"
  },
  commentsViewIn1: {
    width: "80%"
  },
  commentsViewIn2: {
    width: "50%"
  },
  commentsImageView: {
    width: 56,
    height: 56,
    top: 40,
    borderRadius: 56 / 2,
    alignSelf: "center",
    justifyContent: "center",
    alignItems: "center"
  },
  comments1View: {
    position: "absolute",
    left: 30
  },
  comments2View: {
    position: "absolute",
    left: 70
  },
  comments3View: {
    position: "absolute",
    left: 110
  },
  comments4View: {
    position: "absolute",
    left: 140,
    backgroundColor: "#4079c4"
  },
  comments5View: {
    position: "absolute",
    left: 0,
    alignItems: "flex-end"
  },
  commentsViewText: {
    color: "#ffffff",
    fontSize: 10
  },
  commentsImg: {
    height: 55,
    width: 55,
    borderRadius: 55 / 2
  },
  bottomSpace: {
    height: 125,
    alignSelf: "stretch",
    backgroundColor: "transparent"
  },
  detailBackground: {
    resizeMode: "stretch",
    height: 425,
    justifyContent: "center"
  },
  detailBackgroundContent: {
    marginTop: 60
  },
  offerDetailsContainer: {
    flex: 1,
    alignSelf: "stretch",
    height: 800,
    width: "100%",
    flexGrow: 1,
    flexDirection: "column",
    marginTop: -16
  },
  offerDetailsBox: {
    position: "absolute",
    top: 13,
    flex: 1,
    width: "100%",
    alignSelf: "stretch",
    flexGrow: 1,
    height: "100%"
  },
  offerContain: {
    flex: 1,
    flexGrow: 1
  },
  offerTitleBox: {
    position: "absolute",
    top: -20,
    alignSelf: "stretch",
    flexDirection: "row",
    flexBasis: 100,
    transform: [{ translate: [0, 0, 1] }],
    backgroundColor: "transparent"
  },
  offerTitleButtonStyle: {
    backgroundColor: "#516c96",
    borderRadius: 15,
    borderWidth: 1,
    borderColor: "#516c96",
    width: 130,
    height: 35,
    left: 35,
    justifyContent: "center"
  },
  offerTitleButtonTextStyle: {
    fontSize: 15,
    paddingTop: 5,
    paddingBottom: 5,
    paddingLeft: 15,
    paddingRight: 15,
    color: "#fff",
    textAlign: "center"
  },
  commentSingleView: {
    left: 40
  },
  offerTitle: {
    flex: 4,
    top: 20
  },
  commentSingleContainer: {
    flex: 1,
    alignItems: "center",
    height: 100
  },
  crownImg: {
    height: 42,
    width: 60
  },
  crownImgContainer: {
    marginTop: -5
  },
  commentsImgDetails: {
    height: 42,
    width: 42,
    borderRadius: 42,
    borderWidth: 2,
    borderColor: "#fdd835"
  },
  textOfferDesc: {
    marginLeft: 25,
    marginBottom: 10
  },
  textOfferDesc2: {
    marginLeft: 50,
    // marginBottom: 10,
    color: "#000",
    fontSize: 23,
    fontWeight: "normal"
  },

  textHtml:{
    marginLeft: '4%',
    marginRight: '4%',
    marginTop:5,
   // height:70
  },
  offerValueLabel: {
    color: "#2477cf",
    width: '100%',
    fontSize: 18,
    fontWeight: "800",
    fontStyle: "normal",
    lineHeight: 23,
    letterSpacing: 0,
    marginLeft: 50,
    //marginBottom: 10
  },
  distanceLayout: {
    height: 104,
    width: "80%",
    marginLeft: "10%",
    marginTop: 30,
    flexDirection: "row"
  },
  distanceWalkLayout: {
    height: "100%",
    width: "50%",
    flexDirection: "row"
  },
  distanceDriveLayout: {
    height: "100%",
    width: "50%",
    flexDirection: "row"
  },
  distanceLayoutIC: {
    height: "100%",
    width: "50%",
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center"
  },


  budgetingButton: {
    marginTop: 10,
    marginLeft: 35,
    marginRight: 35,
    //backgroundColor:'red'
  },

  ctaButton: {
    marginTop: 25,
    marginLeft: 35,
    marginRight: 35,
    //backgroundColor:'red'
  },
  detailctaButton: {
    marginTop: 5,
    marginLeft: 35,
    marginRight: 35,
    //backgroundColor:'red'
  },

  textquetion: {
    width: '100%',
    height: '100%',
    fontFamily: "montserrat",
    fontSize: 15,
    fontWeight: "600",
    fontStyle: "normal",
    letterSpacing: 0,
    textAlign: "center",
    color: "#000000",
    textAlign: 'center',
    justifyContent: "center",
    marginTop: 10

  },
  seletedanswerButton: {
    marginTop: 50,
    height: 45,
    borderRadius: 22.5,
    backgroundColor: "#ffffff",
    shadowColor: "rgba(0, 0, 0, 0.1)",
    shadowOffset: {
      width: 0,
      height: 4
    },
    shadowRadius: 5,
    shadowOpacity: 1,
    borderStyle: "solid",
    borderWidth: 1,
    borderColor: "#f3f3f3",
    marginLeft: 35,
    marginRight: 35

  },

  questionButton: {
    marginTop: 10,
    height: 45,
    borderRadius: 22.5,
    backgroundColor: "#ffffff",
    shadowColor: "rgba(0, 0, 0, 0.1)",
    shadowOffset: {
      width: 0,
      height: 4
    },
    shadowRadius: 5,
    shadowOpacity: 1,
    borderStyle: "solid",
    borderWidth: 1,
    borderColor: "#f3f3f3"

  },


  ctaquestionButton: {
    marginTop: 10,
    height: 45,
    borderRadius: 22.5,
    backgroundColor: "#f8d21c",
    shadowColor: "rgba(0, 0, 0, 0.1)",
    shadowOffset: {
      width: 0,
      height: 4
    },
    shadowRadius: 5,
    shadowOpacity: 1,
    borderStyle: "solid",
    borderWidth: 1,
    borderColor: "#f3f3f3"
  
  },
  bottomView:{
    height:30,
    backgroundColor:'transparent'
  },

  text: {
    color: "#fff",
    fontSize: 30,
    fontWeight: "bold"
  },

  textOfferDesc2: {
    height: 'auto',
    width: 'auto',
    justifyContent: 'center',
    alignItems: 'center',
    //width: '90%',
    marginTop: '2%',
    marginLeft: '5%',
    marginRight: '5%',
    // height: 51,
    fontFamily: "montserrat",
    fontSize: 11,
    fontWeight: "normal",
    fontStyle: "normal",
    lineHeight: 17,
    letterSpacing: 0,
    color: "#adadaf"
  },

  offerValueLabel: {
    marginTop:'1%',
    marginLeft:'4%',
    //height: 19,
    fontFamily: "montserrat",
    fontSize: 15,
    fontWeight: "600",
    fontStyle: "normal",
    lineHeight: 19,
    letterSpacing: 0,
    color: "#4190b7"

  },

  likesCountLabel: {
    //margin: '5%',
    marginTop: '8%',
    marginLeft:'1%',
    width: 36,
    height: 17,
    fontFamily: "montserrat",
    fontSize: 15,
    fontWeight: "normal",
    fontStyle: "normal",
    lineHeight: 17,
    letterSpacing: 0,
    color: "#000"

  },

  detailtextPatnerTitle: {
    height: 'auto',
    width: 'auto',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: '3%',


    // width: '90%',
    // margin:'5%',
    marginLeft: '5%',
    marginRight: '5%',
    height: 46,
    fontFamily: "montserrat",
    fontSize: 15,
    fontWeight: "600",
    fontStyle: "normal",
    lineHeight: 23,
    letterSpacing: 0,
    color: "#000000"


  },


  htmlTextView: {
    height: 'auto',
    width: 'auto',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: '5%',
    marginRight: '5%',



  },

  detailtextReminderTitle: {
    height: 'auto',
    width: 'auto',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: '5%',
    marginRight: '5%',
    fontFamily: "montserrat",
    fontSize: 15,
    fontWeight: "600",
    fontStyle: "normal",
    lineHeight: 23,
    letterSpacing: 0,
    color: "#000000"

  },
  detailPageCTAView:{
    marginTop:20,
    height:70,
    backgroundColor:'red'
  

  },
  textReminderTitle: {
    //height: '40',
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: '2%',

    //width: '90%',
    // margin:'5%',
    marginLeft: '4%',
    marginRight: '5%',
   // height: 46,
    fontFamily: "montserrat",
    fontSize: 15,
    fontWeight: "600",
    fontStyle: "normal",
    lineHeight: 23,
    letterSpacing: 0,
    color: "#000000",
    //backgroundColor:'red'


  },

  detailtextdetailTitle: {
    height: 'auto',
    width: 'auto',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: '3%',

    //width: '90%',
    // margin:'5%',
    marginLeft: '5%',
    marginRight: '5%',
    // height: '100%',
    //flex:1,
    fontFamily: "montserrat",
    fontSize: 15,
    fontWeight: "normal",
    fontStyle: "normal",
    lineHeight: 23,
    letterSpacing: 0,
    color: "#000000"


  },

  textdetailTitle: {
    width: '90%',
    // margin:'5%',
    marginLeft: '5%',
    marginRight: '5%',
    // height: 46,
    flex: 1,
    fontFamily: "montserrat",
    fontSize: 15,
    fontWeight: "normal",
    fontStyle: "normal",
    lineHeight: 23,
    letterSpacing: 0,
    color: "#000000"


  },
  seletedoptionText: {
    width: 305,
    height: 124,
    fontFamily: "montserrat",
    fontSize: 20,
    fontWeight: "300",
    fontStyle: "normal",
    lineHeight: 31,
    letterSpacing: 0,
    color: "#000000",
    marginLeft: 35,
    marginRight: 35,
    marginTop: 20
  },

  textDescription: {
    // width: 305,
    height: 62,
    fontFamily: "montserrat",
    fontSize: 20,
    fontWeight: "300",
    fontStyle: "normal",
    lineHeight: 31,
    letterSpacing: 0,
    color: "#000000",
    marginTop: 30,
    marginLeft: 35,
    marginRight: 35,
    textAlign: 'center'

  },

  sliderValues: {
    height: 30,
    fontFamily: "montserrat",
    fontSize: 20,
    fontWeight: "300",
    fontStyle: "normal",
    lineHeight: 31,
    letterSpacing: 0,
    color: "#000000",
    marginTop: 20,
    marginLeft: 0,
    marginRight: 35,
    

  },

  minsliderValues: {
    height: 30,
    fontFamily: "montserrat",
    fontSize: 20,
    fontWeight: "300",
    fontStyle: "normal",
    lineHeight: 31,
    letterSpacing: 0,
    color: "#000000",
    marginTop: 20,
    marginLeft: "1%",
    flexDirection:'column'

  },
  maxsliderValues: {
    height: 30,
    fontFamily: "montserrat",
    fontSize: 20,
    fontWeight: "300",
    fontStyle: "normal",
    lineHeight: 31,
    letterSpacing: 0,
    color: "#000000",
    marginTop: 20,
    marginLeft: '1%',
    //marginRight: 35,
    flexDirection:'column'


  },

  rangeTextValue: {
    height: 30,
    fontFamily: "montserrat",
    fontSize: 20,
    fontWeight: "300",
    fontStyle: "normal",
    lineHeight: 31,
    letterSpacing: 0,
    color: "#000000",
    marginTop: 20,
    marginLeft: 0,
    //marginRight: 35,
    flexDirection:'column'


  },
  rangeTextMaxValue: {
    height: 30,
    fontFamily: "montserrat",
    fontSize: 20,
    fontWeight: "300",
    fontStyle: "normal",
    lineHeight: 31,
    letterSpacing: 0,
    color: "#000000",
    marginTop: 20,
    marginLeft: 0,
    //marginRight: 35,
    flexDirection:'column',
    marginLeft: '65%',



  },


  textReminderDesc: {
    marginLeft: 30,
    marginTop: 40,
    marginBottom: 0,
    fontSize: 27,
    fontWeight: "200",
    fontStyle: "normal",
    lineHeight: 23,
    letterSpacing: 0,
  },
  textOfferDesc: {
    marginLeft: 30,
    marginTop: 5,
    marginBottom: 0,
    fontSize: 27,
    fontWeight: "200",
    fontStyle: "normal",
    lineHeight: 23,
    letterSpacing: 0,
  },
  textBlack: {
    color: "#000",
    fontSize: 30,
    left: 25,
    fontWeight: "normal"
  },
  textReminderDesc2: {
    marginLeft: 48,
    marginTop: 40,
    marginBottom: 0
  },
  spendSpinnerContainer: {
    marginTop: 20,
    marginLeft: 40,
    marginRight: 50,
  // backgroundColor:'orange'
  },
  sliderThumStyle: {
    backgroundColor: 'white',
    borderStyle: "solid",
    borderWidth: 6.0,
    borderColor: "#4a90e2",
  },

  rangeView: {
   flexDirection:'row'  
  //  backgroundColor:'red'
  },

  slider: {
    height: 7,
    marginTop:20,
    borderRadius: 12.5,
    backgroundColor: "#ececee",


  },
  resultThumStyle: {
    backgroundColor: 'transparent',
    borderColor: "transparent",

  },
  resultSlider: {
    height: 32,
    borderRadius: 80,
    width: '95%',
    marginTop: 10
    //backgroundColor: "#ececee",


  },
  resulttrack: {
    height: 50,
    borderRadius: 20,
    // backgroundColor: '#d0d0d0',



  },
  track: {
    height: 7,
    borderRadius: 12.5,
    backgroundColor: "#ececee",

    // borderBottomRightRadius: 20,
    // borderTopRightRadius: 20,
  },
  rightImageView: {
    // width: "90%",
    // backgroundColor: 'yellow',
    // position: 'relative',
    height: 70,
    width: 70,
    marginLeft: '80%',
    marginTop: '10%'
  },

});