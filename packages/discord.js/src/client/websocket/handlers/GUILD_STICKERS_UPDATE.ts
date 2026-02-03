
module.exports = (client, packet) => {
  client.actions.GuildStickersUpdate.handle(packet.d);
};
