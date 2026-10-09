const Traduccion = {
  API_BASE: 'https://api.mymemory.translated.net/get',
  CACHE_KEY: 'recetapp_translations',
  _cache: {},
  _dailyCount: 0,
  _dailyLimit: 4500,
  _initialized: false,

  init() {
    if (this._initialized) return;
    try {
      const raw = localStorage.getItem(this.CACHE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        this._cache = parsed.data || {};
        this._dailyCount = parsed.count || 0;
        const lastDate = parsed.date || '';
        const today = new Date().toDateString();
        if (lastDate !== today) {
          this._dailyCount = 0;
          this._saveCache();
        }
      }
    } catch (e) {
      this._cache = {};
      this._dailyCount = 0;
    }
    this._initialized = true;
  },

  _saveCache() {
    try {
      localStorage.setItem(this.CACHE_KEY, JSON.stringify({
        data: this._cache,
        count: this._dailyCount,
        date: new Date().toDateString()
      }));
    } catch (e) {}
  },

  _getCacheKey(text, targetLang) {
    return text.substring(0, 60) + '_' + targetLang;
  },

  async translateText(text, targetLang) {
    if (!text || text.trim().length === 0) return text;
    targetLang = targetLang || 'es';

    var cleanText = text.trim();
    var cacheKey = this._getCacheKey(cleanText, targetLang);

    if (this._cache[cacheKey]) {
      return this._cache[cacheKey];
    }

    if (this._dailyCount >= this._dailyLimit) {
      return this._localTranslate(cleanText);
    }

    try {
      var encoded = encodeURIComponent(cleanText);
      var url = this.API_BASE + '?q=' + encoded + '&langpair=en|' + targetLang;

      var controller = new AbortController();
      var timeoutId = setTimeout(function() { controller.abort(); }, 5000);

      var response = await fetch(url, { signal: controller.signal });
      clearTimeout(timeoutId);

      if (!response.ok) throw new Error('HTTP ' + response.status);

      var data = await response.json();

      if (data.responseStatus === 200 && data.responseData && data.responseData.translatedText) {
        var translated = data.responseData.translatedText;

        if (translated.toUpperCase() === cleanText.toUpperCase()) {
          return cleanText;
        }

        this._cache[cacheKey] = translated;
        this._dailyCount++;
        this._saveCache();

        return translated;
      }

      return this._localTranslate(cleanText);
    } catch (err) {
      return this._localTranslate(cleanText);
    }
  },

  async translateBatch(texts, targetLang) {
    var results = [];
    for (var i = 0; i < texts.length; i++) {
      var translated = await this.translateText(texts[i], targetLang);
      results.push(translated);
      if (texts.length > 3 && i < texts.length - 1) {
        await new Promise(function(r) { setTimeout(r, 200); });
      }
    }
    return results;
  },

  async translateMeal(meal) {
    if (!meal) return meal;

    var translated = {};
    for (var key in meal) {
      translated[key] = meal[key];
    }
    translated.strMeal_original = meal.strMeal;
    translated.strCategory_original = meal.strCategory;
    translated.strArea_original = meal.strArea;

    try {
      if (meal.strArea) {
        translated.strArea_ES = await this.translateText(meal.strArea);
      }
    } catch (e) {}

    try {
      if (meal.strTags) {
        var tags = meal.strTags.split(',').map(function(t) { return t.trim(); });
        var translatedTags = await this.translateBatch(tags);
        translated.strTags_ES = translatedTags.join(', ');
      }
    } catch (e) {}

    translated.ingredients_ES = [];
    for (var i = 1; i <= 20; i++) {
      var ing = meal['strIngredient' + i];
      var measure = meal['strMeasure' + i];
      if (ing && ing.trim()) {
        var measureText = measure ? measure.trim() : '';
        var nameES = ing.trim();
        try {
          nameES = await this.translateText(ing.trim());
        } catch (e) {}

        translated.ingredients_ES.push({
          name: ing.trim(),
          name_ES: nameES,
          measure: measureText,
          full_ES: measureText ? measureText + ' ' + nameES : nameES
        });
      }
    }

    translated.strInstructions_ES = '';
    if (meal.strInstructions) {
      try {
        var paragraphs = meal.strInstructions
          .split(/\r?\n/)
          .map(function(s) { return s.trim(); })
          .filter(function(s) { return s.length > 3; });

        var translatedParagraphs = await this.translateBatch(paragraphs);
        translated.strInstructions_ES = translatedParagraphs.join('\n');
      } catch (e) {
        translated.strInstructions_ES = meal.strInstructions;
      }
    }

    return translated;
  },

  traducirMeal: function(meal) {
    return this.translateMeal(meal);
  },

  getMealIngredients(meal) {
    if (meal.ingredients_ES && meal.ingredients_ES.length > 0) {
      return meal.ingredients_ES;
    }
    var ingredients = [];
    for (var i = 1; i <= 20; i++) {
      var ing = meal['strIngredient' + i];
      var measure = meal['strMeasure' + i];
      if (ing && ing.trim()) {
        ingredients.push({
          name: ing.trim(),
          name_ES: ing.trim(),
          measure: measure ? measure.trim() : '',
          full_ES: (measure ? measure.trim() + ' ' : '') + ing.trim()
        });
      }
    }
    return ingredients;
  },

  getMealSteps(meal) {
    var text = meal.strInstructions_ES || meal.strInstructions || '';
    return text
      .split(/\r?\n/)
      .map(function(s) { return s.trim(); })
      .filter(function(s) { return s.length > 3; });
  },

  getDailyUsage() {
    return { used: this._dailyCount, limit: this._dailyLimit };
  },

  _localTranslate(text) {
    if (!text) return text;

    var INGREDIENT_MAP = {
      'egg': 'huevo', 'eggs': 'huevos', 'egg yolk': 'yema de huevo',
      'egg yolks': 'yemas de huevo', 'egg white': 'clara de huevo',
      'egg whites': 'claras de huevo',
      'all purpose flour': 'harina de todo uso', 'plain flour': 'harina',
      'self raising flour': 'harina con levadura', 'cornstarch': 'maicena',
      'cornflour': 'maicena', 'butter': 'mantequilla',
      'caster sugar': 'azúcar fino', 'icing sugar': 'azúcar glas',
      'brown sugar': 'azúcar morena', 'granulated sugar': 'azúcar granulada',
      'dark chocolate': 'chocolate negro', 'milk chocolate': 'chocolate con leche',
      'white chocolate': 'chocolate blanco', 'cocoa powder': 'cacao en polvo',
      'vanilla extract': 'extracto de vainilla', 'vanilla essence': 'esencia de vainilla',
      'baking powder': 'polvo de hornear', 'baking soda': 'bicarbonato de sodio',
      'heavy cream': 'crema espesa', 'whipping cream': 'crema para batir',
      'double cream': 'crema espesa', 'single cream': 'crema ligera',
      'sour cream': 'crema agria', 'cream cheese': 'queso crema',
      'powdered milk': 'leche en polvo', 'condensed milk': 'leche condensada',
      'evaporated milk': 'leche evaporada', 'coconut milk': 'leche de coco',
      'olive oil': 'aceite de oliva', 'vegetable oil': 'aceite vegetal',
      'coconut oil': 'aceite de coco', 'sunflower oil': 'aceite de girasol',
      'walnuts': 'nueces', 'pecans': 'nueces pecanas', 'almonds': 'almendras',
      'hazelnuts': 'avellanas', 'pistachios': 'pistachos',
      'cashews': 'nueces de la india', 'peanuts': 'cacahuates',
      'peanut butter': 'mantequilla de cacahuate',
      'lemon zest': 'ralladura de limón', 'orange zest': 'ralladura de naranja',
      'lemon juice': 'jugo de limón', 'lime juice': 'jugo de lima',
      'strawberries': 'fresas', 'blueberries': 'arándanos',
      'raspberries': 'frambuesas', 'blackberries': 'moras',
      'raisins': 'pasas',
      'desiccated coconut': 'coco deshidratado', 'coconut flakes': 'escamas de coco',
      'chocolate chips': 'chispas de chocolate',
      'sprinkles': 'chispas decorativas',
      'golden syrup': 'jarabe dorado', 'maple syrup': 'jarabe de arce',
      'honey': 'miel', 'molasses': 'melaza', 'treacle': 'melaza',
      'gelatin': 'gelatina', 'marshmallows': 'malvaviscos',
      'ground cinnamon': 'canela molida', 'ground ginger': 'jengibre molido',
      'ground nutmeg': 'nuez moscada molida',
      'pinch of salt': 'pizca de sal', 'sea salt': 'sal marina',
      'black pepper': 'pimienta negra',
      'plain yogurt': 'yogur natural', 'greek yogurt': 'yogur griego',
      'rolled oats': 'avena en hojuelas',
      'bread crumbs': 'pan rallado', 'breadcrumbs': 'pan rallado',
      'unsalted butter': 'mantequilla sin sal',
      'room temperature': 'temperatura ambiente',
      'cold butter': 'mantequilla fría',
      'melted butter': 'mantequilla derretida',
      'softened butter': 'mantequilla ablandada',
      'dulce de leche': 'dulce de leche',
      'sprinkling': 'espolvoreando',
      'teaspoon': 'cucharadita',
      'tablespoon': 'cucharada',
      'cup': 'taza',
      'cups': 'tazas',
      'ounce': 'onza',
      'ounces': 'onzas',
      'pound': 'libra',
      'pounds': 'libras',
      'gram': 'gramo',
      'grams': 'gramos',
      'kilogram': 'kilogramo',
      'kilograms': 'kilogramos',
      'milliliter': 'mililitro',
      'milliliters': 'mililitros',
      'liter': 'litro',
      'liters': 'litros',
      'fluid ounce': 'onza líquida',
      'fluid ounces': 'onzas líquidas',
      'quart': 'cuarto de galón',
      'gallon': 'galón',
      'piece': 'pieza',
      'pieces': 'piezas',
      'slice': 'rebanada',
      'slices': 'rebanadas',
      'clove': 'diente',
      'cloves': 'dientes',
      'handful': 'puñado',
      'pinch': 'pizca',
      'bunch': 'ramo',
      'can': 'lata',
      'cans': 'latas',
      'package': 'paquete',
      'packages': 'paquetes',
      'stick': 'barra',
      'sticks': 'barras',
      'large': 'grande',
      'small': 'pequeño',
      'medium': 'mediano',
      'fresh': 'fresco',
      'dried': 'seco',
      'frozen': 'congelado',
      'melted': 'derretido',
      'softened': 'ablandado',
      'chilled': 'enfriado',
      'beaten': 'batido',
      'sifted': 'tamizado',
      'chopped': 'picado',
      'diced': 'cortado en cubos',
      'grated': 'rallado',
      'sliced': 'cortado en rodajas',
      'peeled': 'pelado',
      'crushed': 'triturado',
      'minced': 'picado finamente',
      'to taste': 'al gusto'
    };

    var INSTRUCTION_MAP = {
      'preheat the oven': 'precialienta el horno',
      'preheat oven to': 'precialienta el horno a',
      'preheat oven': 'precialienta el horno',
      'line a baking tray': 'forra una bandeja para hornear',
      'line a baking sheet': 'forra una bandeja para hornear',
      'grease a': 'engrasa un',
      'in a large bowl': 'en un bol grande',
      'in a medium bowl': 'en un bol mediano',
      'in a small bowl': 'en un bol pequeño',
      'in a bowl': 'en un bol',
      'in a saucepan': 'en una cacerola',
      'in a pan': 'en una sartén',
      'in a pot': 'en una olla',
      'in the microwave': 'en el microondas',
      'in the oven': 'en el horno',
      'on the stove': 'en la estufa',
      'over medium heat': 'a fuego medio',
      'over low heat': 'a fuego bajo',
      'over high heat': 'a fuego alto',
      'over a low heat': 'a fuego bajo',
      'over a medium heat': 'a fuego medio',
      'over a high heat': 'a fuego alto',
      'cream the butter and sugar': 'bate la mantequilla y el azúcar',
      'cream butter and sugar': 'bate la mantequilla y el azúcar',
      'cream together': 'bate juntos',
      'beat the eggs': 'bate los huevos',
      'beat in': 'bate e incorpora',
      'whisk together': 'baten juntos',
      'whisk until': 'baten hasta que',
      'mix together': 'mezcla juntos',
      'mix well': 'mezcla bien',
      'mix until': 'mezcla hasta que',
      'stir in': 'agrega revolviendo',
      'stir until': 'revuelve hasta que',
      'stir well': 'revuelve bien',
      'fold in': 'incorpora suavemente',
      'fold gently': 'incorpora suavemente',
      'combine together': 'combina juntos',
      'combine until': 'combina hasta que',
      'gradually add': 'agrega gradualmente',
      'gradually mix in': 'mezcla gradualmente',
      'add the': 'agrega los',
      'add in': 'agrega',
      'pour in': 'vierte en',
      'pour the': 'vierte el',
      'pour into': 'vierte en',
      'cut into': 'corta en',
      'cut the': 'corta el',
      'slice the': 'corta el',
      'chop the': 'pica el',
      'finely chop': 'pica finamente',
      'grate the': 'ralla el',
      'peel and': 'pela y',
      'peel the': 'pela el',
      'sift the': 'tamiza el',
      'sift together': 'tamiza juntos',
      'melt the': 'derrite el',
      'melt in': 'derrite en',
      'melted butter': 'mantequilla derretida',
      'melted chocolate': 'chocolate derretido',
      'bake at': 'hornea a',
      'bake for': 'hornea por',
      'bake in': 'hornea en',
      'bake until': 'hornea hasta que',
      'bake in the preheated oven': 'hornea en el horno precalentado',
      'roast at': 'asa a',
      'roast for': 'asa por',
      'fry in': 'fríe en',
      'fry until': 'fríe hasta que',
      'sauté the': 'saltea el',
      'sauté until': 'saltea hasta que',
      'boil the': 'hierve el',
      'boil for': 'hierve por',
      'simmer for': 'a fuego lento por',
      'simmer until': 'a fuego lento hasta que',
      'simmer gently': 'a fuego lento suavemente',
      'let cool': 'deja enfriar',
      'let cool completely': 'deja enfriar completamente',
      'let it cool': 'deja que se enfríe',
      'leave to cool': 'deja enfriar',
      'leave to set': 'deja endurecer',
      'leave to chill': 'deja enfriar',
      'leave to rest': 'deja reposar',
      'allow to cool': 'deja enfriar',
      'allow to set': 'deja endurecer',
      'refrigerate for': 'refrigera por',
      'refrigerate until': 'refrigera hasta que',
      'chill for': 'enfría por',
      'chill in': 'enfría en',
      'freeze for': 'congela por',
      'freeze until': 'congela hasta que',
      'set aside': 'reserva',
      'keep warm': 'mantén caliente',
      'serve immediately': 'sirve inmediatamente',
      'serve hot': 'sirve caliente',
      'serve cold': 'sirve frío',
      'serve warm': 'sirve tibio',
      'serve with': 'sirve con',
      'garnish with': 'decora con',
      'sprinkle with': 'espolvorea con',
      'dust with': 'espolvorea con',
      'drizzle with': 'rocía con',
      'spread on': 'unta en',
      'spread over': 'unta sobre',
      'spread with': 'unta con',
      'fill with': 'rellena con',
      'top with': 'cubre con',
      'coat in': 'cubre en',
      'coat with': 'cubre con',
      'dip in': 'sumerge en',
      'roll in': 'revuelve en',
      'roll out': 'estira',
      'roll into': 'enrolla en',
      'place on': 'coloca en',
      'place in': 'coloca en',
      'transfer to': 'transfiere a',
      'remove from': 'retira de',
      'take out': 'retira',
      'drain well': 'escurre bien',
      'pat dry': 'seca',
      'until golden brown': 'hasta que esté dorado',
      'until golden': 'hasta que esté dorado',
      'until smooth': 'hasta que esté suave',
      'until creamy': 'hasta que esté cremoso',
      'until soft': 'hasta que esté suave',
      'until combined': 'hasta que esté mezclado',
      'until well combined': 'hasta que esté bien mezclado',
      'until incorporated': 'hasta que esté incorporado',
      'until thickened': 'hasta que espese',
      'until bubbly': 'hasta que burbujee',
      'until light and fluffy': 'hasta que esté esponjoso',
      'a wire rack': 'una rejilla',
      'a cooling rack': 'una rejilla de enfriamiento',
      'a baking tray': 'una bandeja para hornear',
      'preheated oven': 'horno precalentado',
      'degrees': 'grados',
      'fahrenheit': 'fahrenheit',
      'celsius': 'centígrados',
      'minutes': 'minutos',
      'minute': 'minuto',
      'hours': 'horas',
      'hour': 'hora',
      'then': 'luego',
      'next': 'después',
      'meanwhile': 'mientras tanto',
      'after that': 'después de eso',
      'finally': 'finalmente',
      'carefully': 'con cuidado',
      'gently': 'suavemente',
      'completely': 'completamente',
      'immediately': 'inmediatamente'
    };

    var result = text;
    var sortedPhrases = Object.keys(INSTRUCTION_MAP).sort(function(a, b) {
      return b.length - a.length;
    });

    for (var i = 0; i < sortedPhrases.length; i++) {
      var en = sortedPhrases[i];
      var es = INSTRUCTION_MAP[en];
      var regex = new RegExp('\\b' + en.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '\\b', 'gi');
      result = result.replace(regex, es);
    }

    var ingredientKeys = Object.keys(INGREDIENT_MAP).sort(function(a, b) {
      return b.length - a.length;
    });

    for (var j = 0; j < ingredientKeys.length; j++) {
      var key = ingredientKeys[j];
      var val = INGREDIENT_MAP[key];
      var regex2 = new RegExp('\\b' + key.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '\\b', 'gi');
      result = result.replace(regex2, val);
    }

    return result;
  }
};

Traduccion.init();
