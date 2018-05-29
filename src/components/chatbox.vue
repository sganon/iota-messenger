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
