/* eslint-disable sonarjs/cognitive-complexity */
function getLACustAddressData(navParams, savedData, mdmData, editFlow) {
    console.log("[LACustAddress] >> [getLACustAddressData]");

    if (editFlow) {
        return {
            address1: navParams?.correspondenseAddr1 ?? "",
            address2: navParams?.correspondenseAddr2 ?? "",
            address3: navParams?.correspondenseAddr3 ?? "",
            homeCity: navParams?.correspondenseCity ?? "",
            custPostcode: navParams?.correspondensePostCode ?? "",
            custState: navParams?.correspondenseState ?? "",
            custCountry: navParams?.correspondenseCountry ?? "",

            mailingAddress1: navParams?.mailingAddr1 ?? "",
            mailingAddress2: navParams?.mailingAddr2 ?? "",
            mailingAddress3: navParams?.mailingAddr3 ?? "",
            mailingHomeCity: navParams?.correspondenseCity ?? "",
            mailingPostcode: navParams?.mailingPostCode ?? "",
            mailingState: navParams?.mailingState ?? "",
            mailingCountry: navParams?.mailingCountry ?? "",
            isMailingAddr: navParams?.isMailingAddr,
        };
    } else {
        return {
            address1: savedData?.correspondenseAddr1 ?? mdmData?.addr1,
            address2: savedData?.correspondenseAddr2 ?? mdmData?.addr2,
            address3: savedData?.correspondenseAddr3 ?? mdmData?.addr3,
            homeCity: navParams?.correspondenseCity ?? mdmData?.homeCity,
            custPostcode: savedData?.correspondensePostCode ?? mdmData?.postCode,
            custState: savedData?.correspondenseState ?? mdmData?.state,
            custCountry: navParams?.correspondenseCountry ?? mdmData?.country,

            mailingAddress1: savedData?.mailingAddr1 ?? mdmData?.mailingAddr1,
            mailingAddress2: savedData?.mailingAddr2 ?? mdmData?.mailingAddr2,
            mailingAddress3: savedData?.mailingCity ?? mdmData?.mailingAddr3,
            mailingHomeCity: navParams?.mailingCity ?? mdmData?.mailingCity,
            mailingPostcode: savedData?.mailingPostCode ?? mdmData?.mailingPostCode,
            mailingState: savedData?.mailingState ?? mdmData?.mailingState,
            mailingCountry: savedData?.mailingCountry ?? mdmData?.mailingCountry,
            isMailingAddr: savedData?.isMailingAddr ?? mdmData?.mailingAddrInd,
        };
    }
}

function getLAEmpAddressUIData(navParams, savedData, mdmData, paramsEditFlow) {
    console.log("[LAEmpAddress] >> [getLAEmpAddressUIData]");

    if (paramsEditFlow) {
        return {
            empAddress1: navParams?.employerAddr1 ?? "",
            empAddress2: navParams?.employerAddr2 ?? "",
            empAddress3: navParams?.employerAddr3 ?? "",
            empCity: navParams?.employerCity ?? "",
            empPostcode: navParams?.employerPostCode ?? "",
            empState: navParams?.employerState ?? "",
            empCountry: navParams?.employerCountry ?? "",
            empContactNumber: navParams?.employerPhoneNo ?? "",
        };
    } else {
        return {
            empAddress1: savedData?.employerAddr1 ?? mdmData?.empAddr1,
            empAddress2: savedData?.employerAddr2 ?? mdmData?.empAddr2,
            empAddress3: savedData?.employerAddr3 ?? mdmData?.empAddr3,
            empCity: savedData?.employerCity ?? mdmData?.empCity,
            empPostcode: savedData?.employerPostCode ?? mdmData?.empPostCode,
            empState: savedData?.employerState ?? mdmData?.empState,
            empCountry: savedData?.employerCountry ?? mdmData?.empCountry,
            empContactNumber: savedData?.employerPhoneNo ?? mdmData?.empTelephone,
        };
    }
}

export {
    getLACustAddressData,
    getLAEmpAddressUIData,
};
