import Vue from 'vue';
const IOTA = require('iota.lib.js');

import './assets/styles/main.scss';

import Messaging from './src/messaging.service.js'

import nav       from './src/components/nav.vue';
import chat      from './src/components/chat.vue';
import chatbox   from './src/components/chatbox.vue';
import sidebar   from './src/components/sidebar.vue';

const data = {
  store: {
    status:     'insert your seed or generate one (not secure)',
    iota:       undefined,
    messaging:  undefined,
    channels:   undefined,
    current:    undefined,
    account: {
      seed:     undefined,
    },
    isSending:  false,
    reset:      undefined
  },
}

const app = new Vue({
  el: '#app',
  data,
  components: {
    'im-nav':     nav,
    'im-sidebar': sidebar,
    'im-chat':    chat,
    'im-chatbox': chatbox,
  },
  created: function() {
    console.debug('#app created');

    // for latter logging out
    this.store.reset = data;

    // TODO IOTA Service
    this.store.iota = new IOTA({
      provider: 'http://nodes.iota.fm:80',
    });
    this.store.iota.api.getNodeInfo((error, info) => {
      if (error) console.error('instanciating IOTA', error);
      else {
        console.debug('node info:', info);
      }
    });

    // TODO where to move this ?
    const seed = localStorage.getItem('seed');
    if (seed) {
      console.debug('got seed from previous session: ', seed);
      this.store.account.seed = seed;
    }

  },
  watch: {
    'store.account.seed': async function(current, previous) {
      if (!!current) {
        console.debug('inserted new seed');
        this.store.status = "opening account...";
        this.store.messaging = new Messaging(this.store);
      }
    },
    'store.current': function (current) {
      console.debug('changing current', current);
      this.store.current.messages = this.store.channels[this.store.current.mode][this.store.current.id].messages;
    }
  }
});
