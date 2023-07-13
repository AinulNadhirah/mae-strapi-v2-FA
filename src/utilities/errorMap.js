export const errorMessageMap = (error) => {
    return (
        error?.message ||
        (error?.errors ? error?.errors[0]?.message : "") ||
        (error?.error ? error?.error[0]?.message ?? error?.error?.message : "") ||
        (error?.error?.error ? error?.error?.error[0]?.message ?? error?.error?.error?.message : "")
    );
};
export const errorCodeMap = (error) => {
    console.log(error);
    return {
        message: errorMessageMap(error),
        code:
            error?.code ||
            (error?.errors ? error?.errors[0]?.code : "") ||
            (error?.error ? error?.error[0]?.code ?? error?.error?.code : "") ||
            (error?.error?.error ? error?.error?.error[0]?.code ?? error?.error?.error?.code : ""),
    };
};
