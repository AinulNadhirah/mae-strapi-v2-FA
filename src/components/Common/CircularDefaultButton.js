import React from "react";
import { Text, View, Image, TouchableOpacity } from "react-native";

const CircularDefaultButton = ({ source, onPress, defaultImage }) => {
	//const { text } = data;

	return (
		<View>
			<TouchableOpacity
				style={Styles.editIconView1}
				onPress={onPress}
				testID={"btnEditAmount"}
				accessibilityLabel={"btnEditAmount"}
			>
				{source != undefined && source.length ? (
					<Image
						accessible={true}
						testID={"userImage"}
						accessibilityLabel={"userImage"}
						style={Styles.receiptIconBase64}
						source={{
							uri:
								source.indexOf("http") != -1
									? source
									: "data:image/jpeg;base64," + source.replace("data:image/jpeg;base64,", "")
						}}
					/>
				) : (
					<Image
						accessible={true}
						testID={"defImage"}
						accessibilityLabel={"defImage"}
						style={Styles.receiptIcon}
						source={defaultImage}
					/>
				)}
			</TouchableOpacity>
		</View>
	);
};

const Styles = {
	editIconView1: {
		alignItems: "center",
		flexDirection: "column",
		width: 68,
		height: 68,
		borderRadius: 68/2,

	},
	receiptIcon: {
		width: 90,
		height: 90,
		borderRadius: 90/2,
		marginTop: -9.3,
	},
	receiptIconBase64: {
		width: 70,
		height: 70,
		borderRadius: 70/2,
		borderColor: "#ffffff",
		borderWidth: 1.2,

	}
};

export { CircularDefaultButton };
