<template>
  <div id="chatbox">
    <textarea id="message" :disabled="!store.selectedThread.length || store.mam.sending"></textarea>
    <div id="send">
      <button v-on:click="sendPayment()" disabled>
        Send Payment
      </button>
      <button v-on:click="sendMessage()" :disabled="!store.selectedThread.length || store.mam.sending">
        Send message
      </button>
    </div>
  </div>
</template>

<script>
import Vue from 'vue';
export default Vue.extend({
  props: ['store'],
  methods: {
    sendMessage: async function() {
      this.store.mam.sending = true;
      this.store.account.status = `sending message...`;

      const value = document.querySelector('#message').value;
      console.log(`send message: ${value}`);

      // create message
      const trytes = this.store.iota.utils.toTrytes(value);
      const message = this.store.mam.instance.create(this.store.mam.state, trytes);
      this.store.mam.state = message.state;

      // wait for push and fetch
      await this.store.mam.instance.attach(message.payload, message.address);
      const history = await this.store.mam.instance.fetch(this.store.mam.root, 'public');

      document.querySelector('#message').value = '';
      this.store.account.status = `OK`;
      this.store.mam.sending = false

      this.store.mam.history = [ history.messages ];
      this.store.selectedThread = this.store.mam.history[0];

      return message.root;
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
