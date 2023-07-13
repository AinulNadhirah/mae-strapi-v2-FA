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

	nameView: {
		flex: 1,
		marginTop: "3%",
		backgroundColor: "#f8f8f8",
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
		// marginLeft: "10%",
		height: (screenHeight * 5) / 100,
		width: "100%"
	},

	snapText: {
		color: "#000000",
		fontFamily: "montserrat",
		fontSize: 20,
		lineHeight: 30,
		fontStyle: "normal",
		fontWeight: "300",
		// height: "15%",
		letterSpacing: 0,
		// marginLeft: "10%",
		marginTop: (screenHeight * 1) / 100,
		width: "100%"
	},
	subTextGrayCls: {
		marginLeft: "10%",
		marginBottom: "6%",
		width: "80%",
		fontFamily: "montserrat",
		fontSize: 14,
		fontWeight: "normal",
		fontStyle: "normal",
		lineHeight: 18,
		letterSpacing: 0,
		color: "#7b7b7b"
	},
	textInputViewCls: {
		// marginLeft: "10%",
		width: "100%"
	},
	inputStyle: {
		borderRadius: 1,
		color: "black",
		fontSize: 20,
		fontWeight: "normal",
		fontFamily: "montserrat",
		width: "100%"
	},

	RightImageView: {
		bottom: 0,
		flexDirection: "row",
		height: 70,
		marginLeft: "80%",
		position: "absolute",
		width: "10%"
	},

	defaultProfileImgViewCls: {
		marginTop: (screenHeight * 2) / 100,
		height: 70,
		width: 80,
		marginLeft: -15,
		// marginLeft: "6%",
		overflow: "hidden"
	},
	defaultProfileImgCls: {
		height: "100%",
		width: "100%"
	},
	profileImgViewCls: {
		marginTop: (screenHeight * 2) / 100,
		// backgroundColor: "yellow",
		height: 60,
		width: 60,
		// marginLeft: "8%",
		borderColor: "#ffffff",
		borderRadius: 30,
		borderStyle: "solid",
		borderWidth: 2,
		overflow: "hidden"
	},
	profileImgCls: {
		height: "100%",
		width: "100%",
		borderRadius: 30
	},

	hyperlinkViewCls: {
		width: "100%",
		marginTop: (screenHeight * 5) / 100,
		height: (screenHeight * 10) / 100
	},

	hyperlinkCls: {
		paddingBottom: 10,
		marginLeft: "10%",
		width: "80%",
		fontWeight: "100",
		// height: 25,
		fontSize: 14,
		textDecorationLine: "underline",
		fontFamily: "montserrat"
	},

	secImgPhraseTopBlockCls: {
		// marginBottom: (screenHeight * 3) / 100,
		marginTop: (screenHeight * 3) / 100,
		width: "100%",
		alignItems: "center"
	},
	secImgViewCls: {
		height: 80,
		width: 80,
		borderColor: "#ffffff",
		borderRadius: 40,
		borderStyle: "solid",
		borderWidth: 2,
		overflow: "hidden"
	},
	secPhraseCls: {
		marginTop: (screenHeight * 1) / 100,
		color: "#000000",
		fontFamily: "montserrat",
		fontSize: 18,
		lineHeight: 23,
		fontStyle: "normal",
		fontWeight: "normal",
		letterSpacing: 0
		// marginLeft: "10%",
		// marginRight: "10%"
	},

	buttonsView: {
		marginTop: 40,
		marginLeft: -20,
		width: "100%"
		// height: 200
	},

	scrollViewCls: {
		height: "100%",
		width: "100%"
	},

	maeIconImgViewCls: {
		height: 80,
		width: 80,
		borderColor: "#ffffff",
		borderRadius: 40,
		borderStyle: "solid",
		borderWidth: 2,
		overflow: "hidden",
		marginTop: (screenHeight * 3) / 100
	},
	accNumCls: {
		marginTop: (screenHeight * 5) / 100,
		fontFamily: "montserrat",
		fontSize: 20,
		fontWeight: "300",
		fontStyle: "normal",
		lineHeight: 30,
		letterSpacing: 0,
		color: "#000000"
	},

	bankLabelCls: {
		marginTop: (screenHeight * 3) / 100,
		fontFamily: "montserrat",
		fontSize: 16,
		fontWeight: "600",
		fontStyle: "normal",
		lineHeight: 20,
		letterSpacing: 0,
		color: "#000000"
	},
	etbOnboardSuccTopBlockCls: {
		marginBottom: (screenHeight * 3) / 100,
		marginTop: (screenHeight * 3) / 100,
		width: "100%",
		flex: 1,
		alignItems: "center"
	},
	etbOnboardSuccBottomBlockCls: {
		width: "100%",
		bottom: 0,
		position: "relative"
	},
	inviteCodeBottomBlockCls: {
		marginLeft: -15,
		width: "100%",
		bottom: 0,
		position: "relative"
	},

	centerAlignContent: {
		width: "100%",
		alignItems: "center"
	},

	inviteCodeBlockCls: {
		height: "100%",
		width: "100%",
		alignItems: "center",
		justifyContent: "center"
	},

	inviteCodeTouchBlockCls: {
		marginBottom: (screenHeight * 2) / 100,
		marginTop: (screenHeight * 2) / 100,
		marginLeft: "15%",
		width: "70%",
		height: 100,
		borderRadius: 16,
		backgroundColor: "#ffffff",
		shadowColor: "rgba(0, 0, 0, 0.1)",
		shadowOffset: {
			width: 0,
			height: 4
		},
		shadowRadius: 8,
		shadowOpacity: 1,
		elevation: 3
	},

	copyClipboardLogoViewCls: {
		height: "100%",
		width: 25,
		overflow: "hidden",
		marginLeft: 10
	},
	inviteCodeLogoViewCls: {
		height: 90,
		width: 90,
		overflow: "hidden",
		marginTop: (screenHeight * 3) / 100
	},
	inviteCodeLogoCls: {
		height: "100%",
		width: "100%"
	},

	inviteCodeLabelCls: {
		fontFamily: "montserrat",
		fontSize: 16,
		fontWeight: "600",
		fontStyle: "normal",
		lineHeight: 20,
		letterSpacing: 0,
		color: "#000000"
	},
	inviteCodeValueBlockCls: {
		marginTop: 10,
		flexDirection: "row",
		justifyContent: "center"
	},
	inviteCodeValueCls: {
		fontFamily: "montserrat",
		fontSize: 20,
		fontWeight: "300",
		fontStyle: "normal",
		lineHeight: 30,
		letterSpacing: 0,
		color: "#000000"
	},
	inviteCodeContentDescCls: {
		marginTop: (screenHeight * 2) / 100,
		fontFamily: "montserrat",
		fontSize: 13,
		fontWeight: "normal",
		fontStyle: "normal",
		lineHeight: 20,
		letterSpacing: 0,
		color: "#000000"
	},
	inviteCodeContentMargin: {
		marginTop: (screenHeight * 2) / 100
	},
	inviteCodeContentBlockCls: {
		// marginLeft: "10%",
		marginBottom: (screenHeight * 2) / 100,
		marginTop: (screenHeight * 2) / 100,
		width: "100%"
	}
});
