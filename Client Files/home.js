var window;
var bungieCommon = "https://www.bungie.net";
var playerCharacters = [];
var slotController = new slotController();
const sleep = (waitTimeInMs) => new Promise(resolve => setTimeout(resolve, waitTimeInMs));
async function Initialize(value){
  window = value;
  var path = "/characterids";
  var ids = await fetchRequest(path);
  console.log(ids);
  if(ids instanceof Error){ console.log("Unable to obtain characters."); };
  for(i in ids){
    playerCharacters.push(new character());
    console.log(playerCharacters[i]);
    console.log(i);
    playerCharacters[i].Initialize(i, ids[i]);
  }
  updateCharacters();
  updateTimer(30000);
};
function updateTimer(timer){
  console.log("starting auto update cycle.");
  sleep(timer).then(function(){ autoUpdate(timer); });
};
async function autoUpdate(timer){
  console.log("Updating page...");
  await updateCharacters();
  console.log("Page update finished.");
  updateTimer(timer);
};
function changeCharacter(characterlistLocation){
  if(characterlistLocation == 0){ console.log("Character is already loaded."); return true; }
  var temp = playerCharacters.splice(characterlistLocation,1);
  var temp2 = playerCharacters.shift();
  playerCharacters.unshift(temp2);
  playerCharacters.push(temp[0]);
  for(i in playerCharacters){ playerCharacters[i].setID(i); }
  updateCharacters();
};
async function updateCharacters(){
  slotController.fetchLoadout(playerCharacters[0].characterId).catch(function(error){ console.error(error); });
  let result = await Promise.all([playerCharacters[0].loadCharacter(),playerCharacters[1].loadCharacter(),playerCharacters[2].loadCharacter()]).catch(function(error){ return error; });
  if(result instanceof Error) { console.error(result); return false; }
  updateGUI();
  return true;
};
function updateGUI(){
  playerCharacters[0].update();
  playerCharacters[1].update();
  playerCharacters[2].update();
};
function character(){
  this.id;
  this.element;
  this.setID = function(value){
    this.id = value;
    this.element = window.document.getElementById("c"+this.id);
  };
  this.characterId;
  this.light;
  this.race;
  this.class;
  this.emblem;
  this.setEmblem = function(value){ this.emblem = bungieCommon+value; };
  this.banner;
  this.setBanner = function(value){ this.banner = "/assets/"+value+" Banner.png"; };
  this.stats = {};
  this.setStats = function(value){
    for(z in value) this.stats[value[z].info.displayProperties.name] = value[z].value;
  };
  this.update = function(){
    window.document.getElementById("c"+this.id+"-light").innerHTML = this.light;
    window.document.getElementById("c"+this.id+"-race").innerHTML = this.race;
    window.document.getElementById("c"+this.id+"-class").innerHTML = this.class;
    window.document.getElementById("c"+this.id+"-emblem").src = this.emblem;
    if(this.id == 0){
      window.document.getElementById("character-banner").src = this.banner;
      for(i in this.stats){ window.document.getElementById(i).innerHTML = this.stats[i]; }
    }
  }
  this.Initialize = function(id, characterId){
    this.setID(id);
    this.characterId = characterId;
    this.element.ondblclick = function(){ changeCharacter(this.id); };

  };
  this.loadCharacter = async function(){
    var path = "/character/"+this.characterId+"/general";
    var data = await fetchRequest(path).catch(function(error){ return error; });
    if(data instanceof Error){ Promise.reject(data); }
    this.light = data.light;
    this.race = data.race.displayProperties.name;
    this.class = data.class.displayProperties.name;
    this.setEmblem(data.emblemBackgroundPath);
    this.setBanner(data.class.displayProperties.name);
    this.setStats(data.stats);
    return Promise.resolve(true);
  };
};

