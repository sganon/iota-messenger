<template>
  <div id="logo">
    IOTA-Messenger
  </div>
  
  <div id="menu">
    <button v-if="!account.seed" v-on:click="insertSeed()">
      Insert seed
    </button>
    <div v-else>{{ account.seed }}</div>
  </div>
  
  <div id="iota-version">
    iota version: {{ node.appVersion }}
  </div>
</template>

<script>
</script>

<style>

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
