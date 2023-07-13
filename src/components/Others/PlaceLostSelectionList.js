/* eslint-disable react/jsx-no-bind */
/* eslint-disable react/prop-types */
import React from "react";
import { Text, View, TouchableOpacity, FlatList, Image } from "react-native";

const PlaceLostSelectionList = ({ data, callback, scrollToIndex, isLocal = true }) => {
	return (
		<View>
			<FlatList
				data={data}
				extraData={data}
				scrollToIndex={scrollToIndex}
				showsHorizontalScrollIndicator={false}
				showIndicator={false}
				keyExtractor={(item, index) => `${item.contentId}-${index}`}
				renderItem={({ item, index }) => (
					<TouchableOpacity onPress={() => callback(item)} activeOpacity={1.0}>
						<View>
							<View style={Styles.newTransferLastView}>
								<View style={Styles.newTransferViewInner1}>
									{item.showImage ? (
										<View style={Styles.circleImageView}>
											<Image
												style={item.imgStyle ? item.imgStyle : Styles.newTransferCircle}
												source={
													isLocal
														? item.image
														: {
																uri:
																	item.image.indexOf("http") != -1
																		? item.image
																		: `data:image/png;base64,${item.image}`
														  }
												}
												resizeMode="contain"
											/>
										</View>
									) : (
										<View style={Styles.newTransferCircleBuddies}>
											<Text
												style={Styles.shortNameLabelBlack}
												accessible={true}
												testID={"txtByClickingNext"}
												accessibilityLabel={"txtByClickingNext"}
											>
												{item.name === undefined ||
												item.name === "undefined" ||
												item.name === null ||
												item.name === "null"
													? ""
													: item.name
															.split(/\s/)
															.reduce(
																(response, word) => (response += word.slice(0, 2)),
																""
															)
															.toUpperCase()
															.substring(0, 2)}
											</Text>
										</View>
									)}
								</View>
								<View style={Styles.newTransferViewInnerHalf}>
									<Text
										style={Styles.nameLabelBlack}
										accessible={true}
										testID={"txtByClickingNext"}
										accessibilityLabel={"txtByClickingNext"}
									>
										{item.name}
									</Text>
								</View>
							</View>
							<View style={Styles.line} />
						</View>
					</TouchableOpacity>
				)}
				testID={"favList"}
				accessibilityLabel={"favList"}
			/>
		</View>
	);
};
const Styles = {
	line: {
		width: "90%",
		height: 1.1,
		borderStyle: "solid",
		borderWidth: 1,
		borderColor: "#eaeaea"
	},
	newTransferLastView: {
		width: "90%",
		height: 80,
		minWidth: "90%",
		marginBottom: 12,
		marginTop: 10,
		backgroundColor: "#f8f8f8",
		flexDirection: "row"
	},

	newTransferViewInner1: {
		flex: 1.4,
		borderTopLeftRadius: 50,
		borderBottomLeftRadius: 50,
		flexDirection: "column"
	},
	newTransferViewInner2: {
		flex: 3.5,
		justifyContent: "center",
		flexDirection: "column"
	},
	newTransferViewInner22: {
		flex: 2.2,
		justifyContent: "center",
		flexDirection: "column"
	},
	newTransferViewInner44: {
		flex: 5,
		justifyContent: "center",
		flexDirection: "column"
	},
	newTransferViewInnerHalf: {
		flex: 4,
		//backgroundColor:"green",
		justifyContent: "center",
		flexDirection: "column"
	},

	newTransferViewInner3: {
		flex: 1,
		//backgroundColor:"blue",
		borderTopRightRadius: 50,
		borderBottomRightRadius: 50,
		justifyContent: "center",
		flexDirection: "column"
	},
	newTransferViewInner33: {
		flex: 2,
		borderTopRightRadius: 50,
		borderBottomRightRadius: 50,
		justifyContent: "center",
		flexDirection: "column"
	},

	newTransferViewInnerAction5: {
		flex: 1.8,
		//backgroundColor:"blue",
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
		fontSize: 24,
		fontWeight: "300",
		fontStyle: "normal",
		letterSpacing: 0,
		textAlign: "center",
		color: "#7c7c7d"
	},
	nameLabelBlack: {
		fontFamily: "montserrat",
		fontSize: 14,
		fontWeight: "600",
		fontStyle: "normal",
		marginLeft: 5,
		lineHeight: 18,
		letterSpacing: 0,
		color: "#000000"
	},

	decLabelBlack: {
		fontFamily: "montserrat",
		fontSize: 13,
		fontWeight: "normal",
		fontStyle: "normal",
		marginLeft: 15,
		color: "#212121"
	},
	decLabelPaid: {
		fontFamily: "montserrat",
		fontSize: 13,
		fontWeight: "bold",
		fontStyle: "normal",
		marginLeft: 15,
		color: "#31a181"
	},
	decLabelUnPaid: {
		fontFamily: "montserrat",
		fontSize: 13,
		fontWeight: "bold",
		fontStyle: "normal",
		marginLeft: 15,
		color: "#ed5565"
	},
	accountLabelBlack: {
		fontFamily: "montserrat",
		fontSize: 9,
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
		borderRadius: 64 / 2,
		marginLeft: 0,
		marginTop: 0,

		flexDirection: "row",
		justifyContent: "center",
		alignContent: "center",
		alignItems: "center"
	},
	newTransferCircleBuddies: {
		width: 64,
		height: 64,
		borderRadius: 50,
		marginLeft: 7,
		marginTop: 8,
		borderWidth: 2,
		borderColor: "#ffffff",
		backgroundColor: "#D8D8D8",
		flexDirection: "row",
		justifyContent: "center",
		alignContent: "center",
		alignItems: "center",
		shadowColor: "#000",
		shadowOffset: {
			width: 0,
			height: 2
		},
		shadowOpacity: 0.23,
		shadowRadius: 2.62,
		elevation: 4
	},
	newTransferCircleIcon: {
		width: 48,
		height: 48
	},
	closeImgBottom: {
		width: 32,
		height: 32,
		borderRadius: 32 / 2
	},
	closeImg: {
		width: 32,
		height: 32,
		borderRadius: 32 / 2
	},
	rightTextView: {
		height: 32,
		marginTop: 10
	},
	closeMoreImg: {
		width: 26,
		height: 6,
		borderRadius: 29 / 2
	},
	circleImageView: {
		width: 68,
		height: 68,
		borderRadius: 68 / 2,
		marginLeft: 7,
		marginTop: 8,
		borderWidth: 2,
		borderColor: "#ffffff",
		flexDirection: "row",
		justifyContent: "center",
		alignContent: "center",
		alignItems: "center",
		shadowColor: "#000",
		shadowOffset: {
			width: 0,
			height: 2
		},
		shadowOpacity: 0.23,
		shadowRadius: 2.62,
		elevation: 4
	}
};
export default PlaceLostSelectionList;
