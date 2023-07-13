import numeral from "numeral";

import { BAKONG_COUNTRY_LIST, COUNTRY_LIST_WITH_CODE } from "@constants/data/Overseas";
import {
    COMMON_ERROR_MSG,
    DEFAULT_ACK_MESSAGE,
    FTT,
    MOT,
    VISA_DIRECT,
    WESTERN_UNION,
} from "@constants/strings";

import { formateAccountNumber, formatBakongMobileNumbers } from "@utils/dataModel/utility";

import assets from "@assets";

export const uidGenerator = (name = "mae", mobileSDKData) => {
    return name + mobileSDKData?.rsaKey;
};

export const convertToTitleCase = (text) => {
    if (text) {
        const text_ = text.toLowerCase();
        return `${String(text_.slice(0, 1)).toUpperCase()}${text_.slice(1, text_?.length)}`;
    }
    return "";
};

export const getCountryInfoByCode = (countryCode) => {
    const countryData = COUNTRY_LIST_WITH_CODE.filter((findCountry) => {
        return findCountry?.code.includes(countryCode);
    });
    return countryData?.length ? countryData[0] : "";
};

function getSenderCountries(senderCountryList) {
    const countryForSender = senderCountryList.map((combinedCountry) => {
        const countryExists = COUNTRY_LIST_WITH_CODE.filter((countryWithGcif) => {
            return (
                countryWithGcif.name?.toUpperCase() === combinedCountry.countryName?.toUpperCase()
            );
        });
        if (countryExists?.length === 1) {
            return {
                ...combinedCountry,
                countryName: countryExists[0]?.name,
                countryCode: countryExists[0]?.code,
            };
        }
        const BkcountryExists = BAKONG_COUNTRY_LIST.filter((countryWithGcif) => {
            return (
                combinedCountry.countryName?.toUpperCase() === countryWithGcif?.type?.toUpperCase()
            );
        });
        if (BkcountryExists?.length === 1) {
            return {
                ...combinedCountry,
                countryCode: BkcountryExists[0]?.desc,
            };
        }
        return { ...combinedCountry };
    });
    return countryForSender;
}
export const _getSenderCountryList = (countryList, senderCountryList) => {
    if (countryList?.length) {
        const countryName = new Set(countryList.map((country) => country.countryName));
        const countryForSender = getSenderCountries(senderCountryList);

        const combinedCountryList = [
            ...countryForSender.filter((country) => !countryName.has(country.countryName)),
        ].sort(function (a, b) {
            const nameA = a.countryName.toLowerCase();
            const nameB = b.countryName.toLowerCase();
            if (nameA < nameB) return -1;
            if (nameA > nameB) return 1;
            return 0;
        });

        const indexOfObject = combinedCountryList.findIndex((country) => {
            return country.countryName.toLowerCase() === "malaysia";
        });

        combinedCountryList.splice(indexOfObject, 1);

        return combinedCountryList;
    }
    return [];
};

export const _getBakongCountry = (countryList) => {
    return countryList?.length
        ? BAKONG_COUNTRY_LIST.map((bkCountry) => {
              const matchingCountry = countryList.filter((countryData) => {
                  return countryData?.countryName.toUpperCase() === bkCountry?.type?.toUpperCase();
              });
              if (matchingCountry?.length === 1) {
                  return {
                      ...bkCountry,
                      ...matchingCountry[0],
                  };
              } else {
                  return {
                      countryCode: bkCountry?.desc.substring(0, 2),
                      countryName: bkCountry?.type,
                  };
              }
          })
        : [];
};

