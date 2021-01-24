<template>
  <div id="root">
    <md-dialog-alert
      :md-active.sync="error.enable"
      v-bind:md-content="error.message"
      md-confirm-text="OK"
      md-fullscreen="true"
    />
    <TkbHeader />
    <div class="md-layout" :class="`md-alignment-top-center`">
      <md-card class="md-layout-item md-layout md-size-90" v-if="!this.tkb.enable">
        <LoginComponent @update_tkb_data="updateTkbData" class="md-layout-item md-size-33" />
        <NonLoginComponent @update_tkb_data="updateTkbData" class="md-layout-item md-size-33" />
        <ExcelComponent @update_tkb_data="updateTkbData" class="md-layout-item md-size-33" />
      </md-card>
      <TkbComponent v-if="this.tkb.enable" v-bind:down_tkb="tkb" class="md-layout-item md-size-90" />
      <FooterComponent class="md-layout-item md-size-90" />
    </div>
  </div>
</template>

<script>
// Components
import TkbHeader from "./components/HeaderComponent";
import LoginComponent from "./components/LoginComponent";
import NonLoginComponent from "./components/NonLoginComponent";
import TkbComponent from "./components/TkbComponent";
import FooterComponent from "./components/FooterComponent";
import ExcelComponent from "./components/ExcelComponent";

// Libraries
export default {
  name: "App",
  data: () => {
    return {
      tkb: {
        data: null,
        darkOn: false,
        enable: false
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
  methods: {
    updateTkbData(tkb_data) {
      this.tkb.data = tkb_data;
      this.tkb.enable = true;
    }
  },
  components: {
    TkbHeader,
    LoginComponent,
    NonLoginComponent,
    TkbComponent,
    FooterComponent,
    ExcelComponent
  },
  mounted() {
    this.tkb.data = JSON.parse(window.localStorage.getItem("tkb"));
    if (this.tkb.data) this.tkb.enable = true;
  }
};
</script>
<style lang='stylus'>
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