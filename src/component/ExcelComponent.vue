<template>
  <div>
    <md-card-header class="md-layout-item md-size-100">
      <div class="md-title">Dịch TKB từ file Excel</div>
    </md-card-header>
    <md-card-content>
      Chỉ hỗ trợ cho các bạn miền Nam dùng lịch từ file Excel theo form riêng của phân khu miền Nam như hình bên dưới:
      <br />
      <br />Lưu ý: Đối với file Excel có nhiều sheet vui lòng chuyển sheet có chứa thời khoá biểu cần dịch về đầu tiên.
      <md-card-media style="padding: 20px 0">
        <img src="img/excel_example.jpg" />
      </md-card-media>
      <md-field>
        <label>Upload files</label>
        <md-file v-on:change="customSubmit" :disabled="sending.value" />
      </md-field>
    </md-card-content>
  </div>
</template>

<script>
import { proccessExcel } from '../util/excel'

export default {
  name: "ExcelComponent",
  props: {
    sending: { value: false },
    error: { enable: false, message: "" },
  },
  methods: {
    async customSubmit(event) {
      event.preventDefault()
      this.sending.value = true
      try {
        const result = proccessExcel(event.target.files[0])
        this.$emit("updateTkbData", JSON.parse(window.localStorage.getItem("tkb")))
      }
      catch (err) {
        this.error.present("Không thể lấy thông tin thời khóa biểu")
      } finally {
        this.sending.value = false
      }
    }
  }
}
</script>