"""
Script para cargar datos geográficos de Lambayeque
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

def load_lambayeque_data():
    print("🌍 Cargando datos geográficos de Lambayeque...")
    
    # 1. Crear Departamento
    dept, created = Department.objects.get_or_create(name="Lambayeque")
    if created:
        print(f"✅ Departamento creado: {dept.name}")
    else:
        print(f"ℹ️  Departamento ya existe: {dept.name}")
    
    # 2. Provincias y sus Distritos con Caseríos
    provincias_data = {
        "Chiclayo": {
            "distritos": {
                "Chiclayo": ["San Antonio", "Santa Victoria", "Federico Villarreal", "Atusparias"],
                "Chongoyape": ["Chongoyape Centro", "Tinajones", "Raca Rumi"],
                "Eten": ["Puerto Eten", "Ciudad Eten"],
                "Eten Puerto": ["Puerto Eten Centro"],
                "José Leonardo Ortiz": ["Santa Rosa", "San Juan", "Las Brisas", "9 de Octubre", "Túpac Amaru"],
                "La Victoria": ["La Pradera", "La Primavera", "Campodónico", "El Bosque"],
                "Lagunas": ["Lagunas Centro"],
                "Monsefú": ["Monsefú Centro", "San Pedro"],
                "Nueva Arica": ["Nueva Arica Centro"],
                "Oyotún": ["Oyotún Centro", "Muy Finca"],
                "Picsi": ["Picsi Centro", "Pósope Alto", "Pósope Bajo"],
                "Pimentel": ["Pimentel Centro", "Santa Rosa"],
                "Reque": ["Reque Centro"],
                "Santa Rosa": ["Santa Rosa Centro"],
                "Saña": ["Saña Centro", "Cayaltí"],
                "Cayaltí": ["Cayaltí Centro"],
                "Patapo": ["Patapo Centro", "Tumán"],
                "Pomalca": ["Pomalca Centro"],
                "Pucalá": ["Pucalá Centro"],
                "Tumán": ["Tumán Centro"]
            }
        },
        "Ferreñafe": {
            "distritos": {
                "Ferreñafe": ["Ferreñafe Centro", "Batangrande"],
                "Cañaris": ["Cañaris Centro"],
                "Incahuasi": ["Incahuasi Centro"],
                "Manuel Antonio Mesones Muro": ["Mesones Muro Centro"],
                "Pitipo": ["Pitipo Centro"],
                "Pueblo Nuevo": ["Pueblo Nuevo Centro"]
            }
        },
        "Lambayeque": {
            "distritos": {
                "Lambayeque": ["Lambayeque Centro", "Huaca Rajada"],
                "Chóchope": ["Chóchope Centro"],
                "Illimo": ["Illimo Centro"],
                "Jayanca": ["Jayanca Centro"],
                "Mochumi": ["Mochumi Centro", "La Ramada"],
                "Mórrope": ["Mórrope Centro", "San José"],
                "Motupe": ["Motupe Centro", "Penachi"],
                "Olmos": ["Olmos Centro", "Rafán"],
                "Pacora": ["Pacora Centro"],
                "Salas": ["Salas Centro"],
                "San José": ["San José Centro"],
                "Túcume": ["Túcume Centro", "La Raya"]
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
    print(f"Departamento: Lambayeque")
    print(f"Provincias creadas: {total_provincias}")
    print(f"Distritos creados: {total_distritos}")
    print(f"Caseríos creados: {total_caserios}")
    print("="*60)
    print("✅ ¡Datos de Lambayeque cargados exitosamente!")
    print("="*60)

if __name__ == "__main__":
    load_lambayeque_data()
