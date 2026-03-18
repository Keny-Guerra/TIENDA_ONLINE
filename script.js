// BASE DE DATOS DE PRODUCTOS - 5 POR CADA CATEGORÍA/DEPORTE
const productos = [
    // ============================================
    // CAMISETAS DE FÚTBOL (5 productos)
    // ============================================
    {
        id: 1,
        nombre: 'Camiseta Perú 2024 Local',
        categoria: 'camisetas',
        deporte: 'futbol',
        descripcion: 'Camiseta oficial de la selección peruana temporada 2024. Diseño inspirado en nuestra historia con tecnología de alto rendimiento.',
        especificaciones: 'Tela DryFit - Tallas S/M/L/XL - Estampado sublimado',
        precioOriginal: 189.90,
        precioOferta: 159.90,
        descuento: 16,
        stock: 50,
        vistas: {
            frente: 'img/camisetas/peru-frente.jpg',
            espalda: 'img/camisetas/peru-espalda.jpg'
        }
    },
    {
        id: 2,
        nombre: 'Camiseta Argentina 2024 Local',
        categoria: 'camisetas',
        deporte: 'futbol',
        descripcion: 'Camiseta clásica de la selección argentina, campeona del mundo. Diseño moderno y elegante.',
        especificaciones: 'Tela DryFit - Tallas S/M/L/XL - Estampado sublimado',
        precioOriginal: 199.90,
        precioOferta: 169.90,
        descuento: 15,
        stock: 35,
        vistas: {
            frente: 'img/camisetas/argentina-frente.jpg',
            espalda: 'img/camisetas/argentina-espalda.jpg'
        }
    },
    {
        id: 3,
        nombre: 'Camiseta Brasil 2024 Visitante',
        categoria: 'camisetas',
        deporte: 'futbol',
        descripcion: 'La clásica alternativa amarilla de Brasil. Diseño tradicional con tecnología moderna.',
        especificaciones: 'Tela DryFit - Tallas S/M/L/XL - Estampado sublimado',
        precioOriginal: 179.90,
        precioOferta: 149.90,
        descuento: 17,
        stock: 42,
        vistas: {
            frente: 'img/camisetas/brasil-frente.jpg',
            espalda: 'img/camisetas/brasil-espalda.jpg'
        }
    },
    {
        id: 4,
        nombre: 'Camiseta Italia 2024 Local',
        categoria: 'camisetas',
        deporte: 'futbol',
        descripcion: 'Camiseta celeste de Italia. Diseño clásico con detalles modernos.',
        especificaciones: 'Tela DryFit - Tallas S/M/L/XL - Estampado sublimado',
        precioOriginal: 179.90,
        precioOferta: 149.90,
        descuento: 17,
        stock: 30,
        vistas: {
            frente: 'img/camisetas/italia-frente.jpg',
            espalda: 'img/camisetas/italia-espalda.jpg'
        }
    },
    {
        id: 5,
        nombre: 'Camiseta Alemania 2024 Local',
        categoria: 'camisetas',
        deporte: 'futbol',
        descripcion: 'La tradicional camiseta blanca alemana. Diseño moderno y transpirable.',
        especificaciones: 'Tela DryFit - Tallas S/M/L/XL - Estampado sublimado',
        precioOriginal: 189.90,
        precioOferta: 159.90,
        descuento: 16,
        stock: 38,
        vistas: {
            frente: 'img/camisetas/alemania-frente.jpg',
            espalda: 'img/camisetas/alemania-espalda.jpg'
        }
    },

    // ============================================
    // CAMISETAS DE BÁSQUET (5 productos)
    // ============================================
    {
        id: 6,
        nombre: 'Jersey Lakers 2024',
        categoria: 'camisetas',
        deporte: 'basquet',
        descripcion: 'Jersey oficial de Los Angeles Lakers. Réplica auténtica del uniforme de juego.',
        especificaciones: 'Tela Mesh - Tallas S/M/L/XL - Estampado transfer',
        precioOriginal: 159.90,
        precioOferta: 129.90,
        descuento: 19,
        stock: 40,
        vistas: {
            frente: 'img/camisetas/lakers-frente.jpg',
            espalda: 'img/camisetas/lakers-espalda.jpg'
        }
    },
    {
        id: 7,
        nombre: 'Jersey Bulls Retro',
        categoria: 'camisetas',
        deporte: 'basquet',
        descripcion: 'Jersey retro de Chicago Bulls, edición limitada de los años 90.',
        especificaciones: 'Tela Mesh - Tallas S/M/L/XL - Estampado transfer',
        precioOriginal: 179.90,
        precioOferta: 149.90,
        descuento: 17,
        stock: 35,
        vistas: {
            frente: 'img/camisetas/bulls-frente.jpg',
            espalda: 'img/camisetas/bulls-espalda.jpg'
        }
    },
    {
        id: 8,
        nombre: 'Jersey Warriors 2024',
        categoria: 'camisetas',
        deporte: 'basquet',
        descripcion: 'Jersey oficial de Golden State Warriors. Diseño moderno.',
        especificaciones: 'Tela Mesh - Tallas S/M/L/XL - Estampado transfer',
        precioOriginal: 169.90,
        precioOferta: 139.90,
        descuento: 18,
        stock: 32,
        vistas: {
            frente: 'img/camisetas/warriors-frente.jpg',
            espalda: 'img/camisetas/warriors-espalda.jpg'
        }
    },
    {
        id: 9,
        nombre: 'Jersey Celtics Clásico',
        categoria: 'camisetas',
        deporte: 'basquet',
        descripcion: 'Jersey clásico de Boston Celtics. Diseño tradicional.',
        especificaciones: 'Tela Mesh - Tallas S/M/L/XL - Estampado transfer',
        precioOriginal: 159.90,
        precioOferta: 129.90,
        descuento: 19,
        stock: 28,
        vistas: {
            frente: 'img/camisetas/celtics-frente.jpg',
            espalda: 'img/camisetas/celtics-espalda.jpg'
        }
    },
    {
        id: 10,
        nombre: 'Jersey Nets City Edition',
        categoria: 'camisetas',
        deporte: 'basquet',
        descripcion: 'Jersey City Edition de Brooklyn Nets. Diseño exclusivo.',
        especificaciones: 'Tela Mesh - Tallas S/M/L/XL - Estampado transfer',
        precioOriginal: 189.90,
        precioOferta: 159.90,
        descuento: 16,
        stock: 25,
        vistas: {
            frente: 'img/camisetas/nets-frente.jpg',
            espalda: 'img/camisetas/nets-espalda.jpg'
        }
    },

    // ============================================
    // CAMISETAS DE VÓLEY (5 productos)
    // ============================================
    {
        id: 11,
        nombre: 'Camiseta Vóley Perú 2024',
        categoria: 'camisetas',
        deporte: 'voley',
        descripcion: 'Camiseta oficial de la selección peruana de vóley. Diseño que resalta la garra femenina.',
        especificaciones: 'Tela DryFit - Tallas S/M/L/XL - Estampado sublimado',
        precioOriginal: 149.90,
        precioOferta: 119.90,
        descuento: 20,
        stock: 55,
        vistas: {
            frente: 'img/camisetas/voley-peru-frente.jpg',
            espalda: 'img/camisetas/voley-peru-espalda.jpg'
        }
    },
    {
        id: 12,
        nombre: 'Camiseta Vóley Brasil 2024',
        categoria: 'camisetas',
        deporte: 'voley',
        descripcion: 'Camiseta oficial de la selección brasileña de vóley. Diseño vibrante.',
        especificaciones: 'Tela DryFit - Tallas S/M/L/XL - Estampado sublimado',
        precioOriginal: 159.90,
        precioOferta: 129.90,
        descuento: 19,
        stock: 45,
        vistas: {
            frente: 'img/camisetas/voley-brasil-frente.jpg',
            espalda: 'img/camisetas/voley-brasil-espalda.jpg'
        }
    },
    {
        id: 13,
        nombre: 'Camiseta Vóley USA 2024',
        categoria: 'camisetas',
        deporte: 'voley',
        descripcion: 'Camiseta oficial de Estados Unidos. Diseño moderno.',
        especificaciones: 'Tela DryFit - Tallas S/M/L/XL - Estampado sublimado',
        precioOriginal: 169.90,
        precioOferta: 139.90,
        descuento: 18,
        stock: 38,
        vistas: {
            frente: 'img/camisetas/voley-usa-frente.jpg',
            espalda: 'img/camisetas/voley-usa-espalda.jpg'
        }
    },
    {
        id: 14,
        nombre: 'Camiseta Vóley Italia 2024',
        categoria: 'camisetas',
        deporte: 'voley',
        descripcion: 'Camiseta oficial de Italia. Diseño elegante.',
        especificaciones: 'Tela DryFit - Tallas S/M/L/XL - Estampado sublimado',
        precioOriginal: 159.90,
        precioOferta: 129.90,
        descuento: 19,
        stock: 42,
        vistas: {
            frente: 'img/camisetas/voley-italia-frente.jpg',
            espalda: 'img/camisetas/voley-italia-espalda.jpg'
        }
    },
    {
        id: 15,
        nombre: 'Camiseta Vóley Polonia 2024',
        categoria: 'camisetas',
        deporte: 'voley',
        descripcion: 'Camiseta oficial de Polonia. Diseño tradicional.',
        especificaciones: 'Tela DryFit - Tallas S/M/L/XL - Estampado sublimado',
        precioOriginal: 149.90,
        precioOferta: 119.90,
        descuento: 20,
        stock: 35,
        vistas: {
            frente: 'img/camisetas/voley-polonia-frente.jpg',
            espalda: 'img/camisetas/voley-polonia-espalda.jpg'
        }
    },

    // ============================================
    // ZAPATILLAS DE FÚTBOL (5 productos)
    // ============================================
    {
        id: 16,
        nombre: 'Adidas Predator Edge',
        categoria: 'zapatillas',
        deporte: 'futbol',
        descripcion: 'Zapatillas de fútbol profesional Adidas Predator. Control absoluto del balón.',
        especificaciones: 'Tallas 38-44 - Tacos mixtos - Tecnología Demonscale',
        precioOriginal: 349.90,
        precioOferta: 299.90,
        descuento: 14,
        stock: 25,
        vistas: {
            frente: 'img/zapatillas/predator-lateral.jpg',
            espalda: 'img/zapatillas/predator-superior.jpg'
        }
    },
    {
        id: 17,
        nombre: 'Nike Mercurial Superfly',
        categoria: 'zapatillas',
        deporte: 'futbol',
        descripcion: 'Zapatillas Nike Mercurial. Velocidad pura en el campo.',
        especificaciones: 'Tallas 38-44 - Tacos cónicos - Tecnología Aerotrack',
        precioOriginal: 329.90,
        precioOferta: 279.90,
        descuento: 15,
        stock: 30,
        vistas: {
            frente: 'img/zapatillas/mercurial-lateral.jpg',
            espalda: 'img/zapatillas/mercurial-superior.jpg'
        }
    },
    {
        id: 18,
        nombre: 'Puma Future Z',
        categoria: 'zapatillas',
        deporte: 'futbol',
        descripcion: 'Zapatillas Puma Future. Innovación y estilo.',
        especificaciones: 'Tallas 38-44 - Tacos mixtos - Sistema FUZIONFIT',
        precioOriginal: 299.90,
        precioOferta: 249.90,
        descuento: 17,
        stock: 28,
        vistas: {
            frente: 'img/zapatillas/puma-future-lateral.jpg',
            espalda: 'img/zapatillas/puma-future-superior.jpg'
        }
    },
    {
        id: 19,
        nombre: 'Nike Phantom GT',
        categoria: 'zapatillas',
        deporte: 'futbol',
        descripcion: 'Zapatillas Nike Phantom. Precisión en cada pase.',
        especificaciones: 'Tallas 38-44 - Tacos mixtos - Zona de precisión',
        precioOriginal: 319.90,
        precioOferta: 269.90,
        descuento: 16,
        stock: 22,
        vistas: {
            frente: 'img/zapatillas/phantom-lateral.jpg',
            espalda: 'img/zapatillas/phantom-superior.jpg'
        }
    },
    {
        id: 20,
        nombre: 'Adidas Copa Sense',
        categoria: 'zapatillas',
        deporte: 'futbol',
        descripcion: 'Zapatillas Adidas Copa. Comodidad y tradición.',
        especificaciones: 'Tallas 38-44 - Tacos mixtos - Cuero de canguro',
        precioOriginal: 289.90,
        precioOferta: 239.90,
        descuento: 17,
        stock: 26,
        vistas: {
            frente: 'img/zapatillas/copa-lateral.jpg',
            espalda: 'img/zapatillas/copa-superior.jpg'
        }
    },

    // ============================================
    // ZAPATILLAS DE BÁSQUET (5 productos)
    // ============================================
    {
        id: 21,
        nombre: 'Air Jordan 1 Mid',
        categoria: 'zapatillas',
        deporte: 'basquet',
        descripcion: 'Las icónicas zapatillas de básquet que revolucionaron el deporte.',
        especificaciones: 'Tallas 38-44 - Cuero - Amortiguación Air',
        precioOriginal: 599.90,
        precioOferta: 499.90,
        descuento: 17,
        stock: 15,
        vistas: {
            frente: 'img/zapatillas/jordan-lateral.jpg',
            espalda: 'img/zapatillas/jordan-superior.jpg'
        }
    },
    {
        id: 22,
        nombre: 'Nike LeBron 20',
        categoria: 'zapatillas',
        deporte: 'basquet',
        descripcion: 'Zapatillas Nike LeBron. Máximo rendimiento.',
        especificaciones: 'Tallas 38-44 - Amortiguación Zoom Air',
        precioOriginal: 649.90,
        precioOferta: 549.90,
        descuento: 15,
        stock: 18,
        vistas: {
            frente: 'img/zapatillas/lebron-lateral.jpg',
            espalda: 'img/zapatillas/lebron-superior.jpg'
        }
    },
    {
        id: 23,
        nombre: 'Adidas Harden Vol 7',
        categoria: 'zapatillas',
        deporte: 'basquet',
        descripcion: 'Zapatillas Adidas Harden. Estilo y rendimiento.',
        especificaciones: 'Tallas 38-44 - Boost technology',
        precioOriginal: 549.90,
        precioOferta: 459.90,
        descuento: 16,
        stock: 20,
        vistas: {
            frente: 'img/zapatillas/harden-lateral.jpg',
            espalda: 'img/zapatillas/harden-superior.jpg'
        }
    },
    {
        id: 24,
        nombre: 'Under Armour Curry 10',
        categoria: 'zapatillas',
        deporte: 'basquet',
        descripcion: 'Zapatillas Curry. Precisión y velocidad.',
        especificaciones: 'Tallas 38-44 - UA Flow technology',
        precioOriginal: 529.90,
        precioOferta: 449.90,
        descuento: 15,
        stock: 17,
        vistas: {
            frente: 'img/zapatillas/curry-lateral.jpg',
            espalda: 'img/zapatillas/curry-superior.jpg'
        }
    },
    {
        id: 25,
        nombre: 'Puma MB.02 LaMelo',
        categoria: 'zapatillas',
        deporte: 'basquet',
        descripcion: 'Zapatillas Puma MB.02. Diseño audaz.',
        especificaciones: 'Tallas 38-44 - Nitro foam',
        precioOriginal: 499.90,
        precioOferta: 419.90,
        descuento: 16,
        stock: 22,
        vistas: {
            frente: 'img/zapatillas/mb02-lateral.jpg',
            espalda: 'img/zapatillas/mb02-superior.jpg'
        }
    },

    // ============================================
    // ZAPATILLAS DE VÓLEY (5 productos)
    // ============================================
    {
        id: 26,
        nombre: 'Mizuno Wave Lightning',
        categoria: 'zapatillas',
        deporte: 'voley',
        descripcion: 'Zapatillas Mizuno especializadas para vóley. Máxima amortiguación.',
        especificaciones: 'Tallas 35-40 - Tecnología Wave - Suela de goma',
        precioOriginal: 279.90,
        precioOferta: 239.90,
        descuento: 14,
        stock: 20,
        vistas: {
            frente: 'img/zapatillas/mizuno-lateral.jpg',
            espalda: 'img/zapatillas/mizuno-superior.jpg'
        }
    },
    {
        id: 27,
        nombre: 'Asics Netburner Ballistic',
        categoria: 'zapatillas',
        deporte: 'voley',
        descripcion: 'Zapatillas Asics para vóley. Estabilidad y confort.',
        especificaciones: 'Tallas 35-40 - Gel technology - Trusstic System',
        precioOriginal: 299.90,
        precioOferta: 259.90,
        descuento: 13,
        stock: 18,
        vistas: {
            frente: 'img/zapatillas/asics-lateral.jpg',
            espalda: 'img/zapatillas/asics-superior.jpg'
        }
    },
    {
        id: 28,
        nombre: 'Adidas Crazyflight',
        categoria: 'zapatillas',
        deporte: 'voley',
        descripcion: 'Zapatillas Adidas para vóley. Ligeras y rápidas.',
        especificaciones: 'Tallas 35-40 - Boost technology - Primeknit',
        precioOriginal: 289.90,
        precioOferta: 249.90,
        descuento: 14,
        stock: 22,
        vistas: {
            frente: 'img/zapatillas/crazyflight-lateral.jpg',
            espalda: 'img/zapatillas/crazyflight-superior.jpg'
        }
    },
    {
        id: 29,
        nombre: 'Nike Hyperace 3',
        categoria: 'zapatillas',
        deporte: 'voley',
        descripcion: 'Zapatillas Nike para vóley. Durabilidad y tracción.',
        especificaciones: 'Tallas 35-40 - Zoom Air - Suela multidireccional',
        precioOriginal: 259.90,
        precioOferta: 219.90,
        descuento: 15,
        stock: 25,
        vistas: {
            frente: 'img/zapatillas/hyperace-lateral.jpg',
            espalda: 'img/zapatillas/hyperace-superior.jpg'
        }
    },
    {
        id: 30,
        nombre: 'Mizuno Wave Momentum',
        categoria: 'zapatillas',
        deporte: 'voley',
        descripcion: 'Zapatillas Mizuno de alta gama para vóley profesional.',
        especificaciones: 'Tallas 35-40 - Wave technology - X10 outsole',
        precioOriginal: 329.90,
        precioOferta: 279.90,
        descuento: 15,
        stock: 15,
        vistas: {
            frente: 'img/zapatillas/momentum-lateral.jpg',
            espalda: 'img/zapatillas/momentum-superior.jpg'
        }
    },

    // ============================================
    // POLOS DE FÚTBOL (5 productos)
    // ============================================
    {
        id: 31,
        nombre: 'Polo Entrenamiento Perú',
        categoria: 'polos',
        deporte: 'futbol',
        descripcion: 'Polo de entrenamiento oficial de la selección peruana.',
        especificaciones: 'Algodón/Poliéster - Tallas S/M/L/XL - Estampado bordado',
        precioOriginal: 89.90,
        precioOferta: 69.90,
        descuento: 22,
        stock: 60,
        vistas: {
            frente: 'img/polos/polo-peru-frente.jpg',
            espalda: 'img/polos/polo-peru-espalda.jpg'
        }
    },
    {
        id: 32,
        nombre: 'Polo Argentina Training',
        categoria: 'polos',
        deporte: 'futbol',
        descripcion: 'Polo de entrenamiento de la selección argentina.',
        especificaciones: 'Algodón/Poliéster - Tallas S/M/L/XL - Estampado bordado',
        precioOriginal: 89.90,
        precioOferta: 69.90,
        descuento: 22,
        stock: 45,
        vistas: {
            frente: 'img/polos/polo-argentina-frente.jpg',
            espalda: 'img/polos/polo-argentina-espalda.jpg'
        }
    },
    {
        id: 33,
        nombre: 'Sudadera Brasil Casual',
        categoria: 'polos',
        deporte: 'futbol',
        descripcion: 'Sudadera casual de Brasil. Perfecto para el día a día.',
        especificaciones: 'Algodón - Tallas S/M/L/XL - Estampado',
        precioOriginal: 79.90,
        precioOferta: 59.90,
        descuento: 25,
        stock: 55,
        vistas: {
            frente: 'img/polos/polo-brasil-frente.jpg',
            espalda: 'img/polos/polo-brasil-espalda.jpg'
        }
    },
    {
        id: 34,
        nombre: 'Polo Uruguay Premium',
        categoria: 'polos',
        deporte: 'futbol',
        descripcion: 'Polo premium de Uruguay. Algodón de alta calidad.',
        especificaciones: 'Algodón Pima - Tallas S/M/L/XL - Bordado',
        precioOriginal: 99.90,
        precioOferta: 79.90,
        descuento: 20,
        stock: 40,
        vistas: {
            frente: 'img/polos/polo-uruguay-frente.jpg',
            espalda: 'img/polos/polo-uruguay-espalda.jpg'
        }
    },
    {
        id: 35,
        nombre: 'Polo Alemania Sport',
        categoria: 'polos',
        deporte: 'futbol',
        descripcion: 'Polo deportivo de Alemania. Ideal para entrenar.',
        especificaciones: 'Poliéster - Tallas S/M/L/XL - Estampado',
        precioOriginal: 84.90,
        precioOferta: 64.90,
        descuento: 24,
        stock: 48,
        vistas: {
            frente: 'img/polos/polo-alemania-frente.jpg',
            espalda: 'img/polos/polo-alemania-espalda.jpg'
        }
    },

    // ============================================
    // POLOS DE BÁSQUET (5 productos)
    // ============================================
    {
        id: 36,
        nombre: 'Polo NBA Lakers',
        categoria: 'polos',
        deporte: 'basquet',
        descripcion: 'Polo oficial de Los Angeles Lakers.',
        especificaciones: 'Algodón - Tallas S/M/L/XL - Bordado',
        precioOriginal: 99.90,
        precioOferta: 79.90,
        descuento: 20,
        stock: 45,
        vistas: {
            frente: 'img/polos/polo-lakers-frente.jpg',
            espalda: 'img/polos/polo-lakers-espalda.jpg'
        }
    },
    {
        id: 37,
        nombre: 'Polo NBA Bulls',
        categoria: 'polos',
        deporte: 'basquet',
        descripcion: 'Polo retro de Chicago Bulls.',
        especificaciones: 'Algodón - Tallas S/M/L/XL - Estampado',
        precioOriginal: 94.90,
        precioOferta: 74.90,
        descuento: 21,
        stock: 42,
        vistas: {
            frente: 'img/polos/polo-bulls-frente.jpg',
            espalda: 'img/polos/polo-bulls-espalda.jpg'
        }
    },
    {
        id: 38,
        nombre: 'Polo NBA Warriors',
        categoria: 'polos',
        deporte: 'basquet',
        descripcion: 'Polo de Golden State Warriors.',
        especificaciones: 'Algodón - Tallas S/M/L/XL - Bordado',
        precioOriginal: 99.90,
        precioOferta: 79.90,
        descuento: 20,
        stock: 38,
        vistas: {
            frente: 'img/polos/polo-warriors-frente.jpg',
            espalda: 'img/polos/polo-warriors-espalda.jpg'
        }
    },
    {
        id: 39,
        nombre: 'Polo NBA Celtics',
        categoria: 'polos',
        deporte: 'basquet',
        descripcion: 'Polo clásico de Boston Celtics.',
        especificaciones: 'Algodón - Tallas S/M/L/XL - Estampado',
        precioOriginal: 94.90,
        precioOferta: 74.90,
        descuento: 21,
        stock: 35,
        vistas: {
            frente: 'img/polos/polo-celtics-frente.jpg',
            espalda: 'img/polos/polo-celtics-espalda.jpg'
        }
    },
    {
        id: 40,
        nombre: 'Polo NBA All Star',
        categoria: 'polos',
        deporte: 'basquet',
        descripcion: 'Polo conmemorativo del Juego de Estrellas.',
        especificaciones: 'Algodón - Tallas S/M/L/XL - Edición limitada',
        precioOriginal: 109.90,
        precioOferta: 89.90,
        descuento: 18,
        stock: 30,
        vistas: {
            frente: 'img/polos/polo-nba-allstar-frente.jpg',
            espalda: 'img/polos/polo-nba-allstar-espalda.jpg'
        }
    },

    // ============================================
    // POLOS DE VÓLEY (5 productos)
    // ============================================
    {
        id: 41,
        nombre: 'Polo Vóley Perú Training',
        categoria: 'polos',
        deporte: 'voley',
        descripcion: 'Polo de entrenamiento de la selección peruana de vóley.',
        especificaciones: 'Poliéster - Tallas S/M/L/XL - Estampado',
        precioOriginal: 79.90,
        precioOferta: 59.90,
        descuento: 25,
        stock: 70,
        vistas: {
            frente: 'img/polos/polo-voley-peru-frente.jpg',
            espalda: 'img/polos/polo-voley-peru-espalda.jpg'
        }
    },
    {
        id: 42,
        nombre: 'Polo Vóley Brasil',
        categoria: 'polos',
        deporte: 'voley',
        descripcion: 'Polo de Brasil para vóley playa.',
        especificaciones: 'Poliéster - Tallas S/M/L/XL - Estampado',
        precioOriginal: 84.90,
        precioOferta: 64.90,
        descuento: 24,
        stock: 55,
        vistas: {
            frente: 'img/polos/polo-voley-brasil-frente.jpg',
            espalda: 'img/polos/polo-voley-brasil-espalda.jpg'
        }
    },
    {
        id: 43,
        nombre: 'Polo Vóley USA',
        categoria: 'polos',
        deporte: 'voley',
        descripcion: 'Polo deportivo de Estados Unidos para vóley.',
        especificaciones: 'Poliéster - Tallas S/M/L/XL - Estampado',
        precioOriginal: 89.90,
        precioOferta: 69.90,
        descuento: 22,
        stock: 48,
        vistas: {
            frente: 'img/polos/polo-voley-usa-frente.jpg',
            espalda: 'img/polos/polo-voley-usa-espalda.jpg'
        }
    },
    {
        id: 44,
        nombre: 'Polo Vóley Italia',
        categoria: 'polos',
        deporte: 'voley',
        descripcion: 'Polo elegante de Italia para vóley.',
        especificaciones: 'Algodón/Poliéster - Tallas S/M/L/XL - Bordado',
        precioOriginal: 94.90,
        precioOferta: 74.90,
        descuento: 21,
        stock: 42,
        vistas: {
            frente: 'img/polos/polo-voley-italia-frente.jpg',
            espalda: 'img/polos/polo-voley-italia-espalda.jpg'
        }
    },
    {
        id: 45,
        nombre: 'Polo Vóley Polonia',
        categoria: 'polos',
        deporte: 'voley',
        descripcion: 'Polo de Polonia para vóley.',
        especificaciones: 'Poliéster - Tallas S/M/L/XL - Estampado',
        precioOriginal: 84.90,
        precioOferta: 64.90,
        descuento: 24,
        stock: 46,
        vistas: {
            frente: 'img/polos/polo-voley-polonia-frente.jpg',
            espalda: 'img/polos/polo-voley-polonia-espalda.jpg'
        }
    }
];

