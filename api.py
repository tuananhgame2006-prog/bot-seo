# -*- coding: utf-8 -*-
"""
SEO EMPIRE SWARM PIPELINE B2B - FastAPI Backend Bridge
======================================================
This API server serves as the unified bridge connecting the premium React UI
to the Python Agent Swarm on the E:\\ drive file-system.

Running the server:
-------------------
1. Ensure you have installed the required dependencies:
   $ pip install fastapi uvicorn pydantic

2. Launch the server using Uvicorn:
   $ uvicorn api:app --reload --host 0.0.0.0 --port 8000

Designed for seamless enterprise integration & non-blocking execution.
"""

import sys
import logging
from typing import Optional, List, Dict, Any
from fastapi import FastAPI, BackgroundTasks, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

# Setup elegant console logging
logging.basicConfig(
    level=logging.INFO,
    format="[%(asctime)s] [%(levelname)s] [%(name)s] %(message)s",
    datefmt="%H:%M:%S"
)
logger = logging.getLogger("SEO-Empire-Bridge")

# Initialize FastAPI App
app = FastAPI(
    title="SEO Empire Swarm API Bridge",
    description="High-performance FastAPI bridge connecting React client state with local Python Swarm Agents and SQLite database on Windows E:\\ drive.",
    version="1.0.0"
)

# 1. CORS Middleware Config
# Enables the local Vite React development server (typically running on port 3000)
# to freely query telemetry metrics and dispatch asynchronous background agent loops.
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Try loading the Python business modules.
# We wrap imports inside a defensive try-except block so the bridge is highly resilient
# even during initial offline scaffolding.
try:
    import db
    import scout
    import writer
    import reviewer
    import publisher
    import tracker
    MODULES_AVAILABLE = True
    logger.info("Successfully bound to existing SEO Empire Python modules (db, scout, writer, reviewer, publisher, tracker).")
except ImportError as err:
    MODULES_AVAILABLE = False
    logger.warning(
        f"Missing one or more native business modules: {err}. "
        "Scaffolding API server with safe simulation wrappers until execution modules are fully copied."
    )

# --------------------------------------------------------------------------
# PYDANTIC SCHEMAS / MODERN PYDANTIC V2 STRATEGY
# --------------------------------------------------------------------------

class ScoutRequest(BaseModel):
    topic: str = Field(
        default="tự động hóa nội dung trí tuệ nhân tạo",
        description="The target seed topic used by the Scout Agent to discover keyword clusters."
    )

class TopicResponse(BaseModel):
    message: str
    status: str
    topic: str

class SimpleActionResponse(BaseModel):
    message: str
    status: str

# --------------------------------------------------------------------------
# TELEMETRY ENDPOINTS (GET)
# --------------------------------------------------------------------------

@app.get("/api/metrics", tags=["Telemetry"])
def get_pipeline_metrics():
    """
    GET /api/metrics
    ----------------
    Returns aggregated business intelligence counters and the average SEO auditor score
    for immediate rendering inside the dashboard widget header grid cards.
    """
    logger.info("Telemetry dispatch: Gathering pipeline metrics.")
    if MODULES_AVAILABLE:
        try:
            # Calls db.get_pipeline_metrics() on the existing DB manager
            return db.get_pipeline_metrics()
        except Exception as e:
            logger.error(f"Failed to query metrics from db module: {e}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Database module exception: {str(e)}"
            )
    else:
        # Fallback Mock context matching React typescript interface expectance
        return {
            "keywordsFound": 12,
            "draftsPending": 3,
            "postsPublished": 5,
            "averageSeoScore": 84
        }


