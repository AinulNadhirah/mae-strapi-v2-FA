/* eslint-disable no-unused-vars */
// GET: /fnb/v1/samasamalokal/postLogin/prompter
export const prompterResponse = {
    message: "success",
    code: 200,
    challenge: null,
    result: {
        code: 200,
        status: "QR000",
        text: "success",
        totalPage: null,
        totalRecord: null,
        pageSize: null,
        currentPage: null,
        data: {
            prompts: [
                {
                    // special handling, one off
                    prompter_id: 107,
                    title: "Update Availible",
                    desc: "Customer your orders easier with Sama-Sama Lokal's latest update. Tap below and get the latest version of MAE app on App Store or Playstore now.",
                    btnText: "Update Now",
                    prompter_image: "",
                    event: 3,
                    prompterId: 107,
                    is_force_update: true,
                    latest_app_version: 9.6,
                },
                {
                    prompterId: 1,
                    title: "Last Order at 7pm",
                    desc: "All shop close at 8pm during MCO",
                    btnText: "Got it",
                    event: 0,
                },
                {
                    prompterId: 2,
                    title: "Introducing Sama-Sama Lokal",
                    desc: "Now you can shop more with Sama-Sama Lokal",
                    btnText: "Lets Go!",
                    event: 1,
                },
                {
                    prompterId: 3,
                    title: "Discover new merchant everyday",
                    desc: "Try out new merchant to support them evenly",
                    btnText: "Lets Go!",
                    event: 2,
                },
            ],
        },
    },
};
// event 0: Once appOpen (Context)
// event 1: Once after app installed (AsyncStorage)
// event 2: Daily (AsyncStorage), stored in UTC format (refresh every 12am local time according to phone settings)

// Logic:
// 1. Construct an array of "blacklisted" prompter IDs (which prompters are already shown according to various events mentioned above)
// 2. Filter prompts array given by API with an array of blacklisted IDs
// 3. Display the remaining prompters, and update (Context/AsyncStorage) correspondently upon user tapped on (Action/Dismiss) button
