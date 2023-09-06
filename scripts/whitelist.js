const { ethers } = require("hardhat");
const fs = require("fs");

const contractAddress = require("./config.json");
const index = require("../utils/index.json");
const listName = require("./list.json");
const fileName = "./utils/index.json";
async function addDappNames(names) {
  try {
    const dappNameList = new ethers.Contract(
      contractAddress.DappNameList,
      ["function setDappNames(string[] memory dappNames)"],
      ethers.provider.getSigner()
    );
    return await dappNameList.setDappNames(names);
  } catch (err) {
    console.log("adding Names error: ", err);
  }
}

async function main() {
  console.log("adding list of names");
  const signer = await ethers.getSigner();
  console.log("signer: ", signer.address);

  try {

    const args = process.argv.slice(2);

// Process the newly added names
console.log("Newly Added Names:", args);



      let startIndex = index.list;
      let stopIndex = listName.names.length;

      do{
        let listNameList = listName.names.slice(startIndex, startIndex+100);
        console.log("listNameList Length: ", listNameList.length);
        console.log(await addDappNames(listNameList));

        console.log("startIndex: ", startIndex);
        console.log("stopIndex: ", stopIndex);
        console.log("list from: ", listNameList[0], "to: ", listNameList[listNameList.length-1]);
        startIndex = startIndex+100;
        }while(startIndex < stopIndex)

        index.list = stopIndex;
        fs.writeFileSync(
          fileName,
          JSON.stringify(index, null, 2),
          function writeJSON(err) {
            if (err) return console.log(err);
            console.log(JSON.stringify(index));
            console.log("writing to " + fileName);
          }
        );

  } catch (e) {
    console.log("Error in whitelist trx: ", e);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