@app.get("/api/keywords", tags=["Telemetry"])
def get_keywords_list():
    """
    GET /api/keywords
    -----------------
    Queries the keyword intelligence catalog, returning all discovered organic search phrases,
    difficulty ranges, potential search volumes, and current pipeline workflows.
    """
    logger.info("Telemetry dispatch: Gathering keyword clusters.")
    if MODULES_AVAILABLE:
        try:
            # Safely fetch keywords. Standardizing list retrieval
            if hasattr(db, "get_keywords"):
                return db.get_keywords()
            elif hasattr(db, "get_all_keywords"):
                return db.get_all_keywords()
            else:
                raise AttributeError("Method to fetch keywords not found in 'db.py' interface.")
        except Exception as e:
            logger.error(f"Failed to query keywords from db module: {e}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Database module exception: {str(e)}"
            )
    else:
        # High fidelity placeholder response
        return [
            {"id": "kw-mock-1", "keyword": "tối ưu hóa seo wordpress bằng ai", "volume": 12000, "difficulty": 42, "intent": "Transactional", "relevance": 95, "status": "drafted", "topic": "tự động hóa nội dung"},
            {"id": "kw-mock-2", "keyword": "phần mềm tự động viết bài chuẩn seo", "volume": 8400, "difficulty": 58, "intent": "Commercial", "relevance": 91, "status": "pending", "topic": "tự động hóa nội dung"},
            {"id": "kw-mock-3", "keyword": "kịch bản tối ưu hóa meta description hàng loạt", "volume": 1500, "difficulty": 25, "intent": "Informational", "relevance": 78, "status": "pending", "topic": "tự động hóa nội dung"}
        ]


@app.get("/api/articles", tags=["Telemetry"])
def get_articles_list():
    """
    GET /api/articles
    -----------------
    Returns the collection of active editorial drafts (titles, generated outlines, HTML body previews,
    assigned artificial neural networks, scheduled publication calendar parameters, and QA evaluation metrics).
    """
    logger.info("Telemetry dispatch: Gathering draft articles metadata.")
    if MODULES_AVAILABLE:
        try:
            if hasattr(db, "get_articles"):
                return db.get_articles()
            elif hasattr(db, "get_drafts"):
                return db.get_drafts()
            else:
                raise AttributeError("Method to fetch drafts/articles not found in 'db.py' interface.")
        except Exception as e:
            logger.error(f"Failed to query articles from db module: {e}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Database module exception: {str(e)}"
            )
    else:
        # Simulated content matching editorial dashboard schema layout
        return [
            {
                "id": "draft-mock-1",
                "keyword": "tối ưu hóa seo wordpress bằng ai",
                "title": "Bí Quyết 5 Bước Tối Ưu Hóa SEO WordPress Bằng Trí Tuệ Nhân Tạo Thành Công 100%",
                "outline": ["Giới thiệu", "Hạn chế của SEO truyền thống", "Tận dụng AI để viết bài", "Kết luận"],
                "draftHtml": "<div class='p-6 bg-slate-900 border border-emerald-500 rounded-xl'><h1 class='text-xl text-emerald-400 font-mono'>10x SEO WordPress With Gemini Swarm Core</h1><p class='text-slate-300 mt-2'>Tự động hóa toàn bộ quy trình biên dịch thẻ, mật độ anchor tệp, và tối ưu hóa h1-h6 bằng AI siêu tốc.</p></div>",
                "seoScore": 92,
                "reviewerNotes": "Văn bản đạt điểm tuyệt đối về mặt kỹ thuật cấu trúc bài viết và tối ưu thẻ meta.\nMật độ từ khóa khóa chính phân bổ rất tự nhiên. Khuyến dùng thêm 2 backlink nội bộ.",
                "status": "reviewed",
                "approvalStatus": "approved",
                "editorFeedback": "Chất lượng bài viết tuyệt vời, đã duyệt cho lên hàng ngũ Mega-Post.",
                "scheduledDate": "2026-05-30",
                "assignedAgent": "Gemini-3.5-Flash",
                "attributes": {
                    "readability": 95,
                    "keywordDensity": 88,
                    "wordCountScore": 90,
                    "structure": 96,
                    "metadata": 92,
                    "backlinkPotential": 85
                }
            }
        ]