// VARIABLES GLOBALES
let carrito = [];
let productosFiltrados = [...productos];

// ELEMENTOS DEL DOM
const productosContainer = document.getElementById('productos-container');
const cartItems = document.getElementById('cart-items');
const cartCount = document.getElementById('cart-count');
const cartTotal = document.getElementById('cart-total');
const cartSidebar = document.getElementById('cart-sidebar');
const modal = document.getElementById('product-modal');
const categoriaTitulo = document.getElementById('categoria-titulo');

// ============================================
// FUNCIONES DE INFORMACIÓN DE LA EMPRESA
// ============================================
function mostrarInfo(seccion) {
    document.querySelectorAll('.info-section').forEach(s => s.style.display = 'none');
    
    const seccionMostrar = document.getElementById(seccion);
    if (seccionMostrar) {
        seccionMostrar.style.display = 'block';
        categoriaTitulo.innerHTML = `<h2>${seccion.charAt(0).toUpperCase() + seccion.slice(1).replace('-', ' ')}</h2>`;
        productosContainer.innerHTML = '';
        
        // Scroll suave a la sección
        seccionMostrar.scrollIntoView({ behavior: 'smooth' });
    }
}

// ============================================
// FUNCIONES DE FILTRADO
// ============================================
function filtrarProductos(categoria, deporte) {
    document.querySelectorAll('.info-section').forEach(s => s.style.display = 'none');
    
    productosFiltrados = productos.filter(p => 
        p.categoria === categoria && p.deporte === deporte
    );
    
    let titulo = '';
    if (categoria === 'camisetas') titulo = 'CAMISETAS';
    else if (categoria === 'zapatillas') titulo = 'ZAPATILLAS';
    else if (categoria === 'polos') titulo = 'POLOS';
    
    let deporteTitulo = '';
    if (deporte === 'futbol') deporteTitulo = 'FÚTBOL';
    else if (deporte === 'basquet') deporteTitulo = 'BÁSQUET';
    else if (deporte === 'voley') deporteTitulo = 'VÓLEY';
    
    categoriaTitulo.innerHTML = `<h2>${titulo} DE ${deporteTitulo} (${productosFiltrados.length} productos)</h2>`;
    mostrarProductos(productosFiltrados);
    
    if (productosFiltrados.length === 0) {
        productosContainer.innerHTML = '<div class="no-productos"><i class="fas fa-box-open"></i><p>No hay productos disponibles</p></div>';
    }
}

