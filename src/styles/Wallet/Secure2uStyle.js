import { StyleSheet, Platform } from "react-native";

export default StyleSheet.create({
	addedTitleContainer: {
		marginLeft: 50,

		marginTop: 60,
		justifyContent: "flex-start"
	},
	addedDescriptionContainer: {
		marginLeft: 50,

		justifyContent: "flex-start",
		width: 300,
		marginRight: 50,
		marginTop: 30
	},
	addedDescriptionContainer1: {
		marginLeft: 50,
		justifyContent: "flex-start",
		width: 300,
		marginRight: 50,
		marginTop: 6
	},
	addedDescriptionContainerSmall: {
		marginLeft: 50,
		marginRight: 50,
		justifyContent: "flex-start",
		marginTop: 5
	},
	descriptionSmallText: {
		color: "#000000",
		fontWeight: "normal",
		fontStyle: "normal",
		fontSize: 13,
		lineHeight: 17,
		letterSpacing: 0
	},
	deviceListContainer: {
		marginLeft: 50,
		marginRight: 50,
		justifyContent: "flex-start",
		marginTop: 31
	},
	blockCenter: {
		flexDirection: "column",
		alignItems: "center",
		flex: 1
	},
	block: {
		flexDirection: "column",
		flex: 1
	},
	blockFlex: {
		flex: 1
	},
	icnumberView: {
		flex: 1,
		marginLeft: 0
	},
	addedTitle: {
		color: "#000000",
		fontWeight: "700",
		fontSize: 20
	},
	addedDescription: {
		color: "#000000",
		fontWeight: "100",
		fontSize: 22
	},
	mobileNumberVerify: {
		color: "#000000",
		fontWeight: "100",
		fontSize: 23,
		lineHeight: 33,
		letterSpacing: 0.4
	},

	longDescription: {
		color: "#000000",
		fontWeight: "100",
		fontSize: 16
	},

	addedSetupTop: {
		marginTop: 20,
		marginLeft: 40,
		justifyContent: "flex-start"
	},
	addedSetupDown: {
		marginLeft: 40,
		justifyContent: "flex-start"
	},

	phoneView: {
		flexDirection: "row",
		height: 60,
		width: "100%",
		marginTop: 30,
		marginLeft: 55,

		alignItems: "center"
	},
	icView: {
		flexDirection: "row",
		height: 60,
		width: "100%",
		marginTop: 10,
		marginLeft: 55,

		alignItems: "center"
	},

	footerView: {
		width: "90%",
		height: 90,
		justifyContent: "flex-end",
		alignItems: "flex-end",
		marginLeft: 55,
		marginRight: 55,
		marginBottom: 1,
		bottom: 0,
		position: "absolute",
		flexDirection: "column"
	}
});
