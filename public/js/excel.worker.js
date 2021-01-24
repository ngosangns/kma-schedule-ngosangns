self.importScripts('./xlsx.full.min.js')
self.addEventListener('message', function (file) {
    let reader = new FileReader();
    reader.onload = function (e) {
        let data = new Uint8Array(e.target.result);
        // eslint-disable-next-line no-undef
        let workbook = XLSX.read(data, { type: "array" });
        workbook = workbook.Sheets[workbook.SheetNames[0]];
        
        let result = proccessExcel(workbook);
        self.postMessage(result)
    };
    reader.readAsArrayBuffer(file.data);
}, false)

function alphaToNum(alpha) {
    var i = 0,
        num = 0,
        len = alpha.length;
    for (; i < len; i++)
        num = num * 26 + alpha.charCodeAt(i) - 0x40;
    return num - 1;
}

function numToAlpha(num) {
    var alpha = '';
    for (; num >= 0; num = parseInt(num / 26, 10) - 1)
        alpha = String.fromCharCode(num % 26 + 0x41) + alpha;
    return alpha;
}

function getEndIndexCell(startIndex, worksheet) {
    let c, r
    startIndex.c = alphaToNum(startIndex.c) + 1
    for (cell of worksheet["!merges"]) {
        if (cell.s.c == startIndex.c - 1 && cell.s.r == startIndex.r - 1) {
            c = cell.e.c
            r = cell.e.r
        }
    }
    return { c: numToAlpha(c), r }
}

function parseIndexCell(indexTable) {
    let c, r
    c = indexTable.match(/^[A-Z]*/i)[0]
    r = +indexTable.match(/[0-9]*$/i)[0]
    return {c, r}
}

function getSubjectInfo(worksheet) {
    // Get "Môn học" column index
    let subjectColumnsIndex = []
    for (let cell in worksheet) {
        if (worksheet[cell]['w'])
        if (worksheet[cell]['w'] == "Môn học")
            subjectColumnsIndex.push({
                s: parseIndexCell(cell),
                e: getEndIndexCell(parseIndexCell(cell), worksheet)
            })
    }

    // Index start by 1 (i)
    // Get subject info
    let subject = []
    for (subjectColumn of subjectColumnsIndex) {
        // Move the pointer to the first subject row in excel
        let i = subjectColumn.e.r + 2
        while (worksheet[subjectColumn.s.c + i]) {
            console.log(worksheet[subjectColumn.s.c + i])
            subject.push({
                lop_hoc_phan: worksheet[subjectColumn.s.c + i].w,
                hoc_phan: worksheet[numToAlpha(alphaToNum(subjectColumn.e.c) + 1) + i].w,
                tkb: []
            })
            i++
        }
    }
    return subject
}

/**
 * count subject rows on top of table
 * @param {*} worksheet 
 */
function countSubjectRows(worksheet) {
    let i = 6;
    while (worksheet['B' + i] || worksheet['Q' + i])
        i++
    return i
}

function proccessExcel(worksheet) {
    let subject = getSubjectInfo(worksheet)
    let min_time = null
    let max_time = null

    // Point to first classtime in table
    let i = countSubjectRows(worksheet) + 2
    let j = alphaToNum('D')
    let range = {
        s: { c: j, r: i },
        e: null
    }

    // eslint-disable-next-line no-constant-condition
    // Get the axis x range of the schedule
    while (true) {
        if (!worksheet[numToAlpha(j) + (i + 1)]) {
            j--
            break
        }
        j++
    }
    range.e = { c: j, r: i + 111 }

    let subject_data = []
    // Loop for merged cells
    for (let index in worksheet['!merges']) {
        let cell = worksheet['!merges'][index]
        // If cell is classtime
        if (
            // If cell is in the range
            cell.s.c >= range.s.c
            && cell.s.c <= range.e.c
            && cell.s.r >= range.s.r
            && cell.s.r <= range.e.r
            // If cell is has data
            && worksheet[numToAlpha(cell.s.c) + (cell.s.r + 1)]
        ) {
            // Count shift length
            let i = Number(cell.s.r - 1)
            let shift_start = 0
            let shift_length = cell.e.r - cell.s.r + 1
            // eslint-disable-next-line no-constant-condition
            while (true) {
                if (
                    worksheet[numToAlpha(cell.s.c) + (i + 1)]
                    && worksheet[numToAlpha(cell.s.c) + (i + 1)].w.match(/[0-9]{1,2}\/[0-9]{1,2}/i)
                ) {
                    let temp = {
                        date: worksheet[numToAlpha(cell.s.c) + (i + 1)].w,
                        hoc_phan: worksheet[numToAlpha(cell.s.c) + (cell.s.r + 1)].w,
                        // eslint-disable-next-line no-unused-vars
                        shift: Array.apply(null, Array(shift_length)).map(_ => {
                            shift_start++
                            return shift_start.toString()
                        })
                    }
                    subject_data.push(temp)
                    break
                }
                shift_start++
                i--
                // If shift_start is over classtime length
                if (shift_start > 16) {
                    break
                }
            }
        }
    }

    for (let day of subject_data) {
        subject.forEach((item, index) => {
            if (day.hoc_phan.split(' ')[0] == item.hoc_phan) {
                let temp_date = new Date()
                temp_date.setHours(0, 0, 0, 0)
                // catch date by regex
                let temp_date_match = day.date.match(/([0-9]{1,2})\/([0-9]{1,2})\/([0-9]{2,4})/i)
                if (temp_date_match)
                    temp_date.setFullYear(parseInt(temp_date_match[3]), parseInt(temp_date_match[2]) - 1, parseInt(temp_date_match[1]))
                else {
                    temp_date_match = day.date.match(/([0-9]{1,2})\/([0-9]{1,2})/i)
                    temp_date.setFullYear(new Date().getFullYear(), parseInt(temp_date_match[2]) - 1, parseInt(temp_date_match[1]))
                }

                if (!min_time) min_time = temp_date
                else if (min_time > temp_date) min_time = temp_date
                if (!max_time) max_time = temp_date
                else if (max_time < temp_date) max_time = temp_date

                subject[index].tkb.push({
                    address: null,
                    startTime: temp_date,
                    endTime: temp_date,
                    dayOfWeek: [{
                        dow: temp_date.getDay() == 0 ? 8 : temp_date.getDay() + 1,
                        shi: day.shift
                    }]
                })
            }
        })
    }
    
    if (!max_time) return false;
    max_time = max_time.getTime()
    min_time = min_time.getTime()

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
        for (let _subject of subject)
        for (let season of _subject.tkb)
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
                                content: `${_subject.lop_hoc_phan}${season.address ? ` tại ${season.address}` : ''}`,
                                name: _subject.lop_hoc_phan,
                                address: season.address ? season.address : null,
                                length: sub_day.shi.length
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