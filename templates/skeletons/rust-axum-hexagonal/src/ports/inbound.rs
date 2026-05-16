use crate::core::health::HealthStatus;

pub trait HealthChecker: Send + Sync + 'static {
    fn check(&self) -> HealthStatus;
}
