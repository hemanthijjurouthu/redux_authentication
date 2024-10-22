const mongoose = require("mongoose");
const initData = require("./data.js");
const Listing = require("../models/listings.js");

main().then(() => console.log("connected to database successfully!")).
       catch(err => console.log(err));

async function main() 
{
  await mongoose.connect('mongodb://127.0.0.1:27017/wanderlust2');
}

const initDB = async () => {
    await Listing.deleteMany({});
    initData.data = initData.data.map((obj) => ({...obj,owner:"66f292f1c41b9559463e901a"}));
    await Listing.insertMany(initData.data);
    console.log("data was initialised successfully");
}

initDB();