function delay(milliseconds) {
  return new Promise((ok) => setTimeout(ok, milliseconds));
}

module.exports = delay;