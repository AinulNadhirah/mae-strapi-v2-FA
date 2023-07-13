/* eslint-disable react-native/no-color-literals */
import { StyleSheet, Dimensions, Platform } from "react-native";
export const blueBackgroundColor = "#f8f5f3";
export const { width, height } = Dimensions.get("window");

export const window = Dimensions.get("window");
export const AVATAR_SIZE = 30;
export const ROW_HEIGHT = 60;
export const PARALLAX_HEADER_HEIGHT = 230;
export const STICKY_HEADER_HEIGHT = 90;
export default StyleSheet.create({
	amountDetailText: {
		color: "#000000",
		fontSize: 23,
		fontStyle: "normal",
		fontWeight: "600",
		letterSpacing: -0.43,
		lineHeight: 33,
		textAlign: "center"
	},
	autoDeductAmountLabel: {
		color: "#000000",
		fontSize: 13,
		fontStyle: "italic",
		fontWeight: "600",
		letterSpacing: 0
	},
	autoDeductDateLabel: {
		color: "#000000",
		fontSize: 13,
		fontStyle: "italic",
		fontWeight: "normal",
		letterSpacing: 0,
		marginTop: 8
	},
	autoDeductFrequencyLabel: {
		color: "#000000",
		fontSize: 13,
		fontStyle: "italic",
		fontWeight: "200",
		letterSpacing: 0
	},
	autoDeductView: {
		flexDirection: "row",
		flex: 1,
		marginTop: 20
	},
	autoDeductionDetailLabelLeft: {
		color: "#000000",
		fontSize: 15,
		fontStyle: "normal",
		fontWeight: "normal",
		letterSpacing: 0,
		lineHeight: 23,
		width: 255
	},
	autoDeductionLabelLeft: {
		color: "#000000",
		fontStyle: "normal",
		fontWeight: "600",
		letterSpacing: 0,
		lineHeight: 23
	},
	autoDetectToggle: {},
	avatar: {
		borderRadius: AVATAR_SIZE / 2,
		marginBottom: 10
	},
	avatorViewHeader: {
		flexDirection: "row",
		marginLeft: 0
	},
	background: {
		height: PARALLAX_HEADER_HEIGHT,
		left: 0,
		position: "absolute",
		top: 0,
		width: window.width
	},
	boosterAmountText: {
		color: "#67cc89",
		fontSize: 13,
		fontStyle: "normal",
		fontWeight: "600",
		letterSpacing: 0,
		marginTop: 4,
		textAlign: "center"
	},
	boosterSavingView: {
		backgroundColor: "#ffffff",
		borderColor: "#ffffff",
		borderRadius: 11,
		borderWidth: 2,
		elevation: 1,
		flexDirection: "row",
		marginBottom: 24,
		marginLeft: 24,
		marginRight: 24,
		marginTop: 20,
		shadowColor: "#C8C8C8",
		shadowOffset: {
			width: 0,
			height: 5
		},
		shadowOpacity: 1,
		shadowRadius: 15
	},
	boosterSavingView1: {
		backgroundColor: "#ffffff",
		borderColor: "#ffffff",
		borderRadius: 11,
		borderWidth: 2,
		elevation: 1,
		flexDirection: "row",
		marginBottom: 16,
		marginLeft: 0,
		marginRight: 0,
		marginTop: 18,
		shadowColor: "#C8C8C8",
		shadowOffset: {
			width: 0,
			height: 5
		},
		shadowOpacity: 1,
		shadowRadius: 15
	},
	boosterSavingView2: {
		backgroundColor: "#ffffff",
		borderColor: "#ffffff",
		borderRadius: 11,
		borderWidth: 2,
		elevation: 1,
		flexDirection: "row",
		marginBottom: 18,
		marginLeft: 0,
		marginRight: 0,
		marginTop: 36,
		shadowColor: "#C8C8C8",
		shadowOffset: {
			width: 0,
			height: 5
		},
		shadowOpacity: 1,
		shadowRadius: 15
	},
	boosterSavingView3: {
		backgroundColor: "#ffffff",
		borderColor: "#ffffff",
		borderRadius: 11,
		borderWidth: 2,
		elevation: 1,
		flexDirection: "row",
		marginBottom: 18,
		marginLeft: 0,
		marginRight: 0,
		marginTop: 24,
		shadowColor: "#C8C8C8",
		shadowOffset: {
			width: 0,
			height: 5
		},
		shadowOpacity: 1,
		shadowRadius: 15
	},
	boosterText: {
		color: "#000000",
		fontSize: 13,
		fontStyle: "normal",
		fontWeight: "normal",
		letterSpacing: 0,
		marginTop: 12,
		textAlign: "center"
	},
	categoryImageView: {
		height: 32,
		width: 32
	},

	categoryTextView: {
		color: "#000000",
		fontSize: 12,
		fontStyle: "normal",
		fontWeight: "600",
		letterSpacing: 0,
		lineHeight: 18,
		marginTop: 10,
		textAlign: "center"
	},
	categoryView: {
		alignContent: "center",
		alignItems: "center",
		//backgroundColor: "gray",
		flexDirection: "column",
		height: 100,
		justifyContent: "center",
		width: 100
	},
	chartCenterLine: {
		backgroundColor: "#dedcda",
		height: 1,
		marginTop: 12,
		width: 32
	},
	chartLabelInnerView: {
		alignItems: "center",
		flex: 1,
		marginTop: 40
	},
	chartLabelView: {
		alignItems: "center",
		height: 256,
		marginTop: 16,
		position: "absolute",
		width: "100%"
	},
	chartSavedAmountText: {
		color: "#000000",
		fontSize: 17,
		fontStyle: "normal",
		fontWeight: "600",
		letterSpacing: 0,
		marginTop: 4,
		textAlign: "center"
	},
	chartSavedText: {
		color: "#000000",
		fontSize: 13,
		fontStyle: "normal",
		fontWeight: "300",
		letterSpacing: 0,
		textAlign: "center"
	},
	chartView: {
		alignItems: "center",
		height: 256,
		marginTop: 16,
		width: "100%"
	},
	container: {
		backgroundColor: "#fff",
		flex: 1,
		marginTop: Platform.OS === "ios" ? 20 : 0
	},
	containerBlue: {
		backgroundColor: blueBackgroundColor,
		flex: 1,
		marginTop: Platform.OS === "ios" ? 20 : 0
	},
	containerDetailInnerView: {
		flexDirection: "column",
		flex: 1,
		marginLeft: 50,
		marginRight: 50
	},
	containerDetailInnerView1: {
		flexDirection: "column",
		flex: 1,
		marginLeft: 36,
		marginRight: 36
	},
	containerFirstView: {
		alignItems: "center",
		backgroundColor: "#f8f8f8",
		borderRadius: 20,
		borderTopLeftRadius: 20,
		borderTopRightRadius: 20,
		height: 112,
		width: "100%"
	},
	containerGray: {
		backgroundColor: "#f8f8f8",
		flex: 1
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
		flexDirection: "column",
		flex: 1,
		width: "100%",
		height: "100%",
		justifyContent: "center",
		alignContent: "center",
		alignItems: "center"
	},
	containerInnerInvitedView: {
		flexDirection: "column",
		flex: 1,
		marginTop: 20,
		marginLeft: 35,
		marginRight: 35
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
		flex: 1,
		height: "100%",
		justifyContent: "center",
		width: "100%"
	},
	containerInnerView11: {
		flexDirection: "column",
		flex: 1
	},
	containerInnerView2: {
		flexDirection: "column",
		flex: 1,
		borderTopLeftRadius: 20,
		borderTopRightRadius: 20
	},
	containerInnerView3: {
		flexDirection: "column",
		flex: 1,
		width: "100%",
		height: "100%"
	},
	containerLightBlue: {
		backgroundColor: "#f8f5f3",
		flex: 1,
		marginTop: Platform.OS === "ios" ? 20 : 0
	},
	containerLightGrayView: {
		backgroundColor: "#f8f8f8",
		flex: 1
	},
	containerLightView: {
		backgroundColor: "#f8f5f3",
		flex: 1
	},
	containerMainView: {
		alignItems: "flex-start",
		backgroundColor: "#f8f8f8",
		borderTopLeftRadius: 20,
		borderTopRightRadius: 20,
		width: "100%"
	},
	containerScrollDetailsView: {
		elevation: 1,
		flex: 1
	},
	containerScrollDetailsView1: {
		elevation: 1,
		flex: 1,
		marginBottom: 75
	},
	containerSecondView: {
		backgroundColor: "#f8f8f8",
		flex: 1,
		flexDirection: "row"
	},
	containerTransparentView: {
		backgroundColor: "#f8f8f8",
		flex: 1
	},
	containerView: {
		backgroundColor: "transparent",
		flex: 1
	},

	createTabungText: {
		color: "#4a90e2",
		fontSize: 14,
		fontStyle: "normal",
		fontWeight: "600",
		letterSpacing: 0,
		lineHeight: 18,
		textAlign: "center"
	},
	createTabungView: {
		alignContent: "center",
		alignItems: "center",
		flexDirection: "column",
		justifyContent: "center",
		marginBottom: 0,
		marginTop: 0
	},
	descPageText: {
		color: "#000000",
		fontSize: 20,
		fontStyle: "normal",
		fontWeight: "300",
		letterSpacing: 0,
		lineHeight: 28
	},
	descSmallText: {
		color: "#787878",
		fontSize: 12,
		fontStyle: "normal",
		fontWeight: "normal",
		letterSpacing: 0,
		lineHeight: 18
	},
	descView10: {
		flexDirection: "column",
		marginTop: 16
	},
	descView11: {
		flexDirection: "column",
		justifyContent: "space-between",
		marginBottom: 25,
		marginTop: 16
	},
	descView12: {
		alignItems: "center",
		flexDirection: "row"
	},
	descView14: {
		alignItems: "center",
		flexDirection: "row",
		marginBottom: 0,
		marginRight: 36,
		marginTop: 26
	},
	descView15: {
		alignItems: "center",
		flexDirection: "row",
		justifyContent: "center",
		marginBottom: 24,
		marginTop: 4
	},
	descView2: {
		marginTop: 8
	},
	descView3: {
		flexDirection: "column",
		justifyContent: "space-between",
		marginTop: 16
	},
	descView4: {
		flexDirection: "row",
		justifyContent: "flex-start",
		marginTop: 16
	},

	descView5: {
		alignItems: "center",
		flexDirection: "row",
		marginBottom: 21,
		marginTop: 26
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
	descView8: {
		flexDirection: "row",
		justifyContent: "space-between",
		marginTop: 24
	},
	descView9: {
		flexDirection: "row",
		justifyContent: "space-between",
		marginTop: 16
	},
	detailGoalAmountLabelLeft: {
		color: "#000000",
		fontSize: 13,
		fontStyle: "normal",
		fontWeight: "normal",
		letterSpacing: 0,
		textAlign: "center"
	},
	detailGoalAmountLabelLeftView: {
		//backgroundColor: "blue",
		flexDirection: "column",
		flex: 1
	},
	detailGoalAmountLabelRight: {
		color: "#000000",
		flexDirection: "column",
		fontSize: 13,
		fontStyle: "normal",
		fontWeight: "normal",
		letterSpacing: 0,
		textAlign: "center"
	},
	detailGoalAmountLabelRightView: {
		//backgroundColor: "pink",
		flexDirection: "row",
		flex: 1,
		alignItems: "flex-end",
		alignContent: "flex-end",
		justifyContent: "flex-end"
	},
	detailGoalAmountLabelRightView1: {
		//backgroundColor: "blue",
		flexDirection: "column",
		flex: 1
	},
	detailGoalAmountLabelView: {
		//backgroundColor: "green",
		flex: 1,
		flexDirection: "row",
		marginLeft: 54,
		marginRight: 54
	},
	detailGoalAmountRight: {
		color: "#000000",
		fontSize: 15,
		fontStyle: "normal",
		fontWeight: "600",
		letterSpacing: 0,
		textAlign: "center"
	},
	detailGoalAmountRowView: {
		//backgroundColor: "green",
		flex: 1,
		flexDirection: "row",
		marginLeft: 45.5,
		marginRight: 45.5
	},

	detailGoalAmountView: {
		flexDirection: "row"
	},

	detailRemainingAmountLabelLeft: {
		color: "#000000",
		fontSize: 15,
		fontStyle: "normal",
		fontWeight: "600",
		letterSpacing: 0,
		textAlign: "center"
	},
	detailSwitchContainer: {
		shadowColor: "#d9d9d9",
		shadowOffset: {
			width: 0,
			height: 2
		},
		shadowOpacity: 1,
		shadowRadius: 4
	},
	detailSwitchView: {
		elevation: 10,
		height: 86,
		marginLeft: 36,
		marginRight: 36,
		marginTop: 0,
		shadowColor: "#d9d9d9",
		shadowOffset: {
			width: 0,
			height: 2
		},
		shadowOpacity: 1,
		shadowRadius: 4,
		width: "80%"
	},
	detailsRowFirstView: {
		flexDirection: "row",
		marginLeft: 36,
		marginRight: 36,
		marginTop: 36
	},
	detailsRowFirstView2: {
		borderTopLeftRadius: 20,
		borderTopRightRadius: 20,
		flexDirection: "row",
		marginLeft: 36,
		marginRight: 36,
		marginTop: 36
	},
	detailsRowLeftView: {
		//backgroundColor: "blue",
		flex: 1
	},
	detailsRowRightView: {
		//backgroundColor: "pink",
		flex: 1
	},
	detailsRowView: {
		flexDirection: "row",
		marginLeft: 36,
		marginRight: 36,
		marginTop: 16
	},
	detailsTitleText: {
		color: "#000000",
		fontSize: 19,
		fontStyle: "normal",
		fontWeight: "normal",
		letterSpacing: 0,
		lineHeight: 28,
		textAlign: "center"
	},

	detailsTitleView: {
		marginLeft: 50,
		marginRight: 50,
		marginTop: 26
	},
	detailsTitleView2: {
		marginTop: 46
	},
	detailsTitleView4: {
		flexDirection: "row",
		marginTop: 46
	},
	fieldAmountView: {
		alignItems: "center",
		flexDirection: "column",
		marginTop: 8,
		width: "100%"
	},
	fieldFirstRow: {
		alignItems: "center",
		flexDirection: "row",
		flex: 1,
		height: 30,
		marginLeft: 5,
		marginTop: 62,
		width: "100%"
	},
	fieldLabel: {
		color: "#000000",
		fontSize: 15,
		fontStyle: "normal",
		fontWeight: "normal",
		letterSpacing: 0,
		lineHeight: 19,
		opacity: 0.5
	},

	fieldNameView: {
		alignItems: "center",
		flexDirection: "column",
		marginTop: 2,
		width: "100%"
	},
	fieldNumberView: {
		alignItems: "center",
		flexDirection: "column",
		marginTop: 10,
		width: "100%"
	},
	fieldRow: {
		alignItems: "center",
		flexDirection: "row",
		flex: 1,
		height: 30,
		marginLeft: 5,
		marginTop: 1,
		width: "100%"
	},
	fieldRowInner: {
		flex: 2.8,
		flexDirection: "column",
		justifyContent: "center"
	},
	fieldValueLabel: {
		color: "#000000",
		fontSize: 13,
		fontStyle: "normal",
		fontWeight: "600",
		letterSpacing: 0,
		lineHeight: 19,
		textAlign: "right"
	},
	fieldView: {
		alignItems: "center",
		flexDirection: "column",
		marginTop: 24,
		width: "100%"
	},
	fixedSection: {
		borderTopLeftRadius: 20,
		borderTopRightRadius: 20,
		bottom: 10,
		position: "absolute",
		right: 10
	},
	fixedSectionText: {
		color: "#999",
		fontSize: 20
	},
	flexGrid: {
		width: "100%"
	},
	footerButtonView: {
		width: "100%"
	},
	footerInner: {
		flexDirection: "row",
		justifyContent: "center"
	},
	footerView: {
		flexDirection: "row",
		justifyContent: "center",
		marginBottom: 20,
		marginLeft: 35,
		marginRight: 35
	},
	getFitLinkSmallText: {
		color: "#787878",
		fontSize: 12,
		fontStyle: "normal",
		fontWeight: "normal",
		letterSpacing: 0,
		lineHeight: 18
	},
	getFitLinkText: {
		color: "#000000",
		fontSize: 12,
		fontStyle: "normal",
		fontWeight: "normal",
		letterSpacing: 0,
		lineHeight: 18,
		marginLeft: 13.6
	},
	goalRowAmountLabelInnerView: {
		//backgroundColor: "blue",
		flexDirection: "column",
		flex: 1
	},
	goalRowAmountLabelView: {
		//backgroundColor: "green",
		flex: 1,
		flexDirection: "row",
		marginLeft: 24,
		marginRight: 24
	},
	goalRowAmountRestView: {
		flexDirection: "row",
		marginTop: 16
	},
	goalRowAmountView: {
		flexDirection: "row",
		marginTop: 15
	},
	goalRowLabelLeft: {
		color: "#000000",
		fontSize: 18,
		fontStyle: "normal",
		fontWeight: "600",
		letterSpacing: 0,
		lineHeight: 19
	},
	goalRowLabelLeft1: {
		color: "#000000",
		fontSize: 15,
		fontStyle: "normal",
		fontWeight: "normal",
		letterSpacing: 0
	},

	goalRowLabelRight: {
		color: "#000000",
		fontSize: 15,
		fontStyle: "normal",
		fontWeight: "600",
		letterSpacing: 0,
		textAlign: "right"
	},
	gpCatImage: {
		borderRadius: 32 / 2,
		height: 32,
		width: 32
	},
	holdMarkerClickView: {
		marginTop: 12
	},
	holdMarkerView: {
		backgroundColor: "#d8d8d8",
		borderRadius: 4,
		height: 8,
		marginBottom: 24,
		marginTop: 12,
		width: 48
	},
	indicator2: {
		backgroundColor: "transparent"
	},
	infoImage: {
		height: 16,
		width: 16
	},
	infoView: {
		marginLeft: 5,
		marginTop: 4
	},
	label: {
		color: "#000000",
		fontFamily: "montserrat",
		fontSize: 13,
		fontStyle: "normal",
		fontWeight: "bold",
		letterSpacing: 0,
		lineHeight: 23,

		textAlign: "center"
		// fontFamily: "montserrat"
	},
	lastTextView4: {
		flexDirection: "row",
		justifyContent: "flex-start",
		marginBottom: 60,
		marginTop: 0
	},
	learnMoreText: {
		color: "#4a90e2",
		fontSize: 14,
		fontStyle: "normal",
		fontWeight: "600",
		letterSpacing: 0,
		lineHeight: 18
	},
	learnMoreView3: {
		marginTop: 16
	},
	leftText: {
		color: "#000000",
		fontSize: 14,
		fontStyle: "normal",
		fontWeight: "normal",
		letterSpacing: 0,
		lineHeight: 18
	},
	manageBoosterView: {
		alignContent: "center",
		alignItems: "center",
		flexDirection: "column",
		justifyContent: "center",
		marginBottom: 25,
		marginTop: 0
	},
	modal: {
		margin: 0
	},
	nameDetailText: {
		color: "#000000",
		fontSize: 15,
		fontStyle: "normal",
		fontWeight: "600",
		letterSpacing: 0,
		lineHeight: 23,
		textAlign: "center"
	},
	nearByText: {
		color: "#000000",
		fontSize: 14,
		fontStyle: "normal",
		fontWeight: "normal",
		letterSpacing: 0,
		lineHeight: 19
	},
	noTabungText1: {
		color: "#000000",
		fontSize: 14,
		fontStyle: "normal",
		fontWeight: "600",
		letterSpacing: 0,
		lineHeight: 18,
		marginTop: 111,
		textAlign: "center"
	},
	noTabungText2: {
		color: "#000000",
		fontSize: 14,
		fontStyle: "normal",
		fontWeight: "normal",
		letterSpacing: 0,
		lineHeight: 20,
		marginLeft: 60,
		marginRight: 60,
		marginTop: 8,
		textAlign: "center"
	},
	parallaxHeader: {
		alignItems: "flex-start",
		flex: 1,
		flexDirection: "column",
		paddingTop: 100,
		marginLeft: 30
	},
	participantInnerView: {
		flexDirection: "row",
		width: "100%"
	},
	participantView: {
		flexDirection: "column",
		marginLeft: 36,
		marginRight: 36,
		marginTop: 14
		//backgroundColor: "#008d84"
	},
	pendingText: {
		color: "#ffffff",
		fontSize: 12,
		fontStyle: "normal",
		fontWeight: "600",
		letterSpacing: 0,
		lineHeight: 18,
		textAlign: "center"
	},
	pendingView: {
		alignContent: "center",
		alignItems: "center",
		backgroundColor: "#008d84",
		borderRadius: 8,
		flexDirection: "row",
		height: 41,
		justifyContent: "center",
		marginBottom: 18,
		marginLeft: 34,
		width: "83%"
	},
	phoneNumberDetailText: {
		color: "#000000",
		fontSize: 13,
		fontStyle: "normal",
		fontWeight: "normal",
		letterSpacing: 0,
		lineHeight: 24,
		textAlign: "center"
	},
	referenceLabel: {
		color: "#3b3b41",
		fontSize: 13,
		fontWeight: "500"
	},
	rightText: {
		color: "#000000",
		fontSize: 14,
		fontStyle: "normal",
		fontWeight: "600",
		letterSpacing: 0,
		lineHeight: 18,
		textAlign: "right"
	},
	row: {
		backgroundColor: "white",
		borderBottomWidth: 1,
		borderColor: "#ccc",
		height: ROW_HEIGHT,
		justifyContent: "center",
		overflow: "hidden",
		paddingHorizontal: 10
	},
	rowText: {
		fontSize: 20
	},
	sectionSpeakerText: {
		color: "#ffffff",
		fontSize: 20,
		fontStyle: "normal",
		fontWeight: "300",
		letterSpacing: 0,
		lineHeight: 30,
		marginTop: 40
	},
	sectionTitleText: {
		color: "#ffffff",
		fontStyle: "normal",
		fontWeight: "300",
		letterSpacing: 0,
		lineHeight: 30
	},
	selectAmountView: {
		marginTop: 36
	},
	selectCategoryText: {
		color: "#000000",
		fontSize: 14,
		fontStyle: "normal",
		fontWeight: "600",
		letterSpacing: 0,
		lineHeight: 23
	},
	selectCategoryText1: {
		color: "#000000",
		fontSize: 14,
		fontStyle: "normal",
		fontWeight: "normal",
		letterSpacing: 0,
		lineHeight: 19
	},
	selectCategoryText2: {
		color: "#000000",
		fontSize: 14,
		fontStyle: "normal",
		fontWeight: "600",
		letterSpacing: 0,
		lineHeight: 23
	},
	singleGPName: {
		color: "#000000",
		fontSize: 14,
		fontStyle: "normal",
		fontWeight: "600",
		letterSpacing: 0,
		lineHeight: 18,
		marginLeft: 10
	},
	spAmountText: {
		color: "#4a90e2",
		fontSize: 14,
		fontStyle: "normal",
		fontWeight: "600",
		letterSpacing: 0,
		lineHeight: 18,
		textAlign: "right"
	},
	spSummaryAmountText: {
		color: "#4a90e2",
		fontSize: 14,
		fontStyle: "normal",
		fontWeight: "600",
		letterSpacing: 0,
		lineHeight: 18,
		marginTop: -5,
		textAlign: "right"
	},
	statusIcon: {
		borderRadius: 54,
		height: 54,
		marginLeft: 10,
		width: 54
	},
	statusIconView: {
		marginTop: 52
	},
	statusTextLabel: {
		color: "#000000",
		fontSize: 21,
		fontStyle: "normal",
		fontWeight: "300",
		letterSpacing: 0,
		lineHeight: 30,
		marginRight: 30
	},
	statusTextView: {
		marginTop: 27
	},
	stickySection: {
		height: STICKY_HEADER_HEIGHT,
		justifyContent: "center",
		width: 300
	},
	stickySectionText: {
		color: "#D3D3D3",
		fontFamily: "montserrat",
		fontSize: 20,
		fontStyle: "normal",
		fontWeight: "300",
		letterSpacing: 0,
		lineHeight: 30,
		marginLeft: 75,
		marginTop: 1
	},
	sysncGetFitImage: {
		height: 24,
		width: 24
	},
	tab: { backgroundColor: "transparent", height: 70 },
	tabBlue: { backgroundColor: "transparent", height: 70 },
	tabbar: {
		backgroundColor: "#fff",
		height: 70,
		maxWidth: 10
	},
	tabbarBlue: {
		backgroundColor: "transparent",
		fontFamily: "montserrat",
		height: 70,
		marginLeft: "3%",
		width: "100%"
	},
	tabbarSplitBill: {
		backgroundColor: "transparent",
		elevation: 0,
		height: 70
	},
	titleDetailText: {
		color: "#000000",
		fontSize: 23,
		fontStyle: "normal",
		fontWeight: "300",
		letterSpacing: -0.43,
		lineHeight: 33,
		marginTop: 10,
		textAlign: "center"
	},
	titlePageText: {
		color: "#000000",
		fontSize: 14,
		fontStyle: "normal",
		fontWeight: "600",
		letterSpacing: 0,
		lineHeight: 18
	},
	titleText2ErrorMsg: {
		alignContent: "center",
		alignItems: "center",
		alignSelf: "center",
		color: "red",
		fontSize: 11,
		fontWeight: "normal",
		marginTop: 15,
		textAlign: "center"
	},
	topText: {
		color: "#7c7c7d",
		fontSize: 15,
		fontWeight: "100",
		marginLeft: 35,
		marginRight: 1,
		textAlign: "center"
	},
	viewMoreDetailsInnerView: {
		alignContent: "center",
		alignItems: "center",
		flexDirection: "column",
		justifyContent: "center"
	},
	viewMoreDetailsView: {
		alignContent: "center",
		alignItems: "center",
		flexDirection: "column",
		justifyContent: "center",
		marginTop: 32
	},
	viewMoreIcon: {
		height: 9,
		marginTop: 6,
		width: 16
	},
	viewMoreLine: {
		backgroundColor: "#cccccc",
		flexDirection: "row",
		height: 1,
		marginBottom: 24,
		marginLeft: 24,
		marginRight: 24,
		marginTop: 24
	},
	viewMoreRight: {
		color: "#4a90e2",
		fontSize: 14,
		fontStyle: "normal",
		fontWeight: "600",
		letterSpacing: 0,
		textAlign: "center"
	},
	whoSavingText: {
		color: "#000000",
		fontSize: 14,
		fontStyle: "normal",
		fontWeight: "normal",
		letterSpacing: 0,
		lineHeight: 18
	},
	whoSavingView: {
		flexDirection: "row",
		marginLeft: 36,
		marginRight: 36,
		marginTop: 36
	},
	whosSavingInnerView: {
		flex: 1,
		marginBottom: 24,
		marginLeft: 24,
		marginRight: 24,
		marginTop: 24
	},
	whosSavingUserView: {
		marginBottom: 24,
		marginTop: 20
	},
	whosSavingView: {
		backgroundColor: "#ffffff",
		borderColor: "#ffffff",
		borderRadius: 11,
		borderWidth: 2,
		elevation: 1,
		flexDirection: "row",
		marginBottom: 24,
		marginLeft: 24,
		marginRight: 24,
		marginTop: 24,
		shadowColor: "#C8C8C8",
		shadowOffset: {
			width: 0,
			height: 5
		},
		shadowOpacity: 1,
		shadowRadius: 15
	},
	youMayAddText: {
		color: "#000000",
		fontSize: 14,
		fontStyle: "normal",
		fontWeight: "normal",
		letterSpacing: 0,
		lineHeight: 20,
		marginBottom: 15,
		marginLeft: 10,
		marginRight: 10,
		marginTop: 20,
		textAlign: "center"
	}
});
