<template>
  <div id="sidebar">

    <div id="channels">
      <h3>channels</h3>
      <div v-if="!store.channels || !store.messaging">
        No channels yet
      </div>
      <div v-else v-for="mode in modes">
        <div v-if="modeHasChannels(mode)">
          <h4>{{ mode }}</h4>
          <div v-if="mode === 'private'">
            <a href=# class="channel" v-on:click="selectChannel('private', 0)">
              [0] {{store.channels[mode][0].name}}
            </a>
          </div>
          <div v-for="(message, index) in store.messaging.data.messages">
            <a
              href=# class="channel"
              v-if="message.type === 'channel' && message.mode === mode"
              v-on:click="selectChannel(mode, index)"
            >
              [ {{ index }} ] {{message.index}}
            </a>
          </div>
        </div>
      </div>
    </div>

    <div id="create-channel">
      <button
        v-for="mode in modes"
        v-on:click="createChannel(mode)">
        create {{ mode }} channel
      </button>
      <button v-on:click="fetchAll()" disabled>
        fetch all channels
      </button>
      <br>
      <button v-on:click="test()" disabled>test</button>
    </div>

    <div id="status">
      {{ store.status }}
    </div>

  </div>
</template>

<script>
import Vue from 'vue';
export default Vue.extend({
  props: ['store'],
  data: function() { return {
    modes: ['private', 'restricted', 'public'],
  } },
  methods: {
    selectChannel: async function(mode, index) {
      console.debug(`selected ${mode} channel ${index}`);
      const channelID = { mode, index };
      this.store.status   = "loading channel...";
      if (!this.store.channels[mode][index]) {
        const channel = await this.store.messaging.initChannel(channelID);
        this.store.messaging.storeChannel(channelID, channel);
      }
      this.store.status   = "OK";      
      this.store.current = channelID;
    },
    createChannel: async function(mode) { try {
      let sidekey = null;
      if (mode === 'restricted')
        sidekey = prompt('Please insert a passphrase to restrict your channel');
      this.store.status = `creating ${mode} channel...`
      const channel = await this.store.messaging.createChannel(mode, sidekey);
      const index = this.store.messaging.data.messages.slice(-1)[0].index;
      this.store.status = `OK`
    } catch (e) { console.error(e) } },
    test: function() {
      console.log(this.store.channels.public);
      console.log(Object.keys(this.store.channels.public))
    },
    modeHasChannels: function(mode) {
      let hasChannels = false;
      this.store.messaging.data.messages.forEach(message => {
        if (message.mode === mode && message.type === 'channel') {
          hasChannels = true;
        }
      });
      return hasChannels;
    }
  },
  mounted: function() {
  },
});
</script>

<style lang="scss">

#sidebar {
  background: linear-gradient(210deg,#22b1ab,#18817c);
  position: fixed;
  top: 100px;
  bottom: 0;
  left: 0;
  width: 210px;
  padding: 20px !important;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  align-items: flex-start;
}

#sidebar #channels {
  flex-grow: 1;
}

#sidebar .channel {
  display: block;
}

#sidebar #status {
  margin-top: 20px;
}

</style>
