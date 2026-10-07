import '../config.mjs';
import { Client } from '../index.js';

// Initialize the API client
const client = new Client(
	process.env.CLIENT_ID,
	process.env.CLIENT_SECRET
);

(async () => {
	try {
		const userDetails = await client.getUser(100);
		console.log(userDetails);
	} catch (error) {
		console.log("Error:", error.message);
	}
})();
