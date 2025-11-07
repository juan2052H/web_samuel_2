// [file name]: script.js
// [REEMPLAZAR TODO EL CONTENIDO CON ESTE CÓDIGO ACTUALIZADO]

// Elementos DOM
const mealsContainer = document.getElementById('meals-container');
const shiftSelect = document.getElementById('shift-select');
const caloriesFilter = document.getElementById('calories-filter');
const searchInput = document.getElementById('search');
const applyFiltersBtn = document.getElementById('apply-filters');
const mealModal = document.getElementById('meal-modal');
const mealModalBody = document.getElementById('meal-modal-body');
const modalClose = document.querySelectorAll('.modal-close');
const planModal = document.getElementById('plan-modal');
const planModalBody = document.getElementById('plan-modal-body');
const sections = document.querySelectorAll('.section');
const navLinks = document.querySelectorAll('.nav-links a');
const weekDaysContainer = document.getElementById('week-days-container');
const currentWeekSpan = document.getElementById('current-week');
const prevWeekBtn = document.getElementById('prev-week');
const nextWeekBtn = document.getElementById('next-week');
const plansContainer = document.getElementById('plans-container');
const calculatorResults = document.getElementById('calculator-results');
const calculateBtn = document.getElementById('calculate-btn');
const createPlanModal = document.getElementById('create-plan-modal');
const createPlanForm = document.getElementById('create-plan-form');
const createNewPlanBtn = document.getElementById('create-new-plan');
const tabButtons = document.querySelectorAll('.tab-btn');
const tabPanes = document.querySelectorAll('.tab-pane');
const emptyPlansState = document.getElementById('empty-plans-state');
const dailyPlansContainer = document.getElementById('daily-plans-container');
const weeklyPlansContainer = document.getElementById('weekly-plans-container');
const favoritesContainer = document.getElementById('favorites-container');
const themeToggle = document.getElementById('theme-toggle');
const themeIcon = document.querySelector('.theme-icon');
const globalSearch = document.getElementById('global-search');

// Estado de la aplicación
let currentWeek = 0; // 0 = semana actual
let userPlans = {
    daily: [],
    weekly: [],
    favorites: []
};

// Sistema de modo oscuro
function initializeTheme() {
    const savedTheme = localStorage.getItem('nutriguard_theme') || 'light';
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    // Si no hay tema guardado, usar la preferencia del sistema
    if (!localStorage.getItem('nutriguard_theme') && prefersDark) {
        setTheme('dark');
    } else {
        setTheme(savedTheme);
    }
}

function setTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('nutriguard_theme', theme);
    
    // Actualizar icono
    if (themeIcon) {
        themeIcon.textContent = theme === 'dark' ? '☀️' : '🌙';
    }
}

function toggleTheme() {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
}

// Inicializar desde localStorage
function initializeUserData() {
    const savedPlans = localStorage.getItem('nutriguard_user_plans');
    if (savedPlans) {
        userPlans = JSON.parse(savedPlans);
    }
    
    // Inicializar planes personalizados
    initializeCustomPlans();
    
    renderMyPlans();
}

// Guardar en localStorage
function saveUserData() {
    localStorage.setItem('nutriguard_user_plans', JSON.stringify(userPlans));
}

// Función para cambiar de sección
function switchSection(sectionId) {
    sections.forEach(section => {
        section.classList.remove('active');
        if (section.id === `${sectionId}-section`) {
            section.classList.add('active');
        }
    });

    navLinks.forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('data-section') === sectionId) {
            link.classList.add('active');
        }
    });

    // Cargar contenido específico de la sección
    if (sectionId === 'plans') {
        renderNutritionPlans();
    } else if (sectionId === 'my-plans') {
        renderMyPlans();
    } else if (sectionId === 'home') {
        renderMeals(shiftSelect.value);
    }
}

// Función para buscar en todas las comidas (búsqueda global)
function searchAllMeals(searchTerm) {
    const allMeals = [];
    
    // Recopilar todas las comidas de todos los turnos
    for (const shift in mealsDB) {
        allMeals.push(...mealsDB[shift]);
    }
    
    const filteredMeals = allMeals.filter(meal => {
        const matchesName = meal.name.toLowerCase().includes(searchTerm);
        const matchesDescription = meal.description.toLowerCase().includes(searchTerm);
        const matchesIngredients = meal.ingredients.some(ingredient => 
            ingredient.toLowerCase().includes(searchTerm)
        );
        
        return matchesName || matchesDescription || matchesIngredients;
    });
    
    return filteredMeals;
}

// Función para renderizar comidas con filtros mejorados
function renderMeals(shift = null) {
    mealsContainer.innerHTML = '';
    
    let meals = [];
    
    // Determinar qué comidas mostrar
    if (shift && mealsDB[shift]) {
        // Mostrar comidas del turno seleccionado
        meals = mealsDB[shift];
    } else {
        // Mostrar todas las comidas (para búsqueda global)
        for (const shiftKey in mealsDB) {
            meals.push(...mealsDB[shiftKey]);
        }
    }
    
    const maxCalories = parseInt(caloriesFilter.value) || Infinity;
    const searchTerm = searchInput.value.toLowerCase().trim();
    
    // Aplicar filtros
    const filteredMeals = meals.filter(meal => {
        // Filtro por calorías
        const matchesCalories = meal.calories <= maxCalories;
        
        // Filtro por búsqueda
        let matchesSearch = true;
        if (searchTerm) {
            matchesSearch = meal.name.toLowerCase().includes(searchTerm) || 
                           meal.description.toLowerCase().includes(searchTerm) ||
                           meal.ingredients.some(ingredient => 
                               ingredient.toLowerCase().includes(searchTerm)
                           );
        }
        
        return matchesCalories && matchesSearch;
    });
    
    // Mostrar resultados
    if (filteredMeals.length === 0) {
        mealsContainer.innerHTML = `
            <div class="empty-state" style="grid-column: 1 / -1;">
                <div class="empty-icon">🔍</div>
                <h3>No se encontraron comidas</h3>
                <p>Intenta ajustar los filtros o usar términos de búsqueda diferentes.</p>
                <button class="btn btn-primary" onclick="clearFilters()">Limpiar filtros</button>
            </div>
        `;
        return;
    }
    
    // Renderizar tarjetas de comidas
    filteredMeals.forEach(meal => {
        const mealCard = document.createElement('div');
        mealCard.className = 'meal-card';
        mealCard.innerHTML = `
            <div class="meal-image" style="background-color: #e2e8f0;">
                <div class="meal-shift-badge">${getShiftName(meal)}</div>
            </div>
            <div class="meal-content">
                <div class="meal-header">
                    <h3 class="meal-title">${meal.name}</h3>
                    <div class="meal-calories">${meal.calories} kcal</div>
                </div>
                <div class="meal-meta">
                    <span>${meal.prepTime}</span>
                    <span>•</span>
                    <span>${meal.difficulty}</span>
                </div>
                <p style="font-size: 0.9rem; color: var(--text-secondary); margin-bottom: 1rem;">${meal.description}</p>
                <div class="meal-macros">
                    <div class="macro">
                        <span class="macro-value">${meal.protein}g</span>
                        <span class="macro-label">Proteína</span>
                    </div>
                    <div class="macro">
                        <span class="macro-value">${meal.carbs}g</span>
                        <span class="macro-label">Carbos</span>
                    </div>
                    <div class="macro">
                        <span class="macro-value">${meal.fat}g</span>
                        <span class="macro-label">Grasas</span>
                    </div>
                </div>
                <div class="meal-actions">
                    <button class="btn btn-primary btn-small" onclick="showMealDetails(${meal.id})">Ver Detalles</button>
                    <button class="btn btn-outline btn-small btn-icon" onclick="addToFavorites(${meal.id})" title="Agregar a favoritos">❤</button>
                    <button class="btn btn-outline btn-small btn-icon" onclick="addToPlan(${meal.id})" title="Agregar al plan">+</button>
                </div>
            </div>
        `;
        mealsContainer.appendChild(mealCard);
    });
}

