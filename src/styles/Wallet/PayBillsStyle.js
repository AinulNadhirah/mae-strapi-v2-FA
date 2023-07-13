import { StyleSheet, Dimensions, Platform } from "react-native";
export const { width, height } = Dimensions.get("window");

const blueBackgroundColor = "#f8f5f3";
const whiteColor = "#fff";
const blackColor = "#000000";
const greyColor = "#D8D8D8";
const darkGreyColor = "#9B9B9B";

export default StyleSheet.create({
	alphabetIconContainer: {
		alignContent: "center",
		alignItems: "center",
		backgroundColor: greyColor,
		borderRadius: 48,
		height: 64,
		justifyContent: "center",
		width: 64
	},
	block: {
		flexDirection: "column",
		flex: 1,
		// justifyContent: "flex-end",
		marginLeft: 35,
		marginRight: 35
	},
	container: {
		backgroundColor: whiteColor,
		flex: 1,
		marginTop: Platform.OS === "ios" ? 20 : 0
	},
	containerBlue: {
		backgroundColor: blueBackgroundColor,
		flex: 1,
		marginTop: Platform.OS === "ios" ? 20 : 0
	},
	containerInnerNewView: {
		flexDirection: "column",
		flex: 1,
		marginLeft: 50,
		marginRight: 20
	},
	containerInnerScrollView: {
		flex: 1
	},
	descriptionContainer: {
		// flex: 1,
		flexDirection: "row",
		justifyContent: "flex-start",
		alignItems: "center",
		marginTop: 2
	},
	descriptionContainerAmount: {
		justifyContent: "flex-start",
		marginLeft: 35,
		marginRight: 50,
		marginTop: 20
	},
	descriptionText: {
		color: blackColor,
		fontSize: 20,
		fontStyle: "normal",
		fontWeight: "300",
		letterSpacing: 0,
		lineHeight: 30
	},
	firstView: {
		marginTop: 3
	},

	imgContainer: {
		height: 64,
		width: 64
	},
	imgLabelContainer: {
		flexDirection: "column",
		flexGrow: 1,
		justifyContent: "flex-end",
		marginLeft: 10
	},
	innerScrollView: {
		flex: 1
	},
	next: {
		height: 70,
		width: 70
	},

	nextContainer: {
		alignItems: "flex-end"
	},

	normalIconImg: {
		height: 64,
		width: 64
	},
	secondTileView: {
		marginTop: 11
	},
	secondView: {
		marginTop: 3
	},
	shortNameLabelBlack: {
		color: darkGreyColor,
		fontFamily: "montserrat",
		fontSize: 23,
		fontStyle: "normal",
		fontWeight: "normal"
	},
	subcontainer: {
		marginTop: 40
	},
	subcontainerWithImage: {
		flexDirection: "row"
	},
	thirdTileView: {
		marginTop: 5
	},
	thirdView: {
		marginTop: 23
	},
	titleContainer: {
		// marginTop: 100,
		justifyContent: "flex-start"
	},
	titleText: {
		color: blackColor,
		fontSize: 15,
		fontStyle: "normal",
		fontWeight: "600",
		letterSpacing: 0,
		lineHeight: 19
	},
	titleText1: {
		// borderWidth: 1,
		// borderColor: "white",
		flex: 1,
		color: blackColor,
		fontSize: 20,
		fontWeight: "300",
		paddingHorizontal: 0
	},
	contactIconContainer: {
		// borderWidth: 1,
		// borderColor: "green",
		height: 30,
		width: 30
	},
	contactIcon: {
		// borderWidth: 1,
		// borderColor: "black",
		width: "100%",
		// height: "100%"
		flex: 1,
		height: null,
		resizeMode: "contain"
	},
	keyboardAwareScrollView: {
		flexDirection: "column",
		flexGrow: 1
	},
	mainScrollContainer: { flex: 1, flexDirection: "column" }
});
