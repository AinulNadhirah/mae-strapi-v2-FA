import { StyleSheet } from "react-native";

export default StyleSheet.create({
	container: {
		flex: 1,
		marginHorizontal: 36,
		paddingTop: 16
	},
	headerContainer: {
		marginTop: 18,
		alignItems: "center"
	},
	avatarContainer: { width: 76, height: 76, backgroundColor: "red" },
	imageContainer: {
		borderRadius: 38,
		height: 76,
		overflow: "hidden",
		width: 76
	},
	image: {
		height: "100%",
		width: "100%"
	},
	containerTitle: {
		marginBottom: 8
	},
	titleText: { color: "#000000", fontWeight: "700", fontSize: 20 },
	descriptionContainer: {
		marginTop: 5,
		marginLeft: "20%",
		width: 300,
		justifyContent: "flex-start"
	},
	descriptionText: { color: "#000000", fontWeight: "100", fontSize: 20 },

	usernameContainer: {
		marginTop: 14,
		marginBottom: 48
	},
	imageText: {
		color: "#000000",
		fontWeight: "400",
		fontSize: 20,
		textAlign: "center",
		alignContent: "center"
		// width:'100%'
	},
	setupContainer: { marginTop: 30, marginHorizontal: 36, marginBottom: 14 },
	setupButtonTwoContainer: { marginVertical: 24 }
});
