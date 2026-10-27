package main

import (
	"errors"
	"fmt"
)

// two results: the answer, and the failure
func divide(a, b float64) (float64, error) {
	if b == 0 {
		return 0, errors.New("division by zero")
	}
	return a / b, nil
}

func main() {
	result, err := divide(10, 4)
	if err != nil {
		fmt.Println("failed:", err)
		return
	}
	fmt.Println(result) // 2.5
}
