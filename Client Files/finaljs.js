var window;
var bungieCommon = "https://www.bungie.net";
var characterIDs;
var counter = 0;
var placeholderItem = {
  hashData: {
    displayProperties: {
      icon: "",
    },
  },
};
function equipmentlist(htmlElement){
  this.element = window.document.getElementById(htmlElement);
  this.container = window.document.getElementById(htmlElement+"-container");
  this.equipmentContainer = window.document.getElementById(htmlElement+"-equipment");
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
  this.equip = function(value){
    this._equipment[0] = value;
    this.reload();
  }
  this.addItem = function(value){
    if(this._equipment.length == 0){
      this._equipment[0] = placeholderItem;
    }
    var item = window.document.createElement("img");
    item.id = htmlElement+this._equipment.length;
    this._equipment[this._equipment.length] = value;
    item.addEventListener("click",function(){
      console.log("Item id: "+value.itemID);
      equipRequest(value.itemID);
    });
    this.equipmentContainer.appendChild(item);
    this.reload();
  };
  this.wipe = function(){
    this.element.src = "";
    for(var i = 1; i< this._equipment.length; i++){
      window.document.getElementById(htmlElement+i).remove();
    }
    this._equipment = [];
  }
  this.reload = function(){
    this.element.src = bungieCommon+this._equipment[0].hashData.displayProperties.icon;
    for(var i = 1; i< this._equipment.length; i++){
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
  this.loadEquipment = function(){
    this.equipmentWipe();
    var parent = this;
    var path = "/character/"+parent.id+"/equipment";
    fetchRequest(path).then(function(result){
      for(i in result){
        if(result[i].hashData.equipHash == 1506418338){ parent.slots.artifact(result[i]); }
        else { parent.slots[parent.hashKeys[result[i].hashData.equipHash]].equip(result[i]); }
      }
    });
    var path = "/character/"+parent.id+"/equipmentInventory";
    fetchRequest(path).then(function(result){
      for(i in result){
        parent.slots[parent.hashKeys[result[i].hashData.equipHash]].addItem(result[i]);
      }
    });
  };
};
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
  this.loadGeneral = function(){
    var parent = this;
    var path = "/character/"+parent.id+"/general";
    fetchRequest(path).then(function(result){
      //console.log(result);
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
/*const character = {
  id: "",
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
  loadGeneral: function(parent, id){
    var path = "/character/"+id+"/general";
    fetchRequest(path).then(function(result){
      //console.log(result);
      //console.log("setting up character element.");
      parent.emblem = {
        icon: result.emblem.emblemExpanded.secondaryOverlay,
        background: result.emblem.emblemExpanded.secondarySpecial,
      };
      parent.class = {level: result.level, name: result.class.name};
      parent.light = result.light;
    });
  },
  equipment: {
    hashKeys: {
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
    },
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
    set 1107761855(value){
      if(value.currentlyEquipped){ this.emotelist.addItem(value); }
      else                       { this.emotelist.addItem(value); }
    },
    _artifact: function(value){
      window.document.getElementById("artifact").src = bungieCommon+value.hashData.displayProperties.icon;
    },
    equipmentWipe: function(parent){
      parent.subclasslist.wipe();
      parent.kineticlist.wipe();
      parent.speciallist.wipe();
      parent.heavylist.wipe();
      parent.helmetlist.wipe();
      parent.gloveslist.wipe();
      parent.chestlist.wipe();
      parent.legslist.wipe();
      parent.classarmorlist.wipe();
      parent.ghostlist.wipe();
      parent.vehiclelist.wipe();
      parent.shiplist.wipe();
      parent.clanbannerlist.wipe();
      parent.emblemlist.wipe();
      parent.finisherlist.wipe();
      parent.emotelist.wipe();
      window.document.getElementById("artifact").src = "";
    },
    loadEquipment: function(parent, id){
      parent.equipmentWipe(parent);
      console.log("wiped: ");
      console.log(parent);
      var path = "/character/"+id+"/equipment";
      fetchRequest(path).then(function(result){
        for(i in result){
          if(result[i].hashData.equipHash == 1506418338){ parent._artifact(result[i]); }
          else { parent[parent.hashKeys[result[i].hashData.equipHash]].equip(result[i]); }
        }
        var path = "/character/"+id+"/equipmentInventory";
        fetchRequest(path).then(function(result){
          for(i in result){
            parent[parent.hashKeys[result[i].hashData.equipHash]].addItem(result[i]);
          }
        });
        console.log("refilled.");
        console.log(parent);
      });
    },
  },
}; */
function Initialize(value){
  window = value;
  var path = "/characterids";
  fetchRequest(path).then(function(result){
    characterIDs = result;
    character = new character();
    loadCharacter(counter);
  });
};
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
function equipRequest(item){
  console.log("equip request.");
  var path = "/character/"+characterIDs[counter]+"/equipItem/"+item;
  fetchRequest(path).then(function(result){
    character.equipment.loadEquipment(character.equipment, character.id);
  }).catch(function(error){
    console.log("There was an error equipping the item.");
  });
}
