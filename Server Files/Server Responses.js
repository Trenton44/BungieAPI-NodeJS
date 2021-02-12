console.log("Starting ServerResponses.js preload.");
const path = require("path");
const bungieRoot = "https://www.bungie.net/Platform";
const bungieAuthURL = "https://www.bungie.net/en/OAuth/Authorize";
const bungieTokURL = bungieRoot+"/app/oauth/token/";
const bungieCommon = "https://www.bungie.net";
const root = path.join(__dirname,'..');
const webpageRoot = root+"/Client Files";
const serverRoot = root+"/Server Files";
const assetRoot = root+"/assets";
const manifestRoot = root+"/Manifest";
const DestinyDamageTypeDefinition = require(manifestRoot+"/DestinyDamageTypeDefinition.json");
const DestinyEquipmentSlotDefinition = require(manifestRoot+"/DestinyEquipmentSlotDefinition.json");
const DestinyInventoryBucketDefinition = require(manifestRoot+"/DestinyInventoryBucketDefinition.json");
const DestinyBucketCategory = {
  "0": "Invisible",
  "1": "Item",
  "2": "Currency",
  "3": "Equippable",
  "4": "Ignored",
};
const DestinyItemLocation = {
  "0": "Unknown",
  "1": "Inventory",
  "2": "Vault",
  "3": "Vendor",
  "4": "Postmaster",
};
const DestinyItemState = {
  "0": "None",
  "1": "Locked",
  "2": "Tracked",
  "4": "Masterwork",
};
var EquippableItemResponse = function(item){
  return {
    bucketHash: item.bucketHash,
    itemHash: item.itemHash,
    quantity: item.quantity,
    itemInstanceId: item.itemInstanceId,
    state: DestinyItemState[item.state],
    itemHashData: {
      damageType: DestinyDamageTypeDefinition[item.itemHashData.defaultDamageTypeHash],
      itemSource: item.itemHashData.displaySource,
      displayProperties: item.itemHashData.displayProperties,
      defaultDamageType: item.itemHashData.defaultDamageType,
      itemTypeDisplayName: item.itemHashData.itemTypeDisplayName,
      redacted: item.itemHashData.redacted,
      secondaryIcon: item.itemHashData.secondaryIcon,
    },
    lockState: item.lockable,
  };
}
var CharacterResponse = function(item){
  return {
    level: item.baseCharacterLevel,
    id: item.characterId,
    class: item.class.displayProperties,
    emblem: {
      emblemBackgroundPath: item.emblemBackgroundPath,
      emblemHash: item.emblemHash,
      emblemExpanded: {
        displayProperties: item.emblemExpanded.displayProperties,
        secondaryIcon: item.emblemExpanded.secondaryIcon,
        secondaryOverlay: item.emblemExpanded.secondaryOverlay,
        secondarySpecial: item.emblemExpanded.secondarySpecial,
      },
    },
    gender: item.gender.displayProperties,
    genderType: item.genderType,
    light: item.light,
    race: item.race.displayProperties,
    stats: item.stats,
  };
};
exports.CharacterResponse = CharacterResponse;

function sortByBucketCategory(items){
  var itemscopy = Array.from(items);
  var bucketCategory = {
    Invisible:[],
    Item:[],
    Currency:[],
    Equippable:[],
    Ignored:[],
  };
  for(i in itemscopy){
    var bucket = DestinyBucketCategory[itemscopy[i].bucketHashData.category];
    bucketCategory[bucket].push(itemscopy[i]);
  }
  return bucketCategory;
};
exports.sortByBucketCategory = sortByBucketCategory;

function sortByLocation(items){
  var itemscopy = Array.from(items);
  var location = {
    Unknown: [],
    Inventory: [],
    Vault: [],
    Vendor: [],
    Postmaster: [],
  };
  for(i in itemscopy){
    var locationindex = DestinyItemLocation[itemscopy[i].location];
    location[locationindex].push(itemscopy[i]);
  }
  return location;
};
exports.sortByLocation = sortByLocation;

function sortByBucketDefinition(items){
  var sortedEquipment = {};
  for(i in items){
    var buckethash = items[i].bucketHash;
    var bucketname = DestinyInventoryBucketDefinition[buckethash].displayProperties.name;
    bucketname = bucketname.split(" ").join("");
    if(sortedEquipment[bucketname] == undefined)
      { sortedEquipment[bucketname] = []; }
    sortedEquipment[bucketname].push(items[i]);
  }
  return sortedEquipment;
};
exports.sortByBucketDefinition = sortByBucketDefinition;
function sortByBucketTypeHash(items){
  var sortedEquipment = {};
  for(i in items){
    var bucketTypeHash = items[i].itemHashData.inventory.bucketTypeHash;
    var bucketHashResult = DestinyInventoryBucketDefinition[bucketTypeHash].displayProperties.name;
    if(sortedEquipment[bucketHashResult] == undefined)
      { sortedEquipment[bucketHashResult] = []; console.log("New category: "+bucketHashResult); }
    sortedEquipment[bucketHashResult].push(items[i]);
  }
  return sortedEquipment;
}
exports.sortByBucketTypeHash = sortByBucketTypeHash;
var CharactersResponse = function(items){
  var itemscopy = Array.from(items);
  for(i in itemscopy){
    itemscopy[i] = CharacterResponse(itemscopy[i]);
  }
};
exports.CharactersResponse = CharactersResponse;
