const path = require("path");
const bungieRoot = "https://www.bungie.net/Platform";
const bungieAuthURL = "https://www.bungie.net/en/OAuth/Authorize";
const bungieTokURL = bungieRoot+"/app/oauth/token/";
const bungieCommon = "https://www.bungie.net";
const root = path.join(__dirname,'..');

const serverRoot = root+"/Server_Files";
const assetRoot = root+"/Asset_Files";
const manifestRoot = root+"/Manifest_Files";

//This isn't an api enum, rather one i made to add an html string so front-end would
//have an easier time rendering important item details for the time being.
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
  SeasonalArtifact: "ItemResponseFormat",
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

var CharactersResponse = function(items){
  var itemscopy = Array.from(items);
  for(i in itemscopy){
    itemscopy[i] = CharacterResponse(itemscopy[i]);
  }
};
exports.CharactersResponse = CharactersResponse;

var SubclassResponseFormat = function(item){
  var itemIcon = bungieCommon+item.itemHashData.displayProperties.icon;
  return "<div class=subclass-capsule id="+item.itemInstanceId+"><img subclass-icon src='"+itemIcon+"' /></div>";
};
exports.SubclassResponseFormat = SubclassResponseFormat;

var WeaponResponseFormat = function(item){
  var energyIcon = bungieCommon+item.instanceData.instances.damageTypeData.displayProperties.icon;
  var light = item.instanceData.instances.primaryStat.value;
  if(item.itemHashData.iconWatermark !== undefined)
  { overlay = bungieCommon+item.itemHashData.iconWatermark; }
  else {overlay = "https://www.bungie.net/common/destiny2_content/icons/0dac2f181f0245cfc64494eccb7db9f7.png"; }
  var itemIcon = bungieCommon+item.itemHashData.displayProperties.icon;
  return "<div class=item-capsule id='"+item.itemInstanceId+"'><img class=item-icon src='"+itemIcon+"' /><img class=item-overlay src='"+overlay+"' /><img class=item-type src='"+energyIcon+"' /><h1 class=item-light>"+light+"</h1></div>";
};
exports.WeaponResponseFormat = WeaponResponseFormat;

var ArmorResponseFormat = function(item){
  var light;
  if(item.instanceData.instances.primaryStat !== undefined)
  { light = item.instanceData.instances.primaryStat.value; }
  else{ light = 0; }
  var energyIcon;
  if(item.instanceData.instances.energy !== undefined)
  { energyIcon = bungieCommon+item.instanceData.instances.energy.data.displayProperties.icon;}
  else { energyIcon = ""; }
  var overlay;
  if(item.itemHashData.iconWatermark !== undefined)
  { overlay = bungieCommon+item.itemHashData.iconWatermark; }
  else {overlay = "https://www.bungie.net/common/destiny2_content/icons/0dac2f181f0245cfc64494eccb7db9f7.png"; }
  var itemIcon = bungieCommon+item.itemHashData.displayProperties.icon;
  return "<div class=item-capsule id='"+item.itemInstanceId+"'><img class=item-icon src='"+itemIcon+"' /><img class=item-overlay src='"+overlay+"' /><img class=item-type src='"+energyIcon+"' /><h1 class=item-light>"+light+"</h1></div>";
};
exports.ArmorResponseFormat = ArmorResponseFormat;

var CosmeticResponseFormat = function(item){
  var itemIcon = bungieCommon+item.itemHashData.displayProperties.icon;
  return "<div class=item-capsule id='"+item.itemInstanceId+"'><img class=item-icon src='"+itemIcon+"' /></div>";
};
exports.CosmeticResponseFormat = CosmeticResponseFormat;

var EmblemResponseFormat = function(item){
  var itemIcon = bungieCommon+item.itemHashData.displayProperties.icon;
  return "<div class=item-capsule id='"+item.itemInstanceId+"'><img class=item-icon src='"+itemIcon+"' /></div>";

};
exports.EmblemResponseFormat = EmblemResponseFormat;

var ItemResponseFormat = function(item){
  var itemIcon = bungieCommon+item.itemHashData.displayProperties.icon;
  return "<div class=item-capsule id='"+item.itemHash+"'><img class=item-icon src='"+itemIcon+"' /></div>";
};
exports.ItemResponseFormat = ItemResponseFormat;
