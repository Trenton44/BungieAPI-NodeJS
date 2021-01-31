var window;
var bungieCommon = "https://www.bungie.net";
var characterIDs;
var counter = 0;

//A basic item so the reload() function inside of the equipment list doesn't lose it.
var placeholderItem = {
  hashData: {
    displayProperties: {
      icon: "",
    },
  },
};

//Constructor function that loads a equipment list "object", so to speak.
//Handles updating and interfacing the html elements with the item data from the bungie API.
function equipmentlist(htmlElement){
  this.element = window.document.getElementById(htmlElement); //HTML element of the equipped slot
  this.container = window.document.getElementById(htmlElement+"-container"); //HTML element containing the equipment+equipped slot
  this.equipmentContainer = window.document.getElementById(htmlElement+"-equipment"); //HTML Element containing all the non-equipped items.
  this._equipment = [];
  this.setequipment = function(value){
    this._equipment = value;
  };
  this.getequipment = function(){
    return this._equipment;
  };
  this.findItemIndex = function(value){
    return this._equipment.indexOf(value);
  };
  this.addItem = function(value){
    if(value.currentlyEquipped){
      this._equipment[0] = value;
    }
    else {
      if(this._equipment.length == 0){
        this._equipment[0] = placeholderItem;
      }
      else {
        var item = window.document.createElement("img");
        item.id = htmlElement+this._equipment.length;
        this._equipment[this._equipment.length] = value;
        item.addEventListener("click",function(){
          console.log("Item id: "+value.itemID);
          equipRequest(value.itemID);
        });
        this.equipmentContainer.appendChild(item);
      }
    }
    this.reload();
  };
  this.wipe = function(){ //Wipes the current array and removes all generated html for equipment inventory.
    this.element.src = "";
    for(var i = 1; i< this._equipment.length; i++){
      window.document.getElementById(htmlElement+i).remove();
    }
    this._equipment = [];
  }
  this.reload = function(){

    this.element.src = bungieCommon+this._equipment[0].hashData.displayProperties.icon;
    for(var i = 1; i< this._equipment.length; i++){
      console.log(htmlElement+i);
      window.document.getElementById(htmlElement+i).src = bungieCommon+this._equipment[i].hashData.displayProperties.icon;
    }
  };
};

function equipment(){
  this.id = "";
  this.hashKeys = {
    3284755031:"subclasslist",
    1498876634:"kineticlist",
    2465295065:"speciallist",
    953998645:"heavylist",
    3448274439:"helmetlist",
    3551918588:"gloveslist",
    14239492:"chestlist",
    20886954:"legslist",
    1585787867:"classarmorlist",
    4023194814:"ghostlist",
    2025709351:"vehiclelist",
    284967655:"shiplist",
    4292445962:"clanbannerlist",
    4274335291:"emblemlist",
    3683254069:"finisherlist",
    1107761855:"emotelist",
    1506418338:"_artifact",
  };
  //"equipment slots" containing a equipment list of each weapon/armor type in the game.\
  //the goal was self-updating...
  this.slots = {
    subclasslist: new equipmentlist("Subclass"),
    kineticlist: new equipmentlist("kinetic"),
    speciallist: new equipmentlist("special"),
    heavylist: new equipmentlist("heavy"),
    helmetlist: new equipmentlist("helmet"),
    gloveslist: new equipmentlist("gloves"),
    chestlist: new equipmentlist("chest"),
    legslist: new equipmentlist("legs"),
    classarmorlist: new equipmentlist("class-armor"),
    ghostlist: new equipmentlist("ghost"),
    vehiclelist: new equipmentlist("vehicle"),
    shiplist: new equipmentlist("ship"),
    clanbannerlist: new equipmentlist("clanbanner"),
    emblemlist: new equipmentlist("emblem"),
    finisherlist: new equipmentlist("finisher"),
    emotelist: new equipmentlist("emotes"),
    artifact: function(value){
      window.document.getElementById("artifact").src = bungieCommon+value.hashData.displayProperties.icon;
    },
  };
  //triggers wipe() function in all of the equipment lists shown above.
  this.equipmentWipe = function(){
    for(i in this.slots){
      if(i == "artifact"){
        continue;
      }
      else {
        this.slots[i].wipe();
      }
    }
    window.document.getElementById("artifact").src = "";
  };
  //Pulls equipped+nonequipped equipment using server endpoint,
  //sends new data to equipment lists
  this.loadEquipment = function(){
    this.equipmentWipe();
    var parent = this;
    var path = "/character/"+parent.id+"/equipment";
    fetchRequest(path).then(function(result){
      console.log(result);
      var equipment = result.equipment;
      var inventory = result.inventory;
      for(i in equipment){
        if(equipment[i].hashData.equipHash == 1506418338){ parent.slots.artifact(equipment[i]); }
        else { parent.slots[parent.hashKeys[equipment[i].hashData.equipHash]].addItem(equipment[i]); }
      }
      for(i in inventory){
        if(inventory[i].hashData.equipHash == 1506418338){ parent.slots.artifact(inventory[i]); }
        else { parent.slots[parent.hashKeys[inventory[i].hashData.equipHash]].addItem(inventory[i]); }
      }
    });
  };
};

