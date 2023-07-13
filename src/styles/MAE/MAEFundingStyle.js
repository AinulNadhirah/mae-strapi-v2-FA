import { StyleSheet, Dimensions } from "react-native";

const screenWidth = Dimensions.get("window").width;
const screenHeight = Dimensions.get("window").height;

export default StyleSheet.create({
	containerBlue: {
		alignItems: "center",
		backgroundColor: "#f8f8f8",
		flex: 1,
		width: "100%"
	},
	inputViewContainer: {
		width: "100%",
		height: 95 //(screenHight * 20) / 100,
	},
	BottomButtonView: {
		width: "90%",
		height: 70,
		justifyContent: "center",
		alignItems: "center",
		marginLeft: "80%",
		marginBottom: "30%",
		bottom: 0,
		position: "absolute",
		flexDirection: "row"
	},

	headerTextCls: {
		color: "#000000",
		fontFamily: "montserrat",
		fontSize: 20,
		lineHeight: 30,
		fontStyle: "normal",
		fontWeight: "300",
		letterSpacing: 0
	},

	smallDescCls: {
		marginTop: 8,
		opacity: 0.5,
		color: "#000000",
		fontFamily: "montserrat",
		fontSize: 12,
		lineHeight: 16,
		fontStyle: "normal",
		fontWeight: "normal",
		letterSpacing: 0
	},

	topUpMainContentBlockCls: {
		flexDirection: "column",
		justifyContent: "center",
		height: "65%"
	},

	topUpAmountBlockCls: {
		// backgroundColor: 'yellow',
		alignItems: "center",
		flexDirection: "row",
		height: 50,
		marginTop: 32,
		width: "100%"
	},
	topUpAmountCls: {
		color: "#000000",
		fontWeight: "normal",
		fontSize: 23,
		fontFamily: "montserrat"
	},

	topUpIntroBulletTextContCls: {
		flexDirection: "row",
		justifyContent: "flex-start",
		marginTop: 12,
		width: "100%"
	},

	topupIntroHeaderCls: {
		marginTop: 24,
		color: "#000000",
		fontFamily: "montserrat",
		fontSize: 14,
		lineHeight: 23,
		fontStyle: "normal",
		fontWeight: "600",
		letterSpacing: 0
	},

	topupIntroDescCls: {
		marginTop: 10,
		marginBottom: 20,
		color: "#000000",
		fontFamily: "montserrat",
		fontSize: 20,
		lineHeight: 30,
		fontStyle: "normal",
		fontWeight: "300",
		letterSpacing: 0
	},
	visitbranch: {
		marginTop: 10,
		marginBottom: 20,
		fontFamily: "montserrat",
		fontSize: 12,
		fontWeight: "normal",
		fontStyle: "normal",
		lineHeight: 18,
		letterSpacing: 0,
		color: "#7b7b7b"
	},

	topupStatusImgBlockCls: {
		width: "100%",
		marginTop: (screenHeight * 15) / 100,
		marginBottom: 17
	},

	topUpStatusBottomBlockCls: {
		marginLeft: 20,
		bottom: 0,
		position: "absolute"
	},

	detailsBlockCls: {
		flexDirection: "row",
		justifyContent: "space-between",
		width: "100%",
		marginTop: 10
	},

	detailKeyCls: {
		opacity: 0.5,
		color: "#000000",
		fontFamily: "montserrat",
		fontSize: 14,
		lineHeight: 19,
		fontStyle: "normal",
		fontWeight: "normal",
		letterSpacing: 0
	},

	detailValueCls: {
		color: "#000000",
		fontFamily: "montserrat",
		fontSize: 14,
		lineHeight: 19,
		fontStyle: "normal",
		fontWeight: "600",
		letterSpacing: 0
	},

	inputStyle: {
		borderRadius: 1,
		color: "black",
		fontSize: 20,
		fontWeight: "normal",
		fontFamily: "montserrat",
		width: "100%",
		flex: 1
	},
	labelCls: {
		color: "#000000",
		marginTop: "5%",
		width: "100%",
		fontFamily: "montserrat",
		fontSize: 17,
		fontWeight: "600",
		fontStyle: "normal",
		lineHeight: 23,
		letterSpacing: 0
	},

	fundingTabContainer: {
		marginTop: (screenHeight * 5) / 667,
		elevation: 0
	},
	indicator: {
		backgroundColor: "#c0e4f2",
		height: 0,
		width: "33%"
	},
	tabbar: {
		backgroundColor: "#f8f8f8",
		elevation: 0,
		height: 50
	},
	tab: {
		height: "100%",
		backgroundColor: "#f8f8f8",
		width: "100%",
		alignItems: "flex-end",
		alignItems: "center"
	},
	tabLabelCls: {
		color: "#7c7c7d",
		fontFamily: "montserrat",
		letterSpacing: 0,
		lineHeight: 23,
		fontSize: 14,
		fontWeight: "normal",
		fontStyle: "normal",
		height: "100%",
		paddingBottom: 3
	},
	selectedTabLabelCls: {
		color: "#000000",
		fontWeight: "600",
		borderBottomWidth: 3,
		borderBottomColor: "#000000",
		borderStyle: "solid"
	},

	addCardLabelCls: {
		fontFamily: "montserrat",
		width: "88%",
		fontSize: 15,
		lineHeight: 23,
		fontWeight: "normal",
		fontStyle: "normal",
		marginLeft: 15,
		color: "#000"
	},
	addCardBlockOuterView: {
		width: "90%",
		height: 80,
		borderRadius: 50,
		marginLeft: 0,
		marginBottom: 10,
		backgroundColor: "#fff",
		flexDirection: "row",
		shadowColor: "rgba(0, 0, 0, 0.07)",
		shadowOffset: {
			width: 0,
			height: 4
		},
		shadowRadius: 8,
		shadowOpacity: 1,
		elevation: 3
	},

	cardListOuterBlockCls: {
		marginLeft: "1%",
		marginRight: "1%",
		width: "98%",
		minWidth: "90%",
		height: 80,
		borderRadius: 50,
		marginBottom: 10,
		backgroundColor: "#fff",
		flexDirection: "row",
		shadowColor: "rgba(0, 0, 0, 0.07)",
		shadowOffset: {
			width: 0,
			height: 4
		},
		shadowRadius: 8,
		shadowOpacity: 1,
		elevation: 3
	},
	cardListLastOuterBlockCls: {
		marginBottom: 100
	},
	cardBrandLogoCls: {
		width: 64,
		height: 64,
		marginLeft: 0,
		marginTop: 0,
		flexDirection: "row",
		justifyContent: "center",
		alignContent: "center",
		alignItems: "center"
	},
	visaCardBrandLogoCls: {
		width: 54,
		height: 30,
		marginLeft: 0,
		marginTop: 0,
		flexDirection: "row",
		justifyContent: "center",
		alignContent: "center",
		alignItems: "center"
	},

	fpxLogoBlockCls: {
		marginBottom: 25,
		marginTop: 25,
		width: "100%",
		alignItems: "center"
	},
	fpxIconImgViewCls: {
		height: 20,
		width: 60,
		overflow: "hidden"
	},
	defaultProfileImgCls: {
		height: "100%",
		width: "100%"
	},
	fpxTextCls: {
		marginTop: 10,
		fontFamily: "montserrat",
		fontSize: 11,
		fontWeight: "bold",
		fontStyle: "normal",
		lineHeight: 16,
		letterSpacing: 0,
		color: "#2477cf"
	},

	casaLiteItemOuterCls: {
		width: "92%",
		height: 90,
		borderRadius: 8,
		backgroundColor: "#ffffff",
		shadowColor: "rgba(0, 0, 0, 0.1)",
		shadowOffset: {
			width: 0,
			height: 5
		},
		shadowRadius: 15,
		shadowOpacity: 1,
		elevation: 3,
		marginBottom: 20,
		alignItems: "center",

		paddingBottom: 12,
		paddingTop: 12,
		paddingLeft: 20,
		paddingRight: 20,

		marginLeft: "4%",
		marginRight: "4%"
	},
	casaLiteItemInnverViewCls: {
		width: "100%",
		height: "100%",
		flexDirection: "row",
		alignItems: "center"
	},
	casaAccTypeCls: {
		fontFamily: "montserrat",
		fontSize: 13,
		fontWeight: "600",
		fontStyle: "normal",
		lineHeight: 19,
		letterSpacing: 0,
		color: "#000000"
	},
	casaAccNumTypeCls: {
		opacity: 0.8,
		fontFamily: "montserrat",
		fontSize: 13,
		fontWeight: "normal",
		fontStyle: "normal",
		lineHeight: 19,
		letterSpacing: 0,
		color: "#000000"
	},
	casaAccBalanceCls: {
		fontFamily: "montserrat",
		fontSize: 13,
		fontWeight: "normal",
		fontStyle: "normal",
		lineHeight: 19,
		letterSpacing: 0,
		color: "#000000"
	}
});
