var window;
var bungieCommon = "https://www.bungie.net";
var playerCharacters = [];
var vaultController = new Vault();
async function Initialize(value){
  window = value;
  var path = "/characterids";
  var ids = await fetchRequest(path);
  for(i in ids) {
    playerCharacters.push(new character());
    playerCharacters[i].Initialize(i, ids[i]);
  }
  Promise.all([playerCharacters[0].loadCharacter(),playerCharacters[1].loadCharacter(),playerCharacters[2].loadCharacter()]).then(function(values){
    for(i in playerCharacters) playerCharacters[i].update();
    vaultController.fetchLoadout();
  });
};
function updateCharacters(){
  console.log("loading characters");

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
function Vault(){
  this.vaultItems = {};
  this.wipe = function(){
    var length = this.vaultItems.length;
    for(var z = 0; z<length; z++){
      this.vaultItems[0].destroy(true);
      this.vaultItems.shift();
    }
  };
  this.fetchLoadout = async function(){
    this.wipe();
    var path = "/profile/vault";
    var data = await fetchRequest(path);
    console.log(data);
    for(i in data){
      console.log("New array: "+i);
      console.log("Data in array: ");
      console.log(data[i]);
      if(this.vaultItems[i] == undefined){
        var container = window.document.createElement("div");
        container.id = i;
        window.document.getElementById("vault-equipment").append(container);
        this.vaultItems[i] = [];
      }
      for(z in data[i]){
        var newItem = new Item();
        newItem.Initialize(i,z,data[i][z]);
        this.vaultItems[i].push(newItem);
      }
    }
    console.log(this.vaultItems);
  };
};
function Item(){
  this.data;
  this.index;
  this.slotName;
  this.HTMLElement;
  this.Initialize = function(slotName, index, data){
    this.index = index;
    this.slotName = slotName;
    var localthis = this;
    this.container = window.document.createElement("div");
    this.HTMLElement = window.document.createElement("img");
    this.HTMLElement.id = "vault-item-"+index;
    window.document.getElementById(this.slotName).append(this.HTMLElement);
    this.HTMLElement.draggable = true;
    this.HTMLElement.ondragend = function(ev){localthis.drop(ev);};
    this.changeData(data);
    if(this.data.state == "Masterwork") this.HTMLElement.style.border = "2px solid gold";
  };
  this.changeData = function(value){
    this.data = value;
    this.HTMLElement.src = bungieCommon+this.data.itemHashData.displayProperties.icon;
  }
  this.destroy = function(isWipe){
      this.HTMLElement.remove();
      this.data = null;
      if(isWipe) return true;
      console.log(vaultController);
      console.log(this.slotName);
      vaultController.vaultItems[this.slotName].splice(this.index,1);
  };
  this.drop = function(ev){
    var localthis = this;
    var targetElementID = window.document.elementFromPoint(ev.clientX,ev.clientY).id.split("-")[0];
    try{
      var characterID = playerCharacters[targetElementID.slice(-1)].characterID;
    }
    catch(TypeError){
      console.error("That's not a character");
      return false;
    }
    transferRequest(localthis.data,characterID).then(function(result){
      console.log("transfer was successful.");
      localthis.destroy(false);
    }).catch(function(error){
      console.log("Transfer of item failed.");
      console.error(error);
    });
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
  };
  return postRequest(path, body);
};
