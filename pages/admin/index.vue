<template lang="pug">
  main
    .container-fluid
      .row
        ul.w-100.nav.nav-tabs.mt-2.px-3
          li.nav-item
            .nav-link(href='#' @click="changePanel(1)" :class="{active:isActivePanel(1)}") MAIN
          li.nav-item
            .nav-link(href='#' @click="changePanel(2)" :class="{active:isActivePanel(2)}") RANKING
          li.nav-item
            .nav-link(href='#' @click="changePanel(3)" :class="{active:isActivePanel(3)}")
              | MEMBERS [{{getAliveMembersCount()}}/{{getMembersCount()}}]
    .container-fluid(v-show="isActivePanel(1)")
      .row.bg-light.border-bottom.py-2.mb-2
        // message Panel
        .col-7.border-right
          MessagePanel(
            @send="sendMessage"
            @clear="clearMessages"
            @ready="readyQuestion"
            @standup="standUp"
          )
        // sound Panel
        .col-5
          SoundPanel(
            :config="soundConfig"
            ref="soundPanel"
          )
      .row.py-2.mb-2
        .col-7.border-right
          QuestionPanel(
            ref="questionPanel"
            :enableQuestions="enables.questions"
            :enableReadyGo="enables.readyGo"
            @send="sendQuestion"
            @reset="resetAnswerTable"
            @sound="playSound"
            @go="goQuestion"
            @enable="setEnable"
          )
        .col-5
          AnswerPanel(
            :answers="answers"
            :correctAnswer="correctAnswer"
            :enableAnswerCheck="enables.showAnswerCheck"
            :enableShowCorrectAnswer="enables.showCorrectAnswer"
            :enableAnswerRanking="enables.answerRanking"
            ref="answerPanel"
            @send="sendAnswerCheck"
            @correct="showCorrectAnswer"
            @ranking="showRanking"
          )
    .container-fluid(v-show="isActivePanel(2)")
      .row.py-2.mb-2
        .col-8
          RankingPanel(
            :total-ranking="totalRanking"
            @getTotalRanking="getTotalRanking"
            @showTotalRankingMessage="showTotalRankingMessage"
            @showTotalRanking="showTotalRanking"
            @resetMembers="resetMembers"
            @resetAnswerResult="resetAnswerResult"
          )
    .container-fluid(v-show="isActivePanel(3)")
      .row.py-2.mb-2
        .col-12
          MemberPanel(
            :alives="getAliveMembersCount()",
            :total="getMembersCount()",
            :members="members"
            @check="healthCheck"
          )
</template>

<script>
import config from "~/assets/admin.json"

import MessagePanel from "~/components/admin/MessagePanel"
import SoundPanel from "~/components/admin/SoundPanel"
import QuestionPanel from "~/components/admin/QuestionPanel"
import AnswerPanel from "~/components/admin/AnswerPanel"
import RankingPanel from "~/components/admin/RankingPanel"
import MemberPanel from "~/components/admin/MemberPanel"

