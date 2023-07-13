import React from "react";
import { Dimensions, View, Text, StyleSheet, Image } from "react-native";
const screenWidth = Dimensions.get("window").width;
const screenHeight = Dimensions.get("window").height;

const BulletText = ({ label, paramLabelCls, paramContainerCls, isTickmark }) => {
	return (
		<View style={paramContainerCls ? paramContainerCls : styles.containerStyle}>
			{isTickmark ? <Text>&#10003;</Text> : <View style={styles.whiteBulletCls} />}
			<Text style={paramLabelCls ? paramLabelCls : styles.labelCls}>{label}</Text>
		</View>
	);
};

const styles = StyleSheet.create({
	containerStyle: {
		flexDirection: "row",
		justifyContent: "flex-start",
		marginTop: (screenHeight * 2) / 100,
		// marginLeft: "10%",
		width: "100%"
	},
	labelCls: {
		marginBottom: 10,
		height: "100%",
		marginLeft: 10,
		marginRight: 20,
		fontFamily: "montserrat",
		color: "#000000",
		fontSize: 16,
		fontWeight: "normal",
		fontStyle: "normal",
		lineHeight: 20,
		letterSpacing: 0
	},
	whiteBulletCls: {
		marginTop: 5,
		width: 10,
		height: 10,
		borderRadius: 10,
		borderStyle: "solid",
		borderWidth: 1,
		borderColor: "#000000"
	}
});

export { BulletText };