export const _getBanksList = (countryBankList) => {
    return countryBankList?.length
        ? countryBankList.map((bank) => {
              return {
                  countryCode: bank?.countryCode,
                  bankList: bank?.bankList
                      .map((bInfo) => {
                          return { name: bInfo?.bankName, value: bInfo?.bankCode };
                      })
                      .sort((a, b) => {
                          return a?.name - b?.name;
                      }),
              };
          })
        : [];
};
export const _getOldBakongFavData = (data, bakongFavouritesItems) => {
    return data
        .map((account, index) => {
            const duplicates = bakongFavouritesItems.filter((bkFav) => {
                if (bkFav?.name) {
                    return (bkFav?.name).toLowerCase() === account?.nickName?.toLowerCase();
                }
            });
            if (duplicates?.length === 0) {
                return {
                    name: account?.nickName ?? "-",
                    bauBakong: true,
                    image: { imageName: "icBakong" },
                    description1: `+855 ${formatBakongMobileNumbers(account?.mobileNum)}` ?? "-",
                    description2: "Cambodia (Bakong Wallet)",
                    key: index,
                    productType: "Bakong",
                    favFlag: account?.favFalg ?? "",
                    responseObject: {
                        ...account,
                    },
                    custName: account?.regName,
                };
            }
        })
        .filter((oldBakongfav) => {
            return oldBakongfav?.name;
        });
};
export const _getBakongFavData = (data) => {
    return data.map((account, index) => {
        return {
            name: account?.beneInfo?.nickName ?? "-",
            image: { imageName: "icBakong" },
            description1: `+855 ${formatBakongMobileNumbers(account?.beneInfo?.contactNo)}`,
            description2: "Cambodia (Bakong Wallet)",
            key: index,
            productType: "Bakong",
            favFlag: account?.firstTimeAuth ?? "",
            responseObject: {
                ...account,
            },
            custName: account?.beneInfo?.fullName,
        };
    });
};
export const _getFttFavData = (data) => {
    return data.map((item, index) => {
        console.log("item ", `transferType: ${item?.transferType ?? "FTT"}`);
        return {
            name:
                item?.beneInfo?.nickName ??
                item?.beneInfo?.fullName ??
                `${item?.beneInfo?.firstName} ${
                    item?.beneInfo?.lastName ?? item?.beneInfo?.secondName
                }`,
            image: {
                imageName:
                    !item?.transferType || item?.transferType === "FTT"
                        ? "icOverseasFav"
                        : "onboardingM2UIcon",
            },
            description1: item?.beneInfo?.acctNo
                ? formateAccountNumber(item?.beneInfo?.acctNo, item?.beneInfo?.acctNo.length)
                : formateAccountNumber(item?.beneInfo?.beneId, item?.beneInfo?.beneId.length) ??
                  "-",
            description2: item.transferToCountry ? `${item.transferToCountry} (FTT)` : "-",
            key: index,
            productType: !item?.transferType || item?.transferType === "FTT" ? "FTT" : "RT",
            favFlag: item?.firstTimeAuth ?? "",
            responseObject: {
                ...item,
            },
            custName:
                item?.beneInfo?.fullName ??
                `${item?.beneInfo?.firstName} ${
                    item?.beneInfo?.lastName ?? item?.beneInfo?.secondName
                }`,
        };
    });
};
export const _getWuFavData = (data) => {
    return data.map((item, index) => ({
        name:
            item?.beneInfo?.nickName ??
            `${item?.beneInfo?.firstName} ${
                item?.beneInfo?.lastName ?? item?.beneInfo?.secondName
            }`,
        image: { imageName: "icWesternUnionFav" },
        description1: item.transferToCountry ?? "-",
        key: index,
        productType: "WU",
        favFlag: item?.firstTimeAuth ?? "",
        responseObject: {
            ...item,
        },
        custName: `${item?.beneInfo?.firstName} ${
            item?.beneInfo?.lastName ?? item?.beneInfo?.secondName
        }`,
    }));
};
export const _getVdFavData = (data) => {
    return data.map((item, index) => {
        const cardNo = item?.beneInfo?.beneId || item?.beneInfo?.beneIdNum || "-";
        return {
            name:
                item?.beneInfo?.nickName ??
                item?.beneInfo?.fullName ??
                `${item?.beneInfo?.firstName} ${
                    item?.beneInfo?.lastName ?? item?.beneInfo?.secondName
                }`,
            image: { imageName: "icVisaDirectFav" },
            description1: cardNo !== "-" ? formateAccountNumber(cardNo, cardNo?.length) : cardNo,
            description2: item.transferToCountry,
            key: index,
            productType: "VD",
            favFlag: item?.firstTimeAuth ?? "",
            responseObject: {
                ...item,
            },
            custName:
                item?.beneInfo?.fullName ??
                `${item?.beneInfo?.firstName} ${
                    item?.beneInfo?.lastName ?? item?.beneInfo?.secondName
                }`,
        };
    });
};
export const _getRtFavData = (data) => {
    return data.map((item, index) => {
        return {
            name: item?.beneInfo?.nickName ?? item?.beneInfo?.fullName ?? "-",
            image: { imageName: "onboardingM2UIcon" },
            description1: `${formateAccountNumber(
                item?.beneInfo?.acctNo,
                item?.beneInfo?.acctNo?.length
            )}`,
            description2: `${item?.transferToCountry} ${"(Maybank Overseas Transfer)"}`,
            key: index,
            productType: "RT",
            favFlag: item?.firstTimeAuth ?? "",
            responseObject: {
                ...item,
            },
            custName: item?.beneInfo?.fullName,
        };
    });
};

