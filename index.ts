import Vue from 'vue';
import IOTA = require('iota.lib.js');

import nav     from './src/components/nav.vue';
import chat    from './src/components/chat.vue';
import chatbox from './src/components/chatbox.vue';
import sidebar from './src/components/sidebar.vue';

declare module 'vue/types/vue' {
  interface Vue {
    store: {
      iota:   IOTA;
      node:   any;
      message: {
        type: string;
      };
    };
  }
}

import './assets/styles/main.scss';

const app = new Vue({
  el: '#app',
  data: {
    store: {
      iota:    {},
      node:    {},
      account: {
        seed: localStorage.getItem('seed') || undefined,
      },
      message: {},
    },
  },
  components: {
    'im-nav':     nav,
    'im-sidebar': sidebar,
    'im-chat':    chat,
    'im-chatbox': chatbox,
  },
  created: function() {
    this.store.iota = new IOTA({
      provider: 'http://nodes.iota.fm:80',
    });

    this.store.iota.api.getNodeInfo((error, success) => {
      if (error) {
        alert(error);
      } else {
        console.log(success);
        this.store.node = success;
      }
    });

  },
});
