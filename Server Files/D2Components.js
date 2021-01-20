const path = require("path");
const bungieRoot = "https://www.bungie.net/Platform";
const bungieAuthURL = "https://www.bungie.net/en/OAuth/Authorize";
const bungieTokURL = bungieRoot+"/app/oauth/token/";
const bungieCommon = "https://www.bungie.net";
const manifestRoot = path.join(__dirname,"..\\","manifestData");
const webpageRoot = path.join(__dirname,"..\\","Client Files");
const serverRoot = path.join(__dirname,"..\\","Server Files");
const assetRoot = path.join(__dirname,"..\\","assets");
const D2Manifest = require(manifestRoot+"/d2manifest.json");
const components = {
  "100": "profile",
  "101": "vendorReceipts",
  "102": "profileInventory",
  "103": "profileCurrencies",
  "104": "profileProgression",
  "105": "platformSilver",
  "200": "characters",
  "201": "characterInventories",
  "202": "characterProgressions",
  "203": "characterRenderData",
  "204": "characterActivities",
  "205": "characterEquipment",
  "300": "itemComponents",
  "301": "itemComponents",
  "302": "itemComponents",
  "303": "itemComponents",
  "304": "itemComponents",
  "305": "itemComponents",
  "306": "itemComponents",
  "307": "itemComponents",
  "308": "itemComponents",
  "309": "itemComponents",
  "310": "itemComponents",
  "400": "vendors",
  "401": "vendorCategories",
  "402": "vendorSales",
  "500": "kiosks",  //shows up as both characterKiosks and profileKiosks
  "600": "currencyLookups", //shows up as both characterCurrencyLookups and profileCurrencyLookups
  "700": "presentationNodes", //characterPresentationNodes & profilePresentationNodes
  "800": "collectibles", //shows up as both profileCollectibles and characterCollectibles
  "900": "records", //profileRecords & characterRecords
  "1000": "profileTransitoryData",
  "1100": "metrics",
  //unaccounted for: characterPlugSets & characterUninstancedItemComponents(i think this one is in one of the item components)
  //unaccounted for: profilePlugSets
};
exports.components = components;


//The following functions are responsible for taking a component input from a d2api response
//and building it with relevant data from the manifest files. makes it easy to access later by building
//it as soon as it's recieved.
var profile = function(data){
  data = data.data;
  return data;
};
exports.profile = profile;

var vendorReceipts = function(data){
  data = data.data;
  return data;
};
exports.vendorReceipts = vendorReceipts;

var profileInventory = function(data){
  data = data.data;
  return data;
};
exports.profileInventory = profileInventory;

var profileCurrencies = function(data){
  data = data.data;
  return data;
};
exports.profileCurrencies = profileCurrencies;

var profileProgression = function(data){
  data = data.data;
  return data;
};
exports.profileProgression = profileProgression;

var platformSilver = function(data){
  data = data.data;
  return data;
};
exports.platformSilver = platformSilver;

var characters = function(data){
  characterlist = data.data;
  for(i in characterlist){
    var character = characterlist[i];
    character.class = D2Manifest.DestinyClassDefinition[character.classHash];
    character.gender = D2Manifest.DestinyGenderDefinition[character.genderHash];
    character.race = D2Manifest.DestinyRaceDefinition[character.raceHash];
    var statsinfo = {};
    for(z in character.stats){
      statsinfo[z] = {};
      statsinfo[z].value = character.stats[z];
      statsinfo[z].info = D2Manifest.DestinyStatDefinition[z];
    }
    character.stats = statsinfo;
    character.emblemExpanded = D2Manifest.DestinyInventoryItemDefinition[character.emblemHash];
  }
  return characterlist;
};
exports.characters = characters;

