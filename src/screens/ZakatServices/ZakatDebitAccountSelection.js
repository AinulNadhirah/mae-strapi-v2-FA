import PropTypes from "prop-types";
import React, { useRef, useEffect, useState } from "react";
import { View, StyleSheet, Image, ScrollView, Dimensions } from "react-native";

import {
    ZAKAT_DEBIT_ACCT_DECLARATION,
    ZAKAT_SERVICES_STACK,
} from "@navigation/navigationConstant";

import ActionButton from "@components/Buttons/ActionButton";
import HeaderBackButton from "@components/Buttons/HeaderBackButton";
import { ScrollPickerView } from "@components/Common";
import ScreenContainer from "@components/Containers/ScreenContainer";
import FixedActionContainer from "@components/Footers/FixedActionContainer";
import HeaderLabel from "@components/Label/HeaderLabel";
import HeaderLayout from "@components/Layouts/HeaderLayout";
import ScreenLayout from "@components/Layouts/ScreenLayout";
import LabeledDropdown from "@components/FormComponents/LabeledDropdown";
import Typo from "@components/Text";

import { BLACK, DISABLED, DISABLED_TEXT, WHITE, YELLOW } from "@constants/colors";
import {
    DROPDOWN_DEFAULT_TEXT,
    FA_ZAKAT_DEBIT_RESGITER
} from "@constants/strings";

import assets from "@assets";
import TextInput from "@components/TextInput";
import NumericalKeyboard from "@components/NumericalKeyboard";
import { isMalaysianMobileNum } from "@utils/dataModel";
import { TouchableOpacity } from "react-native-gesture-handler";
import HeaderCloseButton from "@components/Buttons/HeaderCloseButton";
import Popup from "@components/Popup";
import { useModelController } from "@context";
import SpaceFiller from "@components/Placeholders/SpaceFiller";
import { removeWhiteSpaces, formateAccountNumber } from "@utils/dataModel/utilityPartial.3";
import { maskedMobileNumber } from "@utils";
import { checkIfNumberWithPrefix, formatNumber } from "@utils/dataModel/utilityZakat";

const SCREEN_HEIGHT = Dimensions.get("screen").height;

