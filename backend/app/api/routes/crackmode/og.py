from fastapi import APIRouter, Query
from fastapi.responses import Response
import imgkit
from io import BytesIO
import textwrap
import re

router = APIRouter()

# HTML template with better overflow handling
OG_HTML_TEMPLATE = """
<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>{title} • CrackMode OG Image</title>

    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;700;800&display=swap" rel="stylesheet">

    <style>
      * {{ box-sizing: border-box; }}
      html, body {{ height: 100%; }}
      body {{
        margin: 0;
        background: {bg_color};
        display: grid;
        place-items: center;
        padding: 24px;
        font-family: Inter, system-ui, -apple-system, Segoe UI, Roboto, Ubuntu, Cantarell, "Helvetica Neue", Arial, "Noto Sans", sans-serif;
      }}

      .og-card {{
        width: 1200px;
        height: 630px;
        background: {bg_color};
        color: {fg_color};
        border-radius: 28px;
        padding: 72px;
        display: flex;
        flex-direction: column;
        gap: {gap}px;
        box-shadow: 0 20px 60px rgba(0,0,0,.6);
        overflow: hidden;
      }}

      .title {{
        font-weight: 800;
        font-size: {title_size}px;
        line-height: {title_line_height};
        letter-spacing: -0.03em;
        flex-shrink: 0;
        max-height: {title_max_height}px;
        overflow: hidden;
        display: -webkit-box;
        -webkit-line-clamp: {title_clamp};
        -webkit-box-orient: vertical;
        text-overflow: ellipsis;
      }}

      .description {{
        margin: 0;
        max-width: 980px;
        font-weight: 500;
        font-size: {desc_size}px;
        line-height: {desc_line_height};
        color: {muted_color};
        flex: 1;
        overflow: hidden;
        display: -webkit-box;
        -webkit-line-clamp: {desc_clamp};
        -webkit-box-orient: vertical;
        text-overflow: ellipsis;
        min-height: 0;
      }}

      .logo {{
        margin-top: auto;
        font-weight: 800;
        font-size: {logo_size}px;
        line-height: 1;
        letter-spacing: -0.02em;
        flex-shrink: 0;
      }}
      .logo .crack {{ color: {green_color}; }}
      .logo .mode  {{ color: {yellow_color}; }}

      /* Responsive adjustments for very long content */
      .compact .title {{
        font-size: {title_size_compact}px;
        line-height: {title_line_height_compact};
      }}
      
      .compact .description {{
        font-size: {desc_size_compact}px;
        line-height: {desc_line_height_compact};
      }}
      
      .compact .logo {{
        font-size: {logo_size_compact}px;
      }}
    </style>
  </head>
  <body>
    <div class="og-card {card_class}" role="img" aria-label="{title} card">
      <div class="title">{title}</div>
      <p class="description">{description}</p>
      <div class="logo">
        <span class="crack">Crack</span><span class="mode">Mode</span>
      </div>
    </div>
  </body>
</html>
"""

def calculate_text_metrics(text):
    """Calculate approximate text metrics for sizing decisions"""
    words = len(text.split())
    chars = len(text)
    lines_approx = chars / 50  # rough estimate
    
    return {
        'words': words,
        'chars': chars, 
        'lines_approx': lines_approx
    }

def get_dynamic_sizing(title, description, theme_base):
    """Calculate dynamic sizing based on content length"""
    title_metrics = calculate_text_metrics(title)
    desc_metrics = calculate_text_metrics(description)
    
    # Determine if we need compact mode
    is_compact = (
        title_metrics['chars'] > 60 or 
        desc_metrics['chars'] > 200 or
        title_metrics['words'] > 8 or
        desc_metrics['words'] > 30
    )
    
    # Base sizing
    config = {
        'card_class': 'compact' if is_compact else '',
        'gap': 30 if is_compact else 40,
        
        # Title sizing
        'title_size': 100 if is_compact else theme_base.get('title_size', 140),
        'title_size_compact': 80,
        'title_line_height': '0.95' if is_compact else '1.0',
        'title_line_height_compact': '0.9',
        'title_max_height': 200 if is_compact else 280,
        'title_clamp': 3 if is_compact else 2,
        
        # Description sizing  
        'desc_size': 36 if is_compact else theme_base.get('desc_size', 48),
        'desc_size_compact': 32,
        'desc_line_height': '1.3' if is_compact else '1.35',
        'desc_line_height_compact': '1.25',
        'desc_clamp': 4 if is_compact else 3,
        
        # Logo sizing
        'logo_size': 42 if is_compact else 50,
        'logo_size_compact': 38
    }
    
    return config

def smart_text_wrap(text, max_chars_per_line=50, max_lines=5):
    """Intelligently wrap text with better line breaks"""
    # First, try to break at natural points
    words = text.split()
    lines = []
    current_line = []
    current_length = 0
    
    for word in words:
        # Check if adding this word would exceed the line limit
        if current_length + len(word) + 1 > max_chars_per_line and current_line:
            lines.append(' '.join(current_line))
            current_line = [word]
            current_length = len(word)
        else:
            current_line.append(word)
            current_length += len(word) + (1 if current_line else 0)
        
        # Stop if we've reached max lines
        if len(lines) >= max_lines - 1:
            break
    
    # Add remaining words to last line
    if current_line:
        lines.append(' '.join(current_line))
    
    # If we still have more content, add ellipsis
    if len(words) > len(' '.join(lines).split()):
        if lines:
            lines[-1] = lines[-1].rstrip() + '...'
    
    return '\n'.join(lines[:max_lines])

