<template>
  <div class="md-layout" :class="`md-alignment-center-center`">
    <div class="md-layout-item md-size-100">
      <h1 class="header-title">
        <a href="/" class="md-display-2">ACTVN SCHEDULE</a>
      </h1>
      <h3 class="header-small-title">
        <a class="md-subheading" href="https://www.facebook.com/kitclubKMA">KIT - SSKIT</a>
      </h3>
    </div>
  </div>
</template>

<script>
export default {
  name: "TkbHeader",
  data() {
    return {};
  }
};
</script>

<style lang="stylus" scoped>
.header-title
    display block
    width 100%
    text-align center
    padding-bottom 0!important
    margin-bottom 0!important
    & a
        text-decoration none!important
        color white!important
.header-small-title
    text-align center
    & a
        text-decoration none!important
</style>