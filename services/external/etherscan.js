const { fetch } = require("undici");

class Etherscan {
  #BASE_URL = "https://api.etherscan.io/api";
  #apiKey = "";

  constructor(apiKey) {
    this.#apiKey = apiKey;
  }

  async getRecentBlock() {
		console.log(this.#apiKey);
    const res = await fetch(
      `${this.#BASE_URL}
			?module=proxy
			&action=eth_blockNumber
			&apikey=${this.#apiKey}`
    );

    const json = await res.json();
    return json;
  }

  async getBlockByNumber(blockNum) {
    const res = await fetch(`
		${this.#BASE_URL}
		?module=proxy
		&action=eth_getBlockByNumber
		&tag=${blockNum}
		&boolean=true
		&apikey=${this.#apiKey}`);

    const json = await res.json();
    return json;
  }
}

module.exports = Etherscan;
