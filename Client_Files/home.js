var window;
var bungieCommon = "https://www.bungie.net";
var playerCharacters = [];
var updateinprogress = false;
const sleep = (waitTimeInMs) => new Promise(resolve => setTimeout(resolve, waitTimeInMs));
async function Initialize(value){
  window = value;
  var path = "/home/data";
  let result = await fetchRequest(path).catch(function(error){ return error; });
  if(result instanceof Error){ return false; }
  console.log(result);
  var keys = Object.keys(result);
  for(i in keys){
    playerCharacters.push(new character());
    playerCharacters[i].Initialize(i,result[keys[i]]);
  }
  //updateTimer(25000);
};
function updateTimer(timer){
  console.log("starting auto update cycle.");
  sleep(timer).then(function(){ autoUpdate(timer); });
};
async function autoUpdate(timer){
  console.log("Updating inventory...");
  var startTime = new Date().getTime();
  await updateData();
  sleep(100);
  var endTime = new Date().getTime();
  console.log("Inventory updated in "+(endTime-startTime)+" milliseconds.");
  updateTimer(timer);
};
function changeCharacter(b){
  if(b === 0){ console.log("Character is already loaded."); return true; }
  var temp = playerCharacters.splice(b,1);
  playerCharacters.unshift(temp[0]);
  for(i in playerCharacters){
    playerCharacters[i].setID(i);
  }
  updateData();
};
async function updateData(){
  if(updateinprogress){
    console.log("Page update is already in progress, please wait before trying again.");
    return false;
  }
  window.document.getElementById("updateStatus").innerHTML = "Updating page...";
  updateinprogress = true;
  var path = "/home/update";
  let result = await fetchRequest(path).catch(function(error){ return error; });
  if(result instanceof Error){ updateinprogress = false; return false; }
  for(i in result){
    for(z in playerCharacters){
      var currentCheck = playerCharacters[z];
      if(currentCheck.data.characterId == i){
        currentCheck.slotController.updateInventory(result[i].itemInventory);
      }
    }
  }
  for(i in result){
    delete result[i].itemInventory;
    for(z in playerCharacters){
      var currentCheck = playerCharacters[z];
      if(currentCheck.data.characterId == i){
        currentCheck.updateCharacterUI(result[i]);
        currentCheck.showCharacterUI();
      }
    }
  }
  await sleep(500);
  playerCharacters[0].showInventoryUI(true);
  updateinprogress = false;
  window.document.getElementById("updateStatus").innerHTML = "Refresh";
  return Promise.resolve(true);
};
function itemEquip(item){
  playerCharacters[0].slotController.swapEquipped(item);
}
function character(){
  this.data;
  this.inventory;
  this.banner;
  this.id;
  this.element;
  this.setID = function(value){
    this.id = value;
    var localthis = this;
    this.element = window.document.getElementById("c"+this.id);
    this.element.onclick = function(){  changeCharacter(localthis.id); };
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
      for(i in this.data.stats){ window.document.getElementById(this.data.stats[i].info.displayProperties.name).innerHTML = this.data.stats[i].value; }
      this.showInventoryUI(true);
    }
    else { this.showInventoryUI(false); }
  };
  this.updateCharacterUI = function(data){
    for(i in data){
      this.data[i] = data[i];
    }
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
  this.swapEquipped = async function(item){
    var localthis = this;
    var slot = this.slots[item.slotName];
    let result = await equipItem(item.data, playerCharacters[0].data.characterId).catch(function(error){ return error; });
    if(result instanceof Error){ console.error(result.statusText); return false; }
    var currentEquip;
    for(i in slot)
    { if(slot[i].data.instanceData.instances.isEquipped){ currentEquip = slot[i];  }}
    currentEquip.data.instanceData.instances.isEquipped = false;
    item.data.instanceData.instances.isEquipped = true;
    item.changeParent();
    currentEquip.changeParent();
    console.log("Item has successfully been swapped.");
    this.show(true);
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
      if(this.slots[i] == undefined){ this.slots[i] = []; }
      for(z in data.Equippable[i]){
        if(data.Equippable[i][z].changed == true){
          var newItem = new Item();
          newItem.Initialize(i,this.slots[i].length,data.Equippable[i][z]);
          this.slots[i].push(newItem);
        }
        else if(data.Equippable[i][z].changed == false){
          for(n in this.slots[i]){
            if(this.slots[i][n].data.itemInstanceId === data.Equippable[i][z].itemInstanceId)
            { this.slots[i][n].destroy(); this.slots[i].splice(n,1); }
          }
        }
        else if(data.Equippable[i][z].changed == null){
          for(n in this.slots[i]){
            if(this.slots[i][n].data.itemInstanceId === data.Equippable[i][z].itemInstanceId){
              this.slots[i][n].changeData(data.Equippable[i][z]);
              this.slots[i][n].destroy();
              this.slots[i][n].changeParent(); }
          }
        }
      }
    }
    this.specialslots.postmaster = data.Invisible.LostItems;
    this.specialslots.engrams = data.Item.Engrams;
    this.specialslots.currency = data.Currency;
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
    var temp = window.document.createElement("div");
    temp.innerHTML = data.HTMLTemplate;
    this.element = temp.firstChild;
    this.changeData(data);
    this.changeParent();

    var localthis = this;
    this.element.draggable = true;
    this.element.ondragend = function(ev){ localthis.itemTransfer(ev); }
    this.element.ondblclick = function(){ itemEquip(localthis); };
  };
  this.destroy = function(isWipe){
    this.element.remove();
  };
  this.changeData = function(data){
    this.data = data;
    if(this.data.state == 4){this.element.style.outline = "2px solid gold"; }
  };
  this.show = function(bool){
    if(bool){ this.parentElement.append(this.element); }
    else{ this.element.remove();}
  };
  this.changeParent = function(){
    if(this.data.instanceData.instances.isEquipped)
    { this.parentElement = window.document.getElementById(this.slotName+"-primary-container"); }
    else
    { this.parentElement = window.document.getElementById(this.slotName+"-equipment"); }
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
      updateData();
    }
  };
};
//Fetch Request function
async function fetchRequest(path){
  var request = new Request(path, {
    method: "GET",
    headers: {"Content-Type":"application/json"},
  });
  let response = await fetch(request).catch(function(error){ return Error(); });
  console.log(response);
  if(response.status >=200 && response.status <= 300){ return response.json(); }
  else{ throw new Error(response.json()); }
};
async function postRequest(path, body){
  var request = new Request(path, {
    method: "POST",
    headers: {"Content-Type":"application/json"},
    body: JSON.stringify(body),
  });
  let response = await fetch(request).catch(function(error){ return Error(); });
  console.log(response);
  if(response.status >=200 && response.status <= 300){ return response.json(); }
  else{ console.log(response.statusText); Promise.reject(new Error(response.statusText)); }
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
async function test(cID, gamemode){
  for(var i = 0; i < 10; i+= 1){
    var path = "/historical/activity/specific/"+cID+"/"+gamemode+"/"+i;
    fetchRequest(path).then(function(result){ console.log(result); });
  }
}
async function test2(cID, gamemode){
  var path = "/historical/stats/specific/"+cID+"/"+gamemode;
  fetchRequest(path).then(function(result){ console.log(result); });
}
