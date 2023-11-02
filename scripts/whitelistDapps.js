const fs = require('fs');
const { google } = require('googleapis');
require('dotenv').config();

// Function to read a JSON file
function readJSONFile(filename) {
  try {
    const data = fs.readFileSync(filename, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error(`Error reading ${filename}: ${error.message}`);
    return null;
  }
}

// Function to write a JSON file
function writeJSONFile(filename, data) {
  try {
    const jsonData = JSON.stringify(data, null, 2) + '\n'; // Add a newline character
    fs.writeFileSync(filename, jsonData);
  } catch (error) {
    console.error(`Error writing ${filename}: ${error.message}`);
  }
}

// Fetch data from Google Sheet
const fetchDappIDsFromGoogleSheet = async () => {
    console.log(process.env.GOOGLE_CLIENT_EMAIL)
  const jwtClient = new google.auth.JWT(
    process.env.GOOGLE_CLIENT_EMAIL,
    undefined,
    process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n'),
    ['https://www.googleapis.com/auth/spreadsheets']
  );

  const spreadsheetId = process.env.RETOOL_DAPPS_SHEET_ID;
  const range = 'Sheet1!A2:A';

  jwtClient.authorize(async (err) => {
    if (err) {
      console.error('JWT client authorization error:', err);
      return;
    }

    const sheets = google.sheets({ version: 'v4', auth: jwtClient });

    const response = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range,
    });

    const values = response.data.values;
    if (values) {
      const dappIDsFromGoogleSheet = values.map((row) => row[0]);
      updateReservedDappNames(dappIDsFromGoogleSheet);
    }
  });
};

// Update reservedDappNames.json with new dappIDs
const updateReservedDappNames = (newDappIDs) => {
  const reservedDappNames = readJSONFile('reservedDappNames.json');

  if (reservedDappNames) {
    const reservedDappIDs = reservedDappNames.names;

    const missingDappIDs = newDappIDs.filter(
      (dappID) => !reservedDappIDs.includes(dappID)
    );

    const duplicates = reservedDappIDs.filter((dappID) =>
      newDappIDs.includes(dappID)
    );

    if (duplicates.length > 0) {
      console.log('Duplicate Dapp IDs found:');
      duplicates.forEach((dappID) => {
        console.log(dappID);
      });
    }

    reservedDappNames.names.push(...missingDappIDs);

    reservedDappNames.whitelisted = reservedDappNames.names.length;

    writeJSONFile('reservedDappNames.json', reservedDappNames);

    console.log('Missing Dapp IDs appended to reservedDappNames.json');
  }
};

// Fetch dappIDs from Google Sheet and update reservedDappNames.json
fetchDappIDsFromGoogleSheet();
