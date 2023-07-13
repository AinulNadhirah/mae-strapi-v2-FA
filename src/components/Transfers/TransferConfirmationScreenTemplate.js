import Numeral from "numeral";
import PropTypes from "prop-types";
import React from "react";
import { View, ScrollView } from "react-native";

import Timer from "@screens/ATMCashout/Timer";

import HeaderLayout from "@layouts/HeaderLayout";
import ScreenLayout from "@layouts/ScreenLayout";

import ActionButton from "@components/Buttons/ActionButton";
import HeaderBackButton from "@components/Buttons/HeaderBackButton";
import HeaderCloseButton from "@components/Buttons/HeaderCloseButton";
import ScreenContainer from "@components/Containers/ScreenContainer";
import FixedActionContainer from "@components/Footers/FixedActionContainer";
import HeaderLabel from "@components/Label/HeaderLabel";
import DatePicker from "@components/Pickers/DatePicker";
import ChallengeQuestion from "@components/RSA/ChallengeQuestion";
import Typo from "@components/Text";

import { MEDIUM_GREY, YELLOW, DISABLED } from "@constants/colors";
import * as Strings from "@constants/strings";

import Secure2uAuthenticationModal from "../Modals/Secure2uAuthenticationModal";
import TacModal from "../Modals/TacModal";
import AccountList from "../Transfers/TransferConfirmationAccountList";
import Amount from "../Transfers/TransferConfirmationAmount";
import TransferImageAndDetails from "../Transfers/TransferImageAndDetails";

// -----------------------
// GET UI
// -----------------------

const Header = ({ onBackPress, onClosePress, headerTitle }) => {
    return (
        <HeaderLayout
            horizontalPaddingMode="custom"
            horizontalPaddingCustomLeftValue={24}
            horizontalPaddingCustomRightValue={24}
            headerLeftElement={onBackPress && <HeaderBackButton onPress={onBackPress} />}
            headerRightElement={onClosePress && <HeaderCloseButton onPress={onClosePress} />}
            headerCenterElement={
                <HeaderLabel>
                    <>{headerTitle}</>
                </HeaderLabel>
            }
        />
    );
};

Header.propTypes = {
    headerTitle: PropTypes.any,
    onBackPress: PropTypes.any,
    onClosePress: PropTypes.any,
};

const TransferConfirmationScreenTemplate = ({
    headTitle,
    payLabel,
    amount,
    onEditAmount,
    logoTitle,
    logoSubtitle,
    textAlignTitle,
    logoImg,
    children,
    extraData,
    accounts,
    onAccountListClick,
    onDonePress,
    isDoneDisabled = false,
    onBackPress,
    onClosePress,
    tacParams,
    transferAPIParams,
    transferApi,
    onTacSuccess,
    onTacError,
    onTacClose,
    transactionResponseObject,
    isShowS2u,
    onS2UDone,
    onS2UClose,
    s2uExtraParams,
    transactionDetails,
    isLoading,
    //
    showDatePicker,
    onCancelButtonPressed,
    onDoneButtonPressed,
    dateRangeStartDate,
    dateRangeEndDate,
    defaultSelectedDate,
    secure2uValidateData,
    accountListLabel,
    headerData,
    validateByOwnAPI,
    validateTAC,
    isRSARequired,
    challengeQuestion,
    onRsaDone,
    onRsaClose,
    RSAError,
    isRSALoader,
}) => {
    const textDisabled = { opacity: !isDoneDisabled ? 1 : 0.5 };
    return (
        <>
            <ScreenContainer
                backgroundType="color"
                backgroundColor={MEDIUM_GREY}
                showLoaderModal={isLoading}
                showOverlay={showDatePicker}
            >
                <ScreenLayout
                    // scrollable={true}
                    contentContainerStyle={Styles.scrollView}
                    paddingHorizontal={0}
                    paddingBottom={0}
                    paddingTop={12}
                    header={
                        <>
                            {!isLoading ? (
                                <Header
                                    onBackPress={onBackPress}
                                    onClosePress={onClosePress}
                                    headerTitle={headTitle}
                                />
                            ) : null}
                            {headerData?.timeInSecs ? (
                                <Timer
                                    time={headerData?.timeInSecs}
                                    navigation={headerData?.navigation}
                                    params={headerData?.params}
                                    cancelTimeout={headerData?.allowToCancelTimer}
                                />
                            ) : null}
                        </>
                    }
                    useSafeArea
                >
                    <ScrollView>
                        <TransferImageAndDetails
                            title={logoTitle}
                            subtitle={logoSubtitle}
                            image={logoImg}
                            textAlign={textAlignTitle}
                            isVertical={true}
                        />
                        <View style={Styles.amountContainer}>
                            <Amount
                                value={Numeral(amount).format("0,0.00")}
                                onPress={onEditAmount}
                            />
                        </View>
                        {children}

                        {/* AccountList */}
                        <View style={{ paddingTop: 25 }}>
                            <AccountList
                                title={accountListLabel}
                                data={accounts}
                                onPress={onAccountListClick}
                                extraData={extraData}
                                paddingLeft={24}
                            />
                        </View>
                    </ScrollView>
                    <FixedActionContainer>
                        <ActionButton
                            disabled={isDoneDisabled || isLoading}
                            activeOpacity={isDoneDisabled || isLoading ? 1 : 0.5}
                            backgroundColor={isDoneDisabled || isLoading ? DISABLED : YELLOW}
                            isLoading={isLoading}
                            height={48}
                            fullWidth
                            borderRadius={24}
                            componentCenter={
                                <Typo
                                    fontSize={14}
                                    fontWeight="600"
                                    fontStyle="normal"
                                    letterSpacing={0}
                                    lineHeight={18}
                                    style={textDisabled}
                                    text={payLabel}
                                />
                            }
                            onPress={onDonePress}
                        />
                    </FixedActionContainer>
                </ScreenLayout>

                {/* TAC MODAL */}
                {tacParams && (
                    <TacModal
                        validateByOwnAPI={validateByOwnAPI}
                        validateTAC={validateTAC}
                        tacParams={tacParams}
                        transferAPIParams={transferAPIParams}
                        transferApi={transferApi} // ***
                        onTacSuccess={onTacSuccess}
                        onTacError={onTacError}
                        onTacClose={onTacClose}
                    />
                )}
                {/* S2U MODAL */}
                {isShowS2u && (
                    <Secure2uAuthenticationModal
                        token={
                            transactionResponseObject.pollingToken
                                ? transactionResponseObject.pollingToken
                                : transactionResponseObject.token
                        }
                        amount={amount}
                        onS2UDone={onS2UDone}
                        onS2UClose={onS2UClose}
                        s2uPollingData={secure2uValidateData}
                        transactionDetails={transactionDetails}
                        extraParams={s2uExtraParams}
                    />
                )}

                {/* Challenge Question */}
                {isRSARequired && (
                    <ChallengeQuestion
                        loader={isRSALoader}
                        display={isRSARequired}
                        displyError={RSAError}
                        questionText={challengeQuestion}
                        onSubmitPress={onRsaDone}
                        onSnackClosePress={onRsaClose}
                    />
                )}
            </ScreenContainer>
            {showDatePicker && (
                <DatePicker
                    showDatePicker={true}
                    onCancelButtonPressed={onCancelButtonPressed}
                    onDoneButtonPressed={onDoneButtonPressed}
                    dateRangeStartDate={dateRangeStartDate}
                    dateRangeEndDate={dateRangeEndDate}
                    defaultSelectedDate={defaultSelectedDate}
                />
            )}
        </>
    );
};

