// Base de datos de comidas mejorada
const mealsDB = {
    morning: [
        {
            id: 1,
            name: "Avena con Plátano y Nueces",
            calories: 420,
            protein: 12,
            carbs: 60,
            fat: 14,
            portion: "1 tazón",
            prepTime: "10 min",
            difficulty: "Fácil",
            description: "Energía sostenida para comenzar el día. La avena proporciona carbohidratos complejos y fibra, mientras que las nueces aportan grasas saludables.",
            ingredients: ["Avena", "Leche descremada", "Plátano", "Nueces", "Miel (opcional)"],
            instructions: ["Cocinar la avena con leche", "Agregar plátano en rodajas", "Espolvorear nueces picadas", "Endulzar con miel si se desea"]
        },
        {
            id: 2,
            name: "Sándwich Integral con Huevo y Tomate",
            calories: 360,
            protein: 20,
            carbs: 34,
            fat: 12,
            portion: "1 sándwich",
            prepTime: "15 min",
            difficulty: "Fácil",
            description: "Proteína de calidad para mantener la masa muscular y energía constante durante el turno.",
            ingredients: ["Pan integral", "Huevos", "Tomate", "Lechuga", "Aguacate (opcional)"],
            instructions: ["Cocinar los huevos revueltos", "Tostar el pan integral", "Armar el sándwich con los ingredientes"]
        },
        {
            id: 3,
            name: "Yogur Griego con Frutos Rojos",
            calories: 220,
            protein: 15,
            carbs: 28,
            fat: 4,
            portion: "1 vaso",
            prepTime: "5 min",
            difficulty: "Muy fácil",
            description: "Opción rápida y nutritiva con alto contenido proteico y antioxidantes.",
            ingredients: ["Yogur griego natural", "Frambuesas", "Arándanos", "Almendras fileteadas"],
            instructions: ["Colocar el yogur en un recipiente", "Agregar los frutos rojos", "Espolvorear almendras fileteadas"]
        },
        {
            id: 10,
            name: "Batido Energético de Proteína",
            calories: 380,
            protein: 30,
            carbs: 45,
            fat: 8,
            portion: "1 vaso grande",
            prepTime: "5 min",
            difficulty: "Muy fácil",
            description: "Batido rápido y nutritivo ideal para comenzar el día con energía.",
            ingredients: ["Proteína en polvo", "Plátano", "Avena", "Leche de almendras", "Mantequilla de maní"],
            instructions: ["Mezclar todos los ingredientes en licuadora", "Batir hasta obtener consistencia homogénea", "Servir inmediatamente"]
        }
    ],
    afternoon: [
        {
            id: 4,
            name: "Pollo a la Plancha con Arroz Integral",
            calories: 540,
            protein: 42,
            carbs: 58,
            fat: 10,
            portion: "1 plato",
            prepTime: "25 min",
            difficulty: "Media",
            description: "Comida equilibrada con proteínas magras y carbohidratos complejos para energía sostenida.",
            ingredients: ["Pechuga de pollo", "Arroz integral", "Brócoli", "Zanahoria", "Aceite de oliva"],
            instructions: ["Cocinar el arroz integral", "Sellar el pollo a la plancha", "Cocinar al vapor las verduras", "Servir todo junto"]
        },
        {
            id: 5,
            name: "Ensalada Grande con Atún",
            calories: 380,
            protein: 32,
            carbs: 18,
            fat: 18,
            portion: "1 plato",
            prepTime: "15 min",
            difficulty: "Fácil",
            description: "Completa ensalada con proteínas de alta calidad y grasas saludables.",
            ingredients: ["Lechuga", "Atún en agua", "Tomate", "Pepino", "Aceitunas", "Aceite de oliva"],
            instructions: ["Lavar y cortar las verduras", "Agregar el atún escurrido", "Aliñar con aceite de oliva", "Mezclar suavemente"]
        },
        {
            id: 6,
            name: "Wrap de Pavo y Vegetales",
            calories: 420,
            protein: 30,
            carbs: 40,
            fat: 12,
            portion: "1 wrap",
            prepTime: "10 min",
            difficulty: "Fácil",
            description: "Opción práctica y portátil ideal para comer durante el servicio.",
            ingredients: ["Tortilla integral", "Pechuga de pavo", "Lechuga", "Tomate", "Aguacate", "Mostaza"],
            instructions: ["Extender la tortilla", "Colocar los ingredientes", "Enrollar firmemente", "Cortar por la mitad"]
        },
        {
            id: 11,
            name: "Bowl de Quinoa con Vegetales",
            calories: 450,
            protein: 18,
            carbs: 65,
            fat: 12,
            portion: "1 plato",
            prepTime: "20 min",
            difficulty: "Fácil",
            description: "Completa comida vegetariana con todos los aminoácidos esenciales.",
            ingredients: ["Quinoa", "Garbanzos", "Pimiento", "Calabacín", "Aceite de oliva", "Limón"],
            instructions: ["Cocinar la quinoa", "Saltear los vegetales", "Mezclar con garbanzos", "Aliñar con aceite y limón"]
        }
    ],
    night: [
        {
            id: 7,
            name: "Salmón al Horno con Quinoa",
            calories: 480,
            protein: 36,
            carbs: 40,
            fat: 18,
            portion: "1 plato (ligero)",
            prepTime: "30 min",
            difficulty: "Media",
            description: "Cena ligera pero nutritiva con ácidos grasos omega-3 y proteína de alta calidad.",
            ingredients: ["Salmón", "Quinoa", "Espárragos", "Limón", "Eneldo"],
            instructions: ["Cocinar la quinoa", "Hornear el salmón con especias", "Saltear los espárragos", "Servir con limón"]
        },
        {
            id: 8,
            name: "Tazón de Hummus y Vegetales",
            calories: 300,
            protein: 12,
            carbs: 28,
            fat: 16,
            portion: "1 porción",
            prepTime: "10 min",
            difficulty: "Muy fácil",
            description: "Opción ligera y fácil de digerir para antes de dormir.",
            ingredients: ["Hummus", "Zanahoria", "Pepino", "Pimiento", "Galletas integrales"],
            instructions: ["Colocar el hummus en un bol", "Cortar los vegetales en bastones", "Servir con galletas integrales"]
        },
        {
            id: 9,
            name: "Batido de Proteína (bajo azúcar)",
            calories: 220,
            protein: 28,
            carbs: 10,
            fat: 4,
            portion: "1 vaso",
            prepTime: "5 min",
            difficulty: "Muy fácil",
            description: "Recuperación muscular durante la noche sin sobrecargar el sistema digestivo.",
            ingredients: ["Proteína en polvo", "Leche de almendras", "Espinacas", "Semillas de chía"],
            instructions: ["Mezclar todos los ingredientes en licuadora", "Batir hasta obtener consistencia homogénea", "Servir inmediatamente"]
        },
        {
            id: 12,
            name: "Crema de Verduras Ligera",
            calories: 280,
            protein: 10,
            carbs: 35,
            fat: 12,
            portion: "1 plato",
            prepTime: "20 min",
            difficulty: "Fácil",
            description: "Sopa reconfortante y fácil de digerir para finalizar el día.",
            ingredients: ["Calabacín", "Zanahoria", "Cebolla", "Caldo vegetal", "Nata ligera"],
            instructions: ["Cocinar las verduras en caldo", "Triturar hasta obtener crema", "Añadir nata ligera", "Servir caliente"]
        }
    ]
};

