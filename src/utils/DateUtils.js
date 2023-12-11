// Determine if it was after this time yesterday
function isAfterMidnightYesterday(timestampStr) {
    const timestamp = new Date(timestampStr)
    const yesterday = new Date()
    yesterday.setDate(yesterday.getDate() - 1)

    return timestamp > yesterday
}

// Given two timestamps, determine that the first is after the second timestamp
function isOneAfterSecond(timestampStr1, timestampStr2) {
    const timestamp1 = new Date(timestampStr1)
    const timestamp2 = new Date(timestampStr2)
    return timestamp1 > timestamp2
}

// Format current time
function formatCurrentTime() {
    const now = new Date();

    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const day = String(now.getDate()).padStart(2, "0");
    const hours = String(now.getHours()).padStart(2, "0");
    const minutes = String(now.getMinutes()).padStart(2, "0");
    const seconds = String(now.getSeconds()).padStart(2, "0");
    const milliseconds = String(now.getMilliseconds()).padStart(3, "0");

    const formattedTime = `${year}-${month}-${day}T${hours}:${minutes}:${seconds}.${milliseconds}Z`;

    return formattedTime;
}

module.exports = {
    isAfterMidnightYesterday,
    isOneAfterSecond,
    formatCurrentTime
}