import $ from 'jquery'
import { getFieldFromResult } from './calendar'

// return SignIn token
export async function login(username, password) {
    let md5 = require("md5")
    let result = await $.ajax({
        url: "https://actvn-schedule.cors-ngosangns.workers.dev/login",
        method: "GET"
    })

    let viewState = getFieldFromResult(result, "__VIEWSTATE")
    let eventValidation = getFieldFromResult(result, "__EVENTVALIDATION")

    let data = {
        __VIEWSTATE: viewState,
        __EVENTVALIDATION: eventValidation,
        txtUserName: username.toUpperCase(),
        txtPassword: md5(password),
        btnSubmit: "Đăng nhập"
    }

    result = await fetch("https://actvn-schedule.cors-ngosangns.workers.dev/login", {
        method: "POST",
        body: Object.keys(data).map(key => encodeURIComponent(key) + "=" + encodeURIComponent(data[key])).join("&"),
        headers: {
            "Content-Type": "application/x-www-form-urlencoded"
        }
    })
    return await result.text()
}

export function logout() {
    window.localStorage.removeItem("tkb")
    window.localStorage.removeItem('student')
    window.localStorage.removeItem('semesters')
    window.localStorage.removeItem('currentSemester')
    window.localStorage.removeItem('mainForm')
    window.localStorage.removeItem('signIn')
}