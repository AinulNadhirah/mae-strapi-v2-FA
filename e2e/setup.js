import { device } from "detox";

beforeAll(async () => {
    await device.launchApp({
        permissions: {
            notifications: "YES",
            location: "inuse",
        },
    });
});
