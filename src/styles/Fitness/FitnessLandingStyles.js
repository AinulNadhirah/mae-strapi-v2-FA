/* eslint-disable prettier/prettier */
/* eslint-disable react-native/no-color-literals */
import { StyleSheet } from "react-native";
import { Dimensions, Image ,Platform} from "react-native";
export const { width, height } = Dimensions.get("window");

const screenWidth = Dimensions.get("window").width;
const screenHight = Dimensions.get("window").height;

export default StyleSheet.create({
	backIconImageView: {
		position: "absolute",
		left: (width * 24) / 375,
		top: (height * 27) / 667
	},
	backView: {
		resizeMode: "contain",
		width: (width * 45) / 375,
		height: (height * 45) / 667
	},
	refreshIconImageView: {
		position: "absolute",
		left: (width * 317) / 375,
		top: (height * 40) / 667
	},
	refreshView: {
		resizeMode: "contain",
		width: (width * 45) / 375,
		height: (height * 45) / 667
	},
	crossIconImageView: {
		position: "absolute",
		right: (width * 24) / 375,
		top: (height * 27) / 667,

	
	},
	crossView: {
		resizeMode: "contain",
		width: (width * 45) / 375,
		height: (height * 45) / 667
	},
	MyFitnessText: {
		fontFamily: "Montserrat-SemiBold",
		fontSize: 19,
		lineHeight: 23,
		letterSpacing: 0,
		color: "#000000"
	},
	MyFitnessTextView: {
		position: "absolute",
		left: (width * 50) / 375,
		top: (height * 100) / 667,
		width: (width * 205) / 375,
		height: (height * 23) / 667,
		//backgroundColor: 'red',

	},
	bodyView: {
		elevation: 2,
		height: "40%",
		left: (width * 50) / 375,
		position: "absolute",
		right: (width * 50) / 375,
		top: (height * 128) / 667,
		width: (width * 274) / 375,
	},
	bodyText: {
		color: "#000000",
		fontFamily: "Montserrat-Light",
		fontSize: 23,
		letterSpacing: -0.43,
		lineHeight: 33,
		height: (height * 300) / 667
	},
	tickImageView: {
		bottom: (height * 33) / 375,
		height: (height * 60) / 667,
		position: "absolute",
		right: (width * 24) / 375,
		top: (height * 569) / 667,
		width: (width * 60) / 375
	},
	tickImage: {
		resizeMode: "contain",
		width: 60,
		height: 60
	},
	bodyImageView1: {
		position: "absolute",
		left: (width * 62) / 375,
		right: (width * 51) / 375,
		// top: height * 266 / 667
		bottom: 0
	},
	bodyImage1: {
		resizeMode: "contain",
		width: (width * 262) / 375,
		height: (height * 381) / 667
	},
	bodyImageView2: {
		// backgroundColor: "red",
		//bottom: (height * -10) / 667,
		//left: (width * 20) / 375,
		flex: 1,
		marginTop: "80%"
		//position: "absolute",

		// top: height * 284 /667
	},
	bodyImage2: {
		resizeMode: "contain",
		width: (width * 291) / 375,
		height: (height * 370) / 667
	},
	bodyImageView3: {
		position: "absolute",
		right: (width * 42) / 375,
		// top: height * 332 / 667
		bottom: 0
	},
	bodyImage3: {
		resizeMode: "contain",
		width: (width * 339) / 375,
		height: (height * 315) / 667
	},
	ImageView1: {
		position: "absolute",
		left: (width * 35) / 375,
		top: (height * 50) / 667
	},
	Image: {
		resizeMode: "contain",
		width: (width * 80) / 375,
		height: (height * 80) / 667
	},
	appleImage: {
		resizeMode: "contain",
		width: 48,
		height: 48,
		left: 15,
		top:20

	},
	ImageDIL: {
		resizeMode: "contain",
		width: (width * 79) / 375,
		height: (height * 79) / 667
	},
	ImageView2: {
		position: "absolute",
		left: (width * 35) / 375,
		top: (height * 120) / 667
	},
	ImageView3: {
		position: "absolute",
		left: (width * 35) / 375,
		top: (height * 190) / 667
	},
	ImageView4: {
		position: "absolute",
		left: (width * 35) / 375,
		top:Platform.OS != "ios" ? (height * 250) / 667 : (height * 50) / 667,
	},
	ImageView5: {
		position: "absolute",
		left: (width * 35) / 375,
		top:Platform.OS != "ios" ? (height * 250) / 667: (height * 117) / 667,

	},
	TextView1: {
		position: "absolute",
		left: (width * 113) / 375,
		top: (height * 70) / 667,
		right: (width * 176) / 375,
		width: (width * 205) / 375,
		height: (height * 30) / 667
	},
	Text: {
		fontFamily: "Montserrat-SemiBold",
		fontSize: 17,
		lineHeight: 23,
		letterSpacing: 0,
		color: "#000000"
	},
	TextView2: {
		position: "absolute",
		left: (width * 113) / 375,
		top: (height * 140) / 667,
		right: (width * 220) / 375,
		width: (width * 200) / 375,
		height: (height * 23) / 667
	},
	TextView3: {
		position: "absolute",
		left: (width * 113) / 375,
		top: (height * 210) / 667,
		right: (width * 200) / 375,
		width: (width * 200) / 375,
		height: (height * 30) / 667
	},
	TextView4: {
		position: "absolute",
		left: (width * 113) / 375,
		top:Platform.OS != "ios" ? (height * 275) / 667 : (height * 75) / 667,
		right: (width * 277) / 375,
		width: (width * 135) / 375,
		height: (height * 30) / 667
	},
	TextView5: {
		position: "absolute",
		left: (width * 113) / 375,
		top:Platform.OS != "ios" ? (height * 275) / 667 : (height * 140) / 667,
		right: (width * 277) / 375,
		width: (width * 120) / 375,
		height: (height * 30) / 667
	},
	RightImageView: {
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
	fitnessServicesView: {
        // backgroundColor: 'yellow',
		flex: 1,
		marginTop: "45%",

	}
});