function mostrarTodos() {
    document.querySelectorAll('.info-section').forEach(s => s.style.display = 'none');
    productosFiltrados = [...productos];
    categoriaTitulo.innerHTML = `<h2>TODOS LOS PRODUCTOS (${productos.length} productos)</h2>`;
    mostrarProductos(productos);
}

// ============================================
// FUNCIÓN PARA MOSTRAR PRODUCTOS
// ============================================
function mostrarProductos(productosAMostrar) {
    productosContainer.innerHTML = '';
    
    productosAMostrar.forEach(producto => {
        const card = document.createElement('div');
        card.className = 'producto-card';
        card.onclick = () => verDetalle(producto.id);
        
        card.innerHTML = `
            <div class="producto-imagen">
                <div class="vista-1" style="background-image: url('${producto.vistas.frente}')"></div>
                <div class="vista-2" style="background-image: url('${producto.vistas.espalda}')"></div>
                <span class="descuento-badge">-${producto.descuento}%</span>
            </div>
            <div class="producto-info">
                <h3 class="producto-nombre">${producto.nombre}</h3>
                <p class="producto-categoria">
                    <i class="fas fa-tag"></i> ${producto.categoria} - ${producto.deporte}
                </p>
                <div class="producto-precios">
                    <span class="precio-original">S/ ${producto.precioOriginal.toFixed(2)}</span>
                    <span class="precio-oferta">S/ ${producto.precioOferta.toFixed(2)}</span>
                </div>
                <button class="btn-agregar" onclick="event.stopPropagation(); agregarAlCarrito(${producto.id})">
                    <i class="fas fa-cart-plus"></i> AGREGAR AL CARRITO
                </button>
            </div>
        `;
        
        productosContainer.appendChild(card);
    });
}

