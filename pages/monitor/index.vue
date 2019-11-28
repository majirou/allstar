<template lang="pug">
  .container.text-center
    template(v-if="mode===1")
      .row(style="text-align: initial;")
        .col-12
          #question-panel
            .alert.mt-3
              .d-flex.justify-content-between(style="height:")
                .d-flex.flex-column
                  h1.w-100 問題
                  p.mx-3 {{getQuestionText()}}
                .p-3.text-center
                  .timer.loader.flipInX(
                    v-if="status===1"
                    :class="{'animated': ! this.standBy }"
                  ) {{timeCounter}}
                  .timer(v-else) 0
        .col-12
          #answer-panel
            .d-flex.mt-3
              .bg-white.rounded.w-50.mr-2.p-1
                button#a.btn.btn-success.w-100.h-100(
                  value="A"
                  :class="{'btn-outline-success': standBy}"
                  :disabled="standBy"
                )
                  .w-100(v-html = "getChoice('A')")
                  .aggregate-wrapper(v-if="answerCheck['A']")
                    .aggregate {{answerCheck['A']}}
              .bg-white.rounded.w-50.ml-2.p-1
                button#b.btn.btn-danger.w-100.h-100(
                  value="B"
                  :class="{'btn-outline-danger': standBy}"
                  :disabled="standBy"
                )
                  .w-100(v-html = "getChoice('B')")
                  .aggregate-wrapper(v-if="answerCheck['B']")
                    .aggregate {{answerCheck['B']}}
            .d-flex.mt-3
              .bg-white.rounded.w-50.mr-2.p-1
                button#c.btn.btn-info.w-100.h-100(
                  value="C"
                  :class="{'btn-outline-info': standBy}"
                  :disabled="standBy"
                )
                  div(v-html = "getChoice('C')")
                  .aggregate-wrapper(v-if="answerCheck['C']")
                    .aggregate {{answerCheck['C']}}
              .bg-white.rounded.w-50.ml-2.p-1
                button#d.btn.btn-warning.w-100.h-100(
                  value="D"
                  :class="{'btn-outline-warning': standBy}"
                  :disabled="standBy"
                )
                  div(v-html = "getChoice('D')")
                  .aggregate-wrapper(v-if="answerCheck['D']")
                    .aggregate {{answerCheck['D']}}
    template(v-else-if="mode===2")
      .row
        .col-12
          #ranking-panel
            template(v-if="asc")
              h2
                font-awesome-icon(icon="trophy").mr-2
                span.gradient 早押しランキング
              table.table
                tbody.d-flex.flex-column-reverse
                  tr.w-100.alert.alert-info(v-for="(v,i) in ranking" :class="getAnimatedClass(i)" )
                    td {{Math.abs(i-10)}}
                    td {{formatSecond(v.elapse)}} 秒
                    td {{v.account.name}}
            template(v-else)
              h2
                font-awesome-icon(icon="times").mr-2
                span.gradient 予選落ち
              table.table
                tbody.d-flex.flex-column
                  tr.w-100.alert.alert-info(v-for="(v,i) in ranking" :class="getAnimatedClass(i)" )
                    td {{getDescRankingNumber(i)}}
                    td {{formatSecond(v.elapse)}} 秒
                    td {{v.account.name}}
    template(v-else-if="mode===3")
      .row
        .col-12
          #ranking-panel
            h2
              font-awesome-icon(icon="trophy").mr-2
              span.gradient 総合ランキング
            table.table
              tbody.d-flex.flex-column-reverse
                tr.w-100.alert.alert-info(v-for="(v,i) in totalRanking" :class="getAnimatedClass(i)" )
                  td {{Math.abs(i-10)}}
                  td 正解 {{v.counter}} 問
                  td {{formatSecond(v.elapse)}} 秒
                  td {{v.name}}
    template(v-else)
      LogoImage.my-2
      #message-panel
        .alert(v-if="messages.length > 0")
          ul
            li(v-for="(v,i) in messages") {{v.message}}

</template>

<script>
import ioClient from "socket.io-client"
import config from "~/assets/client.json"
import LogoImage from "~/components/LogoImage"

