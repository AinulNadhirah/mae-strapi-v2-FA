/* eslint-disable no-unused-vars */
// POST: /fnb/v1/samasamalokal/isShownSSLOnboarding (token needed)
const Request = {
    shownSSLOnboarding: true,
};

const Response = {
    message: "success",
    code: 200,
    challenge: null,
    result: {
        userId: 0,
        status: true,
        createdDate: "2021-06-28T05:32:07.563+0000",
        updatedDate: "2021-06-28T05:32:07.548+0000",
        description: " User already exist! ",
    },
};

// When user agrees the disclaimer, POST request will be sent
// and user will never navigate to SSLOnboarding again