// ============================================
// FUNCIONES DEL MODAL
// ============================================
function verDetalle(id) {
    const producto = productos.find(p => p.id === id);
    const modalBody = document.getElementById('modal-body');
    
    modalBody.innerHTML = `
        <div class="modal-imagenes">
            <img src="${producto.vistas.frente}" alt="${producto.nombre}" class="modal-imagen">
            <img src="${producto.vistas.espalda}" alt="${producto.nombre}" class="modal-imagen">
        </div>
        <div class="modal-info">
            <h2>${producto.nombre}</h2>
            <p><i class="fas fa-tag"></i> <strong>Categoría:</strong> ${producto.categoria} - ${producto.deporte}</p>
            <p>${producto.descripcion}</p>
            <p><i class="fas fa-tshirt"></i> <strong>Especificaciones:</strong> ${producto.especificaciones}</p>
            <p><i class="fas fa-box"></i> <strong>Stock:</strong> ${producto.stock} unidades</p>
            <div class="modal-precios">
                <span class="modal-precio-original">S/ ${producto.precioOriginal.toFixed(2)}</span>
                <span class="modal-precio-oferta">S/ ${producto.precioOferta.toFixed(2)}</span>
            </div>
            <p><i class="fas fa-gift"></i> <strong>Ahorras:</strong> S/ ${(producto.precioOriginal - producto.precioOferta).toFixed(2)} (${producto.descuento}%)</p>
            <button class="btn-agregar" onclick="agregarAlCarrito(${producto.id}); cerrarModal();">
                <i class="fas fa-cart-plus"></i> AGREGAR AL CARRITO
            </button>
        </div>
    `;
    
    modal.style.display = 'block';
    document.body.style.overflow = 'hidden';
}

