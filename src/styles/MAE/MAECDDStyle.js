/* eslint-disable react-native/no-color-literals */
import { StyleSheet, Dimensions } from "react-native";

const screenWidth = Dimensions.get("window").width;
const screenHeight = Dimensions.get("window").height;

export default StyleSheet.create({
	bigHeader: {
		color: "#000000",
		fontFamily: "montserrat",
		fontSize: 20,
		lineHeight: 28,
		fontStyle: "normal",
		fontWeight: "300",
		letterSpacing: 0,
		marginTop: 22,
		marginBottom: 20,
		width: "100%"
	},

	inputViewContainer: {
		width: "100%",
		height: 95
	},

	BottomButtonView: {
		width: 70,
		height: 70,
		justifyContent: "center",
		alignItems: "center",
		bottom: 10,
		right: 10,
		position: "absolute",
		flexDirection: "row"
	},

	labelCls: {
		color: "#000000",
		marginTop: 20,
		width: "100%",
		fontFamily: "montserrat",
		fontSize: 17,
		fontWeight: "600",
		fontStyle: "normal",
		lineHeight: 23,
		letterSpacing: 0
	},
	formView: {
		flexDirection: "row",
		width: "100%",
		height: 83
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
		elevation: 5,
		borderStyle: "solid",
		borderWidth: 1,
		borderColor: "#f3f3f3"
	},
	touchableView: {
		marginLeft: "6%",
		width: "100%",
		height: "100%",
		flexDirection: "row",
		alignItems: "center"
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
		marginTop: -5,
		width: "75%"
	},
	dropdownoneicon: {
		width: 15,
		height: 8,
		marginLeft: "88%",
		marginTop: -15
	},
	detailText: {
		color: "#000000",
		fontFamily: "montserrat",
		fontSize: 20,
		fontStyle: "normal",
		fontWeight: "300",
		letterSpacing: 0,
		lineHeight: 28,
		width: "80%",
		marginLeft: "10%",
		height:'2%',
		height: "15%",
		// backgroundColor:'red'
	},
	questionsInputViewContainer: {
		height: 55,
		width: "100%", //(screenHight * 20) / 100,
		marginTop: -10
	},
	blurContainer:{
		width: "100%",
		flex: 1,
		alignItems: "center",
		position: "absolute",
		justifyContent: "center",
		top: 0,
		bottom: 0,
		left: 0,
		right: 0,
		backgroundColor: "rgba(0, 0, 0, 0.88)"
	},
});
