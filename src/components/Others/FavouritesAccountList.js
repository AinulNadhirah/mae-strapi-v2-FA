import React, { Component } from "react";
import { Text, View, TouchableOpacity, ImageBackground, Alert, FlatList, Image } from "react-native";

const FavouritesAccountList = ({ data, callback, scrollToIndex, din = false }) => {
	function callbackEvent(item) {
		callback(item);
	}

	function renderItem({ item }) {
		console.log("Favourites item==> ", item);
		if (din === true) {
			return (
				<TouchableOpacity
					onPress={() => callback(item.idNo, item.idType, item.idTypeCode, item.tacIndent, item)}
					testID={"acctNumber"}
					accessibilityLabel={"acctNumber"}
				>
					<View style={Styles.newTransferView}>
						<View style={Styles.newTransferViewInner1}>
							<View style={Styles.newTransferCircle}>
								<Text
									style={[Styles.shortNameLabelBlack]}
									accessible={true}
									testID={"txtByClickingNext"}
									accessibilityLabel={"txtByClickingNext"}
								>
									{item.nickName
										.split(/\s/)
										.reduce((response, word) => (response += word.slice(0, 1)), "")
										.toUpperCase()
										.substring(0, 2)}
								</Text>
							</View>
						</View>
						<View style={Styles.newTransferViewInner2}>
							<Text
								style={[Styles.nameLabelBlack]}
								accessible={true}
								testID={"txtByClickingNext"}
								accessibilityLabel={"txtByClickingNext"}
							>
								{item.nickName}
							</Text>
							<Text
								style={[Styles.accountLabelBlack]}
								accessible={true}
								testID={"txtByClickingNext"}
								accessibilityLabel={"txtByClickingNext"}
							>
								{item.idNo}
							</Text>
							<Text
								style={[Styles.bankLabelBlack]}
								accessible={true}
								testID={"txtByClickingNext"}
								accessibilityLabel={"txtByClickingNext"}
							>
								{item.idType}
							</Text>
						</View>
					</View>
				</TouchableOpacity>
			);
		}
		return (
			<TouchableOpacity
				onPress={() =>
					callback(
						item.acctNumber,
						item.acctName,
						item.bank,
						item.acctCode,
						item.validationBit,
						item.paymentType,
						item
					)
				}
				testID={"acctNumber"}
				accessibilityLabel={"acctNumber"}
			>
				<View style={Styles.newTransferView}>
					<View style={Styles.newTransferViewInner1}>
						<View style={Styles.newTransferCircle}>
							<Text
								style={[Styles.shortNameLabelBlack]}
								accessible={true}
								testID={"txtByClickingNext"}
								accessibilityLabel={"txtByClickingNext"}
							>
								{item.acctName
									.split(/\s/)
									.reduce((response, word) => (response += word.slice(0, 1)), "")
									.toUpperCase()
									.substring(0, 2)}
							</Text>
						</View>
					</View>
					<View style={Styles.newTransferViewInner2}>
						<Text
							style={[Styles.nameLabelBlack]}
							accessible={true}
							testID={"txtByClickingNext"}
							accessibilityLabel={"txtByClickingNext"}
						>
							{item.acctName}
						</Text>
						<Text
							style={[Styles.accountLabelBlack]}
							accessible={true}
							testID={"txtByClickingNext"}
							accessibilityLabel={"txtByClickingNext"}
						>
							{item.acctNumber}
						</Text>
						<Text
							style={[Styles.bankLabelBlack]}
							accessible={true}
							testID={"txtByClickingNext"}
							accessibilityLabel={"txtByClickingNext"}
						>
							{item.bankName}
						</Text>
					</View>
				</View>
			</TouchableOpacity>
		);
	}

	return (
		<View>
			<FlatList
				style={Styles.accountsFlatlist}
				data={data}
				scrollToIndex={scrollToIndex}
				showsHorizontalScrollIndicator={false}
				showIndicator={false}
				keyExtractor={(item, index) => `${item.contentId}-${index}`}
				//renderItem={({ item, index }) => renderItem(item)}
				renderItem={renderItem}
				testID={"favList"}
				accessibilityLabel={"favList"}
			/>
		</View>
	);
};
const Styles = {
	newTransferView: {
		width: "90%",
		height: 80,
		borderRadius: 50,
		marginLeft: 0,
		marginBottom: 10,
		backgroundColor: "#fff",
		flexDirection: "row"
	},
	newTransferViewInner1: {
		flex: 1,
		borderTopLeftRadius: 50,
		borderBottomLeftRadius: 50,
		flexDirection: "column"
	},
	newTransferViewInner2: {
		flex: 3,
		borderTopRightRadius: 50,
		borderBottomRightRadius: 50,
		justifyContent: "center",
		flexDirection: "column"
	},
	newTranfLabelBlack: {
		fontFamily: "montserrat",
		fontSize: 15,
		fontWeight: "bold",
		fontStyle: "normal",
		marginLeft: 15,
		lineHeight: 33,
		color: "#000"
	},
	shortNameLabelBlack: {
		fontFamily: "montserrat",
		fontSize: 23,
		fontWeight: "normal",
		fontStyle: "normal",
		color: "#9B9B9B"
	},
	nameLabelBlack: {
		fontFamily: "montserrat",
		fontSize: 13,
		fontWeight: "bold",
		fontStyle: "normal",
		marginLeft: 15,
		color: "#000"
	},
	accountLabelBlack: {
		fontFamily: "montserrat",
		fontSize: 13,
		fontWeight: "normal",
		fontStyle: "normal",
		marginLeft: 15,
		color: "#000"
	},
	bankLabelBlack: {
		fontFamily: "montserrat",
		fontSize: 13,
		fontWeight: "normal",
		fontStyle: "normal",
		marginLeft: 15,
		color: "#9B9B9B"
	},
	newTransferCircle: {
		width: 64,
		height: 64,
		borderRadius: 50,
		marginLeft: 7,
		marginTop: 8,
		backgroundColor: "#D8D8D8",
		flexDirection: "row",
		justifyContent: "center",
		alignContent: "center",
		alignItems: "center"
	},
	newTransferCircleIcon: {
		width: 48,
		height: 48
	}
};
export default FavouritesAccountList;
