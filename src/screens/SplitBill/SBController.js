import numeral from "numeral";
import { showErrorToast } from "@components/Toast";
import * as Colors from "@constants/colors";
import * as Strings from "@constants/strings";
import * as DataModel from "@utils/dataModel";
import * as Data from "@constants/data";
import * as FundConstants from "@constants/fundConstants";
import * as Utility from "@utils/dataModel/utility";

export const evenlyDistributeAmount = (splitBillAmount, selectedContact) => {
    console.log("[SBController] >> [evenlyDistributeAmount]");

    // Type error checking
    if (isNaN(splitBillAmount)) {
        // TODO: Show error msg
        return selectedContact;
    }

    const amount = parseFloat(splitBillAmount).toFixed(2);
    const contactCount = selectedContact.length;
    const perAmount = (amount / contactCount).toFixed(2);
    const perAmountTotal = (perAmount * contactCount).toFixed(2);
    const diffAmount = (perAmountTotal - amount).toFixed(2);
    const diffDecimalAmount = (perAmount - diffAmount).toFixed(2);

    const updatedContactList = selectedContact.map((contact) => {
        const owner = contact.owner;
        return {
            ...contact,
            amount: owner
                ? `RM ${numeral(diffDecimalAmount).format("0,0.00")}`
                : `RM ${numeral(perAmount).format("0,0.00")}`,
            rawAmount: owner ? diffDecimalAmount : perAmount,
        };
    });

    // Return the update array
    return updatedContactList;
};

export const massageCollectListData = (resultList, accountNo, accountCode) => {
    console.log("[SBController] >> [massageCollectListData]");

    // Empty check
    if (!resultList || !(resultList instanceof Array) || !resultList.length) {
        return [];
    }

    const massagedData = resultList.map((item) => {
        const { totalAmount, paymentDetail, participants, formattedExpiryDate } = item;
        const totalPaidAmount = paymentDetail.totalPaidAmount;

        const expiryDate = formattedExpiryDate || "";
        const contactDetails = getAvatarArray(participants);
        const billTotalAmount = totalAmount ? `RM ${numeral(totalAmount).format("0,0.00")}` : null;
        const billCollectedAmount = totalPaidAmount
            ? `RM ${numeral(totalPaidAmount).format("0,0.00")}`
            : null;

        let progressPercent = 0;
        if (totalPaidAmount && totalAmount) {
            progressPercent = parseFloat(((totalPaidAmount / totalAmount) * 100 * 0.01).toFixed(2));
        }

        return {
            ...item,
            billTotalAmount,
            billCollectedAmount,
            progressPercent,
            contactDetails,
            expiryDate,
            accountNo,
            accountCode,
        };
    });

    return massagedData;
};

export const massagePayListData = (resultList) => {
    console.log("[SBController] >> [massagePayListData]");

    // Empty check
    if (!resultList || !(resultList instanceof Array) || !resultList.length) {
        return [];
    }

    const massagedData = resultList.map((item) => {
        const { totalAmount, participants, formattedExpiryDate, userDetail, billName } = item;
        const { ownerName } = userDetail;
        const expiryDate = formattedExpiryDate || "";
        const contactDetails = getAvatarArray(participants);
        const billTotalAmount = totalAmount ? `RM ${numeral(totalAmount).format("0,0.00")}` : "";
        const recipientRecord = participants.filter((contact) => contact.userType == "ME");
        const rawAmountOwed = recipientRecord.length ? recipientRecord[0].amount : "";
        const amountOwed = recipientRecord.length
            ? `RM ${recipientRecord[0].formattedAmount}`
            : " ";

        // Status details
        const statusText = Strings.SB_PAYSTATUS_PEND;
        const statusColor = Colors.ORANGE;

        return {
            ...item,
            billName: billName || "",
            billTotalAmount,
            contactDetails,
            expiryDate,
            statusText,
            statusColor,
            ownerName: ownerName || "",
            rawAmountOwed,
            amountOwed,
        };
    });

    return massagedData;
};