// Función auxiliar para obtener el nombre del turno de una comida
function getShiftName(meal) {
    for (const shift in mealsDB) {
        if (mealsDB[shift].find(m => m.id === meal.id)) {
            switch(shift) {
                case 'morning': return 'Mañana';
                case 'afternoon': return 'Tarde';
                case 'night': return 'Noche';
                default: return shift;
            }
        }
    }
    return '';
}

// Función para limpiar filtros
function clearFilters() {
    caloriesFilter.value = '';
    searchInput.value = '';
    shiftSelect.value = 'morning';
    renderMeals('morning');
}

// Función para aplicar búsqueda global
function applyGlobalSearch() {
    const searchTerm = globalSearch.value.toLowerCase().trim();
    
    if (!searchTerm) {
        return; // No hacer nada si la búsqueda está vacía
    }
    
    // Cambiar a la sección de inicio si no está allí
    if (!document.getElementById('home-section').classList.contains('active')) {
        switchSection('home');
    }
    
    // Limpiar otros filtros y aplicar búsqueda
    searchInput.value = searchTerm;
    shiftSelect.value = ''; // Mostrar todos los turnos
    caloriesFilter.value = ''; // Sin filtro de calorías
    
    // Renderizar resultados de búsqueda global
    renderMeals();
    
    // Mostrar mensaje de búsqueda
    const sectionTitle = document.querySelector('#home-section .section-title');
    if (sectionTitle) {
        sectionTitle.textContent = `Resultados de búsqueda: "${searchTerm}"`;
    }
}

// Función para agregar a favoritos
function addToFavorites(mealId) {
    let meal = null;
    for (const shift in mealsDB) {
        meal = mealsDB[shift].find(m => m.id === mealId);
        if (meal) break;
    }
    
    if (!meal) return;
    
    // Verificar si ya está en favoritos
    const alreadyFavorite = userPlans.favorites.some(fav => fav.id === mealId);
    
    if (alreadyFavorite) {
        alert('Esta comida ya está en tus favoritos.');
        return;
    }
    
    userPlans.favorites.push(meal);
    saveUserData();
    alert('¡Comida agregada a favoritos!');
    
    // Si estamos en la sección de mis planes, actualizar la vista
    if (document.getElementById('my-plans-section').classList.contains('active')) {
        renderMyPlans();
    }
}

// Función para agregar al plan
function addToPlan(mealId) {
    let meal = null;
    for (const shift in mealsDB) {
        meal = mealsDB[shift].find(m => m.id === mealId);
        if (meal) break;
    }
    
    if (!meal) return;
    
    // Si no hay planes diarios, crear uno por defecto
    if (userPlans.daily.length === 0) {
        const today = new Date().toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' });
        userPlans.daily.push({
            id: Date.now(),
            name: `Plan ${today}`,
            date: new Date().toISOString().split('T')[0],
            meals: []
        });
    }
    
    // Agregar la comida al primer plan diario
    userPlans.daily[0].meals.push({
        ...meal,
        mealTime: 'lunch', // Por defecto almuerzo
        addedAt: new Date().toISOString()
    });
    
    saveUserData();
    alert('¡Comida agregada a tu plan!');
    
    // Si estamos en la sección de mis planes, actualizar la vista
    if (document.getElementById('my-plans-section').classList.contains('active')) {
        renderMyPlans();
    }
}

// Función para mostrar detalles de comida
function showMealDetails(mealId) {
    // Buscar la comida en todos los turnos
    let meal = null;
    for (const shift in mealsDB) {
        meal = mealsDB[shift].find(m => m.id === mealId);
        if (meal) break;
    }
    
    if (!meal) return;
    
    mealModalBody.innerHTML = `
        <h3>${meal.name}</h3>
        <div style="display: flex; gap: 1rem; margin: 1rem 0; flex-wrap: wrap;">
            <div style="background-color: var(--bg-primary); padding: 0.5rem 1rem; border-radius: 4px; border: 1px solid var(--border-color);">
                <strong>${meal.calories}</strong> kcal
            </div>
            <div style="background-color: var(--bg-primary); padding: 0.5rem 1rem; border-radius: 4px; border: 1px solid var(--border-color);">
                <strong>${meal.prepTime}</strong> preparación
            </div>
            <div style="background-color: var(--bg-primary); padding: 0.5rem 1rem; border-radius: 4px; border: 1px solid var(--border-color);">
                <strong>${meal.difficulty}</strong>
            </div>
            <div style="background-color: var(--accent); color: white; padding: 0.5rem 1rem; border-radius: 4px;">
                <strong>${getShiftName(meal)}</strong>
            </div>
        </div>
        <p>${meal.description}</p>
        
        <h4 style="margin-top: 1.5rem;">Información Nutricional</h4>
        <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 1rem; margin: 1rem 0;">
            <div style="text-align: center; padding: 1rem; background-color: var(--bg-primary); border-radius: 4px; border: 1px solid var(--border-color);">
                <div style="font-size: 1.2rem; font-weight: bold; color: var(--accent);">${meal.protein}g</div>
                <div>Proteína</div>
            </div>
            <div style="text-align: center; padding: 1rem; background-color: var(--bg-primary); border-radius: 4px; border: 1px solid var(--border-color);">
                <div style="font-size: 1.2rem; font-weight: bold; color: var(--accent);">${meal.carbs}g</div>
                <div>Carbohidratos</div>
            </div>
            <div style="text-align: center; padding: 1rem; background-color: var(--bg-primary); border-radius: 4px; border: 1px solid var(--border-color);">
                <div style="font-size: 1.2rem; font-weight: bold; color: var(--accent);">${meal.fat}g</div>
                <div>Grasas</div>
            </div>
        </div>
        
        <h4 style="margin-top: 1.5rem;">Ingredientes</h4>
        <ul style="margin-left: 1.5rem; margin-bottom: 1.5rem;">
            ${meal.ingredients.map(ing => `<li>${ing}</li>`).join('')}
        </ul>
        
        <h4>Preparación</h4>
        <ol style="margin-left: 1.5rem;">
            ${meal.instructions.map(step => `<li>${step}</li>`).join('')}
        </ol>
        
        <div style="margin-top: 1.5rem; display: flex; gap: 1rem; flex-wrap: wrap;">
            <button class="btn btn-primary" onclick="addToPlan(${meal.id}); closeModal('meal-modal')">Agregar a mi plan</button>
            <button class="btn btn-outline" onclick="addToFavorites(${meal.id}); closeModal('meal-modal')">Guardar como favorito</button>
        </div>
    `;
    
    mealModal.style.display = 'flex';
}

// Función para renderizar planes nutricionales
function renderNutritionPlans() {
    plansContainer.innerHTML = '';
    
    nutritionPlans.forEach(plan => {
        const planCard = document.createElement('div');
        planCard.className = 'plan-card';
        planCard.innerHTML = `
            <div class="plan-header">
                <h3 class="plan-title">${plan.name}</h3>
                <div class="plan-calories">${plan.calories} kcal/día</div>
            </div>
            <div class="plan-content">
                <p class="plan-description">${plan.description}</p>
                
                <div class="plan-preferences">
                    ${plan.preferences.map(pref => `<span class="preference-tag">${pref}</span>`).join('')}
                </div>
                
                <div class="plan-details">
                    <h4>Desayuno</h4>
                    <p>${plan.details.breakfast}</p>
                    
                    <h4>Almuerzo</h4>
                    <p>${plan.details.lunch}</p>
                    
                    <h4>Cena</h4>
                    <p>${plan.details.dinner}</p>
                    
                    <h4>Snacks</h4>
                    <p>${plan.details.snacks}</p>
                </div>
                
                <div class="plan-actions">
                    <button class="btn btn-primary" onclick="showPlanDetails(${plan.id})">Ver Detalles</button>
                    <button class="btn btn-outline">Aplicar Plan</button>
                </div>
            </div>
        `;
        plansContainer.appendChild(planCard);
    });
}

