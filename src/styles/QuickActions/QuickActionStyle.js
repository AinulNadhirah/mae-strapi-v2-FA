import { StyleSheet } from "react-native";
import { Dimensions, Image } from "react-native";
import { isAbsolute } from "path";
export const { width, height } = Dimensions.get("window");

export default StyleSheet.create({
	actionContainer: {
		height: 200,
		marginTop: 20,
		flexDirection: "row"
	},
	actionItem: {
		width: 138,
		height: 191,
		flexDirection: "row",
		backgroundColor: "#fff",
		borderRadius: 15,
		marginLeft: 10,
		marginRight: 3,
		flexDirection: "column"
	},
	actionItemFirst: {
		width: 138,
		height: 191,
		flexDirection: "row",
		backgroundColor: "#fff",
		borderRadius: 15,
		marginLeft: 50,
		marginRight: 3,
		flexDirection: "column"
	},

	actionItemLast: {
		width: 138,
		height: 191,
		flexDirection: "row",
		backgroundColor: "#fff",
		borderRadius: 15,
		marginLeft: 8,
		marginRight: 50,
		flexDirection: "column"
	},
	actionItemImage: {
		marginTop: 35,
		marginLeft: 16,
		width: 77,
		height: 77
	},

	actionItemTitle: {
		color: "#000000",
		marginTop: 18,
		fontWeight: "bold",
		fontSize: 17,
		fontWeight: "bold",
		marginLeft: 16,
		marginRight: 16
	},
	goalTextView: {
		backgroundColor: "red",
		marginTop: "15%",
		width: "100%",
		height: "10%"
	},
	titleLabel: {
		color: "white",
		marginTop: "80%",
		marginLeft: "13%",
		width: "80%",
		fontFamily: "montserrat",
		fontSize: 23,
		fontWeight: "300",
		fontStyle: "normal",
		lineHeight: 33,
		letterSpacing: 0
	},

	footerView: {
		marginTop: "10%",
		width: "90%",
		height: 95,
		marginLeft: "70%"
	}
});
