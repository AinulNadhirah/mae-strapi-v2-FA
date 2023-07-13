import React from "react";
import { View, Text, FlatList, TouchableOpacity } from "react-native";
import { OverlappingPictures } from "./overlappingPictures";
import { MyView } from "./MyView";
import * as Progress from "react-native-progress";

const SplitBillsList = ({
	data,
	callback,

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
				activeOpacity={0.9}
				onPress={() => callback(item)}
				style={length == index + 1 ? Styles.splitBillCardLastItem : Styles.splitBillCardItem}
			>
				<View style={invitedBills ? Styles.splitBillCardViewInvited : Styles.splitBillCardView}>
					<View style={invitedBills ? Styles.splitBillInnerCardViewInvited : Styles.splitBillInnerCardView}>
						<Text
							style={[Styles.title]}
							accessible={true}
							testID={"txtCARD_NO"}
							accessibilityLabel={"txtCARD_NO"}
						>
							{item.title}
						</Text>
						<View style={Styles.userImageView}>
							<OverlappingPictures
								picArray={item.picArrayDisplay}
								small={false}
								reverse={true}
								medium={true}
							/>
						</View>
						<Text
							style={[Styles.collectedLabel]}
							accessible={true}
							testID={"txtCARD_NO"}
							accessibilityLabel={"txtCARD_NO"}
						>
							{item.collectedText}
						</Text>
						<Text
							style={[Styles.amountLabel]}
							accessible={true}
							testID={"txtCARD_NO"}
							accessibilityLabel={"txtCARD_NO"}
						>
							{item.amountText}
						</Text>

						<View style={[Styles.progressBarView]}>
							<MyView hide={invitedBills}>
								{/* <ProgressBarAndroid
                                    style={[Styles.progressBar]}
                                    styleAttr="Horizontal"
                                    indeterminate={false}
                                    progress={item.progress}
                                    color="#4a90e2"
                                /> */}
								<Progress.Bar
									progress={item.progress}
									style={[Styles.progressBar]}
									width={null}
									height={7}
									animated={false}
									borderRadius={3}
									borderWidth={0}
									color={"#4a90e2"}
									unfilledColor={"#ececee"}
									borderColor={"#4a90e2"}
								/>
							</MyView>
						</View>

						<Text
							style={[Styles.createdLabel]}
							accessible={true}
							testID={"txtCARD_NO"}
							accessibilityLabel={"txtCARD_NO"}
						>
							{item.createdText}
						</Text>
					</View>

					<MyView style={Styles.splitBillInnerCardView2} hide={!invitedBills}>
						<MyView style={Styles.splitBillInnerCardView2} hide={!item.amountText}>
							<MyView style={Styles.splitBillInnerCardView2} hide={item.paid}>
								<TouchableOpacity onPress={() => buttonCallback(item)}>
									<Text
										style={[Styles.payNowLabelInvited]}
										accessible={true}
										testID={"txtCARD_NO"}
										accessibilityLabel={"txtCARD_NO"}
									>
										{buttonText}
									</Text>
								</TouchableOpacity>
							</MyView>
						</MyView>
					</MyView>
				</View>
			</TouchableOpacity>
		);
	}

	return (
		<View>
			<FlatList
				style={Styles.flatList}
				data={data}
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
		width: "100%",
		height: 185,
		marginTop: 10,
		shadowColor: "#000",
		shadowOffset: {
			width: 0,
			height: 3
		},
		shadowOpacity: 0.27,
		shadowRadius: 4.65,
		elevation: 6
	},
	splitBillCardLastItem: {
		marginTop: 10,
		width: "100%",
		height: 185,
		marginBottom: 100,
		shadowOffset: {
			width: 0,
			height: 3
		},
		shadowOpacity: 0.27,
		shadowRadius: 4.65,
		elevation: 6
	},

	splitBillCardView: {
		flex: 1,
		borderRadius: 11,
		backgroundColor: "#fff",
		flexDirection: "row"
	},
	splitBillCardViewInvited: {
		flex: 1,
		borderRadius: 11,
		backgroundColor: "#fff",
		flexDirection: "row"
	},

	splitBillInnerCardView: {
		flex: 1,
		flexDirection: "column"
	},
	splitBillInnerCardViewInvited: {
		flex: 2,
		borderBottomLeftRadius: 11,
		borderTopLeftRadius: 11,
		flexDirection: "column"
	},

	splitBillInnerCardView2: {
		flex: 1,
		borderBottomRightRadius: 11,
		borderTopRightRadius: 11,
		flexDirection: "column",
		justifyContent: "center",
		alignContent: "center",
		alignItems: "center"
	},

	title: {
		// fontFamily: 'montserrat_semibold',
		fontFamily: "montserrat",
		fontSize: 15,
		fontWeight: "600",
		fontStyle: "normal",
		lineHeight: 19,
		letterSpacing: 0,
		color: "#000000",
		marginTop: 15,
		marginLeft: 20
	},
	collectedLabel: {
		// fontFamily: 'montserrat_regular',
		fontFamily: "montserrat",
		fontSize: 13,
		fontWeight: "normal",
		fontStyle: "normal",
		lineHeight: 17,
		letterSpacing: 0,
		color: "#000000",

		marginTop: 45,
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
		color: "#000000",

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
		// fontFamily: 'montserrat_semibold',
		fontFamily: "montserrat",
		fontSize: 13,
		fontWeight: "600",
		fontStyle: "normal",
		lineHeight: 17,
		letterSpacing: 0,
		color: "#000000",

		marginTop: 5,
		marginLeft: 20
	},
	progressBar: {
		marginLeft: 20,
		marginRight: 20,
		borderRadius: 10
	},
	progressBarView: {
		marginTop: 5
	},
	userImageView: {
		flexDirection: "row",
		marginLeft: 20,
		marginTop: 10
	}
};

export { SplitBillsList };
