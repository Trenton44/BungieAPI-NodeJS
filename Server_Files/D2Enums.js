const path = require("path");
const bungieRoot = "https://www.bungie.net/Platform";
const bungieAuthURL = "https://www.bungie.net/en/OAuth/Authorize";
const bungieTokURL = bungieRoot+"/app/oauth/token/";
const bungieCommon = "https://www.bungie.net";
const root = path.join(__dirname,'..');

const serverRoot = root+"/Server_Files";
const assetRoot = root+"/Asset_Files";
const manifestRoot = root+"/Manifest_Files";

const BucketCategory = {
  "0": "Invisible",
  "1": "Item",
  "2": "Currency",
  "3": "Equippable",
  "4": "Ignored",
};
exports.BucketCategory = BucketCategory;

const ItemLocation = {
  "0": "Unknown",
  "1": "Inventory",
  "2": "Vault",
  "3": "Vendor",
  "4": "Postmaster",
};
exports.ItemLocation = ItemLocation;

const ItemState = {
  "0": "None",
  "1": "Locked",
  "2": "Tracked",
  "4": "Masterwork",
};
exports.ItemState = ItemState;

const TierType = {
  "0": "Unkown",
  "1": "Currency",
  "2": "Basic",
  "3": "Common",
  "4": "Rare",
  "5": "Superior",
  "6": "Exotic",
};
exports.TierType = TierType;

const BucketScope = {
  "0": "Character",
  "1": "Account",
};
exports.BucketScope = BucketScope;

const StatAggregationType = {
  "0": "CharacterAverage",    //apply a weighted average using the related DestinyStatGroupDefinition on the DestinyInventoryItemDefinition across the character's equipped items
  "1": "Character",           //don't aggregate: the stat should be located and used directly on the character
  "2": "Item",                //don't aggregate: the stat should be located and used directly on the character
};
exports.StatAggregationType = StatAggregationType;

const StatCategory = {
  "0": "Gameplay",
  "1": "Weapon",
  "2": "Defense",
  "3": "Primary",
}
exports.StatCategory = StatCategory;

const EquippingItemBlockAttributes = {
  "0": "None",
  "1": "EquipOnAquire",
};
exports.EquippingItemBlockAttributes = EquippingItemBlockAttributes;

const AmmunitionType = {
  "0": "None",
  "1": "Primary",
  "2": "Special",
  "3": "Heavy",
  "4": "Unkown",
};
exports.AmmunitionType = AmmunitionType;

const VendorProgressionType = {
  "0": "Default",       //The original rank progression from token redemption.
  "1": "Ritual",        //Progression from ranks in ritual content. For example: Crucible (Shaxx), Gambit (Drifter), and Season 13 Battlegrounds (War Table).
};
exports.VendorProgressionType = VendorProgressionType;

const VendorDisplayCategorySortOrder = {
  "0": "Default",
  "1": "SortByTier",
};
exports.VendorDisplayCategorySortOrder = VendorDisplayCategorySortOrder;

const VendorReplyType = {
  "0": "Accept",
  "1": "Decline",
  "2": "Complete",
};
exports.VendorReplyType = VendorReplyType;

const ItemSortType = {
  "0": "ItemId",
  "1": "Timestamp",
  "2": "StackSize",
};
exports.ItemSortType = ItemSortType;

const DamageType = {
  "0": "None",
  "1": "Kinetic",
  "2": "Arc",
  "3": "Thermal",
  "4": "Void",
  "5": "Raid",
  "6": "Stasis",
};
exports.DamageType = DamageType;

const ActivityModeType = {
  "None": "0",
  "Story": "2",
  "Strike": "3",
  "Raid": "4",
  "AllPvP": "5",
  "Patrol": "6",
  "AllPvE": "7",
  "Reserved9": "9",
  "Control": "10",
  "Reserved11": "11",
  "Clash": "12",
};
exports.ActivityModeType = ActivityModeType;
