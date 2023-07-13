import React from "react";
import { Text, TouchableOpacity } from "react-native";
import * as Progress from "react-native-progress";

// eslint-disable-next-line react/prop-types
const SplitBillsCollectionCard = ({ onPress, title, collectedText, amountText, createdText, progress }) => {
	return (
		<TouchableOpacity style={Styles.splitBillCardView} onPress={onPress} activeOpacity={0.9}>
			<Text style={[Styles.title]} accessible={true} testID={"txtCARD_NO"} accessibilityLabel={"txtCARD_NO"}>
				{title}
			</Text>
			<Text
				style={[Styles.collectedLabel]}
				accessible={true}
				testID={"txtCARD_NO"}
				accessibilityLabel={"txtCARD_NO"}
			>
				{collectedText}
			</Text>
			<Text
				style={[Styles.amountLabel]}
				accessible={true}
				testID={"txtCARD_NO"}
				accessibilityLabel={"txtCARD_NO"}
			>
				{amountText}
			</Text>
			{/* <ProgressBarAndroid  style={[Styles.progressBar]} styleAttr="Horizontal" indeterminate={false} progress={progress} color="#4a90e2" /> */}
			<Progress.Bar
				progress={progress}
				style={[Styles.progressBar]}
				width={null}
				height={7}
				animated={false}
				borderRadius={3}
				borderWidth={0}
				color={"#4a90e2"}
				unfilledColor={"#ececee"}
				borderColor={"#4a90e2"}
			/>
			<Text
				style={[Styles.createdLabel]}
				accessible={true}
				testID={"txtCARD_NO"}
				accessibilityLabel={"txtCARD_NO"}
			>
				{createdText}
			</Text>
		</TouchableOpacity>
	);
};

const Styles = {
	splitBillCardView: {
		width: "82%",
		height: 185,
		borderRadius: 11,
		backgroundColor: "#fff"
	},
	title: {
		// fontFamily: 'montserrat_semibold',
		fontFamily: "montserrat",
		fontSize: 15,
		fontWeight: "bold",
		fontStyle: "normal",
		marginTop: 15,
		marginLeft: 20,
		lineHeight: 16,
		letterSpacing: 0,
		color: "#000"
	},
	collectedLabel: {
		fontFamily: "montserrat",
		fontSize: 13,
		fontWeight: "normal",
		fontStyle: "normal",
		marginTop: 51,
		marginLeft: 20,
		lineHeight: 16,
		letterSpacing: 0,
		color: "#000"
	},
	amountLabel: {
		// fontFamily: 'montserrat_semibold',
		fontFamily: "montserrat",
		fontSize: 15,
		fontWeight: "bold",
		fontStyle: "normal",
		marginTop: 10,
		marginLeft: 20,
		lineHeight: 16,
		letterSpacing: 0,
		color: "#000"
	},
	createdLabel: {
		// fontFamily: 'montserrat_semibold',
		fontFamily: "montserrat",
		fontSize: 13,
		fontWeight: "bold",
		fontStyle: "normal",
		marginTop: 5,
		marginLeft: 20,
		lineHeight: 16,
		letterSpacing: 0,
		color: "#000"
	},
	progressBar: {
		// fontFamily: 'montserrat_regular',
		fontFamily: "montserrat",
		marginTop: 5,
		marginLeft: 20,
		marginRight: 20,
		borderRadius: 10
	}
};

export { SplitBillsCollectionCard };
