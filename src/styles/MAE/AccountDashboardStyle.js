import { StyleSheet, Dimensions } from "react-native";
const { width, height } = Dimensions.get("window");
import * as mainStyles from "../main";

const screenWidth = Dimensions.get("window").width;
const screenHeight = Dimensions.get("window").height;

export default StyleSheet.create({
	tabContainer: {
		// marginTop: 24, //(height * 5) / 667,
		elevation: 0
	},

	indicator: {
		backgroundColor: mainStyles.blueBackgroundColor,
		height: 0,
		width: "33%"
	},
	containerBlue: {
		alignItems: "center",
		backgroundColor: "#f8f8f8",
		flex: 1,
		width: "100%"
	},

	selficontainer: {
		alignItems: "center",
		backgroundColor: "#f8f8f8",
		height: "40%",
		width: "100%"
	},

	applyImageView: {
		marginTop: 43,
		width: "100%",
		alignItems: "center"
	},
	applyimage: {
		width: 100,
		height: 100
	},
	nameView: {
		flex: 1,
		marginTop: 20,
		width: "100%"
	},
	blurView: {
		flex: 1,
		width: "100%",
		backgroundColor: "rgba(0, 0, 0, 0.8)"
	},
	addMediaCls: {
		marginLeft: "13%",
		marginBottom: 10,
		fontFamily: "montserrat",
		fontSize: 16,
		fontWeight: "600",
		fontStyle: "normal",
		letterSpacing: 0,
		color: "#ffffff"
	},
	actionView: {
		width: "100%",
		height: "47%",
		top: "51%",
		position: "relative"
	},
	nextbootomView: {
		width: "20%",
		height: "10%",
		marginLeft: "40%",
		bottom: "10%",
		position: "relative"
	},
	nameText: {
		fontFamily: "montserrat",
		fontSize: 16,
		fontWeight: "600",
		fontStyle: "normal",
		letterSpacing: 0,
		color: "#000000",
		marginTop: 15,
		width: "100%"
	},
	snapName: {
		fontFamily: "montserrat",
		fontSize: 16,
		fontWeight: "600",
		fontStyle: "normal",
		letterSpacing: 0,
		color: "#000000",
		marginTop: (screenHeight * 3) / 100,
		width: "100%"
	},
	leftMarginCls: {
		paddingLeft: 36,
		paddingRight: 36
	},
	imgPlaceholderTextCls: {
		fontFamily: "montserrat",
		fontSize: 14,
		fontWeight: "300",
		fontStyle: "normal",
		letterSpacing: 0,
		color: "#000000"
	},
	textCenter: {
		fontFamily: "montserrat",
		fontSize: 20,
		fontWeight: "300",
		fontStyle: "normal",
		lineHeight: 30,
		letterSpacing: 0,
		textAlign: "center",
		color: "#000000",
		width: "100%"
	},
	mykadText: {
		color: "#000000",
		fontFamily: "montserrat",
		fontSize: 20,
		fontStyle: "normal",
		fontWeight: "300",
		letterSpacing: 0,
		marginTop: 10,
		width: "100%",
		lineHeight: 30
	},

	applyMAEBulletContCls: {
		flexDirection: "row",
		justifyContent: "flex-start",
		marginTop: 26,
		width: "100%"
	},
	termsconditions: {
		marginLeft: 36,
		marginTop: (screenHeight * 3) / 100
	},
	termsText: {
		fontWeight: "100",
		height: 25,
		fontSize: 14,
		textDecorationLine: "underline",
		fontFamily: "montserrat"
	},

	virtualCardImage: {
		height: 190,
		marginTop: 20,
		width: "100%",
		alignItems: "center"
	},
	cardTaptext: {
		fontFamily: "montserrat",
		fontSize: 12,
		fontWeight: "300",
		fontStyle: "normal",
		lineHeight: 30,
		letterSpacing: 0,
		textAlign: "center",
		color: "#000000",
		height: "5%",
		width: "100%",
		marginTop: "1%"
	},
	cardImage: {
		alignItems: "center",
		// marginTop: 30,
		width: 300,
		height: '100%'
	},
	virtualCard: {
		alignItems: 'center',
		height: "100%",
		width: "100%"
	},
	virtualCardNumberTextCls: {
		letterSpacing: 1.5,
		position: "relative",
		top: 95,
		color: "#ffffff",
		fontFamily: "montserrat",
		fontSize: 18,
		lineHeight: 23,
		fontWeight: "300",
		fontStyle: "normal",
		textShadowColor: "rgba(0, 0, 0, 0.6)",
		textShadowOffset: {
			width: -0.1,
			height: 0.5
		},
		textShadowRadius: 2,
		elevation: 3
	},

	buttonsView: {
		marginLeft: "7%",
		marginTop: "5%"
	},
	virtualCardsButtonsBlockCls: {
		bottom: 0,
		position: "absolute",
		marginLeft: 20,
		marginTop: 20,
		justifyContent: "flex-end"
	},

	snapText: {
		color: "#000000",
		fontFamily: "montserrat",
		fontSize: 20,
		lineHeight: 30,
		fontStyle: "normal",
		fontWeight: "300",
		letterSpacing: 0,
		marginTop: (screenHeight * 1) / 100,
		width: "100%"
	},

	flashText: {
		color: "#000000",
		fontFamily: "montserrat",
		fontSize: 16,
		fontStyle: "normal",
		fontWeight: "normal",
		letterSpacing: 0,
		marginLeft: "10%",
		marginTop: "3%",
		width: "100%"
		//height: "20%",
		// backgroundColor:'red'
	},
	RightImageView: {
		bottom: 0,
		flexDirection: "row",
		height: 70,
		marginLeft: "80%",
		//marginTop: "99%",
		position: "absolute",
		width: "10%"
	},

	tabbar: {
		backgroundColor: "#f8f8f8",
		elevation: 0,
		// height: (height * 40) / 667
		height: 50
	},
	tab: {
		height: "100%",
		// height: (height * 40) / 667,
		backgroundColor: "#f8f8f8",
		paddingLeft: (width * 5) / 375,
		width: (width * 130) / 375, // revert to this later when all tabs are added,
		alignItems: "flex-end", // revert to this later when all tabs are added,
		alignItems: "center"
	},
	label: {
		color: "#000000",
		fontFamily: "montserrat-Bold",
		fontSize: 13,
		letterSpacing: 0,
		lineHeight: 23,
		height: "100%"
	},
	addCardIcon: {
		width: 75,
		height: 75,
		resizeMode: "contain"
	},

	imgViewRemovePage: {
		width: "100%",
		height: "100%"
	},

	cardButtonInnerView: {
		width: "100%",
		height: "100%",
		borderRadius: 1,
		borderWidth: 2.5,
		borderColor: "#cfcfcf",
		backgroundColor: "transparent",
		alignItems: "center",
		flexDirection: "row",
		justifyContent: "center",
		//marginTop: "3%",
		position: "relative",
		borderStyle: "dashed"
	},

	selfieViewStyle: {
		width: (screenWidth * 50) / 100,
		height: (screenWidth * 50) / 100
	},
	imageselfieViewStyle: {
		borderColor: "#ffffff",
		borderRadius: (screenWidth * 50) / 100,
		borderStyle: "solid",
		borderWidth: 2,
		width: (screenWidth * 50) / 100,
		height: (screenWidth * 50) / 100
	},
	selfibuttonImage: {
		height: 80,
		marginLeft: "70%",
		marginTop: "60%",
		width: 80
	},
	buttonImage: {
		alignItems: "center",
		height: 80,
		width: 80
	},
	codeViewStyle: {
		backgroundColor: "#eeeeee",
		borderColor: "#cfcfcf",
		borderRadius: 1,
		borderStyle: "dashed",
		borderWidth: 2.5,
		height: (screenHeight * 22) / 100,
		marginTop: (screenHeight * 3) / 100,
		position: "relative",
		width: "100%"
	},
	buttonView: {
		alignItems: "center",
		justifyContent: "center",
		flexDirection: "column",
		height: "100%",
		width: "100%"
	},
	selfibuttonView: {
		alignItems: "center",
		justifyContent: "center",
		flexDirection: "row",
		height: "100%",
		width: "60%",
		backgroundColor: "#f8f8f8"
	},

	selfiEditbutton: {
		width: "100%",
		height: "100%"
	},

	captureselfiEditbutton: {
		width: (screenWidth * 50) / 100,
		height: (screenWidth * 50) / 100,
		borderRadius: (screenWidth * 50) / 100 / 2,
		overflow: "hidden"
	},

	editButton: {
		marginTop: (screenHeight * 3) / 100,
		width: "100%",
		height: (screenHeight * 22) / 100
	},

	actionItem: {
		width: 138,
		height: (height * 30) / 100,
		flexDirection: "row",
		backgroundColor: "#fff",
		borderRadius: 15,
		marginLeft: 10,
		marginRight: 3,
		flexDirection: "column",
		paddingBottom: "5%"
	},
	actionItemFirst: {
		width: 138,
		height: (height * 30) / 100,
		flexDirection: "row",
		backgroundColor: "#fff",
		borderRadius: 15,
		marginLeft: 50,
		marginRight: 3,
		flexDirection: "column",
		paddingBottom: "5%"
	},

	actionItemLast: {
		width: 138,
		height: (height * 30) / 100,
		flexDirection: "row",
		backgroundColor: "#fff",
		borderRadius: 15,
		marginLeft: 8,
		marginRight: 50,
		flexDirection: "column",
		paddingBottom: "5%"
	},
	actionItemImage: {
		marginTop: 35,
		marginLeft: 16,
		width: (height * 12) / 100,
		height: (height * 12) / 100
		// width: 77,
		// height: 77
	},

	actionItemTitle: {
		color: "#000000",
		marginTop: 18,
		fontWeight: "bold",
		fontSize: 17,
		fontWeight: "bold",
		marginLeft: 16,
		marginRight: 16
	}
});