// Función para mostrar detalles de plan
function showPlanDetails(planId) {
    const plan = nutritionPlans.find(p => p.id === planId);
    
    if (!plan) return;
    
    planModalBody.innerHTML = `
        <h3>${plan.name}</h3>
        <div style="display: flex; gap: 1rem; margin: 1rem 0;">
            <div style="background-color: var(--bg-primary); padding: 0.5rem 1rem; border-radius: 4px; border: 1px solid var(--border-color);">
                <strong>${plan.calories}</strong> kcal/día
            </div>
        </div>
        <p>${plan.description}</p>
        
        <div style="margin-top: 1.5rem;">
            <h4>Preferencias</h4>
            <div style="display: flex; flex-wrap: wrap; gap: 0.5rem; margin: 0.5rem 0 1.5rem;">
                ${plan.preferences.map(pref => `<span class="preference-tag">${pref}</span>`).join('')}
            </div>
        </div>
        
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1.5rem;">
            <div>
                <h4>Desayuno</h4>
                <p>${plan.details.breakfast}</p>
                
                <h4 style="margin-top: 1rem;">Almuerzo</h4>
                <p>${plan.details.lunch}</p>
            </div>
            <div>
                <h4>Cena</h4>
                <p>${plan.details.dinner}</p>
                
                <h4 style="margin-top: 1rem;">Snacks</h4>
                <p>${plan.details.snacks}</p>
            </div>
        </div>
        
        <div style="margin-top: 1.5rem; display: flex; gap: 1rem;">
            <button class="btn btn-primary">Aplicar este Plan</button>
            <button class="btn btn-outline">Personalizar</button>
        </div>
    `;
    
    planModal.style.display = 'flex';
}

// Función para renderizar mis planes
function renderMyPlans() {
    // Ocultar/mostrar estado vacío
    const hasPlans = userPlans.daily.length > 0 || userPlans.weekly.length > 0 || userPlans.favorites.length > 0;
    emptyPlansState.style.display = hasPlans ? 'none' : 'block';
    
    // Renderizar planes diarios
    renderDailyPlans();
    
    // Renderizar planes semanales
    renderWeeklyPlans();
    
    // Renderizar favoritos
    renderFavorites();
}

function renderDailyPlans() {
    dailyPlansContainer.innerHTML = '';
    
    if (userPlans.daily.length === 0) {
        dailyPlansContainer.innerHTML = '<p>No tienes planes diarios. Agrega comidas desde las recomendaciones.</p>';
        return;
    }
    
    userPlans.daily.forEach(plan => {
        const totalCalories = plan.meals.reduce((sum, meal) => sum + meal.calories, 0);
        
        const planCard = document.createElement('div');
        planCard.className = 'plan-day-card';
        planCard.innerHTML = `
            <div class="plan-day-header">
                <h4 class="plan-day-title">${plan.name}</h4>
                <div class="plan-day-calories">${totalCalories} kcal</div>
            </div>
            <div class="plan-meals-list">
                ${plan.meals.map(meal => `
                    <div class="plan-meal-item">
                        <div class="plan-meal-info">
                            <div class="plan-meal-name">${meal.name}</div>
                            <div class="plan-meal-meta">${meal.calories} kcal • ${meal.protein}g proteína</div>
                        </div>
                        <div class="plan-meal-actions">
                            <button class="btn-icon-small" onclick="removeFromPlan(${plan.id}, ${meal.id})" title="Eliminar">🗑️</button>
                        </div>
                    </div>
                `).join('')}
            </div>
            <div class="plan-day-total">
                <span>Total del día:</span>
                <span>${totalCalories} kcal</span>
            </div>
        `;
        dailyPlansContainer.appendChild(planCard);
    });
}

function renderWeeklyPlans() {
    weeklyPlansContainer.innerHTML = '';
    
    if (userPlans.weekly.length === 0) {
        weeklyPlansContainer.innerHTML = '<p>No tienes planes semanales. Crea uno nuevo para organizar tu semana.</p>';
        return;
    }
    
    userPlans.weekly.forEach(plan => {
        const planCard = document.createElement('div');
        planCard.className = 'plan-day-card';
        planCard.innerHTML = `
            <div class="plan-day-header">
                <h4 class="plan-day-title">${plan.name}</h4>
                <div class="plan-day-calories">Plan Semanal</div>
            </div>
            <p>${plan.description || 'Plan semanal personalizado'}</p>
            <div style="margin-top: 1rem;">
                <button class="btn btn-outline btn-small" onclick="editPlan(${plan.id})">Editar</button>
                <button class="btn btn-outline btn-small" onclick="deletePlan(${plan.id})">Eliminar</button>
            </div>
        `;
        weeklyPlansContainer.appendChild(planCard);
    });
}

function renderFavorites() {
    favoritesContainer.innerHTML = '';
    
    if (userPlans.favorites.length === 0) {
        favoritesContainer.innerHTML = '<p>No tienes comidas favoritas. Agrega algunas desde las recomendaciones.</p>';
        return;
    }
    
    userPlans.favorites.forEach(meal => {
        const favoriteItem = document.createElement('div');
        favoriteItem.className = 'favorite-item';
        favoriteItem.innerHTML = `
            <div class="favorite-info">
                <div class="favorite-name">${meal.name}</div>
                <div class="favorite-calories">${meal.calories} kcal • ${meal.prepTime} • ${meal.difficulty}</div>
            </div>
            <div class="plan-meal-actions">
                <button class="btn-icon-small" onclick="addToPlan(${meal.id})" title="Agregar al plan">+</button>
                <button class="btn-icon-small" onclick="removeFromFavorites(${meal.id})" title="Quitar de favoritos">🗑️</button>
            </div>
        `;
        favoritesContainer.appendChild(favoriteItem);
    });
}

// Funciones para gestionar planes
function removeFromPlan(planId, mealId) {
    const plan = userPlans.daily.find(p => p.id === planId);
    if (plan) {
        plan.meals = plan.meals.filter(meal => meal.id !== mealId);
        saveUserData();
        renderMyPlans();
    }
}

function removeFromFavorites(mealId) {
    userPlans.favorites = userPlans.favorites.filter(meal => meal.id !== mealId);
    saveUserData();
    renderMyPlans();
}

function deletePlan(planId) {
    userPlans.weekly = userPlans.weekly.filter(plan => plan.id !== planId);
    saveUserData();
    renderMyPlans();
}

function editPlan(planId) {
    // Implementar edición de plan
    alert('Funcionalidad de edición en desarrollo');
}

// Funcionalidad para el planificador semanal
function renderWeeklyPlanner() {
    weekDaysContainer.innerHTML = '';
    const days = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];
    
    // Calcular fecha de la semana actual
    const today = new Date();
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - today.getDay() + 1 + (currentWeek * 7)); // Lunes
    
    // Actualizar texto de semana actual
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6);
    
    const options = { day: 'numeric', month: 'short' };
    currentWeekSpan.textContent = `${startOfWeek.toLocaleDateString('es-ES', options)} - ${endOfWeek.toLocaleDateString('es-ES', options)}`;
    
    days.forEach((day, index) => {
        const currentDate = new Date(startOfWeek);
        currentDate.setDate(startOfWeek.getDate() + index);
        
        const dayCard = document.createElement('div');
        dayCard.className = 'day-card';
        dayCard.innerHTML = `
            <div class="day-header">
                <div class="day-name">${day}</div>
                <div class="day-date">${currentDate.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })}</div>
            </div>
            <div class="day-meals">
                <div class="day-meal">
                    <div class="day-meal-time">Desayuno</div>
                    <div>Sin asignar</div>
                </div>
                <div class="day-meal">
                    <div class="day-meal-time">Almuerzo</div>
                    <div>Sin asignar</div>
                </div>
                <div class="day-meal">
                    <div class="day-meal-time">Cena</div>
                    <div>Sin asignar</div>
                </div>
            </div>
            <button class="btn btn-outline btn-small" style="width: 100%; margin-top: 1rem;">Planificar día</button>
        `;
        weekDaysContainer.appendChild(dayCard);
    });
}

