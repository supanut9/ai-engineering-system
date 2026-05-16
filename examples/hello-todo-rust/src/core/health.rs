use crate::ports::inbound::HealthChecker;

#[derive(Clone, Debug, Default)]
pub struct HealthService;

impl HealthService {
    pub fn new() -> Self {
        Self
    }
}

impl HealthChecker for HealthService {
    fn check(&self) -> HealthStatus {
        HealthStatus { ok: true }
    }
}

#[derive(Clone, Debug, serde::Serialize)]
pub struct HealthStatus {
    pub ok: bool,
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn health_service_reports_ok() {
        let svc = HealthService::new();
        assert!(svc.check().ok);
    }
}
