<template>
  <div>
    <h2>请输入密码和房间号</h2>
    房间号<input required v-model="roomId" placeholder="房间号"/>  <br />
    密码<input  v-model="pass" type="password" placeholder="密码"/>  <br />
    <button @click="login">确定</button>
  </div>
</template>

<script>
export default {
  name: "Login",
  data() {
    return {
      pass: "",
      roomId: "1",
    };
  },
  methods: {
    login() {
      if(this.checkchinese&&this.pass==="52xx"){
        this.$router.push({
          name: 'MyIndex',
            params: {
            roomId: this.roomId
          }
        })
      }else{
        alert('密码错误！')
      }
    },
    checkchinese() {
			var reg = /[^\x00-\x80]/;
			if (reg.test(roomId)) {
				alert("房间号不可以为汉字!");
				document.getElementById("roomid").focus();
				document.getElementById("roomid").value = "";
				return false;
			}else if(this.roomId.trim===''){
        alert("房间号不能为空!");
				return false;
      }
		}
  },
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
</style>
