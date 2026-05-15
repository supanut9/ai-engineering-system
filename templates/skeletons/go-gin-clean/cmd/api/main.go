package main

import (
	"os"

	"github.com/gin-gonic/gin"

	"example.com/my-service/internal/adapters/http/handlers"
	"example.com/my-service/internal/adapters/http/routes"
	"example.com/my-service/internal/application"
)

func main() {
	r := gin.Default()

	healthUC := application.NewHealthUseCase()
	healthHandler := handlers.NewHealthHandler(healthUC)
	routes.Register(r, healthHandler)

	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}

	if err := r.Run(":" + port); err != nil {
		panic(err)
	}
}
