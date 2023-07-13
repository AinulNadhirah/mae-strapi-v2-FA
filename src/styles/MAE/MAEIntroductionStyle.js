/* eslint-disable react-native/no-color-literals */
import { StyleSheet, Dimensions } from "react-native";

const screenWidth = Dimensions.get("window").width;
const screenHeight = Dimensions.get("window").height;

export default StyleSheet.create({
	RightImageView: {
		bottom: 0,
		marginLeft: "80%",
		right: "10%",
		position: "absolute",
		width: "10%"
	},
	nameView: {
		backgroundColor: "#f8f8f8",
		flex: 1,
		height: "100%",
		marginTop: "2%",
		width: "100%"
	},
	FirstImageView: {
		flex: 1,
		marginLeft: "8%",
		marginTop: "3%"
	},
	TabungImage: {
		flex: 1,
		width: (screenWidth * 85) / 100
	},
	inputStyle: {
		borderRadius: 1,
		color: "black",
		fontFamily: "montserrat",
		fontSize: 20,
		fontWeight: "normal",
		width: "100%"
	},
	subtextCls: {
		color: "#000000",
		fontFamily: "montserrat",
		fontSize: 14,
		fontStyle: "normal",
		fontWeight: "300",
		letterSpacing: -0.43,
		lineHeight: 20,
		marginLeft: "14%",
		marginTop: "3%",
		width: "72%"
	},
	DetailTextLabel: {
		color: "#000000",
		fontFamily: "montserrat",
		fontSize: 23,
		fontStyle: "normal",
		fontWeight: "300",
		letterSpacing: -0.43,
		lineHeight: 30,
		marginLeft: "14%",
		marginTop: "3%",
		width: "72%"
	},
	inputViewContainer: {
		height: 95,
		width: "100%"
	},
	inputTextContainer: {
		height: 85,
		width: "100%",
		marginTop: 30
	},

	inputTextStyle: {
		borderRadius: 1,
		color: "black",
		flex: 1,
		fontFamily: "montserrat",
		fontSize: 20,
		fontWeight: "normal",
		width: "100%"
	},
	labelCls: {
		color: "#000000",
		fontFamily: "montserrat",
		fontSize: 17,
		fontStyle: "normal",
		fontWeight: "600",
		letterSpacing: 0,
		lineHeight: 23,
		marginTop: "5%",
		width: "100%"
	},
	dateinputContainer: {
		height: 95,
		width: "100%"
	},
	inputDateContainer: {
		height: "100%",
		width: "100%"
	},

	mykadPassportContCls: {
		marginBottom: 30,
		width: "100%"
	},
	dobcontainer: {
		position: "absolute"
	},

	IDTypeViewCls: {
		width: "100%",
		marginTop: 20,
		flexDirection: "row",
		justifyContent: "flex-start"
	},

	BottomButtonView: {
		alignItems: "center",
		bottom: 0,
		flexDirection: "row",
		height: 70,
		justifyContent: "center",
		marginBottom: "30%",
		marginLeft: "80%",
		position: "absolute",
		width: "90%"
	},

	formView: {
		flexDirection: "row",
		height: 83,
		width: "100%"
	},
	dropdownViewone: {
		marginTop: "3%",
		width: "100%",
		height: 55,
		borderRadius: 22.5,
		backgroundColor: "#ffffff",
		shadowColor: "rgba(0, 0, 0, 0.1)",
		shadowOffset: {
			width: 0,
			height: 4
		},
		shadowRadius: 5,
		shadowOpacity: 1,
		borderStyle: "solid",
		borderWidth: 1,
		borderColor: "#f3f3f3"
	},
	touchableView: {
		alignItems: "center",
		flexDirection: "row",
		height: "100%",
		marginLeft: "6%",
		width: "100%"
	},
	dropdownoneLabel: {
		color: "#000000",
		fontFamily: "montserrat",
		fontSize: 15,
		fontStyle: "normal",
		fontWeight: "600",
		height: 19,
		letterSpacing: 0,
		lineHeight: 19,
		marginLeft: "5%",
		marginTop: "-2%"
	},
	dropdownoneicon: {
		height: 8,
		marginLeft: "88%",
		marginTop: "-10%",
		width: 15
	},
	containerView: {
		flex: 1,
		width: "100%"
	},
	placeholderStyle: {
		borderRadius: 1,
		color: "black",
		opacity: 0.4,
		fontSize: 20,
		fontWeight: "normal",
		fontFamily: "montserrat",
		width: "100%",
		marginTop: 20
	},
	labelCls: {
		color: "#000000",
		marginTop: "7%",
		width: "100%",
		fontFamily: "montserrat",
		fontSize: 17,
		fontWeight: "600",
		fontStyle: "normal",
		lineHeight: 23,
		letterSpacing: 0
	},
	snapText: {
		color: "#000000",
		fontFamily: "montserrat",
		fontSize: 20,
		fontStyle: "normal",
		fontWeight: "300",
		letterSpacing: 0,
		lineHeight: 30,
		marginBottom: (screenHeight * 3) / 100,
		marginTop: (screenHeight * 3) / 100,
		width: "100%"
	},
	subTextGrayCls: {
		color: "#7b7b7b",
		fontFamily: "montserrat",
		fontSize: 14,
		fontStyle: "normal",
		fontWeight: "normal",
		letterSpacing: 0,
		lineHeight: 18,
		marginBottom: (screenHeight * 4) / 100,
		width: "100%"
	},
	textInputViewCls: {
		width: "100%"
	},

	securityPhraseImgViewCls: {
		borderColor: "#ffffff",
		borderRadius: 40,
		borderStyle: "solid",
		borderWidth: 2,
		height: 60,
		// marginLeft: "8%",
		overflow: "hidden",
		width: 60
	},
	securityPhraseImgCls: {
		borderRadius: 40,
		height: "100%",
		width: "100%"
	},

	datePickerCancelViewCls: {
		alignItems: "center",
		borderRadius: 20,
		justifyContent: "center",
		margin: 10,
		paddingBottom: 10,
		paddingLeft: 20,
		paddingRight: 20,
		paddingTop: 10
	},
	datePickerCancelTextCls: {
		color: "#2892e9",
		fontFamily: "montserrat",
		fontSize: 15,
		fontStyle: "normal",
		fontWeight: "600",
		letterSpacing: 0,
		textAlign: "center"
	},
	datePickerDoneViewCls: {
		alignItems: "center",
		backgroundColor: "#ffde00",
		borderRadius: 20,
		justifyContent: "center",
		margin: 10,
		paddingBottom: 10,
		paddingLeft: "8%",
		paddingRight: "8%",
		paddingTop: 10
	},
	datePickerDoneTextCls: {
		color: "#000000",
		fontFamily: "montserrat",
		fontSize: 16,
		fontStyle: "normal",
		fontWeight: "600",
		letterSpacing: 0,
		textAlign: "center"
	},
	datePickerBtnViewCls: {
		backgroundColor: "#ffffff",
		flexDirection: "row",
		width: "100%"
	},
	dateComponentViewCls: {
		alignItems: "flex-end",
		height: "100%",
		justifyContent: "flex-end",
		width: "100%"
	},

	bigHeader: {
		color: "#000000",
		fontFamily: "montserrat",
		fontSize: 20,
		lineHeight: 30,
		fontStyle: "normal",
		fontWeight: "300",
		// height: "15%",
		letterSpacing: 0,
		// marginLeft: "14%",
		marginTop: 32,
		marginBottom: 48,
		width: "100%"
	},

	// ***************** MAE TnC Start *****************
	maeTnCRadioBtnBlockCls: {
		alignItems: "flex-start",
		flexDirection: "row",
		flexWrap: "wrap",
		justifyContent: "flex-start",
		marginTop: 16,
		width: "100%"
	},
	maeTnCRadioBtnLblBlockCls: {
		flex: 1,
		flexDirection: "row",
		alignItems: "flex-start",
		flexWrap: "wrap",
		flexShrink: 1,
		paddingBottom: 10,
		marginLeft: 10,
		marginRight: 20
	},
	maeTnCLblCls: {
		color: "#000000",
		fontFamily: "montserrat",
		fontSize: 15,
		fontStyle: "normal",
		fontWeight: "normal",
		letterSpacing: 0,
		lineHeight: 20
	},
	termsText: {
		fontWeight: "100",
		height: 25,
		fontSize: 14,
		textDecorationLine: "underline",
		fontFamily: "montserrat"
	},
	fatcaCitizen: {
		color: "#000000",
		fontFamily: "montserrat",
		fontSize: 15,
		fontStyle: "normal",
		fontWeight: "normal",
		letterSpacing: 0,
		lineHeight: 20,
		marginTop: 20
	},
	citizenanswertype: {
		marginTop: 20
	},

	maeTnCRadioLabelCls: {
		color: "#000000",
		fontFamily: "montserrat",
		fontSize: 15,
		fontStyle: "normal",
		fontWeight: "normal",
		letterSpacing: 0,
		lineHeight: 20,
		marginLeft: 10,
		marginRight: 20
	},

	maeTnCGraySeparator: {
		borderColor: "#cfcfcf",
		borderTopWidth: 1,
		height: 1,
		marginBottom: 20,
		marginTop: 30,
		width: "100%"
	}
	// ***************** MAE TnC End *****************
});