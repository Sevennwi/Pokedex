let allPokemon = [];
let tableauFin = [];
let typeBattleFinal = [];
const searchInput = document.querySelector(".recherche-poke input");
const listePoke = document.querySelector(".liste-poke");
const chargement = document.querySelector(".loader");

const types = {
  grass: "#78c850",
  ground: "#E2BF65",
  dragon: "#6F35FC",
  fire: "#F58271",
  electric: "#F7D02C",
  fairy: "#D685AD",
  poison: "#966DA3",
  bug: "#B3F594",
  water: "#6390F0",
  normal: "#D9D5D8",
  psychic: "#F95587",
  flying: "#A98FF3",
  fighting: "#C25956",
  rock: "#B6A136",
  ghost: "#735797",
  ice: "#96D9D6",
  steel: "#7b94bd",
  dark: "#626283",
};

// Make Array of Weakness and strength for each type

function fetchType() {
  for (element in types) {
    fetch(`https://pokeapi.co/api/v2/type/${element}`)
      .then((reponse) => reponse.json())
      .then((allType) => {
        let typeBattle = {};
        weaknessArray = allType.damage_relations.double_damage_from;
        strongArray = allType.damage_relations.double_damage_to;
        immuneToArray = allType.damage_relations.no_damage_from;
        halfDamageArray = allType.damage_relations.half_damage_from;
        typeBattle.name = allType.name;
        let weakness = [];
        for (e in weaknessArray) {
          weakness.push(weaknessArray[e].name);
        }
        let strong = [];
        for (e in strongArray) {
          strong.push(strongArray[e].name);
        }
        let immune = [];
        for (e in immuneToArray) {
          immune.push(immuneToArray[e].name);
        }
        let halfDamage = [];
        for (e in halfDamageArray) {
          halfDamage.push(halfDamageArray[e].name);
        }
        typeBattle.weakness = weakness;
        typeBattle.strong = strong;
        if (immune.length > 0) {
          typeBattle.immuneTo = immune;
        }
        typeBattle.halfDamage = halfDamage;
        typeBattleFinal.push(typeBattle);
      });
  }
}
fetchType();

// Take the first 385 pokemon

function fetchPokemonBase() {
  fetch("https://pokeapi.co/api/v2/pokemon?limit=385")
    .then((reponse) => reponse.json())
    .then((allPoke) => {
      allPoke.results.forEach((pokemon) => {
        fetchPokemonComplet(pokemon);
      });
    });
}
fetchPokemonBase();

// Make an object with different information for each Pokemon

function fetchPokemonComplet(pokemon) {
  let objPokemonFull = {};
  let url = pokemon.url;

  fetch(url)
    .then((reponse) => reponse.json())
    .then((pokeData) => {
      objPokemonFull.pic = pokeData.sprites.front_default;
      objPokemonFull.type = pokeData.types[0].type.name;
      if (pokeData.types.length > 1) {
        objPokemonFull.type2 = pokeData.types[1].type.name;
      }
      objPokemonFull.id = pokeData.id;
      objPokemonFull.weight = pokeData.weight / 10;
      objPokemonFull.height = pokeData.height * 10;
      objPokemonFull.name = pokeData.name;

      let pokemonTypeEffect = typeBattleFinal.find(
        (o) => o.name === pokeData.types[0].type.name
      );
      let halfDamageArray = pokemonTypeEffect.halfDamage;

      objPokemonFull.weakness = pokemonTypeEffect.weakness;
      objPokemonFull.strong = pokemonTypeEffect.strong;
      if (pokemonTypeEffect.immuneTo != undefined) {
        objPokemonFull.immuneTo = pokemonTypeEffect.immuneTo;
      }

      // Make Double type pokemon weakness and immunity
      if (pokeData.types.length > 1) {
        let pokemonTypeEffect2 = typeBattleFinal.find(
          (o) => o.name === pokeData.types[1].type.name
        );
        let fullWeakness = pokemonTypeEffect.weakness.concat(
          pokemonTypeEffect2.weakness
        );
        let halfDamageArray2 = pokemonTypeEffect2.halfDamage;
        let fullhalfDamage = halfDamageArray.concat(halfDamageArray2);
        fullhalfDamage = [...new Set(fullhalfDamage)];

        fullWeakness = fullWeakness.filter(function (val) {
          return fullhalfDamage.indexOf(val) == -1;
        });

        if (pokemonTypeEffect2.immuneTo != undefined) {
          fullWeakness = fullWeakness.filter(function (val) {
            return pokemonTypeEffect2.immuneTo.indexOf(val) == -1;
          });
        }

        objPokemonFull.weakness = [...new Set(fullWeakness)];
        let fullStrong = pokemonTypeEffect.strong.concat(
          pokemonTypeEffect2.strong
        );
        objPokemonFull.strong = [...new Set(fullStrong)];

        if (pokemonTypeEffect2.immuneTo != undefined) {
          objPokemonFull.immuneTo = pokemonTypeEffect2.immuneTo;
          if (pokemonTypeEffect.immuneTo != undefined) {
            objPokemonFull.immuneTo = pokemonTypeEffect.immuneTo.concat(
              pokemonTypeEffect2.immuneTo
            );
          }
        }
      }

      allPokemon.push(objPokemonFull);

      if (allPokemon.length === 385) {
        tableauFin = allPokemon
          .sort((a, b) => {
            return a.id - b.id;
          })
          .slice(0, 21);

        createCard(tableauFin);
        chargement.style.display = "none";
      }

      //console.log(objPokemonFull);

      // Use if more information per pokemon needed

      /*       fetch(`https://pokeapi.co/api/v2/pokemon-species/${nameP}`)
        .then((reponse) => reponse.json())
        .then((pokeData) => {
          ...
          allPokemon.push(objPokemonFull);

          if (allPokemon.length === 385) {
            tableauFin = allPokemon
              .sort((a, b) => {
                return a.id - b.id;
              })
              .slice(0, 21);

            createCard(tableauFin);
            chargement.style.display = "none";
            console.log(tableauFin);
          }
        }); */
    });
}

