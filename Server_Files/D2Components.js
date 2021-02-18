const path = require("path");
const bungieRoot = "https://www.bungie.net/Platform";
const bungieAuthURL = "https://www.bungie.net/en/OAuth/Authorize";
const bungieTokURL = bungieRoot+"/app/oauth/token/";
const bungieCommon = "https://www.bungie.net";
const root = path.join(__dirname,'..');

const serverRoot = root+"/server_files";
const assetRoot = root+"/asset_files";
const manifestRoot = root+"/manifest_files";

const ServerResponse = require(serverRoot+"/Server Responses.js");
const DestinyClassDefinition = require(manifestRoot+"/DestinyClassDefinition.json");
const DestinyGenderDefinition = require(manifestRoot+"/DestinyGenderDefinition.json");
const DestinyRaceDefinition = require(manifestRoot+"/DestinyRaceDefinition.json");
const DestinyStatDefinition = require(manifestRoot+"/DestinyStatDefinition.json");
const DestinyInventoryItemDefinition = require(manifestRoot+"/DestinyInventoryItemDefinition.json");
const DestinyInventoryBucketDefinition = require(manifestRoot+"/DestinyInventoryBucketDefinition.json");
const DestinyPowerCapDefinition = require(manifestRoot+"/DestinyPowerCapDefinition.json");
const DestinyDamageTypeDefinition = require(manifestRoot+"/DestinyDamageTypeDefinition.json");
const DestinyEnergyTypeDefinition = require(manifestRoot+"/DestinyEnergyTypeDefinition.json");

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

//CHARACTER LEVEL COMPONENTS
var activities = function(data){
  var data = data.data;
  return data;
};
exports.activities = activities;

var character = function(data){
  var data = data.data;
    data.class = DestinyClassDefinition[data.classHash];
    data.gender = DestinyGenderDefinition[data.genderHash];
    data.race = DestinyRaceDefinition[data.raceHash];
    var statsinfo = {};
    for(z in data.stats){
      if(z == "1935470627") continue;
      statsinfo[z] = {};
      statsinfo[z].value = data.stats[z];
      statsinfo[z].info = DestinyStatDefinition[z];
    }
    data.stats = statsinfo;
    data.emblemExpanded = DestinyInventoryItemDefinition[data.emblemHash];
  return data;
};
exports.character = character;

var collectibles = function(data){
  var data = data.data;
  return data;
};
exports.collectibles = collectibles;

var currencyLookups = function(data){
  var data = data.data;
  return data;
};
exports.currencyLookups = currencyLookups;

var equipment = function(data){
  var data = data.data;
  var itemlist = data.items;
  for(z in itemlist){
    itemlist[z].itemHashData = DestinyInventoryItemDefinition[itemlist[z].itemHash];
    itemlist[z].bucketHashData = DestinyInventoryBucketDefinition[itemlist[z].bucketHash];
    if(itemlist[z].overrideStyleItemHash !== undefined && itemlist[z].overrideStyleItemHash !== null)
    { itemlist[z].overrideStyleItemHashData = DestinyInventoryItemDefinition[itemlist[z].overrideStyleItemHash];}
    if(itemlist[z].itemHashData.inventory !== undefined && itemlist[z].inventory !== null)
    { itemlist[z].itemHashData.inventory.bucketTypeHashData = DestinyInventoryBucketDefinition[itemlist[z].itemHashData.inventory.bucketTypeHash]; }
  }
  data = itemlist;
  return data;
};
exports.equipment = equipment;

var inventory = function(data){
  var data = data.data;
  var itemlist = data.items;
  for(z in itemlist){
    itemlist[z].itemHashData = DestinyInventoryItemDefinition[itemlist[z].itemHash];
    itemlist[z].bucketHashData = DestinyInventoryBucketDefinition[itemlist[z].bucketHash];
    if(itemlist[z].overrideStyleItemHash !== undefined && itemlist[z].overrideStyleItemHash !== null)
    { itemlist[z].overrideStyleItemHashData = DestinyInventoryItemDefinition[itemlist[z].overrideStyleItemHash];}
    if(itemlist[z].itemHashData.inventory !== undefined && itemlist[z].inventory !== null)
    { itemlist[z].itemHashData.inventory.bucketTypeHashData = DestinyInventoryBucketDefinition[itemlist[z].itemHashData.inventory.bucketTypeHash]; }
  }
  data = itemlist;
  return data;
};
exports.inventory = inventory;

var itemComponents = function(data){
  if(data.instances !== undefined){
    data.instances = data.instances.data;
    for(i in data.instances){
      if(data.instances[i].primaryStat !== undefined)
      { data.instances[i].primaryStat.data = DestinyStatDefinition[data.instances[i].primaryStat.statHash];  }
      if(data.instances[i].damageTypeHash !== undefined)
      { data.instances[i].damageTypeData = DestinyDamageTypeDefinition[data.instances[i].damageTypeHash]; }
      if(data.instances[i].energy !== undefined)
      { data.instances[i].energy.data = DestinyEnergyTypeDefinition[data.instances[i].energy.energyTypeHash]; }
    }
  }
  if(data.stats !== undefined){
    data.stats = data.stats.data;
    for(i in data.stats){
      data.stats[i] = data.stats[i].stats;
    }
    for(i in data.stats){
      for(z in data.stats[i]){
        data.stats[i][z].data = DestinyStatDefinition[z];
      }
    }
  }
  return data;
};
exports.itemComponents = itemComponents;