def truncate_smart(text, max_length):
    """Smart truncation that tries to break at word boundaries"""
    if len(text) <= max_length:
        return text
    
    # Try to break at last space before limit
    truncated = text[:max_length]
    last_space = truncated.rfind(' ')
    
    if last_space > max_length * 0.7:  # If space is reasonably close to end
        return text[:last_space] + '...'
    else:
        return text[:max_length-3] + '...'

@router.get("/og")
async def generate_og_image(
    title: str = Query(..., description="Title for the OG image"),
    description: str = Query("Master algorithms with CrackMode", description="Description text"),
    section: str = Query("Documentation", description="Section name"),
    theme: str = Query("crackmode", description="Theme name")
):
    # Theme configurations
    themes = {
        "crackmode": {
            "bg_color": "#121417",
            "fg_color": "#ECEFF3",
            "muted_color": "#A7AEB7",
            "green_color": "#0EA35A",
            "yellow_color": "#F2B01E",
            "title_size": 110,
            "desc_size": 48
        },
        "light": {
            "bg_color": "#FFFFFF",
            "fg_color": "#1A202C",
            "muted_color": "#718096",
            "green_color": "#0EA35A",
            "yellow_color": "#F2B01E",
            "title_size": 100,
            "desc_size": 44
        },
        "dark": {
            "bg_color": "#0B0D10",
            "fg_color": "#E2E8F0",
            "muted_color": "#A0AEC0",
            "green_color": "#48BB78",
            "yellow_color": "#ECC94B",
            "title_size": 110,
            "desc_size": 48
        }
    }
    
    theme_config = themes.get(theme, themes["crackmode"])
    
    # Auto-generate description if not provided
    if description == "Master algorithms with CrackMode":
        description = f"Learn {title} with comprehensive examples and solutions"
    
    # Get dynamic sizing based on content
    sizing_config = get_dynamic_sizing(title, description, theme_config)
    
    # Smart text processing
    processed_title = smart_text_wrap(title, max_chars_per_line=40, max_lines=2)
    processed_desc = smart_text_wrap(description, max_chars_per_line=60, max_lines=4)
    
    # If title is still too long, truncate more aggressively
    if len(processed_title.replace('\n', ' ')) > 80:
        processed_title = truncate_smart(title, 70)
    
    # Combine theme and sizing configs
    template_vars = {
        **theme_config,
        **sizing_config,
        'title': processed_title,
        'description': processed_desc
    }
    
    # Render HTML
    html_content = OG_HTML_TEMPLATE.format(**template_vars)
    
    # Convert to image
    options = {
        'width': '1200',
        'height': '630',
        'quality': '100',
        'quiet': '',
        'enable-local-file-access': None
    }
    
    try:
        image_data = imgkit.from_string(html_content, False, options=options)
        return Response(content=image_data, media_type="image/png")
        
    except Exception as e:
        # Fallback to simple implementation
        return await generate_fallback_image(title, description, theme)

async def generate_fallback_image(title: str, description: str, theme: str):
    """Enhanced fallback with better text handling"""
    from PIL import Image, ImageDraw, ImageFont
    from io import BytesIO
    import textwrap
    
    width, height = 1200, 630
    bg_color = (18, 20, 23) if theme == "crackmode" else (255, 255, 255)
    text_color = (236, 239, 243) if theme == "crackmode" else (26, 32, 44)
    muted_color = (167, 174, 183) if theme == "crackmode" else (113, 128, 150)
    
    image = Image.new('RGB', (width, height), bg_color)
    draw = ImageDraw.Draw(image)
    
    try:
        font_large = ImageFont.truetype("fonts/Inter-Bold.ttf", 80)
        font_medium = ImageFont.truetype("fonts/Inter-Medium.ttf", 40)
        font_logo = ImageFont.truetype("fonts/Inter-Bold.ttf", 50)
    except:
        font_large = ImageFont.load_default()
        font_medium = ImageFont.load_default()
        font_logo = ImageFont.load_default()
    
    # Smart text wrapping for PIL
    title_wrapped = textwrap.fill(title, width=20)
    desc_wrapped = textwrap.fill(description, width=35)
    
    # Draw title with overflow handling
    title_lines = title_wrapped.split('\n')[:3]  # Max 3 lines
    y_offset = 100
    for line in title_lines:
        draw.text((100, y_offset), line, fill=text_color, font=font_large)
        y_offset += 90
    
    # Draw description
    desc_lines = desc_wrapped.split('\n')[:3]  # Max 3 lines  
    y_offset = max(300, y_offset + 40)
    for line in desc_lines:
        draw.text((100, y_offset), line, fill=muted_color, font=font_medium)
        y_offset += 50
    
    # Draw logo
    draw.text((100, 520), "CrackMode", fill=text_color, font=font_logo)
    
    buffer = BytesIO()
    image.save(buffer, format="PNG")
    buffer.seek(0)
    
    return Response(content=buffer.getvalue(), media_type="image/png")