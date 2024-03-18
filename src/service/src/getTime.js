/*
    getTime.js
    返回当前时间
*/

function getTime(req, res) {
    const unixTime = new Date().getTime();
    const time = new Date();
    return res.status(200).json({
        unixTime,
        time
    })
}

module.exports = {getTime};