<template>
  <div>
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
    <form novalidate @submit.prevent="validateUser">
      <md-card-header class="md-layout-item md-size-100">
        <div class="md-title">Dịch TKB từ mã nguồn</div>
      </md-card-header>

      <md-card-content>
        Nhằm tăng tính bảo mật cho tài khoản của các bạn. Từ version 6 trở đi đã hỗ trợ dịch thời khoá biểu dựa vào mã nguồn trang web.
        <br />Hướng dẫn: bạn vào trang quản lí của trường
        <a
          href="http://qldt.actvn.edu.vn/"
          target="_blank"
        >qldt.actvn.edu.vn</a>, vào mục
        <b>Đăng ký học</b> ->
        <b>Xem kết quả ĐKH</b> chuột phải chọn
        <b>Xem mã nguồn (View page source)</b> và copy toàn bộ code dán vào đây:
      </md-card-content>
      <md-card-content class="md-layout-item md-size-100">
        <md-field :class="getValidationClass('content')">
          <label for="content">Dán mã tại đây</label>
          <md-textarea name="content" v-model="form.content" :disabled="sending" style='overflow: hidden'/>
          <span class="md-error" v-if="!$v.form.content.length">Bạn chưa dán mã</span>
        </md-field>
      </md-card-content>

      <md-card-actions>
        <md-button type="submit" class="md-primary" :disabled="sending">Xem TKB</md-button>
      </md-card-actions>
    </form>
  </div>
</template>

<script>
// Libraries
import $ from "jquery";
import { validationMixin } from "vuelidate"
import { required } from "vuelidate/lib/validators"
export default {
  name: "NonLoGinComponent",
  data: () => {
    return {
      sending: false,
      form: {
        content: null
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
      if (!this.$v.$invalid) {
        this.sending = true
        let send_data = this.cleanFromHTMLtoArray(this.form.content)
        // eslint-disable-next-line no-unused-vars
        await new Promise((resolve, reject) => {
          if(!send_data) reject(null)
          let worker = new Worker('js/nonlogin.worker.js')
          worker.addEventListener('message', res => {
            if (res.data) resolve(res.data)
            else reject(null)
          })
          worker.postMessage(send_data)
        })
        .then(res_data => {
          window.localStorage.setItem("tkb", JSON.stringify(res_data))
          this.$emit('update_tkb_data', res_data)
        })
        .catch(err => {
          this.error.present("Có lỗi xảy ra hoặc không thể dịch được thời khoá biểu!")
          console.log(err)
        })
        this.sending = false
      }
    },
    strip_html_tags(str) {
        if ((str === null) || (str === false)) return ''
        else str = str.toString()
        return str.replace(/<[^>]*>/g, '')
    },
    cleanFromHTMLtoArray(raw_tkb) {
      if (!raw_tkb) return false;

      let student = raw_tkb.match(/<span id="lblStudent">(.+?)<\/span/g);
      if (!student) return false;
      window.localStorage.setItem("student", student[0].match(/<span id="lblStudent">(.+?)<\/span/)[1]);

      // remove trash and catch table from html string
      raw_tkb = raw_tkb.replace(/ {2,}/gm, " ");
      raw_tkb = raw_tkb.replace(/<!--.*?-->|\t|(?:\r?\n[ \t]*)+/gm, "");
      raw_tkb = raw_tkb.match(/<table.+?gridRegistered.+?<\/table>/g);
      if(!raw_tkb) return false;
      raw_tkb = raw_tkb[0];

      // convert response to DOM then export the table to array
      $("body").append("<div id=cleanTKB class=uk-hidden></div>");
      $("#cleanTKB").html(raw_tkb);
      let data_content_temp = Array.prototype.map.call(
        document.querySelectorAll("#gridRegistered tr"),
        tr => Array.prototype.map.call(tr.querySelectorAll("td"), (td) => this.strip_html_tags(td.innerHTML))
      );
      $("#cleanTKB").remove();

      // check null
      if (data_content_temp) return data_content_temp;
      else return false;
    }
  }
};
</script>