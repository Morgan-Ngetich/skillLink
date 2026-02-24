from fastapi import APIRouter, HTTPException
from fastapi.responses import Response
from sqlmodel import select

from app.api.deps import SessionDep
from app.models.mentor import MentorSession
from app.api.routes.og.og_shared import (
    render_html_to_png,
    cache_get, cache_set, cache_invalidate,
    avatar_to_base64,
    get_initials, truncate,
    _CACHE_TTL_1H,
)

router = APIRouter()


def invalidate_session_og_cache(uuid: str) -> None:
    """Call from your session-update route to bust the cached image."""
    cache_invalidate(f"session:{uuid}")


# ── HTML template

_SESSION_HTML = """<!doctype html>
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
      font-family: 'DM Sans', sans-serif;
    }}

    .og-card {{
      width: 1200px;
      height: 630px;
      position: relative;
      overflow: hidden;
      display: flex;
      flex-direction: column;
      isolation: isolate;
    }}

    /* Cover image bg */
    .og-bg {{
      position: absolute;
      inset: 0;
      background-image: url('{cover_image}');
      background-size: cover;
      background-position: center;
      z-index: 0;
    }}

    /* Dark overlay — same as SessionCard UI */
    .og-overlay {{
      position: absolute;
      inset: 0;
      background: rgba(0, 0, 0, 0.62);
      z-index: 1;
    }}

    /* Fallback bg (no cover image) */
    .og-fallback {{
      position: absolute;
      inset: 0;
      background: #0f1117;
      z-index: 0;
    }}
    .og-fallback::before {{
      content: '';
      position: absolute;
      inset: 0;
      background:
        radial-gradient(ellipse 700px 500px at 110% -20%, rgba(250,250,250,.15) 0%, transparent 70%),
        radial-gradient(ellipse 500px 400px at -10% 120%, rgba(16,185,129,.1) 0%, transparent 65%);
    }}
    .og-fallback::after {{
      content: '';
      position: absolute;
      inset: 0;
      background-image:
        linear-gradient(rgba(255,255,255,.025) 1px, transparent 1px),
        linear-gradient(90deg, rgba(255,255,255,.025) 1px, transparent 1px);
      background-size: 60px 60px;
    }}

    /* Content sits above bg layers */
    .og-content {{
      position: relative;
      z-index: 2;
      display: flex;
      flex-direction: column;
      height: 100%;
      padding: 48px 64px 44px;
    }}

    /* ── Top row ── */
    .top-row {{
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 24px;
    }}

    .mentor-info {{
      display: flex;
      align-items: center;
      gap: 16px;
    }}

    .avatar {{
      width: 64px;
      height: 64px;
      border-radius: 50%;
      object-fit: cover;
      outline: 2px solid rgba(255,255,255,.4);
      outline-offset: 3px;
      flex-shrink: 0;
    }}

    .avatar-initials {{
      width: 64px;
      height: 64px;
      border-radius: 50%;
      background: linear-gradient(135deg, #6366f1 0%, #4f46e5 100%);
      display: flex;
      align-items: center;
      justify-content: center;
      font-family: 'Syne', sans-serif;
      font-size: 22px;
      font-weight: 800;
      color: #fff;
      outline: 2px solid rgba(255,255,255,.4);
      outline-offset: 3px;
      flex-shrink: 0;
    }}

    .mentor-name {{
      font-family: 'Syne', sans-serif;
      font-size: 22px;
      font-weight: 700;
      color: #fff;
      line-height: 1.1;
    }}

    .mentor-title {{
      font-size: 15px;
      color: rgba(255,255,255,.6);
      margin-top: 2px;
    }}

    .date-badge {{
      display: flex;
      align-items: center;
      gap: 18px;
      background: rgba(255,255,255,.1);
      border: 1px solid rgba(255,255,255,.15);
      border-radius: 999px;
      padding: 10px 22px;
      backdrop-filter: blur(8px);
      flex-shrink: 0;
    }}

    .date-badge-item {{
      display: flex;
      align-items: center;
      gap: 7px;
      font-size: 15px;
      font-weight: 600;
      color: rgba(255,255,255,.85);
      white-space: nowrap;
    }}

    .date-badge-sep {{
      width: 1px;
      height: 16px;
      background: rgba(255,255,255,.2);
    }}

    /* ── Middle: session title ── */
    .middle {{
      flex: 1;
      display: flex;
      align-items: center;
    }}

    .session-title {{
      font-family: 'Syne', sans-serif;
      font-size: 68px;
      font-weight: 800;
      color: #fff;
      line-height: 1.0;
      letter-spacing: -0.025em;
      max-width: 900px;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
      text-shadow: 0 2px 20px rgba(0,0,0,.4);
    }}

    /* ── Bottom ── */
    .bottom-row {{
      display: flex;
      align-items: flex-end;
      justify-content: space-between;
      gap: 24px;
    }}

    .bottom-left {{
      display: flex;
      flex-direction: column;
      gap: 14px;
    }}

    .tags {{
      display: flex;
      gap: 8px;
      flex-wrap: nowrap;
      overflow: hidden;
    }}

    .tag {{
      font-size: 13px;
      font-weight: 600;
      color: rgba(255,255,255,.85);
      background: rgba(255,255,255,.1);
      border: 1px solid rgba(255,255,255,.18);
      border-radius: 8px;
      padding: 5px 14px;
      white-space: nowrap;
    }}

    .meta-row {{
      display: flex;
      align-items: center;
      gap: 10px;
    }}

    .meta-pill {{
      display: flex;
      align-items: center;
      gap: 6px;
      font-size: 16px;
      font-weight: 600;
      color: #fff;
      background: rgba(0,0,0,.35);
      border: 1px solid rgba(255,255,255,.5);
      border-radius: 999px;
      padding: 7px 18px;
      backdrop-filter: blur(6px);
    }}

    .meta-pill.free {{
      background: rgba(16,185,129,.3);
      border-color: rgba(16,185,129,.5);
      color: #6ee7b7;
    }}

    .meta-pill.paid {{
      background: rgba(245,158,11,.3);
      border-color: rgba(245,158,11,.5);
      color: #fcd34d;
    }}

    .meta-pill.spots {{
      background: rgba(99,102,241,.3);
      border-color: rgba(99,102,241,.35);
      color: #c7d2fe;
    }}

    .brand {{
      font-family: 'Syne', sans-serif;
      font-size: 22px;
      font-weight: 800;
      letter-spacing: -0.02em;
      color: rgba(255,255,255,.9);
      flex-shrink: 0;
      text-align: right;
    }}
  </style>
</head>
<body>
<div class="og-card">

  {bg_html}

  <div class="og-content">

    <div class="top-row">
      <div class="mentor-info">
        {avatar_html}
        <div>
          <div class="mentor-name">{mentor_name}</div>
          <div class="mentor-title">{mentor_role}</div>
        </div>
      </div>

      <div class="date-badge">
        <div class="date-badge-item">
          <svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24" style="opacity:.7">
            <rect x="3" y="4" width="18" height="18" rx="2"/>
            <line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/>
            <line x1="3" y1="10" x2="21" y2="10"/>
          </svg>
          {session_date}
        </div>
        <div class="date-badge-sep"></div>
        <div class="date-badge-item">
          <svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24" style="opacity:.7">
            <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
          </svg>
          {session_time}
        </div>
      </div>
    </div>

    <div class="middle">
      <div class="session-title">{session_title}</div>
    </div>

    <div class="bottom-row">
      <div class="bottom-left">
        <div class="tags">{tags_html}</div>
        <div class="meta-row">

          <div class="meta-pill">
            <svg width="15" height="15" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
              <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
            </svg>
            {duration}
          </div>

          <div class="meta-pill {price_class}">
            <svg width="15" height="15" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
              <circle cx="12" cy="12" r="10"/>
              <path d="M12 6v2m0 8v2M9.5 9.5A2.5 2.5 0 0 1 12 8a2.5 2.5 0 0 1 0 5 2.5 2.5 0 0 0 0 5 2.5 2.5 0 0 0 2.5-1.5"/>
            </svg>
            {price}
          </div>

          <div class="meta-pill spots">
            <svg width="15" height="15" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
              <circle cx="9" cy="7" r="4"/>
              <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
              <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
            </svg>
            {spots}
          </div>

        </div>
      </div>

      <div class="brand">MENTspace</div>
    </div>

  </div>
</div>
</body>
</html>"""


