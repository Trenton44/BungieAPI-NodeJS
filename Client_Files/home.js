var window;
var bungieCommon = "https://www.bungie.net";
var playerCharacters = [];
const sleep = (waitTimeInMs) => new Promise(resolve => setTimeout(resolve, waitTimeInMs));
async function Initialize(value){
  window = value;
  var path = "/home/data";
  let result = await fetchRequest(path).catch(function(error){ return error; });
  if(result instanceof Error){ return false; }
  var keys = Object.keys(result);
  console.log(keys);
  for(i in keys){
    playerCharacters.push(new character());
    playerCharacters[i].Initialize(i,result[keys[i]]);
  }
  updateTimer(25000);
};
function updateTimer(timer){
  console.log("starting auto update cycle.");
  sleep(timer).then(function(){ autoUpdate(timer); });
};
async function autoUpdate(timer){
  console.log("Updating inventory...");
  await updateInventory();
  console.log("Page update finished.");
  updateTimer(timer);
};
function changeCharacter(b){
  if(b === 0){ console.log("Character is already loaded."); return true; }
  var temp = playerCharacters.splice(b,1);
  playerCharacters.unshift(temp[0]);
  for(i in playerCharacters){
    playerCharacters[i].setID(i);
  }
};
async function updateInventory(){
  var path = "/home/update";
  let result = await fetchRequest(path).catch(function(error){ return error; });
  if(result instanceof Error){ return false; }
  for(i in result){
    for(z in playerCharacters){
      if(playerCharacters[z].data.characterId == i){ playerCharacters[z].slotController.updateInventory(result[i]); }
    }
  }
  await sleep(500);
  playerCharacters[0].showInventoryUI(true);
  console.log("finished updating inventory.");
  return Promise.resolve(true);
};
async function transferItem(ev, item){
  console.log(ev);
  console.log(item);
};
function character(){
  this.data;
  this.inventory;
  this.banner;
  this.id;
  this.element;
  this.setID = function(value){
    this.id = value;
    console.log(this.id);
    var localthis = this;
    this.element = window.document.getElementById("c"+this.id);
    this.element.ondblclick = function(){  changeCharacter(localthis.id); };
    this.showCharacterUI();
  };
  this.Initialize = function(index, data){
    this.data = data;
    this.slotController = new slotController();
    this.slotController.Initialize(this.data.itemInventory);
    this.banner = "/assets/"+this.data.class.displayProperties.name+" Banner.png";
    this.setID(index);
  }
  this.showCharacterUI = function(){
    window.document.getElementById("c"+this.id+"-light").innerHTML = this.data.light;
    window.document.getElementById("c"+this.id+"-race").innerHTML = this.data.race.displayProperties.name;
    window.document.getElementById("c"+this.id+"-class").innerHTML = this.data.class.displayProperties.name;
    window.document.getElementById("c"+this.id+"-emblem").src = bungieCommon+this.data.emblemBackgroundPath;
    if(this.id == 0){
      window.document.getElementById("character-banner").src = this.banner;
      //for(i in this.data.stats){ window.document.getElementById(i).innerHTML = this.data.stats[i]; }
      this.showInventoryUI(true);
    }
    else {
      this.showInventoryUI(false);
    }
  };
  this.updateCharacterUI = function(){

  };
  this.showInventoryUI = function(bool){
    this.slotController.show(bool);
  };
};

