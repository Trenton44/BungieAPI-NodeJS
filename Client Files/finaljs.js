var window;
var bungieCommon = "https://www.bungie.net";
var characterIDs;
var counter = 0;
function Initialize(value){
  window = value;
  var path = "/characterids";
  fetchRequest(path).then(function(result){
    characterIDs = result;
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
}
async function loadCharacterElement(characterID){
  var path = "/character/"+characterID;
  await fetchRequest(path).then(function(result){
    console.log(result);
    console.log("setting up character element.");
    //window.document.getElementById("character-info").style.backgroundImage ="url("+bungieCommon+result.characterData.emblemBackgroundPath+")";
    window.document.getElementById("character-class").innerHTML = result.characterData.classType;
    window.document.getElementById("character-light").innerHTML = result.characterData.light;
    window.document.getElementById("character-level").innerHTML = result.characterData.baseCharacterLevel;
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
        element.append(img);
      }

      //console.log("finished creation of element "+weaponType);
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
