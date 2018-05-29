<template>
  <div id="contacts" v-if="account.seed">
    (contacts)
  </div>
  
  <div v-else>
    Insert IOTA seed to see your contacts
  </div>
</template>

<script>
</script>

<style>

#sidebar {
  background-color: #c1c1c1;
  position: fixed;
  top: 100px;
  bottom: 0;
  left: 0;
  width: 250px;
}

</style>
