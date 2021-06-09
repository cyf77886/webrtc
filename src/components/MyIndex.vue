<template>
  <div>
    <div>
      <div>
        <button id="connserver" :disabled="isLeaved" @click="connSignalServer">
          连接
        </button>
        <button id="leave" :disabled="!isLeaved" @click="leave">离开</button>
      </div>
      <div>
        <label>BandWidth：</label>
        <select @change="changeBandWith" id="sname" :disabled="changeBw">
          <option value="unlimited">unlimited</option>
          <option value="2000">2000</option>
          <option value="1000">1000</option>
          <option value="500">500</option>
          <option value="10">10</option>
          Kbps
        </select>
        <input id="shareDesk" type="checkbox" v-model="isShareDesk" /><label
          for="shareDesk"
          >分享屏幕</label
        >
        <br />
        <span>先点击离开在重新选择房间号</span><br />
        <input
          type="text"
          :disabled="isLeaved"
          v-model="roomid"
          style="
            max-width: 130px;
            line-height: 30px;
            font-size: 20px;
            text-align: center;
          "
        />
      </div>

      <div id="preview">
        <div>
          <h2>Remote:</h2>
          <video class="video" id="remotevideo" autoplay playsinline></video>
          <h2 style="display: none">Answer SDP:</h2>
          <textarea
            id="answer"
            style="display: none"
            :value="answer"
          ></textarea>
        </div>
        <div>
          <h2>Local:</h2>
          <!-- <video
            id="localvideo"
            playsinline
            muted
          ></video> -->
          <div class="box1">
            <video id="video" width="400" height="300"  playsinline loop></video>
          </div>
          <h2 style="display: none">Offer SDP:</h2>
          <textarea id="offer" style="display: none" :value="offer"></textarea>
        </div>
      </div>
      <div>
        <form id="fileInfo">
          <input
            :disabled="isChat"
            @change="handleFileInputChange"
            type="file"
            id="fileInput"
            name="files"
          />
        </form>
        <button :disabled="isChat" id="sendFile" @click="sendFile">Send</button>
        <button :disabled="isChat" id="abortButton" @click="about">
          Abort
        </button>
      </div>

      <div class="progress">
        <div class="label">Send progress:</div>
        <progress id="sendProgress" max="0" value="0"></progress>
      </div>

      <div class="progress">
        <div class="label">Receive progress:</div>
        <progress id="receiveProgress" max="0" value="0"></progress>
      </div>

      <div id="bitrate"></div>
      <a id="download"></a>
      <span id="status"></span>
      <div class="preview">
        <div class="grape-container" id="bitrateGraph">
          <div>Bitrate</div>
          <canvas id="bitrateCanvas"></canvas>
        </div>
        <div class="grape-container" id="packetGraph">
          <div>Packets sent pet second</div>
          <canvas id="packetCanvas"></canvas>
        </div>
      </div>
      <div>
        <h2>Chat:</h2>
        <textarea disabled id="chat" v-model="allMess"> </textarea>
        <textarea :disabled="isChat" id="sendtext" v-model="myMess"> </textarea>
        <button :disabled="isChat" @click="sendtext">发送</button>
      </div>
    </div>
    <!-- <div class="box1">
            <video id="video" width="400" height="300" playsinline loop></video>
            <canvas id="canvas" width="400" height="300"></canvas>
          </div> -->
  </div>
</template>


  
<script>
import {
  TimelineDataSeries,
  TimelineGraphView,
} from "../assets/js/third_party/graph";
import "../assets/css/main.css";
// import * as faceapi from "face-api.js";
import clm from "clmtrackr";