function slotController(){
  this.slots;
  this.specialslots;
  this.Initialize = function(data){
    this.slots = {};
    this.specialslots = {};
    for(i in data.Equippable){
      if(this.slots[i] == undefined){ this.slots[i] = [];}
      for(z in data.Equippable[i]){
        localthis = this;
        var newItem = new Item();
        newItem.Initialize(i,this.slots[i].length,data.Equippable[i][z]);
        this.slots[i].push(newItem);
      }
    }
    this.specialslots.postmaster = data.Invisible.LostItems;
    this.specialslots.engrams = data.Item.Engrams;
    this.specialslots.currency = data.Currency;
  };
  this.swapEquipped = function(item){
    console.log(item);
  };
  this.wipe = function(){
    for(i in this.slots){
      var length = this.slots[i].length;
      if(length == 0) continue;
      for(var z = 0; z<length; z++){
        this.slots[i][0].destroy();
      }
    }
  };
  this.updateInventory = function(data){
    for(i in data.Equippable){
      if(this.slots[i] == undefined){ this.slots[i] = [];}
      for(z in data.Equippable[i]){
        if(data.Equippable[i][z].changed == true){
          console.log("an item has been added to this category.");
          var newItem = new Item();
          newItem.Initialize(i,this.slots[i].length,data.Equippable[i][z]);
          newItem.element.ondblclick = function(ev){ localthis.swapEquipped(newItem); };
          this.slots[i].push(newItem);
        }
        else if(data.Equippable[i][z].changed == false){
          console.log("this item has been removed from this category");
          for(n in this.slots[i]){
            if(this.slots[i][n].data.itemInstanceId === data.Equippable[i][z].itemInstanceId)
            { this.slots[i][n].destroy(); this.slots[i].splice(n,1); }
          }
        }
      }
    }
    this.updateItemIndexes();
  };
  this.updateItemIndexes = function(){
    for(i in this.slots){
      for(z in this.slots[i]){
        this.slots[i][z].index = z;
      }
    }
  };
  this.show = function(bool){
    for(i in this.slots){
      for(z in this.slots[i]){
        this.slots[i][z].show(bool);
      }
    }
  };
};

function Item(){
  this.slotName;
  this.data;
  this.index;
  this.element;
  this.parentElement;
  this.Initialize = function(slotName, index, data){
    this.slotName = slotName;
    this.index = index;
    this.data = data;
    if(this.data.instanceData.instances.isEquipped)
    { this.parentElement = window.document.getElementById(this.slotName+"-primary-container"); }
    else
    { this.parentElement = window.document.getElementById(this.slotName+"-equipment"); }
    this.element = window.document.createElement("img");
    this.element.id = this.data.itemInstanceId;
    this.element.src = bungieCommon+this.data.itemHashData.displayProperties.icon;
    var localthis = this;
    this.element.draggable = true;
    this.element.ondragend = function(ev){ localthis.itemTransfer(ev); }
  };
  this.destroy = function(isWipe){
    this.element.remove();
  };
  this.show = function(bool){
    if(bool){ this.parentElement.append(this.element); }
    else{ this.element.remove();}
  };
  this.itemTransfer = async function(ev){
    var localthis = this;
    var targetElementID = window.document.elementFromPoint(ev.clientX,ev.clientY).id.split("-")[0];
    var characterID;
    try{
      characterID = playerCharacters[targetElementID.slice(-1)].data.characterId;
    }
    catch(TypeError){
      console.error("That's not a character");
      return false;
    }
    if(targetElementID == "c1" || targetElementID == "c2"){
      var result = await transferRequest(localthis.data, characterID, playerCharacters[0].data.characterId).catch(function(error){ return error; });
      if(result instanceof Error){ alert("Unable to transfer item."); return false; }
      console.log("transfer was successful.");
      await sleep(500);
      updateInventory();
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
  if(response.status >=200 && response.status < 300){ return response.json(); }
  else{ Promise.reject(response.json().error); }
};
async function postRequest(path, body){
  var request = new Request(path, {
    method: "POST",
    headers: {"Content-Type":"application/json"},
    body: JSON.stringify(body),
  });
  let response = await fetch(request);
  if(response.status >=200 && response.status < 300){ console.log(response.status); return response.json(); }
  else{ Promise.reject(response.json().error); }
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
  console.log(rcID);
  console.log(tcID);
  var body = {
    quantity: itemData.quantity,
    itemHash: itemData.itemHash,
    itemInstanceId: itemData.itemInstanceId,
    characterTransferring: tcID,
    characterReceiving: rcID,
  };
  return postRequest(path, body);
};