@app.get("/api/rankings", tags=["Telemetry"])
def get_ranking_trajectory():
    """
    GET /api/rankings
    -----------------
    Fetches historical simulated performance rankings metrics representing Google Search Console (GSC) crawler reports.
    Provides data plotted in the dynamic SVG area chart: impressions, clicks count, and average positions.
    """
    logger.info("Telemetry dispatch: Gathering GSC rankings timeline data.")
    if MODULES_AVAILABLE:
        try:
            if hasattr(db, "get_trajectory"):
                return db.get_trajectory()
            elif hasattr(db, "get_rankings"):
                return db.get_rankings()
            else:
                raise AttributeError("Method to fetch rankings trajectory not found in 'db.py' interface.")
        except Exception as e:
            logger.error(f"Failed to query rankings from db module: {e}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Database module exception: {str(e)}"
            )
    else:
        # Provide clean 30-day chronological curve
        import datetime
        data = []
        base = datetime.date.today() - datetime.timedelta(days=30)
        for i in range(31):
            day = base + datetime.timedelta(days=i)
            # Create a nice organic growth trendline
            data.append({
                "date": str(day),
                "impressions": int(i * i * 15 + i * 110 + 20),
                "clicks": int(i * i * 0.8 + i * 2 + 1),
                "position": float(max(2.1, round(85.0 - i * 2.6, 1)))
            })
        return data

# --------------------------------------------------------------------------
# EXECUTION ENDPOINTS (POST - WRAPPED WITH DYNAMIC FastAPI BACKGROUND TASKS)
# --------------------------------------------------------------------------

def execute_scout_async(topic: str):
    """Worker sub-function running scout agent inside background worker thread."""
    try:
        logger.info(f"Background Process: Initializing Scout Agent for topic: '{topic}'")
        if MODULES_AVAILABLE:
            scout.run_scout_agent(topic)
            logger.info("Background Process: Scout Agent finished execution successfully.")
        else:
            logger.info(f"Background Simulation: Scout completed crawl on topic '{topic}'.")
    except Exception as e:
        logger.error(f"Async Scout Task aborted with traceback error: {e}")


@app.post("/api/run/scout", response_model=TopicResponse, status_code=status.HTTP_202_ACCEPTED, tags=["Agent Execution"])
def run_scout_stage(payload: ScoutRequest, background_tasks: BackgroundTasks):
    """
    POST /api/run/scout
    ------------------
    Dispatches the Scout search agent. Utilizes non-blocking BackgroundTasks to complete
    the deep crawler cycle asynchronously, returning immediately to the React frontend UI to prevent connection timeouts.
    """
    logger.info(f"Accepted command: Run Scout Agent on topic: '{payload.topic}'")
    background_tasks.add_task(execute_scout_async, payload.topic)
    return {
        "status": "accepted",
        "message": "Scout Agent queued as an asynchronous background task.",
        "topic": payload.topic
    }


def execute_writer_async():
    """Worker sub-function running copywriter agent inside background worker thread."""
    try:
        logger.info("Background Process: Writing dynamic HTML marketing copy with Writer agent.")
        if MODULES_AVAILABLE:
            writer.run_writer_agent()
            logger.info("Background Process: Writer Agent finished generation successfully.")
        else:
            logger.info("Background Simulation: Finished compiling default rich HTML draft.")
    except Exception as e:
        logger.error(f"Async Writer Task aborted with traceback error: {e}")


@app.post("/api/run/writer", response_model=SimpleActionResponse, status_code=status.HTTP_202_ACCEPTED, tags=["Agent Execution"])
def run_writer_stage(background_tasks: BackgroundTasks):
    """
    POST /api/run/writer
    -------------------
    Fires the AI Copywriting Agent to output comprehensive layouts for targeted keywords.
    Processed in safely separated threads via BackgroundTasks.
    """
    logger.info("Accepted command: Run Writer Agent.")
    background_tasks.add_task(execute_writer_async)
    return {
        "status": "accepted",
        "message": "Copywriter agent initialized in non-blocking execution thread."
    }


