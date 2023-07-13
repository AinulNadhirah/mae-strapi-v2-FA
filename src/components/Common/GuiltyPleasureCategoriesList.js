/* eslint-disable react/prop-types */
/* eslint-disable react/jsx-no-bind */
/* eslint-disable react-native/no-inline-styles */
/* eslint-disable react-native/no-color-literals */
import React from "react";
import { View, Text, FlatList, TouchableOpacity, Image } from "react-native";

const GuiltyPleasureCategoriesList = ({ data, callback, scrollToIndex, length, firstCallBack, secondCallBack }) => {
	function renderItem({ item, index }) {
		return (
			<View>
				<View style={Styles.descView5}>
					<View style={Styles.descView5}>
						<View
							style={[
								Styles.categoryCenterView,
								{
									height: 32 + 20,
									width: 32 + 20,
									borderRadius: 32 + 20 / 2,
									backgroundColor:
										item.colorCode != undefined && item.colorCode != null
											? item.colorCode
											: "#ffa000"
								}
							]}
						>
							{item.titleImage != null && item.titleImage != undefined ? (
								<Image
									style={Styles.gpCatImage}
									source={{
										uri: item.titleImage
									}}
								/>
							) : (
								<View style={Styles.gpCatImage} />
							)}
						</View>

						<Text style={[Styles.singleGPName]}>{item.title}</Text>
					</View>

					{data.length != 1 ? (
						<TouchableOpacity onPress={() => callback(index)}>
							<Image style={Styles.closeImage} source={item.rightImage} />
						</TouchableOpacity>
					) : (
						<View />
					)}
				</View>

				<View style={Styles.descView6}>
					<Text style={[Styles.nearByText]}>{item.firstLabel}</Text>
					<TouchableOpacity onPress={() => firstCallBack(index, item)}>
						<Text style={[Styles.spAmountText]}>{"RM " + item.firstValue}</Text>
					</TouchableOpacity>
				</View>
				<View style={Styles.descView7}>
					<Text style={[Styles.nearByText]}>{item.secondLabel}</Text>

					<TouchableOpacity onPress={() => secondCallBack(index, item)}>
						<Text style={[Styles.spAmountText]}>{"RM " + item.secondValue}</Text>
					</TouchableOpacity>
				</View>

				{index != length - 1 ? <View style={Styles.lineView} /> : <View />}
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
	descView5: {
		alignItems: "center",
		flexDirection: "row",
		justifyContent: "space-between",
		marginBottom: 12,
		marginTop: 10
	},
	descView6: {
		flexDirection: "row",
		justifyContent: "space-between",
		marginTop: 0
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
		lineHeight: 18,
		marginLeft: 10
	},
	categoryCenterView: {
		backgroundColor: "#A0A0A0",
		flexDirection: "column",
		borderWidth: 1,
		borderColor: "#FFFFFF",
		alignContent: "center",
		alignItems: "center",
		justifyContent: "center"
	},
	gpCatImage: {
		borderRadius: 32 / 2,
		height: 32,
		width: 32
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
	spAmountText: {
		fontFamily: "montserrat",
		color: "#4a90e2",
		fontSize: 14,
		fontStyle: "normal",
		fontWeight: "600",
		letterSpacing: 0,
		lineHeight: 18,
		textAlign: "right"
	}
};

export { GuiltyPleasureCategoriesList };
