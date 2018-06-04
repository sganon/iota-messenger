<template>
  <div id="sidebar">

    <div id="channels">
      <h3>channels</h3>
      <div v-if="!store.channels || !store.messaging">
        No channels yet
      </div>
      <div v-else v-for="mode in modes">
        <div v-if="Object.keys(store.channels[mode]).length">

          <div class="mode-header">
            <h4>{{ mode }}</h4>
            <div class="controls">
              <button v-on:click="createChannel(mode)">
                create
              </button>
              <button
                v-if="mode !== 'private'"
                v-on:click="joinChannel(mode)">
                join
              </button>
            </div>
          </div>

          <a href=# class="channel"
            v-for="(channel, index) in store.channels[mode]"
            v-on:click="selectChannel(mode, index)">
            [ {{ index }} ] {{ channel.name }}
          </a>

        </div>
      </div>
    </div>

    <div id="create-channel">
      <div v-if="store.channels && Object.keys(store.channels[mode]).length === 0"
        v-for="mode in modes">
        <button v-on:click="createChannel(mode)">
          create {{ mode }} channel
        </button>
        <button v-on:click="joinChannel(mode)">
          join {{ mode }} channel
        </button>
      </div>
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
    selectChannel: function(mode, index) {
      console.debug(`selected ${mode} channel ${index}`);
      this.store.current = { mode, index };
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
    joinChannel: function(mode) {
      // TODO check root
      const root = prompt(`address of the ${mode} room:`);
      const pass = mode === 'restricted' ? prompt('password:') : null;
      this.store.messaging.subscribe(mode, root, pass);
    },
    test: function() {
      console.log(this.store.channels.public);
      console.log(Object.keys(this.store.channels.public))
    }
  },
  mounted: function() {
  }
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
  align-items: stretch;
}

#sidebar #channels {
  flex-grow: 1;
}

#sidebar .channel {
  display: block;
}

#sidebar .mode-header {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
}

#sideba

#sidebar #status {
  margin-top: 20px;
}

</style>
