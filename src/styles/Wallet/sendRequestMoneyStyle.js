/* eslint-disable react-native/no-color-literals */
import { StyleSheet, Dimensions, Platform } from "react-native";
export const blueBackgroundColor = "#f8f5f3";
export const { width, height } = Dimensions.get("window");

export default StyleSheet.create({
	container: {
		backgroundColor: "#fff",
		flex: 1,
		marginTop: Platform.OS === "ios" ? 20 : 0
	},
	containerBlue: {
		backgroundColor: blueBackgroundColor,
		flex: 1,
		marginTop: Platform.OS === "ios" ? 20 : 0
	},
	containerInner1View: {
		flexDirection: "column",
		flex: 1,
		marginLeft: 35,
		marginRight: 35
	},
	containerInner2View: {
		flexDirection: "column",
		flex: 1,
		marginLeft: 0,
		marginRight: 0
	},
	containerInnerAllCenterView: {
		flexDirection: "column",
		flex: 1,
		justifyContent: "center",
		alignContent: "center",
		alignItems: "center"
	},
	containerInnerNewView: {
		flexDirection: "column",
		flex: 1,
		marginLeft: 35
	},
	containerInnerScrollDetailsView: {
		flex: 1
	},
	containerInnerScrollView: {
		flex: 1
	},
	containerInnerView: {
		flexDirection: "column",
		flex: 1,
		marginLeft: 50
	},
	containerInnerView1: {
		flexDirection: "column",
		flex: 1
	},
	containerDetailInnerView: {
		flexDirection: "column",
		flex: 1,
		marginLeft: 50,
		marginRight: 50
	},
	containerLightBlue: {
		backgroundColor: "#f8f5f3",
		flex: 1,
		marginTop: Platform.OS === "ios" ? 20 : 0
	},
	containerScrollDetailsView: {
		elevation: 1,
		flex: 1
	},
	containerTransparentView: {
		backgroundColor: "transparent",
		flex: 1
	},
	containerView: {
		backgroundColor: "transparent",
		flex: 1
	},
	containerLightView: {
		backgroundColor: "#f8f5f3",
		flex: 1
	},
	indicator2: {
		backgroundColor: "transparent"
	},
	label: {
		color: "#000000",
		fontFamily: "montserrat",

		fontSize: 12,
		fontStyle: "normal",
		fontWeight: "600",
		letterSpacing: 0,
		lineHeight: 12,
		textAlign: "center"
		// fontFamily: "montserrat_bold"
	},
	referenceLabel: {
		color: "#3b3b41",
		fontSize: 13,
		fontWeight: "500"
	},
	tab: { backgroundColor: "transparent", height: 70 },
	tabBlue: { backgroundColor: "transparent", height: 70 },
	tabbar: {
		backgroundColor: "#fff",
		height: 70
	},
	tabbarBlue: {
		backgroundColor: "transparent",
		fontFamily: "montserrat",
		height: 70,
		marginLeft: "1%",
		width: "100%"
	},
	tabbarSplitBill: {
		backgroundColor: "transparent",
		elevation: 0,
		height: 70
	},
	topText: {
		color: "#7c7c7d",
		fontSize: 15,
		fontWeight: "100",
		marginLeft: 35,
		marginRight: 1,
		textAlign: "center"
	},
	titleDetailText: {
		color: "#000000",
		fontSize: 23,
		fontStyle: "normal",
		fontWeight: "300",
		letterSpacing: -0.43,
		lineHeight: 33,
		marginTop: 10,
		textAlign: "center"
	},
	fieldView: {
		alignItems: "center",
		flexDirection: "column",
		marginTop: 24,
		width: "100%"
	},
	fieldNumberView: {
		alignItems: "center",
		flexDirection: "column",
		marginTop: 10,
		width: "100%"
	},
	phoneNumberDetailText: {
		color: "#000000",
		fontSize: 13,
		fontStyle: "normal",
		fontWeight: "normal",
		letterSpacing: 0,
		lineHeight: 24,
		textAlign: "center"
	},
	fieldNameView: {
		alignItems: "center",
		flexDirection: "column",
		marginTop: 2,
		width: "100%"
	},
	nameDetailText: {
		color: "#000000",
		fontSize: 15,
		fontStyle: "normal",
		fontWeight: "600",
		letterSpacing: 0,
		lineHeight: 23,
		textAlign: "center"
	},

	fieldAmountView: {
		alignItems: "center",
		flexDirection: "column",
		marginTop: 8,
		width: "100%"
	},
	amountDetailText: {
		color: "#000000",
		fontSize: 23,
		fontStyle: "normal",
		fontWeight: "600",
		letterSpacing: -0.43,
		lineHeight: 33,
		textAlign: "center"
	},
	fieldFirstRow: {
		alignItems: "center",
		flexDirection: "row",
		flex: 1,
		height: 30,
		marginLeft: 5,
		marginTop: 62,
		width: "100%"
	},
	fieldRow: {
		alignItems: "center",
		flexDirection: "row",
		flex: 1,
		height: 30,
		marginLeft: 5,
		marginTop: 1,
		width: "100%"
	},
	fieldRowInner: {
		flex: 2.8,
		flexDirection: "column",
		justifyContent: "center"
	},
	fieldValueLabel: {
		color: "#000000",
		fontSize: 13,
		fontStyle: "normal",
		fontWeight: "600",
		letterSpacing: 0,
		lineHeight: 19,
		textAlign: "right"
	},
	fieldLabel: {
		color: "#000000",
		fontSize: 15,
		fontStyle: "normal",
		fontWeight: "normal",
		letterSpacing: 0,
		lineHeight: 19,
		opacity: 0.5
	},

	footerView: {
		flexDirection: "row",
		justifyContent: "center",
		marginBottom: 40,
		marginLeft: 35,
		marginRight: 35
	},

	footerInner: {
		flexDirection: "row",
		justifyContent: "center"
	},

	footerButtonView: {
		width: "100%"
	},
	statusIcon: {
		borderRadius: 54,
		height: 54,
		marginLeft: 10,
		width: 54
	},
	statusIconView: {
		marginTop: 52
	},

	statusTextView: {
		marginTop: 27
	},
	statusTextLabel: {
		color: "#000000",
		fontSize: 21,
		fontStyle: "normal",
		fontWeight: "300",
		letterSpacing: 0,
		lineHeight: 30,
		marginRight: 30
	},
	titleText2ErrorMsg: {
		alignContent: "center",
		alignItems: "center",
		alignSelf: "center",
		color: "red",
		fontSize: 11,
		fontWeight: "normal",
		marginTop: 15,
		textAlign: "center"
	}
});
