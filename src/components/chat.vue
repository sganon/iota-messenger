<template>
  <div id="chat">

    <div v-if="store.current">
      <div v-for="message in store.channels[store.current.mode][store.current.index].messages">

        <div v-if="message.text">
          - {{ message.text }}
        </div>

        <div v-else-if="message.type === 'channel'">
          - saved {{ message.mode }} channel "{{ message.name }}" ({{ message.index }})
            {{ message.sidekey ? `and pass "${message.sidekey}"` : '' }}
        </div>

        <div v-else>
          - {{ JSON.stringify(message) }}
        </div>

      </div>
    </div>

    <div v-else>
      select a conversation
    </div>

  </div>
</template>

<script>
import Vue from 'vue';
export default Vue.extend({
  props: ['store'],
  data: function() { return {
    messages: [],
  }},
  methods: {

  }
});
</script>

<style lang="scss">

#chat {
  background-color: #c8c8c8;
  position: fixed;
  top: 100px;
  right: 0;
  bottom: 70px;
  left: 250px;
  padding: 20px;
}

</style>
