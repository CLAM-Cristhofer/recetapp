const API_BASE = 'https://www.themealdb.com/api/json/v1/1';

const RecipeAPI = {
  _cache: {},
  _cacheExpiry: 5 * 60 * 1000,

  _getCache(key) {
    const cached = this._cache[key];
    if (cached && Date.now() - cached.time < this._cacheExpiry) {
      return cached.data;
    }
    return null;
  },

  _setCache(key, data) {
    this._cache[key] = { data, time: Date.now() };
  },

  async _fetch(url, cacheKey) {
    const cached = this._getCache(cacheKey);
    if (cached) return cached;

    try {
      const res = await fetch(url);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      this._setCache(cacheKey, data);
      return data;
    } catch (err) {
      console.warn(`API Error: ${url}`, err);
      return null;
    }
  },

  async getMealsByCategory(category) {
    const data = await this._fetch(
      `${API_BASE}/filter.php?c=${category}`,
      `cat_${category}`
    );
    return data?.meals || [];
  },

  async getMealsByIngredient(ingredient) {
    const data = await this._fetch(
      `${API_BASE}/filter.php?i=${ingredient}`,
      `ing_${ingredient}`
    );
    return data?.meals || [];
  },

  async getMealsByArea(area) {
    const data = await this._fetch(
      `${API_BASE}/filter.php?a=${area}`,
      `area_${area}`
    );
    return data?.meals || [];
  },

  async searchMeals(keyword) {
    const data = await this._fetch(
      `${API_BASE}/search.php?s=${keyword}`,
      `search_${keyword}`
    );
    return data?.meals || [];
  },

  async getMealById(id) {
    const cached = this._getCache(`meal_${id}`);
    if (cached) return cached;

    const data = await this._fetch(
      `${API_BASE}/lookup.php?i=${id}`,
      `meal_${id}`
    );
    const meal = data?.meals?.[0] || null;
    if (meal) this._setCache(`meal_${id}`, meal);
    return meal;
  },

  async getRandomMeals(count = 6) {
    const meals = [];
    const seen = new Set();
    let attempts = 0;
    while (meals.length < count && attempts < count * 3) {
      attempts++;
      try {
        const res = await fetch(`${API_BASE}/random.php`);
        const data = await res.json();
        if (data.meals?.[0] && !seen.has(data.meals[0].idMeal)) {
          seen.add(data.meals[0].idMeal);
          meals.push(data.meals[0]);
        }
      } catch (e) {
        break;
      }
    }
    return meals;
  },

  async getCategories() {
    const data = await this._fetch(
      `${API_BASE}/categories.php`,
      'categories'
    );
    return data?.categories || [];
  },

  async getAreas() {
    const data = await this._fetch(
      `${API_BASE}/list.php?a=list`,
      'areas'
    );
    return data?.meals || [];
  },

  getMealIngredients(meal) {
    const ingredients = [];
    for (let i = 1; i <= 20; i++) {
      const ingredient = meal[`strIngredient${i}`];
      const measure = meal[`strMeasure${i}`];
      if (ingredient && ingredient.trim()) {
        ingredients.push({
          name: ingredient.trim(),
          name_ES: ingredient.trim(),
          measure: measure ? measure.trim() : ''
        });
      }
    }
    return ingredients;
  },

  getMealSteps(meal) {
    if (!meal.strInstructions) return [];
    return meal.strInstructions
      .split(/\r?\n/)
      .map(s => s.trim())
      .filter(s => s.length > 3);
  },

  getTranslatedSteps(meal) {
    if (!meal.strInstructions_ES) return this.getMealSteps(meal);
    return meal.strInstructions_ES
      .split(/\r?\n/)
      .map(s => s.trim())
      .filter(s => s.length > 3);
  }
};
