window.Humanitaria = window.Humanitaria || {};
window.Humanitaria.Config = {
  spreadsheetId: '1fnXiSy1TbPqwlLKDSfPoBfKs8pH0WptoECGq_zu_Lco',
  appsScriptUrl: 'https://script.google.com/macros/d/YOUR_NEW_DEPLOYMENT_ID/useFunctionality=AIzaSy...',
  buscarWebhookUrl: '',
  buscarWebhookToken: '',
  sandboxPattern: /YOUR_SCRIPT_ID|YOUR_NEW_DEPLOYMENT_ID|useFunctionality=AIzaSy/,
  cacheKeys: {
    dashboard: 'vh_dashboard_cache',
    centros: 'vh_centros_cache',
    motorizados: 'vh_motorizados_cache',
    voluntarios: 'vh_voluntarios_cache',
    rescatistas: 'vh_rescatistas_cache',
    personas: 'vh_personas_cache'
  },
  whatsappMessage: 'Hola, vi en Respuesta Humanitaria Venezuela que necesitan ayuda. ¿Cómo puedo contribuir?',
  lineasApoyo: 'Línea de apoyo psicológico: 0800-AYUDA (ejemplo; sustituir por la línea oficial vigente).',
  fallbackData: {
  "centros": [
    {
      "tipo": "Centro",
      "nombre": "Iglesia San José",
      "ubicacion": "Los Corales, La Guaira",
      "telefono": "+58 412 555 1234",
      "necesita": [
        {
          "nombre": "Gasas estériles",
          "categoria": "Medicinas",
          "cantidadNecesaria": 80,
          "cantidadRecibida": 18,
          "porcentaje": 23,
          "urgencia": "Crítico",
          "unidad": "paquetes",
          "yaCubierto": false,
          "coincidencias": [
            {
              "nombre_lugar": "Hospital El Algodonal",
              "tipo": "Hospital",
              "telefono": "+58 212 555 5000",
              "ubicacion": "El Algodonal, Caracas"
            }
          ]
        },
        {
          "nombre": "Agua embotellada",
          "categoria": "Bebidas",
          "cantidadNecesaria": 100,
          "cantidadRecibida": 12,
          "porcentaje": 12,
          "urgencia": "Crítico",
          "unidad": "cajas",
          "yaCubierto": false,
          "coincidencias": [
            {
              "nombre_lugar": "Refugio Naiguatá",
              "tipo": "Centro",
              "telefono": "+58 414 555 2200",
              "ubicacion": "Naiguatá, Vargas"
            }
          ]
        },
        {
          "nombre": "Leche en polvo",
          "categoria": "Alimentos",
          "cantidadNecesaria": 50,
          "cantidadRecibida": 22,
          "porcentaje": 44,
          "urgencia": "Moderado",
          "unidad": "latas",
          "yaCubierto": false,
          "coincidencias": []
        }
      ],
      "cubiertos": [
        {
          "nombre": "Mantas",
          "categoria": "Otros",
          "cantidadNecesaria": 60,
          "cantidadRecibida": 60,
          "unidad": "unidades",
          "yaCubierto": true
        }
      ],
      "tiene_disponible": [
        {
          "nombre": "Ropa de adulto",
          "categoria": "Ropa"
        },
        {
          "nombre": "Mantas",
          "categoria": "Otros"
        }
      ],
      "actualizado": "2026-06-28T12:00:00.000Z"
    },
    {
      "tipo": "Centro",
      "nombre": "Refugio Naiguatá",
      "ubicacion": "Naiguatá, Vargas",
      "telefono": "+58 414 555 2200",
      "necesita": [
        {
          "nombre": "Colchonetas",
          "categoria": "Otros",
          "cantidadNecesaria": 70,
          "cantidadRecibida": 31,
          "porcentaje": 44,
          "urgencia": "Moderado",
          "unidad": "unidades",
          "yaCubierto": false,
          "coincidencias": []
        },
        {
          "nombre": "Pañales",
          "categoria": "Higiene",
          "cantidadNecesaria": 120,
          "cantidadRecibida": 74,
          "porcentaje": 62,
          "urgencia": "Normal",
          "unidad": "paquetes",
          "yaCubierto": false,
          "coincidencias": [
            {
              "nombre_lugar": "Comunidad El Hatillo",
              "tipo": "Centro",
              "telefono": "+58 416 555 7788",
              "ubicacion": "El Hatillo, Caracas"
            }
          ]
        }
      ],
      "cubiertos": [
        {
          "nombre": "Agua embotellada",
          "categoria": "Bebidas",
          "cantidadNecesaria": 45,
          "cantidadRecibida": 45,
          "unidad": "cajas",
          "yaCubierto": true
        }
      ],
      "tiene_disponible": [
        {
          "nombre": "Agua embotellada",
          "categoria": "Bebidas"
        }
      ],
      "actualizado": "2026-06-28T13:30:00.000Z"
    },
    {
      "tipo": "Centro",
      "nombre": "Comunidad El Hatillo",
      "ubicacion": "El Hatillo, Caracas",
      "telefono": "+58 416 555 7788",
      "necesita": [
        {
          "nombre": "Arroz",
          "categoria": "Alimentos",
          "cantidadNecesaria": 90,
          "cantidadRecibida": 48,
          "porcentaje": 53,
          "urgencia": "Moderado",
          "unidad": "kg",
          "yaCubierto": false,
          "coincidencias": []
        },
        {
          "nombre": "Jabón",
          "categoria": "Higiene",
          "cantidadNecesaria": 75,
          "cantidadRecibida": 18,
          "porcentaje": 24,
          "urgencia": "Crítico",
          "unidad": "unidades",
          "yaCubierto": false,
          "coincidencias": []
        }
      ],
      "tiene_disponible": [
        {
          "nombre": "Pañales",
          "categoria": "Higiene"
        },
        {
          "nombre": "Calzado",
          "categoria": "Ropa"
        }
      ],
      "actualizado": "2026-06-28T09:15:00.000Z"
    },
    {
      "tipo": "Hospital",
      "nombre": "Hospital El Algodonal",
      "ubicacion": "El Algodonal, Caracas",
      "telefono": "+58 212 555 5000",
      "necesita": [
        {
          "nombre": "Analgésicos",
          "categoria": "Medicinas",
          "cantidadNecesaria": 200,
          "cantidadRecibida": 86,
          "porcentaje": 43,
          "urgencia": "Moderado",
          "unidad": "unidades",
          "yaCubierto": false,
          "coincidencias": []
        },
        {
          "nombre": "Oxímetros",
          "categoria": "Equipos médicos",
          "cantidadNecesaria": 25,
          "cantidadRecibida": 5,
          "porcentaje": 20,
          "urgencia": "Crítico",
          "unidad": "unidades",
          "yaCubierto": false,
          "coincidencias": []
        }
      ],
      "cubiertos": [
        {
          "nombre": "Gasas estériles",
          "categoria": "Suministros quirúrgicos",
          "cantidadNecesaria": 100,
          "cantidadRecibida": 100,
          "unidad": "paquetes",
          "yaCubierto": true
        }
      ],
      "tiene_disponible": [
        {
          "nombre": "Gasas estériles",
          "categoria": "Suministros quirúrgicos"
        }
      ],
      "actualizado": "2026-06-28T14:00:00.000Z"
    },
    {
      "tipo": "Hospital",
      "nombre": "Hospital Vargas de Caracas",
      "ubicacion": "San José, Caracas",
      "telefono": "+58 212 555 6100 (Donaciones)",
      "necesita": [
        {
          "nombre": "Sueros fisiológicos",
          "categoria": "Fluidos IV",
          "cantidadNecesaria": 160,
          "cantidadRecibida": 37,
          "porcentaje": 23,
          "urgencia": "Crítico",
          "unidad": "bolsas",
          "yaCubierto": false,
          "coincidencias": []
        },
        {
          "nombre": "Guantes",
          "categoria": "Suministros quirúrgicos",
          "cantidadNecesaria": 300,
          "cantidadRecibida": 185,
          "porcentaje": 62,
          "urgencia": "Normal",
          "unidad": "pares",
          "yaCubierto": false,
          "coincidencias": []
        }
      ],
      "tiene_disponible": [],
      "actualizado": "2026-06-28T11:45:00.000Z"
    }
  ],
  "motorizados": [
    {
      "id": "MOTO001",
      "nombre": "Carlos Rodríguez",
      "tipoVehiculo": "Moto",
      "telefono": "+58 412 111 2222",
      "operaEn": "La Guaira - Caracas",
      "zonaOperacion": "La Guaira - Caracas",
      "placa": "MBK-401",
      "estado": "Activo",
      "fechaRegistro": "2026-06-23T10:00:00.000Z",
      "totalTrayectos": 22,
      "totalKm": 487,
      "aporteDonado": 5000,
      "verificado": true,
      "ultimoTrayecto": "2026-06-29T22:00:00.000Z"
    },
    {
      "id": "MOTO002",
      "nombre": "María González",
      "tipoVehiculo": "Carro",
      "telefono": "+58 414 333 4444",
      "operaEn": "Caracas Este",
      "zonaOperacion": "Caracas Este",
      "placa": "GAB-852",
      "estado": "Activo",
      "fechaRegistro": "2026-06-26T14:30:00.000Z",
      "totalTrayectos": 9,
      "totalKm": 201,
      "aporteDonado": 2400,
      "verificado": true,
      "ultimoTrayecto": "2026-06-28T18:20:00.000Z"
    },
    {
      "id": "MOTO003",
      "nombre": "Luis Herrera",
      "tipoVehiculo": "Motocarro",
      "telefono": "+58 424 777 1188",
      "operaEn": "Catia - La Pastora",
      "zonaOperacion": "Catia - La Pastora",
      "placa": "LAR-219",
      "estado": "Activo",
      "fechaRegistro": "2026-06-25T09:15:00.000Z",
      "totalTrayectos": 15,
      "totalKm": 264,
      "aporteDonado": 3200,
      "verificado": true,
      "ultimoTrayecto": "2026-06-29T16:10:00.000Z"
    }
  ],
  "voluntarios": [
    {
      "id": "VOL001",
      "nombre": "Andrea",
      "apellido": "Suárez",
      "telefono": "+58 412 222 3300",
      "estado": "La Guaira",
      "ciudad": "Maiquetía",
      "profesion": "Enfermera",
      "disponibilidad": "Disponible ahora",
      "tipo": "Enfermero",
      "observaciones": "Apoyo en triaje y curas básicas",
      "fechaRegistro": "2026-06-29T09:10:00.000Z",
      "actualizado": "2026-06-29T09:10:00.000Z"
    },
    {
      "id": "VOL002",
      "nombre": "Miguel",
      "apellido": "Ramos",
      "telefono": "+58 414 505 7788",
      "estado": "Distrito Capital",
      "ciudad": "Caracas",
      "profesion": "Ingeniero eléctrico",
      "disponibilidad": "Disponible hoy",
      "tipo": "Electricista",
      "observaciones": "Revisión de plantas eléctricas y cableado temporal",
      "fechaRegistro": "2026-06-29T11:25:00.000Z",
      "actualizado": "2026-06-29T11:25:00.000Z"
    },
    {
      "id": "VOL003",
      "nombre": "Paola",
      "apellido": "Martínez",
      "telefono": "+58 424 881 2200",
      "estado": "Miranda",
      "ciudad": "Guarenas",
      "profesion": "Psicóloga",
      "disponibilidad": "Remoto",
      "tipo": "Psicólogo",
      "observaciones": "Primeros auxilios psicológicos por llamada",
      "fechaRegistro": "2026-06-29T15:45:00.000Z",
      "actualizado": "2026-06-29T15:45:00.000Z"
    }
  ],
  "rescatistas": [
    {
      "id": "RES001",
      "nombre": "Equipo Rescate Vargas",
      "organizacion": "Protección Civil",
      "telefono": "+58 212 700 1200",
      "especialidad": "Búsqueda y rescate urbano",
      "estado": "La Guaira",
      "ciudad": "Macuto",
      "disponibilidad": "Disponible ahora",
      "observaciones": "Equipo con herramientas livianas",
      "fechaRegistro": "2026-06-29T07:35:00.000Z",
      "actualizado": "2026-06-29T07:35:00.000Z"
    },
    {
      "id": "RES002",
      "nombre": "Unidad Paramédica Chacao",
      "organizacion": "Voluntarios Chacao",
      "telefono": "+58 212 555 0190",
      "especialidad": "Paramédico",
      "estado": "Miranda",
      "ciudad": "Chacao",
      "disponibilidad": "En guardia",
      "observaciones": "Ambulancia con cupo limitado",
      "fechaRegistro": "2026-06-29T12:20:00.000Z",
      "actualizado": "2026-06-29T12:20:00.000Z"
    }
  ],
  "personas": [
    {
      "nombre": "María Pérez González",
      "cedula": "V-12.345.678",
      "estado": "Localizado con vida",
      "ubicacion": "Refugio Naiguatá, Vargas",
      "fuente": "Lista Cruz Roja",
      "actualizado": "2026-06-28T10:00:00.000Z"
    },
    {
      "nombre": "José Rafael Mendoza",
      "cedula": "V-9.876.543",
      "estado": "En refugio",
      "ubicacion": "Refugio Maiquetía, La Guaira",
      "fuente": "Protección Civil",
      "actualizado": "2026-06-28T11:30:00.000Z"
    },
    {
      "nombre": "Ana Lucía Rodríguez",
      "cedula": "V-18.222.111",
      "estado": "Hospitalizado",
      "ubicacion": "Hospital Vargas de Caracas",
      "fuente": "Registro hospitalario",
      "actualizado": "2026-06-28T08:45:00.000Z"
    },
    {
      "nombre": "Carlos Eduardo Blanco",
      "cedula": "V-14.555.099",
      "estado": "Localizado con vida",
      "ubicacion": "Caraballeda, Vargas",
      "fuente": "Reporte familiar",
      "actualizado": "2026-06-27T19:20:00.000Z"
    },
    {
      "nombre": "Rosa Elena Marcano",
      "cedula": "V-7.111.234",
      "estado": "Sin información reciente",
      "ubicacion": "Última vez: Los Corales, La Guaira",
      "fuente": "Lista comunitaria",
      "actualizado": "2026-06-26T22:00:00.000Z"
    },
    {
      "nombre": "Pedro Antonio Silva",
      "cedula": "V-20.333.876",
      "estado": "En refugio",
      "ubicacion": "Refugio El Hatillo, Caracas",
      "fuente": "Cruz Roja",
      "actualizado": "2026-06-28T12:10:00.000Z"
    },
    {
      "nombre": "Gustavo Adolfo Rincón",
      "cedula": "V-5.123.456",
      "estado": "Fallecido",
      "ubicacion": "La Guaira",
      "fuente": "Registro oficial",
      "actualizado": "2026-06-27T15:00:00.000Z"
    }
  ],
  "urgentes": [
    {
      "categoria": "Agua potable",
      "prioridad": "Alta",
      "cantidadRequerida": 145,
      "unidad": "cajas",
      "cubierto": 38
    },
    {
      "categoria": "Medicamentos",
      "prioridad": "Alta",
      "cantidadRequerida": 420,
      "unidad": "unidades",
      "cubierto": 126
    },
    {
      "categoria": "Insumos médicos",
      "prioridad": "Alta",
      "cantidadRequerida": 280,
      "unidad": "kits",
      "cubierto": 84
    },
    {
      "categoria": "Alimentos",
      "prioridad": "Media",
      "cantidadRequerida": 610,
      "unidad": "raciones",
      "cubierto": 244
    },
    {
      "categoria": "Plantas eléctricas",
      "prioridad": "Media",
      "cantidadRequerida": 18,
      "unidad": "equipos",
      "cubierto": 4
    },
    {
      "categoria": "Combustible",
      "prioridad": "Alta",
      "cantidadRequerida": 900,
      "unidad": "litros",
      "cubierto": 210
    }
  ]
}
};