export const massagePastListData = (resultList, loggedInUserId) => {
    console.log("[SBController] >> [massagePastListData]");

    // Empty check
    if (!resultList || !(resultList instanceof Array) || !resultList.length) {
        return [];
    }

    const massagedData = resultList.map((item) => {
        const {
            totalAmount,
            participants,
            formattedExpiryDate,
            userDetail,
            billName,
            ownerId,
            paymentDetail,
        } = item;

        const totalPaidAmount = paymentDetail.totalPaidAmount;
        let rawAmountOwed, amountOwed;
        const isBillOwner = ownerId == loggedInUserId;
        const meRecordFilter = participants.filter((contact) => contact.userType == "ME");
        const meRecord = meRecordFilter.length ? meRecordFilter[0] : {};
        const ownerRecordFilter = participants.filter((contact) => contact.userType == "OWNER");
        const ownerRecord = ownerRecordFilter.length ? ownerRecordFilter[0] : {};

        const todayDate = new Date().setHours(0, 0, 0, 0);
        const expiryDate = formattedExpiryDate || "";
        const rawExpiryDate = expiryDate ? new Date(expiryDate).setHours(0, 0, 0, 0) : null;
        const hasBillExpired = todayDate > rawExpiryDate;

        const { ownerName } = userDetail;

        const contactDetails = getAvatarArray(participants);
        const billTotalAmount = totalAmount ? `RM ${numeral(totalAmount).format("0,0.00")}` : "";
        const billCollectedAmount = totalPaidAmount
            ? `RM ${numeral(totalPaidAmount).format("0,0.00")}`
            : null;

        if (!isBillOwner) {
            rawAmountOwed = meRecord?.amount ?? "";
            amountOwed = `RM ${numeral(meRecord.formattedAmount).format("0,0.00")}`;
        }

        // Status details
        const { statusText, statusColor } = retrievePastBillStatus(
            isBillOwner,
            meRecord,
            participants
        );

        return {
            ...item,
            billName: billName || "",
            billTotalAmount,
            billCollectedAmount,
            expiryDate,

            contactDetails,

            statusText,
            statusColor,

            ownerName: ownerName || "",
            ownerRecord,
            meRecord,

            rawAmountOwed: rawAmountOwed || "",
            amountOwed: amountOwed || "",

            isBillOwner,
            hasBillExpired,
        };
    });

    return massagedData;
};

export const retrievePastBillStatus = (isBillOwner, meRecord, participants) => {
    // console.log("[SBController] >> [retrievePastBillStatus]");

    if (isBillOwner) {
        // For Owner
        const particpantCount = participants.length - 1;

        const counts = participants.reduce(
            (value, a) => {
                if (a.userType !== "OWNER") {
                    if (a.paid) return { ...value, paidCount: value.paidCount + 1 };
                    if (a.status === "R")
                        return { ...value, rejectedCount: value.rejectedCount + 1 };
                    return { ...value, nonResponseCount: value.nonResponseCount + 1 };
                } else {
                    return { ...value };
                }
            },
            { paidCount: 0, rejectedCount: 0, nonResponseCount: 0 }
        );
        const { paidCount, rejectedCount, nonResponseCount } = counts;

        if (particpantCount == paidCount) {
            // If all Particpants paid - PAID
            return {
                statusText: Strings.SB_PAYSTATUS_PAID,
                statusColor: Colors.GREEN,
            };
        } else if (particpantCount == rejectedCount) {
            // If all Particpants rejected - REJECTED
            return {
                statusText: Strings.SB_PAYSTATUS_REJC,
                statusColor: Colors.RED,
            };
        } else if (nonResponseCount > 0 || particpantCount == nonResponseCount) {
            // If at leaast one particpants did not respond - EXPIRED
            return {
                statusText: Strings.SB_PAYSTATUS_EXPD,
                statusColor: Colors.RED,
            };
        } else if (nonResponseCount < 1 && rejectedCount > 0) {
            // If all participants have responded & at least one has rejected - REJECTED
            return {
                statusText: Strings.SB_PAYSTATUS_REJC,
                statusColor: Colors.RED,
            };
        }
    } else {
        // For Participant
        const { paid, status } = meRecord;
        if (paid) {
            return {
                statusText: Strings.SB_PAYSTATUS_PAID,
                statusColor: Colors.GREEN,
            };
        } else {
            if (status == "R") {
                return {
                    statusText: Strings.SB_PAYSTATUS_REJC,
                    statusColor: Colors.RED,
                };
            } else {
                return {
                    statusText: Strings.SB_PAYSTATUS_EXPD,
                    statusColor: Colors.RED,
                };
            }
        }
    }
};

