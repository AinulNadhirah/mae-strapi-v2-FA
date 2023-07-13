import { useNavigation } from "@react-navigation/native";
import PropTypes from "prop-types";
import React from "react";
import { StyleSheet, View, TouchableOpacity, Image, SectionList } from "react-native";

import { BANKINGV2_MODULE, GOAL_SIMULATION } from "@navigation/navigationConstant";

import HeaderLayout from "@layouts/HeaderLayout";
import ScreenLayout from "@layouts/ScreenLayout";

import ActionButton from "@components/Buttons/ActionButton";
import HeaderBackButton from "@components/Buttons/HeaderBackButton";
import ScreenContainer from "@components/Containers/ScreenContainer";
import FixedActionContainer from "@components/Footers/FixedActionContainer";
import SpaceFiller from "@components/Placeholders/SpaceFiller";
import Typo from "@components/Text";

import { GREY } from "@constants/colors";

import Images from "@assets";

function StepupDepositSchedule() {
    const navigation = useNavigation();

    function onBackButtonPress() {
        navigation.goBack();
    }

    const SubHeader = ({ title = "" }) => (
        <View style={styles.subHeader}>
            <Typo fontSize={12} fontWeight="600" text={title} />
        </View>
    );
    SubHeader.propTypes = {
        title: PropTypes.string,
    };

    // eslint-disable-next-line react/prop-types
    function _renderSectionHeader({ section }) {
        // eslint-disable-next-line react/prop-types
        const { title } = section;
        return <SubHeader title={title} />;
    }

    function _renderTransactionHistoryItem({ item }) {
        const { title, amount } = item;
        return (
            <View style={styles.listItemContainer}>
                <View style={styles.depositScheduleViewStyles}>
                    <Typo text={title} fontWeight="600" />
                    <Typo text={`RM ${amount}`} fontWeight="400" />
                </View>
            </View>
        );
    }

    _renderTransactionHistoryItem.propTypes = {
        item: PropTypes.object,
    };

    function _transactionHistoryListKeyExtractor({ transactionType }, index) {
        return `${transactionType}-${index}`;
    }

    const transactionHistory = [
        {
            title: "20 September 2020 - 19 September 2021",
            data: [
                {
                    message:
                        "You have disabled your Secure2u on 08 Jul 2022 12:15:49. Did not perform? Please call 03-58914744",
                    title: "Increase RM 500.00",
                    msgTitle: "Maybank2u: Secure2u has been disabled",
                    id: 1150452,
                    amount: "1100",
                    seen: true,
                    refId: null,
                    module: "S2U",
                    subModule: null,
                    createdDate: "2022-07-08T04:15:49.068+0000",
                    payload: null,
                    landingUrl: null,
                    imageUrl: null,
                    formattedTime: "12:15 PM",
                },
            ],
        },
        {
            title: "20 September 2021 - 19 September 2022",
            data: [
                {
                    message:
                        "Continue to earn +1 chance every day just by launching the app. Go to the homepage and tap 'Play Now' to use today's chance to win prizes",
                    title: "Increase RM 500.00",
                    msgTitle: "You've +1 chance to play Fu-ture Fortune",
                    id: 964107,
                    amount: "1600",
                    seen: true,
                    refId: null,
                    module: "MAELAUNCH",
                    subModule: null,
                    createdDate: "2022-01-12T07:14:42.955+0000",
                    payload: null,
                    landingUrl: null,
                    imageUrl: null,
                    formattedTime: "3:14 PM",
                },
            ],
        },
        {
            title: "20 September 2022 - 19 September 2023",
            data: [
                {
                    message:
                        "Continue to earn +1 chance every day just by launching the app. Go to the homepage and tap 'Play Now' to use today's chance to win prizes",
                    title: "Increase RM 500.00",
                    msgTitle: "You've +1 chance to play Fu-ture Fortune",
                    id: 964107,
                    amount: "1600",
                    seen: true,
                    refId: null,
                    module: "MAELAUNCH",
                    subModule: null,
                    createdDate: "2022-01-12T07:14:42.955+0000",
                    payload: null,
                    landingUrl: null,
                    imageUrl: null,
                    formattedTime: "3:14 PM",
                },
            ],
        },
    ];

    function onPressClose() {
        navigation.navigate(BANKINGV2_MODULE, {
            screen: GOAL_SIMULATION,
        });
    }

    const CloseButton = () => (
        <TouchableOpacity onPress={onPressClose} style={styles.closeButton}>
            <Image source={Images.icCloseBlack} style={styles.closeButtonIcon} />
        </TouchableOpacity>
    );

    function onPressProceed() {}

    return (
        <ScreenContainer backgroundType="color">
            <ScreenLayout
                header={
                    <HeaderLayout
                        headerCenterElement={
                            <Typo
                                fontSize={16}
                                fontWeight="600"
                                lineHeight={19}
                                text="Step-up Investment"
                            />
                        }
                        headerLeftElement={
                            <HeaderBackButton onPress={onBackButtonPress} testID="go_back" />
                        }
                        headerRightElement={<CloseButton />}
                    />
                }
                paddingTop={0}
                paddingHorizontal={0}
                paddingBottom={0}
                useSafeArea
            >
                <View style={styles.dpscheduleContainer}>
                    <View>
                        <Typo
                            fontWeight="600"
                            fontSize={16}
                            lineHeight={22}
                            textAlign="left"
                            text="Deposit Schedule"
                            style={styles.title}
                        />

                        <SpaceFiller height={8} />
                        <View style={styles.rightQ2}>
                            <Typo
                                fontWeight="400"
                                fontSize={14}
                                lineHeight={17}
                                textAlign="left"
                                text="Alternatively, you can choose how much you want your investment to grow every year to calculate your next monthly investment amount, to go beyond your initial target."
                            />
                        </View>

                        <SpaceFiller height={24} />

                        <View style={styles.rightQ3}>
                            <Typo
                                fontWeight="400"
                                fontSize={14}
                                lineHeight={17}
                                textAlign="left"
                                text="You can increase your monthly contribution in the following year by a certain amount or percentage (think salary increment percentage) to grow your retirement fund."
                            />
                        </View>

                        <SpaceFiller height={22} />

                        <SectionList
                            showsVerticalScrollIndicator={false}
                            sections={transactionHistory}
                            renderSectionHeader={_renderSectionHeader}
                            renderItem={_renderTransactionHistoryItem}
                            keyExtractor={_transactionHistoryListKeyExtractor}
                        />
                    </View>
                </View>

                <FixedActionContainer>
                    <ActionButton
                        fullWidth
                        onPress={onPressProceed}
                        componentCenter={
                            <Typo
                                fontSize={14}
                                fontWeight="600"
                                lineHeight={18}
                                text="Proceed With This Plan"
                            />
                        }
                    />
                </FixedActionContainer>
            </ScreenLayout>
        </ScreenContainer>
    );
}

const Memoiz = React.memo(StepupDepositSchedule);

const styles = StyleSheet.create({
    closeButton: {
        alignItems: "center",
        height: 44,
        justifyContent: "center",
        width: 44,
    },
    closeButtonIcon: {
        height: 17,
        width: 17, // match the size of the actual image
    },
    depositScheduleViewStyles: {
        flexDirection: "row",
        justifyContent: "space-between",
        paddingBottom: 20,
        paddingEnd: 23,
        paddingStart: 23,
        paddingTop: 20,
    },
    dpscheduleContainer: {
        flex: 1,
        justifyContent: "space-between",
    },
    rightQ2: { marginTop: 18, paddingHorizontal: 24 },
    rightQ3: { marginTop: 8, paddingHorizontal: 24 },
    subHeader: {
        alignItems: "flex-start",
        backgroundColor: GREY,
        flexDirection: "row",
        paddingHorizontal: 23,
        paddingVertical: 8,
    },
    title: {
        paddingHorizontal: 24,
        paddingTop: 10,
    },
});

export default Memoiz;
