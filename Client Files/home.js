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
  console.log("All characters successfully loaded.");
};

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
    for(z in value) this.stats[value[z].info.displayProperties.name] = value[z].value;
  };
  this.showStats = function(){
    var keys = Object.keys(this.stats);
    console.log(keys);
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
    return this.loadCharacter();
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
    this.slots.SeasonalArtifact.equipment.length = 0;
    this.slots.Subclass.equipment.length = 4;
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
    var keys = Object.keys(data.equipment);
    for(i in keys){
      this.slots[keys[i]].equip(data.equipment[keys[i]][0]);
    }
    for(i in keys){
      var equipcategory = data.inventory[keys[i]];
      for(z in equipcategory){ this.slots[keys[i]].newItem(equipcategory[z]); }
    }
  };
  this.wipe = function(){
    for(i in this.slots){
      this.slots[i].wipe();
    }
  };
};

function slot(htmlElement){
  this.element = window.document.getElementById(htmlElement); //HTML element of the equipped slot
  this.container = window.document.getElementById(htmlElement+"-container"); //HTML element containing the equipment+equipped slot
  this.equipmentContainer = window.document.getElementById(htmlElement+"-equipment"); //HTML Element containing all the non-equipped items.
  this.equipment = [];
  this.equipment.length = 9;
  this.requestrunning = false;
  this.Initialize = function(){
    this.container.ondrop = function(ev){
      event.preventDefault();
      var transferItem = {
        element: ev.dataTransfer.getData("element"),
        data: ev.dataTransfer.getData("data"),
      };
    };
    this.container.ondragover = function(event){event.preventDefault();};
    this.equipment[0] = new Item();
    this.equipment[0].element = this.element;
    this.equip(placeholderItem());
    var localthis = this;
    for(var i = 1; i < this.equipment.length; i++){
      this.equipment[i] = new Item();
      this.equipment[i].Initialize(this.equipmentContainer,htmlElement+i,placeholderItem());
      this.equipment[i].element.ondblclick = function(ev){ localthis.swapItems(ev.srcElement); };
    }
    console.log("Init of "+htmlElement+" finished.");
  };
  this.equip = function(value){
    this.equipment[0].changeData(value);
  };
  this.newItem = function(value){
    for(var i = 1; i< this.equipment.length; i++){
      if(this.equipment[i].data.placeholder){
        value.placeholder = false;
        this.equipment[i].changeData(value);
        break;
      }
    }
  };
  this.swapItems = function(eventSource){
    if(this.requestrunning){
      console.log("A request is already in progress, please try again once the current one has resolved.");
    }
    else{
      this.requestrunning = true;
      var localthis = this;
      var index = eventSource.id.slice(-1);
      equipItem(this.equipment[index].data).then(function(result){
         var newEquip = localthis.equipment[index].getData();
         var oldEquip = localthis.equipment[0].getData();
         localthis.equip(newEquip);
         localthis.equipment[index].changeData(oldEquip);
         localthis.requestrunning = false;
      }).catch(function(error){
        console.error("Uhhh, the equip request went horribly wrong..");
        console.error(error);
        localthis.requestrunning = false;
      });
    }
  };
  this.wipe = function(){
    for(i in this.equipment){
      this.equipment[i].changeData(placeholderItem());
    }
  };
};

function Item(){
  this.container;
  this.data;
  this.element;
  this.getData = function(){
    return this.data;
  }
  this.Initialize = function(container, elementID, data){
    this.container = container;
    var test = window.document.createElement("img");
    test.id = elementID;
    this.container.append(test);
    this.element = test;
    this.changeData(data);
    this.element.draggable = true;
    var localthis = this;
    this.element.ondragstart = function(ev){
      ev.dataTransfer.setData("element", localthis.element);
      ev.dataTransfer.setData("data",JSON.stringify(localthis.data));
    };
  };
  this.changeData = function(value){
    this.data = value;
    this.element.src = bungieCommon+this.data.itemHashData.displayProperties.icon;
  };
  this.changeElement = function(value){
    this.element = value;
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
  var path = "/character/transferItem/";
  var body = {
    item: itemData,
    characterTransferring: tcID,
    characterReceiving: rcID,
  };
  return postRequest(path, body);
};