export const getAvatarArray = (participants) => {
    // Empty check
    if (!participants || !(participants instanceof Array) || !participants.length) {
        return "";
    }

    let finalArray = [];
    const participantCount = participants.length;
    const isMaxLimitReach = participantCount >= 4;
    const additionalCount = isMaxLimitReach ? participantCount - 3 : "";
    let ownerRecord = {};
    const additionalRecord = {
        type: "text",
        text: `+${additionalCount}`,
        backgroundColor: Colors.YELLOW,
        textColor: Colors.BLACK,
    };

    const massagedPariticipants = participants.map((item) => {
        const { name, imageUrl, hpNo } = item;
        const type = imageUrl ? "image" : "text";
        const text = name ? Utility.getContactNameInitial(name) : "#";
        const source = imageUrl;
        const mayaFormatMobileNum = Utility.convertMayaMobileFormat(hpNo);

        return {
            ...item,
            hpNo: mayaFormatMobileNum,
            type,
            text,
            source,
            backgroundColor: Colors.GREY, //imageUrl ? "transparent" : Colors.GREY,
            textColor: Colors.DARK_GREY,
        };
    });

    // Separate Participants only & also extract Owner record
    let participantsOnly = massagedPariticipants.filter((contact) => {
        const userType = contact.userType;

        if (userType == Data.SB_USER_OWNER) {
            ownerRecord = contact;
            return false;
        } else {
            return true;
        }
    });

    // Sort the array alphabetically
    participantsOnly.sort((a, b) => {
        const firstContactName = a?.text ?? "";
        const secondContactName = b?.text ?? "";

        if (firstContactName.toLowerCase() < secondContactName.toLowerCase()) return -1;

        if (firstContactName.toLowerCase() > secondContactName.toLowerCase()) return 1;

        return 0;
    });

    // Add Owner
    if (Object.keys(ownerRecord).length) {
        finalArray.push(ownerRecord);
    }

    // Add Participants
    let participantAvatars = [];
    if (isMaxLimitReach) {
        participantsOnly = participantsOnly.slice(0, 2);
        participantAvatars = participantAvatars.concat(participantsOnly);
        participantAvatars.push(additionalRecord);
    } else {
        participantAvatars = participantAvatars.concat(participantsOnly);
    }

    // Merge all into one
    finalArray = finalArray.concat(participantAvatars);

    return finalArray;
};

export const massageGroupListData = (resultList) => {
    console.log("[SBController] >> [massageGroupListData]");

    // Empty check
    if (!resultList || !(resultList instanceof Array) || !resultList.length) {
        return [];
    }

    const massagedData = resultList.map((item) => {
        const { formattedCreatedDate, participants } = item;

        const contactDetails = getAvatarArray(participants);
        const dateCreated = formattedCreatedDate || "";

        return {
            ...item,
            contactDetails,
            dateCreated,
        };
    });

    return massagedData;
};

export const massageContactData = (selectedContact) => {
    console.log("[SBController] >> [massageContactData]");

    // Empty check
    if (!selectedContact || !(selectedContact instanceof Array) || !selectedContact.length) {
        return [];
    }

    // Add additional details necessary to each contact
    let massagedContacts = selectedContact.map((contact) => {
        const { mayaUserName, name, phoneNumber } = contact;
        const contactName = mayaUserName || name || phoneNumber;

        return {
            ...contact,
            contactName,
            owner: false,
            amount: "RM 0.00",
            rawAmount: 0,
            contactInitial: mayaUserName || name ? Utility.getContactNameInitial(contactName) : "#",
        };
    });

    // Sort the array alphabetically
    massagedContacts.sort((a, b) => {
        if (a.contactName.toLowerCase() < b.contactName.toLowerCase()) {
            return -1;
        }
        if (a.contactName.toLowerCase() > b.contactName.toLowerCase()) {
            return 1;
        }
        return 0;
    });

    return massagedContacts;
};

export const navigateToDashboardIndex = (flowType) => {
    console.log("[SBController] >> [navigateToDashboardIndex]");

    const { SB_FLOW_ADDGRP, SB_FLOW_ADDGRP_SB, SB_FLOW_ADDSB } = Data;
    let activeTabIndex;

    switch (flowType) {
        case SB_FLOW_ADDGRP:
        case SB_FLOW_ADDGRP_SB:
            activeTabIndex = 3;
            break;
        case SB_FLOW_ADDSB:
            activeTabIndex = 0;
            break;
        default:
            activeTabIndex = 0;
            break;
    }

    return activeTabIndex;
};

