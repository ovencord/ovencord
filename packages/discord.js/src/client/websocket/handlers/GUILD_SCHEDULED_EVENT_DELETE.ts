
module.exports = (client, packet) => {
  client.actions.GuildScheduledEventDelete.handle(packet.d);
};