// Calculadora nutricional
function calculateNutrition() {
    const weight = parseFloat(document.getElementById('weight').value);
    const height = parseFloat(document.getElementById('height').value);
    const age = parseInt(document.getElementById('age').value);
    const activity = parseFloat(document.getElementById('activity').value);
    const goal = document.getElementById('goal').value;
    
    if (!weight || !height || !age) {
        alert('Por favor, completa todos los campos requeridos.');
        return;
    }
    
    // Cálculo de TMB (Mifflin-St Jeor)
    let bmr = 10 * weight + 6.25 * height - 5 * age + 5;
    
    // Ajuste por actividad
    let tdee = bmr * activity;
    
    // Ajuste por objetivo
    let targetCalories;
    switch(goal) {
        case 'loss':
            targetCalories = tdee - 500;
            break;
        case 'gain':
            targetCalories = tdee + 500;
            break;
        default:
            targetCalories = tdee;
    }
    
    // Distribución de macronutrientes
    const proteinGrams = Math.round((targetCalories * 0.3) / 4); // 30% de proteínas
    const fatGrams = Math.round((targetCalories * 0.25) / 9); // 25% de grasas
    const carbsGrams = Math.round((targetCalories * 0.45) / 4); // 45% de carbohidratos
    
    // Mostrar resultados
    document.getElementById('calories-result').textContent = Math.round(targetCalories);
    document.getElementById('protein-result').textContent = `${proteinGrams}g`;
    document.getElementById('carbs-result').textContent = `${carbsGrams}g`;
    document.getElementById('fat-result').textContent = `${fatGrams}g`;
    
    calculatorResults.style.display = 'block';
}

// Funciones para modales
function closeModal(modalId) {
    document.getElementById(modalId).style.display = 'none';
}

// Event Listeners
document.addEventListener('DOMContentLoaded', () => {
    // Inicializar tema
    initializeTheme();
    
    // Inicializar datos del usuario
    initializeUserData();
    
    // Inicializar vistas
    renderMeals(shiftSelect.value);
    renderWeeklyPlanner();
    
    // Toggle de tema
    if (themeToggle) {
        themeToggle.addEventListener('click', toggleTheme);
    }
    
    // Navegación entre secciones
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const section = link.getAttribute('data-section');
            switchSection(section);
        });
    });
    
    // Filtros de comidas
    shiftSelect.addEventListener('change', () => {
        renderMeals(shiftSelect.value);
    });
    
    applyFiltersBtn.addEventListener('click', () => {
        renderMeals(shiftSelect.value);
    });
    
    // Búsqueda en tiempo real
    searchInput.addEventListener('input', () => {
        renderMeals(shiftSelect.value);
    });
    
    caloriesFilter.addEventListener('input', () => {
        renderMeals(shiftSelect.value);
    });
    
    // Búsqueda global
    globalSearch.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            applyGlobalSearch();
        }
    });
    
    // Planificador semanal
    prevWeekBtn.addEventListener('click', () => {
        currentWeek--;
        renderWeeklyPlanner();
    });
    
    nextWeekBtn.addEventListener('click', () => {
        currentWeek++;
        renderWeeklyPlanner();
    });
    
    // Calculadora
    calculateBtn.addEventListener('click', calculateNutrition);
    
    // Modales
    modalClose.forEach(closeBtn => {
        closeBtn.addEventListener('click', () => {
            mealModal.style.display = 'none';
            planModal.style.display = 'none';
            createPlanModal.style.display = 'none';
        });
    });
    
    window.addEventListener('click', (e) => {
        if (e.target === mealModal) {
            mealModal.style.display = 'none';
        }
        if (e.target === planModal) {
            planModal.style.display = 'none';
        }
        if (e.target === createPlanModal) {
            createPlanModal.style.display = 'none';
        }
    });
    
    // Tabs de Mis Planes
    tabButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const tabId = btn.getAttribute('data-tab');
            
            // Actualizar botones activos
            tabButtons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            
            // Mostrar contenido activo
            tabPanes.forEach(pane => pane.classList.remove('active'));
            document.getElementById(tabId).classList.add('active');
        });
    });
    
    // Crear nuevo plan
    createNewPlanBtn.addEventListener('click', () => {
        createPlanModal.style.display = 'flex';
    });
    
    createPlanForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const planName = document.getElementById('plan-name').value;
        const planDescription = document.getElementById('plan-description').value;
        const planType = document.getElementById('plan-type').value;
        
        const newPlan = {
            id: Date.now(),
            name: planName,
            description: planDescription,
            meals: [],
            createdAt: new Date().toISOString()
        };
        
        if (planType === 'weekly') {
            userPlans.weekly.push(newPlan);
        } else {
            userPlans.daily.push(newPlan);
        }
        
        saveUserData();
        closeModal('create-plan-modal');
        renderMyPlans();
        
        // Reset form
        createPlanForm.reset();
    });
    
    // Botones de acción
    document.getElementById('hydration-btn').addEventListener('click', () => {
        alert('Consumo de agua registrado. ¡Sigue hidratándote!');
    });
    
    document.getElementById('explore-plans').addEventListener('click', () => {
        switchSection('plans');
    });
});
// Botón de descarga para planes predefinidos
document.getElementById('download-predefined-plans')?.addEventListener('click', () => {
    showMultiDownloadModal('predefined');
});
// [file name]: script.js
// [AGREGAR ESTAS NUEVAS FUNCIONES]

// Función para descargar plan en formato PDF
function downloadPlan(planId, planType = 'predefined') {
    let plan;
    
    if (planType === 'predefined') {
        plan = nutritionPlans.find(p => p.id === planId);
    } else {
        plan = customPlans.find(p => p.id === planId);
    }
    
    if (!plan) return;
    
    // Crear contenido del PDF
    const pdfContent = generatePlanPDFContent(plan);
    
    // Crear y descargar el PDF
    const element = document.createElement('a');
    const file = new Blob([pdfContent], { type: 'text/html' });
    element.href = URL.createObjectURL(file);
    element.download = `Plan_${plan.name.replace(/\s+/g, '_')}.html`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
    
    // También ofrecer opción de impresión
    setTimeout(() => {
        if (confirm('¿Te gustaría imprimir el plan ahora?')) {
            printPlan(plan);
        }
    }, 500);
}

