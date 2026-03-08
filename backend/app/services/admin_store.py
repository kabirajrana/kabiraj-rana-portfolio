from __future__ import annotations

from datetime import datetime
from datetime import timezone
import json
import os
from pathlib import Path
import re
from tempfile import NamedTemporaryFile
from threading import Lock
from typing import Any
from uuid import uuid4

import bcrypt


def _utc_now_iso() -> str:
    return datetime.now(timezone.utc).isoformat()


def _parse_iso(value: Any) -> datetime | None:
    if not isinstance(value, str) or not value:
        return None
    try:
        return datetime.fromisoformat(value.replace("Z", "+00:00"))
    except ValueError:
        return None


def _contains_text(haystack: Any, needle: str) -> bool:
    if not needle:
        return True
    text = str(haystack or "").lower()
    return needle.lower() in text


def _as_list(value: Any) -> list[Any]:
    return value if isinstance(value, list) else []


def _looks_like_bcrypt_hash(value: Any) -> bool:
    return isinstance(value, str) and bool(re.match(r"^\$2[abxy]\$\d{2}\$", value))


def _hash_seed_password(password: str) -> str:
    return bcrypt.hashpw(password.encode("utf-8"), bcrypt.gensalt(rounds=12)).decode("utf-8")


def _seed_password_matches_hash(password: str, password_hash: str) -> bool:
    if not _looks_like_bcrypt_hash(password_hash):
        return False
    try:
        return bcrypt.checkpw(password.encode("utf-8"), password_hash.encode("utf-8"))
    except ValueError:
        return False


