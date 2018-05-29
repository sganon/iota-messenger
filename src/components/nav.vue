<template>
  <div id="nav">
    <div id="logo">
      IOTA-Messenger
    </div>
    
    <div id="menu">
      <button v-if="!store.account.seed" v-on:click="insertSeed()">
        Insert seed
      </button>
      <div v-else>{{ store.account.seed }}</div>
    </div>
    
    <div id="iota-version">
      iota version: {{ store.node.appVersion }}
    </div>
  </div>
</template>

<script>
import Vue from 'vue';
export default Vue.extend({
  props: ['store'],
  methods: {
    insertSeed: function() {
      this.store.account = {
        seed: prompt('Please insert yout IOTA seed to log in'),
      };
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
