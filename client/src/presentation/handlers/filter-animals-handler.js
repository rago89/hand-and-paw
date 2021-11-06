/* eslint-disable no-continue */
import { filterAnimals } from "../../data-access/animal-access/filter-animals.js";
import animalSearchResults from "../components/shared/animal-search-results.js";

export const filterAnimalsHandler = async (event) => {
  event.preventDefault();
  const form = document.getElementById("search-animal-form");
  const formData = new FormData(form);

  const parametersObj = {};
  for (const key of formData.keys()) {
    if (key === "breed" && formData.get(key) === "") {
      continue;
    }

    if (formData.get(key) === "all") {
      continue;
    }
    parametersObj[key] = formData.get(key);
  }
  const filter = await filterAnimals(parametersObj);
  const animalList = document.getElementById("animals-list");
  animalList.innerHTML = "";
  animalList.appendChild(animalSearchResults(filter));
};