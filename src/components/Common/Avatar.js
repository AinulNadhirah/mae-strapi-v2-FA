import React from "react";
import { Image, StyleSheet, View, Platform, Text } from "react-native";
import PropTypes from "prop-types";

export default class Avatar extends React.PureComponent {
	render() {
		const { imageUri = "", radius = 0, name = "" } = this.props;
		if (imageUri === undefined || imageUri === null || imageUri.trim().length === 0)
			return <View style={[styles.image, { height: radius, width: radius, borderRadius: radius }]} />;
		return imageUri.length < 1 ? (
			<Text style={[styles.text]}>{name}</Text>
		) : (
			<Image
				source={{ uri: imageUri }}
				style={[
					styles.image,
					{
						height: radius,
						width: radius,
						borderRadius: Platform.select({ ios: radius / 2, android: radius })
					}
				]}
				resizeMode={Platform.select({ ios: "contain", android: "cover" })}
			/>
		);
	}
}

Avatar.propTypes = {
	imageUri: PropTypes.string.isRequired,
	name: PropTypes.string.isRequired,
	radius: PropTypes.number.isRequired
};

const styles = StyleSheet.create({
	image: {
		flexDirection: "row",
		backgroundColor: "#f2f2f2",
		borderColor: "#ffffff",
		borderWidth: 3,
		alignContent: "center",
		alignItems: "center",
		justifyContent: "center"
	},
	text: {
		fontFamily: "montserrat",
		fontSize: 11,
		fontWeight: "600",
		fontStyle: "normal",
		lineHeight: 17,
		letterSpacing: 0,
		textAlign: "center",
		color: "#000000"
	}
});