export default {
  components: {
    LogoImage
  },
  data() {
    return {
      mode: 0,
      asc: true,
      socket: ioClient(config.serverAddress),
      messages: [],
      question: null,
      answered: null,
      standBy: true,
      answerLock: false,
      timer: null,
      timeCounter: 10, // デフォは10sec
      answerLabelText: "",
      answerCheck: { A: 0, B: 0, C: 0, D: 0 },
      status: 1, // 1: alive , 0 : dead
      ranking: [],
      rankingLength: 0
    }
  },
  mounted() {
    this.messages.push({ message: '前面モニター' })

    this.socket.on("comment", data => {
      if (this.mode > 0) {
        this.messages = []
        this.mode = 0
      }
      this.messages.push(data)
    })
    this.socket.on("clearMessages", data => {
      this.messages = []
    })
    this.socket.on("readyQuestion", data => {
      this.question = null
      this.answerLabelText = "READY..."
    })
    this.socket.on("go", data => {
      this.ready(10)
      this.go()
    })
    this.socket.on("question", data => {
      this.mode = 1
      this.ready(10)
      this.answerCheck = { ...{} }
      this.question = { ...data }
      this.answerLock = true
      this.standBy = true

      for (const v of document.querySelectorAll(`.o-50`)) {
        v.classList.remove("o-50")
      }
    })
    this.socket.on("answerCheck", data => {
      this.answerCheck = { ...data }
    })
    this.socket.on("showCorrectAnswer", data => {
      // 不正解を非表示にする
      for (const v of document.querySelectorAll(`#answer-panel .bg-white`)) {
        v.classList.add("o-50")
      }
      const id = data.toLowerCase()
      const elem = document.querySelector(`#${id}`)
      elem.classList.add("animated", "flash", "fadeIn", "infinite")
      elem.parentNode.classList.remove("o-50")
      setTimeout(() => { elem.classList.remove("infinite") }, 5000)
    })
    // 降順ランキングを表示する（主に予選落ち）
    this.socket.on("showDescendingRanking", ranking => {
      // ランキング初期化
      this.ranking = []
      for (let i = 0; i < 10; i++) {
        this.ranking[i] = {
          account: { name: null, section: null, account: null },
          answer: null,
          elapse: '-',
          id: null,
          time: '-'
        }
      }

      this.rankingLength = ranking.length
      const len = ranking.length

      if (len > 10) {
        ranking = ranking.slice(-10)
      }

      const geta = 10 - len

      if (len > 0) {
        for (let i = len; i >= 0; i--) {
          if (ranking[i] != null) {
            this.ranking.splice(i + geta, 1, ranking[i])
          }
        }
      }
      this.ranking = Array.from(this.ranking)
      this.asc = false
      this.mode = 2
    })
    // 昇順ランキングを表示する（主にピリオドチャンピオン）
    this.socket.on("showAscendingRanking", ranking => {
      // ランキング初期化
      this.ranking = []
      for (let i = 0; i < 10; i++) {
        this.ranking[i] = {
          account: { name: null, section: null, account: null },
          answer: null,
          elapse: '-',
          id: null,
          time: '-'
        }
      }
      this.rankingLength = ranking.length
      let len = ranking.length
      if (len > 0) {
        len = (len > 10) ? 10 : len // 10 以上はランキング外なので採用しない
        for (let i = 0; i < len; i++) {
          this.ranking.splice(i, 1, ranking[i])
        }
        this.ranking = Array.from(this.ranking.reverse())
      }
      this.asc = true
      this.mode = 2
    })
    // 総合ランキングを表示する
    this.socket.on("showTotalRanking", ranking => {
      // ランキング初期化
      this.totalRanking = []
      for (let i = 0; i < 10; i++) {
        this.totalRanking[i] = {
          counter: 0,
          elapse: 0,
          key: null,
          name: null
        }
      }

      let len = ranking.length
      if (len > 0) {
        len = (len > 10) ? 10 : len // 10 以上はランキング外なので採用しない
        for (let i = 0; i < len; i++) {
          this.totalRanking.splice(i, 1, ranking[i])
        }
        this.totalRanking = Array.from(this.totalRanking.reverse())
      }
      this.mode = 3
    })
  },
  methods: {
    getLogoHeightStyle () {
      return (this.messages.length > 0) ? { height: '50vh' } : {}
    },
    getSocketId() {
      return this.socket != null ? this.socket.id : null
    },
    countDown() {
      if (this.status === 0) return null

      this.timeCounter--
      if (this.timeCounter === 0) {
        clearInterval(this.timer)
      } else if (this.timeCounter < 0) {
        this.timeCounter = 0
      }
    },
    ready(time) {
      this.timeCounter = time
    },
    go() {
      if (this.status > 0) {
        this.standBy = false
      }
      this.timer = setInterval(this.countDown, 1000)
    },
    getQuestionText() {
      return this.question != null ? this.question.title : "～待機中～"
    },
    getChoice(choice) {
      if ((this.standBy && this.timeCounter > 0) || this.question == null)
        return choice
      if (this.question.type === 1) {
        // text
        return `${choice}: ${this.question.choices[choice]}`
      } else if (this.question.type === 2) {
        // image
        return `<img src='${this.question.choices[choice]}'>`
      } else {
        return choice
      }
    },
    // animation
    getAnimatedClass(i) {
      if (i != null && i >= 0) {
        const delay = `delay${i + 1}`
        const obj = { animated: true, slideInLeft: true }
        obj[delay] = true
        return obj
      }
    },
    formatSecond (time) {
      return (time > 0) ? time / 1000.0 : '-'
    },
    getDescRankingNumber(num) {
      const ranking = this.rankingLength - Math.abs(num - 10)
      return (ranking < 0) ? '-' : ranking + 1
    }
  }
}
</script>

