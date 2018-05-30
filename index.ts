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
        sending: false,
        state: undefined,
        history: []
      },
      node:    {},
      account: {
        status: 'insert your seed or generate one (not secure)',
        seed: undefined
      },
      selectedThread: []
    },
  },
  components: {
    'im-nav':     nav,
    'im-sidebar': sidebar,
    'im-chat':    chat,
    'im-chatbox': chatbox,
  },
  created: function() {

    this.store.mam.instance = Mam;

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
  /*
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
  */
  watch: {
    'store.account.seed': async function(current, previous) {
      if (!!current) {
        this.store.account.status = 'initializing...';

        const callback = async (err, derived) => {
          if (!err) {

            this.store.mam.state = Mam.init(
              this.store.iota,
              derived,
              /* security (2) */
            );

            const channels = this.store.mam.state.channel.count;
            this.store.account.status = `
              loading ${channels} channel${channels === 1 ? '' : 's'}...
            `;

            const root = Mam.getRoot(this.store.mam.state);
            this.store.mam.root = root;
            const history = await Mam.fetch(root, 'public');
            console.log('history:', history);
            this.store.mam.state.channel.start = history.messages.length;
            this.store.mam.history = [ history.messages ];
            this.store.account.status = `OK`;
          }
        };

        const derived = this.store.iota.api.getNewAddress(
          this.store.account.seed,
          { index: 0 },
          callback
        );

      }
    }
  }
});