const ZakatDebitAccountSelection = ({ navigation, route }) => {
    const [payFromAccount, setPayFromAccount] = useState({
        name: DROPDOWN_DEFAULT_TEXT,
        number: "",
        index: 0
    });

    const [zakatBody, setZakatBody] = useState({
        name: DROPDOWN_DEFAULT_TEXT,
        code: "",
        note1: "",
        index: 0
    });

    const [currentPicker, setCurrentPicker] = useState(null);
    const [buttonEnabled, setButtonEnabled] = useState(false);
    const [showPayFromPicker, setShowPayFromPicker] = useState(false);
    const [showZakatBodyPicker, setShowZakatBodyPicker] = useState(false);
    const [showNumPad, setShowNumPad] = useState(false);

    const { getModel } = useModelController();

    const { mobileNumber } = getModel("user");

    const [error, setError] = useState(false);
    const [phoneNo, setPhoneNo] = useState(checkIfNumberWithPrefix(mobileNumber));
    const [formattedPhoneNo, setformattedPhoneNo] = useState(maskedMobileNumber(formatNumber(checkIfNumberWithPrefix(mobileNumber))));

    const [showInfo, setShowInfo] = useState(false);

    function handleKeyboardChange(value) {
        if (error) setError(false);

        setPhoneNo(value);
        setformattedPhoneNo(formatNumber(value));
    }

    const zakatPayFromOptions = useRef();
    const zakatBodyOptions = useRef();
    const scrollView = useRef();
    const PICKER = {
        PAYFROM: "payfrom",
        ZAKATBODY: "zakatbody",
        ZAKAT_TYPE: "zakattype",
    };

    const zakatBodyAccounts = route?.params?.zakatBody ?? [];
    const zakatTypes = route?.params?.zakatTypes ?? [];
    const zakatFilteredAccts = route?.params?.zakatAccts ?? [];

    useEffect(() => {
        const mae = zakatFilteredAccts.find(
            (account) =>
                (account.group === "0YD" || account.group === "CCD") &&
                account.type === "D"
        );

        zakatPayFromOptions.current = zakatFilteredAccts?.filter((item) => {
            return ((route?.params?.isMaeAvailable && mae?.number === item?.number) || 
                mae?.number !== item?.number);
        }).map((acount) => {
            return {
                ...acount,
                name: `${acount?.name}\n${formateAccountNumber(acount.number.substring(0, 12), 12)}`,
                value: acount?.name,
                number: acount?.number
            };
        });

        zakatBodyOptions.current = zakatBodyAccounts?.map((item) => {
            return {
                ...item,
                name: `${item?.subServiceName}`,
                value: `${item?.subServiceName}`,
                code: item?.subServiceCode,
                note1: item?.note1,
            };
        });
    }, [
        zakatFilteredAccts,
        zakatBodyAccounts,
        zakatTypes
    ]);

    useEffect(() => {
        setButtonEnabled(
            payFromAccount?.name !== DROPDOWN_DEFAULT_TEXT && zakatBody?.name !== DROPDOWN_DEFAULT_TEXT && formattedPhoneNo
        );
    }, [payFromAccount, zakatBody, formattedPhoneNo]);

    function onPressBack() {
        navigation.goBack();
    }

    function onCloseTap() {
        navigation.navigate("TabNavigator", {
            screen: "Tab",
            params: {
                screen: "MAE_ACC_DASHBOARD"
            },
        });
    }

    function onPayFromAccountPress() {
        setCurrentPicker(PICKER.PAYFROM);
        if (zakatPayFromOptions.current?.length > 0) {
            setShowPayFromPicker(true);
            setShowZakatBodyPicker(false);
            setShowNumPad(false);
        }
    }

    function onZakatBodyPress() {
        setCurrentPicker(PICKER.ZAKATBODY);
        if (zakatBodyOptions.current?.length > 0) {
            setShowZakatBodyPicker(true);
            setShowPayFromPicker(false);
            setShowNumPad(false);
        }
    }

    function onNavigateNext() {
        navigation.navigate(ZAKAT_SERVICES_STACK, {
            screen: ZAKAT_DEBIT_ACCT_DECLARATION,
            params: {
                payFromAcctName: payFromAccount?.value,
                payFromAcctNo: payFromAccount?.number,
                zakatBody: zakatBody?.name,
                zakatBodyId: zakatBody?.note1,
                zakatBodyCode: zakatBody?.code,
                zakatType: zakatTypes[0]?.subServiceName,
                zakatTypeId: zakatTypes[0]?.note1,
                mobileNumber: removeWhiteSpaces(phoneNo)
            }
        });
    }

    function onScrollPickerDoneButtonPressed(selectedItem, index) {
        switch (currentPicker) {
            case PICKER.PAYFROM:
                if (selectedItem?.value !== payFromAccount?.name) {
                    setPayFromAccount({
                        ...selectedItem,
                        ...{
                            index
                        }
                    });
                }
                break;
            case PICKER.ZAKATBODY:
                if (selectedItem?.value !== zakatBody?.name) {
                    setZakatBody({
                        ...selectedItem,
                        ...{
                            index
                        }
                    });
                }
                break;
            default:
                break;
        }

        setShowPayFromPicker(false);
        setShowZakatBodyPicker(false);
    }

    function onScrollPickerCancelButtonPressed() {
        setShowPayFromPicker(false);
        setShowZakatBodyPicker(false);
    }

    function onContentSizeChange(_, height) {
        scrollView.current.scrollTo({ y: 200 });
    }

    async function handleKeyboardDone() {
        setShowNumPad(false);
        if (phoneNo.length >= 8 && phoneNo.length <= 10 && isMalaysianMobileNum(`60${phoneNo}`)) {
            console.log("phone num", phoneNo);
        } else {
            setError(true);
            setPhoneNo("");
            setformattedPhoneNo("");
        }
    }

    const _getPayFromComponent = () => {
        return (
            <View style={styles.selectionContainer}>
                <Typo
                    text={payFromAccount?.value ?? DROPDOWN_DEFAULT_TEXT}
                    fontSize={14}
                    lineHeight={18}
                    fontWeight="600"
                />
                {_getAccountNumberSection()}
            </View>
        );
    };

    const _getAccountNumberSection = () => {
        if (payFromAccount?.number) {
            return <Typo
            text={formateAccountNumber(payFromAccount?.number.substring(0, 12), 12)}
            fontSize={12}
            lineHeight={18}
            fontWeight="300"
        />;
        }
    };

    return (
        <>
            <ScreenContainer backgroundType="color" analyticScreenName={FA_ZAKAT_DEBIT_RESGITER}>
                <ScreenLayout
                    header={
                        <HeaderLayout
                            headerLeftElement={<HeaderBackButton onPress={onPressBack} />}
                            headerCenterElement={<HeaderLabel>Auto Debit for Zakat</HeaderLabel>}
                            headerRightElement={<HeaderCloseButton onPress={onCloseTap}/>}
                        />
                    }
                    useSafeArea
                    paddingTop={0}
                    paddingHorizontal={0}
                    paddingBottom={0}
                >
                    <ScrollView
                        ref={scrollView}
                        style={styles.container}
                        onContentSizeChange={onContentSizeChange}
                    >
                        <View>
                            <Typo
                                text={zakatTypes ? zakatTypes[0]?.subServiceName : "Zakat Simpanan & Pelaburan"}
                                fontWeight="400"
                                fontSize={14}
                                lineHeight={20}
                                textAlign="left"
                                style={styles.title}
                            />
                            <Typo
                                text="Please select your debiting bank account and preferred zakat body."
                                fontWeight="600"
                                fontSize={16}
                                lineHeight={20}
                                textAlign="left"
                                style={styles.subheadertitle}
                            />
                            <Typo
                                text="Pay from"
                                fontWeight="400"
                                fontSize={14}
                                style={styles.subtitle}
                                textAlign="left"
                            />
                            <SpaceFiller height={10}/>
                            <ActionButton
                                fullWidth
                                backgroundColor={WHITE}
                                borderWidth={1}
                                borderColor="#cfcfcf"
                                componentLeft={_getPayFromComponent()}
                                componentRight={
                                    <View style={styles.chevronContainer}>
                                        <Image
                                            source={assets.downArrow}
                                            style={styles.chevronDownImage}
                                        />
                                    </View>
                                }
                                onPress={onPayFromAccountPress}
                            />
                            
                            <LabeledDropdown
                                label="Zakat body"
                                dropdownValue={zakatBody?.name ?? DROPDOWN_DEFAULT_TEXT}
                                onPress={onZakatBodyPress}
                                style={styles.zakatbodysubtitle}
                                disabled={false}
                            />
                            {/* <SpaceFiller height={8}/> */}
                            <View style={styles.mobileNumSection}>
                                <Typo
                                    text="Mobile no."
                                    fontWeight="400"
                                    fontSize={14}
                                    style={styles.subtitle}
                                    textAlign="left"
                                />
                                <TouchableOpacity activeOpacity={0.4} onPress={() => setShowInfo(true)}>
                                    <Image style={styles.infoIconStyle} source={assets.icInformation} />
                                </TouchableOpacity>
                            </View>
                            <TouchableOpacity
                                onPress={() => {
                                    setShowNumPad(true);
                                    setPhoneNo("");
                                    setformattedPhoneNo("");
                                }}
                                >
                                <TextInput
                                    importantForAutofill="no"
                                    maxLength={12}
                                    editable={false}
                                    value={formattedPhoneNo}
                                    prefix="+60"
                                    isValidate
                                    isValid={!error}
                                    onPress={() => {
                                        console.log("text input click");
                                    }}
                                    errorMessage="Please enter a valid mobile number in order to continue."
                                />

                            </TouchableOpacity>

                        </View>
                        {showNumPad && <SpaceFiller height={SCREEN_HEIGHT / 3} />}
                        
                    </ScrollView>
                    <FixedActionContainer>
                        {
                            !showNumPad && (
                                <ActionButton
                                    fullWidth
                                    onPress={onNavigateNext}
                                    disabled={!buttonEnabled}
                                    backgroundColor={buttonEnabled ? YELLOW : DISABLED}
                                    componentCenter={
                                        <Typo
                                            text="Next"
                                            fontWeight="600"
                                            fontSize={14}
                                            color={buttonEnabled ? BLACK : DISABLED_TEXT}
                                        />
                                    }
                                />
                            )
                        }
                        
                    </FixedActionContainer>
                </ScreenLayout>
            </ScreenContainer>

            <Popup
                visible={showInfo}
                onClose={() => setShowInfo(false)}
                title="Mobile no."
                description="The selected zakat body may send notifications to this number when your zakat is calculated and auto debited."
            />

            {/* pay from dropdown options  */}
            {showPayFromPicker && (
                <ScrollPickerView
                    showMenu
                    list={zakatPayFromOptions.current ?? []}
                    selectedIndex={payFromAccount?.index}
                    onRightButtonPress={onScrollPickerDoneButtonPressed}
                    onLeftButtonPress={onScrollPickerCancelButtonPressed}
                />
            )}
            {/* zakat body dropdown options */}
            {showZakatBodyPicker && (
                <ScrollPickerView
                    showMenu
                    list={zakatBodyOptions.current ?? []}
                    selectedIndex={zakatBody?.index}
                    onRightButtonPress={onScrollPickerDoneButtonPressed}
                    onLeftButtonPress={onScrollPickerCancelButtonPressed}
                />
            )}
            {
                showNumPad && (
                    <NumericalKeyboard
                        value={phoneNo}
                        onChangeText={handleKeyboardChange}
                        maxLength={11}
                        onDone={handleKeyboardDone}
                    />
                )
            }
        </>
    );
};

ZakatDebitAccountSelection.propTypes = {
    navigation: PropTypes.object,
    route: PropTypes.object,
};

const styles = StyleSheet.create({
    chevronContainer: {
        marginRight: 24,
    },
    chevronDownImage: { height: 8, width: 16 },
    container: {
        flex: 1,
        paddingHorizontal: 24,
    },
    selectionContainer: {
        marginHorizontal: 24,
        flexDirection: "column",
        alignItems: "flex-start"
    },
    subtitle: {
        paddingTop: 36,
    },
    zakatbodysubtitle: {
        paddingTop: 24,
    },
    title: {
        paddingTop: 16,
    },
    subheadertitle: {
        paddingTop: 4
    },
    mobileNumSection: {
        
        alignItems: "flex-end",
        flexDirection: "row",
    },
    infoIconStyle: {
        height: 14,
        marginLeft: 5,
        width: 14,
    }
});

export default ZakatDebitAccountSelection;
