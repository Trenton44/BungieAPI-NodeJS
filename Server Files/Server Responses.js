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
const DestinyItemTypes = {
  Subclass: "SubclassResponseFormat",
  KineticWeapons: "WeaponResponseFormat",
  EnergyWeapons: "WeaponResponseFormat",
  PowerWeapons: "WeaponResponseFormat",
  Helmet: "ArmorResponseFormat",
  Gauntlets: "ArmorResponseFormat",
  ChestArmor: "ArmorResponseFormat",
  LegArmor: "ArmorResponseFormat",
  ClassArmor: "ArmorResponseFormat",
  Ghost: "CosmeticResponseFormat",
  Ships: "CosmeticResponseFormat",
  Vehicle: "CosmeticResponseFormat",
  Emblems: "EmblemResponseFormat",
  SeasonalArtifact: "CosmeticResponseFormat",
  default: "ItemResponseFormat",
};
exports.DestinyItemTypes = DestinyItemTypes;

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
    bucketname = String(bucketname);
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
    bucketHashResult = String(bucketHashResult);
    bucketHashResult = bucketHashResult.split(" ").join("");
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

var SubclassResponseFormat = function(item,i,z){
  var format = ItemResponseFormat(item,i,z);
  format.equipped = item.instances.isEquipped;
  format.HTMLTemplate = "<div class=subclass-capsule id="+format.htmlId+"><img subclass-icon src="+format.itemIcon+" /></div>";
  return format;
};
exports.SubclassResponseFormat = SubclassResponseFormat;

var WeaponResponseFormat = function(item,i,z){
  var format = ItemResponseFormat(item,i,z);
  format.energyIcon = bungieCommon+item.instances.damageTypeData.displayProperties.icon;
  format.light = item.instances.primaryStat.value;
  format.stats = item.stats;
  format.equipped = item.instances.isEquipped;
  format.overlay = bungieCommon+item.itemHashData.iconWatermark;
  format.HTMLTemplate = "<div class=item-capsule id='"+format.htmlId+"'><img class=item-icon src="+format.itemIcon+" /><img class=item-overlay src="+format.overlay+" /><img class=item-type src="+format.energyIcon+" /><h1 class=item-light>"+format.light+"</h1></div>";
  return format;
};
exports.WeaponResponseFormat = WeaponResponseFormat;

var ArmorResponseFormat = function(item,i,z){
  var format = ItemResponseFormat(item,i,z);
  if(item.instances.primaryStat !== undefined)
  { format.light = item.instances.primaryStat.value; }
  else{ format.light = 0; }
  format.stats = item.stats;
  if(item.instances.energy !== undefined)
  { format.energyIcon = bungieCommon+item.instances.energy.data.displayProperties.icon;}
  else { format.energyIcon = ""; }
  format.equipped = item.instances.isEquipped;
  format.overlay = bungieCommon+item.itemHashData.iconWatermark;
  format.HTMLTemplate = "<div class=item-capsule id='"+format.htmlId+"'><img class=item-icon src="+format.itemIcon+" /><img class=item-overlay src="+format.overlay+" /><img class=item-type src="+format.energyIcon+" /><h1 class=item-light>"+format.light+"</h1></div>";
  return format;
};
exports.ArmorResponseFormat = ArmorResponseFormat;

var CosmeticResponseFormat = function(item,i,z){
  var format = ItemResponseFormat(item,i,z);
  format.equipped = item.instances.isEquipped;
  format.HTMLTemplate = "<div class=item-capsule id='"+format.htmlId+"'><img class=item-icon src="+format.itemIcon+" /></div>";
  return format;
};
exports.CosmeticResponseFormat = CosmeticResponseFormat;

var EmblemResponseFormat = function(item,i,z){
  var format = ItemResponseFormat(item,i,z);
  format.equipped = item.instances.isEquipped;
  format.HTMLTemplate = "<div class=item-capsule id='"+format.htmlId+"'><img class=item-icon src="+format.itemIcon+" /></div>";
  return format;

};
exports.EmblemResponseFormat = EmblemResponseFormat;

var ItemResponseFormat = function(item,i,z){
  return {
    htmlId: i+"-"+z,
    itemIcon: bungieCommon+item.itemHashData.displayProperties.icon,
    itemHash: item.itemHash,
    bucketHash: item.bucketHash,
    bucketCategory: item.bucketHashData.category,
    transferStatus: item.transferStatus,
    name: item.bucketHashData.displayProperties.name,
    itemInstanceId: item.itemInstanceId,
    location: item.location,
    lockable: item.lockable,
    quantity: item.quantity,
    state: item.state,
    flavortext: item.flavortext,
    HTMLTemplate: "<div class=item-capsule id='"+i+"-"+z+"'><img class=item-icon src="+bungieCommon+item.itemHashData.displayProperties.icon+" /> </div>",
  };
};
exports.ItemResponseFormat = ItemResponseFormat;
