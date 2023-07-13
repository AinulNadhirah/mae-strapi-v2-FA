import { StyleSheet, Dimensions, Platform } from "react-native";
export const { width, height } = Dimensions.get("window");

const blueBackgroundColor = "#c0e4f2";
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
		flexDirection: "column"
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
	imgLabel: {
		marginTop: 2
	},
	imgLabelContainer: {
		flex: 1,
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
		flexDirection: "row",
		alignItems: "center"
	},
	thirdTileView: {
		marginTop: 5
	},
	thirdView: {
		marginTop: 23
	},
	titleContainer: {
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
		color: blackColor,
		fontSize: 20,
		fontWeight: "300"
	},
	textTitle: {
		color: blackColor,
		fontSize: 15,
		lineHeight: 15
	}
});
