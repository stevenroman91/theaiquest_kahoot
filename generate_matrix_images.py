#!/usr/bin/env python3
"""
Script pour générer les images de la matrice Impact/Feasibility
"""

from PIL import Image, ImageDraw, ImageFont
import os

def create_matrix_image(grayed_solutions=None, filename="matrix.png"):
    """
    Crée une image de la matrice Impact/Feasibility
    
    Args:
        grayed_solutions: Liste des numéros de solutions à griser (ex: [6, 7, 8, 9])
        filename: Nom du fichier de sortie
    """
    if grayed_solutions is None:
        grayed_solutions = []
    
    # Dimensions de l'image
    width = 800
    height = 600
    
    # Créer l'image avec fond blanc
    img = Image.new('RGB', (width, height), 'white')
    draw = ImageDraw.Draw(img)
    
    # Couleurs
    matrix_bg = (30, 58, 138)  # Bleu foncé de la matrice
    matrix_border = (59, 130, 246)  # Bleu clair de la bordure
    white = (255, 255, 255)
    blue_light = (6, 182, 212)  # Bleu clair des solutions actives
    gray_dark = (107, 114, 128)  # Gris des solutions grisées
    text_blue = (30, 58, 138)  # Bleu foncé du texte
    
    # Position et taille de la matrice
    matrix_x = 150
    matrix_y = 50
    matrix_width = 500
    matrix_height = 450
    
    # Dessiner la matrice
    draw.rounded_rectangle(
        [matrix_x, matrix_y, matrix_x + matrix_width, matrix_y + matrix_height],
        radius=15,
        fill=matrix_bg,
        outline=matrix_border,
        width=2
    )
    
    # Dessiner les axes
    center_x = matrix_x + matrix_width // 2
    center_y = matrix_y + matrix_height // 2
    
    # Axe vertical (Impact)
    draw.line([center_x, matrix_y, center_x, matrix_y + matrix_height], fill=white, width=2)
    # Axe horizontal (Feasibility)
    draw.line([matrix_x, center_y, matrix_x + matrix_width, center_y], fill=white, width=2)
    
    # Dessiner les flèches
    arrow_size = 8
    # Flèche Impact (vers le haut)
    draw.polygon([
        (center_x, matrix_y + 20),
        (center_x - arrow_size, matrix_y + 20 + arrow_size),
        (center_x + arrow_size, matrix_y + 20 + arrow_size)
    ], fill=white)
    
    # Flèche Feasibility (vers la droite)
    draw.polygon([
        (matrix_x + matrix_width - 20, center_y),
        (matrix_x + matrix_width - 20 - arrow_size, center_y - arrow_size),
        (matrix_x + matrix_width - 20 - arrow_size, center_y + arrow_size)
    ], fill=white)
    
    # Positions des solutions (en pourcentage de la matrice)
    solutions = [
        {'id': 1, 'x': 70, 'y': 65},   # Bottom-right quadrant
        {'id': 2, 'x': 40, 'y': 45},   # Top-left quadrant
        {'id': 3, 'x': 80, 'y': 25},   # Top-right quadrant
        {'id': 4, 'x': 65, 'y': 40},   # Top-right quadrant
        {'id': 5, 'x': 45, 'y': 70},   # Bottom-left quadrant
        {'id': 6, 'x': 25, 'y': 30},   # Top-left quadrant
        {'id': 7, 'x': 30, 'y': 75},   # Bottom-left quadrant
        {'id': 8, 'x': 85, 'y': 70},   # Bottom-right quadrant
        {'id': 9, 'x': 20, 'y': 20}    # Top-left quadrant
    ]
    
    # Dessiner les marqueurs de solutions
    marker_size = 45
    try:
        font = ImageFont.truetype("/System/Library/Fonts/Arial.ttf", 20)
    except:
        font = ImageFont.load_default()
    
    for solution in solutions:
        # Position absolue dans l'image
        abs_x = matrix_x + (solution['x'] / 100) * matrix_width
        abs_y = matrix_y + (solution['y'] / 100) * matrix_height
        
        # Couleur selon si la solution est grisée ou non
        if solution['id'] in grayed_solutions:
            marker_color = gray_dark
            border_color = (200, 200, 200)
        else:
            marker_color = blue_light
            border_color = white
        
        # Dessiner le marqueur
        draw.rounded_rectangle(
            [abs_x - marker_size//2, abs_y - marker_size//2, 
             abs_x + marker_size//2, abs_y + marker_size//2],
            radius=8,
            fill=marker_color,
            outline=border_color,
            width=2
        )
        
        # Dessiner le numéro
        text_bbox = draw.textbbox((0, 0), str(solution['id']), font=font)
        text_width = text_bbox[2] - text_bbox[0]
        text_height = text_bbox[3] - text_bbox[1]
        
        draw.text(
            (abs_x - text_width//2, abs_y - text_height//2),
            str(solution['id']),
            fill=white,
            font=font
        )
    
    # Ajouter les labels des axes
    try:
        label_font = ImageFont.truetype("/System/Library/Fonts/Arial.ttf", 16)
        desc_font = ImageFont.truetype("/System/Library/Fonts/Arial.ttf", 12)
    except:
        label_font = ImageFont.load_default()
        desc_font = ImageFont.load_default()
    
    # Label IMPACT (à gauche)
    impact_x = matrix_x - 80
    impact_y = center_y
    draw.text((impact_x, impact_y - 20), "IMPACT", fill=text_blue, font=label_font)
    
    # Légende IMPACT
    impact_desc = "ROI potential\nAsset builds\nCompetitive edge"
    draw.text((impact_x - 20, impact_y + 10), impact_desc, fill=text_blue, font=desc_font)
    
    # Label FEASIBILITY (en bas)
    feasibility_x = center_x
    feasibility_y = matrix_y + matrix_height + 30
    draw.text((feasibility_x - 50, feasibility_y), "FEASIBILITY", fill=text_blue, font=label_font)
    
    # Légende FEASIBILITY
    feasibility_desc = "Data readiness, Technical complexity, Cost, Business engagement, Regulation..."
    draw.text((feasibility_x - 150, feasibility_y + 20), feasibility_desc, fill=text_blue, font=desc_font)
    
    # Sauvegarder l'image
    img.save(filename)
    print(f"Image sauvegardée: {filename}")

def main():
    """Génère les deux versions de la matrice"""
    
    # Version 1: Avec cases grisées (6, 7, 8, 9)
    print("Génération de la matrice avec cases grisées...")
    create_matrix_image(
        grayed_solutions=[6, 7, 8, 9],
        filename="matrix_with_grayed_solutions.png"
    )
    
    # Version 2: Toutes les cases en bleu
    print("Génération de la matrice avec toutes les cases en bleu...")
    create_matrix_image(
        grayed_solutions=[],
        filename="matrix_all_blue_solutions.png"
    )
    
    print("✅ Les deux images ont été générées avec succès!")
    print("📁 Fichiers créés:")
    print("   - matrix_with_grayed_solutions.png")
    print("   - matrix_all_blue_solutions.png")

if __name__ == "__main__":
    main()
