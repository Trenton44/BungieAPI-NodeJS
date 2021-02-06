var window;
var bungieCommon = "https://www.bungie.net";
var characterIDs;
var counter = 0;
var globalQueue = new equipQueue();
globalQueue.Initialize();
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

function equipQueue(){
  this.queue = [];
  this.element;
  this.Initialize = function(){
    this.element = window.document.getElementById("item-queue");
  };
  this.addToQueue = function(item){
    var itemElement = item.element;
    var itemData = JSON.parse(item.data);
    console.log(itemElement);
    console.log(itemData);
  }
  this.removeFromQueue = function(item){

  }
}
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
    var localthis = this;
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
}
//Constructor function that loads a equipment list "object", so to speak.
//Handles updating and interfacing the html elements with the item data from the bungie API.
function equipmentlist(htmlElement){
  this.element = window.document.getElementById(htmlElement); //HTML element of the equipped slot
  this.container = window.document.getElementById(htmlElement+"-container"); //HTML element containing the equipment+equipped slot
  this.equipmentContainer = window.document.getElementById(htmlElement+"-equipment"); //HTML Element containing all the non-equipped items.
  this._equipment = [];
  this._equipment.length = 9;
  this.requestrunning = false;
  this.Initialize = function(){
    var localthis = this;
    this.container.ondrop = function(ev){
      event.preventDefault();
      var transferItem = {
        element: ev.dataTransfer.getData("element"),
        data: ev.dataTransfer.getData("data"),
      };
      globalQueue.addToQueue(transferItem);
    };
    this.container.ondragover = function(event){event.preventDefault();};
    this._equipment[0] = new Item();
    this._equipment[0].element = this.element;
    this.equip(placeholderItem());
    for(var i = 1; i < this._equipment.length; i++){
      this._equipment[i] = new Item();
      this._equipment[i].Initialize(this.equipmentContainer,htmlElement+i,placeholderItem());
      var temp = this;
      this._equipment[i].element.ondblclick = function(ev){ temp.swapItems(ev.srcElement); };
    }
    console.log("Init of "+htmlElement+" finished.");
  };
  this.equip = function(value){
    this._equipment[0].changeData(value);
  };
  this.newItems = function(values){
    for(i in values){
      console.log("changing data in "+htmlElement+", value "+i);
      this._equipment[i].changeData(values[i]);
    }
  };
  this.newItem = function(value){
    for(var i = 1; i< this._equipment.length; i++){
      if(this._equipment[i].data.placeholder){
        value.placeholder = false;
        this._equipment[i].changeData(value);
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
      equipRequest(this._equipment[index].data).then(function(result){
         var newEquip = localthis._equipment[index].getData();
         var oldEquip = localthis._equipment[0].getData();
         localthis.equip(newEquip);
         localthis._equipment[index].changeData(oldEquip);
         localthis.requestrunning = false;
      }).catch(function(error){
        console.error("Uhhh, the equip request went horribly wrong..");
        console.error(error);
        localthis.requestrunning = false;
      });
    }
  }
  this.wipe = function(){
    for(i in this._equipment){
      this._equipment[i].changeData(placeholderItem());
    }
  };
};

//A character object, meant to hold all information pertaining
//to the displayed character on the screen.
//It's not quite self-containing yet, but that is the goal.
function character(){
  this.Initialize = function(){
    this.equipment.Subclass._equipment.length = 4;
    this.equipment.SeasonalArtifact._equipment.length = 0;
    for(i in this.equipment){
      this.equipment[i].Initialize();
    }
  }
  this.id;
  this.setID = function(value){
    this.id = value;
    this.loadGeneral();
    this.loadEquipment();
  }
  this.getID = function(){
    return this.id;
  };
  this.class = "";
  this.light = "";
  this.race = ""
  this.setClass = function(value){
    console.log("class type property has been triggered.");
    this.class = value;
    window.document.getElementById("character-class").innerHTML = value.name;
  };
  this.setRace = function(value){
    console.log("race type property has been triggered.");
    this.race = value;
    window.document.getElementById("character-race").innerHTML = value.name;
  }
  this.setLight = function(value){
    console.log("light property has been triggered.");
    this.light = value;
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
      parent.setRace(result.race);
      parent.setEmblem(emblemData);
      parent.setClass(result.class);
      parent.setLight(result.light);
    });
  };
  this.equipment = {
    Subclass: new equipmentlist("subclass"),
    KineticWeapons: new equipmentlist("kinetic"),
    EnergyWeapons: new equipmentlist("special"),
    PowerWeapons: new equipmentlist("heavy"),
    Helmet: new equipmentlist("helmet"),
    Gauntlets: new equipmentlist("gloves"),
    ChestArmor: new equipmentlist("chest"),
    LegArmor: new equipmentlist("legs"),
    ClassArmor: new equipmentlist("class-armor"),
    Ghost: new equipmentlist("ghost"),
    Vehicle: new equipmentlist("vehicle"),
    Ships: new equipmentlist("ship"),
    Emblems: new equipmentlist("emblem"),
    Finishers: new equipmentlist("finisher"),
    SeasonalArtifact: new equipmentlist("artifact"),
  },
  this.equipmentWipe = function(){
    for(i in this.equipment){
      this.equipment[i].wipe();
    }
  }
  //Pulls equipped+nonequipped equipment using server endpoint,
  //sends new data to equipment lists
  this.loadEquipment = function(){
    this.equipmentWipe();
    var parent = this;
    var path = "/character/"+parent.id+"/equipment";
    fetchRequest(path).then(function(result){
      var keys = Object.keys(result.equipment);
      console.log(keys);
      console.log("equipment: ");
      for(i in keys){
        console.log(keys[i]+": ");
        console.log(result.equipment[keys[i]][0]);
        parent.equipment[keys[i]].equip(result.equipment[keys[i]][0]);
      }
      console.log("inventory: ");
      for(i in keys){
        var equipcategory = result.inventory[keys[i]];
        console.log(keys[i]+": ");
        for(z in equipcategory){
          console.log(equipcategory[z]);
          parent.equipment[keys[i]].newItem(equipcategory[z]);
        }
      }
    });
  };
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
    character.Initialize();
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
  character.setID(characterIDs[counter]);
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
async function fetchImage(path){
  var request = new Request(path, { method: "GET", });
  let response = await fetch(request);
  if(response.status >=200 && response.status < 300)
  {return response.body;}
  else
  {console.log(response);return Promise.reject(new Error(response));}
};
//Makes requests to server for equipping new items from existing non-equipped items.
function equipRequest(itemData){
  console.log("character id: "+characterIDs[counter]+" item id: "+itemData.itemInstanceId);
  var path = "/character/"+characterIDs[counter]+"/equipItem/"+itemData.itemInstanceId;
  return fetchRequest(path);
}