def execute_reviewer_async():
    """Worker sub-function running auditor agent inside background worker thread."""
    try:
        logger.info("Background Process: Analyzing HTML structural elements with Reviewer agent.")
        if MODULES_AVAILABLE:
            # Safely handle dual function names for maximum compatibility
            if hasattr(reviewer, "run_reviewer_agent"):
                reviewer.run_reviewer_agent()
                logger.info("Background Process: Reviewer Agent completed the content audit successfully.")
            elif hasattr(reviewer, "run_writer_agent"):  # Support fallback from user prompt
                reviewer.run_writer_agent()
                logger.info("Background Process: Reviewer (fallback write) finished content review.")
            else:
                logger.error("No valid entry execution function detected in reviewer module.")
        else:
            logger.info("Background Simulation: Standard SEO evaluation indexes updated.")
    except Exception as e:
        logger.error(f"Async Reviewer Task aborted with traceback error: {e}")


@app.post("/api/run/reviewer", response_model=SimpleActionResponse, status_code=status.HTTP_202_ACCEPTED, tags=["Agent Execution"])
def run_reviewer_stage(background_tasks: BackgroundTasks):
    """
    POST /api/run/reviewer
    ---------------------
    Fires the SEO Audit agent to check formatting, keyword concentration points, headings,
    and meta tags. Computes final quality scores asynchronously.
    """
    logger.info("Accepted command: Run Reviewer Agent.")
    background_tasks.add_task(execute_reviewer_async)
    return {
        "status": "accepted",
        "message": "Reviewer/auditor agent successfully added to background queue."
    }


def execute_publisher_async():
    """Worker sub-function running publisher agent inside background worker thread."""
    try:
        logger.info("Background Process: Directing publisher agent to push live to CMS channels.")
        if MODULES_AVAILABLE:
            publisher.run_publisher_agent()
            logger.info("Background Process: Publisher Agent completed CMS synchronization.")
        else:
            logger.info("Background Simulation: Local publication links successfully updated.")
    except Exception as e:
        logger.error(f"Async Publisher Task aborted with traceback error: {e}")


@app.post("/api/run/publisher", response_model=SimpleActionResponse, status_code=status.HTTP_202_ACCEPTED, tags=["Agent Execution"])
def run_publisher_stage(background_tasks: BackgroundTasks):
    """
    POST /api/run/publisher
    ----------------------
    Triggers CMS publication handshakes to external syndication structures (WordPress, Webflow, Shopify).
    Runs asynchronously.
    """
    logger.info("Accepted command: Run Publisher Agent.")
    background_tasks.add_task(execute_publisher_async)
    return {
        "status": "accepted",
        "message": "Publisher agent successfully scheduled for background execution."
    }


def execute_tracker_async():
    """Worker sub-function running tracker agent inside background worker thread."""
    try:
        logger.info("Background Process: Activating search tracker agent.")
        if MODULES_AVAILABLE:
            tracker.run_tracker_agent()
            logger.info("Background Process: Tracker Agent generated GSC trajectory points.")
        else:
            logger.info("Background Simulation: Baseline traffic trajectory projection created.")
    except Exception as e:
        logger.error(f"Async Tracker Task aborted with traceback error: {e}")


@app.post("/api/run/tracker", response_model=SimpleActionResponse, status_code=status.HTTP_202_ACCEPTED, tags=["Agent Execution"])
def run_tracker_stage(background_tasks: BackgroundTasks):
    """
    POST /api/run/tracker
    --------------------
    Launches GSC crawler simulation and logs synthetic traffic metrics for live URL directories.
    Runs asynchronously.
    """
    logger.info("Accepted command: Run Tracker Agent.")
    background_tasks.add_task(execute_tracker_async)
    return {
        "status": "accepted",
        "message": "Tracker agent successfully dispatched to organic visibility monitoring."
    }


# --------------------------------------------------------------------------
# PORT / SERVER STATUS LIVENESS HEALTH CHECK
# --------------------------------------------------------------------------

@app.get("/api/health", tags=["Utilities"])
def health_check():
    """Returns the operational status of the API bridge server."""
    return {
        "status": "healthy",
        "bridge_operational": True,
        "underlying_python_modules": "connected" if MODULES_AVAILABLE else "simulation_fallback"
    }
