import { StyleSheet, Dimensions, Platform } from "react-native";
export const IS_IOS = Platform.OS === "ios";
export const { width: viewportWidth, height: viewportHeight } = Dimensions.get("window");
export const { width, height } = Dimensions.get("window");

export default StyleSheet.create({
	content: {
		flex: 1,
		flexDirection: "column",
		// backgroundColor: "#b0ddf2"
		backgroundColor: "transparent"
	},

	mainView: {
		flex: 1,
		backgroundColor: "red"
	},

	ctaActionsView: {
		marginLeft: "7%",
		marginRight: "12%",
		marginTop: "5%",

		width: (width * 307) / 375
		// height: height * 172 / 667
	},

	container: {
		width: "100%",
		height: "100%",
		backgroundColor: "transparent"
	},

	avatardefaultImage: {
		marginTop: "20%",
		//backgroundColor: 'red',
		backgroundColor: "transparent",
		marginLeft: "8%",
		width: "20%",
		height: "10%"
	},
	avatarImage: {
		marginTop: "20%",
		// backgroundColor: 'blue',
		backgroundColor: "transparent",
		marginLeft: "11%",
		width: "20%",
		height: "10%"
	},
	updateView: {
		marginTop: "8%",
		marginLeft: "9%",
		width: 300
	},
	updatebuttonsView: {
		marginLeft: "9%",
		marginTop: "7%",
		width: 300
	},

	syncContactView: {
		marginLeft: "0%",
		marginTop: "1%",
		width: 300
		//backgroundColor:'red'
	},

	textWelcomeBold: {
		marginLeft: "12%",
		marginRight: "12%",
		marginTop: 5,
		marginBottom: 10,
		color: "#000",
		fontSize: 19,
		fontWeight: "600",
		fontStyle: "normal",
		lineHeight: 23,
		letterSpacing: 0,
		fontFamily: "montserrat",
		// color: "#000000"
		color: "white"
	},
	textDescription: {
		marginLeft: "12%",
		marginRight: "12%",
		fontFamily: "montserrat",
		fontSize: 23,
		fontWeight: "300",
		fontStyle: "normal",
		lineHeight: 33,
		letterSpacing: -0.4,
		color: "#ffffff",
		textShadowColor: "rgba(0, 0, 0, 0.39)",
		textShadowOffset: {
			width: 0,
			height: 1
		},
		textShadowRadius: 9,
		width: (width * 307) / 375
	},
	textSubDescription: {
		marginLeft: "12%",
		marginRight: "12%",
		marginTop: "1%",
		fontSize: 15,
		fontWeight: "300",
		fontStyle: "normal",
		lineHeight: 33,
		letterSpacing: 0,
		fontFamily: "montserrat",
		// color: "#000000",
		color: "white",
		width: (width * 307) / 375
		// height: height * 172 / 667
	},

	avatarImageLayout: {
		marginTop: "35%",
		marginLeft: "10%",
		width: "20%",
		height: "10%",
		backgroundColor: "transparent"
	},
	wrapper: {
		flex: 1
	},
	flex: {
		flex: 1
	},
	firstSectionBackGround: {
		resizeMode: "stretch",
		height: viewportHeight - 75
	},
	firstSectionBackGround1: {
		resizeMode: "stretch",
		height: 600,
		backgroundColor: "#b0ddf2"
	},
	firstSectionBackGround2: {
		resizeMode: "stretch",
		height: 300,
		backgroundColor: "#fdd835"
	},
	firstSectionBackGroundColor: {
		backgroundColor: "#b0ddf2"
	},
	firstSectionLayout: {
		flex: 1,
		marginTop: "3%",
		alignSelf: "stretch",
		backgroundColor: "transparent"
		// marginLeft: '8%'
	},
	avatarLayout: {
		marginLeft: 25,
		marginTop: 25
	},

	avatarImageLayout: {
		marginLeft: 8,
		marginTop: 100
	},

	avatarDynamic: {
		marginLeft: 20
	},
	textWelcome: {
		marginLeft: 25,
		marginTop: 10,
		marginBottom: 10
	},
	textDescMargin: {
		marginLeft: 25,
		marginLeft: 25,
		marginTop: 0
	},

	textDesc: {
		marginLeft: 25,
		marginLeft: 25,
		marginTop: 45
	},

	devIdsText: {
		marginLeft: 25,
		marginTop: 5,
		marginBottom: 10,
		color: "#000",
		fontWeight: "100",
		alignSelf: "flex-end",
		fontStyle: "normal",
		lineHeight: 23,
		letterSpacing: 0
	},

	goalCarouselback1: {
		resizeMode: "stretch",
		height: 90,
		backgroundColor: "#b0ddf2"
	},
	goalCarouselback2: {
		resizeMode: "stretch",
		height: 150,
		backgroundColor: "#fdd835"
	},
	goalCarousel: {
		top: 10,
		height: 160,
		position: "absolute"
	},
	pointsMainContainer: {
		flex: 1,
		alignSelf: "stretch",
		height: 340,
		width: "100%",
		flexGrow: 1,
		flexDirection: "column",
		backgroundColor: "#fff",
		marginTop: Platform.OS === "ios" ? 35 : 0
	},
	pointsMainContainer1: {
		flex: 1,
		alignSelf: "stretch",
		height: 340,
		width: "100%",
		flexGrow: 1,
		flexDirection: "column",
		backgroundColor: "#b0ddf2",
		marginTop: Platform.OS === "ios" ? 35 : 0
	},
	pointsContainer: {
		flex: 1
	},
	pointsBox: {
		position: "absolute",
		marginTop: 60,
		flex: 1,
		width: "100%",
		alignSelf: "stretch",
		backgroundColor: "transparent"
	},
	pointsBox1: {
		flexDirection: "column",
		backgroundColor: "transparent"
	},

	createGoal: {
		alignItems: "center",
		backgroundColor: "#DDDDDD",
		marginTop: 20,
		marginLeft: 20,
		height: 30,
		backgroundColor: "transparent"
	},

	createGoalText: {
		color: "#000",
		fontSize: 22,
		fontWeight: "600",
		fontStyle: "normal",
		lineHeight: 23,
		letterSpacing: 0
		// marginLeft: 10,
	},
	pointsBox2: {
		flexDirection: "column",
		backgroundColor: "transparent"
	},
	pointsTitleBox: {
		alignSelf: "stretch",
		position: "absolute",
		backgroundColor: "transparent",
		height: 100,
		width: "100%",
		flexDirection: "row",
		marginLeft: 50,
		// marginTop: Platform.OS === "ios" ? 35 :0,
		justifyContent: "flex-start",
		alignItems: "center"
	},

	pointsWrapper: {
		height: 100,
		width: "100%",
		flexDirection: "column",
		backgroundColor: "transparent"
	},
	pointsTitleBox1: {
		flex: 1.2
	},
	pointsInnerContainer: {
		position: "absolute",
		backgroundColor: "transparent",
		height: 100,
		width: "100%",
		flexDirection: "column"
	},

	pointsInnerContainer1: {
		flex: 1,
		backgroundColor: "#fff"
	},

	pointsInnerContainer2: {
		flex: 1,
		backgroundColor: "#b0ddf2"
	},

	pointsInnerContainer3: {
		flex: 1,
		marginTop: -2,
		backgroundColor: "#b0ddf2"
	},

	pointsInnerContainer4: {
		flex: 1
		//backgroundColor: "#fff"
	},
	pointsTitleBox2: {
		flex: 0.8
	},

	mayaFloatingIcon: {
		height: 120,
		width: 120
	},
	textBlack: {
		color: "#000",
		fontSize: 30,
		fontFamily: "montserrat",
		left: 25,
		fontFamily: "montserrat",
		fontWeight: "normal"
	},

	textBlack1: {
		color: "#000",
		fontSize: 17,
		fontFamily: "montserrat",
		marginLeft: 45,
		fontWeight: "normal"
	},
	textReminderDesc2: {
		color: "#000",
		marginLeft: 50,
		marginTop: 69,
		marginBottom: 0,
		fontSize: 25,
		fontFamily: "montserrat",
		fontWeight: "bold",
		fontStyle: "normal",
		lineHeight: 23,
		letterSpacing: 0
	},
	textReminderDesc: {
		marginLeft: 25,
		marginTop: 10,
		marginBottom: 0
	},
	textReminderDesc5: {
		color: "#000",
		fontSize: 30,
		fontFamily: "montserrat",
		marginLeft: 50,
		marginTop: 10,
		marginBottom: 0,
		fontWeight: "300",
		fontStyle: "normal",
		lineHeight: 33,
		letterSpacing: -0.4
	},

	textReminderDesc6: {
		color: "#000",
		fontSize: 30,
		fontFamily: "montserrat",
		marginLeft: 50,
		marginTop: 35,
		marginBottom: 0,
		fontWeight: "300",
		fontStyle: "normal",
		lineHeight: 33,
		letterSpacing: -0.4
	},
	mpIcon: {
		width: 40,
		height: 40,
		marginTop: 40,
		marginStart: 35
	},
	textReminderDesc1: {
		marginLeft: 25,
		marginTop: 1
	},
	textReminder: {
		color: "#000",
		fontSize: 22,
		fontFamily: "montserrat",
		left: 30,
		marginLeft: 25
	},
	budgetingMainContainer: {
		backgroundColor: "#fdd835",
		flex: 1,
		top: 25,
		alignSelf: "stretch",
		height: 400,
		width: "100%",
		flexGrow: 1,
		flexDirection: "column"
	},
	budgetingContainer: {
		flex: 1,
		flexGrow: 1,
		backgroundColor: "red"
	},
	budgetingButton: {
		marginTop: 40
	},
	text: {
		color: "#fff",
		fontFamily: "montserrat",
		fontSize: 30
	},
	textB: {
		color: "#000"
	},
	roundButtonStyle: {
		borderRadius: 15,
		borderWidth: 1,
		borderColor: "#fdd835"
	},
	button: {
		backgroundColor: "blue",
		marginBottom: 10
	},
	avatar: {
		width: 65,
		height: 65,
		marginBottom: 20,
		borderRadius: 65 / 2,
		resizeMode: "stretch"
	},

	imageContainer: {
		height: 65,
		width: 65,
		borderRadius: 65 / 2
	},
	image: {
		height: 65,
		width: 65,
		borderRadius: 65 / 2
	},

	avatarContainer: {
		flex: 1,
		justifyContent: "center",
		alignItems: "center"
	},
	avatarButton: {
		backgroundColor: "blue",
		marginBottom: 10
	},
	avatarButtonText: {
		color: "white",
		fontSize: 20,
		textAlign: "center"
	},
	body: {
		flex: 1,
		alignItems: "center",
		justifyContent: "center",
		backgroundColor: "#F04812"
	},
	animatedBox: {
		marginLeft: "40%",
		height: "40%",
		width: "30%",
		//  backgroundColor: "#38C8EC",
		backgroundColor: "#F04812",

		padding: 10
	},
	sidemenuView: {
		marginTop: "7%",
		width: 50,
		height: 50,
		marginLeft: "5%",
		backgroundColor: "transparent"
	},

	fatListPadding: {
		paddingTop: 10
	},

	mainmenuView: {
		width: "100%",
		height: viewportHeight,
		// height:'12%',
		backgroundColor: "transparent"
	},

	sidemenuicon: {
		width: 50,
		height: 50
	},
	userProfileView: {
		marginTop: "2%",
		height: "10%",
		flexDirection: "row",
		backgroundColor: "transparent"
	},

	sideMenudefaultImage: {
		marginTop: "1%",
		backgroundColor: "transparent",
		marginLeft: "3%",
		width: "20%",
		height: "10%"
	},
	sideMenuavatarImage: {
		marginTop: "1%",
		backgroundColor: "transparent",
		marginLeft: "3%",
		width: "20%",
		height: "10%"
	},
	sideMenuNameView: {
		marginTop: "5%",
		backgroundColor: "transparent",
		marginLeft: "0.5%",
		width: "45%",
		height: "80%"
	},
	sideMenuName: {
		marginTop: "3%",
		width: "100%",
		height: "50%",
		color: "#000",
		fontWeight: "bold",
		letterSpacing: 0
	},
	sideMenusubName: {
		marginTop: "1%",
		marginLeft: "3%",
		width: "60%",
		height: "40%",
		color: "#000",
		letterSpacing: 0
	},
	sideMenuSettingIcon: {
		marginTop: "1%",
		backgroundColor: "transparent",
		// marginLeft: '1%',
		width: "32%",
		height: "100%"
	},
	sideMenusettingsImage: {
		marginLeft: "10%",
		width: "80%",
		height: "100%"
	},

	categoryContainer: {
		justifyContent: "center",
		marginTop: "10%",
		//backgroundColor:'red',
		height: "100%"
	},
	collectionView: {
		justifyContent: "center",
		alignItems: "center",
		// backgroundColor: "red",
		flex: 1,
		flexDirection: "column",
		margin: 1,
		width: "100%",
		height: 100
	},
	categoryText: {
		marginTop: "5%",
		marginLeft: "4%",
		justifyContent: "center",
		alignItems: "center"
	},
	categoryImage: {
		width: 32,
		height: 25
		//  shadowColor: "rgba(0, 0, 0, 0.1)",
		// shadowOffset: {
		//   width: 0,
		//   height: 6
		// },
		// shadowRadius: 5,
		// shadowOpacity: 1
	},
	collectioncontainer: {
		flex: 1,
		// backgroundColor:'blue',
		width: "100%"
	}
});