// creation des cartes

function createCard(arr) {
  for (let i = 0; i < arr.length; i++) {
    const div = document.createElement("div");
    div.className = "flip-card";
    // Animation
    div.addEventListener("click", function () {
      div.classList.toggle("flip-card-anim");
    });

    const carte = document.createElement("div");
    carte.className = "divFront";
    let couleur = types[arr[i].type];
    let couleurDualType = types[arr[i].type2];
    if (couleurDualType) {
      carte.style.background = `linear-gradient(55deg, ${couleur} 50%, ${couleurDualType} 50%)`;
    } else {
      carte.style.background = couleur;
    }
    const txtCarte = document.createElement("h5");
    txtCarte.innerText = arr[i].name;
    const typeName = document.createElement("div");
    typeName.className = "type";
    const type1Name = document.createElement("p");
    type1Name.innerText = arr[i].type;
    type1Name.className = "type1";
    type1Name.style.color = types[arr[i].type];
    typeName.appendChild(type1Name);
    if (arr[i].type2) {
      const type2Name = document.createElement("p");
      type2Name.innerText = arr[i].type2;
      type2Name.className = "type2";
      type2Name.style.color = types[arr[i].type2];
      typeName.appendChild(type2Name);
    }
    const imgCarte = document.createElement("img");
    imgCarte.src = arr[i].pic;

    const arrow = document.createElement("img");
    arrow.src = "/Image/arrow.png";
    arrow.className = "arrow";

    //BackCards
    const divBack = document.createElement("div");
    divBack.className = "divBack";
    divBack.style.background =
      'url("/Image/pokeball.png") no-repeat center, linear-gradient(#666468 50%, #8F8D91 50%)';
    const idCarte = document.createElement("p");
    idCarte.innerText = `ID: # ${arr[i].id}`;
    idCarte.className = "id";
    const typeWeakStrongContainer = document.createElement("div");
    typeWeakStrongContainer.className = "typeWeakStrongContainer";
    const weightHeight = document.createElement("div");
    weightHeight.className = "property";
    const weight = document.createElement("p");
    weight.innerText = arr[i].weight + "kg";
    const height = document.createElement("p");
    height.innerText = arr[i].height + "cm";
    const typeWeakContainer = document.createElement("div");
    typeWeakContainer.className = "typeWeakContainer";
    const typeWeakh3 = document.createElement("h3");
    typeWeakh3.innerText = "Weak to:";

    const weakness = document.createElement("div");
    weakness.className = "weak";
    arr[i].weakness.forEach((el) => {
      const weak = document.createElement("p");
      weak.innerText = el;
      weak.style.color = types[el];
      weakness.appendChild(weak);
    });

    const typeStrongContainer = document.createElement("div");
    typeStrongContainer.className = "typeStrongContainer";
    const typeStrongh3 = document.createElement("h3");
    typeStrongh3.innerText = "Strong Against:";

    const strenght = document.createElement("div");
    strenght.className = "strong";
    arr[i].strong.forEach((el) => {
      const strong = document.createElement("p");
      strong.innerText = el;
      strong.style.color = types[el];
      strenght.appendChild(strong);
    });

    carte.appendChild(imgCarte);
    carte.appendChild(txtCarte);
    carte.appendChild(typeName);
    carte.appendChild(arrow);
    div.appendChild(carte);

    //Backcard
    div.appendChild(divBack);
    divBack.appendChild(idCarte);
    divBack.appendChild(weightHeight);
    weightHeight.appendChild(weight);
    weightHeight.appendChild(height);
    divBack.appendChild(typeWeakStrongContainer);
    typeWeakStrongContainer.appendChild(typeWeakContainer);
    typeWeakContainer.appendChild(typeWeakh3);
    typeWeakContainer.appendChild(weakness);
    typeWeakStrongContainer.appendChild(typeStrongContainer);
    typeStrongContainer.appendChild(typeStrongh3);
    typeStrongContainer.appendChild(strenght);
    if (arr[i].immuneTo != undefined) {
      const immunityContainer = document.createElement("h3");
      immunityContainer.innerText = "Immune to:";
      const immunity = document.createElement("div");
      immunity.className = "immunity";
      divBack.appendChild(immunityContainer);
      divBack.appendChild(immunity);
      arr[i].immuneTo.forEach((el) => {
        const immune = document.createElement("p");
        immune.innerText = el;
        immune.style.color = types[el];
        immunity.appendChild(immune);
      });
    }

    listePoke.appendChild(div);
  }
}

