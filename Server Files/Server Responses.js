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


var EquipmentItemResponse = function(item){
  return {
    itemhash: item.itemHash,
    hashData: {
      displayProperties: item.itemHashData.displayProperties,
      damageType: D2Manifest.DestinyDamageTypeDefinition[item.itemHashData.defaultDamageTypeHash],
      aquisition: item.itemHashData.displaySource,
      equippable: item.itemHashData.equippable,
      iconWatermark: item.itemHashData.iconWatermark,
      iconWatermarkShelved: item.itemHashData.iconWatermarkShelved,
    },
    bucketData: {
      displayProperties: item.bucketHashData.displayProperties,
      itemCount: item.bucketHashData.itemCount,
      redacted: item.bucketHashData.redacted,
    },
  };
};
exports.EquipmentItemResponse = EquipmentItemResponse;

var EquipmentItemsResponse = function(items){
  var itemscopy = Array.from(items);
  for(i in items){
    itemscopy[i] = EquipmentItemResponse(itemscopy[i]);
  }
  return itemscopy;
};
exports.EquipmentItemsResponse = EquipmentItemsResponse;

var InventoryItemsResponse = function(items){
  var itemscopy = Array.from(items);
  for(i in items){
    itemscopy[i] = InventoryItemResponse(itemscopy[i]);
  }
  return itemscopy;
};
exports.InventoryItemsResponse = InventoryItemsResponse;

var InventoryItemResponse = function(item){
  return item;
};
exports.InventoryItemResponse = InventoryItemResponse;

var CharactersResponse = function(items){
  var itemscopy = Array.from(items);
  for(i in items){
    itemscopy[i] = CharacterResponse(itemscopy[i]);
  }
};
exports.CharactersResponse = CharactersResponse;

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