export const getImage = (name) => {
    if (name === "RT") {
        return assets.onboardingM2UIcon;
    }
    if (name === "FTT") {
        return assets.icOverseasFav;
    }
    if (name === "WU") {
        return assets.icWesternUnionFav;
    }
    if (name === "VD") {
        return assets.icVisaDirectFav;
    }
    return assets.icBakong;
};

export const getName = (name) => {
    if (name === "RT") {
        return MOT;
    }
    if (name === "FTT") {
        return FTT;
    }
    if (name === "WU") {
        return WESTERN_UNION;
    }
    if (name === "VD") {
        return VISA_DIRECT;
    }

    return "Bakong Transfer";
};

export const parseSenderInfo = (data, maxLength) => {
    const { addr1, addr2, addr3, addr4, state, postCode } = data;
    const pCode = postCode.replace(/\s\s+/g, " ");
    const addState = state ? state.replace(/\s\s+/g, " ") : "";
    const addressOne = addr1.replace(/\s\s+/g, " ");
    const addressTwo = addr2.replace(/\s\s+/g, " ");
    const addressThree = addr3.replace(/\s\s+/g, " ")?.replace(postCode, "");
    const addressFour = addr4.replace(/\s\s+/g, " ")?.replace(postCode, "");
    const addressLineOne_ =
        addressOne?.length > 25 ? addressOne.trim() : addressOne.trim() + ", " + addressTwo.trim();
    const addressTwoConcat =
        addressThree?.length > 0
            ? addressThree.trim() + ", " + addressFour.trim()
            : addressFour.trim();
    const addressLineTwo_ =
        addressOne?.length > 25
            ? addressTwo.trim() + ", " + addressThree.trim() + ", " + addressFour.trim()
            : addressTwoConcat?.trim();
    return {
        addressOne: (addressLineOne_?.length > maxLength
            ? addressLineOne_.substring(0, maxLength)
            : addressLineOne_
        )
            ?.replace(/^[^a-zA-Z0-9\s]|^\s/, "")
            ?.trim(),
        addressTwo: (addressLineTwo_?.length > maxLength
            ? addressLineTwo_.substring(0, maxLength)
            : addressLineTwo_
        )
            ?.replace(/^[^a-zA-Z0-9\s]|^\s/, "")
            ?.trim(),
        pCode,
        addState,
    };
};

export const getErrMsg = (type) => {
    const errMessageMapping = [
        {
            error: "1dHost Error",
            message: "Your account balance is insufficient. Please try again.",
        },
        {
            error: "30Host Error",
            message: COMMON_ERROR_MSG,
        },
        {
            error: "TRAPI HOST ERROR",
            message: DEFAULT_ACK_MESSAGE,
        },
        {
            error: "OCISS Host Error",
            message:
                "We are unable to proceed with your transaction request. Please go to your home branch or nearest branch if you require further assistance",
        },
        {
            error: "Host Error",
            message: "Request id not available in system",
        },
        {
            error: "Rejected By User",
            message: "Your Secure Verification authorisation was rejected.",
        },
    ];
    const errorMessage = errMessageMapping.filter((msg) => {
        return msg?.error === type;
    });

    return errorMessage[0]?.message ?? "";
};

export const getProductAvailability = (productActiveInd) => {
    const wuDown = productActiveInd?.wu === "N";
    const bkDown = productActiveInd?.bk === "N";
    const rtDown = productActiveInd?.rt === "N";
    const vdDown = productActiveInd?.vd === "N";
    const fttDown = productActiveInd?.ftt === "N";
    return fttDown && bkDown && rtDown && wuDown && vdDown;
};

export const getProductStatus = (productActiveInd, prodIndicator) => {
    return {
        isProductDown: productActiveInd[prodIndicator] === "N",
        isProductDownMsg: productActiveInd[`${prodIndicator}IndDesc`],
        isProductDisabled: productActiveInd[`${prodIndicator}Enable`] === "N",
    };
};

