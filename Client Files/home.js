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

async function Initialize(value){
  window = value;
  var path = "/characterids";
  slotController.Initialize();
  var ids = await fetchRequest(path);
  for(i in ids){
    playerCharacters.push(new character());
    await playerCharacters[i].Initialize(i,ids[i]);
    if(i == 1){
      playerCharacters[i].showStats();
      slotController.fetchLoadout(playerCharacters[i].characterID);
    }
  }
}

function character(){
  this.htmlIdentifier;
  this.setIdentifier = function(value){
    this.htmlIdentifier = value;
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
    for(i in value) this.stats[value[i].info.displayProperties.name] = value[i].value;
  };
  this.showStats = function(){
    var keys = Object.keys(this.stats);
    for(i in keys){
      window.document.getElementById(keys[i]).innerHTML = this.stats[i];
    }
  };
  this.update(){
    window.document.getElementById("c"+this.htmlIdentifier+"-light").innerHTML = this.light;
    window.document.getElementById("c"+this.htmlIdentifier+"-race").innerHTML = this.race;
    window.document.getElementById("c"+this.htmlIdentifier+"-class").innerHTML = this.class;
    window.document.getElementById("c"+this.htmlIdentifier+"-emblem").src = bungieCommon+this.emblemURL;
  }
  this.Initialize = function(htmlID, characterID){
    this.setIdentifier(htmlID);
    this.setCID(characterID);
    return loadCharacter();
  };
  this.loadCharacter = async function(){
    var localthis = this;
    var path = "/character/"+this.characterID+"/general";
    var data = await fetchRequest(path);
    this.setLight(result.light);
    this.setRace(result.race.name);
    this.setClass(result.class.name);
    this.setEmblem(result.emblem.emblemBackgroundPath);
    this.setStats(data.stats);
    this.update();
    return true;
  };
};
function slotController(){
  this.slots = {
    Subclass: new slot("subclass"),
    KineticWeapons: new slot("kinetic"),
    EnergyWeapons: new slot("special"),
    PowerWeapons: new slot("heavy"),
    Helmet: new slot("helmet"),
    Gauntlets: new slot("gloves"),
    ChestArmor: new slot("chest"),
    LegArmor: new slot("legs"),
    ClassArmor: new slot("class-armor"),
    Ghost: new slot("ghost"),
    Vehicle: new slot("vehicle"),
    Ships: new slot("ship"),
    Emblems: new slot("emblem"),
    Finishers: new slot("finisher"),
    SeasonalArtifact: new slot("artifact"),
  };
  this.Initialize = function(){
    this.SeasonalArtifact.equipment.length = 0;
    this.Subclass.equipment.length = 4;
    for(i in this.slots){
      this.slots[i].Initialize();
    }
    console.log("All equipment slots have been initialized");
  };
  this.fetchLoadout = async function(characterID){
    this.wipe();
    var localthis = this;
    var path = "/character/"+characterID+"/equipment";
    var data = await fetchRequest(path);
    var keys = Object.keys(result.equipment);
    for(i in keys){
      this.slots[keys[i]].equip(result.equipment[keys[i]][0]);
    }
    for(i in keys){
      var equipcategory = result.inventory[keys[i]];
      for(z in equipcategory){ this.slots[keys[i]].newItem(equipcategory[z]); }
    }
  };
  this.wipe = function(){
    for(i in this.slots){
      this.slots[i].wipe();
    }
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
  var path = "/character/transferItem/"
  var body = {
    item: itemData,
    characterTransferring: tcID,
    characterReceiving: rcID,
  };
  return postRequest(path, body);
}
