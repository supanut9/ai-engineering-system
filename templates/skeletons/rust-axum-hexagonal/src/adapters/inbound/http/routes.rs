use std::sync::Arc;

use axum::{Router, routing::get};
use tower_http::trace::TraceLayer;

use crate::ports::inbound::HealthChecker;

use super::handlers::{SharedHealth, healthz};

pub fn register<H>(health: H) -> Router
where
    H: HealthChecker,
{
    let shared: SharedHealth = Arc::new(health);
    Router::new()
        .route("/healthz", get(healthz))
        .layer(TraceLayer::new_for_http())
        .with_state(shared)
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::core::health::HealthService;

    #[tokio::test]
    async fn router_builds() {
        let _ = register(HealthService::new());
    }
}
