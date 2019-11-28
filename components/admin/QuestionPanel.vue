<template lang="pug">
  section
    .d-flex.justify-content-between
      h2
        font-awesome-icon(icon="question-circle").mr-2
        | Questions
      label.border.rounded.text-center.px-3.question-file(
        :class="{'border-primary':enableQuestions,'border-danger': !enableQuestions}"
      )
        font-awesome-icon.mr-2.small(icon="folder")
        | 問題ファイルを開く
        input.d-none(
          type="file"
          accept="application/json"
          :disabled="!enableQuestions"
          @change="onFileChange"
          value=""
        )
    .w-100.question-wrapper
      table#question-table.table.table-sm.table-hover
        thead
          tr
            th(rowspan="2")
          tr
            th
              table.w-100
                tbody
                  tr
                    th(colspan="6") Question {{periodName}}
                  tr
                    th 区分
                    th.th A
                    th.th B
                    th.th C
                    th.th D
                    th.answer 正解
        tbody
          tr(v-for="(v,i) in questions" @click="activateTableRow($event, i)")
            td
              input(type="radio" :value="i" v-model="selectedQuestionNo")
            td
              table.w-100
                tbody
                  tr
                    td Q.{{i}}
                    td(colspan="6") {{v.title}}
                  tr
                    td {{getTypeText(v.type)}}
                    td.choise( v-html="'A:'+getChoiseHTML(v.type, v.choices.A)")
                    td.choise( v-html="'B:'+getChoiseHTML(v.type, v.choices.B)")
                    td.choise( v-html="'C:'+getChoiseHTML(v.type, v.choices.C)")
                    td.choise( v-html="'D:'+getChoiseHTML(v.type, v.choices.D)")
                    td.answer {{v.answer}}
    .my-3.d-flex.justify-content-between
      button.btn.btn-sm.btn-primary(@click="sendQuestion()" :disabled="!enableSendQuestion")
        u 選択中の問題{{selectedQuestionNo}}
        | を送る
        font-awesome-icon(icon="plus")
        font-awesome-icon(icon="music").mr-2
      button.btn.btn-sm.btn-warning(@click="goQuestion(false)" :disabled="!enableReadyGo")
        | Ready GO!!
        font-awesome-icon(icon="plus")
        font-awesome-icon(icon="music").mr-2
      button.btn.btn-sm.btn-danger(@click="goQuestion(true)" :disabled="!enableReadyGo")
        | Ready GO!!
        font-awesome-icon(icon="plus")
        font-awesome-icon(icon="music").mr-2
        | ゴング
</template>

<script>
export default {
  props: {
    enableQuestions: {
      type: Boolean,
      default: false
    },
    enableReadyGo: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      periodName: null,
      selectedQuestionNo: null,
      questions: null
    }
  },
  computed: {
    enableSendQuestion() {
      return this.selectedQuestionNo > 0
    }
  },
  methods: {
    // 問題文ファイルの読み込み
    onFileChange(event) {
      const reader = new FileReader();
      reader.onload = event => {
        this.questions = JSON.parse(event.target.result);
      };
      if (event.target.files.length === 1) {
        this.periodName = event.target.files[0].name
        reader.readAsText(event.target.files[0]);

        // to server
        // this.socket.emit("setPeriod", this.periodName);
        this.$emit("setPeriod", this.periodName)
      }
    },
    activateTableRow(event, id) {
      this.selectedQuestionNo = parseInt(id);
      document.querySelectorAll("#question-table .active").forEach(v => {
        v.classList.remove("active");
      });
      event.currentTarget.classList.add("active");
    },
    getTypeText(type) {
      let rt = null;
      switch (parseInt(type)) {
        case 2:
          rt = "画像";
          break;
        case 1:
        default:
          rt = "通常";
          break;
      }
      return rt;
    },
    getChoiseHTML(type, choise) {
      let rt = null;
      switch (parseInt(type)) {
        case 2:
          rt = `<img src="${choise}">`;
          break;
        case 1:
        default:
          rt = choise;
          break;
      }
      return rt;
    },
    sendQuestion() {
      const no = parseInt(this.selectedQuestionNo);
      // 番号が不正、もしくは該当番号の問題がない場合は終了
      if (!no > 0 || this.questions[no] == null) return false

      // 問題開始の音
      this.$emit("sound", "question")

      // 各種フラグを管理
      this.$emit("enable", "readyGo", false)
      this.$emit("enable", "showCount", false)
      this.$emit("enable", "showCorrectAnswer", false)

      // 問題を送ったタイミングで、解答テーブルをクリアする
      this.resetAnswerTable();

      // 問題を送る
      const question = this.questions[no];
      this.answer = question.answer;
      // 問題開始を許可する
      this.$emit("enable", "readyGo", true)

      // 問題と、問題番号、ピリオド名（ファイル名）をエミットする
      this.$emit("send", question, no, this.periodName)
    },
    resetAnswerTable() {
      this.$emit("reset")
    },
    goQuestion() {
      this.$emit("go")
    }
  }
}
</script>

<style lang="scss" scoped>

  .question-file{
    &.border-primary{
      cursor: pointer;
    }
    &.border-danger{
      // cursor: pointer;
    }
  }

  .question-wrapper{
    height: 50vh;
    overflow-y: scroll;
  }

  #question-table {
    font-size: .75rem;

    img{
      width: 60px;
    }
    thead{
      th{
        text-align: center;
      }
    }
    tr:hover {
      cursor: pointer;
      background-color: #def;
    }
    tr.active {
      background-color: #bcf;
    }
    .th{
      width: 20%;
    }
    .choise {
      word-break: break-all;
      width: 20%;
      border-right: 1px solid #CCC;
      &:first-child{
        border-left: 1px solid #CCC;
      }
    }
    .answer{
      width: 10%;
      font-weight: bold;
      color: red;
      text-align: center;
    }
  }
</style>
