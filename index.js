import Vue from 'vue';
const IOTA = require('iota.lib.js');

// import './assets/styles/main.scss';

import Messaging from './src/messaging.service.js'

import nav       from './src/components/nav.vue';
import chat      from './src/components/chat.vue';
import chatbox   from './src/components/chatbox.vue';
import sidebar   from './src/components/sidebar.vue';

const data = {
  store: {
    vue:          undefined,
    status:       'insert your seed or generate one (not secure)',
    iota:         undefined,
    messaging:    undefined,
    channels: {
      private:    {},
      restricted: {},
      public:     {}
    },
    current:      undefined,
    account: {
      seed:       undefined,
    },
    isSending:    false,
    reset:        undefined
  },
}

const iotaInit = function(store) {
  return new Promise ((resolve, reject) => {
    store.iota = new IOTA({
      provider: 'http://nodes.iota.fm:80',
    });
    store.iota.api.getNodeInfo((error, info) => {
      if (error) reject(error);
      else {
        console.info(info);
        resolve(info);
      }
    });
  })
}

const app = new Vue({
  el: '#app',
  // data: function() { return data },
  data,
  components: {
    'im-nav':     nav,
    'im-sidebar': sidebar,
    'im-chat':    chat,
    'im-chatbox': chatbox,
  },
  created: async function() {
    console.debug('#app created');

    // for latter logging out
    this.store.reset = data;
    this.store.vue = this;

    // TODO IOTA Service
    await iotaInit(this.store);

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
    'store.channels': {
      handler: (current) => console.log('channels', current),
      deep: true
    },
    'store.channels.public': (current) => console.log('channels.public', current),
    'store.channels.private': (current) => console.log('channels.private', current),
    /*
    'store.current': function (current) {
      console.debug('changing current', current);
      console.log(this.store.channels)
      console.log(this.store.channels[current.mode][current.id])
      this.store.current.messages = this.store.channels[current.mode][current.id].messages;
    }
    */
  }
});