export const getCountryDataByName = (countryInfo) => {
    const country = COUNTRY_LIST_WITH_CODE.filter((countryData) => {
        return countryData?.name === countryInfo?.toUpperCase();
    });
    return {
        countryName: country[0]?.name,
        countryCode: country[0]?.code,
    };
};

export const getProductState = (productActiveInd) => {
    const showOldBkTemp =
        productActiveInd.rtIndDesc.indexOf("later.B") > -1 &&
        productActiveInd.bkIndDesc.indexOf("later.B") > -1 &&
        productActiveInd.fttIndDesc.indexOf("later.B") > -1 &&
        productActiveInd.wuIndDesc.indexOf("later.B") > -1;
    const showBothTemp =
        productActiveInd.rtIndDesc.indexOf("later.A") > -1 &&
        productActiveInd.bkIndDesc.indexOf("later.A") > -1 &&
        productActiveInd.fttIndDesc.indexOf("later.A") > -1 &&
        productActiveInd.wuIndDesc.indexOf("later.A") > -1;
    const hideAllTemp =
        productActiveInd.rtIndDesc.indexOf("later.N") > -1 &&
        productActiveInd.bkIndDesc.indexOf("later.N") > -1 &&
        productActiveInd.fttIndDesc.indexOf("later.N") > -1 &&
        productActiveInd.wuIndDesc.indexOf("later.N") > -1;
    return {
        showOldBk: showOldBkTemp,
        // productActiveInd.wuEnable === "N" &&
        // productActiveInd.vdEnable === "N" &&
        // productActiveInd.rtEnable === "N" &&
        // productActiveInd.bkEnable === "N" &&
        // productActiveInd.fttEnable === "N",

        showBoth: showBothTemp,
        // productActiveInd.wuEnable === "B" &&
        // productActiveInd.vdEnable === "B" &&
        // productActiveInd.rtEnable === "B" &&
        // productActiveInd.bkEnable === "B" &&
        // productActiveInd.fttEnable === "B",

        hideAll: hideAllTemp,
        // productActiveInd.wuEnable === "A" &&
        // productActiveInd.vdEnable === "A" &&
        // productActiveInd.rtEnable === "A" &&
        // productActiveInd.bkEnable === "A" &&
        // productActiveInd.fttEnable === "A",
    };
};

export const resetContext = (getModel, updateModel, resetModel) => {
    const {
        favRemittanceBeneficiaries,
        countryList,
        senderCountryList,
        countryStateCityList,
        bankList,
        productsActive,
        bakongRecipientList,
        trxId,
        paymentRefNo,
        routeFrom,
        selectedCountry,
        selectedAccount,
        amountDetails,
    } = getModel("overseasTransfers");
    console.tron.log("resetContext: ", getModel("overseasTransfers"));
    resetModel(["overseasTransfers"]);
    updateModel({
        overseasTransfers: {
            favRemittanceBeneficiaries,
            countryList,
            senderCountryList,
            countryStateCityList,
            bankList,
            productsActive,
            bakongRecipientList,
            trxId,
            paymentRefNo,
            routeFrom,
            selectedCountry,
            selectedAccount,
            amountDetails,
        },
    });
};

export const getExchangeRate = (data) => {
    const feRateVnd =
        data?.toCurrency === "VND"
            ? `RM 10 ≈ ${data?.toCurrency} ${numeral(String(data?.exchangeRate)).format(
                  "0,0.0000"
              )}`
            : "";
    const feRate =
        data?.fromCurrency !== "MYR"
            ? `${data?.fromCurrency} 1 ≈ RM ${data?.exchangeRate}`
            : `RM ${numeral(data?.exchangeRate).format("0,0.0000")} ≈ ${data?.toCurrency} ${
                  data?.toCurrency === "VND" ? "10" : "1"
              }`;
    const feRateWu =
        data?.fromCurrency !== "MYR"
            ? `${data?.fromCurrency} 1 ≈ RM ${data?.exchangeRate}`
            : `RM ${numeral(data?.exchangeRate).format("0,0.0000")} ≈ ${data?.toCurrency} ${"1"}`;
    const feRateVD =
        data?.fromCurrency !== "MYR"
            ? `${data?.fromCurrency} 1 ≈ RM ${data?.exchangeRate}`
            : `RM 1 ≈ ${data?.toCurrency} ${numeral(data?.exchangeRate).format("0,0.0000")} `;

    if (data?.productType === "WU") return feRateWu;
    if (data?.productType === "VD") return feRateVD;
    return feRateVnd || feRate;
};