// Función para generar contenido HTML del plan
function generatePlanPDFContent(plan) {
    const currentDate = new Date().toLocaleDateString('es-ES');
    
    return `<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${plan.name} - NutriGuard</title>
    <style>
        body { 
            font-family: Arial, sans-serif; 
            line-height: 1.6; 
            color: #333; 
            max-width: 800px; 
            margin: 0 auto; 
            padding: 20px; 
        }
        .header { 
            text-align: center; 
            border-bottom: 3px solid #3182ce; 
            padding-bottom: 20px; 
            margin-bottom: 30px; 
        }
        .plan-title { 
            color: #2d3748; 
            margin-bottom: 10px; 
        }
        .plan-meta { 
            display: flex; 
            justify-content: center; 
            gap: 20px; 
            margin-bottom: 20px; 
            flex-wrap: wrap; 
        }
        .meta-item { 
            background: #f7fafc; 
            padding: 8px 16px; 
            border-radius: 20px; 
            border: 1px solid #e2e8f0; 
        }
        .preferences { 
            display: flex; 
            flex-wrap: wrap; 
            gap: 8px; 
            margin: 15px 0; 
            justify-content: center; 
        }
        .preference-tag { 
            background: #3182ce; 
            color: white; 
            padding: 4px 12px; 
            border-radius: 12px; 
            font-size: 0.85em; 
        }
        .meal-section { 
            margin: 25px 0; 
            padding: 20px; 
            background: #f8fafc; 
            border-radius: 8px; 
            border-left: 4px solid #3182ce; 
        }
        .meal-title { 
            color: #2d3748; 
            margin-bottom: 10px; 
            display: flex; 
            align-items: center; 
            gap: 10px; 
        }
        .meal-icon { 
            font-size: 1.2em; 
        }
        .footer { 
            text-align: center; 
            margin-top: 40px; 
            padding-top: 20px; 
            border-top: 1px solid #e2e8f0; 
            color: #718096; 
            font-size: 0.9em; 
        }
        @media print {
            body { 
                max-width: none; 
                padding: 0; 
            }
            .meal-section { 
                break-inside: avoid; 
            }
        }
    </style>
</head>
<body>
    <div class="header">
        <h1 class="plan-title">${plan.name}</h1>
        <div class="plan-meta">
            <div class="meta-item"><strong>${plan.calories} kcal/día</strong></div>
            <div class="meta-item"><strong>Generado: ${currentDate}</strong></div>
        </div>
        <p>${plan.description}</p>
        <div class="preferences">
            ${plan.preferences.map(pref => `<span class="preference-tag">${pref}</span>`).join('')}
        </div>
    </div>
    
    <div class="meal-section">
        <h2 class="meal-title">
            <span class="meal-icon">☀️</span>
            Desayuno
        </h2>
        <p>${plan.details.breakfast}</p>
    </div>
    
    <div class="meal-section">
        <h2 class="meal-title">
            <span class="meal-icon">🍽️</span>
            Almuerzo
        </h2>
        <p>${plan.details.lunch}</p>
    </div>
    
    <div class="meal-section">
        <h2 class="meal-title">
            <span class="meal-icon">🌙</span>
            Cena
        </h2>
        <p>${plan.details.dinner}</p>
    </div>
    
    <div class="meal-section">
        <h2 class="meal-title">
            <span class="meal-icon">🥨</span>
            Snacks
        </h2>
        <p>${plan.details.snacks}</p>
    </div>
    
    <div class="footer">
        <p>Plan generado por NutriGuard - Planes Nutricionales para Personal Policial</p>
        <p>© ${new Date().getFullYear()} NutriGuard. Todos los derechos reservados.</p>
    </div>
</body>
</html>`;
}

// Función para imprimir plan
function printPlan(plan) {
    const printWindow = window.open('', '_blank');
    const printContent = generatePlanPDFContent(plan);
    
    printWindow.document.write(printContent);
    printWindow.document.close();
    printWindow.focus();
    
    setTimeout(() => {
        printWindow.print();
        // printWindow.close(); // Opcional: cerrar después de imprimir
    }, 500);
}

// Función para descargar múltiples planes
function downloadMultiplePlans(planIds, planType = 'predefined') {
    if (!planIds || planIds.length === 0) {
        alert('Selecciona al menos un plan para descargar.');
        return;
    }
    
    const plans = planType === 'predefined' ? nutritionPlans : customPlans;
    const selectedPlans = plans.filter(plan => planIds.includes(plan.id));
    
    if (selectedPlans.length === 0) {
        alert('No se encontraron los planes seleccionados.');
        return;
    }
    
    // Crear archivo ZIP con múltiples planes
    if (selectedPlans.length === 1) {
        // Si es solo uno, descargar directamente
        downloadPlan(selectedPlans[0].id, planType);
    } else {
        // Para múltiples planes, crear un archivo combinado
        downloadPlansCombined(selectedPlans);
    }
}

// Función para descargar planes combinados en un solo archivo
function downloadPlansCombined(plans) {
    const combinedContent = generateCombinedPlansContent(plans);
    
    const element = document.createElement('a');
    const file = new Blob([combinedContent], { type: 'text/html' });
    element.href = URL.createObjectURL(file);
    element.download = `Planes_NutriGuard_${new Date().toISOString().split('T')[0]}.html`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
}

// Función para generar contenido combinado de múltiples planes
function generateCombinedPlansContent(plans) {
    const currentDate = new Date().toLocaleDateString('es-ES');
    
    let plansHTML = '';
    plans.forEach((plan, index) => {
        plansHTML += `
        <div style="page-break-after: always; margin-bottom: 40px;">
            <div class="header">
                <h1 class="plan-title">${plan.name}</h1>
                <div class="plan-meta">
                    <div class="meta-item"><strong>${plan.calories} kcal/día</strong></div>
                    <div class="meta-item"><strong>Plan ${index + 1} de ${plans.length}</strong></div>
                </div>
                <p>${plan.description}</p>
                <div class="preferences">
                    ${plan.preferences.map(pref => `<span class="preference-tag">${pref}</span>`).join('')}
                </div>
            </div>
            
            <div class="meal-section">
                <h2 class="meal-title">
                    <span class="meal-icon">☀️</span>
                    Desayuno
                </h2>
                <p>${plan.details.breakfast}</p>
            </div>
            
            <div class="meal-section">
                <h2 class="meal-title">
                    <span class="meal-icon">🍽️</span>
                    Almuerzo
                </h2>
                <p>${plan.details.lunch}</p>
            </div>
            
            <div class="meal-section">
                <h2 class="meal-title">
                    <span class="meal-icon">🌙</span>
                    Cena
                </h2>
                <p>${plan.details.dinner}</p>
            </div>
            
            <div class="meal-section">
                <h2 class="meal-title">
                    <span class="meal-icon">🥨</span>
                    Snacks
                </h2>
                <p>${plan.details.snacks}</p>
            </div>
        </div>`;
    });
    
    return `<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Planes NutriGuard - ${currentDate}</title>
    <style>
        body { 
            font-family: Arial, sans-serif; 
            line-height: 1.6; 
            color: #333; 
            max-width: 800px; 
            margin: 0 auto; 
            padding: 20px; 
        }
        .header { 
            text-align: center; 
            border-bottom: 3px solid #3182ce; 
            padding-bottom: 20px; 
            margin-bottom: 30px; 
        }
        .plan-title { 
            color: #2d3748; 
            margin-bottom: 10px; 
        }
        .plan-meta { 
            display: flex; 
            justify-content: center; 
            gap: 20px; 
            margin-bottom: 20px; 
            flex-wrap: wrap; 
        }
        .meta-item { 
            background: #f7fafc; 
            padding: 8px 16px; 
            border-radius: 20px; 
            border: 1px solid #e2e8f0; 
        }
        .preferences { 
            display: flex; 
            flex-wrap: wrap; 
            gap: 8px; 
            margin: 15px 0; 
            justify-content: center; 
        }
        .preference-tag { 
            background: #3182ce; 
            color: white; 
            padding: 4px 12px; 
            border-radius: 12px; 
            font-size: 0.85em; 
        }
        .meal-section { 
            margin: 25px 0; 
            padding: 20px; 
            background: #f8fafc; 
            border-radius: 8px; 
            border-left: 4px solid #3182ce; 
        }
        .meal-title { 
            color: #2d3748; 
            margin-bottom: 10px; 
            display: flex; 
            align-items: center; 
            gap: 10px; 
        }
        .meal-icon { 
            font-size: 1.2em; 
        }
        .footer { 
            text-align: center; 
            margin-top: 40px; 
            padding-top: 20px; 
            border-top: 1px solid #e2e8f0; 
            color: #718096; 
            font-size: 0.9em; 
        }
        @media print {
            body { 
                max-width: none; 
                padding: 0; 
            }
            .meal-section { 
                break-inside: avoid; 
            }
        }
    </style>
</head>
<body>
    <div class="header">
        <h1>Planes Nutricionales NutriGuard</h1>
        <div class="plan-meta">
            <div class="meta-item"><strong>${plans.length} planes</strong></div>
            <div class="meta-item"><strong>Generado: ${currentDate}</strong></div>
        </div>
    </div>
    
    ${plansHTML}
    
    <div class="footer">
        <p>Planes generados por NutriGuard - Planes Nutricionales para Personal Policial</p>
        <p>© ${new Date().getFullYear()} NutriGuard. Todos los derechos reservados.</p>
    </div>
</body>
</html>`;
}

