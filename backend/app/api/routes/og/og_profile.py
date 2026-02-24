from fastapi import APIRouter, HTTPException
from fastapi.responses import Response
from sqlmodel import select

from app.api.deps import SessionDep
from app.models import User
from app.api.routes.og.og_shared import (
    render_html_to_png,
    cache_get, cache_set, cache_invalidate,
    avatar_to_base64,
    get_initials, truncate,
    _CACHE_TTL_24H,
)

router = APIRouter()


def invalidate_og_profile_cache(uuid: str) -> None:
    """Call from your profile-update route to bust the cached image."""
    cache_invalidate(uuid)


# ── HTML template

_HTML = """<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=DM+Sans:wght@400;500;600&display=swap" rel="stylesheet">
  <style>
    *, *::before, *::after {{ box-sizing: border-box; margin: 0; padding: 0; }}

    body {{
      width: 1200px;
      height: 630px;
      overflow: hidden;
      background: #0f1117;
      font-family: 'DM Sans', sans-serif;
    }}

    .og-card {{
      width: 1200px;
      height: 630px;
      background: #0f1117;
      border-radius: 24px;
      overflow: hidden;
      position: relative;
      display: flex;
      flex-direction: column;
      padding: 64px 72px 52px;
      isolation: isolate;
    }}

    .og-card::before {{
      content: '';
      position: absolute;
      inset: 0;
      background:
        radial-gradient(ellipse 700px 500px at 110% -20%, rgba(250,250,250,.18) 0%, transparent 70%),
        radial-gradient(ellipse 500px 400px at -10% 120%, rgba(16,185,129,.12) 0%, transparent 65%);
      z-index: 0;
    }}

    .og-card::after {{
      content: '';
      position: absolute;
      inset: 0;
      background-image:
        linear-gradient(rgba(255,255,255,.025) 1px, transparent 1px),
        linear-gradient(90deg, rgba(255,255,255,.025) 1px, transparent 1px);
      background-size: 60px 60px;
      z-index: 0;
    }}

    .og-card > * {{ position: relative; z-index: 1; }}

    .top-row {{
      display: flex;
      align-items: flex-start;
      gap: 36px;
      flex: 1;
    }}

    .avatar-wrap {{ flex-shrink: 0; position: relative; }}

    .avatar {{
      width: 148px;
      height: 148px;
      border-radius: 50%;
      object-fit: cover;
      display: block;
      outline: 3px solid rgba(250,250,250,.4);
      outline-offset: 4px;
    }}

    .avatar-initials {{
      width: 148px;
      height: 148px;
      border-radius: 50%;
      background: linear-gradient(135deg, #6366f1 0%, #4f46e5 100%);
      display: flex;
      align-items: center;
      justify-content: center;
      font-family: 'Syne', sans-serif;
      font-size: 52px;
      font-weight: 800;
      color: #fff;
      outline: 3px solid rgba(250,250,250,.5);
      outline-offset: 4px;
      flex-shrink: 0;
    }}

    .mentor-badge {{
      position: absolute;
      bottom: 4px;
      right: -6px;
      background: #10b981;
      color: #fff;
      font-family: 'DM Sans', sans-serif;
      font-size: 13px;
      font-weight: 600;
      letter-spacing: 0.04em;
      padding: 3px 10px;
      border-radius: 999px;
      border: 2px solid #0f1117;
      white-space: nowrap;
    }}

    .info {{
      flex: 1;
      display: flex;
      flex-direction: column;
      gap: 14px;
      padding-top: 6px;
    }}

    .name {{
      font-family: 'Syne', sans-serif;
      font-size: 52px;
      font-weight: 800;
      color: #f1f5f9;
      line-height: 1.0;
      letter-spacing: -0.02em;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }}

    .title-role {{
      font-size: 22px;
      font-weight: 500;
      color: #94a3b8;
      letter-spacing: -0.01em;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }}

    .stats {{
      display: flex;
      align-items: center;
      margin-top: 4px;
    }}

    .stat {{
      display: flex;
      flex-direction: column;
      gap: 2px;
      padding-right: 28px;
      margin-right: 28px;
      border-right: 1px solid rgba(255,255,255,.08);
    }}
    .stat:last-child {{ border-right: none; margin-right: 0; padding-right: 0; }}

    .stat-value {{
      font-family: 'Syne', sans-serif;
      font-size: 30px;
      font-weight: 700;
      color: #f1f5f9;
      line-height: 1;
    }}

    .stat-label {{
      font-size: 13px;
      font-weight: 500;
      color: #64748b;
      letter-spacing: 0.02em;
      text-transform: uppercase;
    }}

    .about {{
      font-size: 20px;
      font-weight: 400;
      color: #7c8fa8;
      line-height: 1.5;
      max-width: 700px;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
      margin-top: 2px;
    }}

    .tags {{
      display: flex;
      gap: 10px;
      flex-wrap: nowrap;
      overflow: hidden;
      margin-top: auto;
      padding-top: 24px;
    }}

    .tag {{
      font-size: 15px;
      font-weight: 600;
      color: #f1f5f9;
      background: rgba(212,212,216,.12);
      border: 1px solid rgba(212,212,216,.2);
      border-radius: 8px;
      padding: 6px 16px;
      white-space: nowrap;
      letter-spacing: 0.01em;
    }}

    .bottom-bar {{
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding-top: 28px;
      border-top: 1px solid rgba(255,255,255,.06);
      margin-top: 24px;
    }}

    .brand {{
      font-family: 'Syne', sans-serif;
      font-size: 22px;
      font-weight: 800;
      letter-spacing: -0.02em;
      color: #f1f5f9;
    }}

    .profile-url {{
      font-size: 15px;
      font-weight: 500;
      color: #475569;
      letter-spacing: 0.01em;
    }}
  </style>
</head>
<body>
<div class="og-card">

  <div class="top-row">
    <div class="avatar-wrap">
      {avatar_html}
      {badge_html}
    </div>
    <div class="info">
      <div class="name">{full_name}</div>
      <div class="title-role">{role}</div>
      {stats_html}
      <p class="about">{about}</p>
    </div>
  </div>

  <div class="tags">{tags_html}</div>

  <div class="bottom-bar">
    <div class="brand">MENTspace</div>
    <div class="profile-url">{profile_url}</div>
  </div>

</div>
</body>
</html>"""


