import { StyleSheet } from "react-native";
import { Platform, Dimensions } from "react-native";
export const { width, height } = Dimensions.get("window");

export default StyleSheet.create({
	flex: {
		flex: 1,
		flexDirection: "row"
	},

	camrabackground: {
		flexDirection: "column",
		marginTop: 80,
		width: 308,
		height: 195,
		borderRadius: 9,
		borderStyle: "solid",
		borderWidth: 3,
		borderColor: "#ffffff"
	},

	selficamrabackground: {
		flexDirection: "column",
		marginTop: 80,
		borderColor: "#ffffff",
		borderWidth: 2,
		height: 250,
		width: 250,
		borderRadius: 125,
		borderStyle: "solid"
	},
	scanLabel: {
		marginTop: 30,
		marginBottom: "25%",
		marginLeft: "10%",
		marginRight: "10%",
		height: 46,
		fontFamily: "montserrat",
		fontSize: 17,
		fontWeight: "400",
		fontStyle: "normal",
		lineHeight: 23,
		letterSpacing: 0,
		textAlign: "center",
		color: "#ffffff"
	},

	viewCamera: {
		borderRadius: 6,
		flex: 1,
		overflow: "hidden"
	},

	selfiviewCamera: {
		borderRadius: 125,
		height: "100%",
		overflow: "hidden",
		width: "100%"
	},
	captureButtonView: {
		alignItems: "center",
		justifyContent: "center",
		width: "100%",
		height: 100,
		marginTop: "30%",
		// marginLeft: "80%",
		bottom: "5%",
		position: "absolute"
	},

	cardtext: {
		width: 200,
		height: 23,
		fontFamily: "montserrat",
		fontSize: 17,
		fontWeight: "600",
		fontStyle: "normal",
		lineHeight: 23,
		letterSpacing: 0,
		color: "#ffffff"
	},

	innerFlex: {
		flex: 1,
		flexDirection: "column"
		// marginLeft: 50*width/375,
		// backgroundColor:'yellow'
	},
	innerFlexNoMargin: {
		flex: 1,
		flexDirection: "column"
	},
	innerFlex1: {
		flex: 1,
		flexDirection: "column"
	},
	container: {
		flex: 1,
		backgroundColor: "#fff",
		marginTop: Platform.OS === "ios" ? 20 : 0
	},

	cardView: {
		flexDirection: "row",
		marginTop: (30 * height) / 667
	},
	editloyatyCard: {
		width: 151,
		height: 23,
		fontFamily: "montserrat",
		fontSize: 17,
		fontWeight: "600",
		fontStyle: "normal",
		lineHeight: 23,
		letterSpacing: 0,
		color: "#000000",
		marginTop: 30,
		marginLeft: "14%"
	},
	cardItemFill: {
		flex: 1,
		flexDirection: "column",
		alignItems: "center",
		marginLeft: (10 * width) / 375
	},
	cardItemView: {
		flexDirection: "row",
		alignItems: "center",
		width: (275 * width) / 375,
		height: (175 * height) / 667,
		backgroundColor: "#f8f5f3",
		borderRadius: (18 * height) / 667,
		borderWidth: 1,
		borderColor: "gray",
		justifyContent: "center",
		alignContent: "center"
	},

	backcardItemFill: {
		flex: 1,
		flexDirection: "column",
		alignItems: "center",
		marginLeft: 10
	},
	backcardItemView: {
		flexDirection: "row",
		alignItems: "center",
		width: 250,
		height: 175,
		backgroundColor: "#f8f5f3",
		borderRadius: 18,
		borderWidth: 1,
		borderColor: "gray"
	},

	cardItemViewNo: {
		flexDirection: "row",
		alignItems: "center",
		width: "90%",
		height: 200,
		borderRadius: 18,
		borderWidth: 0,
		borderColor: "gray",
		marginTop: 20
	},

	cardItemViewPageNo: {
		flexDirection: "row",
		alignItems: "center",
		width: "90%",
		height: 200,
		borderRadius: 18,
		borderWidth: 0,
		borderColor: "gray",
		marginTop: 20
	},

	imgViewRemovePage: {
		justifyContent: "center",
		alignItems: "center",
		alignContent: "center",
		// marginTop:11.5*height/667,
		width: (275 * width) / 375,
		height: (175 * height) / 667,
		// backgroundColor:"#f8f5f3",
		borderRadius: (18 * height) / 667
	},
	cardButtonViewPage: {
		flexDirection: "row",
		width: "100%",
		height: 175,
		marginTop: 25,
		backgroundColor: "transparent"

		//justifyContent: "center",
		// alignItems: "center"
	},

	removeCardText: {
		marginTop: 20,
		marginLeft: 50,
		marginRight: 50,
		height: 500
	},
	barcodeView: {
		flexDirection: "row",
		width: "100%",
		height: 90,
		marginTop: 25,
		backgroundColor: "red"
	},

	cardButtonInnerView: {
		flexDirection: "column",
		width: "100%",
		height: 200,
		borderRadius: 18,
		justifyContent: "center",
		alignItems: "center",
		alignContent: "center"
	},

	cardButtonView: {
		flexDirection: "column",
		width: "100%",
		height: 200,
		justifyContent: "center",
		borderRadius: 18,
		alignItems: "center"
	},

	cardButtonViewPage: {
		flexDirection: "column",
		width: "100%",
		height: 200,
		justifyContent: "center",
		alignItems: "center"
	},

	cardButtonInnerView: {
		flexDirection: "column",
		width: "100%",
		height: (175 * height) / 667,
		borderRadius: (18 * height) / 667,
		justifyContent: "center",
		alignItems: "center",
		alignContent: "center",
		backgroundColor: "transparent"
	},

	cardPicture: {
		width: 274,
		height: 173,
		marginTop: 0
	},
	backCardImage: {
		width: 274,
		height: 173,
		marginTop: 0,
		marginLeft: -15
	},

	cardButtonInnerImage: {
		width: 275,
		height: 175,
		marginTop: 0,
		marginLeft: 50,
		marginRight: 50
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
		marginLeft: (50 * width) / 375
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
		marginLeft: (50 * width) / 375
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
		marginLeft: (30 * width) / 375,
		height: 100
	},

	backToButtonView: {
		marginTop: -20,
		marginLeft: (30 * width) / 375,
		height: 100
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
		marginLeft: 20,
		height: 50,
		flex: 1
	},

	amountView9: {
		flexDirection: "row",
		alignItems: "center",
		marginTop: 13,
		marginLeft: 5,
		height: 60,
		flex: 1
	},
	cardInformationText: {
		flexDirection: "row",
		marginLeft: 50,
		marginRight: 50,
		backgroundColor: "red",
		height: 300
	},

	barcodetext: {
		color: "#000000",
		marginTop: 20,
		textAlign: "center",
		fontSize: 17,
		fontWeight: "normal",
		fontFamily: "montserrat",
		flex: 1
	},

	viewLoyaltyCardsView: {
		flexDirection: "row",
		alignItems: "center",
		marginTop: 0,
		marginLeft: (50 * width) / 375,
		height: 40,
		flex: 1
	},

	viewLoyaltyCardsViewLast: {
		flexDirection: "row",
		alignItems: "center",
		marginTop: 0,
		marginLeft: (50 * width) / 375,
		height: 40,
		marginBottom: 90,
		flex: 1
	},

	amountView7: {
		flexDirection: "row",
		alignItems: "center",
		marginTop: 10,
		marginLeft: (50 * width) / 375,
		marginRight: 50,
		height: 50,
		flex: 1
	},

	formView: {
		flexDirection: "row",
		alignItems: "center",
		marginTop: 2,
		marginLeft: (50 * width) / 375,
		marginRight: 50,
		height: 50,
		flex: 1
	},
	amountView3: {
		flexDirection: "row",
		alignItems: "center",
		marginTop: 10,
		width: "100%",
		height: 50,
		marginLeft: 5,
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
		height: 120,
		fontWeight: "bold",
		fontFamily: "montserrat",
		flex: 3,
		textAlign: "right",
		marginRight: 0
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
		marginTop: 30
		// marginLeft:50*width/375,
		// backgroundColor:'red'
	},

	nameView: {
		flex: 1.8,
		height: 55,
		flexDirection: "column",
		marginTop: 30
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
		flexDirection: "row"
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
		flex: 1.8
	},
	cardNameLabel1: {
		color: "#000000",
		fontSize: 19,
		fontWeight: "normal",
		fontFamily: "montserrat",
		height: 55,
		flex: 1.8
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
		marginLeft: (50 * width) / 375
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
		marginBottom: 50,
		marginLeft: "10%"
	},

	cameraView: {
		flex: 1
	},
	cameraViewPort: {
		flex: 1,
		flexDirection: "column"
	},

	dummyView: {
		flex: 2
	},

	dummyView2: {
		flex: 10
	},

	camera: {
		backgroundColor: "red",
		height: 300
	},
	secondView: {
		height: "40%",
		position: "absolute",
		backgroundColor: "red",
		marginTop: 25
	},
	secondViewOverlay: {
		flex: 1,
		flexDirection: "column"
	},

	addLoyaltyCardView: {
		marginTop: 25,
		height: 30,
		width: 300,
		marginLeft: "10%"
		// backgroundColor:'red',
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

	captureButton: {
		width: 100,
		height: 100
	},

	cardnbarcodeview: {
		alignItems: "center",
		justifyContent: "center",
		width: width
	},

	barCodeImage: {
		overflow: "hidden",
		flexDirection: "row",
		width: width - 100,
		height: (120 * height) / 667,
		marginTop: 25,
		justifyContent: "center",
		alignItems: "center",
		alignContent: "center"
		// marginLeft: 115*width/374,
	},
	barCode: {
		// marginRight: 55
	},
	setupContainer: {
		display: "flex",
		justifyContent: "flex-start",
		flexDirection: "row",
		alignItems: "center"
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
		marginLeft: 55,
		marginTop: 30,
		marginBottom: 10,
		color: "#fff",
		fontSize: 24,
		fontWeight: "600",
		fontStyle: "normal",
		lineHeight: 23,
		letterSpacing: 0
	}
});
