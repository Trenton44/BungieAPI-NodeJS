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
  for(i in ids) {
    playerCharacters.push(new character());
    playerCharacters[i].Initialize(i, ids[i]);
  }
  updateCharacters();
};
function changeCharacter(characterlistLocation){
  if(characterlistLocation == 0){console.log("Character is already loaded.");}
  else{
    var backup = Array.from(playerCharacters);
    var temp = playerCharacters.splice(characterlistLocation,1);
    var temp2 = playerCharacters.shift();
    playerCharacters.unshift(temp2);
    playerCharacters.push(temp[0]);
    for(i in playerCharacters) playerCharacters[i].setIdentifier(i);
    updateCharacters(backup);
  }
};
function updateCharacters(backup){
  console.log("loading characters");
  Promise.all([playerCharacters[0].loadCharacter(),playerCharacters[1].loadCharacter(),playerCharacters[2].loadCharacter()]).then(function(values){
    slotController.fetchLoadout(playerCharacters[0].characterID).then(function(result){
      console.log("character data has been successfully retrieved, loading data now.");
      for(i in playerCharacters) playerCharacters[i].update();
      slotController.update();
      playerCharacters[0].showStats();
    }).catch(function(error){
      if(backup != null || backup != undefined) playerCharacters = backup;
      console.error("an error occurred that prevented your characters from being loaded.");
    });
  });
};
function character(){
  this.htmlIdentifier;
  this.element;
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
    this.element.ondblclick = function(){changeCharacter(this.htmlIdentifier);};
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
      this.slots[keys[i]].characterID = characterID;
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
  this.update = function(){
    for(i in this.slots){
      this.slots[i].update();
    }
  };
};

function slot(htmlElement){
  this.element = window.document.getElementById(htmlElement); //HTML element of the equipped slot
  this.container = window.document.getElementById(htmlElement+"-container"); //HTML element containing the equipment+equipped slot
  this.equipmentContainer = window.document.getElementById(htmlElement+"-equipment"); //HTML Element containing all the non-equipped items.
  this.characterID;
  this.equipment = [];
  this.equipment.length = 9;
  this.requestrunning = false;
  this.Initialize = function(){
    var localthis = this;
    this.container.ondrop = function(ev){
      event.preventDefault();
      console.log(JSON.parse(ev.dataTransfer.getData("data")));
      console.log(ev.dataTransfer.getData("element"));
      if(ev.dataTransfer.getData("element").slice(0,-1) == htmlElement){
        console.log("item is good to equip.");
        localthis.swapEquipped(ev.dataTransfer.getData("element"));
      }
    };
    this.container.ondragover = function(event){event.preventDefault();};
    this.equipment[0] = new Item();
    this.equipment[0].element = this.element;
    this.equip(placeholderItem());
    for(var i = 1; i < this.equipment.length; i++){
      this.equipment[i] = new Item();
      this.equipment[i].Initialize(this.equipmentContainer,htmlElement+i,placeholderItem());
      this.equipment[i].element.ondblclick = function(ev){ localthis.swapEquipped(ev.srcElement); };
      this.equipment[i].element.ondragend = function(ev){
        console.log(ev);
        var targetElementID = window.document.elementFromPoint(ev.clientX,ev.clientY).id.split("-")[0];
        var characterID = playerCharacters[targetElementID.slice(-1)].characterID;
        if(targetElementID == "c1" || targetElementID == "c2")
          localthis.transferItem(ev.target.id,characterID);
      };
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
  this.swapEquipped = function(itemElementID){
    console.log("attempting item swap in slot "+htmlElement);
    if(this.requestrunning){
      console.log("A request is already in progress, please try again once the current one has resolved.");
    }
    else{
      this.requestrunning = true;
      var localthis = this;
      var index = itemElementID.id.slice(-1);
      equipItem(this.equipment[index].data,this.characterID).then(function(result){
         var newEquip = localthis.equipment[index].getData();
         var oldEquip = localthis.equipment[0].getData();
         localthis.equip(newEquip);
         localthis.equipment[index].changeData(oldEquip);
         localthis.equipment[0].update();
         localthis.equipment[index].update();
         localthis.requestrunning = false;
      }).catch(function(error){
        console.error("Uhhh, the equip request went horribly wrong..");
        console.error(error);
        localthis.requestrunning = false;
      });
    }
  };
  this.transferItem = function(itemElementID, characterID){
    if(this.requestrunning){
      console.log("A request is already in progress, please try again once the current one has resolved.");
    }
    else{
      this.requestrunning = true;
      var localthis = this;
      var index = itemElementID.slice(-1);
      transferRequest(this.equipment[index].data,characterID,playerCharacters[0].characterID).then(function(result){
         localthis.equipment[index].changeData(placeholderItem());
         localthis.equipment[index].update();
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
  this.update = function(){
    for(i in this.equipment){
      this.equipment[i].update();
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
      console.log(localthis);
      ev.dataTransfer.setData("element", localthis.element.id);
      ev.dataTransfer.setData("data", JSON.stringify(localthis.data));
    };
  };
  this.changeData = function(value){
    this.data = value;
  };
  this.changeElement = function(value){
    this.element = value;
  };
  this.update = function(){
    if(this.data.placeholder){ this.element.src = "";}
    else {this.element.src = bungieCommon+this.data.itemHashData.displayProperties.icon;}
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
  if(tcID == null || tcID == undefined) tcID = playerCharacters[0].characterID;
  var path = "/character/transferItem/";
  console.log(itemData);
  var body = {
    item: itemData,
    characterTransferring: tcID,
    characterReceiving: rcID,
  };
  return postRequest(path, body);
};
