var window;
var bungieCommon = "https://www.bungie.net";
var playerCharacters = [];
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
    var temp2 = playerCharacters.shift();
    playerCharacters.unshift(temp2);
    playerCharacters.push(temp[0]);
    for(i in playerCharacters) playerCharacters[i].setIdentifier(i);
    updateCharacters(backup);
  }
};
function updateCharacters(backup){
  console.log("loading characters");
  Promise.all([playerCharacters[0].loadCharacter(),playerCharacters[1].loadCharacter(),playerCharacters[2].loadCharacter()]).then(function(values){
    for(i in playerCharacters) playerCharacters[i].update();
    playerCharacters[0].showStats();
    /*slotController.fetchLoadout(playerCharacters[0].characterID).then(function(result){
      console.log("character data has been successfully retrieved, loading data now.");

    }).catch(function(error){
      if(backup != null || backup != undefined) playerCharacters = backup;
      console.error("an error occurred that prevented your characters from being loaded.");
    });*/
  });
};
function character(){
  this.htmlIdentifier;
  this.element;
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
    this.element.ondblclick = function(){changeCharacter(this.htmlIdentifier);};
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
    Finishers: [],
    SeasonalArtifact: [],
  };
  this.wipe = function(){
    for(i in this.slots){
      this.slots[i].length = 0;
    }
  };

  this.fetchLoadout = async function(characterID){
    console.log("All arrays currently.");
    for(e in this.slots) console.log(this.slots[e]);
    var localthis = this;
    var path = "/character/"+characterID+"/equipment";
    var data = await fetchRequest(path);
    var keys = Object.keys(data.equipment);
    console.log("Entering equipment items.");
    console.log(data);
    for(i in keys){
      var newItem = new Item();
      newItem.Initialize(this.slots[keys[i]],0,data.equipment[keys[i]][0]);
      this.slots[keys[i]][0] = newItem;
    }
    console.log("Entering inventory Items: ");
    for(i in keys){
      var itemSlot = this.slots[keys[i]];
      var inventoryArray = data.inventory[keys[i]];
      for(z in inventoryArray){
        var newItem = new Item();
        newItem.Initialize(itemSlot,itemSlot.length,inventoryArray[z]);
        itemSlot[itemSlot.length] = newItem;
      }
    }
    console.log(this.slots);
  };
};

function Item(){
  this.parent;
  this.data;
  this.index;
  this.HTMLElement;
  this.Initialize = function(parent, index, data){
    console.log(Object.keys(parent));
    this.parent = parent;
    this.index = index;
    this.data = data;
  };
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
  console.log(body);
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
    cID: rcID,
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
  if(tcID == null || tcID == undefined) tcID = playerCharacters[0].characterID;
  var path = "/character/transferItem/";
  console.log(itemData);
  var body = {
    item: itemData,
    characterTransferring: tcID,
    characterReceiving: rcID,
  };
  return postRequest(path, body);
};
