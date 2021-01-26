var window;
var bungieCommon = "https://www.bungie.net";
var characterIDs;
var counter = 0;
var equipmentlist = {
  updatelist: function(value){
  },
  wipelist: function(){
  },
  removeitem:function(value){
  },
  swapitems: function(value,value){
  },
  getItem: function(value){
  }
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
    _currentsubclass: "unavailable",
    set currentsubclass(value){
      this._currentsubclass = value;
      window.document.getElementById("Subclass").src = bungieCommon+value.hashData.displayProperties.icon;
    },
    subclasslist: [],
    set 3284755031(value){
      //console.log("subclass property has been triggered.");
      if(value.currentlyEquipped){
        this.currentsubclass = value;
      }
      else {
        //console.log("unequipped item added to subclass stack.");
        this.subclasslist[this.subclasslist.length] = value;
      }
    },
    _currentkinetic: "unavailable",
    set currentkinetic(value){
      this._currentkinetic = value;
      window.document.getElementById("kinetic").src = bungieCommon+value.hashData.displayProperties.icon;
    },
    kineticlist: [],
    set 1498876634(value){
      //console.log("kinetic property has been triggered.");
      if(value.currentlyEquipped){
        this.currentkinetic = value;
      }
      else {
        //console.log("unequipped item added to kinetic stack.");
        this.kineticlist[this.kineticlist.length] = value;
      }
    },
    _currentspecial: "unavailable",
    set currentspecial(value){
      this._currentspecial = value;
      window.document.getElementById("special").src = bungieCommon+value.hashData.displayProperties.icon;
    },
    speciallist: [],
    set 2465295065(value){
      //console.log("special property has been triggered.");
      if(value.currentlyEquipped){
        this.currentspecial = value;
      }
      else {
        //console.log("unequipped item added to special stack.");
        this.speciallist[this.speciallist.length] = value;
      }
    },
    _currentheavy: "unavailable",
    set currentheavy(value){
      this._currentheavy = value;
      window.document.getElementById("heavy").src = bungieCommon+value.hashData.displayProperties.icon;
    },
    heavylist: [],
    set 953998645(value){
      //console.log("heavy property has been triggered.");
      if(value.currentlyEquipped){
        this.currentheavy = value;
      }
      else {
        //console.log("unequipped item added to heavy stack.");
        this.heavylist[this.heavylist.length] = value;
      }
    },
    _currenthelmet: "unavailable",
    set currenthelmet(value){
      this._currenthelmet = value;
      window.document.getElementById("helmet").src = bungieCommon+value.hashData.displayProperties.icon;
    },
    helmetlist: [],
    set 3448274439(value){
      //console.log("helmet property has been triggered.");
      if(value.currentlyEquipped){
        this.currenthelmet = value;
      }
      else {
        //console.log("unequipped item added to helmet stack.");
        this.helmetlist[this.helmetlist.length] = value;
      }
    },
    _currentgloves: "unavailable",
    set currentgloves(value){
      this._currentgloves = value;
      window.document.getElementById("gloves").src = bungieCommon+value.hashData.displayProperties.icon;
    },
    gloveslist: [],
    set 3551918588(value){
      //console.log("gloves property has been triggered.");
      if(value.currentlyEquipped){
        this.currentgloves = value;
      }
      else {
        //console.log("unequipped item added to helmet stack.");
        this.gloveslist[this.gloveslist.length] = value;
      }
    },
    _currentchest: "unavailable",
    set currentchest(value){
      this._currentchest = value;
      window.document.getElementById("chest").src = bungieCommon+value.hashData.displayProperties.icon;
    },
    chestlist: [],
    set 14239492(value){
      //console.log("chest property has been triggered.");
      if(value.currentlyEquipped){
        this.currentchest = value;
      }
      else {
        //console.log("unequipped item added to chest stack.");
        this.chestlist[this.chestlist.length] = value;
      }
    },
    _currentleg: "unavailable",
    set currentleg(value){
      this._currentleg = value;
      window.document.getElementById("legs").src = bungieCommon+value.hashData.displayProperties.icon;
    },
    legslist: [],
    set 20886954(value){
      //console.log("legs property has been triggered.");
      if(value.currentlyEquipped){
        this.currentleg = value;
      }
      else {
        //console.log("unequipped item added to legs stack.");
        this.legslist[this.legslist.length] = value;
      }
    },
    _currentclassarmor: "unavailable",
    set currentclassarmor(value){
      this._currentclassarmor = value;
      window.document.getElementById("class-armor").src = bungieCommon+value.hashData.displayProperties.icon;
    },
    classarmorlist: [],
    set 1585787867(value){
      //console.log("classarmor property has been triggered.");
      if(value.currentlyEquipped){
        this.currentclassarmor = value;
      }
      else {
        //console.log("unequipped item added to classarmor stack.");
        this.classarmorlist[this.classarmorlist.length] = value;
      }
    },
    _currentghost: "unavailable",
    set currentghost(value){
      this._currentghost = value;
      window.document.getElementById("ghost").src = bungieCommon+value.hashData.displayProperties.icon;
    },
    ghostlist: [],
    set 4023194814(value){
      //console.log("ghost property has been triggered.");
      if(value.currentlyEquipped){
        this.currentghost = value;
      }
      else {
        //console.log("unequipped item added to ghost stack.");
        this.ghostlist[this.ghostlist.length] = value;
      }
    },
    _currentvehicle: "unavailable",
    set currentvehicle(value){
      this._currentvehicle = value;
      window.document.getElementById("vehicle").src = bungieCommon+value.hashData.displayProperties.icon;
    },
    vehiclelist: [],
    set 2025709351(value){
      //console.log("vehicle property has been triggered.");
      if(value.currentlyEquipped){
        this.currentvehicle = value;
      }
      else {
        //console.log("unequipped item added to vehicle stack.");
        this.vehiclelist[this.vehiclelist.length] = value;
      }
    },
    _currentship: "unavailable",
    set currentship(value){
      this._currentship = value;
        window.document.getElementById("ship").src = bungieCommon+value.hashData.displayProperties.icon;
    },
    shiplist: [],
    set 284967655(value){
      //console.log("ship property has been triggered.");
      if(value.currentlyEquipped){
        this.currentship = value;
      }
      else {
        //console.log("unequipped item added to ship stack.");
        this.shiplist[this.shiplist.length] = value;
      }
    },
    _currentclanbanner: "unavailable",
    set currentclanbanner(value){
      this._currentclanbanner = value;
      window.document.getElementById("clanbanner").src = bungieCommon+value.hashData.displayProperties.icon;
    },
    clanbannerlist: [],
    set 4292445962(value){
      //console.log("clan banner property has been triggered.");
      if(value.currentlyEquipped){
        this.currentclanbanner = value;
      }
      else {
        //console.log("unequipped item added to clan banner stack.");
        this.clanbannerlist[this.clanbannerlist.length] = value;
      }
    },
    _currentemblem: "unavailable",
    set currentemblem(value){
      this._currentemblem = value;
      window.document.getElementById("emblem").src = bungieCommon+value.hashData.displayProperties.icon;
    },
    emblemlist: [],
    set 4274335291(value){
      //console.log("emblem property has been triggered.");
      if(value.currentlyEquipped){
        this.currentemblem = value;
      }
      else {
        //console.log("unequipped item added to emblem stack.");
        this.emblemlist[this.emblemlist.length] = value;
      }
    },
    _currentfinisher: "unavailable",
    set currentfinisher(value){
      this._currentfinisher = value;
      window.document.getElementById("finisher").src = bungieCommon+value.hashData.displayProperties.icon;
    },
    finisherlist: [],
    set 3683254069(value){
      //console.log("finisher property has been triggered.");
      if(value.currentlyEquipped){
        this.currentfinisher = value;
      }
      else {
        //console.log("unequipped item added to finisher stack.");
        this.finisherlist[this.finisherlist.length] = value;
      }
    },
    _currentemote: "unavailable",
    set currentemote(value){
      this._currentemote = value;
      window.document.getElementById("emotes").src = bungieCommon+value.hashData.displayProperties.icon;
    },
    emotelist: [],
    set 1107761855(value){
      //console.log("emotes property has been triggered.");
      if(value.currentlyEquipped){
        this.currentemote = value;
      }
      else {
        //console.log("unequipped item added to emotes stack.");
        this.emotelist[this.emotelist.length] = value;
      }
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
