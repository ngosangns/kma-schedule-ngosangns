<template>
  <div class="md-layout" :class="`md-alignment-center-center`">
    <go-top bg-color="#333" fg-color="#fff"></go-top>
    <md-toolbar class="md-layout-item md-size-100">
      <h3 class="md-title">{{ student }}</h3>
      <div class="md-toolbar-section-end">
        <md-button v-on:click="exportToGoogleCalendar()">Export to Google Calendar</md-button>
        <md-button v-on:click="signOut()">Đăng xuất</md-button>
      </div>
    </md-toolbar>

    <!-- <md-table v-model="tkb.data.data_subject" class="md-layout-item md-size-100" md-card>
      <md-table-toolbar>
        <h1 class="md-title">Thông tin học kì</h1>
      </md-table-toolbar>
      <md-table-row slot="md-table-row" slot-scope="{ item }">
        <md-table-cell md-label="STT">{{ tkb.data.data_subject.indexOf(item) + 1 }}</md-table-cell>
        <md-table-cell md-label="Lớp học phần">{{ item.lop_hoc_phan }}</md-table-cell>
        <md-table-cell md-label="Học phần">{{ item.hoc_phan }}</md-table-cell>
        <md-table-cell md-label="Giảng viên">{{ item.giang_vien }}</md-table-cell>
        <md-table-cell md-label="Sĩ số">{{ item.si_so }}</md-table-cell>
        <md-table-cell md-label="Số ĐK">{{ item.so_dk }}</md-table-cell>
        <md-table-cell md-label="Số TC">{{ item.so_tc }}</md-table-cell>
      </md-table-row>
    </md-table> -->

    <div id="tkb-container">
      <div class="md-layout-item md-gutter md-size-100">
        <div class="md-size-100" style="height: 20px; background: transparent"></div>
        <div style="display: grid; grid-template-columns: 1fr 10fr 1fr; grid-gap: 1rem">
          <md-button style="height: 100%; margin: 0" class="md-raised" :md-ripple="false" @click="currentWeekIndex--">
            <md-icon>chevron_left</md-icon>
          </md-button>
          <md-table ref="week" class="md-size-100" md-card>
            <md-table-toolbar>
              <md-field v-if="signIn" style="max-width: 15rem; margin-top: 0; margin-right: 1rem">
                <label for="semester">Học kì</label>
                <md-select v-model="currentSemester" name="semester" id="semester" @md-selected="onChangeSemester">
                  <md-option v-for="item in semesters" :key="item.value" :value="item.value">
                    {{ item.from }} - {{ item.to }} Kỳ {{ item.th }}
                  </md-option>
                </md-select>
              </md-field>
              <label class="md-title">WEEK {{ currentWeekIndex + 1 }}: {{
              moment(currentWeek[0].time).format("DD/MM/YYYY")
              }}
                -
                {{ moment(currentWeek[currentWeek.length - 1].time).format("DD/MM/YYYY") }}</label>
              <md-button class="md-raised md-primary" ref="save"
                v-on:click="save(currentWeekIndex, currentWeek[0].time, currentWeek[currentWeek.length - 1].time)">SAVE</md-button>
            </md-table-toolbar>
            <md-table-row>
              <md-table-cell colspan=2>Tiết</md-table-cell>
              <md-table-cell v-for="(shift_header, shift_header_index) in currentWeek[0].shift"
                :key="shift_header_index" v-bind:class="checkSession(shift_header_index + 1)">{{ shift_header_index + 1
                }}</md-table-cell>
            </md-table-row>

            <md-table-row v-for="(day, day_index) in currentWeek" :key="day_index">
              <md-table-cell colspan=2>
                {{ moment(day.time).format("dddd[\n]DD/MM/YYYY").split('\n')[0] }}<br>
                {{ moment(day.time).format("dddd[\n]DD/MM/YYYY").split('\n')[1] }}
              </md-table-cell>
              <template v-for="(shift, shift_index) in day.shift">
                <md-table-cell v-if="parseInt(shift.length)" :key="shift_index"
                  v-bind:class="checkSession(shift_index + 1)" v-bind:colspan="shift.length">
                  <md-card v-if="shift.content">
                    {{ shift.content }}
                  </md-card>
                </md-table-cell>
              </template>
            </md-table-row>
          </md-table>
          <md-button style="height: 100%; margin: 0" class="md-raised" :md-ripple="false" @click="currentWeekIndex++">
            <md-icon>chevron_right</md-icon>
          </md-button>
        </div>
      </div>
    </div>

    <md-table class="md-layout-item md-gutter md-size-100" md-card>
      <md-table-toolbar>
        <h1 class="md-title">Thời gian</h1>
      </md-table-toolbar>
      <md-table-row slot="md-table-row">
        <md-table-cell>Sáng</md-table-cell>
        <md-table-cell>Chiều</md-table-cell>
        <md-table-cell>Tối</md-table-cell>
      </md-table-row>
      <md-table-row slot="md-table-row">
        <md-table-cell>Tiết 01: 07h00 - 07h45</md-table-cell>
        <md-table-cell>Tiết 07: 12h30 - 13h15</md-table-cell>
        <md-table-cell>Tiết 13 - 14: 18h00 - 19h30</md-table-cell>
      </md-table-row>
      <md-table-row slot="md-table-row">
        <md-table-cell>Tiết 02: 07h50 - 08h35</md-table-cell>
        <md-table-cell>Tiết 08: 13h20 - 14h05</md-table-cell>
        <md-table-cell>Tiết 15 - 16: 19h45 - 21h15</md-table-cell>
      </md-table-row>
      <md-table-row slot="md-table-row">
        <md-table-cell>Tiết 03: 08h40 - 09h25</md-table-cell>
        <md-table-cell>Tiết 09: 14h10 - 14h55</md-table-cell>
        <md-table-cell></md-table-cell>
      </md-table-row>
      <md-table-row slot="md-table-row">
        <md-table-cell>Tiết 04: 09h35 - 10h20</md-table-cell>
        <md-table-cell>Tiết 10: 15h05 - 15h50</md-table-cell>
        <md-table-cell></md-table-cell>
      </md-table-row>
      <md-table-row slot="md-table-row">
        <md-table-cell>Tiết 05: 10h25 - 11h10</md-table-cell>
        <md-table-cell>Tiết 11: 15h55 - 16h40</md-table-cell>
        <md-table-cell></md-table-cell>
      </md-table-row>
      <md-table-row slot="md-table-row">
        <md-table-cell>Tiết 06: 11h15 - 12h00</md-table-cell>
        <md-table-cell>Tiết 12: 16h45 - 17h30</md-table-cell>
        <md-table-cell></md-table-cell>
      </md-table-row>
    </md-table>
  </div>
