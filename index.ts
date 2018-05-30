import Vue from 'vue';
import IOTA = require('iota.lib.js');
import Mam  = require('mam.client.js');

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
    }
  }
}

import './assets/styles/main.scss';

const app = new Vue({
  el: '#app',
  data: {
    store: {
      iota:    {},
      mam:     {},
      node:    {},
      account: {
        status: 'insert your seed or generate one (not secure)',
        seed: undefined
      },
      message: {},
    }
  },
  components: {
    'im-nav':     nav,
    'im-sidebar': sidebar,
    'im-chat':    chat,
    'im-chatbox': chatbox
  },
  created: function() {

    this.store.iota = new IOTA({
      provider: 'http://nodes.iota.fm:80',
    });

    this.store.iota.api.getNodeInfo((error, success) => {
      if (error) {
        alert(error);
      } else {
        console.log('node info:', success);
        this.store.node = success;
      }
    });

    const seed = localStorage.getItem('seed');
    if (seed) {
      this.store.account.seed = seed;
    }

  },
  watch: {
    'store.account.seed': function(current, previous) {
      if (!!current) {
        this.store.account.status = 'initializing...';
        this.store.mam.state = Mam.init(
          this.store.iota,
          this.store.account.seed,
          /* security (2) */
        );
        console.log(this.store.mam.state);
        const channels = this.store.mam.state.channel.count;
        this.store.account.status = `
          Found ${channels} channel${channels === 1 ? '' : 's'}
        `;
      }
    }
  }
});
