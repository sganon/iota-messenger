const Mam = require('mam.client');
const WebSocketClient = require('websocket').w3cwebsocket;

class Messaging {

  constructor(iota, seed, set) {
    console.debug('building Messaging object');
    this.iota     = iota;
    this.seed     = seed;
    this.set      = set;
    this.masters  = [];
    this.slaves   = [];
    this.channels = {
      private:    {},
      restricted: {},
      public:     {}
    };
  }

  async init() { try {
    this.dataID = { index: 0, mode: 'private', name: 'data' };
    this.dataID.id = await this._initChannel(this.dataID);
    this.data = await this.loadChannel(this.dataID);
    this._initChannels();
    this._initWS();

    return this.channels;
  } catch (e) { console.error(e) } }

  /*
  async fetchChannels() {
    try {
      console.debug('data channel', this.data);

      const channelIDs = this._getChannels();
      await Promise.all(channelIDs.map(async function (channelID) {
        try {
          console.debug(`loading ${channelID.mode} channel ${channelID.name}`);
          const channel = await this._initChannel(channelID);
        } catch (e) { console.error(e) }
      }.bind(this)));

      // this._getNextRoots();
      return this.channels;
    } catch (e) { console.error(e) }
  }
  */

  async createChannel(mode, sidekey) { try {
    const name  = prompt('enter a name for this channel');
    const index = this._generateID(mode);
    console.debug(`creating ${mode} channel ${name} (${index})`);
    const id = await this._initChannel({ index, mode, sidekey, name });
    this._addData({ type: 'channel', mode, sidekey, index, name });
    return id;
  } catch (e) { console.error(e) } }

  async send(packet, value, channelID) { try {
    console.debug(
      `sending message in ${channelID.mode} channel ${channelID.name}
      with ${value} IOTA`,
      packet
    );
    console.time('mam-create-message');
    packet.timestamp = Date.now();
    const data = this.iota.utils.toTrytes(JSON.stringify(packet));
    const message = Mam.create(
      this.channels[channelID.mode][channelID.id].state,
      data
    );
    console.timeEnd('mam-create-message');

    console.time('mam-attaching');
    this.channels[channelID.mode][channelID.id].state = message.state;
    await Mam.attach(message.payload, message.address);
    console.timeEnd('mam-attaching');

    this._storeMessage(channelID, packet);
    return packet;
  } catch (e) { console.error(e) } }

  async loadChannel(channelID) { try {
    console.debug(
      `loading ${channelID.mode} channel ${channelID.name} (${channelID.id})`
    );
    let channel = this._getChannel(channelID);

    console.time(`loaded-${channelID.mode}-${channelID.id}`);
    this.channels[channelID.mode][channelID.id] = Object.assign(
      { }, channel, await Mam.fetch(
        channel.root,
        channelID.mode,
        channelID.sidekey
      )
    );

    // TODO broken logic ?
    channel = this._getChannel(channelID);

    channel.messages = channel.messages.map(
      message => {
        message = this._extractMessage(message);
        if (message.type === 'join') {
          const id = this.getChecksum(message.root);
          if (this.masters.includes(id)) return ;
          this.slaves.push(id);
          const slaveID = {
            mode: channelID.mode,
            name: channelID.name,
            root: message.root,
            id
          };
          this._initChannel(slaveID).then(() => this.loadChannel(slaveID));
          this.channels[channelID.mode][channelID.id].watching.push(this.getChecksum(message.root));
        }
        return message;
      }
    ).filter(x => x);
    // set message sending index to current thread length
    channel.state.channel.start = channel.messages.length;
    channel.loaded = true;
    console.timeEnd(`loaded-${channelID.mode}-${channelID.id}`);

    return channel;
  } catch (e) { console.error(e) } }

  async join(mode, root, sidekey) { try {
    // TODO check address
    console.debug(`subscribing to ${mode} channel`, root);

    const sendID = { mode, sidekey };
    sendID.id = await this.createChannel(sendID.mode, sendID.sidekey);

    const receiveID = { mode, root, sidekey };
    receiveID.id = await this._initChannel(receiveID);

    this._watchChannel(sendID, receiveID);

    const send = this._getChannel(sendID);
    prompt('give this root to the invitation sender', send.root);
  } catch(e) { console.error(e) } }

  async _watchChannel(sendID, receiveID) { try {
    console.log(sendID, receiveID);
    this.channels[sendID.mode][sendID.id].watching.push(receiveID.root)
    await this.send({ type: 'join', root: receiveID.root }, 0, sendID);
  } catch(e) { console.error(e) } }

