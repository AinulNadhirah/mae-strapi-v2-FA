/* eslint-disable react/jsx-no-bind */
/* eslint-disable react/prop-types */
import React from "react";
import { View, Text, FlatList, Platform } from "react-native";
import { OverlappingPictures } from "./overlappingPictures";

const TabungParticipantInvitedList = ({ data, callback, length, extraData, scrollToIndex = 0 }) => {
	function renderItem({ item, index }) {
		return (
			<View style={Styles.participantRow}>
				<View style={Styles.imageCol}>
					<OverlappingPictures picArray={item.picArrayDisplay} small={false} reverse={true} medium={true} />
				</View>
				<View style={Styles.nameCol}>
					<Text
						style={[Styles.nameText]}
						accessible={true}
						testID={"txtCARD_NO"}
						accessibilityLabel={"txtCARD_NO"}
					>
						{item.participantName}
					</Text>
				</View>
				<View style={Styles.amountCol}>
					<Text
						style={[Styles.amountText]}
						accessible={true}
						testID={"txtCARD_NO"}
						accessibilityLabel={"txtCARD_NO"}
					>
						{item.amount}
					</Text>
				</View>
			</View>
		);
	}

	return (
		<View>
			<FlatList
				style={Styles.flatList}
				data={data}
				extraData={extraData}
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
	participantRow: {
		height: 40,
		flexDirection: "row",
		//backgroundColor: "blue",
		marginTop: 10
	},
	imageCol: {
		flex: 0.9
		//backgroundColor: "green"
	},
	nameCol: {
		flex: 3,
		marginLeft: 0,
		justifyContent: "center"
		//backgroundColor: "blue"
	},
	amountCol: {
		flex: 3,
		justifyContent: "center"
		//backgroundColor: "pink"
	},
	nameText: {
		fontFamily: "montserrat",
		fontSize: 14,
		fontWeight: "normal",
		fontStyle: "normal",
		lineHeight: 18,
		letterSpacing: 0,
		color: "#000000"
	},

	amountText: {
		fontFamily: "montserrat",
		fontSize: 14,
		fontWeight: "600",
		fontStyle: "normal",
		lineHeight: 18,
		letterSpacing: 0,
		textAlign: "right",
		color: "#000000"
	}
};

export { TabungParticipantInvitedList };
