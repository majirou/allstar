<template lang="pug">
  section.position-relative
    h2
      font-awesome-icon.mr-2(icon="trophy")
      | 総合結果
    .my-3.d-flex.justify-content-between
      button.btn.btn-info(@click="getTotalRanking()")
        | 総合ランキング取得
      button.btn.btn-warning(@click="showTotalRankingMessage()")
        | 「結果発表」表示
      button.btn.btn-danger(@click="showTotalRanking()")
        | 総合ランキング表示
    .border.border-primary(style="height: 50vh;overflow-y: scroll;")
      table.table
        thead
          tr
            th 正解数
            th 経過秒数
            th ユーザー名
        tbody
          tr.w-100(v-for="(v,i) in totalRanking")
            td {{v.counter}} 回
            td {{v.elapse}} 秒
            td {{v.name}}
          tr.w-100(v-for="(v,i) in totalRanking")
            td {{v.counter}} 回
            td {{v.elapse}} 秒
            td {{v.name}}
          tr.w-100(v-for="(v,i) in totalRanking")
            td {{v.counter}} 回
            td {{v.elapse}} 秒
            td {{v.name}}
          tr.w-100(v-for="(v,i) in totalRanking")
            td {{v.counter}} 回
            td {{v.elapse}} 秒
            td {{v.name}}
          tr.w-100(v-for="(v,i) in totalRanking")
            td {{v.counter}} 回
            td {{v.elapse}} 秒
            td {{v.name}}
          tr.w-100(v-for="(v,i) in totalRanking")
            td {{v.counter}} 回
            td {{v.elapse}} 秒
            td {{v.name}}
    .fixed-bottom.m-3
      details.p-3.border.border-danger.rounded.mt-3
        summary リセット系
        .m-3.d-flex.justify-content-end
          button.mr-3.btn.btn-danger(@click="resetMembers()") reset members
          button.btn.btn-danger(@click="resetAnswerResult()") reset Answer Result
</template>

<script>
export default {
  props: {
    'totalRanking': {
      type: Array,
      default: () => []
    }
  },
  data() {
    return {
      message: ''
    }
  },
  methods: {
    getTotalRanking() {
      this.$emit("getTotalRanking")
    },
    showTotalRankingMessage() {
      this.$emit("showTotalRankingMessage")
    },
    showTotalRanking() {
      this.$emit("showTotalRanking")
    },
    resetMembers() {
      this.$emit("resetMembes")
    },
    resetAnswerResult() {
      this.$emit("resetAnswerResult")
    }
  }
}
</script>
