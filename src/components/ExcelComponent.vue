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
        <md-file v-on:change="customSubmit" :disabled="sending" />
      </md-field>
    </md-card-content>
  </div>
</template>

<script>
export default {
  name: "ExcelComponent",
  data: () => {
    return {
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
  methods: {
    async customSubmit(event) {
      event.preventDefault()
      this.sending = true
      await new Promise((resolve, reject) => {
        try {
          let worker = new Worker('js/excel.worker.js')
          worker.addEventListener('message', (res) => {
            if(res.data) {
              resolve(res.data)
            }
            // Handle error
            else reject(null)
          }, false)
          // Handle error
          worker.addEventListener('error', err => reject(err), false)
          worker.postMessage(event.target.files[0])
        }
        // Handle error
        catch(err) {
          reject(err)
        }
      })
      .then(res_data => {
        window.localStorage.setItem("tkb", JSON.stringify(res_data))
        this.$emit("update_tkb_data", JSON.parse(window.localStorage.getItem("tkb")));
      })
      .catch((err) => {
        this.error.present("Không thể lấy thông tin thời khóa biểu");
        if(err) console.log(err);
      })
      this.sending = false
    }
  }
};
</script>