  async invite(channelID, root) { try {
    console.debug(
      `inviting user to ${channelID.mode} channel ${channelID.name}`,
      root
    );
    // TODO check address
    this._watchChannel(channelID, { root });
    await this._initChannel(
      { mode: channelID.mode, name: channelID.name, root }
    );
  } catch(e) { console.error(e) } }

  getChecksum(address) {
    const checkedAddress = this.iota.utils.addChecksum(address)
    return checkedAddress.substr(checkedAddress.length - 9);
  }

  /*
  _getThread(id, mode) {
    return this.channels[mode][id];
  }
  */

  /*
  _getNextRoots() {
    const nextRoots = { private: [], restricted: [], public: [] };
    const modes = Object.keys(nextRoots);
    modes.map(mode => {
      const channels = Object.keys(this.channels[mode]);
      channels.map(channel => {
        const messages = this.channels[mode][channel].messages;
        nextRoots[mode].push(messages[messages.length - 1].nextRoot);
      });
    });
    console.log(nextRoots);
  }
  */

  /*
  ** _initChannel
  ** channelID
  **   mode, name, [index], [root]
  */
  async _initChannel(channelID) { try {
    console.log(`initializing ${channelID.mode} channel ${channelID.name}`);
    let channel = { name: channelID.name };

    let root = true;
    if (!channelID.address && channelID.index !== undefined) {
      channelID.root = await this._deriveAddress(this.seed, channelID.index);
      root = false;
    }

    channel.state = Mam.init(this.iota, channelID.root);
    if (channelID.mode !== 'public')
      channel.state = Mam.changeMode(
        channel.state,
        channelID.mode,
        channelID.sidekey
      );

    if (!root) {
      channel.root = Mam.getRoot(channel.state);
      this.masters.push(this.getChecksum(channel.root));
    } else {
      channel.root = channelID.root;
    }

    channel.watching = [];
    channel.loaded = false;
    this._storeChannel(channelID, channel);
    console.debug('stored channel', channel);

    return this.getChecksum(channel.root);
  } catch (e) { console.error(e) } }

  _getChannels() {
    return this.data.messages.filter(
      message => message.type === 'channel'
    );
  }

  _initChannels() {
    const channelIDs = this._getChannels();
    channelIDs.map(channelID => this._initChannel(channelID));
  }

  _generateID(mode) {
    const max = 999999;
    let index;
    do { index = Math.floor(Math.random() * (max - 1)) }
    while (this.channels[mode][index]);
    return index;
  }

  async _addData(data) { try {
    await this.send(data, 0, this.dataID);
  } catch (e) { console.error(e) } }

  _deriveAddress(seed, index) { return new Promise(function (resolve, reject) {
    console.time(`iota-newaddress-${index}`);
    this.iota.api.getNewAddress(seed, { index }, (error, derived) => {
      if (error) reject(error);
      else resolve(derived);
      console.timeEnd(`iota-newaddress-${index}`, derived);
    });
  }.bind(this)); }

  _extractMessage(trytes) {
    const message = JSON.parse(this.iota.utils.fromTrytes(trytes));
    return message;
  }

  _storeChannel(channelID, channel) {
    const id = this.getChecksum(channel.root);
    this.set(this.channels[channelID.mode], id, channel);
    console.debug(`stored ${channelID.mode} channel ${channelID.name}`);
  }

  _storeMessage(channelID, message) {
    this.channels[channelID.mode][channelID.id].messages.push(message);
  }

  _getChannel(channelID) {
    console.debug('getting channel', channelID);
    return this.channels[channelID.mode][channelID.id];
  }

  _initWS() {
    // Initiate connection to ws proxy for zmq.
    this.wsClient = new WebSocketClient('ws://localhost:1337', 'echo-protocol');
    this.wsClient.onerror = () => console.error('Connection Error');
    this.wsClient.onopen  = () => console.debug('WebSocket Client Connected');
    this.wsClient.onclose = () => console.debug('echo-protocol Client Closed');
    // Function handling zmq response via ws proxy.
    this.wsClient.onmessage = (e) => {
      if (typeof e.data === 'string') {
        // console.log("Received: " + e.data);
        const payload = e.data.split(',');
        if (payload[0] === 'tx') {
          // console.log('receiving data from ws proxy');
          // console.log('nextRoot is:', this.data.nextRoot);
          if (payload.indexOf(this.data.nextRoot) != -1) {
            console.log('found one yeah:', payload, nextRoot)
          }
        }
      }
    };
  }

}

module.exports = Messaging;
