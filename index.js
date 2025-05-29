const searchBtn = document.getElementById("search-btn")
const mealList = document.getElementById("meal")
const mealDetailsContent = document.querySelector(".meal-details-content")
const recipeCloseBtn = document.getElementById("recipe-close-btn")

// event listeners
searchBtn.addEventListener("click", getMealList)
mealList.addEventListener("click", getMealRecipe)
recipeCloseBtn.addEventListener("click", () => {
  document.getElementById("recipe-modal").classList.remove("showRecipe")
})

// Add Enter key support for search
document.getElementById("search-input").addEventListener("keypress", (e) => {
  if (e.key === "Enter") {
    getMealList()
  }
})

// Add suggestion tag functionality
document.querySelectorAll(".suggestion-tag").forEach((tag) => {
  tag.addEventListener("click", () => {
    document.getElementById("search-input").value = tag.textContent
    getMealList()
  })
})

// Close modal when clicking overlay
document.querySelector(".modal-overlay").addEventListener("click", () => {
  document.getElementById("recipe-modal").classList.remove("showRecipe")
})

// get meal list that matches with the ingredients
function getMealList() {
  const searchInputTxt = document.getElementById("search-input").value.trim()
  if (!searchInputTxt) {
    mealList.innerHTML = '<div class="notFound">🔍 Please enter some ingredients to search for amazing recipes!</div>'
    return
  }

  // Show loading state
  document.getElementById("loading").style.display = "flex"
  mealList.innerHTML = ""

  const ingredients = searchInputTxt.split(" ")

  const fetchPromises = ingredients.map((ingredient) => {
    return fetch(`https://www.themealdb.com/api/json/v1/1/filter.php?i=${ingredient}`).then((response) =>
      response.json(),
    )
  })

  Promise.all(fetchPromises)
    .then((results) => {
      // Hide loading state
      document.getElementById("loading").style.display = "none"

      let html = ""
      if (results.every((result) => result.meals)) {
        const mealArrays = results.map((result) => result.meals)
        const commonMeals = mealArrays.shift().filter((meal) => {
          return mealArrays.every((mealArray) => mealArray.some((m) => m.idMeal === meal.idMeal))
        })
        if (commonMeals.length) {
          commonMeals.forEach((meal) => {
            html += `
                            <div class = "meal-item" data-id = "${meal.idMeal}">
                                <div class = "meal-img">
                                    <img src = "${meal.strMealThumb}" alt = "${meal.strMeal}">
                                </div>
                                <div class = "meal-name">
                                    <h3>${meal.strMeal}</h3>
                                    <a href = "#" class = "recipe-btn">
                                        <i class="fas fa-book-open"></i>
                                        Get Recipe
                                    </a>
                                </div>
                            </div>
                        `
          })
          mealList.classList.remove("notFound")
        } else {
          html =
            '<div class="notFound">🍽️ Sorry, we couldn\'t find any meals with all those ingredients. Try different combinations!</div>'
          mealList.classList.add("notFound")
        }
      } else {
        html =
          '<div class="notFound">🔍 No recipes found. Try searching for common ingredients like chicken, beef, or rice!</div>'
        mealList.classList.add("notFound")
      }

      mealList.innerHTML = html
    })
    .catch((error) => {
      // Hide loading state and show error
      document.getElementById("loading").style.display = "none"
      mealList.innerHTML = '<div class="notFound">❌ Something went wrong. Please try again later!</div>'
      console.error("Error fetching meals:", error)
    })
}

// get recipe of the meal
function getMealRecipe(e) {
  e.preventDefault()
  if (e.target.classList.contains("recipe-btn") || e.target.closest(".recipe-btn")) {
    const mealItem = e.target.closest(".meal-item")
    fetch(`https://www.themealdb.com/api/json/v1/1/lookup.php?i=${mealItem.dataset.id}`)
      .then((response) => response.json())
      .then((data) => mealRecipeModal(data.meals))
  }
}

// create a modal
function mealRecipeModal(meal) {
  console.log(meal)
  meal = meal[0]

  // Extract ingredients and measurements
  let ingredients = ""
  for (let i = 1; i <= 20; i++) {
    if (meal[`strIngredient${i}`]) {
      ingredients += `<li><i class="fas fa-check-circle"></i> ${meal[`strIngredient${i}`]} - ${meal[`strMeasure${i}`]}</li>`
    }
  }

  const html = `
        <h2 class = "recipe-title">${meal.strMeal}</h2>
        <p class = "recipe-category">
            <i class="fas fa-tag"></i>
            ${meal.strCategory}
        </p>
        <div class = "recipe-meal-img">
            <img src = "${meal.strMealThumb}" alt = "${meal.strMeal}">
        </div>
        <div class = "recipe-ingredients">
            <h3><i class="fas fa-list"></i> Ingredients:</h3>
            <ul>${ingredients}</ul>
        </div>
        <div class = "recipe-instruct">
            <h3><i class="fas fa-utensils"></i> Instructions:</h3>
            <p>${meal.strInstructions}</p>
        </div>
        <div class = "recipe-link">
            <a href = "${meal.strYoutube}" target = "_blank">
                <i class="fab fa-youtube"></i>
                Watch Video Tutorial
            </a>
        </div>
    `
  mealDetailsContent.innerHTML = html
  document.getElementById("recipe-modal").classList.add("showRecipe")
}