export const validateSBName = (value) => {
    console.log("[SBController] >> [validateSBName]");

    // Empty check
    if (!value) {
        return "Please enter your bill name.";
    }

    // Alphanumeric check
    if (!DataModel.validateAlphaNumaric(value)) {
        return "Your bill name must contain alphanumerical characters only.";
    }

    if (value.length < 3) {
        return "Your bill name must be more than 3 characters.";
    }

    // Return true if it passes all validation checks
    return true;
};

export const validateSBNotes = (value) => {
    console.log("[SBController] >> [validateSBNotes]");

    // Return true for empty value as it is an Optional field
    if (!value) return true;

    // Alphanumeric check
    if (!DataModel.validateAlphaNumaric(value))
        return "Your notes must contain alphanumerical characters only.";

    // Return true if it passes all validation checks
    return true;
};

export const validateGroupName = (value) => {
    console.log("[SBController] >> [validateGroupName]");

    // Empty check
    if (!value) {
        return "Please enter your group name.";
    }

    // Alphanumeric check
    if (!DataModel.validateAlphaNumaric(value)) {
        return "Your group name must contain alphanumerical characters only.";
    }

    if (value.length < 3) {
        return "Your group name must be more than 3 characters.";
    }

    // Return true if it passes all validation checks
    return true;
};

export const validateGroupDesc = (value) => {
    console.log("[SBController] >> [validateGroupDesc]");

    // Return true for empty value as it is an Optional field
    if (!value) return true;

    // Alphanumeric check
    if (!DataModel.validateAlphaNumaric(value))
        return "Your description must contain alphanumerical characters only.";

    // Return true if it passes all validation checks
    return true;
};

export const massageFavGroupContacts = (participants) => {
    console.log("[SBController] >> [massageFavGroupContacts]");

    // Empty check
    if (!participants || !(participants instanceof Array) || !participants.length) {
        return [];
    }

    let ownerRecord;

    // Form contacts data
    let massagedPariticipants = participants.map((contact) => {
        const { name, hpNo, userId, imageUrl, userType } = contact;
        const contactInitial = name ? Utility.getContactNameInitial(name) : "#";
        const contactName = name || hpNo;
        const mayaFormatMobileNum = Utility.convertMayaMobileFormat(hpNo);

        return {
            contactInitial,
            contactName,
            formatedPhoneNumber: mayaFormatMobileNum,
            isSyncedThroughMaya: null,
            mayaUserId: userId,
            mayaUserName: name,
            name: name,
            phoneNumber: mayaFormatMobileNum,
            profilePicUrl: imageUrl,
            thumbnailPath: imageUrl,
            owner: userType == Data.SB_USER_OWNER,
            amount: "RM 0.00",
            rawAmount: 0,
        };
    });

    // Separate Participants only & also extract Owner record
    let participantsOnly = massagedPariticipants.filter((contact) => {
        if (contact.owner) {
            ownerRecord = contact;
            return false;
        } else {
            return true;
        }
    });

    // Sort the array alphabetically
    participantsOnly.sort((a, b) => {
        const firstContactName = a?.contactName ?? "";
        const secondContactName = b?.contactName ?? "";

        if (firstContactName.toLowerCase() < secondContactName.toLowerCase()) return -1;

        if (firstContactName.toLowerCase() > secondContactName.toLowerCase()) return 1;

        return 0;
    });

    // Insert Owner record at the top
    if (ownerRecord) {
        const participantList = [ownerRecord, ...participantsOnly];
        return participantList;
    } else {
        return participantsOnly;
    }
};

