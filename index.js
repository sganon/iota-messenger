const app = new Vue({
  el: '#app',
  data: {
    message: 'vue app loaded'
  }
});

console.log('test');

const iota = new IOTA({
  provider: 'http://nodes.iota.fm:80'
});

iota.api.getNodeInfo((error, success) => {
  if (error) {
    console.log(error);
  } else {
    console.log(success);
  }
})
