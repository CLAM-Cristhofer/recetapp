const RecipeAlgorithm = {
  INGREDIENT_KEYWORDS: {
    chocolate: ['chocolate', 'cocoa', 'cacao'],
    leche: ['milk', 'leche', 'cream', 'crema', 'condensed milk', 'evaporated milk', 'coconut milk'],
    huevo: ['egg', 'huevo', 'huevos', 'egg yolk', 'egg white'],
    azucar: ['sugar', 'azucar', 'azúcar', 'brown sugar', 'caster sugar', 'icing sugar'],
    harina: ['flour', 'harina', 'all purpose flour'],
    mantequilla: ['butter', 'mantequilla'],
    queso: ['cheese', 'queso', 'cream cheese', 'mascarpone', 'ricotta'],
    fresa: ['strawberry', 'fresa', 'fresas'],
    platano: ['banana', 'platano', 'plátano'],
    manzana: ['apple', 'manzana'],
    limon: ['lemon', 'lime', 'limon', 'limón', 'lemon juice', 'lemon zest'],
    canela: ['cinnamon', 'canela', 'cinnamon stick'],
    vainilla: ['vanilla', 'vainilla', 'vanilla extract', 'vanilla pod'],
    nuez: ['walnut', 'pecan', 'nuez', 'nuts', 'almond', 'almendra', 'hazelnut', 'peanut'],
    miel: ['honey', 'miel'],
    gelatina: ['gelatin', 'gelatina'],
    coco: ['coconut', 'coco', 'coconut flakes', 'desiccated coconut'],
    arroz: ['rice', 'arroz'],
    avena: ['oats', 'avena', 'rolled oats'],
    cafe: ['coffee', 'café', 'espresso'],
    crema: ['cream', 'crema', 'heavy cream', 'whipping cream', 'sour cream'],
    frutas: ['fruit', 'fruta', 'berry', 'berries', 'strawberry', 'blueberry', 'raspberry'],
    nueces: ['nut', 'nuez', 'walnut', 'pecan', 'almond', 'hazelnut', 'cashew', 'pistachio'],
    pimienta: ['pepper', 'pimienta', 'black pepper', 'chili', 'chili powder'],
    ajo: ['garlic', 'ajo', 'garlic cloves'],
    cebolla: ['onion', 'cebolla', 'shallots', 'spring onion'],
    tomate: ['tomato', 'tomate', 'tomatoes'],
    pasta: ['pasta', 'spaghetti', 'macaroni', 'penne', 'noodles'],
    pan: ['bread', 'pan', 'breadcrumbs', 'pita bread'],
    carne: ['beef', 'carne', 'steak', 'minced beef', 'ground beef'],
    pollo: ['chicken', 'pollo', 'chicken breast', 'chicken thigh'],
    cerdo: ['pork', 'cerdo', 'bacon', 'ham', 'sausage'],
    marisco: ['shrimp', 'prawn', 'salmon', 'tuna', 'cod', 'fish', 'seafood'],
    verdura: ['vegetable', 'verdura', 'carrot', 'broccoli', 'spinach', 'potato'],
    aceite: ['oil', 'aceite', 'olive oil', 'vegetable oil', 'coconut oil'],
    vinagre: ['vinegar', 'vinagre', 'balsamic vinegar'],
    curry: ['curry', 'curry powder', 'garam masala'],
    chocolate_negro: ['dark chocolate', 'chocolate negro'],
    chocolate_blanco: ['white chocolate', 'chocolate blanco'],
    chocolate_con_leche: ['milk chocolate', 'chocolate con leche']
  },

  CATEGORIES_MAP: {
    postres: ['Dessert'],
    dulces: ['Dessert'],
    picoteo_dulce: ['Dessert', 'Breakfast'],
    picoteo_salado: ['Starter', 'Side', 'Miscellaneous'],
    desayuno: ['Breakfast'],
    entradas: ['Starter', 'Side'],
    todo: ['Dessert', 'Breakfast', 'Starter', 'Side', 'Miscellaneous']
  },

  mapCategory(userCategory) {
    return this.CATEGORIES_MAP[userCategory] || ['Dessert'];
  },

  identifyIngredient(mealIngredients, userIngredients) {
    let score = 0;
    const matched = [];
    const unmatched = [];

    for (const userIng of userIngredients) {
      const keywords = this.INGREDIENT_KEYWORDS[userIng.toLowerCase()] || [userIng.toLowerCase()];
      let found = false;
      for (const keyword of keywords) {
        for (const mi of mealIngredients) {
          if (mi.name.toLowerCase().includes(keyword.toLowerCase())) {
            score += 30;
            matched.push(mi.name_ES || mi.name);
            found = true;
            break;
          }
        }
        if (found) break;
      }
      if (!found) {
        unmatched.push(userIng);
      }
    }

    return { score, matched, unmatched };
  },

  estimateTime(meal) {
    const steps = meal.strInstructions || '';
    const stepsCount = steps.split('\n').filter(s => s.trim().length > 3).length;
    const ingredients = RecipeAPI.getMealIngredients(meal);
    let minutes = stepsCount * 6;
    if (meal.strCategory === 'Dessert') minutes += 25;
    if (meal.strCategory === 'Breakfast') minutes += 5;
    if (meal.strCategory === 'Starter') minutes += 10;
    if (ingredients.length > 8) minutes += 10;
    return Math.max(10, Math.min(120, minutes));
  },

  estimateDifficulty(meal) {
    const steps = meal.strInstructions || '';
    const stepsCount = steps.split('\n').filter(s => s.trim().length > 3).length;
    const ingredients = RecipeAPI.getMealIngredients(meal);
    let score = stepsCount + ingredients.length;
    if (meal.strInstructions?.includes('knead') || meal.strInstructions?.includes('amasa')) score += 5;
    if (meal.strInstructions?.includes('laminate') || meal.strInstructions?.includes('puff pastry')) score += 5;
    if (meal.strInstructions?.includes('temper') || meal.strInstructions?.includes('caramelize')) score += 3;
    if (score <= 8) return 'easy';
    if (score <= 15) return 'medium';
    return 'hard';
  },

  estimateServings(meal) {
    const ingredients = RecipeAPI.getMealIngredients(meal);
    const hasLargeAmounts = ingredients.some(i =>
      i.measure && (i.measure.includes('kg') || i.measure.includes('lb') || i.measure.includes('whole'))
    );
    if (hasLargeAmounts) return 'large';
    if (ingredients.length > 10) return 'medium';
    return 'small';
  },

  getTimeLabel(minutes) {
    if (minutes <= 20) return 'Rápido';
    if (minutes <= 45) return 'Moderado';
    return 'Elaborado';
  },

  getDifficultyLabel(diff) {
    const labels = { easy: 'Fácil', medium: 'Media', hard: 'Difícil' };
    return labels[diff] || diff;
  },

  getServingsLabel(serv) {
    const labels = { small: '1-2', medium: '3-4', large: '5+' };
    return labels[serv] || serv;
  },

  async getRecommendations(userSelections) {
    const { category, ingredients, filters } = userSelections;
    const apiCategories = this.mapCategory(category);

    let allMeals = [];
    const seenIds = new Set();

    for (const cat of apiCategories) {
      try {
        const meals = await RecipeAPI.getMealsByCategory(cat);
        for (const m of meals) {
          if (!seenIds.has(m.idMeal)) {
            seenIds.add(m.idMeal);
            allMeals.push(m);
          }
        }
      } catch (e) {
        console.warn(`Error fetching category ${cat}:`, e);
      }
    }

    if (allMeals.length === 0) {
      for (const cat of apiCategories) {
        try {
          const searchTerm = cat === 'Dessert' ? 'cake' : cat === 'Breakfast' ? 'pancake' : 'salad';
          const meals = await RecipeAPI.searchMeals(searchTerm);
          for (const m of meals) {
            if (!seenIds.has(m.idMeal)) {
              seenIds.add(m.idMeal);
              allMeals.push(m);
            }
          }
        } catch (e) {}
      }
    }

    const maxDetailed = ingredients && ingredients.length > 0 ? 25 : 15;
    const detailedMeals = [];
    for (const meal of allMeals.slice(0, maxDetailed)) {
      try {
        const detailed = await RecipeAPI.getMealById(meal.idMeal);
        if (detailed) {
          detailedMeals.push(detailed);
        }
      } catch (e) {
        detailedMeals.push(meal);
      }
    }

    if (detailedMeals.length === 0 && allMeals.length > 0) {
      for (const meal of allMeals.slice(0, 5)) {
        detailedMeals.push(meal);
      }
    }

    const scored = detailedMeals.map(meal => {
      let totalScore = 0;
      const mealIngredients = RecipeAPI.getMealIngredients(meal);

      if (ingredients && ingredients.length > 0) {
        const ingResult = this.identifyIngredient(mealIngredients, ingredients);
        totalScore += ingResult.score;
      } else {
        totalScore += 15;
      }

      const estimatedTime = this.estimateTime(meal);
      const estimatedDiff = this.estimateDifficulty(meal);
      const estimatedServ = this.estimateServings(meal);

      if (filters?.time && filters.time !== 'any') {
        switch (filters.time) {
          case 'quick':
            totalScore += estimatedTime <= 20 ? 20 : (estimatedTime <= 30 ? 8 : 0);
            break;
          case 'medium':
            totalScore += (estimatedTime > 20 && estimatedTime <= 45) ? 20 : 5;
            break;
          case 'long':
            totalScore += estimatedTime > 45 ? 20 : 5;
            break;
        }
      } else {
        totalScore += 8;
      }

      if (filters?.difficulty && filters.difficulty !== 'any') {
        totalScore += estimatedDiff === filters.difficulty ? 20 : 3;
      } else {
        totalScore += 8;
      }

      if (filters?.servings && filters.servings !== 'any') {
        totalScore += estimatedServ === filters.servings ? 15 : 5;
      } else {
        totalScore += 5;
      }

      return {
        ...meal,
        score: totalScore,
        estimatedTime,
        estimatedTimeLabel: this.getTimeLabel(estimatedTime),
        estimatedDifficulty: estimatedDiff,
        estimatedDifficultyLabel: this.getDifficultyLabel(estimatedDiff),
        estimatedServings: estimatedServ,
        estimatedServingsLabel: this.getServingsLabel(estimatedServ),
        ingredients: mealIngredients
      };
    });

    scored.sort((a, b) => b.score - a.score);

    const maxScore = scored.length > 0 ? scored[0].score : 1;
    return scored.map(m => ({
      ...m,
      scorePercent: Math.round((m.score / Math.max(maxScore, 1)) * 100)
    })).slice(0, 3);
  }
};