function slotController(){
  this.slots = {};
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
  this.swapEquipped = function(slot, index, html){
    var item = this.slots[slot];
    item = item[index];
    var localthis = this;
    equipItem(item.data, playerCharacters[0].characterId).then(function(result){
      var currentEquip = localthis.slots[slot][0];
      var temp = Object.assign(currentEquip.data);
      var temp2 = Object.assign(item.data);
      var tempH = currentEquip.HTMLTemplate.cloneNode(true).innerHTML;
      var temp2H = item.HTMLTemplate.cloneNode(true).innerHTML;
      item.changeData(temp);
      currentEquip.changeData(temp2);
      item.changeHTML(tempH);
      currentEquip.changeHTML(temp2H);
      console.log(localthis.slots[slot][0]);
      console.log(localthis.slots[slot][index]);
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
    var data = await fetchRequest(path).catch(function(error){ return error; });
    if(data instanceof Error) {console.error(data); return false;}
    console.log(data);
    for(i in data.inventory){
      if(this.slots[i] == undefined){ this.slots[i] = []; }
      for(z in data.inventory[i]){
        var newItem = new Item();
        newItem.Initialize(i,this.slots[i].length,data.inventory[i][z]);
        this.slots[i].push(newItem);
      }
    }
  };
};

function Item(){
  this.slotName;
  this.data;
  this.index;
  this.HTMLTemplate;
  this.Initialize = function(slotName, index, data){
    this.slotName = slotName;
    this.index = index;
    var parent;
    if(data.equipped){ parent = window.document.getElementById(this.slotName+"-primary-container"); }
    else { parent = window.document.getElementById(this.slotName+"-equipment"); }
    var temp = window.document.createElement("div");
    temp.innerHTML = data.HTMLTemplate;
    parent.append(temp.firstChild);
    this.changeData(data);
    this.HTMLTemplate = window.document.getElementById(this.data.htmlId);
    this.changeHTML(this.HTMLTemplate.innerHTML);
  };
  this.changeData = function(value){
    this.data = value;
  };
  this.changeHTML = function(value){
    this.HTMLTemplate.innerHTML = value;
    var children = this.HTMLTemplate.children;
    var localthis = this;
    this.HTMLTemplate.draggable = true;
    this.HTMLTemplate.ondragend = function(ev){localthis.drop(ev);};
    this.HTMLTemplate.ondblclick = function(ev){ slotController.swapEquipped(localthis.slotName, localthis.index); };
  };
  this.destroy = function(isWipe){
    if(this.index == 0){
      this.data = null;
      this.HTMLTemplate.remove();
    }
    else {
      this.HTMLTemplate.remove();
      this.data = null;
      if(isWipe){ return true; }
      slotController.slots[this.slotName].splice(this.index,1);
    }
  };
  this.drop = async function(ev){
    var localthis = this;
    var targetElementID = window.document.elementFromPoint(ev.clientX,ev.clientY).id.split("-")[0];
    var characterID;
    try{
      characterID = playerCharacters[targetElementID.slice(-1)].characterId;
    }
    catch(TypeError){
      console.error("That's not a character");
      return false;
    }
    if(targetElementID == "c1" || targetElementID == "c2"){
      var result = await transferRequest(localthis.data, characterID, playerCharacters[0].characterId);
      if(result instanceof Error){ alert("Unable to transfer item."); return false; }
      alert("transfer was successful.");
      localthis.destroy(false);
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
  if(response.status >=200 && response.status < 300){ return response.json(); }
  else{ return new Error(response.statusText); }
};
async function postRequest(path, body){
  var request = new Request(path, {
    method: "POST",
    headers: {"Content-Type":"application/json"},
    body: JSON.stringify(body),
  });
  let response = await fetch(request);
  if(response.status >=200 && response.status < 300){ return response.json(); }
  else{ return new Error(response.statusText); }
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
    quantity: itemData.quantity,
    itemHash: itemData.itemHash,
    itemInstanceId: itemData.itemInstanceId,
    characterTransferring: tcID,
    characterReceiving: rcID,
  };
  return postRequest(path, body);
};