TransferConfirmationScreenTemplate.propTypes = {
    accountListLabel: PropTypes.any,
    accounts: PropTypes.any,
    amount: PropTypes.any,
    children: PropTypes.any,
    dateRangeEndDate: PropTypes.any,
    dateRangeStartDate: PropTypes.any,
    defaultSelectedDate: PropTypes.any,
    extraData: PropTypes.any,
    headTitle: PropTypes.any,
    isDoneDisabled: PropTypes.bool,
    isLoading: PropTypes.any,
    isShowS2u: PropTypes.any,
    logoImg: PropTypes.any,
    logoSubtitle: PropTypes.any,
    logoTitle: PropTypes.any,
    textAlignTitle: PropTypes.any,
    onAccountListClick: PropTypes.any,
    onBackPress: PropTypes.any,
    onCancelButtonPressed: PropTypes.any,
    onClosePress: PropTypes.any,
    onDoneButtonPressed: PropTypes.any,
    onDonePress: PropTypes.any,
    onEditAmount: PropTypes.any,
    onS2UClose: PropTypes.any,
    onS2UDone: PropTypes.any,
    onTacClose: PropTypes.any,
    onTacError: PropTypes.any,
    onTacSuccess: PropTypes.any,
    payLabel: PropTypes.any,
    s2uExtraParams: PropTypes.any,
    secure2uValidateData: PropTypes.any,
    selectedAccount: PropTypes.any,
    showDatePicker: PropTypes.any,
    tacParams: PropTypes.any,
    transactionDetails: PropTypes.any,
    transactionResponseObject: PropTypes.shape({
        pollingToken: PropTypes.any,
        token: PropTypes.any,
    }),
    transferAPIParams: PropTypes.any,
    transferApi: PropTypes.any,
    headerData: PropTypes.object,
    validateTAC: PropTypes.bool,
    validateByOwnAPI: PropTypes.bool,
    isRSARequired: PropTypes.bool,
    challengeQuestion: PropTypes.any,
    onRsaDone: PropTypes.func,
    onRsaClose: PropTypes.func,
    RSAError: PropTypes.string,
    isRSALoader: PropTypes.bool,
};

TransferConfirmationScreenTemplate.defaultProps = {
    accountListLabel: Strings.PAY_FROM,
};

const Memoiz = React.memo(TransferConfirmationScreenTemplate);

export default Memoiz;

const Styles = {
    scrollView: {
        flexGrow: 1,
        justifyContent: "flex-start",
    },

    amountContainer: {
        paddingTop: 16,
    },
};
