const Mam = require('mam.client');

class Messaging {

  constructor(store) {
    console.debug('building Messaging object');
    this.vue = store.vue;
    this.store = this.vue.store;
    /*
    this.store.channels = {
      public:       {},
      private:      {},
      restricted:   {}
    };
    */
    this.data = this.initThread(0, 'private')
      .then(this.fetchThreads.bind(this))
      .catch(e => console.error(e));
  }

  fetchThreads() {
    this.store.status = 'loading channels...';
    const data = this.store.channels.private['0'].messages;
    console.debug('data channel', data);
    const threads = data.filter(message => message.type === 'thread');
    this.loadThreads(threads)
      // .then(() => this.store.status = 'OK');
  }

  async loadThreads(references) { try {
    references.map(async function(reference) {
      const thread = await this.initThread(
        reference.id, reference.mode, reference.sidekey
      );
      console.debug(`loaded ${reference.mode} channel ${reference.id}`);
      /*
      this.store.vue.$set(
        this.store.channels[reference.mode],
        reference.id,
        thread
      );
      */
    }.bind(this))
  } catch(e) { console.error(e) } }

  async addData(data) { try {
    await this.send(data, 0, 'private', 0);
  } catch(e) { console.error(e) } }

  async send(packet, value, mode, id) { try {
    console.debug(
      `sending message in ${mode} channel ${id} with value ${value}`,
      packet
    );
    const data    = this.store.iota.utils.toTrytes(JSON.stringify(packet));
    const message = Mam.create(this.store.channels[mode][id].state, data);

    console.debug('attaching...')
    this.store.channels[mode][id].state = message.state;
    await Mam.attach(message.payload, message.address);
    console.debug('sent.');

    return message.root;
  } catch(e) { console.error(e) } }

  async createThread(mode, sidekey) { try {
    const name = prompt('enter a name for this channel');
    const id   = this.generateID(mode);
    console.log(`creating ${mode} channel ${name} with id ${id}`);
    await this.initThread(id, mode, sidekey);
    this.addData({ type: 'thread', mode, sidekey, id, name });
  } catch(e) { console.error(e) } }

  getThread(id, mode) {
    return this.store.channels[mode][id];
  }

  generateID(mode) {
    const max = 999999;
    let id;
    do {
      id = Math.floor(Math.random() * (max - 1))
    } while (this.store.channels[mode][id]);
    return id;
  }

  async initThread(id, mode, sidekey) { try {

    // init MAM object to the right mode and pkey
    console.debug(`${mode} channel ${id} init`);
    let state = Mam.init(
      this.store.iota,
      await this.deriveAddress(this.store.account.seed, id)
    );
    if (mode !== 'public')
      state = Mam.changeMode(state, mode, sidekey);

    // fetch history
    console.debug(`fetching ${mode} channel ${id}...`)
    const thread = await Mam.fetch(Mam.getRoot(state), mode, sidekey);
    console.debug('done fetching');
    // convert from trytes to bytes
    thread.messages = thread.messages.map(message => this.extractMessage(message));
    // set message sending index to current thread length
    state.channel.start = thread.messages.length;
    // include mam state in thread
    thread.state = state;

    // store thread
    this.store.channels[mode][id] = thread;
    // modeList[id] = thread;

    // this.store.vue.$set(this.store.channels, mode, modeList);
    // console.log(this.store.channels[mode][id]);
    // this.store.vue.$set(this.store.channels[mode][id], 'messages', thread.messages);

    /*
    this.store.channels[mode] = Object.assign(
      {},
      this.store.channels[mode],
      JSON.parse(JSON.stringify(modeList))
    );
    */

    console.log('inserted thread', this.store.channels[mode][id]);
    console.debug(`${mode} channel ${id} length: `, state.channel.start);

    // start listening
    // TODO ZMQ
    /*
    Mam.fetch(Mam.getRoot(state), mode, sidekey, function(data) {
      console.log(`received message on ${mode} channel ${id}: `, message);
      this.store.channels[mode][id].messages.push(this.extractMessage(message));
    });
    */

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
