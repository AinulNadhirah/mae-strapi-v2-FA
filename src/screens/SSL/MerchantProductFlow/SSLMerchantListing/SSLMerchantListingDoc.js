/* eslint-disable no-unused-vars */

// /fnb/v1/samasamalokal/postLogin/merchantFilter

// SSLLanding "What would you like to order" Grid item - L2 Filter
let request = {
    longitude: "101.6938113",
    latitude: "3.181899",
    section: "80",
    landingSection: "nearby",
    page: 1,
    pageSize: 10,
};

// SSLLanding Promotions - (Only this entry point, we need to pre-select and disable Promotions pill in SSLFilterScreen)
request = {
    longitude: "101.6938113",
    latitude: "3.181899",
    promotionId: "",
    page: 1,
    pageSize: 10,
};

// SSLLanding Order again View all
request = {
    longitude: "101.6938113",
    latitude: "3.181899",
    landingSection: "orderAgain",
    page: 1,
    pageSize: 10,
};

// SSLLanding Browse Merchant View all
request = {
    longitude: "101.6938113",
    latitude: "3.181899",
    landingSection: "nearby",
    page: 1,
    pageSize: 10,
};

// Filter parameters (get it back from SSLFilterScreen)
request = {
    longitude: "101.6938113",
    latitude: "3.181899",
    section: "80", // L2
    radius: 60,
    promotionId: "", // Promotions
    deliveryId: "1",
    menuType: "100", // L3 -> categories
    price: 1,
    page: 1,
    pageSize: 10,
};
