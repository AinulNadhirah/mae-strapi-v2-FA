import { expect, element, by, device } from "detox";

const contents = [
    {
        title: "Hello!",
        summary: `Welcome to MAE by Maybank2u.\nAn app for whatever you want, whenever you want it.`,
    },
    {
        title: "Tabung together-gether",
        summary: `Plan a holiday with friends or get that shiny new gadget. Stash money aside for your big or small moments with Tabung and get there faster!`,
    },
    {
        title: "Experience more",
        summary: `Browse deals, book the latest blockbusters, find the best flights and discover the hottest eats in town.`,
    },
];

describe("MAE - Onboarding Intro", () => {
    describe("should render Onboarding intro", () => {
        afterEach(async () => {
            // await device.reloadReactNative();
            // go back to first screen
            await element(by.id("onboarding_intro_swiper")).swipe("right");
            await element(by.id("onboarding_intro_swiper")).swipe("right");
        });

        it("should render onboarding intro", async () => {
            await expect(element(by.id("onboardingIntro"))).toBeVisible();
        });

        describe("should go to specific screen after button is tapped", () => {
            it(`should render onboarding intro first screen with title "${contents[0].title}" and others should not be visible`, async () => {
                await expect(element(by.id("onboarding_intro_screen_0"))).toBeVisible();
                await expect(element(by.id("onboarding_intro_title_0"))).toHaveText(
                    `${contents[0].title}`
                );
                await expect(element(by.id("onboarding_intro_descriptions_0"))).toHaveText(
                    `${contents[0].summary}`
                );
                await expect(element(by.id("onboarding_intro_screen_1"))).toBeNotVisible();
                await expect(element(by.id("onboarding_intro_screen_2"))).toBeNotVisible();
            });

            it(`should render second screen screen with title "${contents[1].title}" after one tap, and other should not be visible`, async () => {
                await element(by.id("onboarding_continue")).tap();
                await expect(element(by.id("onboarding_intro_screen_1"))).toBeVisible();
                await expect(element(by.id("onboarding_intro_title_1"))).toHaveText(
                    `${contents[1].title}`
                );
                await expect(element(by.id("onboarding_intro_descriptions_1"))).toHaveText(
                    `${contents[1].summary}`
                );
                await expect(element(by.id("onboarding_intro_screen_0"))).toBeNotVisible();
                await expect(element(by.id("onboarding_intro_screen_2"))).toBeNotVisible();
            });

            it(`should render third screen screen with title "${contents[2].title}" after two tap, and other should not be visible`, async () => {
                await element(by.id("onboarding_continue")).tap();
                await element(by.id("onboarding_continue")).tap();
                await expect(element(by.id("onboarding_intro_screen_2"))).toBeVisible();
                await expect(element(by.id("onboarding_intro_title_2"))).toHaveText(
                    `${contents[2].title}`
                );
                await expect(element(by.id("onboarding_intro_descriptions_2"))).toHaveText(
                    `${contents[2].summary}`
                );
                await expect(element(by.id("onboarding_intro_screen_0"))).toBeNotVisible();
                await expect(element(by.id("onboarding_intro_screen_1"))).toBeNotVisible();
            });

            it("should not render the skip link when on third screen", async () => {
                await element(by.id("onboarding_continue")).tap();
                await element(by.id("onboarding_continue")).tap();
                await expect(element(by.id("onboarding_intro_skip"))).toBeNotVisible();
            });
        });

        describe("should go to screen on swipe", () => {
            it("should render second screen when swiped to the left", async () => {
                await element(by.id("onboarding_intro_swiper")).swipe("left");

                await expect(element(by.id("onboarding_intro_screen_1"))).toBeVisible();
                await expect(element(by.id("onboarding_intro_screen_0"))).toBeNotVisible();
            });

            it("should render third screen when swiped to the left two times", async () => {
                await element(by.id("onboarding_intro_swiper")).swipe("left");
                await element(by.id("onboarding_intro_swiper")).swipe("left");

                await expect(element(by.id("onboarding_intro_screen_2"))).toBeVisible();
                await expect(element(by.id("onboarding_intro_screen_1"))).toBeNotVisible();
            });

            it("should render first screen when swiped twice to the right from third screen", async () => {
                await element(by.id("onboarding_intro_swiper")).swipe("left");
                await element(by.id("onboarding_intro_swiper")).swipe("left");
                await element(by.id("onboarding_intro_swiper")).swipe("right");
                await element(by.id("onboarding_intro_swiper")).swipe("right");

                await expect(element(by.id("onboarding_intro_screen_0"))).toBeVisible();
                await expect(element(by.id("onboarding_intro_screen_1"))).toBeNotVisible();
                await expect(element(by.id("onboarding_intro_screen_2"))).toBeNotVisible();
            });
        });
    });

    describe("when skip button is pressed", () => {
        beforeEach(async () => {
            // don't wait for the images to finish loading before proceeding as we don't need em for test
            await device.setURLBlacklist(["http://sit-maya.maybank.com.my/cms/document-view/*"]);

            // go back to first screen
            await element(by.id("onboarding_intro_swiper")).swipe("right");
            await element(by.id("onboarding_intro_swiper")).swipe("right");
        });

        it("should go to dashboard when skip is pressed in DEV", async () => {
            await element(by.id("onboarding_intro_skip")).tap();

            // in DEV
            await expect(element(by.id("dashboard_status_bar"))).toBeVisible();

            // in release
            // await expect(element(by.id("onboarding_intro_tnc_popup"))).toBeVisible();

            // release the images from blacklist
            await device.setURLBlacklist([""]);
        });
    });
});
