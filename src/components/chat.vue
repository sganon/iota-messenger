<template>
  <div id="chat">

    <div id="chat-nav">
      <div v-if="store.current">
        {{ store.current.mode }} channel {{ store.channels[store.current.mode][store.current.id].name }}
        {{ store.channels[store.current.mode][store.current.id].loading ? 'loading...' : '' }}
        <button v-on:click="invite(store.current.mode)" v-if="store.current.mode !== 'private'">
          invite
        </button>
      </div>
    </div>

    <div v-if="store.current">

      <div v-for="message in store.channels[store.current.mode][store.current.id].messages">

        <div v-if="message.type === 'message'">
          - {{ message.text }}
        </div>

        <div v-else-if="message.type === 'join'">
          - {{ checksum(message.root) }} joined
        </div>

        <!-- only for data -->
        <div v-else-if="message.type === 'channel'">
          - saved {{ message.mode }} channel "{{ message.name }}"
            ({{ message.index || message.address }})
            {{ message.sidekey ? `and pass "${message.sidekey}"` : '' }}
        </div>

        <div v-else>
          - {{ JSON.stringify(message) }}
        </div>

      </div>
    </div>

    <div v-else>
      select a conversation
    </div>

  </div>
</template>

<script>
import Vue from 'vue';
export default Vue.extend({
  props: ['store'],
  data: function() { return {
    messages: [],
  }},
  methods: {
    invite: function(mode) {
      const id = this.store.current.id;
      prompt(
        `To invite someone to this ${mode} channel, copy this root to your clipboard:`,
        this.store.channels[mode][id].root
      );
      const root = prompt(`now paste the participant's root:`);
      this.store.messaging.invite(this.store.current, root);
    },
    checksum: function(root) {
      return this.store.messaging.getChecksum(root);
    }
  }
});
</script>

<style lang="scss">

#chat {
  background-color: #c8c8c8;
  position: fixed;
  top: 100px;
  right: 0;
  bottom: 70px;
  left: 250px;
  padding: 70px 20px 20px 20px;
}

#chat-nav {
  position: absolute;
  top: 0;
  right: 0;
  left: 0;
  height: 50px;
  background-color: #666;
}

</style>
