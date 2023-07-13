export const ELIGIBILITY_SUCCESS = (
    eligibility,
    loanInformation,
    grassIncome,
    totalMonthNonBank
) => ({
    data: eligibility,
    loanInformation: loanInformation,
    grassIncome: grassIncome,
    totalMonthNonBank: totalMonthNonBank,
});