var characterInventories = function(data){
  characterlist = data.data;
  for(i in characterlist){
    //apparently bungie's api splits your inventory into arrays of 100, idk why but im gonna plan for it here.
    var itemarrays = characterlist[i];
    for(j in itemarrays){
      var itemlist = itemarrays[j];
      var counter = 0;
      for(z in itemlist){
        //console.log("Building data for item "+counter);
        itemlist[z].itemHashData = D2Manifest.DestinyInventoryItemDefinition[itemlist[z].itemHash];
        itemlist[z].bucketHashData = D2Manifest.DestinyInventoryBucketDefinition[itemlist[z].bucketHash];
        counter += 1;
      }
    }
  }
  console.log("character inventory component has been completed");
  return characterlist;
};
exports.characterInventories = characterInventories;

var characterProgressions = function(data){
  characterlist = data.data;
  return characterlist;
};
exports.characterProgressions = characterProgressions;

var characterRenderData = function(data){
  characterlist = data.data;
  return characterlist;
};
exports.characterRenderData = characterRenderData;

var characterActivities = function(data){
  characterlist = data.data;
  return characterlist;
};
exports.characterActivities = characterActivities;

var characterEquipment = function(data){
  var characterlist = data.data;
  for(i in characterlist){
    var itemlist = characterlist[i].items;
    console.log("fetching data for "+i+"'s equipment.");
    var counter = 0;
    for(z in itemlist){
      console.log("Building data for item "+counter);
      itemlist[z].itemHashData = D2Manifest.DestinyInventoryItemDefinition[itemlist[z].itemHash];
      itemlist[z].bucketHashData = D2Manifest.DestinyInventoryBucketDefinition[itemlist[z].bucketHash];
      counter += 1;
    }
  }
  console.log("all data for characterEquipment has been built.");
  return characterlist;
};
exports.characterEquipment = characterEquipment;

var itemComponents = function(data){
  return data;
};
exports.itemComponents = itemComponents;

var vendors = function(data){
  return data;
};
exports.vendors = vendors;

var vendorCategories = function(data){
  return data;
};
exports.vendorCategories = vendorCategories;

var vendorSales = function(data){
  return data;
};
exports.vendorSales = vendorSales;

var kiosks = function(datap,datac){
  var data = {};
  try{  data.profileKiosks= datap.data;  }
  catch(e){ console.log("profileKiosks was nonexistent");  }
  try{  data.characterKiosks= datac.data; }
  catch(e){  console.log("characterKiosks was nonexistent");  }
  return data;
};
exports.kiosks = kiosks;

var currencyLookups = function(datap,datac){
  var data = {};
  try{  data.profileCurrencyLookups= datap.data;  }
  catch(e){ console.log("profileCurrencyLookups was nonexistent");  }
  try{  data.characterCurrencyLookups= datac.data; }
  catch(e){  console.log("characterCurrencyLookups was nonexistent");  }
  return data;
};
exports.currencyLookups = currencyLookups;

var presentationNodes = function(datap,datac){
  var data = {};
  try{  data.profilePresentationNodes= datap.data;  }
  catch(e){ console.log("profilePresentationNodes was nonexistent");  }
  try{  data.characterPresentationNodes= datac.data; }
  catch(e){  console.log("characterPresentationNodes was nonexistent");  }
  return data;
};
exports.presentationNodes = presentationNodes;

var collectibles = function(datap,datac){
  var data = {};
  try{  data.profileCollectibles= datap.data;  }
  catch(e){ console.log("profileCollectibles was nonexistent");  }
  try{  data.characterCollectibles= datac.data; }
  catch(e){  console.log("characterCollectibles was nonexistent");  }
  return data;
};
exports.collectibles = collectibles;

var records = function(datap,datac){
  var data = {};
  try{  data.profileRecords= datap.data;  }
  catch(e){ console.log("profileRecords was nonexistent");  }
  try{  data.characterRecords= datac.data; }
  catch(e){  console.log("characterRecords was nonexistent");  }
  return data;
};
exports.records = records;

var profileTransitoryData = function(data){
  return data;
};
exports.profileTransitoryData = profileTransitoryData;

var metrics = function(data){
  var characterlist = data.data;
  return characterlist;
};
exports.metrics = metrics;
