
module.exports = (client, packet) => {
  client.actions.ThreadCreate.handle(packet.d);
};
