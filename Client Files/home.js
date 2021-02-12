var window;
var bungieCommon = "https://www.bungie.net";
var playerCharacters = [];
var slotController = new slotController();
//A basic item so the reload() function inside of the equipment list doesn't lose it.
function placeholderItem(){
  return {
    placeholder: true,
    itemHashData:{
      displayProperties: {
        icon: "",
      },
    },
  };
};
async function Initialize(value){
  window = value;
  var path = "/characterids";
  var ids = await fetchRequest(path);
  updateLoadout(ids[0]);
  for(i in ids) {
    playerCharacters.push(new character());
    playerCharacters[i].Initialize(i, ids[i]);
  }
  updateCharacters();
};
function changeCharacter(characterlistLocation){
  if(characterlistLocation == 0){console.log("Character is already loaded.");}
  else{
    var backup = Array.from(playerCharacters);
    var temp = playerCharacters.splice(characterlistLocation,1);
    playerCharacters.unshift(temp[0]);

    for(i in playerCharacters) playerCharacters[i].setIdentifier(i);
    console.log(playerCharacters);
    console.log("done swapping places.");
    updateCharacters();
    updateLoadout(playerCharacters[0].characterID);
  }
};
function updateCharacters(){
  console.log("loading characters");
  Promise.all([playerCharacters[0].loadCharacter(),playerCharacters[1].loadCharacter(),playerCharacters[2].loadCharacter()]).then(function(values){
    for(i in playerCharacters) playerCharacters[i].update();
    playerCharacters[0].showStats();
    playerCharacters[0].showBanner();
  });

};
function updateLoadout(characterID){
  slotController.fetchLoadout(characterID).then(function(result){
    console.log("Loadout update was successful.");
    return true;
  }).catch(function(error){
    console.error("Failed to update loadout");
    console.error(error);
    return false;
  })
};
function character(){
  this.htmlIdentifier;
  this.element;
  this.banner;
  this.setIdentifier = function(value){
    this.htmlIdentifier = value;
    this.element = window.document.getElementById("c"+this.htmlIdentifier);
  };
  this.characterID;
  this.setCID = function(value){
    this.characterID = value;
  };
  this.light;
  this.setLight = function(value){
    if(value != null && value != undefined) this.light = value;
  };
  this.race;
  this.setRace = function(value){
    if(value != null && value != undefined) this.race = value;
  };
  this.class;
  this.setClass = function(value){
    if(value != null && value != undefined) this.class = value;
  };
  this.emblemURL;
  this.setEmblem = function(value){
    if(value != null && value != undefined) this.emblemURL = value;
  };
  this.setBanner = function(value){
    this.banner = "/assets/"+value+" Banner.png";
  };
  this.showBanner = function(){
    window.document.getElementById("character-banner").src = this.banner;
  };
  this.stats = {};
  this.setStats = function(value){
    for(z in value) this.stats[value[z].info.displayProperties.name] = value[z].value;
  };
  this.showStats = function(){
    var keys = Object.keys(this.stats);
    for(z in keys){
      window.document.getElementById(keys[z]).innerHTML = this.stats[keys[z]];
    }
  };
  this.update = function(){
    window.document.getElementById("c"+this.htmlIdentifier+"-light").innerHTML = this.light;
    window.document.getElementById("c"+this.htmlIdentifier+"-race").innerHTML = this.race;
    window.document.getElementById("c"+this.htmlIdentifier+"-class").innerHTML = this.class;
    window.document.getElementById("c"+this.htmlIdentifier+"-emblem").src = bungieCommon+this.emblemURL;
  }
  this.Initialize = function(htmlID, characterID){
    this.setIdentifier(htmlID);
    var localthis = this;
    this.element.ondblclick = function(){changeCharacter(localthis.htmlIdentifier);};
    this.setCID(characterID);
  };
  this.loadCharacter = async function(){
    var localthis = this;
    var path = "/character/"+this.characterID+"/general";
    var data = await fetchRequest(path);
    this.setLight(data.light);
    this.setRace(data.race.name);
    this.setClass(data.class.name);
    this.setEmblem(data.emblem.emblemBackgroundPath);
    this.setStats(data.stats);
    this.setBanner(data.class.name);
    return true;
  };
};
function slotController(){
  this.slots = {
    Subclass: [],
    KineticWeapons: [],
    EnergyWeapons: [],
    PowerWeapons: [],
    Helmet: [],
    Gauntlets: [],
    ChestArmor:[],
    LegArmor: [],
    ClassArmor: [],
    Ghost: [],
    Vehicle:[],
    Ships: [],
    Emblems: [],
    SeasonalArtifact: [],
  };
  this.wipe = function(){
    for(i in this.slots){
      var length = this.slots[i].length;
      if(length == 0) continue;
      for(var z = 0; z<length; z++){
        this.slots[i][0].destroy(true);
        this.slots[i].shift();
      }
    }
  };
  this.swapEquipped = function(slot, index){
    var item = this.slots[slot];
    item = item[index];
    var localthis = this;
    equipItem(item.data, playerCharacters[0].characterID).then(function(result){
      var currentEquip = localthis.slots[slot][0];
      var temp = Object.assign(currentEquip.data);
      var temp2 = Object.assign(item.data);
      item.changeData(temp);
      currentEquip.changeData(temp2);
      console.log("Equip request was successful.");
    }).catch(function(error){
      console.error("There was an error equipping this item.");
      console.log(error);
    });
  }
  this.fetchLoadout = async function(characterID){
    this.wipe();
    var localthis = this;
    var path = "/character/"+characterID+"/equipment";
    var data = await fetchRequest(path);
    console.log(data);
    var keys = Object.keys(data.equipment);
    console.log("Equipment");
    for(i in keys){
      var newItem = new Item();
      var newItemData = data.equipment[keys[i]];
      console.log(keys[i]);
      console.log(newItemData[0]);
      newItem.Initialize(keys[i],0,newItemData[0]);
      this.slots[keys[i]][0] = newItem;
    }
    console.log("Inventory");
    for(i in keys){
      var itemSlot = this.slots[keys[i]];
      var inventoryArray = data.inventory[keys[i]];
      for(z in inventoryArray){
        var newItem = new Item();
        newItem.Initialize(keys[i],itemSlot.length,inventoryArray[z]);
        itemSlot[itemSlot.length] = newItem;
      }
    }
  };
};

