import { StyleSheet, Dimensions, Platform } from "react-native";
export const blueBackgroundColor = "#f8f5f3";
export const { width, height } = Dimensions.get("window");

export default StyleSheet.create({
	addIcon: {
		borderRadius: 70 / 2,
		height: 70,
		width: 70
	},
	addIconButton: {
		width: 36,
		height: 36,
		marginTop: -1,
		//backgroundColor:"yellow",
		alignItems: "center",
		alignContent: "center",
		justifyContent: "center",
		flexDirection: "row",
		borderRadius: 38 / 2
	},
	amountCenter: {
		alignItems: "center",
		flexDirection: "row",
		justifyContent: "center",
		marginTop: 5
	},
	amountTextBlack: {
		color: "#000000",
		fontFamily: "montserrat",
		fontSize: 11,
		fontStyle: "normal",
		fontWeight: "normal",
		letterSpacing: 0,
		lineHeight: 16
	},
	amountView7: {
		alignItems: "center",
		flexDirection: "row",
		flex: 1,
		marginRight: 35,
		marginTop: 40
	},
	amountView8: {
		alignItems: "center",
		flexDirection: "row",
		flex: 1,
		height: 50,

		marginBottom: 30,
		marginTop: 10
	},
	amountViewOthers: {
		alignItems: "center",
		flexDirection: "row",
		flex: 1,
		marginRight: 35,
		marginTop: 20
	},
	amtLabel: {
		color: "#000000",
		flex: 2,
		fontSize: 15,
		fontStyle: "normal",
		fontWeight: "normal",
		letterSpacing: 0,
		lineHeight: 19
	},
	amtLabel2: {
		color: "black",
		flex: 1,
		fontFamily: "montserrat",
		fontSize: 15,
		fontWeight: "normal"
	},
	amtValueLabel: {
		color: "#7c7c7d",
		flex: 1,
		fontSize: 15,
		fontStyle: "normal",
		fontWeight: "600",
		marginRight: 0,
		textAlign: "right"
	},
	amtValueLabelEdit: {
		color: "#4a90e2",
		flex: 1,
		fontFamily: "montserrat",
		fontSize: 15,
		fontStyle: "normal",
		fontWeight: "600",
		marginRight: 0,
		textAlign: "right"
	},
	amtValueLabelEdit: {
		color: "#4a90e2",
		flex: 1,
		fontFamily: "montserrat",
		fontSize: 15,
		fontStyle: "normal",
		fontWeight: "600",
		marginRight: 0,
		textAlign: "right"
	},
	billTitleText: {
		color: "#4a90e2",
		fontSize: 23,
		fontStyle: "normal",
		fontWeight: "bold",
		letterSpacing: 0,
		lineHeight: 31
	},
	billTitleView: {
		flexDirection: "row",
		alignItems: "center",
		marginTop: 20,
		// backgroundColor: "green",
		flex: 1
	},
	buddiesListView: {
		alignItems: "center",
		marginLeft: 0,
		marginTop: 38
	},
	buttonButton1: {
		flexDirection: "column",
		marginLeft: -20,
		marginRight: 55
	},
	buttonButton2: {
		flexDirection: "column",
		marginBottom: 1,
		marginLeft: -20,
		marginTop: -20
	},
	cardSmallContainerCenter1: {
		marginTop: 10,
		marginLeft: 35,
		// backgroundColor:"green",
		justifyContent: "flex-start",
		flexDirection: "row",
		marginBottom: 0
	},
	cardSmallContainerCenter2: {
		flexDirection: "row",
		justifyContent: "flex-start",
		marginBottom: 0,
		marginLeft: 0,
		marginTop: 10
	},
	cardSmallContainerCenter3: {
		flexDirection: "row",
		justifyContent: "flex-start",
		marginBottom: 0,
		marginLeft: 45,
		marginTop: 43
	},
	container: {
		backgroundColor: "#fff",
		flex: 1,
		marginTop: Platform.OS === "ios" ? 0 : 0
	},
	containerBlue: {
		backgroundColor: blueBackgroundColor,
		flex: 1,
		marginTop: Platform.OS === "ios" ? 0 : 0
	},
	containerHeaderView: {
		backgroundColor: "transparent",
		flexDirection: "row",
		height: 100,
		marginTop: 0,
		position: "absolute",
		top: 0,
		width: "100%"
	},
	containerInner1View: {
		flexDirection: "column",
		flex: 1,
		marginLeft: 35,
		marginRight: 35
	},
	containerInnerAllCenterView: {
		flexDirection: "row",
		flex: 1,
		justifyContent: "center",
		alignContent: "center",
		alignItems: "center"
	},
	containerInnerNewView: {
		flexDirection: "column",
		flex: 1,
		marginLeft: 35
	},
	containerInnerScrollDetailsView: {
		flex: 1
	},
	containerInnerScrollView: {
		flex: 1
	},
	containerInnerView: {
		flexDirection: "column",
		flex: 1,
		marginLeft: 50
	},
	containerInnerView1: {
		flexDirection: "column",
		flex: 1
	},

	containerScrollDetailsView: {
		elevation: 1,
		flex: 1
	},

	containerTransparentView: {
		backgroundColor: "transparent",
		flex: 1
	},

	containerView: {
		backgroundColor: "transparent",
		flex: 1
	},

	descText4: {
		color: "#000000",
		fontSize: 23,
		fontStyle: "normal",
		fontWeight: "bold",
		letterSpacing: 0,
		lineHeight: 23,
		marginTop: 5
	},
	descText5: {
		color: "#000000",
		fontSize: 15,
		fontStyle: "normal",
		fontWeight: "normal",
		letterSpacing: 0,
		lineHeight: 19
	},
	descriptionContainerCenter: {
		flexDirection: "row",
		justifyContent: "center",
		marginTop: 5
	},
	detailsCollectionInvitedView: {
		marginTop: 28
	},
	detailsCollectionView: {
		marginTop: 100
	},
	detailsDescLabel: {
		color: "black",
		fontFamily: "montserrat",
		fontSize: 20,
		fontWeight: "200"
	},
	detailsDescWhiteLabel: {
		color: "#ffffff",
		fontSize: 20,
		fontStyle: "normal",
		fontWeight: "300",
		letterSpacing: 0,
		lineHeight: 30
	},
	detailsDoneView: {
		marginTop: 60
	},
	detailsInnerView: {
		alignItems: "flex-start",
		flex: 1,
		flexDirection: "column"
	},
	detailsTitlesLabel: {
		color: "black",
		fontFamily: "montserrat",
		fontSize: 15,
		fontStyle: "normal",
		fontWeight: "600",
		letterSpacing: 0,
		lineHeight: 19
	},
	detailsTitlesView: {
		flexDirection: "column",
		marginTop: 10
	},
	detailsTitlesWhiteLabel: {
		color: "#ffffff",
		fontFamily: "montserrat",
		fontSize: 15,
		fontStyle: "normal",
		fontWeight: "600",
		letterSpacing: 0,
		lineHeight: 19
	},
	editIcon: {
		height: 18,
		width: 18
	},
	editIconView: {
		alignItems: "center",
		flex: 0.8,
		flexDirection: "row"
	},
	editIconView1: {
		alignItems: "center",
		flex: 1,
		flexDirection: "row"
	},
	editIconView2: {
		alignItems: "center",
		flex: 2,
		flexDirection: "row"
	},
	editIconView3: {
		alignItems: "flex-end",
		flex: 1,
		flexDirection: "row"
	},
	firstBlueBackground: {
		backgroundColor: "#f8f5f3",
		flexDirection: "row",
		height: height + 55,
		width: "100%"
	},
	firstImageBackground: {
		flexDirection: "row",
		height: height + 55,
		width: "100%"
	},
	firstView: {
		marginTop: 3
	},
	firstViewDetails: {
		flexDirection: "row",
		height: height + 55,
		width: "100%"
	},

	firstViewOne: {
		flex: 4,
		flexDirection: "column",
		marginLeft: 35,
		marginRight: 10
	},

	flexInnerScrollMarginView: {
		flex: 1,
		flexDirection: "column",
		marginLeft: 35
		// backgroundColor: 'blue',
	},
	flexInnerScrollView: {
		flex: 1,
		flexDirection: "column"
		// backgroundColor: 'blue',
	},
	flexInnerScrollView1: {
		flex: 1,
		flexDirection: "column",
		alignItems: "center",
		backgroundColor: "yellow"
	},
	flexInnerScrollView10: {
		flex: 1,
		flexDirection: "row"
		// backgroundColor: 'blue',
	},

	flexInnerScrollView5: {
		flex: 1,
		flexDirection: "column",
		alignItems: "flex-start"
		//backgroundColor: 'yellow',
	},
	flexOne: {
		flex: 1,
		flexDirection: "column",
		backgroundColor: "#ffff"
	},
	flexOneBlue: {
		flex: 1,
		flexDirection: "column",
		backgroundColor: blueBackgroundColor
	},
	flexOneGray: {
		flex: 1,
		flexDirection: "column",
		backgroundColor: "#f8f5f3"
	},
	flexScrollView: {
		flex: 1,
		flexDirection: "column"
		// backgroundColor: 'green',
	},
	footerCenterNoView: {
		alignItems: "center",
		bottom: 0,
		flexDirection: "column",
		height: 90,
		justifyContent: "center",
		marginBottom: 1,
		position: "absolute",
		width: "100%"
	},
	footerCenterView: {
		alignItems: "center",
		bottom: 0,
		flexDirection: "column",
		height: 90,
		justifyContent: "center",
		marginBottom: 1,
		marginLeft: 35,
		marginRight: 35,
		position: "absolute",
		width: "83%"
	},
	footerView: {
		alignItems: "flex-end",
		bottom: 0,
		flexDirection: "column",
		height: 90,
		justifyContent: "flex-end",
		marginBottom: 1,
		marginLeft: 55,
		marginRight: 55,
		position: "absolute",
		width: "90%"
	},
	hiddenText: {
		color: "transparent",
		fontSize: 1
	},
	indicator2: {
		backgroundColor: "transparent"
	},
	innerScrollView: {
		flex: 1
	},
	innerViewViewOne: {
		flex: 1,

		flexDirection: "column"
	},
	inputCardNoView: {
		flex: 4,
		flexDirection: "row",
		alignItems: "flex-end",
		justifyContent: "flex-end"
	},
	label: {
		color: "#000",
		fontFamily: "montserrat",
		fontSize: 13,
		fontWeight: "600",
		// fontFamily: "montserrat_bold"
		fontFamily: "montserrat"
	},
	nonMayaView1: {
		marginTop: 30
	},
	nonMayaView2: {
		marginTop: 40
	},
	oweAmountLabel: {
		color: "black",
		fontFamily: "montserrat",
		fontSize: 20,
		fontWeight: "800",
		marginBottom: 19,
		marginTop: 10
	},
	oweAmountWhiteLabel: {
		color: "#ffffff",
		fontFamily: "montserrat",
		fontSize: 20,
		fontWeight: "800",
		marginBottom: 19,
		marginTop: 10
	},
	peopleImage: {
		height: (height * 40) / 667,
		resizeMode: "contain",
		width: (width * 45) / 375
	},
	receiptIcon: {
		height: 70,
		width: 70
	},
	receiptView8: {
		alignItems: "center",
		flexDirection: "row",
		flex: 1,
		marginTop: 36
	},
	scrollContainerBlue: {
		alignItems: "center",
		backgroundColor: "#f8f8f8",
		flex: 1,
		marginTop: 0,
		width: "100%"
	},

	scrollWidth: {
		flex: 1,
		width: "100%"
	},
	secondView: {
		marginTop: 3
	},
	secondViewDetails: {
		backgroundColor: "#ffff",
		flexDirection: "row",

		width: "100%"
	},
	secondViewOne: {
		backgroundColor: blueBackgroundColor,
		flex: 2,
		flexDirection: "column"
	},
	secondViewOneInner: {
		flex: 1,
		flexDirection: "column",
		marginLeft: 55,
		marginRight: 55
	},
	sendMoneyLeftDesc: {
		color: "#000000",
		fontSize: 13,
		fontStyle: "normal",
		fontWeight: "normal",
		letterSpacing: 0,
		lineHeight: 17,
		marginTop: 28
	},
	sendMoneyLeftImage: {
		height: 31.6,
		marginLeft: 28,
		marginRight: 15,
		marginTop: 28,
		width: 64
	},
	sendRequestCardDummyView: {
		height: 123,
		margin: 35,
		width: "82%"
	},
	sendRequestCardInnerView: {
		flexDirection: "row",
		width: "100%"
	},
	sendRequestCardView: {
		backgroundColor: "#fff",
		borderRadius: 11,
		height: 123,
		margin: 35,
		marginTop: 16,
		width: "82%"
	},
	splitBillBottomLeftImage: {
		height: 21,
		marginLeft: 22,
		marginTop: 13,
		width: 23
	},
	splitBillBottomLeftView: {
		borderBottomLeftRadius: 11,
		flexDirection: "row",
		height: 43,
		width: "50%"
	},
	splitBillBottomRightView: {
		borderBottomRightRadius: 11,
		borderColor: "gray",
		borderLeftWidth: 0.2,
		flexDirection: "row",
		height: 43,
		width: "50%"
	},

	splitBillBottomView: {
		borderBottomLeftRadius: 11,
		borderBottomRightRadius: 11,
		flexDirection: "row",
		height: 43,
		width: "100%"
	},
	splitBillBottomView: {
		borderBottomLeftRadius: 11,
		borderBottomRightRadius: 11,
		flexDirection: "row",
		height: 43,
		width: "100%"
	},
	splitBillCardDesc: {
		color: "#000000",
		fontSize: 13,
		fontStyle: "normal",
		fontWeight: "normal",
		letterSpacing: 0,
		lineHeight: 17,
		marginLeft: 24,
		marginRight: 21,
		marginTop: 24
	},
	splitBillCardTile: {
		color: "#000000",
		fontSize: 15,
		fontStyle: "normal",
		fontWeight: "600",
		letterSpacing: 0,
		lineHeight: 19,
		marginLeft: 20,
		marginTop: 15
	},

	splitBillCardView: {
		backgroundColor: "#fff",
		borderRadius: 11,
		height: 185,
		margin: 35,
		width: "82%"
	},
	splitBillSmall: {
		color: "#4a90e2",
		fontSize: 13,
		fontStyle: "normal",
		fontWeight: "600",
		letterSpacing: 0,
		lineHeight: 17,
		marginLeft: 10,
		marginTop: 15
	},
	splitBillTopLeftImage: {
		height: 66,
		marginLeft: 22,
		marginTop: 13,
		width: 61
	},
	splitBillTopLeftView: {
		borderTopLeftRadius: 11,
		height: 142,
		width: "30%"
	},
	splitBillTopRightView: {
		alignItems: "center",
		borderTopRightRadius: 11,
		flexDirection: "row",
		height: 142,
		justifyContent: "flex-start",
		width: "70%"
	},
	splitBillTopView: {
		borderBottomWidth: 0.2,
		borderColor: "gray",
		borderTopLeftRadius: 11,
		borderTopRightRadius: 11,
		flexDirection: "row",
		height: 142,
		width: "100%"
	},
	tab: { backgroundColor: "transparent", height: 70 },
	tabBlue: { backgroundColor: "transparent", height: 70 },
	tabbar: {
		backgroundColor: "#fff",
		height: 70
	},
	tabbarBlue: {
		height: 70,
		width: "100%",
		backgroundColor: "transparent",
		marginLeft: "10%",
		// fontFamily: "montserrat_bold"
		fontFamily: "montserrat"
	},
	tabbarSplitBill: {
		backgroundColor: "transparent",
		elevation: 0,
		height: 70
	},
	thirdView: {
		marginTop: 23
	},
	titleContainerCenterAck1: {
		flexDirection: "column",
		justifyContent: "center",
		marginLeft: 20,
		marginTop: 1
	},
	titleNonMayaText1: {
		color: "#000000",
		fontSize: 20,
		fontStyle: "normal",
		fontWeight: "300",
		letterSpacing: 0,
		lineHeight: 30
	},
	titleNonMayaText2: {
		color: "#000000",
		fontSize: 20,
		fontStyle: "normal",
		fontWeight: "300",
		letterSpacing: 0,
		lineHeight: 30,
		marginTop: 20
	},
	titleText3: {
		color: "#000000",
		fontSize: 15,
		fontStyle: "normal",
		fontWeight: "600",
		letterSpacing: 0,
		lineHeight: 19
	},
	titleText4: {
		color: "#000000",
		fontSize: 17,
		fontStyle: "normal",
		fontWeight: "600",
		letterSpacing: 0,
		lineHeight: 32
	},
	topText: {
		color: "#7c7c7d",
		fontSize: 13,
		fontWeight: "100",
		marginLeft: 35,
		marginRight: 10,
		marginRight: 35,
		textAlign: "center"
	},
	userImageView: {
		flexDirection: "row",
		height: 55,
		marginTop: 122
	},
	userImageView1: {
		elevation: 1,
		height: 40,
		marginTop: 5,
		position: "relative"
	},
	userImageView3: {
		elevation: -1,
		flexDirection: "row",
		height: 55,
		marginLeft: -3
	},
	usersImagesContainer: {
		alignItems: "flex-start",
		flexDirection: "row",
		height: 55,
		marginTop: 43
	},
	usersImagesView: {
		alignItems: "flex-start",

		flex: 1,
		flexDirection: "row"
	},
	usersImagesViewFirst: {
		alignItems: "flex-start",
		flexDirection: "row",
		height: 55
	},
	usersView2: {
		alignItems: "flex-start",
		flexDirection: "row"
	}
});