export const massageSBDetailContacts = (participants, fromTabIndex, isBillOwner) => {
    console.log("[SBController] >> [massageSBDetailContacts]");

    // Empty check
    if (!participants || !(participants instanceof Array) || !participants.length) {
        return [];
    }

    let ownerRecord;

    // Form contacts data
    let massagedPariticipants = participants.map((contact) => {
        const {
            name,
            hpNo,
            userId,
            imageUrl,
            userType,
            status,
            paid,
            formattedAmount,
            amount,
            groupParticipantId,
        } = contact;

        const contactInitial = name ? Utility.getContactNameInitial(name) : "#";
        const contactName = name || hpNo;
        let contactPayStatus = getPayStatus(paid, status);
        const mayaFormatMobileNum = Utility.convertMayaMobileFormat(hpNo);

        // For participants(not creator) from Past tab, do not show if status is Rejected/Expired
        if (fromTabIndex == 2 && !isBillOwner && contactPayStatus != Strings.SB_PAYSTATUS_PAID) {
            contactPayStatus = "";
        }

        return {
            contactInitial,
            contactName,
            contactPayStatus,
            formatedPhoneNumber: mayaFormatMobileNum,
            phoneNumber: mayaFormatMobileNum,
            mayaUserId: userId,
            mayaUserName: name,
            name: name,
            profilePicUrl: imageUrl,
            thumbnailPath: imageUrl,
            owner: userType == Data.SB_USER_OWNER,
            amount: `RM ${numeral(formattedAmount).format("0,0.00")}`,
            rawAmount: amount,
            groupParticipantId,
        };
    });

    // Separate Participants only & also extract Owner record
    let participantsOnly = massagedPariticipants.filter((contact) => {
        if (contact.owner) {
            ownerRecord = contact;
            return false;
        } else {
            return true;
        }
    });

    // Sort the array alphabetically
    participantsOnly.sort((a, b) => {
        const firstContactName = a?.contactName ?? "";
        const secondContactName = b?.contactName ?? "";

        if (firstContactName.toLowerCase() < secondContactName.toLowerCase()) return -1;

        if (firstContactName.toLowerCase() > secondContactName.toLowerCase()) return 1;

        return 0;
    });

    // Insert Owner record at the top
    if (ownerRecord) {
        const participantList = [ownerRecord, ...participantsOnly];
        return participantList;
    } else {
        return participantsOnly;
    }
};

export const getPayStatus = (paid, status) => {
    let payStatus = "";

    if (paid) {
        payStatus = Strings.SB_PAYSTATUS_PAID;
    } else {
        switch (status) {
            case "A":
                payStatus = Strings.SB_PAYSTATUS_ACEP;
                break;
            case "N":
                payStatus = Strings.SB_PAYSTATUS_PEND;
                break;
            case "E":
                payStatus = Strings.SB_PAYSTATUS_EXPD;
                break;
            case "R":
                payStatus = Strings.SB_PAYSTATUS_REJC;
                break;
            default:
                payStatus = Strings.SB_PAYSTATUS_PEND;
                break;
        }
    }

    return payStatus;
};

export const getSBDetailsMenu = (splitBillReceipt, isSplitBillOwner, fromTabIndex, favourite) => {
    console.log("[SBController] >> [getSBDetailsMenu]");

    const receiptExists = !!splitBillReceipt;
    let menuArray = [
        {
            menuLabel: Strings.ADD_GROUP_FAVOURITE,
            menuParam: Data.SB_FLOW_ADDGRPFAV,
        },
        {
            menuLabel: Strings.EDIT_BILL_NAME,
            menuParam: Data.SB_FLOW_EDITSBNAME,
        },
        {
            menuLabel: Strings.REMOVE_BILL,
            menuParam: Data.SB_FLOW_REMVBILL,
        },
    ];

    if (fromTabIndex == 2) {
        // For Past Tab - Only Remove Bill & View Receipt(if applicable)
        menuArray.splice(0, 2);

        if (receiptExists) {
            menuArray.splice(0, 0, {
                menuLabel: Strings.VIEW_RECEIPT,
                menuParam: Data.SB_FLOW_VIEWRECEIPT,
            });
        }

        // For Owner - Add Fav Group is applicable if not added yet
        if (isSplitBillOwner && !favourite) {
            menuArray.splice(0, 0, {
                menuLabel: Strings.ADD_GROUP_FAVOURITE,
                menuParam: Data.SB_FLOW_ADDGRPFAV,
            });
        }
    } else if (isSplitBillOwner) {
        // Check to show View/Add Receipt
        if (receiptExists) {
            menuArray.splice(2, 0, {
                menuLabel: Strings.VIEW_RECEIPT,
                menuParam: Data.SB_FLOW_VIEWRECEIPT,
            });
        } else {
            menuArray.splice(2, 0, {
                menuLabel: Strings.ADD_RECEIPT,
                menuParam: Data.SB_FLOW_ADDRECEIPT,
            });
        }

        // If group is already added as favourite, do not show the option again
        if (favourite) menuArray.splice(0, 1);
    } else {
        // Remove Add Fav Group & Edit Bill Name item
        menuArray.splice(0, 2);

        if (receiptExists) {
            menuArray.splice(0, 0, {
                menuLabel: Strings.VIEW_RECEIPT,
                menuParam: Data.SB_FLOW_VIEWRECEIPT,
            });
        }
    }

    return menuArray;
};

