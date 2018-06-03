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


    </div>

  </div>
</template>

<script>
import Vue from 'vue';
export default Vue.extend({
  props: ['store'],
  methods: {
    selectThread: function(mode, id) {
      console.debug(`selected ${mode} channel ${id}`);
      this.store.current = { mode, id };
    }
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
  width: 250px;
}

</style>
