const app = new Vue({
  el: '#app',
  data: {
    iota: {},
    node: {},
    account: {
      seed: localStorage.getItem('seed') || undefined,
    },
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
    generateSeed: function() {
      seed = '';
      rdmArray = new Uint32Array(1);
      createdChars = 0;
      while (createdChars < 81) {
        window.crypto.getRandomValues(rdmArray);
        rdmArray[0] = (rdmArray[0] % 33) + 57;
        if ((rdmArray[0] >= 65 && rdmArray[0] <= 90) || rdmArray[0] == 57) {
          seed += String.fromCharCode(rdmArray[0]);
          createdChars += 1;
        }
      }
      this.account = {
        seed,
      };
      localStorage.setItem('seed', seed);
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

