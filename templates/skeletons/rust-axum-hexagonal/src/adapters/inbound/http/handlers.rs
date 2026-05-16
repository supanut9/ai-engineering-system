use std::sync::Arc;

use axum::{Json, extract::State};

use crate::core::health::HealthStatus;
use crate::ports::inbound::HealthChecker;

pub type SharedHealth = Arc<dyn HealthChecker>;

pub async fn healthz(State(svc): State<SharedHealth>) -> Json<HealthStatus> {
    Json(svc.check())
}
