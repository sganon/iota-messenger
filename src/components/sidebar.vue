<template>
  <div id="sidebar">

    <div id="contacts">
      {{ store.account.status }}

      <div v-for="(thread, index) in store.mam.history">
        <a v-on:click="selectThread(index)" href=#>
          channel {{ index }}
        </a>
      </div>

    </div>

  </div>
</template>

<script>
import Vue from 'vue';
export default Vue.extend({
  props: ['store'],
  methods: {
    selectThread: function(index) {
      console.log(index);
      this.store.selectedThread = this.store.mam.history[index];
    }
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
