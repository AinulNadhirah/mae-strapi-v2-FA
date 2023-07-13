// import { expect as jestExpect } from "@jest/globals";
import { expect, element, device, by } from "detox";

describe("MAE - Onboarding", () => {
    describe("Onboarding flow by screen", () => {
        describe("Navigate to onboarding flow", () => {
            beforeEach(async () => {
                // move to onboarding flow

                // we don't wanna wait for images to finish loading
                await device.setURLBlacklist([
                    "http://sit-maya.maybank.com.my/cms/document-view/*",
                ]);
                // skip intro
                await element(by.id("onboarding_intro_skip")).tap();

                // should go to onboard flow
                await element(by.id("dashboard_manage_quick_action")).tap();
            });

            it("should render onboarding start screen", async () => {
                await expect(element(by.id("onboarding_start"))).toBeVisible();
            });
        });

        describe("Onboarding flow", () => {
            describe("Onboarding start screen", () => {
                describe("Onboarding start options button", () => {
                    afterEach(async () => {
                        // just make sure to go back
                        console.log("go back");
                        await element(by.id("go_back")).tap();
                    });

                    it("should go to username screen when first button tapped", async () => {
                        await element(by.id("onboarding_start_etb")).tap();
                        await expect(element(by.id("onboarding_username"))).toBeVisible();
                    });

                    it("should go to MAE intro screen when second button tapped", async () => {
                        await element(by.id("onboarding_start_ntb")).tap();
                        await expect(element(by.id("onboarding_mae_intro"))).toBeVisible();
                    });

                    it("should go to web view and loaded the M2U registration", async () => {
                        await element(by.id("onboarding_register_m2u")).tap();
                        await expect(element(by.id("common_pdf_view"))).toBeVisible();
                        await expect(element(by.id("common_pdf_view_webview"))).toBeVisible();
                        await expect(element(by.id("common_pdf_view_webview"))).toHaveLabel(
                            "https://www.maybank2u.com.my/home/m2u/common/signup.do"
                        );
                    });
                });

                it("should go back when back button pressed", async () => {
                    await element(by.id("go_back")).tap();
                    await expect(element(by.id("dashboard_status_bar"))).toBeVisible();
                });
            });

            describe("Onboarding username screen", () => {
                const username = "mayauat06";

                it("should disabled the continue button", async () => {
                    await element(by.id("dashboard_manage_quick_action")).tap();
                    await element(by.id("onboarding_start_etb")).tap();

                    await element(by.id("onboarding_username_continue")).tap();

                    // thing should happen and you should still be in the username screen
                    await expect(element(by.id("onboarding_username"))).toBeVisible();
                });

                // this test button enable state and also the error message
                it("should enable the button if the username have any input of character, and shows error message", async () => {
                    await element(by.id("onboarding_username_input")).clearText();

                    await element(by.id("onboarding_username_input")).typeText("a");
                    await element(by.id("onboarding_username_continue")).tap();

                    // should trigger the button, but an error should be shown
                    await expect(
                        // unable to get the error message with its ID, so we use the text
                        element(by.text("Please enter valid Maybank2u username"))
                    ).toBeVisible();
                });

                it("should have the same value of username as inputted", async () => {
                    await element(by.id("onboarding_username_input")).clearText();
                    await element(by.id("onboarding_username_input")).typeText(username);

                    await expect(element(by.id("onboarding_username_input"))).toHaveText(username);
                });

                describe("should go to", () => {
                    afterEach(async () => {
                        await element(by.id("go_back")).tap();
                    });

                    it("should go to forgot login details when link is tapped", async () => {
                        await element(by.id("onboarding_username_forgot_login_details")).tap();

                        await expect(
                            element(by.id("onboarding_forgot_login_details"))
                        ).toBeVisible();
                    });

                    it("should go to security image screen once username validated", async () => {
                        await element(by.id("onboarding_username_input")).clearText();

                        await element(by.id("onboarding_username_input")).typeText(`${username}`);
                        await element(by.id("onboarding_username_continue")).tap();

                        await expect(element(by.id("onboarding_security_image"))).toBeVisible();
                    });
                });

                it("should go back to onboarding start when back is pressed", async () => {
                    await element(by.id("go_back")).tap();

                    await expect(element(by.id("onboarding_start"))).toBeVisible();
                });

                it("should go back to dashboard start when close is pressed", async () => {
                    await element(by.id("onboarding_start_etb")).tap();
                    await element(by.id("close")).tap();

                    await expect(element(by.id("dashboard_status_bar"))).toBeVisible();
                });
            });
        });
    });
});
