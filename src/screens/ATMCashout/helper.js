/* eslint-disable prettier/prettier */
export function timeDifference(startTime, mins = 2) {
    // startTime = new Date(startTime).getTime();
    let currentTime = new Date().getTime();
    let endTime = startTime ? startTime + 60000 * mins : startTime;
    let difference = endTime - currentTime;
    let secondsInMiliseconds = 1000,
        minutesInMiliseconds = 60 * secondsInMiliseconds,
        hoursInMiliseconds = 60 * minutesInMiliseconds;

    let differenceInHours = difference / hoursInMiliseconds,
        differenceInMinutes = (differenceInHours % 1) * 60,
        differenceInSeconds = (differenceInMinutes % 1) * 60;

    const output =
        pad2(Math.floor(differenceInMinutes)) + ":" + pad2(Math.floor(differenceInSeconds));
    console.log(
        "### timeDifference",
        Math.floor(difference / 1000),
        startTime,
        currentTime,
        endTime,
        difference,
        output,
        differenceInMinutes,
        differenceInSeconds,
        new Date(startTime)
    );
    // if (difference > 0) {
    // } else {
    //     console.log("00:00");
    // }
    return Math.floor(difference / 1000);
}

function pad2(number) {
    return (number < 10 ? "0" : "") + number;
}