function cerrarModal() {
    modal.style.display = 'none';
    document.body.style.overflow = 'auto';
}

// ============================================
// FUNCIONES DEL CARRITO
// ============================================
function agregarAlCarrito(id) {
    const producto = productos.find(p => p.id === id);
    const itemExistente = carrito.find(item => item.id === id);
    
    if (itemExistente) {
        if (itemExistente.cantidad < producto.stock) {
            itemExistente.cantidad++;
            mostrarNotificacion(`+1 ${producto.nombre} - Total: ${itemExistente.cantidad}`);
        } else {
            mostrarNotificacion('Stock máximo alcanzado', 'error');
            return;
        }
    } else {
        carrito.push({
            id: producto.id,
            nombre: producto.nombre,
            precio: producto.precioOferta,
            imagen: producto.vistas.frente,
            cantidad: 1,
            stock: producto.stock
        });
        mostrarNotificacion(`✓ ${producto.nombre} agregado al carrito`);
    }
    
    actualizarCarrito();
}

function eliminarDelCarrito(id) {
    const producto = carrito.find(item => item.id === id);
    carrito = carrito.filter(item => item.id !== id);
    actualizarCarrito();
    mostrarNotificacion(`✗ ${producto.nombre} eliminado del carrito`);
}

function actualizarCantidad(id, nuevaCantidad) {
    const item = carrito.find(item => item.id === id);
    if (item) {
        if (nuevaCantidad <= 0) {
            eliminarDelCarrito(id);
        } else if (nuevaCantidad <= item.stock) {
            item.cantidad = nuevaCantidad;
            actualizarCarrito();
        } else {
            mostrarNotificacion('Stock máximo alcanzado', 'error');
        }
    }
}

