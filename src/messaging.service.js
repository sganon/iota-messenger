const Mam = require('mam.client');

class Messaging {

  constructor(store) {
    console.debug('building Messaging object');
    this.store    = store;
    this.store.channels = {
      public:       {},
      private:      {},
      restricted:   {}
    };
    this.data = this.initThread(0, 'private');
    store.status = 'init OK';
  }

  async send(packet, value, mode, id) { try {
    console.debug(
      `sending message in ${mode} channel ${id} with value ${value}`,
      packet
    );
    const data    = this.store.iota.utils.toTrytes(JSON.stringify(packet));
    const message = Mam.create(this.store.channels[mode][id].state, data);

    this.store.channels[mode][id].state = message.state;
    await Mam.attach(message.payload, message.address);

    return message.root;
  } catch(e) { console.error(e) } }

  getThread(id, mode) {
    return this.store.channels[mode][id];
  }

  async initThread(id, mode, sidekey) { try {

    // init MAM object to the right mode and pkey
    console.debug(`${mode} channel ${id} init`);
    let state = Mam.init(
      this.store.iota,
      await this.deriveAddress(this.store.account.seed, id)
    );
    if (mode !== 'public')
      state = Mam.changeMode(state, 'private', sidekey);

    // fetch history
    const thread = await Mam.fetch(Mam.getRoot(state), mode, sidekey);
    // convert from trytes to bytes
    thread.messages = thread.messages.map(message => this.extractMessage(message));
    // set message sending index to current thread length
    state.channel.start = thread.messages.length;
    // include mam state in thread
    thread.state = state;
    // store thread
    this.store.channels[mode][id] = thread;
    console.debug(`${mode} channel ${id} length: `, state.channel.start);

    // start listening
    Mam.fetch(Mam.getRoot(state), mode, sidekey, function(data) {
      const message = this.store.iota.utils.fromTrytes(data);
      console.log(`received message on ${mode} channel ${id}: `, message);
      this.store.channels[mode][id].messages.push(this.extractMessage(message));
    });

    // return thread.messages.map(message => this.extractMessage(message));
  } catch(e) { console.error(e) } }

  extractMessage(trytes) {
    return JSON.parse(this.store.iota.utils.fromTrytes(trytes));
  }

  deriveAddress(seed, index) {
    console.debug('deriving seed: ', seed);
    return new Promise((resolve, reject) => {
      this.store.iota.api.getNewAddress(
        seed,
        { index },
        (error, derived) => {
          if (error) {
            console.error('deriving address', error);
            reject(error);
          } else {
            console.debug(`address ${index}: `, derived);
            resolve(derived);
          }
        }
      )
    });
  }

}

module.exports = Messaging;
