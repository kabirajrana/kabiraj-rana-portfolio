from fastapi import APIRouter


router = APIRouter()


@router.post("")
def submit_contact():
    return {"ok": True}
