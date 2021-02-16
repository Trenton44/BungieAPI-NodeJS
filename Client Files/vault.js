var window;
var bungieCommon = "https://www.bungie.net";
var playerCharacters = [];
var vaultController = new Vault();

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
  vaultController.fetchLoadout();
  updateGUI();
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
  this.update = function(){
    window.document.getElementById("c"+this.id+"-light").innerHTML = this.light;
    window.document.getElementById("c"+this.id+"-race").innerHTML = this.race;
    window.document.getElementById("c"+this.id+"-class").innerHTML = this.class;
    window.document.getElementById("c"+this.id+"-emblem").src = this.emblem;
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
    return Promise.resolve(true);
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
    var data = await fetchRequest(path).catch(function(error){ return error; });
    console.log(data);
    for(i in data){
      if(this.vaultItems[i] == undefined){
        var subMenu = window.document.createElement("div");
        var descriptor = window.document.createElement("h1");
        descriptor.innerHTML = i;
        var container = window.document.createElement("div");
        container.id = i;
        subMenu.append(descriptor);
        subMenu.append(container);
        window.document.getElementById("vault-equipment").append(subMenu);
        this.vaultItems[i] = [];
      }
      for(z in data[i]){
        var newItem = new Item();
        newItem.Initialize(i,z,data[i][z]);
        this.vaultItems[i].push(newItem);
      }
    }
  };
};
function Item(){
  this.data;
  this.index;
  this.slotName;
  this.HTMLElement;
  this.Initialize = function(slotName, index, itemData){
    this.index = index;
    this.slotName = slotName;
    this.container = window.document.createElement("div");
    this.container.className = "vault-item-container";
    this.HTMLElement = window.document.createElement("img");
    this.HTMLElement.id = "vault-item-"+index;
    this.container.append(this.HTMLElement);
    this.changeData(itemData);
    try{
      if(this.data.instances.primaryStat !== undefined){
        var text = window.document.createElement("h1");
        text.innerHTML = this.data.instances.primaryStat.value;
        text.className = "vault-item-power";
        this.container.append(text);
      }
      if(this.data.itemHashData.iconWatermark !== undefined){
        text = window.document.createElement("img");
        text.src = "https://www.bungie.net"+this.data.itemHashData.iconWatermark;
        text.className = "vault-item-seasonal-overlay";
        this.container.append(text);
      }
    }
    catch (Error){}
    window.document.getElementById(this.slotName).append(this.container);
    var localthis = this;
    this.HTMLElement.draggable = true;
    this.HTMLElement.ondragend = function(ev){localthis.drop(ev);};
    this.container.onclick = function(ev){ loadSideMenu(localthis.data);};
    if(this.data.state == "Masterwork") this.HTMLElement.style.border = "2px solid gold";
  };
  this.changeData = function(value){
    this.data = value;
    this.HTMLElement.src = bungieCommon+this.data.itemHashData.displayProperties.icon;
  }
  this.destroy = function(isWipe){
      this.container.remove();
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
  };
};
function loadSideMenu(itemData){
  console.log(itemData);
  window.document.getElementById("side-view").style.display= "none";
  window.document.getElementById("side-view").style.display= "initial";
  window.document.getElementById("item-name").innerHTML = itemData.itemHashData.displayProperties.name;
  var icon= itemData.itemHashData.screenshot;
  if(icon == undefined) icon = itemData.itemHashData.displayProperties.icon;
  window.document.getElementById("item-screenshot").src = bungieCommon+icon;
  window.document.getElementById("item-flavortext").innerHTML = itemData.itemHashData.flavorText;
  window.document.getElementById("item-preview-light").innerHTML = itemData.instances.primaryStat.value;
  if(itemData.instances.damageType !== 0){
    window.document.getElementById("item-preview-damageIcon").src = bungieCommon+itemData.instances.damageTypeData.displayProperties.icon;
  }
  else {
    window.document.getElementById("item-preview-damageIcon").src = bungieCommon+itemData.instances.energy.data.displayProperties.icon;
  }
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
function hideSideMenu(){
  window.document.getElementById("side-view").style.display= "none";
  while(window.document.getElementById("stat-preview-block").hasChildNodes()){
    window.document.getElementById("stat-preview-block").removeChild(window.document.getElementById("stat-preview-block").childNodes[0]);
  }
  window.document.getElementById("item-preview-light").innerHTML = "";
  window.document.getElementById("item-preview-damageIcon").src = "";
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
