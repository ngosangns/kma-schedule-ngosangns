<template>
  <div class="md-layout" :class="`md-alignment-center-center`">
    <go-top bg-color="#333" fg-color="#fff"></go-top>
    <md-dialog-alert
      :md-active.sync="error.enable"
      v-bind:md-content="error.message"
      md-confirm-text="OK"
      md-fullscreen="true"
    />
    <md-progress-bar
      style="position: fixed; top: 0; left: 0; width: 100vw; z-index: 99"
      class="md-layout-item md-size-100"
      md-mode="indeterminate"
      v-if="sending"
    />

    <md-toolbar class="md-layout-item md-size-100">
      <h3 v-once class="md-title">{{student}}</h3>
      <div class="md-toolbar-section-end">
        <md-button v-once v-on:click="exportToGoogleCalendar()">Export to Google Calendar</md-button>
        <md-button v-once v-on:click="signOut()">Đăng xuất</md-button>
      </div>
    </md-toolbar>

    <!-- <md-table v-model="tkb.data.data_subject" class="md-layout-item md-size-100" md-card>
      <md-table-toolbar>
        <h1 class="md-title">Thông tin học kì</h1>
      </md-table-toolbar>
      <md-table-row slot="md-table-row" slot-scope="{ item }">
        <md-table-cell md-label="STT">{{ tkb.data.data_subject.indexOf(item) + 1}}</md-table-cell>
        <md-table-cell md-label="Lớp học phần">{{ item.lop_hoc_phan }}</md-table-cell>
        <md-table-cell md-label="Học phần">{{ item.hoc_phan }}</md-table-cell>
        <md-table-cell md-label="Giảng viên">{{ item.giang_vien }}</md-table-cell>
        <md-table-cell md-label="Sĩ số">{{ item.si_so }}</md-table-cell>
        <md-table-cell md-label="Số ĐK">{{ item.so_dk }}</md-table-cell>
        <md-table-cell md-label="Số TC">{{ item.so_tc }}</md-table-cell>
      </md-table-row>
    </md-table> -->

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
    <div id="tkb-container">
        <div v-once v-for="(week, week_index) in tkb.data.data_subject" :key='week_index' class="md-layout-item md-gutter md-size-100">
          <div class="md-size-100" style='height: 20px; background: transparent'></div>
          <md-table ref="week" class="md-size-100" md-card>
            <md-table-toolbar>
              <label v-once class="md-title">WEEK {{week_index + 1}}: {{moment(week[0].time).format("DD/MM/YYYY")}} - {{moment(week[week.length-1].time).format("DD/MM/YYYY")}}</label>
              <md-button v-once class="md-raised md-primary" ref="save" 
                v-on:click="save(week_index, week[0].time, week[week.length - 1].time)"
                >SAVE</md-button>
            </md-table-toolbar>
            <md-table-row>
              <md-table-cell v-once colspan=2>Tiết</md-table-cell>
              <md-table-cell v-once v-for="(shift_header, shift_header_index) in week[0].shift" :key="shift_header_index" 
               v-bind:class="checkSession(shift_header_index+1)" >{{shift_header_index+1}}</md-table-cell>
            </md-table-row>

            <md-table-row v-once v-for="(day, day_index) in week" :key="day_index">
              <md-table-cell v-once colspan=2>
                {{ moment(day.time).format("dddd[\n]DD/MM/YYYY").split('\n')[0] }}<br>
                {{ moment(day.time).format("dddd[\n]DD/MM/YYYY").split('\n')[1] }}
              </md-table-cell>
              <template v-for="(shift, shift_index) in day.shift">
                <md-table-cell v-if="parseInt(shift.length)" :key="shift_index" 
                  v-bind:class="checkSession(shift_index+1)" v-bind:colspan="shift.length">
                  <md-card v-if="shift.content">
                    {{shift.content}}
                  </md-card>
                </md-table-cell>
              </template>
            </md-table-row>
          </md-table>
        </div>
    </div>
  </div>
</template>

<script>
import domtoimage from 'dom-to-image-more'
import moment from 'moment'
import GoTop from '@inotom/vue-go-top'

export default {
  name: "TkbComponent",
  data: () => {
    return {
      tkb: null,
      student: null,
      document: document,
      moment: moment,
      sending: false,
      error: {
        enable: false,
        message: null,
        present(message) {
          this.message = message;
          this.enable = true;
        }
      }
    };
  },
  components: {
    GoTop
  },
  props: {
    down_tkb: null
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
      this.sending = true
      await domtoimage.toJpeg(currentWeek, { quality: 0.95 })
        .then(function (dataUrl) {
          date_start = new Date(date_start)
          date_end = new Date(date_end)
          date_start = `${date_start.getDate()}_${date_start.getMonth()+1}_${date_start.getFullYear()}`
          date_end = `${date_end.getDate()}_${date_end.getMonth()+1}_${date_end.getFullYear()}`
          let link = document.createElement('a');
          link.download = `${week_index+1}_tkb_${date_start}_${date_end}.jpeg`;
          link.href = dataUrl;
          link.click();
          link.remove();
        })
        .catch(e => { this.error.present("Có lỗi xảy ra"); console.log(e) });
      currentWeek.style['pointer-events'] = 'auto'
      currentSave.style['display'] = 'block'
      this.sending = false
    },
    exportToGoogleCalendar() {
      let time_sift_table = [
        {},
        {start: '000000', end: '004500'}, 
        {start: '005000', end: '013500'}, 
        {start: '014000', end: '022500'}, 
        {start: '023500', end: '032000'}, 
        {start: '032500', end: '041000'}, 
        {start: '041500', end: '050000'}, 
        {start: '053000', end: '061500'}, 
        {start: '062000', end: '070500'}, 
        {start: '071000', end: '075500'}, 
        {start: '080500', end: '085000'}, 
        {start: '085500', end: '094000'}, 
        {start: '094500', end: '103000'}, 
        {start: '110000', end: '114500'}, 
        {start: '114500', end: '123000'}, 
        {start: '124500', end: '133000'}, 
        {start: '133000', end: '141500'},
      ]
      let result = `BEGIN:VCALENDAR\nCALSCALE:GREGORIAN\nMETHOD:PUBLISH\n\n`
      this.tkb.data.data_subject.forEach(week => {
        for(let day of week) {
          let timeIter = new Date(day.time)
          day.shift.forEach((shift, shift_index) => {
            if(shift.content) {
              result += `BEGIN:VEVENT\nDTSTART:${this.moment(timeIter).format('YYYYMMDD')}T${time_sift_table[shift_index+1].start}Z\n`
              result += `DTEND:${this.moment(timeIter).format('YYYYMMDD')}T${time_sift_table[shift_index + shift.length].end}Z\n`
              if(shift.address) result += `LOCATION:${shift.address}\n`
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
    signOut() {
      window.localStorage.removeItem("tkb");
      window.localStorage.removeItem('student')
      this.$parent.tkb.enable = false;
    }
  },
  created() {
    this.student = window.localStorage.getItem('student');
    if(!this.student) this.student = `KITCLUB - Học viện Kỹ thuật Mật mã`;
    this.tkb = this.down_tkb;
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