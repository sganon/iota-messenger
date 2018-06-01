const Mam = require('mam.client');
const zmq = require('zeromq').socket('sub');

class Messaging {

  constructor(iota, seed, set) {
    console.debug('building Messaging object');
    this.iota      = iota;
    this.seed      = seed;
    this.set       = set;
    this.channels  = {
      private:    {},
      restricted: {},
      public:     {}
    };
  }

  async init() { try {
    console.debug('initializing private data channel');
    this.dataID = { index: 0, mode: 'private', name: 'data' };
    this.data = await this._initChannel(this.dataID);
    this._storeChannel(this.dataID, this.data);
    return this.channels;
  } catch (e) { console.error(e) } }

  initZMQ() {
    const url = 'tcp://node.iota-tangle.io:5556';
    zmq.connect(url);

    zmq.subscribe('tx')  /* newly seen transactions */
    zmq.subscribe('sn')  /* newly confirmed transactions */
    zmq.subscribe('lmi') /* latest milestone index */

    zmq.on('message', msg => {
      const data = msg.toString().split(' ');
      switch (data[0]) {
        case 'tx':
          console.log('received tx', data);
        case 'sn':
          console.log('received sn', data);
        case 'lmi':
          console.log('received lmi', data);
      }
    });
  }

  async fetchChannels() { try {
    console.debug('data channel', this.data);

    const channelIDs = this.data.messages.filter(
      message => message.type === 'channel'
    );

    await Promise.all(channelIDs.map(async function(channelID) { try {
      console.debug(`loading ${channelID.mode} channel ${channelID.name}`);
      const channel = await this._initChannel(channelID);
      this._storeChannel(channelID, channel);
    } catch (e) { console.error(e) } }.bind(this)));

    return this.channels;
  } catch (e) { console.error(e) } }

  async createChannel(mode, sidekey) { try {
    const name  = prompt('enter a name for this channel');
    const index = this._generateID(mode);
    console.log(`creating ${mode} channel ${name} (${index})`);
    const channel = await this._initChannel({ index, mode, sidekey, name });
    this._addData({ type: 'channel', mode, sidekey, index, name });
    this._storeChannel({ mode, index, name }, channel);
    return channel;
  } catch(e) { console.error(e) } }

  async send(packet, value, id) { try {
    console.debug(
      `sending message in ${id.mode} channel ${id.name} with ${value} IOTA`,
      packet
    );
    console.time('mam-create-message');
    const data    = this.iota.utils.toTrytes(JSON.stringify(packet));
    const message = Mam.create(this.channels[id.mode][id.index].state, data);
    console.timeEnd('mam-create-message');

    console.time('mam-attaching');
    this.channels[id.mode][id.index].state = message.state;
    await Mam.attach(message.payload, message.address);
    console.timeEnd('mam-attaching');

    this._storeMessage(id, packet);
    return packet;
  } catch(e) { console.error(e) } }

  subscribe(mode, root, sidekey) {
    console.debug(`subscribing to ${mode} channel`, root);
  }

  /*
  _getThread(id, mode) {
    return this.channels[mode][id];
  }
  */

  _generateID(mode) {
    const max = 999999;
    let index;
    do {
      index = Math.floor(Math.random() * (max - 1))
    } while (this.channels[mode][index]);
    return index;
  }

  async _addData(data) { try {
    await this.send(data, 0, this.dataID);
  } catch (e) { console.error(e) } }

  async _initChannel(channelID) { try {
    console.debug(
      `${channelID.mode} channel ${channelID.name} (${channelID.index}) init`
    );
    let channel = { name: channelID.name };

    // init MAM object to the right address and mode
    const address = await this._deriveAddress(this.seed, channelID.index)
    channel.state = Mam.init(this.iota, address);
    if (channelID.mode !== 'public')
      channel.state = Mam.changeMode(
        channel.state,
        channelID.mode,
        channelID.sidekey
      );

    // fetch history
    console.time(`fetched-${channelID.mode}-${channelID.index}`);
    channel.root = Mam.getRoot(channel.state)
    channel = Object.assign(channel, await Mam.fetch(
      channel.root,
      channelID.mode,
      channelID.sidekey
    ));
    channel.messages = channel.messages.map(
      message => this._extractMessage(message)
    );
    // set message sending index to current thread length
    channel.state.channel.start = channel.messages.length;
    console.timeEnd(`fetched-${channelID.mode}-${channelID.index}`);

    return channel;
    /*
    Mam.fetch(Mam.getRoot(state), mode, sidekey, function(data) {
      console.log(`received message on ${mode} channel ${id}: `, message);
      this.store.channels[mode][id].messages.push(this.extractMessage(message));
    });
    */
  } catch(e) { console.error(e) } }

  _deriveAddress(seed, index) {
    return new Promise(function(resolve, reject) {

      console.time(`iota-newaddress-${index}`);
      this.iota.api.getNewAddress(seed, { index }, (error, derived) => {
        if (error) reject(error);
        else resolve(derived);
        console.timeEnd(`iota-newaddress-${index}`, derived);
        // console.debug(`address ${index}: `, derived);
      });

    }.bind(this));
  }

  _extractMessage(trytes) {
    return JSON.parse(this.iota.utils.fromTrytes(trytes));
  }

  _storeChannel(channelID, channel) {
    // this.channels[channelID.mode][channelID.index] = channel;
    this.set(this.channels[channelID.mode], channelID.index, channel);
    console.debug(`stored ${channelID.mode} channel ${channelID.name}`);
  }

  _storeMessage(channelID, message) {
    this.channels[channelID.mode][channelID.index].messages.push(message);
  }

}

module.exports = Messaging;