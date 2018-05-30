import Vue from 'vue';
import IOTA = require('iota.lib.js');
import Mam  = require('./node_modules/mam.client/lib/mam.client');

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
      mam:     {
        state: undefined,
        master: 'SQJJAKMXKKCNRHTFXEPTSNHTCUOOOGBTOYODSFFLDONDDPALIJDNLIWJCTFOARL9LSMJXBJNQJLPPNBAE'
      },
      node:    {},
      account: {
        status: 'insert your seed or generate one (not secure)',
        seed: undefined
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
        console.log('node info:', success);
        this.store.node = success;
      }
    });

    const seed = localStorage.getItem('seed');
    if (seed) {
      this.store.account.seed = seed;
    }

  },
  methods: {
    publish: async function(packet) {
      const trytes = this.store.iota.utils.toTrytes(JSON.stringify(packet));
      const message = Mam.create(this.store.mam.state, trytes);
      this.store.mam.state = message.state;
      await Mam.attach(message.payload, message.address);
      return message.root;
    },
    logMessage: function(message) {
      console.log('message trytes:', message);
      console.log(JSON.parse(this.store.iota.utils.fromTrytes(message)));
    }
  },
  watch: {
    'store.account.seed': async function(current, previous) {
      if (!!current) {
        this.store.account.status = 'initializing...';
        this.store.mam.state = Mam.init(
          this.store.iota,
          this.store.account.seed,
          /* security (2) */
        );
        console.log('mam state:', this.store.mam.state);
        const channels = this.store.mam.state.channel.count;
        this.store.account.status = `
          Found ${channels} channel${channels === 1 ? '' : 's'}
        `;
        const root1 = await this.publish('caca');
        console.log('root1:', root1);
        const root2 = await this.publish('test2');
        console.log('root2:', root2);
        Mam.fetch(root1, 'public', null, this.logMessage);
      }
    },
    'store.mam.state': function() {
      console.log('mam state update:', this.store.mam.state);
    }
  }
});
