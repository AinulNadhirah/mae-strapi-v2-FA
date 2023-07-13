import { StyleSheet } from "react-native";
import { Platform } from "react-native";
export const blueBackgroundColor = "#f8f5f3";

export default StyleSheet.create({
	indicator: {
		backgroundColor: "#fff",
		width: "33%",
		height: 1
	},
	indicator2: {
		backgroundColor: "#fff",
		width: "50%",
		height: 1
	},
	indicatorTransparent: {
		backgroundColor: "transparent",
		width: "33%",
		height: 1
	},
	indicatorNo: {
		backgroundColor: blueBackgroundColor,
		width: "20%",
		height: 0
	},
	tabbar: {
		height: 70,
		backgroundColor: blueBackgroundColor
	},
	tabbarTransparent: {
		height: 70,
		backgroundColor: "transparent"
	},
	tabbarBlue: {
		height: 70,
		backgroundColor: blueBackgroundColor
	},
	tab: { backgroundColor: "#fff", height: 70 },
	tabTransparent: { backgroundColor: "transparent", height: 70 },
	tabBlue: { backgroundColor: blueBackgroundColor, height: 70 },
	label: {
		color: "#000",
		fontFamily: "montserrat",
		fontSize: 13,
		fontWeight: "600"
	},
	container: {
		flex: 1,
		backgroundColor: "#fff",
		marginTop: Platform.OS === "ios" ? 20 : 0
	},
	containerBlue: {
		flex: 1,
		backgroundColor: blueBackgroundColor,
		marginTop: Platform.OS === "ios" ? 20 : 0
	}
});
