<template lang="pug">
  section
    .d-flex.justify-content-between
      h2
        font-awesome-icon(icon="music").mr-2
        | Sounds
      // div
        button(@click="stop") STOP
        button(@click="mute") ミュート
    .d-flex
      button.btn.btn-success.mr-3(@click="soundStart()" )
        font-awesome-icon(icon="music").mr-2
        | 開始
      button.btn.btn-success.mr-3(@click="soundIntermission()" )
        font-awesome-icon(icon="music").mr-2
        | 休憩
    .d-flex.justify-content-between.mt-1
      button.btn.btn-sm.btn-success(@click="soundPeriod()")
        font-awesome-icon(icon="music").mr-2
        | ピリオド
      button.btn.btn-sm.btn-success(@click="soundQuestion()")
        font-awesome-icon(icon="music").mr-2
        | 問題
      button.btn.btn-sm.btn-success(@click="soundReadyGo()")
        font-awesome-icon(icon="music").mr-2
        | ReadyGO
      button.btn.btn-sm.btn-success(@click="soundGong()")
        font-awesome-icon(icon="music").mr-2
        | GONG
      button.btn.btn-sm.btn-success(@click="soundAnswerCheck()")
        font-awesome-icon(icon="music").mr-2
        | ｱﾝｻｰﾁｪｯｸ
      button.btn.btn-sm.btn-success(@click="soundCorrectAnswer()")
        font-awesome-icon(icon="music").mr-2
        | 正解は...
    .d-flex.justify-content-between.mt-1
      button.btn.btn-sm.btn-success(@click="soundDescendingRanking()")
        font-awesome-icon(icon="music").mr-2
        | ワースト
      button.btn.btn-sm.btn-success(@click="soundRanking()")
        font-awesome-icon(icon="music").mr-2
        | 早押し
      button.btn.btn-sm.btn-success(@click="soundWinner()")
        font-awesome-icon(icon="music").mr-2
        | 優勝者
      button.btn.btn-sm.btn-success(@click="soundFailed()")
        font-awesome-icon(icon="music").mr-2
        | 失敗
      // button.btn.btn-sm.btn-success(@click="soundPlay(76, 491)")
        font-awesome-icon(icon="music").mr-2
        | 表彰式
</template>

<script>

export default {
  props: {
    'config': {
      type: Object,
      require: true,
      'default': () => ({})
    }
  },
  data() {
    return {
      trucks: {}
    }
  },
  watch: {
    config() {
      this.init()
    }
  },
  created() {
  },
  mounted() {
  },
  updated() {
  },
  // mounted() {
  methods: {
    init() {
      console.log("init sound trucks")
      const p = this.config.basePath
      const r = this.config.resources

      const start = new Audio()
      start.src = `${p}${r.start}`

      const intermission = new Audio()
      intermission.src = `${p}${r.intermission}`

      const period = new Audio()
      period.src = `${p}${r.period}`

      const question = new Audio()
      question.src = `${p}${r.question}`

      const readyGo = new Audio()
      readyGo.src = `${p}${r.readyGo}`

      const gong = new Audio()
      gong.src = `${p}${r.gong}`

      const answerCheck = new Audio()
      answerCheck.src = `${p}${r.answerCheck}`

      const correctAnswer = new Audio()
      correctAnswer.src = `${p}${r.correctAnswer}`

      const descendingRanking = new Audio()
      descendingRanking.src = `${p}${r.descendingRanking}`

      const ranking = new Audio()
      ranking.src = `${p}${r.ranking}`

      const winner = new Audio()
      winner.src = `${p}${r.winner}`

      const failed = new Audio()
      failed.src = `${p}${r.failed}`

      this.trucks = {
        start,
        intermission,
        period,
        question,
        readyGo,
        gong,
        answerCheck,
        correctAnswer,
        ranking,
        descendingRanking,
        winner,
        failed
      }
    },
    // // sound 系
    play(truckName) {
      console.log("play: " + truckName)
      switch (truckName) {
        case 'start':
          this.soundStart()
          break
        case 'intermission':
          this.soundIntermission()
          break
        case 'period':
          this.soundPeriod()
          break
        case 'question':
          this.soundQuestion()
          break
        case 'readyGo':
          this.soundReadyGo()
          break
        case 'answerCheck':
          this.soundAnswerCheck()
          break
        case 'correctAnswer':
          this.soundCorrectAnswer()
          break
        case 'ranking':
          this.soundRanking()
          break
        case 'descendingRanking':
          this.soundDescendingRanking()
          break
        case 'winner':
          this.soundWinner()
          break
        case 'failed':
          this.soundFailed()
          break
        default:
          break
      }
    },
    soundStart() {
      this.trucks.start.play()
    },
    soundIntermission() {
      this.trucks.intermission.play()
    },
    soundPeriod() {
      this.trucks.period.play()
    },
    soundQuestion() {
      this.trucks.question.play()
    },
    soundReadyGo() {
      this.trucks.readyGo.play()
    },
    soundGong() {
      this.trucks.gong.play()
    },
    soundCorrectAnswer() {
      this.trucks.correctAnswer.play()
    },
    soundAnswerCheck() {
      this.trucks.answerCheck.play()
    },
    soundRanking() {
      this.trucks.ranking.play()
    },
    soundDescendingRanking() {
      this.trucks.descendingRanking.play()
    },
    soundWinner() {
      this.trucks.winner.play()
    },
    soundFailed() {
      this.trucks.failed.play()
    }
  }
}
</script>

<style lang="scss" scoped>
.btn-sm{
  font-size: 0.75em;
}
</style>
