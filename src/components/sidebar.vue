<template>
  <div id="sidebar">

    <div id="contacts">
      {{ store.account.status }}
    </div>

  </div>
</template>

<script>
import Vue from 'vue';
export default Vue.extend({
  props: ['store']
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
