package main

import (
	"os"

	"github.com/gin-gonic/gin"

	"example.com/my-service/internal/http/handlers"
	"example.com/my-service/internal/http/routes"
	"example.com/my-service/internal/service"
)

func main() {
	r := gin.Default()

	healthSvc := service.NewHealthService()
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
