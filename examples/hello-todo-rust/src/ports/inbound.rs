use chrono::{DateTime, Utc};

use crate::core::health::HealthStatus;
use crate::core::todo::service::Error as ServiceError;

/// Inbound port for health checks.
pub trait HealthChecker: Send + Sync + 'static {
    fn check(&self) -> HealthStatus;
}

/// Read-side data shape returned by service operations.
/// Mirrors core Todo but defined here to avoid import cycles.
#[derive(Debug, Clone)]
pub struct TodoItem {
    pub id: String,
    pub title: String,
    pub completed: bool,
    pub due_at: Option<DateTime<Utc>>,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
}

/// Validated fields for creating a new todo.
#[derive(Debug, Default)]
pub struct CreateInput {
    pub title: String,
    pub due_at: Option<DateTime<Utc>>,
}

/// Optional fields for a partial update.
/// - `title` / `completed`: `None` means absent (no change)
/// - `clear_due_at`: true means set due_at to null
/// - `due_at`: `Some(t)` means set due_at to t (only when `clear_due_at` is false)
#[derive(Debug, Default)]
pub struct Patch {
    pub title: Option<String>,
    pub due_at: Option<DateTime<Utc>>,
    pub clear_due_at: bool,
    pub completed: Option<bool>,
}

/// Inbound port implemented by the core todo service.
#[async_trait::async_trait]
pub trait TodoService: Send + Sync + 'static {
    async fn create(&self, input: CreateInput) -> Result<TodoItem, ServiceError>;
    async fn list(&self) -> Result<Vec<TodoItem>, ServiceError>;
    async fn get(&self, id: &str) -> Result<TodoItem, ServiceError>;
    async fn update(&self, id: &str, patch: Patch) -> Result<TodoItem, ServiceError>;
    async fn delete(&self, id: &str) -> Result<(), ServiceError>;
}
