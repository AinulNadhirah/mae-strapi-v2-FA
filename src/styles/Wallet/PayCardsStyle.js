import { StyleSheet, Dimensions, Platform } from "react-native";
export const blueBackgroundColor = "#f8f5f3";
export const { width, height } = Dimensions.get("window");

export default StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: "#fff",
		marginTop: Platform.OS === "ios" ? 20 : 0
	},
	containerBlue: {
		flex: 1,
		backgroundColor: blueBackgroundColor,
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
	innerScrollView: {
		flex: 1
	},
	firstView: {
		marginTop: 3
	},
	secondView: {
		marginTop: 3
	},
	thirdView: {
		marginTop: 23
	},

	secondTileView: {
		marginTop: 11
	},
	thirdTileView: {
		marginTop: 5
	},
	block: {
		flexDirection: "column",
		flex: 1
	},
	titleContainer: {
		marginTop: 40,
		marginLeft: 35,
		justifyContent: "flex-start"
	},
	titleText: {
		fontSize: 15,
		fontWeight: "600",
		fontStyle: "normal",
		lineHeight: 19,
		letterSpacing: 0,
		color: "#000000"
	},
	descriptionContainer: {
		marginLeft: 60,
		justifyContent: "flex-start",
		marginRight: 50,
		marginTop: 2
	},
	titleText1: {
		color: "#000000",
		fontWeight: "300",
		fontSize: 20
	},
	descriptionContainerAmount: {
		marginLeft: 35,
		justifyContent: "flex-start",
		marginRight: 50,
		marginTop: 20
	},
	descriptionText: {
		fontSize: 20,
		fontWeight: "300",
		fontStyle: "normal",
		lineHeight: 30,
		letterSpacing: 0,
		color: "#000000"
	},
	phoneLabelBlackLb: {
		color: "#000000",
		fontWeight: "800",
		fontSize: 20
	},
	phoneViewTransfer: {
		flexDirection: "row",
		width: "100%",
		marginTop: 18,
		marginLeft: 35,
		height: 25,
		alignItems: "center"
	}
});
