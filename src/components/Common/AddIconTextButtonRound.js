/* eslint-disable react-native/no-color-literals */
/* eslint-disable react-native/no-inline-styles */
/* eslint-disable react/jsx-no-bind */
/* eslint-disable react/prop-types */
import React from "react";
import { Text, TouchableOpacity, View, Image } from "react-native";

const AddIconTextButtonRound = ({
	callback,
	height,
	headerText,
	backgroundColor,
	textColor,
	accessibilityLabel,
	testID,
	icon,
	iconWidth,
	showIcon = true
}) => {
	return (
		<View
			style={[
				Styles.budgetingContent,
				{
					height: height
				}
			]}
		>
			<TouchableOpacity
				activeOpacity={0.9}
				onPress={() => callback()}
				style={[
					Styles.buttonStyleBorder,
					{
						backgroundColor:
							backgroundColor != null && backgroundColor != undefined ? backgroundColor : "#fff"
					}
				]}
				underlayColor={backgroundColor != null && backgroundColor != undefined ? backgroundColor : "#fff"}
				accessibilityLabel={
					accessibilityLabel === undefined || accessibilityLabel === null
						? "AddIconTextButtonRound"
						: accessibilityLabel
				}
				testID={testID === undefined || testID === null ? "AddIconTextButtonRound" : testID}
			>
				<View style={Styles.innerContent}>
					{showIcon ? (
						<Image style={{ height: iconWidth, width: iconWidth, paddingLeft: 19 }} source={icon} />
					) : null}
					<Text
						style={[
							Styles.textLeftStyle,
							{
								color: textColor != null && textColor != undefined ? textColor : "#000000"
							}
						]}
					>
						{headerText}
					</Text>
				</View>
			</TouchableOpacity>
		</View>
	);
};

const Styles = {
	textLeftStyle: {
		fontFamily: "montserrat",
		fontSize: 14,
		fontWeight: "500",
		fontStyle: "normal",
		lineHeight: 18,
		letterSpacing: 0,
		textAlign: "left",
		color: "#000000",
		justifyContent: "flex-start",
		paddingTop: 13,
		paddingBottom: 13,
		paddingRight: 23.5,
		paddingLeft: 2
	},
	icon: {
		width: 32,
		height: 32,
		marginRight: 20
	},

	buttonStyleBorder: {
		alignItems: "center",
		justifyContent: "center",
		flexDirection: "row",
		borderRadius: 25,
		borderStyle: "solid",
		borderWidth: 1,
		backgroundColor: "#ffffff",
		borderColor: "#eaeaea"
	},
	budgetingContent: {
		height: 42,
		alignItems: "center",
		alignContent: "center",
		flexDirection: "column",
		justifyContent: "center",
		marginLeft: 35,
		marginRight: 35,
		marginTop: 36,
		marginBottom: 0,
		shadowColor: "#000",
		shadowOffset: {
			width: 0,
			height: 12
		},
		shadowOpacity: 0.8,
		shadowRadius: 16.0,
		elevation: 24
	},
	innerContent: {
		flexDirection: "row",
		justifyContent: "center",
		alignContent: "center",
		alignItems: "center",
		paddingLeft: 19
	}
};
export { AddIconTextButtonRound };
