module.exports = function logger(source: string, ...messages: any) {
  console.log(source + ":", ...messages);
};
