const express = require('express');
const consola = require('consola');
const { Nuxt, Builder } = require('nuxt');
const bodyParser = require('body-parser');

const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

// Import and Set Nuxt.js options
const config = require('../nuxt.config.js');
config.dev = process.env.NODE_ENV !== 'production';

const baseDir = config.router.base || '/'

// Answer Data
let answerResult = []
let period = null
let questionNumber = 0
// Login Members
let members = {}

app.get(`${baseDir}total/`, (req,res) => {
  res.json(answerResult)
})

app.get(`${baseDir}members/`, (req,res) => {
  res.json(answerResult)
})

function initAnswerResult() {
  answerResult.length = 0
  period = null
  questionNumber = 0
}

function initMember() {
  members = {}
}

async function start() {
  // Init Nuxt.js
  const nuxt = new Nuxt(config);
  const { host, port } = nuxt.options.server;

  // Build only in dev mode
  if (config.dev) {
    const builder = new Builder(nuxt);
    await builder.build();
  } else {
    await nuxt.ready();
  }

  // Give nuxt middleware to express
  app.use(nuxt.render);

  // Listen the server
  const server = app.listen(port, host);

  consola.ready({
    message: `Server listening on http://${host}:${port}`,
    badge: true
  })

  // Init socketio
  const socketio = require('socket.io')
  const io = socketio.listen(server)

  io.on('connection', function (socket) {
    console.log('a user connected', socket.id);
    // send comment
    socket.on('comment', function (msg) {
      console.log('comment: ', msg);
      io.emit('comment', msg);
    });

    socket.on('clearMessages', function (msg) {
      io.emit('clearMessages', msg);
    })

    // 全員をスタンドアップ（復活）にする
    socket.on('allStandUp', () => {
      console.log('全員Stand up');
      io.emit('standUp', {all: true})
    })

    socket.on('login', data => {
      const key = data.number
      members[key] = {...data}
      members[key].id = socket.id
      members[key].status = 1
      io.emit('login', members[key])
    })

    socket.on('relogin', data => {
      if (data != null) {
        data.id = socket.id;
        io.emit('relogin', data);
      }
    });
    socket.on('answer', data => {
      const answeredTimestamp = Date.now();
      console.log(socket.id, 'answer: ', data, answeredTimestamp, goTimestamp);
      data.id = socket.id;
      const dt = new Date()
      const h = ('00' + dt.getHours()).slice(-2);
      const m = ('00' + dt.getMinutes()).slice(-2);
      const s = ('00' + dt.getSeconds()).slice(-2);
      const ms = dt.getMilliseconds();
      data.time = `${h}:${m}:${s} ${ms}`;
      data.elapse = answeredTimestamp - goTimestamp;

      io.emit('answer', {
        data
      });
    });

    socket.on('lock', data => {
      io.emit('lock', data);
    });

    socket.on('unlock', data => {
      io.emit('unlock', data);
    });

    // answer check
    socket.on('answerCheck', data => {
      io.emit('answerCheck', data)
    })

    socket.on('question', data => {
      io.emit('question', data)
    })

    socket.on('readyQuestion', data => {
      io.emit('readyQuestion', data)
    })

    socket.on('go', data => {
      goTimestamp = Date.now()
      io.emit('go', data)
    })

    socket.on('showCorrectAnswer', data => {
      io.emit('showCorrectAnswer', data)
    })

    socket.on('registerAnswer', data => {
      // io.emit('registerAnswer', data);
      // 回答履歴をここに記録していくようにする
      answerResult.push(
        {
          data,
          period,
          questionNumber
        }
      );
    });

    // モニターを昇順ランキングに切り替え
    socket.on('showAscendingRanking', data => {
      io.emit('showAscendingRanking', data);
    })
    // モニターを降順ランキングに切り替え
    socket.on('showDescendingRanking', data => {
      io.emit('showDescendingRanking', data);
    })

    // モニターを総合ランキングに切り替え
    socket.on('showTotalRanking', data => {
      io.emit('showTotalRanking', data);
    })

    // ピリオドをセット
    socket.on('setPeriod', p => {
      period = p
    })

    // 問題番号をセット
    socket.on('setQuetionNumber', num => {
      questionNumber = num
    })

    // ユーザーの状態確認用
    socket.on('healthCheck', () => {
      io.emit('healthCheck')
    })

    // ユーザーからの状態返答
    socket.on('responseHealthCheck', data => {
      io.emit('setHealthCheckResult', data)
    })

    // ユーザーの初期化
    socket.on('resetMembers', () => {
      initMember()
    })

    // 回答結果の初期化
    socket.on('resetAnswerResult', () => {
      initAnswerResult()
    })
  });
}

start();
