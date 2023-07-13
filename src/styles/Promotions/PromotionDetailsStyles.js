import { StyleSheet } from "react-native";
import { Dimensions, Image } from "react-native";
import { isAbsolute } from "path";
export const { width, height } = Dimensions.get("window");

export default StyleSheet.create({
	container: {
		flex: 1,
		alignItems: "center",
		justifyContent: "center"
	},
	contentContainer: {
		paddingHorizontal: 0
	},
	titleContainer: {
		marginHorizontal: 24
	},
	moreDetailsTitleContainer: {
		marginTop: 40,
		marginHorizontal: 24
	},
	moreDetailsDescriptionContainer: {
		marginTop: 40,
		marginHorizontal: 24,
		marginBottom: 120
	},
	descriptionContainer: {
		marginTop: 16,
		marginHorizontal: 24,
		marginBottom: 0
	},
	countdownContainer: {
		marginBottom: 0
	},
	validityContainer: {
		marginHorizontal: 24,
		flexDirection: "row",
		marginTop: 24,
		alignItems: "center"
	},
	progressBarContainer: {
		alignItems: "center",
		paddingTop: 30
	},
	ctaContainer: {
		marginHorizontal: 24,
		marginTop: 28
	},
	separatorLine: {
		width: width - 48,
		height: 1,
		borderStyle: "solid",
		borderWidth: 0.8,
		borderColor: "#f1f1f1",
		marginTop: 4,
		marginBottom: 24,
		marginHorizontal: 24
	},
	progressBar: {
		flexDirection: "row",
		height: 8,
		width: 180,
		backgroundColor: "#eaeaea",
		borderRadius: 4,
		marginBottom: 4
	},
	flashMessage: {
		marginBottom: 30,
		textAlign: "center"
	},
	flashMessageText: {
		fontFamily: "montserrat"
	}
});