<style lang="scss">
body{
  background-image: url('/img/monitor_bg.png');
  background-color: #02aebe;
}
</style>

<style lang="scss" scoped>
.animated.delay1 {
  -webkit-animation-delay: 0.5s;
  animation-delay: 0.5s;
}
.animated.delay2 {
  -webkit-animation-delay: 1s;
  animation-delay: 1s;
}
.animated.delay3 {
  -webkit-animation-delay: 1.5s;
  animation-delay: 1.5s;
}
.animated.delay4 {
  -webkit-animation-delay: 2s;
  animation-delay: 2s;
}
.animated.delay5 {
  -webkit-animation-delay: 2.5s;
  animation-delay: 2.5s;
}
.animated.delay6 {
  -webkit-animation-delay: 3s;
  animation-delay: 3s;
}
.animated.delay7 {
  -webkit-animation-delay: 4s;
  animation-delay: 4.5s;
}
.animated.delay8 {
  -webkit-animation-delay: 5.5s;
  animation-delay: 5.75s;
}
.animated.delay9 {
  -webkit-animation-delay: 8s;
  animation-delay: 8s;
}
.animated.delay10 {
  -webkit-animation-delay: 11.5s;
  animation-delay: 11.5s;
}
</style>

<style lang="scss" scoped>

.timer {
  font-size: 4rem;
  font-weight: bold;
  width: 6rem;
  line-height: 6rem;
  background-color: #FFF;
  border: 3px solid #017f8b;
  border-radius: 100%;
  text-align: center;
  color: #017f8b;
}
ul{
  list-style: none;
  font-size: 350%;
  padding:0;
}

.logo{
  height: 80vh;
  max-width: 80vw;
}

#message-panel{
  .alert{
    min-height: 25vh;
    font-size: 110%;
    margin: 0 auto;
    color: #fff;
    border: 2px solid #000;
    border-radius: 5px;
    box-shadow: 0 0 0 4px #fff inset;
    background-color: #27bdc9;
  }
}

#question-panel{
  font-size: 250%;
  .alert{
    min-height: 25vh;
    font-size: 110%;
    margin: 0 auto;
    color: #fff;
    border: 2px solid #000;
    border-radius: 5px;
    box-shadow: 0 0 0 4px #fff inset;
    background-color: #27bdc9;
  }
}

#answer-panel{
  button {
    min-height: 20vh;
    font-size: 300%;
    font-weight: bold;
    -webkit-text-stroke: 2px #222;
    text-shadow: 1px 1px 0 #000;
    text-shadow: #000 1px 1px 0;
  }
  .btn-warning {
    color: #ffffff;
    &:hover{
      color: #ffffff;
    }
    &.btn-outline-warning{
      color: #ffc107;
    }
  }
  .aggregate-wrapper {
    position: relative;
    .aggregate {
      background-color: #fff;
      position: absolute;
      padding: 0 0.5em;
      border-radius: 50%;
      right: 0;
      bottom: 0;
      color: #000;
      border: 1px solid #333;
    }
  }
  .o-50 {
    opacity: 0.5;
  }
}
#ranking-panel{
  h2{
    color: #13599E;
    margin-top:0.5em;
    padding: 0.25em 0;
    border: 1px solid #000;
    border-radius: 5px;
    box-shadow: 0 0 0 4px #1359bd inset;
    background-color: #fff;
    .gradient{
      // color: #ACB6E5;//非対応のブラウザでの文字色を設定
      background: linear-gradient(0deg, #1359bd, #27bdc9);//背景色にグラデーションを指定
      background-clip: text;//テキストでくり抜く
      -webkit-text-fill-color: transparent;//くり抜いた部分は背景を表示
      font-weight: bold;
    }
  }
  table{
    margin-top:1em;
  }
  tr.alert{
    font-size: 110%;
    margin: 0 auto;
    color: #fff;
    border: 2px solid #0009;
    border-radius: 5px;
    box-shadow: 0 0 0 4px #fff inset;
    background-color: #27bdc9;
    margin-bottom: 0.125em;
    display: flex;
    // justify-content: space-between;
    td{
      margin-right: 1em;
      border-top: none;
      &:first-child{
        background-color: #248e9b;
        border-radius: 0.25em;
        width: 2.5em;
      }
      &:nth-child(2){
        width: 6em;
        text-align: right;
      }
    }
  }
  .table th,
  .table td{
    padding:0;
  }
}
</style>
<style>
.fa-trophy{
  color: #DA8E00;
  background: linear-gradient(-45deg, #F7DE05, #DA8E00, #EDAC06, #F7DE05, #ECB802, #DAAF08, #B67B03, #DA8E00, #EDAC06, #F7DE05, #ECB802, #EDAC06);
  background-clip: text;
  -webkit-text-fill-color: transparent;
}
</style>
