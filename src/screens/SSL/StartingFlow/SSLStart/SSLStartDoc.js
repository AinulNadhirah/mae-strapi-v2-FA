/* eslint-disable no-unused-vars */
// Check login in Geolocation screen
// GET: /stepUp/L2
const Response = {
    message: "L2",
    code: 0,
    challenge: null,
};

// If L2 FAILED -> Return back to previous screen
// If L2 SUCCESS:
// Check Onboarding by checking "onboarded" boolean status:
// GET: /fnb/v1/samasamalokal/postLogin/init
// * Onboarding slides data given by BE dynamically
export const Response2 = {
    message: "success",
    code: 0,
    challenge: null,
    result: {
        distanceList: null,
        priceList: null,
        categoryVO: null,
        screenDetails: [
            {
                id: 2,
                screen: "DISCLAIMER",
                noteDetails: [
                    {
                        id: 4,
                        title: "Disclaimer",
                        description:
                            "Sama-Sama Lokal is a commission-free marketplace.\n\nAll merchants and delivery partners featured on this platform are not agents of \nMaybank. As such, we're unable to guarantee their timeliness, quality of service \nor responsiveness. ",
                        btnLable: "I Understand",
                        screen: "DISCLAIMER",
                    },
                ],
            },
            {
                id: 1,
                screen: "ON_BOARDING",
                noteDetails: [
                    {
                        id: 1,
                        title: "Shop Anytime, Anywhere",
                        description:
                            "Never miss another great deal now\nthat your favourite hawkers, stores and\nservices are all accessible right within MAE.",
                        btnLable: "Next",
                        screen: "ON_BOARDING",
                    },
                    {
                        id: 2,
                        title: "Support Local Merchants",
                        description:
                            "Help a local business flourish when you shop from\nour list of local vendors and Maybank will cover delivery charges for your\norders!",
                        btnLable: "Next",
                        screen: "ON_BOARDING",
                    },
                    {
                        id: 3,
                        title: "Secure and Reliable",
                        description:
                            "All Sama-Sama Lokal merchants are vetted to ensure quality and financial security at all times.",
                        btnLable: "Get Started",
                        screen: "ON_BOARDING",
                    },
                ],
            },
        ],
        onboarded: false,
    },
};
// If NOT onboarded -> SSLOnboarding
// If already onboarded:
//  Get GPS location, update longitude & latitude into context -> SSLTabScreen