// Planes nutricionales adicionales
const nutritionPlans = [
    {
        id: 1,
        name: "Plan Básico Policial",
        description: "Plan diseñado para uniformados en patrulla, enfocado en energía y recuperación.",
        details: {
            breakfast: "Avena con leche descremada, fruta fresca, café sin azúcar.",
            lunch: "Pechuga de pollo a la plancha, arroz integral, ensalada de vegetales, agua.",
            dinner: "Tortilla de claras, pan integral, jugo natural sin azúcar.",
            snacks: "Yogur bajo en grasa, frutos secos."
        },
        calories: 2200,
        preferences: ["Sin azúcar", "Bajo en grasa"]
    },
    {
        id: 2,
        name: "Plan Alto Rendimiento",
        description: "Para uniformados en entrenamiento físico intenso.",
        details: {
            breakfast: "Huevos revueltos, pan integral, batido de frutas.",
            lunch: "Carne magra, pasta integral, ensalada de espinaca, agua.",
            dinner: "Pescado al vapor, puré de papa, vegetales cocidos.",
            snacks: "Barra de proteína, fruta fresca."
        },
        calories: 2800,
        preferences: ["Alto en proteína", "Sin fritos"]
    },
    {
        id: 3,
        name: "Plan Turno Nocturno",
        description: "Adaptado para quienes trabajan durante la noche, con énfasis en comidas ligeras y energía sostenida.",
        details: {
            breakfast: "Sopa ligera, galletas integrales, té de hierbas.",
            lunch: "Ensalada de quinoa con vegetales, pechuga de pavo.",
            dinner: "Crema de verduras, tostadas de aguacate.",
            snacks: "Yogur griego, frutos secos, batido de proteína."
        },
        calories: 2000,
        preferences: ["Ligero", "Fácil digestión", "Alto en proteína"]
    },
    {
        id: 4,
        name: "Plan Operaciones Especiales",
        description: "Para personal en operaciones de alta exigencia física y mental.",
        details: {
            breakfast: "Batido energético con avena, proteína, frutas y mantequilla de maní.",
            lunch: "Pollo asado, batata, brócoli al vapor, aguacate.",
            dinner: "Salmón, quinoa, espárragos, ensalada verde.",
            snacks: "Barras energéticas caseras, nueces, fruta deshidratada."
        },
        calories: 3200,
        preferences: ["Alta densidad energética", "Alto en proteína", "Rico en grasas saludables"]
    },
    {
        id: 5,
        name: "Plan Vegetariano",
        description: "Para personal que sigue una dieta basada en plantas.",
        details: {
            breakfast: "Tofu revuelto con espinacas, tostadas integrales.",
            lunch: "Bowl de lentejas, arroz integral, vegetales salteados.",
            dinner: "Hamburguesa de garbanzos, ensalada completa, aguacate.",
            snacks: "Hummus con vegetales, frutos secos, batido de proteína vegetal."
        },
        calories: 2400,
        preferences: ["Vegetariano", "Alto en fibra", "Rico en proteína vegetal"]
    },
    {
        id: 6,
        name: "Plan Mantenimiento",
        description: "Para personal en labores administrativas o con menor actividad física.",
        details: {
            breakfast: "Cereal integral con leche descremada, fruta.",
            lunch: "Sándwich de pollo con pan integral, ensalada.",
            dinner: "Pescado al horno, puré de coliflor, verduras al vapor.",
            snacks: "Yogur, fruta, puñado de almendras."
        },
        calories: 1900,
        preferences: ["Bajo en calorías", "Balanceado", "Fácil preparación"]
    }
];