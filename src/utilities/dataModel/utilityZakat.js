export const checkIfNumberWithPrefix = (mobileNumber) => {
    const numberPrefix60 = mobileNumber.substring(0, 2);
    const numberPrefix0 = mobileNumber.substring(0, 1);
    if (numberPrefix60 === "60") {
        return mobileNumber.substring(2);
    }
    if (numberPrefix0 === "0") {
        return mobileNumber.substring(1);
    }
    return mobileNumber;
};

export const formatNumber = (number) => {
    return number.toString().replace(/(\d{2})(\d{1,4})?(\d{1,4})?/, (_, p1, p2, p3) => {
        let output = "";
        if (p1) output = `${p1}`;
        if (p2) output += ` ${p2}`;
        if (p3) output += ` ${p3}`;
        return output;
    });
};

/**
 * input: 0172738291
 * output: +60 17 273 8291
 *
 * input: 60172738291
 * output: +60 17 273 8291
 */
export const APIContactToDisplayCntry = (contact) => {
    try {
        if (contact.substring(0, 1) === "0") {
            contact = "+6" + contact;
        } else if (contact.substring(0, 2) === "60") {
            contact = "+" + contact;
        } else {
            contact = "+60 " + contact;
        }
        return contact
            .toString()
            .replace(/ /g, "")
            .replace(/(\d{2})-?(\d{1,2})-?(\d{1,3})?(\d{1,4})?/, (_, p1, p2, p3, p4) => {
                let output = "";
                if (p1) output = `${p1}`;
                if (p2) output += ` ${p2}`;
                if (p3) output += ` ${p3}`;
                if (p4) output += ` ${p4}`;
                return output;
            });
    } catch (e) {
        return contact;
    }
};