//A character object, meant to hold all information pertaining
//to the displayed character on the screen.
//It's not quite self-containing yet, but that is the goal.
function character(){
  this.id = "";
  this.setID = function(value){
    this.id = value;
    this.equipment.id = value;
    console.log("test "+ this.equipment.id);
  }
  this.getID = function(){
    return this.id;
  };
  this.class = "";
  this.light = "";
  this.setClass = function(value){
    console.log("class type property has been triggered.");
    this._class = value;
    window.document.getElementById("character-class").innerHTML = "lvl "+value.level+" "+value.name;
  };
  this.setLight = function(value){
    console.log("light property has been triggered.");
    this._light = value;
    window.document.getElementById("character-light").innerHTML = value ;
  };
  this.setEmblem = function(value){
    console.log("emblem property has been triggered.");
    window.document.getElementById("emblem-icon").src = bungieCommon+value.icon;
    window.document.getElementById("emblem-back").src = bungieCommon+value.background;
  };
  this.loadGeneral = function(){ //obtains generic character data and loads it to the webpage.
    var parent = this;
    var path = "/character/"+parent.id+"/general";
    fetchRequest(path).then(function(result){
      console.log(result);
      //console.log("setting up character element.");
      var emblemData = {
        icon: result.emblem.emblemExpanded.secondaryOverlay,
        background: result.emblem.emblemExpanded.secondarySpecial,
      };
      var classData = {level: result.level, name: result.class.name};
      parent.setEmblem(emblemData);
      parent.setClass(classData);
      parent.setLight(result.light);
    });
  };
  this.equipment = new equipment();
};

//Passes window to javascript and requests the character id's
//from the server so that character data can be loaded to the webpage
function Initialize(value){
  window = value;
  var path = "/characterids";
  fetchRequest(path).then(function(result){
    console.log(result);
    characterIDs = result;
    character = new character();
    loadCharacter(counter);
  });
};
//Function for loading and switching between characters.
function loadCharacter(value){
  counter += value;
  if(counter > characterIDs.length-1)
    counter = 0;
  if(counter < 0)
    counter = characterIDs.length-1;
  console.log(characterIDs[counter]);
  character.setID(characterIDs[counter]);
  character.loadGeneral();
  character.equipment.loadEquipment();
}

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

//Makes requests to server for equipping new items from existing non-equipped items.
function equipRequest(item){
  console.log("equip request.");
  var path = "/character/"+characterIDs[counter]+"/equipItem/"+item;
  fetchRequest(path).then(function(result){
    character.equipment.loadEquipment(character.equipment, character.id);
  }).catch(function(error){
    console.log("There was an error equipping the item.");
  });
}
function test(id){
  var path = "/test/"+id;
  fetchRequest(path).then(function(result){
    console.log(result);
  }).catch(function(error){
    console.log(error);
  });
}