// Función para mostrar modal de selección múltiple
function showMultiDownloadModal(planType = 'predefined') {
    const plans = planType === 'predefined' ? nutritionPlans : customPlans;
    
    if (plans.length === 0) {
        alert(`No hay planes ${planType === 'predefined' ? 'predefinidos' : 'personalizados'} disponibles.`);
        return;
    }
    
    const modalContent = `
        <h3>Descargar Múltiples Planes</h3>
        <p>Selecciona los planes que deseas descargar:</p>
        <div class="download-selection" style="max-height: 300px; overflow-y: auto; margin: 1rem 0;">
            ${plans.map(plan => `
                <label class="download-option" style="display: flex; align-items: center; gap: 0.5rem; padding: 0.5rem; border: 1px solid var(--border-color); border-radius: 4px; margin-bottom: 0.5rem;">
                    <input type="checkbox" value="${plan.id}" class="plan-checkbox">
                    <div>
                        <strong>${plan.name}</strong>
                        <div style="font-size: 0.85rem; color: var(--text-secondary);">${plan.calories} kcal • ${plan.preferences.join(', ')}</div>
                    </div>
                </label>
            `).join('')}
        </div>
        <div class="form-actions">
            <button type="button" class="btn btn-outline" onclick="closeModal('multi-download-modal')">Cancelar</button>
            <button type="button" class="btn btn-primary" onclick="processMultiDownload('${planType}')">Descargar Seleccionados</button>
            <button type="button" class="btn btn-outline" onclick="selectAllPlans()">Seleccionar Todos</button>
        </div>
    `;
    
    // Crear o actualizar modal
    let modal = document.getElementById('multi-download-modal');
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'multi-download-modal';
        modal.className = 'modal';
        modal.innerHTML = `
            <div class="modal-content" style="max-width: 500px;">
                <div class="modal-header">
                    <h3 class="modal-title">Descargar Planes</h3>
                    <button class="modal-close" onclick="closeModal('multi-download-modal')">&times;</button>
                </div>
                <div class="modal-body" id="multi-download-content">
                    ${modalContent}
                </div>
            </div>
        `;
        document.body.appendChild(modal);
    } else {
        document.getElementById('multi-download-content').innerHTML = modalContent;
    }
    
    modal.style.display = 'flex';
}

// Función para seleccionar todos los planes
function selectAllPlans() {
    const checkboxes = document.querySelectorAll('.plan-checkbox');
    const allChecked = Array.from(checkboxes).every(checkbox => checkbox.checked);
    
    checkboxes.forEach(checkbox => {
        checkbox.checked = !allChecked;
    });
}

// Función para procesar descarga múltiple
function processMultiDownload(planType) {
    const checkboxes = document.querySelectorAll('.plan-checkbox:checked');
    const selectedPlanIds = Array.from(checkboxes).map(checkbox => parseInt(checkbox.value));
    
    downloadMultiplePlans(selectedPlanIds, planType);
    closeModal('multi-download-modal');
}
// [AGREGAR DESPUÉS DE initializeUserData()]

// Inicializar planes personalizados
function initializeCustomPlans() {
    const savedCustomPlans = localStorage.getItem('nutriguard_custom_plans');
    if (savedCustomPlans) {
        customPlans = JSON.parse(savedCustomPlans);
    }
    renderCustomPlans();
}

// Renderizar planes personalizados
function renderCustomPlans() {
    const container = document.getElementById('custom-plans-container');
    const emptyState = document.getElementById('empty-custom-plans-state');
    
    if (!container) return;
    
    // Mostrar/ocultar estado vacío
    if (customPlans.length === 0) {
        container.innerHTML = '';
        if (emptyState) emptyState.style.display = 'block';
        return;
    }
    
    if (emptyState) emptyState.style.display = 'none';
    
    container.innerHTML = customPlans.map(plan => `
        <div class="plan-card" data-plan-id="${plan.id}">
            <div class="plan-header">
                <h3 class="plan-title">${plan.name}</h3>
                <div class="plan-calories">${plan.calories} kcal/día</div>
            </div>
            <div class="plan-content">
                <p class="plan-description">${plan.description || 'Plan personalizado'}</p>
                
                <div class="plan-preferences">
                    ${plan.preferences && plan.preferences.length > 0 ? 
                      plan.preferences.map(pref => `<span class="preference-tag">${pref}</span>`).join('') : 
                      '<span class="preference-tag">Personalizado</span>'}
                </div>
                
                <div class="plan-details">
                    <h4>Desayuno</h4>
                    <p>${plan.meals.breakfast}</p>
                    
                    <h4>Almuerzo</h4>
                    <p>${plan.meals.lunch}</p>
                    
                    <h4>Cena</h4>
                    <p>${plan.meals.dinner}</p>
                    
                    ${plan.meals.snacks ? `
                    <h4>Snacks</h4>
                    <p>${plan.meals.snacks}</p>
                    ` : ''}
                </div>
                
                <div class="plan-actions">
                    <button class="btn btn-primary" onclick="showCustomPlanDetails(${plan.id})">Ver Detalles</button>
                    <button class="btn btn-outline" onclick="downloadPlan(${plan.id}, 'custom')">Descargar</button>
                    <button class="btn btn-danger btn-small" onclick="deleteCustomPlan(${plan.id})">Eliminar</button>
                </div>
            </div>
        </div>
    `).join('');
}

// Mostrar detalles de plan personalizado
function showCustomPlanDetails(planId) {
    const plan = customPlans.find(p => p.id === planId);
    if (!plan) return;
    
    planModalBody.innerHTML = `
        <h3>${plan.name}</h3>
        <div style="display: flex; gap: 1rem; margin: 1rem 0;">
            <div style="background-color: var(--bg-primary); padding: 0.5rem 1rem; border-radius: 4px; border: 1px solid var(--border-color);">
                <strong>${plan.calories}</strong> kcal/día
            </div>
            <div style="background-color: var(--accent); color: white; padding: 0.5rem 1rem; border-radius: 4px;">
                <strong>Personalizado</strong>
            </div>
        </div>
        <p>${plan.description || 'Plan nutricional personalizado.'}</p>
        
        ${plan.preferences && plan.preferences.length > 0 ? `
        <div style="margin-top: 1.5rem;">
            <h4>Preferencias</h4>
            <div style="display: flex; flex-wrap: wrap; gap: 0.5rem; margin: 0.5rem 0 1.5rem;">
                ${plan.preferences.map(pref => `<span class="preference-tag">${pref}</span>`).join('')}
            </div>
        </div>
        ` : ''}
        
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1.5rem;">
            <div>
                <h4>Desayuno</h4>
                <p>${plan.meals.breakfast}</p>
                
                <h4 style="margin-top: 1rem;">Almuerzo</h4>
                <p>${plan.meals.lunch}</p>
            </div>
            <div>
                <h4>Cena</h4>
                <p>${plan.meals.dinner}</p>
                
                ${plan.meals.snacks ? `
                <h4 style="margin-top: 1rem;">Snacks</h4>
                <p>${plan.meals.snacks}</p>
                ` : ''}
            </div>
        </div>
        
        <div style="margin-top: 1.5rem; display: flex; gap: 1rem;">
            <button class="btn btn-primary" onclick="downloadPlan(${plan.id}, 'custom')">Descargar Plan</button>
            <button class="btn btn-outline" onclick="applyCustomPlan(${plan.id})">Aplicar este Plan</button>
            <button class="btn btn-danger" onclick="deleteCustomPlan(${plan.id}); closeModal('plan-modal')">Eliminar Plan</button>
        </div>
    `;
    
    planModal.style.display = 'flex';
}

