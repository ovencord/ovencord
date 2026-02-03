
module.exports = (client, packet) => {
  client.actions.GuildScheduledEventUserAdd.handle(packet.d);
};
