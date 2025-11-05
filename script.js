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
    }
}

// Función para renderizar comidas
function renderMeals(shift) {
    mealsContainer.innerHTML = '';
    
    const meals = mealsDB[shift] || [];
    const maxCalories = parseInt(caloriesFilter.value) || Infinity;
    const searchTerm = searchInput.value.toLowerCase();
    
    const filteredMeals = meals.filter(meal => {
        const matchesCalories = meal.calories <= maxCalories;
        const matchesSearch = meal.name.toLowerCase().includes(searchTerm) || 
                             meal.description.toLowerCase().includes(searchTerm);
        return matchesCalories && matchesSearch;
    });
    
    if (filteredMeals.length === 0) {
        mealsContainer.innerHTML = '<p>No se encontraron comidas con los filtros aplicados.</p>';
        return;
    }
    
    filteredMeals.forEach(meal => {
        const mealCard = document.createElement('div');
        mealCard.className = 'meal-card';
        mealCard.innerHTML = `
            <div class="meal-image" style="background-color: #e2e8f0;"></div>
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
        <div style="display: flex; gap: 1rem; margin: 1rem 0;">
            <div style="background-color: var(--bg-primary); padding: 0.5rem 1rem; border-radius: 4px; border: 1px solid var(--border-color);">
                <strong>${meal.calories}</strong> kcal
            </div>
            <div style="background-color: var(--bg-primary); padding: 0.5rem 1rem; border-radius: 4px; border: 1px solid var(--border-color);">
                <strong>${meal.prepTime}</strong> preparación
            </div>
            <div style="background-color: var(--bg-primary); padding: 0.5rem 1rem; border-radius: 4px; border: 1px solid var(--border-color);">
                <strong>${meal.difficulty}</strong>
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
        
        <div style="margin-top: 1.5rem; display: flex; gap: 1rem;">
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