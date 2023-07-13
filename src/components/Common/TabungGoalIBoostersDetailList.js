/* eslint-disable react/prop-types */
/* eslint-disable react/jsx-no-bind */
/* eslint-disable react-native/no-inline-styles */
/* eslint-disable react-native/no-color-literals */
import React from "react";
import { View, Text, FlatList } from "react-native";
import SwitchToggle from "react-native-switch-toggle";

const TabungGoalIBoostersDetailList = ({ data, callback, scrollToIndex, length, switchCallback }) => {
	function renderItem({ item, index }) {
		return (
			<View
				onPress={() => callback(item)}
				style={length == index + 1 ? Styles.splitBillCardLastItem : Styles.splitBillCardItem}
			>
				<View style={Styles.splitBillCardView}>
					<View style={Styles.cardLeftView}>
						<View style={Styles.cardLeftInnerView}>
							<View style={Styles.indexCircleView}>
								<Text
									style={[Styles.indexText]}
									accessible={true}
									testID={"txtCARD_NO"}
									accessibilityLabel={"txtCARD_NO"}
								>
									{item.key}
								</Text>
							</View>
						</View>
					</View>
					<View style={Styles.cardRightView}>
						<View style={Styles.cardRightView}>
							<View style={Styles.cardRightTopView}>
								<Text
									style={[Styles.title]}
									accessible={true}
									testID={"txtCARD_NO"}
									accessibilityLabel={"txtCARD_NO"}
								>
									{item.name}
								</Text>
								<Text
									style={[Styles.titleDes]}
									accessible={true}
									testID={"txtCARD_NO"}
									accessibilityLabel={"txtCARD_NO"}
								>
									{item.amount}
								</Text>
							</View>
						</View>
					</View>

					<View style={Styles.cardRightSwitchView}>
						<View style={Styles.cardLeftInnerView}>
							<View style={Styles.switchContView}>
								<SwitchToggle
									style={Styles.autoDetectToggle}
									accessible={true}
									testID={"switchAutoDetect"}
									accessibilityLabel={"switchAutoDetect"}
									switchOn={item.enable}
									onPress={() => switchCallback(item)}
									// eslint-disable-next-line react-native/no-inline-styles
									containerStyle={{
										marginTop: 1,
										width: 45,
										height: 25,
										borderRadius: 20,
										backgroundColor: "#cccccc",
										padding: 1
									}}
									circleStyle={{
										width: 23,
										height: 23,
										borderRadius: 13,
										backgroundColor: "#ffffff"
									}}
									backgroundColorOn="#4cd863"
									backgroundColorOff="#cccccc"
									circleColorOff="#ffffff"
									circleColorOn="#ffffff"
									type={0}
								/>
							</View>
						</View>
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
	splitBillCardItem: {
		marginTop: 5,
		width: "100%",
		height: 55,
		borderRadius: 8,
		backgroundColor: "#ffffff"
	},
	splitBillCardLastItem: {
		marginTop: 0,
		width: "100%",
		height: 55,
		borderRadius: 8,
		backgroundColor: "#ffffff",

		marginBottom: 10
	},
	backgroundItem: {
		flex: 1
	},

	splitBillCardView: {
		flex: 1,
		borderRadius: 8,
		backgroundColor: "transparent",
		flexDirection: "row"
	},
	cardLeftView: {
		flex: 1.2,
		//backgroundColor: "green",
		flexDirection: "row",
		borderBottomLeftRadius: 8,
		borderTopLeftRadius: 8
	},

	cardRightSwitchView: {
		flex: 1.8,
		//backgroundColor: "green",
		flexDirection: "row",
		borderBottomLeftRadius: 8,
		borderTopLeftRadius: 8
	},
	cardLeftInnerView: {
		marginTop: 20,
		marginLeft: 0
	},
	cardRightTopView: {
		flex: 4,
		marginBottom: 8,
		backgroundColor: "transparent",
		flexDirection: "column",
		borderTopRightRadius: 8
	},
	cardRightBottomView: {
		flex: 1.3,
		marginBottom: 16,
		backgroundColor: "transparent",
		flexDirection: "column",
		borderBottomRightRadius: 8
	},
	cardRightView: {
		flex: 8,
		//backgroundColor: "blue",
		flexDirection: "column",
		borderBottomRightRadius: 8,
		borderTopRightRadius: 8,
		marginLeft: 4
	},
	indexText: {
		fontFamily: "montserrat",
		fontSize: 15,
		fontWeight: "600",
		fontStyle: "normal",
		lineHeight: 23,
		letterSpacing: 0,
		textAlign: "center",
		color: "#000000"
	},
	title: {
		fontFamily: "montserrat",
		fontSize: 13,
		fontWeight: "600",
		fontStyle: "normal",
		lineHeight: 17,
		letterSpacing: 0,
		color: "#000000",
		marginTop: 15
	},
	titleDes: {
		fontFamily: "montserrat",
		fontSize: 13,
		fontWeight: "normal",
		fontStyle: "normal",
		lineHeight: 19,
		letterSpacing: 0,
		color: "#000000",
		marginTop: 4
	},
	progressBarView: {
		marginTop: 5
	},
	progressBarTextView: {
		marginTop: 8,
		flexDirection: "row"
	},
	progressBar: {
		marginLeft: 0,
		marginRight: 20,
		borderRadius: 10
	},
	progressBar2: {
		marginLeft: 0,
		marginRight: 20,
		borderRadius: 10,
		marginTop: -7
	},
	amountLabel: {
		fontFamily: "montserrat",
		fontSize: 13,
		fontWeight: "normal",
		fontStyle: "normal",
		letterSpacing: 0,
		color: "#000000",

		marginTop: 10,
		marginLeft: 20
	},
	indexCircleView: {
		width: 30,
		height: 30,
		backgroundColor: "#f4f4f4",
		borderRadius: 30 / 2,
		flexDirection: "row",
		justifyContent: "center",
		alignItems: "center",
		alignContent: "center"
	},

	switchContView: {
		width: 30,
		height: 30,
		flexDirection: "row",
		justifyContent: "center",
		alignItems: "center",
		alignContent: "center"
	}
};

export { TabungGoalIBoostersDetailList };