function Item(){
  this.slotName;
  this.data;
  this.index;
  this.HTMLElement;
  this.Initialize = function(slotName, index, data){
    this.slotName = slotName;
    this.index = index;
    var localthis = this;
    if(index == 0){
      this.HTMLElement = window.document.getElementById(this.slotName);
    }
    else {
      this.HTMLElement = window.document.createElement("img");
      this.HTMLElement.id = slotName+"-"+index;
      window.document.getElementById(slotName+"-equipment").append(this.HTMLElement);
      this.HTMLElement.draggable = true;
      this.HTMLElement.ondragend = function(ev){localthis.drop(ev);};
      this.HTMLElement.ondblclick = function(ev){ slotController.swapEquipped(localthis.slotName, localthis.index); };
    }
    this.changeData(data);
    if(this.data.state == "Masterwork") this.HTMLElement.style.border = "2px solid gold";
  };
  this.changeData = function(value){
    this.data = value;
    this.HTMLElement.src = bungieCommon+this.data.itemHashData.displayProperties.icon;
  }
  this.destroy = function(isWipe){
    if(this.index == 0){
      this.data = null;
      this.HTMLElement.src = "";
    }
    else {
      this.HTMLElement.remove();
      this.data = null;
      if(isWipe != true){
        slotController.slots[this.slotName].splice(this.index,1);
      }
    }
  };
  this.drop = function(ev){
    var localthis = this;
    var targetElementID = window.document.elementFromPoint(ev.clientX,ev.clientY).id.split("-")[0];
    var characterID = playerCharacters[targetElementID.slice(-1)].characterID;
    if(targetElementID == "c1" || targetElementID == "c2"){
      transferRequest(localthis.data,characterID,playerCharacters[0].characterID).then(function(result){
        console.log("transfer was successful.");
        localthis.destroy(false);
      }).catch(function(error){
        console.log("Transfer of item failed.");
        console.error(error);
      });
    }
  }
};

//Fetch Request function
async function fetchRequest(path){
  var request = new Request(path, {
    method: "GET",
    headers: {"Content-Type":"application/json"},
  });
  let response = await fetch(request);
  if(response.status >=200 && response.status < 300)
  {return response.json();}
  else
  {return Promise.reject(new Error(response.statusText));}
};
async function postRequest(path, body){
  var request = new Request(path, {
    method: "POST",
    headers: {"Content-Type":"application/json"},
    body: JSON.stringify(body),
  });
  let response = await fetch(request);
  if(response.status >=200 && response.status < 300)
  {return response.json();}
  else
  {return Promise.reject(new Error(response.statusText));}
}
//Makes requests to server for equipping new items from existing non-equipped items.
function equipItem(itemData, rcID){
  var path = "/character/equipItem";
  var body = {
    item: itemData,
    characterReceiving: rcID,
  };
  return postRequest(path, body);
}
function equipItems(items, rcID){
  var path = "/character/equipItems";
  var body = {
    items: items,
    characterReceiving: rcID,
  };
  return postRequest(path, body);
}
function lockItemState(itemData, rcID){
  var path = "/character/lockItem";
  var body = {
    item: itemData,
    characterReceiving: rcID,
  };
  return postRequest(path, body);
};
function transferRequest(itemData, rcID,tcID){ //rc=receiveing character, tc = transferring character
  var path = "/character/transferItem/";
  var body = {
    item: itemData,
    characterTransferring: tcID,
    characterReceiving: rcID,
    vaultTransfer: true,
  };
  return postRequest(path, body);
};
function test(){
  var path = "/profile/inventory/"+playerCharacters[0].characterID;
  fetchRequest(path).then(function(result){console.log(result);}).catch(function(error){console.error(error);});
};
