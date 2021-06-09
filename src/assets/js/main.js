// 'use strict'

// var localVideo = document.querySelector('video#localvideo');
// var remoteVideo = document.querySelector('video#remotevideo');

// var btnConn =  document.querySelector('button#connserver');
// var btnLeave = document.querySelector('button#leave');

// var localStream = null;
// var remoteStream = null;

// var roomid = '111111';
// var socket = null;

// var state = 'init';
// var pc = null;

// function sendMessage(rommid,data){
//   console.log('send p2p message',rommid,data);
//   if(socket){
//     socket.emit('message',rommid,data);
//   }
// }

// function getAnswer(desc){
//   pc.setLocalDescription(desc);
//   sendMessage(roomid,desc)
// }
// function handleAnswerError(err){
//   console.error('Failed to get answer,',err);
// }

// function handleOfferError(err){
//   console.error('Failed to create offer',err);
// }

// function getOffer(desc){
//   pc.setLocalDescription(desc);
//   sendMessage(roomid,desc)
// }

// function call(){
//   if(state==='joined_conn'){
//     if(pc){
//       var options = {
//         offerToReceiveAudio:1,
//         offerToReceiveVideo:1,
//       }
//       pc.createOffer(options)
//       .then(getOffer).catch(handleOfferError)
//     }
//   }
// }

// function connSignalServer(){
	
// 	//开启本地视频
// 	start();
// 	return true;
// }
// function conn(){
//   socket = io.connect();
//   socket.on('joined',(roomid,id)=>{
//     console.log('receive joined message,',roomid,id);
//     state = 'joined';
//     createPeerConnection();
//     btnConn.disabled = true;
//     btnLeave.disabled = false;
//     console.log('receive joined message,state=',state);

//   });
//   socket.on('otherjoin',(roomid,id)=>{
//     console.log('receive otherjoin message,',roomid,id);
//     if(state === 'jioned_unbind'){
//       createPeerConnection()
//     }
//     state = 'joined_conn';
//     // 媒体协商
//     // 
//     console.log('receive otherjoin message,state=',state);
//   });
//   socket.on('full',(roomid,id)=>{
//     console.log('receive full message,',roomid,id);
//     state = 'leaved';socket.disconnect();
//     console.log('receive full message,state=',state);
//     socket.disconnect();
//     alert('the room is full')
//     btnConn.disabled = false;
//     btnLeave.disabled = true;
//   });
//   socket.on('leaved',(roomid,id)=>{
//     console.log('receive leaved message,',roomid,id);
//     state = 'leaved';
//     console.log('receive leaved message,state=',state);
//     socket.disconnect();
//     btnConn.disabled = false;
//     btnLeave.disabled = true;

//   });
//   socket.on('bye',(roomid,id)=>{
//     console.log('receive bye message,',roomid,id);
//     state = 'joined_unbind';
//     closePeerConnection();
//     console.log('receive bye message,state=',state);
//   });
//   socket.on('message',(roomid,data)=>{
//     console.log('receive bye message,',roomid,data);
//     // 媒体协商
//     if(data){
//       if(data.type === 'offer'){
//         pc.setRemoteDescription(new RTCSessionDescription(desc));
//         pc.createAnswer().then(getAnswer).catch(handleAnswerError)
//       }else if(data.type === 'anwser'){
//         pc.setRemoteDescription(new RTCSessionDescription(desc));
//       }else if(data.type === 'candidate'){
//         var candidate = new RTCIceCandidate({
//           sdpMLineIndex:date.label,
//           candidate:data.candidate
//         })
//         pc.addIceCandidate(candidate)
//       }else{
//         console.error('the message is invalid',data)
//       }
//     }
//   });
//   // 房间号111111 写死的
//   socket.emit('join','111111');
//   return;
// }
// function getMediaStream(stream){

// 	if(localStream){
// 		stream.getAudioTracks().forEach((track)=>{
// 			localStream.addTrack(track);	
// 			stream.removeTrack(track);
// 		});
// 	}else{
// 		localStream = stream;	
// 	}

// 	localVideo.srcObject = localStream;

// 	//这个函数的位置特别重要，
// 	//一定要放到getMediaStream之后再调用
// 	//否则就会出现绑定失败的情况
// 	//
// 	//setup connection
// 	conn();

// 	//btnStart.disabled = true;
// 	//btnCall.disabled = true;
// 	//btnHangup.disabled = true;
// }
// function handleError(err){
// 	console.error('Failed to get Media Stream!', err);
// }
// function start(){

