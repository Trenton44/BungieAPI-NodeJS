var window;
var bungieCommon = "https://www.bungie.net";
var characterIDs;
var counter = 0;

//A basic item so the reload() function inside of the equipment list doesn't lose it.
function placeholderItem(){
  return {
    placeholder: true,
    hashData:{
      displayProperties: {
        icon: "",
      },
    },
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
    var localthis = this;
    this.element.oncontextmenu = function(event){localthis.clickEvent(event)};
    this.changeData(data);
  };
  this.changeData = function(value){
    this.data = value;
    this.element.src = bungieCommon+this.data.hashData.displayProperties.icon;
  };
  this.changeElement = function(value){
    this.element = value;
  };
  this.clickEvent = function(event){
    event.preventDefault();
    console.log(event);
    var xy = this.element.getBoundingClientRect();
    var popup = window.document.getElementById("popup-item-menu");
    popup.style.top = xy.bottom;
    popup.style.left = xy.right;
    popup.style.display = "block";

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
    this._equipment[0] = new Item();
    this._equipment[0].element = this.element;
    window.document.getElementById(htmlElement+"-primary-container").ondrop = this.swapItems;
    this.equip(placeholderItem());
    for(var i = 1; i < this._equipment.length; i++){
      this._equipment[i] = new Item();
      this._equipment[i].Initialize(this.equipmentContainer,htmlElement+i,placeholderItem());
      var temp = this;
      this._equipment[i].element.ondblclick = function(event){temp.swapItems(event.srcElement);};
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
         console.log(newEquip);
         console.log(oldEquip);
         localthis.equip(newEquip);
         localthis._equipment[index].changeData(oldEquip);
         localthis.requestrunning = false;
      }).catch(function(error){
        console.error("Uhhh, the equip request went horribly wrong..");
        console.error(error);
      });
    }
  }
  this.wipe = function(){
    for(i in this._equipment){
      this._equipment[i].changeData(placeholderItem());
    }
  };
};

function equipment(){
  this.id = "";
  this.Intitialize = function(){
    this.slots.subclasslist._equipment.length = 4;
    for(i in this.slots){
      if(i !== "artifact"){
        console.log("Intitalizing "+i);
        this.slots[i].Initialize();
      }
    }
  };
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
    subclasslist: new equipmentlist("subclass"),
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
      var equipment = result.equipment;
      var inventory = result.inventory;
      for(i in equipment){
        if(equipment[i].hashData.equipHash == 1506418338){ parent.slots.artifact(equipment[i]); }
        else { parent.slots[parent.hashKeys[equipment[i].hashData.equipHash]].equip(equipment[i]); }
      }
      for(i in inventory){
        if(inventory[i].hashData.equipHash == 1506418338){ parent.slots.artifact(inventory[i]); }
        else {
          parent.slots[parent.hashKeys[inventory[i].hashData.equipHash]].newItem(inventory[i]);
        }
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
    character.equipment.Intitialize();
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
  console.log("Counter: "+counter);
  loadPopupCharacters(counter);
  window.document.body.oncontextmenu = function(event){
    event.preventDefault();
    if(event.path.length <= 6){
      window.document.getElementById("popup-item-menu").style.display = "none";
    }
  };
}
async function loadPopupCharacters(indexUsed){
  var temp = Array.from(characterIDs);
  temp.splice(indexUsed,1);
  for(var i = 0; i< temp.length; i++){
    var path = "/character/"+temp[i]+"/general";
    await fetchRequest(path).then(function(result){
      console.log(result);
      console.log(i+2);
      var img = window.document.getElementById("c"+(i+2)+"-icon");
      img.src = bungieCommon+result.emblem.emblemExpanded.displayProperties.icon;
    });
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
  console.log("character id: "+characterIDs[counter]+" item id: "+itemData.itemID);
  var path = "/character/"+characterIDs[counter]+"/equipItem/"+itemData.itemID;
  return fetchRequest(path);
}
function test(id){
  var path = "/test/"+id;
  fetchRequest(path).then(function(result){
    console.log(result);
  }).catch(function(error){
    console.log(error);
  });
}
function processServerError(error){
  console.log(error);

}