# ── Template builders

def _build_avatar_html(avatar_b64: str, initials: str) -> str:
    if avatar_b64:
        return f'<img class="avatar" src="{avatar_b64}" alt="avatar" />'
    return f'<div class="avatar-initials">{initials}</div>'


def _build_badge_html(is_mentor: bool) -> str:
    return '<div class="mentor-badge">✦ Mentor</div>' if is_mentor else ""


def _build_stats_html(mentor_profile) -> str:
    if not mentor_profile:
        return ""
    rating = f"{mentor_profile.average_rating:.1f}" if mentor_profile.average_rating else "—"
    sessions = mentor_profile.total_sessions or 0
    mentees = mentor_profile.total_mentees or 0
    return f"""
    <div class="stats">
      <div class="stat">
        <span class="stat-value">{rating}</span>
        <span class="stat-label">Rating</span>
      </div>
      <div class="stat">
        <span class="stat-value">{sessions}</span>
        <span class="stat-label">Sessions</span>
      </div>
      <div class="stat">
        <span class="stat-value">{mentees}</span>
        <span class="stat-label">Mentees</span>
      </div>
    </div>"""


def _build_tags_html(tags: list[str]) -> str:
    return "".join(f'<span class="tag">{t}</span>' for t in tags[:6])


@router.get("/profile/{uuid}")
async def get_og_profile(uuid: str, session: SessionDep) -> Response:
    # 1. Cache
    cached = cache_get(uuid, ttl=_CACHE_TTL_24H)
    if cached:
        return Response(
            content=cached,
            media_type="image/png",
            headers={"Cache-Control": "public, max-age=86400", "X-Cache": "HIT"},
        )

    # 2. Fetch user
    user = session.exec(select(User).where(User.uuid == uuid)).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    public = user.to_public(current_user_id=user.id)
    profile = public.profile
    mentor_profile = profile.mentor_profile if profile else None
    is_mentor = public.is_mentor and mentor_profile is not None

    # 3. Avatar → base64
    avatar_b64 = await avatar_to_base64(public.avatar_url or "")

    # 4. Tags
    tags: list[str] = []
    if is_mentor and mentor_profile:
        tags = (mentor_profile.expertise or [])[:6]
    elif profile:
        tags = (profile.skills or profile.interests or [])[:6]

    # 5. Role string
    if is_mentor and mentor_profile and mentor_profile.title:
        role = mentor_profile.title
    elif profile and profile.title:
        role = profile.title
    else:
        role = "MENTspace Member"

    # 6. About
    about_raw = (profile.about or "") if profile else ""
    about = truncate(about_raw, 160) or f"View {public.full_name}'s profile on MENTspace"

    # 7. Build HTML
    base_url = "mentspace.io"
    html = _HTML.format(
        full_name=truncate(public.full_name, 40),
        role=truncate(role, 60),
        about=about,
        avatar_html=_build_avatar_html(avatar_b64, get_initials(public.full_name)),
        badge_html=_build_badge_html(is_mentor),
        stats_html=_build_stats_html(mentor_profile if is_mentor else None),
        tags_html=_build_tags_html(tags),
        profile_url=f"{base_url}/profile/{uuid}",
    )

    # 8. Render
    try:
        image_bytes = await render_html_to_png(html)
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"Image render failed: {exc}")

    # 9. Cache + return
    cache_set(uuid, image_bytes)
    return Response(
        content=image_bytes,
        media_type="image/png",
        headers={"Cache-Control": "public, max-age=86400", "X-Cache": "MISS"},
    )