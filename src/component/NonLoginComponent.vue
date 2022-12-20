<template>
  <div>
    <md-dialog-alert :md-active.sync="error.enable" v-bind:md-content="error.message" md-confirm-text="OK"
      md-fullscreen="true" />
    <md-progress-bar style="position: fixed; top: 0; left: 0; width: 100vw; z-index: 99"
      class="md-layout-item md-size-100" md-mode="indeterminate" v-if="sending.value" />
    <form novalidate @submit.prevent="validateUser">
      <md-card-header class="md-layout-item md-size-100">
        <div class="md-title">Dịch TKB từ mã nguồn</div>
      </md-card-header>

      <md-card-content>
        Nhằm tăng tính bảo mật cho tài khoản của các bạn. Từ version 6 trở đi đã hỗ trợ dịch thời khoá biểu dựa vào mã
        nguồn trang web.
        <br />Hướng dẫn: bạn vào trang quản lí của trường
        <a href="http://qldt.actvn.edu.vn/" target="_blank">qldt.actvn.edu.vn</a>, vào mục
        <b>Đăng ký học</b> ->
        <b>Xem kết quả ĐKH</b> chuột phải chọn
        <b>Xem mã nguồn (View page source)</b> và copy toàn bộ code dán vào đây:
      </md-card-content>
      <md-card-content class="md-layout-item md-size-100">
        <md-field :class="getValidationClass('content')">
          <label for="content">Dán mã tại đây</label>
          <md-textarea name="content" v-model="form.content" :disabled="sending.value" style="overflow: hidden" />
          <span class="md-error" v-if="!$v.form.content.length">Bạn chưa dán mã</span>
        </md-field>
      </md-card-content>

      <md-card-actions>
        <md-button type="submit" class="md-primary" :disabled="sending.value">Xem TKB</md-button>
      </md-card-actions>
    </form>
  </div>
</template>

<script>
import { validationMixin } from "vuelidate"
import { required } from "vuelidate/lib/validators"
import { processCalendar } from "../util/calendar"

export default {
  name: "NonLoGinComponent",
  props: {
    sending: { value: false },
    error: { enable: false, message: "" },
  },
  data: () => {
    return {
      form: {
        content: null
      },
    };
  },
  mixins: [validationMixin],
  validations: {
    form: {
      content: { required }
    }
  },
  methods: {
    getValidationClass(fieldName) {
      const field = this.$v.form[fieldName];
      if (field) {
        return {
          "md-invalid": field.$invalid && field.$dirty
        };
      }
    },
    clearForm() {
      this.$v.$reset();
      this.form.content = null;
    },
    async validateUser() {
      this.$v.$touch();
      if (this.$v.$invalid) return

      this.sending.value = true;
      try {
        const response = this.form.content
        const data = await processCalendar(response)
        this.$emit("updateMainDataForm", response)
        this.$emit("updateTkbData", data)
      } catch (e) {
        this.error.present("Có lỗi xảy ra khi lấy thông tin thời khóa biểu!")
        if (e) console.log(e)
      }
      this.sending.value = false
    },
  }
};
</script>