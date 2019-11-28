<template lang="pug">
  section
    .d-flex.justify-content-between
      h2
        font-awesome-icon(icon="envelope").mr-2
        | Monitor Messages
    .mb-3.d-flex.justify-content-between
      .input-group.w-75
        input.form-control(type="text" v-model="message")
        .input-group-append
          button.btn.btn-primary(@click="sendMessage('input-message')") 送る
      button.btn.btn-warning(@click="clearMessages()")  クリア
    .my-1.d-flex.justify-content-between
      button.btn.btn-info(@click="readyQuestion()" )
        | 準備待機
      button.btn.btn-danger(@click="allStandUp()" :disabled="enableStandUp")
        | 全員スタンドアップ
        font-awesome-icon(icon="plus")
        font-awesome-icon(icon="music")
</template>

<script>
export default {
  props: {
    'enableStandUp': Boolean
  },
  data() {
    return {
      message: null
    }
  },
  methods: {
    sendMessage() {
      this.$emit("send", this.message)
    },
    clearMessages() {
      this.$emit("clear")
    },
    readyQuestion() {
      this.$emit("ready")
    },
    allStandUp() {
      this.$emit("standup")
    }
  }
}
</script>
