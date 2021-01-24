/* eslint-disable no-unused-vars */
function restructureTKB(data) {
    let categories = {
        lop_hoc_phan: "Lớp học phần",
        hoc_phan: "Học phần",
        thoi_gian: "Thời gian",
        dia_diem: "Ðịa điểm",
        giang_vien: "Giảng viên",
        si_so: "Sĩ số",
        so_dk: "Số ÐK",
        so_tc: "Số TC",
        ghi_chu: "Ghi chú"
    }

    // check null
    if (data.length == 0 || data == false) return false
    // remove price
    data.pop()
    // if after remove price just only have header titles then return
    if (data.length == 1) return false
    // create var
    let header_data = data[0]
    let content_data = data.slice(1, data.length)
    let min_time, max_time;
    let data_subject = Array.prototype.map.call(content_data, function (td) {
        let regex_time_spliter = "([0-9]{2}\\/[0-9]{2}\\/[0-9]{4}).+?([0-9]{2}\\/[0-9]{2}\\/[0-9]{4}):(\\([0-9]*\\))?(.+?)((Từ)|$)+?"
        let regex_time_spliter_multi = new RegExp(regex_time_spliter, "g")
        let regex_time_spliter_line = new RegExp(regex_time_spliter)

        let temp_dia_diem = td[header_data.indexOf(categories.dia_diem)]
        let temp_dia_diem_season_index = temp_dia_diem.match(/\([0-9,]+?\)/g);
        // return null (not remove) if not match the pattern (to sync with season time)
        if (!temp_dia_diem_season_index) temp_dia_diem = null
        if (temp_dia_diem) {
            // add \n before each season
            temp_dia_diem_season_index.forEach(child_item =>
                temp_dia_diem = temp_dia_diem.replace(child_item, "\n" + child_item))
            // split season
            temp_dia_diem = temp_dia_diem.match(/\n\(([0-9,]+?)\)(.+)/g);
            temp_dia_diem = Array.prototype.map.call(temp_dia_diem, item => {
                let temp = item.match(/\n\(([0-9,]+?)\)(.+)/)
                temp = [temp[1].split(","), temp[2]]
                // merge splited season to address
                let temp2 = Array.prototype.map.call(temp[0], child_item => `(${child_item}) ${temp[1]}`)
                return temp2
            }).flat();
            temp_dia_diem.sort(function (a, b) {
                return parseInt(a[1]) - parseInt(b[1]);
            });
            // remove season index in string
            temp_dia_diem = Array.prototype.map.call(temp_dia_diem, item => item.replace(/^\([0-9]+?\) /i, '').trim());
        }


        // ---------------------------------

        let temp_thoi_gian =
            td[header_data.indexOf(categories.thoi_gian)]
                .match(regex_time_spliter_multi)
        // throw Error if subject hasn't had class times
        if (!temp_thoi_gian) return false
        temp_thoi_gian.forEach((item, index) => {
            item = item.match(regex_time_spliter_line)
            // remove if not match the pattern
            if (!item) { temp_thoi_gian.splice(index, 1); return; }
            item[4] = item[4].split("&nbsp;&nbsp;&nbsp;")
            item[4].shift(); // remove trash
            item[4].forEach((child_item, child_index) => {
                // split day of week part
                child_item = child_item.match(/((Thứ .+?)||Chủ nhật) tiết (.+?)$/)
                // remove if not match the pattern
                if (!child_item) { item[4].splice(child_index, 1); return }
                // remove trash
                let dayOfWeek_number = {
                    "Thứ 2": 2,
                    "Thứ 3": 3,
                    "Thứ 4": 4,
                    "Thứ 5": 5,
                    "Thứ 6": 6,
                    "Thứ 7": 7,
                    "Chủ nhật": 8
                }
                if (child_item) {
                    child_item[3] = child_item[3].split(/[^0-9]+/g); child_item[3].pop()
                    child_item = { dow: dayOfWeek_number[child_item[1]], shi: child_item[3] }
                }
                // save element
                item[4][child_index] = child_item
            })
            // remove trash
            item[1] = `${item[1].substr(3, 2)}/${item[1].substr(0, 2)}/${item[1].substr(6, 4)}`
            item[2] = `${item[2].substr(3, 2)}/${item[2].substr(0, 2)}/${item[2].substr(6, 4)}`
            item[1] = new Date(Date.parse(item[1]))
            item[2] = new Date(Date.parse(item[2]))
            item = {
                startTime: item[1],
                endTime: item[2],
                dayOfWeek: item[4],
                address: temp_dia_diem ? temp_dia_diem[index] : null
            }

            // save min/max time
            if (min_time) { if (min_time > item.startTime) min_time = item.startTime }
            else min_time = item.startTime
            if (max_time) { if (max_time < item.endTime) max_time = item.endTime }
            else max_time = item.endTime

            // save element
            temp_thoi_gian[index] = item
        })

        // ---------------------------------

        return {
            lop_hoc_phan: td[header_data.indexOf(categories.lop_hoc_phan)],
            hoc_phan: td[header_data.indexOf(categories.hoc_phan)],
            giang_vien: td[header_data.indexOf(categories.giang_vien)],
            si_so: td[header_data.indexOf(categories.si_so)],
            so_dk: td[header_data.indexOf(categories.so_dk)],
            so_tc: td[header_data.indexOf(categories.so_tc)],
            tkb: temp_thoi_gian
        }
    })
    min_time = min_time.getTime()
    max_time = max_time.getTime()

    let days_outline = new Array();
    let one_day_time = 86400000;

    for (
        let time_iter = min_time;
        time_iter <= max_time;
        time_iter += one_day_time
    ) {
        if (new Date(time_iter).getDay() + 1 == 2 || time_iter == min_time) {
            days_outline.push([{ time: time_iter, shift: [] }]);
            continue;
        }
        days_outline[days_outline.length - 1].push({ time: time_iter, shift: [] });
    }

    for (let week of days_outline)
    for (let day of week)
    day.shift = [...Array(16).keys()].map(shift => {
        for (let subject of data_subject)
        for (let season of subject.tkb)
        if (
            day.time >= season.startTime.getTime()
            && day.time <= season.endTime.getTime()
        )
            for (let sub_day of season.dayOfWeek) {
                if (
                    sub_day.dow == new Date(day.time).getDay() + 1
                    || (new Date(day.time).getDay() + 1 == 1 && sub_day.dow == 8) // Chu nhat
                )
                    if (
                        (shift + 1) >= parseInt(sub_day.shi[0])
                        && (shift + 1) <= parseInt(sub_day.shi[sub_day.shi.length - 1])
                    )
                        if ((shift + 1) === parseInt(sub_day.shi[0])) {
                            return {
                                content: `${subject.lop_hoc_phan}${season.address ? ` tại ${season.address}` : ''}`,
                                name: subject.lop_hoc_phan,
                                address: season.address ? season.address : null,
                                length: sub_day.shi.length,
                            }
                        }
                        else return {
                            content: null,
                            name: null,
                            address: null,
                            length: 0
                        }
            }

        return {
            content: null,
            name: null,
            address: null,
            length: 1
        }
    })

    return { data_subject: days_outline }
}