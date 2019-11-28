<template lang="pug">
  .container-fluid.px-3(v-cloak)
    .row
      .col-12
        LogoImage.mt-2(v-if="status === -1")
        #question-panel.mt-2
          .mx-1.mb-1.alert.alert-warning
            #header-panel
              .d-flex.justify-content-between(v-if="account!=null")
                .login-name.text-white
                  | {{accountName}}
                  span.small さん
                div(v-show="status >= 0 ")
                  .timer.loader.fadeInDown.infinite {{timeCounter}}
              .login-name(v-else) ログイン中...
                .timer.d-none
            .text.text-center(v-if="status===-1") ようこそ！<br><br>スタンドアップの合図まで<br>お待ちください
            .text(v-else) {{getQuestionText()}}
        #answer-panel(v-show="status >= 0")
          .answer-mask(v-if="answerLock")
            .answer-wrapper
              .answer-container(v-show="answerLabelText")
                .answer-label {{answerLabelText}}
          .d-flex
            .bg-white.rounded.w-50.m-1.p-1
              button#a.btn.btn-success.w-100.h-100(
                @click="answer"
                value="A"
                :class="{'btn-outline-success': standBy}"
                :disabled="standBy"
              )
                .w-100(v-html = "getChoice('A')")
                .aggregate-wrapper(v-if="answerCheck['A']")
                  .aggregate {{answerCheck['A']}}
            .bg-white.rounded.w-50.m-1.p-1
              button#b.btn.btn-danger.w-100.h-100(
                @click="answer"
                value="B"
                :class="{'btn-outline-danger': standBy}"
                :disabled="standBy"
              )
                .w-100(v-html = "getChoice('B')")
                .aggregate-wrapper(v-if="answerCheck['B']")
                  .aggregate {{answerCheck['B']}}
          .d-flex
            .bg-white.rounded.w-50.m-1.p-1
              button#c.btn.btn-info.w-100.h-100(
                @click="answer"
                value="C"
                :class="{'btn-outline-info': standBy}"
                :disabled="standBy"
              )
                div(v-html = "getChoice('C')")
                .aggregate-wrapper(v-if="answerCheck['C']")
                  .aggregate {{answerCheck['C']}}
            .bg-white.rounded.w-50.m-1.p-1
              button#d.btn.btn-warning.w-100.h-100(
                @click="answer"
                value="D"
                :class="{'btn-outline-warning': standBy}"
                :disabled="standBy"
              )
                div(v-html = "getChoice('D')")
                .aggregate-wrapper(v-if="answerCheck['D']")
                  .aggregate {{answerCheck['D']}}
        #message-panel
</template>
<script>
import ioClient from "socket.io-client";
import config from "~/assets/client.json";

import LogoImage from "~/components/LogoImage";

