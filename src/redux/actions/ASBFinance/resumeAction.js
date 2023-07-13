export const resumeAction = (stpDetails, loanInformation) => ({
    type: "RESUME_SUCCESS",
    data: stpDetails,
    loanInformation: loanInformation && loanInformation,
});

export const RESUME_CLEAR = () => ({});
