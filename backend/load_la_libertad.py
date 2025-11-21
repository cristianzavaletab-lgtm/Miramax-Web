"""
Script para cargar datos geográficos de La Libertad
Incluye: Departamento, Provincias, Distritos y Caseríos principales
"""

import os
import sys
import django

# Configurar Django
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from core.models import Department, Province, District, Caserio

def load_la_libertad_data():
    print("🌍 Cargando datos geográficos de La Libertad...")
    
    # 1. Crear Departamento
    dept, created = Department.objects.get_or_create(name="La Libertad")
    if created:
        print(f"✅ Departamento creado: {dept.name}")
    else:
        print(f"ℹ️  Departamento ya existe: {dept.name}")
    
    # 2. Provincias y sus Distritos
    provincias_data = {
        "Trujillo": {
            "distritos": {
                "Trujillo": ["El Porvenir", "La Esperanza", "Victor Larco", "Huanchaco", "Moche", "Salaverry"],
                "El Porvenir": ["Alto Trujillo", "El Milagro", "Santa María"],
                "La Esperanza": ["Alto La Esperanza", "Wichanzao", "Santa Lucía"],
                "Florencia de Mora": ["Florencia de Mora Centro", "Las Flores"],
                "Huanchaco": ["Buenos Aires", "El Milagro", "Villa del Mar"],
                "Laredo": ["Barraza", "Galindo", "Santa Rosa"],
                "Moche": ["Moche Centro", "Las Delicias"],
                "Poroto": ["Poroto Centro"],
                "Salaverry": ["Salaverry Puerto", "Buenos Aires"],
                "Simbal": ["Simbal Centro"],
                "Victor Larco Herrera": ["Buenos Aires Norte", "Buenos Aires Sur"]
            }
        },
        "Ascope": {
            "distritos": {
                "Ascope": ["Ascope Centro"],
                "Chicama": ["Chicama Centro", "Cartavio"],
                "Chocope": ["Chocope Centro"],
                "Magdalena de Cao": ["Magdalena Centro"],
                "Paijan": ["Paijan Centro", "Cerro Prieto"],
                "Rázuri": ["Puerto Malabrigo"],
                "Santiago de Cao": ["Santiago Centro"],
                "Casa Grande": ["Casa Grande Centro"]
            }
        },
        "Bolívar": {
            "distritos": {
                "Bolívar": ["Bolívar Centro"],
                "Bambamarca": ["Bambamarca Centro"],
                "Condormarca": ["Condormarca Centro"],
                "Longotea": ["Longotea Centro"],
                "Uchumarca": ["Uchumarca Centro"],
                "Ucuncha": ["Ucuncha Centro"]
            }
        },
        "Chepén": {
            "distritos": {
                "Chepén": ["Chepén Centro", "San José"],
                "Pacanga": ["Pacanga Centro"],
                "Pueblo Nuevo": ["Pueblo Nuevo Centro"]
            }
        },
        "Julcán": {
            "distritos": {
                "Julcán": ["Julcán Centro"],
                "Calamarca": ["Calamarca Centro"],
                "Carabamba": ["Carabamba Centro"],
                "Huaso": ["Huaso Centro"]
            }
        },
        "Otuzco": {
            "distritos": {
                "Otuzco": ["Otuzco Centro"],
                "Agallpampa": ["Agallpampa Centro"],
                "Charat": ["Charat Centro"],
                "Huaranchal": ["Huaranchal Centro"],
                "La Cuesta": ["La Cuesta Centro"],
                "Mache": ["Mache Centro"],
                "Paranday": ["Paranday Centro"],
                "Salpo": ["Salpo Centro"],
                "Sinsicap": ["Sinsicap Centro"],
                "Usquil": ["Usquil Centro"]
            }
        },
        "Pacasmayo": {
            "distritos": {
                "San Pedro de Lloc": ["San Pedro Centro"],
                "Guadalupe": ["Guadalupe Centro", "Limoncarro"],
                "Jequetepeque": ["Jequetepeque Centro"],
                "Pacasmayo": ["Pacasmayo Centro"],
                "San José": ["San José Centro"]
            }
        },
        "Pataz": {
            "distritos": {
                "Tayabamba": ["Tayabamba Centro"],
                "Buldibuyo": ["Buldibuyo Centro"],
                "Chillia": ["Chillia Centro"],
                "Huancaspata": ["Huancaspata Centro"],
                "Huaylillas": ["Huaylillas Centro"],
                "Huayo": ["Huayo Centro"],
                "Ongon": ["Ongon Centro"],
                "Parcoy": ["Parcoy Centro"],
                "Pataz": ["Pataz Centro"],
                "Pias": ["Pias Centro"],
                "Santiago de Challas": ["Santiago Centro"],
                "Taurija": ["Taurija Centro"],
                "Urpay": ["Urpay Centro"]
            }
        },
        "Sánchez Carrión": {
            "distritos": {
                "Huamachuco": ["Huamachuco Centro"],
                "Chugay": ["Chugay Centro"],
                "Cochorco": ["Cochorco Centro"],
                "Curgos": ["Curgos Centro"],
                "Marcabal": ["Marcabal Centro"],
                "Sanagoran": ["Sanagoran Centro"],
                "Sarin": ["Sarin Centro"],
                "Sartimbamba": ["Sartimbamba Centro"]
            }
        },
        "Santiago de Chuco": {
            "distritos": {
                "Santiago de Chuco": ["Santiago Centro"],
                "Angasmarca": ["Angasmarca Centro"],
                "Cachicadan": ["Cachicadan Centro"],
                "Mollebamba": ["Mollebamba Centro"],
                "Mollepata": ["Mollepata Centro"],
                "Quiruvilca": ["Quiruvilca Centro"],
                "Santa Cruz de Chuca": ["Santa Cruz Centro"],
                "Sitabamba": ["Sitabamba Centro"]
            }
        },
        "Gran Chimú": {
            "distritos": {
                "Cascas": ["Cascas Centro"],
                "Lucma": ["Lucma Centro"],
                "Marmot": ["Marmot Centro"],
                "Sayapullo": ["Sayapullo Centro"]
            }
        },
        "Virú": {
            "distritos": {
                "Virú": ["Virú Centro", "San Juan"],
                "Chao": ["Chao Centro"],
                "Guadalupito": ["Guadalupito Centro"]
            }
        }
    }
    
    total_provincias = 0
    total_distritos = 0
    total_caserios = 0
    
    # 3. Crear Provincias, Distritos y Caseríos
    for provincia_name, data in provincias_data.items():
        # Crear Provincia
        provincia, created = Province.objects.get_or_create(
            name=provincia_name,
            department=dept
        )
        if created:
            total_provincias += 1
            print(f"  ✅ Provincia: {provincia_name}")
        
        # Crear Distritos y Caseríos
        for distrito_name, caserios_list in data["distritos"].items():
            distrito, created = District.objects.get_or_create(
                name=distrito_name,
                province=provincia
            )
            if created:
                total_distritos += 1
                print(f"    ✅ Distrito: {distrito_name}")
            
            # Crear Caseríos
            for caserio_name in caserios_list:
                caserio, created = Caserio.objects.get_or_create(
                    name=caserio_name,
                    district=distrito
                )
                if created:
                    total_caserios += 1
    
    print("\n" + "="*60)
    print("📊 RESUMEN DE CARGA")
    print("="*60)
    print(f"Departamento: La Libertad")
    print(f"Provincias creadas: {total_provincias}")
    print(f"Distritos creados: {total_distritos}")
    print(f"Caseríos creados: {total_caserios}")
    print("="*60)
    print("✅ ¡Datos de La Libertad cargados exitosamente!")
    print("\nAhora puedes usar estos datos en:")
    print("  - Crear clientes con ubicaciones reales")
    print("  - Configurar precios por zona")
    print("  - Asignar cobradores por distrito")
    print("="*60)

if __name__ == "__main__":
    load_la_libertad_data()
