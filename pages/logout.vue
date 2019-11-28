<template lang="pug">
  .container-fluid.px-3
    p ログアウト中...
</template>

<script>

export default {
  mounted() {
    localStorage.removeItem("account");
    location.href = "/";
  }
};
</script>

<style lang="scss" scoped>
</style>
