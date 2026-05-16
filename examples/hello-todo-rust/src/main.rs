use std::net::SocketAddr;
use std::sync::Arc;

use anyhow::Result;
use tracing_subscriber::{EnvFilter, fmt};

use hello_todo_rust::adapters::inbound::http::routes;
use hello_todo_rust::adapters::outbound::memory::MemoryStore;
use hello_todo_rust::core::health::HealthService;
use hello_todo_rust::core::todo::service::TodoService;

#[tokio::main]
async fn main() -> Result<()> {
    fmt()
        .with_env_filter(
            EnvFilter::try_from_default_env().unwrap_or_else(|_| EnvFilter::new("info")),
        )
        .init();

    let port: u16 = std::env::var("PORT")
        .ok()
        .and_then(|p| p.parse().ok())
        .unwrap_or(8080);

    let store = Arc::new(MemoryStore::new());
    let todo_svc = TodoService::new(store);
    let health_svc = HealthService::new();

    let app = routes::register(health_svc, todo_svc);

    let addr = SocketAddr::from(([0, 0, 0, 0], port));
    let listener = tokio::net::TcpListener::bind(addr).await?;

    tracing::info!(%addr, "server starting");

    axum::serve(listener, app)
        .with_graceful_shutdown(shutdown_signal())
        .await?;

    tracing::info!("server stopped");
    Ok(())
}

async fn shutdown_signal() {
    tokio::signal::ctrl_c()
        .await
        .expect("failed to install CTRL+C signal handler");
    tracing::info!("shutting down");
}