</template>

<script>
import domtoimage from 'dom-to-image-more'
import moment from 'moment'
import GoTop from '@inotom/vue-go-top'
import { processCalendar, fetchCalendarWithPost } from '../utils/calendar'

export default {
  name: "TkbComponent",
  props: {
    sending: { value: false },
    error: { enable: false, message: "" },
    tkb: null,
  },
  data: () => {
    return {
      document: document,
      moment: moment,
      currentWeekIndex: 0,
    };
  },
  components: {
    GoTop
  },
  methods: {
    checkSession(shift) {
      if (shift >= 1 && shift <= 6) return { "background-morning": true };
      if (shift >= 7 && shift <= 12) return { "background-afternoon": true };
      return { "background-evening": true };
    },
    async save(week_index, date_start, date_end) {
      let currentWeek = this.$refs.week[week_index].$el
      let currentSave = this.$refs.save[week_index].$el
      currentWeek.style['pointer-events'] = 'none'
      currentSave.style['display'] = 'none'
      this.sending.value = true
      await domtoimage.toJpeg(currentWeek, { quality: 0.95 })
        .then(function (dataUrl) {
          date_start = new Date(date_start)
          date_end = new Date(date_end)
          date_start = `${date_start.getDate()}_${date_start.getMonth() + 1}_${date_start.getFullYear()}`
          date_end = `${date_end.getDate()}_${date_end.getMonth() + 1}_${date_end.getFullYear()}`
          let link = document.createElement('a');
          link.download = `${week_index + 1}_tkb_${date_start}_${date_end}.jpeg`;
          link.href = dataUrl;
          link.click();
          link.remove();
        })
        .catch(e => { this.error.present("Có lỗi xảy ra"); console.log(e) });
      currentWeek.style['pointer-events'] = 'auto'
      currentSave.style['display'] = 'block'
      this.sending.value = false
    },
    exportToGoogleCalendar() {
      let time_sift_table = [
        {},
        { start: '000000', end: '004500' },
        { start: '005000', end: '013500' },
        { start: '014000', end: '022500' },
        { start: '023500', end: '032000' },
        { start: '032500', end: '041000' },
        { start: '041500', end: '050000' },
        { start: '053000', end: '061500' },
        { start: '062000', end: '070500' },
        { start: '071000', end: '075500' },
        { start: '080500', end: '085000' },
        { start: '085500', end: '094000' },
        { start: '094500', end: '103000' },
        { start: '110000', end: '114500' },
        { start: '114500', end: '123000' },
        { start: '124500', end: '133000' },
        { start: '133000', end: '141500' },
      ]
      let result = `BEGIN:VCALENDAR\nCALSCALE:GREGORIAN\nMETHOD:PUBLISH\n\n`
      this.tkb.data.data_subject.forEach(week => {
        for (let day of week) {
          let timeIter = new Date(day.time)
          day.shift.forEach((shift, shift_index) => {
            if (shift.content) {
              result += `BEGIN:VEVENT\nDTSTART:${this.moment(timeIter).format('YYYYMMDD')}T${time_sift_table[shift_index + 1].start}Z\n`
              result += `DTEND:${this.moment(timeIter).format('YYYYMMDD')}T${time_sift_table[shift_index + shift.length].end}Z\n`
              if (shift.address) result += `LOCATION:${shift.address}\n`
              result += `SUMMARY:${shift.name}\n`
              result += `END:VEVENT\n\n`
            }
          })
        }
      })
      result += `END:VCALENDAR`
      let link = document.createElement('a')
      link.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(result))
      link.setAttribute('download', `${this.student ? this.student.split(" - ")[0] : 'tkb_export'}.ics`)
      link.style.display = 'none'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    },
    async onChangeSemester(val) {
      this.sending.value = true
      try {
        // update semester to form
        const mainForm = this.mainForm
        mainForm['drpSemester'] = val
        let hidSemester = this.semesters.find((v) => v.value == val ? v : undefined)
        mainForm['hidSemester'] = hidSemester.from + "_" + hidSemester.to + "_" + hidSemester.th

        // get calendar
        const result = await fetchCalendarWithPost(mainForm, this.signIn);
        this.$emit("updateMainDataForm", result)

        // process calendar
        const processResult = await processCalendar(result)
        this.$emit("updateTkbData", processResult)
      } catch (e) {
        this.error.present("Có lỗi xảy ra khi lấy thông tin thời khóa biểu!");
        if (e) console.log(e);
      }
      this.sending.value = false
    },
    signOut() {
      window.localStorage.removeItem("tkb")
      window.localStorage.removeItem('student')
      window.localStorage.removeItem('semesters')
      window.localStorage.removeItem('currentSemester')
      window.localStorage.removeItem('mainForm')
      window.localStorage.removeItem('signIn')
      this.$parent.tkb.enable = false;
    },
  },
  computed: {
    semesters: function () {
      return JSON.parse(window.localStorage.getItem('semesters'))
    },
    currentSemester: {
      get: function () {
        return window.localStorage.getItem('currentSemester')
      },
      set: function (val) {
        window.localStorage.setItem('currentSemester', val)
      }
    },
    mainForm: function () {
      return JSON.parse(window.localStorage.getItem('mainForm'))
    },
    signIn: function () {
      return window.localStorage.getItem('signIn')
    },
    student: function () {
      const student = window.localStorage.getItem('student')
      return student ? student : "KITCLUB - Học viện Kỹ thuật Mật mã"
    },
    currentWeek: function () {
      const data = this.tkb?.data?.data_subject ? this.tkb.data.data_subject : []
      if (!data.length) return null
      if (this.currentWeekIndex < 0) this.currentWeekIndex = 0
      if (this.currentWeekIndex >= data.length) this.currentWeekIndex = data.length - 1
      return data[this.currentWeekIndex]
    }
  },
  mounted() {
    // get current week if exist
    const data = this.tkb?.data?.data_subject ? this.tkb.data.data_subject : []
    for (const [index, week] of data.entries()) {
      if (moment(week[0].time).isSameOrBefore("2022-10-25") && moment(week[week.length - 1].time).isSameOrAfter("2022-10-25")) {
        this.currentWeekIndex = index
        break
      }
    }

    // hotkey
    document.addEventListener('keyup', (e) => {
      if (e.key === 'ArrowLeft')
        this.currentWeekIndex--
      else if (e.key === 'ArrowRight')
        this.currentWeekIndex++
    }, false);
  }
};
</script>
<style lang='stylus'>
table
  td
    text-align center!important
    div
      display flex
      justify-content center
      align-items center
  .md-table-head-container
    display flex
    align-items center
    justify-content center
#tkb-container
  table
    table-layout fixed!important
  .md-card
    margin-top 0!important
    width 100%
  
.background-date
  background-color rgb(33, 33, 33)
.background-morning
  background-color rgb(66, 66, 66)
.background-afternoon
  background-color rgb(45, 45, 45)
.background-evening
  background-color rgb(33, 33, 33)

.md-table-cell
  & .md-table-cell-container
    height 100%!important
    padding 10px!important
    & .md-card
      height 100%!important
      display: flex
      justify-content: center
      align-items: center
      padding 5px!important
      margin: 0!important
</style>