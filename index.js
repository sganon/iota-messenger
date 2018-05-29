const app = new Vue({
  el: '#app',
  data: {
    iota: {},
    node: {},
    account: {},
    message: {}
  },
  beforeCreate: function() {
    
    this.iota = new IOTA({
      provider: 'http://nodes.iota.fm:80'
    });
    
    this.iota.api.getNodeInfo((error, success) => {
      if (error) {
        alert(error);
      } else {
        this.node = success;
      }
    });
    
    this.message = {
      type: 'message'
    }
    
  },
  methods: {
    insertSeed: function() {
      this.account = {
        seed: prompt('Please insert yout IOTA seed to log in')
      }
    },
    sendMessage: function() {
      const value = document.querySelector('#message').value;
      console.log(`send message: ${value}`);
    },
    sendPayment: function() {
      const value = prompt('how much IOTA do you want to send ?');
      if (value >= this.account.balance) {
        console.log(`send ${value} IOTA`);
      } else {
        alert('insufficient balance');
      }
    }
  }
});