export default {
  name: 'Admin',
  components: {
    MessagePanel,
    SoundPanel,
    QuestionPanel,
    AnswerPanel,
    RankingPanel,
    MemberPanel
  },
  data() {
    return {
      socket: null,
      aggregation: { A: 0, B: 0, C: 0, D: 0 },
      counter: 0,
      periodName: null, // filename
      questions: null,
      // selectedQuestion: null,
      answers: [],
      correctAnswer: null,
      answerResult: null,
      members: {},
      // flags for enable buttons
      enables: {
        questions: false,
        readyGo: false,
        showAnswerCheck: false,
        showCorrectAnswer: false,
        answerRanking: false,
        standUp: false
      },
      baseDir: null,
      totalChampion: null,
      totalRanking: null,
      // 追加
      soundConfig: null,
      activePanel: 1
    }
  },
  mounted() {
    this.soundConfig = config.sound

    this.baseDir = this.$router.options.base

    const ioClient = require("socket.io-client")
    this.socket = ioClient.connect(config.serverAddress)

    // 回答を受信した際のイベント
    this.socket.on("answer", listener => {
      this.counter++;

      this.answers.push(listener.data);

      // 回答数を集計
      const answer = listener.data.answer;
      this.aggregation[answer]++;
    });

    this.socket.on("setHealthCheckResult", listener => {
      const key = listener.account.number

      const member = this.members[key]
      if (member == null) {
        this.members[key] = listener.account
      }
      this.members[key].id = listener.id
      this.members[key].status = listener.status
      this.members = { ...this.members }
    });
  },
  methods: {
    sendMessage(message) {
      this.socket.emit("sendMessage", { message })
    },
    clearMessages() {
      this.socket.emit("clearMessages", {});
    },
    // 準備待機
    readyQuestion() {
      this.socket.emit("readyQuestion", {});
    },
    // ピリオド開始時の「全員スタンドアップ」もしくは「個別に対応」
    standUp(id = null) {
      if (id == null) {
        this.playSound("period")
        this.socket.emit("allStandUp")
        // メッセージをクリアして、Stand upを表示
        this.socket.emit("clearMessages", {})
        this.socket.emit("comment", { message: "全員スタンドアップ！！" })
        this.socket.emit("comment", { message: "ご起立ください" })
        this.enables.questions = true
      } else {
        // 個別に復活させる場合

      }
    },
    isActivePanel(panel) {
      return this.activePanel === panel
    },
    changePanel(panel) {
      this.activePanel = panel
    },
    // サウンドエリアの音源を鳴らす
    playSound(truckName) {
      this.$refs.soundPanel.play(truckName);
    },
    // 開始 READY GO
    goQuestion(gongFlag) {
      const timer = 10000

      this.setEnable("readyGo", false)
      setTimeout(() => {
        this.setEnable("showAnswerCheck", true)
      }, timer)

      if (gongFlag) {
        setTimeout(() => {
          this.playSound("gong")
        }, (timer + 500))
      }
      this.socket.emit("go")
      this.playSound("readyGo")
    },
    setEnable(name, flag) {
      this.enables[name] = flag
    },
    // 問題文の送信
    sendQuestion(question, no, periodName) {
      this.playSound("question")
      this.correctAnswer = question.answer
      // to server
      this.socket.emit("setPeriod", periodName)
      this.socket.emit("setQuetion", question)
      this.socket.emit("setQuetionNumber", no)

      // to monitor
      this.socket.emit("clearMessages")
      this.socket.emit("comment", { message: question.title })

      // to client
      this.socket.emit("question", question)
    },
    // アンサーチェック(回答数を確認)
    sendAnswerCheck() {
      this.playSound("answerCheck")
      this.setEnable("readyGo", false)
      this.setEnable("showCorrectAnswer", true)
      this.socket.emit("answerCheck", this.aggregation)
    },
    resetAnswerTable() {
      this.answers = [];
      this.aggregation.A = 0;
      this.aggregation.B = 0;
      this.aggregation.C = 0;
      this.aggregation.D = 0;
    },
    // 正解者はこちら
    showCorrectAnswer() {
      this.playSound("correctAnswer")
      this.setEnable("showAnswerCheck", false)
      this.setEnable("answerRanking", true)
      // 正解を配信
      this.socket.emit("showCorrectAnswer", this.correctAnswer)
      // ヘルスチェック
      this.healthCheck()
      // 正解者をサーバーへ
      const correct = this.answers.filter(v => v.answer === this.correctAnswer)
      this.socket.emit("registerAnswer", correct);
    },
    showRanking(data) {
      const ranking = this.answers.filter(v => {
        return parseInt(v.account.status) === 1 && v.answer === this.correctAnswer
      })
      if (data.asc) {
        // 昇順
        this.playSound("ranking")
        this.socket.emit("showAscendingRanking", ranking)
      } else {
        // 降順
        this.socket.emit("showDescendingRanking", ranking)
      }
    },
    getTotalRanking() {
      const url = `${this.baseDir}total`
      this.$axios
        .get(url)
        .then(res => {
          if (res.status !== 200) throw new Error('通信失敗')
          return res.data
        })
        .then(data => {
          this.answerResult = data
          this.totalChampion = this.calcTotalChampion()

          const ranking = []
          Object.keys(this.totalChampion).forEach(key => {
            this.totalChampion[key].key = key
            ranking.push(this.totalChampion[key])
          })
          ranking.sort((a, b) => {
            if (a.counter > b.counter) return -1
            if (a.counter < b.counter) return 1
            if (a.elapse > b.elapse) return 1
            if (a.elapse < b.elapse) return -1
            return 0;
          })
          this.totalRanking = Array.from(ranking)
        })
        .catch(error => {
          console.error(error)
        })
    },
    showTotalRankingMessage() {
      this.socket.emit("clearMessages")
      this.socket.emit("comment", { message: "結果発表" });
    },
    showTotalRanking() {
      this.socket.emit("clearMessages")
      this.playSound("ranking")
      this.socket.emit("showTotalRanking", this.totalRanking)
    },
    resetMembers() {
      this.socket.emit("resetMembers")
    },
    resetAnswerResult() {
      this.socket.emit("resetAnswerResult")
    },
    loginMember(member) {
      this.members[member.number] = { ...member };
      this.members = { ...this.members };
    },
    getAliveMembersCount() {
      let count = 0;
      Object.keys(this.members).forEach(key => {
        if (parseInt(this.members[key].status) === 1) count++
      })
      return count
    },
    getMembersCount() {
      return Object.keys(this.members).length
    },
    calcTotalChampion() {
      const total = {}
      this.answerResult.forEach(v => {
        const d = v.data

        if (d.length > 0) {
          d.forEach(vv => {
            const key = vv.account.number
            if (total[key] == null) {
              total[key] = {
                counter: 0,
                elapse: 0,
                name: vv.account.name
              }
            }
            total[key].counter++
            total[key].elapse += vv.elapse
          })
        }
      })
      return total
    },
    healthCheck() {
      this.socket.emit("healthCheck");
    }
  }
};
</script>

<style lang="scss" scoped>
.nav-link{
  &.active,
  &:hover{
    cursor: pointer;
    background-color: var(--primary);
    color: #FFF;
  }
}
</style>

<style lang="scss">
h2 {
  font-size: 1.5rem;
}
</style>
