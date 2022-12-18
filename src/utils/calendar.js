import $ from 'jquery'

export function fetchCalendarWithPost(formObj, signInToken) {
    return $.ajax({
        url:
            "https://actvn-schedule.cors-ngosangns.workers.dev/subject",
        method: "POST",
        data: Object.keys(formObj)
            .map(key => {
                return (
                    encodeURIComponent(key) + "=" + encodeURIComponent(formObj[key])
                )
            })
            .join("&"),
        headers: {
            "Content-Type": "application/x-www-form-urlencoded",
            "x-cors-headers": JSON.stringify({
                Cookie: signInToken
            })
        }
    })
}

export function fetchCalendarWithGet(signInToken) {
    return $.ajax({
        url:
            "https://actvn-schedule.cors-ngosangns.workers.dev/subject",
        method: "GET",
        headers: {
            "x-cors-headers": JSON.stringify({
                Cookie: signInToken
            })
        }
    })
}

export function getFieldFromResult(result, field) {
    let res = result.match(new RegExp("id=\"" + field + "\" value=\"(.+?)\"", "g"))
    if (!res || !res.length) return false
    res = res[0]
    res = res.match(/value="(.+?)"/)
    if (!res || !res.length) return false
    res = res[1]
    return res
}

function stripHTMLTags(str) {
    if ((str === null) || (str === false)) return ''
    else str = str.toString()
    return str.replace(/<[^>]*>/g, '')
}

export function cleanFromHTMLtoArray(raw_tkb) {
    if (!raw_tkb || !raw_tkb.length) return false
    let student = raw_tkb.match(/<span id="lblStudent">(.+?)<\/span/g)
    if (student)
        window.localStorage.setItem(
            "student",
            student[0].match(/<span id="lblStudent">(.+?)<\/span/)[1]
        )

    // remove trash and catch table from html string
    raw_tkb = raw_tkb.replace(/ {2,}/gm, " ")
    raw_tkb = raw_tkb.replace(/<!--.*?-->|\t|(?:\r?\n[ \t]*)+/gm, "")
    raw_tkb = raw_tkb.match(/<table.+?gridRegistered.+?<\/table>/g)
    if (!raw_tkb || !raw_tkb.length) raw_tkb = raw_tkb[0]

    // convert response to DOM then export the table to array
    $("body").append("<div id=cleanTKB class=uk-hidden></div>")
    $("#cleanTKB").html(raw_tkb)
    let data_content_temp = Array.prototype.map.call(
        document.querySelectorAll("#gridRegistered tr"),
        (tr) =>
            Array.prototype.map.call(tr.querySelectorAll("td"), (td) =>
                stripHTMLTags(td.innerHTML)
            )
    )
    $("#cleanTKB").remove()

    // check null
    if (!data_content_temp) return false

    return data_content_temp
}

export function processCalendar(data) {
    return new Promise((resolve, reject) => {
        try {
            if (!data) reject("empty data")
            data = cleanFromHTMLtoArray(data)
            let worker = new Worker("js/login.worker.js");
            worker.addEventListener('message', res => {
                if (res.data) resolve(res.data)
                else reject("process failed")
            })
            worker.postMessage(data)
        }
        catch (err) {
            reject(err)
        }
    })
}