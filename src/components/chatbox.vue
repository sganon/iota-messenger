<template>
  <div id="chatbox">

    <textarea
      id="message"
      :disabled="!store.current || store.isSending">
    </textarea>

    <div id="send">
      <button
        v-on:click="sendPayment()"
        disabled>
        Send Payment
      </button>

      <button
        v-on:click="sendMessage()"
        :disabled="!store.current || store.isSending">
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
      if (this.store.isSending) return ;
      this.store.isSending = true;
      this.store.status = `sending message...`;

      const mode  = this.store.current.mode;
      const index = this.store.current.index;
      const input = document.querySelector('#message');
      console.log(`sending message to ${mode} channel ${index}:`, input.value);

      // TODO iota value
      const packet  = { type: 'message', text: input.value, value: 0 };
      await this.store.messaging.send(
        packet, 0, this.store.current
      );

      // reinit for next message
      input.value          = '';
      this.store.status    = 'OK';
      this.store.isSending = false
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