# ── Template builders

def _format_duration(minutes: int | None) -> str:
    if not minutes:
        return "—"
    h, m = divmod(minutes, 60)
    if h and m:
        return f"{h}h {m}m"
    if h:
        return f"{h} hr{'s' if h > 1 else ''}"
    return f"{m} min"


def _build_bg_html(cover_image: str | None) -> tuple[str, str]:
    """Return (cover_image url for CSS, bg_html snippet)."""
    if cover_image:
        return cover_image, '<div class="og-bg"></div><div class="og-overlay"></div>'
    return "", '<div class="og-fallback"></div>'


def _build_avatar_html(avatar_b64: str, initials: str) -> str:
    if avatar_b64:
        return f'<img class="avatar" src="{avatar_b64}" alt="avatar" />'
    return f'<div class="avatar-initials">{initials}</div>'



@router.get("/session/{uuid}")
async def get_session_og(uuid: str, session: SessionDep) -> Response:
    cache_key = f"session:{uuid}"

    # 1. Cache (1h — spots change frequently)
    cached = cache_get(cache_key, ttl=_CACHE_TTL_1H)
    if cached:
        return Response(
            content=cached,
            media_type="image/png",
            headers={"Cache-Control": "public, max-age=3600", "X-Cache": "HIT"},
        )

    # 2. Fetch session
    mentor_session = session.exec(
        select(MentorSession).where(MentorSession.uuid == uuid)
    ).first()
    if not mentor_session:
        raise HTTPException(status_code=404, detail="Session not found")

    # 3. Mentor user + profile via relationships
    #    MentorSession.mentor → MentorProfile
    #    MentorSession.mentor.user → User
    mentor_profile = mentor_session.mentor
    mentor_user = mentor_profile.user if mentor_profile else None

    # 4. Avatar → base64
    avatar_b64 = await avatar_to_base64(mentor_user.avatar_url or "" if mentor_user else "")
    initials = get_initials(mentor_user.full_name if mentor_user else "M")
    avatar_html = _build_avatar_html(avatar_b64, initials)

    # 5. Mentor name + role
    mentor_name = truncate(mentor_user.full_name if mentor_user else "Mentor", 40)
    mentor_role = truncate(
        (mentor_profile.title if mentor_profile else None) or "MENTspace Mentor", 60
    )

    # 6. Date / time  (already tz-aware datetimes from the model)
    start = mentor_session.start_time
    end = mentor_session.end_time
    session_date = start.strftime("%-d %b %Y") if start else "—"
    if start and end:
        session_time = f"{start.strftime('%-I:%M %p')} – {end.strftime('%-I:%M %p')}"
    elif start:
        session_time = start.strftime("%-I:%M %p")
    else:
        session_time = "—"

    # 7. Price / duration / spots
    price = f"${int(mentor_session.price_usd)}" if mentor_session.price_usd else "Free"
    price_class = "free" if not mentor_session.price_usd else "paid"
    duration = _format_duration(mentor_session.duration_minutes)

    available = mentor_session.available_spots  # None = unlimited (property on model)
    if available is None:
        spots = "Open"
    elif available == 0:
        spots = "Full"
    else:
        spots = f"{available} spot{'s' if available != 1 else ''} left"

    # 8. Tags (up to 4)
    raw_tags: list[str] = list(mentor_session.tags or [])[:4]
    tags_html = "".join(f'<span class="tag">{t}</span>' for t in raw_tags)

    # 9. Background
    cover_image, bg_html = _build_bg_html(mentor_session.cover_image)

    # 10. Build HTML
    html = _SESSION_HTML.format(
        cover_image=cover_image,
        bg_html=bg_html,
        avatar_html=avatar_html,
        mentor_name=mentor_name,
        mentor_role=mentor_role,
        session_date=session_date,
        session_time=session_time,
        session_title=truncate(mentor_session.title, 80),
        tags_html=tags_html,
        duration=duration,
        price=price,
        price_class=price_class,
        spots=spots,
    )

    # 11. Render
    try:
        image_bytes = await render_html_to_png(html)
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"Image render failed: {exc}")

    # 12. Cache + return
    cache_set(cache_key, image_bytes)
    return Response(
        content=image_bytes,
        media_type="image/png",
        headers={"Cache-Control": "public, max-age=3600", "X-Cache": "MISS"},
    )