// Eliminar plan personalizado
function deleteCustomPlan(planId) {
    if (confirm('¿Estás seguro de que quieres eliminar este plan personalizado?')) {
        customPlans = customPlans.filter(plan => plan.id !== planId);
        saveCustomPlans();
        renderCustomPlans();
        
        // Si estamos en la sección de planes, actualizar
        if (document.getElementById('plans-section').classList.contains('active')) {
            renderCustomPlans();
        }
    }
}

// Aplicar plan personalizado
function applyCustomPlan(planId) {
    const plan = customPlans.find(p => p.id === planId);
    if (!plan) return;
    
    // Aquí puedes implementar la lógica para aplicar el plan
    alert(`Plan "${plan.name}" aplicado. Esta funcionalidad puede expandirse para integrar el plan con el planificador semanal.`);
}

// Crear nuevo plan personalizado
function createCustomPlan(planData) {
    const newPlan = {
        id: Date.now(),
        name: planData.name,
        description: planData.description,
        calories: parseInt(planData.calories),
        preferences: planData.preferences || [],
        meals: {
            breakfast: planData.breakfast,
            lunch: planData.lunch,
            dinner: planData.dinner,
            snacks: planData.snacks || ''
        },
        createdAt: new Date().toISOString()
    };
    
    customPlans.push(newPlan);
    saveCustomPlans();
    renderCustomPlans();
    
    return newPlan;
}

// [AGREGAR EN EL EVENT LISTENER DEL DOMCONTENTLOADED]
document.addEventListener('DOMContentLoaded', () => {
    // ... código existente ...
    
    // Inicializar planes personalizados
    initializeCustomPlans();
    
    // Botón para crear plan personalizado
    document.getElementById('create-custom-plan')?.addEventListener('click', () => {
        document.getElementById('create-custom-plan-modal').style.display = 'flex';
    });
    
    // Botón para crear primer plan
    document.getElementById('create-first-plan')?.addEventListener('click', () => {
        document.getElementById('create-custom-plan-modal').style.display = 'flex';
    });
    
    // Formulario de plan personalizado
    document.getElementById('custom-plan-form')?.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const formData = new FormData(e.target);
        const preferences = Array.from(document.querySelectorAll('.preference-checkbox:checked'))
            .map(checkbox => checkbox.value);
        
        const planData = {
            name: formData.get('plan-name'),
            description: formData.get('plan-description'),
            calories: formData.get('plan-calories'),
            preferences: preferences,
            breakfast: formData.get('plan-breakfast'),
            lunch: formData.get('plan-lunch'),
            dinner: formData.get('plan-dinner'),
            snacks: formData.get('plan-snacks')
        };
        
        // Validaciones básicas
        if (!planData.name || !planData.calories || !planData.breakfast || !planData.lunch || !planData.dinner) {
            alert('Por favor, completa todos los campos obligatorios (*)');
            return;
        }
        
        createCustomPlan(planData);
        closeModal('create-custom-plan-modal');
        e.target.reset();
        
        // Cambiar a la pestaña de planes personalizados si estamos en planes
        if (document.getElementById('plans-section').classList.contains('active')) {
            document.querySelector('[data-tab="my-custom-plans"]').click();
        }
    });
});
// [AGREGAR ESTAS NUEVAS FUNCIONES EN script.js]

// Renderizar planes personalizados en "Mis Planes"
function renderMyCustomPlans() {
    const container = document.getElementById('my-custom-plans-container');
    const emptyState = document.getElementById('empty-my-custom-plans-state');
    
    if (!container) return;
    
    // Mostrar/ocultar estado vacío
    if (customPlans.length === 0) {
        container.innerHTML = '';
        if (emptyState) emptyState.style.display = 'block';
        return;
    }
    
    if (emptyState) emptyState.style.display = 'none';
    
    container.innerHTML = customPlans.map(plan => `
        <div class="plan-card" data-plan-id="${plan.id}">
            <div class="plan-header">
                <h3 class="plan-title">${plan.name}</h3>
                <div class="plan-calories">${plan.calories} kcal/día</div>
            </div>
            <div class="plan-content">
                <p class="plan-description">${plan.description || 'Plan personalizado creado por ti'}</p>
                
                <div class="plan-preferences">
                    ${plan.preferences && plan.preferences.length > 0 ? 
                      plan.preferences.map(pref => `<span class="preference-tag">${pref}</span>`).join('') : 
                      '<span class="preference-tag">Personalizado</span>'}
                </div>
                
                <div class="plan-details">
                    <h4>Desayuno</h4>
                    <p>${plan.meals.breakfast}</p>
                    
                    <h4>Almuerzo</h4>
                    <p>${plan.meals.lunch}</p>
                    
                    <h4>Cena</h4>
                    <p>${plan.meals.dinner}</p>
                    
                    ${plan.meals.snacks ? `
                    <h4>Snacks</h4>
                    <p>${plan.meals.snacks}</p>
                    ` : ''}
                </div>
                
                <div class="plan-actions">
                    <button class="btn btn-primary" onclick="showCustomPlanDetails(${plan.id})">Ver Detalles</button>
                    <button class="btn btn-outline" onclick="downloadPlan(${plan.id}, 'custom')">Descargar</button>
                    <button class="btn btn-outline" onclick="applyCustomPlanToWeek(${plan.id})">Aplicar a Semana</button>
                    <button class="btn btn-danger btn-small" onclick="deleteCustomPlan(${plan.id})">Eliminar</button>
                </div>
            </div>
        </div>
    `).join('');
}

// Aplicar plan personalizado a la semana actual
function applyCustomPlanToWeek(planId) {
    const plan = customPlans.find(p => p.id === planId);
    if (!plan) return;
    
    if (confirm(`¿Aplicar el plan "${plan.name}" a tu semana actual?`)) {
        // Aquí puedes implementar la lógica para aplicar el plan a la semana
        // Por ejemplo, agregar las comidas al planificador semanal
        alert(`Plan "${plan.name}" aplicado a tu semana. Esta funcionalidad puede expandirse para integrar automáticamente las comidas en tu planificación semanal.`);
        
        // Opcional: Cambiar a la sección de home para ver el plan aplicado
        switchSection('home');
    }
}

// Actualizar la función renderMyPlans para incluir planes personalizados
function renderMyPlans() {
    // Ocultar/mostrar estado vacío general
    const hasPlans = userPlans.daily.length > 0 || userPlans.weekly.length > 0 || 
                     userPlans.favorites.length > 0 || customPlans.length > 0;
    emptyPlansState.style.display = hasPlans ? 'none' : 'block';
    
    // Renderizar todas las secciones
    renderDailyPlans();
    renderWeeklyPlans();
    renderMyCustomPlans(); // <- NUEVA FUNCIÓN
    renderFavorites();
    
    // Actualizar contador en la pestaña de planes personalizados
    updateCustomPlansCounter();
}

// Actualizar contador de planes personalizados
function updateCustomPlansCounter() {
    const counterElement = document.querySelector('[data-tab="custom-plans"]');
    if (counterElement) {
        const baseText = 'Mis Planes Personalizados';
        counterElement.textContent = customPlans.length > 0 ? 
            `${baseText} (${customPlans.length})` : baseText;
    }
}

// [ACTUALIZAR EL EVENT LISTENER DEL DOMCONTENTLOADED]
document.addEventListener('DOMContentLoaded', () => {
    // ... código existente ...
    
    // Botones para crear plan personalizado desde "Mis Planes"
    document.getElementById('create-custom-plan-from-my-plans')?.addEventListener('click', () => {
        document.getElementById('create-custom-plan-modal').style.display = 'flex';
    });
    
    document.getElementById('create-first-plan-from-my-plans')?.addEventListener('click', () => {
        document.getElementById('create-custom-plan-modal').style.display = 'flex';
    });
    
    // Botón de descarga en "Mis Planes"
    document.getElementById('download-my-plans')?.addEventListener('click', () => {
        // Mostrar modal de selección para descargar múltiples planes
        showMyPlansDownloadModal();
    });
    
    // Actualizar renderMyPlans para incluir planes personalizados
    // (esto reemplaza la función original)
});

