/**
 * 1. For SSL's location pill (location & address) we have 3 sources:
 * - delyva search result (delyva's data)
 * - delyva reverse geo result (delyva's data)
 * - SSL addressbook result (stored in MBB server)
 *
 * 2. Here we consolidate and map all 3 sources to our SSL addressbook format, with a
 * "addressType" key to differentiate it
 * addressType : 1 - delyva search result 2 - delyva revese geo 3 - SSL addressbook
 */
// eslint-disable-next-line no-unused-vars
const SSLAddressResponseSample = {
    id: "155",
    name: "House",
    addressLine1: "1, Jalan Bangau 4",
    addressLine2: "Bandar Puchong Jaya",
    city: "Puchong",
    state: "Selangor",
    postcode: "47100",
    latitude: "3.0528786",
    longitude: "101.6264968",
    note: null,
    recipientName: "Jack",
    contactNo: "0121231234",
    email: "ivenlai.mbb@gmail.com",
    defaultAddress: false,
    home: false,
    work: false,
};

function determineState({ state, city }) {
    /** Delyva's API return state with multiple types. We try out best to match with our list*/
    try {
        // both city or state
        if (
            state.toLowerCase().replace(/\s/g, "") === "wilayahpersekutuankualalumpur" ||
            state.toLowerCase().replace(/\s/g, "") === "wilayah persekutuan kuala lumpur" ||
            state.toLowerCase().replace(/\s/g, "") === "wilayah persekutuan" || // 99% meant KL, not labuan
            state.toLowerCase().replace(/\s/g, "") === "kualalumpur" ||
            state.toLowerCase().replace(/\s/g, "") === "kuala lumpur" ||
            state.toLowerCase().replace(/\s/g, "") === "kl" ||
            city.toLowerCase().replace(/\s/g, "") === "kualalumpur" ||
            city.toLowerCase().replace(/\s/g, "") === "kuala lumpur" ||
            city.toLowerCase().replace(/\s/g, "") === "kl"
        ) {
            state = "WP Kuala Lumpur";
        }
        if (state.toLowerCase().replace(/\s/g, "") === "wilayahpersekutuanlabuan") {
            state = "WP Labuan";
        }
        if (state.toLowerCase().replace(/\s/g, "") === "wilayahpersekutuanputrajaya") {
            state = "WP Putrajaya";
        }
        if (state.toLowerCase().replace(/\s/g, "") === "johore") {
            state = "Johor";
        }
        if (state.toLowerCase().replace(/\s/g, "") === "melaka") {
            state = "Malacca";
        }
        if (state.toLowerCase().replace(/\s/g, "") === "melacca") {
            state = "Malacca";
        }
    } catch (e) {
        //do nothing
    }
    return state;
}

export function delyvaSearchResultToAddrFormat(response) {
    // console.log("delyvaSearchResultToAddrFormat", response);
    let places = response.filter((obj) => {
        let addressLine1 = obj.address?.address1;

        /**
         * The results from delyva is inconsistent. Notice the address1 and label
         *  let temp = {
                address1: "",
                address2: "Taman Maluri",
                label: "Aeon Cheras, Taman Maluri, 52000 Cheras, Kuala Lumpur",
                postcode: "52000"
            };
            let temp = {
                address1: "Aeon Cheras, Taman Maluri, 52000 Cheras, Kuala Lumpur",
                address2: "Taman Maluri",
                label: "Aeon Cheras, Taman Maluri, 52000 Cheras, Kuala Lumpur",
                postcode: "52000"
            };
         * 
         * label will always has the best address, whereas address1 and address2 sometimes empty / weird values.
         * So we're taking label value only, and manually populate address1 by splitting the "label" with "postcode"
         */
        try {
            let tempString = obj.address?.label.split(obj?.address?.postcode);
            tempString = tempString[0];
            console.log("tempString", tempString);
            if (tempString.endsWith(", ")) {
                tempString = tempString.substring(0, tempString.length - 2);
            }
            addressLine1 = tempString;
        } catch (e) {
            //do nothing
        }
        obj.address.address1 = addressLine1;

        return (
            obj.address?.country === "MY" &&
            obj.address?.address1 &&
            obj.address?.state &&
            obj.address?.city &&
            obj.address?.postcode
        );
    });

    // console.log("filtered:", places);
    places = places.map((place) => {
        const city = place.address?.city;
        let state = place.address?.state;
        state = determineState({ state, city });

        return {
            label: place.address?.label, // <- Not part of address API, just to display in search result
            title: place?.title, // <- Not part of address API, just to display in search result
            addressType: 1,
            id: place.id,
            addressLine1: place.address?.address1,
            city,
            state,
            postcode: place.address?.postcode,
            latitude: place.address?.coord?.lat,
            longitude: place.address?.coord?.lon,
            name: "",
        };
    });
    // console.log("filtered1:", places);
    return places;
}

export function delyvaReverseGeoResultToAddrFormat(response) {
    // console.log("delyvaReverseGeoResultToAddrFormat", response);

    /**
     * delyva returning the following format:
     * {
            address1:""
            address2:Kuala Lumpur
            city:Kuala Lumpur
            state:Wilayah Persekutuan Kuala Lumpur
            postcode:51100
            formattedAddress:lot 1-20 sky awani 2, Sentul, 51100 Kuala Lumpur, Wilayah Persekutuan Kuala Lumpur, Malaysia
        }
     * address1 is not reliable, the most reliable value is formattedAddress
     * Hence we use formattedAddress (the part before postcode) as our addressbook's address1, while our addressbook's 
     *  address2 is not being used
     */
    let splitByPostcode = "";
    try {
        splitByPostcode = response.formattedAddress.split(response?.postcode);
        splitByPostcode = splitByPostcode[0];
        if (splitByPostcode.endsWith(", ")) {
            splitByPostcode = splitByPostcode.substring(0, splitByPostcode.length - 2);
        }
    } catch (e) {
        //do nothing
    }

    const state = determineState({ state: response?.state, city: response?.city });

    return {
        addressType: 2,
        id: response.id,
        addressLine1: splitByPostcode,
        city: response?.city,
        state,
        postcode: response?.postcode,
        latitude: response?.coord?.lat,
        longitude: response?.coord?.lon,
        name: "",
    };
}

export function massageAddressFormat(addresses) {
    try {
        return addresses.map((obj) => {
            obj.addressType = 3;
            return obj;
        });
    } catch (e) {
        return [];
    }
}

export function displayLocationTitle({ currSelectedLocationV1 }) {
    let locationLbl = "Select your location";
    if (currSelectedLocationV1?.name) {
        locationLbl = `${currSelectedLocationV1.name}`;
    } else if (currSelectedLocationV1?.addressLine1) {
        locationLbl = `${currSelectedLocationV1.addressLine1}`;
    }
    return locationLbl;
}

// This is another func that is similar to above, could be consolidated into one
export function displayLocationInCart({ currSelectedLocationV1 }) {
    let locationLbl = "Select your location";
    let locationAddr = "";
    if (currSelectedLocationV1?.name) {
        locationLbl = `${currSelectedLocationV1.name}`;
        locationAddr = `${currSelectedLocationV1.addressLine1}`;
    } else if (currSelectedLocationV1?.addressLine1) {
        locationLbl = "Current Location";
        locationAddr = `${currSelectedLocationV1.addressLine1}`;
    }
    return { name: locationLbl, addr: locationAddr };
}