// 	if(!navigator.mediaDevices ||
// 		!navigator.mediaDevices.getUserMedia){
// 		console.error('the getUserMedia is not supported!');
// 		return;
// 	}else {

// 		var constraints;

// 		// if( shareDeskBox.checked && shareDesk()){

// 		// 	constraints = {
// 		// 		video: false,
// 		// 		audio:  {
// 		// 			echoCancellation: true,
// 		// 			noiseSuppression: true,
// 		// 			autoGainControl: true
// 		// 		}
// 		// 	}

// 		// }else{
// 		// 	constraints = {
// 		// 		video: true,
// 		// 		audio:  {
// 		// 			echoCancellation: true,
// 		// 			noiseSuppression: true,
// 		// 			autoGainControl: true
// 		// 		}
// 		// 	}
//     // }
//     	constraints = {
// 				video: true,
// 				audio:  {
// 					echoCancellation: true,
// 					noiseSuppression: true,
// 					autoGainControl: true
// 				}
// 			}

// 		navigator.mediaDevices.getUserMedia(constraints)
// 					.then(getMediaStream)
// 					.catch(handleError);
// 	}

// }
// function closeLocalMedia(){

// 	if(localStream && localStream.getTracks()){
// 		localStream.getTracks().forEach((track)=>{
// 			track.stop();
// 		});
// 	}
// 	localStream = null;
// }
// function leave(){
//   if(socket){
//     socket.emit('leave','111111');
//   }
//   // 
//   closePeerConnection();
//   closeLocalMedia();
//   btnConn.disabled = false;
//   btnLeave.disabled = true;
// }
// function getRemoteStream(e){
// 	remoteStream = e.streams[0];
// 	remoteVideo.srcObject = e.streams[0];
// }
// function createPeerConnection(){
//   console.log('creae RtcPeerconnection');
//   if(!pc){
//     var pcConfig = {
//       'iceServers':[{
//         'urls':'turn:stun.cyfrtc.cn:3478',
//         'credential': "cyf",
//         'username': "cyf"
//       }]
//     }
//     pc = new RTCPeerConnection(pcConfig);
//     pc.onicecandidate = (e) => {
//       console.log('xx');
//       if(e.candidate){
//         console.log('find an new candidate,',e.candidate);
//         sendMessage(roomid,{
//           type:'candidate',
//           label:e.candidate.sdpMLineIndex,
//           id:e.candidate.sdpMid,
//           candidate:e.candidate.candidate
//         });
//       }
//     }
//     pc.ontrack = (e) => {
//       console.log('xxx');
//       remoteVideo.srcObject = e.streams[0];

//       // remoteVideo.srcObject = e.streams[0];
//     }
//     return;
//   }
//   if(localStream){
//     localStream.getTracks().forEach((track) => {
//       pc.addTrack(track);
//     })
//   }
// }
// function closePeerConnection(){
//   console.log('close RTCPeerConnection');
//   if(pc){
//     pc.close();
//     pc=null;
//   }
// }
// btnConn.onclick = connSignalServer
// btnLeave.onclick = leave;
'use strict'

var localVideo = document.querySelector('video#localvideo');
var remoteVideo = document.querySelector('video#remotevideo');

var btnConn =  document.querySelector('button#connserver');
var btnLeave = document.querySelector('button#leave');

var offer = document.querySelector('textarea#offer');
var answer = document.querySelector('textarea#answer');

var shareDeskBox  = document.querySelector('input#shareDesk');

var pcConfig = {
  'iceServers': [{
    'urls': 'turn:101.69.255.131:3478',
    'credential': "cyf123",
    'username': "cyf"
  }]
};

var localStream = null;
var remoteStream = null;

var pc = null;
var a = location.search.substr(1);

var roomid;
var socket = null;

var offerdesc = null;
var state = 'init';

// 以下代码是从网上找的
//=========================================================================================

//如果返回的是false说明当前操作系统是手机端，如果返回的是true则说明当前的操作系统是电脑端
function IsPC() {
	var userAgentInfo = navigator.userAgent;
	var Agents = ["Android", "iPhone","SymbianOS", "Windows Phone","iPad", "iPod"];
	var flag = true;

	for (var v = 0; v < Agents.length; v++) {
		if (userAgentInfo.indexOf(Agents[v]) > 0) {
			flag = false;
			break;
		}
	}
	return flag;
}

