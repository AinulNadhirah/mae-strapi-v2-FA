import React from "react";
import { View, Text, ProgressBarAndroid, TouchableOpacity, FlatList, Image } from "react-native";
import { MyView } from "./MyView";
import { AddIconTextButtonRound } from "./AddIconTextButtonRound";

const FloatingActionTextStaticButton = ({
	showMenu,
	onPress,
	icon,
	text,
	backgroundColor,
	showIcon,
	iconWidth = 24
}) => {
	return (
		<MyView hide={!showMenu}>
			<View style={[Styles.footerCenterNoView]}>
				<View style={Styles.nextButtonContainer}>
					<AddIconTextButtonRound
						headerText={text}
						height={42}
						testID={"btnCONTINUE"}
						accessibilityLabel={"btnCONTINUE"}
						backgroundColor={backgroundColor}
						icon={icon}
						iconWidth={iconWidth}
						callback={onPress}
						showIcon={showIcon}
					/>
				</View>
			</View>
		</MyView>
	);
};

const Styles = {
	footerCenterNoView: {
		width: "100%",
		height: 90,
		justifyContent: "center",
		alignItems: "center",
		bottom: 0,
		zIndex: 10,
		marginBottom: "3%",
		position: "absolute",
		flexDirection: "column"
	},

	nextButtonContainer: {
		flex: 1,
		height: 50
	},

	nextButtonBottom: {
		justifyContent: "center",
		marginLeft: 37
	},
	nextButtonBottomImage: {
		width: 90,
		height: 90,
		borderRadius: 90 / 2
	}
};

export { FloatingActionTextStaticButton };
