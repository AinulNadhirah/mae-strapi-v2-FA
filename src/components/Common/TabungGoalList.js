/* eslint-disable react/jsx-no-bind */
/* eslint-disable react/prop-types */
import React from "react";
import { View, Text, FlatList, TouchableHighlight, ImageBackground } from "react-native";
import { OverlappingPictures } from "./overlappingPictures";
import { MyView } from "./MyView";
import { StatusTextView } from "./StatusTextView";
import * as Progress from "react-native-progress";
const borderRadius = 12 / 2;
const TabungGoalList = ({ data, callback, scrollToIndex, length }) => {
	function renderItem({ item, index }) {
		return (
			<TouchableHighlight
				onPress={() => callback(item)}
				style={length == index + 1 ? Styles.splitBillCardLastItem : Styles.splitBillCardItem}
			>
				<ImageBackground
					style={Styles.backgroundItem}
					resizeMethod="scale"
					resizeMode="stretch"
					// eslint-disable-next-line react-native/no-inline-styles
					imageStyle={{ borderRadius: 6 / 2 }}
					source={{
						uri: item.backgroundImage
					}}
				>
					<View style={Styles.backgroundItemInner} />
					<View style={Styles.splitBillCardView}>
						<View style={Styles.splitBillInnerCardView}>
							<View style={Styles.userImageView}>
								<View style={Styles.titleView}>
									<Text
										style={[Styles.title]}
										accessible={true}
										testID={"txtCARD_NO"}
										accessibilityLabel={"txtCARD_NO"}
									>
										{item.title}
									</Text>
								</View>
								<View
									style={
										item.picArrayDisplay != undefined
											? item.picArrayDisplay.length === 1 || item.picArrayDisplay.length === 0
												? Styles.rightImageView1
												: item.picArrayDisplay.length === 2
												? Styles.rightImageView2
												: item.picArrayDisplay.length === 3
												? Styles.rightImageView3
												: item.picArrayDisplay.length === 4
												? Styles.rightImageView4
												: Styles.rightImageView5
											: Styles.rightImageView5
									}
								>
									{item.picArrayDisplay != undefined ? (
										<OverlappingPictures
											picArray={item.picArrayDisplay}
											small={false}
											reverse={true}
											medium={false}
											custom={true}
											customSize={36}
											backgroundColor={"#cfcfcf"}
										/>
									) : (
										<View />
									)}
								</View>
							</View>

							<MyView hide={item.status === undefined}>
								<View style={Styles.statusView}>
									<StatusTextView
										status={
											item.isClosed
												? "CLOSED"
												: item.status === "CANCEL"
												? "CANCELLED"
												: item.status
										}
									/>
								</View>
							</MyView>

							{/* <MyView hide={item.status != undefined && item.status != "ACTIVE"}>
								<Text
									style={[Styles.collectedLabel]}
									accessible={true}
									testID={"txtCARD_NO"}
									accessibilityLabel={"txtCARD_NO"}
								>
									{item.collectedText}
								</Text>
							</MyView> */}

							<Text
								style={[Styles.amountLabel]}
								accessible={true}
								testID={"txtCARD_NO"}
								accessibilityLabel={"txtCARD_NO"}
							>
								{item.amountText}
							</Text>

							<View style={[Styles.progressBarView]}>
								{item.isClosed ? (
									<View />
								) : (
									<View>
										<Progress.Bar
											progress={item.progress2}
											style={[Styles.progressBar]}
											width={null}
											height={7}
											animated={false}
											borderRadius={3}
											borderWidth={0}
											color={"#67cc89"}
											unfilledColor={"#ececee"}
											borderColor={"#67cc89"}
										/>

										<Progress.Bar
											progress={item.progress}
											style={[Styles.progressBar2]}
											width={null}
											height={7}
											animated={false}
											borderRadius={3}
											borderWidth={0}
											color={"#469561"}
											unfilledColor={"transparent"}
											borderColor={"#469561"}
										/>
									</View>
								)}
								<View style={[Styles.progressBarTextView]}>
									<Text
										style={[Styles.createdLabel]}
										accessible={true}
										testID={"txtCARD_NO"}
										accessibilityLabel={"txtCARD_NO"}
									>
										{item.createdText}
									</Text>
									<Text
										style={[Styles.activeLabel]}
										accessible={true}
										testID={"txtCARD_NO"}
										accessibilityLabel={"txtCARD_NO"}
									>
										{item.rightText}
									</Text>
								</View>
							</View>
						</View>
					</View>
				</ImageBackground>
			</TouchableHighlight>
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
		borderRadius: borderRadius,
		width: "100%",
		height: 174,
		marginTop: 10
	},
	splitBillCardLastItem: {
		borderRadius: borderRadius,
		marginTop: 10,
		width: "100%",
		height: 174,
		marginBottom: 10
	},
	backgroundItem: {
		flex: 1,
		borderRadius: borderRadius,
		flexDirection: "row"
	},
	backgroundItemInner: {
		flex: 1,
		width: "100%",
		height: "100%",
		borderRadius: borderRadius,
		flexDirection: "column",
		position: "absolute",
		backgroundColor: "#000000",
		opacity: 0.666
	},

	backgroundItemOpacity: {
		flex: 1,
		borderRadius: borderRadius
	},

	splitBillCardView: {
		flex: 1,
		flexDirection: "row",
		width: "100%",
		height: "100%",
		borderRadius: borderRadius
	},

	splitBillInnerCardView: {
		flex: 1,
		flexDirection: "column"
	},
	splitBillInnerCardViewInvited: {
		flex: 2,
		flexDirection: "column"
	},

	splitBillInnerCardView2: {
		flex: 1,
		flexDirection: "column",
		justifyContent: "center",
		alignContent: "center",
		alignItems: "center"
	},

	title: {
		// fontFamily: 'montserrat_semibold',
		fontFamily: "montserrat",
		fontSize: 13,
		fontWeight: "600",
		fontStyle: "normal",
		lineHeight: 18,
		letterSpacing: -0.15,
		color: "#ffffff",
		marginTop: 15,
		marginLeft: 20
	},
	collectedLabel: {
		// fontFamily: 'montserrat_regular',
		fontFamily: "montserrat",
		fontSize: 13,
		fontWeight: "normal",
		fontStyle: "normal",
		lineHeight: 18,
		letterSpacing: -0.15,
		color: "#ffffff",

		marginTop: 4,
		marginLeft: 20
	},
	amountLabel: {
		// fontFamily: 'montserrat_semibold',
		fontFamily: "montserrat",
		fontSize: 15,
		fontWeight: "600",
		fontStyle: "normal",
		lineHeight: 19,
		letterSpacing: 0,
		color: "#ffffff",

		marginTop: 10,
		marginLeft: 20
	},
	payNowLabelInvited: {
		fontFamily: "montserrat",
		fontSize: 15,
		fontWeight: "600",
		fontStyle: "normal",
		marginRight: 10,
		lineHeight: 19,
		letterSpacing: 0,
		color: "#4190b7"
	},
	createdLabel: {
		flex: 1,
		fontFamily: "montserrat",
		fontSize: 11,
		fontWeight: "normal",
		fontStyle: "normal",
		letterSpacing: 0,
		color: "#ffffff",
		textAlign: "left",
		marginTop: 5,
		marginLeft: 20
	},

	activeLabel: {
		flex: 1,
		fontFamily: "montserrat",
		fontSize: 11,
		fontWeight: "600",
		fontStyle: "normal",
		letterSpacing: 0,
		color: "#ffffff",
		textAlign: "right",
		marginTop: 5,
		marginRight: 20
	},
	progressBar: {
		marginLeft: 20,
		marginRight: 20,
		borderRadius: 10
	},
	progressBar2: {
		marginLeft: 20,
		marginRight: 20,
		borderRadius: 10,
		marginTop: -7
	},
	progressBarView: {
		marginTop: 5
	},
	progressBarTextView: {
		marginTop: 5,
		flexDirection: "row"
	},

	titleView: {
		flex: 4.5,
		flexDirection: "row",
		marginTop: 7
	},
	rightImageView1: {
		flex: 0.6,
		flexDirection: "row",
		marginTop: 20,
		marginRight: 20,
		backgroundColor: "transparent"
	},
	rightImageView2: {
		flex: 1.3,
		flexDirection: "row",
		marginTop: 20,
		marginRight: 20,
		backgroundColor: "transparent"
	},
	rightImageView3: {
		flex: 2.1,
		flexDirection: "row",
		marginTop: 20,
		marginRight: 20,
		backgroundColor: "transparent"
	},
	rightImageView4: {
		flex: 3.2,
		flexDirection: "row",
		marginTop: 20,
		marginRight: 20,
		backgroundColor: "transparent"
	},
	rightImageView5: {
		flex: 4.6,
		flexDirection: "row",
		marginTop: 20,
		marginRight: 20,
		backgroundColor: "transparent"
	},
	userImageView: {
		flexDirection: "row"
	},
	statusView: {
		width: "100%",
		marginTop: 25,
		marginLeft: 20
	}
};

export { TabungGoalList };
