<template>
  <div id="nav">
    <div id="logo">
      IOTA-Messenger
    </div>

    <div id="menu">
      <div v-if="!store.account.seed">
        <button v-on:click="insertSeed()">
          Insert seed
        </button>
        <button v-on:click="generateSeed()">
          Generate seed
        </button>
      </div>
      <div id="seed" v-else>
        {{ store.account.seed }}
        <button v-on:click="logout()">logout</button>
      </div>
    </div>

    <!--
    <div id="iota-version">
      iota version: {{ store.node.appVersion }}
    </div>
    -->
  </div>
</template>

<script>
import Vue from 'vue';
export default Vue.extend({
  props: ['store'],
  methods: {
    insertSeed: function() {
      const seed = prompt('Please insert yout IOTA seed to log in');
      // TODO check seed
      this.store.account.seed = seed;
    },
    generateSeed: function() {
      let seed         = '';
      let rdmArray     = new Uint32Array(1);
      let createdChars = 0;

      while (createdChars < 81) {
        window.crypto.getRandomValues(rdmArray);
        rdmArray[0] = (rdmArray[0] % 33) + 57;
        if ((rdmArray[0] >= 65 && rdmArray[0] <= 90) || rdmArray[0] == 57) {
          seed += String.fromCharCode(rdmArray[0]);
          createdChars += 1;
        }
      }
      // TODO check seed
      this.store.account.seed = seed;
    },
    logout: function() {
      console.log('logging out');

      // post-logout data
      const status      = 'insert your seed or generate one (not secure)';
      const iota        = this.store.iota;
      const vue         = this.store.vue;

      // reset, restore
      this.store        = this.store.reset;
      this.store.vue    = vue;
      this.store.status = status;
      this.store.iota   = iota;

      // clean
      localStorage.removeItem('seed');
    }
  }
});
</script>

<style lang="scss">

#nav {
  background-color: #afafaf;
  position: fixed;
  top: 0;
  right: 0;
  left: 0;
  height: 100px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 20px 0 20px;
}

</style>
