/* eslint-disable react-native/no-color-literals */
/* eslint-disable react-native/sort-styles */
import { StyleSheet, Dimensions, Platform } from "react-native";
const screenWidth = Dimensions.get("window").width;
const screenHeight = Dimensions.get("window").height;

export default StyleSheet.create({
	actionContainer: {
		flexDirection: "row",
		height: 200,
		marginTop: 61
	},
	actionItem: {
		backgroundColor: "#fff",
		borderRadius: 15,
		flexDirection: "row",
		flexDirection: "column",
		height: 200,
		marginLeft: 10,
		marginRight: 3,
		width: 138
	},
	actionItemFirst: {
		backgroundColor: "#fff",
		borderRadius: 15,
		flexDirection: "row",
		flexDirection: "column",
		height: 200,
		marginLeft: 50,
		marginRight: 3,
		width: 138
	},
	actionItemImage: {
		height: 77,
		marginLeft: 16,
		marginTop: 51,
		width: 77
	},
	actionItemLast: {
		backgroundColor: "#fff",
		borderRadius: 15,
		flexDirection: "row",
		flexDirection: "column",
		height: 200,
		marginLeft: 8,
		marginRight: 50,
		width: 138
	},
	actionItemTitle: {
		color: "#000000",
		fontSize: 17,
		fontWeight: "bold",
		marginLeft: 16,
		marginTop: 18
	},
	balanceLabel: {
		alignItems: "center",
		color: "#000000",
		fontSize: 13,
		fontWeight: "400"
	},
	block: {
		backgroundColor: "#ffde00",
		borderTopLeftRadius: 10,
		borderTopRightRadius: 10,
		height: 90,
		marginTop: 11,
		width: "90%"
	},
	cardContainer: {
		flexDirection: "row",
		justifyContent: "center"
	},
	cardImageContainer: {
		alignItems: "flex-start",
		borderRadius: 10,
		flexDirection: "column",
		height: 220,
		justifyContent: "space-between",
		width: 350
	},
	cardInnerContainer: {
		alignItems: "center",
		borderRadius: 10,
		flexDirection: "row",
		justifyContent: "center"
	},
	container: { alignItems: "center", justifyContent: "center", width: "100%" },
	description: {
		alignItems: "center",
		color: "#000000",
		fontSize: 17,
		fontWeight: "100",
		fontWeight: "400"
	},
	descriptionContainer: {
		alignItems: "flex-start",
		flex: 1,
		marginLeft: 40,
		marginTop: 5
	},
	image: {
		borderTopLeftRadius: 10,
		borderTopRightRadius: 10,
		height: 90,
		width: "100%"
	},
	imagebackground: {
		borderRadius: 8,
		borderStyle: "solid",
		height: "100%",
		overflow: "hidden",
		width: "100%",
		alignItems: "center",
		justifyContent: "center"
	},
	line: {
		borderColor: "#f8f5f3",
		borderWidth: 0.5,
		width: "100%"
	},

	upgradeWalletView: {
		height: (screenHeight * 15) / 100,
		width: screenWidth,
		marginLeft: (screenWidth * 10) / 100
	},
	upgradeView: {
		height: "100%",
		width: (screenWidth * 80) / 100
	},
	bannerSeperator: {
		height: "100%",
		width: 20
	},

	stepupForMaeCard: {
		height: 80,
		marginLeft: "47%",
		marginRight: "10%",
		fontFamily: "montserrat",
		fontSize: 12,
		fontWeight: "600",
		fontStyle: "normal",
		lineHeight: 16,
		letterSpacing: 0,
		color: "#ffffff"
	},

	applyForMaeCard: {
		//height: 64,
		marginLeft: "28%",
		marginRight: "10%",
		fontFamily: "montserrat",
		fontSize: 12,
		fontWeight: "600",
		fontStyle: "normal",
		lineHeight: 16,
		letterSpacing: 0,
		color: "#ffffff"
	},

	maeupgradewallet: {
		borderRadius: 8,
		borderStyle: "solid",
		flexDirection: "row",
		height: (screenHeight * 15) / 100,
		width: "100%"
	},
	medalImage: {
		height: 48,
		marginLeft: "20%",
		marginTop: "15%",
		width: 48
	},

	medalImageView: {
		flexDirection: "column",
		width: "25%"
	},
	overlay: {
		backgroundColor: "rgba(0,0,0,0.5)",
		borderTopLeftRadius: 10,
		borderTopRightRadius: 10,
		flex: 1
	},

	title: {
		alignItems: "flex-start",
		color: "#000000",
		fontSize: 13,
		fontWeight: "700",
		fontWeight: "bold"
	},

	titleContainer: {
		flex: 1,
		marginLeft: 40,
		marginTop: 30
	},

	transHistContainer: {
		alignContent: "center",
		alignItems: "center",
		flex: 1,
		justifyContent: "center",
		marginTop: 29,
		paddingBottom: 20
	},
	txtContainer: {
		flex: 1,
		flexDirection: "row",
		height: 40,
		alignItems: "flex-start",
		marginLeft: 40
	},
	upgradewallet: {
		flexDirection: "column",
		height: "100%",
		width: "65%"
	},
	upgradewalletarrow: {
		flex: 1,
		flexDirection: "column"
		//backgroundColor: "red"
	},
	upgradewalletdetails: {
		color: "#000000",
		flexDirection: "row",
		fontFamily: "Montserrat",
		fontSize: 12,
		fontStyle: "normal",
		fontWeight: "normal",
		height: "80%",
		letterSpacing: 0,
		lineHeight: 18,
		marginTop: "2%",
		width: "100%"
	},

	upgradewallettext: {
		color: "#000000",
		flexDirection: "row",
		fontFamily: "montserrat",
		fontSize: 12,
		fontStyle: "normal",
		fontWeight: "600",
		height: "20%",
		letterSpacing: 0,
		lineHeight: 18,
		marginTop: "5%",
		width: "100%"
	},
	value: { color: "#000000", fontSize: 13, fontWeight: "bold" },
	valueContainer: { alignItems: "flex-end", flex: 1, marginRight: 30 },
	walletarrow: {
		height: 8,
		marginLeft: "10%",
		top: "50%",
		width: 15
	}
});
