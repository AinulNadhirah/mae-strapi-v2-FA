import { element, device, by } from "detox";

/**
 * This test assume no error, no network issue and no other device login flow
 * if there is it will likely fail
 */
describe("Positive login flow", () => {
    beforeEach(async () => {
        device.reloadReactNative();
    });

    it("Should able to onboard successfully", async () => {
        // change this details based on your environment
        const username = "Uat_test06";
        const password = "pass1234";
        const accountNo = "5148510043130000000";

        // we don't wanna wait for images to finish loading
        await device.setURLBlacklist(["http://sit-maya.maybank.com.my/cms/document-view/*"]);
        // skip intro
        await element(by.id("onboarding_intro_skip")).tap();

        // should go to onboard flow
        await element(by.id("dashboard_manage_quick_action")).tap();

        // go to username screen
        await element(by.id("onboarding_start_etb")).tap();

        // clear input
        await element(by.id("onboarding_username_input")).clearText();

        // input username
        await element(by.id("onboarding_username_input")).typeText(username);

        // tap continue
        await element(by.id("onboarding_username_continue")).tap();

        // tap on its mine
        await element(by.id("security_image_it_is_mine")).tap();

        // enter password
        await element(by.id("password")).typeText(password);

        // tap submit
        await element(by.id("password_submit")).tap();

        // create PIN
        await element(by.id("numerical_pad_1")).tap();
        await element(by.id("numerical_pad_1")).tap();
        await element(by.id("numerical_pad_1")).tap();
        await element(by.id("numerical_pad_1")).tap();
        await element(by.id("numerical_pad_1")).tap();
        await element(by.id("numerical_pad_1")).tap();

        // go to confirm pin
        await element(by.id("numerical_pad_done")).tap();

        // confirm PIN
        await element(by.id("numerical_pad_1")).tap();
        await element(by.id("numerical_pad_1")).tap();
        await element(by.id("numerical_pad_1")).tap();
        await element(by.id("numerical_pad_1")).tap();
        await element(by.id("numerical_pad_1")).tap();
        await element(by.id("numerical_pad_1")).tap();

        // go to biometric
        await element(by.id("numerical_pad_done")).tap();

        // set later
        await element(by.id("biometric_set_later")).tap();

        // confirm phone
        await element(by.id("phone_number_proceed")).tap();

        // skip OTP
        await element(by.id("otp_display_populate")).tap();

        // proceed to profile name
        await element(by.id("numerical_pad_done")).tap();

        // enter profile name
        await element(by.id("profile_name")).typeText("Jordan");

        // proceed choose account
        await element(by.id("profile_proceed")).tap();

        // pick by account no (make sure to know the account no of account you wanna test)
        await element(by.id(`choose_account_${accountNo}`)).tap();

        // proceed to complete
        await element(by.id("choose_account_continue")).tap();
    });
});
