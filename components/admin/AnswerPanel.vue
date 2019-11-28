<template lang="pug">
  section
    .d-flex.justify-content-between
      h2
        font-awesome-icon(icon="comment-dots").mr-2
        | Answers
    .w-100.answer-wrapper
      table#answer-table.table.table-hover
        thead
          tr
            th No.
            th NAME
            th Time
            th Answer
        tbody
          tr(v-for="(v,i) in answers")
            td {{i}}
            td {{v.account.name}}<br>{{v.id}}<br>{{v.status}}
            td {{v.time}}<br>({{v.elapse/1000.0}}sec)
            td {{v.answer}}
    .my-3.d-flex.justify-content-between
      button.btn.btn-sm.btn-danger(@click="answerCheck" :disabled="!enableAnswerCheck")
        | Answer Check
        font-awesome-icon(icon="plus")
        font-awesome-icon(icon="music").mr-2
      button.btn.btn-sm.btn-danger(@click="showCorrectAnswer" :disabled="!enableShowCorrectAnswer")
        | 正解者はこちら
        font-awesome-icon(icon="plus")
        font-awesome-icon(icon="music").mr-2
      button.btn.btn-sm.btn-danger(@click="descendingRankingCheck" :disabled="!enableAnswerRanking")
        | 予選落ち
        font-awesome-icon(icon="plus")
        font-awesome-icon(icon="music").mr-2
      button.btn.btn-sm.btn-danger(@click="rankingCheck" :disabled="!enableAnswerRanking")
        | 早押し
        font-awesome-icon(icon="plus")
        font-awesome-icon(icon="music").mr-2
</template>

<script>
export default {
  props: {
    enableAnswerCheck: Boolean,
    enableShowCorrectAnswer: Boolean,
    enableAnswerRanking: Boolean,
    correctAnswer: {
      type: String,
      default: () => null
    },
    answers: {
      type: Array,
      default: () => []
    }
  },
  data() {
    return {
    }
  },
  methods: {
    answerCheck() {
      this.$emit("send")
    },
    showCorrectAnswer() {
      this.$emit("correct")
    },
    descendingRankingCheck() {
      this.$emit("ranking", { asc: false })
    },
    rankingCheck() {
      this.$emit("ranking", { asc: true })
    }
  }
}
</script>

<style lang="scss" scoped>
#answer-table {
  font-size: .75rem;
}

.answer-wrapper{
  height: 50vh;
  overflow-y: scroll;
}
</style>