export const getSBConfirmationMenu = (flowType) => {
    console.log("[SBController] >> [getSBConfirmationMenu]");

    let menuArray = [
        {
            menuLabel: Strings.ADD_CONTACT,
            menuParam: "ADD_CONTACT",
        },
        {
            menuLabel: Strings.DELETE_GROUP,
            menuParam: "DELETE_GROUP",
        },
    ];

    if (flowType == Data.SB_FLOW_ADDGRPFAV) {
        menuArray.splice(1, 1);
    }

    return menuArray;
};

export const commonCbHandler = (resp) => {
    console.log("[SBController] >> [commonCbHandler]");
    try {
        if (!resp) return { message: Strings.COMMON_ERROR_MSG };

        const data = resp?.data ?? null;
        if (!data) return { message: Strings.COMMON_ERROR_MSG };

        const message = data?.message ?? Strings.COMMON_ERROR_MSG;
        const code = data?.code ?? "";
        return { ...data, code, message };
    } catch (e) {
        console.log("[SBController][commonCbHandler] >> Exception: " + e.message);

        // Return error msg for exception
        return { message: e.message || Strings.COMMON_ERROR_MSG };
    }
};

export const extractPayFlowParams = (data, activeTabIndex, accountNo, accountCode, routeFrom) => {
    console.log("[SBController] >> [extractPayFlowParams]");

    const {
        participants,
        billId,
        billName,
        note,
        billType,
        refId,
        expiryDate,
        formattedCreatedDateAmPm,
        rawAmountOwed,
        amountOwed,
        contactDetails,
        ownerAccountNo,
        ownerAccountCode,
    } = data;
    const filterMERecord = participants.filter((contact) => contact.userType == "ME");
    const filterOwnerRecord = contactDetails.filter((contact) => contact.userType == "OWNER");
    const myRecord = filterMERecord.length ? filterMERecord[0] : "";
    const ownerRecord = filterOwnerRecord.length ? filterOwnerRecord[0] : "";

    const todayDate = new Date().setHours(0, 0, 0, 0);
    const rawExpiryDate = expiryDate ? new Date(expiryDate).setHours(0, 0, 0, 0) : null;
    const hasBillExpired = todayDate > rawExpiryDate;

    // Error checking for owner & recipient data
    if (activeTabIndex == 1 && (!myRecord || !ownerRecord)) {
        showErrorToast({
            message: "Missing user information.",
        });
        return false;
    }

    const { status, paid } = myRecord;
    const { hpNo, name, text, imageUrl } = ownerRecord;
    const payStatus =
        myRecord && hasBillExpired && paid === false
            ? Strings.SB_PAYSTATUS_EXPD
            : getPayStatus(paid, status);
    const splitBillType = billType == "UNEQUALLY" ? "Separately" : "Evenly";
    const oneTapAuthAmount = amountOwed.replace("RM", "").trim();

    const requestorMobileNumber = hpNo || "";
    const requestorFormattedNumber = hpNo ? `+${Utility.formatMobileNumber(hpNo)}` : "";

    return {
        data,
        fromTabIndex: activeTabIndex,
        routeFrom,
        myRecord,
        ownerRecord,
        status,
        accountNo,
        accountCode,
        flowType: Data.SB_FLOW_PAYMENT,

        splitBillName: billName || "",
        splitBillType,
        splitBillRefId: refId || "",
        splitBillDateTime: formattedCreatedDateAmPm || "",
        splitBillNote: note || null,
        billId: billId || "",
        expiryDate: expiryDate || "",
        hasBillExpired,

        oneTapAuthAmount: oneTapAuthAmount || "",
        paymentAmount: amountOwed || "",
        paymentRawAmount: rawAmountOwed || "",
        paymentStatus: payStatus || "",
        paymentStatusColor: payStatus == Strings.SB_PAYSTATUS_PEND ? Colors.ORANGE : Colors.RED,

        requestorName: name || "",
        requestorInitials: text || "",
        requestorMobileNumber,
        requestorFormattedNumber,
        requestorProfilePic: imageUrl || null,
        ownerAccountNo,
        ownerAccountCode,
    };
};