// Modal de descarga para "Mis Planes"
function showMyPlansDownloadModal() {
    const hasCustomPlans = customPlans.length > 0;
    const hasPredefinedPlans = nutritionPlans.length > 0;
    
    if (!hasCustomPlans && !hasPredefinedPlans) {
        alert('No hay planes disponibles para descargar.');
        return;
    }
    
    const modalContent = `
        <h3>Descargar Mis Planes</h3>
        <p>Selecciona qué tipo de planes deseas descargar:</p>
        
        ${hasCustomPlans ? `
        <div style="margin: 1rem 0;">
            <label style="display: flex; align-items: center; gap: 0.5rem; margin-bottom: 0.5rem;">
                <input type="checkbox" id="include-custom-plans" checked>
                <strong>Mis Planes Personalizados (${customPlans.length})</strong>
            </label>
        </div>
        ` : ''}
        
        ${hasPredefinedPlans ? `
        <div style="margin: 1rem 0;">
            <label style="display: flex; align-items: center; gap: 0.5rem; margin-bottom: 0.5rem;">
                <input type="checkbox" id="include-predefined-plans">
                <strong>Planes Predefinidos (${nutritionPlans.length})</strong>
            </label>
        </div>
        ` : ''}
        
        <div class="form-actions">
            <button type="button" class="btn btn-outline" onclick="closeModal('my-plans-download-modal')">Cancelar</button>
            <button type="button" class="btn btn-primary" onclick="processMyPlansDownload()">Descargar Seleccionados</button>
        </div>
    `;
    
    // Crear o actualizar modal
    let modal = document.getElementById('my-plans-download-modal');
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'my-plans-download-modal';
        modal.className = 'modal';
        modal.innerHTML = `
            <div class="modal-content" style="max-width: 500px;">
                <div class="modal-header">
                    <h3 class="modal-title">Descargar Mis Planes</h3>
                    <button class="modal-close" onclick="closeModal('my-plans-download-modal')">&times;</button>
                </div>
                <div class="modal-body" id="my-plans-download-content">
                    ${modalContent}
                </div>
            </div>
        `;
        document.body.appendChild(modal);
    } else {
        document.getElementById('my-plans-download-content').innerHTML = modalContent;
    }
    
    modal.style.display = 'flex';
}

// Procesar descarga desde "Mis Planes"
function processMyPlansDownload() {
    const includeCustom = document.getElementById('include-custom-plans')?.checked || false;
    const includePredefined = document.getElementById('include-predefined-plans')?.checked || false;
    
    let plansToDownload = [];
    
    if (includeCustom) {
        plansToDownload.push(...customPlans.map(plan => ({...plan, type: 'custom'})));
    }
    
    if (includePredefined) {
        plansToDownload.push(...nutritionPlans.map(plan => ({...plan, type: 'predefined'})));
    }
    
    if (plansToDownload.length === 0) {
        alert('Selecciona al menos un tipo de plan para descargar.');
        return;
    }
    
    downloadMyPlansCombined(plansToDownload);
    closeModal('my-plans-download-modal');
}

// Descargar planes combinados de "Mis Planes"
function downloadMyPlansCombined(plans) {
    const combinedContent = generateMyPlansCombinedContent(plans);
    
    const element = document.createElement('a');
    const file = new Blob([combinedContent], { type: 'text/html' });
    element.href = URL.createObjectURL(file);
    element.download = `Mis_Planes_NutriGuard_${new Date().toISOString().split('T')[0]}.html`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
}

// Generar contenido combinado para "Mis Planes"
function generateMyPlansCombinedContent(plans) {
    const currentDate = new Date().toLocaleDateString('es-ES');
    
    let plansHTML = '';
    plans.forEach((plan, index) => {
        const planType = plan.type === 'custom' ? 'Personalizado' : 'Predefinido';
        
        plansHTML += `
        <div style="page-break-after: always; margin-bottom: 40px;">
            <div class="header">
                <h1 class="plan-title">${plan.name}</h1>
                <div class="plan-meta">
                    <div class="meta-item"><strong>${plan.calories} kcal/día</strong></div>
                    <div class="meta-item"><strong>${planType}</strong></div>
                    <div class="meta-item"><strong>Plan ${index + 1} de ${plans.length}</strong></div>
                </div>
                <p>${plan.description || 'Plan nutricional personalizado.'}</p>
                <div class="preferences">
                    ${plan.preferences && plan.preferences.length > 0 ? 
                      plan.preferences.map(pref => `<span class="preference-tag">${pref}</span>`).join('') : 
                      '<span class="preference-tag">Personalizado</span>'}
                </div>
            </div>
            
            <div class="meal-section">
                <h2 class="meal-title">
                    <span class="meal-icon">☀️</span>
                    Desayuno
                </h2>
                <p>${plan.details?.breakfast || plan.meals?.breakfast}</p>
            </div>
            
            <div class="meal-section">
                <h2 class="meal-title">
                    <span class="meal-icon">🍽️</span>
                    Almuerzo
                </h2>
                <p>${plan.details?.lunch || plan.meals?.lunch}</p>
            </div>
            
            <div class="meal-section">
                <h2 class="meal-title">
                    <span class="meal-icon">🌙</span>
                    Cena
                </h2>
                <p>${plan.details?.dinner || plan.meals?.dinner}</p>
            </div>
            
            ${(plan.details?.snacks || plan.meals?.snacks) ? `
            <div class="meal-section">
                <h2 class="meal-title">
                    <span class="meal-icon">🥨</span>
                    Snacks
                </h2>
                <p>${plan.details?.snacks || plan.meals?.snacks}</p>
            </div>
            ` : ''}
        </div>`;
    });
    
    return `<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Mis Planes NutriGuard - ${currentDate}</title>
    <style>
        /* [Mismo CSS que en generateCombinedPlansContent] */
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 800px; margin: 0 auto; padding: 20px; }
        .header { text-align: center; border-bottom: 3px solid #3182ce; padding-bottom: 20px; margin-bottom: 30px; }
        .plan-title { color: #2d3748; margin-bottom: 10px; }
        .plan-meta { display: flex; justify-content: center; gap: 20px; margin-bottom: 20px; flex-wrap: wrap; }
        .meta-item { background: #f7fafc; padding: 8px 16px; border-radius: 20px; border: 1px solid #e2e8f0; }
        .preferences { display: flex; flex-wrap: wrap; gap: 8px; margin: 15px 0; justify-content: center; }
        .preference-tag { background: #3182ce; color: white; padding: 4px 12px; border-radius: 12px; font-size: 0.85em; }
        .meal-section { margin: 25px 0; padding: 20px; background: #f8fafc; border-radius: 8px; border-left: 4px solid #3182ce; }
        .meal-title { color: #2d3748; margin-bottom: 10px; display: flex; align-items: center; gap: 10px; }
        .meal-icon { font-size: 1.2em; }
        .footer { text-align: center; margin-top: 40px; padding-top: 20px; border-top: 1px solid #e2e8f0; color: #718096; font-size: 0.9em; }
        @media print { body { max-width: none; padding: 0; } .meal-section { break-inside: avoid; } }
    </style>
</head>
<body>
    <div class="header">
        <h1>Mis Planes Nutricionales - NutriGuard</h1>
        <div class="plan-meta">
            <div class="meta-item"><strong>${plans.length} planes</strong></div>
            <div class="meta-item"><strong>Generado: ${currentDate}</strong></div>
            <div class="meta-item"><strong>Usuario Personal</strong></div>
        </div>
    </div>
    
    ${plansHTML}
    
    <div class="footer">
        <p>Planes personales generados por NutriGuard - Planes Nutricionales para Personal Policial</p>
        <p>© ${new Date().getFullYear()} NutriGuard. Todos los derechos reservados.</p>
    </div>
</body>
</html>`;
}