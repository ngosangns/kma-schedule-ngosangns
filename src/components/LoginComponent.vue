<template>
  <div>
    <md-dialog-alert
      :md-active.sync="error.enable"
      v-bind:md-content="error.message"
      md-confirm-text="OK"
      md-fullscreen="true"
    />
    <form novalidate @submit.prevent="validateUser">
      <md-progress-bar
        style="position: fixed; top: 0; left: 0; width: 100vw; z-index: 99"
        class="md-layout-item md-size-100"
        md-mode="indeterminate"
        v-if="sending"
      />
      <md-card-header class="md-layout-item md-size-100">
        <div class="md-title">Đăng nhập</div>
      </md-card-header>

      <md-card-content class="md-layout-item md-size-100">
        <div>
          <md-field :class="getValidationClass('student_code')">
            <label for="student_code">Mã sinh viên</label>
            <md-input name="student_code" v-model="form.student_code" :disabled="sending" />
            <span class="md-error" v-if="!$v.form.student_code.required">Mã sinh viên là bắt buộc</span>
          </md-field>
          <md-field :class="getValidationClass('password')">
            <label for="password">Mật khẩu</label>
            <md-input name="password" type="password" v-model="form.password" :disabled="sending" />
            <span class="md-error" v-if="!$v.form.password.required">Mật khẩu là bắt buộc</span>
          </md-field>
        </div>
      </md-card-content>

      <md-card-actions>
        <md-button type="submit" class="md-primary" :disabled="sending">Đăng nhập</md-button>
      </md-card-actions>
    </form>
  </div>
</template>

<script>
// Libraries
import $ from "jquery";
import { validationMixin } from "vuelidate";
import { required } from "vuelidate/lib/validators";

export default {
  name: "LoginComponent",
  mixins: [validationMixin],
  data: () => {
    return {
      sending: false,
      form: {
        student_code: null,
        password: null
      },
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
      if (!this.$v.$invalid) {
        this.sending = true;
        let send_data = await this.fetchTKB(this.form.student_code, this.form.password)
        await new Promise((resolve, reject) => {
          try {
            if(!send_data) reject(null)
            send_data = this.cleanFromHTMLtoArray(send_data)
            let worker = new Worker("js/login.worker.js");
            worker.addEventListener('message', res => {
              if (res.data) resolve(res.data)
              else reject(null)
            })
            worker.postMessage(send_data)
          }
          catch(err) {
            reject(err)
          }
        })
        .then((res_data) => {
          window.localStorage.setItem("tkb", JSON.stringify(res_data));
          this.$emit("update_tkb_data", res_data);
        })
        .catch(err => {
          this.error.present("Có lỗi xảy ra khi lấy thông tin thời khóa biểu hoặc tài khoản/mật khẩu không đúng!");
          if(err) console.log(err);
        })

        this.sending = false
      }
    },
    async fetchTKB(username, password) {
      let md5 = require("md5");
      let result;
      try {
        result = await $.ajax({
          url:"https://actvn-schedule.cors-ngosangns.workers.dev?http://qldt.actvn.edu.vn/CMCSoft.IU.Web.info/Login.aspx",
          method: "GET"
        });
        // Get __VIEWSTATE
        result = result.match(/id="__VIEWSTATE" value="(.+?)"/g);
        if (!result || !result.length) return false;
        result = result[0]
        result = result.match(/value="(.+?)"/);
        if (!result || !result.length) return false;
        result = result[1];
        // Repear data to get SignId
        let data = {
          __VIEWSTATE: result,
          txtUserName: username.toUpperCase(),
          txtPassword: md5(password),
          btnSubmit: "Đăng nhập"
        };
        // Convert data object to string params
        data = Object.keys(data)
          .map(key => {
            return (
              encodeURIComponent(key) + "=" + encodeURIComponent(data[key])
            );
          })
          .join("&");
        // Get SignId
        result = await fetch(
          "https://actvn-schedule.cors-ngosangns.workers.dev?http://qldt.actvn.edu.vn/CMCSoft.IU.Web.Info/Login.aspx",
          {
            method: "POST",
            body: data,
            headers: {
              "Content-Type": "application/x-www-form-urlencoded"
            }
          }
        );
        result = await result.text();
        if(!result) return false;
        // Catch SignId from response
        let signIn = result.match(/SignIn=(.+?);/);
        if (!signIn || !signIn.length) return false;
        signIn = signIn[0];
        // Get schedule content
        result = await $.ajax({
          url:
            "https://actvn-schedule.cors-ngosangns.workers.dev/?http://qldt.actvn.edu.vn/CMCSoft.IU.Web.Info/Reports/Form/StudentTimeTable.aspx",
          method: "GET",
          headers: {
            "x-cors-headers": JSON.stringify({
              Cookie: signIn
            })
          }
        });
      } catch (e) {
        throw new Error(e);
      }
      return result;
    },
    strip_html_tags(str) {
        if ((str === null) || (str === false)) return ''
        else str = str.toString()
        return str.replace(/<[^>]*>/g, '')
    },
    cleanFromHTMLtoArray(raw_tkb) {
      if (!raw_tkb || !raw_tkb.length) return false;
      let student = raw_tkb.match(/<span id="lblStudent">(.+?)<\/span/g);
      if (student)
        window.localStorage.setItem(
          "student",
          student[0].match(/<span id="lblStudent">(.+?)<\/span/)[1]
        );
      // remove trash and catch table from html string
      raw_tkb = raw_tkb.replace(/ {2,}/gm, " ");
      raw_tkb = raw_tkb.replace(/<!--.*?-->|\t|(?:\r?\n[ \t]*)+/gm, "");
      raw_tkb = raw_tkb.match(/<table.+?gridRegistered.+?<\/table>/g);
      if(!raw_tkb || !raw_tkb.length) raw_tkb = raw_tkb[0];
      // convert response to DOM then export the table to array
      $("body").append("<div id=cleanTKB class=uk-hidden></div>");
      $("#cleanTKB").html(raw_tkb);
      let data_content_temp = Array.prototype.map.call(
        document.querySelectorAll("#gridRegistered tr"),
        tr => Array.prototype.map.call(tr.querySelectorAll("td"), (td) => this.strip_html_tags(td.innerHTML))
      );
      $("#cleanTKB").remove();
      // check null
      if (!data_content_temp) return false; 
      return data_content_temp;
    }
  }
};
</script>