export default {
  name: "MyIndex",
  data() {
    return {
      //人脸检测
      video: "",
      canvas: "",
      ctx: "",
      ctracker: "",
      // 画图
      lastReult: null,
      bitrateGraph: null,
      bitrateSeries: null,
      packetGraph: null,
      packetSeries: null,
      // 发送消息
      allMess: "",
      myMess: "",
      dc: null,
      isChat: true,
      // 发送文件
      fileName: null,
      fileSize: null,
      fileType: null,
      lastModifyTime: 0,
      receiveBuffer: [],
      receivedSize: 0,
      isFile: false,
      fileReader: null,
      changeBw: true,
      remoteStream: null,
      localStream: null,
      offer: "",
      answer: "",
      isLeaved: false,
      isShareDesk: false,
      pcConfig: {
        iceServers: [
          {
            urls: "turn:101.69.255.131:3478",
            credential: "cyf123",
            username: "cyf",
          },
        ],
      },
      localvideo: null,
      remoteVideo: null,
      pc: null,
      a: null,
      roomid: null,
      socket: null,
      state: "init",
      offerdesc: null,
      constraints: {},
      count: 0,
      count1: 0,
      lastReult1: null,
    };
  },
  mounted() {
    this.$axios.get('http://101.69.255.131:9000/slogin').then(res=>{
      console.log(res.data);
    })
    this.localvideo = document.getElementById("localvideo");
    this.video = document.getElementById("video");
  },
  created() {
    const bitrateDiv = document.querySelector("div#bitrate");
    const fileInput = document.querySelector("input#fileInput");

    const statusMessage = document.querySelector("span#status");
    const downloadAnchor = document.querySelector("a#download");

    const sendProgress = document.querySelector("progress#sendProgress");
    const receiveProgress = document.querySelector("progress#receiveProgress");

    const btnSendFile = document.querySelector("button#sendFile");
    const btnAbort = document.querySelector("button#abortButton");
    this.roomid = this.$route.params.roomId;

    if (!this.roomid) {
      alert("未输入房间号");
      this.$router.push("/login");
    }
  },

  methods: {
    initVideo() {
      this.video = document.getElementById("video");
      //       this.canvas = document.getElementById('canvas');
      //       console.log(this.video)
      //       console.log(this.canvas)
      //       this.ctx = canvas.getContext('2d');   //参数 contextID 指定了您想要在画布上绘制的类型。当前唯一的合法值是 "2d"
      //       var width = video.width;
      //       var height = video.height;
      //       this.canvas.width = width;
      //       this.canvas.height = height;
    },
    //如果返回的是false说明当前操作系统是手机端，如果返回的是true则说明当前的操作系统是电脑端
    IsPC() {
      var userAgentInfo = navigator.userAgent;
      var Agents = [
        "Android",
        "iPhone",
        "SymbianOS",
        "Windows Phone",
        "iPad",
        "iPod",
      ];
      var flag = true;

      for (var v = 0; v < Agents.length; v++) {
        if (userAgentInfo.indexOf(Agents[v]) > 0) {
          flag = false;
          break;
        }
      }
      return flag;
    },

    //如果返回true 则说明是Android  false是ios
    is_android() {
      var u = navigator.userAgent,
        app = navigator.appVersion;
      var isAndroid = u.indexOf("Android") > -1 || u.indexOf("Linux") > -1; //g
      var isIOS = !!u.match(/\(i[^;]+;( U;)? CPU.+Mac OS X/); //ios终端
      if (isAndroid) {
        //这个是安卓操作系统
        return true;
      }

      if (isIOS) {
        //这个是ios操作系统
        return false;
      }
    },
    //发送消息
    sendMessage(roomid, data) {
      console.log("send message to other end", roomid, data);
      if (!this.socket) {
        console.log("socket is null");
      }
      this.socket.emit("message", roomid, data);
    },
    //接收消息
    receivemsg(event) {
      // console.log(this.isFile);
      // console.log(typeof(event.data));
      if (typeof event.data === "object") {
        const bitrateDiv = document.querySelector("div#bitrate");
        const fileInput = document.querySelector("input#fileInput");
        const statusMessage = document.querySelector("span#status");
        const downloadAnchor = document.querySelector("a#download");
        const sendProgress = document.querySelector("progress#sendProgress");
        const receiveProgress = document.querySelector(
          "progress#receiveProgress"
        );
        const btnSendFile = document.querySelector("button#sendFile");
        const btnAbort = document.querySelector("button#abortButton");
        console.log(`Received Message ${event.data.byteLength}`);
        this.receiveBuffer.push(event.data);
        this.receivedSize += event.data.byteLength;
        console.log(this.receivedSize, this.fileSize);
        receiveProgress.value = this.receivedSize;

        if (this.receivedSize === this.fileSize) {
          var received = new Blob(this.receiveBuffer);
          this.receiveBuffer = [];

          downloadAnchor.href = URL.createObjectURL(received);
          downloadAnchor.download = this.fileName;
          downloadAnchor.textContent = `Click to download '${this.fileName}' (${this.fileSize} bytes)`;
          downloadAnchor.style.display = "block";
        }
      } else {
        var msg = event.data;
        if (msg) {
          this.allMess += "-->" + msg + "\r\n";
        } else {
          console.error("received msg is null");
        }
      }
    },
    //获取信道状态
    dataChannerStateChange() {
      var state = this.dc.readyState;
      if (state === "open") {
        this.isChat = false;
      } else {
        this.isChat = true;
      }
    },
    //socket连接与设置监听动作 不同动作的逻辑
    conn() {
      this.bitrateSeries = new TimelineDataSeries();
      this.bitrateGraph = new TimelineGraphView(
        "bitrateGraph",
        "bitrateCanvas"
      );
      // this.bitrateGraph.updateEndDate();
      this.packetSeries = new TimelineDataSeries();
      this.packetGraph = new TimelineGraphView("packetGraph", "packetCanvas");
      this.packetGraph.updateEndDate;
      window.setInterval(() => {
        if (this.pc) {
          // sender 视频或一百平
          if (this.isShareDesk) {
            var sender = this.pc.getSenders()[0];
          } else {
            var sender = this.pc.getSenders()[1];
          }
          if (!sender) {
            return;
          }
          // console.log(sender.getStats());
          sender
            .getStats()
            .then((reports) => {
              this.getState(reports).then(() => {
                this.lastReult = reports;
                this.lastReult1 = reports;
              });
            })
            .catch((err) => {
              console.log(err);
            });
        }
      });
      this.socket = this.$socketIO(this.socketApi);
      // alert(this.socket);
      this.socket.on("joined", (roomid, id) => {
        console.log("receive joined message!", roomid, id);
        this.state = "joined";
        //如果是多人的话，第一个人不该在这里创建peerConnection
        //都等到收到一个otherjoin时再创建
        //所以，在这个消息里应该带当前房间的用户数
        //
        //create conn and bind media track
        this.createPeerConnection();
        this.bindTracks();
        this.isLeaved = true;
        // btnConn.disabled = true;
        // btnLeave.disabled = false;
        console.log("receive joined message, state=", this.state);
      });

      this.socket.on("otherjoin", (roomid) => {
        console.log("receive joined message:", roomid, this.state);

        //如果是多人的话，每上来一个人都要创建一个新的 peerConnection
        //
        if (this.state === "joined_unbind") {
          this.createPeerConnection();
          this.bindTracks();
        }
        this.dc = this.pc.createDataChannel("chat");
        this.dc.onmessage = this.receivemsg;
        this.dc.onopen = this.dataChannerStateChange;
        this.dc.onclose = this.dataChannerStateChange;
        this.state = "joined_conn";
        this.call();

        console.log("receive other_join message, state=", this.state);
      });

      this.socket.on("full", (roomid, id) => {
        console.log("receive full message", roomid, id);
        this.hangup();
        this.closeLocalMedia();
        this.state = "leaved";
        console.log("receive full message, state=", this.state);
        alert("the room is full!");
      });

      this.socket.on("leaved", (roomid, id) => {
        console.log("receive leaved message", roomid, id);
        this.state = "leaved";
        this.socket.disconnect();
        console.log("receive leaved message, state=", this.state);
        this.isLeaved = false;
      });

      this.socket.on("bye", (roomid, id) => {
        console.log("receive bye message", roomid, id);
        //state = 'created';
        //当是多人通话时，应该带上当前房间的用户数
        //如果当前房间用户不小于 2, 则不用修改状态
        //并且，关闭的应该是对应用户的peerconnection
        //在客户端应该维护一张peerconnection表，它是
        //一个key:value的格式，key=userid, value=peerconnection
        this.state = "joined_unbind";
        this.hangup();
        this.offer = "";
        this.answer = "";
        console.log("receive bye message, state=", this.state);
      });

      this.socket.on("disconnect", (socket) => {
        console.log("receive disconnect message!", this.roomid);
        if (!(this.state === "leaved")) {
          this.hangup();
          this.closeLocalMedia();
        }
        this.state = "leaved";
      });

      this.socket.on("message", (roomid, data) => {
        console.log("receive message!", roomid, data);

        if (data === null || data === undefined) {
          console.error("the message is invalid!");
          return;
        }

        if (data.hasOwnProperty("type") && data.type === "offer") {
          this.offer = data.sdp;
          this.pc.setRemoteDescription(new RTCSessionDescription(data));
          //create answer
          this.pc
            .createAnswer()
            .then(this.getAnswer)
            .catch(this.handleAnswerError);
        } else if (data.hasOwnProperty("type") && data.type == "answer") {
          this.changeBw = false;
          this.answer = data.sdp;
          this.pc.setRemoteDescription(new RTCSessionDescription(data));
        } else if (data.hasOwnProperty("type") && data.type === "candidate") {
          var candidate = new RTCIceCandidate({
            sdpMLineIndex: data.label,
            candidate: data.candidate,
          });
          this.pc.addIceCandidate(candidate);
        } else if (data.hasOwnProperty("type") && data.type === "fileinfo") {
          const receiveProgress = document.querySelector(
            "progress#receiveProgress"
          );

          this.fileName = data.name;
          this.fileType = data.filetype;
          this.fileSize = data.size;
          this.lastModifyTime = data.lastModify;
          receiveProgress.max = this.fileSize;
        } else {
          console.log("the message is invalid!", data);
        }
      });

      // roomid = getQueryVariable('room');
      // this.roomid = a.slice(7);
      this.socket.emit("join", this.roomid);

      return true;
    },
    //开启本地视频
    connSignalServer() {
      this.start();
      return true;
    },
    //异步哦获取视音频的信息
    getState(reports) {
      return new Promise((resolve, reject) => {
        reports.forEach((report) => {
          // console.log(report);

          if (report.type === "transport") {
            this.count1++;
            if (this.count1 === 100) {
              var curTs = report.timestamp;
              var bytes = report.bytesSent;
              var byter = report.bytesReceived;
              this.count1 = 0;
              if (this.lastReult1 && this.lastReult1.has(report.id)) {
                // console.log(this.lastReult1.get(report.id));
                var bitrate =
                  (1000 *
                    (8 * (bytes - this.lastReult1.get(report.id).bytesSent))) /
                  (curTs - this.lastReult1.get(report.id).timestamp);
                var re =
                  (1000 *
                    (8 *
                      (byter - this.lastReult1.get(report.id).bytesReceived))) /
                  (curTs - this.lastReult1.get(report.id).timestamp);
                // console.log("发送" + bitrate);
                // console.log("接收" + re);
              } else {
                this.lastReult = reports;
                this.lastReult1 = reports;
              }
            }
          }
          if (report.type === "outbound-rtp") {
            // 远端
            // console.log(report.framesPerSecond);
            this.count++;
            if (report.isRemote) {
              return;
            }
            if (this.count === 100) {
              // console.log(this.count);
              this.count = 0;
              var curTs = report.timestamp;
              var bytes = report.bytesSent;
              var packets = report.packetsSent;
              if (this.lastReult && this.lastReult.has(report.id)) {
                // console.log(this.lastReult.get(report.id));
                var bitrate =
                  (1000 *
                    (8 * (bytes - this.lastReult.get(report.id).bytesSent))) /
                  (curTs - this.lastReult.get(report.id).timestamp);
                // console.log(bitrate);
                this.bitrateSeries.addPoint(curTs, bitrate);
                this.bitrateGraph.setDataSeries([this.bitrateSeries]);
                this.bitrateGraph.updateEndDate();
                // console.log(bytes - this.lastReult.get(report.id).bytesSent);
                this.packetSeries.addPoint(
                  curTs,
                  packets - this.lastReult.get(report.id).packetsSent
                );
                this.packetGraph.setDataSeries([this.packetSeries]);
                this.packetGraph.updateEndDate();
                resolve("ok");
              } else {
                this.lastReult = reports;
              }
            }
          }
        });
      });
    },
    // 获取视频流
    getMediaStream(stream) {
      // this.localVideo = document.getElementById("localvideo");
      if (this.localStream) {
        stream.getAudioTracks().forEach((track) => {
          this.localStream.addTrack(track);
          stream.removeTrack(track);
        });
      } else {
        // window.stream = stream; // 使流对浏览器控制台可用
        // this.localvideo.srcObject = stream;
        this.localStream = stream;
        this.video.srcObject = stream;
        video.play();
        // const _this = this
        if (!this.isShareDesk) {
          var ctracker = new clm.tracker();
          this.ctracker = ctracker;
          this.ctracker.init();
          this.ctracker.start(this.video);
          function positionLoop() {
            requestAnimationFrame(() => {});
            setTimeout(() => {
              // requestAnimationFrame(positionLoop);
              positionLoop();
            }, 3000);
            var positions = ctracker.getCurrentPosition();
            if (positions) {
              console.log("检测到了");
            } else {
              console.log("未响应");
            }
          }
          positionLoop();
        }

        // console.log('ctrackr');
        // console.log(ctracker);
      }

      //这个函数的位置特别重要，
      //一定要放到getMediaStream之后再调用
      //否则就会出现绑定失败的情况
      //
      //setup connection
      this.conn();

      //btnStart.disabled = true;
      //btnCall.disabled = true;
      //btnHangup.disabled = true;
    },
    // 获取桌面视频流
    getDeskStream(stream) {
      // console.log(stream);
      // this.video = document.getElementById("video");
      // console.log(this.video);
      // this.video.srcObject = stream;
      // this.localStream = stream;
      //自己添加
      this.getMediaStream(stream);
    },
    handleError(err) {
      console.error("Failed to get Media Stream!", err);
    },
    // 是否共享卓
    shareDesk() {
      if (this.IsPC()) {
        console.log("ispc");
        navigator.mediaDevices
          .getDisplayMedia({ video: true })
          .then(this.getDeskStream)
          .catch(this.handleError);
        return true;
      } else {
        alert("不是电脑不可以共享");
      }
    },
    // 开始本地视频
    start() {
      setTimeout(() => {
        this.constraints = {
            video: false,
            // audio:false,
            audio: {
              echoCancellation: true,
              noiseSuppression: true,
              autoGainControl: true,
            },
          };
          navigator.mediaDevices
            .getUserMedia(this.constraints)
            .then(this.getMediaStream)
            .catch(this.handleError);
            console.log(123);
      }, 2000);
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        console.error("the getUserMedia is not supported!");
        return;
      } else {
        if (this.isShareDesk) {
          this.shareDesk();
          // this.constraints = {
          //   video: false,
          //   audio: {
          //     echoCancellation: true,
          //     noiseSuppression: true,
          //     autoGainControl: true,
          //   },
          // };
        } else {
          const support = navigator.mediaDevices.getSupportedConstraints();
          // console.log(support);
          this.constraints = {
            video: {
              frameRate: { min: 15, ideal: 30, max: 60 },
              width: { min: 640, ideal: 1280 },
              height: { min: 480, ideal: 720 },
            },
            // audio:false,
            audio: {
              echoCancellation: true,
              noiseSuppression: true,
              autoGainControl: true,
            },
          };
          navigator.mediaDevices
            .getUserMedia(this.constraints)
            .then(this.getMediaStream)
            .catch(this.handleError);
        }
      }
    },
    // 获取远程视频
    getRemoteStream(e) {
      console.log(e);
      // this.remoteStream = e.streams[0];
      this.remoteVideo = document.getElementById("remotevideo");
      this.remoteVideo.srcObject = e.streams[0];

      // remoteVideo.srcObject = e.streams[0];
    },
    handleOfferError(err) {
      console.error("Failed to create offer:", err);
    },
    handleAnswerError(err) {
      console.error("Failed to create answer:", err);
    },
    getAnswer(desc) {
      this.pc.setLocalDescription(desc);
      this.answer = desc.sdp;
      this.changeBw = false;
      //send answer sdp
      this.sendMessage(this.roomid, desc);
    },
    getOffer(desc) {
      // console.log(desc);
      this.pc.setLocalDescription(desc);
      this.offer = desc.sdp;
      this.offerdesc = desc;
      //send offer sdp
      this.sendMessage(this.roomid, this.offerdesc);
    },
    // 创建连接
    createPeerConnection() {
      //如果是多人的话，在这里要创建一个新的连接.
      //新创建好的要放到一个map表中。
      //key=userid, value=peerconnection
      console.log("create RTCPeerConnection!");
      if (!this.pc) {
        this.pc = new RTCPeerConnection(this.pcConfig);
        this.pc.onicecandidate = (e) => {
          // console.log(e);
          if (e.candidate) {
            console.log("find an new candidate,", e.candidate);
            this.sendMessage(this.roomid, {
              type: "candidate",
              label: event.candidate.sdpMLineIndex,
              id: event.candidate.sdpMid,
              candidate: event.candidate.candidate,
            });
          } else {
            console.log("this is the end candidate");
          }
        };
        this.pc.ondatachannel = (e) => {
          if (!this.df) {
            this.dc = e.channel;
            this.dc.onmessage = this.receivemsg;
            this.dc.onopen = this.dataChannerStateChange;
            this.dc.onclose = this.dataChannerStateChange;
          }
        };
        this.pc.ontrack = this.getRemoteStream;
      } else {
        console.warning("the pc have be created!");
      }

      return;
    },

    //绑定永远与 peerconnection在一起，
    //所以没必要再单独做成一个函数

    bindTracks() {
      console.log("bind tracks into RTCPeerConnection!");

      if (this.pc === null || this.pc === undefined) {
        console.error("pc is null or undefined!");
        return;
      }

      if (this.localStream === null || this.localStream === undefined) {
        console.error("localstream is null or undefined!");
        return;
      }

      //add all track into peer connection
      this.localStream.getTracks().forEach((track) => {
        this.pc.addTrack(track, this.localStream);
      });
    },
    // 打电话
    call() {
      if (this.state === "joined_conn") {
        var offerOptions = {
          offerToRecieveAudio: 1,
          offerToRecieveVideo: 1,
        };

        this.pc
          .createOffer(offerOptions)
          .then(this.getOffer)
          .catch(this.handleOfferError);
      }
    },
    hangup() {
      if (this.pc) {
        this.offerdesc = null;
        this.pc.close();
        this.pc = null;
      }
    },
    closeLocalMedia() {
      if (this.localStream && this.localStream.getTracks()) {
        this.localStream.getTracks().forEach((track) => {
          track.stop();
        });
      }
      this.localStream = null;
    },
    leave() {
      if (this.socket) {
        this.socket.emit("leave", this.roomid); //notify server
      }
      this.hangup();
      this.closeLocalMedia();
      this.offer = "";
      this.answer = "";
      this.isLeaved = false;
      document.getElementById("sname").value = "unlimited";
      this.changeBw = true;
    },
    // 设置带宽
    changeBandWith(e) {
      var senders = this.pc.getSenders();
      var vsender = null;
      var bw = e.target.value;
      senders.forEach((sender) => {
        console.log(sender);
        if (sender && sender.track !== null && sender.track.kind === "video") {
          vsender = sender;
        }
      });
      var parameters = vsender.getParameters();
      if (!parameters.encodings) {
        return;
      }
      if (bw === "unlimited") {
        return;
      }
      console.log(parameters);
      parameters.encodings[0].maxBitrate = bw * 1000;
      vsender
        .setParameters(parameters)
        .then(() => {
          console.log("success to set parameters!");
        })
        .catch((err) => {
          console.log(err);
        });
    },
    // 发送消息
    sendtext() {
      if (this.myMess) {
        this.dc.send(this.myMess);
      }
      this.allMess += "<--" + this.myMess + "\r\n";
      this.myMess = "";
    },
    // 发送文件
    sendFile() {
      this.isFile = true;
      console.log(this.isFile);
      const bitrateDiv = document.querySelector("div#bitrate");
      const fileInput = document.querySelector("input#fileInput");
      const statusMessage = document.querySelector("span#status");
      const downloadAnchor = document.querySelector("a#download");
      const sendProgress = document.querySelector("progress#sendProgress");
      const receiveProgress = document.querySelector(
        "progress#receiveProgress"
      );
      var offset = 0;
      var chunkSize = 16384;
      var file = fileInput.files[0];
      console.log(
        `File is ${[file.name, file.size, file.type, file.lastModified].join(
          " "
        )}`
      );

      // Handle 0 size files.
      statusMessage.textContent = "";
      downloadAnchor.textContent = "";
      if (file.size === 0) {
        bitrateDiv.innerHTML = "";
        statusMessage.textContent =
          "File is empty, please select a non-empty file";
        return;
      }

      sendProgress.max = file.size;

      this.fileReader = new FileReader();
      this.fileReader.onerror = (error) =>
        console.error("Error reading file:", error);
      this.fileReader.onabort = (event) =>
        console.log("File reading aborted:", event);
      this.fileReader.onload = (e) => {
        console.log("FileRead.onload ", e);
        // console.log(e.target.result);
        this.dc.send(e.target.result);
        offset += e.target.result.byteLength;
        sendProgress.value = offset;
        if (offset < file.size) {
          readSlice(offset);
        }
      };

      var readSlice = (o) => {
        console.log("readSlice ", o);
        const slice = file.slice(offset, o + chunkSize);
        this.fileReader.readAsArrayBuffer(slice);
      };

      readSlice(0);
    },
    about() {
      console.log("ok");
    },
    handleFileInputChange() {
      const bitrateDiv = document.querySelector("div#bitrate");
      const fileInput = document.querySelector("input#fileInput");

      const statusMessage = document.querySelector("span#status");
      const downloadAnchor = document.querySelector("a#download");

      const sendProgress = document.querySelector("progress#sendProgress");
      const receiveProgress = document.querySelector(
        "progress#receiveProgress"
      );

      const btnSendFile = document.querySelector("button#sendFile");
      const btnAbort = document.querySelector("button#abortButton");
      var file = fileInput.files[0];
      if (!file) {
        console.log("No file chosen");
      } else {
        this.fileName = file.name;
        this.fileSize = file.size;
        this.fileType = file.type;
        this.lastModifyTime = file.lastModified;
        this.sendMessage(this.roomid, {
          type: "fileinfo",
          name: file.name,
          size: file.size,
          filetype: file.type,
          lastmodify: file.lastModified,
        });

        // btnSendFile.disabled = false;
        sendProgress.value = 0;
        receiveProgress.value = 0;

        this.receiveBuffer = [];
        this.receivedSize = 0;
      }
    },
  },
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
.box1 {
  position: relative;
  width: 50%;
  flex: 4;
}
</style>
