import React from "react";
import { View, Text, FlatList, TouchableOpacity, ImageBackground, Platform, Image } from "react-native";
export const IS_IOS = Platform.OS === "ios";
import { MyView } from "./MyView";
import { StatusTextView } from "./StatusTextView";
import * as Progress from "react-native-progress";

const TabungGoalInvitedList = ({
	data,
	callback,
	scrollToIndex,
	length,
	invitedBills = false,
	buttonCallback,
	buttonText
}) => {
	function callbackEvent(item) {
		// callback(item)
	}

	function renderItem({ item, index }) {
		return (
			<TouchableOpacity
				onPress={() => callback(item)}
				style={length == index + 1 ? Styles.splitBillCardLastItem : Styles.splitBillCardItem}
			>
				<View style={Styles.splitBillCardView}>
					<View style={Styles.cardLeftView}>
						<View style={Styles.cardLeftInnerView}>
							{item.ownerImage != undefined && item.ownerImage.length >= 1 ? (
								<Image
									source={{
										uri: item.ownerImage
									}}
									resizeMode="center"
									resizeMethod="auto"
									style={[Styles.userImage]}
								/>
							) : (
								<View style={[Styles.userNameView]}>
									<Text
										style={[Styles.shortName]}
										accessible={true}
										testID={"txtCARD_NO"}
										accessibilityLabel={"txtCARD_NO"}
									>
										{item.ownerName
											.split(/\s/)
											.reduce((response, word) => (response += word.slice(0, 2)), "")
											.toUpperCase()
											.substring(0, 2)}
									</Text>
								</View>
							)}
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
									{item.title}
								</Text>
							</View>

							<View style={Styles.cardRightBottomView}>
								<Text
									style={[Styles.titleDes]}
									accessible={true}
									testID={"txtCARD_NO"}
									accessibilityLabel={"txtCARD_NO"}
								>
									{"View details >"}
								</Text>
							</View>
						</View>
					</View>
				</View>
			</TouchableOpacity>
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
		marginTop: 10,
		width: "100%",
		height: 99,
		borderRadius: 8,
		backgroundColor: "#ffffff"
	},
	splitBillCardLastItem: {
		marginTop: 10,
		width: "100%",
		height: 99,
		borderRadius: 8,
		backgroundColor: "#ffffff",
		marginBottom: 100
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
		flex: 2,
		//backgroundColor: "green",
		flexDirection: "row",
		borderBottomLeftRadius: 8,
		borderTopLeftRadius: 8
	},
	cardLeftInnerView: {
		marginTop: 20,
		marginLeft: 20,
		borderBottomLeftRadius: 8,
		borderTopLeftRadius: 8
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
		flex: 7,
		//backgroundColor: "blue",
		flexDirection: "column",
		marginLeft: 5,
		borderBottomRightRadius: 8,
		borderTopRightRadius: 8
	},
	title: {
		fontFamily: "montserrat",
		fontSize: 13,
		fontWeight: "normal",
		fontStyle: "normal",
		lineHeight: 20,
		letterSpacing: 0,
		color: "#000000",
		marginTop: 16,
		marginBottom: 8,
		marginRight: 20
	},
	titleDes: {
		fontFamily: "montserrat",
		fontSize: 13,
		fontWeight: "600",
		fontStyle: "normal",
		lineHeight: 19,
		letterSpacing: 0,
		color: "#4190b7"
	},
	userImage: {
		width: 45,
		height: 45,
		borderRadius: 90 / 2,
		shadowColor: "#d8d8d8",
		shadowOffset: {
			width: 0,
			height: 2
		},
		shadowRadius: 6,
		shadowOpacity: 1,
		borderStyle: "solid",
		borderWidth: 0,
		borderColor: "#d8d8d8"
	},
	userNameView: {
		flexDirection: "column",
		justifyContent: "center",
		alignContent: "center",
		alignItems: "center",
		width: 45,
		height: 45,
		borderRadius: 90 / 2,
		shadowColor: "#d8d8d8",
		shadowOffset: {
			width: 0,
			height: 2
		},
		shadowRadius: 6,
		shadowOpacity: 1,
		borderStyle: "solid",
		borderWidth: 0,
		backgroundColor: "#f4f4f4"
	},
	shortName: {
		fontFamily: "montserrat",
		fontSize: 11,
		fontWeight: "600",
		fontStyle: "normal",
		lineHeight: 17,
		letterSpacing: 0,
		color: "#000000"
	}
};

export { TabungGoalInvitedList };
