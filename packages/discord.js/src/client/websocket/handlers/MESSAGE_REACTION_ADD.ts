
module.exports = (client, packet) => {
  client.actions.MessageReactionAdd.handle(packet.d);
};
