from __future__ import annotations
from datetime import datetime, timezone
from pathlib import Path
from sqlalchemy import create_engine, Integer, String, Float, DateTime, func
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column, Session

DB_PATH = Path(__file__).resolve().parents[2] / "password_analyzer.db"
engine = create_engine(f"sqlite:///{DB_PATH}", connect_args={"check_same_thread": False})

class Base(DeclarativeBase):
    pass

class Analysis(Base):
    __tablename__ = "analyses"
    analysis_id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    score: Mapped[int] = mapped_column(Integer)
    classification: Mapped[str] = mapped_column(String(20))
    password_length: Mapped[int] = mapped_column(Integer)
    unique_character_ratio: Mapped[float] = mapped_column(Float)
    weakness_count: Mapped[int] = mapped_column(Integer)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=lambda: datetime.now(timezone.utc))

class Finding(Base):
    __tablename__ = "findings"
    finding_id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    analysis_id: Mapped[int] = mapped_column(Integer)
    finding_type: Mapped[str] = mapped_column(String(50))
    severity: Mapped[str] = mapped_column(String(20))
    description: Mapped[str] = mapped_column(String(300))

Base.metadata.create_all(engine)


def save_analysis(result: dict) -> int:
    with Session(engine) as session:
        row = Analysis(
            score=result["score"],
            classification=result["classification"],
            password_length=result["metrics"]["length"],
            unique_character_ratio=result["metrics"]["unique_character_ratio"],
            weakness_count=len(result["findings"]),
        )
        session.add(row)
        session.flush()
        for finding in result["findings"]:
            session.add(Finding(
                analysis_id=row.analysis_id,
                finding_type=finding["type"],
                severity=finding["severity"],
                description=finding["title"],
            ))
        session.commit()
        return row.analysis_id


def dashboard_stats() -> dict:
    with Session(engine) as session:
        total = session.query(func.count(Analysis.analysis_id)).scalar() or 0
        avg = session.query(func.avg(Analysis.score)).scalar()
        classifications = {name: session.query(func.count(Analysis.analysis_id)).filter(Analysis.classification == name).scalar() or 0 for name in ["VERY WEAK", "WEAK", "MODERATE", "STRONG", "VERY STRONG"]}
        return {"total_analyses": total, "average_score": round(float(avg), 1) if avg is not None else 0, "strength_distribution": classifications}


def weakness_stats() -> list[dict]:
    with Session(engine) as session:
        rows = session.query(Finding.finding_type, func.count(Finding.finding_id)).group_by(Finding.finding_type).order_by(func.count(Finding.finding_id).desc()).all()
        return [{"type": typ, "count": count} for typ, count in rows]