export const massageAccountsData = (accountsList, accountNo) => {
    console.log("[SBController] >> [massageAccountsData]");

    let defaultAccount;

    // Empty check
    if (!accountsList || !(accountsList instanceof Array) || !accountsList.length) {
        return [];
    }

    // Filter other accounts and mark selected as false
    const nonSelectedAccounts = accountsList
        .filter((account) => {
            if (account.number == accountNo) {
                defaultAccount = account;
                return false;
            } else {
                return true;
            }
        })
        .map((updatedAccount) => {
            return {
                ...updatedAccount,
                selected: false,
            };
        });

    if (defaultAccount) {
        defaultAccount.selected = true;
        return [defaultAccount, ...nonSelectedAccounts];
    } else {
        return nonSelectedAccounts;
    }
};

export const getFundTransferEnquiryParams = (accountNo) => {
    console.log("[SBController] >> [getFundTransferEnquiryParams]");

    return {
        bankCode: FundConstants.MBB_BANK_CODE_MAYBANK,
        fundTransferType: FundConstants.MBB_BANK_CODE,
        fundTransferSubType: "SPLIT_BILL",
        toAccount: accountNo,
        payeeCode: FundConstants.MBB_BANK_AQUIRER_ID,
        swiftCode: FundConstants.MBB_BANK_SWIFT_CODE,
    };
};

export const getTACParams = (stateData) => {
    console.log("[SBController] >> [getTACParams]");

    const { paymentRawAmount, selectedAccount, ownerAccountNo, requestorName, splitBillName } =
        stateData;

    return {
        amount: paymentRawAmount,
        fromAcctNo: selectedAccount.number,
        fundTransferType: FundConstants.SPLIT_BILL_TRANSFER,
        accCode: selectedAccount.code,
        toAcctNo: ownerAccountNo.substr(0, 12),
        payeeName: requestorName,
        payeeBank: splitBillName,
    };
};

export const getFundTransferParams = (stateData) => {
    console.log("[SBController] >> [getFundTransferParams]");

    const {
        accountHolderName,
        mobileSDK,
        selectedAccount,
        paymentRawAmount,
        ownerAccountNo,
        ownerAccountCode,
        splitBillName,
        secure2uValidateData,
    } = stateData;

    // To Account Details - Error checking
    if (!accountHolderName || !ownerAccountNo || !ownerAccountCode) {
        return { error: true, errorMsg: "Missing account details. Please try again later." };
    }

    // Selected account check
    if (!selectedAccount) {
        return { error: true, errorMsg: "Please select an account." };
    }

    const { number: fromAccount, code: fromAccountCode } = selectedAccount;

    // From Account Details - Error checking
    if (!fromAccount || !fromAccountCode) {
        return { error: true, errorMsg: "Missing required details from selected account." };
    }
    const twoFAS2uType = secure2uValidateData?.pull === "N" ? "SECURE2U_PUSH" : "SECURE2U_PULL"; //s2u interops changes

    return {
        recipientName: accountHolderName,
        effectiveDate: "00000000",
        fromAccount,
        fromAccountCode,
        paymentRef: splitBillName, //transferParams.reference,
        toAccount: ownerAccountNo.substr(0, 12),
        toAccountCode: "0000", // ownerAccountCode, [02/06/2020] This was changed to static value after Zaki informed for ThirdParty it should be 0000
        paymentDesc: splitBillName,
        transferAmount: String(paymentRawAmount),
        mbbbankCode: FundConstants.MBB_BANK_CODE_MAYBANK,
        transferType: FundConstants.FUND_TRANSFER_TYPE_MAYBANK,
        transferSubType: FundConstants.SUB_TYPE_OPEN,
        twoFAType: twoFAS2uType,
        swiftCode: FundConstants.MBB_BANK_SWIFT_CODE,
        mobileSDKData: mobileSDK,
    };
};
