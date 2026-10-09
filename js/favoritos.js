const Favoritos = {
  KEY: 'recetapp_favoritos',

  getAll() {
    try {
      return JSON.parse(localStorage.getItem(this.KEY)) || [];
    } catch {
      return [];
    }
  },

  add(meal) {
    const favs = this.getAll();
    if (!favs.find(f => f.idMeal === meal.idMeal)) {
      favs.push({
        idMeal: meal.idMeal,
        strMeal: meal.strMeal,
        strMealThumb: meal.strMealThumb,
        strCategory: meal.strCategory,
        addedAt: Date.now()
      });
      localStorage.setItem(this.KEY, JSON.stringify(favs));
      return true;
    }
    return false;
  },

  remove(idMeal) {
    const favs = this.getAll().filter(f => f.idMeal !== idMeal);
    localStorage.setItem(this.KEY, JSON.stringify(favs));
  },

  isFavorite(idMeal) {
    return this.getAll().some(f => f.idMeal === idMeal);
  },

  toggle(meal) {
    if (this.isFavorite(meal.idMeal)) {
      this.remove(meal.idMeal);
      return false;
    } else {
      this.add(meal);
      return true;
    }
  },

  count() {
    return this.getAll().length;
  }
};
