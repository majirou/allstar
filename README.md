# allstar

某オールス◯ー感謝祭風なクイズアプリケーションです。
忘年会に向けた出し物として、Nuxt.js + SocketIO(websocket)で作ってみました。

This is a Quiz Web Application like japanese famous TV show.
It is made with Nuxt.js, SocketIO For party.

## 構成

### サーバー

クイズの出題や結果を管理し、ユーザーとモニターに配信を行います。
nuxtでのexpressにて、サーバーとして稼働させます。

### ユーザー

クイズを受け、回答をするインターフェースです。
回答者はこちらの画面をスマホなどでアクセスし、問題を受け、回答をしていきます。

### モニター

イベントの進行（クイズやアナウンス）などを表示する機能です。

## 設定

### サーバー

`/nuxt.config.js` 内のserverに稼働するサーバーの情報を記述してください。

```json
  server: {
    port: 3000, // デフォルト: 3000
    host: 'localhost' // デフォルト: localhost
  },
```

基本的には、`server/index.js`にて、Websocketでのやりとりを記述しています。

```js
  const socketio = require('socket.io')
  const io = socketio.listen(server)
```

以下のようであれば、コネクションが確立した後に、`sendComment`イベントが発生すれば、
接続している対象に対して`comment`というイベントと`msg`オブジェクトを送信します。
某オールス◯ー感謝祭で必要になるのは`standUp`や`answerCheck`などを実装します。

```js
  io.on('connection', function (socket) {
    // send comment
    socket.on('sendComment', function (msg) {
      io.emit('comment', msg);
    });
```

### ユーザー

`/assets/client.json` の内容を編集します。

```json
{
  "serverAddress": "localhost:3000",
  "image": {
    "basePath" : "/img/",
    "logoFile" : "logo.png"
  }
}
```

* serverAddress: 接続するサーバーアドレス
* image: ロゴ画像などを適当なものに変えるときに指定します。

### 管理者

`/assets/admin.json` の内容を編集します。
音源に関しては、ご自身で収集ください。

```json
  "serverAddress": "localhost:3000",
  "sound": {
    "basePath" : "/sounds/",
    "resources" : {
      "start": "start.wav",
      "intermission": "intermission.wav",
      "period": "period.wav",
      "question": "question.wav",
      "readyGo": "ready_go.wav",
      "gong": "gong.wav",
      "answerCheck": "answer_check.wav",
      "correctAnswer": "correct_answer.wav",
      "ranking": "ranking.wav",
      "descendingRanking": "descending_ranking.wav",
      "winner": "winner.wav",
      "failed": "failed.wav"
    }
  }
```

* serverAddress: 接続するサーバーアドレス
* sound: 以下は、音源ファイルを指定。
  * start: 某番組的にいうと、CMから戻った際のジングル
  * intermission: 某番組的にいうと、CMに入る際の参加者が拍手しながらかかる
  * period: 某番組的にいうと、ピリオド開始時に全員がスタンドアップするときにかかる
  * question": 某番組的にいうと、レディーゴーの音。

  などなど

### 参加者

`assets/members.js` に以下の形でログインメンバーを編集します。
* `name` は表示される名前です。
* `account` はログイン時に必要なアカウント名です。
* `status` は0,1で解答権の有無を管理します。
* オブジェクトのキーはIDとして使います。下の場合は、`1`がキーIDとなります。

```json
{
  "1": {
    "name": "まじろう",
    "account": "majirou",
    "status": 1
  }
}
```
