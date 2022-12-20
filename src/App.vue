<template>
  <div id="root">
    <md-dialog-alert :md-active.sync="error.enable" :md-content="error.message" md-confirm-text="OK"
      md-fullscreen="true" />
    <md-progress-bar style="position: fixed; top: 0; left: 0; width: 100vw; z-index: 99"
      class="md-layout-item md-size-100" md-mode="indeterminate" v-if="sending.value" />

    <TkbHeader />
    <div class="md-layout" :class="`md-alignment-top-center`">
      <md-card class="md-layout-item md-layout md-size-90" v-if="!this.tkb.enable">
        <LoginComponent :error="error" :sending="sending" @updateMainDataForm="updateMainDataForm"
          @updateTkbData="updateTkbData" class="md-layout-item md-size-33" />
        <NonLoginComponent :error="error" :sending="sending" @updateMainDataForm="updateMainDataForm"
          @updateTkbData="updateTkbData" class="md-layout-item md-size-33" />
        <ExcelComponent :error="error" :sending="sending" @updateMainDataForm="updateMainDataForm"
          @updateTkbData="updateTkbData" class="md-layout-item md-size-33" />
      </md-card>
      <TkbComponent v-if="this.tkb.enable" :error="error" :sending="sending" :tkb="tkb"
        class="md-layout-item md-size-90" @updateMainDataForm="updateMainDataForm" @updateTkbData="updateTkbData"
        :key="tkbComponentKey" />
      <FooterComponent class="md-layout-item md-size-90" />
    </div>
  </div>
</template>

<script>
import TkbHeader from "./component/HeaderComponent"
import LoginComponent from "./component/LoginComponent"
import NonLoginComponent from "./component/NonLoginComponent"
import TkbComponent from "./component/TkbComponent"
import FooterComponent from "./component/FooterComponent"
import ExcelComponent from "./component/ExcelComponent"
import $ from "jquery"

export default {
  name: "App",
  components: {
    TkbHeader,
    LoginComponent,
    NonLoginComponent,
    TkbComponent,
    FooterComponent,
    ExcelComponent
  },
  data: () => {
    return {
      tkb: {
        data: null,
        enable: false
      },
      error: {
        enable: false,
        message: null,
        present(message) {
          this.message = message
          this.enable = true
        }
      },
      sending: {
        value: false,
      },
      tkbComponentKey: 1,
    }
  },
  methods: {
    updateTkbData(data) {
      this.tkb.data = data
      this.tkb.enable = true
      window.localStorage.setItem("tkb", JSON.stringify(data))
      this.tkbComponentKey++ // rerender
    },
    updateMainDataForm(rawHtml) {
      // parse html
      const parser = new DOMParser(),
        content = 'text/html',
        dom = parser.parseFromString(rawHtml, content),
        mainForm = $(dom.getElementById("Form1"))

      // get semesters
      const semesterElements = mainForm.find("select[name=drpSemester] option")
      const semesterArray = []
      for (const item of semesterElements) {
        let tmp = item.innerHTML.split("_")
        semesterArray.push({
          value: item.value,
          from: tmp[1],
          to: tmp[2],
          th: tmp[0]
        })
      }
      const currentSemester = mainForm.find("select[name=drpSemester] option:checked").first()

      // save data
      window.localStorage.setItem("mainForm", JSON.stringify(mainForm.serializeArray().reduce((o, kv) => ({ ...o, [kv.name]: kv.value }), {})))
      window.localStorage.setItem("semesters", JSON.stringify(semesterArray))
      window.localStorage.setItem("currentSemester", currentSemester.val())
    }
  },
  mounted() {
    this.tkb.data = JSON.parse(window.localStorage.getItem("tkb"))
    if (this.tkb.data) this.tkb.enable = true
  }
}
</script>
<style>
#root {
  min-width: 1250px;
  max-width: 100vw;
  background-color: #303030 !important;
}

.md-dialog-container {
  transform: none !important;
}

.md-card {
  margin-top: 20px !important;
  padding: 20px !important;
}
</style>