export default {
  components: {
    LogoImage
  },
  data() {
    return {
      account: null,
      socket: ioClient(config.serverAddress),
      question: {},
      answered: null,
      standBy: true,
      answerLock: false,
      timer: null,
      timeCounter: 10, // デフォは10sec
      answerLabelText: "",
      answerCheck: { A: 0, B: 0, C: 0, D: 0 },
      status: -1, // 1: alive , 0 : failed , -1: stay
      warnings: []
    };
  },
  computed: {
    accountName() {
      return this.account != null ? this.account.name : "";
    }
  },
  mounted() {
    this.socket.on("readyQuestion", () => {
      this.question = null;
      this.answerLabelText = "回答の準備をしてください";
    });
    this.socket.on("lock", () => {
      this.answerLock = true;
    });
    this.socket.on("unlock", () => {
      this.answerLock = false;
    });
    this.socket.on("go", () => {
      this.ready(10);
      this.go();
    });
    this.socket.on("question", data => {
      this.ready(10);
      this.answerLabelText = ""
      this.answerCheck = { ...{} }
      this.question = { ...data }
      this.answerLock = true
      this.standBy = true
    });
    this.socket.on("answerCheck", data => {
      this.answerCheck = { ...data };
    })
    this.socket.on("showCorrectAnswer", data => {
      switch (data) {
        case "A":
          document.querySelector("#a").classList.add("blinking");
          break;
        case "B":
          document.querySelector("#b").classList.add("blinking");
          break;
        case "C":
          document.querySelector("#c").classList.add("blinking");
          break;
        case "D":
          document.querySelector("#d").classList.add("blinking");
          break;
        default:
          break;
      }

      // 自分の答えと比較
      if (this.answered === data) {
        // this.status = 1 ;
        this.answerLabelText = "正解！！";
      } else {
        // 失敗
        this.status = 0;
        // this.answerLock = true;
        this.answerLabelText = "残念！";
        document.getElementsByTagName("body")[0].classList.add("dead")
      }
    })

    this.socket.on("healthCheck", () => {
      this.responseHealthCheck({
        account: this.account,
        status: this.status,
        question: this.question,
        id: this.socket.id
      })
    })

    this.socket.on("standUp", data => {
      console.log("スタンドアップ", data);
      document.getElementsByTagName("body")[0].classList.remove("dead")

      if (data == null) return false;
      if (data.all === true) {
        this.status = 1;
        this.timeCounter = 10;
        if (this.question != null) {
          this.question.title = "～全員スタンドアップ！～";
        }
      } else if (data.id === this.account.number) {
        this.status = 1;
        this.timeCounter = 10;
      }
    });
    // ヘッダーの高さ取得
    this.$nextTick(() => {
      const hh = document.getElementById("header-panel").clientHeight
      const timer = document.querySelector("#header-panel .timer")
      timer.style.width = hh + 'px';
      timer.style.height = hh + 'px';
    })
    // アカウント初期化
    this.initAccount();
  },
  methods: {
    addWarning(text) {
      this.warnings.push(text);
    },
    clearWarning() {
      this.warnings = [];
    },
    hasWarnings() {
      return this.warnings.length > 0;
    },
    initAccount() {
      // LS
      const getFromLocalStorage = () => {
        return JSON.parse(localStorage.getItem("account"));
      };

      const localAccount = getFromLocalStorage();
      const storeAccount = this.$store.getters.authUser;
      if (storeAccount != null) {
        this.account = Object.assign(storeAccount);
        localStorage.setItem("account", JSON.stringify(this.account));
      } else if (localAccount != null) {
        this.account = Object.assign(localAccount);
      } else {
        location.href = "/";
        return false;
      }
      this.socket.emit("login", this.account);
    },
    getAccountName() {
      return this.account != null ? this.account.name : "";
    },
    getSocketId() {
      return this.socket != null ? this.socket.id : null;
    },
    answer(event) {
      this.answerLock = true;
      const value = event.currentTarget.value;
      event.currentTarget.classList.add("active");

      document
        .querySelectorAll("#answer-panel .btn:not(.active)")
        .forEach(v => {
          v.classList.add("o-50");
        });
      this.answered = value;
      this.answerLabelText = `${value} を回答しました`
      this.account.status = this.status
      this.socket.emit("answer", { answer: value, account: this.account });
    },
    countDown() {
      // if (this.status === 0) return null;

      this.timeCounter--
      if (this.timeCounter === 0) {
        this.answerLock = true
        if (this.answered == null) {
          this.answerLabelText = "時間切れ"
          this.standBy = true
        }
        clearInterval(this.timer);
      } else if (this.timeCounter < 0) {
        this.timeCounter = 0
      }
    },
    ready(time) {
      this.answered = null;
      this.timeCounter = time * 1;
    },
    go() {
      this.standBy = false;
      this.answerLock = false;
      this.timer = setInterval(this.countDown, 1000);
    },
    getQuestionText() {
      return this.question != null ? this.question.title : "～待機中～";
    },
    getChoice(choice) {
      if (this.question == null)
        return choice;
      if (this.question.type === 1) {
        if (this.standBy && this.timeCounter > 0) {
          return choice
        } else {
          return `${choice}: ${this.question.choices[choice]}`;
        }
      } else if (this.question.type === 2) {
        // image
        if (this.standBy && this.timeCounter > 0) {
          return `<img class="w-100" style="opacity:0" src='${this.question.choices[choice]}'>`
        } else {
          return `<img class="w-100" src='${this.question.choices[choice]}'>`
        }
      } else {
        return choice
      }
    },
    responseHealthCheck(data) {
      this.socket.emit("responseHealthCheck", data)
    }
  }
};
</script>

<style lang="scss" scoped>

#header-panel {
  background-color: #02aebe;
  border-bottom: 0.125rem solid #017f8b;
  padding: 0 0.5em;
  margin-left: -0.5rem;
  margin-right: -0.5rem;

  .timer {
    line-height: 1.5em;
    background-color: #FFF;
    border:1px solid #017f8b;
    border-radius: 50%;
    text-align: center;
    -webkit-text-stroke: 1px #017f8b;
  }

  .login-name,
  .timer {
    margin-bottom: 0;
    font-weight: bold;
    position: relative;
  }
}
#question-panel {
  .alert {
    font-size: 120%;
    font-weight: bold;
    min-height: 6rem;
    // height: 20vh;
    margin: 0 auto;
    color: #fff;
    border: 2px solid #000;
    border-radius: 5px;
    box-shadow: 0 0 0 4px #fff inset;
    // background-color: #27bdc9;
    background-color: #02aebe;
    // -webkit-text-stroke: 1px #EEE;
    // text-shadow: 1px 1px 0 #000C;
    text-shadow: #000 1px 1px ;
    padding: 0.25rem 0.75rem;
    .text{
      line-height: 1.25em;
      padding-bottom: 0.25rem;
    }
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

#answer-panel {
  .answer-mask {
    position: fixed;
    z-index: 9998;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(255, 255, 255, 0.1);
    display: table;
    transition: opacity 0.3s ease;
  }
  .answer-wrapper {
    display: table-cell;
    vertical-align: bottom;
  }
  .answer-container {
    margin: 0.25em;
    padding: 0.25em;
    background-color: #fff;
    border-radius: 2px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.33);
    transition: all 0.3s ease;

    font-size: 125%;
    text-align: center;
  }
  .btn {
    font-size: 7vw !important;
    font-weight: bold;
    min-height: 8rem;
    -webkit-text-stroke: 1px #333E;
    // text-shadow: 1px 1px 0 #0009;
    // text-shadow: #000 1px 1px 0;
    &:disabled {
      background-color: #fff;
      opacity: 1 !important;
    }
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
  .o-50 {
    opacity: 0.5;
  }
}

.input-group-prepend {
  width: 8em;
}

[v-cloak] {
  display: none;
}
</style>

<style lang="scss">
body {
  background-repeat: repeat;
  background-image: url("/img/background.png");
  background-color: #02aebe;
  min-height: 80vh;
  &.dead{
    backdrop-filter: grayscale(1);
    background-image: url("/img/background_f.png");
    background-color: #CCC;
  }
}
</style>
