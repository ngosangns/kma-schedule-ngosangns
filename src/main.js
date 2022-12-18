import Vue from 'vue'
import App from './App.vue'
import VueMaterial from 'vue-material'
import 'vue-material/dist/vue-material.min.css'
import 'vue-material/dist/theme/default-dark.css' // This line here

Vue.use(VueMaterial)
Vue.component('MdSelect', Vue.options.components.MdSelect.extend({
  methods: {
      isInvalidValue: function isInvalidValue () {
          return this.$el.validity ? this.$el.validity.badInput : this.$el.querySelector('input').validity.badInput
      }
  }
}))
Vue.config.productionTip = false

new Vue({
  render: h => h(App),
}).$mount('#app')
