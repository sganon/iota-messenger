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
      this.store.isSending = true;
      this.store.status = `sending message...`;

      const mode  = this.store.current.mode;
      const id    = this.store.current.id;
      const input = document.querySelector('#message');
      console.log(`sending message to ${mode} channel ${id}:`, input.value);

      // TODO value

      const packet  = { text: input.value };
      const message = this.store.messaging.send(packet, 0, mode, id);

      // reinit for next message
      input.value          = '';
      this.store.status    = `OK`;
      this.store.isSending = false

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
  background-color: #FFF;
  position: fixed;
  right: 0;
  bottom: 0;
  left: 250px;
  height: 70px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-right: 1em;
  padding-left: 1em;
}

#message {
  margin-right: 1rem;
  flex-grow: 2;
}

#send {
  display: flex;
  flex-direction: column;
}

</style>
