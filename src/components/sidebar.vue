<template>
  <div id="sidebar">

    <div id="contacts">

      {{ store.status }}
      <br>

      <!-- <div v-for="(thread, index) in store.threads">
        <a v-on:click="selectThread(index)" href=#>
          channel {{ index }}
        </a>
      </div> -->

      <a v-if="store.account.seed" v-on:click="selectThread('private', 0)" href=#>
        Private channel 0 (data)
      </a>

      <button v-on:click="createThread('restricted')">
        create Restricted thread
      </button>
      <button v-on:click="createThread('public')">
        create Public thread
      </button>

      <br>
      channels
      <br>

      <div v-for="mode in modes">
        {{ mode }} channels :
        <br>
        <a href=#
          v-for="(thread, index) in store.channels[mode]"
          v-on:click="selectThread(mode, index)">
          {{ index }}
        </a>
      </div>

      <br>
      <button v-on:click="test()">test</button>

    </div>

  </div>
</template>

<script>
import Vue from 'vue';
export default Vue.extend({
  props: ['store'],
  data: () => { return { modes: ['private', 'public', 'restricted'] } },
  methods: {
    selectThread: function(mode, id) {
      console.debug(`selected ${mode} channel ${id}`);
      console.log('loggin selected thread', this.store.channels[mode][id])
      this.store.current = { mode, id };
    },
    createThread: function(mode) {
      let sidekey = null;
      if (mode === 'restricted') {
        sidekey = prompt('Please insert a passphrase to restrict your thread');
      }
      this.store.messaging.createThread(mode, sidekey);
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
  background-color: #c1c1c1;
  position: fixed;
  top: 100px;
  bottom: 0;
  left: 0;
  width: 250px;
}

</style>
