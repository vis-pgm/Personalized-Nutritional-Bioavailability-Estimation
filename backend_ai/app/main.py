from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session

# Import our new database modules
from app.core.database import engine, get_db, Base
from app.models.proxy_profile import ProxyProfile
from app.models.schemas import ProxyProfileCreate, ProxyProfileResponse

# Automatically create the database tables on startup (Great for MVPs)
Base.metadata.create_all(bind=engine)

app = FastAPI(title="Bioavailability Estimator API", version="0.1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/api/v1/health")
async def health_check():
    return {"status": "healthy", "message": "FastAPI is running."}

# The new endpoint to save quiz data
@app.post("/api/v1/proxy-profile", response_model=ProxyProfileResponse)
def create_proxy_profile(profile: ProxyProfileCreate, db: Session = Depends(get_db)):
    # Create the SQLAlchemy object
    db_profile = ProxyProfile(
        age=profile.age,
        biological_sex=profile.biological_sex,
        antibiotic_history_6_months=profile.antibiotic_history_6_months,
        daily_fiber_grams=profile.daily_fiber_grams,
        vegetarian_or_vegan=profile.vegetarian_or_vegan
    )
    
    # Save it to Postgres
    db.add(db_profile)
    db.commit()
    db.refresh(db_profile)
    
    return db_profile