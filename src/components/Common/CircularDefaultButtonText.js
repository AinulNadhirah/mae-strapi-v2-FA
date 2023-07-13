/* eslint-disable react/prop-types */
import React from "react";
import { Text, View, Image, TouchableOpacity } from "react-native";

const CircularDefaultButtonText = ({ source, onPress, defaultImage, showText, text }) => {
	//const { text } = data;

	return (
		<View>
			<View
				style={Styles.editIconView1}
				onPress={onPress}
				testID={"btnEditAmount"}
				accessibilityLabel={"btnEditAmount"}
			>
				{source != undefined && source.length >= 1 && !showText ? (
					<Image
						style={Styles.receiptIconBase64}
						resizeMethod="resize"
						resizeMode="stretch"
						source={{
							uri:
								source.indexOf("http") != -1
									? source
									: "data:image/jpeg;base64," + source.replace("data:image/jpeg;base64,", "")
						}}
					/>
				) : text != undefined && text.length >= 1 ? (
					<Text style={Styles.shortNameLabel}>{text}</Text>
				) : (
					<Image
						style={Styles.receiptIcon}
						source={defaultImage}
						resizeMethod="resize"
						resizeMode="stretch"
					/>
				)}
			</View>
		</View>
	);
};

const Styles = {
	editIconView1: {
		alignItems: "center",
		flexDirection: "column",
		width: 50,
		height: 50,
		borderRadius: 50 / 2,
		backgroundColor: "#D8D8D8",
		justifyContent: "center"
	},
	receiptIcon: {
		width: 90,
		height: 90,
		borderRadius: 90,
		marginTop: -9.3
	},
	receiptIconBase64: {
		width: 50,
		height: 50,
		borderRadius: 50 / 2
	},
	shortNameLabelBlack: {
		// fontFamily: 'montserrat_regular',
		fontFamily: "montserrat",
		fontSize: 23,
		fontWeight: "normal",
		fontStyle: "normal",
		color: "#9B9B9B"
	},
	shortNameLabel: {
		// fontFamily: 'montserrat_regular',
		fontFamily: "montserrat",
		fontSize: 16,
		fontWeight: "normal",
		fontStyle: "normal",
		color: "#9B9B9B"
	}
};

export { CircularDefaultButtonText };