class JsonAdminStore:
    def __init__(self, file_path: Path) -> None:
        self.file_path = file_path
        self._lock = Lock()

    def _default_data(self) -> dict[str, Any]:
        now = _utc_now_iso()
        default_admin_email = os.getenv("ADMIN_SEED_EMAIL", "admin@example.com")
        seed_password = os.getenv("ADMIN_SEED_PASSWORD", "")
        default_admin_hash = os.getenv("ADMIN_PASSWORD_HASH", "")
        if not default_admin_hash and seed_password:
            default_admin_hash = _hash_seed_password(seed_password)
        return {
            "messages": [],
            "projects": [],
            "project_categories": [],
            "projects_page_config": {
                "id": "default-projects",
                "smallLabel": "PROJECTS",
                "title": "All projects.",
                "subtitle": "",
                "updatedAt": now,
            },
            "experience": [],
            "experience_page_config": {
                "id": "default-experience",
                "smallLabel": "EXPERIENCE",
                "title": "Experience timeline",
                "subtitle": "",
                "showTimeline": True,
                "showCertifications": True,
                "certTitle": "Certifications",
                "certSubtitle": "Selected credentials and achievements.",
                "updatedAt": now,
            },
            "certifications": [],
            "research": [],
            "research_page_config": {
                "id": "default-research",
                "title": "Research",
                "subtitle": "Applied AI/ML research and systems.",
                "description": "",
                "heroChips": [],
                "updatedAt": now,
            },
            "research_filter_tabs": [],
            "site_contents": {
                "home": {
                    "id": "home",
                    "slug": "home",
                    "draftJson": {},
                    "status": "DRAFT",
                    "scheduledAt": None,
                    "createdAt": now,
                    "updatedAt": now,
                },
                "about": {
                    "id": "about",
                    "slug": "about",
                    "draftJson": {},
                    "status": "DRAFT",
                    "scheduledAt": None,
                    "createdAt": now,
                    "updatedAt": now,
                },
            },
            "media": [],
            "resumes": [],
            "seo_configs": [],
            "github_settings": {
                "id": "default",
                "githubUsername": "",
                "enableGitHubDashboard": True,
                "cacheRevalidateSeconds": 900,
                "hiddenRepos": [],
                "pinnedOverrides": [],
                "lastSyncAt": None,
                "lastError": None,
                "rateLimitRemaining": None,
                "updatedAt": now,
            },
            "contact_config": {
                "id": "default-contact",
                "email": "kabirajrana76@gmail.com",
                "locationText": "Kathmandu, Nepal (or Remote)",
                "responseTime": "24-48 hours",
                "socialLinks": {
                    "github": "",
                    "linkedin": "",
                    "additional": [],
                },
                "availabilityEnabled": True,
                "availabilityHeadline": "Available for opportunities",
                "availabilitySubtext": "Open to collaboration and ambitious AI/ML products.",
                "createdAt": now,
                "updatedAt": now,
            },
            "system_settings": {
                "id": "default",
                "siteName": "Kabiraj Rana",
                "primaryEmail": "kabirajrana76@gmail.com",
                "locationText": "Kathmandu, Nepal",
                "responseTimeText": "24-48 hours",
                "availabilityEnabled": True,
                "availabilityHeadline": "Available for opportunities",
                "availabilitySubtext": "Open to collaboration and ambitious AI/ML products.",
                "githubUrl": "",
                "linkedinUrl": "",
                "xUrl": "",
                "accentColor": "cyan",
                "glowIntensity": 0.5,
                "borderRadiusScale": 1,
                "themeMode": "dark",
                "enableProjects": True,
                "enableResearch": True,
                "enableGitHub": True,
                "enableExperience": True,
                "socialLinks": {"github": "", "linkedin": "", "x": ""},
                "maintenanceMode": False,
                "updatedAt": now,
            },
            "audit_logs": [],
            "revisions": [],
            "health_reports": [],
            "admin_users": [
                {
                    "id": "admin-1",
                    "email": default_admin_email,
                    "name": "Admin",
                    "role": "ADMIN",
                    "passwordHash": default_admin_hash,
                    "lastLoginAt": None,
                    "createdAt": now,
                    "updatedAt": now,
                }
            ],
        }

    def _default_experience_rows(self) -> list[dict[str, Any]]:
        now = _utc_now_iso()
        return [
            {
                "id": "exp-1",
                "role": "Full-Stack Developer",
                "org": "Personal Projects & Freelance",
                "timeframe": "2021 – Present",
                "summary": "Building and shipping full-stack products end-to-end with a focus on quality UX, robust architecture, and practical deployment.",
                "techStack": ["Full-Stack Development", "Product Delivery", "Freelance Execution"],
                "achievements": [
                    "Designed and delivered real-world web applications across frontend and backend.",
                    "Implemented scalable APIs, responsive interfaces, and deployment-ready workflows.",
                    "Collaborated directly with requirements and iteration cycles to ship polished outcomes.",
                ],
                "sidePlacement": "AUTO",
                "status": "PUBLISHED",
                "currentRole": True,
                "sortOrder": 0,
                "publishedAt": now,
                "createdAt": now,
                "updatedAt": now,
            },
            {
                "id": "exp-2",
                "role": "Technical Coordinator — College Initiatives",
                "org": "Tribhuvan Modern College",
                "timeframe": "2021 – 2024",
                "summary": "Supported technical planning and system coordination for college-level initiatives.",
                "techStack": ["System Coordination", "Technical Support", "Event Tech Management", "Team Collaboration"],
                "achievements": [
                    "Supported technical planning and system coordination for college-level initiatives.",
                    "Assisted in organizing structured workflows.",
                    "Contributed to reliable execution of events and collaborative technical operations.",
                ],
                "sidePlacement": "AUTO",
                "status": "PUBLISHED",
                "currentRole": False,
                "sortOrder": 1,
                "publishedAt": now,
                "createdAt": now,
                "updatedAt": now,
            },
            {
                "id": "exp-3",
                "role": "Learning Sprint",
                "org": "Continuous capability expansion",
                "timeframe": "Current",
                "summary": "Maintaining rapid learning cycles with real project implementation to improve depth, speed, and craftsmanship.",
                "techStack": ["Research", "Iteration", "Execution"],
                "achievements": [
                    "Studying advanced AI workflows and practical applied research patterns.",
                    "Refining product polish through frequent visual and interaction tuning.",
                    "Expanding full-stack fluency through end-to-end experimentation.",
                ],
                "sidePlacement": "AUTO",
                "status": "PUBLISHED",
                "currentRole": True,
                "sortOrder": 2,
                "publishedAt": now,
                "createdAt": now,
                "updatedAt": now,
            },
        ]

    def _default_certification_rows(self) -> list[dict[str, Any]]:
        now = _utc_now_iso()
        items = [
            ("C1", "IMB Data science Certificate", "https://coursera.org/share/d10000f3f38062a33e79d7e3f942ef32"),
            ("C2", "AI for everyone - Deep Learning.AI", "https://coursera.org/share/bcb1acdf1fe4c763862449ab3095094b"),
            (
                "C3",
                "Data Science with Python",
                "https://broadwayinfosys.com/certificate-verification-code/eyJpdiI6Ii9tRnNnMktZRml0aTZnZHVDRE1rL0E9PSIsInZhbHVlIjoiVDhtZEsvanluQVJzUk0yQjhicjVJZz09IiwibWFjIjoiMmYyNzAyMzhjOTQ0NzA0YzZmYzMzMWJkMDc2MDg1OWJjM2EwMjU1NWJiMTNmMjVkYmJhNTdmOWY3NmNlMjZmYSIsInRhZyI6IiJ9",
            ),
            ("C4", "Generative AI with Large Language Models", "https://coursera.org/share/fdbaa5d73fe1e2d3576c74bfc07fe33e"),
            ("C5", "Machine Learning-Udemy", "https://coursera.org/share/fdbaa5d73fe1e2d3576c74bfc07fe33e"),
        ]
        rows: list[dict[str, Any]] = []
        for idx, (code, title, url) in enumerate(items):
            rows.append(
                {
                    "id": code,
                    "codeLabel": code,
                    "title": title,
                    "credentialUrl": url,
                    "sortOrder": idx,
                    "isVisible": True,
                    "createdAt": now,
                    "updatedAt": now,
                }
            )
        return rows

    def _merge_missing(self, current: dict[str, Any], defaults: dict[str, Any]) -> tuple[dict[str, Any], bool]:
        changed = False
        for key, default_value in defaults.items():
            if key not in current:
                current[key] = json.loads(json.dumps(default_value))
                changed = True
                continue
            if isinstance(default_value, dict) and isinstance(current.get(key), dict):
                _, sub_changed = self._merge_missing(current[key], default_value)
                changed = changed or sub_changed
        return current, changed

    def _normalize_data_unlocked(self, data: dict[str, Any]) -> tuple[dict[str, Any], bool]:
        changed = False
        defaults = self._default_data()

        data, merged_changed = self._merge_missing(data, defaults)
        changed = changed or merged_changed

        if not isinstance(data.get("site_contents"), dict):
            data["site_contents"] = json.loads(json.dumps(defaults["site_contents"]))
            changed = True
        else:
            _, site_changed = self._merge_missing(data["site_contents"], defaults["site_contents"])
            changed = changed or site_changed

        users = data.get("admin_users")
        if not isinstance(users, list) or not users:
            data["admin_users"] = json.loads(json.dumps(defaults["admin_users"]))
            changed = True
        else:
            first = users[0] if isinstance(users[0], dict) else {}
            seed_email = os.getenv("ADMIN_SEED_EMAIL", "").strip().lower()
            seed_password = os.getenv("ADMIN_SEED_PASSWORD", "")
            configured_email = seed_email or os.getenv("ADMIN_SEED_EMAIL", defaults["admin_users"][0]["email"])

            if seed_email and str(first.get("email", "")).strip().lower() != seed_email:
                first["email"] = seed_email
                changed = True

            if not str(first.get("email", "")).strip():
                first["email"] = configured_email
                changed = True

            env_admin_hash = os.getenv("ADMIN_PASSWORD_HASH", "")
            if "passwordHash" not in first:
                first["passwordHash"] = env_admin_hash or defaults["admin_users"][0]["passwordHash"]
                changed = True

            if seed_email and str(first.get("email", "")).strip().lower() == seed_email and seed_password:
                current_hash = str(first.get("passwordHash", ""))
                if not _seed_password_matches_hash(seed_password, current_hash):
                    first["passwordHash"] = _hash_seed_password(seed_password)
                    changed = True

            if "role" not in first:
                first["role"] = "ADMIN"
                changed = True
            if "id" not in first:
                first["id"] = "admin-1"
                changed = True
            users[0] = first
            data["admin_users"] = users

        experience_rows = data.get("experience")
        if not isinstance(experience_rows, list):
            data["experience"] = self._default_experience_rows()
            changed = True
        else:
            placeholder = bool(experience_rows) and all(str(item.get("role", "")).strip().lower() in {"tester", ""} for item in experience_rows if isinstance(item, dict))
            if not experience_rows or placeholder:
                data["experience"] = self._default_experience_rows()
                changed = True

        cert_rows = data.get("certifications")
        if not isinstance(cert_rows, list) or len(cert_rows) < 3:
            data["certifications"] = self._default_certification_rows()
            changed = True

        return data, changed

    def _ensure_file(self) -> None:
        if self.file_path.exists():
            return

        self.file_path.parent.mkdir(parents=True, exist_ok=True)
        self._write_unlocked(self._default_data())

    def _read_unlocked(self) -> dict[str, Any]:
        self._ensure_file()
        with self.file_path.open("r", encoding="utf-8-sig") as handle:
            data = json.load(handle)
        if not isinstance(data, dict):
            data = self._default_data()
            self._write_unlocked(data)
            return data

        normalized, changed = self._normalize_data_unlocked(data)
        if changed:
            self._write_unlocked(normalized)
        return normalized

    def _write_unlocked(self, data: dict[str, Any]) -> None:
        self.file_path.parent.mkdir(parents=True, exist_ok=True)
        with NamedTemporaryFile("w", delete=False, dir=str(self.file_path.parent), encoding="utf-8") as tmp_file:
            json.dump(data, tmp_file, ensure_ascii=True, indent=2)
            tmp_name = tmp_file.name
        Path(tmp_name).replace(self.file_path)

    def list_messages(self, status: str | None = None) -> list[dict[str, Any]]:
        with self._lock:
            data = self._read_unlocked()
            messages = list(data.get("messages", []))
            if status:
                messages = [item for item in messages if str(item.get("status", "")) == status]
            messages.sort(key=lambda item: str(item.get("createdAt", "")), reverse=True)
            return messages

    def count_unread_messages(self) -> int:
        return sum(1 for item in self.list_messages() if str(item.get("status")) == "UNREAD")

    def create_message(self, payload: dict[str, Any]) -> dict[str, Any]:
        with self._lock:
            data = self._read_unlocked()
            messages = list(data.get("messages", []))
            now = _utc_now_iso()
            message = {
                "id": str(uuid4()),
                "sender": str(payload.get("sender", "Anonymous")),
                "email": str(payload.get("email", "")),
                "subject": str(payload.get("subject", "General Inquiry")),
                "body": str(payload.get("body", "")),
                "status": "UNREAD",
                "ipAddress": payload.get("ipAddress"),
                "userAgent": payload.get("userAgent"),
                "metadata": payload.get("metadata") if isinstance(payload.get("metadata"), dict) else {},
                "createdAt": now,
                "updatedAt": now,
            }
            messages.append(message)
            data["messages"] = messages
            self._write_unlocked(data)
            return message

    def _collection_list(self, data: dict[str, Any], key: str) -> list[dict[str, Any]]:
        return [item for item in _as_list(data.get(key)) if isinstance(item, dict)]

    def _find_index(self, rows: list[dict[str, Any]], row_id: str) -> int:
        for idx, row in enumerate(rows):
            if str(row.get("id")) == row_id:
                return idx
        return -1

    def _upsert_in_collection(self, data: dict[str, Any], key: str, payload: dict[str, Any], row_id: str | None = None) -> dict[str, Any]:
        rows = self._collection_list(data, key)
        now = _utc_now_iso()

        candidate_id = row_id or str(payload.get("id") or "") or str(uuid4())
        idx = self._find_index(rows, candidate_id)
        existing = rows[idx] if idx >= 0 else {}

        merged = {
            **existing,
            **payload,
            "id": candidate_id,
            "createdAt": existing.get("createdAt") or now,
            "updatedAt": now,
        }

        if idx >= 0:
            rows[idx] = merged
        else:
            rows.append(merged)

        data[key] = rows
        return merged

    def _delete_from_collection(self, data: dict[str, Any], key: str, row_id: str) -> bool:
        rows = self._collection_list(data, key)
        remaining = [row for row in rows if str(row.get("id")) != row_id]
        if len(remaining) == len(rows):
            return False
        data[key] = remaining
        return True

    def _reorder_collection(self, data: dict[str, Any], key: str, ids: list[str]) -> list[dict[str, Any]]:
        rows = self._collection_list(data, key)
        order = {row_id: index for index, row_id in enumerate(ids)}
        for row in rows:
            row_id = str(row.get("id") or "")
            if row_id in order:
                row["sortOrder"] = order[row_id]
                row["updatedAt"] = _utc_now_iso()
        rows.sort(key=lambda row: int(row.get("sortOrder", 0)))
        data[key] = rows
        return rows

    def _get_config(self, data: dict[str, Any], key: str, default_key: str) -> dict[str, Any]:
        value = data.get(key)
        if isinstance(value, dict):
            return value
        default_value = self._default_data()[default_key]
        data[key] = default_value
        return default_value

    def _upsert_config(self, data: dict[str, Any], key: str, default_key: str, payload: dict[str, Any]) -> dict[str, Any]:
        current = self._get_config(data, key, default_key)
        updated = {
            **current,
            **payload,
            "id": str(payload.get("id") or current.get("id") or default_key),
            "updatedAt": _utc_now_iso(),
        }
        if not updated.get("createdAt"):
            updated["createdAt"] = _utc_now_iso()
        data[key] = updated
        return updated

    def _get_site_content(self, data: dict[str, Any], slug: str) -> dict[str, Any]:
        site_contents = data.get("site_contents")
        if not isinstance(site_contents, dict):
            site_contents = {}
        current = site_contents.get(slug)
        if isinstance(current, dict):
            return current
        default_row = {
            "id": slug,
            "slug": slug,
            "draftJson": {},
            "status": "DRAFT",
            "scheduledAt": None,
            "createdAt": _utc_now_iso(),
            "updatedAt": _utc_now_iso(),
        }
        site_contents[slug] = default_row
        data["site_contents"] = site_contents
        return default_row

    def get_home_content(self) -> dict[str, Any]:
        with self._lock:
            data = self._read_unlocked()
            row = self._get_site_content(data, "home")
            self._write_unlocked(data)
            return row

    def upsert_home_content(self, payload: dict[str, Any]) -> dict[str, Any]:
        with self._lock:
            data = self._read_unlocked()
            current = self._get_site_content(data, "home")
            updated = {
                **current,
                "draftJson": payload.get("data") if isinstance(payload.get("data"), dict) else current.get("draftJson", {}),
                "status": str(payload.get("status") or current.get("status") or "DRAFT"),
                "scheduledAt": payload.get("scheduledAt"),
                "updatedAt": _utc_now_iso(),
            }
            data.setdefault("site_contents", {})["home"] = updated
            self._write_unlocked(data)
            return updated

    def get_about_content(self) -> dict[str, Any]:
        with self._lock:
            data = self._read_unlocked()
            row = self._get_site_content(data, "about")
            self._write_unlocked(data)
            return row

    def upsert_about_content(self, payload: dict[str, Any]) -> dict[str, Any]:
        with self._lock:
            data = self._read_unlocked()
            current = self._get_site_content(data, "about")
            updated = {
                **current,
                "draftJson": payload.get("data") if isinstance(payload.get("data"), dict) else current.get("draftJson", {}),
                "status": str(payload.get("status") or current.get("status") or "DRAFT"),
                "scheduledAt": payload.get("scheduledAt"),
                "updatedAt": _utc_now_iso(),
            }
            data.setdefault("site_contents", {})["about"] = updated
            self._write_unlocked(data)
            return updated

    def list_projects(self, where: dict[str, Any] | None = None) -> list[dict[str, Any]]:
        with self._lock:
            data = self._read_unlocked()
            rows = self._collection_list(data, "projects")
            if where:
                status = where.get("status")
                if status:
                    rows = [row for row in rows if str(row.get("status")) == str(status)]
            rows.sort(key=lambda row: (int(row.get("sortOrder", 0)), str(row.get("createdAt", ""))))
            return rows

    def list_projects_paged(self, query: str | None, category: str | None, status: str | None, page: int, page_size: int) -> tuple[list[dict[str, Any]], int]:
        rows = self.list_projects()
        if query:
            rows = [row for row in rows if _contains_text(row.get("title"), query) or _contains_text(row.get("summary"), query)]
        if category and category.lower() != "all":
            rows = [row for row in rows if str(row.get("category", "")).lower() == category.lower()]
        if status:
            rows = [row for row in rows if str(row.get("status", "")).upper() == status.upper()]
        total = len(rows)
        start = max(page - 1, 0) * max(page_size, 1)
        end = start + max(page_size, 1)
        return rows[start:end], total

    def upsert_project(self, payload: dict[str, Any], project_id: str | None = None) -> dict[str, Any]:
        with self._lock:
            data = self._read_unlocked()
            row = self._upsert_in_collection(data, "projects", payload, project_id)
            self._write_unlocked(data)
            return row

    def delete_project(self, project_id: str) -> bool:
        with self._lock:
            data = self._read_unlocked()
            deleted = self._delete_from_collection(data, "projects", project_id)
            if deleted:
                self._write_unlocked(data)
            return deleted

    def reorder_projects(self, ids: list[str]) -> list[dict[str, Any]]:
        with self._lock:
            data = self._read_unlocked()
            rows = self._reorder_collection(data, "projects", ids)
            self._write_unlocked(data)
            return rows

    def find_project_by_slug(self, slug: str) -> dict[str, Any] | None:
        rows = self.list_projects()
        for row in rows:
            if str(row.get("slug", "")) == slug:
                return row
        return None

    def list_project_categories(self) -> list[dict[str, Any]]:
        with self._lock:
            data = self._read_unlocked()
            rows = self._collection_list(data, "project_categories")
            rows.sort(key=lambda row: int(row.get("sortOrder", 0)))
            return rows

    def upsert_project_category(self, payload: dict[str, Any], category_id: str | None = None) -> dict[str, Any]:
        with self._lock:
            data = self._read_unlocked()
            row = self._upsert_in_collection(data, "project_categories", payload, category_id)
            self._write_unlocked(data)
            return row

    def delete_project_category(self, category_id: str) -> bool:
        with self._lock:
            data = self._read_unlocked()
            deleted = self._delete_from_collection(data, "project_categories", category_id)
            if deleted:
                self._write_unlocked(data)
            return deleted

    def reorder_project_categories(self, ids: list[str]) -> list[dict[str, Any]]:
        with self._lock:
            data = self._read_unlocked()
            rows = self._reorder_collection(data, "project_categories", ids)
            self._write_unlocked(data)
            return rows

    def get_projects_page_config(self) -> dict[str, Any]:
        with self._lock:
            data = self._read_unlocked()
            row = self._get_config(data, "projects_page_config", "projects_page_config")
            self._write_unlocked(data)
            return row

    def upsert_projects_page_config(self, payload: dict[str, Any]) -> dict[str, Any]:
        with self._lock:
            data = self._read_unlocked()
            row = self._upsert_config(data, "projects_page_config", "projects_page_config", payload)
            self._write_unlocked(data)
            return row

    def list_experience(self) -> list[dict[str, Any]]:
        with self._lock:
            data = self._read_unlocked()
            rows = self._collection_list(data, "experience")
            rows.sort(key=lambda row: (int(row.get("sortOrder", 0)), str(row.get("createdAt", ""))))
            return rows

    def upsert_experience(self, payload: dict[str, Any], experience_id: str | None = None) -> dict[str, Any]:
        with self._lock:
            data = self._read_unlocked()
            row = self._upsert_in_collection(data, "experience", payload, experience_id)
            self._write_unlocked(data)
            return row

    def delete_experience(self, experience_id: str) -> bool:
        with self._lock:
            data = self._read_unlocked()
            deleted = self._delete_from_collection(data, "experience", experience_id)
            if deleted:
                self._write_unlocked(data)
            return deleted

    def reorder_experience(self, ids: list[str]) -> list[dict[str, Any]]:
        with self._lock:
            data = self._read_unlocked()
            rows = self._reorder_collection(data, "experience", ids)
            self._write_unlocked(data)
            return rows

    def get_experience_page_config(self) -> dict[str, Any]:
        with self._lock:
            data = self._read_unlocked()
            row = self._get_config(data, "experience_page_config", "experience_page_config")
            self._write_unlocked(data)
            return row

    def upsert_experience_page_config(self, payload: dict[str, Any]) -> dict[str, Any]:
        with self._lock:
            data = self._read_unlocked()
            row = self._upsert_config(data, "experience_page_config", "experience_page_config", payload)
            self._write_unlocked(data)
            return row

    def list_certifications(self, visible_only: bool = False) -> list[dict[str, Any]]:
        with self._lock:
            data = self._read_unlocked()
            rows = self._collection_list(data, "certifications")
            if visible_only:
                rows = [row for row in rows if bool(row.get("isVisible", True))]
            rows.sort(key=lambda row: int(row.get("sortOrder", 0)))
            return rows

    def upsert_certification(self, payload: dict[str, Any], certification_id: str | None = None) -> dict[str, Any]:
        with self._lock:
            data = self._read_unlocked()
            row = self._upsert_in_collection(data, "certifications", payload, certification_id)
            self._write_unlocked(data)
            return row

    def delete_certification(self, certification_id: str) -> bool:
        with self._lock:
            data = self._read_unlocked()
            deleted = self._delete_from_collection(data, "certifications", certification_id)
            if deleted:
                self._write_unlocked(data)
            return deleted

    def list_research(self, where: dict[str, Any] | None = None) -> list[dict[str, Any]]:
        with self._lock:
            data = self._read_unlocked()
            rows = self._collection_list(data, "research")
            if where:
                status = where.get("status")
                if status:
                    rows = [row for row in rows if str(row.get("status")) == str(status)]
            rows.sort(key=lambda row: (int(row.get("year", 0)), str(row.get("publishedAt") or "")), reverse=True)
            return rows

    def list_research_paged(self, query: str | None, status: str | None, entry_type: str | None, year: int | None, tag: str | None, page: int, page_size: int) -> tuple[list[dict[str, Any]], int]:
        rows = self.list_research()
        if query:
            rows = [row for row in rows if _contains_text(row.get("title"), query) or _contains_text(row.get("summary"), query)]
        if status:
            rows = [row for row in rows if str(row.get("status", "")).upper() == status.upper()]
        if entry_type:
            rows = [row for row in rows if str(row.get("type", "")).upper() == entry_type.upper()]
        if year:
            rows = [row for row in rows if int(row.get("year", 0)) == int(year)]
        if tag:
            rows = [row for row in rows if tag in [str(item) for item in _as_list(row.get("tags"))]]
        total = len(rows)
        start = max(page - 1, 0) * max(page_size, 1)
        end = start + max(page_size, 1)
        return rows[start:end], total

    def get_research_by_slug(self, slug: str) -> dict[str, Any] | None:
        rows = self.list_research()
        for row in rows:
            if str(row.get("slug", "")) == slug:
                return row
        return None

    def get_research_by_id(self, entry_id: str) -> dict[str, Any] | None:
        rows = self.list_research()
        for row in rows:
            if str(row.get("id", "")) == entry_id:
                return row
        return None

    def list_related_research(self, slugs: list[str], exclude_id: str | None = None) -> list[dict[str, Any]]:
        slug_set = {slug for slug in slugs if slug}
        rows = [row for row in self.list_research() if str(row.get("slug")) in slug_set]
        if exclude_id:
            rows = [row for row in rows if str(row.get("id")) != exclude_id]
        return rows

    def get_adjacent_research(self, payload: dict[str, Any]) -> tuple[dict[str, Any] | None, dict[str, Any] | None]:
        target_id = str(payload.get("id") or "")
        target_year = int(payload.get("year") or 0)
        status = str(payload.get("status") or "")
        rows = self.list_research()
        if status:
            rows = [row for row in rows if str(row.get("status", "")).upper() == status.upper()]
        rows.sort(key=lambda row: (int(row.get("year", 0)), str(row.get("publishedAt") or ""), str(row.get("createdAt") or "")))
        current_index = -1
        for idx, row in enumerate(rows):
            if str(row.get("id", "")) == target_id:
                current_index = idx
                break
        if current_index < 0:
            rows_by_year = [row for row in rows if int(row.get("year", 0)) == target_year]
            if not rows_by_year:
                return None, None
            rows = rows_by_year
            current_index = 0
        prev_row = rows[current_index - 1] if current_index - 1 >= 0 else None
        next_row = rows[current_index + 1] if current_index + 1 < len(rows) else None
        return prev_row, next_row

    def upsert_research(self, payload: dict[str, Any], entry_id: str | None = None) -> dict[str, Any]:
        with self._lock:
            data = self._read_unlocked()
            row = self._upsert_in_collection(data, "research", payload, entry_id)
            self._write_unlocked(data)
            return row

    def delete_research(self, entry_id: str) -> bool:
        with self._lock:
            data = self._read_unlocked()
            deleted = self._delete_from_collection(data, "research", entry_id)
            if deleted:
                self._write_unlocked(data)
            return deleted

    def reorder_research(self, ids: list[str]) -> list[dict[str, Any]]:
        with self._lock:
            data = self._read_unlocked()
            rows = self._reorder_collection(data, "research", ids)
            self._write_unlocked(data)
            return rows

    def get_research_page_config(self) -> dict[str, Any]:
        with self._lock:
            data = self._read_unlocked()
            row = self._get_config(data, "research_page_config", "research_page_config")
            self._write_unlocked(data)
            return row

    def upsert_research_page_config(self, payload: dict[str, Any]) -> dict[str, Any]:
        with self._lock:
            data = self._read_unlocked()
            row = self._upsert_config(data, "research_page_config", "research_page_config", payload)
            self._write_unlocked(data)
            return row

    def list_research_filter_tabs(self, visible_only: bool = False) -> list[dict[str, Any]]:
        with self._lock:
            data = self._read_unlocked()
            rows = self._collection_list(data, "research_filter_tabs")
            if visible_only:
                rows = [row for row in rows if bool(row.get("isVisible", True))]
            rows.sort(key=lambda row: int(row.get("sortOrder", 0)))
            return rows

    def upsert_research_filter_tab(self, payload: dict[str, Any], tab_id: str | None = None) -> dict[str, Any]:
        with self._lock:
            data = self._read_unlocked()
            row = self._upsert_in_collection(data, "research_filter_tabs", payload, tab_id)
            self._write_unlocked(data)
            return row

    def delete_research_filter_tab(self, tab_id: str) -> bool:
        with self._lock:
            data = self._read_unlocked()
            deleted = self._delete_from_collection(data, "research_filter_tabs", tab_id)
            if deleted:
                self._write_unlocked(data)
            return deleted

    def list_media(self, search: str | None = None) -> list[dict[str, Any]]:
        with self._lock:
            data = self._read_unlocked()
            rows = self._collection_list(data, "media")
            if search:
                rows = [row for row in rows if _contains_text(row.get("key"), search) or _contains_text(row.get("url"), search)]
            rows.sort(key=lambda row: str(row.get("createdAt", "")), reverse=True)
            return rows

    def create_media(self, payload: dict[str, Any]) -> dict[str, Any]:
        with self._lock:
            data = self._read_unlocked()
            row = self._upsert_in_collection(data, "media", payload)
            self._write_unlocked(data)
            return row

    def list_resumes(self) -> list[dict[str, Any]]:
        with self._lock:
            data = self._read_unlocked()
            rows = self._collection_list(data, "resumes")
            rows.sort(key=lambda row: str(row.get("createdAt", "")), reverse=True)
            return rows

    def create_resume(self, payload: dict[str, Any]) -> dict[str, Any]:
        with self._lock:
            data = self._read_unlocked()
            row = self._upsert_in_collection(data, "resumes", {**payload, "downloadCount": int(payload.get("downloadCount", 0))})
            if bool(row.get("isActive")):
                for item in self._collection_list(data, "resumes"):
                    if str(item.get("id")) != str(row.get("id")):
                        item["isActive"] = False
            self._write_unlocked(data)
            return row

    def activate_resume(self, resume_id: str) -> dict[str, Any] | None:
        with self._lock:
            data = self._read_unlocked()
            rows = self._collection_list(data, "resumes")
            target: dict[str, Any] | None = None
            for row in rows:
                row["isActive"] = str(row.get("id")) == resume_id
                if row["isActive"]:
                    row["updatedAt"] = _utc_now_iso()
                    target = row
            if target is None:
                return None
            data["resumes"] = rows
            self._write_unlocked(data)
            return target

    def list_seo_configs(self) -> list[dict[str, Any]]:
        with self._lock:
            data = self._read_unlocked()
            rows = self._collection_list(data, "seo_configs")
            rows.sort(key=lambda row: str(row.get("pageKey", "")))
            return rows

    def upsert_seo_config(self, payload: dict[str, Any]) -> dict[str, Any]:
        with self._lock:
            data = self._read_unlocked()
            page_key = str(payload.get("pageKey") or "home")
            rows = self._collection_list(data, "seo_configs")
            target_id = None
            for row in rows:
                if str(row.get("pageKey")) == page_key:
                    target_id = str(row.get("id"))
                    break
            row = self._upsert_in_collection(data, "seo_configs", payload, target_id)
            self._write_unlocked(data)
            return row

    def get_github_settings(self) -> dict[str, Any]:
        with self._lock:
            data = self._read_unlocked()
            row = self._get_config(data, "github_settings", "github_settings")
            self._write_unlocked(data)
            return row

    def upsert_github_settings(self, payload: dict[str, Any]) -> dict[str, Any]:
        with self._lock:
            data = self._read_unlocked()
            row = self._upsert_config(data, "github_settings", "github_settings", payload)
            self._write_unlocked(data)
            return row

    def list_audit_logs(
        self,
        entity_type: str | None = None,
        action: str | None = None,
        start_date: datetime | None = None,
        end_date: datetime | None = None,
    ) -> list[dict[str, Any]]:
        with self._lock:
            data = self._read_unlocked()
            rows = self._collection_list(data, "audit_logs")
            if entity_type:
                rows = [row for row in rows if str(row.get("entityType") or row.get("resource") or "").lower() == entity_type.lower()]
            if action:
                rows = [row for row in rows if str(row.get("action") or "").lower() == action.lower()]
            if start_date:
                rows = [row for row in rows if (_parse_iso(row.get("createdAt")) or datetime.min.replace(tzinfo=timezone.utc)) >= start_date]
            if end_date:
                rows = [row for row in rows if (_parse_iso(row.get("createdAt")) or datetime.min.replace(tzinfo=timezone.utc)) <= end_date]
            rows.sort(key=lambda row: str(row.get("createdAt", "")), reverse=True)
            return rows

    def create_audit_log(self, payload: dict[str, Any]) -> dict[str, Any]:
        with self._lock:
            data = self._read_unlocked()
            rows = self._collection_list(data, "audit_logs")
            now = _utc_now_iso()
            actor_email = str(payload.get("actorEmail") or "")
            actor_name = str(payload.get("actorName") or "")
            row = {
                "id": str(uuid4()),
                "actorId": payload.get("actorId") or payload.get("actorAdminId"),
                "actor": {
                    "name": actor_name or None,
                    "email": actor_email or None,
                },
                "action": payload.get("action"),
                "resource": payload.get("resource"),
                "resourceId": payload.get("resourceId"),
                "entityType": payload.get("entityType") or payload.get("resource"),
                "entityId": payload.get("entityId") or payload.get("resourceId"),
                "summary": payload.get("summary"),
                "metadata": payload.get("metadata"),
                "ip": payload.get("ip"),
                "userAgent": payload.get("userAgent"),
                "createdAt": now,
                "updatedAt": now,
            }
            rows.append(row)
            data["audit_logs"] = rows
            self._write_unlocked(data)
            return row

    def create_revision(self, payload: dict[str, Any]) -> dict[str, Any]:
        with self._lock:
            data = self._read_unlocked()
            rows = self._collection_list(data, "revisions")
            entity_type = str(payload.get("entityType") or "")
            entity_id = str(payload.get("entityId") or "")
            version_number = 1 + sum(1 for row in rows if str(row.get("entityType")) == entity_type and str(row.get("entityId")) == entity_id)
            row = {
                "id": str(uuid4()),
                "entityType": entity_type,
                "entityId": entity_id,
                "action": payload.get("action"),
                "actorAdminId": payload.get("actorAdminId"),
                "snapshot": payload.get("snapshot"),
                "versionNumber": version_number,
                "createdAt": _utc_now_iso(),
            }
            rows.append(row)
            data["revisions"] = rows
            self._write_unlocked(data)
            return row

    def list_revisions(self, entity_type: str, entity_id: str) -> list[dict[str, Any]]:
        with self._lock:
            data = self._read_unlocked()
            rows = self._collection_list(data, "revisions")
            rows = [row for row in rows if str(row.get("entityType")) == entity_type and str(row.get("entityId")) == entity_id]
            rows.sort(key=lambda row: int(row.get("versionNumber", 0)), reverse=True)
            return rows

    def restore_revision(self, revision_id: str, actor_admin_id: str | None = None) -> dict[str, Any] | None:
        with self._lock:
            data = self._read_unlocked()
            revisions = self._collection_list(data, "revisions")
            target = next((row for row in revisions if str(row.get("id")) == revision_id), None)
            if not target:
                return None
            snapshot = target.get("snapshot")
            if isinstance(snapshot, dict):
                entity_type = str(target.get("entityType") or "")
                entity_id = str(target.get("entityId") or "")
                if entity_type == "Project":
                    self._upsert_in_collection(data, "projects", snapshot, entity_id)
                elif entity_type == "Experience":
                    self._upsert_in_collection(data, "experience", snapshot, entity_id)
                elif entity_type == "Research":
                    self._upsert_in_collection(data, "research", snapshot, entity_id)
                elif entity_type == "SiteContent":
                    slug = str(snapshot.get("slug") or entity_id or "home")
                    current = self._get_site_content(data, slug)
                    data.setdefault("site_contents", {})[slug] = {
                        **current,
                        **snapshot,
                        "updatedAt": _utc_now_iso(),
                    }

                version_number = 1 + sum(
                    1
                    for row in revisions
                    if str(row.get("entityType")) == entity_type and str(row.get("entityId")) == entity_id
                )
                revisions.append(
                    {
                        "id": str(uuid4()),
                        "entityType": entity_type,
                        "entityId": entity_id,
                        "action": "RESTORE",
                        "actorAdminId": actor_admin_id,
                        "snapshot": snapshot,
                        "versionNumber": version_number,
                        "createdAt": _utc_now_iso(),
                    }
                )
                data["revisions"] = revisions
            self._write_unlocked(data)
            return {"entityType": target.get("entityType"), "entityId": target.get("entityId")}

    def create_health_report(self, payload: dict[str, Any]) -> dict[str, Any]:
        with self._lock:
            data = self._read_unlocked()
            rows = self._collection_list(data, "health_reports")
            row = {
                "id": str(uuid4()),
                "checks": payload.get("checks") if isinstance(payload.get("checks"), list) else [],
                "warnings": int(payload.get("warnings", 0)),
                "errors": int(payload.get("errors", 0)),
                "summary": str(payload.get("summary") or ""),
                "createdAt": _utc_now_iso(),
            }
            rows.append(row)
            data["health_reports"] = rows
            self._write_unlocked(data)
            return row

    def get_latest_health_report(self) -> dict[str, Any] | None:
        with self._lock:
            data = self._read_unlocked()
            rows = self._collection_list(data, "health_reports")
            if not rows:
                return None
            rows.sort(key=lambda row: str(row.get("createdAt", "")), reverse=True)
            return rows[0]

    def get_admin_user_by_email(self, email: str) -> dict[str, Any] | None:
        with self._lock:
            data = self._read_unlocked()
            users = self._collection_list(data, "admin_users")
            target_email = email.strip().lower()
            for row in users:
                if str(row.get("email", "")).strip().lower() == target_email:
                    return row
            return None

    def touch_admin_last_login(self, user_id: str) -> dict[str, Any] | None:
        with self._lock:
            data = self._read_unlocked()
            users = self._collection_list(data, "admin_users")
            now = _utc_now_iso()
            target = None
            for row in users:
                if str(row.get("id")) == user_id:
                    row["lastLoginAt"] = now
                    row["updatedAt"] = now
                    target = row
                    break
            if target is None:
                return None
            data["admin_users"] = users
            self._write_unlocked(data)
            return target

    def auto_publish_scheduled_content(self) -> dict[str, int]:
        with self._lock:
            data = self._read_unlocked()
            now = datetime.now(timezone.utc)

            def publish_rows(key: str) -> int:
                count = 0
                rows = self._collection_list(data, key)
                for row in rows:
                    if str(row.get("status", "")).upper() != "SCHEDULED":
                        continue
                    scheduled = _parse_iso(row.get("scheduledAt"))
                    if scheduled and scheduled <= now:
                        row["status"] = "PUBLISHED"
                        row["publishedAt"] = _utc_now_iso()
                        row["updatedAt"] = _utc_now_iso()
                        count += 1
                data[key] = rows
                return count

            projects = publish_rows("projects")
            experiences = publish_rows("experience")
            research = publish_rows("research")

            site_count = 0
            site_contents = data.get("site_contents") if isinstance(data.get("site_contents"), dict) else {}
            for key, row in site_contents.items():
                if not isinstance(row, dict):
                    continue
                if str(row.get("status", "")).upper() != "SCHEDULED":
                    continue
                scheduled = _parse_iso(row.get("scheduledAt"))
                if scheduled and scheduled <= now:
                    row["status"] = "PUBLISHED"
                    row["updatedAt"] = _utc_now_iso()
                    site_count += 1
                    site_contents[key] = row
            data["site_contents"] = site_contents

            self._write_unlocked(data)
            total = projects + experiences + research + site_count
            return {
                "projects": projects,
                "experiences": experiences,
                "research": research,
                "siteContents": site_count,
                "total": total,
            }

    def update_message_status(self, message_id: str, status: str) -> dict[str, Any] | None:
        with self._lock:
            data = self._read_unlocked()
            messages = list(data.get("messages", []))
            now = _utc_now_iso()
            updated: dict[str, Any] | None = None
            for item in messages:
                if str(item.get("id")) != message_id:
                    continue
                item["status"] = status
                item["updatedAt"] = now
                updated = item
                break

            if updated is None:
                return None

            data["messages"] = messages
            self._write_unlocked(data)
            return updated

    def delete_message(self, message_id: str) -> bool:
        with self._lock:
            data = self._read_unlocked()
            messages = list(data.get("messages", []))
            remaining = [item for item in messages if str(item.get("id")) != message_id]
            if len(remaining) == len(messages):
                return False

            data["messages"] = remaining
            self._write_unlocked(data)
            return True

    def get_contact_config(self) -> dict[str, Any]:
        with self._lock:
            data = self._read_unlocked()
            config = data.get("contact_config")
            if isinstance(config, dict):
                return config
            default_config = self._default_data()["contact_config"]
            data["contact_config"] = default_config
            self._write_unlocked(data)
            return default_config

    def upsert_contact_config(self, payload: dict[str, Any]) -> dict[str, Any]:
        with self._lock:
            data = self._read_unlocked()
            current = data.get("contact_config")
            if not isinstance(current, dict):
                current = self._default_data()["contact_config"]
            now = _utc_now_iso()
            updated = {
                **current,
                "id": str(payload.get("id") or current.get("id") or "default-contact"),
                "email": str(payload.get("email") or current.get("email") or ""),
                "locationText": str(payload.get("locationText") or current.get("locationText") or ""),
                "responseTime": str(payload.get("responseTime") or current.get("responseTime") or ""),
                "socialLinks": payload.get("socialLinks") if isinstance(payload.get("socialLinks"), dict) else current.get("socialLinks", {}),
                "availabilityEnabled": bool(payload.get("availabilityEnabled", current.get("availabilityEnabled", True))),
                "availabilityHeadline": str(payload.get("availabilityHeadline") or current.get("availabilityHeadline") or ""),
                "availabilitySubtext": str(payload.get("availabilitySubtext") or current.get("availabilitySubtext") or ""),
                "updatedAt": now,
            }
            if not updated.get("createdAt"):
                updated["createdAt"] = now

            data["contact_config"] = updated
            self._write_unlocked(data)
            return updated

    def get_system_settings(self) -> dict[str, Any]:
        with self._lock:
            data = self._read_unlocked()
            settings = data.get("system_settings")
            if isinstance(settings, dict):
                return settings
            default_settings = self._default_data()["system_settings"]
            data["system_settings"] = default_settings
            self._write_unlocked(data)
            return default_settings

    def upsert_system_settings(self, payload: dict[str, Any]) -> dict[str, Any]:
        with self._lock:
            data = self._read_unlocked()
            current = data.get("system_settings")
            if not isinstance(current, dict):
                current = self._default_data()["system_settings"]
            updated = {
                **current,
                **payload,
                "id": str(payload.get("id") or current.get("id") or "default"),
                "enableProjects": bool(payload.get("enableProjects", current.get("enableProjects", True))),
                "enableResearch": bool(payload.get("enableResearch", current.get("enableResearch", True))),
                "enableGitHub": bool(payload.get("enableGitHub", current.get("enableGitHub", True))),
                "enableExperience": bool(payload.get("enableExperience", current.get("enableExperience", True))),
                "maintenanceMode": bool(payload.get("maintenanceMode", current.get("maintenanceMode", False))),
                "updatedAt": _utc_now_iso(),
            }
            if not isinstance(updated.get("socialLinks"), dict):
                updated["socialLinks"] = current.get("socialLinks") if isinstance(current.get("socialLinks"), dict) else {"github": "", "linkedin": "", "x": ""}
            data["system_settings"] = updated
            self._write_unlocked(data)
            return updated


_store: JsonAdminStore | None = None


def get_admin_store() -> JsonAdminStore:
    global _store
    if _store is None:
        root = Path(__file__).resolve().parents[2]
        _store = JsonAdminStore(root / ".data" / "admin_store.json")
    return _store
