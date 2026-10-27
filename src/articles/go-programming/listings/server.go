package main

import "fmt"

type Server struct {
	Host string
	Port int
}

// value receiver — reads a copy
func (s Server) Addr() string {
	return fmt.Sprintf("%s:%d", s.Host, s.Port)
}

// pointer receiver — mutates the original
func (s *Server) Shutdown() {
	s.Port = 0
}

func main() {
	s := Server{Host: "localhost", Port: 8080}
	fmt.Println(s.Addr()) // localhost:8080
	s.Shutdown()
	fmt.Println(s.Addr()) // localhost:0
}