function actualizarCarrito() {
    const totalItems = carrito.reduce((sum, item) => sum + item.cantidad, 0);
    cartCount.textContent = totalItems;
    
    cartItems.innerHTML = '';
    let total = 0;
    
    carrito.forEach(item => {
        total += item.precio * item.cantidad;
        
        const itemHTML = `
            <div class="cart-item">
                <img src="${item.imagen}" alt="${item.nombre}" class="cart-item-img">
                <div class="cart-item-info">
                    <h4>${item.nombre}</h4>
                    <p class="cart-item-precio">S/ ${item.precio.toFixed(2)}</p>
                    <div class="cantidad-control">
                        <button class="cantidad-btn" onclick="actualizarCantidad(${item.id}, ${item.cantidad - 1})">-</button>
                        <span>${item.cantidad}</span>
                        <button class="cantidad-btn" onclick="actualizarCantidad(${item.id}, ${item.cantidad + 1})">+</button>
                    </div>
                </div>
                <div class="btn-eliminar" onclick="eliminarDelCarrito(${item.id})">
                    <i class="fas fa-times"></i>
                </div>
            </div>
        `;
        
        cartItems.innerHTML += itemHTML;
    });
    
    cartTotal.textContent = `S/ ${total.toFixed(2)}`;
}

function toggleCart() {
    cartSidebar.classList.toggle('active');
}

