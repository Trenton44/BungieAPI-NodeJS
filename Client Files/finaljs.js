var window;
var bungieCommon = "https://www.bungie.net";
var characterIDs;
var counter = 0;
function Initialize(value){
  window = value;
  var path = "/characterids";
  fetchRequest(path).then(function(result){
    characterIDs = result;
    console.log(result);
    loadCharacter(characterIDs[counter]);
  });
};
function loadCharacter(value){
  counter += value;
  if(counter > characterIDs.length)
    counter = 0;
  if(counter < 0)
    counter = characterIDs.length;
  console.log("counter: "+counter);
  loadCharacterElement(characterIDs[counter]);
  loadCharacterContent(characterIDs[counter]);
  loadCharacterSlots();
}
async function loadCharacterElement(characterID){
  var path = "/character/"+characterID;
  await fetchRequest(path).then(function(result){
    console.log(result);
    console.log("setting up character element.");
    //window.document.getElementById("character-info").style.backgroundImage ="url("+bungieCommon+result.characterData.emblemBackgroundPath+")";
    window.document.getElementById("character-class").innerHTML = result.characters.classType;
    window.document.getElementById("character-light").innerHTML = result.characters.light;
    window.document.getElementById("character-level").innerHTML = result.characters.baseCharacterLevel;
  });
}
function loadCharacterContent(characterID){
  var path = "/character/"+characterID+"/equipment";
  fetchRequest(path).then(function(result){
    console.log(result);
    for(i in result){
      var weaponType = result[i].bucketHashData.displayProperties.name;
      //console.log(weaponType);
      var element = window.document.getElementById(weaponType);
      console.log(weaponType);
      while(element.firstChild){
        //console.log("element has children");
        element.removeChild(element.firstChild);
      }
      if(weaponType == "Subclass"){
        window.document.getElementById(weaponType).src = bungieCommon+result[i].itemHashData.displayProperties.icon;
      }
      else {
        var img = window.document.createElement("img");
        img.src = bungieCommon+result[i].itemHashData.displayProperties.icon;
        var addEvent = function(t){
          img.onmouseover = function(){
            loadSlotEquipment(t);
          }
        };
        addEvent(weaponType);
        element.append(img);
      }
      //console.log("finished creation of element "+weaponType);
    }
  });
}
function loadSlotEquipment(weaponType){
  //slotItems = characterSlotEquipment[weaponType];
  var element = window.document.getElementById("equipment-menu");
  while(element.firstChild){
    //console.log("element has children");
    element.removeChild(element.firstChild);
  }
  for(i in slotItems){
    var img = window.document.createElement("img");
    img.src = bungieCommon+slotItems[i].itemHashData.displayProperties.icon;
    var addClick = function(t){
      img.onclick = function(){
      }
    };
    addClick(slotItems[i].itemHashData.displayProperties.name);
    element.append(img);
  }
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
