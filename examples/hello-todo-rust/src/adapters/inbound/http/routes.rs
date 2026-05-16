use std::sync::Arc;

use axum::{
    Router,
    routing::{delete, get, patch, post},
};
use tower_http::trace::TraceLayer;

use crate::ports::inbound::{HealthChecker, TodoService};

use super::handlers::{
    SharedHealth, SharedTodos, create_todo, delete_todo, get_todo, healthz, list_todos, update_todo,
};

pub fn register<H, T>(health: H, todos: T) -> Router
where
    H: HealthChecker,
    T: TodoService,
{
    let shared_health: SharedHealth = Arc::new(health);
    let shared_todos: SharedTodos = Arc::new(todos);

    let v1 = Router::new()
        .route("/todos", post(create_todo))
        .route("/todos", get(list_todos))
        .route("/todos/{id}", get(get_todo))
        .route("/todos/{id}", patch(update_todo))
        .route("/todos/{id}", delete(delete_todo))
        .with_state(shared_todos);

    Router::new()
        .route("/healthz", get(healthz))
        .with_state(shared_health)
        .nest("/v1", v1)
        .layer(TraceLayer::new_for_http())
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::adapters::outbound::memory::store::MemoryStore;
    use crate::core::health::HealthService;
    use crate::core::todo::service::TodoService as CoreTodoService;

    #[tokio::test]
    async fn router_builds() {
        let store = Arc::new(MemoryStore::new());
        let todos = CoreTodoService::new(store);
        let _ = register(HealthService::new(), todos);
    }
}
