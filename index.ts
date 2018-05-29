import Vue from 'vue';
import IOTA = require('iota.lib.js');

import nav from './src/components/nav.vue';
import chat from './src/components/chat.vue';
import chatbox from './src/components/chatbox.vue';
import sidebar from './src/components/sidebar.vue';

declare module 'vue/types/vue' {
  interface Vue {
    iota: IOTA;
    node: any;
    message: {
      type: string;
    };
  }
}

import './assets/styles/main.scss';

const app = new Vue({
  el: '#app',
  data: {
    iota: {},
    node: {},
    account: {},
    message: {},
  },
  components: {
    'im-nav': nav,
    'im-sidebar': sidebar,
    'im-chat': chat,
    'im-chatbox': chatbox
  },
  beforeCreate: function() {

    this.iota = new IOTA({
      provider: 'http://nodes.iota.fm:80',
    });

    this.iota.api.getNodeInfo((error, success) => {
      if (error) {
        alert(error);
      } else {
        this.node = success;
      }
    });
    
  },
  methods: {
    insertSeed: function() {
      this.account = {
        seed: prompt('Please insert yout IOTA seed to log in'),
      };
    },
    sendMessage: function() {
      const msgBox: HTMLInputElement = document.querySelector('#message');
      console.log(`send message: ${msgBox.value}`);
    },
    sendPayment: function() {
      const value = prompt('how much IOTA do you want to send ?');
      if (value >= this.account.balance) {
        console.log(`send ${value} IOTA`);
      } else {
        alert('insufficient balance');
      }
    },
  },
});
