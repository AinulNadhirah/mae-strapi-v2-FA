import { invokeL2, invokeL3 } from "@services/index";

export const invokeL2Challenge = async (getModel) => {
    const { isPostLogin } = getModel("auth");
    if (!isPostLogin) {
        const httpResp = await invokeL2(true).catch((error) => {
            console.log("[invokeL2] >> Exception: ", error);
        });
        const code = httpResp?.data?.code ?? null;
        if (code !== 0 && code !== undefined) {
            return true;
        }
    }
};

export const invokeL3Challenge = async (getModel) => {
    const { isPostPassword } = getModel("auth");
    if (!isPostPassword) {
        const httpResp = await invokeL3(true).catch((error) => {
            console.log("[invokeL3] >> Exception: ", error);
        });
        const code = httpResp?.data?.code ?? null;
        if (code !== 0 && code !== undefined) {
            return true;
        }
    }
};
