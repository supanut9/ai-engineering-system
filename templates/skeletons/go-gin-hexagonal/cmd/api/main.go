package main

import (
	"os"

	"github.com/gin-gonic/gin"

	"example.com/my-service/internal/adapters/inbound/http/handlers"
	"example.com/my-service/internal/adapters/inbound/http/routes"
	"example.com/my-service/internal/core/health"
)

func main() {
	r := gin.Default()

	healthSvc := health.NewService()
	healthHandler := handlers.NewHealthHandler(healthSvc)
	routes.Register(r, healthHandler)

	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}

	if err := r.Run(":" + port); err != nil {
		panic(err)
	}
}
