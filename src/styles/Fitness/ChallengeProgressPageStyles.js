import { StyleSheet } from "react-native";
import { Dimensions, Image } from "react-native";
export const { width, height } = Dimensions.get("window");

export default StyleSheet.create({
	mainView: {
		flex: 1,
		backgroundColor: "white"
	},
	stepsView: {
		marginTop: (height * 78) / 667,
		height: (height * 43) / 667,
		alignItems: "center",
		justifyContent: "center"
		// backgroundColor:'red'
	},
	stepsCount: {
		fontFamily: "Montserrat-SemiBold",
		// fontWeight:'600',
		fontSize: 35,
		color: "rgb(74,144,226)"
	},
	stepsLabelView: {
		height: (height * 19) / 667,
		alignItems: "center",
		justifyContent: "center"
	},
	stepsLabel: {
		fontSize: 13,
		fontFamily: "Montserrat-Regular",
		// fontWeight:'400',
		letterSpacing: 0.2,
		lineHeight: 19,
		color: "#000000"
	},
	challengeTimeLabel: {
		fontSize: 13,
		fontFamily: "Montserrat-Regular",
		// fontWeight:'400',
		letterSpacing: 0.2,
		lineHeight: 19,
        color: "rgb(143,143,143)",
	},
	syncSourceView: {
		paddingTop: (height * 15) / 667,
		height: (height * 18) / 667,
		alignItems: "center",
        justifyContent: "center",

	},
	syncSourceText: {
		fontSize: 11,
		fontFamily: "Montserrat-Regular",
		// fontWeight:'400',
		letterSpacing: 0,
		lineHeight: 18,
        color: "rgb(143,143,143)",
        height: (height * 18) / 667,



	},
	caldistView: {
		marginTop: (height * 20) / 667,
		height: (height * 41) / 667,
		flexDirection: "row"
		// backgroundColor:'red',
	},
	calView: {
		marginLeft: (width * 90) / 375,
		width: (width * 75) / 375,
		// backgroundColor:'yellow',
		alignItems: "center",
		justifyContent: "center"
	},
	distView: {
		marginLeft: (width * 45) / 375,
		width: (width * 90) / 375,
		// backgroundColor:'green',
		alignItems: "center",
		justifyContent: "center"
	},
	calTextLabel: {
		alignItems: "center",
		justifyContent: "center",
		height: (height * 20) / 667
	},
	calLabelView: {
		paddingTop: (height * 5) / 667,
		alignItems: "center",
		justifyContent: "center",
		height: (height * 16) / 667
	},
	caldistValue: {
		fontSize: 17,
		fontFamily: "Montserrat-Regular",
		// fontWeight:'400',
		letterSpacing: 0,
		color: "rgb(74,144,226)"
	},
	caldistValue: {
		fontSize: 17,
		fontFamily: "Montserrat-SemiBold",
		// fontWeight:'600',
		letterSpacing: 0,
		color: "rgb(74,144,226)"
	},
	caldistLabel: {
		fontSize: 13,
		fontFamily: "Montserrat-Regular",
		// fontWeight:'400',
		letterSpacing: 0,
		lineHeight: 16,
		color: "#000000"
	},
	chartView: {
		marginTop: (height * 20) / 667,
		marginLeft: (width * 5) / 375,
		height: (height * 120) / 667,
		width: width,
		alignItems: "center",
		justifyContent: "center",
	},
	progressBarView: {
		backgroundColor: "transparent",
		alignItems: "center",
		marginTop: (height * 30) / 667
	},
	chartTitleView: {
		backgroundColor: "transparent",
		alignItems: "center",
		justifyContent: "center",
		marginTop: (height * 20) / 667
	},
	chartTitleText: {
		fontSize: 13,
		fontFamily: "Montserrat-Regular",
		letterSpacing: 0,
		lineHeight: 16,
		color: "#000000"
	}
});