function procesarCompra() {
    if (carrito.length === 0) {
        mostrarNotificacion('El carrito está vacío', 'error');
        return;
    }
    
    const total = carrito.reduce((sum, item) => sum + (item.precio * item.cantidad), 0);
    const totalItems = carrito.reduce((sum, item) => sum + item.cantidad, 0);
    
    mostrarNotificacion(`¡Compra realizada! ${totalItems} productos - Total: S/ ${total.toFixed(2)}`);
    
    carrito = [];
    actualizarCarrito();
    toggleCart();
}

// ============================================
// FUNCIÓN DE NOTIFICACIÓN
// ============================================
function mostrarNotificacion(mensaje, tipo = 'success') {
    const notificacion = document.createElement('div');
    notificacion.className = 'notificacion';
    notificacion.textContent = mensaje;
    
    if (tipo === 'error') {
        notificacion.style.background = 'linear-gradient(135deg, #dc3545, #c82333)';
    }
    
    document.body.appendChild(notificacion);
    
    setTimeout(() => {
        notificacion.style.animation = 'slideOutRight 0.3s';
        setTimeout(() => {
            notificacion.remove();
        }, 300);
    }, 3000);
}

// ============================================
// FUNCIÓN DE BÚSQUEDA
// ============================================
document.querySelector('.search-box i').addEventListener('click', function() {
    const termino = document.querySelector('.search-box input').value.toLowerCase().trim();
    
    if (termino === '') {
        mostrarTodos();
        return;
    }
    
    const resultados = productos.filter(p => 
        p.nombre.toLowerCase().includes(termino) || 
        p.descripcion.toLowerCase().includes(termino) ||
        p.categoria.includes(termino) ||
        p.deporte.includes(termino)
    );
    
    productosFiltrados = resultados;
    categoriaTitulo.innerHTML = `<h2>RESULTADOS: "${termino}" (${resultados.length} productos)</h2>`;
    mostrarProductos(resultados);
    
    if (resultados.length === 0) {
        productosContainer.innerHTML = '<div class="no-productos"><i class="fas fa-search"></i><p>No se encontraron productos</p></div>';
    }
});

document.querySelector('.search-box input').addEventListener('keypress', function(e) {
    if (e.key === 'Enter') {
        document.querySelector('.search-box i').click();
    }
});

// ============================================
// EVENTOS Y INICIALIZACIÓN
// ============================================
window.onclick = function(event) {
    if (event.target === modal) {
        cerrarModal();
    }
}

document.addEventListener('click', function(e) {
    if (!cartSidebar.contains(e.target) && !e.target.closest('.cart-icon') && cartSidebar.classList.contains('active')) {
        toggleCart();
    }
});

// Inicializar mostrando todos los productos
mostrarTodos();