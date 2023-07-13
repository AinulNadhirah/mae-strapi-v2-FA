import PropTypes from "prop-types";
import React, { useRef, useEffect, useState, useCallback } from "react";
import { View, StyleSheet, ScrollView } from "react-native";

import {
    SETTINGS_MODULE,
} from "@navigation/navigationConstant";

import ActionButton from "@components/Buttons/ActionButton";
import HeaderBackButton from "@components/Buttons/HeaderBackButton";
import { ScrollPickerView } from "@components/Common";
import ScreenContainer from "@components/Containers/ScreenContainer";
import FixedActionContainer from "@components/Footers/FixedActionContainer";
import HeaderLabel from "@components/Label/HeaderLabel";
import HeaderLayout from "@components/Layouts/HeaderLayout";
import LabeledDropdown from "@components/FormComponents/LabeledDropdown";
import ScreenLayout from "@components/Layouts/ScreenLayout";
import Typo from "@components/Text";
import { showErrorToast } from "@components/Toast";

import { fetchZakatDebitAccts } from "@services";

import { BLACK, DISABLED, DISABLED_TEXT, RED, YELLOW } from "@constants/colors";
import {
    DROPDOWN_DEFAULT_TEXT,
    COMMON_ERROR_MSG
} from "@constants/strings";

const ZakatUpdateBody = ({ navigation, route }) => {
    const [zakatBodyName, setZakatBodyName] = useState(DROPDOWN_DEFAULT_TEXT);
    const [zakatBodyCode, setZakatBodyCode] = useState("");
    const [zakatBodyId, setZakatBodyId] = useState("");

    const [selectedZakatBodyIndex, setSelectedZakatBodyIndex] = useState(0);

    const [buttonEnabled, setButtonEnabled] = useState(false);
    const [showZakatBodyPicker, setShowZakatBodyPicker] = useState(false);

    const zakatBodyOptions = useRef();
    const scrollView = useRef();

    const [zakatBodyAccounts, setZakatBodyAccounts] = useState(null);

    const fetchZakatDropDowns = useCallback(async () => {
        try {
            const response = await fetchZakatDebitAccts(true);
            if (response?.data) {
                const { zakatBodyList } = { ...response?.data?.data };
                setZakatBodyAccounts(zakatBodyList);
            }
        } catch (error) {
            showErrorToast({ message: error?.message || COMMON_ERROR_MSG });
        }
    }, []);

    useEffect(() => {
        fetchZakatDropDowns();
    }, [fetchZakatDropDowns]);

    useEffect(() => {
        zakatBodyOptions.current = zakatBodyAccounts?.map((item) => {
            return {
                ...item,
                name: `${item?.subServiceName}`,
                value: `${item?.subServiceName}`,
                code: item?.subServiceCode,
                note1: item?.note1
            };
        });
    }, [
        zakatBodyAccounts
    ]);

    useEffect(() => {
        const { zakatDetails } = route?.params ?? "";
        setZakatBodyName(zakatDetails?.zakatBody ?? DROPDOWN_DEFAULT_TEXT);
    }, [route?.params]);

    useEffect(() => {
        setButtonEnabled(
            zakatBodyName !== route?.params?.zakatDetails?.zakatBody
        );
    }, [zakatBodyName]);

    function onPressBack() {
        navigation.goBack();
    }

    function onZakatBodyPress() {
        if (zakatBodyOptions.current?.length > 0) {
            setShowZakatBodyPicker(true);
        }
    }

    function onNavigateNext() {
        const { zakatDetails } = route?.params ?? "";
        navigation.navigate(SETTINGS_MODULE, {
            screen: "ZakatBodyConfirm",
            params: {
                zakatBodyName, zakatBodyCode, zakatBodyId, mobileNo: zakatDetails?.mobileNo
            }
        });
    }

    function onScrollPickerDoneButtonPressed(selectedItem, index) {
        if (selectedItem?.value !== zakatBodyName) {
            setZakatBodyCode(selectedItem?.code);
            setZakatBodyName(selectedItem?.value);
            setZakatBodyId(selectedItem?.note1);
            setSelectedZakatBodyIndex(index);
        }

        setButtonEnabled(
            selectedItem?.value !== route?.params?.zakatDetails?.zakatBody
        );

        setShowZakatBodyPicker(false);
    }

    function onScrollPickerCancelButtonPressed() {
        setShowZakatBodyPicker(false);
    }

    function onContentSizeChange(_, height) {
        scrollView.current.scrollTo({ y: height });
    }

    return (
        <>
            <ScreenContainer backgroundType="color" 
                analyticScreenName="Settings_AutoDebitZakat_SwitchOrg_SelectOrg">
                <ScreenLayout
                    header={
                        <HeaderLayout
                            backgroundColor={YELLOW}
                            headerLeftElement={<HeaderBackButton onPress={onPressBack} />}
                            headerCenterElement={<HeaderLabel>Auto Debit for Zakat</HeaderLabel>}
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
                        <View style={styles.marginTopStyle}>
                            <Typo
                                text="Select your preferred zakat body"
                                fontWeight="400"
                                fontSize={20}
                                lineHeight={28}
                                textAlign="left"
                                style={styles.title}
                            />
                            <LabeledDropdown
                                label="Zakat body"
                                dropdownValue={zakatBodyName}
                                onPress={onZakatBodyPress}
                                style={styles.subtitle}
                                disabled={false}
                            />
                        </View>
                    </ScrollView>
                    <FixedActionContainer>
                        <ActionButton
                            fullWidth
                            onPress={onNavigateNext}
                            disabled={!buttonEnabled}
                            backgroundColor={buttonEnabled ? YELLOW : DISABLED}
                            componentCenter={
                                <Typo
                                    text="Continue"
                                    fontWeight="600"
                                    fontSize={14}
                                    color={buttonEnabled ? BLACK : DISABLED_TEXT}
                                />
                            }
                        />
                    </FixedActionContainer>
                </ScreenLayout>
            </ScreenContainer>

            {/* zakat body dropdown options */}
            {showZakatBodyPicker && (
                <ScrollPickerView
                    showMenu
                    list={zakatBodyOptions.current ?? []}
                    selectedIndex={selectedZakatBodyIndex}
                    onRightButtonPress={onScrollPickerDoneButtonPressed}
                    onLeftButtonPress={onScrollPickerCancelButtonPressed}
                />
            )}
        </>
    );
};

ZakatUpdateBody.propTypes = {
    navigation: PropTypes.object,
    route: PropTypes.object,
};

const styles = StyleSheet.create({
    marginTopStyle: {
        marginTop: 24,
    },
    amountInput: {
        paddingTop: 20,
    },
    chevronContainer: {
        marginRight: 24,
    },
    chevronDownImage: { height: 8, width: 16 },
    container: {
        flex: 1,
        paddingHorizontal: 24,
    },
    errorMessage: {
        color: RED,
        top: -10,
    },
    errorMessageEducation: {
        color: RED,
        paddingTop: 5,
    },
    selectionContainer: {
        marginHorizontal: 24,
        flexDirection: "column",
        alignItems: "flex-start",
    },
    subtitle: {
        paddingBottom: 10,
        paddingTop: 24,
    },
    title: {
        paddingTop: 16,
    },
    mobileNumSection: {
        alignItems: "center",
        flexDirection: "row",
        paddingVertical: 2,
    },
    infoIconStyle: {
        height: 16,
        marginLeft: 10,
        width: 16,
    }
});

export default ZakatUpdateBody;
