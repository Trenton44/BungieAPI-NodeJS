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
  vaultController.fetchLoadout().catch(function(error){ console.error(error); });
  let result = await Promise.all([playerCharacters[0].loadCharacter(),playerCharacters[1].loadCharacter(),playerCharacters[2].loadCharacter()]).catch(function(error){ return error; });
  if(result instanceof Error) { console.error(result); return false; }
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
  this.characterId;
  this.setID = function(value){
    this.id = value;
    this.element = window.document.getElementById("c"+this.id);
  };
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
    if(data instanceof Error){ return data; }
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
  this.HTMLTemplate;
  this.Initialize = function(slotName, index, data){
    this.index = index;
    this.slotName = slotName;
    var temp = window.document.createElement("div");
    temp.innerHTML = data.HTMLTemplate;
    window.document.getElementById(this.slotName).append(temp.firstChild);
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
    this.HTMLTemplate.ondblclick = function(ev){ loadSideMenu(localthis.data); };
  };
  this.destroy = function(isWipe){
      this.HTMLTemplate.remove();
      this.data = null;
      if(isWipe) return true;
      vaultController.vaultItems[this.slotName].splice(this.index,1);
  };
  this.drop = async function(ev){
    var localthis = this;
    var targetElementID = window.document.elementFromPoint(ev.clientX,ev.clientY).id.split("-")[0];
    try{
      var characterID = playerCharacters[targetElementID.slice(-1)].characterId;
    }
    catch(TypeError){
      console.error("That's not a character");
      return false;
    }
    var result = await transferRequest(localthis.data, characterID);
    if(result instanceof Error){ alert("Unable to transfer item."); return false; }
    alert("transfer was successful.");
    localthis.destroy(false);
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
  if(response.status >=200 && response.status < 300){ return response.json(); }
  else{ return new Error(); }
};
async function postRequest(path, body){
  var request = new Request(path, {
    method: "POST",
    headers: {"Content-Type":"application/json"},
    body: JSON.stringify(body),
  });
  let response = await fetch(request);
  if(response.status >=200 && response.status < 300){ return response.json(); }
  else{ return new Error(); }
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
    transferToVault: false,
  };
  return postRequest(path, body);
};
async function test(){
  var startTime = new Date().getTime();
  var path = "/vault/data";
  let result = await fetchRequest(path).catch(function(error){ console.error(error); return false; });
  console.log(result);
  var endTime = new Date().getTime();
  console.log("vault access took exactly "+(endTime-startTime)/1000+" seconds.");
}
async function test2(){
  var startTime = new Date().getTime();
  var path = "/vault/update";
  let result = await fetchRequest(path).catch(function(error){ console.error(error); return false; });
  console.log(result);
  var endTime = new Date().getTime();
  console.log("vault access took exactly "+(endTime-startTime)/1000+" seconds.");
}
