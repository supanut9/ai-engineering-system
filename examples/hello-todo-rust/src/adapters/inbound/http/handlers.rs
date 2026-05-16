use std::sync::Arc;

use axum::{
    Json,
    extract::{Path, State},
    http::StatusCode,
    response::IntoResponse,
};
use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};
use serde_json::Value;

use crate::core::health::HealthStatus;
use crate::core::todo::service::Error as ServiceError;
use crate::ports::inbound::{CreateInput, HealthChecker, Patch, TodoItem, TodoService};

// ── Shared state types ────────────────────────────────────────────────────────

pub type SharedHealth = Arc<dyn HealthChecker>;
pub type SharedTodos = Arc<dyn TodoService>;

// ── Response shapes ───────────────────────────────────────────────────────────

#[derive(Serialize)]
struct TodoResponse {
    id: String,
    title: String,
    completed: bool,
    due_at: Option<DateTime<Utc>>,
    created_at: DateTime<Utc>,
    updated_at: DateTime<Utc>,
}

impl From<TodoItem> for TodoResponse {
    fn from(t: TodoItem) -> Self {
        Self {
            id: t.id,
            title: t.title,
            completed: t.completed,
            due_at: t.due_at,
            created_at: t.created_at,
            updated_at: t.updated_at,
        }
    }
}

#[derive(Serialize)]
struct ErrorBody {
    code: &'static str,
    message: String,
}

#[derive(Serialize)]
struct ErrorResponse {
    error: ErrorBody,
}

fn err_response(
    status: StatusCode,
    code: &'static str,
    message: impl Into<String>,
) -> impl IntoResponse {
    (
        status,
        Json(ErrorResponse {
            error: ErrorBody {
                code,
                message: message.into(),
            },
        }),
    )
}

fn map_service_error(err: ServiceError) -> impl IntoResponse {
    match err {
        ServiceError::NotFound => {
            err_response(StatusCode::NOT_FOUND, "not_found", "todo not found").into_response()
        }
        ServiceError::TitleRequired | ServiceError::TitleTooLong => {
            err_response(StatusCode::BAD_REQUEST, "validation_error", err.to_string())
                .into_response()
        }
        ServiceError::Internal(_) => err_response(
            StatusCode::INTERNAL_SERVER_ERROR,
            "internal",
            "internal server error",
        )
        .into_response(),
    }
}

// ── Health handler ────────────────────────────────────────────────────────────

pub async fn healthz(State(svc): State<SharedHealth>) -> Json<HealthStatus> {
    Json(svc.check())
}

// ── Todo handlers ─────────────────────────────────────────────────────────────

#[derive(Deserialize)]
pub struct CreateRequest {
    title: String,
    due_at: Option<DateTime<Utc>>,
}

pub async fn create_todo(
    State(svc): State<SharedTodos>,
    Json(req): Json<CreateRequest>,
) -> impl IntoResponse {
    match svc
        .create(CreateInput {
            title: req.title,
            due_at: req.due_at,
        })
        .await
    {
        Ok(item) => (StatusCode::CREATED, Json(TodoResponse::from(item))).into_response(),
        Err(e) => map_service_error(e).into_response(),
    }
}

#[derive(Serialize)]
struct ListResponse {
    items: Vec<TodoResponse>,
}

pub async fn list_todos(State(svc): State<SharedTodos>) -> impl IntoResponse {
    match svc.list().await {
        Ok(items) => {
            let resp = ListResponse {
                items: items.into_iter().map(TodoResponse::from).collect(),
            };
            (StatusCode::OK, Json(resp)).into_response()
        }
        Err(e) => map_service_error(e).into_response(),
    }
}

pub async fn get_todo(State(svc): State<SharedTodos>, Path(id): Path<String>) -> impl IntoResponse {
    match svc.get(&id).await {
        Ok(item) => (StatusCode::OK, Json(TodoResponse::from(item))).into_response(),
        Err(e) => map_service_error(e).into_response(),
    }
}

/// Parse the raw JSON body to extract a Patch, handling three states for due_at:
///   - absent: key not present → no change
///   - null: explicit JSON null → sets clear_due_at=true
///   - value: RFC3339 string → sets due_at
fn parse_patch(body: &[u8]) -> Result<Patch, serde_json::Error> {
    let raw: serde_json::Map<String, Value> = serde_json::from_slice(body)?;

    let mut patch = Patch::default();

    if let Some(v) = raw.get("title") {
        patch.title = Some(serde_json::from_value(v.clone())?);
    }

    if let Some(v) = raw.get("completed") {
        patch.completed = Some(serde_json::from_value(v.clone())?);
    }

    if let Some(v) = raw.get("due_at") {
        if v.is_null() {
            patch.clear_due_at = true;
        } else {
            patch.due_at = Some(serde_json::from_value(v.clone())?);
        }
    }

    Ok(patch)
}

pub async fn update_todo(
    State(svc): State<SharedTodos>,
    Path(id): Path<String>,
    body: axum::body::Bytes,
) -> impl IntoResponse {
    if body.is_empty() {
        return err_response(
            StatusCode::BAD_REQUEST,
            "validation_error",
            "invalid request body",
        )
        .into_response();
    }

    let patch = match parse_patch(&body) {
        Ok(p) => p,
        Err(_) => {
            return err_response(
                StatusCode::BAD_REQUEST,
                "validation_error",
                "invalid request body",
            )
            .into_response();
        }
    };

    match svc.update(&id, patch).await {
        Ok(item) => (StatusCode::OK, Json(TodoResponse::from(item))).into_response(),
        Err(e) => map_service_error(e).into_response(),
    }
}

pub async fn delete_todo(
    State(svc): State<SharedTodos>,
    Path(id): Path<String>,
) -> impl IntoResponse {
    match svc.delete(&id).await {
        Ok(()) => StatusCode::NO_CONTENT.into_response(),
        Err(e) => map_service_error(e).into_response(),
    }
}
