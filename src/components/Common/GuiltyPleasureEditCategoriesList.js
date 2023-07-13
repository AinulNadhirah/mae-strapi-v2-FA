/* eslint-disable react/prop-types */
/* eslint-disable react/jsx-no-bind */
/* eslint-disable react-native/no-inline-styles */
/* eslint-disable react-native/no-color-literals */
import React from "react";
import { View, Text, FlatList, TouchableOpacity, Image } from "react-native";

const GuiltyPleasureEditCategoriesList = ({ data, callback, callback2, scrollToIndex, length }) => {
	function renderItem({ item, index }) {
		return (
			<View style={Styles.descView5}>
				<Image style={Styles.gpCatImage} source={item.titleImage} />

				<View style={Styles.descView4}>
					<Text style={[Styles.singleGPName]}>{item.title}</Text>
					<Text style={[Styles.descText]}>{item.description}</Text>

					<View style={Styles.descView6}>
						{item.firstLabel != undefined && item.firstLabel.length >= 1 ? (
							<TouchableOpacity onPress={() => callback(item)} style={[Styles.buttonView]}>
								<Text style={[Styles.buttonText]}>{item.firstLabel}</Text>
							</TouchableOpacity>
						) : (
							<View />
						)}

						{item.secondLabel != undefined && item.secondLabel.length >= 1 ? (
							<TouchableOpacity onPress={() => callback2(item)} style={[Styles.buttonView]}>
								<Text style={[Styles.buttonText]}>{item.secondLabel}</Text>
							</TouchableOpacity>
						) : (
							<View />
						)}
					</View>
				</View>
			</View>
		);
	}

	return (
		<View>
			<FlatList
				style={Styles.flatList}
				data={data}
				extraData={data}
				scrollToIndex={scrollToIndex}
				showsHorizontalScrollIndicator={false}
				showIndicator={false}
				keyExtractor={(item, index) => `${item.contentId}-${index}`}
				//renderItem={({ item, index }) => renderItem(item)}
				renderItem={(item, index) => renderItem(item, index)}
				testID={"favList"}
				accessibilityLabel={"favList"}
			/>
		</View>
	);
};
const Styles = {
	flatList: {},
	descView4: {
		flexDirection: "column",
		marginTop: 20,
		marginLeft: 13
	},
	descView5: {
		alignItems: "center",
		flexDirection: "row",
		marginTop: 10
	},
	descView6: {
		flexDirection: "row",
		marginTop: 8,
		marginLeft: 3
	},
	descView7: {
		flexDirection: "row",
		justifyContent: "space-between",
		marginTop: 12
	},
	lineView: {
		width: "100%",
		height: 1,
		marginTop: 24,
		backgroundColor: "#cccccc"
	},
	singleGPName: {
		fontFamily: "montserrat",
		color: "#000000",
		fontSize: 14,
		fontStyle: "normal",
		fontWeight: "600",
		letterSpacing: 0,
		lineHeight: 18
	},
	descText: {
		fontFamily: "Montserrat",
		fontSize: 14,
		fontWeight: "normal",
		fontStyle: "normal",
		lineHeight: 19,
		letterSpacing: 0,
		color: "#000000",
		marginTop: 8,
		marginRight: 48
	},
	gpCatImage: {
		borderRadius: 48 / 2,
		height: 48,
		width: 48,
		marginTop: -16
	},
	closeImage: {
		height: 19,
		width: 19
	},
	nearByText: {
		fontFamily: "montserrat",
		color: "#000000",
		fontSize: 14,
		fontStyle: "normal",
		fontWeight: "normal",
		letterSpacing: 0,
		lineHeight: 19
	},
	buttonText: {
		fontSize: 14,
		fontWeight: "600",
		fontStyle: "normal",
		letterSpacing: 0,
		color: "#4a90e2"
	},

	buttonView: { marginRight: 16 }
};

export { GuiltyPleasureEditCategoriesList };
