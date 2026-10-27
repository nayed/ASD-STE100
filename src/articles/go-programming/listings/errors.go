package main

import (
	"errors"
	"fmt"
	"os"
)

// a sentinel error — comparable, documented, stable
var ErrEmptyConfig = errors.New("empty config")

func loadConfig(path string) ([]byte, error) {
	data, err := os.ReadFile(path)
	if err != nil {
		// wrap: add context, preserve the cause
		return nil, fmt.Errorf("load config: %w", err)
	}
	if len(data) == 0 {
		return nil, ErrEmptyConfig
	}
	return data, nil
}

func main() {
	cfg, err := loadConfig("config.toml")
	if err != nil {
		if errors.Is(err, os.ErrNotExist) {
			fmt.Println("no config — using defaults")
			return
		}
		fmt.Println("fatal:", err)
		return
	}
	_ = cfg
}
