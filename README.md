# Achieve Mint API Client

This is the Achieve Mint API client built in Javascript

## Installacion

Install dependencies
`npm install`

Link module inside the repository directory
`npm link`

Use module in a project
`npm link achievemint`


## Usage

To use this client, you have to have an Achieve Mint account and create an API App via the user dashboard.

This module uses dotenv to store your app key and secret, create a .env file in the root of your project with the following values:
CLIENT_ID = yourClientId
CLIENT_SECRET = yourClientSecret
API_URL = https://the-api.url

Or you can include the secret and such in other ways



Follow the example in the tests/test_client.js file:

```
// import from the linked node module
import { Client } from 'achievemint';

// Initialize the API client
const client = new Client(
	process.env.CLIENT_ID,
	process.env.CLIENT_SECRET,
	process.env.API_URL
);

(async () => {
	try {
		const userDetails = await client.getUser(100);
		console.log(userDetails);
	} catch (error) {
		console.log("Error:", error.message);
	}
})();
```

The following client methods are available:
- getUser(userId)
- createUser(userName, email)
- categoryTemplateVersions(category)
- getUserAchievements(userId)
- awardAchievement(templateVersionId, userId)

