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
  if(ids instanceof Error){ console.log("Unable to obtain characters."); };
  for(i in ids){
    playerCharacters.push(new character());
    playerCharacters[i].Initialize(i, ids[i]);
  }
  updateCharacters();
};
async function updateCharacters(){
  let result = await Promise.all([playerCharacters[0].loadCharacter(),playerCharacters[1].loadCharacter(),playerCharacters[2].loadCharacter()]).catch(function(error){ return error; });
  if(result instanceof Error) { console.error(result); return false; }
  updateGUI();
};
function updateGUI(){
  console.log(playerCharacters[0]);
  console.log(playerCharacters[1]);
  console.log(playerCharacters[2]);
  playerCharacters[0].update();
  playerCharacters[1].update();
  playerCharacters[2].update();
  slotController.fetchLoadout(playerCharacters[0].characterId)
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
    equipItem(item.data, playerCharacters[0].characterId).then(function(result){
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
    var data = await fetchRequest(path).catch(function(error){ return error; });
    if(data instanceof Error) {console.error(data); return false;}
    var keys = Object.keys(data.equipment);
    console.log(data);
    for(i in keys){
      var newItem = new Item();
      var newItemData = data.equipment[keys[i]];
      newItem.Initialize(keys[i],0,newItemData[0]);
      this.slots[keys[i]][0] = newItem;
    }
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
    this.HTMLElement.src = this.data.itemIcon;
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
