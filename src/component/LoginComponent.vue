<template>
  <div>
    <form novalidate @submit.prevent="validateUser">
      <md-card-header class="md-layout-item md-size-100">
        <div class="md-title">Đăng nhập</div>
      </md-card-header>
      <md-card-content class="md-layout-item md-size-100">
        <div>
          <md-field :class="getValidationClass('student_code')">
            <label for="student_code">Mã sinh viên</label>
            <md-input name="student_code" v-model="form.student_code" :disabled="sending?.value" />
            <span class="md-error" v-if="!$v.form.student_code.required">Mã sinh viên là bắt buộc</span>
          </md-field>
          <md-field :class="getValidationClass('password')">
            <label for="password">Mật khẩu</label>
            <md-input name="password" type="password" v-model="form.password" :disabled="sending?.value" />
            <span class="md-error" v-if="!$v.form.password.required">Mật khẩu là bắt buộc</span>
          </md-field>
        </div>
      </md-card-content>
      <md-card-actions>
        <md-button type="submit" class="md-primary" :disabled="sending?.value">Đăng nhập</md-button>
      </md-card-actions>
    </form>
  </div>
</template>

<script>
import { validationMixin } from "vuelidate"
import { required } from "vuelidate/lib/validators"
import { fetchCalendarWithGet, processCalendar } from '../util/calendar'
import { login, logout } from '../util/user'

export default {
  name: "LoginComponent",
  mixins: [validationMixin],
  props: {
    sending: { value: false },
    error: { enable: false, message: "" },
  },
  data: () => {
    return {
      form: {
        student_code: "",
        password: ""
      },
    };
  },
  validations: {
    form: {
      student_code: { required },
      password: { required }
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
      this.form.student_code = null;
      this.form.password = null;
    },
    async validateUser() {
      this.$v.$touch();
      if (this.$v.$invalid) return;
      this.sending.value = true;

      try {
        const signInToken = await login(this.form.student_code, this.form.password)
        const response = await fetchCalendarWithGet(signInToken)
        const data = await processCalendar(response)

        window.localStorage.setItem("signIn", signInToken)
        this.$emit("updateMainDataForm", response)
        this.$emit("updateTkbData", data)
      } catch (e) {
        this.error.present("Có lỗi xảy ra khi lấy thông tin thời khóa biểu hoặc tài khoản/mật khẩu không đúng!")
        throw e
        logout()
      } finally {
        this.sending.value = false
      }
    },
  },
};
</script>