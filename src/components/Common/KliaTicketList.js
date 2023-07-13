/* eslint-disable react/jsx-no-bind */
/* eslint-disable react/prop-types */
import React from "react";
import { View, Text, FlatList, TouchableOpacity } from "react-native";
const borderRadius = 8 / 2;
const KliaTicketList = ({ data, callback, scrollToIndex, length, backgroundColor = "#eaeaea" }) => {
	function renderItem({ item, index }) {
		return (
			<TouchableOpacity
				key={`item-${index}`}
				activeOpacity={0.8}
				onPress={() => callback(item)}
				style={[
					length == index + 1 ? Styles.viewActiveItemLast : Styles.viewActiveItem,
					{ backgroundColor: backgroundColor }
				]}
			>
				<View style={Styles.containerView}>
					<View style={Styles.containerFirstView}>
						<View style={Styles.containerFirstInner1}>
							<Text style={Styles.bookingTextStyle}>Booking No</Text>
							<Text style={Styles.bookingValueStyle}>{item.bookingNo}</Text>
						</View>
						<View style={Styles.containerFirstInner2}>
							<Text style={Styles.validityTextStyle}>Validity</Text>
							<Text style={Styles.validityValueStyle}>{item.validity}</Text>
						</View>
					</View>

					<View style={Styles.line} />

					<Text style={Styles.placeValueStyle}>{item.place}</Text>
					<Text style={Styles.tripValueStyle}>{item.trip}</Text>
					<Text style={Styles.amountValueStyle}>{item.amount}</Text>
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
				showsVerticalScrollIndicator={false}
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

	viewActiveItem: {
		borderRadius: borderRadius,
		width: "88%",
		height: 168,
		backgroundColor: "#ffffff",
		marginTop: 24,
		shadowColor: "#000",
		shadowOffset: {
			width: 0,
			height: 4
		},
		shadowOpacity: 0.3,
		shadowRadius: 4.65,
		elevation: 1,
		marginLeft: 24,
		marginRight: 24
	},
	viewActiveItemLast: {
		borderRadius: borderRadius,
		width: "88%",
		height: 168,
		backgroundColor: "#ffffff",
		marginTop: 24,
		marginBottom: 90,
		shadowColor: "#000",
		shadowOffset: {
			width: 0,
			height: 4
		},
		shadowOpacity: 0.3,
		shadowRadius: 4.65,
		elevation: 1,
		marginLeft: 24,
		marginRight: 24
	},
	containerView: {
		flex: 1,
		borderRadius: borderRadius,
		flexDirection: "column",
		justifyContent: "flex-start",
		paddingTop: 21,
		paddingLeft: 24,
		paddingRight: 24
	},

	bookingTextStyle: {
		fontFamily: "montserrat",
		fontSize: 12,
		fontWeight: "200",
		fontStyle: "normal",
		lineHeight: 18,
		letterSpacing: 0,
		color: "#000000"
	},
	bookingValueStyle: {
		fontFamily: "montserrat",
		fontSize: 12,
		fontWeight: "bold",
		fontStyle: "normal",
		lineHeight: 18,
		letterSpacing: 0,
		color: "#000000"
	},

	validityTextStyle: {
		fontFamily: "montserrat",
		fontSize: 12,
		fontWeight: "200",
		fontStyle: "normal",
		lineHeight: 18,
		letterSpacing: 0,
		color: "#000000"
	},
	validityValueStyle: {
		fontFamily: "montserrat",
		fontSize: 10,
		fontWeight: "normal",
		fontStyle: "normal",
		lineHeight: 14,
		letterSpacing: 0,
		textAlign: "right",
		color: "#787878"
	},
	placeValueStyle: {
		fontFamily: "montserrat",
		fontSize: 16,
		fontWeight: "600",
		fontStyle: "normal",
		lineHeight: 18,
		letterSpacing: 0,
		color: "#000000"
	},
	tripValueStyle: {
		fontFamily: "montserrat",
		fontSize: 14,
		fontWeight: "300",
		fontStyle: "normal",
		lineHeight: 19,
		letterSpacing: 0,
		color: "#000000"
	},
	amountValueStyle: {
		fontFamily: "montserrat",
		fontSize: 14,
		fontWeight: "300",
		fontStyle: "normal",
		lineHeight: 20,
		letterSpacing: 0,
		color: "#000000"
	},
	containerFirstView: {
		borderTopLeftRadius: borderRadius,
		borderTopRightRadius: borderRadius,
		flexDirection: "row",
		justifyContent: "space-between",
		width: "100%"
	},
	containerFirstInner1: { flex: 1, justifyContent: "flex-start" },
	containerFirstInner2: { flex: 1, justifyContent: "flex-start", alignItems: "flex-end" },
	line: {
		width: "100%",
		height: 1,
		borderStyle: "solid",
		borderWidth: 1,
		borderColor: "#eaeaea",
		marginTop: 3.5,
		marginBottom: 7.5
	}
};

export { KliaTicketList };