// Scroll Infini

window.addEventListener("scroll", () => {
  const { scrollTop, scrollHeight, clientHeight } = document.documentElement;
  // scrollTop = scroll depuis top.
  // scrollHeight = scroll total.
  // clientHeight = hauteur de la fenêtre, partie visible.

  if (clientHeight + scrollTop >= scrollHeight - 20) {
    addPoke(6);
  }
});

let index = 21;

function addPoke(nb) {
  if (index > 385) {
    return;
  }

  const arrToAdd = allPokemon.slice(index, index + nb);
  createCard(arrToAdd);
  index += nb;
}

// Recherche

let searchInputPoke = document.querySelector(".recherchePoke");
let searchInputType = document.querySelector(".rechercheType");

searchInputPoke.addEventListener("keyup", rechercheName);
searchInputPoke.addEventListener("search", clearInput);

searchInputType.addEventListener("keyup", rechercheType);
searchInputType.addEventListener("search", clearInput);

function rechercheName() {
  if (index < 385) {
    addPoke(364);
  }

  let filterPoke, allCards, titleValue, allTitles;
  filterPoke = searchInputPoke.value.toUpperCase();
  allCards = document.querySelectorAll(".flip-card");
  allTitles = document.querySelectorAll(".divFront > h5");

  //Name
  for (i = 0; i < allCards.length; i++) {
    titleValue = allTitles[i].innerText;

    if (titleValue.toUpperCase().indexOf(filterPoke) > -1) {
      allCards[i].style.display = "flex";
    } else {
      allCards[i].style.display = "none";
    }
  }
}

function rechercheType() {
  if (index < 385) {
    addPoke(364);
  }

  let filterType = searchInputType.value.toUpperCase();
  let allCards = document.querySelectorAll(".flip-card");
  let allType = document.querySelectorAll(".type");

  // Type
  for (let j = 0; j < allType.length; j++) {
    let typeValue1 = allType[j].children[0].innerHTML;
    if (typeValue1.toUpperCase().indexOf(filterType) > -1) {
      allCards[j].style.display = "flex";
    } else {
      allCards[j].style.display = "none";
    }

    if (allType[j].children[1]) {
      let typeValue2 = allType[j].children[1].innerHTML;
      if (
        typeValue1.toUpperCase().indexOf(filterType) > -1 ||
        typeValue2.toUpperCase().indexOf(filterType) > -1
      ) {
        allCards[j].style.display = "flex";
      } else {
        allCards[j].style.display = "none";
      }
    }
  }
}

function clearInput() {
  let allCards = document.querySelectorAll(".flip-card");
  for (i = 0; i < allCards.length; i++) {
    allCards[i].style.display = "flex";
  }
}

// Animation Input

searchInputPoke.addEventListener("input", function (e) {
  if (e.target.value !== "") {
    searchInputPoke.parentNode.classList.add("active-input");
  } else if (e.target.value === "") {
    searchInputPoke.parentNode.classList.remove("active-input");
  }
});

searchInputType.addEventListener("input", function (e) {
  if (e.target.value !== "") {
    searchInputType.parentNode.classList.add("active-input");
  } else if (e.target.value === "") {
    searchInputType.parentNode.classList.remove("active-input");
  }
});

// Reload Page for Api

function reload() {
  if (window.localStorage) {
    if (!localStorage.getItem("firstLoad")) {
      localStorage["firstLoad"] = true;
      window.location.reload();
    } else localStorage.removeItem("firstLoad");
  }
};

reload()