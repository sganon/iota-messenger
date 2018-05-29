import Vue from 'vue';

import IOTA = require('iota.lib.js');
import MAM  = require('mam.client.js');
import Mam  = require('./node_modules/mam.client/lib/mam.web');
console.log(Mam);

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
        seed: localStorage.getItem('seed') || undefined
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
        console.log(success);
        this.store.node = success;
      }
    });

  },
  watch: {
    'store.account.seed': function(current, previous) {
      if (!!current) {
        this.store.account.status = 'initializing...';
        console.log(Mam);
        this.store.mam.state = Mam.init(
          this.store.iota,
          this.store.account.seed
          /* security (2) */
        );
        console.log(this.store.mam);
      }
    }
  }
});
