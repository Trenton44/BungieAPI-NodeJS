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
const DestinyStatDefinition = require(manifestRoot+"/DestinyStatDefinition.json");
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
function InventoryItemsResponse(items){
  for(i in items){
    items[i] = InventoryItemResponse(items[i]);
  }
  return items;
};
exports.InventoryItemsResponse = InventoryItemsResponse;
function formatEquippableItems(items){
  for(i in items){ items[i] = EquippableItemResponse(items[i]); }
  return items;
};
var InventoryItemResponse = function(item){
  var energyIcon;
  if(item.instances.damageType !== 0){
    if(item.instances.damageTypeData !== undefined)
    { energyIcon = bungieCommon+item.instances.damageTypeData.displayProperties.icon; }
  }
  else {
    if(item.instances.energy !== undefined)
    { energyIcon = bungieCommon+item.instances.energy.data.transparentIconPath; }
  }
  var primaryStat = 0;
  if(item.instances.primaryStat !== undefined)
  { primaryStat = item.instances.primaryStat.value; }
  return {
    energyType: energyIcon,
    light: primaryStat,
    bucketHash: item.bucketHash,
    itemInstanceId: item.itemInstanceId,
    itemHash: item.itemHash,
    stats: item.stats,
    itemIcon: bungieCommon+item.itemHashData.displayProperties.icon,
    itemName: item.itemHashData.displayProperties.name,
    flavortext: item.itemHashData.flavorText,
    seasonOverlay: bungieCommon+item.itemHashData.iconWatermark,
    screenshot: bungieCommon+item.itemHashData.screenshot,
    lockable: item.lockable,
    state: item.state,
    quantity: item.quantity,
    location: item.location,
    bucketHashData: {
      category: item.bucketHashData.category,
    },
  }
  return item;
};
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
      { sortedEquipment[bucketHashResult] = []; }
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
