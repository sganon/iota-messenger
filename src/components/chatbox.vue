<template>
  <div id="chatbox">
    <textarea id="message"></textarea>
    <div id="send">
      <button v-on:click="sendPayment()">Send Payment</button>
      <button v-on:click="sendMessage()">Send message</button>
    </div>
  </div>
</template>

<script>
import Vue from 'vue';
export default Vue.extend({
  props: ['store'],
  methods: {
    sendMessage: function() {
      const msgBox = document.querySelector('#message');
      console.log(`send message: ${msgBox.value}`);
    },
    sendPayment: function() {
      const value = prompt('how much IOTA do you want to send ?');
      if (value >= this.store.account.balance) {
        console.log(`send ${value} IOTA`);
      } else {
        alert('insufficient balance');
      }
    }
  }
});
</script>

<style lang="scss">

#chatbox {
  background-color: #d8d8d8;
  position: fixed;
  right: 0;
  bottom: 0;
  left: 250px;
  height: 70px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

#message {
  flex-grow: 2;
}

#send {
  display: flex;
  flex-direction: column;
}

</style>