var kiosks = function(data){
  //var data = data.data;
  return data;
};
exports.kiosks = kiosks;

var plugSets = function(data){
  var data = data.data;
  return data;
};
exports.plugSets = plugSets;

var presentationNodes = function(data){
  var data = data.data;
  return data;
};
exports.presentationNodes = presentationNodes;

var progressions = function(data){
  var data = data.data;
  return data;
};
exports.progressions = progressions;

var records = function(data){
  var data = data.data;
  return data;
};
exports.records = records;

var renderData = function(data){
  var data = data.data;
  return data;
};
exports.renderData = renderData;

var uninstancedItemComponents = function(data){
  var data = data;
  return data;
};
exports.uninstancedItemComponents = uninstancedItemComponents;

//PROFILE LEVEL COMPONENT Responses
var characterActivities = function(data){
  var data = data.data;
  return data;
};
exports.characterActivities = characterActivities;

var characterCollectibles = function(data){
  var data = data.data;
  return data;
};
exports.characterCollectibles = characterCollectibles;

var characterCurrencyLookups = function(data){
  var data = data.data;
  return data;
};
exports.characterCurrencyLookups = characterCurrencyLookups;

var characterEquipment = function(data){
  var characterlist = data.data;
  for(i in characterlist){
    characterlist[i] = equipment({data: characterlist[i]});
  }
  return characterlist;
};
exports.characterEquipment = characterEquipment;

var characterInventories = function(data){
  var characterlist = data.data;
  for(i in characterlist){
    characterlist[i] = inventory({data: characterlist[i]});
  }
  return characterlist;
};
exports.characterInventories = characterInventories;

var characterKiosks = function(data){
  //var data = data.data;
  return data;
};
exports.characterKiosks = characterKiosks;

var characterPlugSets = function(data){
  var data = data.data;
  return data;
};
exports.characterPlugSets = characterPlugSets;

var characterPresentationNodes = function(data){
  var data = data.data;
  return data;
};
exports.characterPresentationNodes = characterPresentationNodes;

var characterProgressions = function(data){
  var data = data.data;
  return data;
};
exports.characterProgressions = characterProgressions;

var characterRenderData = function(data){
  var data = data.data;
  return data;
};
exports.characterRenderData = characterRenderData;

var characterRecords = function(data){
  var data = data.data;
  return data;
};
exports.characterRecords = characterRecords;

var characterUninstancedItemComponents = function(data){
  var data = data;
  return data;
};
exports.characterUninstancedItemComponents = characterUninstancedItemComponents;

var characters = function(data){
  var characterlist = data.data;
  for(i in characterlist){
    characterlist[i] = character({data: characterlist[i]});
  }
  return characterlist;
};
exports.characters = characters;

var metrics = function(data){
  var data = data.data;
  return data;
};
exports.metrics = metrics;

var platformSilver = function(data){
  var data = data.data;
  return data;
};
exports.platformSilver = platformSilver;

var profile = function(data){
  var data = data.data;
  return data;
};
exports.profile = profile;

var profileCollectibles = function(data){
  var data = data.data;
  return data;
};
exports.profileCollectibles = profileCollectibles;

var profileCurrencies = function(data){
  var data = data.data;
  data = data.items;
  for(i in data){
    data[i].itemHashData = DestinyInventoryItemDefinition[data[i].itemHash];
    data[i].bucketHashData = DestinyInventoryBucketDefinition[data[i].bucketHash];
  }
  return data;
};
exports.profileCurrencies = profileCurrencies;

var profileInventory = function(data){
  var data = data.data;
  data = data.items;
  for(i in data){
    data[i].itemHashData = DestinyInventoryItemDefinition[data[i].itemHash];
    data[i].bucketHashData = DestinyInventoryBucketDefinition[data[i].bucketHash];
  }
  return data;
};
exports.profileInventory = profileInventory;

var profileKiosks = function(data){
  //var data = data.data;
  return data;
};
exports.profileKiosks = profileKiosks;

var profilePlugSets = function(data){
  var data = data.data;
  return data;
};
exports.profilePlugSets = profilePlugSets;

var profilePresentationNodes = function(data){
  var data = data.data;
  return data;
};
exports.profilePresentationNodes = profilePresentationNodes;

var profileProgression = function(data){
  var data = data.data;
  return data;
};
exports.profileProgression = profileProgression;

var profileRecords = function(data){
  var data = data.data;
  return data;
};
exports.profileRecords = profileRecords;

var profileTransitoryData = function(data){
  var data = data;
  return data;
};
exports.profileTransitoryData = profileTransitoryData;

var vendorReceipts = function(data){
  var data = data.data;
  return data;
};
exports.vendorReceipts = vendorReceipts;