//如果返回true 则说明是Android  false是ios
function is_android() {
	var u = navigator.userAgent, app = navigator.appVersion;
	var isAndroid = u.indexOf('Android') > -1 || u.indexOf('Linux') > -1; //g
	var isIOS = !!u.match(/\(i[^;]+;( U;)? CPU.+Mac OS X/); //ios终端
	if (isAndroid) {
		//这个是安卓操作系统
		return true;
	}

	if (isIOS) {
      　　//这个是ios操作系统
     　　 return false;
	}
}

//获取url参数
function getQueryVariable(variable)
{
       var query = window.location.search.substring(1);
       var vars = query.split("&");
       for (var i=0;i<vars.length;i++) {
               var pair = vars[i].split("=");
               if(pair[0] == variable){return pair[1];}
       }
       return(false);
}

//=======================================================================

function sendMessage(roomid, data){

	console.log('send message to other end', roomid, data);
	if(!socket){
		console.log('socket is null');
	}
	socket.emit('message', roomid, data);
}

function conn(){

	socket = io.connect();

	socket.on('joined', (roomid, id) => {
		console.log('receive joined message!', roomid, id);
		state = 'joined'

		//如果是多人的话，第一个人不该在这里创建peerConnection
		//都等到收到一个otherjoin时再创建
		//所以，在这个消息里应该带当前房间的用户数
		//
		//create conn and bind media track
		createPeerConnection();
		bindTracks();

		btnConn.disabled = true;
		btnLeave.disabled = false;
		console.log('receive joined message, state=', state);
	});

	socket.on('otherjoin', (roomid) => {
		console.log('receive joined message:', roomid, state);

		//如果是多人的话，每上来一个人都要创建一个新的 peerConnection
		//
		if(state === 'joined_unbind'){
			createPeerConnection();
			bindTracks();
		}

		state = 'joined_conn';
		call();

		console.log('receive other_join message, state=', state);
	});

	socket.on('full', (roomid, id) => {
		console.log('receive full message', roomid, id);
		hangup();
		closeLocalMedia();
		state = 'leaved';
		console.log('receive full message, state=', state);
		alert('the room is full!');
	});

	socket.on('leaved', (roomid, id) => {
		console.log('receive leaved message', roomid, id);
		state='leaved'
		socket.disconnect();
		console.log('receive leaved message, state=', state);

		btnConn.disabled = false;
		btnLeave.disabled = true;
	});

	socket.on('bye', (room, id) => {
		console.log('receive bye message', roomid, id);
		//state = 'created';
		//当是多人通话时，应该带上当前房间的用户数
		//如果当前房间用户不小于 2, 则不用修改状态
		//并且，关闭的应该是对应用户的peerconnection
		//在客户端应该维护一张peerconnection表，它是
		//一个key:value的格式，key=userid, value=peerconnection
		state = 'joined_unbind';
		hangup();
		offer.value = '';
		answer.value = '';
		console.log('receive bye message, state=', state);
	});

	socket.on('disconnect', (socket) => {
		console.log('receive disconnect message!', roomid);
		if(!(state === 'leaved')){
			hangup();
			closeLocalMedia();

		}
		state = 'leaved';
	
	});

	socket.on('message', (roomid, data) => {
		console.log('receive message!', roomid, data);

		if(data === null || data === undefined){
			console.error('the message is invalid!');
			return;	
		}

		if(data.hasOwnProperty('type') && data.type === 'offer') {
			
			offer.value = data.sdp;

			pc.setRemoteDescription(new RTCSessionDescription(data));

			//create answer
			pc.createAnswer()
				.then(getAnswer)
				.catch(handleAnswerError);

		}else if(data.hasOwnProperty('type') && data.type == 'answer'){
			answer.value = data.sdp;
			pc.setRemoteDescription(new RTCSessionDescription(data));
		
		}else if (data.hasOwnProperty('type') && data.type === 'candidate'){
			var candidate = new RTCIceCandidate({
				sdpMLineIndex: data.label,
				candidate: data.candidate
			});
			pc.addIceCandidate(candidate);	
		
		}else{
			console.log('the message is invalid!', data);
		
		}
	
	});


	// roomid = getQueryVariable('room');
	roomid = a.slice(7);
	socket.emit('join', roomid);

	return true;
}

function connSignalServer(){
	
	//开启本地视频
	start();

	return true;
}

function getMediaStream(stream){

	if(localStream){
		stream.getAudioTracks().forEach((track)=>{
			localStream.addTrack(track);	
			stream.removeTrack(track);
		});
	}else{
		localStream = stream;	
	}

	localVideo.srcObject = localStream;

	//这个函数的位置特别重要，
	//一定要放到getMediaStream之后再调用
	//否则就会出现绑定失败的情况
	//
	//setup connection
	conn();

	//btnStart.disabled = true;
	//btnCall.disabled = true;
	//btnHangup.disabled = true;
}

function getDeskStream(stream){
	localStream = stream;
	//自己添加
	getMediaStream(stream)
}

function handleError(err){
	console.error('Failed to get Media Stream!', err);
}

function shareDesk(){

	if(IsPC()){
		console.log("ispc");
		navigator.mediaDevices.getDisplayMedia({video: true})
			.then(getDeskStream)
			.catch(handleError);
		return true;
	}

	return false;

}

function start(){

	if(!navigator.mediaDevices ||
		!navigator.mediaDevices.getUserMedia){
		console.error('the getUserMedia is not supported!');
		return;
	}else {

		var constraints;

		if( shareDeskBox.checked && shareDesk()){

			constraints = {
				video: false,
				audio:  {
					echoCancellation: true,
					noiseSuppression: true,
					autoGainControl: true
				}
			}

		}else{
			constraints = {
				video: true,
				audio:  {
					echoCancellation: true,
					noiseSuppression: true,
					autoGainControl: true
				}
			}
			navigator.mediaDevices.getUserMedia(constraints)
					.then(getMediaStream)
					.catch(handleError);
		}

		
	}

}

function getRemoteStream(e){
	console.log('streams',e.streams);
	remoteStream = e.streams[0];
	remoteVideo.srcObject = e.streams[0];
}

function handleOfferError(err){
	console.error('Failed to create offer:', err);
}

function handleAnswerError(err){
	console.error('Failed to create answer:', err);
}

function getAnswer(desc){
	pc.setLocalDescription(desc);
	answer.value = desc.sdp;

	//send answer sdp
	sendMessage(roomid, desc);
}

function getOffer(desc){
	pc.setLocalDescription(desc);
	offer.value = desc.sdp;
	offerdesc = desc;

	//send offer sdp
	sendMessage(roomid, offerdesc);	

}

function createPeerConnection(){

	//如果是多人的话，在这里要创建一个新的连接.
	//新创建好的要放到一个map表中。
	//key=userid, value=peerconnection
	console.log('create RTCPeerConnection!');
	if(!pc){
		pc = new RTCPeerConnection(pcConfig);

		pc.onicecandidate = (e)=>{

			if(e.candidate) {
        console.log('find an new candidate,',e.candidate);
				sendMessage(roomid, {
					type: 'candidate',
					label:event.candidate.sdpMLineIndex, 
					id:event.candidate.sdpMid, 
					candidate: event.candidate.candidate
				});
			}else{
				console.log('this is the end candidate');
			}
		}

		pc.ontrack = getRemoteStream;
	}else {
		console.warning('the pc have be created!');
	}

	return;	
}

//绑定永远与 peerconnection在一起，
//所以没必要再单独做成一个函数
function bindTracks(){

	console.log('bind tracks into RTCPeerConnection!');

	if( pc === null || pc === undefined) {
		console.error('pc is null or undefined!');
		return;
	}

	if(localStream === null || localStream === undefined) {
		console.error('localstream is null or undefined!');
		return;
	}

	//add all track into peer connection
	localStream.getTracks().forEach((track)=>{
		pc.addTrack(track, localStream);	
	});

}

function call(){
	
	if(state === 'joined_conn'){

		var offerOptions = {
			offerToRecieveAudio: 1,
			offerToRecieveVideo: 1
		}

		pc.createOffer(offerOptions)
			.then(getOffer)
			.catch(handleOfferError);
	}
}

function hangup(){

	if(pc) {

		offerdesc = null;
		
		pc.close();
		pc = null;
	}

}

function closeLocalMedia(){

	if(localStream && localStream.getTracks()){
		localStream.getTracks().forEach((track)=>{
			track.stop();
		});
	}
	localStream = null;
}

function leave() {

	if(socket){
		socket.emit('leave', roomid); //notify server
	}

	hangup();
	closeLocalMedia();

	offer.value = '';
	answer.value = '';
	btnConn.disabled = false;
	btnLeave.disabled = true;
}

btnConn.onclick = connSignalServer
btnLeave.onclick = leave;
