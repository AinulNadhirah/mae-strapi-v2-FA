import React from "react";
import { View, Text, ProgressBarAndroid, TouchableOpacity, FlatList, Image } from "react-native";
import { MyView } from "./MyView";

const FloatingActionStaticButton = ({ showMenu, onPress, icon }) => {
	return (
		<MyView hide={!showMenu} style={Styles.menuContainer}>
			<View style={[Styles.footerCenterNoView]}>
				<View style={Styles.nextButtonContainer}>
					<TouchableOpacity
						style={Styles.nextButtonBottom}
						onPress={onPress}
						accessibilityLabel={"plusButton"}
					>
						<View>
							<Image style={Styles.nextButtonBottomImage} source={icon} />
						</View>
					</TouchableOpacity>
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
		height: 50,
		marginRight: "10%"
	},
	nextButtonMarginContainer: {
		flex: 1,
		height: 50,
		marginBottom: "15%"
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

export { FloatingActionStaticButton };
