var window;
var bungieCommon = "https://www.bungie.net";
var playerCharacters = [];
var vaultController = new Vault();
const sleep = (waitTimeInMs) => new Promise(resolve => setTimeout(resolve, waitTimeInMs));
async function Initialize(value){
  window = value;
  var path = "/vault/data";
  let result = await fetchRequest(path).catch(function(error){ return error; });
  if(result instanceof Error){ return false; }
  vaultController.Initialize(result.profileInventory);
  var characters = result.characters;
  var keys = Object.keys(characters);
  for(i in keys){
    playerCharacters.push(new character());
    playerCharacters[i].Initialize(i,characters[keys[i]]);
  }
  updateTimer(25000);
};

function updateTimer(timer){
  console.log("restarting auto update cycle.");
  sleep(timer).then(function(){ autoUpdate(timer); });
};
async function autoUpdate(timer){
  console.log("Updating inventory...");
  var startTime = new Date().getTime();
  await updateInventory();
  sleep(100);
  var endTime = new Date().getTime();
  console.log("Inventory updated in "+(endTime-startTime)+" milliseconds.");
  updateTimer(timer);
};
async function updateInventory(){
  var path = "/vault/update";
  let updateData = await fetchRequest(path).catch(function(error){ return error; });
  if(updateData instanceof Error){ return false; }

  vaultController.updateInventory(updateData.profileInventory);
  for(i in updateData.characters){
    for(z in playerCharacters){
      var currentCheck = playerCharacters[z];
      if(currentCheck.data.characterId == i){
        currentCheck.data = updateData.characters[i];
        currentCheck.showCharacterUI();
      }
    }
  }
  await sleep(500);
  vaultController.show(true);
  return Promise.resolve(true);
};
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
    this.showCharacterUI();
  };
  this.Initialize = function(index, data){
    this.data = data;
    this.setID(index);
  }
  this.showCharacterUI = function(){
    window.document.getElementById("c"+this.id+"-light").innerHTML = this.data.light;
    window.document.getElementById("c"+this.id+"-race").innerHTML = this.data.race.displayProperties.name;
    window.document.getElementById("c"+this.id+"-class").innerHTML = this.data.class.displayProperties.name;
    window.document.getElementById("c"+this.id+"-emblem").src = bungieCommon+this.data.emblemBackgroundPath;
  };
};
function Vault(){
  this.vaultItems = {};
  this.Initialize = async function(data){
    for(i in data){
      for(z in data[i]){
        if(this.vaultItems[z] == undefined){
          var subMenu = window.document.createElement("div");
          var descriptor = window.document.createElement("h1");
          descriptor.innerHTML = z;
          var container = window.document.createElement("div");
          container.id = z;
          subMenu.append(descriptor);
          subMenu.append(container);
          window.document.getElementById("vault-equipment").append(subMenu);
          this.vaultItems[z] = [];
        }
        for(y in data[i][z]){
          var localthis = this;
          var newItem = new Item();
          newItem.Initialize(z,y,data[i][z][y]);
          newItem.element.ondblclick = function(ev){ localthis.swapEquipped(newItem); };
          this.vaultItems[z].push(newItem);
        }
      }
    }
    this.show(true);
  };
  this.updateInventory = function(data){
    for(i in data){
      for(z in data[i]){
        if(this.vaultItems[z] == undefined){ this.vaultItems[z] = []; }
        for(y in data[i][z]){
          if(data[i][z][y].itemInstanceId === undefined){
            for(n in this.vaultItems[z]){
              if(this.vaultItems[z][n].data.itemHash === data[i][z][y].itemHash){
                this.vaultItems[z][n].changeData(data[i][z][y]);
                this.vaultItems[z][n].destroy();
                }
              }
            }
          }
          if(data[i][z][y].changed == true){
            var localthis = this;
            var newItem = new Item();
            newItem.Initialize(z,this.vaultItems[z].length,data[i][z][y]);
            newItem.element.ondblclick = function(ev){ localthis.swapEquipped(newItem); };
            this.vaultItems[z].push(newItem);
          }
          else if(data[i][z][y].changed == false){
            for(n in this.vaultItems[z]){
              if(this.vaultItems[z][n].data.itemInstanceId === data[i][z][y].itemInstanceId)
              { this.vaultItems[z][n].destroy(); this.vaultItems[z].splice(n,1); }
            }
          }
        }
      }
    this.updateItemIndexes();
  };
  this.updateItemIndexes = function(){
    for(i in this.vaultItems){
      for(z in this.vaultItems[i]){
        this.vaultItems[i][z].index = z;
      }
    }
  };
  this.wipe = function(){
    var length = this.vaultItems.length;
    for(var z = 0; z<length; z++){
      this.vaultItems[0].destroy(true);
    }
  };
  this.show = function(bool){
    for(i in this.vaultItems){
      for(z in this.vaultItems[i]){
        this.vaultItems[i][z].show(bool);
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
    this.parentElement = window.document.getElementById(this.slotName);
    var localthis = this;
    this.element.draggable = true;
    this.element.ondragend = function(ev){ localthis.itemTransfer(ev); };
  };
  this.changeData = function(data){
    this.data = data;
    if(this.data.state == 4){this.element.style.outline = "2px solid gold"; }

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
    var result = await transferRequest(localthis.data, characterID, playerCharacters[0].data.characterId).catch(function(error){ return error; });
    if(result instanceof Error){ alert("Unable to transfer item."); return false; }
    console.log("transfer was successful.");
    await sleep(500);
    updateInventory();
  };
};

function loadSideMenu(itemData){
  window.document.getElementById("side-view").style.display= "none";
  window.document.getElementById("side-view").style.display= "initial";
  window.document.getElementById("item-name").innerHTML = itemData.name;
  window.document.getElementById("item-screenshot").src = itemData.screenshot;
  window.document.getElementById("item-flavortext").innerHTML = itemData.flavorText;
  window.document.getElementById("item-preview-light").innerHTML = itemData.light;
  window.document.getElementById("item-preview-damageIcon").src = itemData.energyIcon;
  for(i in itemData.stats){
    var statcontainer = window.document.createElement("div");
    var statname = window.document.createElement("h1");
    var bar = window.document.createElement("div");
    var barbackground = window.document.createElement("div");
    var value = window.document.createElement("h1");

    statcontainer.className = "stat-preview-content";
    statname.innerHTML = itemData.stats[i].data.displayProperties.name;
    bar.className = "stat-bar";
    bar.style.width = itemData.stats[i].value+"%";
    barbackground.className = "stat-bar-background";
    value.innerHTML = itemData.stats[i].value;

    barbackground.append(bar);
    statcontainer.append(statname);
    statcontainer.append(barbackground);
    statcontainer.append(value);

    window.document.getElementById("stat-preview-block").append(statcontainer);
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
  else{ Promise.reject(response.json().error); }
};
async function postRequest(path, body){
  var request = new Request(path, {
    method: "POST",
    headers: {"Content-Type":"application/json"},
    body: JSON.stringify(body),
  });
  let response = await fetch(request);
  if(response.status >=200 && response.status < 300){ return response.json(); }
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
function transferRequest(itemData, rcID){ //rc=receiveing character, tc = transferring character
  var path = "/character/transferItem/";
  var body = {
    quantity: itemData.quantity,
    itemHash: itemData.itemHash,
    itemInstanceId: itemData.itemInstanceId,
    characterReceiving: rcID,
    transferToVault: false,
  };
  return postRequest(path, body);
};
