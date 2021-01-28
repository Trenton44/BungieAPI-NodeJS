var window;
var bungieCommon = "https://www.bungie.net";
var characterIDs;
var counter = 0;
function displayContainer(value){
  var children = window.document.getElementById("equipment-menu").childNodes;
  window.document.getElementById("kinetic-container").style.display = "none";
  window.document.getElementById("special-container").style.display = "none";
  window.document.getElementById("heavy-container").style.display = "none";
  window.document.getElementById("helmet-container").style.display = "none";
  window.document.getElementById("gloves-container").style.display = "none";
  window.document.getElementById("chest-container").style.display = "none";
  window.document.getElementById("legs-container").style.display = "none";
  window.document.getElementById("class-armor-container").style.display = "none";
  window.document.getElementById(value).style.display = "flex";
}
function equipmentlist(htmlElement){
  this.element = window.document.getElementById(htmlElement);
  this.container = window.document.getElementById(htmlElement+"-container");
  this.element.addEventListener("mouseover",function(){displayContainer(htmlElement+"-container")});
  this._equipment = [];
  this.setequipment = function(value){
    this._equipment = value;
    this.reload();
  };
  this.getequipment = function(){
    return this._equipment;
  };
  this.findItemIndex = function(value){
    return this._equipment.indexOf(value);
  };
  this.swapEquipped = function(value){
    if(value >= this._equipment.length){
      console.log("invalid value");
    }
    else {
      var index = this._equipment[value];
      var current = this._equipment.shift();
      current.currentlyEquipped = false;
      index.currentlyEquipped = true;
      this._equipment.unshift(index);
      console.log(index);
      console.log(current);
      this._equipment[value] = current;
      this.reload();
    }
  };
  this.addItem = function(value){
    console.log("item added");
    var item = window.document.createElement("img");
    item.id = htmlElement+this._equipment.length;
    this._equipment[this._equipment.length] = value;
    this.container.appendChild(item);
    this.reload();
  };

  this.reload = function(){
    this.element.src = bungieCommon+this._equipment[0].hashData.displayProperties.icon;
    for(var i = 1; i< this._equipment.length; i++){
      window.document.getElementById(htmlElement+i).src = bungieCommon+this._equipment[i].hashData.displayProperties.icon;
    }
  };
}
const character = {
  _class: "unavailable",
  _light: "unavailable",
  set class(value){
    console.log("class type property has been triggered.");
    this._class = value;
    window.document.getElementById("character-class").innerHTML = "lvl "+value.level+" "+value.name;
  },
  set light(value){
    console.log("light property has been triggered.");
    this._light = value;
    window.document.getElementById("character-light").innerHTML = value ;
  },
  set emblem(value){
    console.log("emblem property has been triggered.");
    window.document.getElementById("emblem-icon").src = bungieCommon+value.icon;
    window.document.getElementById("emblem-back").src = bungieCommon+value.background;
  },
  equipment: {
    subclasslist: new equipmentlist("Subclass"),
    set 3284755031(value){
      if(value.currentlyEquipped){ this.subclasslist.addItem(value); }
      else                       { this.subclasslist.addItem(value); }
    },
    kineticlist: new equipmentlist("kinetic"),
    set 1498876634(value){
      if(value.currentlyEquipped){ this.kineticlist.addItem(value); }
      else                       { this.kineticlist.addItem(value); }
    },
    speciallist: new equipmentlist("special"),
    set 2465295065(value){
      if(value.currentlyEquipped){ this.speciallist.addItem(value); }
      else                       { this.speciallist.addItem(value); }
    },
    heavylist: new equipmentlist("heavy"),
    set 953998645(value){
      if(value.currentlyEquipped){ this.heavylist.addItem(value); }
      else                       { this.heavylist.addItem(value); }
    },
    helmetlist: new equipmentlist("helmet"),
    set 3448274439(value){
      if(value.currentlyEquipped){ this.helmetlist.addItem(value); }
      else                       { this.helmetlist.addItem(value); }
    },
    gloveslist: new equipmentlist("gloves"),
    set 3551918588(value){
      if(value.currentlyEquipped){ this.gloveslist.addItem(value); }
      else                       { this.gloveslist.addItem(value); }
    },
    chestlist: new equipmentlist("chest"),
    set 14239492(value){
      if(value.currentlyEquipped){ this.chestlist.addItem(value); }
      else                       { this.chestlist.addItem(value); }
    },
    legslist: new equipmentlist("legs"),
    set 20886954(value){
      if(value.currentlyEquipped){ this.legslist.addItem(value); }
      else                       { this.legslist.addItem(value); }
    },
    classarmorlist: new equipmentlist("class-armor"),
    set 1585787867(value){
      if(value.currentlyEquipped){ this.classarmorlist.addItem(value); }
      else                       { this.classarmorlist.addItem(value); }
    },
    ghostlist: new equipmentlist("ghost"),
    set 4023194814(value){
      if(value.currentlyEquipped){ this.ghostlist.addItem(value); }
      else                       { this.ghostlist.addItem(value); }
    },
    vehiclelist: new equipmentlist("vehicle"),
    set 2025709351(value){
      if(value.currentlyEquipped){ this.vehiclelist.addItem(value); }
      else                       { this.vehiclelist.addItem(value); }
    },
    shiplist: new equipmentlist("ship"),
    set 284967655(value){
      if(value.currentlyEquipped){ this.shiplist.addItem(value); }
      else                       { this.shiplist.addItem(value); }
    },
    clanbannerlist: new equipmentlist("clanbanner"),
    set 4292445962(value){
      if(value.currentlyEquipped){ this.clanbannerlist.addItem(value); }
      else                       { this.clanbannerlist.addItem(value); }
    },
    emblemlist: new equipmentlist("emblem"),
    set 4274335291(value){
      if(value.currentlyEquipped){ this.emblemlist.addItem(value); }
      else                       { this.emblemlist.addItem(value); }
    },
    finisherlist: new equipmentlist("finisher"),
    set 3683254069(value){
      if(value.currentlyEquipped){ this.finisherlist.addItem(value); }
      else                       { this.finisherlist.addItem(value); }
    },
    emotelist: new equipmentlist("emotes"),
    set 1107761855(value){
      if(value.currentlyEquipped){ this.emotelist.addItem(value); }
      else                       { this.emotelist.addItem(value); }
    },
    _artifact: "unavailable",
    set 1506418338(value){
      //console.log("artifact property has been triggered.");
      //console.log("artifact equipped added to stack.");
      this._artifact = value;
      window.document.getElementById("artifact").src = bungieCommon+value.hashData.displayProperties.icon;
    },
  },

};
function Initialize(value){
  window = value;
  var path = "/characterids";
  fetchRequest(path).then(function(result){
    characterIDs = result;
    //console.log(result);
    loadCharacter(characterIDs[counter]);
  });
};
function loadCharacter(value){
  counter += value;
  if(counter > characterIDs.length-1)
    counter = 0;
  if(counter < 0)
    counter = characterIDs.length-1;
  loadCharacterElement(characterIDs[counter]);
  loadCharacterContent(characterIDs[counter]);
  loadInventory(characterIDs[counter]);
}
async function loadCharacterElement(characterID){
  var path = "/character/"+characterID+"/general";
  await fetchRequest(path).then(function(result){
    //console.log(result);
    //console.log("setting up character element.");
    character.emblem = {
      icon: result.emblem.emblemExpanded.secondaryOverlay,
      background: result.emblem.emblemExpanded.secondarySpecial,
    };
    character.class = {level: result.level, name: result.class.name};
    character.light = result.light;
  });
}
function loadCharacterContent(characterID){
  var path = "/character/"+characterID+"/equipment";
  fetchRequest(path).then(function(result){
    for(i in result){
      character.equipment[result[i].hashData.equipHash] = result[i];
    }
  });
}
function loadInventory(characterID){
    var path = "/character/"+characterID+"/inventory";
    fetchRequest(path).then(function(result){
      var equippables = result.equippable;
      for(i in equippables){
        character.equipment[equippables[i].hashData.equipHash] = equippables[i];
        console.log("loading item.");
      }
    });
}
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
