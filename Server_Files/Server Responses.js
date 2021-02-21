const path = require("path");
const bungieRoot = "https://www.bungie.net/Platform";
const bungieAuthURL = "https://www.bungie.net/en/OAuth/Authorize";
const bungieTokURL = bungieRoot+"/app/oauth/token/";
const bungieCommon = "https://www.bungie.net";
const root = path.join(__dirname,'..');

const serverRoot = root+"/Server_Files";
const assetRoot = root+"/Asset_Files";
const manifestRoot = root+"/Manifest_Files";

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

var SubclassResponseFormat = function(item,i,z){
  var format = ItemResponseFormat(item,i,z);
  format.equipped = item.instances.isEquipped;
  format.HTMLTemplate = "<div class=subclass-capsule id="+format.htmlId+"><img subclass-icon src='"+format.itemIcon+"' /></div>";
  return format;
};
exports.SubclassResponseFormat = SubclassResponseFormat;

var WeaponResponseFormat = function(item,i,z){
  var format = ItemResponseFormat(item,i,z);
  //format.energyIcon = bungieCommon+item.instances.damageTypeData.displayProperties.icon;
  format.light = item.instances.primaryStat.value;
  format.stats = item.stats;
  format.equipped = item.instances.isEquipped;
  format.flavorText = item.itemHashData.flavorText;
  format.overlay = bungieCommon+item.itemHashData.iconWatermark;
  format.HTMLTemplate = "<div class=item-capsule id='"+format.htmlId+"'><img class=item-icon src='"+format.itemIcon+"' /><img class=item-overlay src='"+format.overlay+"' /><img class=item-type src='"+format.energyIcon+"' /><h1 class=item-light>"+format.light+"</h1></div>";
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
  format.flavorText = item.itemHashData.flavorText;
  format.equipped = item.instances.isEquipped;
  if(item.itemHashData.iconWatermark !== undefined)
  { format.overlay = bungieCommon+item.itemHashData.iconWatermark; }
  else {format.overlay = ""; }

  format.HTMLTemplate = "<div class=item-capsule id='"+format.htmlId+"'><img class=item-icon src='"+format.itemIcon+"' /><img class=item-overlay src='"+format.overlay+"' /><img class=item-type src='"+format.energyIcon+"' /><h1 class=item-light>"+format.light+"</h1></div>";
  return format;
};
exports.ArmorResponseFormat = ArmorResponseFormat;

var CosmeticResponseFormat = function(item,i,z){
  var format = ItemResponseFormat(item,i,z);
  format.flavorText = item.itemHashData.flavorText;
  format.equipped = item.instances.isEquipped;
  format.HTMLTemplate = "<div class=item-capsule id='"+format.htmlId+"'><img class=item-icon src='"+format.itemIcon+"' /></div>";
  return format;
};
exports.CosmeticResponseFormat = CosmeticResponseFormat;

var EmblemResponseFormat = function(item,i,z){
  var format = ItemResponseFormat(item,i,z);
  format.equipped = item.instances.isEquipped;
  format.HTMLTemplate = "<div class=item-capsule id='"+format.htmlId+"'><img class=item-icon src='"+format.itemIcon+"' /></div>";
  return format;

};
exports.EmblemResponseFormat = EmblemResponseFormat;

var ItemResponseFormat = function(item,i,z){
  var screenshot;
  if(item.itemHashData.screenshot !== undefined){ screenshot = bungieCommon+item.itemHashData.screenshot; }
  else{ screenshot = bungieCommon+item.itemHashData.displayProperties.icon; }
  return {
    htmlId: i+"-"+z,
    itemIcon: bungieCommon+item.itemHashData.displayProperties.icon,
    itemHash: item.itemHash,
    flavorText: "",
    bucketHash: item.bucketHash,
    bucketCategory: item.bucketHashData.category,
    transferStatus: item.transferStatus,
    name: item.itemHashData.displayProperties.name,
    itemInstanceId: item.itemInstanceId,
    location: item.location,
    lockable: item.lockable,
    quantity: item.quantity,
    state: item.state,
    flavortext: item.flavortext,
    screenshot: screenshot,
    HTMLTemplate: "<div class=item-capsule id='"+i+"-"+z+"'><img class=item-icon src='"+bungieCommon+item.itemHashData.displayProperties.icon+"' /> </div>",
  };
};
exports.ItemResponseFormat = ItemResponseFormat;
