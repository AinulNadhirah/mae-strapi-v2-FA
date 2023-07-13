/* eslint-disable react/prop-types */
/* eslint-disable react/jsx-no-bind */
import React from "react";
import { Image, TouchableOpacity } from "react-native";

const CircularCenterImageView = ({ source, click, width, height, size }) => {
	//const { text } = data;

	return (
		<TouchableOpacity
			activeOpacity={0.6}
			style={[Styles.editIconView1, { width: size, height: size, borderRadius: size / 2 }]}
			onPress={() => click()}
			testID={"btnEditAmount"}
			accessibilityLabel={"btnEditAmount"}
		>
			<Image
				accessible={true}
				testID={"userImage"}
				accessibilityLabel={"userImage"}
				style={{ width: width, height: height }}
				source={source}
			/>
		</TouchableOpacity>
	);
};

const Styles = {
	editIconView1: {
		alignItems: "center",
		flexDirection: "column",
		justifyContent: "center",
		alignContent: "center",
		width: 48,
		height: 48,
		borderRadius: 48 / 2,
		backgroundColor: "#ffffff",
		shadowColor: "#000",
		shadowOffset: {
			width: 0,
			height: 2
		},
		shadowOpacity: 0.23,
		shadowRadius: 2.62,
		elevation: 4
	},
	receiptIcon: {}
};

export { CircularCenterImageView };
